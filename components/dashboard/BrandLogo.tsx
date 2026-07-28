"use client";

import { cn } from "@/lib/utils";
import logoLight from "@/assets/yellow-logo-light.png";
import logoDark from "@/assets/yellow-logo-dark.png";

type BrandLogoProps = {
  variant?: "mark" | "full";
  className?: string;
};

/**
 * Yellow brand lockup. Renders the light-mode logo by default and the
 * dark-mode variant inside `.dark`. The "mark" variant crops the image
 * to show only the yellow disc icon.
 */
export function BrandLogo({ variant = "full", className }: BrandLogoProps) {
  if (variant === "mark") {
    // The full logo PNG has the disc on the far left; crop with object-left
    // and a square wrapper to display only the mark.
    return (
      <span
        className={cn(
          "relative inline-block h-10 w-10 overflow-hidden shrink-0",
          className,
        )}
        aria-label="Yellow"
      >
        <img
          src={logoLight.src}
          alt=""
          className="block dark:hidden absolute inset-y-0 left-0 h-full w-auto max-w-none object-contain object-left"
          draggable={false}
        />
        <img
          src={logoDark.src}
          alt=""
          className="hidden dark:block absolute inset-y-0 left-0 h-full w-auto max-w-none object-contain object-left"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center", className)} aria-label="Yellow">
      <img
        src={logoLight.src}
        alt="Yellow"
        className="block dark:hidden h-8 w-auto select-none"
        draggable={false}
      />
      <img
        src={logoDark.src}
        alt="Yellow"
        className="hidden dark:block h-8 w-auto select-none"
        draggable={false}
      />
    </span>
  );
}
