import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/auth";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const keyPath = key.replace(/\+/g, "/");

    // Get session for auth
    const sessionToken = request.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const session = await validateSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Verify the upload belongs to this user or is still valid
    const upload = await db.upload.findFirst({
      where: {
        key: keyPath,
        userId: session.userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!upload) {
      return NextResponse.json({ error: "Upload not found or expired" }, { status: 404 });
    }

    // Get signed URL from R2
    const signedUrl = await getSignedDownloadUrl(keyPath);

    // Return the signed URL directly (OpenRouter can't follow redirects)
    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Upload access error:", error);
    return NextResponse.json({ error: "Error accessing upload" }, { status: 500 });
  }
}