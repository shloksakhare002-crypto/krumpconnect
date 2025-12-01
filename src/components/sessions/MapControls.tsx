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

  if (!currentLocation) return null;

  return (
    <div className="leaflet-top leaflet-right" style={{ position: 'absolute', top: '80px', right: '10px', zIndex: 1000 }}>
      <div className="leaflet-control">
        <Button
          size="icon"
          variant="secondary"
          onClick={centerOnUser}
          className="shadow-glow"
          title="Center on my location"
        >
          <Crosshair className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
