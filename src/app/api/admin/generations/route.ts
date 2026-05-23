import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/auth";

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