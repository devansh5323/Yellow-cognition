"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "./palette";

// A per-zone "color script" (like a film's), keyframed across overall
// progress: warm dawn -> soft sky -> bright playful daylight -> soft green ->
// calm warm charcoal for the parent observatory -> dim goodnight. Every stop
// stays within the muted, warm Scandinavian-toy palette (no saturated hues,
// no cold blue-greys even at the "calm" end).
const KEYFRAMES = [
  { p: 0, ambient: PALETTE.goldenYellowLight, ambientI: 0.4, dir: PALETTE.warmWhite, dirI: 0.55, fog: PALETTE.cream },
  { p: 0.1, ambient: PALETTE.goldenYellowLight, ambientI: 0.4, dir: PALETTE.warmWhite, dirI: 0.55, fog: PALETTE.cream },
  { p: 0.19, ambient: PALETTE.softBlueLight, ambientI: 0.38, dir: PALETTE.warmWhite, dirI: 0.42, fog: PALETTE.softBlueLight },
  { p: 0.24, ambient: PALETTE.cream, ambientI: 0.48, dir: PALETTE.goldenYellowLight, dirI: 0.52, fog: PALETTE.softBlueLight },
  { p: 0.44, ambient: PALETTE.cream, ambientI: 0.48, dir: PALETTE.goldenYellowLight, dirI: 0.52, fog: PALETTE.softBlueLight },
  { p: 0.53, ambient: PALETTE.blush, ambientI: 0.4, dir: PALETTE.goldenYellowLight, dirI: 0.5, fog: PALETTE.cream },
  { p: 0.62, ambient: PALETTE.forestGreenLight, ambientI: 0.42, dir: PALETTE.cream, dirI: 0.38, fog: PALETTE.forestGreenLight },
  { p: 0.74, ambient: PALETTE.forestGreenLight, ambientI: 0.42, dir: PALETTE.cream, dirI: 0.38, fog: PALETTE.forestGreenLight },
  { p: 0.78, ambient: PALETTE.creamDeep, ambientI: 0.3, dir: PALETTE.softBlueLight, dirI: 0.28, fog: PALETTE.charcoal },
  { p: 0.92, ambient: PALETTE.charcoal, ambientI: 0.24, dir: PALETTE.softBlue, dirI: 0.18, fog: PALETTE.charcoalDeep },
  { p: 1, ambient: PALETTE.charcoalDeep, ambientI: 0.2, dir: PALETTE.softBlueDeep, dirI: 0.14, fog: PALETTE.charcoalDeep },
];

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

export function WorldLighting({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();

  useFrame(() => {
    const s = sample(progressRef.current);
    if (ambientRef.current) {
      ambientRef.current.color.copy(s.ambient);
      ambientRef.current.intensity = s.ambientI;
    }
    if (dirRef.current) {
      dirRef.current.color.copy(s.dir);
      dirRef.current.intensity = s.dirI;
    }
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(s.fog);
    }
    if (scene.background instanceof THREE.Color) {
      scene.background.copy(s.fog);
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
