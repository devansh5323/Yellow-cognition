"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Equal,
  ListChecks,
  MoreHorizontal,
  Sparkles,
  StickyNote,
  UserSquare2,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import {
  BAND_HUE,
  BAND_LABEL,
  BAND_ORDER,
  studentSkillScores,
  type Movement,
  type OutcomeBand,
  type SkillKey,
  type SkillSignal,
  type StudentOutcome,
} from "@/lib/learningOutcomes";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Props = {
  outcomes: StudentOutcome[];
  signals: SkillSignal[];
};

type FilterMode = "support-only" | "all";
type DrawerSection = "placement" | "support" | "notes" | "overview";

export function OutcomeSupportTable({ outcomes, signals }: Props) {
  const [filter, setFilter] = useState<FilterMode>("support-only");
  const [edits, setEdits] = useState<Record<string, OutcomeBand>>({});
  const [confirmedLocal, setConfirmedLocal] = useState<Record<string, boolean>>(
    {},
  );
  const [supportSelections, setSupportSelections] = useState<
    Record<string, Set<SkillKey>>
  >({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [drawerStudentId, setDrawerStudentId] = useState<string | null>(null);
  const [drawerSection, setDrawerSection] = useState<DrawerSection>("overview");

  const rows = useMemo(() => {
    if (filter === "support-only") {
      return outcomes
        .filter(
          (o) =>
            o.band === "developing" ||
            o.band === "building" ||
            o.band === "needs-support" ||
            o.movement === "moving-up",
        )
        .slice(0, 8);
    }
    return outcomes.slice(0, 16);
  }, [outcomes, filter]);

  const pendingCount = rows.reduce(
    (a, o) => a + (isRowConfirmed(o, confirmedLocal) ? 0 : 1),
    0,
  );

  const drawerOutcome = useMemo(
    () => rows.find((o) => o.student.id === drawerStudentId) ?? null,
    [rows, drawerStudentId],
  );

  const openDrawer = (id: string, section: DrawerSection) => {
    setDrawerStudentId(id);
    setDrawerSection(section);
  };

  const closeDrawer = () => setDrawerStudentId(null);

  return (
    <section
      aria-label="Students Needing Learning Support"
      className="premium-surface rounded-[20px] overflow-hidden"
    >
      <header className="flex items-center justify-between gap-3 px-5 md:px-6 py-4 border-b border-border/70 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Per-student review</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1">
            Students needing learning support
          </h3>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">
            {pendingCount > 0
              ? `${pendingCount} placement${pendingCount === 1 ? "" : "s"} awaiting review`
              : "All visible placements reviewed"}
          </p>
        </div>
        <div className="inline-flex rounded-full border border-border/60 bg-card/80 p-0.5 backdrop-blur">
          {(
            [
              { key: "support-only", label: "Support needed" },
              { key: "all", label: "All students" },
            ] as const
          ).map((opt) => {
            const isActive = filter === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                className={cn(
                  "px-3 h-7 rounded-full text-[11.5px] font-bold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[960px]">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/70">
            <tr className="text-left">
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">
                Student
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[140px]">
                Grade & score
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">
                Insight
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[140px]">
                Current band
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[120px]">
                Movement
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[140px]">
                Status
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[64px] text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const editedBand = edits[o.student.id] ?? o.band;
              const wasAdjusted = editedBand !== o.band;
              const confirmed = isRowConfirmed(o, confirmedLocal);
              return (
                <tr
                  key={o.student.id}
                  className={cn(
                    "border-t border-border/50 hover:bg-primary/[0.035] transition-colors",
                    confirmed && "bg-emerald-500/[0.025]",
                  )}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <StudentAvatar student={o.student} size="sm" />
                      <button
                        type="button"
                        onClick={() => openDrawer(o.student.id, "overview")}
                        className="font-heading font-extrabold text-[13.5px] truncate leading-tight text-left hover:text-primary transition-colors"
                      >
                        {o.student.name}
                      </button>
                    </div>
                  </td>

                  <td className="p-3 align-middle">
                    <div className="text-[12px] tabular-nums leading-tight">
                      <div className="font-semibold text-foreground">
                        {o.student.grade} · {o.student.section}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {o.subjectScore}/100
                      </div>
                    </div>
                  </td>

                  <td className="p-3 align-middle">
                    <div className="flex items-start gap-1.5 max-w-[42ch]">
                      <Sparkles
                        className="h-3 w-3 mt-1 shrink-0 text-amber-600 dark:text-amber-300"
                        strokeWidth={2.5}
                      />
                      <span className="text-[12px] leading-snug text-foreground/80 line-clamp-1">
                        {o.reasonFlagged}
                      </span>
                    </div>
                  </td>

                  <td className="p-3 align-middle">
                    <BandPill band={editedBand} />
                  </td>

                  <td className="p-3 align-middle">
                    <MovementChip movement={o.movement} />
                  </td>

                  <td className="p-3 align-middle">
                    <StatusPill
                      confirmed={confirmed}
                      adjusted={wasAdjusted}
                    />
                  </td>

                  <td className="p-3 align-middle text-right">
                    <RowActionsMenu
                      onUpdatePlacement={() =>
                        openDrawer(o.student.id, "placement")
                      }
                      onEditSupport={() =>
                        openDrawer(o.student.id, "support")
                      }
                      onAddNote={() => openDrawer(o.student.id, "notes")}
                      onConfirmReview={() =>
                        setConfirmedLocal((prev) => ({
                          ...prev,
                          [o.student.id]: !confirmed,
                        }))
                      }
                      onViewStudent={() =>
                        openDrawer(o.student.id, "overview")
                      }
                      confirmed={confirmed}
                    />
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center text-[12.5px] text-muted-foreground"
                >
                  No students to review.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <StudentReviewDrawer
        outcome={drawerOutcome}
        signals={signals}
        section={drawerSection}
        editedBand={
          drawerOutcome ? (edits[drawerOutcome.student.id] ?? drawerOutcome.band) : null
        }
        confirmed={
          drawerOutcome ? isRowConfirmed(drawerOutcome, confirmedLocal) : false
        }
        selectedSupport={
          drawerOutcome
            ? (supportSelections[drawerOutcome.student.id] ??
              new Set(drawerOutcome.relatedSignals))
            : null
        }
        note={
          drawerOutcome ? (notes[drawerOutcome.student.id] ?? "") : ""
        }
        onChangeBand={(band) => {
          if (!drawerOutcome) return;
          setEdits((prev) => ({ ...prev, [drawerOutcome.student.id]: band }));
        }}
        onResetBand={() => {
          if (!drawerOutcome) return;
          setEdits((prev) => {
            const next = { ...prev };
            delete next[drawerOutcome.student.id];
            return next;
          });
        }}
        onToggleSupport={(key) => {
          if (!drawerOutcome) return;
          setSupportSelections((prev) => {
            const current = new Set(
              prev[drawerOutcome.student.id] ?? drawerOutcome.relatedSignals,
            );
            if (current.has(key)) current.delete(key);
            else current.add(key);
            return { ...prev, [drawerOutcome.student.id]: current };
          });
        }}
        onChangeNote={(value) => {
          if (!drawerOutcome) return;
          setNotes((prev) => ({ ...prev, [drawerOutcome.student.id]: value }));
        }}
        onConfirm={() => {
          if (!drawerOutcome) return;
          setConfirmedLocal((prev) => ({
            ...prev,
            [drawerOutcome.student.id]: true,
          }));
          closeDrawer();
        }}
        onClose={closeDrawer}
      />
    </section>
  );
}

function isRowConfirmed(
  o: StudentOutcome,
  local: Record<string, boolean>,
): boolean {
  const override = local[o.student.id];
  if (override !== undefined) return override;
  return o.confirmation === "confirmed";
}

/* ─────────────────────────────────────────────────────────
 * Row cells
 * ───────────────────────────────────────────────────────── */
function RowActionsMenu({
  onUpdatePlacement,
  onEditSupport,
  onAddNote,
  onConfirmReview,
  onViewStudent,
  confirmed,
}: {
  onUpdatePlacement: () => void;
  onEditSupport: () => void;
  onAddNote: () => void;
  onConfirmReview: () => void;
  onViewStudent: () => void;
  confirmed: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open actions"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[190px] rounded-xl text-[12.5px]"
      >
        <DropdownMenuItem onSelect={onEditSupport} className="gap-2">
          <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
          Edit support
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onUpdatePlacement} className="gap-2">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
          Update placement
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onAddNote} className="gap-2">
          <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
          Add note
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onConfirmReview} className="gap-2">
          {confirmed ? (
            <>
              <ClipboardCheck className="h-3.5 w-3.5 text-amber-600" />
              Mark as pending
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Confirm review
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onViewStudent} className="gap-2">
          <UserSquare2 className="h-3.5 w-3.5 text-muted-foreground" />
          View student
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusPill({
  confirmed,
  adjusted,
}: {
  confirmed: boolean;
  adjusted: boolean;
}) {
  if (confirmed) {
    const tone = "hsl(142 55% 42%)";
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.10em]"
        style={{
          color: tone,
          background: `linear-gradient(135deg, color-mix(in srgb, ${tone} 16%, transparent), color-mix(in srgb, ${tone} 6%, transparent))`,
          border: `1px solid color-mix(in srgb, ${tone} 28%, transparent)`,
          boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.45)",
        }}
      >
        <CheckCircle2 className="h-3 w-3" strokeWidth={2.4} />
        Confirmed
      </span>
    );
  }
  if (adjusted) {
    const tone = "hsl(38 92% 48%)";
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.10em]"
        style={{
          color: tone,
          background: `linear-gradient(135deg, color-mix(in srgb, ${tone} 18%, transparent), color-mix(in srgb, ${tone} 6%, transparent))`,
          border: `1px solid color-mix(in srgb, ${tone} 32%, transparent)`,
          boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.45)",
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: tone }}
        />
        Adjusted
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--muted) 65%, transparent), color-mix(in srgb, var(--muted) 35%, transparent))",
        border: "1px solid color-mix(in srgb, var(--border) 90%, transparent)",
        boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.4)",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/55" />
      Pending
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
 * Detail drawer
 * ───────────────────────────────────────────────────────── */
function StudentReviewDrawer({
  outcome,
  signals,
  section,
  editedBand,
  confirmed,
  selectedSupport,
  note,
  onChangeBand,
  onResetBand,
  onToggleSupport,
  onChangeNote,
  onConfirm,
  onClose,
}: {
  outcome: StudentOutcome | null;
  signals: SkillSignal[];
  section: DrawerSection;
  editedBand: OutcomeBand | null;
  confirmed: boolean;
  selectedSupport: Set<SkillKey> | null;
  note: string;
  onChangeBand: (band: OutcomeBand) => void;
  onResetBand: () => void;
  onToggleSupport: (key: SkillKey) => void;
  onChangeNote: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const placementRef = useRef<HTMLDivElement | null>(null);
  const supportRef = useRef<HTMLDivElement | null>(null);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  // Scroll-target the section the user picked from the actions menu.
  useEffect(() => {
    if (!outcome) return;
    if (section === "placement") {
      placementRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (section === "support") {
      supportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (section === "notes") {
      notesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      notesRef.current?.focus({ preventScroll: true });
    }
  }, [outcome, section]);

  const open = outcome !== null;
  const wasAdjusted = !!(outcome && editedBand && editedBand !== outcome.band);

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] p-0 border-l bg-background overflow-hidden"
      >
        {outcome && editedBand && selectedSupport && (
          <div className="relative h-full flex flex-col">
            {/* Atmospheric backdrop — soft amber + lavender tint reads as AI surface */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-[260px] pointer-events-none"
              style={{
                background:
                  "radial-gradient(70% 60% at 100% 0%, hsl(38 92% 80% / 0.18), transparent 65%), radial-gradient(60% 50% at 0% 100%, hsl(258 70% 80% / 0.12), transparent 65%)",
              }}
            />

            <header className="relative px-5 pt-5 pb-5 border-b border-border/60">
              <div className="premium-eyebrow">
                <span>Per-student review</span>
              </div>

              <div className="mt-3 flex items-start gap-3">
                <StudentAvatar student={outcome.student} size="md" />
                <div className="min-w-0 flex-1">
                  <SheetTitle asChild>
                    <h2 className="font-heading font-extrabold text-[20px] leading-tight">
                      {outcome.student.name}
                    </h2>
                  </SheetTitle>
                  <div className="text-[11.5px] text-muted-foreground tabular-nums mt-0.5">
                    {outcome.student.grade} · {outcome.student.section} ·{" "}
                    <span className="font-semibold text-foreground/90">
                      {outcome.subjectScore}/100
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <StatusPill confirmed={confirmed} adjusted={wasAdjusted} />
                    <MovementChip movement={outcome.movement} />
                  </div>
                </div>
              </div>

              {/* AI insight callout — gradient surface matching Yellow Recommends */}
              <div
                className="mt-4 flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, hsl(38 92% 60%) 12%, transparent), color-mix(in srgb, hsl(258 70% 70%) 8%, transparent))",
                  border:
                    "1px solid color-mix(in srgb, hsl(38 92% 55%) 24%, transparent)",
                  boxShadow:
                    "inset 0 1px 0 0 hsl(0 0% 100% / 0.5), 0 8px 22px -16px hsl(38 92% 50% / 0.45)",
                }}
              >
                <span
                  aria-hidden
                  className="h-7 w-7 rounded-lg inline-flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, hsl(38 92% 60%) 24%, transparent), color-mix(in srgb, hsl(258 70% 70%) 18%, transparent))",
                    boxShadow:
                      "inset 0 1px 0 0 hsl(0 0% 100% / 0.55), 0 4px 10px -6px hsl(38 92% 50% / 0.45)",
                  }}
                >
                  <Sparkles
                    className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300"
                    strokeWidth={2.4}
                  />
                </span>
                <div className="min-w-0">
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-amber-700/85 dark:text-amber-300/85">
                    AI insight
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-foreground/90">
                    {outcome.reasonFlagged}
                  </p>
                </div>
              </div>
            </header>

            <div className="relative flex-1 overflow-y-auto px-5 py-5 divide-y divide-border/60">
              {/* Skill profile radar */}
              <SkillRadarSection
                outcome={outcome}
                signals={signals}
                selectedSupport={selectedSupport}
              />

              {/* Update placement */}
              <section ref={placementRef} className="py-5">
                <div className="premium-eyebrow">
                  <span>Current placement</span>
                </div>
                <div className="mt-3 flex items-center gap-2.5">
                  <Select
                    value={editedBand}
                    onValueChange={(v) => onChangeBand(v as OutcomeBand)}
                  >
                    <SelectTrigger
                      className="h-10 rounded-full border-2 px-4 text-[12.5px] font-bold w-full transition-shadow"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, ${BAND_HUE[editedBand]} 14%, transparent), color-mix(in srgb, ${BAND_HUE[editedBand]} 4%, transparent))`,
                        borderColor: `color-mix(in srgb, ${BAND_HUE[editedBand]} 38%, transparent)`,
                        color: `color-mix(in srgb, ${BAND_HUE[editedBand]} 80%, black 12%)`,
                        boxShadow: `inset 0 1px 0 0 hsl(0 0% 100% / 0.45), 0 4px 14px -10px color-mix(in srgb, ${BAND_HUE[editedBand]} 50%, transparent)`,
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {BAND_ORDER.map((b) => (
                        <SelectItem key={b} value={b}>
                          <span className="inline-flex items-center gap-2 text-[12.5px]">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: BAND_HUE[b] }}
                            />
                            {BAND_LABEL[b]}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {wasAdjusted && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onResetBand}
                      className="h-9 rounded-full px-3 text-[11.5px] font-bold text-muted-foreground hover:text-foreground shrink-0"
                    >
                      Reset
                    </Button>
                  )}
                </div>
                {wasAdjusted && (
                  <div
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.10em]"
                    style={{
                      color: "hsl(38 92% 38%)",
                      background:
                        "color-mix(in srgb, hsl(38 92% 60%) 12%, transparent)",
                      border:
                        "1px solid color-mix(in srgb, hsl(38 92% 55%) 26%, transparent)",
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Adjusted from {BAND_LABEL[outcome.band]}
                  </div>
                )}
              </section>

              {/* Edit support */}
              <section ref={supportRef} className="py-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="premium-eyebrow">
                    <span>Support areas</span>
                  </div>
                  <span className="text-[10.5px] font-bold tabular-nums text-muted-foreground">
                    {selectedSupport.size}/{signals.length} selected
                  </span>
                </div>
                <p className="mt-1 text-[11.5px] text-muted-foreground leading-snug">
                  Choose the areas this student needs targeted support in.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {signals.map((s) => {
                    const active = selectedSupport.has(s.key);
                    return (
                      <Toggle
                        key={s.key}
                        variant="outline"
                        size="sm"
                        pressed={active}
                        onPressedChange={() => onToggleSupport(s.key)}
                        aria-label={s.label}
                        className={cn(
                          "h-8 rounded-full px-3 text-[11.5px] font-bold gap-1.5 border transition-all",
                          !active && "border-border/70 hover:border-border",
                        )}
                        style={
                          active
                            ? {
                                color: s.hue,
                                background: `linear-gradient(135deg, color-mix(in srgb, ${s.hue} 14%, transparent), color-mix(in srgb, ${s.hue} 4%, transparent))`,
                                borderColor: `color-mix(in srgb, ${s.hue} 32%, transparent)`,
                                boxShadow: `inset 0 1px 0 0 hsl(0 0% 100% / 0.45), 0 2px 8px -4px color-mix(in srgb, ${s.hue} 32%, transparent)`,
                              }
                            : undefined
                        }
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: s.hue }}
                        />
                        {s.label}
                      </Toggle>
                    );
                  })}
                </div>
              </section>

              {/* Notes */}
              <section className="pt-5">
                <label
                  htmlFor={`note-${outcome.student.id}`}
                  className="premium-eyebrow"
                >
                  <span>Teacher note</span>
                </label>
                <Textarea
                  ref={notesRef}
                  id={`note-${outcome.student.id}`}
                  value={note}
                  onChange={(e) => onChangeNote(e.target.value)}
                  placeholder="Add observations, intervention plans, or context for this placement…"
                  className="mt-3 min-h-[96px] rounded-xl text-[12.5px] bg-card/60 border-border/70 placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:border-primary/40 transition-shadow"
                />
              </section>
            </div>

            <footer className="relative border-t border-border/60 bg-card/70 backdrop-blur p-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-10 rounded-xl px-4 text-[12.5px] font-bold border-border/70 bg-card/80 hover:bg-card"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                className="h-10 rounded-xl px-5 text-[12.5px] font-bold gap-1.5 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-shadow"
              >
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                {confirmed
                  ? "Save changes"
                  : wasAdjusted
                    ? "Confirm adjustment"
                    : "Confirm review"}
              </Button>
            </footer>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ─────────────────────────────────────────────────────────
 * Skill profile radar
 * ───────────────────────────────────────────────────────── */
const RADAR_AXIS_LABEL: Record<SkillKey, string> = {
  "problem-solving": "Problem",
  reasoning: "Reasoning",
  "creative-expression": "Express",
  "reading-comprehension": "Reading",
  "recall-retention": "Recall",
  "curiosity-exploration": "Explore",
};

function SkillRadarSection({
  outcome,
  signals,
  selectedSupport,
}: {
  outcome: StudentOutcome;
  signals: SkillSignal[];
  selectedSupport: Set<SkillKey>;
}) {
  const studentScores = useMemo(
    () => studentSkillScores(outcome.student),
    [outcome.student],
  );

  const data = useMemo(
    () =>
      signals.map((s) => ({
        key: s.key,
        label: RADAR_AXIS_LABEL[s.key],
        student: studentScores[s.key],
        classAvg: s.score,
        flagged: selectedSupport.has(s.key),
      })),
    [signals, studentScores, selectedSupport],
  );

  const flaggedCount = data.filter((d) => d.flagged).length;
  const studentHue = "hsl(258 70% 56%)";
  const classHue = "hsl(220 12% 60%)";

  return (
    <section className="pb-5">
      <div className="flex items-center justify-between gap-2">
        <div className="premium-eyebrow">
          <span>Skill profile</span>
        </div>
        <div className="flex items-center gap-2.5 text-[10.5px] font-bold text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: studentHue }}
            />
            Student
          </span>
          <span className="inline-flex items-center gap-1">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: classHue }}
            />
            Class avg
          </span>
        </div>
      </div>
      <p className="mt-1 text-[11.5px] text-muted-foreground leading-snug">
        {flaggedCount > 0
          ? `${flaggedCount} signal${flaggedCount === 1 ? "" : "s"} flagged for support — see the dip on the radar.`
          : "Gameplay-derived skill signals against the class average."}
      </p>
      <div className="mt-3 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={data}
            outerRadius="76%"
            margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
          >
            <PolarGrid stroke="hsl(240 15% 88%)" />
            <PolarAngleAxis
              dataKey="label"
              tick={{
                fontSize: 10,
                fontWeight: 700,
                fill: "hsl(240 8% 32%)",
              }}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              angle={90}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Class avg"
              dataKey="classAvg"
              stroke={classHue}
              fill={classHue}
              fillOpacity={0.14}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              isAnimationActive={false}
            />
            <Radar
              name="Student"
              dataKey="student"
              stroke={studentHue}
              fill={studentHue}
              fillOpacity={0.32}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 * Shared chips
 * ───────────────────────────────────────────────────────── */
export function BandPill({ band }: { band: StudentOutcome["band"] }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold"
      style={{
        background: `color-mix(in srgb, ${BAND_HUE[band]} 10%, transparent)`,
        color: `color-mix(in srgb, ${BAND_HUE[band]} 80%, black 12%)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: BAND_HUE[band] }}
      />
      {BAND_LABEL[band]}
    </span>
  );
}

function MovementChip({ movement }: { movement: Movement }) {
  if (movement === "moving-up") {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-emerald-700 dark:text-emerald-400">
        <ArrowUpRight className="h-3.5 w-3.5" />
        Moving Up
      </span>
    );
  }
  if (movement === "slipping") {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-rose-700 dark:text-rose-400">
        <ArrowDownRight className="h-3.5 w-3.5" />
        Slipping
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-muted-foreground">
      <Equal className="h-3.5 w-3.5" />
      Stable
    </span>
  );
}
