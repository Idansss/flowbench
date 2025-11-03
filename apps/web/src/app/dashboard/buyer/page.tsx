import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Clock, CheckCircle, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

async function getBuyerOrders() {
  // TODO: Fetch from database
  return {
    active: [
      {
        id: "order1",
        orderNumber: "FLW12345678",
        gigTitle: "Professional website development",
        seller: "John Doe",
        status: "in_progress",
        dueDate: "2025-11-09",
        price: 150,
        unreadMessages: 2,
      },
      {
        id: "order2",
        orderNumber: "FLW12345679",
        gigTitle: "Logo design and branding",
        seller: "Design Pro",
        status: "delivered",
        dueDate: "2025-11-05",
        price: 75,
        unreadMessages: 1,
      },
    ],
    completed: [
      {
        id: "order3",
        orderNumber: "FLW12345670",
        gigTitle: "AI chatbot development",
        seller: "AI Expert",
        status: "completed",
        completedDate: "2025-10-28",
        price: 150,
        hasReview: false,
      },
    ],
  };
}

export default async function BuyerDashboardPage() {
  const orders = await getBuyerOrders();

  const stats = {
    activeOrders: orders.active.length,
    completedOrders: orders.completed.length,
    totalSpent: orders.active.reduce((sum, o) => sum + o.price, 0) +
                orders.completed.reduce((sum, o) => sum + o.price, 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Buyer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your orders and find new services
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">Orders in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent}</div>
            <p className="text-xs text-muted-foreground">All time spending</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Orders ({orders.active.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({orders.completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {orders.active.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No active orders</h3>
                <p className="text-muted-foreground mb-4">
                  Browse the marketplace to find services
                </p>
                <Link href="/marketplace">
                  <Button>Browse Services</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            orders.active.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.gigTitle}</CardTitle>
                      <CardDescription>
                        by {order.seller} • Order #{order.orderNumber}
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        order.status === "delivered"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }
                    >
                      {order.status === "delivered" ? "Delivered" : "In Progress"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Due {new Date(order.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="font-medium">${order.price}</div>
                    </div>
                    {order.unreadMessages > 0 && (
                      <Badge variant="secondary">
                        {order.unreadMessages} new message{order.unreadMessages > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/orders/${order.id}`} className="w-full">
                    <Button className="w-full">View Order</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {orders.completed.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No completed orders yet</h3>
                <p className="text-muted-foreground">
                  Your completed orders will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            orders.completed.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.gigTitle}</CardTitle>
                      <CardDescription>
                        by {order.seller} • Completed {new Date(order.completedDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-600">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">${order.price}</div>
                    {!order.hasReview && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="w-4 h-4" />
                        <span>Review pending</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link href={`/orders/${order.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">View Order</Button>
                  </Link>
                  {!order.hasReview && (
                    <Link href={`/orders/${order.id}?review=true`} className="flex-1">
                      <Button className="w-full">Leave Review</Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Link href="/marketplace">
            <Button variant="outline" className="w-full">
              Browse Marketplace
            </Button>
          </Link>
          <Link href="/ai">
            <Button variant="outline" className="w-full">
              Ask Idansss AI for Help
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

