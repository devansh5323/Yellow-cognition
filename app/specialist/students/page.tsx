"use client";

import { Users } from "lucide-react";
import { SpecialistAppShell } from "@/components/specialist/SpecialistAppShell";
import { ComingSoonSection } from "@/components/specialist/ComingSoonSection";

export default function Page() {
  return (
    <SpecialistAppShell>
      <ComingSoonSection
        icon={Users}
        title="Students"
        description="The full student list view hasn't been designed yet — check the Dashboard for the current caseload summary."
      />
    </SpecialistAppShell>
  );
}
