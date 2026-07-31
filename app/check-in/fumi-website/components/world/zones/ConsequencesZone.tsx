"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, ContactShadows, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { WorldHeading, WorldCaption, type TroikaTextMesh } from "../Typography";
import { CONSEQUENCES_POS, ZONES } from "../path";
import { PALETTE } from "../palette";

// once "I'm Back" fires (or the visitor scrolls through without clicking),
// pin the effective sample point near the zone's own bright end so wilt
// never creeps back in if they scroll back up to look again
const RESOLVED_ANCHOR = ZONES.consequences.end - 0.005;

function WiltingPlant({
  position,
  wiltRef,
  phase,
}: {
  position: [number, number, number];
  wiltRef: React.MutableRefObject<number>;
  phase: number;
}) {
  const stem = useRef<THREE.Group>(null);
  const leafMat = useRef<THREE.MeshStandardMaterial>(null);
  const thrivingColor = useRef(new THREE.Color(PALETTE.forestGreenLight));
  const wiltedColor = useRef(new THREE.Color(PALETTE.mistDeep));

  useFrame((state) => {
    const wilt = wiltRef.current;
    if (stem.current) {
      const droop = wilt * (0.5 + Math.sin(state.clock.elapsedTime * 0.4 + phase) * 0.04);
      stem.current.rotation.z = droop;
      stem.current.rotation.x = droop * 0.3;
      stem.current.scale.setScalar(1 - wilt * 0.2);
    }
    if (leafMat.current) {
      leafMat.current.color.copy(thrivingColor.current).lerp(wiltedColor.current, wilt);
    }
  });

  return (
    <Float speed={1.1} floatIntensity={0.2} rotationIntensity={0.08}>
      <group position={position}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.12, 0.22, 16]} />
          <meshStandardMaterial color={PALETTE.terracotta} roughness={0.8} />
        </mesh>
        <group ref={stem} position={[0, 0.26, 0]}>
          <mesh position={[0, 0.16, 0]} castShadow>
            <coneGeometry args={[0.17, 0.36, 10]} />
            <meshStandardMaterial ref={leafMat} color={PALETTE.forestGreenLight} roughness={0.7} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

function EmptyBowl({ wiltRef }: { wiltRef: React.MutableRefObject<number> }) {
  const food = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (food.current) food.current.scale.setScalar(1 - wiltRef.current);
  });
  return (
    <Float speed={1.2} floatIntensity={0.3} rotationIntensity={0.1}>
      <group position={[0.85, -0.3, 0.3]}>
        <mesh castShadow receiveShadow rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.13, 0.15, 24, 1, true]} />
          <meshStandardMaterial color={PALETTE.softBlue} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={food} position={[0, 0.02, 0]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={PALETTE.goldenYellow} roughness={0.6} />
        </mesh>
      </group>
    </Float>
  );
}

function QuietSun({ wiltRef }: { wiltRef: React.MutableRefObject<number> }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const warm = useRef(new THREE.Color(PALETTE.goldenYellowLight));
  const dim = useRef(new THREE.Color(PALETTE.mist));

  useFrame(() => {
    const wilt = wiltRef.current;
    if (mat.current) {
      mat.current.color.copy(warm.current).lerp(dim.current, wilt);
      mat.current.emissiveIntensity = THREE.MathUtils.lerp(0.6, 0.15, wilt);
    }
    if (light.current) light.current.intensity = THREE.MathUtils.lerp(0.8, 0.15, wilt);
  });

  return (
    <group position={[1.6, 2.3, -3.2]}>
      <mesh>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial ref={mat} color={PALETTE.goldenYellowLight} emissive={PALETTE.goldenYellowLight} emissiveIntensity={0.6} />
      </mesh>
      <pointLight ref={light} color={PALETTE.goldenYellowLight} distance={2.5} intensity={0.6} />
    </group>
  );
}

export function ConsequencesZone({
  progressRef,
  revivedRef,
}: {
  progressRef: React.MutableRefObject<number>;
  revivedRef: React.MutableRefObject<number>;
}) {
  const titleMesh = useRef<TroikaTextMesh>(null);
  const missCaption = useRef<TroikaTextMesh>(null);
  const backCaption = useRef<TroikaTextMesh>(null);
  const wilt = useRef(0);

  useFrame((_state, delta) => {
    const p = progressRef.current;
    const effectiveP = revivedRef.current > 0 ? Math.max(p, RESOLVED_ANCHOR) : p;
    const target =
      THREE.MathUtils.smoothstep(effectiveP, ZONES.consequences.start, ZONES.consequences.start + 0.04) *
      (1 - THREE.MathUtils.smoothstep(effectiveP, ZONES.consequences.end - 0.06, ZONES.consequences.end));
    // damp the applied wilt so "I'm Back" eases the room back to life over
    // a beat rather than snapping instantly — "immediately" reads as "right
    // away", not "in a single frame"
    wilt.current = THREE.MathUtils.damp(wilt.current, target, 3.2, delta);

    const titleOp =
      THREE.MathUtils.smoothstep(p, ZONES.consequences.start, ZONES.consequences.start + 0.03) *
      (1 - THREE.MathUtils.smoothstep(p, ZONES.consequences.end - 0.04, ZONES.consequences.end));
    if (titleMesh.current) titleMesh.current.fillOpacity = titleOp;

    const revived = revivedRef.current > 0;
    if (missCaption.current) missCaption.current.fillOpacity = revived ? 0 : titleOp;
    if (backCaption.current) backCaption.current.fillOpacity = revived ? titleOp : 0;
  });

  return (
    <group position={CONSEQUENCES_POS}>
      <WorldHeading ref={titleMesh} position={[0, 1.9, 0]} fontSize={0.26} maxWidth={3.4}>
        Every Choice Matters
      </WorldHeading>
      <WorldCaption ref={missCaption} position={[0, 1.55, 0]} fontSize={0.11} maxWidth={2.9}>
        When you&apos;re away for a while, her little world goes quiet. She&apos;s not sad — just waiting for you.
      </WorldCaption>
      <WorldCaption ref={backCaption} position={[0, 1.55, 0]} fontSize={0.11} maxWidth={2.9}>
        Welcome back — small moments of care bring her whole world back to life.
      </WorldCaption>

      <WiltingPlant position={[-0.95, -0.3, -0.3]} wiltRef={wilt} phase={0} />
      <WiltingPlant position={[0.6, -0.35, -0.7]} wiltRef={wilt} phase={1.6} />
      <EmptyBowl wiltRef={wilt} />
      <QuietSun wiltRef={wilt} />

      <Sparkles count={22} scale={[3, 2, 3]} size={1.6} speed={0.15} color={PALETTE.warmWhite} opacity={0.3} />

      <ContactShadows position={[0, -0.55, 0]} opacity={0.2} scale={4} blur={2.4} far={1.2} />
    </group>
  );
}
