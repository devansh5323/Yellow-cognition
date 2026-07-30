"use client";

import { forwardRef } from "react";
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
  return (
    <group position={position}>
      <Text
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
        ref={ref}
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
