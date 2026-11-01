import type {
  ValidationAfterPaintFixture,
  ValidationAfterPaintPage,
  ValidationAfterPaintRow,
} from './validationAfterPaintTypes';

/** Closing-only fixture controls; IR-6 identifiers keep their original semantics. */
export interface StageClosingFixture extends ValidationAfterPaintFixture {
  operation?: 'reset' | 'rebuild' | 'validate';
}
/** Timed validator work and frame windows share the browser performance clock. */
export interface ValidatorWork {
  kind: 'compile' | 'validate';
  start: number;
  end: number;
}
/** Every operation retains identity evidence and its full one-second frame window. */
export interface ClosingOperation {
  index: number;
  start: number;
  end: number;
  firstPaint: number;
  /** First rAF after call return; captures work before the double-rAF endpoint. */
  paintBoundary: number;
  callDuration: number;
  nextPainted: number;
  resolutionTime?: number;
  nodeChanged: boolean;
  expectedNodeChanged: boolean;
  schemaTitle?: string;
  longestFrame: number;
  longFrameCount: number;
  postPaintBusy: number;
}
/** Raw additions remain independent of derived page medians. */
export interface StageClosingPage extends ValidationAfterPaintPage {
  closing: {
    operations: ClosingOperation[];
    validatorWork: ValidatorWork[];
    mountPostPaintBusy: number;
    legacyReset: boolean;
  };
}
/** Paired resamples carry ratio and absolute median-difference bounds together. */
export interface ClosingBound {
  upperBound: number | '+Infinity' | null;
  differenceUpperBound: number | null;
  undefinedRatios: number;
}
/** Every row is reportable for all metrics, even when its gates are report-only. */
export interface StageClosingRow extends ValidationAfterPaintRow {
  metrics: Record<string, number | null>;
  firstOperation: Record<string, number | null>;
  legacyReset: boolean;
}
/** Narrow page API is consumed only by the closing sampler. */
export interface StageClosingAPI {
  operate(): Promise<void>;
  finish(): Promise<StageClosingPage>;
}
declare global {
  interface Window {
    __closing: StageClosingAPI;
  }
}

/** A pre-registered work-count deviation requires an exact delta and its design cause. */
export interface ValidatorWorkException {
  id: string;
  metric: 'compileMean' | 'validateMean' | 'unattributed';
  delta: number;
  designCause: string;
}
/** Derived plugin counts retain setup and late work independently of timed operation means. */
export interface ValidatorWorkRow {
  id: string;
  lane: string;
  units: number;
  compileCalls: number;
  validateCalls: number;
  compileMean: number;
  validateMean: number;
  setupCompileCalls: number;
  setupValidateCalls: number;
  lateCompileCalls: number;
  lateValidateCalls: number;
  unattributed: number;
  operationsWithLongFrame: number;
  longFrameFraction: number | null;
}
