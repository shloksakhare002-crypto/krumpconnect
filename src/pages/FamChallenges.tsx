import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Swords, Check, X, Loader2, Flame, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FamChallenge {
  id: string;
  challenge_text: string;
  format: string | null;
  status: string;
  created_at: string;
  challenger_fam: {
    id: string;
    name: string;
    city: string | null;
  };
  challenged_fam: {
    id: string;
    name: string;
    city: string | null;
  };
}

const FamChallenges = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userFamId, setUserFamId] = useState<string | null>(null);
  const [incomingChallenges, setIncomingChallenges] = useState<FamChallenge[]>([]);
  const [outgoingChallenges, setOutgoingChallenges] = useState<FamChallenge[]>([]);
  const [historyChallenges, setHistoryChallenges] = useState<FamChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadUserFam();
    }
  }, [user]);

  const loadUserFam = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_fam_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.current_fam_id) {
        toast({
          title: "No Fam Affiliation",
          description: "Join a fam to participate in fam challenges",
        });
        return;
      }

      setUserFamId(profile.current_fam_id);
      await loadChallenges(profile.current_fam_id);
    } catch (error: any) {
      toast({
        title: "Error loading fam data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChallenges = async (famId: string) => {
    try {
      // Incoming challenges
      const { data: incoming, error: incomingError } = await supabase
        .from("fam_challenges")
        .select(`
          *,
          challenger_fam:fams!fam_challenges_challenger_fam_id_fkey(id, name, city),
          challenged_fam:fams!fam_challenges_challenged_fam_id_fkey(id, name, city)
        `)
        .eq("challenged_fam_id", famId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (incomingError) throw incomingError;
      setIncomingChallenges(incoming || []);

      // Outgoing challenges
      const { data: outgoing, error: outgoingError } = await supabase
        .from("fam_challenges")
        .select(`
          *,
          challenger_fam:fams!fam_challenges_challenger_fam_id_fkey(id, name, city),
          challenged_fam:fams!fam_challenges_challenged_fam_id_fkey(id, name, city)
        `)
        .eq("challenger_fam_id", famId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (outgoingError) throw outgoingError;
      setOutgoingChallenges(outgoing || []);

      // History
      const { data: history, error: historyError } = await supabase
        .from("fam_challenges")
        .select(`
          *,
          challenger_fam:fams!fam_challenges_challenger_fam_id_fkey(id, name, city),
          challenged_fam:fams!fam_challenges_challenged_fam_id_fkey(id, name, city)
        `)
        .or(`challenger_fam_id.eq.${famId},challenged_fam_id.eq.${famId}`)
        .in("status", ["accepted", "declined"])
        .order("created_at", { ascending: false })
        .limit(20);

      if (historyError) throw historyError;
      setHistoryChallenges(history || []);
    } catch (error: any) {
      toast({
        title: "Error loading challenges",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAccept = async (challengeId: string) => {
    if (!userFamId) return;

    setActionLoading(challengeId);
    try {
      const { error } = await supabase
        .from("fam_challenges")
        .update({ status: "accepted" })
        .eq("id", challengeId);

      if (error) throw error;

      toast({
        title: "Challenge Accepted! 🔥",
        description: "It's on! Coordinate with your opponent for battle details",
      });

      await loadChallenges(userFamId);
    } catch (error: any) {
      toast({
        title: "Error accepting challenge",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (challengeId: string) => {
    if (!userFamId) return;

    setActionLoading(challengeId);
    try {
      const { error } = await supabase
        .from("fam_challenges")
        .update({ status: "declined" })
        .eq("id", challengeId);

      if (error) throw error;

      toast({
        title: "Challenge Declined",
        description: "The challenge has been declined",
      });

      await loadChallenges(userFamId);
    } catch (error: any) {
      toast({
        title: "Error declining challenge",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">Accepted</Badge>;
      case "declined":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500">Declined</Badge>;
      default:
        return null;
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

  if (!userFamId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardHeader>
                <CardTitle>Join a Fam First</CardTitle>
                <CardDescription>
                  You need to be part of a fam to participate in fam challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/fams")}>Browse Fams</Button>
              </CardContent>
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
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">
              Fam Challenges
            </h1>
            <p className="text-muted-foreground">
              The "Hit List" - Crew vs Crew Battle Challenges
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
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
                History ({historyChallenges.length})
              </TabsTrigger>
            </TabsList>

            {/* Incoming */}
            <TabsContent value="incoming" className="space-y-4">
              {incomingChallenges.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Swords className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No incoming fam challenges</p>
                  </CardContent>
                </Card>
              ) : (
                incomingChallenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg mb-2">
                              {challenge.challenger_fam.name} challenges you!
                            </h3>
                            {getStatusBadge(challenge.status)}
                            {challenge.format && (
                              <Badge variant="outline" className="ml-2">{challenge.format}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(challenge.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <p className="italic">"{challenge.challenge_text}"</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAccept(challenge.id)}
                            disabled={actionLoading === challenge.id}
                            className="flex-1"
                          >
                            {actionLoading === challenge.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Accept Challenge
                              </>
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="flex-1" disabled={actionLoading === challenge.id}>
                                <X className="h-4 w-4 mr-2" />
                                Decline
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Decline Challenge?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to decline this fam challenge?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDecline(challenge.id)}>
                                  Decline Challenge
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Outgoing */}
            <TabsContent value="outgoing" className="space-y-4">
              {outgoingChallenges.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Swords className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No sent challenges</p>
                  </CardContent>
                </Card>
              ) : (
                outgoingChallenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg mb-2">
                              Challenge to {challenge.challenged_fam.name}
                            </h3>
                            {getStatusBadge(challenge.status)}
                            {challenge.format && (
                              <Badge variant="outline" className="ml-2">{challenge.format}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(challenge.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <p className="italic">"{challenge.challenge_text}"</p>
                        </div>

                        <Badge variant="outline" className="w-fit">Waiting for response...</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="space-y-4">
              {historyChallenges.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No challenge history</p>
                  </CardContent>
                </Card>
              ) : (
                historyChallenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg mb-2">
                              {challenge.challenger_fam.name} vs {challenge.challenged_fam.name}
                            </h3>
                            {getStatusBadge(challenge.status)}
                            {challenge.format && (
                              <Badge variant="outline" className="ml-2">{challenge.format}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(challenge.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <p className="italic text-sm">"{challenge.challenge_text}"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default FamChallenges;
