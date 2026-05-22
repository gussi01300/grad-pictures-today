import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";
import { validateSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const session = await validateSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Verify ownership
    const upload = await db.upload.findFirst({
      where: {
        userId: session.userId,
        key,
      },
    });

    if (!upload) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check expiry
    if (upload.expiresAt < new Date()) {
      return NextResponse.json({ error: "File has expired" }, { status: 410 });
    }

    // Generate signed URL
    const signedUrl = await getSignedDownloadUrl(key);

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Download URL error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}