import type { CompositeTailStep } from '@aileron/schema-form-scenarios';

import type { FormHandle } from '../../../src';

/** Authored composite metadata that does not travel through Storybook args. */
export interface StoryPanelsParameters {
  /** Consumer operations following the shared scenario steps. */
  tail?: readonly CompositeTailStep[];
  /** Value loaded at the start of the consumer tail. */
  tailStart?: unknown;
  /** Plain mount configuration from the shared composite case. */
  mountProps?: unknown;
}

/** Immutable snapshot consumed by panels, never by the story renderer. */
export interface StoryPanelsState {
  /** Most recent public form output. */
  value: unknown;
  /** Scenario defaults together with the currently staged defaults. */
  defaultValue: unknown;
  /** Ordered whole-form validation issues. */
  errors: ReturnType<FormHandle['getErrors']>;
  /** Effective consumer configuration, displayed without engine inspection. */
  settings: Readonly<Record<string, unknown>>;
  /** Current prop stage and its authored schema value, including untyped stage inputs. */
  stage: { readonly current: number; readonly total: number; readonly schema: unknown };
}

/** React external-store contract scoped to one decorated story instance. */
export interface StoryPanelsStore {
  /** Read the cached snapshot required by useSyncExternalStore. */
  getSnapshot: () => StoryPanelsState;
  /** Subscribe a panel; the returned callback releases its subscription. */
  subscribe: (listener: () => void) => () => void;
  /** Merge a renderer report and notify only panel subscribers. */
  report: (partial: Partial<StoryPanelsState>) => void;
}
