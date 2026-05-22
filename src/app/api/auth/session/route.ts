import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";
import { setSecurityHeaders } from "@/lib/security";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const session = await validateSession(sessionToken);

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}