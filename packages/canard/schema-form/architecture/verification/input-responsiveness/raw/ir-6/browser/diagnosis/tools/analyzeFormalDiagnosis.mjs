// Invoked from repository root; diagnostics replay formal raw without changing any registered verdict.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';

import { groupInteractions } from './helpers/groupInteractions.mjs';
import { quantiles } from './helpers/quantiles.mjs';
import { replayBootstrap } from './helpers/replayBootstrap.mjs';

const base = path.resolve(
  'packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/browser',
);
const raw = path.join(base, 'main');
const output = path.join(base, 'diagnosis');
const pages = JSON.parse(
  gunzipSync(fs.readFileSync(path.join(raw, 'pages.json.gz'))),
);
const formal = JSON.parse(
  fs.readFileSync(path.join(raw, 'bootstrap.json'), 'utf8'),
);
const row = 'type-flat-500-validate-burst';
const perLane = Object.fromEntries(
  ['E', 'F'].map((lane) => [
    lane,
    Array.from({ length: 10 }, (_, index) => {
      const page = pages[`${row}-${lane}-${index}.json`];
      const observations = groupInteractions(page);
      const values = observations
        .map((entry) => entry.processing)
        .sort((a, b) => a - b);
      return {
        index,
        observations,
        values,
        pageP95: values.length
          ? values[Math.ceil(values.length * 0.95) - 1]
          : null,
        handler: page.handlers.map((entry) => entry.wallMs),
      };
    }),
  ]),
);
const e = perLane.E.map((page) => page.values),
  f = perLane.F.map((page) => page.values);
const baseline = replayBootstrap(e, f);
assert.equal(
  baseline.upperBound,
  formal.rows[row].upperBound,
  'Independent replay exactly matches registered bootstrap',
);
const worst = Object.fromEntries(
  ['E', 'F'].map((lane) => [
    lane,
    [...perLane[lane]].sort(
      (a, b) => (b.pageP95 ?? -1) - (a.pageP95 ?? -1) || a.index - b.index,
    )[0].index,
  ]),
);
const omit = (values, index) => values.filter((_page, at) => at !== index);
const sensitivity = {
  diagnosticOnly: true,
  worstPageIndices: worst,
  independentRemoveEOnly: replayBootstrap(omit(e, worst.E), f, {
    independent: true,
  }).upperBound,
  independentRemoveFOnly: replayBootstrap(e, omit(f, worst.F), {
    independent: true,
  }).upperBound,
  independentRemoveEachWorst: replayBootstrap(
    omit(e, worst.E),
    omit(f, worst.F),
    { independent: true },
  ).upperBound,
  jointDropEWorstPair: replayBootstrap(omit(e, worst.E), omit(f, worst.E))
    .upperBound,
  jointDropFWorstPair: replayBootstrap(omit(e, worst.F), omit(f, worst.F))
    .upperBound,
  jointLeaveEachPair: Object.fromEntries(
    Array.from({ length: 10 }, (_, index) => [
      index,
      replayBootstrap(omit(e, index), omit(f, index)).upperBound,
    ]),
  ),
  handlerAllKeysJointUpper: replayBootstrap(
    perLane.E.map((page) => page.handler),
    perLane.F.map((page) => page.handler),
  ).upperBound,
  note: 'Independent leave-one-lane-out loses the registered page pairing and is labelled separately. Joint pair deletion preserves pairing. No result replaces G2.',
};
const tail = baseline.rows.filter(
  (sample) => sample.ratio >= baseline.upperBound,
);
const drivers = Object.fromEntries(
  ['E', 'F'].map((lane) => [
    lane,
    perLane[lane].map((page) => ({
      index: page.index,
      pageP95: page.pageP95,
      observations: page.values.length,
      tailPresence:
        tail.filter((sample) => sample['indices' + lane].includes(page.index))
          .length / tail.length,
      tailMeanCopies:
        tail.reduce(
          (sum, sample) =>
            sum +
            sample['indices' + lane].filter((index) => index === page.index)
              .length,
          0,
        ) / tail.length,
    })),
  ]),
);
const pooledF = f.flat().sort((a, b) => a - b),
  threshold = pooledF[Math.ceil(pooledF.length * 0.95) - 1];
const slowF = perLane.F.flatMap((page) =>
  page.observations
    .filter((entry) => entry.processing >= threshold)
    .map((entry) => ({ page: page.index, ...entry })),
);
const burstRows = [
  'type-flat-500-validate-burst',
  'type-nested-d5-f4-validate-burst',
  'type-flat-2000-validate-burst',
].map((id) => ({
  id,
  lanes: Object.fromEntries(
    ['L', 'E', 'F'].map((lane) => {
      const distributions = Array.from({ length: 10 }, (_, index) => {
        const p = pages[`${id}-${lane}-${index}.json`];
        return {
          processing: groupInteractions(p).map((entry) => entry.processing),
          eventObservations: groupInteractions(p),
          handler: p.handlers.map((entry) => entry.wallMs),
          handlerKeys: p.handlers.map(({ sequence, start, end, wallMs }) => ({
            sequence,
            start,
            end,
            wallMs,
          })),
          page: index,
        };
      });
      const pageP95s = distributions
        .map((sample) => {
          const v = sample.processing.sort((a, b) => a - b);
          return v.length ? v[Math.ceil(v.length * 0.95) - 1] : null;
        })
        .filter((value) => value !== null)
        .sort((a, b) => a - b);
      assert.equal(
        distributions.flatMap((sample) => sample.handlerKeys).length,
        200,
      );
      return [
        lane,
        {
          handlerPooled: quantiles(
            distributions.flatMap((sample) => sample.handler),
          ),
          handlerFirst: quantiles(
            distributions.map((sample) => sample.handler[0]),
          ),
          handlerRest: quantiles(
            distributions.flatMap((sample) => sample.handler.slice(1)),
          ),
          handlerRowP95: quantiles(
            distributions.map((sample) => quantiles(sample.handler).p95),
          ).p95,
          rowP95: pageP95s[Math.ceil(pageP95s.length * 0.95) - 1] ?? null,
          observations: distributions.reduce(
            (sum, sample) => sum + sample.processing.length,
            0,
          ),
          keys: 200,
          distributions,
        },
      ];
    }),
  ),
}));
for (const row of burstRows)
  row.handlerBootstrap = {
    FE: replayBootstrap(
      row.lanes.E.distributions.map((sample) => sample.handler),
      row.lanes.F.distributions.map((sample) => sample.handler),
    ).upperBound,
    FL: replayBootstrap(
      row.lanes.L.distributions.map((sample) => sample.handler),
      row.lanes.F.distributions.map((sample) => sample.handler),
    ).upperBound,
  };
const result = {
  diagnosticOnly: true,
  registeredVerdictUnchanged: { G2: 'FAIL', G8: 'FAIL' },
  seed: 20261031,
  resamples: 10000,
  registeredUpperReproduced: baseline.upperBound,
  tailResamples: tail.length,
  perLane,
  sensitivity,
  drivers,
  pooledFSlowThreshold: threshold,
  slowF,
  burstRows,
};
const text = JSON.stringify(result, null, 2) + '\n';
if (process.argv.includes('--write')) {
  fs.writeFileSync(path.join(output, 'formal-drivers.json.gz'), gzipSync(text));
  fs.writeFileSync(
    path.join(output, 'bootstrap-resamples.json.gz'),
    gzipSync(JSON.stringify(baseline.rows)),
  );
} else
  assert.equal(
    gunzipSync(
      fs.readFileSync(path.join(output, 'formal-drivers.json.gz')),
    ).toString(),
    text,
  );
console.log(
  JSON.stringify(
    {
      registeredUpper: baseline.upperBound,
      sensitivity,
      slowF: slowF.map((entry) => ({
        page: entry.page,
        key: entry.key,
        processing: entry.processing,
        handler: entry.handlerMs,
        delay: entry.inputDelayMs,
      })),
      drivers,
    },
    null,
    2,
  ),
);
