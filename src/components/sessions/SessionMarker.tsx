import { Marker, Popup } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Clock, Users } from "lucide-react";
import L from "leaflet";
import { format } from "date-fns";

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const yellowIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Session {
  id: string;
  name: string;
  session_type: string;
  location_name: string;
  latitude: number;
  longitude: number;
  session_date: string;
  duration_minutes: number | null;
  description: string | null;
  max_participants: number | null;
  is_fam_only: boolean;
  host: {
    display_name: string;
    krump_name: string | null;
  } | null;
}

interface SessionMarkerProps {
  session: Session;
  onRequestJoin: (sessionId: string) => void;
  isRequesting: boolean;
}

export const SessionMarker = ({ session, onRequestJoin, isRequesting }: SessionMarkerProps) => {
  const getSessionIcon = (type: string) => {
    switch (type) {
      case "casual_practice": return blueIcon;
      case "heavy_lab": return redIcon;
      case "workshop": return yellowIcon;
      default: return blueIcon;
    }
  };

  const getSessionBadge = (type: string) => {
    switch (type) {
      case "casual_practice": return { label: "Casual Practice", color: "bg-blue-500" };
      case "heavy_lab": return { label: "Heavy Lab", color: "bg-red-500" };
      case "workshop": return { label: "Workshop", color: "bg-yellow-500" };
      default: return { label: "Session", color: "bg-muted" };
    }
  };

  const badge = getSessionBadge(session.session_type);
  const hostName = session.host?.krump_name || session.host?.display_name || "Unknown Host";

  return (
    <Marker 
      position={[session.latitude, session.longitude]}
      icon={getSessionIcon(session.session_type)}
    >
      <Popup className="session-popup" minWidth={250}>
        <div className="p-2">
          <Badge className={`${badge.color} mb-2 text-white`}>{badge.label}</Badge>
          <h3 className="font-bold text-lg mb-1 text-foreground">{session.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Host: <span className="font-semibold text-foreground">{hostName}</span>
          </p>
          
          <div className="space-y-1 mb-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(session.session_date), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(session.session_date), "p")}</span>
              {session.duration_minutes && <span>({session.duration_minutes} min)</span>}
            </div>
            {session.max_participants && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>Max {session.max_participants} participants</span>
              </div>
            )}
          </div>

          {session.description && (
            <p className="text-xs text-muted-foreground mb-3 italic border-l-2 border-primary pl-2">
              {session.description}
            </p>
          )}

          {session.is_fam_only && (
            <Badge variant="outline" className="mb-3">Fam Members Only</Badge>
          )}
          
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => onRequestJoin(session.id)}
            disabled={isRequesting}
          >
            {isRequesting ? "Requesting..." : "Request to Pull Up"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Host will receive notification
          </p>
        </div>
      </Popup>
    </Marker>
  );
};
