import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadToPinata } from "@/lib/pinata";
import { Sparkles, Loader2, Upload, Film } from "lucide-react";
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getSPGAddress, SPG_ABI, generateIPMetadata } from "@/config/story";
import { storyTestnet, storyMainnet } from "@/config/web3";

interface MintVideoNFTDialogProps {
  onMinted?: () => void;
  famId?: string;
  famName?: string;
}

export const MintVideoNFTDialog = ({ onMinted, famId, famName }: MintVideoNFTDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingMetadata, setUploadingMetadata] = useState(false);
  const { toast } = useToast();
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
    licenseTerms: "non_commercial",
    style: "",
    city: "",
  });

  const [videoIpfs, setVideoIpfs] = useState<string>("");
  const [thumbnailIpfs, setThumbnailIpfs] = useState<string>("");

  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading: isMinting, isSuccess: isMinted } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    setFormData({ ...formData, videoFile: file });
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setFormData({ ...formData, thumbnailFile: file });
  };

  const uploadFiles = async () => {
    if (!formData.videoFile) {
      throw new Error("No video file selected");
    }

    setUploadingVideo(true);
    try {
      const videoResult = await uploadToPinata(formData.videoFile);
      setVideoIpfs(videoResult.ipfsHash);
      
      if (formData.thumbnailFile) {
        const thumbnailResult = await uploadToPinata(formData.thumbnailFile);
        setThumbnailIpfs(thumbnailResult.ipfsHash);
      }

      toast({
        title: "Files uploaded to IPFS ✓",
        description: "Video stored on decentralized storage",
      });

      return { videoIpfs: videoResult.ipfsHash, thumbnailIpfs: thumbnailIpfs || undefined };
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleMint = async () => {
    if (!address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to mint",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.videoFile) {
      toast({
        title: "Missing information",
        description: "Please provide title and video",
        variant: "destructive",
      });
      return;
    }

    // Check if on Story network
    if (chainId !== 1315 && chainId !== 1514) {
      toast({
        title: "Switch Network",
        description: "Please switch to Story Protocol network",
        variant: "destructive",
      });
      return;
    }

    const spgAddress = getSPGAddress(chainId);
    if (!spgAddress) {
      toast({
        title: "Contract not available",
        description: chainId === 1514 ? "Mainnet SPG contract must be deployed" : "SPG contract not configured",
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
        .select("id, display_name, krump_name")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Upload files to IPFS
      const { videoIpfs: videoHash, thumbnailIpfs: thumbHash } = await uploadFiles();

      // Generate metadata
      const metadata = generateIPMetadata({
        title: formData.title,
        description: formData.description,
        videoIpfs: `ipfs://${videoHash}`,
        thumbnailIpfs: thumbHash ? `ipfs://${thumbHash}` : undefined,
        creator: profile.krump_name || profile.display_name,
        famName,
        attributes: {
          style: formData.style || undefined,
          city: formData.city || undefined,
          date: new Date().toISOString().split('T')[0],
        },
      });

      // Upload metadata to IPFS
      setUploadingMetadata(true);
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
      const metadataFile = new File([metadataBlob], "metadata.json", { type: "application/json" });
      const metadataResult = await uploadToPinata(metadataFile);
      setUploadingMetadata(false);

      toast({
        title: "Metadata uploaded ✓",
        description: "Ready to mint NFT on Story Protocol",
      });

      // Mint NFT on Story Protocol
      const metadataURI = `ipfs://${metadataResult.ipfsHash}`;
      const metadataHash = `0x${metadataResult.ipfsHash}`;

      writeContract({
        address: spgAddress as `0x${string}`,
        abi: SPG_ABI,
        functionName: "mintAndRegisterIp",
        account: address,
        chain: chainId === 1315 ? storyTestnet : storyMainnet,
        args: [{
          ipMetadata: {
            ipMetadataURI: metadataURI,
            ipMetadataHash: metadataHash as `0x${string}`,
            nftMetadataURI: metadataURI,
            nftMetadataHash: metadataHash as `0x${string}`,
          },
          recipient: address,
        }],
      });

      // Save to database
      await supabase.from("video_nfts").insert({
        creator_id: profile.id,
        fam_id: famId,
        title: formData.title,
        description: formData.description,
        video_ipfs: `ipfs://${videoHash}`,
        video_url: `https://fuchsia-far-impala-831.mypinata.cloud/ipfs/${videoHash}`,
        thumbnail_ipfs: thumbHash ? `ipfs://${thumbHash}` : null,
        thumbnail_url: thumbHash ? `https://fuchsia-far-impala-831.mypinata.cloud/ipfs/${thumbHash}` : null,
        chain_id: chainId,
        license_terms: formData.licenseTerms,
        metadata_json: metadata,
        attributes: { style: formData.style, city: formData.city },
      });

      toast({
        title: "NFT Minted! 🎉",
        description: "Your Krump video is now on-chain",
      });

      setOpen(false);
      setFormData({
        title: "",
        description: "",
        videoFile: null,
        thumbnailFile: null,
        licenseTerms: "non_commercial",
        style: "",
        city: "",
      });
      onMinted?.();
    } catch (error: any) {
      console.error("Minting error:", error);
      toast({
        title: "Minting failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStoryNetwork = chainId === 1315 || chainId === 1514;
  const networkName = chainId === 1315 ? "Testnet" : chainId === 1514 ? "Mainnet" : "Unknown";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="web3" size="lg">
          <Sparkles className="mr-2 h-4 w-4" />
          Mint Video NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            Mint Video NFT on Story Protocol
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isStoryNetwork && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
              <p className="text-sm text-yellow-500 mb-2">
                Switch to Story Protocol network to mint
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => switchChain({ chainId: 1315 })}>
                  Switch to Testnet
                </Button>
                <Button size="sm" variant="outline" onClick={() => switchChain({ chainId: 1514 })}>
                  Switch to Mainnet
                </Button>
              </div>
            </div>
          )}

          {isStoryNetwork && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm">Connected to Story {networkName}</p>
            </div>
          )}

          <div>
            <Label htmlFor="title">Video Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Epic Battle Round - Summer Jam 2024"
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your performance, the context, what makes it special..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div>
            <Label htmlFor="video">Video File * (.mp4, .mov, .webm)</Label>
            <div className="mt-2">
              <Input
                id="video"
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleVideoUpload}
              />
              {formData.videoFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {formData.videoFile.name} ({(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
            <div className="mt-2">
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="style">Style</Label>
              <Input
                id="style"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                placeholder="Buck, Arm Swings, Stomps..."
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Mumbai, Delhi, Bangalore..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="license">License Terms *</Label>
            <Select
              value={formData.licenseTerms}
              onValueChange={(value) => setFormData({ ...formData, licenseTerms: value })}
            >
              <SelectTrigger id="license">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="commercial_use">Commercial Use - Others can use for profit</SelectItem>
                <SelectItem value="non_commercial">Non-Commercial - Personal use only</SelectItem>
                <SelectItem value="commercial_remix">Commercial Remix - Can remix and monetize</SelectItem>
                <SelectItem value="cc_by">CC BY - Free use with attribution</SelectItem>
                <SelectItem value="cc_by_nc">CC BY-NC - Non-commercial with attribution</SelectItem>
                <SelectItem value="cc_by_sa">CC BY-SA - Share-alike with attribution</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <p className="font-semibold">What happens when you mint:</p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Video uploaded to IPFS (decentralized storage)</li>
              <li>• NFT minted on Story Protocol blockchain</li>
              <li>• Metadata stored with licensing terms</li>
              <li>• Provable ownership and attribution</li>
              <li>• Discoverable in Story Protocol ecosystem</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleMint}
              disabled={loading || uploadingVideo || uploadingMetadata || isMinting || !formData.title || !formData.videoFile}
              className="flex-1"
            >
              {uploadingVideo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Video...
                </>
              ) : uploadingMetadata ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Metadata...
                </>
              ) : isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Mint NFT
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
