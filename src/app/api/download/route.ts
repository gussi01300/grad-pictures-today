import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/auth";
import { hasUserPurchased } from "@/services/payment.service";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ purchased: false, error: "Authentication required" }, { status: 401 });
    }

    const session = await validateSession(sessionToken);
    if (!session) {
      return NextResponse.json({ purchased: false, error: "Invalid session" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get("generationId");

    if (!generationId) {
      return NextResponse.json({ purchased: false, error: "Generation ID required" }, { status: 400 });
    }

    // Verify ownership
    const generation = await db.generation.findFirst({
      where: {
        id: generationId,
        userId: session.userId,
      },
    });

    if (!generation) {
      return NextResponse.json({ purchased: false, error: "Generation not found" }, { status: 404 });
    }

    // Check if purchased
    const purchased = await hasUserPurchased(session.userId, generationId);

    let url: string | null = null;
    if (purchased && generation.outputUrl) {
      // Generate signed download URL
      const key = `generations/${generationId}/output.png`;
      url = await getSignedDownloadUrl(key);
    }

    return NextResponse.json({ purchased, url });
  } catch (error) {
    console.error("Download check error:", error);
    return NextResponse.json(
      { purchased: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}