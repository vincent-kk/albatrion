// Publish portable evidence only; original prepared inputs and failures remain untouched.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const [root, label] = process.argv.slice(2);
assert.match(label, /^[A-Za-z0-9-]+$/);
const output = new URL('../../raw/iv-4/' + label + '/', import.meta.url);
assert.ok(!fs.existsSync(output), 'Never overwrite published evidence');
fs.mkdirSync(output, { recursive: true });
const inputs = [];
for (const lane of ['A', 'B'])
  if (fs.existsSync(path.join(root, lane, 'inputs.json')))
    inputs.push([
      path.join(root, lane, 'inputs.json'),
      'inputs-' + lane + '.json',
    ]);
for (const name of ['probe.json', 'allocation.json', 'failure.json'])
  if (fs.existsSync(path.join(root, name)))
    inputs.push([path.join(root, name), name]);
for (const name of fs.readdirSync(path.join(root, 'raw.noindex')))
  if (name.endsWith('-quiet.json'))
    inputs.push([path.join(root, 'raw.noindex', name), name]);
for (const [file, name] of inputs) {
  const bytes = fs.readFileSync(file);
  const text = bytes.toString();
  assert.ok(!text.includes(root), 'Prepared machine paths must be sanitized');
  fs.writeFileSync(new URL(name + '.gz', output), gzipSync(bytes));
}
console.log('IV_4_EVIDENCE_PUBLISHED ' + label);
