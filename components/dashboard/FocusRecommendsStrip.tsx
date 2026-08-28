"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  Clock,
  Gamepad2,
  Lightbulb,
  ListOrdered,
  MessageCircle,
  PersonStanding,
  Sparkles,
  Star,
  Target,
  Timer as TimerIcon,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  QUICK_ACTIVITIES,
  RECOMMENDED_ACTIONS,
  yellowRecommendsTopInsight,
  type QuickActivityType,
  type RecommendedAction,
} from "@/lib/classFocus";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const TYPE_TABS: { key: QuickActivityType | "All"; label: string; Icon?: LucideIcon }[] = [
  { key: "All", label: "All" },
  { key: "Movement", label: "Movement", Icon: PersonStanding },
  { key: "Discussion", label: "Discussion", Icon: MessageCircle },
  { key: "Game", label: "Game", Icon: Gamepad2 },
];

/** Component 6: practical, classroom-ready actions (whole-class habits) plus
 * a small library of 5-minute "Attention Hero" activities — deliberately
 * concrete and few, not another long recommendations feed. */
export function FocusRecommendsStrip() {
  const reduce = useReducedMotion();
  const topInsight = useMemo(() => yellowRecommendsTopInsight(), []);
  const [activeType, setActiveType] = useState<QuickActivityType | "All">("All");

  const filtered = QUICK_ACTIVITIES.filter((a) => activeType === "All" || a.type === activeType);
  const activity = filtered[0] ?? QUICK_ACTIVITIES[0];

  const openInAttentionHero = () =>
    toast("Coming soon", { description: "Attention Hero isn't linked up in this demo yet." });

  return (
    <section aria-label="Yellow Recommends" className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <span className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 inline-flex items-center justify-center shrink-0">
            <Lightbulb className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading font-extrabold text-[17px]">6. Yellow Recommends</h2>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">
              Practical actions and quick activities to improve class attention.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 max-w-sm">
          <Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" fill="currentColor" />
          <p className="text-[11.5px] leading-snug">
            <span className="text-muted-foreground">Based on your top insight:</span>{" "}
            <span className="font-bold text-foreground/90">{topInsight}</span>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Recommended Actions */}
        <div className="rounded-xl border border-border/60 bg-amber-500/[0.03] p-4 md:p-5 flex flex-col h-full">
          <div className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 inline-flex items-center justify-center shrink-0">
              <Target className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-bold">Recommended Actions</div>
              <p className="text-[11.5px] text-muted-foreground">Simple changes you can try in your next class.</p>
            </div>
          </div>

          <div className="mt-3.5 space-y-3 flex-1">
            {RECOMMENDED_ACTIONS.map((action, i) => (
              <ActionCard key={action.id} action={action} index={i} reduce={!!reduce} />
            ))}
          </div>

          <div className="mt-3.5 flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11.5px] leading-snug">
              <span className="font-bold">Tip:</span> Small changes, done consistently, lead to big
              improvements.
            </p>
          </div>
        </div>

        {/* Quick Activities */}
        <div className="rounded-xl border border-border/60 bg-primary/[0.03] p-4 md:p-5 flex flex-col h-full">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="h-8 w-8 rounded-lg bg-primary/15 text-primary inline-flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-bold">Quick Activities</div>
                <p className="text-[11.5px] text-muted-foreground">
                  5-minute activities to boost attention now.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 text-primary px-2.5 py-1 text-[10.5px] font-bold shrink-0">
              <Clock className="h-3 w-3" />5 mins each
            </span>
          </div>

          <div className="mt-3.5 inline-flex flex-wrap gap-1 rounded-full border border-border/60 bg-card p-1 w-fit">
            {TYPE_TABS.map((t) => {
              const active = activeType === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveType(t.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-bold transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.Icon && <t.Icon className="h-3.5 w-3.5" />}
                  {t.label}
                </button>
              );
            })}
          </div>

          {activity && (
            <motion.div
              key={activity.id}
              initial={reduce ? undefined : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="mt-3.5 rounded-xl border border-border bg-background p-4 flex-1"
            >
              <div className="flex items-start gap-3">
                <span className="h-11 w-11 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
                  <ActivityIcon type={activity.type} />
                </span>
                <div className="min-w-0">
                  <p className="font-heading font-extrabold text-[15px] leading-tight">{activity.title}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
                    {activity.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Pill Icon={Clock} label={`${activity.durationMins} mins`} />
                    <Pill Icon={Users} label={activity.groupSize} />
                    <Pill Icon={Sparkles} label={activity.category} />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-3.5">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-foreground/90">
                  <ListOrdered className="h-3.5 w-3.5" />
                  How to play
                </div>
                <ol className="mt-2 space-y-1.5">
                  {activity.howToPlay.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] leading-snug">
                      <span className="h-4 w-4 rounded-full bg-primary/15 text-primary inline-flex items-center justify-center text-[9.5px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-foreground/85">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-3.5 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[11.5px] text-muted-foreground">
                  View full activity in Attention Hero
                </p>
                <button
                  type="button"
                  onClick={openInAttentionHero}
                  className="inline-flex items-center gap-1 rounded-lg border border-primary/25 bg-primary/10 text-primary px-3 h-8 text-[12px] font-bold hover:bg-primary/15 transition-colors"
                >
                  Open in Attention Hero
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl bg-muted/30 px-4 py-3">
        <p className="text-[12px] text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span>
            <span className="font-bold text-foreground/90">Short,</span> engaging activities can reset
            attention and improve learning for everyone.
          </span>
        </p>
        <button
          type="button"
          onClick={openInAttentionHero}
          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-primary hover:underline shrink-0"
        >
          See all activities in Attention Hero
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

function ActivityIcon({ type }: { type: QuickActivityType }) {
  if (type === "Movement") return <PersonStanding className="h-5 w-5" />;
  if (type === "Discussion") return <MessageCircle className="h-5 w-5" />;
  return <Gamepad2 className="h-5 w-5" />;
}

function Pill({ Icon, label }: { Icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10.5px] font-bold text-muted-foreground">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function ActionCard({
  action,
  index,
  reduce,
}: {
  action: RecommendedAction;
  index: number;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3, ease: EASE }}
      className="rounded-xl border border-border bg-background p-3.5 flex items-center gap-3.5"
    >
      <span className="h-7 w-7 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 inline-flex items-center justify-center shrink-0 text-[12px] font-bold">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-bold leading-tight">{action.title}</p>
        <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">{action.detail}</p>
      </div>
      <ActionVisual visual={action.visual} label={action.durationLabel} />
    </motion.div>
  );
}

function ActionVisual({ visual, label }: { visual: RecommendedAction["visual"]; label: string }) {
  if (visual === "clock") {
    return (
      <div className="shrink-0 rounded-lg bg-neutral-900 border-2 border-neutral-700 px-2.5 py-1.5">
        <span className="font-mono font-bold text-[15px] text-emerald-400 tabular-nums">{label}</span>
      </div>
    );
  }
  return (
    <div className="relative shrink-0 h-12 w-12 rounded-full border-2 border-amber-500 bg-amber-500/10 flex flex-col items-center justify-center">
      <TimerIcon className="h-3 w-3 text-amber-600 absolute -top-1.5 left-1/2 -translate-x-1/2" />
      <span className="font-heading font-extrabold text-[14px] leading-none text-amber-600 dark:text-amber-400">
        {label.split(" ")[0]}
      </span>
      <span className="text-[8px] font-bold text-amber-600/80 dark:text-amber-400/80">min</span>
    </div>
  );
}
