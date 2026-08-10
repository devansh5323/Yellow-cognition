"use client";

import { BarChart3 } from "lucide-react";
import { SpecialistAppShell } from "@/components/specialist/SpecialistAppShell";
import { ComingSoonSection } from "@/components/specialist/ComingSoonSection";

export default function Page() {
  return (
    <SpecialistAppShell>
      <ComingSoonSection
        icon={BarChart3}
        title="Reports"
        description="Report generation hasn't been designed yet."
      />
    </SpecialistAppShell>
  );
}
