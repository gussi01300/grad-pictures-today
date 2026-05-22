import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSecurityHeaders } from "@/lib/security";
import { requireAdmin } from "@/lib/security";
import { processRefund } from "@/services/payment.service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.response) {
      return setSecurityHeaders(authResult.response);
    }

    const payments = await db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: { id: true, email: true },
        },
        generation: {
          select: { id: true, type: true },
        },
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Admin payments error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.response) {
      return setSecurityHeaders(authResult.response);
    }

    const body = await request.json();
    const { paymentId, action } = body;

    if (action === "refund") {
      const result = await processRefund(paymentId, authResult.user.userId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin payment action error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}