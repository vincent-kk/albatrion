// Invoked once per designated check; reuse the committed natural-exit verifier and its clocks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const original = fs.readFileSync(path.join(directory, 'verify-revision-initial-order.mjs'), 'utf8');
assert(original.includes('revision102-order-verify-'));
const prefix = process.env.GATES103_VERIFY_HEAD === '1'
  ? 'gates103-head-verify-' : 'gates103-verify-';
const source = original.replace('path.dirname(fileURLToPath(import.meta.url))', JSON.stringify(directory))
  .replaceAll('revision102-order-verify-', prefix);
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
