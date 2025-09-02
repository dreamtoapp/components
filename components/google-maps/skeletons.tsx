import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

// Map Loading Skeleton Component
export const MapLoadingSkeleton = () => (
  <div className="absolute inset-0 bg-muted/20 rounded-xl overflow-hidden">
    <div className="p-4 space-y-4">
      {/* Map Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 bg-muted/60" />
        <Skeleton className="h-8 w-full bg-muted/60" />
        <Skeleton className="h-6 w-3/4 bg-muted/60" />
      </div>

      {/* Controls Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded bg-muted/60" />
        <Skeleton className="h-8 w-8 rounded bg-muted/60" />
        <Skeleton className="h-8 w-8 rounded bg-muted/60" />
      </div>

      {/* Map Area Skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="relative">
            <Skeleton className="h-32 w-32 rounded-lg bg-muted/60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
          <Skeleton className="h-4 w-32 bg-muted/60" />
        </div>
      </div>
    </div>
  </div>
);

// Location Card Skeleton Component
export const LocationCardSkeleton = () => (
  <div className="space-y-4">
    {/* Hint Skeleton */}
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-4 rounded-full bg-muted/60" />
      <Skeleton className="h-4 w-full bg-muted/60" />
    </div>

    {/* Location Card Skeleton */}
    <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full bg-muted/60" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 bg-muted/60" />
              <Skeleton className="h-3 w-32 bg-muted/60" />
            </div>
          </div>
          <Skeleton className="h-6 w-6 rounded-full bg-muted/60" />
        </div>

        {/* Input Fields Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16 bg-muted/60" />
              <Skeleton className="h-8 w-full bg-muted/60 rounded" />
            </div>
          ))}
        </div>

        {/* Buttons Skeleton */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Skeleton className="h-10 flex-1 bg-muted/60 rounded" />
          <Skeleton className="h-10 flex-1 bg-muted/60 rounded" />
        </div>
      </div>
    </div>
  </div>
);


