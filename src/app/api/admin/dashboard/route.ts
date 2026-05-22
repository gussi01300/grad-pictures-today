import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSecurityHeaders } from "@/lib/security";
import { requireAdmin } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.response) {
      return setSecurityHeaders(authResult.response);
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