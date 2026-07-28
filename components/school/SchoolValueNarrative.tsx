"use client";

import { Sparkles } from "lucide-react";
import { VALUE_NARRATIVE } from "@/lib/schoolKpis";

export function SchoolValueNarrative() {
  return (
    <section
      aria-label="Why Yellow improves teaching time"
      className="relative overflow-hidden rounded-[22px] p-5 md:p-6 border"
      style={{
        borderColor: "color-mix(in srgb, hsl(142 55% 45%) 25%, var(--border))",
        background:
          "linear-gradient(135deg, color-mix(in srgb, hsl(142 55% 45%) 6%, var(--card)) 0%, color-mix(in srgb, hsl(260 55% 60%) 6%, var(--card)) 100%)",
      }}
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 h-44 w-44 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(closest-side, hsl(142 55% 45% / 0.16), transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(closest-side, hsl(260 55% 60% / 0.18), transparent)",
        }}
      />

      <div className="relative flex items-start gap-4 flex-wrap">
        <span
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "color-mix(in srgb, hsl(142 55% 45%) 18%, transparent)",
            color: "hsl(142 55% 38%)",
            border: "1px solid color-mix(in srgb, hsl(142 55% 45%) 35%, transparent)",
          }}
        >
          <Sparkles className="h-5 w-5" />
        </span>

        <div className="flex-1 min-w-[260px]">
          <div className="premium-eyebrow text-primary">{VALUE_NARRATIVE.eyebrow}</div>
          <h3 className="font-heading font-extrabold text-[18px] md:text-[19px] leading-tight mt-1.5">
            {VALUE_NARRATIVE.title}
          </h3>
          <p className="text-[13px] text-foreground/85 leading-relaxed mt-2 max-w-[860px]">
            {VALUE_NARRATIVE.body}
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-[860px]">
            <FlowChip step="1" label="Yellow supports teachers" tone="hsl(200 60% 50%)" />
            <FlowChip step="2" label="Students improve focus, persistence, behavior" tone="hsl(260 55% 60%)" />
            <FlowChip step="3" label="More time back for effective teaching" tone="hsl(142 55% 45%)" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowChip({
  step,
  label,
  tone,
}: {
  step: string;
  label: string;
  tone: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/70 backdrop-blur px-3 py-2"
      style={{
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone} 12%, transparent)`,
      }}
    >
      <span
        className="h-6 w-6 rounded-md flex items-center justify-center text-[10.5px] font-extrabold tabular-nums shrink-0"
        style={{
          background: `color-mix(in srgb, ${tone} 16%, transparent)`,
          color: tone,
        }}
      >
        {step}
      </span>
      <span className="text-[11.5px] font-semibold text-foreground/85 leading-tight">
        {label}
      </span>
    </div>
  );
}
