"use client";

import { useState } from "react";
import GoogleMapSimple from "../components/google-maps/GoogleMapApiKey";
import GoogleMapReact from "../components/google-maps/GoogleMapReact";

export default function Home() {
  const [activeComponent, setActiveComponent] = useState<'loader' | 'react'>('loader');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">DreamToApp</h1>
              <p className="text-lg text-muted-foreground">
                Google Maps integration with shadcn/ui components and dark mode support
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                Current: {activeComponent === 'loader' ? 'JS API Loader' : 'React Google Maps'}
              </div>
              <button
                onClick={() => setActiveComponent(activeComponent === 'loader' ? 'react' : 'loader')}
                className="p-3 rounded-full bg-card border shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                title={activeComponent === 'loader' ? 'Switch to React' : 'Switch to Loader'}
              >
                <span className="text-xl">{activeComponent === 'loader' ? '⚛️' : '📦'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="space-y-8">
          {activeComponent === 'loader' ? (
            <GoogleMapSimple className="w-full" />
          ) : (
            <GoogleMapReact className="w-full" />
          )}
        </main>
      </div>
    </div>
  );
}
