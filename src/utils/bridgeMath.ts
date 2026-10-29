/**
 * Mathematical models and geometric specifications for Ise Jingu Uji Bridge
 */

export const BRIDGE_SPECS = {
  name: '伊勢神宮 皇大神宮（内宮）宇治橋',
  actualLengthMeters: 101.8,
  modelLengthMeters: 92.0,
  deckWidthMeters: 8.44,
  walkwayClearWidthMeters: 7.30,
  cantileverOverhangMeters: 0.57,
  archRiseMeters: 2.55,
  baseElevationMeters: 4.40,
  piersCount: 11,
  columnsPerPier: 4,
  giboshiCount: 16,
  woodType: '国産檜（ヒノキ）',
  rebuildCycleYears: 20,
};

export const HALF_LEN = BRIDGE_SPECS.modelLengthMeters / 2; // 46.0m
export const RAIL_CENTER_Z = 3.65;      // Center Z of handrails (7.3m width)
export const DECK_OUTER_Z = 4.22;       // Outer edge of overhanging deck planks (8.44m total width)
export const BASE_Y = BRIDGE_SPECS.baseElevationMeters;
export const ARCH_RISE = BRIDGE_SPECS.archRiseMeters;

/**
 * Calculates the deck elevation Y at position X along the bridge axis.
 * Uses the parabolic arch curve of the traditional Japanese wooden sori-bashi.
 */
export function getBridgeY(x: number): number {
  if (Math.abs(x) >= HALF_LEN) {
    return BASE_Y;
  }
  const u = x / HALF_LEN;
  return BASE_Y + ARCH_RISE * (1 - u * u);
}

/**
 * Calculates the longitudinal pitch angle (in radians) of the bridge at position X.
 * Tangent slope: dy/dx = -2 * ARCH_RISE * x / (HALF_LEN^2)
 */
export function getBridgePitch(x: number): number {
  if (Math.abs(x) >= HALF_LEN || x === 0) {
    return 0;
  }
  const dy_dx = (-2 * ARCH_RISE * x) / (HALF_LEN * HALF_LEN);
  return Math.atan(dy_dx) || 0;
}

/**
 * Calculates vertical clearance above the river water surface at position X.
 */
export function getClearanceHeight(x: number, waterSurfaceY: number = 0.38): number {
  const deckBottomY = getBridgeY(x) - 0.72; // Deck + longitudinal girder bottom
  return Math.max(0, deckBottomY - waterSurfaceY);
}

/**
 * Calculates the walk position along the right-hand lane during walkthrough.
 * At Ise Jingu Naiku, worshipers walk strictly on the right side ("右側通行").
 * East approach (+X) -> West approach (-X).
 */
export function getWalkthroughCoords(progressT: number): {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
} {
  const clampedT = Math.max(0, Math.min(1, progressT));
  const curX = 56.0 - clampedT * 112.0; // from +56m (East Torii) to -56m (West Torii)
  const lookX = curX - 6.0;
  
  const clampedCurX = Math.max(-HALF_LEN, Math.min(HALF_LEN, curX));
  const clampedLookX = Math.max(-HALF_LEN, Math.min(HALF_LEN, lookX));

  const eyeHeight = 1.65;
  const curY = getBridgeY(clampedCurX) + eyeHeight;
  const lookY = getBridgeY(clampedLookX) + eyeHeight - 0.10;
  
  // Right-hand lane offset relative to walking direction (walking in -X direction means lane is at -Z)
  const rightLaneZ = -1.65;

  return {
    position: { x: curX, y: curY, z: rightLaneZ },
    target: { x: lookX, y: lookY, z: rightLaneZ },
  };
}
