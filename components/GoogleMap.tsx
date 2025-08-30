"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface GoogleMapProps {
  className?: string;
  clientName?: string;
}

// Global flag to track if Google Maps is already loaded
declare global {
  interface Window {
    google?: typeof google;
    initMap?: () => void;
  }
}

export default function GoogleMap({ className = "w-full h-96", clientName = "DreamToApp" }: GoogleMapProps) {
  console.log("📦 GoogleMap component render (Modern React 19 approach)");
  console.log("📦 API Key exists:", !!process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY);
  console.log("📦 Is client-side:", typeof window !== 'undefined');
  console.log("📦 Window.google exists:", typeof window !== 'undefined' ? !!window.google : 'N/A (server-side)');
  console.log("📦 Timestamp:", new Date().toISOString());

  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false); // Start as false to show the container
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  console.log("📦 Current state - isLoading:", isLoading, "error:", error);

  // Function to recenter map to user location
  const recenterToUserLocation = useCallback(() => {
    console.log("🎯 Recenter button clicked");
    if (mapInstance && userLocation) {
      console.log("🎯 Recentering to:", userLocation);
      mapInstance.setCenter(userLocation);
      mapInstance.setZoom(15);
    } else {
      console.log("🎯 Cannot recenter - missing map or location");
      // If no user location stored, try to get it again
      if (navigator.geolocation && mapInstance) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentUserLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(currentUserLocation);
            mapInstance.setCenter(currentUserLocation);
            mapInstance.setZoom(15);
            console.log("🎯 Got new location and recentered:", currentUserLocation);
          },
          (error) => {
            console.log("🎯 Geolocation error:", error.message);
          }
        );
      }
    }
  }, [mapInstance, userLocation]);

  const initializeMap = useCallback(() => {
    console.log("📦 Modern approach: initializeMap called");

    if (typeof window === 'undefined') {
      console.log("📦 Server-side rendering, skipping map initialization");
      return;
    }

    if (!mapRef.current) {
      console.log("📦 Map ref not ready");
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      console.log("📦 Google Maps API not fully loaded yet", {
        hasGoogle: !!window.google,
        hasMaps: !!(window.google && window.google.maps),
        hasMap: !!(window.google && window.google.maps && window.google.maps.Map)
      });
      return;
    }

    console.log("📦 Creating map with modern approach...");

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20, lng: 0 },
      zoom: 2,
    });

    console.log("📦 Map created successfully!");
    setMapInstance(map);

    // Add a test marker immediately to verify markers work
    const testMarker = new window.google.maps.Marker({
      position: { lat: 20, lng: 0 },
      map: map,
      title: "🔴 Test Marker - I should be visible!",
      label: "T"
    });
    console.log("📦 Test marker created at:", { lat: 20, lng: 0 });

    // Add click listener - use AdvancedMarkerElement if available, fallback to Marker
    map.addListener('click', (event: google.maps.MapMouseEvent) => {
      console.log("🖱️ Map clicked! Event:", event);
      if (event.latLng) {
        console.log("🖱️ Click position:", { lat: event.latLng.lat(), lng: event.latLng.lng() });
        // Create InfoWindow for the client name popup
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
                <div style="padding: 8px; text-align: center;">
                  <h3 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px; font-weight: bold;">
                    ${clientName}
                  </h3>
                  <p style="margin: 0; color: #666; font-size: 12px;">
                    Selected Location
                  </p>
                  <p style="margin: 4px 0 0 0; color: #999; font-size: 11px;">
                    Lat: ${event.latLng.lat().toFixed(6)}<br/>
                    Lng: ${event.latLng.lng().toFixed(6)}
                  </p>
                </div>
              `,
          position: event.latLng
        });

        // Try to use AdvancedMarkerElement, fallback to Marker if not available
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: event.latLng,
            map: map,
            title: `${clientName} - Selected Location (Draggable)`,
            gmpDraggable: true // Make marker draggable
          });

          // Show InfoWindow when marker is clicked
          marker.addListener('click', () => {
            infoWindow.open(map);
          });

          // Update InfoWindow content and position when marker is dragged
          marker.addListener('dragend', (dragEvent: google.maps.MapMouseEvent) => {
            if (dragEvent.latLng) {
              const newPosition = dragEvent.latLng;
              if (!newPosition) return;

              // Update InfoWindow content with new coordinates
              infoWindow.setContent(`
                    <div style="padding: 8px; text-align: center;">
                      <h3 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px; font-weight: bold;">
                        ${clientName}
                      </h3>
                      <p style="margin: 0; color: #666; font-size: 12px;">
                        📍 Dragged Location
                      </p>
                      <p style="margin: 4px 0 0 0; color: #999; font-size: 11px;">
                        Lat: ${newPosition.lat().toFixed(6)}<br/>
                        Lng: ${newPosition.lng().toFixed(6)}
                      </p>
                      <p style="margin: 8px 0 0 0; color: #4caf50; font-size: 10px; font-weight: bold;">
                        ✅ Drag to adjust position
                      </p>
                    </div>
                  `);

              // Update InfoWindow position
              infoWindow.setPosition(newPosition);

              console.log('📦 Marker Dragged (AdvancedMarker):', {
                lat: newPosition.lat(),
                lng: newPosition.lng(),
                client: clientName
              });
            }
          });

          console.log('📦 Draggable Selected Location (AdvancedMarker) created:', {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
            client: clientName
          });
        } else {
          // Fallback to regular Marker with draggable functionality
          const marker = new window.google.maps.Marker({
            position: event.latLng,
            map: map,
            title: `${clientName} - Selected Location (Draggable)`,
            draggable: true // Make marker draggable
          });

          // Show InfoWindow when marker is clicked
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          // Update InfoWindow content and position when marker is dragged
          marker.addListener('dragend', (dragEvent: google.maps.MapMouseEvent) => {
            const newPosition = dragEvent.latLng;
            if (!newPosition) return;

            // Update InfoWindow content with new coordinates
            infoWindow.setContent(`
                  <div style="padding: 8px; text-align: center;">
                    <h3 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px; font-weight: bold;">
                      ${clientName}
                    </h3>
                    <p style="margin: 0; color: #666; font-size: 12px;">
                      📍 Dragged Location
                    </p>
                    <p style="margin: 4px 0 0 0; color: #999; font-size: 11px;">
                      Lat: ${newPosition.lat().toFixed(6)}<br/>
                      Lng: ${newPosition.lng().toFixed(6)}
                    </p>
                    <p style="margin: 8px 0 0 0; color: #4caf50; font-size: 10px; font-weight: bold;">
                      ✅ Drag to adjust position
                    </p>
                  </div>
                `);

            // Update InfoWindow position
            infoWindow.setPosition(newPosition);

            console.log('📦 Marker Dragged (Regular Marker):', {
              lat: newPosition.lat(),
              lng: newPosition.lng(),
              client: clientName
            });
          });

          console.log('📦 Draggable Selected Location (Regular Marker) created:', {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
            client: clientName
          });
        }

        // Auto-open the InfoWindow
        infoWindow.open(map);
      }
    });

    // Auto-detect user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentUserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setUserLocation(currentUserLocation); // Store user location for recenter button
          map.setCenter(currentUserLocation);
          map.setZoom(15);

          // Create InfoWindow for user location
          const userInfoWindow = new window.google.maps.InfoWindow({
            content: `
                  <div style="padding: 8px; text-align: center;">
                    <h3 style="margin: 0 0 8px 0; color: #4285F4; font-size: 16px; font-weight: bold;">
                      ${clientName}
                    </h3>
                    <p style="margin: 0; color: #666; font-size: 12px;">
                      📍 Your Current Location
                    </p>
                    <p style="margin: 4px 0 0 0; color: #999; font-size: 11px;">
                                              Lat: ${currentUserLocation.lat.toFixed(6)}<br/>
                        Lng: ${currentUserLocation.lng.toFixed(6)}
                    </p>
                  </div>
                `,
            position: currentUserLocation
          });

          // Try to use AdvancedMarkerElement for user location, fallback to regular Marker
          if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
            // Create custom content for the user location marker
            const markerContent = document.createElement('div');
            markerContent.innerHTML = `
                  <div style="
                    width: 24px; 
                    height: 24px; 
                    background: #4285F4; 
                    border: 3px solid white; 
                    border-radius: 50%; 
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                    <div style="
                      width: 6px; 
                      height: 6px; 
                      background: white; 
                      border-radius: 50%;
                    "></div>
                  </div>
                `;

            // Use modern AdvancedMarkerElement for user location
            const userMarker = new window.google.maps.marker.AdvancedMarkerElement({
              position: currentUserLocation,
              map: map,
              title: `${clientName} - Your Current Location (Draggable)`,
              content: markerContent,
              gmpDraggable: true // Make user location marker draggable
            });

            // Add click listener to show InfoWindow
            userMarker.addListener('click', () => {
              userInfoWindow.open(map);
            });

            // Update InfoWindow when user location marker is dragged
            userMarker.addListener('dragend', (dragEvent: google.maps.MapMouseEvent) => {
              if (dragEvent.latLng) {
                const newPosition = dragEvent.latLng;
                if (!newPosition) return;

                // Update InfoWindow content with new coordinates
                userInfoWindow.setContent(`
                      <div style="padding: 8px; text-align: center;">
                        <h3 style="margin: 0 0 8px 0; color: #4285F4; font-size: 16px; font-weight: bold;">
                          ${clientName}
                        </h3>
                        <p style="margin: 0; color: #666; font-size: 12px;">
                          📍 Adjusted Location
                        </p>
                        <p style="margin: 4px 0 0 0; color: #999; font-size: 11px;">
                          Lat: ${newPosition.lat().toFixed(6)}<br/>
                          Lng: ${newPosition.lng().toFixed(6)}
                        </p>
                        <p style="margin: 8px 0 0 0; color: #4caf50; font-size: 10px; font-weight: bold;">
                          ✅ Position adjusted
                        </p>
                      </div>
                    `);

                // Update InfoWindow position
                userInfoWindow.setPosition(newPosition);

                console.log('📦 User Location Dragged (AdvancedMarker):', {
                  lat: newPosition.lat(),
                  lng: newPosition.lng(),
                  client: clientName
                });
              }
            });

            console.log("📦 User location marker added with AdvancedMarkerElement!");
          } else {
            // Fallback to regular Marker with SVG icon
            const userMarker = new window.google.maps.Marker({
              position: currentUserLocation,
              map: map,
              title: `${clientName} - Your Current Location (Draggable)`,
              draggable: true, // Make user location marker draggable
              icon: {
                url: "data:image/svg+xml;charset=UTF-8,%3csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='12' cy='12' r='8' fill='%234285F4'/%3e%3ccircle cx='12' cy='12' r='3' fill='white'/%3e%3c/svg%3e",
                scaledSize: new window.google.maps.Size(24, 24),
                anchor: new window.google.maps.Point(12, 12)
              }
            });

            // Add click listener to show InfoWindow
            userMarker.addListener('click', () => {
              userInfoWindow.open(map, userMarker);
            });

            // Update InfoWindow when user location marker is dragged
            userMarker.addListener('dragend', (dragEvent: google.maps.MapMouseEvent) => {
              const newPosition = dragEvent.latLng;
              if (!newPosition) return;

              // Update InfoWindow content with new coordinates
              userInfoWindow.setContent(`
                <div style="padding: 8px; text-align: center;">
                  <h3 style="margin: 0 0 8px 0; color: #4285F4; font-size: 16px; font-weight: bold;">
                    ${clientName}
                  </h3>
                  <p style="margin: 0; color: #666; font-size: 12px;">
                    📍 Adjusted Location
                  </p>
                  <p style="margin: 4px 0 0 0; color: #999; font-size: 11px;">
                    Lat: ${newPosition.lat().toFixed(6)}<br/>
                    Lng: ${newPosition.lng().toFixed(6)}
                  </p>
                  <p style="margin: 8px 0 0 0; color: #4caf50; font-size: 10px; font-weight: bold;">
                    ✅ Position adjusted
                  </p>
                </div>
              `);

              // Update InfoWindow position
              userInfoWindow.setPosition(newPosition);

              console.log('📦 User Location Dragged (Regular Marker):', {
                lat: newPosition.lat(),
                lng: newPosition.lng(),
                client: clientName
              });
            });

            console.log("📦 User location marker added with regular Marker!");
          }
        },
        (error) => {
          console.log("📦 Geolocation error:", error.message);
        }
      );
    }

    setIsLoading(false);
  }, [clientName]);

  // Modern approach: Load Google Maps API directly with script tag
  const loadGoogleMapsAPI = useCallback(() => {
    console.log("📦 Loading Google Maps API with modern approach...");

    if (typeof window === 'undefined') {
      console.log("📦 Server-side rendering, skipping API loading");
      return;
    }

    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.Map) {
      console.log("📦 Google Maps already loaded, initializing...");
      initializeMap();
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log("📦 Google Maps script already loading...");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
    if (!apiKey) {
      console.error("📦 No API key found!");
      setError("Google Maps API key is missing");
      return;
    }

    console.log("📦 Creating script tag...");

    // Create callback function
    window.initMap = () => {
      console.log("📦 Google Maps API loaded via callback!");
      console.log("📦 Checking API readiness:", {
        hasGoogle: !!window.google,
        hasMaps: !!(window.google && window.google.maps),
        hasMap: !!(window.google && window.google.maps && window.google.maps.Map)
      });

      // Add a small delay to ensure everything is ready
      setTimeout(() => {
        console.log("📦 Initializing map after callback delay...");
        initializeMap();
      }, 100);
    };

    // Create script element with loading=async for better performance
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=initMap&loading=async`;
    script.async = true;
    script.defer = true;

    script.onerror = (error) => {
      console.error("📦 Failed to load Google Maps API", error);
      setError("Failed to load Google Maps API - Check API key and billing");
    };

    script.onload = () => {
      console.log("📦 Google Maps script loaded successfully");
    };

    document.head.appendChild(script);
    console.log("📦 Script tag added to document");
  }, [initializeMap]);

  // Use ref callback to trigger initialization when DOM is ready
  const mapRefCallback = useCallback((node: HTMLDivElement | null) => {
    console.log("📦 Map ref callback called, node:", !!node);
    console.log("📦 Node details:", node ? "DOM element ready" : "Node is null");

    mapRef.current = node;
    if (node) {
      console.log("📦 DOM node ready, loading Google Maps API...");
      console.log("📦 Node dimensions:", node.offsetWidth, "x", node.offsetHeight);
      console.log("📦 Node parent:", node.parentElement);

      // Add a small delay to ensure everything is ready
      setTimeout(() => {
        console.log("📦 Timeout executed, calling loadGoogleMapsAPI...");
        loadGoogleMapsAPI();
      }, 100);
    }
  }, [loadGoogleMapsAPI]);

  // Force load when component mounts
  useEffect(() => {
    console.log("📦 useEffect triggered - forcing map load");
    if (typeof window !== 'undefined' &&
      (!window.google || !window.google.maps || !window.google.maps.Map) &&
      !document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log("📦 Force loading Google Maps API...");
      loadGoogleMapsAPI();
    } else if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Map) {
      console.log("📦 Google Maps already available, initializing...");
      initializeMap();
    }
  }, [loadGoogleMapsAPI, initializeMap]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 border border-red-200 rounded-lg`}>
        <p className="text-red-600">Error loading map: {error}</p>
      </div>
    );
  }

  // Remove loading state check to always show the container

  console.log("📦 About to render map container...");

  return (
    <div className={`${className} relative`}>
      <div
        ref={mapRefCallback}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}