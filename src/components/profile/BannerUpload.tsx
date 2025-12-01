import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getPinataGatewayUrl } from "@/config/pinata";

interface BannerUploadProps {
  currentUrl: string | null;
  onUploadSuccess: (data: { url: string; ipfs: string }) => void;
  displayName: string;
}

export const BannerUpload = ({ currentUrl, onUploadSuccess, displayName }: BannerUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Pinata
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("file", file);

      const response = await supabase.functions.invoke("upload-to-pinata", {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      const { ipfsHash } = response.data;
      const gatewayUrl = getPinataGatewayUrl(ipfsHash);

      onUploadSuccess({
        url: gatewayUrl,
        ipfs: ipfsHash,
      });

      toast({
        title: "Banner uploaded!",
        description: "Your banner has been uploaded to IPFS",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload banner",
        variant: "destructive",
      });
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadSuccess({ url: "", ipfs: "" });
  };

  return (
    <div className="space-y-4">
      <Label>Banner Image</Label>
      
      {/* Preview */}
      <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Banner preview"
              className="w-full h-full object-cover"
            />
            {!uploading && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Upload className="h-12 w-12 mb-2" />
            <p className="text-sm">No banner uploaded</p>
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Uploading to IPFS...</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div>
        <input
          type="file"
          id="banner-upload"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => document.getElementById("banner-upload")?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {preview ? "Change Banner" : "Upload Banner"}
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Recommended: 1500x500px, max 10MB. Stored permanently on IPFS.
      </p>
    </div>
  );
};
