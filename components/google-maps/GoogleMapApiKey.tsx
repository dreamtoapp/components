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

          // Set default selected location to be the same as user location
          setSelectedLocation(currentLocation);
          setSelectedAddress(address);

          // Create selected location marker at user location
          const selectedMarker = new window.google.maps.Marker({
            position: currentLocation,
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

          // Add drag start listener for visual feedback
          selectedMarker.addListener('dragstart', () => {
            selectedMarker.setIcon({
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "hsl(var(--warning))", // Semantic warning color
              fillOpacity: 0.9,
              strokeColor: "hsl(var(--background))",
              strokeWeight: 2,
              scale: 16
            });
          });

          // Add drag end listener with enhanced feedback
          selectedMarker.addListener('dragend', (dragEvent: google.maps.MapMouseEvent) => {
            if (dragEvent.latLng) {
              // Reset to normal state
              selectedMarker.setIcon({
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

              // Get new address for dragged location
              getAddressFromCoordinates(dragEvent.latLng.lat(), dragEvent.latLng.lng()).then(newAddress => {
                setSelectedAddress(newAddress);
              });
            }
          });

          setSelectedMarker(selectedMarker);
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
    <Card className={`${className} arabic-text`}>
      {/* Header Section */}
      <CardHeader className="pb-6">
        <div className="space-y-4">
          {/* Main Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl text-primary">📍</span>
              </div>
              <div className="text-right">
                <CardTitle className="text-2xl font-bold text-foreground">تحديد موقع العميل</CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-1">
                  يرجى تحديد موقع العميل على الخريطة
                </CardDescription>
              </div>
            </div>

            {/* Map Controls */}
            <div className="flex items-center gap-2">
              {/* Fullscreen Toggle */}
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
                className="h-10 w-10"
              >
                <span className="text-base">⛶</span>
              </Button>

              {/* Zoom Controls */}
              <div className="flex gap-1">
                <Button
                  onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 15) + 1)}
                  size="icon"
                  variant="outline"
                  title="تكبير"
                  className="h-10 w-10"
                >
                  <span className="text-base font-bold">+</span>
                </Button>
                <Button
                  onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 15) - 1)}
                  size="icon"
                  variant="outline"
                  title="تصغير"
                  className="h-10 w-10"
                >
                  <span className="text-base font-bold">−</span>
                </Button>
              </div>

              {/* Recenter Button */}
              {userLocation && (
                <Button
                  onClick={recenterToUserLocation}
                  size="icon"
                  variant="default"
                  title="العودة إلى موقعك"
                  className="h-10 w-10"
                >
                  <span className="text-xl">🎯</span>
                </Button>
              )}
            </div>
          </div>

          {/* Action Hint */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
              <span className="text-base">💡</span>
              <span>يمكنك سحب العلامة لتعديل الموقع بدقة</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Content Section */}
      <CardContent className="p-0">
        {/* Map Container */}
        <div className="px-6 pb-6">
          <div
            ref={mapRefCallback}
            className="w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl border border-border shadow-lg bg-muted/30"
            style={{ minHeight: '400px' }}
          />
        </div>
      </CardContent>

      {/* Footer Section */}
      <div className="px-6 py-8 border-t border-border bg-muted/10">
        <div className="space-y-6">
          {/* Status Header */}
          <div className="flex items-center justify-center">
            {selectedLocation ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-destructive rounded-full animate-pulse"></div>
                <span className="text-base font-semibold text-foreground">الموقع المحدد</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                <span className="text-base font-semibold text-foreground">في الموقع الحالي</span>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  تم الكشف تلقائياً
                </Badge>
              </div>
            )}
          </div>

          {/* Location Information Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Current Location Card */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xl">📍</span>
                </div>
                <div className="text-right min-w-0 flex-1">
                  <h4 className="text-base font-semibold text-foreground mb-3">الموقع الحالي</h4>
                  {userLocation ? (
                    <div className="space-y-3">
                      <div className="bg-muted/50 rounded-lg px-4 py-3">
                        <div className="text-sm text-muted-foreground mb-2">الإحداثيات</div>
                        <div className="text-sm font-mono text-foreground break-all">
                          {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                        </div>
                      </div>
                      {userAddress && (
                        <div className="bg-muted/50 rounded-lg px-4 py-3">
                          <div className="text-sm text-muted-foreground mb-2">العنوان</div>
                          <div className="text-sm text-foreground truncate">
                            📍 {userAddress}
                          </div>
                        </div>
                      )}
                      {userLocation.accuracy && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>دقة: ±{userLocation.accuracy.toFixed(1)}م</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span>جاري تحديد موقعك...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Location Card */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-destructive text-xl">📍</span>
                </div>
                <div className="text-right min-w-0 flex-1">
                  <h4 className="text-base font-semibold text-foreground mb-3">الموقع المحدد</h4>
                  {selectedLocation ? (
                    <div className="space-y-3">
                      <div className="bg-muted/50 rounded-lg px-4 py-3">
                        <div className="text-sm text-muted-foreground mb-2">الإحداثيات</div>
                        <div className="text-sm font-mono text-primary break-all">
                          {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </div>
                      </div>
                      {selectedAddress && (
                        <div className="bg-muted/50 rounded-lg px-4 py-3">
                          <div className="text-sm text-muted-foreground mb-2">العنوان</div>
                          <div className="text-sm text-primary truncate">
                            📍 {selectedAddress}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-3 h-3 bg-destructive rounded-full"></div>
                        <span>تم التحديد يدوياً</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      انقر على الخريطة لتحديد موقع العميل
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </Card>
  );
}

