import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your email to receive a magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="post" action="/api/auth/signin/email" className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send Magic Link
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Or continue as</p>
            <Link href="/" className="text-primary hover:underline">
              Anonymous User
            </Link>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground">
            <p>
              ✓ No password required
              <br />
              ✓ Save your job history
              <br />
              ✓ Create custom presets
              <br />✓ Extended file retention (7 days)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

