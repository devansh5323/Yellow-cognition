"use client";

import { motion } from "framer-motion";

export function FloatingCTA({ dark = false }: { dark?: boolean }) {
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6 }}
      whileHover="hover"
      className={`group relative inline-flex w-fit items-center gap-3 font-heading text-xl font-bold ${dark ? "text-[#FAF5EC]" : "text-[#4A4038]"}`}
    >
      <motion.span
        variants={{ hover: { scale: 1.5, opacity: 1 } }}
        initial={{ opacity: 0.6 }}
        transition={{ duration: 0.4 }}
        className="h-2.5 w-2.5 rounded-full bg-[#93B3C4]"
        style={{ boxShadow: "0 0 14px 4px rgba(147,179,196,0.55)" }}
      />
      Meet Fumi
      <motion.span
        variants={{ hover: { scaleX: 1 } }}
        initial={{ scaleX: 0.35 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute -bottom-1.5 left-8 right-0 h-[1.5px] origin-left bg-gradient-to-r from-[#93B3C4] to-transparent"
      />
    </motion.a>
  );
}
