import * as THREE from "three";

// Shared t-range (0..1 overall scroll progress) boundaries for each zone/beat,
// and the hand-authored camera waypoints the whole journey is built from.
// Every zone/character file positions itself relative to these so the camera
// path, the islands, and Fumi's travel all agree on the same world.
export const ZONES = {
  wake: { start: 0, end: 0.1 },
  threshold: { start: 0.1, end: 0.22 },
  play: { start: 0.22, end: 0.44 },
  care: { start: 0.44, end: 0.62 },
  grow: { start: 0.62, end: 0.78 },
  parents: { start: 0.78, end: 0.92 },
  goodnight: { start: 0.92, end: 1 },
} as const;

// Camera position waypoints, t-ordered. Forward travel is -Z.
const CAMERA_WAYPOINTS: [number, number, number][] = [
  [0, 1.55, 3.4], // 0.00 wider establishing shot on sleeping Fumi
  [0.0, 1.55, 3.4], // 0.07 pulling back, framing the bed + window
  [-1.5, 1.9, -0.5], // 0.13 passing through the window frame
  [-1.0, 2.3, -6.5], // 0.19 open sky, islands ahead
  [-1.6, 2.1, -13], // 0.27 island 1 — Focus Maze
  [1.6, 2.0, -20], // 0.35 island 2 — Memory Match
  [-1.2, 2.0, -27], // 0.42 island 3 — Task Switch
  [0.3, 1.8, -33], // 0.5 care nook — entering
  [0.3, 1.7, -38], // 0.58 care nook — lingering
  [0.6, 2.2, -46], // 0.66 growth garden — arriving
  [1.0, 2.6, -50], // 0.74 growth garden — gentle orbit as she evolves
  [0.2, 3.4, -58], // 0.8 rising toward the observatory
  [0.3, 4.5, -68], // 0.87 orbiting the observatory dais
  [0.0, 4.3, -74], // 0.95 settling
  [0.0, 4.1, -75.5], // 1.00 goodnight
];
const CAMERA_T = [0, 0.07, 0.13, 0.19, 0.27, 0.35, 0.42, 0.5, 0.58, 0.66, 0.74, 0.8, 0.87, 0.95, 1];

export const cameraCurve = new THREE.CatmullRomCurve3(
  CAMERA_WAYPOINTS.map((p) => new THREE.Vector3(...p)),
  false,
  "catmullrom",
  0.5
);

// Non-uniform t → uniform arc-length u lookup so getPointAt(progress) tracks
// the hand-authored pacing above rather than the curve's own uniform param.
export function progressToCurveU(progress: number): number {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  for (let i = 0; i < CAMERA_T.length - 1; i++) {
    const t0 = CAMERA_T[i];
    const t1 = CAMERA_T[i + 1];
    if (p >= t0 && p <= t1) {
      const local = t1 > t0 ? (p - t0) / (t1 - t0) : 0;
      const uSpan = 1 / (CAMERA_T.length - 1);
      return i * uSpan + local * uSpan;
    }
  }
  return 1;
}

// World-space anchor points for each island / zone's set dressing.
export const ISLAND_FOCUS_MAZE = new THREE.Vector3(-2.2, 1.6, -13);
export const ISLAND_MEMORY_MATCH = new THREE.Vector3(2.2, 1.5, -20);
export const ISLAND_TASK_SWITCH = new THREE.Vector3(-1.8, 1.5, -27);
// kept well clear of the camera path (which runs near x=0.3, y=1.7-1.8
// through this stretch) so no prop ever ends up at point-blank range
export const CARE_NOOK_POS = new THREE.Vector3(-1.9, 1.0, -35.5);
// well clear of the camera's orbit through this stretch (waypoints run
// roughly x=0.6-1.0, y=2.2-2.6, z=-46..-50) so the evolving figure is never
// at point-blank range as the camera passes
export const GROWTH_GARDEN_POS = new THREE.Vector3(2.3, 1.5, -48);
export const OBSERVATORY_POS = new THREE.Vector3(2.0, 2.2, -68);

export const BED_POS = new THREE.Vector3(0.85, 0.86, 1.05);

// Floor-level spot Fumi wanders around once awake, before the user starts
// scrolling her out into the journey — kept at roughly the same
// camera-distance as BED_POS so waking doesn't read as a sudden zoom.
export const WANDER_CENTER = new THREE.Vector3(0.25, 0.34, 1.25);
export const WANDER_RADIUS = 0.45;

// Approximate overall-progress centers where each island is directly in frame
// (matches the camera waypoints above) — used for "tell" moments (ear perk,
// emissive pulse) that fire just as each island takes center stage.
export const ISLAND_T_CENTERS = [0.27, 0.35, 0.42];
