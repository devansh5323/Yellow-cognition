"use client";

import { animate, useMotionValue, useTransform, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

export function AnimatedNumber({
  value,
  duration = 1.1,
  className,
  format,
  decimals,
}: {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
  decimals?: number;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const display = useTransform(mv, (v) => {
    if (decimals !== undefined) return v.toFixed(decimals);
    const n = Math.round(v);
    return format ? format(n) : String(n);
  });

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration,
      ease: [0.2, 0.7, 0.2, 1],
    });
    return () => controls.stop();
  }, [value, duration, mv, reduce]);

  return <motion.span className={className}>{display}</motion.span>;
}
