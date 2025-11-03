import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Play, Pause, Eye, MousePointer, DollarSign } from "lucide-react";
import Link from "next/link";

async function getCampaigns() {
  // TODO: Fetch from database
  return [
    {
      id: "campaign1",
      gigTitle: "Professional website development",
      status: "active",
      dailyBudget: 20,
      totalSpent: 156,
      impressions: 3450,
      clicks: 345,
      orders: 12,
      ctr: 10.0,
      conversionRate: 3.5,
    },
  ];
}

export default async function PromotedGigsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Promoted Gigs</h1>
          <p className="text-muted-foreground">
            Boost your gigs with PPC advertising
          </p>
        </div>
        <Button>
          <TrendingUp className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* How It Works */}
      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle className="text-lg">How Promoted Gigs Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✓ Your gig appears at the top of search results</p>
          <p>✓ Pay only when someone clicks your gig</p>
          <p>✓ Set your own daily budget and maximum bid</p>
          <p>✓ Pause or adjust campaigns anytime</p>
        </CardContent>
      </Card>

      {/* Campaigns */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Campaigns</h2>

        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{campaign.gigTitle}</CardTitle>
                  <CardDescription>
                    ${campaign.dailyBudget}/day budget • ${campaign.totalSpent} spent
                  </CardDescription>
                </div>
                <Badge className={campaign.status === "active" ? "bg-green-600" : "bg-yellow-500"}>
                  {campaign.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">Impressions</span>
                  </div>
                  <p className="text-lg font-bold">{campaign.impressions.toLocaleString()}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <MousePointer className="w-4 h-4" />
                    <span className="text-xs">Clicks</span>
                  </div>
                  <p className="text-lg font-bold">{campaign.clicks.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">CTR</p>
                  <p className="text-lg font-bold">{campaign.ctr}%</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Orders</p>
                  <p className="text-lg font-bold">{campaign.orders}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Conversion</p>
                  <p className="text-lg font-bold">{campaign.conversionRate}%</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button variant="outline" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" className="flex-1">
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {campaigns.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Start promoting your gigs to get more visibility
              </p>
              <Button>Create Your First Campaign</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

