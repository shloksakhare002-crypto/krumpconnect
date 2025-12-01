import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  type: "session" | "battle" | "session_request";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Get user's profile to check for notifications
    const setupRealtimeListeners = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, city, call_out_status")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      // Listen for new sessions in user's city
      const sessionsChannel = supabase
        .channel("sessions-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "sessions",
            filter: `host_id=neq.${profile.id}`,
          },
          async (payload) => {
            const newSession = payload.new as any;
            
            // Only notify about sessions in user's city or nearby
            const { data: sessionData } = await supabase
              .from("sessions")
              .select(`
                *,
                host:profiles!sessions_host_id_fkey(display_name, krump_name)
              `)
              .eq("id", newSession.id)
              .single();

            if (sessionData) {
              const notification: Notification = {
                id: `session-${newSession.id}`,
                type: "session",
                title: "New Session Available!",
                description: `${sessionData.host.krump_name || sessionData.host.display_name} is hosting "${sessionData.name}"`,
                timestamp: new Date(),
                read: false,
              };

              setNotifications((prev) => [notification, ...prev]);
              setUnreadCount((prev) => prev + 1);

              toast({
                title: notification.title,
                description: notification.description,
              });
            }
          }
        )
        .subscribe();

      // Listen for battle challenges directed at this user
      const battleChallengesChannel = supabase
        .channel("battle-challenges-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "battle_challenges",
            filter: `challenged_id=eq.${profile.id}`,
          },
          async (payload) => {
            const newChallenge = payload.new as any;
            
            const { data: challengeData } = await supabase
              .from("battle_challenges")
              .select(`
                *,
                challenger:profiles!battle_challenges_challenger_id_fkey(display_name, krump_name)
              `)
              .eq("id", newChallenge.id)
              .single();

            if (challengeData) {
              const notification: Notification = {
                id: `battle-${newChallenge.id}`,
                type: "battle",
                title: "🔥 Battle Challenge Received!",
                description: `${challengeData.challenger.krump_name || challengeData.challenger.display_name} has challenged you to battle!`,
                timestamp: new Date(),
                read: false,
              };

              setNotifications((prev) => [notification, ...prev]);
              setUnreadCount((prev) => prev + 1);

              toast({
                title: notification.title,
                description: notification.description,
                variant: "default",
              });
            }
          }
        )
        .subscribe();

      // Listen for battle challenge status updates
      const battleUpdatesChannel = supabase
        .channel("battle-updates-notifications")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "battle_challenges",
            filter: `challenger_id=eq.${profile.id}`,
          },
          async (payload) => {
            const updatedChallenge = payload.new as any;
            
            if (updatedChallenge.status !== "pending") {
              const { data: challengeData } = await supabase
                .from("battle_challenges")
                .select(`
                  *,
                  challenged:profiles!battle_challenges_challenged_id_fkey(display_name, krump_name)
                `)
                .eq("id", updatedChallenge.id)
                .single();

              if (challengeData) {
                const statusEmoji = updatedChallenge.status === "accepted" ? "✅" : "❌";
                const statusText = updatedChallenge.status === "accepted" ? "accepted" : "declined";
                
                const notification: Notification = {
                  id: `battle-response-${updatedChallenge.id}`,
                  type: "battle",
                  title: `${statusEmoji} Challenge ${statusText}`,
                  description: `${challengeData.challenged.krump_name || challengeData.challenged.display_name} ${statusText} your battle challenge`,
                  timestamp: new Date(),
                  read: false,
                };

                setNotifications((prev) => [notification, ...prev]);
                setUnreadCount((prev) => prev + 1);

                toast({
                  title: notification.title,
                  description: notification.description,
                });
              }
            }
          }
        )
        .subscribe();

      // Listen for session requests (for hosts)
      const sessionRequestsChannel = supabase
        .channel("session-requests-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "session_requests",
          },
          async (payload) => {
            const newRequest = payload.new as any;
            
            // Check if this session belongs to the current user
            const { data: session } = await supabase
              .from("sessions")
              .select("host_id")
              .eq("id", newRequest.session_id)
              .eq("host_id", profile.id)
              .single();

            if (session) {
              const { data: requester } = await supabase
                .from("profiles")
                .select("display_name, krump_name")
                .eq("id", newRequest.requester_id)
                .single();

              if (requester) {
                const notification: Notification = {
                  id: `request-${newRequest.id}`,
                  type: "session_request",
                  title: "Session Join Request",
                  description: `${requester.krump_name || requester.display_name} wants to join your session`,
                  timestamp: new Date(),
                  read: false,
                };

                setNotifications((prev) => [notification, ...prev]);
                setUnreadCount((prev) => prev + 1);

                toast({
                  title: notification.title,
                  description: notification.description,
                });
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(sessionsChannel);
        supabase.removeChannel(battleChallengesChannel);
        supabase.removeChannel(battleUpdatesChannel);
        supabase.removeChannel(sessionRequestsChannel);
      };
    };

    setupRealtimeListeners();
  }, [user, toast]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
};
