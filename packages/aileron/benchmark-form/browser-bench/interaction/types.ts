import type { InputFixture } from '../../fixtures/input-responsiveness/types';

/** Unmodified browser PerformanceEntry.toJSON output, including API-specific fields. */
export type Entry = Record<string, any>;

/** One trusted input/change event observed across React's delegated event handler. */
export interface HandlerRecord {
  sequence: number;
  type: string;
  start: number;
  end?: number;
  wallMs?: number;
  value: string;
  trusted: boolean;
}

/** First or subsequent onValidate deliveries retain the input value at delivery. */
export interface ValidationRecord {
  sequence: number;
  at: number;
  arrivalMs: number;
  value: string;
  errors: number;
}

/** DOM snapshots at measured render milestones. */
export interface MountRecord {
  /** Page-clock render start for mount-frame attribution. */
  startedAt?: number;
  wallMs: number;
  eagerPaintedMs: number;
  allRevealedMs: number;
  eagerNodes: number;
  allNodes: number;
  eagerDeferred: number;
  allDeferred: number;
  inputs: number;
}

/** Complete page evidence; every API entry is kept before summary filtering. */
export interface PageRecord {
  /** Cumulative process counters around this page, excluding runner ancestors and browser descendants. */
  externalCpu?: {
    startedAt: string;
    endedAt: string;
    durationSeconds: number;
    excluded: number[];
    rows: { pid: number; name: string; cpuPercent: number }[];
  };
  start: number;
  end: number;
  observedUntil: number;
  handlers: HandlerRecord[];
  validations: ValidationRecord[];
  events: Entry[];
  firstInputs: Entry[];
  frames: Entry[];
  supported: string[];
  mount: MountRecord;
  final: {
    inputs: number;
    counter: number;
    targetValue: string;
    branch: string | null;
  };
}

/** Page API wired by the interaction harness and invoked by Playwright only. */
export interface InteractionAPI {
  prepare(id: string): Promise<InputFixture>;
  begin(): void;
  finish(): Promise<PageRecord>;
  replace(): Promise<void>;
}

/** Across-page quantiles, with observation coverage kept beside the number. */
export interface SummaryMetric {
  median: number | null;
  p95: number | null;
  observations: number;
  observedSamples: number;
}

/** One fixture/lane row; raw page summaries reproduce every value. */
export interface SummaryRow {
  id: string;
  lane: string;
  count: number;
  processing: SummaryMetric;
  total: SummaryMetric;
  handler: SummaryMetric;
  validation: SummaryMetric;
  undelivered: number;
  longestFrame: number;
  longFrameCount: number;
  eventSupported: boolean;
  frameSupported: boolean;
  mount: Record<string, { median: number | null; p95: number | null }>;
}

declare global {
  interface Window {
    /** Installed once after production React and the lane bundle load. */
    __ir0: InteractionAPI;
  }
  /** Replaced by esbuild; one product lane per page bundle. */
  const __IR0_LANE__: string;
}
