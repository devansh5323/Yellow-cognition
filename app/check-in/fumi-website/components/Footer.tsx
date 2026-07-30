"use client";

import { motion } from "framer-motion";

const LINKS = [
  { label: "For Parents", href: "#" },
  { label: "For Schools", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Contact", href: "#" },
];

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5 }}
      className="border-t border-border bg-[#F1E7D6] px-6 py-10 sm:px-10"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <span className="font-heading text-lg font-extrabold text-[#4A4038]">FUMI</span>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-sm font-medium text-[#6B5F52] transition-colors hover:text-[#4A4038]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <span className="font-body text-xs text-[#B98A3E]/70">
          &copy; {new Date().getFullYear()} Yellow Cognition. All rights reserved.
        </span>
      </div>
    </motion.footer>
  );
}
