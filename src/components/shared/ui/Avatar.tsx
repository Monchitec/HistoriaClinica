"use client";

import { useState } from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  rounded?: "xl" | "full";
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-14 w-14 text-base",
};

function getInitials(name: string): string {
  const cleaned = name.replace(/^(dr\.|dra\.|lic\.)\s+/i, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "RH";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Avatar({
  src,
  name,
  size = "md",
  rounded = "xl",
  className = "",
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src && src.trim() && failedSrc !== src);
  const shapeClass = rounded === "full" ? "rounded-full" : "rounded-xl";

  return (
    <div
      className={`border-border bg-secondary text-primary relative flex shrink-0 items-center justify-center overflow-hidden border font-bold select-none ${sizeClasses[size]} ${shapeClass} ${className}`}
      aria-label={name}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setFailedSrc(src ?? null)}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
