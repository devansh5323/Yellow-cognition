"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Clouds, Cloud, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import { WorldCaption, type TroikaTextMesh } from "../Typography";
import { ZONES } from "../path";
import { PALETTE } from "../palette";

export function ThresholdZone({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const cloudsGroup = useRef<Group>(null);
  const captionMesh = useRef<TroikaTextMesh>(null);

  useFrame((state) => {
    if (cloudsGroup.current) {
      cloudsGroup.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
    const p = progressRef.current;
    const fadeIn = THREE.MathUtils.smoothstep(p, ZONES.threshold.start, ZONES.threshold.start + 0.04);
    const fadeOut = 1 - THREE.MathUtils.smoothstep(p, ZONES.threshold.end - 0.05, ZONES.threshold.end);
    if (captionMesh.current) captionMesh.current.fillOpacity = fadeIn * fadeOut;
  });

  return (
    <group>
      <WorldCaption ref={captionMesh} position={[-1, 2.6, -4]} fontSize={0.17} color={PALETTE.warmWhite} maxWidth={4}>
        Off into a whole new morning
      </WorldCaption>

      <group ref={cloudsGroup} position={[-1, 1.8, -4]}>
        <Clouds limit={40}>
          <Cloud seed={1} bounds={[3, 1.2, 2]} volume={3} color={PALETTE.warmWhite} opacity={0.6} speed={0.15} fade={30} position={[-2.5, 0.6, -1]} />
          <Cloud seed={2} bounds={[3.5, 1.4, 2]} volume={3.4} color={PALETTE.cream} opacity={0.55} speed={0.12} fade={30} position={[2, -0.2, -3.5]} />
          <Cloud seed={3} bounds={[2.6, 1, 2]} volume={2.6} color={PALETTE.warmWhite} opacity={0.55} speed={0.18} fade={30} position={[-0.5, 1.4, -6]} />
          <Cloud seed={4} bounds={[3, 1.2, 2]} volume={3} color={PALETTE.softBlueLight} opacity={0.5} speed={0.1} fade={30} position={[3, 1.2, -8]} />
        </Clouds>
      </group>

      <Stars radius={26} depth={20} count={700} factor={2.2} fade speed={0.4} />
    </group>
  );
}
