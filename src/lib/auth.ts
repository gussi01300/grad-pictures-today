import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";
import type { UserRole } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "default-secret-change-in-production"
);

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date();

  // Parse JWT_EXPIRES_IN to add time
  const match = JWT_EXPIRES_IN.match(/^(\d+)([dhms])$/);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
      case "d":
        expiresAt.setDate(expiresAt.getDate() + value);
        break;
      case "h":
        expiresAt.setHours(expiresAt.getHours() + value);
        break;
      case "m":
        expiresAt.setMinutes(expiresAt.getMinutes() + value);
        break;
      case "s":
        expiresAt.setSeconds(expiresAt.getSeconds() + value);
        break;
    }
  } else {
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function validateSession(
  token: string
): Promise<{ userId: string; email: string; role: UserRole; sessionId: string } | null> {
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      // Clean up expired session
      await db.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    sessionId: session.id,
  };
}

export async function invalidateSession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token } });
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}