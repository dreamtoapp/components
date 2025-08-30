# Components Folder

This folder contains reusable UI components for the DreamToApp project.

## GoogleMap Component

A React component that integrates Google Maps using the Google Maps JavaScript API.

### Features:
- Interactive Google Maps with customizable center and zoom
- Loading and error states
- Responsive design with Tailwind CSS
- TypeScript support with proper typing

### Usage:
```tsx
import GoogleMap from "./components/GoogleMap";

// Basic usage
<GoogleMap />

// Custom location and size
<GoogleMap 
  center={{ lat: 51.5074, lng: -0.1278 }}
  zoom={10}
  className="w-full h-80"
/>
```

### Props:
- `center`: Map center coordinates (default: New York City)
- `zoom`: Map zoom level (default: 12)
- `className`: Custom CSS classes for styling

### Requirements:
- Google Maps API key in `.env` file as `NEXT_PUBLIC_GOOGLE_MAP_API_KEY`
- `@googlemaps/js-api-loader` package installed

