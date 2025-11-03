import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, DollarSign, TrendingUp, Star, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";

async function getSellerData() {
  // TODO: Fetch from database
  return {
    profile: {
      displayName: "John Doe",
      username: "johndoe",
      level: "top_rated",
      rating: 4.9,
      totalOrders: 342,
      completionRate: 98,
      responseTime: 2,
    },
    gigs: [
      {
        id: "gig1",
        slug: "professional-website-development",
        title: "Professional website with React and Next.js",
        status: "active",
        price: 50,
        orders: 127,
        rating: 4.9,
        reviewCount: 89,
        impressions: 2450,
        clicks: 245,
      },
      {
        id: "gig2",
        slug: "react-component-library",
        title: "Custom React component library",
        status: "active",
        price: 100,
        orders: 45,
        rating: 5.0,
        reviewCount: 38,
        impressions: 890,
        clicks: 78,
      },
    ],
    orders: {
      active: [
        {
          id: "order1",
          orderNumber: "FLW12345678",
          gigTitle: "Professional website development",
          buyer: "Jane Smith",
          status: "in_progress",
          dueDate: "2025-11-09",
          price: 150,
          unreadMessages: 2,
        },
      ],
      pending: [
        {
          id: "order2",
          orderNumber: "FLW12345679",
          gigTitle: "React component library",
          buyer: "Mike Johnson",
          status: "pending",
          createdAt: "2025-11-03",
          price: 100,
        },
      ],
    },
    earnings: {
      thisMonth: 2850,
      available: 1200,
      pending: 450,
      withdrawn: 15680,
    },
  };
}

export default async function SellerDashboardPage() {
  const data = await getSellerData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <Badge className="bg-amber-600">
              {data.profile.level === "top_rated" ? "TOP RATED" : data.profile.level.toUpperCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Welcome back, {data.profile.displayName}! 👋
          </p>
        </div>
        <Link href="/dashboard/seller/create-gig">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create New Gig
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.earnings.thisMonth}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.earnings.available}</div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.profile.rating} ⭐</div>
            <p className="text-xs text-muted-foreground">{data.profile.totalOrders} orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.profile.responseTime}h</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Active Orders</CardTitle>
          <CardDescription>Orders requiring your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">
                In Progress ({data.orders.active.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({data.orders.pending.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-4">
              {data.orders.active.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{order.gigTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        for {order.buyer} • Order #{order.orderNumber}
                      </p>
                    </div>
                    <Badge className="bg-blue-500">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Due: {new Date(order.dueDate).toLocaleDateString()} • ${order.price}
                    </div>
                    {order.unreadMessages > 0 && (
                      <Badge variant="secondary">
                        {order.unreadMessages} new
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <Link href={`/orders/${order.id}`}>
                      <Button className="w-full" variant="outline">
                        View Order
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {data.orders.pending.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{order.gigTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        from {order.buyer} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-yellow-500">Pending</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    ${order.price}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/orders/${order.id}`} className="flex-1">
                      <Button className="w-full">Accept Order</Button>
                    </Link>
                    <Button variant="outline" className="flex-1">Decline</Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Gigs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Gigs</CardTitle>
              <CardDescription>Manage your service listings</CardDescription>
            </div>
            <Link href="/dashboard/seller/create-gig">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Gig
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.gigs.map((gig) => (
            <div key={gig.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{gig.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{gig.rating}</span>
                      <span>({gig.reviewCount})</span>
                    </div>
                    <span>•</span>
                    <span>{gig.orders} orders</span>
                  </div>
                </div>
                <Badge>{gig.status}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Starting at</p>
                  <p className="font-semibold">${gig.price}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Impressions</p>
                  <p className="font-semibold">{gig.impressions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Clicks</p>
                  <p className="font-semibold">{gig.clicks}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/gigs/${gig.slug}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </Link>
                <Button variant="outline" className="flex-1">Edit</Button>
                <Button variant="outline" className="flex-1">Analytics</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings</CardTitle>
          <CardDescription>Manage your income and payouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Available</p>
              <p className="text-2xl font-bold">${data.earnings.available}</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold">${data.earnings.pending}</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Withdrawn</p>
              <p className="text-2xl font-bold">${data.earnings.withdrawn}</p>
            </div>
          </div>
          <Button className="w-full" size="lg" disabled={data.earnings.available < 50}>
            Withdraw Earnings {data.earnings.available < 50 && "(Minimum $50)"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

