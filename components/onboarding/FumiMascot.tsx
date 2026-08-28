"use client";

import { motion, useReducedMotion } from "framer-motion";

// Same muted, storybook-calm palette as Fumi's 3D model on the marketing
// site (app/check-in/fumi-website/components/world/palette.ts) — kept as
// plain hex here rather than importing that subtree, since this is a
// lightweight flat illustration, not the 3D scene.
const FUR = "#93B3C4";
const FUR_LIGHT = "#BBD1DB";
const FUR_DEEP = "#6E8FA0";
const BLUSH = "#D6A08D";
const INK = "#4A4038";

/** A small, friendly flat illustration of Fumi — the classroom companion
 * character — for static screens (like onboarding) where the full 3D
 * FumiCompanion scene would be far too heavy. */
export function FumiMascot({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={reduce ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* tail */}
        <path d="M124 108c14 4 20 18 12 30-6 9-18 10-24 2" stroke={FUR_DEEP} strokeWidth="10" strokeLinecap="round" fill="none" />
        {/* ears */}
        <path d="M46 46 C40 22 56 10 66 28 C70 36 64 48 54 50 Z" fill={FUR} />
        <path d="M114 46 C120 22 104 10 94 28 C90 36 96 48 106 50 Z" fill={FUR} />
        <path d="M52 40 C50 28 58 22 63 30 C65 34 61 40 55 41 Z" fill={BLUSH} />
        <path d="M108 40 C110 28 102 22 97 30 C95 34 99 40 105 41 Z" fill={BLUSH} />
        {/* body */}
        <ellipse cx="80" cy="122" rx="34" ry="26" fill={FUR} />
        <ellipse cx="80" cy="128" rx="20" ry="14" fill={FUR_LIGHT} />
        {/* head */}
        <circle cx="80" cy="76" r="42" fill={FUR} />
        <ellipse cx="80" cy="90" rx="20" ry="14" fill={FUR_LIGHT} />
        {/* cheeks */}
        <ellipse cx="54" cy="82" rx="7" ry="5" fill={BLUSH} opacity="0.7" />
        <ellipse cx="106" cy="82" rx="7" ry="5" fill={BLUSH} opacity="0.7" />
        {/* eyes */}
        <motion.g
          animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1, 1, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.72, 0.76, 0.8, 0.9, 1], ease: "easeInOut" }}
          style={{ originY: "0.5px" }}
        >
          <circle cx="66" cy="72" r="5.5" fill={INK} />
          <circle cx="94" cy="72" r="5.5" fill={INK} />
          <circle cx="64.2" cy="70" r="1.6" fill="white" />
          <circle cx="92.2" cy="70" r="1.6" fill="white" />
        </motion.g>
        {/* nose + smile */}
        <ellipse cx="80" cy="86" rx="3.5" ry="2.6" fill={INK} />
        <path d="M80 88.5 C80 93 74 95 70 93" stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M80 88.5 C80 93 86 95 90 93" stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {/* arms */}
        <ellipse cx="46" cy="118" rx="8" ry="14" fill={FUR} transform="rotate(-18 46 118)" />
        <ellipse cx="114" cy="118" rx="8" ry="14" fill={FUR} transform="rotate(18 114 118)" />
      </svg>
    </motion.div>
  );
}
