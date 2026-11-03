import type { FormHandle } from '@canard/schema-form';

/** Observable counts that must accompany every duration, including warmups. */
export interface CoreCounts {
  /** Fully mounted native input and select controls. */
  inputs: number;
  /** Element count inside the form container. */
  nodes: number;
  /** Trusted input writes observed during the measured operation. */
  writes: number;
  /** Validator invocations during the measured operation. */
  validations: number;
}

/** One page's scalar measurement; typing durations are milliseconds per write. */
export interface CoreMeasurement {
  /** Mount/rebuild/first-key latency, or mean typing handler duration. */
  durationMs: number;
  /** Coverage evidence for the scalar rather than an inferred sample count. */
  counts: CoreCounts;
}

/** Browser API consumed by the core Playwright runner. */
export interface CoreAPI {
  /** Mount exactly one fixture; first-key starts from the first-paint hook. */
  prepare(id: string): Promise<void>;
  /** Complete the selected operation and return validated scalar evidence. */
  run(): Promise<CoreMeasurement>;
}

/** Public handle access remains current after root-replacing rebuilds. */
export interface MountedCoreFixture {
  /** Time from initial render through the complete painted mount. */
  durationMs: number;
  /** Resolve the current imperative handle or fail the sample. */
  currentHandle(): FormHandle;
}

/** Native event boundaries bracket the React input handler. */
export interface CoreInputRecord {
  /** Capture-phase browser clock reading. */
  start: number;
  /** Capture-to-bubble duration, absent until the event finishes. */
  durationMs?: number;
  /** Synthetic dispatch cannot count as a keyboard sample. */
  trusted: boolean;
  /** Native value used to verify the public node accepted the write. */
  value: string;
}

/** Browser-owned passive input observer, activated only for measured writes. */
export interface CoreInputObservation {
  /** Captured input records in dispatch order. */
  records: CoreInputRecord[];
  /** Begin a fresh input interval without measuring setup events. */
  begin(): void;
  /** Remove document listeners when the one-page sample completes. */
  stop(): void;
}

declare global {
  /** Core bindings are installed by the bundle and the Playwright driver. */
  interface Window {
    /** Bundle-owned lifecycle for one fresh page. */
    __core: CoreAPI;
    /** Driver sends the first trusted key when the initial paint hook fires. */
    __coreFirstKey: () => Promise<void>;
    /** Driver sends twenty trusted keys with the fixture's nonburst spacing. */
    __coreType: () => Promise<void>;
  }
}
