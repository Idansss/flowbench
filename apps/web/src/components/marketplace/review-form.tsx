"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  orderId: string;
  sellerName: string;
  onSubmit?: () => void;
}

export function ReviewForm({ orderId, sellerName, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [communicationRating, setCommunicationRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!rating || !reviewText.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a rating and review",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/marketplace/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          rating,
          reviewText,
          communicationRating,
          serviceRating,
          recommend,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback",
      });

      onSubmit?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    hover,
    onHover,
  }: {
    value: number;
    onChange: (v: number) => void;
    hover?: number;
    onHover?: (v: number) => void;
  }) => (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => onHover?.(i + 1)}
          onMouseLeave={() => onHover?.(0)}
          onClick={() => onChange(i + 1)}
          className="focus:outline-none"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              i < (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
        <CardDescription>
          Share your experience working with {sellerName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div>
          <Label className="mb-2 block">Overall Rating *</Label>
          <StarRating
            value={rating}
            onChange={setRating}
            hover={hoveredRating}
            onHover={setHoveredRating}
          />
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 5 && "Outstanding!"}
              {rating === 4 && "Great work"}
              {rating === 3 && "Good"}
              {rating === 2 && "Below expectations"}
              {rating === 1 && "Poor"}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div>
          <Label htmlFor="reviewText" className="mb-2 block">
            Your Review *
          </Label>
          <textarea
            id="reviewText"
            className="w-full h-32 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Describe your experience working with this seller..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {reviewText.length}/1000 characters
          </p>
        </div>

        {/* Detailed Ratings */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Communication</Label>
            <StarRating
              value={communicationRating}
              onChange={setCommunicationRating}
            />
          </div>
          <div>
            <Label className="mb-2 block">Service Quality</Label>
            <StarRating
              value={serviceRating}
              onChange={setServiceRating}
            />
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <Label className="mb-2 block">
            Would you recommend this seller?
          </Label>
          <div className="flex gap-2">
            <Button
              variant={recommend === true ? "default" : "outline"}
              onClick={() => setRecommend(true)}
              type="button"
            >
              👍 Yes
            </Button>
            <Button
              variant={recommend === false ? "default" : "outline"}
              onClick={() => setRecommend(false)}
              type="button"
            >
              👎 No
            </Button>
          </div>
        </div>

        {/* Submit */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!rating || !reviewText.trim() || loading}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Your review will be public and help other buyers make decisions
        </p>
      </CardContent>
    </Card>
  );
}

