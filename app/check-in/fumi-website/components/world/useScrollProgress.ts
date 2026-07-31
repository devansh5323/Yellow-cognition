"use client";

import { useEffect, useRef } from "react";

// Raw scroll progress (0..1) over a tall wrapper element, read via native
// window scroll + rAF — deliberately not framer-motion's useScroll bound to
// DOM style (that path silently fails to apply `opacity` in this stack).
// The returned ref is read inside the R3F loop and damped there for the
// cinematic "glide" feel; this hook only tracks the raw input.
export function useScrollProgress(wrapperRef: React.RefObject<HTMLElement | null>) {
  const progress = useRef(0);

  useEffect(() => {
    let raf = 0;

    function measure() {
      const el = wrapperRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const scrolled = -rect.top;
        progress.current = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
      }
      raf = requestAnimationFrame(measure);
    }

    raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [wrapperRef]);

  return progress;
}
