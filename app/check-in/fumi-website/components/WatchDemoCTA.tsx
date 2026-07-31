"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

export function WatchDemoCTA() {
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, delay: 0.1 }}
      whileHover="hover"
      className="group inline-flex w-fit items-center gap-3 font-heading text-base font-semibold text-[#6B5F52]"
    >
      <motion.span
        variants={{ hover: { scale: 1.08, borderColor: "#4A4038" } }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#6B5F52]/50 text-[#4A4038] transition-colors group-hover:border-[#4A4038]"
      >
        <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" />
      </motion.span>
      Watch Demo
    </motion.a>
  );
}
