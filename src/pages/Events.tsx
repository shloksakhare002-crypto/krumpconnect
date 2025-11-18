import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Plus, Users } from "lucide-react";

const Events = () => {
  // Example events
  const upcomingEvents = [
    {
      id: 1,
      name: "Krump Wars Delhi 2024",
      type: "Battle",
      date: "2024-12-15",
      location: "Delhi",
      organizer: "Delhi Street Legends",
      attendees: 45,
    },
    {
      id: 2,
      name: "Advanced Krump Workshop",
      type: "Workshop",
      date: "2024-12-20",
      location: "Mumbai",
      organizer: "Mumbai Krump Warriors",
      attendees: 28,
    },
    {
      id: 3,
      name: "Unity Jam Session",
      type: "Jam",
      date: "2024-12-25",
      location: "Bangalore",
      organizer: "Bangalore Battle Squad",
      attendees: 32,
    },
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
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
                  Event Calendar
                </h1>
                <p className="text-muted-foreground">
                  Discover Krump events, battles, and workshops across India
                </p>
              </div>
              <Button variant="web3" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Submit Event
              </Button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
          
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="p-6 hover:shadow-glow transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      <h3 className="text-xl font-bold">{event.name}</h3>
                    </div>
                    
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
                        {event.location}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.attendees} interested
                      </div>
                    </div>
                    
                    <p className="text-sm mt-2">
                      Organized by <span className="font-medium text-foreground">{event.organizer}</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline">
                      Details
                    </Button>
                    <Button variant="default">
                      I'm Interested
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-card">
              <Calendar className="h-8 w-8 text-secondary mb-4" />
              <h3 className="font-bold mb-2">Battles</h3>
              <p className="text-sm text-muted-foreground">
                Competitive events where dancers showcase their skills and compete for glory
              </p>
            </Card>
            
            <Card className="p-6 bg-gradient-card">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">Workshops</h3>
              <p className="text-sm text-muted-foreground">
                Learn from experienced dancers and refine your technique
              </p>
            </Card>
            
            <Card className="p-6 bg-gradient-card">
              <MapPin className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-bold mb-2">Jam Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Freestyle sessions where the community comes together to practice and connect
              </p>
            </Card>
          </div>

          {/* Submit Event Info */}
          <Card className="mt-8 p-8 border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Hosting an Event?</h3>
                <p className="text-muted-foreground">
                  Submit your event to the community calendar. Major events can be minted 
                  as verifiable records on Story Protocol.
                </p>
              </div>
              <Button variant="web3" size="lg">
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
