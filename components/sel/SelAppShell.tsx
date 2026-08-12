"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  HeartPulse,
  Compass,
  ClipboardCheck,
  BookOpen,
  Layers,
  Users2,
  Menu,
  X,
  LogOut,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { getTheme, applyTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getSession, signOut, type TeacherSession } from "@/lib/auth";
import { PageTransition } from "@/components/dashboard/PageTransition";
import { Toaster } from "@/components/ui/sonner";

// Nav only lists what's actually built so far — grows as later tools in
// the 14-tool SEL Coordinator spec get designed (see memory:
// sel-coordinator-dashboard-spec), rather than pre-listing placeholder
// pages for tools with no confirmed page/nav structure yet.
const NAV = [
  { to: "/sel/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sel/pulse", label: "Pulse & Check-ins", icon: HeartPulse },
  { to: "/sel/needs", label: "Needs Explorer", icon: Compass },
  { to: "/sel/implementation", label: "Implementation Tracker", icon: ClipboardCheck },
  { to: "/sel/planner", label: "Program Planner", icon: BookOpen },
  { to: "/sel/groups", label: "Tiered Support", icon: Layers },
  { to: "/sel/teachers", label: "Teacher Support", icon: Users2 },
] as const;

const EASE = [0.2, 0.7, 0.2, 1] as const;

// Single-school app — no multi-school data model exists, so this is a real
// (if inert) display of the one real school rather than a fabricated switcher.
const SCHOOL_NAME = "Riverside Academy";

export function SelAppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<TeacherSession | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "selCoordinator") {
      router.push("/");
      return;
    }
    setSession(s);
  }, [router]);

  useEffect(() => {
    applyTheme(getTheme());
    const onChange = () => applyTheme(getTheme());
    window.addEventListener("ah-theme-change", onChange);
    return () => window.removeEventListener("ah-theme-change", onChange);
  }, []);

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const isActive = (to: string) => pathname === to || (to !== "/sel/dashboard" && pathname.startsWith(to));

  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground">
      <div className="premium-ambient" aria-hidden />

      {/* ───────────── Sidebar ───────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        aria-label="SEL coordinator navigation"
        data-tour-target="sel-sidebar"
      >
        <div className="relative flex-1 border-r border-sidebar-border premium-glass flex flex-col overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/10"
            aria-hidden
          />

          {/* Brand */}
          <div className="flex h-[68px] items-center gap-2.5 px-4 border-b border-sidebar-border/70">
            <img
              src="/logo.png"
              alt="Yellow Cognition"
              className="h-7 w-7 shrink-0 select-none"
              draggable={false}
            />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-heading font-extrabold text-[15px] truncate">Yellow</span>
              <span className="font-heading font-extrabold text-[13px] text-muted-foreground truncate">Cognition</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2.5 py-4 space-y-0.5">
            <div className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-muted-foreground/80 uppercase">
              SEL Coordination
            </div>
            {NAV.map((item) => {
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-colors",
                    active ? "text-primary" : "text-sidebar-foreground/90 hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "sel-nav-rail"}
                      className="nav-rail-active"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    <Icon className="h-[16px] w-[16px]" />
                  </span>
                  <span className="relative z-10">{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "sel-nav-dot"}
                      className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}

            {/* Quick switch back to other roles */}
            <div className="pt-4 mt-4 border-t border-sidebar-border/60">
              <div className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-muted-foreground/80 uppercase">
                Other roles
              </div>
              <button
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 w-full transition-colors"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground group-hover:text-foreground">
                  <GraduationCap className="h-[15px] w-[15px]" />
                </span>
                Switch to teacher
              </button>
            </div>
          </nav>

          {/* School switcher — single real school, no multi-school data exists */}
          <div className="px-2.5 pb-2">
            <div className="flex items-center gap-2 rounded-xl px-2.5 py-2 border border-sidebar-border/60 bg-card/40 text-[12px] font-semibold text-sidebar-foreground/90">
              <span className="truncate flex-1">{SCHOOL_NAME}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
          </div>

          {/* Footer: profile / sign out */}
          <div className="p-2.5 border-t border-sidebar-border/70">
            <button
              onClick={handleSignOut}
              aria-label={session ? `Sign out of ${session.name}` : "Sign out"}
              className="group w-full flex items-center gap-2.5 rounded-xl px-2 py-2 bg-card/40 hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 transition-colors text-left"
            >
              <div className="relative shrink-0">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(330_60%_72%)] to-[hsl(280_55%_60%)] text-white text-[11px] font-heading font-extrabold">
                    {session?.initials ?? "SC"}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-card group-hover:hidden"
                  aria-hidden
                />
              </div>
              <div className="flex flex-col min-w-0 leading-tight flex-1">
                <span className="text-[13px] font-semibold truncate group-hover:text-destructive transition-colors">
                  {session?.name ?? "SEL Coordinator"}
                </span>
                <span className="text-[11px] text-muted-foreground truncate group-hover:text-destructive/80 transition-colors">
                  <span className="group-hover:hidden">SEL Coordinator</span>
                  <span className="hidden group-hover:inline">Click to sign out</span>
                </span>
              </div>
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground group-hover:bg-destructive/15 group-hover:text-destructive transition-colors shrink-0"
                aria-hidden
              >
                <LogOut className="h-[16px] w-[16px]" />
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ───────────── Main column ───────────── */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Floating mobile menu trigger — sidebar is permanent on desktop */}
        <button
          className="md:hidden fixed top-4 left-4 z-40 h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border/60 bg-card/90 backdrop-blur text-muted-foreground shadow-md hover:bg-muted hover:text-foreground transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.span
                key="x"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                <X className="h-5 w-5" />
              </motion.span>
            ) : (
              <motion.span
                key="m"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                <Menu className="h-5 w-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <main className="relative flex-1 p-4 md:p-6 pt-16 md:pt-6 max-w-[1400px] w-full mx-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
