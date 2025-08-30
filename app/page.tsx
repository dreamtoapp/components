"use client";

import { useState } from "react";
import GoogleMapSimple from "../components/GoogleMapSimple";
import GoogleMapReact from "../components/GoogleMapReact";

export default function Home() {
  const [activeComponent, setActiveComponent] = useState<'loader' | 'react'>('loader');

  console.log("🏠 Home component loaded, activeComponent:", activeComponent);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Small Toggle Icon */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setActiveComponent(activeComponent === 'loader' ? 'react' : 'loader')}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200"
            title={activeComponent === 'loader' ? 'Switch to React' : 'Switch to Loader'}
          >
            {activeComponent === 'loader' ? '⚛️' : '📦'}
          </button>
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
