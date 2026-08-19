import { placeholderRasterAssets } from '../../assets/raster/placeholders';
import { Button } from '../primitives/Button';
import { IntelligenceAge, SealStatus } from './PoliticalObjects';
import styles from './VisualLanguageDecisionRecord.module.css';

const palette = [
  ['Vellum', 'Surfaces and letters', 'vellum'],
  ['Ink', 'Primary text and hard edges', 'ink'],
  ['Smoke', 'Secondary records and age', 'smoke'],
  ['Brass / iron', 'Institutional boundaries', 'metal'],
  ['Royal burgundy', 'Claimant action and Crown', 'burgundy'],
  ['Faded blue-green', 'Stable public record', 'bluegreen'],
  ['Warning / blood', 'Loss, invalidity and urgency', 'warning'],
  ['Church / gold', 'Church and constitutional weight', 'gold'],
  ['Disabled / ash', 'Unavailable, never merely dimmed', 'ash'],
] as const;

const rejectedPatterns = [
  'Rounded KPI tiles with isolated totals',
  'A generic sidebar beside a repeated card grid',
  'Glass panels, neon glows or gradient-brand chrome',
  'Pill badges used as the only political hierarchy',
  'Stock fantasy ornament pasted over a modern admin shell',
] as const;

export function VisualLanguageDecisionRecord() {
  return (
    <main className={`${styles.record} pl-foundation-scope`}>
      <header className={styles.hero}>
        <p>Implemented decision record · WP-012</p>
        <h1>The royal chancery at the end of a dynasty</h1>
        <p>
          Political instruments establish hierarchy: letters hold consequence, seals name status,
          ribbons declare allegiance, ledgers compare resources, and iron edges mark institutions.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="palette-title">
        <div className={styles.sectionHeading}>
          <p>Material vocabulary</p>
          <h2 id="palette-title">A small palette with named political roles</h2>
        </div>
        <div className={styles.palette}>
          {palette.map(([name, role, token]) => (
            <article key={name}>
              <span className={styles.swatch} data-token={token} aria-hidden="true" />
              <div>
                <strong>{name}</strong>
                <p>{role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.split}>
        <div className={styles.typeSpecimen}>
          <p>Typography roles</p>
          <h2>Display serif carries ceremony, not paragraphs</h2>
          <p>
            Book-serif body copy remains at least 16px. Compact ledger labels may be smaller only
            when short, high-contrast, and paired with readable values.
          </p>
          <p className="pl-number">Day 34 · 286 / 420 levies · 74 Gold</p>
          <small>
            Final pairing: Cormorant Garamond + Source Serif 4 (SIL OFL 1.1). Safe fallback: Georgia
            and Palatino-family system fonts; font-display swap prevents blocked gameplay.
          </small>
        </div>
        <div className={styles.edgeSpecimen}>
          <p>Edges and focus</p>
          <div data-edge="letter">Letter · soft shadow, irregular inset rule</div>
          <div data-edge="institution">Institution · double brass boundary</div>
          <div data-edge="invalid">Invalid · warning rule plus explicit word</div>
          <Button>Keyboard focus uses a high-contrast cyan-ink ring</Button>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="states-title">
        <div className={styles.sectionHeading}>
          <p>Political hierarchy</p>
          <h2 id="states-title">Every state has words, shape or pattern beyond color</h2>
        </div>
        <div className={styles.states}>
          {(
            [
              'public',
              'private',
              'stale',
              'unknown',
              'coerced',
              'occupied',
              'invalid',
              'urgent',
            ] as const
          ).map((tone) => (
            <SealStatus
              asset={placeholderRasterAssets.seal}
              label={tone === 'coerced' ? 'Under duress' : tone}
              tone={tone}
              key={tone}
            />
          ))}
        </div>
        <div className={styles.intelligenceRow}>
          <IntelligenceAge state="public" observed="current" />
          <IntelligenceAge state="private" observed="Day 31" />
          <IntelligenceAge state="fresh" observed="1 day old" />
          <IntelligenceAge state="stale" observed="7 days old" />
          <IntelligenceAge state="unknown" />
        </div>
      </section>

      <section className={styles.split}>
        <div className={styles.principles}>
          <p>Density, texture and motion</p>
          <ul>
            <li>
              1280×720 tightens vertical rhythm while preserving 16px body copy and 44px controls.
            </li>
            <li>1440×900 restores air around letters and institutional panels.</li>
            <li>
              Texture stays below text as subtle paper/wood grain; no noisy asset is a text backing.
            </li>
            <li>
              Motion presents a letter or emphasis only; it never advances authoritative state.
            </li>
            <li>
              Reduced motion removes transforms and leaves immediate, equivalent state changes.
            </li>
            <li>
              Tooltip facts are duplicated in focusable/visible flows; hover is never the only
              route.
            </li>
          </ul>
        </div>
        <div className={styles.rejected}>
          <p>Rejected production patterns</p>
          <ul>
            {rejectedPatterns.map((pattern) => (
              <li key={pattern}>{pattern}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
