import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { marketplace } from "@/lib/db-marketplace";

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        // Update order status
        if (orderId) {
          await marketplace.updateOrder(orderId, {
            status: "in_progress",
            payment_status: "paid",
          });
        }
        break;

      case "payment_intent.payment_failed":
        // Handle failed payment
        const failedPayment = event.data.object;
        const failedOrderId = failedPayment.metadata.orderId;

        if (failedOrderId) {
          await marketplace.updateOrder(failedOrderId, {
            status: "cancelled",
            payment_status: "failed",
          });
        }
        break;

      case "account.updated":
        // Handle seller account updates
        const account = event.data.object;
        // TODO: Update seller's Stripe account status in database
        break;

      case "payout.paid":
        // Handle successful payout to seller
        const payout = event.data.object;
        // TODO: Record payout in database
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook error" },
      { status: 400 }
    );
  }
}

