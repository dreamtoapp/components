import React from 'react';
import { SelectedLocationHeaderProps } from './types';

// Selected Location Header Component
export const SelectedLocationHeader = ({ selectedLocation, compact }: SelectedLocationHeaderProps) => (
  <div className={`flex items-center justify-between ${compact ? 'mb-2 pb-2' : 'mb-4 pb-3'} border-b border-border/50`}>
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      <div className="w-6 h-6 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-destructive text-xs">❤️</span>
      </div>
      <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
        <div className="text-xs font-mono text-muted-foreground">
          [{selectedLocation?.lat.toFixed(6)}, {selectedLocation?.lng.toFixed(6)}]
        </div>
      </div>
    </div>
    {selectedLocation && (
      <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
        <span className="text-xs text-muted-foreground">تم التحديد يدوياً</span>
        <div className="w-2 h-2 bg-destructive rounded-full"></div>
      </div>
    )}
  </div>
);


