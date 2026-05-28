import fs from 'node:fs';
import path from 'node:path';

/**
 * Produce a per-version markdown summary from a `bench-v2-*.json` file.
 *
 * Two layouts:
 *   - 1 version (latest-only): single column table with hz + relStd.
 *   - N versions: matrix with category × version, percent vs first column.
 *
 * Usage:
 *   node --import tsx src/utils/summary.ts <bench-v2-*.json>
 *
 * Output goes to stdout — pipe to `gh pr comment --body-file -` for CI
 * integration or to `>> SUMMARY.md` for ad-hoc analysis.
 */

interface AggregateEntry {
  name: string;
  meanHz: number;
  relStd: number;
  runs: number;
}

interface ResultFile {
  timestamp: string;
  repeat: number;
  versions: string[];
  aggregate: AggregateEntry[];
}

function parseEntry(
  name: string,
): { version: string; category: string } | null {
  // "@canard/schema-form@<version> - <category>"
  const m = name.match(/^@canard\/schema-form@([^ ]+) - (.+)$/);
  if (!m) return null;
  return { version: m[1], category: m[2] };
}

function fmtPct(v: number): string {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('usage: summary.ts <bench-v2-*.json>');
    process.exit(1);
  }
  const data: ResultFile = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const byCategory = new Map<string, Map<string, AggregateEntry>>();
  for (const e of data.aggregate) {
    const p = parseEntry(e.name);
    if (!p) continue;
    if (!byCategory.has(p.category)) byCategory.set(p.category, new Map());
    byCategory.get(p.category)!.set(p.version, e);
  }

  const versions = data.versions;
  const categories = Array.from(byCategory.keys());

  console.log(`# Bench summary — ${path.basename(filePath)}`);
  console.log('');
  console.log(`- timestamp: ${data.timestamp}`);
  console.log(`- repeat: ${data.repeat}`);
  console.log(`- versions: ${versions.join(', ')}`);
  console.log('');

  // Header row
  const head = [
    'Category',
    ...versions.map((v) => `${v} hz`),
    'Δ end vs start',
  ];
  console.log(`| ${head.join(' | ')} |`);
  console.log(`| ${head.map(() => '---').join(' | ')} |`);

  for (const cat of categories) {
    const row = byCategory.get(cat)!;
    const cells: string[] = [cat];
    const first = row.get(versions[0]);
    let last: AggregateEntry | undefined;
    for (const v of versions) {
      const e = row.get(v);
      if (!e) {
        cells.push('—');
        continue;
      }
      cells.push(`${e.meanHz.toFixed(2)} ±${(e.relStd * 100).toFixed(2)}%`);
      last = e;
    }
    if (first && last && first !== last) {
      const delta = ((last.meanHz - first.meanHz) / first.meanHz) * 100;
      cells.push(fmtPct(delta));
    } else {
      cells.push('—');
    }
    console.log(`| ${cells.join(' | ')} |`);
  }
}

main();
