import type { FormScenario } from '../../types';

/** Node state keys a consumer tail reads; edited and touched are not in the shared expectation vocabulary. */
export interface CompositeNodeState {
  /** Whether the node was edited since the last load. */
  readonly edited?: boolean;
  /** Whether the node's input was blurred since the last load. */
  readonly touched?: boolean;
  /** Whether the node is read-only after control evaluation. */
  readonly isReadOnly?: boolean;
  /** Whether the node is visible after control evaluation. */
  readonly isVisible?: boolean;
}

/** Form props a tail stage applies, as plain data; showError names a ShowError member. */
export interface CompositePropStage {
  /** External errors prop; any value, including a non-array, is passed as is. */
  readonly errors?: unknown;
  /** context prop. */
  readonly context?: Readonly<Record<string, unknown>>;
  /** showError prop as a ShowError member name or a boolean. */
  readonly showError?: boolean | 'Edited' | 'Touched' | 'EditedTouched';
}

/**
 * One consumer step run after the shared steps; consumers map each act to their runtime.
 * write goes through the handle and changes no interaction state; type goes through the mounted input like a user.
 * holdValidation makes the consumer's validator wait until releaseValidation, so a later step can land in between.
 */
export type CompositeTailStep =
  | { readonly act: 'write'; readonly path: string; readonly value: unknown }
  | { readonly act: 'type'; readonly path: string; readonly text: string }
  | { readonly act: 'merge'; readonly value: Readonly<Record<string, unknown>> }
  | { readonly act: 'batch'; readonly writes: readonly { readonly path: string; readonly value: unknown }[] }
  | { readonly act: 'values'; readonly values: Readonly<Record<string, unknown>> }
  | { readonly act: 'props'; readonly stage: CompositePropStage }
  | { readonly act: 'submit'; readonly rejected: string }
  | { readonly act: 'submit'; readonly submitted: unknown }
  | { readonly act: 'reset' }
  | { readonly act: 'holdValidation' }
  | { readonly act: 'releaseValidation' }
  | { readonly act: 'focus'; readonly path: string }
  | { readonly act: 'blur' }
  | { readonly act: 'states'; readonly states: Readonly<Record<string, CompositeNodeState>> }
  | { readonly act: 'errors'; readonly errors: Readonly<Record<string, readonly string[]>> }
  | { readonly act: 'globalErrors'; readonly keywords: readonly string[] }
  | { readonly act: 'shown'; readonly shown: Readonly<Record<string, boolean>> }
  | { readonly act: 'mounted'; readonly mounted: Readonly<Record<string, boolean>>; readonly browserOnly?: boolean };

/** A composite case: shared steps, the consumer tail that follows them, and the form props it starts with. */
export interface CompositeCase {
  /** Shared scenario run by playScenario in every layer. */
  readonly scenario: FormScenario;
  /** Form props at mount, as plain data. */
  readonly props?: CompositePropStage & {
    /** validationMode member name. */
    readonly validationMode?: 'None' | 'OnChange' | 'OnRequest';
    /** Virtualization options with backfill named by its VirtualizationBackfill value. */
    readonly virtualization?: Readonly<{ threshold: number; eagerCount: number; rootMargin: `${number}px` | `${number}%`; backfill: 'none' | 'idle'; estimateHeight: number }>;
  };
  /** Consumer steps after the shared ones, starting from the scenario's final state. */
  readonly tail?: readonly CompositeTailStep[];
  /** Whole-form value the shared steps end with; consumers that run the tail alone load it as defaultValue. */
  readonly tailStart?: unknown;
}
