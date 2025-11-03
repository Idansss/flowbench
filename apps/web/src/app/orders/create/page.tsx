"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Check, CreditCard, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function CreateOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState({
    projectDescription: "",
    deliveryInstructions: "",
    referenceLinks: "",
  });

  const gigId = searchParams.get("gigId");
  const packageTier = searchParams.get("package");

  // Mock gig data - TODO: Fetch from API
  const gig = {
    title: "I will create a professional website with React and Next.js",
    seller: "John Doe",
    package: {
      name: "Standard Package",
      price: 150,
      deliveryDays: 7,
      revisions: 3,
      features: [
        "5-10 pages",
        "Custom design",
        "Advanced SEO",
        "CMS integration",
        "Deployment + training",
      ],
    },
  };

  const serviceFee = gig.package.price * 0.05; // 5% platform fee
  const total = gig.package.price + serviceFee;

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/marketplace/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gigId,
          packageTier,
          requirements,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const { order } = await response.json();

      toast({
        title: "Order placed!",
        description: "Your order has been sent to the seller",
      });

      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Place Your Order</h1>
          <p className="text-muted-foreground">
            Complete your requirements to get started
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Order Requirements</CardTitle>
              <CardDescription>
                Provide details to help the seller understand your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectDescription">
                  Project Description * (What do you need?)
                </Label>
                <textarea
                  id="projectDescription"
                  className="w-full h-32 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe your project, goals, and any specific requirements..."
                  value={requirements.projectDescription}
                  onChange={(e) =>
                    setRequirements({
                      ...requirements,
                      projectDescription: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="deliveryInstructions">
                  Delivery Instructions (Optional)
                </Label>
                <textarea
                  id="deliveryInstructions"
                  className="w-full h-24 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
                  placeholder="Any specific delivery format or instructions?"
                  value={requirements.deliveryInstructions}
                  onChange={(e) =>
                    setRequirements({
                      ...requirements,
                      deliveryInstructions: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="referenceLinks">
                  Reference Links (Optional)
                </Label>
                <Input
                  id="referenceLinks"
                  placeholder="https://example.com"
                  value={requirements.referenceLinks}
                  onChange={(e) =>
                    setRequirements({
                      ...requirements,
                      referenceLinks: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* File Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>Attachments (Optional)</CardTitle>
              <CardDescription>
                Upload any files that might help the seller
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <Button variant="outline" disabled>
                  Upload Files (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Order Summary */}
        <div>
          <div className="sticky top-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium mb-2">{gig.title}</p>
                  <p className="text-sm text-muted-foreground">
                    by {gig.seller}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <Badge className="mb-3">{gig.package.name}</Badge>
                  <div className="space-y-2">
                    {gig.package.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{gig.package.deliveryDays} day delivery</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {gig.package.revisions} revisions included
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Package price</span>
                    <span>${gig.package.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee (5%)</span>
                    <span className="text-muted-foreground">${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    <span className="text-sm">Credit / Debit Card</span>
                  </div>
                  <Badge variant="outline">Stripe</Badge>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Your payment is held securely in escrow and released to the seller
                    only after you approve the delivery
                  </span>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={!requirements.projectDescription || loading}
            >
              {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By placing this order, you agree to our{" "}
              <Link href="/terms" className="underline">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

