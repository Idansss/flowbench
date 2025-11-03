"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface Package {
  name: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number | null;
  features: string[];
}

interface PackageBuilderProps {
  tier: "basic" | "standard" | "premium";
  package: Package;
  onChange: (pkg: Package) => void;
  optional?: boolean;
}

const TIER_CONFIG = {
  basic: {
    label: "Basic",
    color: "bg-blue-500",
    description: "Essential features for budget-conscious buyers",
  },
  standard: {
    label: "Standard",
    color: "bg-purple-500",
    description: "Most popular option with extra features",
  },
  premium: {
    label: "Premium",
    color: "bg-amber-500",
    description: "Complete package with all features",
  },
};

export function PackageBuilder({ tier, package: pkg, onChange, optional }: PackageBuilderProps) {
  const [newFeature, setNewFeature] = useState("");
  const [enabled, setEnabled] = useState(!optional);

  const config = TIER_CONFIG[tier];

  if (optional && !enabled) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <div className={`w-12 h-12 ${config.color} rounded-full mx-auto mb-3 opacity-50`} />
          <h3 className="font-semibold mb-2">{config.label} Package</h3>
          <p className="text-sm text-muted-foreground mb-4">{config.description}</p>
          <Button onClick={() => setEnabled(true)} variant="outline">
            Add {config.label} Package
          </Button>
        </CardContent>
      </Card>
    );
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      onChange({
        ...pkg,
        features: [...pkg.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (idx: number) => {
    onChange({
      ...pkg,
      features: pkg.features.filter((_, i) => i !== idx),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 ${config.color} rounded-full`} />
            <CardTitle>{config.label} Package</CardTitle>
            {tier === "standard" && (
              <Badge variant="secondary">Most Popular</Badge>
            )}
          </div>
          {optional && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEnabled(false)}
            >
              Remove
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`${tier}-name`}>Package Name</Label>
          <Input
            id={`${tier}-name`}
            placeholder={`${config.label} ${tier === "basic" ? "Starter" : tier === "standard" ? "Professional" : "Ultimate"}`}
            value={pkg.name}
            onChange={(e) => onChange({ ...pkg, name: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor={`${tier}-description`}>Package Description</Label>
          <textarea
            id={`${tier}-description`}
            className="w-full h-20 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
            placeholder="Briefly describe what's included in this package"
            value={pkg.description}
            onChange={(e) => onChange({ ...pkg, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`${tier}-price`}>Price ($) *</Label>
            <Input
              id={`${tier}-price`}
              type="number"
              min="5"
              step="5"
              value={pkg.price}
              onChange={(e) =>
                onChange({ ...pkg, price: parseFloat(e.target.value) || 5 })
              }
            />
          </div>

          <div>
            <Label htmlFor={`${tier}-delivery`}>Delivery (days) *</Label>
            <Input
              id={`${tier}-delivery`}
              type="number"
              min="1"
              value={pkg.deliveryDays}
              onChange={(e) =>
                onChange({ ...pkg, deliveryDays: parseInt(e.target.value) || 1 })
              }
            />
          </div>

          <div>
            <Label htmlFor={`${tier}-revisions`}>Revisions</Label>
            <Input
              id={`${tier}-revisions`}
              type="number"
              min="0"
              placeholder="Unlimited"
              value={pkg.revisions || ""}
              onChange={(e) =>
                onChange({
                  ...pkg,
                  revisions: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
          </div>
        </div>

        <div>
          <Label>Features Included *</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g. 5 page website, Responsive design"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
            />
            <Button type="button" onClick={addFeature}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {pkg.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-accent rounded-md"
              >
                <span className="text-sm">✓ {feature}</span>
                <button
                  onClick={() => removeFeature(idx)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {pkg.features.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Add at least one feature to this package
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

