export type KnownForceEstimate =
  | {
      readonly kind: 'band';
      readonly maximum: number;
      readonly minimum: number;
      readonly sourceAgeHours: number;
    }
  | { readonly kind: 'exact'; readonly troops: number; readonly sourceAgeHours: number }
  | { readonly kind: 'unknown' };

export interface ForcePreview {
  readonly commanderMultiplier: number;
  readonly defenseMaximum: number | null;
  readonly defenseMinimum: number | null;
  readonly fortificationMultiplier: number;
  readonly fortuneStatement: string;
  readonly knownFactors: string[];
  readonly sourceAgeHours: number | null;
  readonly terrainMultiplier: number;
}

export function projectForcePreview(options: {
  readonly commanderMultiplier: number;
  readonly fortificationMultiplier: number;
  readonly knownDefense: KnownForceEstimate;
  readonly terrainMultiplier: number;
}): ForcePreview {
  const { knownDefense } = options;
  const defenseMinimum =
    knownDefense.kind === 'exact'
      ? knownDefense.troops
      : knownDefense.kind === 'band'
        ? knownDefense.minimum
        : null;
  const defenseMaximum =
    knownDefense.kind === 'exact'
      ? knownDefense.troops
      : knownDefense.kind === 'band'
        ? knownDefense.maximum
        : null;
  const sourceAgeHours = knownDefense.kind === 'unknown' ? null : knownDefense.sourceAgeHours;
  return {
    commanderMultiplier: options.commanderMultiplier,
    defenseMaximum,
    defenseMinimum,
    fortificationMultiplier: options.fortificationMultiplier,
    fortuneStatement:
      'Battlefield fortune is stored at campaign start and remains hidden within 0.92–1.08 until resolution.',
    knownFactors: [
      `commander ×${options.commanderMultiplier.toFixed(2)}`,
      `terrain ×${options.terrainMultiplier.toFixed(2)}`,
      `fortification ×${options.fortificationMultiplier.toFixed(2)}`,
      knownDefense.kind === 'unknown'
        ? 'defense unknown'
        : defenseMinimum === defenseMaximum
          ? `defense ${defenseMinimum}`
          : `defense ${defenseMinimum}–${defenseMaximum}`,
    ],
    sourceAgeHours,
    terrainMultiplier: options.terrainMultiplier,
  };
}
