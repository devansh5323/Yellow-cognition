"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { markSchoolTaskDone } from "@/lib/schoolOnboarding";

/** Extracted from app/school/settings/page.tsx's "Parent comms" tab so it
 * can also be mounted directly on the school dashboard (via
 * ParentCommsDialog, opened by SchoolDashboardTour's "configure-parent-
 * comms" step) without navigating away from the dashboard first. `onSaved`
 * is only used by that dialog wrapper. */
export function ParentCommsCard({ onSaved }: { onSaved?: () => void } = {}) {
  const [welcomeOn, setWelcomeOn] = useState(true);
  const [monthlyOn, setMonthlyOn] = useState(true);
  const [atRiskOn, setAtRiskOn] = useState(false);
  const [optOut, setOptOut] = useState(true);
  const [sender, setSender] = useState("Riverside Academy");

  const save = () => {
    markSchoolTaskDone("configure-parent-comms");
    toast.success("Parent communications updated");
    onSaved?.();
  };

  return (
    <section className="premium-surface rounded-[18px] p-5 space-y-4">
      <div>
        <div className="premium-eyebrow">
          <MessageCircle className="h-3 w-3" />
          <span>Parent communications</span>
        </div>
        <h2 className="mt-1.5 font-heading font-extrabold text-[16px] leading-tight">Parent communications</h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Branding, cadence, and opt-out rules for messages we send to families
        </p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Sender name
        </Label>
        <Input
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          className="h-11 rounded-xl bg-card/70 backdrop-blur border-border/80"
        />
      </div>
      <div className="grid lg:grid-cols-2 gap-2">
        <ToggleRow
          label="Welcome flow when a parent activates"
          hint="Auto-sends 3-email onboarding"
          checked={welcomeOn}
          onChange={setWelcomeOn}
        />
        <ToggleRow
          label="Monthly child summary"
          hint="End of month · highlights + ask"
          checked={monthlyOn}
          onChange={setMonthlyOn}
        />
        <ToggleRow
          label="Real-time at-risk alert"
          hint="Sent when a child crosses your threshold (admin-controlled)"
          checked={atRiskOn}
          onChange={setAtRiskOn}
        />
        <ToggleRow
          label="Allow parents to opt-out"
          hint="One-click unsubscribe in every email"
          checked={optOut}
          onChange={setOptOut}
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={save}
          className="rounded-xl h-10 px-5 shadow-[0_8px_20px_-10px_hsl(142_55%_35%/0.55)]"
        >
          <Save className="h-4 w-4 mr-1.5" /> Save communications
        </Button>
      </div>
    </section>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl p-3 border border-border/60 bg-card/40">
      <div className="min-w-0">
        <div className="text-[13px] font-semibold">{label}</div>
        <div className="text-[11.5px] text-muted-foreground">{hint}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
