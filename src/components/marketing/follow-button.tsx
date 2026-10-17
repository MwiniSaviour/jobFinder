"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function FollowButton({ name }: { name: string }) {
  const [following, setFollowing] = useState(false);
  const { toast } = useToast();

  return (
    <button
      type="button"
      aria-pressed={following}
      onClick={() => {
        setFollowing(!following);
        toast({
          title: following ? `Unfollowed ${name}` : `Following ${name}`,
          description: following
            ? "You'll stop seeing their new roles in your note."
            : "Their new roles will appear in your weekly note.",
          tone: following ? "default" : "success",
        });
      }}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-[12px] font-medium transition",
        following
          ? "border-sage/30 bg-sage-soft/60 text-sage-deep"
          : "border-line-strong bg-paper text-ink hover:bg-cream",
      )}
    >
      {following ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Plus className="h-3.5 w-3.5" />
      )}
      {following ? "Following" : "Follow"}
    </button>
  );
}
