"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  id: string;
  milestone_number: number;
  description: string;
  amount: number;
  status: string;
  due_date?: string;
}

interface MilestoneManagerProps {
  orderId: string;
  milestones: Milestone[];
  isSeller: boolean;
}

export function MilestoneManager({ orderId, milestones, isSeller }: MilestoneManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    description: "",
    amount: 0,
    dueDate: "",
  });
  const { toast } = useToast();

  const handleDeliver = async (milestoneId: string) => {
    try {
      const response = await fetch(`/api/marketplace/milestones/${milestoneId}/deliver`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to deliver milestone");

      toast({
        title: "Milestone delivered!",
        description: "Waiting for buyer approval",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deliver",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (milestoneId: string) => {
    try {
      const response = await fetch(`/api/marketplace/milestones/${milestoneId}/approve`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to approve milestone");

      toast({
        title: "Milestone approved!",
        description: "Payment released to seller",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve",
        variant: "destructive",
      });
    }
  };

  const STATUS_CONFIG = {
    pending: { label: "Pending", color: "bg-yellow-500" },
    in_progress: { label: "In Progress", color: "bg-blue-500" },
    delivered: { label: "Delivered", color: "bg-green-500" },
    approved: { label: "Approved", color: "bg-green-600" },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Milestones</CardTitle>
            <CardDescription>
              Break down the project into stages with separate payments
            </CardDescription>
          </div>
          {milestones.length === 0 && (
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Milestones List */}
        {milestones.map((milestone) => {
          const status = STATUS_CONFIG[milestone.status as keyof typeof STATUS_CONFIG];
          return (
            <div key={milestone.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Milestone #{milestone.milestone_number}</Badge>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                  <p className="font-medium mb-1">{milestone.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${milestone.amount}</span>
                    </div>
                    {milestone.due_date && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Due {new Date(milestone.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {milestone.status === "in_progress" && isSeller && (
                <Button
                  onClick={() => handleDeliver(milestone.id)}
                  className="w-full"
                >
                  Mark as Delivered
                </Button>
              )}
              {milestone.status === "delivered" && !isSeller && (
                <Button
                  onClick={() => handleApprove(milestone.id)}
                  className="w-full"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve & Release Payment
                </Button>
              )}
            </div>
          );
        })}

        {/* Add Milestone Form */}
        {showAddForm && (
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-semibold">New Milestone</h4>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g. Design mockups"
                value={newMilestone.description}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newMilestone.amount}
                  onChange={(e) =>
                    setNewMilestone({ ...newMilestone, amount: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) =>
                    setNewMilestone({ ...newMilestone, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Create Milestone</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {milestones.length === 0 && !showAddForm && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              No milestones yet. Large projects can be broken into stages.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

