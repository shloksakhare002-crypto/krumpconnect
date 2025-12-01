import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { KNSBadge } from "@/components/profile/KNSBadge";

interface FamPost {
  id: string;
  title: string;
  content: string;
  post_type: string;
  media_url: string | null;
  pinned: boolean;
  created_at: string;
  author: {
    display_name: string;
    krump_name: string | null;
    profile_picture_url: string | null;
  };
}

interface PostCardProps {
  post: FamPost;
}

export const PostCard = ({ post }: PostCardProps) => {
  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return "📢";
      case "update":
        return "📝";
      case "achievement":
        return "🏆";
      case "recruitment":
        return "👥";
      case "media":
        return "📸";
      default:
        return "📄";
    }
  };

  const getPostTypeBadge = (type: string) => {
    const label = type.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
    return `${getPostTypeIcon(type)} ${label}`;
  };

  return (
    <Card className={`hover:shadow-glow transition-shadow ${post.pinned ? 'border-primary/50' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.profile_picture_url || undefined} />
              <AvatarFallback>
                {post.author.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">
                  {post.author.krump_name || post.author.display_name}
                </p>
                {post.author.krump_name && (
                  <KNSBadge krumpName={post.author.krump_name} size="sm" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.pinned && (
              <Pin className="h-4 w-4 text-primary" />
            )}
            <Badge variant="outline">{getPostTypeBadge(post.post_type)}</Badge>
          </div>
        </div>

        <h3 className="text-xl font-bold">{post.title}</h3>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>

        {post.media_url && (
          <div className="mt-4 rounded-lg overflow-hidden">
            {post.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img 
                src={post.media_url} 
                alt={post.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            ) : post.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
              <video 
                src={post.media_url}
                controls
                className="w-full h-auto max-h-96"
              >
                Your browser does not support the video tag.
              </video>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
};