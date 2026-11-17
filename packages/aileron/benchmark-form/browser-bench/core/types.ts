import type { FormHandle } from '@canard/schema-form';

/** Observable counts that must accompany every duration, including warmups. */
export interface CoreCounts {
  /** Fully mounted native input and select controls. */
  inputs: number;
  /** Element count inside the form container. */
  nodes: number;
  /** Trusted input writes observed during the measured operation. */
  writes: number;
  /** Validator runs during the measured operation (mount and first-key count since page load). */
  validations: number;
  /** Validator compiles during the measured operation, counted like validations. */
  compiles: number;
  /** Validator runs since the page loaded, including setup work outside the window. */
  lifetimeValidations: number;
  /** Validator compiles since the page loaded. */
  lifetimeCompiles: number;
  /** Validator calls that threw or rejected since the page loaded; a healthy sample has zero. */
  failedCalls: number;
  /** Marker elements rendered for the measured path; exactly one for validate cases, zero for none. */
  markers: number;
}

/** Attribution class of one write's visible feedback. */
export type CoreFeedbackClass =
  | 'exact'
  | 'censored'
  | 'noChange'
  | 'superseded';

/** One validator call. run: `data` is the root emit; `probeValue` is the measured leaf's value inside it (null for compile). */
export interface CoreValidatorRecord {
  /** Call order since the page loaded, starting at one. */
  seq: number;
  /** Compile of the root schema or a run against one emitted value. */
  kind: 'compile' | 'run';
  /** String value found at the measured path inside the run's data; null otherwise. */
  probeValue: string | null;
  /** Browser clock reading at call entry. */
  startMs: number;
  /** Browser clock reading when the call returned synchronously (a promise or a verdict). */
  syncReturnMs: number;
  /** Browser clock reading when the verdict was available; equals syncReturnMs for synchronous verdicts. */
  settledMs: number;
  /** False when the call threw or its promise rejected. */
  ok: boolean;
  /** Failure message preserved for evidence. */
  error?: string;
}

/** Frame-gap evidence for one fixed UX budget, independent of the host refresh rate. */
export interface CoreFrameBudgetObservation {
  /** Sum in ms of the portions of rAF gaps above this budget. */
  frameOverflowMs: number;
  /** Count of gaps strictly longer than this budget. */
  overBudgetFrames: number;
}

/** Per-sample observations added beside the unchanged elapsed metric. */
export interface CoreMetrics {
  /** Primary 16.7 ms gap evidence; identical to the existing frameOverflowMs and overBudgetFrames. */
  frameBudget60: CoreFrameBudgetObservation;
  /** Informational 8.3 ms gap evidence; excluded from UX grading and weighted exchange. */
  frameBudget120: CoreFrameBudgetObservation;
  /** Existing elapsed metric, unchanged (typing: mean handler ms over 20 writes). */
  durationMs: number;
  /** Directly measured main-thread blocking, only where a direct measure exists: typing = mean capture→bubble handler ms of writes 2–20; first-key = its handler ms; mount/rebuild = null (no sub-50 ms measure; see maxLongTaskMs). */
  blockingMs: number | null;
  /** Longest ORIGINAL duration (entry.duration) among Long Tasks overlapping the window; null = none observed, reported as "< 50 ms" (the API's threshold), never as 0. UX uses this. */
  maxLongTaskMs: number | null;
  /** typing only: handler ms of write 1 (the one-off first-write cost, kept apart from the repeat mean). */
  firstWriteMs: number | null;
  /** Sum of the parts of Long Tasks that fall inside the window (ms); tasks under 50 ms are invisible to the API. */
  longTaskOverlapMs: number;
  /** Synchronous validator segments (compile sync + run sync part) that started before the first rAF after the start mark. Mean per write 2–20 for typing. */
  preFrameValidatorMs: number;
  /** Synchronous validator segments that started at or after the first rAF after the start mark. Mean per write 2–20 for typing. */
  postFrameValidatorMs: number;
  /** Start mark → settle of the validator run that validated this operation's value (typing: mean over non-superseded writes 2–20). null when none. */
  validatorSettledMs: number | null;
  /** Start mark → the measured path's marker transitioning to the expected error state in the DOM (React commit). typing: mean over exact writes 2–20. null when not observable. */
  feedbackCommittedMs: number | null;
  /** typing: writes by feedback class over all 20 writes — exact (transition observed before the next key), censored (not before the next key; counted as ≥ interval), noChange (validated, marker already in the expected state), superseded (value never validated). */
  feedbackClasses: {
    exact: number;
    censored: number;
    noChange: number;
    superseded: number;
  };
  /** mount/rebuild only: start → the onValidate report that carries the probe leaf's expected error (reset reports and reports without it are skipped). */
  validationReportedMs: number | null;
  /** Observed rAF gaps ending inside the window (typing: includes the 19 inter-key waits). */
  frames: number;
  /** Median of ten empty rAF gaps observed before the window; the sample fails unless it is within 3 ms of 1000/60 or 1000/120. */
  frameIntervalMs: number;
  /** Detected nominal compositor period: 1000 / 60 or 1000 / 120 ms; unsupported cadence fails the sample. */
  frameIntervalNominalMs: number;
  /** Longest observed rAF gap ending inside the window. */
  longestFrameMs: number;
  /** Sum over window gaps of the part above the 16.7 ms budget. */
  frameOverflowMs: number;
  /** Window gaps longer than the 16.7 ms budget. */
  overBudgetFrames: number;
  /** typing: writes whose attributed run started only after a later write's capture. */
  coalescedWrites: number;
}

/** One write's attribution inside a typing or first-key sample. */
export interface CoreWriteMetrics {
  /** One-based write order. */
  index: number;
  /** Native input value after the write. */
  value: string;
  /** Capture→bubble handler duration of this write. */
  handlerMs: number;
  /** Capture → settle of the first run whose probe value equals this write's value; null when superseded. */
  validatorSettledMs: number | null;
  /** Capture → marker transition to the expected state before the next capture; null unless exact. */
  feedbackCommittedMs: number | null;
  /** Attribution class of the visible feedback. */
  feedbackClass: CoreFeedbackClass;
  /** Whether the attributed run started after the next write's capture. */
  coalesced: boolean;
}

/** One page's measurement; typing durations are milliseconds per write. */
export interface CoreMeasurement {
  /** Mount/rebuild/first-key latency, or mean typing handler duration. */
  durationMs: number;
  /** Coverage evidence for the scalar rather than an inferred sample count. */
  counts: CoreCounts;
  /** Blocking, settle, feedback and frame observations for the same operation. */
  metrics: CoreMetrics;
  /** Per-write attribution for typing and first-key samples. */
  writes?: CoreWriteMetrics[];
}

/** Browser-owned clocks injected into observers so tests can drive them. */
export interface CoreObservationEnv {
  /** Monotonic millisecond clock (performance.now in the page). */
  now(): number;
  /** Schedule one callback on the next animation frame. */
  requestAnimationFrame(callback: () => void): void;
  /** Schedule one callback after a delay independent of frames. */
  setTimeout(callback: () => void, delayMs: number): void;
}

/** One marker attribute change (or marker insertion) in browser clock terms. */
export interface CoreMarkerTransition {
  /** Browser clock reading inside the mutation callback. */
  atMs: number;
  /** New `data-core-error` value. */
  state: '0' | '1';
}

/** One onValidate report in browser clock terms. */
export interface CoreValidationReport {
  /** Browser clock reading inside the callback. */
  atMs: number;
  /** Whether the report carried an error at the probe path. */
  probeError: boolean;
}

/** Long Task entry fields used by the window filter. */
export interface CoreLongTaskEntry {
  /** Task start on the page's performance clock. */
  startTime: number;
  /** Original task duration, 1 ms resolution, at least 50 ms. */
  duration: number;
}

/** Records kept by the validator wrapper for the whole page lifetime. */
export interface CoreValidatorObservation {
  /** Every compile and run since the page loaded, in call order. */
  records: CoreValidatorRecord[];
  /** Runs whose verdict promise has not settled yet. */
  pending: ReadonlySet<CoreValidatorRecord>;
}

/** Marker DOM evidence for the measured path. */
export interface CoreMarkerObservation {
  /** Attribute changes and insertions of the marker, in DOM order, consecutive duplicates dropped. */
  transitions: CoreMarkerTransition[];
  /** Current `data-core-error` of the single marker; null while no marker exists. */
  state(): '0' | '1' | null;
  /** Marker elements currently in the container. */
  count(): number;
}

/** Long Task delivery abstraction over PerformanceObserver so tests can inject entries. */
export type CoreLongTaskSource = (
  deliver: (entries: CoreLongTaskEntry[]) => void,
) => {
  /** Entries queued but not yet delivered. */
  takeRecords(): CoreLongTaskEntry[];
  /** Stop delivery. */
  disconnect(): void;
};

/** Browser API consumed by the core Playwright runner. */
export interface CoreAPI {
  /** Mount exactly one fixture; first-key is driven from the first-paint hook, after any case-specific load wait. */
  prepare(id: string): Promise<void>;
  /** Complete the selected operation and return validated evidence. */
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
    /** Driver sends the first trusted key from the initial paint hook, after any requested load wait. */
    __coreFirstKey: () => Promise<void>;
    /** Driver sends twenty trusted keys with the fixture's nonburst spacing. */
    __coreType: () => Promise<void>;
  }
}
