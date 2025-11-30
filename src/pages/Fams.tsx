import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, MapPin, Swords, Target, UserPlus } from "lucide-react";

const Fams = () => {
  const exampleFams = [
    {
      id: 1,
      name: "Mumbai Krump Warriors",
      city: "Mumbai",
      bigHomie: "OG Street King",
      members: 12,
      generation: 3,
      description: "Bringing raw energy to the streets of Mumbai since 2020",
      recruitmentStatus: "scouting",
      auditionLink: null,
    },
    {
      id: 2,
      name: "Delhi Street Legends",
      city: "Delhi",
      bigHomie: "Lil Thunder",
      members: 8,
      generation: 2,
      description: "Pioneering the Krump movement in North India",
      recruitmentStatus: "auditions_open",
      auditionLink: "details-here",
    },
    {
      id: 3,
      name: "Bangalore Battle Squad",
      city: "Bangalore",
      bigHomie: "Big Homie Beast",
      members: 15,
      generation: 4,
      description: "Tech city dancers with unmatched intensity",
      recruitmentStatus: "closed_circle",
      auditionLink: null,
    },
  ];

  const challenges = [
    {
      id: 1,
      from: "Mumbai Krump Warriors",
      to: "Delhi Street Legends",
      format: "5v5",
      message: "We want smoke at IKF! 5v5 battle."
    }
  ];

  const getRecruitmentBadge = (status: string) => {
    switch (status) {
      case "closed_circle":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500">🔒 Closed Circle</Badge>;
      case "scouting":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">👀 Scouting</Badge>;
      case "auditions_open":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">✅ Auditions Open</Badge>;
      default:
        return null;
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
                  Krump Fams
                </h1>
                <p className="text-muted-foreground">
                  Digital Headquarters - Discover families and their lineage
                </p>
              </div>
              <Button variant="web3" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Fam Page
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Hit List Section */}
          <Card className="mb-8 border-secondary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-secondary" />
                The Hit List
              </CardTitle>
              <CardDescription>Active Fam-to-Fam challenges</CardDescription>
            </CardHeader>
            <CardContent>
              {challenges.map((challenge) => (
                <div key={challenge.id} className="p-4 border border-border rounded-lg bg-gradient-card">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-bold text-lg">
                        <span className="text-primary">{challenge.from}</span>
                        {" vs "}
                        <span className="text-secondary">{challenge.to}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{challenge.message}</p>
                      <Badge className="mt-2">{challenge.format}</Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      View Challenge
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fams Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exampleFams.map((fam) => (
              <Card key={fam.id} className="hover:shadow-glow transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="h-16 w-16 rounded-full bg-gradient-accent flex items-center justify-center">
                      <Users className="h-8 w-8 text-background" />
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {fam.city}
                      </div>
                      {getRecruitmentBadge(fam.recruitmentStatus)}
                    </div>
                  </div>
                  
                  <CardTitle>{fam.name}</CardTitle>
                  <CardDescription>{fam.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Family Tree Info */}
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Big Homie</p>
                    <p className="font-semibold">{fam.bigHomie}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div>
                        <span className="font-bold text-primary">{fam.members}</span>
                        <span className="text-muted-foreground"> members</span>
                      </div>
                      <div>
                        <span className="font-bold text-secondary">Gen {fam.generation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recruitment Board */}
                  {fam.recruitmentStatus === "auditions_open" && (
                    <div className="p-3 border-2 border-green-500/50 rounded-lg bg-green-500/5">
                      <div className="flex items-center gap-2 mb-2">
                        <UserPlus className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-sm">Auditions Open!</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        View Audition Details
                      </Button>
                    </div>
                  )}

                  {fam.recruitmentStatus === "scouting" && (
                    <div className="p-3 border border-yellow-500/50 rounded-lg bg-yellow-500/5">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Looking for new talent</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Fam
                    </Button>
                    <Button variant="default" size="sm" className="flex-1">
                      Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-card border-primary/20">
              <h3 className="font-bold mb-3 text-primary flex items-center gap-2">
                <Users className="h-5 w-5" />
                The Family Tree
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Each Fam page displays a visual lineage diagram showing:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Big Homie (Admin) → First Gen → Second Gen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Clear mentor relationships</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Generational hierarchy</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-card border-secondary/20">
              <h3 className="font-bold mb-3 text-secondary flex items-center gap-2">
                <Swords className="h-5 w-5" />
                Challenge Other Fams
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Post friendly challenges directly on Fam pages. Call out specific Fams for battles:
              </p>
              <div className="p-3 bg-background/50 rounded border border-border text-sm italic">
                "We want a 5v5 with [Other Fam] at IKF 2024"
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Fam culture is the backbone of Indian Krump. Give Fams formal pages to legitimize beyond WhatsApp groups.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Fams;
