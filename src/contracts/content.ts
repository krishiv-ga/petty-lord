import type { CanonicalContentPack, ImmutableContentRegistry } from '../content';
import { canonicalContentRegistry, hashCanonicalContent, loadCanonicalContent } from '../content';

export type GameContent = ImmutableContentRegistry;

export const canonicalGameContent: GameContent = canonicalContentRegistry;

export type GameContentValidation =
  | { readonly content: GameContent; readonly ok: true }
  | { readonly issues: readonly string[]; readonly ok: false };

function isDeepFrozen(value: unknown, visited = new Set<object>()): boolean {
  if (value === null || typeof value !== 'object' || visited.has(value)) return true;
  visited.add(value);
  return (
    Object.isFrozen(value) && Object.values(value).every((child) => isDeepFrozen(child, visited))
  );
}

export function validateGameContent(value: unknown): GameContentValidation {
  try {
    const candidate = value as Partial<GameContent>;
    const { contentHash: suppliedHash, ...pack } = candidate;
    const content = loadCanonicalContent(pack);
    const issues: string[] = [];

    if (suppliedHash !== content.contentHash) {
      issues.push(
        `Content hash mismatch: expected ${content.contentHash}, received ${String(suppliedHash)}`,
      );
    }
    if (!isDeepFrozen(value)) {
      issues.push('GameContent must be recursively immutable before state initialization.');
    }

    return issues.length === 0
      ? { content: value as GameContent, ok: true }
      : { issues, ok: false };
  } catch (error) {
    return {
      issues: [error instanceof Error ? error.message : 'Content failed canonical validation.'],
      ok: false,
    };
  }
}

export function requireGameContent(value: unknown): GameContent {
  const validated = validateGameContent(value);
  if (!validated.ok) {
    throw new Error(`Invalid GameContent: ${validated.issues.join(' | ')}`);
  }
  return validated.content;
}

export function contentHashFor(pack: CanonicalContentPack): string {
  return hashCanonicalContent(pack);
}
