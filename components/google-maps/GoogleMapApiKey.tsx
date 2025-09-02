"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { GoogleMapProps, Location, GoogleMapsMap, GoogleMapsMarker, GoogleMapsMapMouseEvent, LocationData, LocationProgress } from './types';
import { useGoogleMaps, useGeocoding, useMarkerCreation, useGeolocation } from './hooks';
import { MapLoadingSkeleton, LocationCardSkeleton } from './skeletons';
import { LocationCard } from './location-card';

// Map Overlay Loader Component
const MapOverlayLoader = ({ progress }: { progress: LocationProgress | null }) => {
  if (!progress?.isSearching) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
      <div className="bg-card rounded-xl p-6 border border-border shadow-lg max-w-sm mx-4">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Spinning loader */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
          </div>

          {/* Progress text */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              جاري تحديد موقعك
            </h3>
            <p className="text-sm text-muted-foreground">
              {progress.message}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(progress.attempts / 3) * 100}%` }}
            ></div>
          </div>

          {/* Accuracy info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>المحاولة {progress.attempts}/3</span>
            <span>•</span>
            <span>الدقة: ±{progress.accuracy.toFixed(1)}م</span>
          </div>

          {/* Tips */}
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <p>💡 تأكد من تفعيل GPS للحصول على أفضل دقة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GoogleMapSimple({
  className = "w-full h-96",
  clientName = "DreamToApp",
  apiKey,
  clientAddress,
  clientLandmark,
  clientDeliveryNote,
  clientLocation,
  onSave
}: GoogleMapProps) {
  // Refs
  const mapRef = useRef<HTMLDivElement>(null);

  // State management
  const [error, setError] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState<GoogleMapsMap | null>(null);

  // Location states
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [userMarker, setUserMarker] = useState<GoogleMapsMarker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<GoogleMapsMarker | null>(null);

  // Address states
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [editableAddress, setEditableAddress] = useState<string>(clientAddress ?? "");

  // Form states
  const [landmark, setLandmark] = useState<string>(clientLandmark ?? "");
  const [deliveryNote, setDeliveryNote] = useState<string>(clientDeliveryNote ?? "");

  // Location progress state
  const [locationProgress, setLocationProgress] = useState<LocationProgress | null>(null);

  // Hooks
  const { getGoogleMaps } = useGoogleMaps();
  const { getAddressFromCoordinates } = useGeocoding();
  const { createUserMarker, createSelectedMarker } = useMarkerCreation();
  const { getUserLocation } = useGeolocation();

  // Map initialization
  const initializeMap = useCallback(() => {
    if (typeof window === 'undefined' || !mapRef.current) {
      return;
    }

    const google = getGoogleMaps();
    if (!google?.maps?.Map) {
      setError("Google Maps API غير متوفر");
      setIsMapLoading(false);
      return;
    }

    try {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        zoomControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.TOP_LEFT
        },
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'cooperative'
      });

      setMapInstance(map);
      setIsMapLoading(false);

      // Add click listener
      map.addListener('click', async (event: GoogleMapsMapMouseEvent) => {
        if (!event.latLng) return;

        try {
          // Clean up previous marker
          if (selectedMarker) {
            selectedMarker.setMap(null);
          }

          // Create new marker
          const marker = new google.maps.Marker({
            position: event.latLng,
            map: map,
            title: `${clientName} - الموقع المحدد`,
            draggable: true,
            label: {
              text: "❤️",
              color: "hsl(var(--foreground))",
              fontWeight: "bold",
              fontSize: "16px"
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "hsl(var(--destructive))",
              fillOpacity: 0.3,
              strokeColor: "hsl(var(--destructive))",
              strokeWeight: 3,
              scale: 18
            },
            zIndex: 999,
            animation: google.maps.Animation.DROP
          });

          // Add pulsing effect
          setTimeout(() => {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => marker.setAnimation(null), 2000);
          }, 500);

          const newLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };

          setSelectedLocation(newLocation);
          setSelectedMarker(marker);

          // Get address and create markers
          const [address, newUserMarker, newSelectedMarker] = await Promise.all([
            getAddressFromCoordinates(newLocation.lat, newLocation.lng),
            createUserMarker(newLocation, map),
            createSelectedMarker(newLocation, map, clientName)
          ]);

          return {
            location: newLocation,
            address,
            userMarker: newUserMarker,
            selectedMarker: newSelectedMarker
          };

        } catch (error) {
          console.error('Error handling map click:', error);
          setError("خطأ في تحديد الموقع");
        }
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setError("خطأ في تحميل الخريطة");
      setIsMapLoading(false);
    }
  }, [getGoogleMaps, clientName, selectedMarker, getAddressFromCoordinates]);

  // Load Google Maps API
  const loadGoogleMapsAPI = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const google = getGoogleMaps();
    if (google?.maps?.Map) {
      initializeMap();
      return;
    }

    // Check if script is already loading
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkInterval = setInterval(() => {
        const google = getGoogleMaps();
        if (google?.maps?.Map) {
          clearInterval(checkInterval);
          initializeMap();
        }
      }, 100);

      setTimeout(() => clearInterval(checkInterval), 10000);
      return;
    }

    const resolvedApiKey = apiKey ?? process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
    if (!resolvedApiKey) {
      setError("مفتاح Google Maps مفقود");
      setIsMapLoading(false);
      return;
    }

    // Set up callback
    window.initMap = () => {
      requestAnimationFrame(() => {
        initializeMap();
      });
    };

    // Create and load script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${resolvedApiKey}&callback=initMap&libraries=geometry`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      setError("فشل في تحميل Google Maps API");
      setIsMapLoading(false);
    };

    document.head.appendChild(script);
  }, [initializeMap, getGoogleMaps, apiKey]);

  // Map ref callback
  const mapRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (mapRef.current !== node) {
      mapRef.current = node;
      if (node && !mapInstance) {
        requestAnimationFrame(() => {
          loadGoogleMapsAPI();
        });
      }
    }
  }, [loadGoogleMapsAPI, mapInstance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up markers
      [userMarker, selectedMarker].forEach(marker => {
        if (marker) {
          const dragStartListener = marker.get('dragStartListener');
          const dragEndListener = marker.get('dragEndListener');

          if (dragStartListener) {
            const google = getGoogleMaps();
            if (google?.maps?.event) {
              google.maps.event.removeListener(dragStartListener);
            }
          }
          if (dragEndListener) {
            const google = getGoogleMaps();
            if (google?.maps?.event) {
              google.maps.event.removeListener(dragEndListener);
            }
          }

          marker.setMap(null);
        }
      });

      // Clean up global callback
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, [userMarker, selectedMarker, getGoogleMaps]);

  // Initialize user location when map is ready
  useEffect(() => {
    if (mapInstance && !userLocation) {
      if (clientLocation) {
        // If a default location is provided, set it optimistically
        setSelectedLocation(clientLocation);
      }
      // Start location progress
      setLocationProgress({
        accuracy: 0,
        attempts: 0,
        isSearching: true,
        message: 'جاري البحث عن موقعك...'
      });

      getUserLocation(mapInstance, clientName, (accuracy, attempts) => {
        // Update progress
        setLocationProgress({
          accuracy,
          attempts,
          isSearching: true,
          message: `المحاولة ${attempts}/3 - الدقة: ±${accuracy.toFixed(1)}م`
        });
      }).then((result) => {
        if (result) {
          setUserLocation(result.location);
          setUserAddress(result.address);
          setUserMarker(result.userMarker);
          setSelectedLocation(result.location);
          setSelectedAddress(result.address);
          setEditableAddress(result.address);
          setSelectedMarker(result.selectedMarker);

          // Clear progress
          setLocationProgress(null);

          // Log accuracy information
          if (result.accuracyInfo) {
            console.log(`Location accuracy: ${result.accuracyInfo.text} (${result.location.accuracy?.toFixed(1)}m)`);
          }
        } else {
          // Clear progress on error
          setLocationProgress(null);
        }
      }).catch((error) => {
        console.error('Location detection failed:', error);
        setLocationProgress(null);
        setError("فشل في تحديد الموقع");
      });
    }
  }, [mapInstance, userLocation, getUserLocation, clientName]);

  // Recenter to user location with enhanced accuracy
  const recenterToUserLocation = useCallback(async () => {
    if (!mapInstance) return;

    try {
      // Start location progress
      setLocationProgress({
        accuracy: 0,
        attempts: 0,
        isSearching: true,
        message: 'جاري إعادة تحديد موقعك...'
      });

      // Get fresh location with enhanced accuracy
      const result = await getUserLocation(mapInstance, clientName, (accuracy, attempts) => {
        // Update progress
        setLocationProgress({
          accuracy,
          attempts,
          isSearching: true,
          message: `المحاولة ${attempts}/3 - الدقة: ±${accuracy.toFixed(1)}م`
        });
      });

      if (result) {
        // Update user location
        setUserLocation(result.location);
        setUserAddress(result.address);
        setUserMarker(result.userMarker);

        // Update selected location
        if (selectedMarker) {
          selectedMarker.setMap(null);
        }

        setSelectedLocation(result.location);
        setSelectedAddress(result.address);
        setEditableAddress(result.address);
        setSelectedMarker(result.selectedMarker);

        // Clear progress
        setLocationProgress(null);

        // Log accuracy information
        if (result.accuracyInfo) {
          console.log(`Recenter accuracy: ${result.accuracyInfo.text} (${result.location.accuracy?.toFixed(1)}m)`);
        }
      } else {
        // Clear progress on error
        setLocationProgress(null);
      }
    } catch (error) {
      console.error('Error recentering:', error);
      setLocationProgress(null);
      setError("خطأ في العودة إلى الموقع");
    }
  }, [mapInstance, selectedMarker, getUserLocation, clientName]);

  // Handle location data save
  const handleSaveLocation = useCallback(() => {
    if (!selectedLocation) return;

    const locationData: LocationData = {
      coordinates: selectedLocation,
      address: editableAddress,
      landmark: landmark,
      deliveryNote: deliveryNote
    };

    console.log('Saving location:', locationData);
    if (onSave) {
      onSave(locationData);
    }
  }, [selectedLocation, editableAddress, landmark, deliveryNote, onSave]);

  // Handle form clear
  const handleClearFields = useCallback(() => {
    setLandmark("");
    setDeliveryNote("");
  }, []);

  // Error state
  if (error) {
    return (
      <Card className={`${className} max-w-4xl mx-auto`}>
        <div className="flex items-center justify-center p-8">
          <p className="text-destructive font-medium">Error: {error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${className} arabic-text`}>
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Map Section */}
        <div className="w-full lg:w-1/2 relative">
          <div
            ref={mapRefCallback}
            className="w-full h-[400px] lg:h-[500px] rounded-xl border border-border shadow-lg bg-muted/30"
            style={{ minHeight: '400px' }}
          />

          {/* Map Overlay Loader */}
          <MapOverlayLoader progress={locationProgress} />

          {isMapLoading && <MapLoadingSkeleton />}
        </div>

        {/* Location Information Panel */}
        <div className="w-full lg:w-1/2">
          {/* Map Hint */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="text-sm">💡</span>
            <span>انقر على الخريطة لتحديد موقع التوصيل بدقة، أو اسحب العلامة الحمراء لتغيير الموقع • ملء البيانات الصحيحة يساعد في تسريع عملية التوصيل</span>
          </div>

          {isMapLoading ? (
            <LocationCardSkeleton />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <LocationCard
                  userLocation={userLocation}
                  selectedLocation={selectedLocation}
                  editableAddress={editableAddress}
                  setEditableAddress={setEditableAddress}
                  landmark={landmark}
                  setLandmark={setLandmark}
                  deliveryNote={deliveryNote}
                  setDeliveryNote={setDeliveryNote}
                  onRecenter={recenterToUserLocation}
                  onSave={handleSaveLocation}
                  onClear={handleClearFields}
                  locationProgress={locationProgress}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

