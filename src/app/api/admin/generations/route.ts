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

    const generations = await db.generation.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    return NextResponse.json({ generations });
  } catch (error) {
    console.error("Admin generations error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}