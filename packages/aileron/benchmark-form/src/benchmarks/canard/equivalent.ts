import { version as reactVersion } from 'react';

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { flushSync } from 'react-dom';

import { equivalentFixtures } from '../../../fixtures/equivalent';
import type {
  BenchHandle,
  EquivalentFixture,
} from '../../../fixtures/equivalent/types';
import { applyInteraction } from '../../../fixtures/equivalent/utils/applyInteraction';
import { mountEquivalentForm } from '../../../fixtures/equivalent/utils/mountEquivalentForm';
import { loadCoreBenchmark } from '../../utils/loadCoreBenchmark';
import { drainTicks, forceGc, setupJsdom } from '../../utils/setup-env';
import { welchTTest } from '../../utils/stats';

type Sample = Record<string, number>;

/** Summarizes milliseconds with nearest-rank p99 and the midpoint median. */
function summarize(samples: number[]) {
  const sorted = samples.toSorted((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return {
    samples,
    median:
      sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2,
    p99: sorted[Math.ceil(sorted.length * 0.99) - 1],
  };
}

/** Executes one fresh core tree and its complete authored interaction sequence. */
async function sampleCore(
  fixture: EquivalentFixture,
  version: string,
  create: Function,
): Promise<Sample> {
  let changes = 0;
  let completedAt = 0;
  const start = performance.now();
  const root = create({
    jsonSchema: version === 'latest' ? fixture.workspace : fixture.legacy,
    validationMode: 0,
    onChange: () => {
      changes++;
      completedAt = performance.now();
    },
  });
  const constructedAt = performance.now();
  await drainTicks(2);
  const mount = Math.max(constructedAt, completedAt) - start;
  const handle: BenchHandle = {
    findNode: (pointer) => root.find(pointer),
    getValue: () => root.value,
  };
  let update = 0;
  for (const interaction of fixture.interactions) {
    const before = changes;
    const started = performance.now();
    applyInteraction(handle, interaction);
    // Timestamp at root completion, before polling resumes; exclude the polling timer floor.
    for (let tick = 0; changes === before && tick < 12; tick++)
      await drainTicks();
    if (changes === before)
      throw new Error(`${fixture.name}/${version}: no completed root update`);
    update += completedAt - started;
    await drainTicks();
  }
  await drainTicks();
  return { 'core-mount': mount, 'core-update': update };
}

/** Measures React mount and updates separately, including every Profiler commit in each phase. */
async function sampleRender(
  fixture: EquivalentFixture,
  version: string,
): Promise<Sample> {
  const mounted = await mountEquivalentForm(fixture, version);
  const mountDuration = mounted.commits.reduce(
    (sum, duration) => sum + duration,
    0,
  );
  const mountCommits = mounted.commits.length;
  mounted.commits.length = 0;
  try {
    const start = performance.now();
    for (const interaction of fixture.interactions) {
      flushSync(() => applyInteraction(mounted.handle, interaction));
      await drainTicks(2);
    }
    if (mountCommits === 0)
      throw new Error('Profiler disabled; use development React 19');
    return {
      'render-mount-wall': mounted.mountMs,
      'render-update-wall': performance.now() - start,
      'profiler-mount': mountDuration,
      'profiler-update': mounted.commits.reduce(
        (sum, duration) => sum + duration,
        0,
      ),
      'commits-mount': mountCommits,
      'commits-update': mounted.commits.length,
    };
  } finally {
    mounted.teardown();
  }
}

/** Runs the U13 paired fixture measurements through the benchmark-form CLI. */
export async function runEquivalentBenchmarks() {
  if (!reactVersion.startsWith('19.'))
    throw new Error(`React 19 required, got ${reactVersion}`);
  if (typeof (globalThis as { gc?: Function }).gc !== 'function')
    throw new Error('--expose-gc required');
  const args = process.argv;
  const count = Math.max(
    100,
    Number(
      args.find((arg) => arg.startsWith('--min-samples='))?.split('=')[1] ??
        100,
    ),
  );
  const warmup = 10;
  const cores = {
    '0.16.0': await loadCoreBenchmark('0.16.0'),
    latest: await loadCoreBenchmark('latest'),
  };
  const rows: object[] = [];
  const raw: object[] = [];
  const commit = execFileSync('git', ['rev-parse', '--short=9', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const timestamp = new Date().toISOString();
  const output =
    args.find((arg) => arg.startsWith('--out='))?.slice(6) ??
    `results/equivalent-${timestamp.replace(/[:.]/g, '-')}-${commit}.json`;
  const mode =
    args.find((arg) => arg.startsWith('--mode='))?.split('=')[1] ?? 'both';
  const modes = mode === 'both' ? ['core', 'render'] : [mode];
  const selected = args.find((arg) => arg.startsWith('--fixture='))?.slice(10);
  for (const lane of modes) {
    if (lane === 'render') setupJsdom();
    for (const fixture of equivalentFixtures.filter(
      (fixture) => !selected || fixture.name === selected,
    )) {
      const samples: Record<string, Sample[]> = { '0.16.0': [], latest: [] };
      for (let index = -warmup; index < count; index++) {
        // Alternate AB/BA to distribute JIT and temperature drift across versions.
        for (const version of index % 2 === 0
          ? (['0.16.0', 'latest'] as const)
          : (['latest', '0.16.0'] as const)) {
          forceGc();
          const sample =
            lane === 'core'
              ? await sampleCore(fixture, version, cores[version].create)
              : await sampleRender(fixture, version);
          if (index >= 0) samples[version].push(sample);
          // React 19 development profiling retains User Timing entries across roots.
          performance.clearMeasures();
          performance.clearMarks();
        }
      }
      raw.push({ fixture: fixture.name, lane, samples: Object.fromEntries(
        Object.entries(samples).map(([version, values]) => [version, values.map(
          sample => Object.fromEntries(Object.entries(sample).filter(([key]) => !key.startsWith('commits'))),
        )]),
      ) });
      for (const metric of Object.keys(samples.latest[0])) {
        const old = summarize(
          samples['0.16.0'].map((sample) => sample[metric]),
        );
        const current = summarize(
          samples.latest.map((sample) => sample[metric]),
        );
        const isCount = metric.startsWith('commits');
        const positive =
          old.samples.every((value) => value > 0) &&
          current.samples.every((value) => value > 0);
        const welch =
          !isCount && positive
            ? welchTTest(
                old.samples.map((value) => 1000 / value),
                current.samples.map((value) => 1000 / value),
              )
            : null;
        const drop = welch ? (1 - welch.meanB / welch.meanA) * 100 : null;
        rows.push({
          fixture: fixture.name,
          metric,
          old: { median: old.median, p99: old.p99 },
          new: { median: current.median, p99: current.p99 },
          ratio: current.median / old.median,
          p99Ratio: current.p99 / old.p99,
          throughputDrop: drop,
          p: welch?.pValue ?? null,
          regression: welch ? drop! > 15 && welch.pValue < 0.05 : false,
        });
      }
      fs.mkdirSync(path.dirname(output), { recursive: true });
      const summary = JSON.stringify(
          {
            timestamp,
            commit,
            node: process.version,
            react: reactVersion,
            cpu: os.cpus()[0].model,
            os: `${os.type()} ${os.release()} ${os.arch()}`,
            warmup,
            count,
            mode,
            coreBundleDigests: {
              legacy: cores['0.16.0'].digest,
              workspace: cores.latest.digest,
            },
            rows,
          },
          null,
          2,
        );
      const timings = JSON.stringify({ timestamp, commit, warmup, count, raw });
      if (Buffer.byteLength(summary) > 5_000_000 || Buffer.byteLength(timings) > 5_000_000)
        throw new Error('Measurement exceeds 5 MB');
      fs.writeFileSync(output.replace(/\.json$/, '-summary.json'), summary);
      fs.writeFileSync(output, timings);
      console.log(`${lane} ${fixture.name}: ${count} paired samples saved`);
    }
  }
  console.log(`Saved ${output}`);
}
