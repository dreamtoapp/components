"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface GoogleMapProps {
  className?: string;
  clientName?: string;
}

interface MapComponentProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  markers?: google.maps.MarkerOptions[];
}

const MapComponent: React.FC<MapComponentProps> = ({ center, zoom, onMapClick, markers = [] }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  React.useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        zoomControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.TOP_LEFT
        },
        streetViewControl: false,
        fullscreenControl: false
      });

      setMap(newMap);

      if (onMapClick) {
        newMap.addListener('click', onMapClick);
      }
    }
  }, [center, zoom, onMapClick, map]);

  React.useEffect(() => {
    if (map && markers.length > 0) {
      markers.forEach(markerOptions => {
        new google.maps.Marker({
          ...markerOptions,
          map
        });
      });
    }
  }, [map, markers]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
};

export default function GoogleMapReact({ className = "w-full h-96", clientName = "DreamToApp" }: GoogleMapProps) {
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number; accuracy?: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [editableAddress, setEditableAddress] = useState<string>("");
  const [markers, setMarkers] = useState<google.maps.MarkerOptions[]>([]);

  const getAddressFromCoordinates = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return "Address not found";
    } catch (error) {
      console.error("Error getting address:", error);
      return "Error getting address";
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by this browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const location = { lat: latitude, lng: longitude, accuracy };

          setUserLocation(location);
          setError(null);

          // Get address for current location
          const address = await getAddressFromCoordinates(latitude, longitude);
          setUserAddress(address);

          // Add user location marker
          const userMarker: google.maps.MarkerOptions = {
            position: location,
            title: `${clientName} - موقعك الحالي`,
            label: {
              text: "📍",
              color: "hsl(var(--foreground))",
              fontWeight: "bold",
              fontSize: "14px"
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "hsl(var(--primary))",
              fillOpacity: 0.9,
              strokeColor: "hsl(var(--background))",
              strokeWeight: 2,
              scale: 12
            },
            zIndex: 1000
          };

          setMarkers(prev => [...prev.filter(m => m.title !== `${clientName} - موقعك الحالي`), userMarker]);
        },
        (error) => {
          setError(`Error getting location: ${error.message}`);
        }
      );
    } catch (error) {
      setError("Failed to get current location");
    }
  }, [clientName, getAddressFromCoordinates]);

  const handleMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const location = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      setSelectedLocation(location);

      // Get address for selected location
      const address = await getAddressFromCoordinates(location.lat, location.lng);
      setSelectedAddress(address);
      setEditableAddress(address);

      // Add selected location marker
      const selectedMarker: google.maps.MarkerOptions = {
        position: location,
        title: `${clientName} - الموقع المحدد`,
        draggable: true,
        label: {
          text: "📍",
          color: "hsl(var(--foreground))",
          fontWeight: "bold",
          fontSize: "14px"
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "hsl(var(--destructive))",
          fillOpacity: 0.9,
          strokeColor: "hsl(var(--background))",
          strokeWeight: 2,
          scale: 14
        },
        zIndex: 999
      };

      setMarkers(prev => [...prev.filter(m => m.title !== `${clientName} - الموقع المحدد`), selectedMarker]);
    }
  }, [clientName, getAddressFromCoordinates]);

  const center = userLocation || selectedLocation || { lat: 20, lng: 0 };
  const zoom = userLocation || selectedLocation ? 15 : 2;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🗺️</span>
          React Google Maps
        </CardTitle>
        <CardDescription>
          Interactive map using React Google Maps wrapper with {clientName} branding
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={getCurrentLocation} variant="outline" size="sm">
            📍 Get My Location
          </Button>

          {userLocation && (
            <Badge variant="secondary" className="text-xs">
              Accuracy: {userLocation.accuracy?.toFixed(0)}m
            </Badge>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Location Info */}
        {(userLocation || selectedLocation) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userLocation && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Current Location</h4>
                <p className="text-xs text-muted-foreground">
                  Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
                </p>
                {userAddress && (
                  <p className="text-xs mt-1">{userAddress}</p>
                )}
              </div>
            )}

            {selectedLocation && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Selected Location</h4>
                <p className="text-xs text-muted-foreground">
                  Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                </p>
                <Input
                  value={editableAddress}
                  onChange={(e) => setEditableAddress(e.target.value)}
                  placeholder="Edit address..."
                  className="mt-2 text-xs"
                />
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Map Container */}
        <div className="relative w-full h-80 rounded-lg overflow-hidden border">
          {typeof window !== 'undefined' && window.google ? (
            <MapComponent
              center={center}
              zoom={zoom}
              onMapClick={handleMapClick}
              markers={markers}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/20">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground text-center">
          Click on the map to place a marker • Drag markers to move them • Use controls to navigate
        </div>
      </CardContent>
    </Card>
  );
}


