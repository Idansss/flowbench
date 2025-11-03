import { NextRequest, NextResponse } from "next/server";
import { matchGigs, generateGigDescription, suggestPricing } from "@/lib/ai/gig-matcher";
import { z } from "zod";

const MatchSchema = z.object({
  description: z.string().min(10),
  budget: z.number().optional(),
  timeline: z.string().optional(),
  category: z.string().optional(),
});

const GenerateDescriptionSchema = z.object({
  service: z.string(),
  experience: z.string(),
  deliverables: z.array(z.string()),
});

const PricingSchema = z.object({
  category: z.string(),
  deliveryDays: z.number(),
  features: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    const body = await request.json();

    switch (action) {
      case "match":
        const matchData = MatchSchema.parse(body);
        const matches = await matchGigs(matchData);
        return NextResponse.json({ success: true, ...matches });

      case "generate-description":
        const descData = GenerateDescriptionSchema.parse(body);
        const description = await generateGigDescription(descData);
        return NextResponse.json({ success: true, description });

      case "suggest-pricing":
        const pricingData = PricingSchema.parse(body);
        const pricing = await suggestPricing(pricingData);
        return NextResponse.json({ success: true, pricing });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("AI match error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI matching failed" },
      { status: 500 }
    );
  }
}

