"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/** Fumi's real brand mascot (public/fumi-mascot.png — cropped from the
 * official app-icon lockup) for static screens like onboarding, replacing
 * the earlier hand-drawn placeholder illustration. */
export function FumiMascot({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={reduce ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <Image
        src="/fumi-mascot.png"
        alt="Fumi"
        width={577}
        height={577}
        className="w-full h-full object-contain rounded-[22%]"
        priority
      />
    </motion.div>
  );
}
