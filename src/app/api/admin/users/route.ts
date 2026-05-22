import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSecurityHeaders } from "@/lib/security";
import { requireAdmin } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.response) {
      return setSecurityHeaders(authResult.response);
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            generations: true,
            payments: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}