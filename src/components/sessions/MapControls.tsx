import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";

interface MapControlsProps {
  currentLocation: { lat: number; lng: number } | null;
}

export const MapControls = ({ currentLocation }: MapControlsProps) => {
  const map = useMap();

  const centerOnUser = () => {
    if (currentLocation) {
      map.flyTo([currentLocation.lat, currentLocation.lng], 13, {
        duration: 1.5
      });
    }
  };

  return (
    <div className="absolute bottom-20 right-4 z-[1000] flex flex-col gap-2">
      <Button
        size="icon"
        variant="secondary"
        onClick={centerOnUser}
        disabled={!currentLocation}
        className="shadow-glow"
        title="Center on my location"
      >
        <Crosshair className="h-5 w-5" />
      </Button>
    </div>
  );
};
