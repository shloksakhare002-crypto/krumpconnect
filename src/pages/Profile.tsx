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
import { Upload, ShieldCheck, Wallet, Swords, Trophy, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { profileSchema } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { WorldIDVerification } from "@/components/WorldIDVerification";
import { KNSRegistration } from "@/components/profile/KNSRegistration";
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload";

const Profile = () => {
  const { address, isConnected } = useAccount();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{
    display_name: string;
    krump_name: string;
    bio: string;
    city: string;
    instagram_handle: string;
    rank: "new_boot" | "young" | "jr" | "sr" | "og";
    call_out_status: "labbin" | "ready_for_smoke";
  }>({
    display_name: "",
    krump_name: "",
    bio: "",
    city: "",
    instagram_handle: "",
    rank: "new_boot",
    call_out_status: "labbin",
  });

  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [profilePictureIpfs, setProfilePictureIpfs] = useState<string>("");
  const [hasProfile, setHasProfile] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [worldIdVerified, setWorldIdVerified] = useState(false);
  const [styleTags, setStyleTags] = useState<any[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    loadStyleTags();
  }, []);

  useEffect(() => {
    // Load existing profile if available
    const loadProfile = async () => {
      if (!user || !address) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setHasProfile(true);
        setProfileId(data.id);
        setFormData({
          display_name: data.display_name || "",
          krump_name: data.krump_name || "",
          bio: data.bio || "",
          city: data.city || "",
          instagram_handle: data.instagram_handle || "",
          rank: data.rank || "new_boot",
          call_out_status: data.call_out_status || "labbin",
        });
        setProfilePictureUrl(data.profile_picture_url || "");
        setProfilePictureIpfs(data.profile_picture_ipfs || "");
        setWorldIdVerified(data.world_id_verified || false);
      }
    };

    loadProfile();
  }, [user, address]);

  const loadStyleTags = async () => {
    const { data } = await supabase.from("style_tags").select("*");
    if (data) setStyleTags(data);
  };

  const toggleStyleTag = (tagId: string) => {
    setSelectedStyles(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleProfilePictureUpload = (ipfsData: { url: string; ipfs: string }) => {
    setProfilePictureUrl(ipfsData.url);
    setProfilePictureIpfs(ipfsData.ipfs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !address) {
      toast({
        title: "Error",
        description: "Please connect your wallet and sign in",
        variant: "destructive",
      });
      return;
    }

    // Validate form data
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    try {
      const profileData = {
        ...formData,
        user_id: user.id,
        wallet_address: address,
        profile_picture_url: profilePictureUrl || null,
        profile_picture_ipfs: profilePictureIpfs || null,
      };

      if (hasProfile && profileId) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", profileId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("profiles")
          .insert([profileData])
          .select()
          .single();

        if (error) throw error;

        setProfileId(data.id);
        toast({
          title: "Success",
          description: "Profile created successfully",
        });
        setHasProfile(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleWorldIDSuccess = () => {
    setWorldIdVerified(true);
    toast({
      title: "Verified!",
      description: "Your World ID has been verified successfully",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
              {hasProfile ? "Edit Your Profile" : "Create Your Krump Resume"}
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
                    {/* Profile Picture Upload */}
                    <ProfilePictureUpload
                      currentUrl={profilePictureUrl}
                      onUploadSuccess={handleProfilePictureUpload}
                      displayName={formData.display_name}
                    />

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
                        <Label htmlFor="krump-name">Krump Name</Label>
                        <Input
                          id="krump-name"
                          value={formData.krump_name}
                          onChange={(e) => setFormData({ ...formData, krump_name: e.target.value })}
                          placeholder="e.g., Lil Beast"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rank">Rank / Status *</Label>
                        <Select
                          value={formData.rank}
                          onValueChange={(value) => setFormData({ ...formData, rank: value as any })}
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
                    {worldIdVerified ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        Verified Human
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Verify with World ID to unlock all features
                        </p>
                        <WorldIDVerification onSuccess={handleWorldIDSuccess} />
                      </>
                    )}
                    
                    <div className="pt-4 border-t border-border">
                      <h4 className="font-semibold mb-2">Unlock:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Host sessions</li>
                        <li>• Submit events</li>
                        <li>• Register Krump Name (KNS)</li>
                        <li>• Send battle challenges</li>
                        <li>• Create Fam pages</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <KNSRegistration
                  profileId={profileId || ""}
                  currentKrumpName={formData.krump_name}
                  worldIdVerified={worldIdVerified}
                  onNameRegistered={(name) => setFormData({ ...formData, krump_name: name })}
                />

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

                <Button type="submit" className="w-full" variant="web3" size="lg">
                  {hasProfile ? "Update Profile" : "Create Profile"}
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
