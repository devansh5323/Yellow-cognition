"use client";

import { BookOpen } from "lucide-react";
import { SpecialistAppShell } from "@/components/specialist/SpecialistAppShell";
import { ComingSoonSection } from "@/components/specialist/ComingSoonSection";

export default function Page() {
  return (
    <SpecialistAppShell>
      <ComingSoonSection
        icon={BookOpen}
        title="Resources"
        description="This section hasn't been designed yet."
      />
    </SpecialistAppShell>
  );
}
