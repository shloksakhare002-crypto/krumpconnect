import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Plus, Users, Trophy, Clock } from "lucide-react";
import { useState } from "react";

const Events = () => {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const upcomingEvents = [
    {
      id: 1,
      name: "Indian Krump Festival 2024",
      type: "Major Event",
      date: "2024-12-15",
      countdown: "45 days",
      location: "Mumbai",
      region: "West",
      organizer: "IKF Committee",
      attendees: 250,
      isIKF: true,
      description: "The biggest Krump event of the year",
    },
    {
      id: 2,
      name: "Krump Wars Delhi Qualifier",
      type: "Battle",
      date: "2024-12-20",
      countdown: "50 days",
      location: "Delhi",
      region: "North",
      organizer: "Delhi Street Legends",
      attendees: 45,
      isIKF: true,
      description: "Road to IKF qualifier event",
    },
    {
      id: 3,
      name: "Advanced Krump Workshop",
      type: "Workshop",
      date: "2024-12-22",
      countdown: "52 days",
      location: "Mumbai",
      region: "West",
      organizer: "Mumbai Krump Warriors",
      attendees: 28,
      isIKF: false,
      description: "Master techniques with OG krumpers",
    },
    {
      id: 4,
      name: "Unity Jam Session",
      type: "Jam",
      date: "2024-12-25",
      countdown: "55 days",
      location: "Bangalore",
      region: "South",
      organizer: "Bangalore Battle Squad",
      attendees: 32,
      isIKF: false,
      description: "Community practice and freestyle",
    },
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Major Event":
        return "bg-gradient-accent text-background";
      case "Battle":
        return "bg-secondary text-secondary-foreground";
      case "Workshop":
        return "bg-primary text-primary-foreground";
      case "Jam":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredEvents = upcomingEvents.filter(event => {
    const regionMatch = selectedRegion === "all" || event.region === selectedRegion;
    const typeMatch = selectedType === "all" || event.type === selectedType;
    return regionMatch && typeMatch;
  });

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
              <Button variant="web3" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Submit Event
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* IKF Countdown Banner */}
          <Card className="mb-8 border-2 border-primary/50 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Trophy className="h-12 w-12 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">Indian Krump Festival 2024</h2>
                    <p className="text-muted-foreground">The biggest event of the year</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-3xl font-bold text-primary">
                    <Clock className="h-8 w-8" />
                    45 Days
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">until IKF 2024</p>
                  <Button variant="default" className="mt-3">
                    Register Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <SelectItem value="Major Event">Major Events</SelectItem>
                  <SelectItem value="Battle">Battles</SelectItem>
                  <SelectItem value="Workshop">Workshops</SelectItem>
                  <SelectItem value="Jam">Jam Sessions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className={`hover:shadow-glow transition-shadow ${event.isIKF ? 'border-2 border-primary/30' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                        {event.isIKF && (
                          <Badge variant="outline" className="border-primary text-primary">
                            🏆 IKF Qualifier
                          </Badge>
                        )}
                        <h3 className="text-xl font-bold">{event.name}</h3>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString('en-IN', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}, {event.region} India
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.attendees} registered
                        </div>
                      </div>
                      
                      <p className="text-sm mt-2">
                        Organized by <span className="font-medium text-foreground">{event.organizer}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <Button variant="default" className="w-full">
                        Register Now
                      </Button>
                      <Button variant="outline" className="w-full">
                        Details
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-1">
                        One-click registration
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
              <Button variant="web3" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Submit Event
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Events;
