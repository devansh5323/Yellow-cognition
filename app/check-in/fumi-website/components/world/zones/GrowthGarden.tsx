"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { WorldHeading, WorldCaption, type TroikaTextMesh } from "../Typography";
import { GROWTH_GARDEN_POS, ZONES } from "../path";
import { PALETTE } from "../palette";

// four life stages she continuously morphs through as the visitor scrolls —
// no cuts, no loading, just one figure smoothly reshaping in place. "overall"
// is a uniform scale (she gets bigger); the rest are secondary shape/color
// adjustments layered on top so proportions mature, not just size.
const STAGES = [
  { label: "Tiny Kitten", overall: 0.5, head: 1.18, body: [0.75, 0.7, 0.75], ear: 0.75, tail: 0.35, fur: PALETTE.softBlueLight },
  { label: "Curious Explorer", overall: 0.72, head: 1.1, body: [0.85, 0.82, 0.85], ear: 0.88, tail: 0.55, fur: PALETTE.softBlueLight },
  { label: "Confident Companion", overall: 0.95, head: 1.02, body: [0.95, 0.94, 0.95], ear: 0.98, tail: 0.8, fur: PALETTE.softBlue },
  { label: "Fully Grown Cat", overall: 1.2, head: 0.96, body: [1.05, 1.08, 1.05], ear: 1.05, tail: 1.0, fur: PALETTE.softBlue },
] as const;

function sampleStage(localT: number) {
  const segCount = STAGES.length - 1;
  const scaled = THREE.MathUtils.clamp(localT, 0, 1) * segCount;
  const i = Math.min(Math.floor(scaled), segCount - 1);
  const f = scaled - i;
  const a = STAGES[i];
  const b = STAGES[i + 1];
  return {
    overall: THREE.MathUtils.lerp(a.overall, b.overall, f),
    head: THREE.MathUtils.lerp(a.head, b.head, f),
    body: [0, 1, 2].map((k) => THREE.MathUtils.lerp(a.body[k], b.body[k], f)) as [number, number, number],
    ear: THREE.MathUtils.lerp(a.ear, b.ear, f),
    tail: THREE.MathUtils.lerp(a.tail, b.tail, f),
    fur: new THREE.Color(a.fur).lerp(new THREE.Color(b.fur), f),
  };
}

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
  const materials = useMemo(
    () =>
      CRYSTALS.map(
        (c) => new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.25, emissive: c.color, emissiveIntensity: 0.4 })
      ),
    []
  );

  const figureGroup = useRef<THREE.Group>(null);
  const headMesh = useRef<THREE.Mesh>(null);
  const earLMesh = useRef<THREE.Mesh>(null);
  const earRMesh = useRef<THREE.Mesh>(null);
  const bodyMesh = useRef<THREE.Mesh>(null);
  const tailMesh = useRef<THREE.Mesh>(null);
  const tailGroup = useRef<THREE.Group>(null);
  const stageLabelRefs = useRef<(TroikaTextMesh | null)[]>([]);

  const segStart = ZONES.grow.start;
  const segWidth = (ZONES.grow.end - ZONES.grow.start) / STAGES.length;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    materials.forEach((mat, i) => {
      const breathe = 0.35 + Math.sin(t * 1.1 + i * 1.7) * 0.25;
      mat.emissiveIntensity = breathe;
      const light = lights.current[i];
      if (light) light.intensity = breathe * 1.4;
    });

    const p = progressRef.current;
    const localT = (p - ZONES.grow.start) / (ZONES.grow.end - ZONES.grow.start);
    const s = sampleStage(localT);

    if (figureGroup.current) {
      figureGroup.current.scale.setScalar(s.overall);
      figureGroup.current.rotation.y = Math.sin(t * 0.4) * 0.25;
    }
    if (headMesh.current) {
      headMesh.current.scale.setScalar(s.head * 0.32);
      const mat = headMesh.current.material as THREE.MeshStandardMaterial;
      mat.color.copy(s.fur);
    }
    if (bodyMesh.current) {
      bodyMesh.current.scale.set(s.body[0], s.body[1], s.body[2]);
      const mat = bodyMesh.current.material as THREE.MeshStandardMaterial;
      mat.color.copy(s.fur);
    }
    if (earLMesh.current) earLMesh.current.scale.setScalar(s.ear * 0.11);
    if (earRMesh.current) earRMesh.current.scale.setScalar(s.ear * 0.11);
    if (tailGroup.current) {
      tailGroup.current.rotation.z = THREE.MathUtils.lerp(0.9, 0.35, localT) + Math.sin(t * 1.6) * 0.08;
    }
    if (tailMesh.current) tailMesh.current.scale.y = s.tail;

    // labels float just above whatever height she currently is — fixed at a
    // single height it would either float free above tiny-kitten scale or
    // overlap fully-grown-cat scale, since she's more than 2x taller by the end
    const headTopY = 0.1 + 0.62 * s.overall + s.head * 0.32 * s.overall + 0.35;
    STAGES.forEach((stage, i) => {
      const label = stageLabelRefs.current[i];
      if (!label) return;
      label.position.y = headTopY;
      const stageStart = segStart + segWidth * i;
      const stageEnd = segStart + segWidth * (i + 1);
      label.fillOpacity = segmentOpacity(p, stageStart, stageEnd, segWidth * 0.15);
    });

    const captionFade = THREE.MathUtils.smoothstep(p, ZONES.grow.end - 0.06, ZONES.grow.end - 0.02);
    if (captionMesh.current) captionMesh.current.fillOpacity = captionFade;
  });

  return (
    <group position={GROWTH_GARDEN_POS}>
      {STAGES.map((stage, i) => (
        <WorldHeading
          key={stage.label}
          ref={(el) => {
            stageLabelRefs.current[i] = el;
          }}
          position={[0, 1.2, 0]}
          fontSize={0.24}
          maxWidth={3}
        >
          {stage.label}
        </WorldHeading>
      ))}

      <WorldCaption ref={captionMesh} position={[0, 1.5, 0]} fontSize={0.14} color={PALETTE.ink} maxWidth={2.8}>
        Every small action helps her grow.
      </WorldCaption>

      <group ref={figureGroup} position={[0, 0.1, 0]}>
        <mesh ref={headMesh} position={[0, 0.62, 0]} castShadow>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color={PALETTE.softBlue} roughness={0.75} />
          <mesh position={[-0.35, 0.05, 0.88]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color={PALETTE.ink} roughness={0.3} />
          </mesh>
          <mesh position={[0.35, 0.05, 0.88]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color={PALETTE.ink} roughness={0.3} />
          </mesh>
        </mesh>
        <mesh ref={earLMesh} position={[-0.16, 0.85, -0.02]} castShadow>
          <coneGeometry args={[1, 1.6, 12]} />
          <meshStandardMaterial color={PALETTE.softBlue} roughness={0.75} />
        </mesh>
        <mesh ref={earRMesh} position={[0.16, 0.85, -0.02]} castShadow>
          <coneGeometry args={[1, 1.6, 12]} />
          <meshStandardMaterial color={PALETTE.softBlue} roughness={0.75} />
        </mesh>
        <RoundedBox ref={bodyMesh} args={[0.4, 0.34, 0.4]} radius={0.16} smoothness={4} position={[0, 0.2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={PALETTE.softBlue} roughness={0.78} />
        </RoundedBox>
        <group ref={tailGroup} position={[0, 0.15, -0.18]}>
          <mesh ref={tailMesh} position={[0, 0.22, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
            <meshStandardMaterial color={PALETTE.softBlueDeep} roughness={0.75} />
          </mesh>
        </group>
      </group>

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
