// Invoked explicitly for balanced round-102 repeats; the original driver owns clocks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const script = fileURLToPath(import.meta.url);
const original = path.join(path.dirname(script), 'revision-initial-empty.mjs');
const bytes = fs.readFileSync(original, 'utf8');
const sourceHash = createHash('sha256').update(bytes).digest('hex');

/** Replace a unique driver anchor without changing its sampling clock. */
function once(source, before, after) {
  assert.equal(source.split(before).length, 2, before);
  return source.replace(before, after);
}

assert(['--build', '--counts', '--pairs', '--worker'].includes(process.argv[2]));
let source = once(bytes, '\nconst script = fileURLToPath(import.meta.url);',
  '\nconst script = ' + JSON.stringify(script) + ';');
source = once(source, "const head = '2333fd5af';", "const head = '926671834';");
source = source.replaceAll('revision102-', 'revision102-order-');
source = once(source, 'for (let run = 1; run <= 3; run++) {',
  'for (let run = Number(args[4] ?? 1); run < Number(args[4] ?? 1) + 3; run++) {');
source = once(source, 'const row = { head, variant, name, mode, run, regime,',
  "const row = { head, variant, name, mode, run, regime, blockOrder: run % 2 ? 'H-first' : 'W-first',");
source = once(source, 'driverSha256: createHash',
  'sourceDriverSha256: ' + JSON.stringify(sourceHash) + ', driverSha256: createHash');
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
