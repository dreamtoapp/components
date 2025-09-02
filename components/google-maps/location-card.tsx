import React from 'react';
import { LocationCardProps } from './types';
import { AutoLocationRow } from './auto-location-row';
import { SelectedLocationHeader } from './selected-location-header';
import { LocationForm } from './location-form';

// Location Card Component
export const LocationCard = ({
  userLocation,
  selectedLocation,
  title,
  setTitle,
  editableAddress,
  setEditableAddress,
  landmark,
  setLandmark,
  deliveryNote,
  setDeliveryNote,
  onRecenter,
  onSave,
  onClear,
  locationProgress
}: LocationCardProps) => (
  <div className="bg-card rounded-xl p-4 border border-border shadow-sm lg:min-h-[200px]">
    <AutoLocationRow
      userLocation={userLocation}
      onRecenter={onRecenter}
      locationProgress={locationProgress}
      compact
    />
    {/* Selected location info will be displayed inline next to title field */}

    <div className="text-right min-w-0 flex-1">
      <LocationForm
        userLocation={userLocation}
        selectedLocation={selectedLocation}
        title={title}
        setTitle={setTitle}
        editableAddress={editableAddress}
        setEditableAddress={setEditableAddress}
        landmark={landmark}
        setLandmark={setLandmark}
        deliveryNote={deliveryNote}
        setDeliveryNote={setDeliveryNote}
        onRecenter={onRecenter}
        onSave={onSave}
        onClear={onClear}
      />
    </div>
  </div>
);
