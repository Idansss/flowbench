import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Check your email</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            A sign-in link has been sent to your email address.
          </p>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to complete sign-in. The link expires in 24 hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

