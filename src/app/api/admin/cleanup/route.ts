import { NextRequest, NextResponse } from "next/server";
import { setSecurityHeaders } from "@/lib/security";
import { requireAdmin } from "@/lib/security";
import { runCleanup } from "@/services/storage.service";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.response) {
      return setSecurityHeaders(authResult.response);
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