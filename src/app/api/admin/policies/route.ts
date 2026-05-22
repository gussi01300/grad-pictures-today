import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSecurityHeaders } from "@/lib/security";
import { requireAdmin } from "@/lib/security";
import { z } from "zod";

const policySchema = z.object({
  type: z.enum(["PRIVACY", "TERMS", "REFUND"]),
  content: z.string().min(1, "Content is required"),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.response) {
      return setSecurityHeaders(authResult.response);
    }

    const policies = await db.policy.findMany();

    return NextResponse.json({ policies });
  } catch (error) {
    console.error("Admin policies error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.response) {
      return setSecurityHeaders(authResult.response);
    }

    const body = await request.json();
    const parsed = policySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { type, content } = parsed.data;

    const policy = await db.policy.upsert({
      where: { type },
      update: { content },
      create: { type, content },
    });

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId: authResult.user.userId,
        action: "UPDATE_POLICY",
        details: { type, contentLength: content.length },
      },
    });

    return NextResponse.json({ policy });
  } catch (error) {
    console.error("Admin policy update error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}