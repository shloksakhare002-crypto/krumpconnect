import Navbar from "@/components/layout/Navbar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Plus, Star, Shield } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom marker icons for different session types
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

const Sessions = () => {
  const defaultCenter: [number, number] = [20.5937, 78.9629];

  // Example sessions with different types
  const exampleSessions = [
    {
      id: 1,
      position: [19.0760, 72.8777] as [number, number],
      name: "Mumbai Beach Session",
      type: "casual_practice",
      host: "Lil Street",
      time: "Tonight 6 PM",
      rating: 4.5,
      spotNotes: "Good floor, has speakers"
    },
    {
      id: 2,
      position: [28.7041, 77.1025] as [number, number],
      name: "Delhi Heavy Lab",
      type: "heavy_lab",
      host: "Big Homie K",
      time: "Sunday 4 PM",
      rating: 4.8,
      spotNotes: "Private studio, approval needed"
    },
    {
      id: 3,
      position: [12.9716, 77.5946] as [number, number],
      name: "Bangalore Workshop",
      type: "workshop",
      host: "OG Krump Master",
      time: "Next Week",
      rating: 5.0,
      spotNotes: "Professional space, bring water"
    }
  ];

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
      case "casual_practice": return { label: "Casual Practice", class: "bg-blue-500" };
      case "heavy_lab": return { label: "Heavy Lab", class: "bg-red-500" };
      case "workshop": return { label: "Workshop", class: "bg-yellow-500" };
      default: return { label: "Session", class: "bg-gray-500" };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">
                  Session Finder
                </h1>
                <p className="text-muted-foreground">
                  The "Pokemon Go" for Krumpers - Find and join sessions near you
                </p>
              </div>
              <Button variant="web3" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Host a Session
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Legend */}
          <div className="mb-6 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm">Casual Practice (Open to all)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm">Heavy Lab (Invite/Approval)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Workshop/Class</span>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-border shadow-glow" style={{ height: "600px" }}>
            <MapContainer
              center={defaultCenter}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {exampleSessions.map((session) => {
                const badge = getSessionBadge(session.type);
                return (
                  <Marker 
                    key={session.id} 
                    position={session.position}
                    icon={getSessionIcon(session.type)}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <Badge className={`${badge.class} mb-2`}>{badge.label}</Badge>
                        <h3 className="font-bold text-lg mb-1">{session.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">Host: {session.host}</p>
                        <p className="text-sm mb-2">{session.time}</p>
                        
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold">{session.rating}</span>
                          <span className="text-xs text-gray-500">spot rating</span>
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-3 italic">"{session.spotNotes}"</p>
                        
                        <Button size="sm" className="w-full">
                          Request to Pull Up
                        </Button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Host will receive notification
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Features Grid */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-card">
              <MapPin className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">Check-In Feature</h3>
              <p className="text-sm text-muted-foreground">
                Can't just see a session - you must "Request to Pull Up". Host approves to prevent overcrowding and keep sessions safe.
              </p>
            </Card>
            
            <Card className="p-6 bg-gradient-card">
              <Star className="h-8 w-8 text-secondary mb-4" />
              <h3 className="font-bold mb-2">Spot Rating</h3>
              <p className="text-sm text-muted-foreground">
                After sessions, rate locations on floor quality, safety, and equipment. See reviews like "Good floor" or "Cops chase you away".
              </p>
            </Card>
            
            <Card className="p-6 bg-gradient-card">
              <Shield className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-bold mb-2">Safety Protocol</h3>
              <p className="text-sm text-muted-foreground">
                Sessions only visible to verified accounts (linked Instagram/Phone) to prevent misuse and maintain community safety.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sessions;
