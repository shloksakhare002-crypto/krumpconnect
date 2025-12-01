import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Target, UserPlus, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Fam {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  bio: string | null;
  logo_url: string | null;
  recruitment_status: string;
  audition_link: string | null;
  big_homie: {
    display_name: string;
    krump_name: string | null;
  } | null;
  member_count: number;
}

interface FamCardProps {
  fam: Fam;
}

export const FamCard = ({ fam }: FamCardProps) => {
  const navigate = useNavigate();

  const getRecruitmentBadge = (status: string) => {
    switch (status) {
      case "closed_circle":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500">
            🔒 Closed Circle
          </Badge>
        );
      case "scouting":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">
            👀 Scouting
          </Badge>
        );
      case "auditions_open":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
            ✅ Auditions Open
          </Badge>
        );
      default:
        return null;
    }
  };

  const bigHomieName = fam.big_homie?.krump_name || fam.big_homie?.display_name || "Unknown";

  return (
    <Card className="hover:shadow-glow transition-shadow cursor-pointer" onClick={() => navigate(`/fams/${fam.slug}`)}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          {fam.logo_url ? (
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary">
              <img src={fam.logo_url} alt={fam.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-accent flex items-center justify-center">
              <Users className="h-8 w-8 text-background" />
            </div>
          )}
          <div className="flex flex-col gap-2 items-end">
            {fam.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {fam.city}
              </div>
            )}
            {getRecruitmentBadge(fam.recruitment_status)}
          </div>
        </div>

        <CardTitle>{fam.name}</CardTitle>
        <CardDescription className="line-clamp-2">{fam.bio}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Big Homie</p>
          <p className="font-semibold">{bigHomieName}</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div>
              <span className="font-bold text-primary">{fam.member_count}</span>
              <span className="text-muted-foreground"> members</span>
            </div>
          </div>
        </div>

        {fam.recruitment_status === "auditions_open" && (
          <div className="p-3 border-2 border-green-500/50 rounded-lg bg-green-500/5">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-4 w-4 text-green-500" />
              <span className="font-semibold text-sm">Auditions Open!</span>
            </div>
            {fam.audition_link && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(fam.audition_link!, "_blank");
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Audition Details
              </Button>
            )}
          </div>
        )}

        {fam.recruitment_status === "scouting" && (
          <div className="p-3 border border-yellow-500/50 rounded-lg bg-yellow-500/5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Looking for new talent</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/fams/${fam.slug}`);
            }}
          >
            View Fam
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement challenge functionality
            }}
          >
            Challenge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
