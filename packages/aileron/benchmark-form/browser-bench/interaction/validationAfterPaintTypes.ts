import type { InputFixture } from '../../fixtures/input-responsiveness/types';
import type { PageRecord, SummaryRow } from './types';

/** Stage-specific controls keep earlier browser fixtures unchanged. */
export interface ValidationAfterPaintFixture extends InputFixture {
  firstKey?: boolean;
  streamFrames?: number;
}
/** A frame-driven stream retains both the write interval and the following verdicts. */
export interface ValidationAfterPaintPage extends PageRecord {
  stream?: {
    startedAt: number;
    endedAt: number;
    durationMs: number;
    scriptMs: number[];
    writeFrames: number;
    validationRuns: number;
  };
}
/** Numeric rows preserve coverage beside every censored-source value. */
export interface ValidationAfterPaintRow extends SummaryRow {
  keys: number;
  processingSource: 'event' | 'handler';
  durationSource: 'event' | 'handler';
  processingP95: number | null;
  durationP95: number | null;
  firstPaintedMs: { median: number | null; p95: number | null };
  inputDelay: {
    median: number | null;
    p95: number | null;
    observations: number;
  };
}
/** Uncertainty never becomes a pass. */
export interface ValidationAfterPaintGate {
  id: string;
  status: 'PASS' | 'FAIL' | 'INDETERMINATE';
  details: unknown;
}

/** Browser-only API; each fresh page serves exactly one fixture. */
export interface ValidationAfterPaintAPI {
  prepare(id: string): Promise<ValidationAfterPaintFixture>;
  begin(): void;
  stream(): Promise<void>;
  waitForNextKey(): Promise<void>;
  finish(): Promise<ValidationAfterPaintPage>;
}
declare global {
  interface Window {
    __ir6: ValidationAfterPaintAPI;
    __ir6FirstKey: () => Promise<void>;
  }
}
