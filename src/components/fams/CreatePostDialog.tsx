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
import { Plus, Loader2, Upload } from "lucide-react";

interface CreatePostDialogProps {
  famId: string;
  authorId: string;
  onPostCreated: () => void;
}

export const CreatePostDialog = ({ famId, authorId, onPostCreated }: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    post_type: "announcement" as const,
    media_url: "",
    media_ipfs: "",
  });

  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
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
        title: "Media uploaded!",
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
    setLoading(true);

    try {
      const { error } = await supabase.from("fam_posts").insert({
        fam_id: famId,
        author_id: authorId,
        title: formData.title,
        content: formData.content,
        post_type: formData.post_type,
        media_url: formData.media_url || null,
        media_ipfs: formData.media_ipfs || null,
      });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been published to the Fam",
      });

      setOpen(false);
      setFormData({
        title: "",
        content: "",
        post_type: "announcement",
        media_url: "",
        media_ipfs: "",
      });
      setMediaFile(null);
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
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Fam Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Post title..."
              required
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="post_type">Post Type *</Label>
            <Select
              value={formData.post_type}
              onValueChange={(value: any) => setFormData({ ...formData, post_type: value })}
            >
              <SelectTrigger id="post_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">📢 Announcement</SelectItem>
                <SelectItem value="update">📝 Update</SelectItem>
                <SelectItem value="achievement">🏆 Achievement</SelectItem>
                <SelectItem value="recruitment">👥 Recruitment</SelectItem>
                <SelectItem value="media">📸 Media/Showcase</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your news with the Fam..."
              rows={6}
              required
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.content.length}/2000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>Media (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="flex-1"
              />
              {mediaFile && !formData.media_ipfs && (
                <Button
                  type="button"
                  onClick={handleUploadMedia}
                  disabled={uploadingMedia}
                  variant="outline"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingMedia ? "Uploading..." : "Upload to IPFS"}
                </Button>
              )}
            </div>
            {formData.media_ipfs && (
              <p className="text-xs text-green-600">
                ✓ Media uploaded to IPFS
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Post"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};