import { useCallback } from 'react';
import { Location, GoogleMapsMap, GoogleMapsMarker, GoogleMapsMapMouseEvent } from './types';

// Hook for Google Maps API
export const useGoogleMaps = () => {
  const getGoogleMaps = useCallback((): any => {
    if (typeof window === 'undefined' || !window.google) {
      return null;
    }
    return window.google;
  }, []);

  return { getGoogleMaps };
};

// Hook for address geocoding
export const useGeocoding = () => {
  const { getGoogleMaps } = useGoogleMaps();

  const getAddressFromCoordinates = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const google = getGoogleMaps();
      if (!google?.maps?.Geocoder) {
        return 'العنوان غير متوفر';
      }

      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({
        location: { lat, lng },
        language: 'ar'
      });

      if (!result.results[0]) {
        return 'العنوان غير متوفر';
      }

      const addressComponents = result.results[0].address_components;
      const getComponent = (types: string[]) =>
        addressComponents.find((comp: { types: string[]; long_name: string }) =>
          types.some(type => comp.types.includes(type)))?.long_name || '';

      const streetNumber = getComponent(['street_number']);
      const route = getComponent(['route']);
      const neighborhood = getComponent(['neighborhood', 'sublocality_level_1']);
      const locality = getComponent(['locality']);

      const addressParts = [
        streetNumber && route ? `${streetNumber} ${route}` : route,
        neighborhood,
        locality
      ].filter(Boolean);

      return addressParts.length > 0 ? addressParts.join(', ') : 'العنوان غير متوفر';
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'العنوان غير متوفر';
    }
  }, [getGoogleMaps]);

  return { getAddressFromCoordinates };
};

// Hook for marker creation
export const useMarkerCreation = () => {
  const { getGoogleMaps } = useGoogleMaps();
  const { getAddressFromCoordinates } = useGeocoding();

  const createUserMarker = useCallback((location: Location, map: GoogleMapsMap): GoogleMapsMarker => {
    const google = getGoogleMaps();
    if (!google?.maps?.Marker) {
      throw new Error('Google Maps Marker not available');
    }

    const marker = new google.maps.Marker({
      position: location,
      map: map,
      title: "موقعك الحالي",
      label: {
        text: "🎯",
        color: "hsl(var(--foreground))",
        fontWeight: "bold",
        fontSize: "18px"
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "hsl(var(--primary))",
        fillOpacity: 0.3,
        strokeColor: "hsl(var(--primary))",
        strokeWeight: 4,
        scale: 20
      },
      zIndex: 1000,
      animation: google.maps.Animation.DROP
    });

    // Enhanced animation sequence
    setTimeout(() => {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => {
        marker.setAnimation(null);
        // Add subtle pulsing effect
        let pulseCount = 0;
        const pulseInterval = setInterval(() => {
          if (pulseCount >= 3) {
            clearInterval(pulseInterval);
            return;
          }
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "hsl(var(--primary))",
            fillOpacity: 0.3,
            strokeColor: "hsl(var(--primary))",
            strokeWeight: 4,
            scale: 20 + (pulseCount % 2) * 2
          });
          pulseCount++;
        }, 800);
      }, 2000);
    }, 300);

    return marker;
  }, [getGoogleMaps]);

  const createSelectedMarker = useCallback((location: Location, map: GoogleMapsMap, clientName: string): GoogleMapsMarker => {
    const google = getGoogleMaps();
    if (!google?.maps?.Marker) {
      throw new Error('Google Maps Marker not available');
    }

    const marker = new google.maps.Marker({
      position: location,
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
      zIndex: 999
    });

    // Add drag listeners
    const dragStartListener = marker.addListener('dragstart', () => {
      marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "hsl(var(--warning))",
        fillOpacity: 0.3,
        strokeColor: "hsl(var(--warning))",
        strokeWeight: 3,
        scale: 22
      });
      marker.setAnimation(google.maps.Animation.BOUNCE);
    });

    const dragEndListener = marker.addListener('dragend', async (dragEvent: GoogleMapsMapMouseEvent) => {
      if (!dragEvent.latLng) return;

      marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "hsl(var(--destructive))",
        fillOpacity: 0.3,
        strokeColor: "hsl(var(--destructive))",
        strokeWeight: 3,
        scale: 18
      });
      marker.setAnimation(null);

      const updatedLocation = {
        lat: dragEvent.latLng.lat(),
        lng: dragEvent.latLng.lng()
      };

      // Note: This would need to be handled by parent component
      // For now, we'll just log the update
      console.log('Marker dragged to:', updatedLocation);
    });

    // Store listeners for cleanup
    marker.set('dragStartListener', dragStartListener);
    marker.set('dragEndListener', dragEndListener);

    return marker;
  }, [getGoogleMaps, getAddressFromCoordinates]);

  return { createUserMarker, createSelectedMarker };
};

// Enhanced accuracy validation function
const getAccuracyLevel = (accuracy: number) => {
  if (accuracy <= 3) return { level: 'EXCELLENT', color: 'text-green-500', icon: '🎯', text: 'دقة ممتازة' };
  if (accuracy <= 8) return { level: 'GOOD', color: 'text-green-400', icon: '📍', text: 'دقة جيدة' };
  if (accuracy <= 15) return { level: 'ACCEPTABLE', color: 'text-yellow-500', icon: '📌', text: 'دقة مقبولة' };
  if (accuracy <= 25) return { level: 'POOR', color: 'text-orange-500', icon: '⚠️', text: 'دقة ضعيفة' };
  return { level: 'UNRELIABLE', color: 'text-red-500', icon: '❌', text: 'دقة غير موثوقة' };
};

// Enhanced progressive accuracy strategy with watchPosition
const getHighAccuracyLocation = async (onProgress?: (position: GeolocationPosition) => void): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    let bestPosition: GeolocationPosition | null = null;
    let attempts = 0;
    const maxAttempts = 3;
    const targetAccuracy = 5; // Target 5 meters accuracy
    let watchId: number;

    // Timeout for the entire process
    const overallTimeout = setTimeout(() => {
      if (watchId) navigator.geolocation.clearWatch(watchId);

      if (bestPosition) {
        console.log('Timeout reached, using best position found:', bestPosition.coords.accuracy, 'meters');
        resolve(bestPosition);
      } else {
        reject(new Error('Location timeout - no position obtained'));
      }
    }, 20000); // 20 seconds total

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 8000,        // 8 seconds per attempt
      maximumAge: 0         // Always get fresh location
    };

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        attempts++;
        console.log(`Location attempt ${attempts}: accuracy ${position.coords.accuracy.toFixed(1)}m`);

        // Report progress
        if (onProgress) onProgress(position);

        // Update best position if this one is better
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
          console.log('New best accuracy:', position.coords.accuracy.toFixed(1), 'meters');
        }

        // Stop if we achieved target accuracy or max attempts
        if (position.coords.accuracy <= targetAccuracy || attempts >= maxAttempts) {
          clearTimeout(overallTimeout);
          navigator.geolocation.clearWatch(watchId);

          console.log('Final location accuracy:', bestPosition.coords.accuracy.toFixed(1), 'meters');
          resolve(bestPosition);
        }
      },
      (error) => {
        attempts++;
        console.warn(`Location attempt ${attempts} failed:`, error.message);

        // If we have a position from previous attempts, use it
        if (bestPosition && attempts >= maxAttempts) {
          clearTimeout(overallTimeout);
          navigator.geolocation.clearWatch(watchId);
          console.log('Using best position after errors:', bestPosition.coords.accuracy, 'meters');
          resolve(bestPosition);
        } else if (attempts >= maxAttempts) {
          clearTimeout(overallTimeout);
          navigator.geolocation.clearWatch(watchId);
          reject(error);
        }
        // Otherwise, continue watching for better positions
      },
      options
    );
  });
};

// Fallback strategy for when high accuracy fails
const getFallbackLocation = async (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    const options: PositionOptions = {
      enableHighAccuracy: false,  // Use network/cell tower location
      timeout: 10000,
      maximumAge: 60000          // Accept cached location up to 1 minute old
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Fallback location obtained:', position.coords.accuracy, 'meters');
        resolve(position);
      },
      reject,
      options
    );
  });
};

// Enhanced geolocation hook - backward compatible
export const useGeolocation = () => {
  const { getAddressFromCoordinates } = useGeocoding();
  const { createUserMarker, createSelectedMarker } = useMarkerCreation();

  const getUserLocation = useCallback(async (
    map: GoogleMapsMap,
    clientName: string,
    onProgress?: (accuracy: number, attempts: number) => void
  ) => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported by this device');
    }

    let progressAttempts = 0;

    try {
      console.log('Starting high-accuracy location detection...');

      const position = await getHighAccuracyLocation((pos) => {
        progressAttempts++;
        if (onProgress) {
          onProgress(pos.coords.accuracy, progressAttempts);
        }
      });

      const accuracyInfo = getAccuracyLevel(position.coords.accuracy);

      const currentLocation: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      // Center map with appropriate zoom based on accuracy
      map.setCenter(currentLocation);

      // Set zoom based on accuracy - more accurate = higher zoom
      let zoom = 15;
      if (position.coords.accuracy <= 3) zoom = 18;
      else if (position.coords.accuracy <= 8) zoom = 17;
      else if (position.coords.accuracy <= 15) zoom = 16;
      else if (position.coords.accuracy > 25) zoom = 14;

      map.setZoom(zoom);

      // Get address and create markers concurrently
      const [address, userMarker, selectedMarker] = await Promise.all([
        getAddressFromCoordinates(currentLocation.lat, currentLocation.lng),
        createUserMarker(currentLocation, map),
        createSelectedMarker(currentLocation, map, clientName)
      ]);

      return {
        location: currentLocation,
        address,
        userMarker,
        selectedMarker,
        accuracyInfo,
        isHighAccuracy: position.coords.accuracy <= 15
      };

    } catch (highAccuracyError: unknown) {
      console.warn('High accuracy failed, trying fallback:', highAccuracyError instanceof Error ? highAccuracyError.message : 'Unknown error');

      try {
        const fallbackPosition = await getFallbackLocation();
        const accuracyInfo = getAccuracyLevel(fallbackPosition.coords.accuracy);

        const currentLocation: Location = {
          lat: fallbackPosition.coords.latitude,
          lng: fallbackPosition.coords.longitude,
          accuracy: fallbackPosition.coords.accuracy,
        };

        map.setCenter(currentLocation);
        map.setZoom(13); // Lower zoom for less accurate position

        const [address, userMarker, selectedMarker] = await Promise.all([
          getAddressFromCoordinates(currentLocation.lat, currentLocation.lng),
          createUserMarker(currentLocation, map),
          createSelectedMarker(currentLocation, map, clientName)
        ]);

        return {
          location: currentLocation,
          address,
          userMarker,
          selectedMarker,
          accuracyInfo,
          isHighAccuracy: false,
          isFallback: true
        };

      } catch (fallbackError: unknown) {
        // Provide detailed error information
        console.error('Both high accuracy and fallback failed');

        if (fallbackError instanceof GeolocationPositionError) {
          switch (fallbackError.code) {
            case fallbackError.PERMISSION_DENIED:
              throw new Error('Location access denied. Please enable location permissions and try again.');
            case fallbackError.POSITION_UNAVAILABLE:
              throw new Error('Location unavailable. Please check your GPS settings and internet connection.');
            case fallbackError.TIMEOUT:
              throw new Error('Location request timed out. Please try again in a few moments.');
            default:
              throw new Error(`Location error: ${fallbackError.message}`);
          }
        }
        throw fallbackError;
      }
    }
  }, [getAddressFromCoordinates, createUserMarker, createSelectedMarker]);

  // Method to retry location with user feedback
  const retryLocation = useCallback(async (
    map: GoogleMapsMap,
    clientName: string,
    onProgress?: (accuracy: number, attempts: number) => void
  ) => {
    console.log('Retrying location detection...');
    return getUserLocation(map, clientName, onProgress);
  }, [getUserLocation]);

  return {
    getUserLocation,
    retryLocation,
    getAccuracyLevel
  };
};
