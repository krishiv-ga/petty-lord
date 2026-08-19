import type { HTMLAttributes, ReactNode } from 'react';
import type { RasterAsset } from '../../assets/raster/contracts';
import { RasterIcon } from '../primitives/RasterIcon';
import styles from './PoliticalObjects.module.css';

export type ResourceDatumProps = {
  readonly label: string;
  readonly value: string;
  readonly detail?: string;
  readonly urgent?: boolean;
};

export function ResourceDatum({ label, value, detail, urgent = false }: ResourceDatumProps) {
  return (
    <dl className={styles.resource} data-urgent={urgent || undefined}>
      <dt>{label}</dt>
      <dd className="pl-number">{value}</dd>
      {detail ? <dd className={styles.resourceDetail}>{detail}</dd> : null}
    </dl>
  );
}

export type StatusTone =
  | 'public'
  | 'private'
  | 'stale'
  | 'unknown'
  | 'coerced'
  | 'occupied'
  | 'invalid'
  | 'urgent';

export type SealStatusProps = {
  readonly asset: RasterAsset;
  readonly label: string;
  readonly tone: StatusTone;
};

export function SealStatus({ asset, label, tone }: SealStatusProps) {
  return (
    <span className={styles.sealStatus} data-tone={tone}>
      <RasterIcon asset={asset} alt="" loading="eager" />
      <span>{label}</span>
    </span>
  );
}

export type AllegianceRibbonProps = {
  readonly level: 'none' | 'leaning' | 'pledged' | 'committed' | 'duress';
  readonly visibility?: 'public' | 'private';
};

const allegianceLabels: Record<AllegianceRibbonProps['level'], string> = {
  none: 'No declared support',
  leaning: 'Leaning',
  pledged: 'Pledged',
  committed: 'Committed',
  duress: 'Under duress',
};

export function AllegianceRibbon({ level, visibility = 'public' }: AllegianceRibbonProps) {
  return (
    <span className={styles.ribbon} data-level={level} data-visibility={visibility}>
      <span>{allegianceLabels[level]}</span>
      <small>{visibility === 'private' ? 'Known privately' : 'Public record'}</small>
    </span>
  );
}

export type ParchmentPanelProps = HTMLAttributes<HTMLElement> & {
  readonly title: string;
  readonly eyebrow?: string;
  readonly children: ReactNode;
  readonly urgent?: boolean;
  readonly headingLevel?: 1 | 2 | 3;
};

export function ParchmentPanel({
  title,
  eyebrow,
  children,
  urgent = false,
  headingLevel = 2,
  className,
  ...props
}: ParchmentPanelProps) {
  const Heading = headingLevel === 1 ? 'h1' : headingLevel === 2 ? 'h2' : 'h3';

  return (
    <article
      className={[styles.parchment, className].filter(Boolean).join(' ')}
      data-urgent={urgent || undefined}
      {...props}
    >
      <header className={styles.parchmentHeader}>
        {eyebrow ? <p>{eyebrow}</p> : null}
        <Heading>{title}</Heading>
      </header>
      <div className={styles.parchmentBody}>{children}</div>
    </article>
  );
}

export type InspectorSectionProps = {
  readonly title: string;
  readonly children: ReactNode;
  readonly summary?: string;
};

export function InspectorSection({ title, children, summary }: InspectorSectionProps) {
  return (
    <section className={styles.inspector}>
      <header>
        <h3>{title}</h3>
        {summary ? <p>{summary}</p> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}

export type ReasonRowProps = {
  readonly label: string;
  readonly reason: string;
  readonly disposition: 'supports' | 'opposes' | 'conditional' | 'unknown';
};

const dispositionLabels: Record<ReasonRowProps['disposition'], string> = {
  supports: 'Supports',
  opposes: 'Opposes',
  conditional: 'Conditional',
  unknown: 'Unknown',
};

export function ReasonRow({ label, reason, disposition }: ReasonRowProps) {
  return (
    <div className={styles.reason} data-disposition={disposition}>
      <span className={styles.reasonMark} aria-hidden="true" />
      <div>
        <p>
          <strong>{label}</strong>
          <span>{dispositionLabels[disposition]}</span>
        </p>
        <p>{reason}</p>
      </div>
    </div>
  );
}

export type ChronicleLineProps = {
  readonly day: string;
  readonly category: 'succession' | 'war' | 'court' | 'intelligence';
  readonly children: ReactNode;
  readonly unread?: boolean;
};

export function ChronicleLine({ day, category, children, unread = false }: ChronicleLineProps) {
  return (
    <p className={styles.chronicle} data-category={category} data-unread={unread || undefined}>
      <time>{day}</time>
      <span className={styles.chronicleCategory}>{category}</span>
      <span>{children}</span>
      {unread ? <strong className={styles.unread}>Unread</strong> : null}
    </p>
  );
}

export type StateNoticeProps = {
  readonly kind: 'empty' | 'loading' | 'disabled' | 'error';
  readonly title: string;
  readonly detail: string;
};

export function StateNotice({ kind, title, detail }: StateNoticeProps) {
  return (
    <div
      className={styles.stateNotice}
      data-kind={kind}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live={kind === 'loading' ? 'polite' : 'off'}
    >
      <span className={styles.stateSigil} aria-hidden="true">
        {kind === 'loading' ? '…' : kind === 'error' ? '!' : '—'}
      </span>
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}

export type IntelligenceAgeProps = {
  readonly state: 'public' | 'private' | 'fresh' | 'stale' | 'unknown';
  readonly observed?: string;
};

const intelligenceLabels: Record<IntelligenceAgeProps['state'], string> = {
  public: 'Public record',
  private: 'Private intelligence',
  fresh: 'Fresh report',
  stale: 'Stale report',
  unknown: 'Unknown',
};

export function IntelligenceAge({ state, observed }: IntelligenceAgeProps) {
  return (
    <span className={styles.intelligenceAge} data-state={state}>
      <span className={styles.intelligencePattern} aria-hidden="true" />
      <span>{intelligenceLabels[state]}</span>
      {observed ? <time>{observed}</time> : null}
    </span>
  );
}

export function DeltaAnnouncer({ message }: { readonly message: string }) {
  return (
    <output className={styles.delta} aria-live="polite" aria-atomic="true">
      <span aria-hidden="true">Change</span>
      {message}
    </output>
  );
}
