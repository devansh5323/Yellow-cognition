"use client";

// Tiny shared field primitives used by both the onboarding wizard
// (app/welcome/page.tsx) and the dashboard's classroom setup prompt.

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[12.5px] font-semibold text-foreground/80 mb-1.5">{label}</div>
      <div className="auth-field !h-12 [&_input]:!pl-4">{children}</div>
    </label>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-muted-foreground mb-2.5">
      {children}
    </div>
  );
}
