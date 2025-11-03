import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Eye, MousePointer, Star, Clock } from "lucide-react";

async function getAnalytics() {
  // TODO: Fetch from database
  return {
    overview: {
      totalRevenue: 15680,
      thisMonth: 2850,
      orders: 342,
      avgOrderValue: 85,
      rating: 4.9,
      responseTime: 2,
    },
    traffic: {
      impressions: 12450,
      clicks: 1245,
      ctr: 10.0,
      conversionRate: 8.5,
    },
    topGigs: [
      { title: "Professional website development", revenue: 6350, orders: 127 },
      { title: "React component library", revenue: 4500, orders: 45 },
      { title: "Next.js consulting", revenue: 3200, orders: 32 },
    ],
    recentActivity: [
      { date: "2025-11-03", orders: 3, revenue: 450 },
      { date: "2025-11-02", orders: 2, revenue: 300 },
      { date: "2025-11-01", orders: 4, revenue: 600 },
    ],
  };
}

export default async function SellerAnalyticsPage() {
  const analytics = await getAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Seller Analytics</h1>
        <p className="text-muted-foreground">
          Track your performance and grow your business
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.overview.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              +${analytics.overview.thisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.orders}</div>
            <p className="text-xs text-muted-foreground">
              ${analytics.overview.avgOrderValue} avg order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.rating} ⭐</div>
            <p className="text-xs text-muted-foreground">Excellent rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.responseTime}h</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="gigs">Top Gigs</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Impressions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.traffic.impressions.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MousePointer className="w-4 h-4" />
                  Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.traffic.clicks.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">CTR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.traffic.ctr}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.traffic.conversionRate}%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Traffic Chart</CardTitle>
              <CardDescription>Last 30 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-accent/50 rounded-lg">
                <p className="text-muted-foreground">Chart visualization (Coming soon)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gigs">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Gigs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topGigs.map((gig, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{gig.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {gig.orders} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${gig.revenue}</p>
                      <p className="text-xs text-muted-foreground">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.map((day, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.orders} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${day.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

