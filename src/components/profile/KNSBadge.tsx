import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KNSBadgeProps {
  krumpName: string;
  size?: "sm" | "md" | "lg";
}

export const KNSBadge = ({ krumpName, size = "md" }: KNSBadgeProps) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`border-primary/50 text-primary bg-primary/10 hover:bg-primary/20 transition-colors ${sizeClasses[size]}`}
          >
            <Shield className="h-3 w-3 mr-1 inline" />
            {krumpName}.krump
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Verified KNS Identity on Story Protocol</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};