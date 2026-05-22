import { NextRequest, NextResponse } from "next/server";
import { retrieveCheckoutSession } from "@/lib/stripe";
import { handleWebhookPaymentSuccess } from "@/services/payment.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const session = await retrieveCheckoutSession(sessionId);

    if (session.payment_status === "paid") {
      const generationId = session.metadata?.generationId;

      if (generationId) {
        await handleWebhookPaymentSuccess(sessionId);

        return NextResponse.json({
          success: true,
          generationId,
        });
      }
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    console.error("Checkout verify error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}