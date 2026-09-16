"use client";

import { cn } from "@/lib/utils";
import type { Student } from "@/data/mockData";

/** Real students no longer carry a stored `initials`/`avatarColor` pair — both
 * are derived on the fly instead: initials from the name, and a stable color
 * hashed from the student's id so the same student always renders the same
 * color across the app without needing to persist one. */
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function colorFrom(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue} 55% 45%)`;
}

export function StudentAvatar({
  student,
  size = "md",
  className,
}: {
  student: Pick<Student, "id" | "name">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeCls = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl",
  }[size];
  return (
    <div
      className={cn(
        "shrink-0 rounded-full flex items-center justify-center font-heading font-bold text-white shadow-[var(--shadow-button)]",
        sizeCls,
        className,
      )}
      style={{ backgroundColor: colorFrom(student.id) }}
    >
      {initialsFrom(student.name)}
    </div>
  );
}
