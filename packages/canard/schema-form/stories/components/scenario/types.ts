import type { FormHandle, SchemaNode } from '../../../src';

/** Consumer-owned records kept separately from the pure scenario data. */
export interface StoryObservations {
  changes: unknown[];
  errorCodes: string[];
  validationRequests: number;
}

/** DOM and current public handle used by the browser adapter. */
export interface StoryScenarioContext {
  handle: FormHandle;
  element: HTMLElement;
  observations: StoryObservations;
}

/** Step-local evidence; counters exclude work before the current operation. */
export interface StoryStepEvidence {
  result: unknown;
  changes: number;
  errors: number;
  validationRequests: number;
  deliveries: string[];
  priorNodes: Record<string, SchemaNode | null>;
}
