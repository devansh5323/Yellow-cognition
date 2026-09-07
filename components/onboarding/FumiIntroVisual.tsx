"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Globe } from "lucide-react";
import { FumiMascot } from "@/components/onboarding/FumiMascot";
import { FumiGrowthOverviewMock } from "@/components/onboarding/FumiGrowthOverviewMock";
import type { FumiIntroVisual } from "@/components/onboarding/fumiIntroContent";

const EASE = [0.2, 0.7, 0.2, 1] as const;

// The real Fumi marketing site — opened in a new tab so it never derails
// the teacher's own onboarding flow.
const FUMI_WEBSITE_URL = "https://fumi-website-zeta.vercel.app/";

/** The "Meet Fumi" screen's centerpiece — real brand lockup (which already
 * carries the mascot mark), a preview of what a parent sees in the real
 * Fumi app (illustrative, not a literal product screenshot — see
 * FumiGrowthOverviewMock's own note), and a real link out to the Fumi
 * marketing site. The screen's own title/body/bottomText (rendered by
 * FumiIntro.tsx below this) carry the heading copy — no separate heading
 * lives in here, so it isn't duplicated. */
function FumiCentricVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="w-full flex flex-col items-center gap-5">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative h-11 sm:h-12 w-auto"
      >
        <Image
          src="/fumi-logo-full.png"
          alt="Fumi"
          width={1600}
          height={577}
          className="h-full w-auto object-contain"
          priority
        />
      </motion.div>

      <FumiGrowthOverviewMock />

      <motion.a
        href={FUMI_WEBSITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-[14px] font-bold text-foreground/85 hover:bg-muted/40 transition-colors"
      >
        <Globe className="h-4 w-4 text-primary shrink-0" />
        Visit the Fumi website
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </motion.a>
    </div>
  );
}

export function FumiIntroVisualPicker({ visual }: { visual: FumiIntroVisual }) {
  if (visual === "app-preview") return <FumiCentricVisual />;
  if (visual === "mascot") return <FumiMascot className="mx-auto h-36 w-36 sm:h-40 sm:w-40" />;
  return null;
}
