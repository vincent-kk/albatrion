import cases from '../../../../../../fixtures/input-responsiveness/closing-cases.json';
import type {
  ClosingBound,
  StageClosingPage,
  StageClosingRow,
} from '../../../../stageClosingTypes';
import type { ValidationAfterPaintGate } from '../../../../validationAfterPaintTypes';
import { summarizePage } from '../../../summarizePage';
import type { SampleResult } from '../../../summarizeResults';

/** Deterministic complete evidence gives every blocking gate a known passing baseline. */
export function closingGateFixture() {
  const rows: StageClosingRow[] = [],
    bounds: Record<string, Record<string, ClosingBound>> = {};
  const samples: SampleResult[] = [],
    pages: Record<string, StageClosingPage> = {};
  for (const id of cases) {
    bounds[id] = Object.fromEntries(
      [
        'processing',
        'firstPainted',
        'eagerPainted',
        'callDuration',
        'nextPainted',
        'resolutionTime',
      ].map((key) => [
        key,
        { upperBound: 1, differenceUpperBound: 0, undefinedRatios: 0 },
      ]),
    );
    for (const lane of ['B', 'F'])
      rows.push({
        id,
        lane,
        count: 10,
        processing: {
          median: 1,
          p95: 1,
          observations: 200,
          observedSamples: 10,
        },
        total: { median: 16, p95: 16, observations: 200, observedSamples: 10 },
        handler: { median: 1, p95: 1, observations: 200, observedSamples: 10 },
        validation: {
          median: 10,
          p95: 10,
          observations: 200,
          observedSamples: 10,
        },
        undelivered: 0,
        longestFrame: 0,
        longFrameCount: 0,
        eventSupported: true,
        frameSupported: true,
        mount: {},
        keys: id.startsWith('type-') ? 200 : 0,
        processingSource: 'event',
        durationSource: 'event',
        processingP95: 1,
        durationP95: 16,
        firstPaintedMs: { median: 20, p95: 20 },
        inputDelay: { median: 0, p95: 0, observations: 200 },
        metrics: {},
        firstOperation: {},
        legacyReset: false,
      });
  }
  for (let index = 0; index < 10; index++) {
    const page: StageClosingPage = {
      start: 0,
      end: 1000,
      observedUntil: 1200,
      handlers: [],
      validations: [],
      events: [],
      firstInputs: [],
      frames: [],
      supported: ['event', 'long-animation-frame'],
      mount: {
        firstPaintedMs: 20,
        startedAt: 0,
        wallMs: 20,
        eagerPaintedMs: 30,
        allRevealedMs: 30,
        eagerNodes: 500,
        allNodes: 500,
        eagerDeferred: 0,
        allDeferred: 0,
        inputs: 500,
      },
      final: { inputs: 500, counter: 0, targetValue: '', branch: null },
      stream: {
        startedAt: 0,
        endedAt: 1000,
        durationMs: 1000,
        scriptMs: [1],
        writeFrames: 60,
        validationRuns: 12,
      },
      closing: {
        operations: [],
        validatorWork: [],
        mountPostPaintBusy: 0,
        legacyReset: false,
      },
    };
    const file = 'stream-' + index;
    pages[file] = page;
    samples.push({
      id: 'stream-flat-2000-validate',
      lane: 'F',
      index,
      file,
      summary: summarizePage(page),
    });
  }
  const ir6: ValidationAfterPaintGate[] = [
    'G1',
    'G2',
    'G3',
    'G4',
    'G5',
    'G6',
    'G8',
  ].map((id) => ({ id, status: 'PASS', details: {} }));
  return {
    rows,
    bounds,
    samples,
    pages,
    ir6B: structuredClone(ir6),
    ir6S: structuredClone(ir6),
  };
}
