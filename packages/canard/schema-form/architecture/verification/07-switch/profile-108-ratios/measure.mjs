// CLI worker: stdout JSON is persisted by native artifact writes after natural exit.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const artifacts = path.dirname(fileURLToPath(import.meta.url));
const directory = path.dirname(artifacts);
const original = path.join(directory, 'tools/measure-verdict-95c01.mjs');
const HEAD = '0f690b0fa489c84cd2266f86928be27a8d0abe52';
assert.equal(process.version, 'v26.10.0');
assert.equal(typeof globalThis.gc, 'function');
assert.equal(process.argv.length, 6);
let source = fs.readFileSync(original, 'utf8');
const replaceOnce = (before, after) => {
  assert.equal(source.split(before).length, 2, before);
  source = source.replace(before, after);
};
replaceOnce('const directory = path.dirname(fileURLToPath(import.meta.url));',
  'const directory = ' + JSON.stringify(path.dirname(original)) + ';');
replaceOnce("const expectedHead = '4d2e54533dc8feaccb4742be9dd322e46d20be58';",
  'const expectedHead = ' + JSON.stringify(HEAD) + ';');
replaceOnce('const warmup = 12, sampleCount = 101;',
  'const warmup = 20, sampleCount = 101;');
replaceOnce('hash(fs.readFileSync(fileURLToPath(import.meta.url)))',
  'hash(fs.readFileSync(' + JSON.stringify(original) + '))');
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
