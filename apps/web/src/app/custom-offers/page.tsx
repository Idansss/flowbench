import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, CheckCircle, X } from "lucide-react";
import Link from "next/link";

async function getCustomOffers() {
  // TODO: Fetch from database
  return {
    sent: [
      {
        id: "offer1",
        buyer: "Jane Smith",
        title: "Custom website with advanced features",
        price: 1200,
        deliveryDays: 21,
        status: "pending",
        expiresAt: "2025-11-10",
      },
    ],
    received: [
      {
        id: "offer2",
        seller: "John Doe",
        title: "Logo redesign + brand guidelines",
        price: 350,
        deliveryDays: 7,
        status: "pending",
        expiresAt: "2025-11-08",
      },
    ],
  };
}

export default async function CustomOffersPage() {
  const offers = await getCustomOffers();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Custom Offers</h1>
          <p className="text-muted-foreground">
            Create personalized offers for specific buyers
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Offer
        </Button>
      </div>

      {/* Sent Offers */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Sent Offers</h2>
        <div className="space-y-4">
          {offers.sent.map((offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{offer.title}</CardTitle>
                    <CardDescription>To: {offer.buyer}</CardDescription>
                  </div>
                  <Badge className="bg-yellow-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {offer.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Price: </span>
                      <span className="font-semibold">${offer.price}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delivery: </span>
                      <span className="font-semibold">{offer.deliveryDays} days</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expires: </span>
                      <span className="font-semibold">
                        {new Date(offer.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {offers.sent.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No sent offers yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Received Offers */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Received Offers</h2>
        <div className="space-y-4">
          {offers.received.map((offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{offer.title}</CardTitle>
                    <CardDescription>From: {offer.seller}</CardDescription>
                  </div>
                  <Badge className="bg-yellow-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {offer.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Price: </span>
                      <span className="font-semibold">${offer.price}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delivery: </span>
                      <span className="font-semibold">{offer.deliveryDays} days</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expires: </span>
                      <span className="font-semibold">
                        {new Date(offer.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Offer
                    </Button>
                    <Button variant="outline" className="flex-1 text-destructive">
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {offers.received.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No received offers yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

