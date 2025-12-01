import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadToPinata } from "@/lib/pinata";
import { Plus, Upload, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { famPostSchema } from "@/lib/validations";

interface CreateFamPostDialogProps {
  famId: string;
  onPostCreated: () => void;
}

export const CreateFamPostDialog = ({ famId, onPostCreated }: CreateFamPostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    content: "",
    post_type: "general",
    media_url: "",
    media_ipfs: "",
  });

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/mov', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image or video file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 50MB",
          variant: "destructive",
        });
        return;
      }

      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadMedia = async () => {
    if (!mediaFile) return;

    setUploadingMedia(true);
    try {
      const result = await uploadToPinata(mediaFile);
      setFormData({
        ...formData,
        media_ipfs: result.ipfsHash,
        media_url: result.gatewayUrl,
      });
      toast({
        title: "Media uploaded! 📸",
        description: "Your media has been uploaded to IPFS",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    const validation = famPostSchema.safeParse({
      content: formData.content,
      post_type: formData.post_type,
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
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { error } = await supabase.from("fam_posts").insert({
        fam_id: famId,
        author_id: profile.id,
        content: formData.content.trim(),
        post_type: formData.post_type,
        media_url: formData.media_url || null,
        media_ipfs: formData.media_ipfs || null,
      });

      if (error) throw error;

      toast({
        title: "Post Created! 🎉",
        description: "Your post has been shared with the fam",
      });

      setOpen(false);
      setFormData({
        content: "",
        post_type: "general",
        media_url: "",
        media_ipfs: "",
      });
      setMediaFile(null);
      setMediaPreview("");
      onPostCreated();
    } catch (error: any) {
      toast({
        title: "Error creating post",
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
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Fam Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post Type */}
          <div className="space-y-2">
            <Label htmlFor="post_type">Post Type</Label>
            <Select
              value={formData.post_type}
              onValueChange={(value) => setFormData({ ...formData, post_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Update</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="media">Media Showcase</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share an update with your fam..."
              rows={6}
              maxLength={2000}
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.content.length}/2000
            </p>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label htmlFor="media">Media (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="media"
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                disabled={uploadingMedia}
              />
              {mediaFile && !formData.media_url && (
                <Button
                  type="button"
                  onClick={handleUploadMedia}
                  disabled={uploadingMedia}
                  variant="outline"
                >
                  {uploadingMedia ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Media Preview */}
            {mediaPreview && (
              <div className="mt-2 relative">
                {mediaFile?.type.startsWith('image/') ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                  />
                )}
                {formData.media_url && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                    ✓ Uploaded to IPFS
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Post"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
