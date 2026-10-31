// Run from repository root; write or verify diagnostic aggregates without altering the formal table block.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';

import { attributeCpuProfile } from './helpers/attributeCpuProfile.mjs';
import { groupInteractions } from './helpers/groupInteractions.mjs';

const directory = path.resolve(
  process.argv.find((arg) => arg.startsWith('--input='))?.slice(8),
);
const bundleArgument = process.argv
  .find((arg) => arg.startsWith('--bundles='))
  ?.slice(10);
const complete = JSON.parse(
  fs.readFileSync(path.join(directory, 'diagnostic-complete.json'), 'utf8'),
);
assert.equal(complete.diagnosticOnly, true);
const sites = !complete.profile
  ? {}
  : bundleArgument
    ? Object.fromEntries(
        complete.lanes.map((lane) => {
          const bytes = fs.readFileSync(
            path.join(bundleArgument, lane, 'bundle.js'),
          );
          const source = bytes.toString();
          const index = source.indexOf('var FieldInputSlot =');
          return [
            lane,
            {
              sha256: createHash('sha256').update(bytes).digest('hex'),
              slotLine:
                index < 0 ? -1 : source.slice(0, index).split('\n').length - 1,
            },
          ];
        }),
      )
    : JSON.parse(
        fs.readFileSync(path.join(directory, 'bundle-sites.json'), 'utf8'),
      );
if (complete.profile && bundleArgument && process.argv.includes('--write'))
  fs.writeFileSync(
    path.join(directory, 'bundle-sites.json'),
    JSON.stringify(sites, null, 2) + '\n',
  );
const read = (name) =>
  JSON.parse(gunzipSync(fs.readFileSync(path.join(directory, name))));
const median = (values) => {
  const v = [...values].sort((a, b) => a - b);
  return v.length % 2
    ? v[v.length >> 1]
    : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
};
const rows = [],
  pageAttribution = [],
  slowKeys = [];
for (const id of complete.cases)
  for (const lane of complete.lanes) {
    const samples = complete.samples.filter(
      (sample) => sample.id === id && sample.lane === lane,
    );
    const group = {
      id,
      lane,
      count: samples.length,
      firstMedian: median(samples.map((sample) => sample.firstPaintedMs)),
      eagerMedian: median(samples.map((sample) => sample.eagerPaintedMs)),
      groupMs: Object.create(null),
      functions: Object.create(null),
    };
    if (complete.profile)
      for (const sample of samples) {
        const page = read(sample.file),
          prefix = sample.file.replace('.page.json.gz', '');
        const cpu = read(prefix + '.cpuprofile.json.gz'),
          trace = read(prefix + '.trace.json.gz');
        const source = sites[lane].slotLine;
        const burst = id.startsWith('type-');
        const from = burst ? page.record.start : page.record.mount.startedAt;
        const to = burst
          ? page.record.end
          : from + page.record.mount.eagerPaintedMs;
        const attribution = attributeCpuProfile(
          cpu,
          page.clock,
          from,
          to,
          source,
          burst ? 'burst' : 'mount',
        );
        pageAttribution.push({ id, lane, index: sample.index, ...attribution });
        for (const [name, value] of Object.entries(attribution.groups)) {
          const total = (group.groupMs[name] ??= { selfMs: 0, inclusiveMs: 0 });
          total.selfMs += value.selfMs / samples.length;
          total.inclusiveMs += value.inclusiveMs / samples.length;
        }
        for (const value of attribution.functions) {
          const total = (group.functions[value.name] ??= {
            ...value,
            selfMs: 0,
            totalMs: 0,
          });
          total.selfMs += value.selfMs / samples.length;
          total.totalMs += value.totalMs / samples.length;
        }
        if (burst) {
          const interactions = groupInteractions(page.record);
          const first = page.record.handlers[0];
          if (first)
            interactions.push({
              source:
                'handler-only diagnostic interval, not native Event Timing',
              key: 1,
              processing: first.wallMs,
              handlerMs: first.wallMs,
              inputDelayMs: null,
              event: { processingStart: first.start, processingEnd: first.end },
            });
          const threshold = id.includes('500')
            ? 4.599999964237213
            : id.includes('nested')
              ? 5.199999988079071
              : 6.0;
          for (const event of interactions.filter(
            (event) => event.processing >= threshold || event.key === 1,
          )) {
            const detail = attributeCpuProfile(
              cpu,
              page.clock,
              event.event.processingStart,
              event.event.processingEnd,
              source,
              'burst',
            );
            const before = page.marks
              .filter(
                (mark) =>
                  mark.name === 'ir6-diagnostic-validation-run' &&
                  mark.at <= event.event.processingStart,
              )
              .pop();
            const during = page.marks.filter(
              (mark) =>
                mark.name === 'ir6-diagnostic-validation-run' &&
                mark.at >= event.event.processingStart &&
                mark.at <= event.event.processingEnd,
            );
            const verdictInstrumented =
              !!complete.inputs.verdictCallbackMarks?.[lane];
            const priorVerdict = page.marks
              .filter(
                (mark) =>
                  mark.name === 'ir6-diagnostic-verdict-delivery' &&
                  mark.at <= event.event.processingStart,
              )
              .pop();
            const verdictsInside = page.marks.filter(
              (mark) =>
                mark.name === 'ir6-diagnostic-verdict-delivery' &&
                mark.at >= event.event.processingStart &&
                mark.at <= event.event.processingEnd,
            );
            const commits = page.commits.filter(
              (commit) =>
                commit.at >= event.event.processingStart &&
                commit.at <= event.event.processingEnd + 0.2,
            );
            slowKeys.push({
              id,
              lane,
              page: sample.index,
              ...event,
              profile: detail,
              verdictTimingInstrumented: verdictInstrumented,
              precedingVerdictDeliveryDeltaMs: priorVerdict
                ? event.event.processingStart - priorVerdict.at
                : null,
              verdictDeliveriesInsideProcessing: verdictInstrumented
                ? verdictsInside.length
                : null,
              precedingValidationRunDeltaMs: before
                ? event.event.processingStart - before.at
                : null,
              validationRunsInsideProcessing: during.length,
              commits,
            });
          }
        }
      }
    group.functions = Object.values(group.functions);
    rows.push(group);
  }
const differences = complete.cases.map((id) => {
  const e = rows.find((row) => row.id === id && row.lane === 'E'),
    f = rows.find((row) => row.id === id && row.lane === 'F');
  const names = [
    ...e.functions.map((fn) => fn.name),
    ...f.functions.map((fn) => fn.name),
  ].filter((name, index, all) => all.indexOf(name) === index);
  const functions = names.map((name) => {
    const before = e.functions.find((fn) => fn.name === name),
      after = f.functions.find((fn) => fn.name === name);
    return {
      name,
      group: after?.group ?? before?.group,
      selfE: before?.selfMs ?? 0,
      selfF: after?.selfMs ?? 0,
      deltaSelf: (after?.selfMs ?? 0) - (before?.selfMs ?? 0),
      totalE: before?.totalMs ?? 0,
      totalF: after?.totalMs ?? 0,
      deltaTotal: (after?.totalMs ?? 0) - (before?.totalMs ?? 0),
    };
  });
  const categories = [
    ...Object.keys(e.groupMs),
    ...Object.keys(f.groupMs),
  ].filter((name, index, all) => all.indexOf(name) === index);
  return {
    id,
    groups: categories.map((name) => ({
      name,
      E: e.groupMs[name] ?? { selfMs: 0, inclusiveMs: 0 },
      F: f.groupMs[name] ?? { selfMs: 0, inclusiveMs: 0 },
      deltaSelf:
        (f.groupMs[name]?.selfMs ?? 0) - (e.groupMs[name]?.selfMs ?? 0),
      deltaInclusive:
        (f.groupMs[name]?.inclusiveMs ?? 0) -
        (e.groupMs[name]?.inclusiveMs ?? 0),
    })),
    topSelf: [...functions]
      .sort((a, b) => b.deltaSelf - a.deltaSelf)
      .slice(0, 25),
    topTotal: [...functions]
      .sort((a, b) => b.deltaTotal - a.deltaTotal)
      .slice(0, 25),
    functions,
  };
});
const result = {
  diagnosticOnly: true,
  formalGateEvidence: false,
  profile: complete.profile,
  warmup: complete.warmup,
  rows,
  differences,
  pageAttribution,
  slowKeys,
};
const text = JSON.stringify(result, null, 2) + '\n';
if (process.argv.includes('--write'))
  fs.writeFileSync(
    path.join(directory, 'diagnostic-analysis.json.gz'),
    gzipSync(text),
  );
else
  assert.equal(
    gunzipSync(
      fs.readFileSync(path.join(directory, 'diagnostic-analysis.json.gz')),
    ).toString(),
    text,
  );
console.log(
  JSON.stringify(
    {
      rows: rows.map(
        ({ id, lane, count, firstMedian, eagerMedian, groupMs }) => ({
          id,
          lane,
          count,
          firstMedian,
          eagerMedian,
          groupMs,
        }),
      ),
      slowKeys: slowKeys.length,
    },
    null,
    2,
  ),
);
