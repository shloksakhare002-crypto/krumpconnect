import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Trophy, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  name: string;
  event_type: string;
  event_date: string;
  end_date: string | null;
  city: string;
  region: string | null;
  location_name: string;
  description: string | null;
  organizer_id: string;
  max_participants: number | null;
  is_ikf_qualifier: boolean | null;
  flyer_url: string | null;
  registration_link: string | null;
  profiles?: {
    display_name: string;
  };
}

const Events = () => {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles:organizer_id (display_name)
        `)
        .eq("status", "pending")
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getEventTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("major") || lowerType.includes("qualifier")) {
      return "bg-gradient-accent text-background";
    }
    if (lowerType.includes("battle")) {
      return "bg-secondary text-secondary-foreground";
    }
    if (lowerType.includes("workshop")) {
      return "bg-primary text-primary-foreground";
    }
    if (lowerType.includes("jam")) {
      return "bg-accent text-accent-foreground";
    }
    return "bg-muted text-muted-foreground";
  };

  const getEventTypeLabel = (type: string) => {
    return type.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const filteredEvents = events.filter(event => {
    const regionMatch = selectedRegion === "all" || event.region === selectedRegion;
    const typeMatch = selectedType === "all" || event.event_type === selectedType;
    return regionMatch && typeMatch;
  });

  const nextIKFEvent = events.find(e => e.is_ikf_qualifier);
  const daysUntilIKF = nextIKFEvent 
    ? Math.ceil((new Date(nextIKFEvent.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">
                  Event Calendar
                </h1>
                <p className="text-muted-foreground">
                  The Central Nervous System - All Krump events across India
                </p>
              </div>
              <CreateEventDialog onEventCreated={fetchEvents} />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {nextIKFEvent && daysUntilIKF !== null && daysUntilIKF > 0 && (
            <Card className="mb-8 border-2 border-primary/50 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Trophy className="h-12 w-12 text-primary" />
                    <div>
                      <h2 className="text-2xl font-bold">{nextIKFEvent.name}</h2>
                      <p className="text-muted-foreground">Next IKF Qualifier Event</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-3xl font-bold text-primary">
                      <Clock className="h-8 w-8" />
                      {daysUntilIKF} Days
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">until {nextIKFEvent.name}</p>
                    {nextIKFEvent.registration_link && (
                      <Button variant="default" className="mt-3" asChild>
                        <a href={nextIKFEvent.registration_link} target="_blank" rel="noopener noreferrer">
                          Register Now
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="North">North India</SelectItem>
                  <SelectItem value="South">South India</SelectItem>
                  <SelectItem value="East">East India</SelectItem>
                  <SelectItem value="West">West India</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="major_event">Major Events</SelectItem>
                  <SelectItem value="battle">Battles</SelectItem>
                  <SelectItem value="workshop">Workshops</SelectItem>
                  <SelectItem value="jam">Jam Sessions</SelectItem>
                  <SelectItem value="qualifier">Qualifiers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Events List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events found. Be the first to create one!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className={`hover:shadow-glow transition-shadow ${event.is_ikf_qualifier ? 'border-2 border-primary/30' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {event.flyer_url && (
                        <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={event.flyer_url} 
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <Badge className={getEventTypeColor(event.event_type)}>
                            {getEventTypeLabel(event.event_type)}
                          </Badge>
                          {event.is_ikf_qualifier && (
                            <Badge variant="outline" className="border-primary text-primary">
                              🏆 IKF Qualifier
                            </Badge>
                          )}
                          <h3 className="text-xl font-bold">{event.name}</h3>
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.event_date).toLocaleDateString('en-IN', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location_name}, {event.city}
                            {event.region && `, ${event.region} India`}
                          </div>
                          
                          {event.max_participants && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Max {event.max_participants} participants
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm mt-2">
                          Organized by <span className="font-medium text-foreground">
                            {event.profiles?.display_name || "Unknown"}
                          </span>
                        </p>
                        
                        <div className="flex gap-2 mt-4">
                          {event.registration_link ? (
                            <Button variant="default" asChild>
                              <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                                Register Now
                              </a>
                            </Button>
                          ) : (
                            <Button variant="default" disabled>
                              Registration Coming Soon
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Cards */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-card">
              <MapPin className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">Regional Filters</h3>
              <p className="text-sm text-muted-foreground">
                Easily find events in your region: "Show me battles in Mumbai", "Workshops in Delhi", or "Sessions in Bangalore"
              </p>
            </Card>
            
            <Card className="p-6 bg-gradient-card">
              <Trophy className="h-8 w-8 text-secondary mb-4" />
              <h3 className="font-bold mb-2">IKF Integration</h3>
              <p className="text-sm text-muted-foreground">
                Dedicated countdown for Indian Krump Festival. All "Road to IKF" qualifiers highlighted in gold.
              </p>
            </Card>
            
            <Card className="p-6 bg-gradient-card">
              <Users className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-bold mb-2">Direct Registration</h3>
              <p className="text-sm text-muted-foreground">
                No Google Forms - click "Register" to instantly send your Name, Krump Name, and Category to organizers.
              </p>
            </Card>
          </div>

          {/* Submit Event CTA */}
          <Card className="mt-8 p-8 border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Hosting an Event?</h3>
                <p className="text-muted-foreground">
                  Submit your event to the community calendar. Major events can be minted 
                  as verifiable records on Story Protocol for permanent documentation.
                </p>
              </div>
              <CreateEventDialog onEventCreated={fetchEvents} />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Events;
