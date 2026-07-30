"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Compass, Gamepad2, Heart, Sparkles, Utensils, Volume2, VolumeX } from "lucide-react";
import { FloatingCTA } from "./FloatingCTA";
import { WatchDemoCTA } from "./WatchDemoCTA";
import { Footer } from "./Footer";
import { useScrollProgress } from "./world/useScrollProgress";
import { useSiteAudio, type ChimeKind } from "./useSiteAudio";
import { ZONES } from "./world/path";
import type { CareActionEvent } from "./world/FumiCompanion";

const WorldCanvas = dynamic(() => import("./world/WorldCanvas").then((m) => m.WorldCanvas), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#F1E7D6]" />,
});

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

// how much of the total scroll the hero copy stays visible for before fading
const HERO_FADE_END = 0.09;

// a brief title card announces each zone as its own chapter: fades in, holds,
// fades out well before the zone's content itself takes over
const CHAPTERS = [
  { key: "wake", start: ZONES.wake.start, roman: "I", title: "Good Morning" },
  { key: "threshold", start: ZONES.threshold.start, roman: "II", title: "Through the Window" },
  { key: "play", start: ZONES.play.start, roman: "III", title: "Play & Discover" },
  { key: "care", start: ZONES.care.start, roman: "IV", title: "A Living Friend" },
  { key: "grow", start: ZONES.grow.start, roman: "V", title: "Growing Every Day" },
  { key: "parents", start: ZONES.parents.start, roman: "VI", title: "For Parents" },
  { key: "goodnight", start: ZONES.goodnight.start, roman: "VII", title: "Goodnight" },
] as const;
const CHAPTER_FADE_IN = 0.02;
const CHAPTER_HOLD = 0.06;
const CHAPTER_FADE_OUT = 0.09;

const CARE_ACTIONS: { key: ChimeKind; label: string; icon: typeof Utensils }[] = [
  { key: "feed", label: "Feed", icon: Utensils },
  { key: "play", label: "Play", icon: Gamepad2 },
  { key: "cuddle", label: "Cuddle", icon: Heart },
  { key: "groom", label: "Groom", icon: Sparkles },
  { key: "explore", label: "Explore", icon: Compass },
];
// the care nook window has a little breathing room on each side so the
// buttons are fully settled in before the zone's own content fades in/out
const CARE_BUTTONS_START = ZONES.care.start + 0.02;
const CARE_BUTTONS_END = ZONES.care.end - 0.02;
const CARE_FADE_SPAN = 0.03;

export function FumiWorldExperience() {
  const storyRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLDivElement>(null);
  const chapterRomanRef = useRef<HTMLSpanElement>(null);
  const chapterTitleRef = useRef<HTMLSpanElement>(null);
  const activeChapterKeyRef = useRef<string | null>(null);
  const careButtonsRef = useRef<HTMLDivElement>(null);
  const careActionRef = useRef<CareActionEvent | null>(null);
  const careActionTokenRef = useRef(0);
  const pointerNormRef = useRef({ x: 0, y: 0 });
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const rawProgressRef = useScrollProgress(storyRef);
  const audio = useSiteAudio();

  function handleCareAction(action: ChimeKind) {
    careActionTokenRef.current += 1;
    careActionRef.current = { action, token: careActionTokenRef.current };
    audio.playChime(action);
  }

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      pointerNormRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - 8}px, ${e.clientY - 8}px, 0)`;
      }
    }
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  // hero copy: fades as the visitor scrolls past the wake beat, with a
  // gentle cursor-parallax drift — driven imperatively, not via framer-motion
  // style-binding (that path silently fails to apply opacity in this stack)
  useEffect(() => {
    let raf = 0;
    function tick() {
      const p = rawProgressRef.current;
      const fade = Math.max(0, 1 - p / HERO_FADE_END);
      if (heroRef.current) {
        heroRef.current.style.opacity = String(fade);
        heroRef.current.style.pointerEvents = fade > 0.05 ? "auto" : "none";
        if (!reducedMotion) {
          const px = pointerNormRef.current.x * 10;
          const py = pointerNormRef.current.y * -6;
          heroRef.current.style.transform = `translate3d(${px}px, ${py}px, 0)`;
        }
      }

      // care-action buttons: visible only while the "living friend" nook is in view
      const careFadeIn = Math.min(1, Math.max(0, (p - CARE_BUTTONS_START) / CARE_FADE_SPAN));
      const careFadeOut = 1 - Math.min(1, Math.max(0, (p - (CARE_BUTTONS_END - CARE_FADE_SPAN)) / CARE_FADE_SPAN));
      const careOpacity = p < CARE_BUTTONS_START || p > CARE_BUTTONS_END ? 0 : Math.min(careFadeIn, careFadeOut);
      if (careButtonsRef.current) {
        careButtonsRef.current.style.opacity = String(careOpacity);
        careButtonsRef.current.style.pointerEvents = careOpacity > 0.4 ? "auto" : "none";
      }

      // chapter title card: at most one chapter's window is active at a time
      let matched = false;
      for (const chapter of CHAPTERS) {
        const fadeInEnd = chapter.start + CHAPTER_FADE_IN;
        const holdEnd = chapter.start + CHAPTER_HOLD;
        const fadeOutEnd = chapter.start + CHAPTER_FADE_OUT;
        if (p < chapter.start || p > fadeOutEnd) continue;
        matched = true;
        let op = 1;
        if (p < fadeInEnd) op = (p - chapter.start) / CHAPTER_FADE_IN;
        else if (p > holdEnd) op = 1 - (p - holdEnd) / (fadeOutEnd - holdEnd);
        if (activeChapterKeyRef.current !== chapter.key) {
          activeChapterKeyRef.current = chapter.key;
          if (chapterRomanRef.current) chapterRomanRef.current.textContent = chapter.roman;
          if (chapterTitleRef.current) chapterTitleRef.current.textContent = chapter.title;
        }
        if (chapterRef.current) chapterRef.current.style.opacity = String(Math.max(0, Math.min(1, op)));
        break;
      }
      if (!matched) {
        activeChapterKeyRef.current = null;
        if (chapterRef.current) chapterRef.current.style.opacity = "0";
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, rawProgressRef]);

  return (
    <>
      <div ref={storyRef} className="relative h-[900vh] w-full bg-[#2A2620]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <WorldCanvas rawProgressRef={rawProgressRef} careActionRef={careActionRef} reducedMotion={reducedMotion} />

          {/* cinematic vignette + film grain, cheap CSS overlay instead of an extra postFX pass */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.28) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* chapter title card — announces each zone as its own chapter */}
          <div
            ref={chapterRef}
            className="pointer-events-none absolute inset-x-0 top-8 z-20 flex justify-center"
            style={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3 rounded-full bg-black/15 px-5 py-2 backdrop-blur-md">
              <span ref={chapterRomanRef} className="font-heading text-sm font-bold text-[#FAF5EC]" />
              <span className="h-3 w-px bg-[#FAF5EC]/40" />
              <span
                ref={chapterTitleRef}
                className="font-body text-xs font-medium uppercase tracking-[0.2em] text-[#FAF5EC]/90"
              />
            </div>
          </div>

          {/* hero copy */}
          <div
            ref={heroRef}
            className="pointer-events-none absolute inset-0 z-20 flex items-end sm:items-center"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="mx-auto w-full max-w-7xl px-6 pb-16 sm:px-10 sm:pb-0 lg:px-16">
              <div className="max-w-xl">
                <h1 className="font-heading text-[10.5vw] font-extrabold leading-[0.98] tracking-tight text-[#4A4038] sm:text-6xl lg:text-7xl">
                  Play with Purpose.
                  <br />
                  Grow with Fumi.
                </h1>
                <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-[#6B5F52]">
                  Interactive adventures that help children build focus, confidence, emotional
                  resilience and independence.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-8">
                  <FloatingCTA />
                  <WatchDemoCTA />
                </div>
              </div>
            </div>
          </div>

          {/* care-action buttons — a living friend to look after, not a checklist */}
          <div
            ref={careButtonsRef}
            className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex justify-center px-6"
            style={{ opacity: 0 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-3xl bg-black/10 p-3 backdrop-blur-md">
              {CARE_ACTIONS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCareAction(key)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl px-4 py-2.5 text-[#4A4038] transition-colors hover:bg-white/40"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-body text-[11px] font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={audio.toggle}
            aria-label={audio.enabled ? "Mute sound" : "Play sound"}
            className="absolute right-5 top-5 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-[#4A4038] backdrop-blur-sm transition-colors hover:bg-black/20"
          >
            {audio.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!reducedMotion && (
        <div
          ref={cursorRef}
          className="pointer-events-none fixed left-0 top-0 z-50 hidden h-4 w-4 rounded-full border border-white/70 mix-blend-difference sm:block"
          style={{ willChange: "transform" }}
          aria-hidden
        />
      )}

      <section className="flex flex-col items-center gap-8 bg-[#2A2620] px-6 py-24 text-center">
        <h2 className="font-heading text-2xl font-extrabold text-[#FAF5EC] sm:text-3xl">
          Ready to meet Fumi?
        </h2>
        <FloatingCTA dark />
      </section>

      <Footer />
    </>
  );
}
