"use client";

import { useMemo, useState } from "react";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Equal,
  MessageCircle,
  MoreHorizontal,
  Sparkles,
  StickyNote,
  UserSquare2,
} from "lucide-react";
import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TASK_CATEGORY_HUE, type TaskSupport, type TaskSupportStatus } from "@/lib/classTask";
import { cn } from "@/lib/utils";

type FilterMode = "support-only" | "all";

export function TaskSupportTable({ items }: { items: TaskSupport[] }) {
  const [filter, setFilter] = useState<FilterMode>("support-only");
  const [resolvedLocal, setResolvedLocal] = useState<Record<string, boolean>>({});

  const rows = useMemo(() => {
    if (filter === "support-only") {
      return items.filter((it) => it.score < 70 || it.status === "active").slice(0, 5);
    }
    return items.slice(0, 12);
  }, [items, filter]);

  const activeCount = rows.reduce((a, it) => a + (resolvedLocal[it.student.id] ? 0 : 1), 0);

  return (
    <section
      aria-label="Students needing task support"
      className="premium-surface rounded-[20px] overflow-hidden"
    >
      <header className="flex items-center justify-between gap-3 px-5 md:px-6 py-4 border-b border-border/70 flex-wrap">
        <div>
          <div className="premium-eyebrow">
            <span>Per-student review</span>
          </div>
          <h3 className="font-heading font-extrabold text-[17px] leading-tight mt-1">
            Students needing task support
          </h3>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">
            {activeCount > 0
              ? `${activeCount} student${activeCount === 1 ? "" : "s"} actively monitored`
              : "All visible students resolved"}
          </p>
        </div>
        <div className="inline-flex rounded-full border border-border/60 bg-card/80 p-0.5 backdrop-blur">
          {(
            [
              { key: "support-only", label: "Needs support" },
              { key: "all", label: "All flagged" },
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
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">Student</th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[140px]">
                Grade & score
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em]">Insight</th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[200px]">
                Primary gap
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[120px]">
                Trend
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[150px]">
                Status
              </th>
              <th className="p-3 font-bold text-[10.5px] uppercase tracking-[0.12em] w-[64px] text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const resolved = !!resolvedLocal[item.student.id];
              return (
                <tr
                  key={item.student.id}
                  className={cn(
                    "border-t border-border/50 hover:bg-primary/[0.035] transition-colors",
                    resolved && "bg-emerald-500/[0.025]",
                  )}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <StudentAvatar student={item.student} size="sm" />
                      <Link
                        href={`/students/${item.student.id}?tab=overview`}
                        className="font-heading font-extrabold text-[13.5px] truncate leading-tight text-left hover:text-primary transition-colors"
                      >
                        {item.student.name}
                      </Link>
                    </div>
                  </td>

                  <td className="p-3 align-middle">
                    <div className="text-[12px] tabular-nums leading-tight">
                      <div className="font-semibold text-foreground">
                        {item.student.grade} · {item.student.section}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{item.score}/100</div>
                    </div>
                  </td>

                  <td className="p-3 align-middle">
                    <div className="flex items-start gap-1.5 max-w-[42ch]">
                      <Sparkles
                        className="h-3 w-3 mt-1 shrink-0 text-amber-600 dark:text-amber-300"
                        strokeWidth={2.5}
                      />
                      <span className="text-[12px] leading-snug text-foreground/80 line-clamp-1">
                        {item.insight}
                      </span>
                    </div>
                  </td>

                  <td className="p-3 align-middle">
                    <CategoryPill primary={item.primary} label={item.primaryLabel} />
                  </td>

                  <td className="p-3 align-middle">
                    <TrendChip trend={item.trend} />
                  </td>

                  <td className="p-3 align-middle">
                    <StatusPill resolved={resolved} status={item.status} />
                  </td>

                  <td className="p-3 align-middle text-right">
                    <RowActionsMenu
                      studentId={item.student.id}
                      resolved={resolved}
                      onToggleResolved={() =>
                        setResolvedLocal((prev) => ({
                          ...prev,
                          [item.student.id]: !resolved,
                        }))
                      }
                    />
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-[12.5px] text-muted-foreground">
                  No students need task support right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CategoryPill({ primary, label }: { primary: TaskSupport["primary"]; label: string }) {
  const tone = TASK_CATEGORY_HUE[primary];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold"
      style={{
        background: `color-mix(in srgb, ${tone} 10%, transparent)`,
        color: `color-mix(in srgb, ${tone} 80%, black 12%)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {label}
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

function StatusPill({ resolved, status }: { resolved: boolean; status: TaskSupportStatus }) {
  if (resolved) {
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
        Resolved
      </span>
    );
  }
  const STATUS_TONE: Record<TaskSupportStatus, { tone: string; label: string }> = {
    active: { tone: "hsl(38 92% 48%)", label: "Active plan" },
    monitoring: { tone: "hsl(212 55% 45%)", label: "Monitoring" },
    new: { tone: "hsl(0 78% 56%)", label: "Newly flagged" },
  };
  const meta = STATUS_TONE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.10em]"
      style={{
        color: meta.tone,
        background: `linear-gradient(135deg, color-mix(in srgb, ${meta.tone} 18%, transparent), color-mix(in srgb, ${meta.tone} 6%, transparent))`,
        border: `1px solid color-mix(in srgb, ${meta.tone} 32%, transparent)`,
        boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.45)",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.tone }} />
      {meta.label}
    </span>
  );
}

function RowActionsMenu({
  studentId,
  resolved,
  onToggleResolved,
}: {
  studentId: string;
  resolved: boolean;
  onToggleResolved: () => void;
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
      <DropdownMenuContent align="end" className="w-[200px] rounded-xl text-[12.5px]">
        <DropdownMenuItem className="gap-2" asChild>
          <Link
            href={`/students/${studentId}?tab=overview`}
          >
            <UserSquare2 className="h-3.5 w-3.5 text-muted-foreground" />
            View student
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
          Add note
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
          Contact parent
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onSelect={onToggleResolved}>
          {resolved ? (
            <>
              <span className="inline-block h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />
              Mark as active
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Mark as resolved
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
