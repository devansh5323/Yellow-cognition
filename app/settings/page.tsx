"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/dashboard/AppShell";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  UserCircle2,
  SlidersHorizontal,
  Palette,
  Lock,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Globe,
  Accessibility as AccessibilityIcon,
  Database,
  Download,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle2,
  Users,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTheme, setTheme, type Theme } from "@/lib/theme";
import { toast } from "sonner";
import {
  getOnboarding,
  setOnboarding,
  type OnboardingState,
  type RosterMethod,
} from "@/lib/onboarding";
import { RosterPicker, rosterMethodLabel } from "@/components/onboarding/RosterPicker";
import { RosterManager } from "@/components/onboarding/RosterManager";

type SettingsTab = (typeof SETTINGS_TABS)[number]["value"];

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AppShell>
        <SettingsPage />
      </AppShell>
    </Suspense>
  );
}

const EASE = [0.2, 0.7, 0.2, 1] as const;

const SETTINGS_TABS = [
  { value: "profile", label: "Profile", Icon: UserCircle2 },
  { value: "roster", label: "Roster", Icon: Users },
  { value: "security", label: "Security", Icon: Lock },
  { value: "appearance", label: "Appearance", Icon: Palette },
  { value: "accessibility", label: "Accessibility", Icon: AccessibilityIcon },
  { value: "language", label: "Language", Icon: Globe },
  { value: "alerts", label: "Alerts", Icon: SlidersHorizontal },
  { value: "notifications", label: "Notifications", Icon: Bell },
  { value: "privacy", label: "Privacy", Icon: Database },
] as const;

function SettingsPage() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const allowedTabs = SETTINGS_TABS.map((t) => t.value) as readonly SettingsTab[];
  const urlTab = searchParams?.get("tab");
  const initialTab: SettingsTab =
    urlTab && (allowedTabs as readonly string[]).includes(urlTab) ? (urlTab as SettingsTab) : "profile";
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (urlTab && (allowedTabs as readonly string[]).includes(urlTab) && urlTab !== tab) {
      setTab(urlTab as SettingsTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTab]);

  const handleTabChange = (value: string) => {
    const next = value as SettingsTab;
    setTab(next);
    router.replace(`/settings?tab=${next}`);
  };

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5 w-full"
    >
      <Tabs value={tab} onValueChange={handleTabChange} className="space-y-5">
        <TabsList className="bg-muted/60 backdrop-blur flex-wrap h-auto rounded-full border border-border/70 p-1 w-full justify-start gap-0.5">
          {SETTINGS_TABS.map(({ value, label, Icon }) => (
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
          <SettingsCard>
            <ProfileCard />
          </SettingsCard>
        </TabsContent>
        <TabsContent value="roster" className="mt-0">
          <SettingsCard>
            <RosterCard />
          </SettingsCard>
        </TabsContent>
        <TabsContent value="security" className="mt-0">
          <SettingsCard>
            <SecurityCard />
          </SettingsCard>
        </TabsContent>
        <TabsContent value="appearance" className="mt-0">
          <SettingsCard>
            <AppearanceCard />
          </SettingsCard>
        </TabsContent>
        <TabsContent value="accessibility" className="mt-0">
          <SettingsCard>
            <AccessibilityCard />
          </SettingsCard>
        </TabsContent>
        <TabsContent value="language" className="mt-0">
          <SettingsCard>
            <LanguageCard />
          </SettingsCard>
        </TabsContent>
        <TabsContent value="alerts" className="mt-0">
          <SettingsCard>
            <AlertThresholdsCard />
          </SettingsCard>
        </TabsContent>
        <TabsContent value="notifications" className="mt-0">
          <NotificationsCard />
        </TabsContent>
        <TabsContent value="privacy" className="mt-0">
          <SettingsCard>
            <DataPrivacyCard />
          </SettingsCard>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" className="rounded-xl bg-card/70 backdrop-blur h-10">
          Cancel
        </Button>
        <Button className="rounded-xl h-10 px-5 shadow-[0_8px_20px_-10px_hsl(142_55%_35%/0.55)]">
          Save changes
        </Button>
      </div>
    </motion.div>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return <section className="premium-surface rounded-[18px] p-5 space-y-4">{children}</section>;
}

// ───────────────────── Profile ─────────────────────

function ProfileCard() {
  return (
    <>
      <SectionHeader
        icon={<UserCircle2 className="h-4 w-4 text-primary" />}
        title="Profile"
        subtitle="How you appear across the platform"
      />

      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16 border border-border/70 shadow-[0_8px_20px_-10px_hsl(230_50%_18%/0.25)]">
            <AvatarFallback className="bg-gradient-to-br from-[hsl(260_55%_72%)] to-[hsl(200_60%_60%)] text-white font-heading font-extrabold text-[17px]">
              MK
            </AvatarFallback>
          </Avatar>
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary border-2 border-card"
            aria-hidden
          />
        </div>
        <Button variant="outline" className="rounded-xl bg-card/70 backdrop-blur">
          Change photo
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <SettingsField label="Full name" defaultValue="Maya Khan" />
        <SettingsField label="Email" defaultValue="maya.khan@school.edu" />
        <SettingsField label="School" defaultValue="Riverside Academy" />
        <SettingsField label="Primary class" defaultValue="Grade 3 — Section A" />
      </div>
    </>
  );
}

// ───────────────────── Roster ─────────────────────

function RosterCard() {
  const [state, setLocalState] = useState<OnboardingState | null>(null);
  const [pending, setPending] = useState<RosterMethod | null>(null);

  useEffect(() => {
    const refresh = () => {
      const s = getOnboarding();
      setLocalState(s);
      setPending(s.primaryClass?.rosterMethod ?? null);
    };
    refresh();
    window.addEventListener("ah-onboarding-change", refresh);
    return () => window.removeEventListener("ah-onboarding-change", refresh);
  }, []);

  if (!state) {
    return (
      <>
        <SectionHeader
          icon={<Users className="h-4 w-4 text-primary" />}
          title="Class roster"
          subtitle="Bring in your students whenever you're ready"
        />
        <div className="text-[12.5px] text-muted-foreground">Loading roster…</div>
      </>
    );
  }

  const cls = state.primaryClass;
  const current = cls?.rosterMethod ?? null;
  const className = cls?.name?.trim() || "Untitled class";
  const size = cls?.size ?? 0;
  // "Real" roster means a method that brings in actual students. Sample is the only placeholder.
  const usingPlaceholder = !current || current === "sample";

  const dirty = pending !== null && pending !== current;

  const save = () => {
    if (!pending || !dirty) return;
    setOnboarding({
      primaryClass: {
        name: cls?.name ?? "Class A",
        period: cls?.period ?? "Morning · 8:30–9:20",
        size: cls?.size ?? 24,
        rosterMethod: pending,
        rosterReady: true,
      },
    });
    toast.success(`Roster set to ${rosterMethodLabel(pending)}`);
  };

  const cancel = () => setPending(current);

  return (
    <>
      <SectionHeader
        icon={<Users className="h-4 w-4 text-primary" />}
        title="Class roster"
        subtitle="Bring in your students whenever you're ready"
      />

      {/* Current state banner */}
      <div
        className={cn(
          "rounded-2xl p-4 border flex items-start gap-3 transition-colors",
          usingPlaceholder
            ? "border-amber-500/30 bg-amber-500/[0.05]"
            : "border-primary/30 bg-primary/[0.05]",
        )}
      >
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
            usingPlaceholder
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : "bg-primary/15 text-primary",
          )}
        >
          {usingPlaceholder ? (
            <AlertTriangle className="h-[18px] w-[18px]" />
          ) : (
            <CheckCircle2 className="h-[18px] w-[18px]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-heading font-extrabold text-[14.5px] flex items-center gap-2 flex-wrap">
            {className}
            <span className="font-body font-semibold text-[12px] text-muted-foreground">
              · {size} {size === 1 ? "student" : "students"}
            </span>
          </div>
          <div className="text-[12.5px] text-muted-foreground mt-0.5">
            {current === "sample" && (
              <>
                You're exploring with a{" "}
                <span className="text-foreground font-semibold">sample class</span>. Pick a method
                below to bring in your real students.
              </>
            )}
            {current === "invite" && (
              <>
                Inviting parents via the{" "}
                <span className="text-foreground font-semibold">Yellow parent app</span>. Each
                family creates the child's profile after signing in.
              </>
            )}
            {current === "manual" && (
              <>
                Adding students one-by-one with{" "}
                <span className="text-foreground font-semibold">parent contact</span>. Each new
                entry can send an invite immediately or be queued.
              </>
            )}
            {current === "csv" && (
              <>
                Roster currently sourced from{" "}
                <span className="text-foreground font-semibold">CSV upload</span>.
              </>
            )}
            {current === "google" && (
              <>
                Synced with <span className="text-foreground font-semibold">Google Classroom</span>.
              </>
            )}
            {!current && <>No roster method set yet.</>}
          </div>
        </div>
      </div>

      {/* Picker — pending selection */}
      <div>
        <div className="premium-eyebrow mb-3">
          <Users className="h-3 w-3" />
          <span>Choose a method</span>
        </div>
        <RosterPicker value={pending} onChange={setPending} />
      </div>

      {/* Save controls */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          variant="outline"
          onClick={cancel}
          disabled={!dirty}
          className="rounded-xl bg-card/70 backdrop-blur h-10 disabled:opacity-50"
        >
          Cancel changes
        </Button>
        <Button
          onClick={save}
          disabled={!dirty || pending === null}
          className="rounded-xl h-10 px-5 shadow-[0_8px_20px_-10px_hsl(142_55%_35%/0.55)]"
        >
          {dirty ? `Save · ${rosterMethodLabel(pending)}` : "Saved"}
        </Button>
      </div>

      {/* ───── Roster manager — entry forms + activation stats + table ───── */}
      <div className="pt-2">
        <RosterManager method={current} />
      </div>
    </>
  );
}

// ───────────────────── Appearance ─────────────────────

function AppearanceCard() {
  const reduce = useReducedMotion();
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  const choose = (t: Theme) => {
    setThemeState(t);
    setTheme(t);
  };

  return (
    <>
      <SectionHeader
        icon={<Palette className="h-4 w-4 text-primary" />}
        title="Appearance"
        subtitle="Choose how Yellow looks to you"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(
          [
            {
              v: "light",
              label: "Light",
              icon: Sun,
              preview: "bg-gradient-to-br from-[hsl(240_30%_99%)] to-[hsl(250_30%_95%)]",
            },
            {
              v: "dark",
              label: "Dark",
              icon: Moon,
              preview: "bg-gradient-to-br from-[hsl(230_30%_14%)] to-[hsl(240_30%_10%)]",
            },
          ] as const
        ).map(({ v, label, icon: Icon, preview }) => {
          const active = theme === v;
          return (
            <motion.button
              key={v}
              onClick={() => choose(v)}
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className={cn(
                "group relative flex flex-col items-stretch rounded-[14px] border-2 p-3 transition-colors text-left overflow-hidden",
                active
                  ? "border-primary/60 bg-primary/[0.05]"
                  : "border-border/70 bg-card/60 hover:border-primary/40",
              )}
            >
              <div
                className={cn(
                  "h-10 w-full rounded-lg mb-3 ring-1 ring-border/60 relative overflow-hidden",
                  preview,
                )}
                aria-hidden
              >
                <span className="absolute top-1.5 left-1.5 h-1.5 w-6 rounded-full bg-foreground/20" />
                <span className="absolute top-4 left-1.5 h-1 w-10 rounded-full bg-foreground/10" />
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                {active && (
                  <span
                    className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(142_55%_45%/0.2)]"
                    aria-hidden
                  />
                )}
              </div>
            </motion.button>
          );
        })}
        <motion.button
          onClick={() => {
            const sys: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light";
            choose(sys);
          }}
          whileHover={reduce ? undefined : { y: -2 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="group relative flex flex-col items-stretch rounded-[14px] border-2 border-border/70 bg-card/60 hover:border-primary/40 transition-colors p-3 text-left overflow-hidden"
        >
          <div
            className="h-10 w-full rounded-lg mb-3 ring-1 ring-border/60 bg-gradient-to-r from-[hsl(240_30%_99%)] via-[hsl(250_30%_92%)] to-[hsl(230_30%_14%)]"
            aria-hidden
          />
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold">
            <Monitor className="h-4 w-4" />
            System
          </span>
        </motion.button>
      </div>
    </>
  );
}

// ───────────────────── Alert thresholds ─────────────────────

function AlertThresholdsCard() {
  const [pfiThreshold, setPfiThreshold] = useState([60]);
  const [inactivityDays, setInactivityDays] = useState([3]);

  return (
    <>
      <SectionHeader
        icon={<SlidersHorizontal className="h-4 w-4 text-primary" />}
        title="Alert thresholds"
        subtitle="When we should surface a student"
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-4 border border-border/60 bg-card/40">
          <div className="flex items-center justify-between">
            <Label className="text-[13px] font-semibold">Flag students when PFI is below</Label>
            <span className="font-heading font-extrabold text-primary tabular-nums text-[15px]">
              {pfiThreshold[0]}
            </span>
          </div>
          <Slider
            value={pfiThreshold}
            onValueChange={setPfiThreshold}
            max={100}
            step={1}
            className="mt-3"
          />
        </div>
        <div className="rounded-xl p-4 border border-border/60 bg-card/40">
          <div className="flex items-center justify-between">
            <Label className="text-[13px] font-semibold">Mark inactive after</Label>
            <span className="font-heading font-extrabold text-primary tabular-nums text-[15px]">
              {inactivityDays[0]} days
            </span>
          </div>
          <Slider
            value={inactivityDays}
            onValueChange={setInactivityDays}
            min={1}
            max={14}
            step={1}
            className="mt-3"
          />
        </div>
      </div>
    </>
  );
}

// ───────────────────── Security ─────────────────────

type SessionRow = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current?: boolean;
};

const INITIAL_SESSIONS: SessionRow[] = [
  {
    id: "s1",
    device: "Chrome · MacBook Pro",
    location: "Bengaluru, IN",
    lastActive: "Active now",
    current: true,
  },
  { id: "s2", device: "Safari · iPhone 14", location: "Bengaluru, IN", lastActive: "3 hours ago" },
  { id: "s3", device: "Chrome · Windows", location: "Mumbai, IN", lastActive: "Yesterday" },
];

function SecurityCard() {
  const [resetOpen, setResetOpen] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>(INITIAL_SESSIONS);

  const signOutSession = (id: string) => {
    const s = sessions.find((x) => x.id === id);
    setSessions((prev) => prev.filter((x) => x.id !== id));
    toast.success(`Signed out ${s?.device ?? "session"}`);
  };

  const signOutOthers = () => {
    setSessions((prev) => prev.filter((s) => s.current));
    toast.success("Signed out of all other sessions");
  };

  const toggle2FA = (next: boolean) => {
    setTwoFactor(next);
    if (next) toast.success("Two-factor authentication enabled");
    else toast("Two-factor authentication disabled");
  };

  return (
    <>
      <SectionHeader
        icon={<Lock className="h-4 w-4 text-primary" />}
        title="Security"
        subtitle="Keep your account safe"
      />

      <div className="grid lg:grid-cols-2 gap-3">
        {/* Password */}
        <div className="flex items-center justify-between gap-3 rounded-xl p-3 border border-border/60 bg-card/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary/12 text-primary flex items-center justify-center shrink-0">
              <KeyRound className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold">Password</div>
              <div className="text-[11.5px] text-muted-foreground">Last changed 2 months ago</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetOpen(true)}
            className="rounded-lg bg-card/70"
          >
            Reset password
          </Button>
        </div>

        {/* 2FA */}
        <div className="flex items-center justify-between gap-3 rounded-xl p-3 border border-border/60 bg-card/40">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                twoFactor ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold flex items-center gap-1.5">
                Two-factor authentication
                {twoFactor && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-primary/15 text-primary border border-primary/25">
                    <CheckCircle2 className="h-2.5 w-2.5" /> On
                  </span>
                )}
              </div>
              <div className="text-[11.5px] text-muted-foreground">
                Add a one-time code step when you sign in
              </div>
            </div>
          </div>
          <Switch checked={twoFactor} onCheckedChange={toggle2FA} />
        </div>
      </div>

      {/* Active sessions */}
      <div className="rounded-xl p-3 border border-border/60 bg-card/40">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" />
            <span className="text-[13px] font-semibold">Active sessions</span>
            <span className="text-[10.5px] font-bold text-muted-foreground tabular-nums">
              {sessions.length}
            </span>
          </div>
          {sessions.filter((s) => !s.current).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOutOthers}
              className="text-[11.5px] font-semibold text-destructive hover:text-destructive h-7"
            >
              Sign out others
            </Button>
          )}
        </div>
        <ul className="divide-y divide-border/60">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold flex items-center gap-1.5 flex-wrap">
                  {s.device}
                  {s.current && (
                    <span className="inline-flex items-center text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-primary/15 text-primary border border-primary/25">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground tabular-nums">
                  {s.location} · {s.lastActive}
                </div>
              </div>
              {!s.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOutSession(s.id)}
                  className="text-[11.5px] font-semibold text-muted-foreground hover:text-destructive h-7 px-2"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" /> Sign out
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <ResetPasswordDialog open={resetOpen} onOpenChange={setResetOpen} />
    </>
  );
}

function ResetPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNext, setShowNext] = useState(false);

  const validate = () => {
    if (current.length < 1) return "Enter your current password";
    if (next.length < 8) return "New password must be at least 8 characters";
    if (next === current) return "New password must be different from current";
    if (confirm !== next) return "New passwords don't match";
    return null;
  };
  const err = validate();

  const reset = () => {
    if (!current && !next && !confirm) return;
    const e = validate();
    if (e) {
      toast.error(e);
      return;
    }
    toast.success("Password updated");
    setCurrent("");
    setNext("");
    setConfirm("");
    onOpenChange(false);
  };

  // crude strength meter
  const strength = Math.min(
    4,
    (next.length >= 8 ? 1 : 0) +
      (/[A-Z]/.test(next) ? 1 : 0) +
      (/[0-9]/.test(next) ? 1 : 0) +
      (/[^A-Za-z0-9]/.test(next) ? 1 : 0),
  );
  const strengthLabel = ["Too short", "Weak", "Okay", "Strong", "Excellent"][strength];
  const strengthTone = [
    "bg-destructive/80",
    "bg-destructive",
    "bg-amber-500",
    "bg-primary",
    "bg-primary",
  ][strength];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Reset password
          </DialogTitle>
          <DialogDescription>
            Enter your current password and pick a new one with at least 8 characters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold">Current password</Label>
            <Input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••••"
              className="h-10 rounded-xl"
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold">New password</Label>
            <div className="relative">
              <Input
                type={showNext ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="At least 8 characters"
                className="h-10 rounded-xl pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNext((x) => !x)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                aria-label={showNext ? "Hide password" : "Show password"}
              >
                {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {next.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full transition-all", strengthTone)}
                    style={{ width: `${(strength / 4) * 100}%` }}
                  />
                </div>
                <span className="text-[10.5px] font-bold tabular-nums text-muted-foreground">
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold">Confirm new password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              className="h-10 rounded-xl"
              autoComplete="new-password"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!!err}
            onClick={reset}
            className="rounded-xl shadow-[0_6px_14px_-6px_hsl(142_55%_35%/0.55)]"
          >
            Update password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ───────────────────── Accessibility ─────────────────────

function AccessibilityCard() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState([100]);

  return (
    <>
      <SectionHeader
        icon={<AccessibilityIcon className="h-4 w-4 text-primary" />}
        title="Accessibility"
        subtitle="Make Yellow easier to use"
      />
      <div className="grid lg:grid-cols-2 gap-3">
        <ToggleRow
          label="Reduce motion"
          hint="Turn off animated transitions and staggered reveals"
          checked={reduceMotion}
          onChange={(v) => {
            setReduceMotion(v);
            toast(v ? "Reduced motion enabled" : "Reduced motion disabled");
          }}
        />
        <ToggleRow
          label="High contrast"
          hint="Stronger borders and text for better legibility"
          checked={highContrast}
          onChange={(v) => {
            setHighContrast(v);
            toast(v ? "High contrast enabled" : "High contrast disabled");
          }}
        />
      </div>
      <div className="rounded-xl p-3 border border-border/60 bg-card/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold">Text size</div>
            <div className="text-[11.5px] text-muted-foreground">
              Scales body text across the app
            </div>
          </div>
          <span className="font-heading font-extrabold text-primary tabular-nums text-[14px]">
            {textSize[0]}%
          </span>
        </div>
        <Slider
          value={textSize}
          onValueChange={setTextSize}
          min={85}
          max={130}
          step={5}
          className="mt-3"
        />
      </div>
    </>
  );
}

// ───────────────────── Language & region ─────────────────────

function LanguageCard() {
  const [language, setLanguage] = useState("en-IN");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  return (
    <>
      <SectionHeader
        icon={<Globe className="h-4 w-4 text-primary" />}
        title="Language & region"
        subtitle="How dates, numbers and text are shown"
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="space-y-1.5">
          <Label className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Language
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-11 rounded-xl bg-card/70 backdrop-blur">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="en-IN">English (India)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="hi-IN">हिन्दी</SelectItem>
              <SelectItem value="es-ES">Español</SelectItem>
              <SelectItem value="fr-FR">Français</SelectItem>
              <SelectItem value="ar-AE">العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Timezone
          </Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="h-11 rounded-xl bg-card/70 backdrop-blur">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST · UTC+5:30)</SelectItem>
              <SelectItem value="Asia/Dubai">Asia/Dubai (GST · UTC+4)</SelectItem>
              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
              <SelectItem value="America/New_York">America/New_York (ET)</SelectItem>
              <SelectItem value="America/Los_Angeles">America/Los_Angeles (PT)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Date format
          </Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="h-11 rounded-xl bg-card/70 backdrop-blur">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY — 25/04/2026</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY — 04/25/2026</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD — 2026-04-25</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Week starts on
          </Label>
          <Select defaultValue="mon">
            <SelectTrigger className="h-11 rounded-xl bg-card/70 backdrop-blur">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="sun">Sunday</SelectItem>
              <SelectItem value="mon">Monday</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}

// ───────────────────── Data & privacy ─────────────────────

function DataPrivacyCard() {
  const [analytics, setAnalytics] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const exportData = () => {
    toast.success("Data export queued — you'll get an email when it's ready");
  };

  return (
    <>
      <SectionHeader
        icon={<Database className="h-4 w-4 text-primary" />}
        title="Data & privacy"
        subtitle="Export, analytics, and account removal"
      />

      <div className="grid lg:grid-cols-2 gap-3">
        <ToggleRow
          label="Share anonymous usage data"
          hint="Helps us improve Yellow. Never includes student data."
          checked={analytics}
          onChange={setAnalytics}
        />

        <div className="flex items-center justify-between gap-3 rounded-xl p-3 border border-border/60 bg-card/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary/12 text-primary flex items-center justify-center shrink-0">
              <Download className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold">Export my data</div>
              <div className="text-[11.5px] text-muted-foreground">
                Classes, notes, and check-ins (CSV + JSON)
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            className="rounded-lg bg-card/70"
          >
            Request
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl p-3 border border-destructive/25 bg-destructive/[0.04]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
              <Trash2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-destructive">Delete account</div>
              <div className="text-[11.5px] text-muted-foreground">
                Permanently remove your profile and all associated data
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Delete…
          </Button>
        </div>
      </div>

      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

function DeleteAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [confirm, setConfirm] = useState("");
  const canDelete = confirm === "DELETE";

  const destroy = () => {
    if (!canDelete) return;
    toast.error("Account scheduled for deletion");
    onOpenChange(false);
    setConfirm("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setConfirm("");
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete your account
          </DialogTitle>
          <DialogDescription>
            This will permanently remove your account, notes, and exported reports. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label className="text-[12px] font-semibold">
            Type <span className="font-mono tabular-nums text-destructive">DELETE</span> to confirm
          </Label>
          <Input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            className="h-10 rounded-xl"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canDelete}
            onClick={destroy}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_6px_14px_-6px_hsl(0_78%_45%/0.6)]"
          >
            I understand — delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ───────────────────── Notifications ─────────────────────

const NOTIFICATIONS = [
  { k: "Monthly summary email", v: true, hint: "A digest of this month's alerts and wins" },
  {
    k: "At-risk student alerts",
    v: true,
    hint: "Notify me when a check-in flags a student as at risk",
  },
  { k: "Monthly class report", v: true, hint: "Summary of focus + engagement after each check-in" },
  { k: "Parent message replies", v: false, hint: "When a parent replies to an update" },
];

function NotificationsCard() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.k, n.v])),
  );

  const toggle = (key: string, next: boolean) => {
    setPrefs((p) => ({ ...p, [key]: next }));
    if (next) toast.success(`${key} enabled`);
    else toast(`${key} disabled`);
  };

  const enableAll = () => {
    setPrefs(Object.fromEntries(NOTIFICATIONS.map((n) => [n.k, true])));
    toast.success("All notifications enabled");
  };

  return (
    <section className="premium-surface rounded-[18px] p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <SectionHeader
          icon={<Bell className="h-4 w-4 text-primary" />}
          title="Notifications"
          subtitle="What we email and alert you about"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={enableAll}
          className="rounded-lg bg-card/70 backdrop-blur"
        >
          Enable all
        </Button>
      </div>
      <ul className="grid lg:grid-cols-2 gap-1.5">
        {NOTIFICATIONS.map((n) => (
          <li
            key={n.k}
            className="flex items-center justify-between gap-3 rounded-xl p-3 border border-transparent hover:border-border/70 hover:bg-muted/30 transition-colors"
          >
            <div className="min-w-0">
              <div className="text-[13px] font-semibold">{n.k}</div>
              <div className="text-[11.5px] text-muted-foreground">{n.hint}</div>
            </div>
            <Switch checked={prefs[n.k]} onCheckedChange={(v) => toggle(n.k, v)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ───────────────────── Small helpers ─────────────────────

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <div className="premium-eyebrow">
        {icon}
        <span>{title}</span>
      </div>
      <h2 className="mt-1.5 font-heading font-extrabold text-[16px] leading-tight">{title}</h2>
      {subtitle && <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

function SettingsField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </Label>
      <Input
        defaultValue={defaultValue}
        className="h-11 rounded-xl bg-card/70 backdrop-blur border-border/80 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary/60 transition-[box-shadow,border-color]"
      />
    </div>
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
