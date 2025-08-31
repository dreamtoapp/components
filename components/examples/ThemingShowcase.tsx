"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/theme-toggle";

export default function ThemingShowcase() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">shadcn/ui Theming Showcase</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Demonstrating CSS variables and theme switching capabilities
        </p>

        {/* Theme Toggle */}
        <div className="flex justify-center mb-8">
          <ModeToggle />
        </div>
      </div>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>
            All colors automatically adapt to light/dark mode using CSS variables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Background Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Background Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="h-16 bg-background border rounded-lg flex items-center justify-center">
                  <span className="text-foreground font-medium">Background</span>
                </div>
                <p className="text-sm text-muted-foreground">bg-background</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-card border rounded-lg flex items-center justify-center">
                  <span className="text-card-foreground font-medium">Card</span>
                </div>
                <p className="text-sm text-muted-foreground">bg-card</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-popover border rounded-lg flex items-center justify-center">
                  <span className="text-popover-foreground font-medium">Popover</span>
                </div>
                <p className="text-sm text-muted-foreground">bg-popover</p>
              </div>
            </div>
          </div>

          {/* Primary Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Primary Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-16 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-medium">Primary</span>
                </div>
                <p className="text-sm text-muted-foreground">bg-primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-secondary rounded-lg flex items-center justify-center">
                  <span className="text-secondary-foreground font-medium">Secondary</span>
                </div>
                <p className="text-sm text-muted-foreground">bg-secondary</p>
              </div>
            </div>
          </div>

          {/* Accent & Muted */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Accent & Muted</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-16 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-accent-foreground font-medium">Accent</span>
                </div>
                <p className="text-sm text-muted-foreground">bg-accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground font-medium">Muted</span>
                </div>
                <p className="text-sm text-muted-foreground">bg-muted</p>
              </div>
            </div>
          </div>

          {/* Destructive */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Destructive</h3>
            <div className="space-y-2">
              <div className="h-16 bg-destructive rounded-lg flex items-center justify-center">
                <span className="text-destructive-foreground font-medium">Destructive</span>
              </div>
              <p className="text-sm text-muted-foreground">bg-destructive</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Component Theming</CardTitle>
          <CardDescription>
            Components automatically use theme colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          {/* Progress */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Progress</h3>
            <div className="space-y-2">
              <Progress value={33} />
              <Progress value={66} />
              <Progress value={100} />
            </div>
          </div>

          {/* Input */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Input</h3>
            <div className="space-y-2">
              <Input placeholder="Default input" />
              <Input placeholder="Disabled input" disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSS Variables Display */}
      <Card>
        <CardHeader>
          <CardTitle>CSS Variables</CardTitle>
          <CardDescription>
            Current theme CSS variables (OKLCH color format)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-mono bg-muted p-2 rounded">
                <div>--background: {getComputedStyle(document.documentElement).getPropertyValue('--background')}</div>
                <div>--foreground: {getComputedStyle(document.documentElement).getPropertyValue('--foreground')}</div>
                <div>--primary: {getComputedStyle(document.documentElement).getPropertyValue('--primary')}</div>
                <div>--primary-foreground: {getComputedStyle(document.documentElement).getPropertyValue('--primary-foreground')}</div>
                <div>--secondary: {getComputedStyle(document.documentElement).getPropertyValue('--secondary')}</div>
                <div>--secondary-foreground: {getComputedStyle(document.documentElement).getPropertyValue('--secondary-foreground')}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-mono bg-muted p-2 rounded">
                <div>--accent: {getComputedStyle(document.documentElement).getPropertyValue('--accent')}</div>
                <div>--accent-foreground: {getComputedStyle(document.documentElement).getPropertyValue('--accent-foreground')}</div>
                <div>--muted: {getComputedStyle(document.documentElement).getPropertyValue('--muted')}</div>
                <div>--muted-foreground: {getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground')}</div>
                <div>--destructive: {getComputedStyle(document.documentElement).getPropertyValue('--destructive')}</div>
                <div>--border: {getComputedStyle(document.documentElement).getPropertyValue('--border')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Information */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Configuration</CardTitle>
          <CardDescription>
            How theming is configured in this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">components.json</h3>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div>"cssVariables": true</div>
              <div>"baseColor": "neutral"</div>
              <div>"style": "new-york"</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Features</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>✅ CSS Variables enabled</li>
              <li>✅ OKLCH color format for better color space</li>
              <li>✅ Dark mode support</li>
              <li>✅ System theme detection</li>
              <li>✅ Smooth theme transitions</li>
              <li>✅ All components automatically themed</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Usage</h3>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div>// In your components:</div>
              <div>&lt;div className="bg-background text-foreground"&gt;</div>
              <div>&lt;Button className="bg-primary text-primary-foreground"&gt;</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
