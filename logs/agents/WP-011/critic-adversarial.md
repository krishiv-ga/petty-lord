# Agent Log — WP-011 — Critic/Adversarial

- **Packet:** WP-011 Content Schema and Canonical Data Pack
- **Role:** Critic
- **Branch/worktree:** `wp/WP-011-content-schema-and-canonical-data`
- **Starting revision:** `5c154a87e899e924dc6c4f0395dad960b3367578`
- **Ending revision:** revised staged candidate at `fnv1a64-63997bc7fc55c12b`; no critic production edits
- **PR:** pending
- **Status:** Clear after re-review

## Scope

Owned path:

- `logs/agents/WP-011/critic-adversarial.md`

Reviewed but did not modify:

- staged WP-011 implementation under `src/content/**`
- staged owned wiki pages and implementer evidence
- the complete canonical design package, including all four paperplay passes and final amendments

Explicitly out of scope:

- production fixes, simulation behavior, UI, shared configuration, packet status and compacted logs

## Review method

- Confirmed Wave 1 is open in the latest compacted log and that the staged diff stays inside WP-011 owned paths.
- Read the packet and canonical inputs before reading the implementer log.
- Inspected the refreshed staged index rather than relying on the worktree or implementer summary.
- Compared the data against the final parent design files, not superseded paperplay values.
- Ran the focused and standard gates plus custom in-memory mutations against the canonical loader.

## Ranked findings

| Severity | Location | Finding and evidence | Expected behavior / impact | Recommended resolution |
|---|---|---|---|---|
| **P1** | `src/content/narrative.ts:96`, `src/content/narrative.ts:498`, `src/content/schemas.ts:57`, `src/content/loader.ts:401`, `src/content/loader.ts:519` | The canonical pack contains unresolved or type-invalid effect references while the validation summary hard-codes `unresolvedReferences: []`. E14 schedules `penitent-repair`, but no such follow-up decision exists. Oswin Simony performs `set-church-state` with `simony-reduced-oswin-modifier`, which is not a Church state and does not apply the authored durable `oswin-simony` condition. The loader validates only source-mapping entity IDs, not effect-specific references. An adversarial mutation changing Forge's `create-secret` reference to `missing-secret` was accepted by `loadCanonicalContent`. | Every structured effect and scheduled decision must resolve through a legal typed target/reference. The present pack can produce an impossible E14 follow-up and an invalid Simony transition; its required “zero unresolved references” evidence is false. WP-019 would have to invent hidden event-specific behavior. | Replace the generic `referenceId` escape hatch with effect-discriminated schemas or validated typed reference catalogs. Validate scheduled-decision IDs against authored follow-ups. Encode penitent repair as a complete scheduled effect/decision. Encode Simony as a durable condition plus explicit Church recalculation, and make the summary derive unresolved references rather than returning empty arrays. |
| **P1** | `src/content/narrative.ts:43`, `src/content/narrative.ts:54`, `src/content/narrative.ts:65`, `src/content/narrative.ts:76`, `src/content/narrative.ts:85`, `src/content/narrative.ts:114`, `src/content/rules.ts:194` | Almost every authored secret shock is labeled `forgery-exposed`. That shock is defined as value 20 and filtered to the `legitimacy` basis. This contradicts the secret table: Foreign Concession must shock Edric 20 regardless of legitimacy basis; Border Massacre must shock Edric-candidate Pledges 10; Tax Embezzlement must shock Ysabel's Opportunistic Pledge 10; Bought Testament must shock all voluntary Renard Pledges 10. Player Forgery applies only an Oswin shock, omitting the canonical 20-for-Legitimacy / 10-otherwise shocks to other supporters. | Secret exposure is a decisive intrigue route and must alter exactly the authored support records. Reusing the Forgery shock's basis filter suppresses several consequences and can change ballots, Pledge breaks and Renard containment. | Author dedicated shock definitions or effect-local shock values/basis selectors for each secret consequence. Encode the two-tier player-Forgery shock explicitly. Add tests that inspect every secret's affected supporter set, basis filter, value and expiry instead of checking only pool/count metadata. |
| **P1** | `src/content/schemas.ts:261`, `src/content/schemas.ts:277`, `src/content/schemas.ts:280`, `src/content/rules.ts:67`, `src/content/rules.ts:82`, `src/content/rules.ts:442`, `src/content/content.test.ts:217` | The exact candidate-evaluation contract is incomplete and partly ambiguous. The schema/data omit the authored relationship divisor/clamp, bargain values (0/8/12/20/25), current-Leaning tie retention and exact no-Leaning tie chain. Ysabel's Serious fear is stored as base `-6` plus a generic condition value `+4`, but no replacement/addition mode says that active protection must produce canonical `+4` (addition would produce `-2`). Viability multipliers are duplicated in evaluations and constants without an equality invariant; changing Ysabel's evaluation multiplier to 2 while leaving the canonical 1.25 constant was accepted. The “opening unit test” merely asserts pre-authored `initialSupport`, so it does not prove the evaluation tables yield the four canonical opening outcomes. | `candidate-evaluation.md` exists specifically to prevent downstream agents from inventing half the political game. The current registry leaves material interpretation choices to WP-019 and permits internally contradictory canonical values. | Add a typed general evaluation contract with relationship, bargain, hysteresis and exact tie semantics; model conditional fear as an explicit replacement rule; keep each value in one canonical place or cross-check duplicates. Add a pure data evaluator/test fixture that derives Ysabel/Oswin/Edric/Mara opening outcomes from the registry rather than echoing `initialSupport`. |
| **P2** | `src/content/actions.ts:80`, `src/content/actions.ts:86`, `src/content/actions.ts:275`, `src/content/actions.ts:289` | Action transcription is not complete. Offer Bargain remains 2 days in Deathbed even though the locked phase rule reduces diplomacy by one day. Raise Taxes exposes only generic result IDs and a 21-day repeat window; it does not encode the first-use 14 days of gross income, second-use 7 days, Strain-to-Unrest escalation, or both 21-day condition durations. | Every action must have canonical duration and structured results in content; later handlers should resolve data, not reopen the design documents or hard-code missing numbers. The current Deathbed bargain timing is directly wrong, and Raise Taxes cannot be implemented from the pack alone. | Set Offer Bargain's Deathbed duration to 1. Add explicit typed Raise Taxes branches/variants with eligibility, income-day advances, condition replacement and durations. Audit the other actions for similarly hidden variant results (gift refusal, Watch Court freshness, new-leverage Threaten exception). |
| **P2** | `src/content/schemas.ts:308`, `src/content/schemas.ts:348`, `src/content/loader.ts:302`, `src/content/loader.ts:519` | Cross-field validation remains weaker than the advertised complete audit. A weighted random outcome with three values and one weight passed the loader. An opening whose four-entry additional-secret pool repeated the same secret four times also passed. The summary's numeric warnings, missing text and missing asset arrays are constants rather than computed audit output. | Invalid authored data should fail at the canonical loader, and the validation report should describe the registry it actually audited. Mismatched weighted choices are unresolvable; duplicate pools can delete the promised additional-NPC coverage. | Enforce values/weights cardinality and distribution-specific rules; require unique/full additional-secret pools; compute report fields from the same audit or remove claims the report does not calculate. Add mutation regressions. |
| **P2** | `src/content/schemas.ts:382`, `src/content/schemas.ts:385`, `src/content/schemas.ts:386`, `src/content/content.test.ts:306` | Raster source rejection can be bypassed by leading whitespace. Both `" data:image/svg+xml,%3Csvg%3E.png"` and `" icon-font:crown.png"` passed `rasterAssetSourceSchema`; current tests cover only unpadded examples. | The packet explicitly requires SVG data URIs and icon-font references to be rejected without loopholes. | Trim/normalize before all checks (or reject surrounding whitespace), forbid all data URIs if they are unnecessary, and test padded/mixed-encoding forms. |

## Acceptance tests independently verified

| Acceptance area | Result | Notes |
|---|---|---|
| Legal packet/owned paths | Pass | Wave 1 open; staged files are restricted to packet-owned content, wiki and agent-log paths. |
| Six lords / seven territories / symmetric topology | Pass | Exact launch counts and canonical adjacency match; asymmetric mutation is rejected. |
| Eleven base families and contextual action IDs | Partial | All families/IDs exist, but Offer Bargain Deathbed duration and Raise Taxes result data are incomplete. |
| Acceptance-time collateral | Pass with integration caution | Bargain collateral is acceptance-only. Patronize/Endowment both use `church-patronage`; the first-relationship guard remains an unvalidated magic reference and should become an effect-specific rule as part of P1 reference repairs. |
| Public force vs private blackmail | Pass | Threaten's visibility variants distinguish public Under Duress from party-private blackmail and keep the latter publicly Pledged. |
| Renard intrigue guarantee | Pass | Every opening names all three Renard secrets and two from the four additional-NPC pool; loader rejects wrong-pool members, though duplicate-pool validation is missing. |
| Sixteen events and Merchant repayment/default | Partial | Counts, windows and loan follow-up are present; E14's scheduled `penitent-repair` is unresolved and random cross-fields are under-validated. |
| Candidate-evaluation fidelity | Fail | Candidate-specific tables mostly match, but the general exact contract, Ysabel fear semantics and derived opening checks are missing. |
| Secret/evidence consequences | Fail | Shock IDs/basis filters conflict with the canonical secret table and player Forgery omits general supporter shocks. |
| Asset slots/raster-only formats | Partial | 81 required-style slots exist and ordinary `.svg`/SVG data URI/icon-font inputs are rejected; padded forbidden references bypass the schema. |
| Hash and immutability | Pass | Two independent loads produced `fnv1a64-ff2b9fb98874eef2`; recursive freeze and serializability checks passed. |
| No executable content closures | Pass | Adversarial closure injection is rejected before Zod parsing. |
| Wiki/reference pages | Pass mechanically | Owned pages build and links resolve; their “zero unresolved” claim inherits the loader defect above. |

## Tests and evidence run

| Command/check | Result | Evidence/notes |
|---|---|---|
| `git diff --cached --check` | Pass | No whitespace errors in refreshed staged candidate. |
| `pnpm exec vitest run src/content/content.test.ts` | Pass | 15/15; snapshot hash `fnv1a64-ff2b9fb98874eef2`. |
| `pnpm test` | Pass | 3 files, 18 tests. |
| `pnpm test:sim` | Pass | 1/1 boundary test. |
| `pnpm check` | Pass | Biome checked 38 files. |
| `pnpm typecheck` | Pass | Strict TypeScript build clean. |
| `pnpm build` | Pass | Production Vite build completed. |
| `pnpm wiki:check` | Pass | VitePress build and page rendering completed. |
| In-memory unresolved-reference audit | Fail as intended | Found E14 `penitent-repair` absent and Simony Church-state reference invalid. |
| In-memory missing secret reference mutation | Loader incorrectly accepted | `create-secret -> missing-secret` loaded successfully. |
| In-memory random weight mutation | Loader incorrectly accepted | Three values / one weight loaded successfully. |
| In-memory duplicate additional-secret pool | Loader incorrectly accepted | Four repetitions of one valid additional secret loaded successfully. |
| In-memory duplicate canonical value mutation | Loader incorrectly accepted | Candidate Ysabel multiplier 2 coexisted with canonical constants multiplier 1.25. |
| Padded SVG/icon-font source probes | Loader incorrectly accepted | Padded SVG data URI and icon-font source both parsed successfully. |

## Design, balance, schema and save impact

- Canonical design changed: No. Findings require faithful transcription and stronger validation, not a design amendment.
- Balance values changed by critic: None.
- Schema impact: Required before integration; effect/reference schemas, evaluation schema, event random validation and raster source normalization need correction.
- Save impact: None yet; integrating these IDs in their current form would freeze wrong content identifiers/semantics into later save work.
- Wiki pages updated by critic: None.

## Unresolved questions

- WP-019 should reconcile whether `under-duress` remains a separate support-level ID or becomes a Pledged level plus coercion/public-label reason. The current data visibly separates public military coercion from private blackmail, but the final shared state contract should preserve the canonical “Pledged Under Duress” semantics without double-counting support levels.
- Asset files are intentionally deferred; the present finding concerns forbidden source-string validation only, not absence of production art.

## Risks and deferred work

- Passing happy-path tests currently overstates loader completeness because several critical report fields are hard-coded empty and mutation coverage does not attack effect references.
- Secret shock errors can survive into WP-019 as apparently typed data and then change Council outcomes without a TypeScript or Zod failure.
- Candidate evaluation ambiguity recreates the exact implementation drift that the canonical evaluation document was added to prevent.

## Final verdict

**Needs fixes.** The packet is legally scoped and its topology, counts, collateral timing, public/private coercion split, Renard availability, deterministic hash, immutability and standard gates are strong. It is not integration-ready because P1 reference/effect, secret-shock and candidate-evaluation defects violate core acceptance criteria and would force the integrator to invent or misapply canonical political behavior.

Integration-ready: **No**.

---

## Re-review — revised staged candidate

**Reviewed candidate:** `fnv1a64-63997bc7fc55c12b`

The original verdict and finding table above are retained as review history. They are superseded by
this re-review after the implementer revised and restaged the packet.

### Prior finding dispositions

| Prior severity | Finding | Re-review disposition |
|---|---|---|
| P1 | Unresolved/type-invalid effects, missing E14 repair, invalid Simony transition and hard-coded empty report | **Resolved.** `penitent-repair` is a complete authored follow-up; Simony applies the durable condition and requests recalculation; effect references are audited by effect domain; report arrays are derived. Missing-secret mutation now fails. |
| P1 | Secret shocks reused Forgery semantics and omitted player supporter tiers | **Resolved.** Dedicated shock IDs/selectors encode every authored secret consequence. Player Forgery has mutually exclusive 20-point Legitimacy and 10-point other-basis shocks. Shock effect/table values are coherence-checked. |
| P1 | Candidate evaluation contract missing/ambiguous/duplicated | **Resolved.** Relationship, bargain, hysteresis/tie data are canonical constants; Ysabel's protection case is an explicit replacement; duplicate multipliers were removed. Opening outcomes are derived by a corrected test-local oracle, not production content behavior. |
| P2 | Offer Bargain timing and Raise Taxes/action edge data incomplete | **Resolved.** Deathbed bargain duration is one day; both tax branches encode income-day advances, condition replacement and 21-day durations; gift refusal, Watch Court freshness and Threaten reset data are explicit. |
| P2 | Weak distribution, pool and validation-report audits | **Resolved.** Distribution-specific cardinality/weight rules, exact unique secret pools and computed report fields are enforced. Global follow-up and event/follow-up choice IDs are unique. |
| P2 | Padded SVG/icon-font references bypass raster validation | **Resolved.** Surrounding whitespace and all data URIs are rejected before raster-extension checks. Padded probes fail. |

### Re-review adversarial evidence

| Probe | Revised result |
|---|---|
| Missing `create-secret` reference | Rejected |
| Missing/duplicate global follow-up decision ID | Rejected |
| Duplicate global primary/follow-up event choice ID | Rejected |
| Invalid effect-specific target (`set-church-state` → player) | Rejected |
| Shock effect value contradicting referenced shock definition | Rejected |
| Scheduled delay contradicting referenced follow-up delay | Rejected |
| Duplicate/missing additional-NPC secret pool entries | Rejected |
| Weighted values/weights mismatch | Rejected |
| Three-way coin flip / malformed uniform-integer range | Rejected |
| Padded SVG data URI / padded icon-font source | Rejected |
| Hidden executable closure | Rejected |
| Canonical unresolved-reference audit | Empty, derived from registry |

### Re-review validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| `git diff --cached --check` | Pass | Refreshed staged candidate has no whitespace errors. |
| `pnpm exec vitest run src/content/content.test.ts` | Pass | 19/19 focused content tests; hash `fnv1a64-63997bc7fc55c12b`. |
| `pnpm test` | Pass | 3 files, 21 tests on the first revised candidate; implementer reran 22/22 after the final global-choice regression. |
| `pnpm check` | Pass | 39 files; no fixes. |
| `pnpm typecheck` | Pass | Strict TypeScript project references clean. |
| `pnpm build` | Pass | Production Vite build completed after the substantive revision. |
| Custom in-memory mutation suite | Pass | All original and second-order reference/coherence/raster probes reject after the final patch. |

### Re-review impact and residual risk

- Canonical design changed: No.
- Balance values changed: No; the revisions restore or validate locked values.
- Production content remains declarative; the temporary evaluation oracle was removed from production
  exports and retained only as corrected test evidence.
- Public military/occupation coercion and private blackmail remain distinct in visibility and support
  labeling. Church/Oswin Patronage uses one idempotent condition and a first-benefit rule identifier.
- The `under-duress` shared-state representation still requires ordinary WP-019 seam reconciliation,
  but no WP-011 content ambiguity or acceptance failure remains.

### Final re-review verdict

**Clear for integration.** No unresolved P0–P3 findings remain in the revised staged WP-011 candidate.
All original defects were resolved with focused regression coverage, and the hostile follow-up probes
now fail closed through the canonical loader.

Integration-ready: **Yes**, subject to the mandatory WP-019 wave integration contract.
