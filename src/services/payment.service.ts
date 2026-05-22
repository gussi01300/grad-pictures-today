import { db } from "@/lib/db";
import {
  createCheckoutSession,
  retrieveCheckoutSession,
  createRefund,
} from "@/lib/stripe";
import type { PaymentStatus } from "@prisma/client";

export async function createPayment(
  userId: string,
  generationId: string,
  amount: number,
  currency = "cad"
): Promise<string> {
  const payment = await db.payment.create({
    data: {
      userId,
      generationId,
      amount,
      currency,
      stripePaymentId: "pending", // Will be updated after checkout creation
      status: "PENDING",
    },
  });

  return payment.id;
}

export async function initiateCheckout(
  generationId: string,
  successUrl: string,
  cancelUrl: string,
  userEmail?: string
): Promise<{ sessionId: string; url: string }> {
  const generation = await db.generation.findUnique({
    where: { id: generationId },
    include: { user: true },
  });

  if (!generation) {
    throw new Error("Generation not found");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await createCheckoutSession(
    generationId,
    `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl,
    userEmail ?? generation.user.email
  );

  // Update payment with Stripe session ID
  await db.payment.update({
    where: { generationId },
    data: { stripePaymentId: session.id },
  });

  return { sessionId: session.id, url: session.url! };
}

export async function handleWebhookPaymentSuccess(
  stripeSessionId: string
): Promise<void> {
  const session = await retrieveCheckoutSession(stripeSessionId);

  if (session.payment_status === "paid") {
    const paymentIntentId = session.payment_intent as string;

    await db.payment.update({
      where: { stripePaymentId: stripeSessionId },
      data: {
        status: "COMPLETED",
        stripePaymentId: paymentIntentId,
      },
    });

    // Unlock generation for download
    const generationId = session.metadata?.generationId;
    if (generationId) {
      await db.generation.update({
        where: { id: generationId },
        data: { /* Mark as paid - could add a paid field */ },
      });
    }
  }
}

export async function handleWebhookPaymentFailed(
  stripeSessionId: string
): Promise<void> {
  await db.payment.update({
    where: { stripePaymentId: stripeSessionId },
    data: { status: "FAILED" },
  });
}

export async function processRefund(
  paymentId: string,
  adminId: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    return { success: false, error: "Payment not found" };
  }

  if (payment.status === "REFUNDED") {
    return { success: false, error: "Payment already refunded" };
  }

  try {
    const refund = await createRefund(payment.stripePaymentId);

    await db.payment.update({
      where: { id: paymentId },
      data: { status: "REFUNDED" },
    });

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId,
        action: "REFUND",
        details: {
          paymentId,
          refundId: refund.id,
          amount: payment.amount,
          currency: payment.currency,
        },
      },
    });

    return { success: true, refundId: refund.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Refund failed",
    };
  }
}

export async function hasUserPurchased(
  userId: string,
  generationId: string
): Promise<boolean> {
  const payment = await db.payment.findUnique({
    where: {
      generationId,
      userId,
      status: "COMPLETED",
    },
  });

  return !!payment;
}