"use client";

import { useState } from "react";
import GoogleMapSimple from "../components/google-maps/GoogleMapApiKey";
import type { LocationData } from "../components/google-maps/types";

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
  const [address, setAddress] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [deliveryNote, setDeliveryNote] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleSave = (data: LocationData) => {
    setAddress(data.address);
    setLandmark(data.landmark);
    setDeliveryNote(data.deliveryNote);
    setCoordinates(data.coordinates);
    alert(`تم حفظ البيانات في الصفحة الأب:\n${JSON.stringify({
      address: data.address,
      landmark: data.landmark,
      deliveryNote: data.deliveryNote,
      coordinates: data.coordinates,
    }, null, 2)}`);
  };

  return (
    <div className="min-h-screen bg-background">

      <GoogleMapSimple
        className="w-full"
        apiKey={apiKey}
        clientAddress={address}
        clientLandmark={landmark}
        clientDeliveryNote={deliveryNote}
        clientLocation={coordinates as any}
        onSave={handleSave}
      />
    </div>
  );
}
