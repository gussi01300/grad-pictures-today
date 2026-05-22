import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { addGenerationJob } from "@/services/generation.service";
import { checkRateLimit, setSecurityHeaders, sanitizeObject } from "@/lib/security";
import { validateSession } from "@/lib/auth";

const generationSchema = z.object({
  type: z.enum(["YEARBOOK", "PORTRAIT"]),
  userPhotoKey: z.string().min(1, "User photo is required"),
  referencePhotoKey: z.string().optional(),
  gownColor: z.string().optional(),
  capColor: z.string().optional(),
  sashColor: z.string().optional(),
  background: z.string().optional(),
  style: z.string().optional(),
  capOn: z.boolean().optional().default(true),
  diplomaOn: z.boolean().optional().default(false),
  consentGiven: z.boolean().refine((v) => v === true, "Consent is required"),
  minorConsent: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) {
      return setSecurityHeaders(rateLimitResponse);
    }

    // Auth check
    const sessionToken = request.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const session = await validateSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = generationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = sanitizeObject(parsed.data);

    // Check generation attempts
    const recentGenerations = await db.generation.count({
      where: {
        userId: session.userId,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    if (recentGenerations >= 5) {
      return NextResponse.json(
        { error: "Maximum generation attempts reached. Please upgrade to continue." },
        { status: 429 }
      );
    }

    // Get user photo URL
    const userUpload = await db.upload.findFirst({
      where: {
        userId: session.userId,
        key: data.userPhotoKey,
        expiresAt: { gt: new Date() },
      },
    });

    if (!userUpload) {
      return NextResponse.json(
        { error: "User photo not found or expired" },
        { status: 400 }
      );
    }

    // Get reference photo if provided
    let referencePhotoUrl: string | undefined;
    if (data.referencePhotoKey) {
      const refUpload = await db.upload.findFirst({
        where: {
          userId: session.userId,
          key: data.referencePhotoKey,
        },
      });

      if (refUpload) {
        referencePhotoUrl = `/api/upload/${data.referencePhotoKey}`;
      }
    }

    // Create generation record
    const generation = await db.generation.create({
      data: {
        userId: session.userId,
        type: data.type,
        inputData: {
          gownColor: data.gownColor,
          capColor: data.capColor,
          sashColor: data.sashColor,
          background: data.background,
          style: data.style,
          capOn: data.capOn,
          diplomaOn: data.diplomaOn,
        },
        status: "PENDING",
      },
    });

    // Add to generation queue
    await addGenerationJob(generation.id, session.userId, {
      type: data.type,
      userPhotoUrl: `/api/upload/${data.userPhotoKey}`,
      referencePhotoUrl,
      gownColor: data.gownColor,
      capColor: data.capColor,
      sashColor: data.sashColor,
      background: data.background,
      style: data.style,
      capOn: data.capOn,
      diplomaOn: data.diplomaOn,
    });

    return NextResponse.json(
      { generationId: generation.id, status: "PENDING" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "An error occurred during generation" },
      { status: 500 }
    );
  }
}