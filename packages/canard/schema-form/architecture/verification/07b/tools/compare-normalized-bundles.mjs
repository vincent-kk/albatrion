/**
 * Compare two bundle directories from build-identity-bundles.mjs under the normalized-equivalence rule (160C-01).
 *
 * Usage: `node compare-normalized-bundles.mjs <baseDir> <changeDir> [<evidence.json>]`
 * Normalization removes blank lines and module path comments (`//#region`, `//#endregion`, `// packages/…`) and
 * folds bundler renumbering: an identifier `name$N` or `nameN` becomes `name` when `name` itself also occurs in
 * either bundle. Prints, per bundle, raw bytes and SHA-256 and the multiset of normalized lines that differ.
 * The rule passes when every remaining line runs once at module load (a constant, an initializer or a require);
 * any other line sends the change back to a verdict session. That judgment is the reader's, not this script's.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [baseDir, changeDir, evidence] = process.argv.slice(2);
if (!baseDir || !changeDir) throw new Error('Usage: compare-normalized-bundles.mjs <baseDir> <changeDir> [<evidence.json>]');
const FILES = ['index.mjs', 'index.cjs', 'core.cjs', 'react.cjs'];
const PATH_COMMENT = /^\s*\/\/(#region|#endregion| packages\/)/;
const NUMBERED = /\b([A-Za-z_$][\w$]*?)(\$\d+|\d+)\b/g;
const sha256 = value => createHash('sha256').update(value).digest('hex');

const tokens = text => new Set(text.match(/[A-Za-z_$][\w$]*/g));
const normalize = (text, known) => text.split('\n')
  .filter(line => line.trim() !== '' && !PATH_COMMENT.test(line))
  .map(line => line.replace(NUMBERED, (match, name) => (known.has(name) ? name : match)).trim());
const count = lines => lines.reduce((map, line) => map.set(line, (map.get(line) ?? 0) + 1), new Map());

const rows = FILES.map(file => {
  const base = readFileSync(resolve(baseDir, file));
  const change = readFileSync(resolve(changeDir, file));
  const known = new Set([...tokens(base.toString()), ...tokens(change.toString())]);
  const baseLines = count(normalize(base.toString(), known));
  const changeLines = count(normalize(change.toString(), known));
  const delta = [];
  for (const line of new Set([...baseLines.keys(), ...changeLines.keys()])) {
    const difference = (changeLines.get(line) ?? 0) - (baseLines.get(line) ?? 0);
    if (difference !== 0) delta.push({ difference, line });
  }
  return { file, identical: base.equals(change), baseBytes: base.length, changeBytes: change.length,
    baseSha256: sha256(base), changeSha256: sha256(change), normalizedDelta: delta };
});
if (evidence) writeFileSync(evidence, JSON.stringify(rows, null, 2) + '\n');
for (const row of rows) {
  console.log(`${row.file}: ${row.baseBytes} -> ${row.changeBytes} bytes, identical ${row.identical}, ${row.normalizedDelta.length} differing normalized lines`);
  for (const { difference, line } of row.normalizedDelta) console.log(`  ${difference > 0 ? '+' : ''}${difference} ${line}`);
}
