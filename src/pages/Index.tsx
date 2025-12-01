import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import { MapPin, Users, Calendar, Shield, Zap, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Connect. Dance.{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Own Your Art.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              India's first decentralized social network for Krump dancers. 
              Built on Web3, powered by the community, owned by you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to={user ? "/profile" : "/auth"}>
                  {user ? "View Your Profile" : "Get Started"}
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/sessions">Explore Sessions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-primary">Connect</span> and{" "}
              <span className="text-secondary">Create</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From finding sessions to minting your performances, Krump India Connect 
              is your complete platform for the Krump community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 bg-gradient-card hover:shadow-cyan transition-all">
              <MapPin className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Session Finder</h3>
              <p className="text-muted-foreground">
                Discover Krump sessions near you with our GPS-powered map. 
                Check-in, host events, and connect with dancers in your city.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card hover:shadow-orange transition-all">
              <Users className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Fam Pages</h3>
              <p className="text-muted-foreground">
                Create verified pages for your Krump family. Showcase your crew, 
                recruit members, and build your collective identity.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card hover:shadow-glow transition-all">
              <Calendar className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-xl font-bold mb-2">Event Calendar</h3>
              <p className="text-muted-foreground">
                Stay updated with battles, workshops, and jams happening across India. 
                Submit your own events to the community calendar.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card hover:shadow-cyan transition-all">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">World ID Verification</h3>
              <p className="text-muted-foreground">
                Human-verified identity system prevents spam and builds trust. 
                Prove you're real, unlock full features.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card hover:shadow-orange transition-all">
              <Zap className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">NFT Minting</h3>
              <p className="text-muted-foreground">
                Mint your performances, artwork, and identity on Story Protocol. 
                Own your content with verifiable on-chain provenance.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card hover:shadow-glow transition-all">
              <Globe className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-xl font-bold mb-2">IPFS Storage</h3>
              <p className="text-muted-foreground">
                All your media stored permanently on IPFS. Your videos, images, 
                and data remain yours forever.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <Card className="p-12 bg-gradient-hero text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-accent opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join the Movement
              </h2>
              <p className="text-xl mb-8 text-foreground/80 max-w-2xl mx-auto">
                Be part of India's first Web3-powered Krump community. 
                Connect your wallet, verify your identity, and start building your legacy.
              </p>
              <Button variant="web3" size="lg" asChild>
                <Link to={user ? "/profile" : "/auth"}>
                  {user ? "Go to Dashboard" : "Get Started"}
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent mb-4">
                Krump India Connect
              </div>
              <p className="text-sm text-muted-foreground">
                Decentralized social network for the Indian Krump community. 
                Built with Story Protocol, IPFS, and World ID.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/sessions" className="hover:text-foreground transition-colors">Sessions</Link></li>
                <li><Link to="/fams" className="hover:text-foreground transition-colors">Fams</Link></li>
                <li><Link to="/events" className="hover:text-foreground transition-colors">Events</Link></li>
                <li><Link to="/profile" className="hover:text-foreground transition-colors">Profile</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Story Protocol</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">World ID</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>Built with ❤️ for the Krump community in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
