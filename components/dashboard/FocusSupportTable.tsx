"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Dumbbell,
  Equal,
  Mail,
  MoreHorizontal,
  Share2,
  UserSquare2,
  Users2,
} from "lucide-react";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { STUDENTS } from "@/data/mockData";
import {
  FOCUS_DOMAIN_HUE,
  FOCUS_SUPPORT_STATUS_LABEL,
  FOCUS_SUPPORT_STATUS_TONE,
  type FocusSupportRow,
} from "@/lib/classFocus";

function comingSoon(action: string) {
  toast("Coming soon", { description: `${action} isn't available yet.` });
}

export function FocusSupportTable({ rows }: { rows: FocusSupportRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const visible = rows.slice(0, 5);
  const active = visible.find((r) => r.student.id === openId) ?? null;

  return (
    <section
      aria-label="Students needing focus support"
      className="premium-surface rounded-[20px] overflow-hidden"
    >
      <header className="flex items-center justify-between gap-3 px-5 md:px-6 py-4 border-b border-border/70 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Per-student review</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1">
            Students needing focus support
          </h3>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">
            Click a student to see evidence and recommended actions.
          </p>
        </div>
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 backdrop-blur px-3.5 h-8 text-[11.5px] font-bold text-foreground/80 hover:text-foreground hover:border-foreground/20 transition-colors"
        >
          <Users2 className="h-3.5 w-3.5" />
          View all {STUDENTS.length} students
        </Link>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[900px]">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border/70">
            <tr className="text-left">
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">Student</th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[110px]">
                Focus score
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[130px]">
                Status
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">
                Top priority domain
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[110px]">
                Trend
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">
                Recommended action
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[56px] text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const tone = FOCUS_SUPPORT_STATUS_TONE[row.status];
              const domainHue = FOCUS_DOMAIN_HUE[row.topDomain];
              return (
                <tr
                  key={row.student.id}
                  onClick={() => setOpenId(row.student.id)}
                  className="border-t border-border/50 hover:bg-primary/[0.035] transition-colors cursor-pointer"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <StudentAvatar student={row.student} size="sm" />
                      <div className="min-w-0">
                        <div className="font-heading font-extrabold text-[13.5px] truncate leading-tight">
                          {row.student.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {row.student.grade} · {row.student.section}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 align-middle">
                    <span className="font-heading font-extrabold text-[15px] tabular-nums" style={{ color: tone }}>
                      {row.score}
                    </span>
                    <span className="text-[11px] text-muted-foreground">/100</span>
                  </td>

                  <td className="p-3 align-middle">
                    <StatusPill status={row.status} />
                  </td>

                  <td className="p-3 align-middle">
                    <div className="flex items-start gap-1.5 max-w-[36ch]">
                      <span
                        className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: domainHue }}
                      />
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-bold leading-tight" style={{ color: domainHue }}>
                          {row.topDomainLabel} Attention
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-snug">
                          {row.topDomainReason}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 align-middle">
                    <TrendChip trend={row.trend} />
                  </td>

                  <td className="p-3 align-middle">
                    <span className="text-[12px] text-foreground/80 line-clamp-1">
                      {row.recommendedActions[0]}
                    </span>
                  </td>

                  <td className="p-3 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu row={row} />
                  </td>
                </tr>
              );
            })}

            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-[12.5px] text-muted-foreground">
                  No students need focus support right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <FocusSupportDrawer
        row={active}
        open={!!openId}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </section>
  );
}

function StatusPill({ status }: { status: FocusSupportRow["status"] }) {
  const tone = FOCUS_SUPPORT_STATUS_TONE[status];
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
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {FOCUS_SUPPORT_STATUS_LABEL[status]}
    </span>
  );
}

function TrendChip({ trend }: { trend: number }) {
  if (trend > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
        <ArrowUpRight className="h-3.5 w-3.5" />+{trend}
      </span>
    );
  }
  if (trend < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-bold tabular-nums text-rose-700 dark:text-rose-400">
        <ArrowDownRight className="h-3.5 w-3.5" />
        {trend}
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

function RowActionsMenu({ row }: { row: FocusSupportRow }) {
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
      <DropdownMenuContent align="end" className="w-[210px] rounded-xl text-[12.5px]">
        <DropdownMenuItem className="gap-2" asChild>
          <Link href={`/students/${row.student.id}?tab=overview`}>
            <UserSquare2 className="h-3.5 w-3.5 text-muted-foreground" />
            View profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onSelect={() => comingSoon("Assign workout")}>
          <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
          Assign workout
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onSelect={() => comingSoon("Create focus group")}>
          <Users2 className="h-3.5 w-3.5 text-muted-foreground" />
          Create focus group
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onSelect={() => comingSoon("Generate parent nudge")}>
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          Generate parent nudge
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" asChild>
          <Link href={`/students/${row.student.id}?tab=overview`}>
            <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
            Share with special educator
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FocusSupportDrawer({
  row,
  open,
  onOpenChange,
}: {
  row: FocusSupportRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const tone = row ? FOCUS_SUPPORT_STATUS_TONE[row.status] : "";
  const domainHue = row ? FOCUS_DOMAIN_HUE[row.topDomain] : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        {row && (
          <>
            <SheetHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 p-5 border-b border-border text-left">
              <div className="flex items-center gap-3">
                <StudentAvatar student={row.student} size="md" />
                <div className="min-w-0">
                  <SheetTitle className="font-heading font-extrabold text-[16px] truncate">
                    {row.student.name}
                  </SheetTitle>
                  <SheetDescription className="text-[12px]">{row.student.grade}</SheetDescription>
                </div>
                <span
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.10em] shrink-0"
                  style={{
                    color: tone,
                    background: `color-mix(in srgb, ${tone} 14%, transparent)`,
                  }}
                >
                  {FOCUS_SUPPORT_STATUS_LABEL[row.status]}
                </span>
              </div>
            </SheetHeader>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/40 p-3.5">
                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Focus score
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span
                      className="font-heading font-extrabold text-[26px] tabular-nums leading-none"
                      style={{ color: tone }}
                    >
                      {row.score}
                    </span>
                    <span className="text-[12px] font-bold text-muted-foreground/80">/100</span>
                    <TrendChip trend={row.trend} />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                  Top priority domain
                </div>
                <div
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: `color-mix(in srgb, ${domainHue} 25%, transparent)`,
                    background: `color-mix(in srgb, ${domainHue} 6%, transparent)`,
                  }}
                >
                  <div className="font-heading font-bold text-[13.5px]" style={{ color: domainHue }}>
                    {row.topDomainLabel} Attention · {row.topDomainScore}/100
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">
                    {row.topDomainReason}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                  Source evidence
                </div>
                <p className="text-[12.5px] leading-snug text-foreground/85">{row.evidence}</p>
              </div>

              <div className="pt-3 border-t border-border/60">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                  Recommended actions
                </div>
                <ul className="space-y-1.5 mb-4">
                  {row.recommendedActions.map((a) => (
                    <li
                      key={a}
                      className="flex items-start gap-2 text-[12.5px] leading-snug text-foreground/90"
                    >
                      <ArrowRight
                        className="h-3.5 w-3.5 shrink-0 mt-0.5"
                        style={{ color: domainHue }}
                      />
                      {a}
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/students/${row.student.id}?tab=overview`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[12px] font-bold hover:bg-muted/40 transition-colors"
                  >
                    <UserSquare2 className="h-3.5 w-3.5" />
                    View profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => comingSoon("Assign workout")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[12px] font-bold hover:bg-muted/40 transition-colors"
                  >
                    <Dumbbell className="h-3.5 w-3.5" />
                    Assign workout
                  </button>
                  <button
                    type="button"
                    onClick={() => comingSoon("Create focus group")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[12px] font-bold hover:bg-muted/40 transition-colors"
                  >
                    <Users2 className="h-3.5 w-3.5" />
                    Create focus group
                  </button>
                  <button
                    type="button"
                    onClick={() => comingSoon("Generate parent nudge")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[12px] font-bold hover:bg-muted/40 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Generate parent nudge
                  </button>
                  <Link
                    href={`/students/${row.student.id}?tab=overview`}
                    className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[12px] font-bold hover:bg-muted/40 transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share with special educator
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
