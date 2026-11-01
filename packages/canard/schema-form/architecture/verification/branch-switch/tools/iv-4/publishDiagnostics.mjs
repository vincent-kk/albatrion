// Preserve supplemental diagnostics under a unique label, with portable execution hashes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const [root, label] = process.argv.slice(2);
assert.match(label, /^[A-Za-z0-9-]+$/);
const output = new URL('../../raw/iv-4/' + label + '/', import.meta.url);
assert.ok(!fs.existsSync(output));
fs.mkdirSync(output, { recursive: true });
for (const file of fs.readdirSync(root))
  if (file.startsWith('diagnostic-') && file.endsWith('.json')) {
    const bytes = fs.readFileSync(path.join(root, file));
    assert.ok(!bytes.toString().includes(root));
    fs.writeFileSync(new URL(file + '.gz', output), gzipSync(bytes));
  }
for (const lane of ['A', 'B'])
  if (fs.existsSync(path.join(root, lane, 'inputs.json')))
    fs.writeFileSync(
      new URL('inputs-' + lane + '.json.gz', output),
      gzipSync(fs.readFileSync(path.join(root, lane, 'inputs.json'))),
    );
console.log('IV_4_DIAGNOSTICS_PUBLISHED ' + label);
