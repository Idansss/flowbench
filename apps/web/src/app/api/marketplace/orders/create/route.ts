import { NextRequest, NextResponse } from "next/server";
import { marketplace } from "@/lib/db-marketplace";
import { z } from "zod";

const OrderSchema = z.object({
  gigId: z.string().uuid(),
  packageTier: z.enum(["basic", "standard", "premium"]),
  requirements: z.object({
    projectDescription: z.string().min(20),
    deliveryInstructions: z.string().optional(),
    referenceLinks: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Get buyer ID from session
    const buyerId = request.headers.get("x-user-id") || "demo-buyer-id";

    const body = await request.json();
    const validated = OrderSchema.parse(body);

    // TODO: Fetch gig and package details from database
    // For now, using mock data
    const gigId = validated.gigId;
    const sellerId = "demo-seller-id"; // TODO: Get from gig

    // Get package pricing
    const packagePricing = {
      basic: 50,
      standard: 150,
      premium: 300,
    };

    const price = packagePricing[validated.packageTier];
    const serviceFee = price * 0.05;
    const totalPrice = price + serviceFee;

    // Calculate due date
    const deliveryDays = {
      basic: 5,
      standard: 7,
      premium: 14,
    };

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + deliveryDays[validated.packageTier]);

    // Create order
    const order = await marketplace.createOrder({
      buyerId,
      sellerId,
      gigId,
      packageId: `${gigId}-${validated.packageTier}`,
      totalPrice,
      requirements: validated.requirements,
      dueDate,
    });

    // TODO: Create payment intent with Stripe
    // TODO: Send notifications to buyer and seller

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        dueDate: order.due_date,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    );
  }
}

