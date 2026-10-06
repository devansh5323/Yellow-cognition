"use client";

import { useEffect, useState } from "react";
import type { RecommendationResult } from "@/lib/recommendations";

// Shared across panels so each age/assessment pair is fetched once.
const cache = new Map<string, Promise<RecommendationResult | null>>();

function load(age: string, assessment?: string) {
  const key = `${age}|${assessment ?? ""}`;
  let p = cache.get(key);
  if (!p) {
    const qs = new URLSearchParams({ age });
    if (assessment) qs.set("assessment", assessment);
    p = fetch(`/api/recommendations?${qs}`)
      .then((r) => (r.ok ? (r.json() as Promise<RecommendationResult>) : null))
      .catch(() => null);
    cache.set(key, p);
  }
  return p;
}

/** Real recommended activities + skills to develop (attention_hero.recommendation)
 * for an age group. Null while loading or if unavailable — callers keep their
 * existing content as the fallback. */
export function useRecommendations(age: string | undefined, assessment?: string): RecommendationResult | null {
  const [state, setState] = useState<{ key: string; data: RecommendationResult | null } | null>(null);
  const key = age ? `${age}|${assessment ?? ""}` : null;

  useEffect(() => {
    if (!age || !key) return;
    let cancelled = false;
    load(age, assessment).then((data) => {
      if (!cancelled) setState({ key, data });
    });
    return () => {
      cancelled = true;
    };
  }, [age, assessment, key]);

  return state && state.key === key ? state.data : null;
}
