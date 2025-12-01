import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, MapPin, Instagram, Swords, Loader2, ArrowLeft } from "lucide-react";
import { KNSBadge } from "@/components/profile/KNSBadge";
import { CreateChallengeDialog } from "@/components/battles/CreateChallengeDialog";

interface PublicProfileData {
  id: string;
  display_name: string;
  krump_name: string | null;
  bio: string | null;
  city: string | null;
  instagram_handle: string | null;
  rank: string;
  call_out_status: string;
  battle_wins: number;
  battle_losses: number;
  battle_draws: number;
  profile_picture_url: string | null;
  banner_url: string | null;
  created_at: string;
  current_fam?: {
    name: string;
    slug: string;
  } | null;
}

const PublicProfile = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [styleTags, setStyleTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [readyDancers, setReadyDancers] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadCurrentUser();
  }, [profileId]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("id, call_out_status")
        .eq("user_id", user.id)
        .single();
      setCurrentUserProfile(data);
    }
  };

  const loadProfile = async () => {
    if (!profileId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("public_profiles")
        .select(`
          *,
          current_fam:fams(name, slug)
        `)
        .eq("id", profileId)
        .single();

      if (error) throw error;
      
      // Map the view data to our interface
      const profileData: PublicProfileData = {
        id: data.id || '',
        display_name: data.display_name || '',
        krump_name: data.krump_name,
        bio: data.bio,
        city: null, // Not in public_profiles view
        instagram_handle: null, // Not in public_profiles view
        rank: data.rank || 'new_boot',
        call_out_status: data.call_out_status || 'labbin',
        battle_wins: data.battle_wins || 0,
        battle_losses: data.battle_losses || 0,
        battle_draws: data.battle_draws || 0,
        profile_picture_url: data.profile_picture_url,
        banner_url: data.banner_url,
        created_at: data.created_at || new Date().toISOString(),
        current_fam: data.current_fam as any
      };
      
      setProfile(profileData);

      // Load style tags
      const { data: tags } = await supabase
        .from("profile_style_tags")
        .select("style_tag:style_tags(*)")
        .eq("profile_id", profileId);

      if (tags) {
        setStyleTags(tags.map(t => t.style_tag));
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16">
          <Card>
            <CardContent className="p-6 text-center">
              <p>Profile not found</p>
              <Button onClick={() => navigate("/")} className="mt-4">Go Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getBattleRecord = () => {
    return `${profile.battle_wins || 0}-${profile.battle_losses || 0}-${profile.battle_draws || 0}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Banner */}
        <div 
          className="h-48 bg-gradient-accent relative"
          style={profile.banner_url ? {
            backgroundImage: `url(${profile.banner_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <div className="container mx-auto px-4 h-full flex items-end pb-4">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div>
              <Card className="border-2 border-border">
                <CardContent className="p-6 text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-background">
                    <AvatarImage src={profile.profile_picture_url || undefined} />
                    <AvatarFallback className="text-4xl">
                      {(profile.krump_name || profile.display_name).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="mb-2">
                    <h1 className="text-2xl font-bold mb-1">
                      {profile.krump_name || profile.display_name}
                    </h1>
                    {profile.krump_name && (
                      <p className="text-sm text-muted-foreground mb-2">{profile.display_name}</p>
                    )}
                  </div>

                  {profile.krump_name && (
                    <div className="flex justify-center mb-4">
                      <KNSBadge krumpName={profile.krump_name} />
                    </div>
                  )}

                  <div className="flex gap-2 justify-center mb-4">
                    <Badge variant="outline" className="text-base">
                      {profile.rank.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {profile.call_out_status === "ready_for_smoke" && (
                      <Badge variant="default" className="bg-primary">
                        🔥 Ready for Smoke
                      </Badge>
                    )}
                  </div>

                  {profile.city && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.city}</span>
                    </div>
                  )}

                  {profile.instagram_handle && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                      <Instagram className="h-4 w-4" />
                      <span>{profile.instagram_handle}</span>
                    </div>
                  )}

                  {currentUserProfile && 
                   currentUserProfile.id !== profile.id && 
                   currentUserProfile.call_out_status === "ready_for_smoke" &&
                   profile.call_out_status === "ready_for_smoke" && (
                    <div className="mt-4">
                      <CreateChallengeDialog
                        onChallengeCreated={() => {
                          toast({
                            title: "Challenge Sent!",
                            description: "Your battle challenge has been sent",
                          });
                        }}
                        readyDancers={[profile]}
                        preselectedDancer={profile}
                        buttonVariant="web3"
                        buttonSize="default"
                        buttonLabel="Challenge to Battle"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Battle Record
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold mb-2">{getBattleRecord()}</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-green-500 font-bold">{profile.battle_wins || 0}</p>
                        <p className="text-muted-foreground">Wins</p>
                      </div>
                      <div>
                        <p className="text-red-500 font-bold">{profile.battle_losses || 0}</p>
                        <p className="text-muted-foreground">Losses</p>
                      </div>
                      <div>
                        <p className="text-yellow-500 font-bold">{profile.battle_draws || 0}</p>
                        <p className="text-muted-foreground">Draws</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {profile.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                  </CardContent>
                </Card>
              )}

              {profile.current_fam && (
                <Card>
                  <CardHeader>
                    <CardTitle>Fam Affiliation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/fams/${profile.current_fam?.slug}`)}
                    >
                      {profile.current_fam.name}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {styleTags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Style Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {styleTags.map((tag) => (
                        <Badge key={tag.id} variant="default">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Member Since</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicProfile;
