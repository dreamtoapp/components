"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 arabic-text">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Brand */}


        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            لGoogle Maps
          </Link>
          <Link href="/whatsapp" className="text-sm font-medium transition-colors hover:text-primary">
            whatsapp
          </Link>
          <Link href="/email" className="text-sm font-medium transition-colors hover:text-primary">
            Email
          </Link>

        </div>

        {/* Right side - Theme Toggle */}
        <div className="flex items-center space-x-4">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
