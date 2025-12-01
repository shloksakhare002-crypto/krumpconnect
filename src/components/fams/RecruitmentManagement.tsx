import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RecruitmentManagementProps {
  famId: string;
  currentStatus: "closed_circle" | "scouting" | "auditions_open";
  currentAuditionDetails: string | null;
  currentAuditionLink: string | null;
  onUpdate: () => void;
}

export const RecruitmentManagement = ({
  famId,
  currentStatus,
  currentAuditionDetails,
  currentAuditionLink,
  onUpdate,
}: RecruitmentManagementProps) => {
  const [status, setStatus] = useState<"closed_circle" | "scouting" | "auditions_open">(currentStatus);
  const [auditionDetails, setAuditionDetails] = useState(currentAuditionDetails || "");
  const [auditionLink, setAuditionLink] = useState(currentAuditionLink || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("fams")
        .update({
          recruitment_status: status,
          audition_details: auditionDetails || null,
          audition_link: auditionLink || null,
        })
        .eq("id", famId);

      if (error) throw error;

      toast({
        title: "Recruitment Settings Updated",
        description: "Your fam's recruitment settings have been saved",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruitment Settings</CardTitle>
        <CardDescription>
          Manage how your fam recruits new members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recruitment Status */}
        <div className="space-y-2">
          <Label>Recruitment Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="closed_circle">
                Closed Circle - No new members
              </SelectItem>
              <SelectItem value="scouting">
                Scouting - Looking for talent
              </SelectItem>
              <SelectItem value="auditions_open">
                Auditions Open - Accepting applications
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {status === "closed_circle" && "Not actively recruiting"}
            {status === "scouting" && "Watching for potential members at sessions"}
            {status === "auditions_open" && "Actively accepting audition submissions"}
          </p>
        </div>

        {/* Audition Details */}
        {status === "auditions_open" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="audition-details">Audition Details</Label>
              <Textarea
                id="audition-details"
                value={auditionDetails}
                onChange={(e) => setAuditionDetails(e.target.value)}
                placeholder="Describe audition requirements, process, and expectations..."
                rows={6}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {auditionDetails.length}/1000
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audition-link">Audition Form/Video Link</Label>
              <Input
                id="audition-link"
                type="url"
                value={auditionLink}
                onChange={(e) => setAuditionLink(e.target.value)}
                placeholder="https://forms.google.com/... or video submission link"
              />
              <p className="text-xs text-muted-foreground">
                Link to Google Form, video upload, or contact method
              </p>
            </div>
          </>
        )}

        {status === "scouting" && (
          <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
            <p>
              In "Scouting" mode, your fam is visible as looking for talent but not accepting
              formal auditions. Approach potential members at sessions or events.
            </p>
          </div>
        )}

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Recruitment Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};
