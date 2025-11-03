"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, CheckCircle, TrendingUp, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BecomeSellerPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    tagline: "",
    description: "",
    skills: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/marketplace/seller/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(",").map((s) => s.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create seller profile");
      }

      toast({
        title: "Success!",
        description: "Your seller profile has been created",
      });

      router.push("/dashboard/seller");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 bg-primary/10 rounded-full">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">Become a Seller</h1>
        <p className="text-xl text-muted-foreground">
          Join Flowbench Marketplace and start selling your services
        </p>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold mb-2">Free to Start</h3>
            <p className="text-sm text-muted-foreground">
              No upfront fees. Only pay 20% commission on orders.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Free Tools Included</h3>
            <p className="text-sm text-muted-foreground">
              Use all 10 Flowbench tools to deliver better work faster.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Shield className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold mb-2">Secure Payments</h3>
            <p className="text-sm text-muted-foreground">
              Escrow system protects both buyers and sellers.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Your Seller Profile</CardTitle>
          <CardDescription>Step {step} of 2</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="username">Username * (unique)</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your profile URL: flowbench.app/seller/{formData.username}
                </p>
              </div>

              <div>
                <Label htmlFor="tagline">Professional Tagline *</Label>
                <Input
                  id="tagline"
                  placeholder="Expert Web Developer | 5+ Years Experience"
                  maxLength={200}
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.tagline.length}/200 characters
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={
                  !formData.displayName || !formData.username || !formData.tagline
                }
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">About You *</Label>
                <textarea
                  id="description"
                  className="w-full h-32 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe your expertise, experience, and what makes you unique..."
                  maxLength={1000}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="web development, react, typescript, design"
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={!formData.description || loading}
                >
                  {loading ? "Creating..." : "Create Profile"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps Preview */}
      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle className="text-lg">After Creating Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✓ Create your first gig with packages</p>
          <p>✓ Set your pricing and delivery times</p>
          <p>✓ Upload portfolio samples</p>
          <p>✓ Start receiving orders!</p>
        </CardContent>
      </Card>
    </div>
  );
}

