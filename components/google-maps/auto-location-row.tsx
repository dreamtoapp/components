import React from 'react';
import { Button } from "@/components/ui/button";
import { AutoLocationRowProps, LocationProgress } from './types';

// Enhanced accuracy display function
const getAccuracyDisplay = (accuracy: number) => {
  if (accuracy <= 3) return { text: 'دقة ممتازة', color: 'text-green-500', icon: '🎯', bgColor: 'bg-green-500' };
  if (accuracy <= 8) return { text: 'دقة جيدة', color: 'text-green-400', icon: '📍', bgColor: 'bg-green-400' };
  if (accuracy <= 15) return { text: 'دقة مقبولة', color: 'text-yellow-500', icon: '📌', bgColor: 'bg-yellow-500' };
  if (accuracy <= 25) return { text: 'دقة ضعيفة', color: 'text-orange-500', icon: '⚠️', bgColor: 'bg-orange-500' };
  return { text: 'دقة غير موثوقة', color: 'text-red-500', icon: '❌', bgColor: 'bg-red-500' };
};

// Location progress loader component
const LocationProgressLoader = ({ progress }: { progress: LocationProgress }) => (
  <div className="flex items-center gap-2 animate-pulse">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs text-primary font-medium">
        جاري البحث عن أفضل موقع...
      </span>
    </div>
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">
        المحاولة {progress.attempts}/3
      </span>
      <span className="text-xs text-muted-foreground">
        (±{progress.accuracy.toFixed(1)}م)
      </span>
    </div>
  </div>
);

// Auto Location Row Component
export const AutoLocationRow = ({ userLocation, onRecenter, locationProgress }: AutoLocationRowProps) => {
  if (!userLocation && !locationProgress) return null;

  // Show loader while searching for location
  if (locationProgress?.isSearching) {
    return (
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-xs">🎯</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
              الموقع التلقائي
            </div>
            <LocationProgressLoader progress={locationProgress} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onRecenter}
            size="icon"
            variant="outline"
            title="إعادة المحاولة"
            disabled={locationProgress.isSearching}
            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground border-border/50 hover:border-primary/50 transition-colors disabled:opacity-50"
          >
            <span className="text-xs sm:text-sm">🔄</span>
          </Button>
        </div>
      </div>
    );
  }

  // Show location when found
  if (userLocation) {
    const accuracyDisplay = getAccuracyDisplay(userLocation.accuracy || 0);

    return (
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-xs">🎯</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
              الموقع التلقائي
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              [{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}]
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userLocation.accuracy && (
            <div className="flex items-center gap-2">
              {/* Enhanced accuracy display */}
              <div className="flex items-center gap-1">
                <span className={`text-xs ${accuracyDisplay.color}`}>
                  {accuracyDisplay.icon}
                </span>
                <span className={`text-xs ${accuracyDisplay.color} font-medium`}>
                  {accuracyDisplay.text}
                </span>
              </div>
              <div className={`w-2 h-2 rounded-full ${accuracyDisplay.bgColor}`}></div>
              <span className="text-xs text-muted-foreground">
                ±{userLocation.accuracy.toFixed(1)}م
              </span>
            </div>
          )}
          <Button
            onClick={onRecenter}
            size="icon"
            variant="outline"
            title="العودة إلى موقعك"
            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground border-border/50 hover:border-primary/50 transition-colors"
          >
            <span className="text-xs sm:text-sm">🎯</span>
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
