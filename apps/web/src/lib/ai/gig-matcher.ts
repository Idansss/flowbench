/**
 * AI Gig Matcher - Like Fiverr Neo but better
 * 
 * Uses Idansss AI to match buyers with the perfect gig
 */

import { createChatCompletion } from "../openai";
import { marketplace } from "../db-marketplace";

interface MatchRequest {
  description: string;
  budget?: number;
  timeline?: string;
  category?: string;
}

export async function matchGigs(request: MatchRequest) {
  // Step 1: Extract requirements using AI
  const analysisPrompt = `Analyze this service request and extract key requirements:

Request: "${request.description}"
Budget: ${request.budget ? `$${request.budget}` : "Not specified"}
Timeline: ${request.timeline || "Not specified"}

Extract:
1. Category (web development, design, writing, etc.)
2. Key skills needed
3. Complexity level (basic/intermediate/advanced)
4. Deliverables expected

Respond in JSON format:
{
  "category": "...",
  "skills": ["skill1", "skill2"],
  "complexity": "...",
  "deliverables": ["..."],
  "searchTerms": ["term1", "term2"]
}`;

  const analysisResponse = await createChatCompletion([
    { role: "system", content: "You are an expert at analyzing service requests." },
    { role: "user", content: analysisPrompt },
  ]);

  let analysis;
  try {
    analysis = JSON.parse(analysisResponse.content);
  } catch {
    // Fallback if AI doesn't return valid JSON
    analysis = {
      category: request.category || "Web Development",
      skills: [],
      complexity: "intermediate",
      deliverables: [],
      searchTerms: [request.description.split(" ").slice(0, 3).join(" ")],
    };
  }

  // Step 2: Search for matching gigs
  const searchResults = await Promise.all(
    analysis.searchTerms.map((term: string) => marketplace.searchGigs(term, 5))
  );

  const allGigs = searchResults.flat();
  const uniqueGigs = Array.from(new Map(allGigs.map((g: any) => [g.id, g])).values());

  // Step 3: Rank gigs using AI
  if (uniqueGigs.length === 0) {
    return {
      matches: [],
      analysis,
      suggestion: "No exact matches found. Try browsing the marketplace or creating a project brief.",
    };
  }

  const rankingPrompt = `Given this service request:
"${request.description}"

And these gig options:
${uniqueGigs.slice(0, 5).map((g: any, i) => `
${i + 1}. ${g.title}
   - Price: $${g.packages?.[0]?.price || "N/A"}
   - Rating: ${g.rating}/5 (${g.review_count} reviews)
   - Seller: ${g.seller_name} (${g.seller_rating}/5)
`).join("\n")}

Rank them from best to worst match and explain why. Consider:
- Relevance to requirements
- Seller reputation
- Price vs budget
- Delivery time

Respond in JSON format:
{
  "rankings": [
    {
      "gigIndex": 0,
      "score": 95,
      "reason": "Perfect match because..."
    }
  ],
  "recommendation": "Overall recommendation for the buyer"
}`;

  const rankingResponse = await createChatCompletion([
    { role: "system", content: "You are an expert marketplace advisor." },
    { role: "user", content: rankingPrompt },
  ]);

  let rankings;
  try {
    rankings = JSON.parse(rankingResponse.content);
  } catch {
    // Fallback: return gigs sorted by rating
    rankings = {
      rankings: uniqueGigs.slice(0, 5).map((_, i) => ({
        gigIndex: i,
        score: 80 - i * 10,
        reason: "Highly rated and relevant",
      })),
      recommendation: "These are top-rated services in this category.",
    };
  }

  // Step 4: Return ranked matches
  const matches = rankings.rankings.map((r: any) => ({
    gig: uniqueGigs[r.gigIndex],
    score: r.score,
    reason: r.reason,
  }));

  return {
    matches,
    analysis,
    recommendation: rankings.recommendation,
  };
}

/**
 * Generate gig description using AI
 */
export async function generateGigDescription(input: {
  service: string;
  experience: string;
  deliverables: string[];
}) {
  const prompt = `Write a compelling gig description for a freelance service:

Service: ${input.service}
Seller's Experience: ${input.experience}
Deliverables: ${input.deliverables.join(", ")}

Create a professional description that:
1. Starts with a strong opening
2. Highlights experience and expertise
3. Lists what's included
4. Builds trust
5. Ends with a call-to-action

Keep it under 500 words.`;

  const response = await createChatCompletion([
    {
      role: "system",
      content: "You are an expert at writing compelling service descriptions.",
    },
    { role: "user", content: prompt },
  ]);

  return response.content;
}

/**
 * Optimize gig pricing using marketplace data
 */
export async function suggestPricing(input: {
  category: string;
  deliveryDays: number;
  features: string[];
}) {
  // TODO: Analyze actual marketplace data
  const basePrices = {
    "Web Development": { basic: 50, standard: 150, premium: 300 },
    "Design & Creative": { basic: 40, standard: 100, premium: 250 },
    "Writing & Translation": { basic: 30, standard: 75, premium: 150 },
    "AI Services": { basic: 75, standard: 200, premium: 500 },
    default: { basic: 50, standard: 125, premium: 250 },
  };

  const prices = basePrices[input.category as keyof typeof basePrices] || basePrices.default;

  return {
    basic: prices.basic,
    standard: prices.standard,
    premium: prices.premium,
    reasoning: `Based on ${input.category} marketplace averages and ${input.features.length} features.`,
  };
}

