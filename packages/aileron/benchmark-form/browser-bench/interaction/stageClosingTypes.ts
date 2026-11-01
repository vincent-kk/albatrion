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
  upperBound: number | null;
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
