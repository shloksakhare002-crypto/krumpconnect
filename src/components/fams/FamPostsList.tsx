import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Trash2, Image as ImageIcon, Video } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Post {
  id: string;
  content: string;
  post_type: string;
  media_url: string | null;
  media_ipfs: string | null;
  created_at: string;
  author: {
    id: string;
    display_name: string;
    krump_name: string | null;
    profile_picture_url: string | null;
    rank: string;
  };
}

interface FamPostsListProps {
  famId: string;
  currentUserId?: string;
  isBigHomie?: boolean;
}

export const FamPostsList = ({ famId, currentUserId, isBigHomie }: FamPostsListProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('fam_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fam_posts',
          filter: `fam_id=eq.${famId}`,
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [famId]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("fam_posts")
        .select(`
          id,
          content,
          post_type,
          media_url,
          media_ipfs,
          created_at,
          author:author_id (
            id,
            display_name,
            krump_name,
            profile_picture_url,
            rank
          )
        `)
        .eq("fam_id", famId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data as any || []);
    } catch (error: any) {
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("fam_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "The post has been removed",
      });

      loadPosts();
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPostTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      announcement: { label: "📢 Announcement", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500" },
      achievement: { label: "🏆 Achievement", className: "bg-green-500/10 text-green-500 border-green-500" },
      media: { label: "🎬 Media", className: "bg-purple-500/10 text-purple-500 border-purple-500" },
      event: { label: "📅 Event", className: "bg-blue-500/10 text-blue-500 border-blue-500" },
      general: { label: "💬 Update", className: "bg-gray-500/10 text-gray-500 border-gray-500" },
    };

    const variant = variants[type] || variants.general;
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  const canDelete = (post: Post) => {
    return isBigHomie || post.author.id === currentUserId;
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading posts...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-2">No posts yet</p>
        <p className="text-sm text-muted-foreground">Be the first to share something with your fam!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-glow transition-shadow">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarImage src={post.author.profile_picture_url || undefined} />
                  <AvatarFallback>
                    {(post.author.krump_name || post.author.display_name).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">
                    {post.author.krump_name || post.author.display_name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">{post.author.rank}</Badge>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getPostTypeBadge(post.post_type)}
                {canDelete(post) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The post will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(post.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Media */}
            {post.media_url && (
              <div className="mt-4">
                {post.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={post.media_url}
                    alt="Post media"
                    className="w-full max-h-[500px] object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={post.media_url}
                    className="w-full max-h-[500px] object-cover rounded-lg"
                    controls
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
