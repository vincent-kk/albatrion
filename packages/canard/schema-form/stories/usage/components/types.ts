import type { FormScenario } from '@aileron/schema-form-scenarios';

import type { FormHandle } from '../../../src';

/** Usage example selected by a CSF export; each example owns its call readouts. */
export type HandleExampleName = 'RootNode' | 'FindNodes' | 'ReadAndWriteValue' | 'InteractionState' | 'Errors' | 'FocusAndSelect' | 'RefreshAndRemount' | 'Reset' | 'Submit' | 'AttachedFiles';

/** Authored shared scenario and method group consumed by the workbench. */
export interface HandleWorkbenchProps {
  /** Existing pure scenario data; the workbench never duplicates its schema. */
  scenario: FormScenario;
  /** Method group offered by this usage story. */
  example: HandleExampleName;
}

/** One named button and the imperative operation it records. */
export interface HandleAction {
  /** Unique visible button label used by the story play. */
  label: string;
  /** Public handle member shown in the call log. */
  method: keyof FormHandle;
  /** Human-readable argument snapshot, including updater functions. */
  args: readonly unknown[];
  /** Invoke the live handle and optionally observe the workbench's own input. */
  run: (handle: FormHandle, root: HTMLElement) => unknown;
}

/** Immutable call record captured before mutable engine objects can change. */
export interface HandleCall {
  /** Member called, or the consumer onSubmit callback. */
  method: string;
  /** Display-safe arguments at call time. */
  args: string;
  /** Display-safe result or caught error at completion. */
  result: string;
  /** Public method return category, or a caught action failure; DOM readout waits do not change it. */
  kind: 'sync' | 'async' | 'throw';
}
