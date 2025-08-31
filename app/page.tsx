"use client";

import { useState } from "react";
import GoogleMapSimple from "../components/google-maps/GoogleMapApiKey";
import GoogleMapReact from "../components/google-maps/GoogleMapReact";

export default function Home() {
  const [activeComponent, setActiveComponent] = useState<'loader' | 'react'>('loader');

  return (
    <div className="min-h-screen bg-background">

      <GoogleMapSimple className="w-full" />


    </div>
  );
}
