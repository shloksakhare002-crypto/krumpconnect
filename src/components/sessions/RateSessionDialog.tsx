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
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RateSessionDialogProps {
  sessionId: string;
  sessionName: string;
  onRated?: () => void;
}

export const RateSessionDialog = ({ sessionId, sessionName, onRated }: RateSessionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [floorQuality, setFloorQuality] = useState([5]);
  const [safety, setSafety] = useState([5]);
  const [equipment, setEquipment] = useState([5]);
  const [comments, setComments] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Check if already rated
      const { data: existing } = await supabase
        .from("session_ratings")
        .select("id")
        .eq("session_id", sessionId)
        .eq("rater_id", profile.id)
        .single();

      if (existing) {
        toast({
          title: "Already Rated",
          description: "You've already rated this session",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("session_ratings").insert({
        session_id: sessionId,
        rater_id: profile.id,
        floor_quality: floorQuality[0],
        safety: safety[0],
        equipment: equipment[0],
        comments: comments || null,
      });

      if (error) throw error;

      toast({
        title: "Rating Submitted! ⭐",
        description: "Thank you for rating this session",
      });

      setOpen(false);
      setComments("");
      setFloorQuality([5]);
      setSafety([5]);
      setEquipment([5]);
      onRated?.();
    } catch (error: any) {
      toast({
        title: "Error submitting rating",
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
        <Button variant="outline" size="sm">
          <Star className="h-4 w-4 mr-2" />
          Rate Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rate Session</DialogTitle>
          <DialogDescription>
            Help the community by rating "{sessionName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Floor Quality */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Floor Quality</Label>
              <span className="text-sm font-semibold text-primary">{floorQuality[0]}/10</span>
            </div>
            <Slider
              value={floorQuality}
              onValueChange={setFloorQuality}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Smooth, clean, suitable for Krump?
            </p>
          </div>

          {/* Safety */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Safety</Label>
              <span className="text-sm font-semibold text-primary">{safety[0]}/10</span>
            </div>
            <Slider
              value={safety}
              onValueChange={setSafety}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Well-lit, secure, no harassment?
            </p>
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Equipment</Label>
              <span className="text-sm font-semibold text-primary">{equipment[0]}/10</span>
            </div>
            <Slider
              value={equipment}
              onValueChange={setEquipment}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Speakers, mirrors, space availability?
            </p>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Comments (Optional)</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder='e.g., "Good floor but cops chase you away" or "Mirrors available, great vibes"'
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comments.length}/500
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
