"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ChimeKind = "feed" | "play" | "cuddle" | "groom" | "explore";

// short, distinct three-note phrases per care action — bright/bouncy for
// play, soft for cuddle, sparkly for groom, curious for explore, etc.
const CHIME_NOTES: Record<ChimeKind, number[]> = {
  feed: [523.25, 659.25, 783.99],
  play: [659.25, 783.99, 987.77],
  cuddle: [523.25, 587.33, 659.25],
  groom: [783.99, 659.25, 987.77],
  explore: [440, 587.33, 739.99],
};

// Procedural ambience + one-shot "happy" chimes via Web Audio — no external
// audio assets. Off by default (autoplay policies require a user gesture
// anyway, and unrequested audio is poor UX); a small toggle turns it on, and
// every chime respects the same mute state.
export function useSiteAudio() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    function scheduleChirp() {
      const now = ctx.currentTime;
      const chirpCount = 2 + Math.floor(Math.random() * 3);

      for (let i = 0; i < chirpCount; i++) {
        const start = now + i * (0.09 + Math.random() * 0.06);
        const baseFreq = 2200 + Math.random() * 1400;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq, start);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * (1.25 + Math.random() * 0.35), start + 0.045);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, start + 0.09);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.045, start + 0.008);
        gain.gain.linearRampToValueAtTime(0, start + 0.1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.12);
      }

      timeoutRef.current = window.setTimeout(scheduleChirp, 2600 + Math.random() * 3600);
    }

    scheduleChirp();

    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      ctxRef.current = null;
      void ctx.close();
    };
  }, [enabled]);

  const playChime = useCallback((kind: ChimeKind) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const notes = CHIME_NOTES[kind];
    const now = ctx.currentTime;
    notes.forEach((freq, i) => {
      const start = now + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.07, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.24);
    });
  }, []);

  return { enabled, toggle: () => setEnabled((e) => !e), playChime };
}
