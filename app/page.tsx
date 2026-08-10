"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building2,
  HeartHandshake,
} from "lucide-react";
import { signIn, getSession, type UserRole } from "@/lib/auth";
import { isOnboarded } from "@/lib/onboarding";
import { isSchoolOnboarded } from "@/lib/schoolOnboarding";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const rise = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

export default function LoginPage() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();

  const destinationFor = (r: UserRole) => {
    if (r === "admin") return isSchoolOnboarded() ? "/school/dashboard" : "/school/welcome";
    if (r === "specialEducator") return "/specialist/dashboard";
    return isOnboarded() ? "/dashboard" : "/welcome";
  };

  useEffect(() => {
    const s = getSession();
    if (s) router.replace(destinationFor(s.role ?? "teacher"));
  }, [router]);

  const [role, setRole] = useState<UserRole>("teacher");
  const [email, setEmail] = useState("teacher@school.edu");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [invalidShake, setInvalidShake] = useState(0);

  const PRESET_EMAILS: Record<UserRole, string> = {
    teacher: "teacher@school.edu",
    admin: "admin@school.edu",
    specialEducator: "specialist@school.edu",
  };

  const switchRole = (r: UserRole) => {
    setRole(r);
    setError(null);
    if (!email || (Object.values(PRESET_EMAILS) as string[]).includes(email)) {
      setEmail(PRESET_EMAILS[r]);
    }
  };

  const cardRef = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 14 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 120, damping: 14 });

  const onCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onCardMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || password.length < 4) {
      setError("Please enter a valid email and password (min 4 characters).");
      setInvalidShake((n) => n + 1);
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 650));
      signIn(email.trim(), password, role);
      router.push(destinationFor(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setInvalidShake((n) => n + 1);
      setLoading(false);
    }
  };

  const continueWithGoogle = () => {
    setError(null);
    try {
      const presetEmail = PRESET_EMAILS[role];
      signIn(presetEmail, "google-sso", role);
      router.push(destinationFor(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 auth-aurora" aria-hidden />
      <div className="pointer-events-none absolute inset-0 auth-grid-mask opacity-70" aria-hidden />
      <div className="pointer-events-none absolute inset-0 auth-noise opacity-[0.12] mix-blend-overlay" aria-hidden />

      {/* Drifting orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="orb"
          style={{
            width: 520,
            height: 520,
            top: "-10%",
            left: "-6%",
            background:
              "radial-gradient(circle at 30% 30%, hsl(142 70% 70% / 0.55), transparent 60%)",
          }}
        />
        <div
          className="orb orb--b"
          style={{
            width: 460,
            height: 460,
            top: "8%",
            right: "-8%",
            background:
              "radial-gradient(circle at 60% 40%, hsl(260 80% 78% / 0.55), transparent 60%)",
          }}
        />
        <div
          className="orb orb--c"
          style={{
            width: 540,
            height: 540,
            bottom: "-18%",
            left: "28%",
            background:
              "radial-gradient(circle at 50% 50%, hsl(200 80% 78% / 0.45), transparent 60%)",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen w-full grid lg:grid-cols-[1.05fr_1fr]">
        {/* Left: brand story */}
        <motion.aside
          variants={prefersReducedMotion ? undefined : stagger}
          initial="hidden"
          animate="show"
          className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative"
        >
          <motion.div variants={rise} className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Yellow Cognition"
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 select-none"
              draggable={false}
              priority
            />
            <div className="leading-tight">
              <div className="font-heading font-extrabold text-[1.05rem] tracking-tight">Yellow</div>
              <div className="font-heading font-extrabold text-[13px] text-muted-foreground -mt-0.5 tracking-tight">
                Cognition
              </div>
            </div>
          </motion.div>

          <div className="max-w-xl">
            <motion.div
              variants={rise}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 backdrop-blur px-3 py-1.5 text-[11px] text-muted-foreground mb-5"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>New: Monthly growth digests are live</span>
            </motion.div>

            <motion.h1
              variants={rise}
              className="font-heading font-extrabold text-[44px] xl:text-[56px] leading-[1.05] tracking-tight text-foreground"
            >
              See every child.
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[hsl(142_55%_42%)] via-[hsl(200_60%_50%)] to-[hsl(260_55%_55%)] bg-clip-text text-transparent">
                  Help every learner.
                </span>
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
                  style={{ transformOrigin: "left" }}
                  className="absolute left-0 -bottom-1 h-[3px] w-full rounded-full bg-gradient-to-r from-primary/70 via-[hsl(200_60%_60%)]/70 to-[hsl(260_55%_65%)]/70"
                />
              </span>
            </motion.h1>

            <motion.p variants={rise} className="mt-6 text-[15px] leading-relaxed text-muted-foreground max-w-md">
              A calm, classroom-ready dashboard to monitor attention, spot students who need help,
              and celebrate growth — all in one serene view.
            </motion.p>

            {/* Stats */}
            <motion.div variants={rise} className="mt-10 grid grid-cols-3 gap-3 max-w-md">
              {[
                { k: "24", v: "Students tracked" },
                { k: "8", v: "Attention domains" },
                { k: "4w", v: "Growth history" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-3.5 text-center overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                  <div className="font-heading font-extrabold text-[26px] text-foreground leading-none">{s.k}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </motion.div>

            {/* Testimonial */}
            <motion.figure
              variants={rise}
              className="mt-10 max-w-md rounded-2xl border border-border/60 bg-card/70 backdrop-blur px-5 py-4 relative overflow-hidden"
            >
              <div className="absolute -top-8 -right-6 h-24 w-24 rounded-full bg-primary/15 blur-2xl" aria-hidden />
              <blockquote className="text-[13.5px] leading-relaxed text-foreground/90">
                &ldquo;It quietly surfaces the two students I would have missed that month — every single
                month. It feels like a calmer classroom.&rdquo;
              </blockquote>
              <figcaption className="mt-3 flex items-center gap-2.5 text-[12px]">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[hsl(260_55%_70%)] to-[hsl(200_60%_60%)] text-white flex items-center justify-center font-heading font-bold text-[11px]">
                  MR
                </div>
                <div className="leading-tight">
                  <div className="font-semibold">Maya Ramírez</div>
                  <div className="text-muted-foreground">Grade 4 · Lincoln Elementary</div>
                </div>
              </figcaption>
            </motion.figure>
          </div>

          <motion.div
            variants={rise}
            className="flex items-center justify-between text-[11px] text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>SOC 2 · FERPA-aligned · End-to-end encrypted</span>
            </div>
            <div>© 2026 Yellow Cognition</div>
          </motion.div>
        </motion.aside>

        {/* Right: auth card */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <motion.div
            ref={cardRef}
            onMouseMove={onCardMouseMove}
            onMouseLeave={onCardMouseLeave}
            style={{
              rotateX: prefersReducedMotion ? 0 : rx,
              rotateY: prefersReducedMotion ? 0 : ry,
              transformPerspective: 1200,
            }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="relative w-full max-w-[440px] rounded-[22px] auth-card p-8 sm:p-9"
          >
            <span className="auth-card-ring rounded-[22px]" aria-hidden />

            <motion.div
              variants={prefersReducedMotion ? undefined : stagger}
              initial="hidden"
              animate="show"
              className="relative"
            >
              {/* Mobile brand mark */}
              <motion.div variants={rise} className="lg:hidden flex items-center gap-2.5 mb-6">
                <Image
                  src="/logo.png"
                  alt="Yellow Cognition"
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 select-none"
                  draggable={false}
                />
                <div className="leading-tight">
                  <div className="font-heading font-extrabold text-[1.05rem] tracking-tight">Yellow</div>
                  <div className="font-heading font-extrabold text-[12px] text-muted-foreground -mt-0.5 tracking-tight">
                    Cognition
                  </div>
                </div>
              </motion.div>

              <motion.div variants={rise}>
                <h2 className="font-heading font-extrabold text-[28px] leading-tight tracking-tight">
                  {role === "admin"
                    ? "Welcome back, admin"
                    : role === "specialEducator"
                      ? "Welcome back"
                      : "Welcome back, teacher"}
                </h2>
                <p className="mt-1.5 text-[14px] text-muted-foreground">
                  {role === "admin"
                    ? "Sign in to oversee your school's classrooms."
                    : role === "specialEducator"
                      ? "Sign in to manage your student support caseload."
                      : "Sign in to step into your classroom."}
                </p>
              </motion.div>

              {/* Role segmented control */}
              <motion.div variants={rise} className="mt-5">
                <div
                  role="tablist"
                  aria-label="Sign in as"
                  className="relative inline-flex w-full rounded-[14px] border border-border/80 bg-muted/40 p-1 backdrop-blur"
                >
                  <motion.span
                    layout
                    layoutId={prefersReducedMotion ? undefined : "auth-role-pill"}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className={cn(
                      "absolute top-1 bottom-1 w-[calc(33.333%-0.1875rem)] rounded-[10px]",
                      "bg-card shadow-[0_4px_14px_-6px_hsl(230_50%_18%/0.18)] border border-border/60"
                    )}
                    style={{
                      left:
                        role === "teacher"
                          ? "0.25rem"
                          : role === "admin"
                            ? "calc(33.333% + 0.0625rem)"
                            : "calc(66.666% - 0.0625rem)",
                    }}
                    aria-hidden
                  />
                  {(["teacher", "admin", "specialEducator"] as const).map((r) => {
                    const Icon = r === "teacher" ? GraduationCap : r === "admin" ? Building2 : HeartHandshake;
                    const active = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => switchRole(r)}
                        className={cn(
                          "relative z-10 flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-[10px]",
                          "font-heading font-bold text-[12px] transition-colors px-1",
                          active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {r === "teacher" ? "Teacher" : r === "admin" ? "School admin" : "Specialist"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Google */}
              <motion.div variants={rise} className="mt-7">
                <button
                  type="button"
                  onClick={continueWithGoogle}
                  className="group relative w-full h-12 rounded-[14px] border border-border bg-card hover:bg-muted/60 transition-colors flex items-center justify-center gap-2.5 font-heading font-bold text-[14px]"
                >
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={rise} className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/80" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card/90 backdrop-blur px-3 text-[11px] tracking-[0.14em] font-semibold text-muted-foreground uppercase">
                    or with email
                  </span>
                </div>
              </motion.div>

              <motion.form
                onSubmit={submit}
                variants={rise}
                key={invalidShake}
                animate={
                  error && !loading ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }
                }
                transition={{ duration: 0.45, ease: EASE }}
                className="space-y-4"
                noValidate
              >
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-[12.5px] font-semibold text-foreground/80 mb-1.5">
                    School email
                  </label>
                  <div className="auth-field">
                    <Mail className="field-icon h-[17px] w-[17px]" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@school.edu"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-[12.5px] font-semibold text-foreground/80">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="auth-field">
                    <Lock className="field-icon h-[17px] w-[17px]" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      whileTap={{ scale: 0.92 }}
                      className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {showPassword ? (
                          <motion.span
                            key="off"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                          >
                            <EyeOff className="h-[17px] w-[17px]" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="on"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Eye className="h-[17px] w-[17px]" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>

                {/* Remember + hint */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={remember}
                    data-checked={remember}
                    onClick={() => setRemember((v) => !v)}
                    className="pill-check"
                  >
                    <span className="dot">
                      <AnimatePresence initial={false}>
                        {remember && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: EASE }}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <span>Keep me signed in</span>
                  </button>

                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    Secure sign-in
                  </span>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/[0.06] text-destructive text-[12.5px] p-3">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="leading-snug">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { y: -1 } : undefined}
                  whileTap={!loading ? { y: 1, scale: 0.995 } : undefined}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="cta-premium mt-1"
                >
                  <span className="sheen" aria-hidden />
                  <AnimatePresence mode="wait" initial={false}>
                    {loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex items-center gap-2.5"
                      >
                        <span className="ring-spin" aria-hidden />
                        <span>Signing you in…</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex items-center gap-2"
                      >
                        <span>Sign in</span>
                        <motion.span aria-hidden initial={{ x: 0 }} whileHover={{ x: 2 }}>
                          <ArrowRight className="h-[17px] w-[17px]" />
                        </motion.span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <p className="text-[11px] text-muted-foreground/80 text-center">
                  Demo: any email + password with 4+ characters
                </p>
              </motion.form>

              {/* Sign up */}
              <motion.p variants={rise} className="mt-7 text-center text-[13px] text-muted-foreground">
                New to Yellow?{" "}
                <Link
                  href="/"
                  className="font-semibold text-foreground underline decoration-primary/40 decoration-2 underline-offset-4 hover:decoration-primary transition-all"
                >
                  Request access
                </Link>
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
