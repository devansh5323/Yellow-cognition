"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { WorldHeading, WorldCaption, type TroikaTextMesh } from "../Typography";
import { GROWTH_GARDEN_POS, ZONES } from "../path";
import { PALETTE } from "../palette";

// Fumi herself is the one who visibly grows here (see the growth-scale curve
// in FumiCompanion.tsx) — this zone is just the set dressing she passes
// through, with floating labels that hand off from one named stage to the
// next as she matures alongside the camera.
const STAGE_LABELS = ["Tiny Kitten", "Curious Explorer", "Confident Companion", "Fully Grown Cat"] as const;

function segmentOpacity(p: number, segStart: number, segEnd: number, margin: number) {
  const fadeIn = THREE.MathUtils.smoothstep(p, segStart, segStart + margin);
  const fadeOut = 1 - THREE.MathUtils.smoothstep(p, segEnd - margin, segEnd);
  return fadeIn * fadeOut;
}

const CRYSTALS = [
  { pos: [-1.5, 0, 0.4] as [number, number, number], scale: 0.5, color: PALETTE.forestGreenLight },
  { pos: [1.4, 0.1, -0.3] as [number, number, number], scale: 0.65, color: PALETTE.softBlueLight },
  { pos: [-1.2, 0, -0.7] as [number, number, number], scale: 0.4, color: PALETTE.goldenYellowLight },
];

export function GrowthGarden({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const lights = useRef<(THREE.PointLight | null)[]>([]);
  const captionMesh = useRef<TroikaTextMesh>(null);
  const stageLabelRefs = useRef<(TroikaTextMesh | null)[]>([]);
  const materials = useMemo(
    () =>
      CRYSTALS.map(
        (c) => new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.25, emissive: c.color, emissiveIntensity: 0.4 })
      ),
    []
  );

  const segStart = ZONES.grow.start;
  const segWidth = (ZONES.grow.end - ZONES.grow.start) / STAGE_LABELS.length;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    materials.forEach((mat, i) => {
      const breathe = 0.35 + Math.sin(t * 1.1 + i * 1.7) * 0.25;
      mat.emissiveIntensity = breathe;
      const light = lights.current[i];
      if (light) light.intensity = breathe * 1.4;
    });

    const p = progressRef.current;
    STAGE_LABELS.forEach((_, i) => {
      const label = stageLabelRefs.current[i];
      if (!label) return;
      const stageStart = segStart + segWidth * i;
      const stageEnd = segStart + segWidth * (i + 1);
      label.fillOpacity = segmentOpacity(p, stageStart, stageEnd, segWidth * 0.15);
    });

    const captionFade = THREE.MathUtils.smoothstep(p, ZONES.grow.end - 0.06, ZONES.grow.end - 0.02);
    if (captionMesh.current) captionMesh.current.fillOpacity = captionFade;
  });

  return (
    <group position={GROWTH_GARDEN_POS}>
      {STAGE_LABELS.map((label, i) => (
        <WorldHeading
          key={label}
          ref={(el) => {
            stageLabelRefs.current[i] = el;
          }}
          position={[0, 1.5, 0]}
          fontSize={0.24}
          maxWidth={3}
        >
          {label}
        </WorldHeading>
      ))}

      <WorldCaption ref={captionMesh} position={[0, 0.9, 0]} fontSize={0.14} color={PALETTE.ink} maxWidth={2.8}>
        Every small action helps her grow.
      </WorldCaption>

      {CRYSTALS.map((c, i) => (
        <Float key={i} speed={1.5} floatIntensity={0.4} rotationIntensity={0.3}>
          <mesh position={c.pos} scale={c.scale} material={materials[i]} castShadow>
            <octahedronGeometry args={[0.5, 0]} />
          </mesh>
          <pointLight
            ref={(el) => {
              lights.current[i] = el;
            }}
            position={[c.pos[0], c.pos[1] + 0.3, c.pos[2]]}
            color={c.color}
            distance={2}
          />
        </Float>
      ))}

      <Sparkles count={30} scale={[3.5, 2, 3.5]} size={2} speed={0.3} color="#DFF5E6" opacity={0.4} />
    </group>
  );
}
