import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationFormProps } from './types';

// Location Form Component
export const LocationForm = ({
  selectedLocation,
  editableAddress,
  setEditableAddress,
  landmark,
  setLandmark,
  deliveryNote,
  setDeliveryNote,
  onSave,
  onClear
}: LocationFormProps) => {
  if (!selectedLocation) {
    return (
      <div className="text-xs text-muted-foreground">
        انقر على الخريطة لتحديد موقع العميل
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Address Input */}
      <div className="bg-muted/50 rounded px-3 py-2 transition-all duration-200 hover:bg-muted/70 focus-within:bg-muted/80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-1">
        <div className="text-xs text-muted-foreground mb-1">العنوان</div>
        <Input
          value={editableAddress}
          onChange={(e) => setEditableAddress(e.target.value)}
          placeholder="أدخل العنوان المطلوب"
          className="text-xs text-primary border-0 bg-transparent p-0 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-muted-foreground/60"
          dir="rtl"
        />
      </div>

      {/* Landmark Input */}
      <div className="bg-muted/50 rounded px-3 py-2 transition-all duration-200 hover:bg-muted/70 focus-within:bg-muted/80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-1">
        <div className="text-xs text-muted-foreground mb-1">معلم قريب</div>
        <Input
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          placeholder="مثال: بجانب مسجد، مقابل بنك، أمام مدرسة..."
          className="text-xs text-primary border-0 bg-transparent p-0 focus:outline-none focus:ring-0 transition-colors duration-200 placeholder:text-muted-foreground/60"
          dir="rtl"
        />
      </div>

      {/* Delivery Note Input */}
      <div className="bg-muted/50 rounded px-3 py-2 transition-all duration-200 hover:bg-muted/70 focus-within:bg-muted/80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-1">
        <div className="text-xs text-muted-foreground mb-1">ملاحظات التوصيل</div>
        <textarea
          value={deliveryNote}
          onChange={(e) => setDeliveryNote(e.target.value)}
          placeholder="مثال: الطابق الثالث، الشقة 301، اترك الطرد مع الجار..."
          className="w-full text-xs text-primary border-0 bg-transparent p-0 focus:outline-none focus:ring-0 resize-none transition-colors duration-200 placeholder:text-muted-foreground/60"
          dir="rtl"
          rows={2}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-border/50">
        <Button
          variant="outline"
          onClick={onClear}
          disabled={!landmark && !deliveryNote}
          className="flex-1 h-10 text-sm font-medium transition-all duration-200 hover:bg-muted/50 hover:border-primary/30"
        >
          <span className="mr-2">🗑️</span>
          مسح الحقول
        </Button>
        <Button
          onClick={onSave}
          disabled={!selectedLocation}
          className="flex-1 h-10 text-sm font-medium bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span className="mr-2">💾</span>
          حفظ الموقع
        </Button>
      </div>
    </div>
  );
};


