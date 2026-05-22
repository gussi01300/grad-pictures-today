import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSecurityHeaders, checkRateLimit } from "@/lib/security";
import { validateSession } from "@/lib/auth";
import { getGenerationStatus } from "@/services/generation.service";

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) {
      return setSecurityHeaders(rateLimitResponse);
    }

    const sessionToken = request.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const session = await validateSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get("id");

    if (!generationId) {
      // List user's generations
      const generations = await db.generation.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          type: true,
          status: true,
          watermarkUrl: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ generations });
    }

    // Get specific generation
    const generation = await db.generation.findFirst({
      where: {
        id: generationId,
        userId: session.userId,
      },
    });

    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    const status = await getGenerationStatus(generationId);

    return NextResponse.json({
      generation: {
        id: generation.id,
        type: generation.type,
        status: status?.status ?? generation.status,
        attempts: status?.attempts ?? generation.attempts,
        outputUrl: status?.outputUrl,
        watermarkUrl: status?.watermarkUrl,
        createdAt: generation.createdAt,
      },
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}