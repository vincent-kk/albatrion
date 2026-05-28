import fs from 'node:fs';
import path from 'node:path';

import { std, welchTTest, zScore } from './stats';

/**
 * Statistical regression gate (Welch t-test).
 *
 * Compares per-category sweep samples between a baseline and a current
 * `bench-v2-*.json`. A category is a REGRESSION only when BOTH hold:
 *   - magnitude: mean throughput dropped by more than `--threshold` %
 *   - significance: Welch two-tailed p < `--alpha` (the drop is unlikely
 *     to be sweep noise given both samples' variance)
 *
 * Requiring significance AND magnitude avoids the false positives a bare
 * mean-delta gate produces on noisy categories (e.g. array-stress).
 *
 * Usage:
 *   node --import tsx src/utils/stat-regression.ts \
 *     --baseline results/baseline.json \
 *     --current  results/bench-v2-<ts>.json \
 *     [--threshold=15] [--alpha=0.05] [--fail]
 *
 * Exit codes: 0 = ok (warn-only or no regressions), 2 = regression(s) and --fail.
 */

interface AggregateEntry {
  name: string;
  meanHz: number;
  samples: number[];
}
interface ResultFile {
  timestamp: string;
  aggregate: AggregateEntry[];
}

function flag(name: string, fallback: string): string {
  const eq = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split('=')[1];
  const idx = process.argv.indexOf(`--${name}`);
  if (
    idx >= 0 &&
    process.argv[idx + 1] &&
    !process.argv[idx + 1].startsWith('--')
  )
    return process.argv[idx + 1];
  return fallback;
}

function load(p: string): ResultFile {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), p), 'utf8'));
}

function byName(f: ResultFile): Map<string, AggregateEntry> {
  const m = new Map<string, AggregateEntry>();
  for (const e of f.aggregate ?? []) m.set(e.name, e);
  return m;
}

interface Row {
  name: string;
  baseMean: number;
  curMean: number;
  pctDelta: number;
  z: number;
  t: number;
  df: number;
  p: number;
  verdict: 'regression' | 'improvement' | 'stable' | 'insufficient';
}

function main() {
  const baselinePath = flag('baseline', '');
  const currentPath = flag('current', '');
  if (!baselinePath || !currentPath) {
    console.error(
      'usage: stat-regression.ts --baseline <file> --current <file> [--threshold=15] [--alpha=0.05] [--fail]',
    );
    process.exit(1);
  }
  const threshold = parseFloat(flag('threshold', '15'));
  const alpha = parseFloat(flag('alpha', '0.05'));
  const fail = process.argv.includes('--fail');

  const base = byName(load(baselinePath));
  const cur = byName(load(currentPath));

  const rows: Row[] = [];
  for (const [name, c] of cur) {
    const b = base.get(name);
    if (!b) continue;
    const baseSamples = b.samples ?? [];
    const curSamples = c.samples ?? [];
    if (baseSamples.length < 2 || curSamples.length < 2) {
      rows.push({
        name,
        baseMean: b.meanHz,
        curMean: c.meanHz,
        pctDelta: ((c.meanHz - b.meanHz) / b.meanHz) * 100,
        z: 0,
        t: 0,
        df: 0,
        p: 1,
        verdict: 'insufficient',
      });
      continue;
    }
    const w = welchTTest(baseSamples, curSamples);
    const pctDelta = ((w.meanB - w.meanA) / w.meanA) * 100;
    const z = zScore(w.meanB, w.meanA, std(baseSamples));
    let verdict: Row['verdict'] = 'stable';
    if (w.pValue < alpha && pctDelta < -threshold) verdict = 'regression';
    else if (w.pValue < alpha && pctDelta > threshold) verdict = 'improvement';
    rows.push({
      name,
      baseMean: w.meanA,
      curMean: w.meanB,
      pctDelta,
      z,
      t: w.t,
      df: w.df,
      p: w.pValue,
      verdict,
    });
  }

  rows.sort((a, b) => a.pctDelta - b.pctDelta);

  const mark = {
    regression: '🔴',
    improvement: '🟢',
    stable: '  ',
    insufficient: '❔',
  };
  console.log(`# Statistical regression report`);
  console.log(`baseline: ${path.basename(baselinePath)}`);
  console.log(`current:  ${path.basename(currentPath)}`);
  console.log(
    `gate: drop > ${threshold}% AND p < ${alpha} (two-tailed Welch)\n`,
  );
  console.log('| | category | base hz | cur hz | Δ% | z | p |');
  console.log('| --- | --- | --- | --- | --- | --- | --- |');
  for (const r of rows) {
    console.log(
      `| ${mark[r.verdict]} | ${r.name.replace('@canard/schema-form@latest - ', '')} | ${r.baseMean.toFixed(2)} | ${r.curMean.toFixed(2)} | ${r.pctDelta.toFixed(2)}% | ${r.z.toFixed(2)} | ${r.p < 0.0001 ? r.p.toExponential(1) : r.p.toFixed(4)} |`,
    );
  }

  const regressions = rows.filter((r) => r.verdict === 'regression');
  const improvements = rows.filter((r) => r.verdict === 'improvement');
  console.log(
    `\nsummary: ${regressions.length} regression(s), ${improvements.length} improvement(s), ${rows.length} categories compared.`,
  );
  if (regressions.length) {
    console.log('regressions:');
    for (const r of regressions)
      console.log(
        `  🔴 ${r.name.replace('@canard/schema-form@latest - ', '')}: ${r.pctDelta.toFixed(2)}% (p=${r.p.toExponential(1)})`,
      );
  }

  if (fail && regressions.length) process.exit(2);
}

main();
