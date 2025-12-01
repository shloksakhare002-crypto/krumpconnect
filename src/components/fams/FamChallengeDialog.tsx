import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { famChallengeSchema } from "@/lib/validations";

interface Fam {
  id: string;
  name: string;
  city: string | null;
}

interface FamChallengeDialogProps {
  currentFamId: string;
  currentFamName: string;
  onChallengeCreated?: () => void;
}

export const FamChallengeDialog = ({ 
  currentFamId, 
  currentFamName,
  onChallengeCreated 
}: FamChallengeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fams, setFams] = useState<Fam[]>([]);
  const [selectedFamId, setSelectedFamId] = useState("");
  const [challengeText, setChallengeText] = useState("");
  const [format, setFormat] = useState("5v5");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadFams();
    }
  }, [open]);

  const loadFams = async () => {
    try {
      const { data, error } = await supabase
        .from("fams")
        .select("id, name, city")
        .neq("id", currentFamId)
        .order("name");

      if (error) throw error;
      setFams(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading fams",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedFamId) {
      toast({
        title: "Missing information",
        description: "Please select a fam to challenge",
        variant: "destructive",
      });
      return;
    }

    // Validate input
    const validation = famChallengeSchema.safeParse({ challenge_text: challengeText });
    if (!validation.success) {
      toast({
        title: "Invalid input",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("fam_challenges").insert({
        challenger_fam_id: currentFamId,
        challenged_fam_id: selectedFamId,
        challenge_text: challengeText.trim(),
        format,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Challenge Sent! 🔥",
        description: "Your fam challenge has been issued",
      });

      setOpen(false);
      setSelectedFamId("");
      setChallengeText("");
      setFormat("5v5");
      onChallengeCreated?.();
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
        <Button variant="web3">
          <Swords className="h-4 w-4 mr-2" />
          Issue Fam Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Challenge Another Fam</DialogTitle>
          <DialogDescription>
            Issue a friendly battle challenge from {currentFamName} to another crew
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Select Target Fam */}
          <div className="space-y-2">
            <Label>Challenge Which Fam?</Label>
            <Select value={selectedFamId} onValueChange={setSelectedFamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a fam to challenge" />
              </SelectTrigger>
              <SelectContent>
                {fams.map((fam) => (
                  <SelectItem key={fam.id} value={fam.id}>
                    {fam.name} {fam.city && `(${fam.city})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Battle Format */}
          <div className="space-y-2">
            <Label>Battle Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1v1">1v1 (Solo Battle)</SelectItem>
                <SelectItem value="2v2">2v2 (Duo)</SelectItem>
                <SelectItem value="3v3">3v3 (Squad)</SelectItem>
                <SelectItem value="5v5">5v5 (Full Crew)</SelectItem>
                <SelectItem value="open">Open Format</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Challenge Message */}
          <div className="space-y-2">
            <Label htmlFor="challenge-text">Challenge Message</Label>
            <Textarea
              id="challenge-text"
              value={challengeText}
              onChange={(e) => setChallengeText(e.target.value)}
              placeholder="State your challenge... keep it respectful but bold!"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {challengeText.length}/500
            </p>
          </div>

          {/* Challenge Rules */}
          <div className="p-4 bg-muted rounded-lg text-sm space-y-1">
            <p className="font-semibold">Challenge Guidelines:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Keep challenges respectful and constructive</li>
              <li>• Specify date, location, and format clearly</li>
              <li>• Both fams must agree before battle is official</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Sending..." : "Send Challenge"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
