import Benchmark, { type Deferred } from 'benchmark';
import fs from 'node:fs';
import path from 'node:path';

import { Form as WorkspaceForm } from '@canard/schema-form';

import { ARRAY_STRESS_RUNNERS } from './benchmarks/canard/array-node-stress';
import { runFormRenderingV2 } from './benchmarks/canard/form-rendering';
import { SCALE_INTERACTION_RUNNERS } from './benchmarks/canard/scale-interaction';
import { SCALE_RENDERING_RUNNERS } from './benchmarks/canard/scale-rendering';
import { forceGc } from './utils/setup-env';
import { getSchemaFormVersions } from './utils/version-parser';

interface CategoryRunner {
  category: string;
  run: (mod: { Form: typeof WorkspaceForm }) => Promise<void>;
  /**
   * When true, the category runs only against `latest` even in
   * `--all-versions` mode. Used for benches that rely on
   * workspace-only APIs (e.g. ArrayNode.push via FormHandle ref).
   */
  latestOnly?: boolean;
}

const CORE_CATEGORIES: CategoryRunner[] = [
  { category: 'Form Rendering v2', run: runFormRenderingV2 },
];

const SCALE_CATEGORIES: CategoryRunner[] = [
  ...SCALE_RENDERING_RUNNERS,
  ...SCALE_INTERACTION_RUNNERS,
];

const ARRAY_STRESS_CATEGORIES: CategoryRunner[] = ARRAY_STRESS_RUNNERS.map(
  (r) => ({ ...r, latestOnly: true }),
);

function selectCategories(): CategoryRunner[] {
  const args = process.argv;
  const scale = args.includes('--scale');
  const arrayStress = args.includes('--array-stress');
  const core = args.includes('--no-core') ? [] : CORE_CATEGORIES;
  const selected = [
    ...core,
    ...(scale ? SCALE_CATEGORIES : []),
    ...(arrayStress ? ARRAY_STRESS_CATEGORIES : []),
  ];

  // Optional category substring exclusion. Comma-separated; a category is
  // dropped if its name contains any token. Used to skip the slow giant
  // cases (flat-500/array-500/array-1000) when only the per-version
  // regression ratio is needed.
  const excludeFlag = args.find((a) => a.startsWith('--exclude='));
  if (!excludeFlag) return selected;
  const tokens = excludeFlag
    .split('=')[1]
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) return selected;
  return selected.filter((c) => !tokens.some((t) => c.category.includes(t)));
}

async function runOnce(
  versions: string[],
  categories: CategoryRunner[],
  options: { minSamples: number; maxTime: number },
) {
  const suite = new Benchmark.Suite();

  for (const version of versions) {
    const mod =
      version === 'latest'
        ? { Form: WorkspaceForm }
        : await import(`@canard/schema-form_${version}`);

    for (const { category, run, latestOnly } of categories) {
      if (latestOnly && version !== 'latest') continue;
      suite.add(`@canard/schema-form@${version} - ${category}`, {
        defer: true,
        minSamples: options.minSamples,
        maxTime: options.maxTime,
        fn: async (deferred: Deferred) => {
          await run(mod);
          deferred.resolve();
        },
      });
    }
  }

  const results: Array<{
    name: string;
    hz: number;
    stats: { mean: number; deviation: number };
  }> = [];

  await new Promise<void>((resolve) => {
    suite.on('cycle', (event: Benchmark.Event) => {
      // benchmark.js types `event.target` as the loose `Target` shape;
      // at runtime it is the full Benchmark instance.
      const t = event.target as unknown as Benchmark;
      results.push({
        name: t.name || 'unknown',
        hz: t.hz,
        stats: {
          mean: t.stats?.mean ?? 0,
          deviation: t.stats?.deviation ?? 0,
        },
      });
      const ms = (t.stats?.mean ?? 0) * 1000;
      // eslint-disable-next-line no-console
      console.log(
        `  ${t.name}: ${t.hz.toFixed(2)} hz | mean=${ms.toFixed(2)}ms | dev=±${(((t.stats?.deviation ?? 0) / (t.stats?.mean ?? 1)) * 100).toFixed(2)}%`,
      );
    });
    suite.on('complete', () => resolve());
    suite.run({ async: true });
  });

  return results;
}

function aggregate(runs: Array<Awaited<ReturnType<typeof runOnce>>>) {
  const byName = new Map<string, number[]>();
  for (const r of runs)
    for (const e of r) {
      if (!byName.has(e.name)) byName.set(e.name, []);
      byName.get(e.name)!.push(e.hz);
    }
  const out: Array<{
    name: string;
    runs: number;
    meanHz: number;
    stdHz: number;
    relStd: number;
    samples: number[];
  }> = [];
  for (const [name, samples] of byName) {
    const meanHz = samples.reduce((s, x) => s + x, 0) / samples.length;
    const variance =
      samples.reduce((s, x) => s + (x - meanHz) ** 2, 0) / samples.length;
    const stdHz = Math.sqrt(variance);
    out.push({
      name,
      runs: samples.length,
      meanHz,
      stdHz,
      relStd: stdHz / meanHz,
      samples,
    });
  }
  return out;
}

async function main() {
  const installed = await getSchemaFormVersions();
  const versionsFlag = process.argv.find((a) => a.startsWith('--versions='));
  const versions = versionsFlag
    ? versionsFlag
        .split('=')[1]
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : process.argv.includes('--all-versions')
      ? installed
      : ['latest'];
  const n = (() => {
    const flag = process.argv.find((a) => a.startsWith('--repeat='));
    if (!flag) return 1;
    return Math.max(1, parseInt(flag.split('=')[1], 10) || 1);
  })();
  const minSamples = (() => {
    const flag = process.argv.find((a) => a.startsWith('--min-samples='));
    if (!flag) return 30;
    return Math.max(3, parseInt(flag.split('=')[1], 10) || 30);
  })();
  const maxTime = (() => {
    const flag = process.argv.find((a) => a.startsWith('--max-time='));
    if (!flag) return 5;
    return Math.max(0.5, parseFloat(flag.split('=')[1]) || 5);
  })();

  const categories = selectCategories();
  // eslint-disable-next-line no-console
  console.log(
    `🚀 v2 bench | versions: ${versions.join(', ')} | repeat: ${n} | minSamples=${minSamples} maxTime=${maxTime}s | gc: ${typeof (globalThis as any).gc === 'function' ? 'on' : 'off'} | categories: ${categories.map((c) => c.category).join(', ') || '(none)'}`,
  );
  if (categories.length === 0) {
    // eslint-disable-next-line no-console
    console.error(
      'No categories selected. Pass --scale and/or --array-stress.',
    );
    process.exit(1);
  }

  const runs: Array<Awaited<ReturnType<typeof runOnce>>> = [];
  for (let i = 1; i <= n; i++) {
    // eslint-disable-next-line no-console
    console.log(`\n--- sweep ${i}/${n} ---`);
    forceGc();
    runs.push(await runOnce(versions, categories, { minSamples, maxTime }));
  }

  // eslint-disable-next-line no-console
  console.log('\n📊 Aggregate (mean ± std across sweeps):');
  const agg = aggregate(runs);
  for (const a of agg) {
    // eslint-disable-next-line no-console
    console.log(
      `  ${a.name}: ${a.meanHz.toFixed(2)} hz ± ${(a.relStd * 100).toFixed(2)}% (n=${a.runs}, std=${a.stdHz.toFixed(2)})`,
    );
  }

  // Persist. `--out=<path>` overrides the default timestamped name — used
  // by the regression harness to write to a fixed baseline/current file.
  const outDir = path.resolve(process.cwd(), 'results');
  fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outFlag = process.argv.find((a) => a.startsWith('--out='));
  const outPath = outFlag
    ? path.resolve(process.cwd(), outFlag.split('=')[1])
    : path.join(outDir, `bench-v2-${ts}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      { timestamp: ts, repeat: n, versions, runs, aggregate: agg },
      null,
      2,
    ),
  );
  // eslint-disable-next-line no-console
  console.log(`\n💾 Saved: ${outPath}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
