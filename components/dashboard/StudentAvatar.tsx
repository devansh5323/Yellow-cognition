"use client";

import { cn } from "@/lib/utils";
import type { Student } from "@/data/mockData";

export function StudentAvatar({
  student,
  size = "md",
  className,
}: {
  student: Pick<Student, "initials" | "avatarColor">;
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
      style={{ backgroundColor: student.avatarColor }}
    >
      {student.initials}
    </div>
  );
}
