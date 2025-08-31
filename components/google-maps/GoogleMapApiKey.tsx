"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface GoogleMapProps {
  className?: string;
  clientName?: string;
}

declare global {
  interface Window {
    google?: typeof google;
    initMap?: () => void;
  }
}

export default function GoogleMapSimple({ className = "w-full h-96", clientName = "DreamToApp" }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number; accuracy?: number } | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<google.maps.Marker | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const initializeMap = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!mapRef.current) {
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      return;
    }

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      zoomControl: false, // Disabled native zoom controls
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: window.google.maps.ControlPosition.TOP_LEFT
      },
      streetViewControl: false, // Disabled street view control
      fullscreenControl: false // Disabled native fullscreen control
    });

    setMapInstance(map);

    // Add click listener for simple markers
    map.addListener('click', async (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {

        // Remove previous selected marker if it exists
        if (selectedMarker) {
          selectedMarker.setMap(null);
        }

        // Create enterprise-grade draggable marker
        const marker = new window.google.maps.Marker({
          position: event.latLng,
          map: map,
          title: `${clientName} - الموقع المحدد`,
          draggable: true,
          label: {
            text: "📍",
            color: "hsl(var(--foreground))",
            fontWeight: "bold",
            fontSize: "14px"
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "hsl(var(--destructive))", // Semantic destructive color
            fillOpacity: 0.9,
            strokeColor: "hsl(var(--background))",
            strokeWeight: 2,
            scale: 14
          },
          zIndex: 999
        });

        // Store initial selected location and marker
        setSelectedLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        setSelectedMarker(marker);

        // Get address for selected location
        const address = await getAddressFromCoordinates(event.latLng.lat(), event.latLng.lng());
        setSelectedAddress(address);

        // Add drag start listener for visual feedback
        marker.addListener('dragstart', () => {
          marker.setIcon({
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "hsl(var(--warning))", // Semantic warning color
            fillOpacity: 0.9,
            strokeColor: "hsl(var(--background))",
            strokeWeight: 2,
            scale: 16
          });
        });

        // Add drag end listener with enhanced feedback
        marker.addListener('dragend', (dragEvent: google.maps.MapMouseEvent) => {
          if (dragEvent.latLng) {
            // Reset to normal state
            marker.setIcon({
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "hsl(var(--destructive))", // Semantic destructive color
              fillOpacity: 0.9,
              strokeColor: "hsl(var(--background))",
              strokeWeight: 2,
              scale: 14
            });

            // Update selected location in real-time
            setSelectedLocation({
              lat: dragEvent.latLng.lat(),
              lng: dragEvent.latLng.lng()
            });
          }
        });

      }
    });

    // Auto-detect user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          setUserLocation(currentLocation);
          map.setCenter(currentLocation);
          map.setZoom(15);

          // Get address for user location
          const address = await getAddressFromCoordinates(currentLocation.lat, currentLocation.lng);
          setUserAddress(address);

          // Add user location marker - enterprise-grade design
          const newUserMarker = new window.google.maps.Marker({
            position: currentLocation,
            map: map,
            title: "موقعك الحالي",
            label: {
              text: "📍",
              color: "hsl(var(--foreground))",
              fontWeight: "bold",
              fontSize: "16px"
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "hsl(var(--primary))", // Semantic primary color
              fillOpacity: 0.9,
              strokeColor: "hsl(var(--background))",
              strokeWeight: 3,
              scale: 16
            },
            zIndex: 1000,
            animation: window.google.maps.Animation.BOUNCE
          });

          // Add pulsing effect for user location
          setTimeout(() => {
            newUserMarker.setAnimation(null);
          }, 2000);

          setUserMarker(newUserMarker);
        },
        (error) => {
          // Geolocation error handled silently
        }
      );
    }
  }, [clientName]);

  // Function to get address from coordinates with Arabic support
  const getAddressFromCoordinates = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const geocoder = new window.google.maps.Geocoder();

      // Try to get Arabic address first
      const arabicResult = await geocoder.geocode({
        location: { lat, lng },
        language: 'ar' // Arabic language
      });

      // Also get English address as fallback
      const englishResult = await geocoder.geocode({
        location: { lat, lng },
        language: 'en' // English language
      });

      // Use Arabic result if available, otherwise fallback to English
      const result = arabicResult.results[0] || englishResult.results[0];

      if (result) {
        const addressComponents = result.address_components;
        const streetNumber = addressComponents.find(comp => comp.types.includes('street_number'))?.long_name || '';
        const route = addressComponents.find(comp => comp.types.includes('route'))?.long_name || '';
        const neighborhood = addressComponents.find(comp => comp.types.includes('neighborhood'))?.long_name || '';
        const sublocality = addressComponents.find(comp => comp.types.includes('sublocality_level_1'))?.long_name || '';
        const locality = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || '';

        // Build readable address
        let address = '';
        if (streetNumber && route) {
          address += `${streetNumber} ${route}`;
        } else if (route) {
          address += route;
        }

        if (neighborhood || sublocality) {
          address += address ? `, ${neighborhood || sublocality}` : (neighborhood || sublocality);
        }

        if (locality) {
          address += address ? `, ${locality}` : locality;
        }

        return address || 'العنوان غير متوفر';
      }
      return 'العنوان غير متوفر';
    } catch (error) {
      return 'العنوان غير متوفر';
    }
  }, []);

  const loadGoogleMapsAPI = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.google && window.google.maps && window.google.maps.Map) {
      initializeMap();
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
    if (!apiKey) {
      setError("مفتاح Google Maps مفقود");
      return;
    }

    window.initMap = () => {
      setTimeout(() => initializeMap(), 100);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      setError("فشل في تحميل Google Maps API");
    };

    document.head.appendChild(script);
  }, [initializeMap]);



  const mapRefCallback = useCallback((node: HTMLDivElement | null) => {
    mapRef.current = node;
    if (node) {
      setTimeout(() => loadGoogleMapsAPI(), 100);
    }
  }, [loadGoogleMapsAPI]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      if (userMarker) {
        userMarker.setMap(null);
      }
      if (selectedMarker) {
        selectedMarker.setMap(null);
      }
    };
  }, [userMarker, selectedMarker]);



  // Recenter function
  const recenterToUserLocation = useCallback(() => {
    if (mapInstance && userLocation) {
      // First, ensure user location is visible and centered
      mapInstance.setCenter(userLocation);
      mapInstance.setZoom(15);

      // Clear selected location when recentering
      if (selectedMarker) {
        selectedMarker.setMap(null);
      }
      setSelectedLocation(null);
      setSelectedMarker(null);
      setSelectedAddress(null);

      // Recreate user marker if it doesn't exist or is not visible
      if (!userMarker || !userMarker.getMap()) {
        const newUserMarker = new window.google.maps.Marker({
          position: userLocation,
          map: mapInstance,
          title: "موقعك الحالي",
          label: {
            text: "📍",
            color: "hsl(var(--foreground))",
            fontWeight: "bold",
            fontSize: "16px"
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "hsl(var(--primary))", // Semantic primary color
            fillOpacity: 0.9,
            strokeColor: "hsl(var(--background))",
            strokeWeight: 3,
            scale: 16
          },
          zIndex: 1000,
          animation: window.google.maps.Animation.BOUNCE
        });

        // Stop animation after 2 seconds
        setTimeout(() => {
          if (newUserMarker) {
            newUserMarker.setAnimation(null);
          }
        }, 2000);

        setUserMarker(newUserMarker);
      } else {
        // Ensure existing marker is visible and animated
        userMarker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => {
          if (userMarker) {
            userMarker.setAnimation(null);
          }
        }, 2000);
      }
    }
  }, [mapInstance, userLocation, selectedMarker, userMarker]);

  if (error) {
    return (
      <Card className={`${className} max-w-4xl mx-auto`}>
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-destructive font-medium">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} max-w-4xl mx-auto arabic-text`}>
      {/* Header Section */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl text-muted-foreground">📍</span>
            </div>
            <div className="text-right">
              <CardTitle className="text-xl">تحديد موقع العميل</CardTitle>
              <CardDescription className="text-sm">
                يرجى تحديد موقع العميل على الخريطة
              </CardDescription>
            </div>
          </div>

          {/* Map Controls - Desktop and Mobile */}
          <div className="flex items-center gap-2">
            {/* Fullscreen Toggle - Utility Action */}
            <Button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  document.documentElement.requestFullscreen();
                }
              }}
              size="icon"
              variant="outline"
              title="ملء الشاشة"
            >
              <span className="text-sm">⛶</span>
            </Button>

            {/* Zoom Controls - Secondary Actions */}
            <div className="flex gap-1">
              <Button
                onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 15) + 1)}
                size="icon"
                variant="outline"
                title="تكبير"
              >
                <span className="text-sm font-bold">+</span>
              </Button>
              <Button
                onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 15) - 1)}
                size="icon"
                variant="outline"
                title="تصغير"
              >
                <span className="text-sm font-bold">−</span>
              </Button>
            </div>

            {/* Recenter Button - Primary Action */}
            {userLocation && (
              <Button
                onClick={recenterToUserLocation}
                size="icon"
                variant="default"
                title="العودة إلى موقعك"
              >
                <span className="text-lg">🎯</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content Section */}
      <CardContent className="p-0">
        {/* Map Container */}
        <div className="relative px-4">
          <div
            ref={mapRefCallback}
            className="w-full h-64 sm:h-80 lg:h-96 rounded-lg border border-border shadow-inner bg-muted"
            style={{ minHeight: '256px' }}
          />
        </div>
      </CardContent>

      {/* Footer Section */}
      <div className="px-4 py-4 border-t border-border bg-muted/30">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
          {/* Left Side - Current Location */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-muted-foreground text-sm">📍</span>
            </div>
            <div className="text-right min-w-0">
              {userLocation ? (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">الموقع الحالي:</div>
                  <div className="text-xs text-muted-foreground font-mono break-all">
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </div>
                  {userAddress && (
                    <div className="text-xs text-muted-foreground font-medium truncate">
                      📍 {userAddress}
                    </div>
                  )}
                  {userLocation.accuracy && (
                    <div className="text-xs text-muted-foreground font-mono">
                      ±{userLocation.accuracy.toFixed(1)}م دقة
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <span className="animate-pulse">📍 جاري تحديد موقعك...</span>
                </div>
              )}
            </div>
          </div>

          {/* Center - Location Status */}
          <div className="flex flex-col items-center text-center space-y-2">
            {selectedLocation ? (
              <>
                <div className="text-sm font-medium text-muted-foreground">الموقع المحدد:</div>
                <div className="text-xs text-primary font-mono break-all">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </div>
                {selectedAddress && (
                  <div className="text-xs text-primary font-medium max-w-full truncate">
                    📍 {selectedAddress}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-sm font-medium text-muted-foreground">📍 في الموقع الحالي</div>
                <Badge variant="secondary" className="text-xs">
                  تم الكشف تلقائياً
                </Badge>
              </>
            )}
          </div>

          {/* Right Side - Empty for balance */}
          <div className="hidden sm:block">
            {/* Space reserved for future controls if needed */}
          </div>
        </div>
      </div>
    </Card>
  );
}

