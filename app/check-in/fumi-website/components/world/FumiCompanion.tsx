"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBox, Trail } from "@react-three/drei";
import { BED_POS, ISLAND_T_CENTERS, WANDER_CENTER, WANDER_RADIUS, ZONES, cameraCurve, progressToCurveU } from "./path";
import { PALETTE } from "./palette";
import type { ChimeKind } from "../useSiteAudio";

const FUR = PALETTE.softBlue;
const FUR_SHADOW = PALETTE.softBlueDeep;
const INK = PALETTE.ink;
const BLUSH = PALETTE.blush;
const INNER = PALETTE.warmWhite;
const NOSE = PALETTE.terracotta;

const LEAD = 0.028;
const SIDE_OFFSET = new THREE.Vector3(0.9, -0.35, 0);

const REACTION_DURATION = 1.3;
const BURST_COUNT = 14;
const BURST_LIFE = 1.1;

export type CareActionEvent = { action: ChimeKind; token: number };

export function FumiCompanion({
  progressRef,
  pointerRef,
  pointerActiveRef,
  careActionRef,
  reducedMotion,
}: {
  progressRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  pointerActiveRef: React.MutableRefObject<boolean>;
  careActionRef: React.MutableRefObject<CareActionEvent | null>;
  reducedMotion: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const earL = useRef<THREE.Group>(null);
  const earR = useRef<THREE.Group>(null);
  const eyeBallL = useRef<THREE.Group>(null);
  const eyeBallR = useRef<THREE.Group>(null);
  const closedL = useRef<THREE.Mesh>(null);
  const closedR = useRef<THREE.Mesh>(null);
  const pupilL = useRef<THREE.Mesh>(null);
  const pupilR = useRef<THREE.Mesh>(null);
  const mouthSmile = useRef<THREE.Mesh>(null);
  const mouthClosed = useRef<THREE.Mesh>(null);
  const mouthYawn = useRef<THREE.Mesh>(null);
  const cheekL = useRef<THREE.Mesh>(null);
  const cheekR = useRef<THREE.Mesh>(null);
  const arm = useRef<THREE.Group>(null);

  const awakeAmount = useRef(0);
  const waving = useRef(false);
  const waveElapsed = useRef(0);
  const earFlick = useRef(0);
  const wakeStartElapsed = useRef<number | null>(null);
  const wakeWaveFired = useRef(false);
  const goodnightWaveFired = useRef(false);

  const tmpFollow = useRef(new THREE.Vector3());
  const tmpTangent = useRef(new THREE.Vector3());
  const tmpSide = useRef(new THREE.Vector3());

  const reactionAction = useRef<ChimeKind | null>(null);
  const reactionElapsed = useRef(0);
  const lastActionToken = useRef(0);

  const burstGroup = useRef<THREE.Group>(null);
  const burstMeshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const burstVelocities = useRef(Array.from({ length: BURST_COUNT }, () => new THREE.Vector3()));
  const burstActiveSince = useRef<number | null>(null);
  const burstColors = useMemo(
    () => [PALETTE.softBlue, PALETTE.goldenYellow, PALETTE.forestGreen, PALETTE.blush, PALETTE.cream],
    []
  );

  useFrame((state, delta) => {
    const p = progressRef.current;
    const t = state.clock.elapsedTime;

    // waking is triggered by cursor movement — scroll progress is only a
    // fallback so touch/scroll-only visitors still see Fumi wake up
    if (wakeStartElapsed.current === null && (pointerActiveRef.current || p > 0.02)) {
      wakeStartElapsed.current = t;
    }
    const sinceWake = wakeStartElapsed.current === null ? -1 : t - wakeStartElapsed.current;
    const wakeTarget = sinceWake < 0 ? 0 : THREE.MathUtils.smoothstep(sinceWake, 0, 2.6);
    awakeAmount.current = THREE.MathUtils.damp(awakeAmount.current, wakeTarget, 2.5, delta);
    const a = awakeAmount.current;

    // a brief stretch-and-yawn beat partway through waking
    const stretchEnvelope =
      sinceWake < 0
        ? 0
        : THREE.MathUtils.smoothstep(sinceWake, 0.6, 1.2) * (1 - THREE.MathUtils.smoothstep(sinceWake, 1.7, 2.3));

    // position: rest in bed -> wander near the bed once awake -> lead the
    // camera along the same path (offset to its side) once the journey starts
    const inBed = 1 - THREE.MathUtils.smoothstep(p, ZONES.wake.start, ZONES.wake.end);
    const u = progressToCurveU(Math.min(1, p + LEAD));
    cameraCurve.getPoint(u, tmpFollow.current);
    cameraCurve.getTangent(u, tmpTangent.current).normalize();
    tmpSide.current.copy(SIDE_OFFSET).applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), tmpTangent.current)
    );
    tmpFollow.current.add(tmpSide.current);

    const wandering = !reducedMotion && a > 0.9 && inBed > 0.85;
    const wt = sinceWake < 0 ? 0 : sinceWake * 0.55;
    const restX = wandering ? WANDER_CENTER.x + Math.cos(wt) * WANDER_RADIUS : BED_POS.x;
    const restY = wandering ? WANDER_CENTER.y + Math.abs(Math.sin(wt * 5)) * 0.05 : BED_POS.y;
    const restZ = wandering ? WANDER_CENTER.z + Math.sin(wt * 1.4) * WANDER_RADIUS * 0.7 : BED_POS.z;

    const traveling = inBed < 0.98;
    const bob = traveling && !reducedMotion ? Math.sin(t * 2.2) * 0.06 : traveling ? 0.02 : 0;

    if (root.current) {
      root.current.position.x = THREE.MathUtils.lerp(tmpFollow.current.x, restX, inBed);
      root.current.position.y = THREE.MathUtils.lerp(tmpFollow.current.y, restY, inBed) + bob;
      root.current.position.z = THREE.MathUtils.lerp(tmpFollow.current.z, restZ, inBed);

      // gentle bank while traveling, a curious wobble while wandering, upright while resting
      const wanderYaw = wandering ? Math.sin(wt * 0.8) * 0.35 : 0;
      const bankTarget = traveling && !reducedMotion ? THREE.MathUtils.clamp(-tmpTangent.current.x * 0.4, -0.3, 0.3) : 0;
      root.current.rotation.z = THREE.MathUtils.lerp(root.current.rotation.z, bankTarget, 0.05);
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, wanderYaw, 0.04);

      const breathe = THREE.MathUtils.lerp(Math.sin(t * 1.5) * 0.025, Math.sin(t * 2.2) * 0.008, a);
      const stretchLift = 1 + stretchEnvelope * 0.16;
      root.current.scale.set(1 + breathe * 0.3, (1 + breathe) * stretchLift, 1 + breathe * 0.3);
    }

    // gaze target — cursor-reactive near the start, softly forward-looking once traveling
    const rootY = root.current?.position.y ?? BED_POS.y;
    const gazeStrength = THREE.MathUtils.lerp(1, 0.25, THREE.MathUtils.smoothstep(p, 0, 0.2));
    const dx = pointerRef.current.x * 1.4 * gazeStrength;
    const dy = 0.4 + pointerRef.current.y * 0.5 * gazeStrength - rootY + BED_POS.y;
    const dz = 1.4;
    const yaw = THREE.MathUtils.clamp(Math.atan2(dx, dz), -0.5, 0.5) * (0.15 + a * 0.85);
    const pitch = THREE.MathUtils.clamp(Math.atan2(-dy, dz), -0.3, 0.3) * (0.15 + a * 0.85);

    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, yaw, 0.08);
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, pitch, 0.08);
    }

    const pupilX = THREE.MathUtils.clamp(yaw * 0.09, -0.022, 0.022);
    const pupilY = THREE.MathUtils.clamp(-pitch * 0.09, -0.016, 0.016);
    if (pupilL.current) {
      pupilL.current.position.x = THREE.MathUtils.lerp(pupilL.current.position.x, pupilX, 0.15);
      pupilL.current.position.y = THREE.MathUtils.lerp(pupilL.current.position.y, pupilY, 0.15);
    }
    if (pupilR.current) {
      pupilR.current.position.x = THREE.MathUtils.lerp(pupilR.current.position.x, pupilX, 0.15);
      pupilR.current.position.y = THREE.MathUtils.lerp(pupilR.current.position.y, pupilY, 0.15);
    }

    const eyeOpen = THREE.MathUtils.lerp(0.08, 1, a);
    if (eyeBallL.current) eyeBallL.current.scale.y = eyeOpen;
    if (eyeBallR.current) eyeBallR.current.scale.y = eyeOpen;
    const closedMatL = closedL.current?.material as THREE.MeshStandardMaterial | undefined;
    const closedMatR = closedR.current?.material as THREE.MeshStandardMaterial | undefined;
    if (closedMatL) closedMatL.opacity = 1 - a;
    if (closedMatR) closedMatR.opacity = 1 - a;

    const smileMat = mouthSmile.current?.material as THREE.MeshStandardMaterial | undefined;
    const closedMat = mouthClosed.current?.material as THREE.MeshStandardMaterial | undefined;
    const yawnMat = mouthYawn.current?.material as THREE.MeshStandardMaterial | undefined;
    if (smileMat) smileMat.opacity = Math.max(0, a - stretchEnvelope * 0.7);
    if (closedMat) closedMat.opacity = Math.max(0, 1 - a - stretchEnvelope * 0.3);
    if (yawnMat) yawnMat.opacity = stretchEnvelope;
    if (mouthSmile.current) mouthSmile.current.scale.setScalar(0.7 + a * 0.3);
    if (mouthYawn.current) mouthYawn.current.scale.setScalar(0.6 + stretchEnvelope * 0.5);

    const cheekLMat = cheekL.current?.material as THREE.MeshStandardMaterial | undefined;
    const cheekRMat = cheekR.current?.material as THREE.MeshStandardMaterial | undefined;
    if (cheekLMat) cheekLMat.opacity = a * 0.65;
    if (cheekRMat) cheekRMat.opacity = a * 0.65;

    // ears: perk when awake, plus a quick extra flick as each island centers in frame
    for (const center of ISLAND_T_CENTERS) {
      if (Math.abs(p - center) < 0.004) earFlick.current = 1;
    }
    earFlick.current = THREE.MathUtils.damp(earFlick.current, 0, 4, delta);
    const flick = earFlick.current * 0.25;
    if (earL.current) earL.current.rotation.z = THREE.MathUtils.lerp(0.55, 0.32, a) - flick;
    if (earR.current) earR.current.rotation.z = THREE.MathUtils.lerp(-0.55, -0.32, a) + flick;

    // wave once she's just finished waking, and again at goodnight
    if (!wakeWaveFired.current && sinceWake > 2.3) {
      wakeWaveFired.current = true;
      waving.current = true;
      waveElapsed.current = 0;
    }
    if (!goodnightWaveFired.current && p >= ZONES.goodnight.start) {
      goodnightWaveFired.current = true;
      waving.current = true;
      waveElapsed.current = 0;
    }

    if (waving.current && arm.current) {
      waveElapsed.current += delta;
      const swing = Math.sin(waveElapsed.current * 6.5) * 0.55;
      arm.current.rotation.z = -0.9 + swing;
      if (waveElapsed.current > 1.7) waving.current = false;
    } else if (stretchEnvelope > 0.05 && arm.current) {
      arm.current.rotation.z = THREE.MathUtils.lerp(arm.current.rotation.z, -1.6, 0.08);
    } else if (arm.current) {
      const rest = a < 0.5 ? 0.15 : -0.35;
      arm.current.rotation.z = THREE.MathUtils.lerp(arm.current.rotation.z, rest, 0.05);
    }

    // care-action reactions: a DOM button outside the canvas writes a new
    // {action, token} whenever it's clicked; every distinct token plays that
    // action's own reaction pose plus a confetti burst, so every interaction
    // visibly registers with her rather than just completing silently
    const care = careActionRef.current;
    if (care && care.token !== lastActionToken.current) {
      lastActionToken.current = care.token;
      reactionAction.current = care.action;
      reactionElapsed.current = 0;
      burstActiveSince.current = t;
      burstVelocities.current.forEach((v) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.7 + Math.random() * 1.0;
        v.set(Math.cos(angle) * speed, 1.3 + Math.random() * 0.9, Math.sin(angle) * speed);
      });
    }
    if (reactionAction.current) {
      reactionElapsed.current += delta;
      if (reactionElapsed.current > REACTION_DURATION) reactionAction.current = null;
    }
    const reactionEnv = reactionAction.current
      ? Math.sin(Math.min(reactionElapsed.current / REACTION_DURATION, 1) * Math.PI)
      : 0;

    if (reactionAction.current === "feed" && root.current) {
      const nom = Math.sin(reactionElapsed.current * 14) * 0.5 + 0.5;
      if (smileMat) smileMat.opacity = THREE.MathUtils.lerp(smileMat.opacity, nom, reactionEnv);
      root.current.position.y += Math.sin(reactionElapsed.current * 14) * 0.02 * reactionEnv;
      if (cheekLMat) cheekLMat.opacity = Math.max(cheekLMat.opacity, reactionEnv * 0.8);
      if (cheekRMat) cheekRMat.opacity = Math.max(cheekRMat.opacity, reactionEnv * 0.8);
    }
    if (reactionAction.current === "play" && arm.current && root.current) {
      arm.current.rotation.z = -0.9 + Math.sin(reactionElapsed.current * 11) * 0.7 * reactionEnv;
      root.current.position.y += Math.abs(Math.sin(reactionElapsed.current * 9)) * 0.1 * reactionEnv;
    }
    if (reactionAction.current === "cuddle") {
      if (closedMatL) closedMatL.opacity = Math.max(closedMatL.opacity, reactionEnv);
      if (closedMatR) closedMatR.opacity = Math.max(closedMatR.opacity, reactionEnv);
      if (root.current) {
        const squeeze = 1 - Math.sin(reactionElapsed.current * 5) * 0.05 * reactionEnv;
        root.current.scale.x *= squeeze;
        root.current.scale.z *= squeeze;
      }
      if (earL.current) earL.current.rotation.z = THREE.MathUtils.lerp(earL.current.rotation.z, 0.7, reactionEnv * 0.5);
      if (earR.current) earR.current.rotation.z = THREE.MathUtils.lerp(earR.current.rotation.z, -0.7, reactionEnv * 0.5);
    }
    if (reactionAction.current === "groom" && root.current) {
      root.current.rotation.y += reactionEnv * 0.09;
      if (earL.current) earL.current.rotation.x = Math.sin(reactionElapsed.current * 16) * 0.2 * reactionEnv;
      if (earR.current) earR.current.rotation.x = Math.sin(reactionElapsed.current * 16 + 1) * 0.2 * reactionEnv;
    }
    if (reactionAction.current === "explore" && head.current) {
      head.current.rotation.y = Math.sin(reactionElapsed.current * 6) * 0.4 * reactionEnv;
      if (earL.current) earL.current.rotation.z -= 0.15 * reactionEnv;
      if (earR.current) earR.current.rotation.z += 0.15 * reactionEnv;
    }

    // confetti burst, emitted from wherever she currently is
    if (burstGroup.current && root.current) {
      burstGroup.current.position.set(root.current.position.x, root.current.position.y + 0.55, root.current.position.z);
    }
    if (burstActiveSince.current !== null) {
      const sinceBurst = t - burstActiveSince.current;
      if (sinceBurst < BURST_LIFE) {
        burstMeshRefs.current.forEach((mesh, i) => {
          if (!mesh) return;
          const v = burstVelocities.current[i];
          mesh.position.set(v.x * sinceBurst, v.y * sinceBurst - 1.6 * sinceBurst * sinceBurst, v.z * sinceBurst);
          mesh.scale.setScalar(Math.max(0, 1 - sinceBurst / BURST_LIFE) * 0.5);
        });
      } else {
        burstActiveSince.current = null;
        burstMeshRefs.current.forEach((mesh) => mesh?.scale.setScalar(0));
      }
    }
  });

  return (
    <>
    <group ref={root} position={[BED_POS.x, BED_POS.y, BED_POS.z]}>
      <group ref={head} position={[0, 0.36, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.34, 32, 32]} />
          <meshStandardMaterial color={FUR} roughness={0.75} />
        </mesh>

        <group ref={earL} position={[-0.24, 0.2, -0.03]}>
          <mesh position={[0, 0.13, 0]} castShadow>
            <capsuleGeometry args={[0.075, 0.14, 4, 12]} />
            <meshStandardMaterial color={FUR} roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.13, 0.045]}>
            <capsuleGeometry args={[0.045, 0.09, 4, 12]} />
            <meshStandardMaterial color={INNER} roughness={0.9} />
          </mesh>
        </group>
        <group ref={earR} position={[0.24, 0.2, -0.03]}>
          <mesh position={[0, 0.13, 0]} castShadow>
            <capsuleGeometry args={[0.075, 0.14, 4, 12]} />
            <meshStandardMaterial color={FUR} roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.13, 0.045]}>
            <capsuleGeometry args={[0.045, 0.09, 4, 12]} />
            <meshStandardMaterial color={INNER} roughness={0.9} />
          </mesh>
        </group>

        <mesh position={[0, -0.08, 0.28]} castShadow>
          <sphereGeometry args={[0.17, 24, 24]} />
          <meshStandardMaterial color={INNER} roughness={0.85} />
        </mesh>

        <mesh position={[0, -0.02, 0.44]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={NOSE} roughness={0.5} />
        </mesh>

        <mesh ref={cheekL} position={[-0.2, -0.08, 0.27]} rotation={[0, -0.3, 0]}>
          <circleGeometry args={[0.05, 20]} />
          <meshStandardMaterial color={BLUSH} transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh ref={cheekR} position={[0.2, -0.08, 0.27]} rotation={[0, 0.3, 0]}>
          <circleGeometry args={[0.05, 20]} />
          <meshStandardMaterial color={BLUSH} transparent opacity={0} depthWrite={false} />
        </mesh>

        <group position={[-0.13, 0.03, 0.3]}>
          <group ref={eyeBallL}>
            <mesh>
              <sphereGeometry args={[0.06, 20, 20]} />
              <meshStandardMaterial color="#FFFCF6" roughness={0.4} />
            </mesh>
            <mesh ref={pupilL} position={[0, 0, 0.035]}>
              <sphereGeometry args={[0.033, 16, 16]} />
              <meshStandardMaterial color={INK} roughness={0.3} />
            </mesh>
          </group>
          <mesh ref={closedL} position={[0, 0, 0.065]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.007, 0.075, 4, 8]} />
            <meshStandardMaterial color={INK} transparent opacity={1} />
          </mesh>
        </group>

        <group position={[0.13, 0.03, 0.3]}>
          <group ref={eyeBallR}>
            <mesh>
              <sphereGeometry args={[0.06, 20, 20]} />
              <meshStandardMaterial color="#FFFCF6" roughness={0.4} />
            </mesh>
            <mesh ref={pupilR} position={[0, 0, 0.035]}>
              <sphereGeometry args={[0.033, 16, 16]} />
              <meshStandardMaterial color={INK} roughness={0.3} />
            </mesh>
          </group>
          <mesh ref={closedR} position={[0, 0, 0.065]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.007, 0.075, 4, 8]} />
            <meshStandardMaterial color={INK} transparent opacity={1} />
          </mesh>
        </group>

        <mesh ref={mouthClosed} position={[0, -0.14, 0.46]}>
          <boxGeometry args={[0.08, 0.012, 0.012]} />
          <meshStandardMaterial color={INK} transparent opacity={1} />
        </mesh>

        <mesh ref={mouthSmile} position={[0, -0.11, 0.47]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.075, 0.014, 8, 16, Math.PI]} />
          <meshStandardMaterial color={INK} transparent opacity={0} />
        </mesh>

        <mesh ref={mouthYawn} position={[0, -0.13, 0.47]} scale={[1, 1.3, 0.7]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color={INK} transparent opacity={0} />
        </mesh>
      </group>

      <group position={[0.02, 0.02, 0.3]}>
        <mesh castShadow>
          <sphereGeometry args={[0.11, 20, 20]} />
          <meshStandardMaterial color={FUR_SHADOW} roughness={0.8} />
        </mesh>
      </group>

      <group ref={arm} position={[0.3, 0.02, 0.18]}>
        <mesh castShadow position={[0.1, 0.1, 0]}>
          <capsuleGeometry args={[0.075, 0.2, 4, 12]} />
          <meshStandardMaterial color={FUR} roughness={0.75} />
        </mesh>
        <mesh position={[0.16, 0.2, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={FUR_SHADOW} roughness={0.8} />
        </mesh>
      </group>

      <RoundedBox
        args={[0.44, 0.34, 0.4]}
        radius={0.16}
        smoothness={4}
        position={[0, -0.2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={FUR} roughness={0.78} />
      </RoundedBox>

      <Trail
        width={1.2}
        length={4}
        color={new THREE.Color(PALETTE.softBlueLight)}
        attenuation={(w) => w * w}
      >
        <group position={[0, 0, 0]} />
      </Trail>
    </group>

    <group ref={burstGroup}>
      {Array.from({ length: BURST_COUNT }).map((_, i) => {
        const color = burstColors[i % burstColors.length];
        return (
          <mesh
            key={i}
            ref={(el) => {
              burstMeshRefs.current[i] = el;
            }}
            scale={0}
          >
            <sphereGeometry args={[0.048, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </mesh>
        );
      })}
    </group>
    </>
  );
}
