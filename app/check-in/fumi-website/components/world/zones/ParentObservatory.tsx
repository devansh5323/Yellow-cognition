"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WorldHeading, WorldCaption, type TroikaTextMesh } from "../Typography";
import { OBSERVATORY_POS, ZONES } from "../path";
import { PALETTE } from "../palette";

const PILLARS = [
  { label: "Focus", score: 82, color: PALETTE.forestGreenLight, angle: 0 },
  { label: "Behavior", score: 76, color: PALETTE.softBlueLight, angle: Math.PI / 2 },
  { label: "Task Completion", score: 88, color: PALETTE.goldenYellowLight, angle: Math.PI },
  { label: "Learning Readiness", score: 71, color: PALETTE.terracotta, angle: (3 * Math.PI) / 2 },
];

const KPIS = [
  { label: "Focus streak", value: "6/7 days" },
  { label: "Games this week", value: "12" },
  { label: "Growth this month", value: "+18%" },
];

function PillarMeter({ pillar, radius }: { pillar: (typeof PILLARS)[number]; radius: number }) {
  const arcAngle = (pillar.score / 100) * Math.PI * 2;
  const x = Math.cos(pillar.angle) * radius;
  const z = Math.sin(pillar.angle) * radius;

  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.035, 12, 48, Math.PI * 2]} />
        <meshStandardMaterial color={PALETTE.warmWhite} transparent opacity={0.18} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.045, 12, 48, arcAngle]} />
        <meshStandardMaterial color={pillar.color} emissive={pillar.color} emissiveIntensity={0.8} />
      </mesh>
      <WorldHeading fontSize={0.18} position={[0, 0.06, 0]} color={PALETTE.warmWhite} maxWidth={1.4}>
        {String(pillar.score)}
      </WorldHeading>
      <WorldCaption fontSize={0.075} position={[0, -0.3, 0]} color={PALETTE.cream} maxWidth={1.4}>
        {pillar.label}
      </WorldCaption>
    </group>
  );
}

export function ParentObservatory({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const daisLight = useRef<THREE.PointLight>(null);
  const titleMesh = useRef<TroikaTextMesh>(null);
  const captionMesh = useRef<TroikaTextMesh>(null);
  const kpiRefs = useRef<TroikaTextMesh[]>([]);
  const ring = useRef<THREE.Group>(null);

  const kpiPositions = useMemo(
    () =>
      [
        [-1.4, 1.0, 0],
        [0, 1.3, 0],
        [1.4, 1.0, 0],
      ] as [number, number, number][],
    []
  );

  useFrame((state, delta) => {
    if (ring.current) ring.current.rotation.y += delta * 0.08;
    if (daisLight.current) {
      daisLight.current.intensity = 0.7 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }

    const p = progressRef.current;
    const fadeIn = THREE.MathUtils.smoothstep(p, ZONES.parents.start, ZONES.parents.start + 0.05);
    if (titleMesh.current) titleMesh.current.fillOpacity = fadeIn;
    if (captionMesh.current) captionMesh.current.fillOpacity = fadeIn;
    kpiRefs.current.forEach((m) => {
      if (m) m.fillOpacity = fadeIn;
    });
  });

  return (
    <group position={OBSERVATORY_POS}>
      <WorldHeading ref={titleMesh} position={[0, 1.35, 0]} fontSize={0.24} color={PALETTE.warmWhite} maxWidth={3}>
        A clear view for parents
      </WorldHeading>
      <WorldCaption ref={captionMesh} position={[0, 1.05, 0]} fontSize={0.1} color={PALETTE.cream} maxWidth={2.6}>
        While Fumi plays, you see the story — focus, growth, and where to help next.
      </WorldCaption>

      {kpiPositions.map((pos, i) => (
        <group key={i} position={pos}>
          <WorldHeading
            ref={(el) => {
              if (el) kpiRefs.current[i] = el;
            }}
            fontSize={0.2}
            color={PALETTE.warmWhite}
            maxWidth={1.6}
          >
            {KPIS[i].value}
          </WorldHeading>
          <WorldCaption fontSize={0.09} position={[0, -0.22, 0]} color={PALETTE.cream} maxWidth={1.4}>
            {KPIS[i].label}
          </WorldCaption>
        </group>
      ))}

      <group ref={ring} position={[0, -0.6, 0]}>
        {PILLARS.map((pillar) => (
          <PillarMeter key={pillar.label} pillar={pillar} radius={1.1} />
        ))}
      </group>

      <mesh position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.3, 48]} />
        <meshStandardMaterial color={PALETTE.charcoal} roughness={0.6} metalness={0.1} />
      </mesh>
      <pointLight ref={daisLight} position={[0, 0.4, 0]} color={PALETTE.softBlue} distance={5} intensity={0.7} />
    </group>
  );
}
