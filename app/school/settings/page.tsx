"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Building2,
  Bell,
  ShieldCheck,
  MessageCircle,
  Database,
  Save,
  Moon,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SchoolAppShell } from "@/components/school/SchoolAppShell";
import { markSchoolTaskDone } from "@/lib/schoolOnboarding";
import { getTheme, setTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <SchoolAppShell>
      <SettingsPage />
    </SchoolAppShell>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

const TABS = [
  { value: "profile", label: "School profile", Icon: Building2 },
  { value: "appearance", label: "Appearance", Icon: Palette },
  { value: "alerts", label: "Alert thresholds", Icon: Bell },
  { value: "parent-comms", label: "Parent comms", Icon: MessageCircle },
  { value: "data", label: "Data & privacy", Icon: Database },
] as const;

function SettingsPage() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      <section className="premium-elevated rounded-[22px] p-5 sm:p-6">
        <div className="premium-eyebrow">
          <SettingsIcon className="h-3 w-3" /> School settings
        </div>
        <h1 className="mt-1.5 font-heading font-extrabold text-[24px] sm:text-[28px] leading-tight tracking-tight">
          Your school's source of truth
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Profile, thresholds, parent communications, and data controls.
        </p>
      </section>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted/60 backdrop-blur flex-wrap h-auto rounded-full border border-border/70 p-1 w-full justify-start gap-0.5">
          {TABS.map(({ value, label, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "rounded-full px-3.5 h-9 text-[12.5px] font-bold inline-flex items-center gap-1.5",
                "data-[state=active]:bg-card data-[state=active]:shadow-[0_6px_14px_-8px_hsl(230_50%_18%/0.22)]",
                "data-[state=active]:text-foreground",
                "data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <ProfileCard />
        </TabsContent>
        <TabsContent value="appearance" className="mt-0">
          <AppearanceCard />
        </TabsContent>
        <TabsContent value="alerts" className="mt-0">
          <AlertsCard />
        </TabsContent>
        <TabsContent value="parent-comms" className="mt-0">
          <ParentCommsCard />
        </TabsContent>
        <TabsContent value="data" className="mt-0">
          <DataCard />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return <section className="premium-surface rounded-[18px] p-5 space-y-4">{children}</section>;
}

function ProfileCard() {
  const [name, setName] = useState("Riverside Academy");
  const [city, setCity] = useState("Bengaluru, India");
  const [type, setType] = useState("Private");
  const [website, setWebsite] = useState("riversideacademy.edu");

  const save = () => {
    toast.success("School profile updated");
  };

  return (
    <CardShell>
      <Header
        Icon={Building2}
        title="School profile"
        subtitle="Public details that show on reports and parent communications"
      />
      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label="School name" value={name} onChange={setName} />
        <Field label="City / region" value={city} onChange={setCity} />
        <Field label="School type" value={type} onChange={setType} />
        <Field label="Website" value={website} onChange={setWebsite} />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={save}
          className="rounded-xl h-10 px-5 shadow-[0_8px_20px_-10px_hsl(142_55%_35%/0.55)]"
        >
          <Save className="h-4 w-4 mr-1.5" /> Save changes
        </Button>
      </div>
    </CardShell>
  );
}

function AppearanceCard() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  const darkMode = theme === "dark";

  const toggleDarkMode = (checked: boolean) => {
    const nextTheme: Theme = checked ? "dark" : "light";
    setThemeState(nextTheme);
    setTheme(nextTheme);
    toast.success(`${checked ? "Dark" : "Light"} mode enabled`);
  };

  return (
    <CardShell>
      <Header
        Icon={Palette}
        title="Appearance"
        subtitle="Choose how the school dashboard looks on this device"
      />
      <div className="rounded-xl p-4 border border-border/60 bg-card/40 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="h-10 w-10 rounded-xl bg-muted/70 text-muted-foreground flex items-center justify-center shrink-0">
            <Moon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold">Dark mode</div>
            <div className="text-[11.5px] text-muted-foreground">
              Applies to the school dashboard and teacher dashboard on this browser.
            </div>
          </div>
        </div>
        <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
      </div>
    </CardShell>
  );
}

function AlertsCard() {
  const [pfi, setPfi] = useState([60]);
  const [inactivity, setInactivity] = useState([7]);
  const [classCheckIn, setClassCheckIn] = useState([2]);

  const save = () => {
    markSchoolTaskDone("set-thresholds");
    toast.success("Alert thresholds saved");
  };

  return (
    <CardShell>
      <Header
        Icon={Bell}
        title="Alert thresholds"
        subtitle="When Yellow should surface a student, class, or teacher"
      />
      <div className="grid lg:grid-cols-3 gap-3.5">
        <ThresholdTile
          label="Flag students when PFI is below"
          value={pfi[0]}
          onChange={(v) => setPfi([v])}
          min={0}
          max={100}
          suffix=""
        />
        <ThresholdTile
          label="Mark students inactive after"
          value={inactivity[0]}
          onChange={(v) => setInactivity([v])}
          min={1}
          max={21}
          suffix=" days"
        />
        <ThresholdTile
          label="Nudge teachers if no check-in for"
          value={classCheckIn[0]}
          onChange={(v) => setClassCheckIn([v])}
          min={1}
          max={14}
          suffix=" days"
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={save}
          className="rounded-xl h-10 px-5 shadow-[0_8px_20px_-10px_hsl(142_55%_35%/0.55)]"
        >
          <Save className="h-4 w-4 mr-1.5" /> Save thresholds
        </Button>
      </div>
    </CardShell>
  );
}

function ThresholdTile({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix: string;
}) {
  return (
    <div className="rounded-xl p-4 border border-border/60 bg-card/40">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-[12.5px] font-semibold leading-snug">{label}</Label>
        <span className="font-heading font-extrabold text-primary tabular-nums text-[15px]">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={1}
        className="mt-3"
      />
    </div>
  );
}

function ParentCommsCard() {
  const [welcomeOn, setWelcomeOn] = useState(true);
  const [monthlyOn, setMonthlyOn] = useState(true);
  const [atRiskOn, setAtRiskOn] = useState(false);
  const [optOut, setOptOut] = useState(true);
  const [sender, setSender] = useState("Riverside Academy");

  const save = () => {
    markSchoolTaskDone("configure-parent-comms");
    toast.success("Parent communications updated");
  };

  return (
    <CardShell>
      <Header
        Icon={MessageCircle}
        title="Parent communications"
        subtitle="Branding, cadence, and opt-out rules for messages we send to families"
      />
      <Field label="Sender name" value={sender} onChange={setSender} />
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
    </CardShell>
  );
}

function DataCard() {
  return (
    <CardShell>
      <Header
        Icon={Database}
        title="Data & privacy"
        subtitle="FERPA / GDPR-aligned controls and retention"
      />
      <div className="rounded-xl p-3 border border-primary/30 bg-primary/[0.04] flex items-start gap-3">
        <span className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="flex-1 text-[12.5px]">
          <div className="font-heading font-extrabold">Compliance is healthy</div>
          <div className="text-muted-foreground mt-0.5">
            All student records redacted from teacher-side analytics. Admin-only access for raw
            exports. Retention: 24 months from last activity.
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-2">
        <ToggleRow
          label="Share anonymised usage with research partners"
          hint="Helps improve Yellow. Never includes any PII."
          defaultOn={false}
        />
        <ToggleRow
          label="Allow teacher self-export of their own classes"
          hint="Teachers can pull their own CSV/PDF without admin approval"
          defaultOn={true}
        />
      </div>
    </CardShell>
  );
}

function Header({
  Icon,
  title,
  subtitle,
}: {
  Icon: typeof Building2;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="premium-eyebrow">
        <Icon className="h-3 w-3" />
        <span>{title}</span>
      </div>
      <h2 className="mt-1.5 font-heading font-extrabold text-[16px] leading-tight">{title}</h2>
      <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl bg-card/70 backdrop-blur border-border/80"
      />
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  defaultOn,
}: {
  label: string;
  hint: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  defaultOn?: boolean;
}) {
  const [internal, setInternal] = useState(defaultOn ?? false);
  const isControlled = checked !== undefined;
  const value = isControlled ? checked! : internal;
  const handle = (v: boolean) => {
    if (isControlled) onChange?.(v);
    else setInternal(v);
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl p-3 border border-border/60 bg-card/40">
      <div className="min-w-0">
        <div className="text-[13px] font-semibold">{label}</div>
        <div className="text-[11.5px] text-muted-foreground">{hint}</div>
      </div>
      <Switch checked={value} onCheckedChange={handle} />
    </div>
  );
}
