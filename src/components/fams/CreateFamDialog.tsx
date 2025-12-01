import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Upload, Loader2 } from "lucide-react";

interface CreateFamDialogProps {
  onFamCreated: () => void;
}

export const CreateFamDialog = ({ onFamCreated }: CreateFamDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bio: "",
    city: "",
    recruitment_status: "closed_circle" as "closed_circle" | "scouting" | "auditions_open",
    audition_details: "",
    audition_link: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a fam",
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
          description: "You must verify with World ID to create a fam",
          variant: "destructive",
        });
        return;
      }

      let logoUrl = null;
      let logoIpfs = null;

      // Upload logo to IPFS if provided
      if (logoFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", logoFile);

        const { data: uploadData, error: uploadError } = await supabase.functions.invoke(
          "upload-to-pinata",
          {
            body: formData,
          }
        );

        if (uploadError) throw uploadError;
        
        logoUrl = uploadData.gatewayUrl;
        logoIpfs = uploadData.ipfsHash;
        setUploading(false);
      }

      // Create fam
      const { error } = await supabase.from("fams").insert({
        name: formData.name,
        slug: formData.slug,
        bio: formData.bio,
        city: formData.city,
        recruitment_status: formData.recruitment_status,
        audition_details: formData.audition_details || null,
        audition_link: formData.audition_link || null,
        logo_url: logoUrl,
        logo_ipfs: logoIpfs,
        big_homie_id: profile.id,
      });

      if (error) throw error;

      toast({
        title: "Fam created!",
        description: "Your fam page is now live",
      });

      setOpen(false);
      setFormData({
        name: "",
        slug: "",
        bio: "",
        city: "",
        recruitment_status: "closed_circle",
        audition_details: "",
        audition_link: "",
      });
      setLogoFile(null);
      setLogoPreview("");
      onFamCreated();
    } catch (error: any) {
      toast({
        title: "Error creating fam",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="web3" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create Fam Page
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Your Krump Fam</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="logo">Fam Logo</Label>
            <div className="mt-2">
              {logoPreview ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview("");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-full cursor-pointer hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="name">Fam Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Mumbai Krump Warriors"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="mumbai-krump-warriors"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your fam will be accessible at /fams/{formData.slug || "your-slug"}
            </p>
          </div>

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
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell the community about your fam..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="recruitment_status">Recruitment Status *</Label>
            <Select
              value={formData.recruitment_status}
              onValueChange={(value: any) => setFormData({ ...formData, recruitment_status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="closed_circle">🔒 Closed Circle</SelectItem>
                <SelectItem value="scouting">👀 Scouting</SelectItem>
                <SelectItem value="auditions_open">✅ Auditions Open</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.recruitment_status === "auditions_open" && (
            <>
              <div>
                <Label htmlFor="audition_details">Audition Details</Label>
                <Textarea
                  id="audition_details"
                  value={formData.audition_details}
                  onChange={(e) => setFormData({ ...formData, audition_details: e.target.value })}
                  placeholder="What are the requirements? What should applicants prepare?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="audition_link">Audition Link (optional)</Label>
                <Input
                  id="audition_link"
                  value={formData.audition_link}
                  onChange={(e) => setFormData({ ...formData, audition_link: e.target.value })}
                  placeholder="https://forms.google.com/..."
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading} className="flex-1">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : loading ? (
                "Creating..."
              ) : (
                "Create Fam"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
