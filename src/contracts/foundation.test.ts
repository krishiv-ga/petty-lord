import { describe, expect, it } from 'vitest';
import { exportState } from '../sim/serialization';
import { createFoundationRasterManifest, resolveFoundationRasterAsset } from './assets';
import { canonicalGameContent, validateGameContent } from './content';
import { isValidSupportRecord } from './domains';
import { projectFoundationContent } from './projection';
import type { DomainModule } from './simulation';
import { advanceScheduler, createKernelRegistry, DAWN_PRIORITY, scheduleItem } from './simulation';
import {
  createFoundationGameState,
  type FoundationDomainExtensions,
  importFoundationGameState,
} from './state';

describe('Wave 2 foundation contracts', () => {
  it('requires the validated immutable canonical registry before state creation', () => {
    const validation = validateGameContent(canonicalGameContent);
    expect(validation.ok).toBe(true);
    expect(Object.isFrozen(canonicalGameContent)).toBe(true);
    expect(Object.isFrozen(canonicalGameContent.lords)).toBe(true);

    const mutableCopy = structuredClone(canonicalGameContent);
    (mutableCopy as { contentHash: string }).contentHash = 'fnv1a64-0000000000000000';
    expect(validateGameContent(mutableCopy)).toMatchObject({ ok: false });
    expect(() =>
      createFoundationGameState({ content: mutableCopy, seed: 'invalid-content' }),
    ).toThrow(/Invalid GameContent/);
  });

  it('initializes deterministic compatibility metadata and round-trips it exactly', () => {
    const first = createFoundationGameState({
      content: canonicalGameContent,
      diagnostics: true,
      seed: 'foundation-contract',
    });
    const second = createFoundationGameState({
      content: canonicalGameContent,
      diagnostics: true,
      seed: 'foundation-contract',
    });
    expect(first).toEqual(second);
    expect(first.compatibility).toEqual({
      buildVersion: '0.1.0-alpha.1',
      contentHash: canonicalGameContent.contentHash,
      contentSchemaVersion: 1,
      saveSchemaVersion: 1,
    });

    const serialized = exportState(first);
    const imported = importFoundationGameState(serialized, { content: canonicalGameContent });
    expect(imported).toEqual({ ok: true, state: first });

    const incompatible = JSON.parse(serialized) as Record<string, unknown>;
    incompatible.compatibility = {
      ...(incompatible.compatibility as Record<string, unknown>),
      contentHash: 'fnv1a64-0000000000000000',
    };
    const rejected = importFoundationGameState(JSON.stringify(incompatible), {
      content: canonicalGameContent,
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) {
      expect(rejected.error.code).toBe('INVALID_STATE');
      expect(rejected.error.issues).toContainEqual({
        message: `must equal ${canonicalGameContent.contentHash}`,
        path: '$.compatibility.contentHash',
      });
    }

    const mirrored = JSON.parse(serialized) as {
      metadata: { values: { contentHash: string } };
    };
    mirrored.metadata.values.contentHash = 'fnv1a64-0000000000000000';
    const rejectedMirror = importFoundationGameState(JSON.stringify(mirrored), {
      content: canonicalGameContent,
    });
    expect(rejectedMirror.ok).toBe(false);
    if (!rejectedMirror.ok) {
      expect(rejectedMirror.error.issues).toContainEqual({
        message: `must equal ${canonicalGameContent.contentHash}`,
        path: '$.metadata.values.contentHash',
      });
    }
  });

  it('advances a fake registered event carrying a stable canonical lord id', () => {
    const module: DomainModule<FoundationDomainExtensions> = {
      id: 'foundation-proof',
      scheduledResolvers: {
        'foundation.proof': ({ item, state }) => ({
          effects: [{ kind: 'foundation.proved', payload: item.payload }],
          state: {
            ...state,
            flags: { ...state.flags, 'proof.edric': true },
          },
        }),
      },
    };
    const initial = createFoundationGameState({
      content: canonicalGameContent,
      seed: 'canonical-id-event',
    });
    const scheduled = scheduleItem(initial, {
      dueTimeHours: 1,
      kind: 'foundation.proof',
      payload: { lordId: 'edric' },
      priority: DAWN_PRIORITY.PLAYER_ORDERS_AND_AI_INTENTS,
    });
    const result = advanceScheduler(scheduled.state, 1, createKernelRegistry([module]));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.flags['proof.edric']).toBe(true);
      expect(result.effects).toEqual([{ kind: 'foundation.proved', payload: { lordId: 'edric' } }]);
    }
  });

  it('projects canonical display identities without exposing mutable state', () => {
    const projection = projectFoundationContent(canonicalGameContent);
    expect(projection.lords.map(({ name }) => name)).toEqual([
      'Lord of Greyfen',
      'Edric',
      'Ysabel',
      'Renard',
      'Oswin',
      'Mara',
    ]);
    expect(projection.territories.map(({ name }) => name)).toEqual([
      'Greyfen',
      'Northkeep',
      'Westmarch',
      'Eastvale',
      'Abbeylands',
      'Southmere',
      'Capital',
    ]);
    expect(Object.isFrozen(projection)).toBe(true);
    expect(Object.isFrozen(projection.lords)).toBe(true);
  });

  it('freezes semantic full/bust/tight slots and fails visibly for a missing slot', () => {
    const manifest = createFoundationRasterManifest(canonicalGameContent);
    expect(Object.keys(manifest)).toHaveLength(15);
    expect(manifest['character.edric.full'].status).toBe('production-master');
    expect(manifest['character.edric.bust'].status).toBe('temporary-master-crop');
    expect(manifest['character.edric.tight'].asset.placeholder).toBe(true);
    expect(manifest['character.edric.full'].contentSlotId).toBe('character-edric-full');
    expect(manifest['character.edric.bust'].contentSlotId).toBe('character-edric-bust');
    expect(manifest['character.edric.tight'].contentSlotId).toBe('character-edric-tight');
    expect(Object.isFrozen(manifest['character.edric.full'].asset.sources)).toBe(true);
    expect(() => {
      (manifest['character.edric.full'].asset.sources[0] as { src: string }).src =
        'data:image/svg+xml,<svg/>';
    }).toThrow();

    const missing = resolveFoundationRasterAsset(manifest, 'character.greyfen.bust');
    expect(missing).toMatchObject({
      available: false,
      asset: { id: 'fixture-missing-raster', placeholder: true },
      warning: 'Missing raster manifest entry: character.greyfen.bust',
    });
  });

  it('prevents resolver replacement after registration', () => {
    const registry = createKernelRegistry<FoundationDomainExtensions>([]);
    expect(Object.isFrozen(registry)).toBe(true);
    expect(Object.isFrozen(registry.scheduledResolvers)).toBe(true);
    expect('set' in registry.scheduledResolvers).toBe(false);
    expect(() => {
      (registry.scheduledResolvers as Map<string, unknown>).set('time.dawn', () => undefined);
    }).toThrow();
  });

  it('represents under duress as pledged coercion metadata, not a vote level', () => {
    expect(
      isValidSupportRecord({
        basis: 'coercion',
        duress: { leverageId: 'secret-1', visibility: 'private' },
        level: 'pledged',
      }),
    ).toBe(true);
    expect(
      isValidSupportRecord({
        basis: 'bargain',
        duress: { leverageId: 'secret-1', visibility: 'public' },
        level: 'committed',
      }),
    ).toBe(false);
  });
});
