import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/auth";
import { processRefund } from "@/services/payment.service";

async function requireAdminSession(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  if (!sessionToken) return null;

  const session = await validateSession(sessionToken);
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { role: true, id: true },
  });

  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, action } = body;

    if (action === "refund") {
      const result = await processRefund(paymentId, admin.id);
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