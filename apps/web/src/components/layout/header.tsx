"use client";

import Link from "next/link";
import { Menu, X, FileCode, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <FileCode className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Flowbench</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Tools
            </Link>
            <Link
              href="/marketplace"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/ai"
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              Idansss AI
            </Link>
            <Link
              href="/become-seller"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Become a Seller
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Settings
            </Link>
            <Button asChild variant="default" size="sm">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-3 border-t">
            <Link
              href="/"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tools
            </Link>
            <Link
              href="/marketplace"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              href="/ai"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles className="w-4 h-4" />
              Idansss AI
            </Link>
            <Link
              href="/become-seller"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Become a Seller
            </Link>
            <Link
              href="/settings"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
            <Button asChild className="w-full">
              <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}

