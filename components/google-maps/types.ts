// Google Maps types
export interface GoogleMapsMap {
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  addListener: (event: string, callback: (event: unknown) => void) => void;
}

export interface GoogleMapsMarker {
  setMap: (map: GoogleMapsMap | null) => void;
  setIcon: (icon: unknown) => void;
  setAnimation: (animation: unknown) => void;
  addListener: (event: string, callback: (event: unknown) => void) => void;
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
}

export interface GoogleMapsMapMouseEvent {
  latLng: { lat: () => number; lng: () => number } | null;
}

// Location types
export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface LocationData {
  coordinates: Location;
  address: string;
  landmark: string;
  deliveryNote: string;
  title?: string;
}

// Accuracy information type
export interface AccuracyInfo {
  level: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'UNRELIABLE';
  color: string;
  icon: string;
  text: string;
}

// Location progress type
export interface LocationProgress {
  accuracy: number;
  attempts: number;
  isSearching: boolean;
  message: string;
}

// Geolocation result type
export interface GeolocationResult {
  location: Location;
  address: string;
  userMarker: GoogleMapsMarker;
  selectedMarker: GoogleMapsMarker;
  accuracyInfo: AccuracyInfo;
}

// Component props
export interface GoogleMapProps {
  className?: string;
  clientName?: string;
  apiKey?: string;
  clientTitle?: string;
  clientAddress?: string;
  clientLandmark?: string;
  clientDeliveryNote?: string;
  clientLocation?: Location;
  onSave?: (data: LocationData) => void;
}

export interface AutoLocationRowProps {
  userLocation: Location | null;
  onRecenter: () => void;
  locationProgress?: LocationProgress | null;
  compact?: boolean;
  inline?: boolean;
  hideCoordinates?: boolean;
}

export interface SelectedLocationHeaderProps {
  selectedLocation: Location | null;
  compact?: boolean;
  inline?: boolean;
}

export interface LocationFormProps {
  selectedLocation: Location | null;
  userLocation: Location | null;
  title: string;
  setTitle: (title: string) => void;
  editableAddress: string;
  setEditableAddress: (address: string) => void;
  landmark: string;
  setLandmark: (landmark: string) => void;
  deliveryNote: string;
  setDeliveryNote: (note: string) => void;
  onRecenter: () => void;
  onSave: () => void;
  onClear: () => void;
}

export interface LocationCardProps {
  userLocation: Location | null;
  selectedLocation: Location | null;
  title: string;
  setTitle: (title: string) => void;
  editableAddress: string;
  setEditableAddress: (address: string) => void;
  landmark: string;
  setLandmark: (landmark: string) => void;
  deliveryNote: string;
  setDeliveryNote: (note: string) => void;
  onRecenter: () => void;
  onSave: () => void;
  onClear: () => void;
  locationProgress?: LocationProgress | null;
}

// Global type declarations
declare global {
  interface Window {
    google?: unknown;
    initMap?: () => void;
  }
}
