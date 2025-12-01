import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, Video, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MediaPost {
  id: string;
  content: string;
  media_url: string;
  media_ipfs: string | null;
  post_type: string;
  created_at: string;
  author: {
    display_name: string;
    krump_name: string | null;
    profile_picture_url: string | null;
  };
}

interface FamGalleryProps {
  famId: string;
}

export const FamGallery = ({ famId }: FamGalleryProps) => {
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<MediaPost | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadGallery();
  }, [famId]);

  const loadGallery = async () => {
    try {
      const { data, error } = await supabase
        .from("fam_posts")
        .select(`
          id,
          content,
          media_url,
          media_ipfs,
          post_type,
          created_at,
          author:author_id (
            display_name,
            krump_name,
            profile_picture_url
          )
        `)
        .eq("fam_id", famId)
        .not("media_url", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMediaPosts(data as any || []);
    } catch (error: any) {
      toast({
        title: "Error loading gallery",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|mov|webm|avi)$/i);
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading gallery...</div>;
  }

  if (mediaPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-2">No media yet</p>
        <p className="text-sm text-muted-foreground">Share photos and videos with your fam!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaPosts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden cursor-pointer hover:shadow-glow transition-all group"
            onClick={() => setSelectedPost(post)}
          >
            <div className="relative aspect-square">
              {isVideo(post.media_url) ? (
                <>
                  <video
                    src={post.media_url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                    <Video className="h-12 w-12 text-white" />
                  </div>
                </>
              ) : (
                <img
                  src={post.media_url}
                  alt={post.content}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              )}

              {/* Type Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                  {isVideo(post.media_url) ? (
                    <>
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Image
                    </>
                  )}
                </Badge>
              </div>

              {/* IPFS Badge */}
              {post.media_ipfs && (
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-primary/80 text-primary-foreground backdrop-blur-sm">
                    IPFS
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Media Detail Dialog */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Media Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Author Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={selectedPost.author.profile_picture_url || undefined} />
                  <AvatarFallback>
                    {(selectedPost.author.krump_name || selectedPost.author.display_name).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">
                    {selectedPost.author.krump_name || selectedPost.author.display_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedPost.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Media */}
              <div className="rounded-lg overflow-hidden bg-muted">
                {isVideo(selectedPost.media_url) ? (
                  <video
                    src={selectedPost.media_url}
                    className="w-full max-h-[500px] object-contain"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={selectedPost.media_url}
                    alt={selectedPost.content}
                    className="w-full max-h-[500px] object-contain"
                  />
                )}
              </div>

              {/* Content */}
              <div>
                <p className="whitespace-pre-wrap">{selectedPost.content}</p>
              </div>

              {/* IPFS Link */}
              {selectedPost.media_ipfs && (
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${selectedPost.media_ipfs}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on IPFS
                </a>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
