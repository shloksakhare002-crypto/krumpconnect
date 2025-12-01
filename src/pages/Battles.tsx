import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Swords, Trophy, Clock, AlertCircle, Flame, Loader2, Users } from "lucide-react";
import { CreateChallengeDialog } from "@/components/battles/CreateChallengeDialog";
import { ChallengeCard } from "@/components/battles/ChallengeCard";
import { KNSBadge } from "@/components/profile/KNSBadge";

interface Challenge {
  id: string;
  message: string | null;
  status: string;
  created_at: string;
  event_id: string | null;
  challenger: {
    id: string;
    display_name: string;
    krump_name: string | null;
    profile_picture_url: string | null;
    rank: string;
    battle_wins: number;
    battle_losses: number;
    battle_draws: number;
  };
  challenged: {
    id: string;
    display_name: string;
    krump_name: string | null;
    profile_picture_url: string | null;
    rank: string;
    battle_wins: number;
    battle_losses: number;
    battle_draws: number;
  };
}

const Battles = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [incomingChallenges, setIncomingChallenges] = useState<Challenge[]>([]);
  const [outgoingChallenges, setOutgoingChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [readyDancers, setReadyDancers] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadChallenges();
      loadReadyDancers();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    setProfile(data);
  };

  const loadChallenges = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profileData) return;

      // Load incoming challenges
      const { data: incoming, error: incomingError } = await supabase
        .from("battle_challenges")
        .select(`
          *,
          challenger:profiles!battle_challenges_challenger_id_fkey(
            id, display_name, krump_name, profile_picture_url, rank,
            battle_wins, battle_losses, battle_draws
          ),
          challenged:profiles!battle_challenges_challenged_id_fkey(
            id, display_name, krump_name, profile_picture_url, rank,
            battle_wins, battle_losses, battle_draws
          )
        `)
        .eq("challenged_id", profileData.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (incomingError) throw incomingError;
      setIncomingChallenges(incoming || []);

      // Load outgoing challenges
      const { data: outgoing, error: outgoingError } = await supabase
        .from("battle_challenges")
        .select(`
          *,
          challenger:profiles!battle_challenges_challenger_id_fkey(
            id, display_name, krump_name, profile_picture_url, rank,
            battle_wins, battle_losses, battle_draws
          ),
          challenged:profiles!battle_challenges_challenged_id_fkey(
            id, display_name, krump_name, profile_picture_url, rank,
            battle_wins, battle_losses, battle_draws
          )
        `)
        .eq("challenger_id", profileData.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (outgoingError) throw outgoingError;
      setOutgoingChallenges(outgoing || []);

      // Load completed challenges
      const { data: completed, error: completedError } = await supabase
        .from("battle_challenges")
        .select(`
          *,
          challenger:profiles!battle_challenges_challenger_id_fkey(
            id, display_name, krump_name, profile_picture_url, rank,
            battle_wins, battle_losses, battle_draws
          ),
          challenged:profiles!battle_challenges_challenged_id_fkey(
            id, display_name, krump_name, profile_picture_url, rank,
            battle_wins, battle_losses, battle_draws
          )
        `)
        .or(`challenger_id.eq.${profileData.id},challenged_id.eq.${profileData.id}`)
        .in("status", ["accepted", "declined", "completed"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (completedError) throw completedError;
      setCompletedChallenges(completed || []);
    } catch (error: any) {
      toast({
        title: "Error loading challenges",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReadyDancers = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profileData) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, krump_name, profile_picture_url, rank, city, battle_wins, battle_losses, battle_draws")
        .eq("call_out_status", "ready_for_smoke")
        .neq("id", profileData.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setReadyDancers(data || []);
    } catch (error: any) {
      console.error("Error loading ready dancers:", error);
    }
  };

  if (authLoading || loading) {
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
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Profile Required</CardTitle>
              <CardDescription>Create your profile to access battles</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/profile")}>Create Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getBattleRecord = () => {
    if (!profile) return "0-0-0";
    return `${profile.battle_wins || 0}-${profile.battle_losses || 0}-${profile.battle_draws || 0}`;
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
                  Battle Arena
                </h1>
                <p className="text-muted-foreground">
                  Call-Out System - Challenge dancers and prove your skills
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Your Record</p>
                      <p className="font-bold">{getBattleRecord()}</p>
                    </div>
                  </div>
                </Card>
                {profile.call_out_status === "ready_for_smoke" && (
                  <CreateChallengeDialog 
                    onChallengeCreated={loadChallenges}
                    readyDancers={readyDancers}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {profile.call_out_status !== "ready_for_smoke" && (
            <Card className="mb-8 border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Set Your Status to "Ready for Smoke"</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You need to set your call-out status to "Ready for Smoke" in your profile to send battle challenges.
                    </p>
                    <Button variant="outline" onClick={() => navigate("/profile")}>
                      Update Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="incoming" className="space-y-6">
            <TabsList>
              <TabsTrigger value="incoming">
                <Flame className="h-4 w-4 mr-2" />
                Incoming ({incomingChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="outgoing">
                <Swords className="h-4 w-4 mr-2" />
                Sent ({outgoingChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="ready">
                <Users className="h-4 w-4 mr-2" />
                Ready ({readyDancers.length})
              </TabsTrigger>
            </TabsList>

            {/* Incoming Challenges */}
            <TabsContent value="incoming" className="space-y-4">
              {incomingChallenges.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Swords className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No incoming challenges</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Set your status to "Ready for Smoke" to receive challenges
                    </p>
                  </CardContent>
                </Card>
              ) : (
                incomingChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    type="incoming"
                    onAction={loadChallenges}
                    currentProfileId={profile.id}
                  />
                ))
              )}
            </TabsContent>

            {/* Outgoing Challenges */}
            <TabsContent value="outgoing" className="space-y-4">
              {outgoingChallenges.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Swords className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No sent challenges</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Challenge dancers who are "Ready for Smoke"
                    </p>
                  </CardContent>
                </Card>
              ) : (
                outgoingChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    type="outgoing"
                    onAction={loadChallenges}
                    currentProfileId={profile.id}
                  />
                ))
              )}
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="space-y-4">
              {completedChallenges.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No battle history yet</p>
                  </CardContent>
                </Card>
              ) : (
                completedChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    type="history"
                    onAction={loadChallenges}
                    currentProfileId={profile.id}
                  />
                ))
              )}
            </TabsContent>

            {/* Ready Dancers */}
            <TabsContent value="ready" className="space-y-4">
              {readyDancers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No dancers currently ready for battle</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {readyDancers.map((dancer) => (
                    <Card key={dancer.id} className="hover:shadow-glow transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-gradient-accent flex items-center justify-center text-2xl font-bold">
                            {(dancer.krump_name || dancer.display_name).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold">
                                {dancer.krump_name || dancer.display_name}
                              </p>
                              {dancer.krump_name && (
                                <KNSBadge krumpName={dancer.krump_name} size="sm" />
                              )}
                            </div>
                            <Badge variant="outline" className="mb-2">{dancer.rank}</Badge>
                            {dancer.city && (
                              <p className="text-xs text-muted-foreground">{dancer.city}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Record: {dancer.battle_wins || 0}-{dancer.battle_losses || 0}-{dancer.battle_draws || 0}
                            </p>
                          </div>
                          {profile.call_out_status === "ready_for_smoke" && (
                            <CreateChallengeDialog
                              onChallengeCreated={loadChallenges}
                              readyDancers={readyDancers}
                              preselectedDancer={dancer}
                              buttonVariant="outline"
                              buttonSize="sm"
                              buttonLabel="Challenge"
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
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

export default Battles;