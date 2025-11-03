import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Star, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { name: "Web Development", icon: "💻", count: 1250 },
  { name: "Design & Creative", icon: "🎨", count: 980 },
  { name: "Writing & Translation", icon: "✍️", count: 750 },
  { name: "Video & Animation", icon: "🎬", count: 620 },
  { name: "Digital Marketing", icon: "📱", count: 890 },
  { name: "AI Services", icon: "🤖", count: 340 },
  { name: "Programming & Tech", icon: "⚙️", count: 1100 },
  { name: "Business", icon: "💼", count: 540 },
];

async function getGigs(category?: string, search?: string) {
  // TODO: Implement with real data
  return [
    {
      id: "1",
      slug: "professional-website-development",
      title: "I will create a professional website with React and Next.js",
      category: "Web Development",
      price: 50,
      deliveryDays: 5,
      rating: 4.9,
      reviewCount: 127,
      seller: {
        username: "johndoe",
        displayName: "John Doe",
        level: "top_rated",
      },
      imageUrl: "https://via.placeholder.com/400x300?text=Web+Development",
    },
    {
      id: "2",
      slug: "logo-design-branding",
      title: "I will design a modern logo and complete brand identity",
      category: "Design & Creative",
      price: 75,
      deliveryDays: 3,
      rating: 5.0,
      reviewCount: 89,
      seller: {
        username: "designpro",
        displayName: "Design Pro",
        level: "pro",
      },
      imageUrl: "https://via.placeholder.com/400x300?text=Logo+Design",
    },
    {
      id: "3",
      slug: "ai-chatbot-development",
      title: "I will build an AI chatbot with GPT-4 integration",
      category: "AI Services",
      price: 150,
      deliveryDays: 7,
      rating: 4.8,
      reviewCount: 45,
      seller: {
        username: "aiexpert",
        displayName: "AI Expert",
        level: "certified",
      },
      imageUrl: "https://via.placeholder.com/400x300?text=AI+Chatbot",
    },
  ];
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const gigs = await getGigs(params.category, params.search);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 py-12 bg-gradient-to-b from-primary/5 to-transparent rounded-lg">
        <h1 className="text-5xl font-bold">Find the perfect freelance service</h1>
        <p className="text-xl text-muted-foreground">
          Browse thousands of services from talented sellers
        </p>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <form action="/marketplace" method="get" className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search for any service..."
                className="pl-10 h-12 text-lg"
                defaultValue={params.search}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8">
              Search
            </Button>
          </form>
        </div>

        {/* AI Assistant CTA */}
        <div className="pt-4">
          <Link href="/ai">
            <Button variant="outline" size="lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Not sure what you need? Ask Idansss AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/marketplace?category=${encodeURIComponent(cat.name)}`}
            >
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <h3 className="font-semibold mb-1">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cat.count.toLocaleString()} services
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Filters and Results */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {params.category ? `${params.category} Services` : "Featured Services"}
          </h2>
          <div className="flex gap-2">
            <select className="px-3 py-2 text-sm rounded-md border border-input bg-background">
              <option>Recommended</option>
              <option>Best Selling</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Gig Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <Link key={gig.id} href={`/gigs/${gig.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video relative bg-muted rounded-t-lg overflow-hidden">
                  <img
                    src={gig.imageUrl}
                    alt={gig.title}
                    className="w-full h-full object-cover"
                  />
                  {gig.seller.level === "pro" && (
                    <Badge className="absolute top-2 right-2 bg-purple-600">PRO</Badge>
                  )}
                  {gig.seller.level === "certified" && (
                    <Badge className="absolute top-2 right-2 bg-blue-600">CERTIFIED</Badge>
                  )}
                  {gig.seller.level === "top_rated" && (
                    <Badge className="absolute top-2 right-2 bg-amber-600">TOP RATED</Badge>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {gig.seller.displayName[0]}
                    </div>
                    <span className="text-sm font-medium">{gig.seller.displayName}</span>
                  </div>
                  <CardTitle className="line-clamp-2 text-base">{gig.title}</CardTitle>
                </CardHeader>

                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-sm">{gig.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({gig.reviewCount})
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Starting at</span>
                    <p className="font-bold text-lg">${gig.price}</p>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Services
          </Button>
        </div>
      </div>

      {/* Become a Seller CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-12 text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold mb-2">Ready to Start Selling?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Join thousands of freelancers earning on Flowbench
          </p>
          <Link href="/become-seller">
            <Button size="lg">Become a Seller</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

