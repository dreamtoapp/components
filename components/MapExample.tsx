import GoogleMap from "./GoogleMap";

export default function MapExample() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Google Maps Example</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Default Map (New York City)</h2>
          <GoogleMap />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Custom Location (London)</h2>
          <GoogleMap
            center={{ lat: 51.5074, lng: -0.1278 }}
            zoom={10}
            className="w-full h-80"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Small Map (Tokyo)</h2>
          <GoogleMap
            center={{ lat: 35.6762, lng: 139.6503 }}
            zoom={8}
            className="w-full h-64"
          />
        </div>
      </div>
    </div>
  );
}

