"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function ComingSoonSection({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="rounded-2xl border border-border bg-card p-10 text-center"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
        <Icon className="h-5 w-5" />
      </span>
      <h1 className="font-heading font-extrabold text-[20px] leading-tight">{title}</h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground max-w-md mx-auto">{description}</p>
    </motion.div>
  );
}
