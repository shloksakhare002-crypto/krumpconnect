import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Swords, Loader2 } from "lucide-react";
import { KNSBadge } from "@/components/profile/KNSBadge";

interface CreateChallengeDialogProps {
  onChallengeCreated: () => void;
  readyDancers: any[];
  preselectedDancer?: any;
  buttonVariant?: "default" | "outline" | "web3";
  buttonSize?: "default" | "sm" | "lg";
  buttonLabel?: string;
}

export const CreateChallengeDialog = ({
  onChallengeCreated,
  readyDancers,
  preselectedDancer,
  buttonVariant = "web3",
  buttonSize = "lg",
  buttonLabel = "Send Challenge",
}: CreateChallengeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    challenged_id: preselectedDancer?.id || "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.challenged_id) {
      toast({
        title: "Select a dancer",
        description: "Please select who you want to challenge",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, call_out_status, world_id_verified")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      if (!profile.world_id_verified) {
        toast({
          title: "Verification Required",
          description: "You must verify with World ID to send challenges",
          variant: "destructive",
        });
        return;
      }

      if (profile.call_out_status !== "ready_for_smoke") {
        toast({
          title: "Status Required",
          description: 'Set your status to "Ready for Smoke" to challenge',
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("battle_challenges").insert({
        challenger_id: profile.id,
        challenged_id: formData.challenged_id,
        message: formData.message || null,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Challenge Sent! 🔥",
        description: "Your battle challenge has been sent",
      });

      setOpen(false);
      setFormData({
        challenged_id: preselectedDancer?.id || "",
        message: "",
      });
      onChallengeCreated();
    } catch (error: any) {
      toast({
        title: "Error sending challenge",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          <Swords className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Swords className="h-6 w-6 text-primary" />
            Send Battle Challenge
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="challenged">Challenge Who? *</Label>
            <Select
              value={formData.challenged_id}
              onValueChange={(value) => setFormData({ ...formData, challenged_id: value })}
              disabled={!!preselectedDancer}
            >
              <SelectTrigger id="challenged">
                <SelectValue placeholder="Select a dancer" />
              </SelectTrigger>
              <SelectContent>
                {readyDancers.map((dancer) => (
                  <SelectItem key={dancer.id} value={dancer.id}>
                    <div className="flex items-center gap-2">
                      <span>{dancer.krump_name || dancer.display_name}</span>
                      {dancer.krump_name && " • "}
                      {dancer.city && <span className="text-xs text-muted-foreground">{dancer.city}</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Challenge Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Talk your talk... 'I been seeing you at sessions. Time to see what you really got.'"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.message.length}/500 characters
            </p>
          </div>

          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-semibold mb-1">Challenge Rules:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Both dancers must be "Ready for Smoke"</li>
              <li>• Challenge can be accepted or declined</li>
              <li>• Results tracked on-chain for verification</li>
              <li>• Battle record updated automatically</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Swords className="mr-2 h-4 w-4" />
                  Send Challenge
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};