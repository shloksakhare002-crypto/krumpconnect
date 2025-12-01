import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Shield, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HostSessionDialog } from "@/components/sessions/HostSessionDialog";
import { SessionMarker } from "@/components/sessions/SessionMarker";
import { MapControls } from "@/components/sessions/MapControls";
import "leaflet/dist/leaflet.css";

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

const Sessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const { toast } = useToast();

  // Get user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(loc);
          setMapCenter([loc.lat, loc.lng]);
        },
        (error) => {
          console.log("Geolocation error:", error);
          toast({
            title: "Location access denied",
            description: "Enable location to see sessions near you",
          });
        }
      );
    }
  }, [toast]);

  // Fetch sessions from database
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select(`
          *,
          host:profiles!sessions_host_id_fkey (
            display_name,
            krump_name
          )
        `)
        .gte("session_date", new Date().toISOString())
        .order("session_date", { ascending: true });

      if (error) throw error;
      setSessions(data || []);
      setFilteredSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading sessions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Apply filter
  useEffect(() => {
    if (filter === "all") {
      setFilteredSessions(sessions);
    } else {
      setFilteredSessions(sessions.filter(s => s.session_type === filter));
    }
  }, [filter, sessions]);

  // Handle session join request
  const handleRequestJoin = async (sessionId: string) => {
    setRequesting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to request to join sessions",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        toast({
          title: "Profile required",
          description: "Please create your profile first",
          variant: "destructive",
        });
        return;
      }

      // Check if already requested
      const { data: existing } = await supabase
        .from("session_requests")
        .select("id")
        .eq("session_id", sessionId)
        .eq("requester_id", profile.id)
        .single();

      if (existing) {
        toast({
          title: "Already requested",
          description: "You've already requested to join this session",
        });
        return;
      }

      // Create request
      const { error } = await supabase.from("session_requests").insert({
        session_id: sessionId,
        requester_id: profile.id,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Request sent!",
        description: "The host will be notified of your request",
      });
    } catch (error: any) {
      toast({
        title: "Error sending request",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
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
              <HostSessionDialog 
                onSessionCreated={fetchSessions}
                currentLocation={currentLocation}
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filter and Legend */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions ({sessions.length})</SelectItem>
                  <SelectItem value="casual_practice">
                    Casual Practice ({sessions.filter(s => s.session_type === "casual_practice").length})
                  </SelectItem>
                  <SelectItem value="heavy_lab">
                    Heavy Lab ({sessions.filter(s => s.session_type === "heavy_lab").length})
                  </SelectItem>
                  <SelectItem value="workshop">
                    Workshop ({sessions.filter(s => s.session_type === "workshop").length})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-sm">Casual Practice</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm">Heavy Lab</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Workshop</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-border shadow-glow" style={{ height: "600px" }}>
            {loading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1000] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading sessions...</p>
                </div>
              </div>
            )}
            
            <MapContainer
              center={mapCenter}
              zoom={currentLocation ? 13 : 5}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User's current location */}
              {currentLocation && (
                <Circle
                  center={[currentLocation.lat, currentLocation.lng]}
                  radius={100}
                  pathOptions={{
                    color: "hsl(189, 94%, 55%)",
                    fillColor: "hsl(189, 94%, 55%)",
                    fillOpacity: 0.3,
                  }}
                />
              )}

              {/* Session markers */}
              {filteredSessions.map((session) => (
                <SessionMarker
                  key={session.id}
                  session={session}
                  onRequestJoin={handleRequestJoin}
                  isRequesting={requesting}
                />
              ))}

              <MapControls currentLocation={currentLocation} />
            </MapContainer>
          </div>

          {filteredSessions.length === 0 && !loading && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
              <p className="text-muted-foreground">
                {filter === "all" 
                  ? "Be the first to host a session in your area!"
                  : "Try changing the filter or host a new session"
                }
              </p>
            </div>
          )}

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
