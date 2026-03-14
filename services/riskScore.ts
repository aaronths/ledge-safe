export type RiskScoreInput = {
  swellHeight: number | null | undefined;
  tideHeight: number | null | undefined;
};

/**
 * Calculates a simple percentage risk score based on combined swell and tide.
 *
 * Risk Score = ((swell + tide) / 4m) * 100, clamped between 0 and 100.
 * If combined height >= 4m, the score is 100%.
 * Returns null if either input is missing or not a finite number.
 */
export function calculateRiskScore({
  swellHeight,
  tideHeight,
}: RiskScoreInput): number | null {
  if (
    typeof swellHeight !== "number" ||
    !Number.isFinite(swellHeight) ||
    typeof tideHeight !== "number" ||
    !Number.isFinite(tideHeight)
  ) {
    return null;
  }

  const combined = swellHeight * 2 + tideHeight;
  const normalized = combined / 3.8;
  const percentage = normalized * 100;

  if (!Number.isFinite(percentage)) return null;

  return Math.max(0, Math.min(percentage, 100));
}
