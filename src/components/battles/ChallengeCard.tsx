import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Swords, Check, X, Trophy, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { KNSBadge } from "@/components/profile/KNSBadge";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Challenge {
  id: string;
  message: string | null;
  status: string;
  created_at: string;
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

interface ChallengeCardProps {
  challenge: Challenge;
  type: "incoming" | "outgoing" | "history";
  onAction: () => void;
  currentProfileId: string;
}

export const ChallengeCard = ({ challenge, type, onAction, currentProfileId }: ChallengeCardProps) => {
  const [loading, setLoading] = useState(false);
  const [reportingResult, setReportingResult] = useState(false);
  const [result, setResult] = useState<string>("");
  const { toast } = useToast();

  const isChallenger = challenge.challenger.id === currentProfileId;
  const opponent = isChallenger ? challenge.challenged : challenge.challenger;

  const handleAccept = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("battle_challenges")
        .update({ status: "accepted" })
        .eq("id", challenge.id);

      if (error) throw error;

      toast({
        title: "Challenge Accepted! 🔥",
        description: "Battle on! Report results when complete",
      });

      onAction();
    } catch (error: any) {
      toast({
        title: "Error accepting challenge",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("battle_challenges")
        .update({ status: "declined" })
        .eq("id", challenge.id);

      if (error) throw error;

      toast({
        title: "Challenge Declined",
        description: "Challenge has been declined",
      });

      onAction();
    } catch (error: any) {
      toast({
        title: "Error declining challenge",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportResult = async () => {
    if (!result) {
      toast({
        title: "Select result",
        description: "Please select the battle result",
        variant: "destructive",
      });
      return;
    }

    setReportingResult(true);
    try {
      // Check if opponent has already reported
      const { data: opponentResult } = await supabase
        .from("battle_results")
        .select("result")
        .eq("challenge_id", challenge.id)
        .eq("reporter_id", opponent.id)
        .single();

      // Submit this user's result to battle_results table
      const { error: insertError } = await supabase
        .from("battle_results")
        .insert({
          challenge_id: challenge.id,
          reporter_id: currentProfileId,
          result: result,
        });

      if (insertError) throw insertError;

      // Check if results match for confirmation message
      if (opponentResult) {
        const resultsMatch = 
          (result === "draw" && opponentResult.result === "draw") ||
          (result === "won" && opponentResult.result === "lost") ||
          (result === "lost" && opponentResult.result === "won");

        if (resultsMatch) {
          toast({
            title: "Result Confirmed! 🏆",
            description: "Both participants agree. Battle records updated!",
          });
        } else {
          toast({
            title: "Result Mismatch! ⚠️",
            description: "Results don't match. Contact your opponent to resolve.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Result Submitted ⏳",
          description: "Waiting for opponent to confirm the result",
        });
      }

      setResult("");
      onAction();
    } catch (error: any) {
      toast({
        title: "Error reporting result",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setReportingResult(false);
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
      case "completed":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-glow transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Opponent Info */}
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={opponent.profile_picture_url || undefined} />
              <AvatarFallback>
                {(opponent.krump_name || opponent.display_name).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-bold text-lg">
                  {opponent.krump_name || opponent.display_name}
                </p>
                {opponent.krump_name && (
                  <KNSBadge krumpName={opponent.krump_name} size="sm" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{opponent.rank}</Badge>
                {getStatusBadge(challenge.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>
                    {opponent.battle_wins || 0}-{opponent.battle_losses || 0}-{opponent.battle_draws || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(challenge.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Challenge Message */}
          {challenge.message && (
            <div className="flex-1 p-4 bg-muted rounded-lg">
              <p className="text-sm italic">"{challenge.message}"</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 min-w-[140px]">
            {type === "incoming" && challenge.status === "pending" && (
              <>
                <Button onClick={handleAccept} disabled={loading} variant="default">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Accept
                    </>
                  )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={loading}>
                      <X className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Decline Challenge?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to decline this battle challenge? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDecline}>
                        Decline Challenge
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            {type === "outgoing" && challenge.status === "pending" && (
              <Badge variant="outline" className="justify-center">
                Waiting...
              </Badge>
            )}

            {challenge.status === "accepted" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="web3">
                    <Trophy className="h-4 w-4 mr-2" />
                    Report Result
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Report Battle Result</AlertDialogTitle>
                    <AlertDialogDescription>
                      Select the battle outcome. This will update battle records on-chain.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Select value={result} onValueChange={setResult}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="won">I Won</SelectItem>
                        <SelectItem value="lost">I Lost</SelectItem>
                        <SelectItem value="draw">Draw</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReportResult} disabled={reportingResult}>
                      {reportingResult ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Recording...
                        </>
                      ) : (
                        "Submit Result"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {type === "history" && (
              <div className="text-center">
                <Badge variant="outline">
                  {challenge.status === "completed" ? "Battle Complete" : challenge.status}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};