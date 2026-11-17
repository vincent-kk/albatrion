import type { FormScenario } from '../../types';

/** Number of text fields in the virtualized form; above the gate threshold below. */
const fieldCount = 40;

/** Forty text fields; /f35 carries a constraint so validation reaches a field before it mounts. */
const deferredSchema = {
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: fieldCount }, (_, index) => [`f${index}`, index === 35 ? { type: 'string', minLength: 3 } : { type: 'string' }]),
  ),
};

/** Loaded values f0..f39, each "v<index>". */
const deferredValue = Object.fromEntries(Array.from({ length: fieldCount }, (_, index) => [`f${index}`, `v${index}`]));

/** Virtualization keeps every node built, mounts far fields as placeholders, and reveals them on view or focus. */
export const deferredMountScenario: FormScenario = {
  name: 'scale.deferred-mount',
  description: 'Virtualization builds every node but mounts fields past eagerCount as [data-path][data-deferred] placeholders; TEST-020 getValue and validation include a deferred field before it mounts; a focus command or scrolling a placeholder into view mounts it, and a revealed field stays mounted (LANDING-087). Options come from deferredMountOptions; stages from deferredMountStages.',
  schema: deferredSchema,
  initialValue: deferredValue,
  steps: [
    { action: 'batch', steps: [], expect: { values: { '/f0': 'v0', '/f39': 'v39' }, errors: { '/f35': [] } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/f35', value: 'x' }], expect: {
      values: { '/f35': 'x' }, errors: { '/f35': [{ keyword: 'minLength' }] },
    } },
  ],
};

/** Virtualization options as plain data; backfill names a VirtualizationBackfill value. */
export const deferredMountOptions = { threshold: 30, eagerCount: 5, rootMargin: '0px', backfill: 'none', estimateHeight: 40 } as const;

/** One reveal action and the mount state of its target afterwards. */
export interface DeferredMountStage {
  /** load reads the first frame; focus calls handle.focus; scroll brings the placeholder into view. */
  readonly act: 'load' | 'focus' | 'scroll';
  /** Field path the stage reads or acts on. */
  readonly path: string;
  /** Whether the field's input is mounted afterwards. */
  readonly mounted: boolean;
  /** Whether that input holds focus afterwards. */
  readonly focused: boolean;
}

/** Stages applied in order to deferredMountScenario in a real viewport. */
export const deferredMountStages: readonly DeferredMountStage[] = [
  { act: 'load', path: '/f0', mounted: true, focused: false },
  { act: 'load', path: '/f39', mounted: false, focused: false },
  { act: 'focus', path: '/f39', mounted: true, focused: true },
  { act: 'scroll', path: '/f30', mounted: true, focused: false },
];
