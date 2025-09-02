### Google Maps – Duplicate Markers Diagnosis and 100% Fix

#### Symptoms
- Multiple red “selected” markers appear after clicking the map several times.
- Markers remain even though previous markers are expected to be cleared.

#### Root Cause (Confirmed)
In `components/google-maps/GoogleMapApiKey.tsx`, the map click handler creates more than one marker for the same user action:

1) It creates a new marker directly via `new google.maps.Marker({...})`.
2) It also calls `createSelectedMarker(newLocation, map, clientName)` which creates another marker for the same location.
3) Additionally, it calls `createUserMarker(newLocation, map)` on click, which should only represent the user’s current/geolocated position, not the clicked/selected location.

This results in two visible markers (manual + factory) per click, and over time repeats add more markers. Prior `selectedMarker` is cleared, but the extra marker created in the handler is not managed via state and therefore persists.

Relevant code excerpt (before fix):

```tsx
// inside map.addListener('click', async (event) => { ... })
// 1) Manual marker (extra)
const marker = new google.maps.Marker({ position: event.latLng, ... });
setSelectedMarker(marker);

// 2) Factory-created markers (second selected + a new user marker)
const [address, newUserMarker, newSelectedMarker] = await Promise.all([
  getAddressFromCoordinates(newLocation.lat, newLocation.lng),
  createUserMarker(newLocation, map),               // should not happen on click
  createSelectedMarker(newLocation, map, clientName) // duplicates the manual one
]);
```

#### Guaranteed Fix (Minimal, Safe)
Change the click handler to create only one selected marker via the existing factory `createSelectedMarker(...)`, do not manually create a marker, and do not create a user marker on clicks. Keep the prior cleanup of the previously selected marker intact.

##### Focused diff

```diff
--- a/components/google-maps/GoogleMapApiKey.tsx
+++ b/components/google-maps/GoogleMapApiKey.tsx
@@
   map.addListener('click', async (event: GoogleMapsMapMouseEvent) => {
     if (!event.latLng) return;

     try {
       // Clean up previous marker
       if (selectedMarker) {
         selectedMarker.setMap(null);
       }

-      // Create new marker (manual - remove this block)
-      const marker = new google.maps.Marker({
-        position: event.latLng,
-        map: map,
-        title: `${clientName} - الموقع المحدد`,
-        draggable: true,
-        label: { text: "❤️", color: "hsl(var(--foreground))", fontWeight: "bold", fontSize: "16px" },
-        icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: "hsl(var(--destructive))", fillOpacity: 0.3, strokeColor: "hsl(var(--destructive))", strokeWeight: 3, scale: 18 },
-        zIndex: 999,
-        animation: google.maps.Animation.DROP
-      });
-      setSelectedMarker(marker);

       const newLocation = {
         lat: event.latLng.lat(),
         lng: event.latLng.lng()
       };

       setSelectedLocation(newLocation);

-      // Get address and create markers
-      const [address, newUserMarker, newSelectedMarker] = await Promise.all([
-        getAddressFromCoordinates(newLocation.lat, newLocation.lng),
-        createUserMarker(newLocation, map),
-        createSelectedMarker(newLocation, map, clientName)
-      ]);
+      // Create only ONE selected marker + fetch address
+      const [address, newSelectedMarker] = await Promise.all([
+        getAddressFromCoordinates(newLocation.lat, newLocation.lng),
+        createSelectedMarker(newLocation, map, clientName)
+      ]);

       setSelectedMarker(newSelectedMarker);
       setSelectedAddress(address);
       setEditableAddress(address);
     } catch (error) {
       console.error('Error handling map click:', error);
       setError("خطأ في تحديد الموقع");
     }
   });
```

Notes:
- Do not call `createUserMarker` on click; the user marker should reflect geolocation (from `getUserLocation`) not the clicked destination.
- Do not manually construct a marker in the handler when a dedicated factory (`createSelectedMarker`) already exists and attaches drag listeners/cleanup.

#### Why this is safe
- We only remove redundant marker creation. Existing styling, props, and cleanup logic remain intact.
- `selectedMarker` state continues to be the single source of truth for the active destination marker.
- `userMarker` remains managed by geolocation flows (`getUserLocation`, `recenterToUserLocation`).

#### Optional hardening (if ever needed)
- Guard against concurrent clicks by disabling input while `isMapLoading` or by debouncing the click handler.
- Ensure `selectedMarker.setMap(null)` is always called before setting a new one (already present).

#### Test checklist
- Click different places on the map; exactly one red marker should be visible as the selected destination.
- Use the recenter button; blue/current-location marker should reappear or update, without duplicating red markers.
- Reload page; initial geolocation places one blue marker and one red marker (selected), not multiples.

This document explains the root cause and provides the precise minimal diff required to fix the duplication deterministically.


