import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Check session cookie for authentication
    const sessionToken = request.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await validateSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get various stats
    const [
      totalUsers,
      totalGenerations,
      completedGenerations,
      failedGenerations,
      totalPayments,
      totalRevenue,
      recentPayments,
      recentGenerations,
      cleanupLogs,
    ] = await Promise.all([
      db.user.count(),
      db.generation.count(),
      db.generation.count({ where: { status: "COMPLETED" } }),
      db.generation.count({ where: { status: "FAILED" } }),
      db.payment.count({ where: { status: "COMPLETED" } }),
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
      db.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { email: true } },
        },
      }),
      db.generation.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { email: true } },
        },
      }),
      db.cleanupLog.findMany({
        orderBy: { executedAt: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      stats: {
        users: totalUsers,
        generations: {
          total: totalGenerations,
          completed: completedGenerations,
          failed: failedGenerations,
        },
        payments: {
          total: totalPayments,
          revenue: totalRevenue._sum.amount ?? 0,
        },
      },
      recentPayments,
      recentGenerations,
      cleanupLogs,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}