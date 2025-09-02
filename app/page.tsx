"use client";

import { useState } from "react";
import GoogleMapSimple from "../components/google-maps/GoogleMapApiKey";
import type { LocationData } from "../components/google-maps/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import Swal from "sweetalert2";

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
  const [address, setAddress] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [deliveryNote, setDeliveryNote] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<LocationData | null>(null);

  const handleSave = (data: LocationData) => {
    setTitle(data.title || "");
    setAddress(data.address);
    setLandmark(data.landmark);
    setDeliveryNote(data.deliveryNote);
    setCoordinates(data.coordinates);
    setPendingData(data);
    setConfirmOpen(true);
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
  };

  const handleConfirmSave = () => {
    setConfirmOpen(false);
    const payload = pendingData;
    Swal.fire({
      title: "جارٍ حفظ البيانات...",
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => {
          Swal.fire({
            icon: "success",
            title: "تم حفظ الموقع بنجاح",
            html: `<div style='text-align:right;direction:rtl'>
              <div>عنوان الموقع: ${payload?.title || "—"}</div>
              <div>الإحداثيات: [${payload?.coordinates.lat.toFixed(6)}, ${payload?.coordinates.lng.toFixed(6)}]</div>
              <div>العنوان: ${payload?.address || "—"}</div>
              <div>معلم قريب: ${payload?.landmark || "—"}</div>
              <div>ملاحظات التوصيل: ${payload?.deliveryNote || "—"}</div>
            </div>`
          });
        }, 800);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">

      <GoogleMapSimple
        className="w-full"
        apiKey={apiKey}
        clientTitle={title}
        clientAddress={address}
        clientLandmark={landmark}
        clientDeliveryNote={deliveryNote}
        clientLocation={coordinates ?? undefined}
        onSave={handleSave}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حفظ الموقع</DialogTitle>
            <DialogDescription>يرجى مراجعة البيانات قبل التأكيد.</DialogDescription>
          </DialogHeader>
          {pendingData && (
            <div className="text-sm space-y-2">
              <div>عنوان الموقع: {pendingData.title || "—"}</div>
              <div>الإحداثيات: [{pendingData.coordinates.lat.toFixed(6)}, {pendingData.coordinates.lng.toFixed(6)}]</div>
              <div>العنوان: {pendingData.address || "—"}</div>
              <div>معلم قريب: {pendingData.landmark || "—"}</div>
              <div>ملاحظات التوصيل: {pendingData.deliveryNote || "—"}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={handleCancelConfirm}>إلغاء</Button>
            <Button onClick={handleConfirmSave}>تأكيد</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
