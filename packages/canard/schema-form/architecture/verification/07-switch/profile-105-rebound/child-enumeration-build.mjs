// Build-only adapter; never invokes the preserved timing protocol.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
assert.equal(process.argv[2], 'build');
assert(['head', 'working'].includes(process.argv[3]));
const sourceFile = path.resolve(path.dirname(script), '../profile-104-owned/measure.mjs');
let source = fs.readFileSync(sourceFile, 'utf8');
for (const [before, after] of [
  ["const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';", "const HEAD = '5e8f34625b64b84dddd58239f31969afb71c862c';"],
  ['owned104-', 'child105-'],
  ['fileURLToPath(import.meta.url)', JSON.stringify(script)],
  ['save(`build-${version}', 'save(`child105-build-${version}'],
  ['save(`process-${[command, ...args].join', 'save(`child105-process-${[command, ...args].join'],
]) {
  assert(source.includes(before), before);
  source = source.split(before).join(after);
}
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
