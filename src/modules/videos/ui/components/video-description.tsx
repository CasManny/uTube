import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface VideoDescriptionProps {
  description?: string | null;
  compactViews: string;
  expandedViews: string;
  compactDate: string;
  expandedDate: string;
}
export const VideoDescription = ({
  description,
  compactDate,
  expandedDate,
  expandedViews,
  compactViews,
}: VideoDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div
      onClick={() => setIsExpanded((prev) => !prev)}
      className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition"
    >
      <div className="flex gap-2 text-sm mb-2">
        <span className="font-medium">
          {isExpanded ? expandedViews : compactViews}
        </span>
        <span className="font-medium">
          {isExpanded ? expandedDate : compactDate}
        </span>
      </div>
      <div className="relative">
        <p
          className={cn(
            "text-sm whitespace-pre-wrap",
            !isExpanded && "line-clamp-1"
          )}
        >
          {description || "No description"}
        </p>
        <div className="flex items-center gap-1 mt-4 text-sm font-medium">
          {isExpanded ? (
            <>
              Show less <ChevronUp className="size-4" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="size-4" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
