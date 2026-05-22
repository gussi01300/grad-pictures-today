import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadToR2 } from "@/lib/r2";
import { checkRateLimit, setSecurityHeaders, validateFileUpload } from "@/lib/security";
import { validateSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_EXPIRY_HOURS = parseInt(process.env.UPLOAD_EXPIRY_HOURS ?? "24");

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    const validation = validateFileUpload(file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique key
    const ext = file.name.split(".").pop() ?? "jpg";
    const key = `uploads/${session.userId}/${uuidv4()}.${ext}`;

    // Upload to R2
    await uploadToR2(key, buffer, file.type);

    // Calculate expiry
    const expiresAt = new Date(Date.now() + UPLOAD_EXPIRY_HOURS * 60 * 60 * 1000);

    // Save to database
    const upload = await db.upload.create({
      data: {
        userId: session.userId,
        key,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        expiresAt,
      },
    });

    return NextResponse.json({
      uploadId: upload.id,
      key: upload.key,
      expiresAt: upload.expiresAt,
    }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "An error occurred during upload" },
      { status: 500 }
    );
  }
}