import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, setSecurityHeaders } from "@/lib/security";
import { initiateCheckout } from "@/services/payment.service";
import { validateSession } from "@/lib/auth";

const checkoutSchema = z.object({
  generationId: z.string().min(1, "Generation ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) {
      return setSecurityHeaders(rateLimitResponse);
    }

    const sessionToken = request.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const session = await validateSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { generationId } = parsed.data;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { url } = await initiateCheckout(
      generationId,
      `${appUrl}/checkout/success`,
      `${appUrl}/checkout/cancel`,
      session.email
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}