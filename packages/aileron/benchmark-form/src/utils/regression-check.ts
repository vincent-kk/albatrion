import fs from 'node:fs';
import path from 'node:path';

/**
 * Warn-only regression gate.
 *
 * Compares the latest `bench-v2-*.json` against the average of the
 * preceding N runs (default 3). Emits a non-zero exit only when
 * `--fail` is set; otherwise prints findings and exits 0.
 *
 * Usage:
 *   node --import tsx src/utils/regression-check.ts \
 *     --dir results \
 *     --threshold 15 \
 *     [--window 3] \
 *     [--fail]
 */

interface AggregateEntry {
  name: string;
  meanHz: number;
  relStd: number;
  runs: number;
}

interface ResultFile {
  timestamp: string;
  aggregate: AggregateEntry[];
}

function parseFlag(name: string, fallback: string): string {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (arg) return arg.split('=')[1];
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

function loadResults(dir: string): { file: string; data: ResultFile }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('bench-v2-') && f.endsWith('.json'))
    .sort()
    .map((file) => {
      const full = path.join(dir, file);
      return { file: full, data: JSON.parse(fs.readFileSync(full, 'utf8')) };
    });
}

function main() {
  const dir = path.resolve(process.cwd(), parseFlag('dir', 'results'));
  const threshold = parseFloat(parseFlag('threshold', '15'));
  const window = parseInt(parseFlag('window', '3'), 10);
  const fail = process.argv.includes('--fail');

  const all = loadResults(dir);
  if (all.length < 2) {
    console.log(
      `[regression] not enough history (${all.length} files). skipping.`,
    );
    return;
  }

  const latest = all[all.length - 1];
  const baselineSlice = all.slice(-1 - window, -1);
  if (baselineSlice.length === 0) {
    console.log('[regression] no baseline window. skipping.');
    return;
  }

  console.log(`[regression] latest: ${path.basename(latest.file)}`);
  console.log(
    `[regression] baseline window (${baselineSlice.length}): ${baselineSlice
      .map((b) => path.basename(b.file))
      .join(', ')}`,
  );
  console.log(`[regression] threshold: -${threshold}% (warn-only=${!fail})`);

  const baselineMean = new Map<string, number[]>();
  for (const b of baselineSlice) {
    for (const e of b.data.aggregate ?? []) {
      if (!baselineMean.has(e.name)) baselineMean.set(e.name, []);
      baselineMean.get(e.name)!.push(e.meanHz);
    }
  }

  const violations: string[] = [];
  for (const e of latest.data.aggregate ?? []) {
    const hist = baselineMean.get(e.name);
    if (!hist || hist.length === 0) continue;
    const baseline = hist.reduce((s, x) => s + x, 0) / hist.length;
    const deltaPct = ((e.meanHz - baseline) / baseline) * 100;
    const tag = deltaPct < -threshold ? '⚠️ ' : '   ';
    console.log(
      `${tag}${e.name}: ${e.meanHz.toFixed(2)}hz vs baseline ${baseline.toFixed(2)}hz (${deltaPct.toFixed(2)}%)`,
    );
    if (deltaPct < -threshold) {
      violations.push(`${e.name}: ${deltaPct.toFixed(2)}%`);
    }
  }

  if (violations.length > 0) {
    console.log(
      `\n[regression] ${violations.length} category/categories exceed -${threshold}% threshold:`,
    );
    for (const v of violations) console.log(`  - ${v}`);
    if (fail) {
      process.exit(2);
    }
  } else {
    console.log('\n[regression] no violations.');
  }
}

main();
