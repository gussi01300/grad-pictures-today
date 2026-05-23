import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const PRICE_ID = process.env.STRIPE_PRICE_ID ?? "price_grad_picture";

export async function createCheckoutSession(
  generationId: string,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: "Grad-Pictures.today - Graduation Photo",
            description: "High-resolution watermark-free graduation photo",
          },
          unit_amount: 500, // $5 CAD in cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      generationId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

export async function retrieveCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}

export async function createRefund(
  paymentIntentId: string
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
  });
}