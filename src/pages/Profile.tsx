import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Upload } from "lucide-react";
import { useAccount } from "wagmi";

const Profile = () => {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16">
            <Card className="max-w-2xl mx-auto p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Please connect your wallet to create your dancer profile
              </p>
              <div className="flex justify-center">
                <Button variant="web3" size="lg">
                  Connect Wallet
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">
              Create Your Dancer Profile
            </h1>
            <p className="text-muted-foreground">
              Build your decentralized identity in the Krump community
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Form */}
            <Card className="lg:col-span-2 p-6 space-y-6">
              {/* Profile Picture */}
              <div>
                <Label>Profile Picture</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline">Upload Image</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Stored on IPFS. Can be minted as NFT.
                </p>
              </div>

              {/* Display Name */}
              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <Input 
                  id="displayName" 
                  placeholder="Your stage name"
                  className="mt-2"
                />
              </div>

              {/* Krump Name (KNS) */}
              <div>
                <Label htmlFor="krumpName">Krump Name (KNS)</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    id="krumpName" 
                    placeholder="yourname"
                    className="flex-1"
                  />
                  <span className="flex items-center text-muted-foreground">.krump</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Mint your unique Krump identity on Story Protocol
                </p>
              </div>

              {/* Fam Affiliation */}
              <div>
                <Label htmlFor="fam">Krump Fam *</Label>
                <Input 
                  id="fam" 
                  placeholder="Your crew or family"
                  className="mt-2"
                />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="city">City/Location *</Label>
                <Input 
                  id="city" 
                  placeholder="Mumbai, Delhi, etc."
                  className="mt-2"
                />
              </div>

              {/* Style */}
              <div>
                <Label htmlFor="style">Krump Style(s)</Label>
                <Input 
                  id="style" 
                  placeholder="Grime, Rugged, Tech, Abstract..."
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Separate multiple styles with commas
                </p>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Bio/Description</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell the community about yourself..."
                  className="mt-2 min-h-[100px]"
                />
              </div>

              {/* Connected Wallet */}
              <div>
                <Label>Connected Wallet</Label>
                <div className="mt-2 p-3 bg-muted rounded-md font-mono text-sm break-all">
                  {address}
                </div>
              </div>

              <Button variant="web3" size="lg" className="w-full">
                Create Profile
              </Button>
            </Card>

            {/* Verification Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                  <h3 className="font-bold">Human Verification</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Verify your identity with World ID to unlock all features and prevent spam.
                </p>
                <Button variant="outline" className="w-full">
                  Verify with World ID
                </Button>
              </Card>

              <Card className="p-6 bg-gradient-card">
                <h3 className="font-bold mb-3">Why Verify?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Host and attend sessions</li>
                  <li>✓ Mint NFTs on Story Protocol</li>
                  <li>✓ Create Fam pages</li>
                  <li>✓ Submit events</li>
                  <li>✓ Build reputation</li>
                </ul>
              </Card>

              <Card className="p-6 border-primary/20">
                <h3 className="font-bold mb-2 text-primary">Web3 Identity</h3>
                <p className="text-sm text-muted-foreground">
                  Your profile is stored on IPFS and linked to your wallet. You own your data, forever.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
