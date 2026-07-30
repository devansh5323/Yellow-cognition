"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { WorldHeading, WorldCaption, type TroikaTextMesh } from "../Typography";
import { CARE_NOOK_POS, ZONES } from "../path";
import { PALETTE } from "../palette";

// a little scattering of props around the nook, each hinting at one of the
// caretaking actions the visitor can trigger via the DOM buttons — Fumi
// isn't a checklist to complete, she's a small friend with things she likes
function FoodBowl() {
  return (
    <Float speed={1.3} floatIntensity={0.4} rotationIntensity={0.15}>
      <group position={[-0.9, -0.3, 0.5]}>
        <mesh castShadow receiveShadow rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.14, 0.16, 24, 1, true]} />
          <meshStandardMaterial color={PALETTE.softBlue} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.03, 0]} castShadow>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={PALETTE.goldenYellow} roughness={0.6} />
        </mesh>
      </group>
    </Float>
  );
}

function PlayBall() {
  return (
    <Float speed={1.7} floatIntensity={0.6} rotationIntensity={0.6}>
      <group position={[0.95, 0.2, -0.3]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.17, 20, 20]} />
          <meshStandardMaterial color={PALETTE.forestGreenLight} roughness={0.6} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.17, 0.02, 8, 24]} />
          <meshStandardMaterial color={PALETTE.forestGreen} roughness={0.6} />
        </mesh>
      </group>
    </Float>
  );
}

function CuddleCushion() {
  return (
    <Float speed={1.1} floatIntensity={0.3} rotationIntensity={0.1}>
      <RoundedBox args={[0.5, 0.16, 0.42]} radius={0.14} smoothness={4} position={[-0.6, 0.55, -0.6]} castShadow receiveShadow>
        <meshStandardMaterial color={PALETTE.blush} roughness={0.85} />
      </RoundedBox>
    </Float>
  );
}

function GroomBrush() {
  return (
    <Float speed={1.5} floatIntensity={0.45} rotationIntensity={0.3}>
      <group position={[0.7, 0.75, 0.5]} rotation={[0, 0, -0.4]}>
        <RoundedBox args={[0.22, 0.1, 0.06]} radius={0.04} smoothness={4} castShadow>
          <meshStandardMaterial color={PALETTE.goldenYellowDeep} roughness={0.7} />
        </RoundedBox>
        <mesh position={[0.16, 0, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.22, 10]} />
          <meshStandardMaterial color={PALETTE.ink} roughness={0.7} />
        </mesh>
      </group>
    </Float>
  );
}

function ExploreSign() {
  const needle = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (needle.current) needle.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.6;
  });
  return (
    <Float speed={1.2} floatIntensity={0.35} rotationIntensity={0.15}>
      <group position={[0, 1.0, -1.0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.5, 10]} />
          <meshStandardMaterial color={PALETTE.softBlueDeep} roughness={0.7} />
        </mesh>
        <mesh ref={needle} position={[0, 0.3, 0]} castShadow>
          <octahedronGeometry args={[0.11, 0]} />
          <meshStandardMaterial color={PALETTE.softBlueLight} roughness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

export function CareZone({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const titleMesh = useRef<TroikaTextMesh>(null);
  const captionMesh = useRef<TroikaTextMesh>(null);

  useFrame(() => {
    const p = progressRef.current;
    const fadeIn = THREE.MathUtils.smoothstep(p, ZONES.care.start, ZONES.care.start + 0.04);
    const fadeOut = 1 - THREE.MathUtils.smoothstep(p, ZONES.care.end - 0.05, ZONES.care.end);
    const op = fadeIn * fadeOut;
    if (titleMesh.current) titleMesh.current.fillOpacity = op;
    if (captionMesh.current) captionMesh.current.fillOpacity = op;
  });

  return (
    <group position={CARE_NOOK_POS}>
      <WorldHeading ref={titleMesh} position={[0, 1.7, 0]} fontSize={0.26} maxWidth={3.2}>
        A living friend
      </WorldHeading>
      <WorldCaption ref={captionMesh} position={[0, 1.35, 0]} fontSize={0.11} maxWidth={2.8}>
        Feed her, play together, cuddle up, groom her fur, and explore side by side.
      </WorldCaption>

      <FoodBowl />
      <PlayBall />
      <CuddleCushion />
      <GroomBrush />
      <ExploreSign />

      <ContactShadows position={[0, -0.55, 0]} opacity={0.25} scale={4} blur={2.4} far={1.2} />
    </group>
  );
}
