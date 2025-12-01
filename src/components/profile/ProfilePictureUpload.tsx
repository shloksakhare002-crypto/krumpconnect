import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, X, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfilePictureUploadProps {
  currentUrl?: string;
  onUploadSuccess: (ipfsData: { url: string; ipfs: string }) => void;
  displayName?: string;
}

export const ProfilePictureUpload = ({ 
  currentUrl, 
  onUploadSuccess,
  displayName 
}: ProfilePictureUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentUrl || "");
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max for profile pictures)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Profile picture must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setUploadComplete(false);

    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadComplete(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("upload-to-pinata", {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Store both gateway URL and IPFS hash
      onUploadSuccess({
        url: data.gatewayUrl,
        ipfs: data.ipfsUrl,
      });

      setPreviewUrl(data.gatewayUrl);
      setUploadComplete(true);
      
      toast({
        title: "Success!",
        description: "Profile picture uploaded to IPFS",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(currentUrl || "");
    setUploadComplete(false);
  };

  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Label>Profile Picture</Label>
          
          <div className="flex items-start gap-4">
            {/* Avatar Preview */}
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={previewUrl} />
                <AvatarFallback className="text-2xl">
                  {displayName?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              {uploadComplete && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-3">
              {!selectedFile ? (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP or GIF. Max 10MB. Will be stored on IPFS.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                    {!uploading && !uploadComplete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {!uploadComplete && (
                    <Button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full"
                      variant="web3"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading to IPFS...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload to IPFS
                        </>
                      )}
                    </Button>
                  )}

                  {uploadComplete && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 p-2 rounded">
                      <CheckCircle className="h-4 w-4" />
                      <span>Uploaded successfully! Save your profile to confirm.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
