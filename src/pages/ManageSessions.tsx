import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MapPin, Users, Check, X, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
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

interface Session {
  id: string;
  name: string;
  session_type: string;
  location_name: string;
  session_date: string;
  description: string | null;
  max_participants: number | null;
}

interface SessionRequest {
  id: string;
  status: string;
  created_at: string;
  session: Session;
  requester: {
    id: string;
    display_name: string;
    krump_name: string | null;
    profile_picture_url: string | null;
    rank: string;
    city: string | null;
  };
}

const ManageSessions = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [mySessions, setMySessions] = useState<Session[]>([]);
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profileData) return;
      setProfile(profileData);

      // Load my sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("*")
        .eq("host_id", profileData.id)
        .gte("session_date", new Date().toISOString())
        .order("session_date", { ascending: true });

      if (sessionsError) throw sessionsError;
      setMySessions(sessions || []);

      // Load pending requests for my sessions
      const sessionIds = sessions?.map(s => s.id) || [];
      if (sessionIds.length > 0) {
        const { data: requestsData, error: requestsError } = await supabase
          .from("session_requests")
          .select(`
            id,
            status,
            created_at,
            session_id,
            sessions!inner(id, name, session_type, location_name, session_date, description, max_participants),
            requester:profiles!session_requests_requester_id_fkey(
              id, display_name, krump_name, profile_picture_url, rank, city
            )
          `)
          .in("session_id", sessionIds)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (requestsError) throw requestsError;
        
        const formattedRequests = requestsData?.map(req => ({
          id: req.id,
          status: req.status,
          created_at: req.created_at,
          session: req.sessions as unknown as Session,
          requester: req.requester as any
        })) || [];
        
        setRequests(formattedRequests);
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: "approved" | "rejected") => {
    setActionLoading(requestId);
    try {
      const { error } = await supabase
        .from("session_requests")
        .update({ status: action })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: action === "approved" ? "Request Approved ✓" : "Request Rejected",
        description: action === "approved" 
          ? "The dancer can now join your session" 
          : "Request has been declined",
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    setActionLoading(sessionId);
    try {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Session Cancelled",
        description: "The session has been removed",
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Error cancelling session",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getSessionTypeBadge = (type: string) => {
    switch (type) {
      case "casual_practice":
        return <Badge className="bg-blue-500">Casual Practice</Badge>;
      case "heavy_lab":
        return <Badge className="bg-red-500">Heavy Lab</Badge>;
      case "workshop":
        return <Badge className="bg-yellow-500">Workshop</Badge>;
      default:
        return <Badge>{type}</Badge>;
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">
              Manage Sessions
            </h1>
            <p className="text-muted-foreground">
              Review join requests and manage your hosted sessions
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="requests" className="space-y-6">
            <TabsList>
              <TabsTrigger value="requests">
                <Users className="h-4 w-4 mr-2" />
                Join Requests ({requests.length})
              </TabsTrigger>
              <TabsTrigger value="sessions">
                <Calendar className="h-4 w-4 mr-2" />
                My Sessions ({mySessions.length})
              </TabsTrigger>
            </TabsList>

            {/* Join Requests */}
            <TabsContent value="requests" className="space-y-4">
              {requests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No pending join requests</p>
                  </CardContent>
                </Card>
              ) : (
                requests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Requester Info */}
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar className="h-16 w-16 border-2 border-primary">
                            <AvatarImage src={request.requester.profile_picture_url || undefined} />
                            <AvatarFallback>
                              {(request.requester.krump_name || request.requester.display_name).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-lg">
                              {request.requester.krump_name || request.requester.display_name}
                            </p>
                            <Badge variant="outline" className="mb-2">{request.requester.rank}</Badge>
                            {request.requester.city && (
                              <p className="text-sm text-muted-foreground">{request.requester.city}</p>
                            )}
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => navigate(`/profile/${request.requester.id}`)}
                              className="p-0 h-auto"
                            >
                              View Profile
                            </Button>
                          </div>
                        </div>

                        {/* Session Info */}
                        <div className="flex-1 p-4 bg-muted rounded-lg">
                          <p className="font-semibold mb-2">{request.session.name}</p>
                          {getSessionTypeBadge(request.session.session_type)}
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(request.session.session_date), "PPP 'at' p")}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {request.session.location_name}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          <Button 
                            onClick={() => handleRequestAction(request.id, "approved")}
                            disabled={actionLoading === request.id}
                            variant="default"
                          >
                            {actionLoading === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button 
                            onClick={() => handleRequestAction(request.id, "rejected")}
                            disabled={actionLoading === request.id}
                            variant="outline"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* My Sessions */}
            <TabsContent value="sessions" className="space-y-4">
              {mySessions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No upcoming sessions</p>
                    <Button onClick={() => navigate("/sessions")} className="mt-4">
                      Host a Session
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                mySessions.map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{session.name}</CardTitle>
                          <CardDescription className="mt-2">
                            {getSessionTypeBadge(session.session_type)}
                          </CardDescription>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={actionLoading === session.id}
                            >
                              {actionLoading === session.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Cancel
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Session?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the session and notify all participants. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Session</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleCancelSession(session.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Cancel Session
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(session.session_date), "PPP 'at' p")}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {session.location_name}
                        </div>
                        {session.max_participants && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            Max {session.max_participants} participants
                          </div>
                        )}
                        {session.description && (
                          <p className="text-muted-foreground pt-2">{session.description}</p>
                        )}
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

export default ManageSessions;
