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
import { uploadToPinata } from "@/lib/pinata";
import { Plus, Upload, Image as ImageIcon } from "lucide-react";
import { eventSchema } from "@/lib/validations";

interface CreateEventDialogProps {
  onEventCreated: () => void;
}

export const CreateEventDialog = ({ onEventCreated }: CreateEventDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingFlyer, setUploadingFlyer] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    event_type: "",
    city: "",
    region: "",
    location_name: "",
    latitude: "",
    longitude: "",
    event_date: "",
    end_date: "",
    max_participants: "",
    registration_link: "",
    is_ikf_qualifier: false,
    flyer_url: "",
    flyer_ipfs: "",
  });

  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string>("");

  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFlyerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFlyerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFlyer = async () => {
    if (!flyerFile) return;

    setUploadingFlyer(true);
    try {
      const result = await uploadToPinata(flyerFile);
      setFormData({
        ...formData,
        flyer_ipfs: result.ipfsHash,
        flyer_url: result.gatewayUrl,
      });
      toast({
        title: "Flyer uploaded!",
        description: "Your event flyer has been uploaded to IPFS",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingFlyer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = eventSchema.safeParse({
      name: formData.name,
      description: formData.description,
      location_name: formData.location_name,
      city: formData.city,
      registration_link: formData.registration_link,
    });
    
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create an event",
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
          description: "You must verify with World ID to create events",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("events").insert({
        name: formData.name,
        description: formData.description || null,
        event_type: formData.event_type,
        city: formData.city,
        region: formData.region || null,
        location_name: formData.location_name,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        event_date: new Date(formData.event_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        registration_link: formData.registration_link || null,
        is_ikf_qualifier: formData.is_ikf_qualifier,
        flyer_url: formData.flyer_url || null,
        flyer_ipfs: formData.flyer_ipfs || null,
        organizer_id: profile.id,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Event created!",
        description: "Your event is now visible to the community",
      });

      setOpen(false);
      setFormData({
        name: "",
        description: "",
        event_type: "",
        city: "",
        region: "",
        location_name: "",
        latitude: "",
        longitude: "",
        event_date: "",
        end_date: "",
        max_participants: "",
        registration_link: "",
        is_ikf_qualifier: false,
        flyer_url: "",
        flyer_ipfs: "",
      });
      setFlyerFile(null);
      setFlyerPreview("");
      onEventCreated();
    } catch (error: any) {
      toast({
        title: "Error creating event",
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
          Submit Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Submit Event to Calendar</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mumbai Krump Battle 2024"
              required
            />
          </div>

          <div>
            <Label htmlFor="event_type">Event Type *</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value) => setFormData({ ...formData, event_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="battle">Battle</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="jam">Jam Session</SelectItem>
                <SelectItem value="major_event">Major Event</SelectItem>
                <SelectItem value="qualifier">Qualifier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell the community about your event..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Mumbai"
                required
              />
            </div>
            <div>
              <Label htmlFor="region">Region</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData({ ...formData, region: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="North">North India</SelectItem>
                  <SelectItem value="South">South India</SelectItem>
                  <SelectItem value="East">East India</SelectItem>
                  <SelectItem value="West">West India</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location_name">Venue Name *</Label>
            <Input
              id="location_name"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              placeholder="Marine Drive Amphitheatre"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="19.0760"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="72.8777"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date">Start Date & Time *</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date & Time</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div>
              <Label htmlFor="registration_link">Registration Link</Label>
              <Input
                id="registration_link"
                type="url"
                value={formData.registration_link}
                onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                placeholder="https://forms.gle/..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
            <Switch
              checked={formData.is_ikf_qualifier}
              onCheckedChange={(checked) => setFormData({ ...formData, is_ikf_qualifier: checked })}
            />
            <Label className="cursor-pointer">
              🏆 This is an IKF Qualifier Event
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Event Flyer (IPFS)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFlyerChange}
                className="flex-1"
              />
              {flyerFile && !formData.flyer_ipfs && (
                <Button
                  type="button"
                  onClick={handleUploadFlyer}
                  disabled={uploadingFlyer}
                  variant="outline"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingFlyer ? "Uploading..." : "Upload to IPFS"}
                </Button>
              )}
            </div>
            {flyerPreview && (
              <div className="mt-2 border rounded-lg p-2">
                <img src={flyerPreview} alt="Flyer preview" className="max-h-48 mx-auto" />
                {formData.flyer_ipfs && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    ✓ Uploaded to IPFS: {formData.flyer_ipfs.substring(0, 20)}...
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};