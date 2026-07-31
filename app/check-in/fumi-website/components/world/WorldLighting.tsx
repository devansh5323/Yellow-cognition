"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "./palette";
import { ZONES } from "./path";

// A per-zone "color script" (like a film's), keyframed across overall
// progress: warm dawn -> soft sky -> bright playful daylight -> soft green ->
// a brief quiet/misty dip through Consequences -> warm "welcome back" peak ->
// calm warm charcoal for the parent observatory -> dim goodnight. Every stop
// stays within the muted, warm Scandinavian-toy palette (no saturated hues,
// no cold blue-greys even at the "calm" end) — the Consequences dip uses the
// gentle mist tones, never charcoal/black, so it reads as "quiet", not "bleak".
const KEYFRAMES = [
  { p: 0, ambient: PALETTE.goldenYellowLight, ambientI: 0.4, dir: PALETTE.warmWhite, dirI: 0.55, fog: PALETTE.cream },
  { p: 0.09, ambient: PALETTE.goldenYellowLight, ambientI: 0.4, dir: PALETTE.warmWhite, dirI: 0.55, fog: PALETTE.cream },
  { p: 0.17, ambient: PALETTE.softBlueLight, ambientI: 0.38, dir: PALETTE.warmWhite, dirI: 0.42, fog: PALETTE.softBlueLight },
  { p: 0.22, ambient: PALETTE.cream, ambientI: 0.48, dir: PALETTE.goldenYellowLight, dirI: 0.52, fog: PALETTE.softBlueLight },
  { p: 0.4, ambient: PALETTE.cream, ambientI: 0.48, dir: PALETTE.goldenYellowLight, dirI: 0.52, fog: PALETTE.softBlueLight },
  { p: 0.47, ambient: PALETTE.blush, ambientI: 0.4, dir: PALETTE.goldenYellowLight, dirI: 0.5, fog: PALETTE.cream },
  { p: 0.55, ambient: PALETTE.forestGreenLight, ambientI: 0.42, dir: PALETTE.cream, dirI: 0.38, fog: PALETTE.forestGreenLight },
  { p: 0.68, ambient: PALETTE.forestGreenLight, ambientI: 0.42, dir: PALETTE.cream, dirI: 0.38, fog: PALETTE.forestGreenLight },
  { p: 0.72, ambient: PALETTE.mist, ambientI: 0.24, dir: PALETTE.mistDeep, dirI: 0.17, fog: PALETTE.mist },
  { p: 0.8, ambient: PALETTE.mist, ambientI: 0.2, dir: PALETTE.mistDeep, dirI: 0.14, fog: PALETTE.mistDeep },
  { p: 0.84, ambient: PALETTE.goldenYellowLight, ambientI: 0.52, dir: PALETTE.warmWhite, dirI: 0.6, fog: PALETTE.warmWhite },
  { p: 0.9, ambient: PALETTE.creamDeep, ambientI: 0.3, dir: PALETTE.softBlueLight, dirI: 0.28, fog: PALETTE.charcoal },
  { p: 0.94, ambient: PALETTE.charcoal, ambientI: 0.24, dir: PALETTE.softBlue, dirI: 0.18, fog: PALETTE.charcoalDeep },
  { p: 1, ambient: PALETTE.charcoalDeep, ambientI: 0.2, dir: PALETTE.softBlueDeep, dirI: 0.14, fog: PALETTE.charcoalDeep },
];

// once "I'm Back" fires (or the visitor simply scrolls on through without
// clicking), pin the effective sample point at the already-bright "reunite"
// keyframe above so re-entering the zone later never looks quietly sad again
const RESOLVED_ANCHOR = ZONES.consequences.end - 0.005;

function sample(p: number) {
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const a = KEYFRAMES[i];
    const b = KEYFRAMES[i + 1];
    if (p >= a.p && p <= b.p) {
      const t = b.p > a.p ? (p - a.p) / (b.p - a.p) : 0;
      return {
        ambient: new THREE.Color(a.ambient).lerp(new THREE.Color(b.ambient), t),
        ambientI: THREE.MathUtils.lerp(a.ambientI, b.ambientI, t),
        dir: new THREE.Color(a.dir).lerp(new THREE.Color(b.dir), t),
        dirI: THREE.MathUtils.lerp(a.dirI, b.dirI, t),
        fog: new THREE.Color(a.fog).lerp(new THREE.Color(b.fog), t),
      };
    }
  }
  const last = KEYFRAMES[KEYFRAMES.length - 1];
  return {
    ambient: new THREE.Color(last.ambient),
    ambientI: last.ambientI,
    dir: new THREE.Color(last.dir),
    dirI: last.dirI,
    fog: new THREE.Color(last.fog),
  };
}

export function WorldLighting({
  progressRef,
  revivedRef,
}: {
  progressRef: React.MutableRefObject<number>;
  revivedRef: React.MutableRefObject<number>;
}) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();

  useFrame((_state, delta) => {
    const p = revivedRef.current > 0 ? Math.max(progressRef.current, RESOLVED_ANCHOR) : progressRef.current;
    const s = sample(p);
    // a short damp on the actual applied color/intensity so the "I'm Back"
    // jump (which can skip straight from the quiet trough to the bright
    // reunite keyframe) eases in smoothly rather than popping instantly
    const damp = 1 - Math.exp(-delta * 5);
    if (ambientRef.current) {
      ambientRef.current.color.lerp(s.ambient, damp);
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, s.ambientI, damp);
    }
    if (dirRef.current) {
      dirRef.current.color.lerp(s.dir, damp);
      dirRef.current.intensity = THREE.MathUtils.lerp(dirRef.current.intensity, s.dirI, damp);
    }
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.lerp(s.fog, damp);
    }
    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(s.fog, damp);
    }
  });

  return (
    <>
      {/* soft indirect sky/ground bounce — a constant gentle fill so nothing ever reads as flat or harsh */}
      <hemisphereLight args={[PALETTE.warmWhite, PALETTE.creamDeep, 0.35]} />
      <ambientLight ref={ambientRef} intensity={0.4} color={PALETTE.goldenYellowLight} />
      <directionalLight
        ref={dirRef}
        position={[3, 4.5, 2.5]}
        intensity={0.55}
        color={PALETTE.warmWhite}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
    </>
  );
}
