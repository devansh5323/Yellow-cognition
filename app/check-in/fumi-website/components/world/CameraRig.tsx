"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cameraCurve, progressToCurveU } from "./path";

const WAKE_LOOK = new THREE.Vector3(0.85, 1.3, 1.0);
const UP = new THREE.Vector3(0, 1, 0);

export function CameraRig({
  rawProgressRef,
  dampedProgressRef,
  pointerRef,
  reducedMotion,
}: {
  rawProgressRef: React.MutableRefObject<number>;
  dampedProgressRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
}) {
  const tmpPos = useRef(new THREE.Vector3());
  const tmpTangent = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());

  useFrame(({ camera, clock }, delta) => {
    // damp raw scroll input into a "gliding" progress value; reduced-motion
    // users get a tighter, more directly-responsive damping instead of no motion
    const dampFactor = reducedMotion ? 12 : 3.2;
    dampedProgressRef.current = THREE.MathUtils.damp(
      dampedProgressRef.current,
      rawProgressRef.current,
      dampFactor,
      delta
    );
    const p = dampedProgressRef.current;
    const u = progressToCurveU(p);

    cameraCurve.getPoint(u, tmpPos.current);
    cameraCurve.getTangent(u, tmpTangent.current).normalize();

    // gentle cursor-reactive parallax, eased out once fully immersed past the wake beat
    const parallax = reducedMotion ? 0 : THREE.MathUtils.lerp(0.25, 0.06, THREE.MathUtils.smoothstep(p, 0, 0.3));
    // tiny idle drift so held-still moments don't feel static
    const t = clock.elapsedTime;
    const drift = reducedMotion
      ? 0
      : Math.sin(t * 0.35) * 0.015 + Math.sin(t * 0.9 + 1.3) * 0.008;

    camera.position.set(
      tmpPos.current.x + pointerRef.current.x * parallax,
      tmpPos.current.y + pointerRef.current.y * parallax * 0.5 + drift,
      tmpPos.current.z
    );

    // look-at blends from "gaze at sleeping Fumi" to "look where we're travelling"
    tmpLook.current.copy(tmpPos.current).addScaledVector(tmpTangent.current, 8);
    const wakeBlend = THREE.MathUtils.smoothstep(p, 0.05, 0.16);
    tmpLook.current.lerp(
      new THREE.Vector3(WAKE_LOOK.x, WAKE_LOOK.y, WAKE_LOOK.z),
      1 - wakeBlend
    );

    // bank into turns based on lateral tangent change
    const roll = reducedMotion ? 0 : THREE.MathUtils.clamp(-tmpTangent.current.x * 0.35, -0.18, 0.18);
    const up = UP.clone().applyAxisAngle(tmpTangent.current, roll);
    camera.up.copy(up.lengthSq() > 0.001 ? up : UP);

    camera.lookAt(tmpLook.current);
  });

  return null;
}
