import Navbar from "@/components/layout/Navbar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { MapPin, Plus } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const Sessions = () => {
  // Default to India center coordinates
  const defaultCenter: [number, number] = [20.5937, 78.9629];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">
                  Session Finder
                </h1>
                <p className="text-muted-foreground">
                  Discover Krump sessions happening near you
                </p>
              </div>
              <Button variant="web3" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Host a Session
              </Button>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="container mx-auto px-4 py-8">
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
              
              {/* Example markers - will be replaced with real data */}
              <Marker position={[19.0760, 72.8777]}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">Mumbai Session</h3>
                    <p className="text-sm text-muted-foreground">Tonight at 6 PM</p>
                  </div>
                </Popup>
              </Marker>
              
              <Marker position={[28.7041, 77.1025]}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">Delhi Practice</h3>
                    <p className="text-sm text-muted-foreground">Sunday 4 PM</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Instructions */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <MapPin className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">Find Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Explore the map to discover Krump sessions near you
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <Plus className="h-8 w-8 text-secondary mb-4" />
              <h3 className="font-bold mb-2">Host Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Create your own session and invite the community
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <MapPin className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-bold mb-2">Check-in</h3>
              <p className="text-sm text-muted-foreground">
                Share your location when practicing to connect with others
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sessions;
