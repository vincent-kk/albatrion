import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

// Scratch probes use the unmodified v4 module; experimental variants exist only in memory.
const cases = ['null-clear', 'null-retain', 'guards-B', 'guards-A', 'deny-keep', 'deny-project', 'overwrite', 'merge', 'defaults-on', 'defaults-off', 'virtual-core', 'virtual-binding', 'virtual-tuple', 'previous-absence', 'union-empty', 'union-first', 'signal-zero', 'signal-1000', 'change-wave', 'change-entry', 'change-macro'];
if (!process.argv[2]) {
  for (const name of cases) {
    const run = spawnSync(process.execPath, [fileURLToPath(import.meta.url), name], { encoding: 'utf8' });
    if (run.status !== 0) throw new Error(run.stderr);
    process.stdout.write(run.stdout);
  }
  process.exit(0);
}
const name = process.argv[2];
let source = readFileSync(new URL('../proto/loop-v4.mjs', import.meta.url), 'utf8');
if (name === 'null-retain') {
  const anchor = 'if (wrongKind) {\n    stageRaw(node, value);';
  if (!source.includes(anchor)) throw new Error('null variant anchor missing');
  source = source.replace(anchor, "if (wrongKind && value === null) { stageRaw(node, value); return; }\n  " + anchor);
}
if (name === 'guards-A') {
  const anchor = 'if (v === on[i]) continue;';
  if (!source.includes(anchor)) throw new Error('guard variant anchor missing');
  source = source.replace(anchor, 'if (on[i] === 1 || v === on[i]) continue;');
}
const L = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const { object, leaf, attach, prime, setValue, write, batch, valueOf, declareFragments, subscribe, resetCounters, counters } = L;
const root = object('');
let serial = 0, sink = 0, op, timer, callbacks = 0;
const flat = (n, defaults = false) => {
  const value = {};
  for (let i = 0; i < n; i++) { attach(root, leaf('f' + i, defaults ? 'd' : undefined)); value['f' + i] = 'v'; }
  return value;
};
if (name.startsWith('null-')) {
  const seed = flat(600, true); prime(root, seed);
  op = () => { setValue(root, null); write(root.children[0], 'x' + serial++); };
} else if (name.startsWith('guards-')) {
  flat(200);
  declareFragments(root, Array.from({ length: 100 }, (_, i) => ({ guard: () => true, declares: ['f' + (100 + i)] })));
  prime(root, Object.fromEntries(root.children.map(x => [x.name, 'v'])));
  op = () => write(root.children[0], 'x' + serial++);
} else if (name.startsWith('deny-')) {
  prime(root, flat(600));
  op = () => { write(root.children[0], 'x' + serial++); const v = valueOf(root); if (name === 'deny-project') { const out = { ...v }; for (let i = 500; i < 600; i++) delete out['f' + i]; sink += Object.keys(out).length; } else sink += Object.keys(v).length; };
} else if (name === 'overwrite' || name === 'merge') {
  prime(root, flat(600));
  op = () => setValue(root, { f0: 'x' + serial++ }, name === 'merge' ? 'Merge' : 'Overwrite');
} else if (name.startsWith('defaults-') || name === 'previous-absence') {
  prime(root, flat(600, true), { disableDefaultInjection: name === 'defaults-off' });
  op = () => { if (name === 'previous-absence') { const v = valueOf(root); const absent = root.children.map(c => !Object.hasOwn(v ?? {}, c.name)); sink += absent.length; } setValue(root, { f0: 'x' + serial++ }); };
} else if (name.startsWith('virtual-')) {
  prime(root, flat(2));
  const refs = root.children;
  op = name === 'virtual-tuple' ? () => { const tuple = refs.map(valueOf); sink += tuple.length; } : () => {
    const values = ['x' + serial++, 'y' + serial];
    if (name === 'virtual-core') batch(root, () => refs.forEach((n, i) => setValue(n, values[i])));
    else refs.forEach((n, i) => setValue(n, values[i]));
  };
} else if (name.startsWith('union-')) {
  attach(root, leaf('kind', name === 'union-first' ? 'a' : undefined));
  attach(root, leaf('a', 'A'));
  declareFragments(root, [{ guard: v => v.kind === 'a', declares: ['a'] }]);
  prime(root, {});
  op = () => setValue(root, {});
} else if (name.startsWith('signal-')) {
  prime(root, flat(1));
  for (let i = 0; i < (name === 'signal-1000' ? 1000 : 0); i++) subscribe(root.children[0], () => { sink++; });
  op = () => write(root.children[0], serial++);
} else if (name.startsWith('change-')) {
  prime(root, flat(1));
  let remaining = 0;
  subscribe(root.children[0], () => { if (remaining-- > 0) write(root.children[0], serial++); });
  if (name === 'change-wave') root.onChange = () => { callbacks++; };
  else if (name === 'change-macro') root.onChange = () => { clearTimeout(timer); timer = setTimeout(() => { callbacks++; }, 0); };
  op = () => { remaining = 4; write(root.children[0], serial++); if (name === 'change-entry') { valueOf(root); callbacks++; } };
}
const warmEnd = performance.now() + 200;
while (performance.now() < warmEnd) op();
const samples = [];
for (let s = 0; s < 9; s++) {
  let count = 0; const start = performance.now();
  do { for (let i = 0; i < 20; i++) op(); count += 20; } while (performance.now() - start < 60);
  samples.push((performance.now() - start) * 1000 / count);
}
clearTimeout(timer);
resetCounters(); callbacks = 0; op(); clearTimeout(timer);
const metrics = { ...counters };
const emitted = valueOf(root);
console.log(JSON.stringify({ case: name, node: process.version, median_us: [...samples].sort((a,b) => a-b)[4], samples_us: samples, operation: name.startsWith('null-') ? 'null plus promotion' : name.startsWith('change-') ? 'five waves' : 'one probe', metrics, callbacks_sync: callbacks, emitted_keys: emitted && typeof emitted === 'object' ? Object.keys(emitted).length : null, sink }));
