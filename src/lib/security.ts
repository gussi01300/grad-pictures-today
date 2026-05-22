import { NextRequest, NextResponse } from "next/server";
import { verifyToken, type JWTPayload } from "./auth";
import { redis } from "./redis";

// Rate limiting configuration
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX ?? "100");
const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS ?? "60000"
);

export interface SecurityConfig {
  rateLimit?: boolean;
  csrfCheck?: boolean;
  authRequired?: boolean;
  adminOnly?: boolean;
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function rateLimit(
  identifier: string,
  max = RATE_LIMIT_MAX,
  windowMs = RATE_LIMIT_WINDOW_MS
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Use Redis sorted set for sliding window rate limiting
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zcard(key);
  pipeline.zadd(key, now.toString(), `${now}-${Math.random()}`);
  pipeline.expire(key, Math.ceil(windowMs / 1000));

  const results = await pipeline.exec();
  const requestCount = (results?.[1]?.[1] as number) ?? 0;
  const remaining = Math.max(0, max - requestCount - 1);
  const resetAt = now + windowMs;

  if (requestCount >= max) {
    return { success: false, remaining: 0, resetAt };
  }

  return { success: true, remaining, resetAt };
}

export async function checkRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  const ip = getClientIP(request);
  const { success, resetAt } = await rateLimit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": resetAt.toString(),
          "Retry-After": Math.ceil((resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}

export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

export function getCSRFTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const csrfCookie = cookies.find((c) => c.startsWith("csrf_token="));
  return csrfCookie?.split("=")[1] ?? null;
}

export function setSecurityHeaders(response: NextResponse): NextResponse {
  const headersToSet = {
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };

  Object.entries(headersToSet).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export async function authMiddleware(
  request: NextRequest
): Promise<JWTPayload | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) return null;

  return verifyToken(token);
}

export async function requireAuth(
  request: NextRequest
): Promise<{ user: JWTPayload; response: null } | { user: null; response: NextResponse }> {
  const user = await authMiddleware(request);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}

export async function requireAdmin(
  request: NextRequest
): Promise<{ user: JWTPayload; response: null } | { user: null; response: NextResponse }> {
  const result = await requireAuth(request);

  if (result.response) return result;

  if (result.user.role !== "ADMIN") {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return result;
}

// Input sanitization
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): T {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}

// File upload validation
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileUpload(
  contentType: string,
  size: number
): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}