"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { PALETTE } from "../palette";
import { ZONES } from "../path";

// once the camera has flown through the window, the whole room grows
// outward and dissolves — "the room expands" into the wider world, rather
// than just being cut away or left behind unchanged. Opacity has to reach
// zero well before the scale-up finishes, or the (now huge) floor/wall
// planes balloon across later zones instead of vanishing.
const EXPAND_START = ZONES.threshold.start + 0.02;
const FADE_END = EXPAND_START + 0.05;
const SCALE_END = EXPAND_START + 0.1;
const EXPAND_SCALE = 1.6;

const WINDOW_POS = new THREE.Vector3(-1.5, 2.05, -1.55);
const SHAFT_FLOOR_TARGET = new THREE.Vector3(0.3, 0.05, 1.0);

function SunbeamShaft() {
  const mid = useMemo(() => WINDOW_POS.clone().lerp(SHAFT_FLOOR_TARGET, 0.5), []);
  const dir = useMemo(() => SHAFT_FLOOR_TARGET.clone().sub(WINDOW_POS).normalize(), []);
  const len = useMemo(() => WINDOW_POS.distanceTo(SHAFT_FLOOR_TARGET), []);
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir), [dir]);

  return (
    <group position={mid} quaternion={quat}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.95, len, 20, 1, true]} />
        <meshBasicMaterial
          color={PALETTE.goldenYellowLight}
          transparent
          opacity={0.09}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Bird({ phase, speed, y }: { phase: number; speed: number; y: number }) {
  const group = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Group>(null);
  const wingR = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    if (group.current) {
      group.current.position.set(Math.sin(t) * 0.9 - 1.5, y + Math.sin(t * 2) * 0.08, -1.48);
    }
    const flap = Math.sin(t * 9) * 0.55;
    if (wingL.current) wingL.current.rotation.z = 0.3 + flap;
    if (wingR.current) wingR.current.rotation.z = -0.3 - flap;
  });

  return (
    <group ref={group}>
      <group ref={wingL}>
        <mesh position={[-0.06, 0, 0]}>
          <boxGeometry args={[0.12, 0.018, 0.03]} />
          <meshBasicMaterial color={PALETTE.ink} />
        </mesh>
      </group>
      <group ref={wingR}>
        <mesh position={[0.06, 0, 0]}>
          <boxGeometry args={[0.12, 0.018, 0.03]} />
          <meshBasicMaterial color={PALETTE.ink} />
        </mesh>
      </group>
    </group>
  );
}

export function BedroomZone({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const lampGlow = useRef<THREE.PointLight>(null);
  const roomGroup = useRef<THREE.Group>(null);
  const materials = useRef<THREE.Material[]>([]);
  const baseOpacities = useRef<number[]>([]);

  useEffect(() => {
    if (!roomGroup.current) return;
    const mats: THREE.Material[] = [];
    const bases: number[] = [];
    roomGroup.current.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mat = obj.material as THREE.Material & { opacity?: number };
        mat.transparent = true;
        mats.push(mat);
        bases.push(mat.opacity ?? 1);
      }
    });
    materials.current = mats;
    baseOpacities.current = bases;
  }, []);

  useFrame((state) => {
    if (lampGlow.current) {
      lampGlow.current.intensity = 0.55 + Math.sin(state.clock.elapsedTime * 1.4) * 0.05;
    }

    const p = progressRef.current;
    const scaleT = THREE.MathUtils.smoothstep(p, EXPAND_START, SCALE_END);
    if (roomGroup.current) {
      roomGroup.current.scale.setScalar(1 + scaleT * (EXPAND_SCALE - 1));
    }
    const fade = 1 - THREE.MathUtils.smoothstep(p, EXPAND_START, FADE_END);
    materials.current.forEach((mat, i) => {
      (mat as THREE.Material & { opacity: number }).opacity = baseOpacities.current[i] * fade;
    });
  });

  return (
    <group ref={roomGroup}>
      <SunbeamShaft />
      <Bird phase={0} speed={0.35} y={2.3} />
      <Bird phase={2.1} speed={0.28} y={2.05} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color={PALETTE.creamDeep} roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.6, 0.005, 1.6]} receiveShadow>
        <circleGeometry args={[1.35, 36]} />
        <meshStandardMaterial color={PALETTE.cream} roughness={0.95} />
      </mesh>

      <mesh position={[0, 2.3, -1.6]} receiveShadow>
        <planeGeometry args={[16, 6]} />
        <meshStandardMaterial color={PALETTE.warmWhite} roughness={1} />
      </mesh>
      <mesh position={[0, 0.02, -1.58]}>
        <boxGeometry args={[16, 0.12, 0.04]} />
        <meshStandardMaterial color={PALETTE.creamDeep} roughness={0.9} />
      </mesh>

      <group position={[-1.5, 2.05, -1.55]}>
        <mesh>
          <planeGeometry args={[1.5, 1.5]} />
          <meshStandardMaterial color={PALETTE.goldenYellowLight} emissive={PALETTE.goldenYellow} emissiveIntensity={0.4} />
        </mesh>
        <RoundedBox args={[1.66, 1.66, 0.08]} radius={0.06} smoothness={4} position={[0, 0, -0.02]}>
          <meshStandardMaterial color={PALETTE.creamDeep} roughness={0.8} />
        </RoundedBox>
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[0.035, 1.5, 0.02]} />
          <meshStandardMaterial color={PALETTE.creamDeep} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[1.5, 0.035, 0.02]} />
          <meshStandardMaterial color={PALETTE.creamDeep} />
        </mesh>
        <pointLight position={[0, 0, 1.2]} intensity={0.4} color={PALETTE.goldenYellow} distance={5} />
      </group>

      <RoundedBox args={[2.05, 0.32, 1.6]} radius={0.08} smoothness={4} position={[0.85, 0.16, 1.05]} castShadow receiveShadow>
        <meshStandardMaterial color={PALETTE.goldenYellowDeep} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[2.05, 0.9, 0.14]} radius={0.14} smoothness={4} position={[0.85, 0.75, -1.03]} castShadow receiveShadow>
        <meshStandardMaterial color={PALETTE.goldenYellow} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[1.95, 0.22, 1.5]} radius={0.09} smoothness={4} position={[0.85, 0.42, 1.05]} castShadow receiveShadow>
        <meshStandardMaterial color={PALETTE.warmWhite} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[0.7, 0.18, 0.5]} radius={0.14} smoothness={4} position={[0.85, 0.62, 0.55]} rotation={[0, 0, 0.02]} castShadow receiveShadow>
        <meshStandardMaterial color={PALETTE.warmWhite} roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[1.95, 0.24, 1.15]} radius={0.1} smoothness={4} position={[0.85, 0.55, 1.4]} castShadow receiveShadow>
        <meshStandardMaterial color={PALETTE.softBlue} roughness={0.85} />
      </RoundedBox>
      <mesh position={[0.85, 0.68, 0.98]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[1.9, 0.03, 0.12]} />
        <meshStandardMaterial color={PALETTE.softBlueLight} roughness={0.85} />
      </mesh>

      <RoundedBox args={[0.55, 0.6, 0.5]} radius={0.05} smoothness={4} position={[-0.55, 0.3, 0.55]} castShadow receiveShadow>
        <meshStandardMaterial color={PALETTE.goldenYellowDeep} roughness={0.85} />
      </RoundedBox>
      <group position={[-0.55, 0.68, 0.55]}>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.03, 0.22, 12]} />
          <meshStandardMaterial color={PALETTE.ink} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <coneGeometry args={[0.16, 0.2, 20, 1, true]} />
          <meshStandardMaterial color={PALETTE.creamDeep} emissive={PALETTE.goldenYellow} emissiveIntensity={0.5} side={2} roughness={0.9} />
        </mesh>
        <pointLight ref={lampGlow} position={[0, 0.16, 0]} intensity={0.4} color={PALETTE.goldenYellow} distance={2.2} />
      </group>

      <Sparkles count={22} scale={[1.6, 1.8, 1.6]} position={[-0.6, 1.1, -0.3]} size={2.2} speed={0.15} color={PALETTE.goldenYellowLight} opacity={0.4} />
      <Sparkles count={16} scale={[5, 2, 4]} position={[0.6, 1.6, 0.4]} size={1.4} speed={0.2} color={PALETTE.creamDeep} opacity={0.2} />
    </group>
  );
}
