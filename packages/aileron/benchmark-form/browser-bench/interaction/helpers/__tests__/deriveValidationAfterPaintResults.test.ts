import { describe, expect, it } from 'vitest';

import cases from '../../../../fixtures/input-responsiveness/ir-6-cases.json';
import type { PageRecord } from '../../types';
import { deriveValidationAfterPaintResults } from '../deriveValidationAfterPaintResults';
import { summarizePage } from '../summarizePage';
import type { SampleResult } from '../summarizeResults';
import { bootstrapProcessingRatio } from '../validationAfterPaint/bootstrapProcessingRatio';
import { decideValidationAfterPaintGates } from '../validationAfterPaint/decideValidationAfterPaintGates';

/** Synthetic pages keep one censored-source observation and twenty dispatched keys. */
function fixture(processing = { L: 6.425, E: 2, F: 1 }) {
  const pages: Record<string, PageRecord> = {};
  const samples: SampleResult[] = [];
  for (const id of cases)
    for (const lane of ['L', 'E', 'F'] as const)
      for (let index = 0; index < 10; index++) {
        const value = processing[lane];
        const page = {
          start: 0,
          end: 1000,
          observedUntil: 1200,
          handlers: Array.from({ length: 20 }, (_, key) => ({
            sequence: key + 1,
            type: 'input',
            start: key + 1,
            value: 'a',
            trusted: true,
            wallMs: value,
          })),
          validations: Array.from({ length: 20 }, (_, key) => ({
            sequence: key + 1,
            at: key + 11,
            arrivalMs: 10,
            value: 'a',
            errors: key % 2,
          })),
          events: [
            {
              interactionId: 1,
              startTime: 1,
              processingStart: 2,
              processingEnd: 2 + value,
              duration: 16,
            },
          ],
          firstInputs: [],
          frames: [],
          supported: ['event', 'long-animation-frame'],
          mount: {
            startedAt: 0,
            firstPaintedMs: 10,
            wallMs: 10,
            eagerPaintedMs: 20,
            allRevealedMs: 20,
            eagerNodes: 20,
            allNodes: 20,
            eagerDeferred: 0,
            allDeferred: 0,
            inputs: 500,
          },
          final: { inputs: 500, counter: 0, targetValue: 'a', branch: null },
          stream: {
            startedAt: 0,
            endedAt: 1000,
            durationMs: 1000,
            scriptMs: [1],
            writeFrames: 60,
            validationRuns: lane === 'F' ? 10 : 60,
          },
        };
        const file = `${id}-${lane}-${index}.json`;
        pages[file] = page;
        samples.push({ id, lane, index, file, summary: summarizePage(page) });
      }
  return { pages, samples };
}
const derive = (data: ReturnType<typeof fixture>) =>
  deriveValidationAfterPaintResults(data.samples, 'quiet', data.pages);
const gate = (data: ReturnType<typeof derive>, id: string) =>
  data.gates.find((entry) => entry.id === id)!;

describe('pre-registered validation-after-paint decisions', () => {
  it('passes complete evidence and keeps G7 absent', () => {
    const result = derive(fixture());
    expect(result.gates.map((entry) => entry.id)).toEqual([
      'G1',
      'G2',
      'G3',
      'G4',
      'G5',
      'G6',
      'G8',
    ]);
    expect(result.gates.every((entry) => entry.status === 'PASS')).toBe(true);
    expect(result.bootstrap.resamples).toBe(10000);
    expect(result.rows[0].processing.observations).toBe(10);
    expect(result.rows[0].keys).toBe(200);
  });
  it('uses the registered L-median transfer without changing the relative gate', () => {
    const result = derive(fixture({ L: 7.5, E: 20, F: 17 }));
    expect(gate(result, 'G1').status).toBe('PASS');
    expect(result.g1.transferFactor).toBeCloseTo(6.425 / 7.5);
  });
  it('marks a noncomparable L window indeterminate even when F is fast', () => {
    expect(gate(derive(fixture({ L: 9, E: 2, F: 1 })), 'G1').status).toBe(
      'INDETERMINATE',
    );
  });
  it('rejects a pooled processing ratio above the registered G2 bound', () => {
    expect(gate(derive(fixture({ L: 6.425, E: 1, F: 2 })), 'G2').status).toBe(
      'FAIL',
    );
  });
  it('rejects a missing LoAF source and an undelivered nonburst verdict', () => {
    const data = fixture();
    data.pages['type-flat-500-validate-nonburst-F-0.json'].supported = [
      'event',
    ];
    data.pages['type-flat-500-validate-nonburst-F-0.json'].validations.shift();
    const result = derive(data);
    expect(gate(result, 'G3').status).toBe('FAIL');
    expect(gate(result, 'G4').status).toBe('FAIL');
  });
  it('rejects a first-paint regression and the array None guard regression', () => {
    const data = fixture();
    for (const [file, page] of Object.entries(data.pages))
      if (file.startsWith('mount-') && file.includes('-F-'))
        Object.assign(page.mount, { firstPaintedMs: 11 });
    const result = derive(data);
    expect(gate(result, 'G5').status).toBe('FAIL');
    expect(gate(result, 'G8').status).toBe('FAIL');
  });
  it('rejects stream runs above the cap-derived bound', () => {
    const data = fixture();
    Object.assign(data.pages['stream-flat-2000-validate-F-0.json'], {
      stream: {
        ...(data.pages['stream-flat-2000-validate-F-0.json'] as any).stream,
        durationMs: 1000,
        validationRuns: 13,
      },
    });
    expect(gate(derive(data), 'G6').status).toBe('FAIL');
  });
  it('resamples the same page indices across heterogeneous paired lanes', () => {
    const before = [1, 3, 20, 80].map((value) => ({
      processing: [value],
      handler: [value],
    }));
    const after = before.map((page) => ({
      processing: page.processing.map((value) => value * 2),
      handler: [],
    }));
    expect(bootstrapProcessingRatio(before, after).upperBound).toBe(2);
  });
  it('rejects duration and frame-count regressions independently', () => {
    const duration = fixture();
    duration.pages[
      'type-flat-500-validate-nonburst-F-0.json'
    ].events[0].duration = 32;
    expect(gate(derive(duration), 'G3').status).toBe('FAIL');
    const frames = fixture();
    frames.pages['type-flat-500-validate-nonburst-F-0.json'].frames = [
      { startTime: 10, duration: 50 },
      { startTime: 70, duration: 50 },
    ];
    expect(gate(derive(frames), 'G3').status).toBe('FAIL');
  });
  it('uses handler fallback for absent Event Timing and preserves zero denominators as uncertainty', () => {
    const data = fixture();
    for (const page of Object.values(data.pages)) page.events = [];
    const result = derive(data);
    expect(result.rows.find((row) => row.lane === 'F')!.processingSource).toBe(
      'handler',
    );
    expect(gate(result, 'G1').status).toBe('PASS');
    const zero = fixture({ L: 6.425, E: 0, F: 1 });
    expect(gate(derive(zero), 'G2').status).toBe('INDETERMINATE');
  });

  it('round6 judges every handler while retaining the censored Event Timing decision', () => {
    const data = fixture();
    for (const [file, page] of Object.entries(data.pages))
      if (file.startsWith('type-flat-500-validate-burst-F-'))
        page.events[0].processingEnd = page.events[0].processingStart + 8;
    const result = deriveValidationAfterPaintResults(
      data.samples,
      'quiet',
      data.pages,
      'round-6',
    );
    expect(gate(result, 'G2').status).toBe('PASS');
    expect(
      result.originalGates?.find((entry) => entry.id === 'G2')?.status,
    ).toBe('FAIL');
    expect(
      result.handlerEvidence?.['type-flat-500-validate-burst'].E.keys,
    ).toBe(200);
    expect(
      result.handlerEvidence?.['type-flat-500-validate-burst'].F.keys,
    ).toBe(200);
  });

  it('round6 accepts exactly half a frame of eager cost and reports the original guard', () => {
    const data = fixture();
    for (const [file, page] of Object.entries(data.pages))
      if (file.startsWith('mount-array-1000-') && file.includes('-F-'))
        page.mount.eagerPaintedMs = 20 + 8.35;
    const result = deriveValidationAfterPaintResults(
      data.samples,
      'quiet',
      data.pages,
      'round-6',
    );
    expect(gate(result, 'G8').status).toBe('PASS');
    expect(
      result.originalGates?.find((entry) => entry.id === 'G8')?.status,
    ).toBe('FAIL');
  });

  it('round6 rejects eager above half a frame and preserves the first-painted limits', () => {
    const data = fixture();
    for (const [file, page] of Object.entries(data.pages))
      if (file.startsWith('mount-array-1000-') && file.includes('-F-'))
        page.mount.eagerPaintedMs = 20 + 8.350001;
    expect(
      gate(
        deriveValidationAfterPaintResults(
          data.samples,
          'quiet',
          data.pages,
          'round-6',
        ),
        'G8',
      ).status,
    ).toBe('FAIL');
    const first = fixture();
    for (const [file, page] of Object.entries(first.pages))
      if (file.startsWith('mount-array-1000-') && file.includes('-F-'))
        page.mount.firstPaintedMs = 11;
    expect(
      gate(
        deriveValidationAfterPaintResults(
          first.samples,
          'quiet',
          first.pages,
          'round-6',
        ),
        'G8',
      ).status,
    ).toBe('FAIL');
  });

  it('round6 leaves missing handler values and zero handler denominators indeterminate', () => {
    for (const missing of [false, true]) {
      const data = fixture();
      for (const [file, page] of Object.entries(data.pages))
        if (file.startsWith('type-flat-500-validate-burst-E-')) {
          if (missing) page.handlers = [];
          else for (const handler of page.handlers) handler.wallMs = 0;
        }
      const result = deriveValidationAfterPaintResults(
        data.samples,
        'quiet',
        data.pages,
        'round-6',
      );
      expect(gate(result, 'G2').status).toBe('INDETERMINATE');
    }
  });

  it('selects the G8 guard from the explicit version independently of handler evidence', () => {
    const data = fixture();
    for (const [file, page] of Object.entries(data.pages))
      if (file.startsWith('mount-array-1000-') && file.includes('-F-'))
        page.mount.eagerPaintedMs = 20 + 8.35;
    const result = derive(data);
    const decide = (
      handler: typeof result.bootstrap.rows | undefined,
      version?: 'round-6',
    ) =>
      decideValidationAfterPaintGates(
        result.rows,
        result.bootstrap.rows,
        data.samples,
        data.pages,
        handler,
        version,
      ).gates.find((entry) => entry.id === 'G8')!.status;
    expect(decide(undefined, 'round-6')).toBe('PASS');
    expect(decide(result.bootstrap.rows)).toBe('FAIL');
  });
});
