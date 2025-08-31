"use client";

import { useState } from "react";
import GoogleMapSimple from "../components/google-maps/GoogleMapApiKey";
import GoogleMapReact from "../components/google-maps/GoogleMapReact";

export default function Home() {
  const [activeComponent, setActiveComponent] = useState<'loader' | 'react'>('loader');

  console.log("🏠 Home component loaded, activeComponent:", activeComponent);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Small Toggle Icon */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">DreamToApp</h1>
          <p className="text-muted-foreground mb-4">
            Google Maps integration with shadcn/ui components and dark mode support
          </p>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Current: {activeComponent === 'loader' ? 'JS API Loader' : 'React Google Maps'}
            </div>
            <button
              onClick={() => setActiveComponent(activeComponent === 'loader' ? 'react' : 'loader')}
              className="p-2 rounded-full bg-card border shadow-md hover:shadow-lg transition-all duration-200"
              title={activeComponent === 'loader' ? 'Switch to React' : 'Switch to Loader'}
            >
              {activeComponent === 'loader' ? '⚛️' : '📦'}
            </button>
          </div>
        </div>

        <main>
          {activeComponent === 'loader' ? (
            <>
              {console.log("🏠 Loading GoogleMapSimple (js-api-loader)")}
              <GoogleMapSimple className="w-full h-[600px] rounded-lg" />
            </>
          ) : (
            <>
              {console.log("🏠 Loading GoogleMapReact (@react-google-maps/api)")}
              <GoogleMapReact className="w-full h-[600px] rounded-lg relative" />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
