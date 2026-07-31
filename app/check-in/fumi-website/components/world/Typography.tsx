"use client";

import { forwardRef, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { Mesh } from "three";
import { PALETTE } from "./palette";

// troika-three-text sets fillOpacity directly on the mesh instance; drei
// types the Text ref as `any`, so this gives call sites a real shape to use.
export type TroikaTextMesh = Mesh & { fillOpacity: number };

// Floating in-world SDF typography (no DOM cards/rectangles) with a soft
// duplicated back-layer standing in for a drop shadow.
export const WorldHeading = forwardRef<
  TroikaTextMesh,
  {
    children: string;
    position?: [number, number, number];
    fontSize?: number;
    color?: string;
    maxWidth?: number;
    anchorX?: "left" | "center" | "right";
    opacity?: number;
  }
>(function WorldHeading(
  { children, position = [0, 0, 0], fontSize = 0.5, color = PALETTE.ink, maxWidth = 6, anchorX = "center", opacity = 1 },
  ref
) {
  const mainRef = useRef<TroikaTextMesh>(null);
  const shadowRef = useRef<TroikaTextMesh>(null);

  // callers fade the visible text by mutating fillOpacity on the forwarded
  // ref directly (not via the `opacity` prop) — track that live value here so
  // the shadow layer fades in step instead of staying stuck at its initial opacity
  useFrame(() => {
    if (mainRef.current && shadowRef.current) {
      shadowRef.current.fillOpacity = mainRef.current.fillOpacity * 0.12;
    }
  });

  return (
    <group position={position}>
      <Text
        ref={shadowRef}
        position={[0.012, -0.014, -0.02]}
        fontSize={fontSize}
        color="#000000"
        fillOpacity={opacity * 0.12}
        maxWidth={maxWidth}
        anchorX={anchorX}
        anchorY="middle"
      >
        {children}
      </Text>
      <Text
        ref={(el) => {
          mainRef.current = el as TroikaTextMesh | null;
          if (typeof ref === "function") ref(el as TroikaTextMesh | null);
          else if (ref) ref.current = el as TroikaTextMesh | null;
        }}
        fontSize={fontSize}
        color={color}
        fillOpacity={opacity}
        maxWidth={maxWidth}
        anchorX={anchorX}
        anchorY="middle"
      >
        {children}
      </Text>
    </group>
  );
});

export const WorldCaption = forwardRef<
  TroikaTextMesh,
  {
    children: string;
    position?: [number, number, number];
    fontSize?: number;
    color?: string;
    maxWidth?: number;
    anchorX?: "left" | "center" | "right";
    opacity?: number;
  }
>(function WorldCaption(
  { children, position = [0, 0, 0], fontSize = 0.22, color = PALETTE.inkSoft, maxWidth = 3.4, anchorX = "center", opacity = 1 },
  ref
) {
  return (
    <Text
      ref={ref}
      position={position}
      fontSize={fontSize}
      color={color}
      fillOpacity={opacity}
      maxWidth={maxWidth}
      anchorX={anchorX}
      anchorY="middle"
    >
      {children}
    </Text>
  );
});
