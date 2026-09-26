import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const original = readFileSync(new URL('../proto/loop-v4.mjs', import.meta.url), 'utf8');
const literalB = original.replace('function inject(host, child, dryRun) {', "function inject(host, child, dryRun) {\n  if (host.replaced && host.emit !== MISSING && Object.hasOwn(host.emit, child.name)) return false;");
const L = await import('data:text/javascript;base64,' + Buffer.from(literalB).toString('base64'));
const root = L.object('');
const keep = L.leaf('keep');
const x = L.leaf('x', 'D');
L.attach(root, keep); L.attach(root, x);
L.prime(root, { keep: 1 });
L.write(x, undefined);
const before = L.valueOf(root);
assert.deepEqual(before, { keep: 1 });
L.setValue(root, before);
const after = L.valueOf(root);
assert.deepEqual(after, { keep: 1, x: 'D' });
console.log(JSON.stringify({ case: 'D7-b-literal', before, after, idempotent: false }));

for (const mode of ['A', 'B']) {
  const source = mode === 'A' ? original.replace('if (v === on[i]) continue;', 'if (on[i] === 1 || v === on[i]) continue;') : original;
  const Q = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const host = Q.object(''); Q.attach(host, Q.leaf('x'));
  Q.declareFragments(host, [{ guard: v => !Object.hasOwn(v, 'x'), declares: ['x'] }]);
  Q.prime(host, { x: 1 });
  console.log(JSON.stringify({ case: 'D2-' + mode, emit: Q.valueOf(host), active: Q.activeIds(host), settle: host.settle }));
}

const V = await import('../proto/loop-v4.mjs');
const union = V.object(''); V.attach(union, V.leaf('kind', 'a')); V.attach(union, V.leaf('a', 'A'));
V.declareFragments(union, [{ guard: v => v.kind === 'a', declares: ['a'] }]);
V.prime(union, {}); const initial = V.valueOf(union);
V.setValue(union, {}); const reloaded = V.valueOf(union);
console.log(JSON.stringify({ case: 'v4-default-transition-reload', initial, reloaded }));
