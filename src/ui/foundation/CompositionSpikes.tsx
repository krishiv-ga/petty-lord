import { characterPortraits, isRivalPortraitId } from '../../assets/raster/characterPortraits';
import { rasterFallbackSource, rasterSrcSet } from '../../assets/raster/contracts';
import { placeholderRasterAssets } from '../../assets/raster/placeholders';
import {
  actionPreviewFixture,
  chronicleFixtures,
  lordStripFixtures,
  mapHotspots,
} from '../fixtures/foundationFixtures';
import { Button, IconActionButton } from '../primitives/Button';
import { Dialog, Popover, ScrollRegion, SegmentedTabs, Tooltip } from '../primitives/RadixWrappers';
import { RasterIcon } from '../primitives/RasterIcon';
import styles from './CompositionSpikes.module.css';
import {
  AllegianceRibbon,
  ChronicleLine,
  DeltaAnnouncer,
  InspectorSection,
  IntelligenceAge,
  ParchmentPanel,
  ReasonRow,
  ResourceDatum,
  SealStatus,
  StateNotice,
} from './PoliticalObjects';

export function LordPortraitStrip() {
  return (
    <main className={`${styles.stage} pl-foundation-scope`} aria-labelledby="lord-strip-heading">
      <header className={styles.stageHeader}>
        <div>
          <p>Chancery fixture · political identities</p>
          <h1 id="lord-strip-heading">The six great seats do not agree</h1>
        </div>
        <SealStatus asset={placeholderRasterAssets.seal} label="Day 31 reports" tone="stale" />
      </header>
      <div className={styles.lordRail}>
        {lordStripFixtures.map((lord) => (
          <article className={styles.lord} key={lord.id} data-unread={lord.unread || undefined}>
            <div className={styles.portraitWrap}>
              <span className={styles.portraitMedallion}>
                <RasterIcon
                  asset={
                    isRivalPortraitId(lord.id)
                      ? characterPortraits[lord.id].bust.asset
                      : placeholderRasterAssets.portrait
                  }
                  alt={
                    isRivalPortraitId(lord.id)
                      ? `Temporary bust crop of the approved ${lord.name} identity master`
                      : `Temporary anonymous portrait of ${lord.name}`
                  }
                  visibility={lord.visibility}
                  loading="eager"
                />
              </span>
              {lord.unread ? <strong className={styles.unreadFlag}>Unread message</strong> : null}
            </div>
            <div className={styles.lordIdentity}>
              <h2>{lord.name}</h2>
              <p>{lord.title}</p>
            </div>
            <AllegianceRibbon level={lord.support} visibility={lord.visibility} />
            <p className={styles.lordStatus}>{lord.status}</p>
            <p className={styles.relationship}>{lord.relationship}</p>
            <IntelligenceAge
              state={lord.intelligence}
              {...(lord.observed ? { observed: lord.observed } : {})}
            />
          </article>
        ))}
      </div>
      <footer className={styles.stageNote}>
        <span>
          Relationship, support and the age of knowledge remain separate lines of evidence.
        </span>
        <span>
          Rival medallions are temporary bust crops of approved full masters; dedicated bust art
          replaces them in WP-034.
        </span>
      </footer>
    </main>
  );
}

export function ActionPreviewLetter() {
  const preview = actionPreviewFixture;

  return (
    <main className={`${styles.stage} ${styles.letterStage} pl-foundation-scope`}>
      <ParchmentPanel
        className={styles.actionLetter}
        eyebrow="Unsealed draft · consequences before commitment"
        title={preview.action}
        headingLevel={1}
      >
        <div className={styles.actionMeta}>
          <ResourceDatum label="Duration" value={preview.duration} />
          <ResourceDatum label="Start cost" value={preview.cost} urgent />
          <ResourceDatum label="Troops" value={preview.troops} />
          <SealStatus
            asset={placeholderRasterAssets.seal}
            label={preview.visibility}
            tone="public"
          />
        </div>
        <dl className={styles.consequenceLedger}>
          <div>
            <dt>Acceptance collateral</dt>
            <dd>{preview.collateral}</dd>
          </div>
          <div>
            <dt>Known political consequence</dt>
            <dd>{preview.consequence}</dd>
          </div>
          <div data-unknown>
            <dt>Intentional unknown</dt>
            <dd>{preview.unknown}</dd>
          </div>
          <div data-loss>
            <dt>Cancellation loss</dt>
            <dd>{preview.cancellation}</dd>
          </div>
        </dl>
        <div className={styles.letterActions}>
          <Button variant="text">Return without sealing</Button>
          <Tooltip content="This commits the listed start cost immediately.">
            <IconActionButton
              asset={placeholderRasterAssets.seal}
              label="Seal and begin the three-day offer"
              variant="primary"
            />
          </Tooltip>
        </div>
      </ParchmentPanel>
      <aside className={styles.marginNote}>
        <strong>Clerk’s margin</strong>
        <p>Promises alone do not create a Pledge. The charter is material present collateral.</p>
      </aside>
    </main>
  );
}

export function CrisisFrameFragment() {
  return (
    <main className={`${styles.crisisFrame} pl-foundation-scope`} aria-label="Crisis frame fixture">
      <header className={styles.crisisHeader}>
        <div className={styles.phaseBlock}>
          <p>Deathbed · Day 34</p>
          <h1>The court waits for no one</h1>
          <span>Prognosis: the physicians refuse a dawn</span>
        </div>
        <section className={styles.resourceStrip} aria-label="Resources">
          <ResourceDatum label="Gold" value="74" detail="−20 if sealed" />
          <ResourceDatum label="Levies" value="286 / 420" detail="100 committed" />
          <ResourceDatum label="Prestige" value="61" detail="Respected" />
          <ResourceDatum label="Claim" value="Plausible" />
          <ResourceDatum label="Influence" value="18" urgent detail="Council pressure" />
        </section>
      </header>
      <div className={styles.crisisBody}>
        <ParchmentPanel
          eyebrow="Mandatory decision · time paused"
          title="The Capital has fallen silent"
          urgent
        >
          <p className={styles.decisionLead}>
            Your surviving force withdrew below the constitutional garrison. The Capital is now
            Uncontrolled; every claimant must answer before the next queued event resolves.
          </p>
          <div className={styles.reasonStack}>
            <ReasonRow
              label="Constitution"
              disposition="opposes"
              reason="Military Acclamation is blocked without 200 troops in the Capital."
            />
            <ReasonRow
              label="Council"
              disposition="conditional"
              reason="Capital no longer breaks a final 3–3 tie for you."
            />
            <ReasonRow
              label="Unknown houses"
              disposition="unknown"
              reason="Two private Leanings have not been observed since Day 27."
            />
          </div>
          <div className={styles.decisionActions}>
            <Popover
              title="Why is this mandatory?"
              trigger={<Button variant="secondary">Read the clerk’s reason</Button>}
            >
              The decision queue is paused before later events. Resolve or choose a legal
              withdrawal; closing this explanation does not advance time.
            </Popover>
            <Dialog
              trigger={<Button variant="danger">Resolve the Capital decision</Button>}
              title="Choose before the next bell"
              description="This fixture demonstrates focus trapping and return. It does not mutate game state."
              confirmLabel="Record a guarded withdrawal"
              dismissible={false}
            >
              <StateNotice
                kind="disabled"
                title="March is unavailable"
                detail="Only 176 troops remain; 200 are required to hold the Capital after resolution."
              />
            </Dialog>
          </div>
        </ParchmentPanel>
        <aside className={styles.chroniclePanel}>
          <SegmentedTabs
            label="Chronicle filters"
            items={[
              {
                value: 'all',
                label: 'All entries',
                content: (
                  <ScrollRegion label="Recent chronicle entries">
                    <div className={styles.chronicleLines}>
                      {chronicleFixtures.map((entry) => (
                        <ChronicleLine day={entry.day} category={entry.category} key={entry.day}>
                          {entry.text}
                        </ChronicleLine>
                      ))}
                    </div>
                  </ScrollRegion>
                ),
              },
              {
                value: 'court',
                label: 'Court only',
                content: (
                  <StateNotice
                    kind="empty"
                    title="No court entries this bell"
                    detail="The empty state names the filter and does not imply missing history."
                  />
                ),
              },
            ]}
          />
          <DeltaAnnouncer message="Capital → Uncontrolled — only 176 troops survived." />
        </aside>
      </div>
    </main>
  );
}

export function RasterMapHotspotFixture() {
  const map = placeholderRasterAssets.mapPlate;

  return (
    <main className={`${styles.mapStage} pl-foundation-scope`} aria-labelledby="map-fixture-title">
      <header className={styles.mapHeader}>
        <div>
          <p>Raster plate · semantic DOM controls</p>
          <h1 id="map-fixture-title">The kingdom at a disputed dawn</h1>
        </div>
        <p>Tab through seven territorial controls. Geography is decorative; every state is text.</p>
      </header>
      <div className={styles.mapComposition}>
        <div className={styles.mapPlate}>
          <img
            src={rasterFallbackSource(map)}
            srcSet={rasterSrcSet(map)}
            width={map.width}
            height={map.height}
            alt=""
            draggable={false}
          />
          {mapHotspots.map((hotspot) => (
            <button
              type="button"
              className={styles.hotspot}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              aria-label={`${hotspot.label}: ${hotspot.state}`}
              data-state={
                hotspot.id === 'capital'
                  ? 'urgent'
                  : hotspot.id === 'greyfen'
                    ? 'selected'
                    : undefined
              }
              key={hotspot.id}
            >
              <span className={styles.hotspotMark} aria-hidden="true" />
              <strong>{hotspot.label}</strong>
              <small>{hotspot.state}</small>
            </button>
          ))}
        </div>
        <aside className={styles.mapInspector}>
          <p className={styles.mapKicker}>Selected seat</p>
          <h2>Greyfen</h2>
          <IntelligenceAge state="public" observed="current dawn" />
          <InspectorSection title="State" summary="Public record">
            <SealStatus
              asset={placeholderRasterAssets.seal}
              label="Legal seat secure"
              tone="public"
            />
          </InspectorSection>
          <InspectorSection title="Known force" summary="Exact self-knowledge">
            <ReasonRow
              label="Available levies"
              disposition="supports"
              reason="286 of 420 remain."
            />
            <ReasonRow
              label="Capital route"
              disposition="opposes"
              reason="No controlled campaign line reaches the Capital this bell."
            />
          </InspectorSection>
          <p className={styles.placeholderNotice}>Fixture plate · replace in WP-034</p>
        </aside>
      </div>
    </main>
  );
}
