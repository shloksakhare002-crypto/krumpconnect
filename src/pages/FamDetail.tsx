import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  MapPin,
  Settings,
  UserPlus,
  Swords,
  ArrowLeft,
  ExternalLink,
  Network,
  Rss,
  Image as ImageIcon,
} from "lucide-react";
import { KNSBadge } from "@/components/profile/KNSBadge";
import { CreatePostDialog } from "@/components/fams/CreatePostDialog";
import { PostCard } from "@/components/fams/PostCard";
import { MintVideoNFTDialog } from "@/components/story/MintVideoNFTDialog";
import { VideoNFTCard } from "@/components/story/VideoNFTCard";

interface FamMember {
  id: string;
  generation: number;
  joined_at: string;
  profile: {
    id: string;
    display_name: string;
    krump_name: string | null;
    profile_picture_url: string | null;
    rank: string;
  };
}

interface Fam {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  bio: string | null;
  logo_url: string | null;
  recruitment_status: string;
  audition_details: string | null;
  audition_link: string | null;
  big_homie_id: string;
  big_homie: {
    id: string;
    display_name: string;
    krump_name: string | null;
    profile_picture_url: string | null;
  };
}

const FamDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fam, setFam] = useState<Fam | null>(null);
  const [members, setMembers] = useState<FamMember[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [videoNFTs, setVideoNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [isBigHomie, setIsBigHomie] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  useEffect(() => {
    fetchFamData();
    loadPosts();
    if (fam) {
      loadVideoNFTs();
    }
  }, [slug, fam?.id]);

  const fetchFamData = async () => {
    try {
      // Fetch fam details
      const { data: famData, error: famError } = await supabase
        .from("fams")
        .select(`
          *,
          big_homie:profiles!fams_big_homie_id_fkey(
            id,
            display_name,
            krump_name,
            profile_picture_url
          )
        `)
        .eq("slug", slug)
        .single();

      if (famError) throw famError;
      setFam(famData);

      // Fetch fam members
      const { data: membersData, error: membersError } = await supabase
        .from("fam_members")
        .select(`
          *,
          profile:profiles!fam_members_profile_id_fkey(
            id,
            display_name,
            krump_name,
            profile_picture_url,
            rank
          )
        `)
        .eq("fam_id", famData.id)
        .order("generation", { ascending: true })
        .order("joined_at", { ascending: true });

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Check if current user is Big Homie or member
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (profileData) {
          setCurrentProfileId(profileData.id);
          setIsBigHomie(famData.big_homie_id === profileData.id);
          setIsMember(membersData.some(m => m.profile_id === profileData.id));
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading fam",
        description: error.message,
        variant: "destructive",
      });
      navigate("/fams");
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const { data: famData } = await supabase
        .from("fams")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!famData) return;

      const { data, error } = await supabase
        .from("fam_posts")
        .select(`
          *,
          author:profiles!fam_posts_author_id_fkey(
            display_name,
            krump_name,
            profile_picture_url
          )
        `)
        .eq("fam_id", famData.id)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error("Error loading posts:", error);
    }
  };

  const getRecruitmentBadge = (status: string) => {
    switch (status) {
      case "closed_circle":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500">
            🔒 Closed Circle
          </Badge>
        );
      case "scouting":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">
            👀 Scouting
          </Badge>
        );
      case "auditions_open":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
            ✅ Auditions Open
          </Badge>
        );
      default:
        return null;
    }
  };

  const loadVideoNFTs = async () => {
    if (!fam) return;
    
    setLoadingNFTs(true);
    try {
      const { data, error } = await supabase
        .from("video_nfts")
        .select(`
          *,
          creator:profiles!video_nfts_creator_id_fkey(
            display_name,
            krump_name
          )
        `)
        .eq("fam_id", fam.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideoNFTs(data || []);
    } catch (error: any) {
      console.error("Error loading video NFTs:", error);
    } finally {
      setLoadingNFTs(false);
    }
  };

  const groupMembersByGeneration = () => {
    const grouped: { [key: number]: FamMember[] } = {};
    members.forEach((member) => {
      if (!grouped[member.generation]) {
        grouped[member.generation] = [];
      }
      grouped[member.generation].push(member);
    });
    return grouped;
  };

  if (loading || !fam) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const membersByGeneration = groupMembersByGeneration();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Header Banner */}
        <div className="relative h-48 bg-gradient-accent">
          <div className="absolute inset-0 bg-black/40"></div>
          {fam.logo_url && (
            <img src={fam.logo_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
        </div>

        <div className="container mx-auto px-4">
          <div className="relative -mt-20 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              {/* Logo */}
              <div className="relative">
                {fam.logo_url ? (
                  <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-glow">
                    <img src={fam.logo_url} alt={fam.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-accent flex items-center justify-center border-4 border-background shadow-glow">
                    <Users className="h-16 w-16 text-background" />
                  </div>
                )}
              </div>

              {/* Fam Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{fam.name}</h1>
                  {getRecruitmentBadge(fam.recruitment_status)}
                </div>
                {fam.city && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>{fam.city}</span>
                  </div>
                )}
                <p className="text-muted-foreground max-w-2xl">{fam.bio}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/fams")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                {isBigHomie && (
                  <Button variant="web3">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                )}
                <Button variant="default">
                  <Swords className="h-4 w-4 mr-2" />
                  Challenge
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="members" className="space-y-6">
            <TabsList>
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                Members ({members.length})
              </TabsTrigger>
              <TabsTrigger value="lineage">
                <Network className="h-4 w-4 mr-2" />
                Family Tree
              </TabsTrigger>
              <TabsTrigger value="news">
                <Rss className="h-4 w-4 mr-2" />
                News ({posts.length})
              </TabsTrigger>
              <TabsTrigger value="showcase">
                <ImageIcon className="h-4 w-4 mr-2" />
                Showcase
              </TabsTrigger>
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6">
              {/* Big Homie Card */}
              <Card className="border-primary/50 bg-gradient-card">
                <CardHeader>
                  <CardTitle className="text-primary">Big Homie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage src={fam.big_homie.profile_picture_url || undefined} />
                      <AvatarFallback>
                        {fam.big_homie.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-lg">
                          {fam.big_homie.krump_name || fam.big_homie.display_name}
                        </p>
                        {fam.big_homie.krump_name && (
                          <KNSBadge krumpName={fam.big_homie.krump_name} size="sm" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Founder & Leader</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Members by Generation */}
              {Object.entries(membersByGeneration).map(([gen, genMembers]) => (
                <Card key={gen}>
                  <CardHeader>
                    <CardTitle>Generation {gen}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {genMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                          <Avatar>
                            <AvatarImage src={member.profile.profile_picture_url || undefined} />
                            <AvatarFallback>
                              {member.profile.display_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <p className="font-semibold truncate">
                                {member.profile.krump_name || member.profile.display_name}
                              </p>
                              {member.profile.krump_name && (
                                <KNSBadge krumpName={member.profile.krump_name} size="sm" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{member.profile.rank}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Recruitment Section */}
              {fam.recruitment_status === "auditions_open" && (
                <Card className="border-green-500/50 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-green-500" />
                      Join This Fam
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fam.audition_details && (
                      <div>
                        <h4 className="font-semibold mb-2">Audition Details:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {fam.audition_details}
                        </p>
                      </div>
                    )}
                    {fam.audition_link && (
                      <Button className="w-full" onClick={() => window.open(fam.audition_link!, "_blank")}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Family Tree Tab */}
            <TabsContent value="lineage">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-12">
                    <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Visual family tree coming soon</p>
                    <p className="text-sm mt-2">Will show mentor-mentee relationships and generational flow</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Fam News & Updates</h3>
                {(isBigHomie || isMember) && currentProfileId && (
                  <CreatePostDialog
                    famId={fam.id}
                    authorId={currentProfileId}
                    onPostCreated={loadPosts}
                  />
                )}
              </div>

              {posts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Rss className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No posts yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {isBigHomie || isMember
                        ? "Be the first to share an update with the Fam!"
                        : "Check back later for news and updates from this Fam"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Showcase Tab */}
            <TabsContent value="showcase" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Video NFT Gallery</h3>
                  <p className="text-sm text-muted-foreground">
                    Fam performances minted on Story Protocol
                  </p>
                </div>
                {(isBigHomie || isMember) && (
                  <MintVideoNFTDialog
                    onMinted={loadVideoNFTs}
                    famId={fam.id}
                    famName={fam.name}
                  />
                )}
              </div>

              {loadingNFTs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : videoNFTs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No Video NFTs yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {isBigHomie || isMember
                        ? "Mint your first Krump performance video as an NFT!"
                        : "Check back later for minted videos from this Fam"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoNFTs.map((nft) => (
                    <VideoNFTCard key={nft.id} nft={nft} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default FamDetail;
