import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Upload, ShieldCheck, Wallet, Swords, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [styleTags, setStyleTags] = useState<any[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    krump_name: "",
    display_name: "",
    rank: "new_boot",
    bio: "",
    city: "",
    instagram_handle: "",
    call_out_status: "labbin",
    battle_wins: 0,
    battle_losses: 0,
    battle_draws: 0,
  });

  useEffect(() => {
    loadStyleTags();
  }, []);

  const loadStyleTags = async () => {
    const { data } = await supabase.from("style_tags").select("*");
    if (data) setStyleTags(data);
  };

  const toggleStyleTag = (tagId: string) => {
    setSelectedStyles(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Note: Full profile creation requires authentication implementation
    toast({
      title: "Coming Soon!",
      description: "Profile creation will be enabled once authentication is implemented.",
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-16">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                Please connect your wallet to create your dancer profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectButton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">
              Create Your Krump Resume
            </h1>
            <p className="text-muted-foreground">
              The Stat Sheet - Build credibility and establish your identity
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="display-name">Display Name *</Label>
                        <Input
                          id="display-name"
                          value={formData.display_name}
                          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                          placeholder="Your real name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="krump-name">Krump Name *</Label>
                        <Input
                          id="krump-name"
                          value={formData.krump_name}
                          onChange={(e) => setFormData({ ...formData, krump_name: e.target.value })}
                          placeholder="e.g., Lil Beast"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rank">Rank / Status *</Label>
                        <Select
                          value={formData.rank}
                          onValueChange={(value) => setFormData({ ...formData, rank: value })}
                        >
                          <SelectTrigger id="rank">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new_boot">New Boot</SelectItem>
                            <SelectItem value="young">Young</SelectItem>
                            <SelectItem value="jr">Jr</SelectItem>
                            <SelectItem value="sr">Sr</SelectItem>
                            <SelectItem value="og">OG</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Your city"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="instagram">Instagram Handle</Label>
                      <Input
                        id="instagram"
                        value={formData.instagram_handle}
                        onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                        placeholder="@yourhandle"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Your Krump journey..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-secondary" />
                      Battle Record
                    </CardTitle>
                    <CardDescription>Manual input or verified record of your battles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="wins">Wins</Label>
                        <Input
                          id="wins"
                          type="number"
                          min="0"
                          value={formData.battle_wins}
                          onChange={(e) => setFormData({ ...formData, battle_wins: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="losses">Losses</Label>
                        <Input
                          id="losses"
                          type="number"
                          min="0"
                          value={formData.battle_losses}
                          onChange={(e) => setFormData({ ...formData, battle_losses: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="draws">Draws</Label>
                        <Input
                          id="draws"
                          type="number"
                          min="0"
                          value={formData.battle_draws}
                          onChange={(e) => setFormData({ ...formData, battle_draws: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Style Tags</CardTitle>
                    <CardDescription>Select tags that describe your Krump flavor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {styleTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedStyles.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => toggleStyleTag(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Helps others understand your style before meeting
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Swords className="h-5 w-5 text-primary" />
                      "Call-Out" Status
                    </CardTitle>
                    <CardDescription>Ready to battle or focusing on practice?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border-2 rounded-lg"
                         style={{ borderColor: formData.call_out_status === "ready_for_smoke" ? "hsl(var(--primary))" : "hsl(var(--border))" }}>
                      <div>
                        <p className="font-bold text-lg">
                          {formData.call_out_status === "ready_for_smoke" ? "🔥 Ready for Smoke" : "🛠️ Labbin' / DND"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formData.call_out_status === "ready_for_smoke"
                            ? "Green light - Others can send battle challenges"
                            : "Red light - Focusing on practice, no challenges"}
                        </p>
                      </div>
                      <Switch
                        checked={formData.call_out_status === "ready_for_smoke"}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            call_out_status: checked ? "ready_for_smoke" : "labbin",
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Human Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Verify with World ID to unlock all features
                    </p>
                    <Button type="button" variant="outline" className="w-full">
                      Verify with World ID
                    </Button>
                    
                    <div className="pt-4 border-t border-border">
                      <h4 className="font-semibold mb-2">Unlock:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Host sessions</li>
                        <li>• Submit events</li>
                        <li>• Send battle challenges</li>
                        <li>• Create Fam pages</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Connected Wallet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg break-all">
                      <Wallet className="h-4 w-4 text-primary flex-shrink-0" />
                      <code className="text-xs">{address}</code>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" disabled={loading} className="w-full" variant="web3" size="lg">
                  {loading ? "Creating..." : "Create Profile"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
