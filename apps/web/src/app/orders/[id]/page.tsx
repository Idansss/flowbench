import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MessageCircle, CheckCircle, AlertCircle, FileDown, Star } from "lucide-react";
import Link from "next/link";
import { ChatInterface } from "@/components/marketplace/chat-interface";

async function getOrder(id: string) {
  // TODO: Fetch from database
  return {
    id,
    orderNumber: "FLW12345678",
    status: "in_progress", // pending, in_progress, delivered, revision_requested, completed, cancelled
    createdAt: "2025-11-02T10:00:00Z",
    dueDate: "2025-11-09T10:00:00Z",
    deliveredAt: null,
    completedAt: null,

    gig: {
      id: "gig1",
      title: "I will create a professional website with React and Next.js",
      slug: "professional-website-development",
    },

    package: {
      tier: "standard",
      name: "Professional Website",
      price: 150,
      deliveryDays: 7,
      revisions: 3,
      revisionsRemaining: 3,
    },

    buyer: {
      id: "buyer1",
      name: "Jane Smith",
      email: "jane@example.com",
    },

    seller: {
      id: "seller1",
      name: "John Doe",
      username: "johndoe",
    },

    requirements: {
      projectDescription: "I need a modern landing page for my SaaS product with responsive design and smooth animations.",
      deliveryInstructions: "Please provide source code and deployment instructions.",
      referenceLinks: "https://example.com",
    },

    delivery: null,

    timeline: [
      {
        id: "1",
        type: "order_placed",
        timestamp: "2025-11-02T10:00:00Z",
        description: "Order placed",
      },
      {
        id: "2",
        type: "seller_started",
        timestamp: "2025-11-02T11:30:00Z",
        description: "Seller started working",
      },
    ],
  };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const STATUS_CONFIG = {
    pending: {
      label: "Pending",
      icon: Clock,
      color: "bg-yellow-500",
      description: "Waiting for seller to start",
    },
    in_progress: {
      label: "In Progress",
      icon: Clock,
      color: "bg-blue-500",
      description: "Seller is working on your order",
    },
    delivered: {
      label: "Delivered",
      icon: CheckCircle,
      color: "bg-green-500",
      description: "Seller has delivered the work",
    },
    revision_requested: {
      label: "Revision Requested",
      icon: AlertCircle,
      color: "bg-orange-500",
      description: "Waiting for seller to make revisions",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle,
      color: "bg-green-600",
      description: "Order completed successfully",
    },
    cancelled: {
      label: "Cancelled",
      icon: AlertCircle,
      color: "bg-red-500",
      description: "Order was cancelled",
    },
  };

  const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = status.icon;

  const daysRemaining = Math.ceil(
    (new Date(order.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
            <Badge className={`${status.color} text-white`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">{status.description}</p>
        </div>
        <Button variant="outline">
          Need Help?
        </Button>
      </div>

      {/* Status Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className={`w-10 h-10 ${order.status !== 'pending' ? 'bg-green-500' : 'bg-muted'} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium">Order Placed</p>
              <p className="text-xs text-muted-foreground">Nov 2</p>
            </div>
            <div className={`flex-1 h-0.5 ${order.status !== 'pending' ? 'bg-green-500' : 'bg-muted'}`} />
            <div className="text-center flex-1">
              <div className={`w-10 h-10 ${order.status === 'in_progress' || order.status === 'delivered' || order.status === 'completed' ? 'bg-green-500' : 'bg-muted'} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                <Clock className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium">In Progress</p>
              <p className="text-xs text-muted-foreground">{daysRemaining} days left</p>
            </div>
            <div className={`flex-1 h-0.5 ${order.status === 'delivered' || order.status === 'completed' ? 'bg-green-500' : 'bg-muted'}`} />
            <div className="text-center flex-1">
              <div className={`w-10 h-10 ${order.status === 'delivered' || order.status === 'completed' ? 'bg-green-500' : 'bg-muted'} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                <FileDown className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium">Delivered</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className={`flex-1 h-0.5 ${order.status === 'completed' ? 'bg-green-500' : 'bg-muted'}`} />
            <div className="text-center flex-1">
              <div className={`w-10 h-10 ${order.status === 'completed' ? 'bg-green-500' : 'bg-muted'} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                <Star className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium">Completed</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chat */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order Chat</CardTitle>
                  <CardDescription>
                    Communicate with {order.seller.name}
                  </CardDescription>
                </div>
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <ChatInterface orderId={order.id} />
            </CardContent>
          </Card>

          {/* Delivery (if delivered) */}
          {order.status === "delivered" && (
            <Card className="border-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Work Delivered
                </CardTitle>
                <CardDescription>
                  Review the delivery and request revisions if needed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-accent rounded-lg">
                  <p className="text-sm font-medium mb-2">Delivery Note:</p>
                  <p className="text-sm">
                    I've completed your website with all the features discussed...
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Files:</p>
                  <Button variant="outline" className="w-full">
                    <FileDown className="w-4 h-4 mr-2" />
                    Download All Files (2.5 MB)
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" size="lg">
                    Accept Delivery
                  </Button>
                  <Button variant="outline" className="flex-1" size="lg">
                    Request Revision ({order.package.revisionsRemaining} left)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Order Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Project Description:</p>
                <p className="text-sm text-muted-foreground">
                  {order.requirements.projectDescription}
                </p>
              </div>
              {order.requirements.deliveryInstructions && (
                <div>
                  <p className="text-sm font-medium mb-1">Delivery Instructions:</p>
                  <p className="text-sm text-muted-foreground">
                    {order.requirements.deliveryInstructions}
                  </p>
                </div>
              )}
              {order.requirements.referenceLinks && (
                <div>
                  <p className="text-sm font-medium mb-1">Reference Links:</p>
                  <a
                    href={order.requirements.referenceLinks}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline"
                  >
                    {order.requirements.referenceLinks}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Link href={`/gigs/${order.gig.slug}`} className="hover:underline">
                  <p className="font-medium">{order.gig.title}</p>
                </Link>
                <p className="text-sm text-muted-foreground">
                  by {order.seller.name}
                </p>
              </div>

              <div className="border-t pt-4">
                <Badge className="mb-3">{order.package.name}</Badge>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">${order.package.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{order.package.deliveryDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revisions</span>
                    <span>{order.package.revisionsRemaining}/{order.package.revisions}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Order placed</span>
                  <span className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Due date</span>
                  <span className="text-muted-foreground">
                    {new Date(order.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Link href={`/seller/${order.seller.username}`}>
                <Button variant="outline" className="w-full">
                  View Seller Profile
                </Button>
              </Link>
              <Button variant="outline" className="w-full" disabled>
                Cancel Order
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

