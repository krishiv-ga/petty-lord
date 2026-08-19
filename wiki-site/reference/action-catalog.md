# Action catalog

WP-011 defines the authored contract below. WP-020 implements handlers for the typed result,
availability and invalidation identifiers; this catalog does not itself execute state transitions.

All durations are fixed when an Order starts. A slash shows the Deathbed duration. Ordinary costs are
paid at start. Offer Bargain is the exception: only 8 Influence is paid at start and accepted
collateral applies at resolution.

| ID | Family/kind | Phases | Duration | Start cost | Visibility / repeat rule |
|---|---|---|---:|---|---|
| `send-gift` | Gift | All | 1d | 20/40/80 Gold | Parties; diminishing 14d, third refused |
| `offer-bargain` | Offer Bargain | Ailing+ | 2d / 1d | 8 Influence | Parties; contextual |
| `request-declaration` | Request Declaration | Ailing+ | 2d / 1d | 8 Influence | Parties; premature request cooldown 7d |
| `threaten` | Threaten | All | 2d / 1d | 12 Influence | Public for force/occupation; private for secret blackmail; once per phase without new leverage |
| `watch-court` | Spy variant | All | 3d | 20 Gold, 8 Influence | Hidden; repeatable |
| `find-dirt` | Spy variant | Before Deathbed | 5d | 30 Gold, 12 Influence | Hidden; repeat inside 10d raises detection |
| `research-lineage` | Build Claim variant | Before Deathbed | 6d | 35 Gold, 12 Influence | Suspected; once per run; +12 safe Claim |
| `forge-royal-descent` | Build Claim variant | Before Deathbed | 8d | 50 Gold, 25 Influence | Hidden; once per run; +25 Claim and Forgery Evidence |
| `expose-secret` | Expose Secret | All | 2d / 1d | 10 Influence | Public; each discovered secret once |
| `invade-territory` | Invade | All | 3d / 2d | 10 Gold logistics, troops | Public; repeatable with legal base/target |
| `raise-taxes` | Raise Taxes | All | 1d | — | Public; first: 14 gross-income days + Strain 21d; repeated while strained: 7 days and replace Strain with Unrest 21d |
| `hold-court` | Hold Court | All | 3d / 2d | 60 Gold | Public; second inside 21d diminished, third locked |
| `patronize-church` | Patronize Church | All | 4d / 3d | 50 Gold | Public; one institutional benefit, 21d cooldown |
| `declare-candidacy` | Contextual | Ailing+ | 1d | 15 Influence | Public; irreversible |
| `march-on-capital` | Contextual | Gravely Ill+ | 3d / 2d | 10 Gold logistics, 250+ troops | Public; claimant/Capital gates |
| `break-agreement` | Reaction | All | Immediate | — | Public; full breach consequences |
| `withdraw-occupation` | Reaction | All | Immediate; 1d return | — | Public; no battle may be pending |
| `confess-and-seek-penance` | Contextual | While fraud-condemned | 3d | 40 Gold, 10 Influence, -5 Prestige | Public; removes fraud Condemnation only |
| `cast-greyfens-vote` | Mandatory reaction | Succession | Immediate | — | Public; historical vote after player loss |

Every definition also carries the same preview contract: duration, start cost, acceptance collateral,
troops locked, visibility, known effects, cancellation loss, invalidation and intentional unknowns.
This lets UI packets show consequences before commitment without importing a simulation reducer.

## Bargain catalog

- Edric: Marshal (future office/Leaning only), Border Aid (150 troops for 7d), Joint Campaign (100+
  each; shared victory can Commit).
- Ysabel: Escrow 80 Gold, Chancellorship plus 40 Gold budget, or 100 troops protecting Eastvale for
  7d. `YsabelAccessDebt` raises these to 100 Gold, 60 Gold or 150 troops respectively.
- Oswin: 60-Gold Abbey Endowment that itself creates Patronage, Church Immunities plus the normal
  Patronize action, or a named public Renunciation.
- Mara: permanent Greyfen Charter, Denounce Central Rule (Leaning only), or Provincial Aid through a
  100-troop/5d lock or liberation of Westmarch.

Future office or policy promises never create a Pledge without authored Proof, maturation and accepted
present collateral.
