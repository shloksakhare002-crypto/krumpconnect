import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, MapPin } from "lucide-react";

interface HostSessionDialogProps {
  onSessionCreated: () => void;
  currentLocation: { lat: number; lng: number } | null;
}

export const HostSessionDialog = ({ onSessionCreated, currentLocation }: HostSessionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location_name: "",
    latitude: "",
    longitude: "",
    session_date: "",
    duration_minutes: "120",
    session_type: "casual_practice" as const,
    max_participants: "",
    is_fam_only: false,
    rules: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to host a session",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, world_id_verified")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        toast({
          title: "Profile required",
          description: "Please create your profile first",
          variant: "destructive",
        });
        return;
      }

      if (!profile.world_id_verified) {
        toast({
          title: "Verification required",
          description: "You must verify with World ID to host sessions",
          variant: "destructive",
        });
        return;
      }

      // Use current location if enabled
      const lat = useCurrentLocation && currentLocation 
        ? currentLocation.lat.toString() 
        : formData.latitude;
      const lng = useCurrentLocation && currentLocation 
        ? currentLocation.lng.toString() 
        : formData.longitude;

      if (!lat || !lng) {
        toast({
          title: "Location required",
          description: "Please provide session location coordinates",
          variant: "destructive",
        });
        return;
      }

      // Create session
      const { error } = await supabase.from("sessions").insert({
        name: formData.name,
        description: formData.description,
        location_name: formData.location_name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        session_date: new Date(formData.session_date).toISOString(),
        duration_minutes: parseInt(formData.duration_minutes),
        session_type: formData.session_type,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        is_fam_only: formData.is_fam_only,
        rules: formData.rules || null,
        host_id: profile.id,
      });

      if (error) throw error;

      toast({
        title: "Session created!",
        description: "Your session is now live on the map",
      });

      setOpen(false);
      setFormData({
        name: "",
        description: "",
        location_name: "",
        latitude: "",
        longitude: "",
        session_date: "",
        duration_minutes: "120",
        session_type: "casual_practice",
        max_participants: "",
        is_fam_only: false,
        rules: "",
      });
      onSessionCreated();
    } catch (error: any) {
      toast({
        title: "Error creating session",
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
          <Plus className="mr-2 h-5 w-5" />
          Host a Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Host a Krump Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Session Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mumbai Beach Session"
              required
            />
          </div>

          <div>
            <Label htmlFor="session_type">Session Type *</Label>
            <Select
              value={formData.session_type}
              onValueChange={(value: any) => setFormData({ ...formData, session_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual_practice">Casual Practice (Open to all)</SelectItem>
                <SelectItem value="heavy_lab">Heavy Lab (Approval needed)</SelectItem>
                <SelectItem value="workshop">Workshop/Class</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this session about?"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="location_name">Location Name *</Label>
            <Input
              id="location_name"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              placeholder="Marine Drive Beach Park"
              required
            />
          </div>

          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
            <Switch
              checked={useCurrentLocation}
              onCheckedChange={setUseCurrentLocation}
              disabled={!currentLocation}
            />
            <Label className="cursor-pointer">
              <MapPin className="inline h-4 w-4 mr-1" />
              Use my current location
            </Label>
          </div>

          {!useCurrentLocation && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="19.0760"
                  required
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="72.8777"
                  required
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="session_date">Date & Time *</Label>
              <Input
                id="session_date"
                type="datetime-local"
                value={formData.session_date}
                onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                placeholder="120"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="max_participants">Max Participants (optional)</Label>
            <Input
              id="max_participants"
              type="number"
              value={formData.max_participants}
              onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_fam_only}
              onCheckedChange={(checked) => setFormData({ ...formData, is_fam_only: checked })}
            />
            <Label>Fam Members Only</Label>
          </div>

          <div>
            <Label htmlFor="rules">Session Rules</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              placeholder="Any specific rules or guidelines?"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
