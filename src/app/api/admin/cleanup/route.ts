import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { runCleanup } from "@/services/storage.service";

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

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runCleanup();

    return NextResponse.json({
      success: true,
      uploadsDeleted: result.uploads.deletedCount,
      generationsDeleted: result.generations.deletedCount,
    });
  } catch (error) {
    console.error("Admin cleanup error:", error);
    return NextResponse.json(
      { error: "An error occurred during cleanup" },
      { status: 500 }
    );
  }
}