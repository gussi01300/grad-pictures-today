import { NextRequest, NextResponse } from "next/server";
import { invalidateSession } from "@/lib/auth";
import { setSecurityHeaders } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;

    if (sessionToken) {
      await invalidateSession(sessionToken);
    }

    const response = NextResponse.json({ success: true });

    response.cookies.delete("auth_token");
    response.cookies.delete("session_token");

    return setSecurityHeaders(response);
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}