import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createToken, createSession, verifyPassword } from "@/lib/auth";
import { checkRateLimit, setSecurityHeaders, sanitizeString } from "@/lib/security";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) {
      return setSecurityHeaders(rateLimitResponse);
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const sanitizedEmail = sanitizeString(email.toLowerCase());

    // Find user
    const user = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createSession(user.id);
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: sessionToken,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return setSecurityHeaders(response);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}