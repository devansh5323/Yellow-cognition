"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { WorldHeading, WorldCaption, type TroikaTextMesh } from "../Typography";
import { ISLAND_FOCUS_MAZE, ISLAND_MEMORY_MATCH, ISLAND_TASK_SWITCH, ISLAND_T_CENTERS } from "../path";
import { PALETTE } from "../palette";

function useTellPulse(progressRef: React.MutableRefObject<number>, center: number) {
  const pulse = useRef(0);
  useFrame((_, delta) => {
    if (Math.abs(progressRef.current - center) < 0.006) pulse.current = 1;
    pulse.current = THREE.MathUtils.damp(pulse.current, 0, 3.5, delta);
  });
  return pulse;
}

function useCaptionFade(progressRef: React.MutableRefObject<number>, center: number, span = 0.07) {
  const meshRef = useRef<TroikaTextMesh>(null);
  useFrame(() => {
    const d = Math.abs(progressRef.current - center);
    const fade = 1 - THREE.MathUtils.smoothstep(d, span * 0.5, span);
    if (meshRef.current) meshRef.current.fillOpacity = Math.max(0, fade);
  });
  return meshRef;
}

function IslandBase({ color, children }: { color: string; children?: React.ReactNode }) {
  return (
    <group>
      <mesh castShadow receiveShadow rotation={[0.15, 0.3, 0]} scale={[1, 0.82, 1]}>
        <icosahedronGeometry args={[1.1, 3]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <ContactShadows position={[0, -1.15, 0]} opacity={0.25} scale={4} blur={2.8} far={1.4} />
      {children}
    </group>
  );
}

function FocusMazeIsland({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const glow = useRef<THREE.PointLight>(null);
  const pulse = useTellPulse(progressRef, ISLAND_T_CENTERS[0]);
  const captionRef = useCaptionFade(progressRef, ISLAND_T_CENTERS[0]);

  useFrame((state) => {
    if (glow.current) {
      glow.current.intensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.15 + pulse.current * 1.2;
    }
  });

  const hedges = useMemo(
    () =>
      [
        [-0.4, 0.55, 0.5],
        [0.1, 0.55, 0.55],
        [0.55, 0.55, 0.1],
        [0.5, 0.55, -0.4],
        [0, 0.55, -0.5],
        [-0.5, 0.55, -0.1],
      ] as [number, number, number][],
    []
  );

  return (
    <group position={ISLAND_FOCUS_MAZE}>
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6}>
        <IslandBase color={PALETTE.forestGreenLight}>
          {hedges.map((p, i) => (
            <mesh key={i} position={p} castShadow>
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshStandardMaterial color={PALETTE.forestGreen} roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={PALETTE.goldenYellowLight} emissive={PALETTE.goldenYellow} emissiveIntensity={1.1} />
          </mesh>
          <pointLight ref={glow} position={[0, 0.7, 0]} color={PALETTE.goldenYellow} distance={2.6} />
        </IslandBase>
      </Float>
      <WorldHeading position={[0, 1.9, 0]} fontSize={0.24} color={PALETTE.ink} maxWidth={3}>
        Focus Maze
      </WorldHeading>
      <WorldCaption ref={captionRef} position={[0, 1.45, 0]} fontSize={0.11} maxWidth={2.6}>
        Guide Fumi through winding paths without losing focus.
      </WorldCaption>
    </group>
  );
}

function MemoryMatchIsland({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const cards = useRef<THREE.Group[]>([]);
  const pulse = useTellPulse(progressRef, ISLAND_T_CENTERS[1]);
  const captionRef = useCaptionFade(progressRef, ISLAND_T_CENTERS[1]);
  const glow = useRef<THREE.PointLight>(null);

  const leafPositions = useMemo(
    () =>
      [
        [-0.35, 0.85, 0.15],
        [0.3, 0.95, -0.1],
        [-0.1, 1.15, 0.25],
        [0.35, 0.7, 0.2],
        [-0.3, 0.6, -0.2],
      ] as [number, number, number][],
    []
  );

  useFrame((state) => {
    leafPositions.forEach((_, i) => {
      const g = cards.current[i];
      if (g) g.rotation.y = state.clock.elapsedTime * 0.8 + i * 1.3;
    });
    if (glow.current) glow.current.intensity = 0.5 + pulse.current * 1.2;
  });

  return (
    <group position={ISLAND_MEMORY_MATCH}>
      <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.55}>
        <IslandBase color={PALETTE.softBlueLight}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.09, 0.6, 8]} />
            <meshStandardMaterial color={PALETTE.goldenYellowDeep} roughness={0.9} />
          </mesh>
          {leafPositions.map((p, i) => (
            <group
              key={i}
              position={p}
              ref={(el) => {
                if (el) cards.current[i] = el;
              }}
            >
              <mesh castShadow>
                <boxGeometry args={[0.24, 0.32, 0.02]} />
                <meshStandardMaterial color={i % 2 === 0 ? PALETTE.softBlueDeep : PALETTE.cream} roughness={0.7} />
              </mesh>
            </group>
          ))}
          <pointLight ref={glow} position={[0, 1, 0]} color={PALETTE.softBlueLight} distance={2.4} />
        </IslandBase>
      </Float>
      <WorldHeading position={[0, 2, 0]} fontSize={0.24} color={PALETTE.ink} maxWidth={3}>
        Memory Match
      </WorldHeading>
      <WorldCaption ref={captionRef} position={[0, 1.55, 0]} fontSize={0.11} maxWidth={2.6}>
        Flip, remember, and match — Fumi cheers every streak.
      </WorldCaption>
    </group>
  );
}

function TaskSwitchIsland({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const faceMesh = useRef<THREE.Mesh>(null);
  const pulse = useTellPulse(progressRef, ISLAND_T_CENTERS[2]);
  const captionRef = useCaptionFade(progressRef, ISLAND_T_CENTERS[2]);
  const glow = useRef<THREE.PointLight>(null);

  const palette = useMemo(
    () => [PALETTE.goldenYellow, PALETTE.softBlue, PALETTE.forestGreen, PALETTE.creamDeep],
    []
  );
  const colorIndex = useRef(0);

  useFrame((state, delta) => {
    if (faceMesh.current) {
      faceMesh.current.rotation.y += delta * 0.6;
      faceMesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
      const face = Math.floor((faceMesh.current.rotation.y / (Math.PI * 0.5)) % palette.length);
      if (face !== colorIndex.current) {
        colorIndex.current = face;
        (faceMesh.current.material as THREE.MeshStandardMaterial).color.set(palette[Math.abs(face) % palette.length]);
      }
    }
    if (glow.current) glow.current.intensity = 0.5 + pulse.current * 1.2;
  });

  return (
    <group position={ISLAND_TASK_SWITCH}>
      <Float speed={1.6} rotationIntensity={0.1} floatIntensity={0.65}>
        <IslandBase color={PALETTE.creamDeep}>
          <mesh ref={faceMesh} position={[0, 0.55, 0]} castShadow>
            <octahedronGeometry args={[0.4, 2]} />
            <meshStandardMaterial color={palette[0]} roughness={0.55} />
          </mesh>
          <pointLight ref={glow} position={[0, 0.9, 0]} color={PALETTE.goldenYellow} distance={2.4} />
        </IslandBase>
      </Float>
      <WorldHeading position={[0, 1.85, 0]} fontSize={0.24} color={PALETTE.ink} maxWidth={3}>
        Task Switch
      </WorldHeading>
      <WorldCaption ref={captionRef} position={[0, 1.4, 0]} fontSize={0.11} maxWidth={2.6}>
        Hop between quick challenges without losing your place.
      </WorldCaption>
    </group>
  );
}

export function PlayIslands({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  return (
    <group>
      <FocusMazeIsland progressRef={progressRef} />
      <MemoryMatchIsland progressRef={progressRef} />
      <TaskSwitchIsland progressRef={progressRef} />
    </group>
  );
}
