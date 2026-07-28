"use client";

import type * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  UserPlus,
  Send,
  Check,
  Plug,
  ChevronDown,
} from "lucide-react";
import type { TeacherInviteMethod } from "@/lib/teacherInvites";
import { cn } from "@/lib/utils";

const OPTIONS: {
  id: TeacherInviteMethod;
  label: string;
  sub: string;
  Icon: typeof Upload;
  eta: string;
}[] = [
  { id: "invite", label: "Send teacher app invite", sub: "Each teacher gets a sign-in link they activate themselves", Icon: Send, eta: "~30s / teacher" },
  { id: "csv", label: "Upload teacher CSV", sub: "Bulk import from your HRIS or Workday export", Icon: Upload, eta: "~30s" },
  { id: "manual", label: "Add a teacher manually", sub: "Enter name + email, send invite from the dashboard", Icon: UserPlus, eta: "Per teacher" },
];

type IntegrationId = "google" | "powerschool" | "pupilpod" | "faria";

const INTEGRATIONS: {
  id: IntegrationId;
  label: string;
  sub: string;
  inviteMethod: TeacherInviteMethod | null;
  Logo: () => React.ReactElement;
}[] = [
  {
    id: "faria",
    label: "Faria",
    sub: "Pull staff from your Faria directory",
    inviteMethod: null,
    Logo: FariaLogo,
  },
  {
    id: "powerschool",
    label: "PowerSchool",
    sub: "Sync staff list from your PowerSchool SIS",
    inviteMethod: null,
    Logo: PowerSchoolLogo,
  },
  {
    id: "google",
    label: "Google Workspace SSO",
    sub: "Pull staff list directly via your domain",
    inviteMethod: "google",
    Logo: GoogleClassroomLogo,
  },
  {
    id: "pupilpod",
    label: "Pupilpod",
    sub: "Import teachers already on Pupilpod",
    inviteMethod: null,
    Logo: PupilpodLogo,
  },
];

const LABELS: Record<TeacherInviteMethod, string> = {
  invite: "App invite",
  csv: "From CSV",
  google: "Google Workspace",
  manual: "Manual entry",
};

export function teacherInviteMethodLabel(m: TeacherInviteMethod | null | undefined): string {
  if (!m) return "Not set";
  return LABELS[m];
}

export function TeacherInvitePicker({
  value,
  onChange,
}: {
  value: TeacherInviteMethod | null;
  onChange: (m: TeacherInviteMethod) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {OPTIONS.map((opt) => {
          const Icon = opt.Icon;
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "group relative w-full text-left rounded-2xl border p-4 flex items-center gap-4 transition-all",
                active
                  ? "border-primary/60 bg-primary/[0.06] shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_12%,transparent)]"
                  : "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card/80",
              )}
              aria-pressed={active}
            >
              <div
                className={cn(
                  "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  active ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground group-hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-bold text-[14.5px] flex items-center gap-2">
                  {opt.label}
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {opt.eta}
                  </span>
                </div>
                <div className="text-[12.5px] text-muted-foreground mt-0.5">{opt.sub}</div>
              </div>
              <span
                className={cn(
                  "shrink-0 h-6 w-6 rounded-full flex items-center justify-center border transition-all",
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent",
                )}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            </button>
          );
        })}
      </div>

      <IntegrationsSection value={value} onChange={onChange} />
    </div>
  );
}

function IntegrationsSection({
  value,
  onChange,
}: {
  value: TeacherInviteMethod | null;
  onChange: (m: TeacherInviteMethod) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const selectedIntegration = INTEGRATIONS.find(
    (it) => it.inviteMethod !== null && value === it.inviteMethod,
  );

  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="h-7 w-7 rounded-lg bg-muted/70 text-muted-foreground flex items-center justify-center shrink-0">
          <Plug className="h-3.5 w-3.5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            3rd party integrations
          </div>
          <div className="text-[11.5px] text-muted-foreground/80 mt-0.5 truncate">
            {selectedIntegration
              ? `Connected: ${selectedIntegration.label}`
              : "Connect a tool you already use"}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {INTEGRATIONS.map((it) => {
            const Logo = it.Logo;
            const enabled = it.inviteMethod !== null;
            const active = enabled && value === it.inviteMethod;
            return (
              <span
                key={it.id}
                title={it.label}
                className={cn(
                  "h-7 w-7 rounded-lg overflow-hidden ring-1 transition-all",
                  active
                    ? "ring-2 ring-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_18%,transparent)]"
                    : enabled
                      ? "ring-border/60"
                      : "ring-border/40 opacity-60",
                )}
              >
                <Logo />
              </span>
            );
          })}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 p-3 grid grid-cols-2 gap-2.5">
              {INTEGRATIONS.map((it) => {
                const Logo = it.Logo;
                const enabled = it.inviteMethod !== null;
                const active = enabled && value === it.inviteMethod;
                const handleClick = () => {
                  if (enabled && it.inviteMethod) onChange(it.inviteMethod);
                };
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={handleClick}
                    disabled={!enabled}
                    aria-pressed={active}
                    className={cn(
                      "group relative text-left rounded-xl border p-2.5 flex items-center gap-2.5 transition-all",
                      active
                        ? "border-primary/60 bg-primary/[0.06] shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_12%,transparent)]"
                        : enabled
                          ? "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card/80"
                          : "border-border/60 bg-card/40 opacity-70 cursor-not-allowed",
                    )}
                  >
                    <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 ring-1 ring-border/60">
                      <Logo />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold text-[12px] flex items-center gap-1.5">
                        <span className="truncate">{it.label}</span>
                        {!enabled && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-muted text-muted-foreground">
                            Soon
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-muted-foreground mt-0.5 line-clamp-2">
                        {it.sub}
                      </div>
                    </div>
                    {active && (
                      <span className="shrink-0 h-4 w-4 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Brand logos — inline SVG.
 * ───────────────────────────────────────────────────────── */
function FariaLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full block" aria-hidden>
      <defs>
        <linearGradient id="fa2-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2A0E3A" />
          <stop offset="1" stopColor="#4A0E5C" />
        </linearGradient>
        <linearGradient id="fa2-fg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD27A" />
          <stop offset="1" stopColor="#F06AA8" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="40" height="40" rx="8" fill="url(#fa2-bg)" />
      <path d="M16 10h12v5h-7v5h6v5h-6v8h-5z" fill="url(#fa2-fg)" />
    </svg>
  );
}

function PowerSchoolLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full block" aria-hidden>
      <rect x="0" y="0" width="40" height="40" rx="8" fill="#0B3D66" />
      <path
        d="M14 9h9a8 8 0 0 1 0 16h-4v6h-5z M19 14v6h4a3 3 0 0 0 0-6z"
        fill="#3FB4F2"
        fillRule="evenodd"
      />
    </svg>
  );
}

function GoogleClassroomLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full block" aria-hidden>
      <circle cx="20" cy="20" r="18" fill="#0F9D58" />
      <circle cx="20" cy="20" r="18" fill="none" stroke="#F4B400" strokeWidth="2" />
      <circle cx="20" cy="16" r="3.2" fill="#fff" />
      <path d="M14 27c0-3 2.6-5 6-5s6 2 6 5v1H14z" fill="#fff" />
      <circle cx="12" cy="18" r="2.4" fill="#A8D5B1" />
      <circle cx="28" cy="18" r="2.4" fill="#A8D5B1" />
      <path d="M8.5 27c0-2.2 1.6-3.6 3.5-3.6s3.5 1.4 3.5 3.6v.6H8.5z" fill="#A8D5B1" />
      <path d="M24.5 27c0-2.2 1.6-3.6 3.5-3.6s3.5 1.4 3.5 3.6v.6H24.5z" fill="#A8D5B1" />
    </svg>
  );
}

function PupilpodLogo() {
  return (
    <img
      src="/pupilpod.webp"
      alt="Pupilpod"
      className="h-full w-full block object-contain"
    />
  );
}
