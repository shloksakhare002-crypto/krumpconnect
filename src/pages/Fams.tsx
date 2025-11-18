import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Plus, MapPin } from "lucide-react";

const Fams = () => {
  // Example fam data
  const exampleFams = [
    {
      id: 1,
      name: "Mumbai Krump Warriors",
      city: "Mumbai",
      members: 12,
      description: "Bringing raw energy to the streets of Mumbai since 2020",
    },
    {
      id: 2,
      name: "Delhi Street Legends",
      city: "Delhi",
      members: 8,
      description: "Pioneering the Krump movement in North India",
    },
    {
      id: 3,
      name: "Bangalore Battle Squad",
      city: "Bangalore",
      members: 15,
      description: "Tech city dancers with unmatched intensity",
    },
  ];

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
                  Krump Fams
                </h1>
                <p className="text-muted-foreground">
                  Discover and join Krump families across India
                </p>
              </div>
              <Button variant="web3" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Fam Page
              </Button>
            </div>
          </div>
        </div>

        {/* Fams Grid */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exampleFams.map((fam) => (
              <Card key={fam.id} className="p-6 hover:shadow-glow transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-accent flex items-center justify-center">
                    <Users className="h-8 w-8 text-background" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {fam.city}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{fam.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{fam.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-bold text-primary">{fam.members}</span>
                    <span className="text-muted-foreground"> members</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Fam
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Cards */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-card border-primary/20">
              <h3 className="font-bold mb-3 text-primary">What is a Fam?</h3>
              <p className="text-sm text-muted-foreground">
                A Fam is a crew or collective of Krump dancers who train together, battle together, 
                and represent their unique style and energy. Each Fam has its own identity, values, 
                and contribution to the Krump culture.
              </p>
            </Card>
            
            <Card className="p-6 bg-gradient-card border-secondary/20">
              <h3 className="font-bold mb-3 text-secondary">Create Your Fam</h3>
              <p className="text-sm text-muted-foreground">
                Ready to start your own Fam? Gather your crew, define your mission, and create a 
                verified Fam page. Showcase your collective's work, recruit new members, and build 
                your legacy on the blockchain.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Fams;
