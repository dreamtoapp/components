"use client";

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

interface LocationData {
  lat: number;
  lng: number;
}

interface GoogleMapReactProps {
  className?: string;
}

const defaultCenter: LocationData = { lat: 20, lng: 0 };

// Move libraries outside component to prevent reloading warning
const libraries: ("places")[] = ['places'];

export default function GoogleMapReact({ className = "w-full h-96" }: GoogleMapReactProps) {
  console.log("⚛️ GoogleMapReact component initialized");

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || "",
    libraries,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    console.log("⚛️ React Map loaded:", map);

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          map.panTo(location);
          map.setZoom(15);
          console.log("⚛️ React Map: User location found:", location);
        },
        (error) => {
          console.error("⚛️ React Map: Geolocation error:", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    console.log("⚛️ React Map unmounted");
  }, []);

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const clickedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setSelectedLocation(clickedLocation);
      console.log("⚛️ React Map: Location selected:", clickedLocation);
    }
  }, []);

  if (loadError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 border border-red-200 rounded-lg`}>
        <p className="text-red-600">Error loading React Google Map: {loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg`}>
        <div className="text-gray-600">Loading React Google Map...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={userLocation || defaultCenter}
        zoom={userLocation ? 15 : 2}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
          mapTypeId: 'roadmap',
        }}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            title="Your Current Location"
            icon={{
              url: "data:image/svg+xml;charset=UTF-8,%3csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='12' cy='12' r='8' fill='%234285F4'/%3e%3ccircle cx='12' cy='12' r='3' fill='white'/%3e%3c/svg%3e",
              scaledSize: new google.maps.Size(24, 24),
              anchor: new google.maps.Point(12, 12)
            }}
          />
        )}

        {/* Selected Location Marker */}
        {selectedLocation && (
          <Marker
            position={selectedLocation}
            title="Selected Location"
          />
        )}
      </GoogleMap>

      {/* Info Display */}
      {selectedLocation && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg text-sm">
          <div className="font-semibold">Selected Location:</div>
          <div>Lat: {selectedLocation.lat.toFixed(6)}</div>
          <div>Lng: {selectedLocation.lng.toFixed(6)}</div>
        </div>
      )}
    </div>
  );
}
