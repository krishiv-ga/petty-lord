import { describe, expect, it } from 'vitest';
import type { LordId } from '../../../src/contracts/ids';
import {
  addChurchCondemnation,
  applyChurchPatronage,
  type ChurchCandidateInput,
  churchInputFromClaim,
  completeForgeryPenance,
  considerChurchCandidate,
  createChurchPatronageState,
  resolveChurchEndorsement,
  soleChurchEndorsement,
} from '../../../src/sim/systems/church';
import {
  adjustSafeClaim,
  claimBand,
  claimBandForState,
  claimRating,
  createClaimState,
  exposeForgery,
  hasOswinForgeryRedLine,
  resolveClaimProject,
  resolveRumorConfession,
  startClaimProject,
} from '../../../src/sim/systems/claim';

const churchCandidate = (
  candidateId: LordId,
  overrides: Partial<ChurchCandidateInput> = {},
): ChurchCandidateInput => ({
  candidateId,
  claimRating: 45,
  coercions: [],
  condemnationCauses: [],
  conductFacts: [],
  hasInstitutionalPatronage: true,
  isRenardUndiscreditedFavorite: false,
  oswinSimonyExposed: false,
  oswinSupport: 'pledged',
  stanceCeiling: 'none',
  ...overrides,
});

function forge(startingClaim = 10) {
  const started = startClaimProject(
    createClaimState(startingClaim),
    'forge-royal-descent',
    'ailing',
  );
  if (!started.ok) throw new Error(started.reason);
  const completed = resolveClaimProject(started.state, 'forge-royal-descent');
  if (!completed.ok) throw new Error(completed.reason);
  return completed;
}

describe('Claim', () => {
  it.each([
    [0, 'none'],
    [9, 'none'],
    [10, 'dubious'],
    [24, 'dubious'],
    [25, 'plausible'],
    [44, 'plausible'],
    [45, 'strong'],
    [64, 'strong'],
    [65, 'excellent'],
    [84, 'excellent'],
    [85, 'overwhelming'],
    [100, 'overwhelming'],
  ] as const)('maps exact bounded rating %i to %s', (rating, band) => {
    expect(claimBand(rating)).toBe(band);
  });

  it('clamps creation and safe authored adjustments to the public 0–100 rating', () => {
    expect(claimRating(createClaimState(-40))).toBe(0);
    expect(claimRating(createClaimState(140))).toBe(100);
    expect(claimRating(adjustSafeClaim(createClaimState(95), 12))).toBe(100);
    expect(claimRating(adjustSafeClaim(createClaimState(5), -12))).toBe(0);
    expect(() => createClaimState(1.5)).toThrow(/safe integer/);
  });

  it('runs Research Lineage once, preserving the started state against repeat/save exploits', () => {
    const initial = createClaimState(10);
    const started = startClaimProject(initial, 'research-lineage', 'stable');
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    expect(startClaimProject(started.state, 'research-lineage', 'ailing')).toMatchObject({
      ok: false,
      reason: 'already-started',
    });
    const resolved = resolveClaimProject(structuredClone(started.state), 'research-lineage');
    expect(resolved).toMatchObject({ claimGained: 12, createdSecretId: null, ok: true });
    if (!resolved.ok) return;
    expect(claimRating(resolved.state)).toBe(22);
    expect(resolved.state.researchLineage).toBe('completed');
    expect(resolveClaimProject(resolved.state, 'research-lineage')).toMatchObject({
      ok: false,
      reason: 'project-not-in-progress',
    });
    expect(startClaimProject(resolved.state, 'research-lineage', 'ailing')).toMatchObject({
      ok: false,
      reason: 'already-started',
    });
  });

  it('locks new Claim projects in Deathbed but allows an existing project to finish', () => {
    expect(
      startClaimProject(createClaimState(10), 'forge-royal-descent', 'deathbed'),
    ).toMatchObject({ ok: false, reason: 'deathbed-locked' });
    const started = startClaimProject(createClaimState(10), 'forge-royal-descent', 'gravely-ill');
    if (!started.ok) return;
    expect(resolveClaimProject(started.state, 'forge-royal-descent').ok).toBe(true);
  });

  it('creates one Forgery Evidence secret and keeps fabricated arithmetic exact at the cap', () => {
    const completed = forge(90);
    expect(completed.createdSecretId).toBe('player-forgery-evidence');
    expect(completed.authoredClaimGain).toBe(25);
    expect(completed.claimGained).toBe(10);
    expect(completed.state.fabricatedClaim).toBe(25);
    expect(claimRating(completed.state)).toBe(100);

    const exposed = exposeForgery(completed.state);
    expect(exposed.ok).toBe(true);
    if (!exposed.ok) return;
    expect(exposed.claimRemoved).toBe(20);
    expect(exposed.state.fabricatedClaim).toBe(5);
    expect(claimRating(exposed.state)).toBe(95);
    expect(claimBandForState(exposed.state)).toBe('overwhelming');
  });

  it('applies exact exposure consequences once and activates Oswin fraud exclusion', () => {
    const exposed = exposeForgery(forge().state);
    expect(exposed.ok).toBe(true);
    if (!exposed.ok) return;
    expect(exposed).toMatchObject({
      claimRemoved: 20,
      oswinFraudRedLineActive: true,
      prestigeDelta: -10,
      supportShocks: [
        {
          audience: 'legitimacy-supporters',
          durationDays: 10,
          magnitude: 20,
          shockId: 'forgery-exposed',
        },
        {
          audience: 'other-supporters',
          durationDays: 10,
          magnitude: 10,
          shockId: 'forgery-exposed-other-basis',
        },
      ],
    });
    expect(claimRating(exposed.state)).toBe(15);
    expect(hasOswinForgeryRedLine(exposed.state)).toBe(true);
    expect(exposeForgery(exposed.state)).toMatchObject({
      ok: false,
      reason: 'forgery-already-exposed',
    });
  });

  it('supports only the authored cheaper pre-exposure Rumor confession', () => {
    const confessed = resolveRumorConfession(forge().state);
    expect(confessed).toMatchObject({ claimRemoved: 12, ok: true, prestigeDelta: -5 });
    if (!confessed.ok) return;
    expect(claimRating(confessed.state)).toBe(23);
    expect(confessed.state.forgeryEvidence).toBe('absent');
    expect(exposeForgery(confessed.state)).toMatchObject({
      ok: false,
      reason: 'no-forgery-evidence',
    });
  });
});

describe('Church consideration and patronage', () => {
  it('grants the institutional and Oswin benefits once, then only the late repeat relationship effect', () => {
    const initial = createChurchPatronageState();
    const first = applyChurchPatronage(initial, { completionDay: 5.5, source: 'patronize-action' });
    expect(first).toMatchObject({
      institutionalCaseDelta: 1,
      ok: true,
      oswinRelationshipDelta: 8,
    });
    if (!first.ok) return;
    expect(
      applyChurchPatronage(first.state, { completionDay: 26.49, source: 'patronize-action' }),
    ).toMatchObject({ ok: false, reason: 'patronage-cooldown' });
    const repeated = applyChurchPatronage(first.state, {
      completionDay: 26.5,
      source: 'patronize-action',
    });
    expect(repeated).toMatchObject({
      institutionalCaseDelta: 0,
      ok: true,
      oswinRelationshipDelta: 3,
    });
  });

  it('does not double-stack Abbey Endowment with prior Patronage', () => {
    const patronized = applyChurchPatronage(createChurchPatronageState(), {
      completionDay: 3,
      source: 'patronize-action',
    });
    if (!patronized.ok) return;
    const endowed = applyChurchPatronage(patronized.state, {
      completionDay: 4,
      source: 'abbey-endowment',
    });
    expect(endowed).toMatchObject({
      institutionalCaseDelta: 0,
      ok: true,
      oswinRelationshipDelta: 0,
    });
    if (!endowed.ok) return;
    expect(
      applyChurchPatronage(endowed.state, {
        completionDay: 7,
        source: 'abbey-endowment',
      }),
    ).toMatchObject({ ok: false, reason: 'abbey-endowment-already-applied' });
  });

  it('calculates exact Claim, Oswin, Patronage, lawful conduct and Favorite case components', () => {
    const candidate = churchCandidate('renard', {
      claimRating: 72,
      conductFacts: ['defended-abbeylands', 'funeral-observance', 'broke-kings-peace'],
      isRenardUndiscreditedFavorite: true,
      oswinSupport: 'committed',
    });
    const considered = considerChurchCandidate(candidate, 'ailing');
    expect(considered.caseScore).toBe(4 + 4 + 1 + 1 + 1);
    expect(considered.eligibleForEndorsement).toBe(true);
    expect(considered.stance).toBe('favorable');

    const simony = considerChurchCandidate({ ...candidate, oswinSimonyExposed: true }, 'ailing');
    expect(simony.caseScore).toBe(9);
    expect(simony.reasons.find((reason) => reason.category === 'oswin')).toMatchObject({
      score: 2,
    });
  });

  it('normalizes supplied Claim before Church comparison and explains a capped conduct case', () => {
    const considered = considerChurchCandidate(
      churchCandidate('edric', {
        claimRating: 500,
        conductFacts: [
          'usurper',
          'edric-border-massacre',
          'stable-defiance',
          'broke-kings-peace',
          'denounced-central-rule-capital-penalty',
        ],
      }),
      'ailing',
    );
    expect(considered.claimRating).toBe(100);
    expect(considered.reasons.find((reason) => reason.code === 'lawful-conduct-clamp')).toEqual({
      category: 'conduct',
      code: 'lawful-conduct-clamp',
      score: 1,
    });
    expect(considered.caseScore).toBe(5 + 2 + 1 - 6);
  });

  it('keeps Oswin distinct from the institution and withholds an exact unresolved tie', () => {
    const edric = churchCandidate('edric');
    const greyfen = churchCandidate('greyfen');
    const withheld = resolveChurchEndorsement({
      candidates: [edric, greyfen],
      oswinPreferredCandidateId: null,
      phase: 'ailing',
      previousEndorsementId: null,
    });
    expect(withheld.endorsedCandidateId).toBeNull();
    expect(withheld.reason).toBe('tie-withheld');

    const oswinBreaksTie = resolveChurchEndorsement({
      candidates: [edric, greyfen],
      oswinPreferredCandidateId: 'greyfen',
      phase: 'ailing',
      previousEndorsementId: null,
    });
    expect(oswinBreaksTie.endorsedCandidateId).toBe('greyfen');
    expect(oswinBreaksTie.reason).toBe('oswin-preference');
    expect(soleChurchEndorsement(oswinBreaksTie.cases)).toBe('greyfen');
  });

  it('breaks equal case by exact Claim before consulting Oswin', () => {
    const result = resolveChurchEndorsement({
      candidates: [
        churchCandidate('edric', { claimRating: 45 }),
        churchCandidate('greyfen', { claimRating: 64 }),
      ],
      oswinPreferredCandidateId: 'edric',
      phase: 'ailing',
      previousEndorsementId: null,
    });
    expect(result.endorsedCandidateId).toBe('greyfen');
    expect(result.reason).toBe('higher-claim');
  });

  it('never endorses before Ailing and deterministically withdraws or transfers on reconsideration', () => {
    const greyfen = churchCandidate('greyfen');
    const stable = resolveChurchEndorsement({
      candidates: [greyfen],
      oswinPreferredCandidateId: 'greyfen',
      phase: 'stable',
      previousEndorsementId: null,
    });
    expect(stable.endorsedCandidateId).toBeNull();
    expect(stable.reason).toBe('before-ailing');

    const transferred = resolveChurchEndorsement({
      candidates: [
        { ...greyfen, condemnationCauses: ['abbeylands-attacked'] },
        churchCandidate('edric', { claimRating: 65, oswinSupport: 'committed' }),
      ],
      oswinPreferredCandidateId: 'edric',
      phase: 'gravely-ill',
      previousEndorsementId: 'greyfen',
    });
    expect(transferred.endorsedCandidateId).toBe('edric');
    expect(transferred.change).toBe('transferred');
    expect(transferred.cases.find((entry) => entry.candidateId === 'greyfen')?.stance).toBe(
      'condemned',
    );

    const withdrawn = resolveChurchEndorsement({
      candidates: [{ ...greyfen, claimRating: 24 }],
      oswinPreferredCandidateId: 'greyfen',
      phase: 'deathbed',
      previousEndorsementId: 'greyfen',
    });
    expect(withdrawn.endorsedCandidateId).toBeNull();
    expect(withdrawn.change).toBe('withdrawn');
  });

  it('blocks two public coercions while keeping institutionally secret blackmail hidden', () => {
    const privateBlackmail = (id: string) => ({
      active: true,
      id,
      knownToChurch: false,
      visibility: 'secret' as const,
    });
    const hidden = considerChurchCandidate(
      churchCandidate('greyfen', {
        coercions: [privateBlackmail('blackmail-1'), privateBlackmail('blackmail-2')],
      }),
      'ailing',
    );
    expect(hidden.knownCoercedPledges).toBe(0);
    expect(hidden.eligibleForEndorsement).toBe(true);

    const publicCoercion = (id: string) => ({
      active: true,
      id,
      knownToChurch: false,
      visibility: 'public' as const,
    });
    const blocked = considerChurchCandidate(
      churchCandidate('greyfen', {
        coercions: [publicCoercion('occupation-1'), publicCoercion('military-2')],
      }),
      'ailing',
    );
    expect(blocked.knownCoercedPledges).toBe(2);
    expect(blocked.eligibleForEndorsement).toBe(false);
    expect(blocked.endorsementBlocks).toContain('two-known-coerced-pledges');

    const discoveredSecret = considerChurchCandidate(
      churchCandidate('greyfen', {
        coercions: [
          { ...privateBlackmail('blackmail-1'), knownToChurch: true },
          publicCoercion('occupation-1'),
        ],
      }),
      'ailing',
    );
    expect(discoveredSecret.knownCoercedPledges).toBe(2);
    expect(discoveredSecret.eligibleForEndorsement).toBe(false);
  });
});

describe('Forgery condemnation and Penance', () => {
  it('matches the complete Research → Forge → Exposure → Penance arithmetic', () => {
    const researchStarted = startClaimProject(createClaimState(10), 'research-lineage', 'stable');
    if (!researchStarted.ok) return;
    const researched = resolveClaimProject(researchStarted.state, 'research-lineage');
    if (!researched.ok) return;
    expect(claimRating(researched.state)).toBe(22);

    const forgeStarted = startClaimProject(researched.state, 'forge-royal-descent', 'ailing');
    if (!forgeStarted.ok) return;
    const forged = resolveClaimProject(forgeStarted.state, 'forge-royal-descent');
    if (!forged.ok) return;
    expect(claimRating(forged.state)).toBe(47);

    const exposed = exposeForgery(forged.state);
    if (!exposed.ok) return;
    expect(claimRating(exposed.state)).toBe(27);

    const condemned = addChurchCondemnation(
      churchInputFromClaim(churchCandidate('greyfen'), exposed.state),
      'exposed-forgery',
    );
    const penance = completeForgeryPenance({
      church: condemned,
      claim: exposed.state,
      costPaidAtStart: true,
    });
    if (!penance.ok) return;
    expect(claimRating(penance.claim)).toBe(27);
    expect(penance.prestigeDelta).toBe(-5);
    expect(considerChurchCandidate(penance.church, 'ailing').stance).toBe('skeptical');
  });

  it('repairs only exposed fraud with exact costs and no Claim, trust, relationship or support repair', () => {
    const exposed = exposeForgery(forge().state);
    if (!exposed.ok) return;
    const church = addChurchCondemnation(
      churchInputFromClaim(churchCandidate('greyfen'), exposed.state),
      'exposed-forgery',
    );
    expect(considerChurchCandidate(church, 'ailing').stance).toBe('condemned');

    const penance = completeForgeryPenance({
      church,
      claim: exposed.state,
      costPaidAtStart: true,
    });
    expect(penance.ok).toBe(true);
    if (!penance.ok) return;
    expect(penance.prestigeDelta).toBe(-5);
    expect(penance.restored).toEqual({ claim: 0, relationship: 0, support: 0, trust: 0 });
    expect(claimRating(penance.claim)).toBe(15);
    expect(hasOswinForgeryRedLine(penance.claim)).toBe(false);
    expect(penance.oswinFraudRedLineActive).toBe(false);
    const reconsidered = considerChurchCandidate(penance.church, 'ailing');
    expect(reconsidered.stance).toBe('skeptical');
    expect(reconsidered.eligibleForEndorsement).toBe(false);
    expect(reconsidered.endorsementBlocks).toContain('post-penance-skeptical-ceiling');
  });

  it('cannot use Penance before exposure, twice, or when start costs were not paid', () => {
    const forged = forge().state;
    const baseChurch = churchInputFromClaim(churchCandidate('greyfen'), forged);
    expect(
      completeForgeryPenance({
        church: baseChurch,
        claim: forged,
        costPaidAtStart: true,
      }),
    ).toEqual({ ok: false, reason: 'fraud-condemnation-not-active' });

    const exposed = exposeForgery(forged);
    if (!exposed.ok) return;
    const condemned = addChurchCondemnation(
      churchInputFromClaim(churchCandidate('greyfen'), exposed.state),
      'exposed-forgery',
    );
    expect(
      completeForgeryPenance({
        church: condemned,
        claim: exposed.state,
        costPaidAtStart: false,
      }),
    ).toEqual({ ok: false, reason: 'start-cost-not-paid' });

    const completed = completeForgeryPenance({
      church: condemned,
      claim: exposed.state,
      costPaidAtStart: true,
    });
    if (!completed.ok) return;
    expect(
      completeForgeryPenance({
        church: completed.church,
        claim: completed.claim,
        costPaidAtStart: true,
      }),
    ).toEqual({ ok: false, reason: 'fraud-condemnation-not-active' });
  });

  it('Penance removes only fraud condemnation and cannot erase an Abbeylands attack', () => {
    const exposed = exposeForgery(forge().state);
    if (!exposed.ok) return;
    let church = churchInputFromClaim(churchCandidate('greyfen'), exposed.state);
    church = addChurchCondemnation(church, 'exposed-forgery');
    church = addChurchCondemnation(church, 'abbeylands-attacked');
    const penance = completeForgeryPenance({
      church,
      claim: exposed.state,
      costPaidAtStart: true,
    });
    if (!penance.ok) return;
    expect(penance.church.condemnationCauses).toEqual(['abbeylands-attacked']);
    expect(considerChurchCandidate(penance.church, 'ailing').stance).toBe('condemned');
  });
});
