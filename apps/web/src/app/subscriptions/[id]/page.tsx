import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Package, Pause, X } from "lucide-react";

async function getSubscription(id: string) {
  // TODO: Fetch from database
  return {
    id,
    gig: {
      title: "Monthly website maintenance",
      seller: "John Doe",
    },
    price: 299,
    deliverables: 4,
    billingDay: 1,
    nextBilling: "2025-12-01",
    status: "active",
    startedAt: "2025-10-01",
    deliveries: [
      { month: "November 2025", status: "delivered" },
      { month: "October 2025", status: "delivered" },
    ],
  };
}

export default async function SubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subscription = await getSubscription(id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subscription Details</h1>
          <p className="text-muted-foreground">{subscription.gig.title}</p>
        </div>
        <Badge className={subscription.status === "active" ? "bg-green-600" : "bg-yellow-500"}>
          {subscription.status}
        </Badge>
      </div>

      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Price</p>
                <p className="font-bold text-lg">${subscription.price}/month</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Deliverables</p>
                <p className="font-bold text-lg">{subscription.deliverables} per month</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Next Billing</p>
                <p className="font-bold">{new Date(subscription.nextBilling).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="font-bold">{new Date(subscription.startedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Pause Subscription
            </Button>
            <Button variant="outline" className="flex-1 text-destructive">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delivery History */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery History</CardTitle>
          <CardDescription>Monthly deliveries for this subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscription.deliveries.map((delivery, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{delivery.month}</p>
                </div>
                <Badge className="bg-green-600">{delivery.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

