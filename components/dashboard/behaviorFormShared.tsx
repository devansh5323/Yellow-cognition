"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Circle, Info, Search, X, type LucideIcon } from "lucide-react";

import { StudentAvatar } from "@/components/dashboard/StudentAvatar";
import { searchStudents } from "@/lib/yellowAi";
import { type Student } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function formatDateTimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function Section({
  step,
  title,
  required,
  info,
  children,
}: {
  step: number;
  title: string;
  required?: boolean;
  info?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10.5px] font-bold inline-flex items-center justify-center shrink-0">
          {step}
        </span>
        <h3 className="text-[13.5px] font-bold">
          {title}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </h3>
        {info && <Info className="h-3 w-3 text-muted-foreground" aria-hidden />}
      </div>
      {children}
    </div>
  );
}

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <div className="text-[11.5px] font-semibold text-muted-foreground mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </div>
  );
}

export function OptionChip({
  label,
  Icon,
  selected,
  onClick,
}: {
  label: string;
  Icon?: LucideIcon;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

export function OptionCard({
  label,
  Icon,
  selected,
  onClick,
  compact,
}: {
  label: string;
  Icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-xl border text-center transition-colors",
        compact ? "px-1.5 py-2.5" : "px-2 py-4",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
      <span className={cn("font-semibold leading-tight", compact ? "text-[10px]" : "text-[12px]")}>
        {label}
      </span>
    </button>
  );
}

export function RadioRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-muted/40 transition-colors"
    >
      {selected ? (
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <span className={cn("text-[12.5px]", selected ? "font-semibold" : "text-muted-foreground")}>
        {label}
      </span>
    </button>
  );
}

export function YesNoToggle({
  Icon,
  value,
  onChange,
}: {
  Icon: LucideIcon;
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-8 w-8 rounded-lg bg-muted/60 text-muted-foreground inline-flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex gap-2 flex-1">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 text-[12.5px] font-bold transition-colors",
            value === true
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 text-[12.5px] font-bold transition-colors",
            value === false
              ? "border-border bg-muted/60 text-foreground"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          No
        </button>
      </div>
    </div>
  );
}

export function StudentPickerField({
  student,
  onChange,
}: {
  student: Student | null;
  onChange: (student: Student | null) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const studentResults = useMemo(() => searchStudents(pickerQuery, 6), [pickerQuery]);

  if (student) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <StudentAvatar student={student} size="sm" />
          <span className="text-[13px] font-semibold truncate">{student.name}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        className="w-full flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2 text-[12.5px] text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        Choose a student
      </button>
      {pickerOpen && (
        <div className="absolute z-10 mt-1.5 w-full rounded-xl border border-border bg-card shadow-lg p-2">
          <input
            autoFocus
            value={pickerQuery}
            onChange={(e) => setPickerQuery(e.target.value)}
            placeholder="Search students…"
            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12.5px] outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="mt-1.5 max-h-48 overflow-auto space-y-0.5">
            {studentResults.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onChange(s);
                  setPickerOpen(false);
                  setPickerQuery("");
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted/60 transition-colors"
              >
                <StudentAvatar student={s} size="sm" />
                <span className="text-[12.5px] font-medium truncate">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
