"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PALETTE } from "./palette";
import { CameraRig } from "./CameraRig";
import { WorldLighting } from "./WorldLighting";
import { FumiCompanion, type CareActionEvent } from "./FumiCompanion";
import { BedroomZone } from "./zones/BedroomZone";
import { ThresholdZone } from "./zones/ThresholdZone";
import { PlayIslands } from "./zones/PlayIslands";
import { CareZone } from "./zones/CareZone";
import { GrowthGarden } from "./zones/GrowthGarden";
import { ConsequencesZone } from "./zones/ConsequencesZone";
import { ParentObservatory } from "./zones/ParentObservatory";

export function WorldCanvas({
  rawProgressRef,
  careActionRef,
  revivedRef,
  reducedMotion,
}: {
  rawProgressRef: React.MutableRefObject<number>;
  careActionRef: React.MutableRefObject<CareActionEvent | null>;
  revivedRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const dampedProgressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerActiveRef = useRef(false);

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      pointerActiveRef.current = true;
      pointerRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    }
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.55, 3.4], fov: 50 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[PALETTE.cream]} />
      <fog attach="fog" args={[PALETTE.cream, 9, 42]} />

      <WorldLighting progressRef={dampedProgressRef} revivedRef={revivedRef} />
      <CameraRig
        rawProgressRef={rawProgressRef}
        dampedProgressRef={dampedProgressRef}
        pointerRef={pointerRef}
        reducedMotion={reducedMotion}
      />

      <Suspense fallback={null}>
        <BedroomZone progressRef={dampedProgressRef} />
        <ThresholdZone progressRef={dampedProgressRef} />
        <PlayIslands progressRef={dampedProgressRef} />
        <CareZone progressRef={dampedProgressRef} />
        <GrowthGarden progressRef={dampedProgressRef} />
        <ConsequencesZone progressRef={dampedProgressRef} revivedRef={revivedRef} />
        <ParentObservatory progressRef={dampedProgressRef} />
        <FumiCompanion
          progressRef={dampedProgressRef}
          pointerRef={pointerRef}
          pointerActiveRef={pointerActiveRef}
          careActionRef={careActionRef}
          revivedRef={revivedRef}
          reducedMotion={reducedMotion}
        />
      </Suspense>

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.4} luminanceThreshold={0.95} luminanceSmoothing={0.1} mipmapBlur radius={0.35} />
      </EffectComposer>
    </Canvas>
  );
}
