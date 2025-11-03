import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Clock, Check, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

async function getGig(slug: string) {
  // TODO: Implement with real data from database
  return {
    id: "1",
    slug,
    title: "I will create a professional website with React and Next.js",
    category: "Web Development",
    subcategory: "React Development",
    description: `I'm a full-stack developer with 5+ years of experience building modern web applications.

I specialize in React, Next.js, and TypeScript, and I'll create a fast, responsive, and SEO-optimized website tailored to your needs.

**What You'll Get:**
• Clean, maintainable code
• Responsive design for all devices
• SEO optimization
• Fast loading times
• Modern UI/UX
• Free deployment assistance

**Technologies I Use:**
• React & Next.js 15
• TypeScript
• Tailwind CSS
• Supabase / Firebase
• Vercel deployment

I work with startups, small businesses, and individuals to bring their ideas to life. Let's discuss your project!`,
    
    rating: 4.9,
    reviewCount: 127,
    orders: 342,
    
    seller: {
      id: "seller1",
      username: "johndoe",
      displayName: "John Doe",
      level: "top_rated",
      rating: 4.9,
      totalOrders: 450,
      responseTime: 2,
      description: "Full-stack developer specializing in React and Next.js",
      memberSince: "2022-01",
    },

    packages: [
      {
        id: "pkg1",
        tier: "basic",
        name: "Basic Website",
        description: "Perfect for landing pages and small sites",
        price: 50,
        deliveryDays: 5,
        revisions: 2,
        features: [
          "1-3 pages",
          "Responsive design",
          "Basic SEO",
          "Contact form",
          "Deployment included",
        ],
      },
      {
        id: "pkg2",
        tier: "standard",
        name: "Professional Website",
        description: "Most popular for growing businesses",
        price: 150,
        deliveryDays: 7,
        revisions: 3,
        features: [
          "5-10 pages",
          "Custom design",
          "Advanced SEO",
          "Contact + Blog",
          "CMS integration",
          "Deployment + training",
        ],
      },
      {
        id: "pkg3",
        tier: "premium",
        name: "Enterprise Solution",
        description: "Complete solution with all features",
        price: 300,
        deliveryDays: 14,
        revisions: null, // unlimited
        features: [
          "Unlimited pages",
          "Custom design + animations",
          "Advanced SEO + Analytics",
          "Full CMS",
          "E-commerce ready",
          "API integration",
          "Priority support",
          "3 months maintenance",
        ],
      },
    ],

    faq: [
      {
        question: "Do you provide source code?",
        answer: "Yes, you'll receive the complete source code with deployment instructions.",
      },
      {
        question: "Can you help with hosting?",
        answer: "Absolutely! I'll deploy your site to Vercel (free) and provide setup instructions.",
      },
      {
        question: "What if I need changes after delivery?",
        answer: "I include revisions in all packages, and I'm happy to discuss ongoing support.",
      },
    ],

    reviews: [
      {
        id: "r1",
        rating: 5,
        reviewText: "Outstanding work! Delivered exactly what I needed and more. Highly recommended!",
        reviewer: "Sarah M.",
        createdAt: "2025-01-15",
      },
      {
        id: "r2",
        rating: 5,
        reviewText: "Very professional, fast communication, and great code quality. Will hire again!",
        reviewer: "Mike T.",
        createdAt: "2025-01-10",
      },
    ],
  };
}

export default async function GigDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gig = await getGig(slug);

  if (!gig) {
    notFound();
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">{gig.category}</Badge>
            {gig.subcategory && <Badge variant="outline">{gig.subcategory}</Badge>}
          </div>
          <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>
          <div className="flex items-center gap-4">
            <Link href={`/seller/${gig.seller.username}`}>
              <div className="flex items-center gap-2 hover:opacity-80">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                  {gig.seller.displayName[0]}
                </div>
                <div>
                  <p className="font-medium">{gig.seller.displayName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{gig.seller.rating}</span>
                    {gig.seller.level === "top_rated" && (
                      <Badge variant="secondary" className="text-xs">TOP RATED</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            <div className="text-sm text-muted-foreground">
              {gig.orders} orders • {gig.reviewCount} reviews
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <img
            src="https://via.placeholder.com/800x450?text=Gig+Preview"
            alt={gig.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">
              Reviews ({gig.reviewCount})
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-1">About Seller</TabsTrigger>
            <TabsTrigger value="faq" className="flex-1">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-4">
            <Card>
              <CardContent className="pt-6 prose prose-sm max-w-none">
                {gig.description.split('\n\n').map((para, i) => (
                  <p key={i} className="whitespace-pre-wrap">{para}</p>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {gig.reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-semibold text-sm">
                        {review.reviewer[0]}
                      </div>
                      <div>
                        <p className="font-medium">{review.reviewer}</p>
                        <p className="text-xs text-muted-foreground">{review.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{review.reviewText}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                    {gig.seller.displayName[0]}
                  </div>
                  <div>
                    <CardTitle>{gig.seller.displayName}</CardTitle>
                    <CardDescription>@{gig.seller.username}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{gig.seller.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Member since</p>
                    <p className="font-medium">{gig.seller.memberSince}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total orders</p>
                    <p className="font-medium">{gig.seller.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg. response time</p>
                    <p className="font-medium">{gig.seller.responseTime} hours</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <p className="font-medium">{gig.seller.rating} ⭐</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            {gig.faq.map((item, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-base">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar - Packages */}
      <div className="space-y-4">
        <div className="sticky top-4 space-y-4">
          {gig.packages.map((pkg) => (
            <Card key={pkg.id} className={pkg.tier === "standard" ? "border-primary" : ""}>
              <CardHeader>
                {pkg.tier === "standard" && (
                  <Badge className="w-fit mb-2">MOST POPULAR</Badge>
                )}
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{pkg.deliveryDays} day delivery</span>
                </div>

                <div className="space-y-2">
                  {pkg.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground">
                  {pkg.revisions ? `${pkg.revisions} revisions` : "Unlimited revisions"}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Link href={`/orders/create?gigId=${gig.id}&package=${pkg.tier}`} className="w-full">
                  <Button className="w-full" size="lg">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

