/**
 * Stripe payment integration for marketplace
 * 
 * Features:
 * - Payment intents for secure payments
 * - Escrow system (hold funds until delivery accepted)
 * - Stripe Connect for seller payouts
 * - Commission handling (20% platform fee)
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export const payments = {
  /**
   * Create payment intent for order
   */
  async createPaymentIntent(amount: number, orderId: string) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        orderId,
      },
      // Don't capture immediately - we'll capture after delivery
      capture_method: "manual",
    });

    return paymentIntent;
  },

  /**
   * Capture payment after delivery accepted
   */
  async capturePayment(paymentIntentId: string) {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    return paymentIntent;
  },

  /**
   * Refund payment if order cancelled
   */
  async refundPayment(paymentIntentId: string, amount?: number) {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return refund;
  },

  /**
   * Create Stripe Connect account for seller
   */
  async createSellerAccount(email: string, country = "US") {
    const account = await stripe.accounts.create({
      type: "express",
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account;
  },

  /**
   * Create onboarding link for seller
   */
  async createOnboardingLink(accountId: string, returnUrl: string, refreshUrl: string) {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return accountLink;
  },

  /**
   * Transfer funds to seller (after platform fee)
   */
  async transferToSeller(
    amount: number,
    sellerAccountId: string,
    orderId: string
  ) {
    // Calculate platform fee (20%)
    const platformFee = amount * 0.20;
    const sellerAmount = amount - platformFee;

    const transfer = await stripe.transfers.create({
      amount: Math.round(sellerAmount * 100),
      currency: "usd",
      destination: sellerAccountId,
      metadata: {
        orderId,
      },
    });

    return {
      transfer,
      platformFee,
      sellerAmount,
    };
  },

  /**
   * Create payout to seller's bank account
   */
  async createPayout(accountId: string, amount: number) {
    const payout = await stripe.payouts.create(
      {
        amount: Math.round(amount * 100),
        currency: "usd",
      },
      {
        stripeAccount: accountId,
      }
    );

    return payout;
  },

  /**
   * Get seller balance
   */
  async getSellerBalance(accountId: string) {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    });

    return {
      available: balance.available[0]?.amount || 0,
      pending: balance.pending[0]?.amount || 0,
    };
  },
};

export { stripe };

