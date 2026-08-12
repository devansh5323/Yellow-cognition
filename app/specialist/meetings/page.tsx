"use client";

import { CalendarDays } from "lucide-react";
import { SpecialistAppShell } from "@/components/specialist/SpecialistAppShell";
import { ComingSoonSection } from "@/components/specialist/ComingSoonSection";

export default function Page() {
  return (
    <SpecialistAppShell>
      <ComingSoonSection
        icon={CalendarDays}
        title="Meetings"
        description="The meetings calendar hasn't been designed yet."
      />
    </SpecialistAppShell>
  );
}
