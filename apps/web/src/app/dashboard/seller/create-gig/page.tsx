"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PackageBuilder } from "@/components/marketplace/package-builder";

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Design & Creative",
  "Writing & Translation",
  "Video & Animation",
  "Music & Audio",
  "Programming & Tech",
  "Digital Marketing",
  "Business",
  "AI Services",
];

const STEPS = [
  { id: 1, name: "Overview", description: "Title, category, description" },
  { id: 2, name: "Pricing", description: "Packages and pricing" },
  { id: 3, name: "Media", description: "Images and videos" },
  { id: 4, name: "Details", description: "FAQs and tags" },
];

export default function CreateGigPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Step 1: Overview
    title: "",
    category: "",
    subcategory: "",
    description: "",

    // Step 2: Pricing (packages)
    packages: {
      basic: {
        name: "Basic",
        description: "",
        price: 5,
        deliveryDays: 3,
        revisions: 1,
        features: [] as string[],
      },
      standard: {
        name: "Standard",
        description: "",
        price: 10,
        deliveryDays: 5,
        revisions: 2,
        features: [] as string[],
      },
      premium: {
        name: "Premium",
        description: "",
        price: 20,
        deliveryDays: 7,
        revisions: 3,
        features: [] as string[],
      },
    },

    // Step 3: Media
    galleryUrls: [] as string[],
    videoUrl: "",

    // Step 4: Details
    searchTags: [] as string[],
    faq: [] as { question: string; answer: string }[],
  });

  const [newTag, setNewTag] = useState("");
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Generate slug from title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const response = await fetch("/api/marketplace/gigs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          slug,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create gig");
      }

      const { gig } = await response.json();

      toast({
        title: "Success!",
        description: "Your gig has been created",
      });

      router.push(`/gigs/${gig.slug}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create gig",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title && formData.category && formData.description.length >= 100;
      case 2:
        return (
          formData.packages.basic.price >= 5 &&
          formData.packages.basic.deliveryDays >= 1 &&
          formData.packages.basic.features.length > 0
        );
      case 3:
        return true; // Media is optional
      case 4:
        return formData.searchTags.length >= 3;
      default:
        return true;
    }
  };

  const addTag = () => {
    if (newTag && formData.searchTags.length < 5) {
      setFormData({
        ...formData,
        searchTags: [...formData.searchTags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      searchTags: formData.searchTags.filter((t) => t !== tag),
    });
  };

  const addFaq = () => {
    if (newFaq.question && newFaq.answer) {
      setFormData({
        ...formData,
        faq: [...formData.faq, newFaq],
      });
      setNewFaq({ question: "", answer: "" });
    }
  };

  const removeFaq = (index: number) => {
    setFormData({
      ...formData,
      faq: formData.faq.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/seller")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create a New Gig</h1>
          <p className="text-muted-foreground">
            Tell us what service you want to offer
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between">
        {STEPS.map((s, idx) => (
          <div
            key={s.id}
            className={`flex-1 ${idx < STEPS.length - 1 ? "border-b-2" : ""} ${
              s.id <= step ? "border-primary" : "border-muted"
            } pb-3`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s.id < step
                    ? "bg-primary text-primary-foreground"
                    : s.id === step
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.id < step ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <div>
                <div className="font-medium text-sm">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step - 1].name}</CardTitle>
          <CardDescription>{STEPS[step - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Overview */}
          {step === 1 && (
            <>
              <div>
                <Label htmlFor="title">Gig Title *</Label>
                <Input
                  id="title"
                  placeholder="I will create a professional website"
                  maxLength={100}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.title.length}/100 characters
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    placeholder="e.g. React Development"
                    value={formData.subcategory}
                    onChange={(e) =>
                      setFormData({ ...formData, subcategory: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description * (min 100 chars)</Label>
                <textarea
                  id="description"
                  className="w-full h-48 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe what you'll deliver, your experience, and why buyers should choose you..."
                  maxLength={2000}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.description.length}/2000 characters
                </p>
              </div>
            </>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <div className="space-y-8">
              <p className="text-sm text-muted-foreground">
                Create up to 3 packages for different budgets. At minimum, you must have a Basic package.
              </p>

              <PackageBuilder
                tier="basic"
                package={formData.packages.basic}
                onChange={(pkg) =>
                  setFormData({
                    ...formData,
                    packages: { ...formData.packages, basic: pkg },
                  })
                }
              />

              <PackageBuilder
                tier="standard"
                package={formData.packages.standard}
                onChange={(pkg) =>
                  setFormData({
                    ...formData,
                    packages: { ...formData.packages, standard: pkg },
                  })
                }
                optional
              />

              <PackageBuilder
                tier="premium"
                package={formData.packages.premium}
                onChange={(pkg) =>
                  setFormData({
                    ...formData,
                    packages: { ...formData.packages, premium: pkg },
                  })
                }
                optional
              />
            </div>
          )}

          {/* Step 3: Media */}
          {step === 3 && (
            <>
              <div>
                <Label>Gallery Images (up to 3)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload images showcasing your work
                  </p>
                  <Button variant="outline" disabled>
                    Upload Images (Coming Soon)
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="videoUrl">Gig Video URL (YouTube/Vimeo)</Label>
                <Input
                  id="videoUrl"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Add a video to showcase your work
                </p>
              </div>
            </>
          )}

          {/* Step 4: Details */}
          {step === 4 && (
            <>
              <div>
                <Label>Search Tags * (3-5 tags)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. react, web design, responsive"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    disabled={formData.searchTags.length >= 5}
                  />
                  <Button onClick={addTag} disabled={formData.searchTags.length >= 5}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.searchTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.searchTags.length}/5 tags
                </p>
              </div>

              <div>
                <Label>Frequently Asked Questions (Optional)</Label>
                <div className="space-y-4 mb-4">
                  {formData.faq.map((faq, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{faq.question}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFaq(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <Input
                    placeholder="Question"
                    value={newFaq.question}
                    onChange={(e) =>
                      setNewFaq({ ...newFaq, question: e.target.value })
                    }
                  />
                  <textarea
                    className="w-full h-24 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
                    placeholder="Answer"
                    value={newFaq.answer}
                    onChange={(e) =>
                      setNewFaq({ ...newFaq, answer: e.target.value })
                    }
                  />
                  <Button onClick={addFaq} variant="outline" className="w-full">
                    Add FAQ
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || loading}>
                {loading ? "Creating..." : "Publish Gig"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

