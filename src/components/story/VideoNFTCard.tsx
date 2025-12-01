import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Film, Shield } from "lucide-react";
import { storyTestnet, storyMainnet } from "@/config/web3";

interface VideoNFT {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  chain_id: number;
  license_terms: string | null;
  ip_asset_id: string | null;
  nft_token_id: string | null;
  transaction_hash: string | null;
  created_at: string;
  creator: {
    display_name: string;
    krump_name: string | null;
  };
}

interface VideoNFTCardProps {
  nft: VideoNFT;
}

export const VideoNFTCard = ({ nft }: VideoNFTCardProps) => {
  const networkName = nft.chain_id === 1315 ? "Testnet" : "Mainnet";
  const explorerUrl = nft.chain_id === 1315 
    ? `https://aeneid.explorer.story.foundation`
    : `https://explorer.story.foundation`;

  return (
    <Card className="overflow-hidden hover:shadow-glow transition-shadow">
      <div className="relative aspect-video bg-muted">
        <video
          src={nft.video_url}
          poster={nft.thumbnail_url || undefined}
          controls
          className="w-full h-full object-cover"
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant="outline" className="bg-background/80 backdrop-blur">
            <Shield className="h-3 w-3 mr-1" />
            {networkName}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg line-clamp-1">{nft.title}</h3>
          <p className="text-sm text-muted-foreground">
            by {nft.creator.krump_name || nft.creator.display_name}
          </p>
        </div>

        {nft.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {nft.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {nft.license_terms && (
              <Badge variant="outline" className="text-xs">
                {nft.license_terms.replace(/_/g, " ").toUpperCase()}
              </Badge>
            )}
          </div>
          
          {nft.ip_asset_id && (
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`${explorerUrl}/address/${nft.ip_asset_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View on Story
              </a>
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          Minted {new Date(nft.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};
