import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/auth";
import { z } from "zod";

const policySchema = z.object({
  type: z.enum(["PRIVACY", "TERMS", "REFUND"]),
  content: z.string().min(1, "Content is required"),
});

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
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        adminId: admin.id,
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