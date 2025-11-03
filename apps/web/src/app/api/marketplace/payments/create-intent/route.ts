import { NextRequest, NextResponse } from "next/server";
import { payments } from "@/lib/stripe";
import { z } from "zod";

const PaymentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = PaymentSchema.parse(body);

    const paymentIntent = await payments.createPaymentIntent(
      validated.amount,
      validated.orderId
    );

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

