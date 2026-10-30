import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

import type { PageRecord, SummaryRow } from '../types';
import { summarizePage } from './summarizePage';
import { summarizePairs } from './summarizePairs';
import type { SampleResult } from './summarizeResults';
import { summarizeResults } from './summarizeResults';

/**
 * Rebuild the three IR-1 derived records from retained pages and compare every field.
 * @param destination - Input-responsiveness evidence directory containing raw/ir-0 and raw/ir-1.
 * @returns Nothing; prints a success marker only after all regenerated records agree.
 * @throws When a page summary or any derived value differs from preserved evidence.
 */
export function checkDerivedRecords(destination: string) {
  const raw = path.join(destination, 'raw/ir-1');
  const read = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
  const suites = ['main', 'quiet', 'backfill'].map((suite) => {
    const directory = path.join(raw, suite);
    const complete = JSON.parse(
      gunzipSync(
        fs.readFileSync(path.join(directory, 'complete.json.gz')),
      ).toString(),
    );
    const pages: Record<string, PageRecord> = JSON.parse(
      gunzipSync(
        fs.readFileSync(path.join(directory, 'pages.json.gz')),
      ).toString(),
    );
    const samples = (complete.samples as SampleResult[]).map((sample) => {
      const summary = summarizePage(pages[sample.file]);
      assert.deepEqual(summary, sample.summary, sample.file);
      return { ...sample, summary };
    });
    return { complete, pages, samples, rows: summarizeResults(samples) };
  });
  const [main, quiet, backfill] = suites;
  const baseline: SummaryRow[] = read(
    path.join(destination, 'raw/ir-0/summary.json'),
  );
  const pairs = summarizePairs(main.samples) as Array<{
    id: string;
    lane: string;
    metric: string;
    ratioMedian: number | null;
  }>;
  const find = (rows: SummaryRow[], id: string, lane: string) =>
    rows.find((row) => row.id === id && row.lane === lane)!;
  const gates: object[] = [];
  for (const id of ['mount-flat-500-off', 'mount-nested-d5-f4-off']) {
    const ratio = pairs.find(
      (pair) => pair.id === id && pair.lane === 'A' && pair.metric === 'wallMs',
    )!.ratioMedian!;
    const reference = find(baseline, id, 'L').mount.wallMs.median!;
    const converted = ratio * reference;
    gates.push({
      id,
      metric: 'wallMs',
      lane: 'A',
      method: 'median-paired-ratio',
      ratio,
      reference,
      converted,
      limit: reference,
      pass: converted <= reference,
      provisional: false,
    });
  }
  for (const id of quiet.complete.cases as string[]) {
    const a = find(main.rows, id, 'AB'),
      l = find(main.rows, id, 'L'),
      q = find(quiet.rows, id, 'AB');
    const reference = baseline.find((row) => row.id === id && row.lane === 'L');
    const source =
      a.processing.p95 !== null && l.processing.p95 !== null
        ? 'processing'
        : 'handler';
    const converted =
      reference && l[source].p95
        ? (a[source].p95! / l[source].p95!) * reference[source].p95!
        : null;
    const actual = q.processing.p95 ?? q.handler.p95!;
    gates.push({
      id,
      metric: source + 'P95',
      lane: 'AB',
      method: 'ratio-of-window-p95',
      numerator: a[source].p95,
      denominator: l[source].p95,
      reference: reference?.[source].p95 ?? null,
      converted,
      limit: 16.67,
      pass: converted === null ? null : converted <= 16.67,
      provisional: true,
      quiet: actual,
      quietPass: actual <= 16.67,
    });
  }
  for (const id of [
    'replace-200-while-typing',
    'replace-200-while-typing-virtualized',
  ]) {
    const a = find(main.rows, id, 'AB'),
      l = find(main.rows, id, 'L'),
      q = find(quiet.rows, id, 'AB');
    const reference = baseline.find((row) => row.id === id && row.lane === 'L');
    const converted =
      reference && l.longestFrame
        ? (a.longestFrame / l.longestFrame) * reference.longestFrame
        : null;
    gates.push({
      id,
      metric: 'longestFrame',
      lane: 'AB',
      method: 'ratio-of-window-maxima',
      numerator: a.longestFrame || null,
      denominator: l.longestFrame || null,
      reference: reference?.longestFrame ?? null,
      converted,
      limit: 50,
      pass: converted === null ? null : converted <= 50,
      provisional: true,
      quiet: q.longestFrame || null,
      quietBound: q.longestFrame ? null : '<50',
      quietPass: q.longestFrame <= 50,
    });
  }
  const id = 'validation-flat-500-nonburst';
  const a = find(main.rows, id, 'AB'),
    l = find(main.rows, id, 'L'),
    reference = find(baseline, id, 'L'),
    q = find(quiet.rows, id, 'AB');
  const converted =
    (a.validation.p95! / l.validation.p95!) * reference.validation.p95!;
  gates.push({
    id,
    metric: 'validationP95',
    lane: 'AB',
    method: 'ratio-of-window-p95',
    numerator: a.validation.p95,
    denominator: l.validation.p95,
    reference: reference.validation.p95,
    converted,
    limit: 33.4,
    pass: converted <= 33.4,
    provisional: true,
    quiet: q.validation.p95,
    quietPass: q.validation.p95! <= 33.4,
  });
  assert.deepEqual(
    gates,
    read(path.join(raw, 'gate-transfer.json')),
    'gate-transfer.json',
  );

  const lanes = ['L', 'E0', 'A', 'AB'].map((lane) => {
    const values = quiet.samples
      .filter(
        (sample) =>
          sample.id === 'replace-200-while-typing' && sample.lane === lane,
      )
      .map((sample) => sample.summary.longestFrame);
    const minimum = Math.min(...values);
    return {
      lane,
      minimumDetectedPageMaximum: minimum || null,
      minimumBound: minimum ? null : '<50',
      maximum: Math.max(...values),
      perPage: values,
    };
  });
  const first = lanes.find((lane) => lane.lane === 'A')!,
    second = lanes.find((lane) => lane.lane === 'AB')!;
  const firstMin = Math.min(...first.perPage),
    secondMin = Math.min(...second.perPage);
  const difference = second.maximum - first.maximum;
  const spread = {
    lanes,
    maxDifferenceABminusA: difference,
    rangesOverlap:
      Math.max(firstMin, secondMin) <= Math.min(first.maximum, second.maximum),
    differenceWithinObservedSpread:
      difference <=
      Math.max(first.maximum - firstMin, second.maximum - secondMin),
  };
  assert.deepEqual(
    spread,
    read(path.join(raw, 'replace-spread.json')),
    'replace-spread.json',
  );

  const frames = (backfill.complete.cases as string[]).flatMap((id) =>
    (backfill.complete.inputs.lanes as string[]).map((lane) => {
      const samples = backfill.samples.filter(
        (sample) => sample.id === id && sample.lane === lane,
      );
      const afterEager = samples.flatMap((sample) => {
        const page = backfill.pages[sample.file];
        return page.frames
          .filter(
            (frame) =>
              frame.startTime >=
                page.mount.startedAt! + page.mount.eagerPaintedMs &&
              frame.startTime <=
                page.mount.startedAt! + page.mount.allRevealedMs,
          )
          .map((frame) => frame.duration);
      });
      return {
        id,
        lane,
        fullMountLongestFrame: Math.max(
          ...samples.map((sample) => sample.summary.longestFrame),
        ),
        afterEagerLongestFrame: afterEager.length
          ? Math.max(...afterEager)
          : null,
        afterEagerLongFrameCount: afterEager.length,
      };
    }),
  );
  assert.deepEqual(
    frames,
    read(path.join(raw, 'backfill/backfill-frame-attribution.json')),
    'backfill-frame-attribution.json',
  );
  console.log('IR1_DERIVED_REPRODUCED gates=10 spread=4 backfill=12');
}
