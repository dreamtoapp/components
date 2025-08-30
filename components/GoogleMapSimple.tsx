"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';

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
  console.log("📦 GoogleMapSimple component render");

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
    console.log("📦 initializeMap called");

    if (typeof window === 'undefined') {
      console.log("📦 Server-side, skipping");
      return;
    }

    if (!mapRef.current) {
      console.log("📦 Map ref not ready");
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      console.log("📦 Google Maps API not ready");
      return;
    }

    console.log("📦 Creating map...");

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

    console.log("📦 Map created successfully!");
    setMapInstance(map);

    // Add click listener for simple markers
    map.addListener('click', async (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        console.log("🖱️ Map clicked:", { lat: event.latLng.lat(), lng: event.latLng.lng() });

        // Remove previous selected marker if it exists
        if (selectedMarker) {
          selectedMarker.setMap(null);
          console.log('📍 Previous selected marker removed');
        }

        // Create enterprise-grade draggable marker
        const marker = new window.google.maps.Marker({
          position: event.latLng,
          map: map,
          title: `${clientName} - الموقع المحدد`,
          draggable: true,
          label: {
            text: "📍",
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: "14px"
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#EA4335", // Google Red
            fillOpacity: 0.9,
            strokeColor: "#FFFFFF",
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
            fillColor: "#FFC107", // Google Yellow - dragging state
            fillOpacity: 0.9,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
            scale: 16
          });
          console.log('📍 Marker dragging started');
        });

        // Add drag end listener with enhanced feedback
        marker.addListener('dragend', (dragEvent: google.maps.MapMouseEvent) => {
          if (dragEvent.latLng) {
            // Reset to normal state
            marker.setIcon({
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#EA4335", // Google Red
              fillOpacity: 0.9,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
              scale: 14
            });

            // Update selected location in real-time
            setSelectedLocation({
              lat: dragEvent.latLng.lat(),
              lng: dragEvent.latLng.lng()
            });

            console.log('📍 Marker dragged to:', {
              lat: dragEvent.latLng.lat(),
              lng: dragEvent.latLng.lng()
            });
          }
        });

        console.log('📍 Draggable marker created');
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
              color: "#FFFFFF",
              fontWeight: "bold",
              fontSize: "16px"
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#4285F4", // Google Blue
              fillOpacity: 0.9,
              strokeColor: "#FFFFFF",
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
          console.log("📍 User location marker added at:", currentLocation);
          console.log("📍 Marker object:", newUserMarker);

          console.log("📍 User location marker added");
        },
        (error) => {
          console.log("📍 Geolocation error:", error.message);
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
      console.log('📍 Geocoding error:', error);
      return 'العنوان غير متوفر';
    }
  }, []);

  const loadGoogleMapsAPI = useCallback(() => {
    console.log("📦 Loading Google Maps API...");

    if (typeof window === 'undefined') {
      return;
    }

    if (window.google && window.google.maps && window.google.maps.Map) {
      console.log("📦 API already loaded");
      initializeMap();
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log("📦 Script already loading");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
    if (!apiKey) {
      setError("مفتاح Google Maps مفقود");
      return;
    }

    window.initMap = () => {
      console.log("📦 API loaded via callback");
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
    console.log("📦 Script added");
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
        console.log("📍 User marker cleaned up");
      }
      if (selectedMarker) {
        selectedMarker.setMap(null);
        console.log("📍 Selected marker cleaned up");
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
        console.log('📍 Selected marker removed on recenter');
      }
      setSelectedLocation(null);
      setSelectedMarker(null);
      setSelectedAddress(null);

      // Recreate user marker if it doesn't exist or is not visible
      if (!userMarker || !userMarker.getMap()) {
        console.log('📍 Recreating user marker on recenter');
        const newUserMarker = new window.google.maps.Marker({
          position: userLocation,
          map: mapInstance,
          title: "موقعك الحالي",
          label: {
            text: "📍",
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: "16px"
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#4285F4", // Google Blue
            fillOpacity: 0.9,
            strokeColor: "#FFFFFF",
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
        console.log('📍 User marker recreated and added to map');
      } else {
        // Ensure existing marker is visible and animated
        userMarker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => {
          if (userMarker) {
            userMarker.setAnimation(null);
          }
        }, 2000);
      }

      console.log("🎯 Recentered to user location and cleared selected location");
    }
  }, [mapInstance, userLocation, selectedMarker, userMarker]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 border border-red-200 rounded-lg`}>
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-4xl mx-auto`} dir="rtl">
      {/* Card Header */}
      <div className="bg-transparent px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xl sm:text-2xl text-gray-600">📍</span>
            </div>
            <div className="text-right">
              <h3 className="text-gray-800 font-bold text-lg sm:text-xl">محدد الموقع</h3>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">في حال موقعك غير محدد بدقة انقر على الخريطة لتحديد موقعك بدقة</p>
            </div>
          </div>

          {/* Mobile Controls - Only visible on mobile */}
          <div className="flex items-center gap-1 sm:hidden">
            {/* Recenter Button - Primary Action */}
            {userLocation && (
              <button
                onClick={recenterToUserLocation}
                className="w-8 h-8 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110"
                title="العودة إلى موقعك"
              >
                <span className="text-lg">🎯</span>
              </button>
            )}

            {/* Zoom Controls */}
            <div className="flex gap-1">
              <button
                onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 15) + 1)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-all duration-200 flex items-center justify-center hover:shadow-md"
                title="تكبير"
              >
                <span className="text-sm font-bold">+</span>
              </button>
              <button
                onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 15) - 1)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-all duration-200 flex items-center justify-center hover:shadow-md"
                title="تصغير"
              >
                <span className="text-sm font-bold">−</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative p-2 sm:p-4">
        <div
          ref={mapRefCallback}
          className="w-full h-64 sm:h-80 lg:h-96 rounded-lg border border-gray-300 shadow-inner"
          style={{ minHeight: '256px' }}
        />


      </div>

      {/* Card Footer */}
      <div className="bg-transparent px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          {/* Right Side - Controls - Desktop Only */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Fullscreen Toggle - Utility Action */}
            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  document.documentElement.requestFullscreen();
                }
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-all duration-200 flex items-center justify-center hover:shadow-md"
              title="ملء الشاشة"
            >
              <span className="text-sm sm:text-lg">⛶</span>
            </button>

            {/* Zoom Controls - Secondary Actions */}
            <div className="flex gap-1">
              <button
                onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 15) + 1)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-all duration-200 flex items-center justify-center hover:shadow-md"
                title="تكبير"
              >
                <span className="text-sm sm:text-lg font-bold">+</span>
              </button>
              <button
                onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 15) - 1)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-all duration-200 flex items-center justify-center hover:shadow-md"
                title="تصغير"
              >
                <span className="text-sm sm:text-lg font-bold">−</span>
              </button>
            </div>

            {/* Recenter Button - Primary Action */}
            {userLocation && (
              <button
                onClick={recenterToUserLocation}
                className="w-8 h-8 sm:w-10 sm:h-10 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110"
                title="العودة إلى موقعك"
              >
                <span className="text-lg sm:text-xl">🎯</span>
              </button>
            )}
          </div>

          {/* Center - Location Status */}
          <div className="flex flex-col items-center text-center">
            {selectedLocation ? (
              <>
                <span className="text-gray-700 font-medium text-xs">الموقع المحدد:</span>
                <div className="text-xs text-blue-600 font-mono break-all">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </div>
                {selectedAddress && (
                  <div className="text-xs text-blue-500 font-medium">
                    📍 {selectedAddress}
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="text-gray-700 font-medium text-xs">📍 في الموقع الحالي</span>
                <div className="text-xs text-green-600 font-medium">
                  تم الكشف تلقائياً
                </div>
              </>
            )}
          </div>

          {/* Left Side - Current Location */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-xs sm:text-sm">📍</span>
            </div>
            <div className="text-right">
              {userLocation ? (
                <div className="text-xs sm:text-sm">
                  <span className="text-gray-700 font-medium">الموقع الحالي:</span>
                  <div className="text-xs text-gray-500 font-mono break-all">
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </div>
                  {userAddress && (
                    <div className="text-xs text-gray-600 font-medium">
                      📍 {userAddress}
                    </div>
                  )}
                  {userLocation.accuracy && (
                    <div className="text-xs text-gray-400 font-mono">
                      ±{userLocation.accuracy.toFixed(1)}م دقة
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-gray-500">
                  <span className="animate-pulse">📍 جاري تحديد موقعك...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
