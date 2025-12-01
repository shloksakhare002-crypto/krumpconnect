import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RegisterEventDialogProps {
  eventId: string;
  eventName: string;
  onRegistered?: () => void;
}

export const RegisterEventDialog = ({ eventId, eventName, onRegistered }: RegisterEventDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, display_name, krump_name")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Check if already registered
      const { data: existing } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", eventId)
        .eq("profile_id", profile.id)
        .single();

      if (existing) {
        toast({
          title: "Already Registered",
          description: "You're already registered for this event",
        });
        setOpen(false);
        return;
      }

      // Register for event
      const { error } = await supabase.from("event_registrations").insert({
        event_id: eventId,
        profile_id: profile.id,
        category: category || null,
        notes: notes || null,
      });

      if (error) throw error;

      toast({
        title: "Registration Successful! 🎉",
        description: `You're registered for ${eventName}`,
      });

      setOpen(false);
      setCategory("");
      setNotes("");
      onRegistered?.();
    } catch (error: any) {
      toast({
        title: "Registration failed",
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
        <Button variant="web3" size="lg">
          <UserPlus className="h-4 w-4 mr-2" />
          Register Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register for Event</DialogTitle>
          <DialogDescription>
            One-click registration for {eventName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-muted rounded-lg text-sm">
            <p className="font-semibold mb-2">What We'll Send to Organizer:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Your Display Name</li>
              <li>• Your Krump Name (if set)</li>
              <li>• Category (if specified below)</li>
              <li>• Any additional notes</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Textarea
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Solo Battle, Group Performance, Workshop"
              rows={2}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or questions for the organizer"
              rows={3}
              maxLength={300}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Registering..." : "Confirm Registration"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
