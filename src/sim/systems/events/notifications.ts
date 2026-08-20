export type NotificationPriority = 'feed' | 'interrupt';

export type NotificationKind =
  | 'ambient-choice'
  | 'capital-change'
  | 'death'
  | 'declaration'
  | 'direct-attack'
  | 'direct-demand'
  | 'expiring-debt'
  | 'harmless-court'
  | 'major-scandal'
  | 'mandatory-choice'
  | 'occupation-change'
  | 'phase-change'
  | 'public-pledge-change'
  | 'routine-ai-gift'
  | 'routine-tax';

const INTERRUPTS = new Set<NotificationKind>([
  'ambient-choice',
  'capital-change',
  'death',
  'declaration',
  'direct-attack',
  'direct-demand',
  'expiring-debt',
  'major-scandal',
  'mandatory-choice',
  'occupation-change',
  'phase-change',
  'public-pledge-change',
]);

export function classifyNotification(kind: NotificationKind): NotificationPriority {
  return INTERRUPTS.has(kind) ? 'interrupt' : 'feed';
}

export function notificationVolumeSample(kinds: readonly NotificationKind[]): {
  readonly feed: number;
  readonly interrupts: number;
  readonly total: number;
} {
  const interrupts = kinds.filter((kind) => classifyNotification(kind) === 'interrupt').length;
  return { feed: kinds.length - interrupts, interrupts, total: kinds.length };
}
