// Reproduction entry: source-only bundles; git is read-only and raw files contain timing samples only.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(pkg, '../../..');
const req = createRequire(path.join(pkg, 'package.json'));
const { build } = req('esbuild');
const src = path.join(pkg, 'src');
const out = path.join(pkg, 'architecture/verification/07-switch');
const delivery = 'core/settle/utils/commit/markCommitDeliveries.ts';
const beforeV = ['core/settle/utils/compute/computeNode.ts', 'core/settle/utils/transition/transitionSettlement.ts'];
const count = 101;
const warmup = 20;
const gitSource = (ref, file) => execFileSync('git', ['show', `${ref}:packages/canard/schema-form/src/${file}`], { cwd: repo, encoding: 'utf8' });
const sources = new Map();
const readGit = (ref, file) => {
  const key = `${ref}:${file}`;
  if (!sources.has(key)) sources.set(key, gitSource(ref, file));
  return sources.get(key);
};

/** Reconstruct the rejected shared-empty variant without editing product source. */
function sharedDelivery(source) {
  source = source.replace('const EMPTY_WATCH_VALUES: readonly unknown[] = Object.freeze([]);',
    'const EMPTY_WATCH_VALUES: readonly unknown[] = Object.freeze([]);\nconst EMPTY_AUTOMATIC_NODES: ReadonlySet<unknown> = new Set();');
  source = source.replace(/  const automaticNodes = new Set<Self>\(\);\n  for \(let index = 0; index < context.automaticLog.length; index\+\+\)\n    automaticNodes.add\(context.automaticLog\[index\].node\);/,
    `  let automaticNodes = EMPTY_AUTOMATIC_NODES;
  if (context.automaticLog.length > 0) {
    const nodes = new Set<Self>();
    for (let index = 0; index < context.automaticLog.length; index++)
      nodes.add(context.automaticLog[index].node);
    automaticNodes = nodes;
  }`);
  source = source.replace('  const ordered = new Set<unknown>(globalState.nodes);\n  for (const node of candidates) ordered.add(node);',
    `  const ordered = globalState.nodes.size > 0
    ? new Set<unknown>(globalState.nodes) : candidates;
  if (ordered !== candidates)
    for (const node of candidates) ordered.add(node);`);
  source = source.replace('  const departing: Self[] = [];',
    '  if (context.exited.size || context.perished.size) {\n  const departing: Self[] = [];');
  source = source.replace('  runtime.deliveredContext = runtime.context;',
    '  }\n  runtime.deliveredContext = runtime.context;');
  assert(source.includes('let automaticNodes = EMPTY_AUTOMATIC_NODES;'));
  return source;
}
let counts;
globalThis.__round87 = (kind, node, context) => {
  if (!counts) return;
  if (kind === 'changed') {
    for (const changed of context.changedNodes) counts.changed.add(changed);
    return;
  }
  const map = counts[kind];
  const key = node;
  const record = map.get(key) ?? { path: node.path, calls: 0 };
  record.calls++;
  map.set(key, record);
};

/** Compile variants in isolation, replacing only specified source in memory. */
async function engine(variant, traced = false) {
  const result = await build({
    stdin: { contents: `export { nodeFromJSONSchema } from './src/core/nodeFromJSONSchema';
      export { createTestTree } from './src/core/settle/__tests__/fixtures/createTestTree';
      export { loadSchemaNodeAtMount } from './src/core/settle';
      export { markCommitDeliveries } from './src/${delivery}';
      export { createSettlementContext } from './src/core/settle/utils/settlement/createSettlementContext';
      export { getSettlementScratch } from './src/core/settle/utils/write/getSettlementScratch';
      export { equivalentFixtures } from '../../aileron/benchmark-form/fixtures/equivalent';`,
      resolveDir: pkg, loader: 'ts' },
    write: false, bundle: true, packages: 'external', platform: 'node', format: 'cjs',
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [{ name: 'round87-source', setup(builder) {
      builder.onResolve({ filter: /^@\/schema-form/ }, args => {
        const base = path.join(src, args.path.replace(/^@\/schema-form\/?/, ''));
        const file = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
          .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
        return { path: file };
      });
      builder.onLoad({ filter: /\/schema-form\/src\/.*\.tsx?$/ }, args => {
        const file = path.relative(src, args.path);
        let source = variant === 'head' || variant === 'before-v'
          ? readGit(variant === 'before-v' && beforeV.includes(file) ? '0189c443b^' : '0189c443b', file)
          : variant === 'head-delivery' && file === delivery ? readGit('0189c443b', file)
          : variant === 'revert-delivery' && file === delivery ? readGit('0189c443b^', file)
          : fs.readFileSync(args.path, 'utf8');
        if (variant === 'shared-delivery' && file === delivery) source = sharedDelivery(source);
        if (variant === 'compact-delivery' && file === delivery) {
          source = source.replace('const EMPTY_WATCH_VALUES: readonly unknown[] = Object.freeze([]);',
            `const EMPTY_WATCH_VALUES: readonly unknown[] = Object.freeze([]);
function sameWatchValues(previous: readonly unknown[], current: readonly unknown[]): boolean {
  if (previous.length !== current.length) return false;
  for (let index = 0; index < current.length; index++)
    if (!isSameDeliveryValue(current[index], previous[index])) return false;
  return true;
}`);
          source = source.replace(/    let watchChanged = initialized && watched.length !== previousWatchValues.length;\n    for \(let index = 0; initialized && !watchChanged && index < watched.length; index\+\+\)\n      if \(!isSameDeliveryValue\(watched\[index\], previousWatchValues\[index\]\)\) watchChanged = true;/,
            '    const watchChanged = initialized && !sameWatchValues(previousWatchValues, watched);');
          assert(source.includes('const watchChanged = initialized && !sameWatchValues('));
        }
        if (traced && file.endsWith('/computeNode.ts'))
          source = source.replace('if (!context.dirtyPaths.has(node.path)) return;',
            `globalThis.__round87('visited', node, context);
             if (!context.dirtyPaths.has(node.path)) return;
             globalThis.__round87('computed', node, context);`);
        if (traced && file === delivery) {
          source = source.replace('const runtime = context.root.runtime;',
            `globalThis.__round87('changed', context.root, context); const runtime = context.root.runtime;`);
          source = source.replace('visit?.(node);', `globalThis.__round87('delivery', node, context); visit?.(node);`);
        }
        return { contents: source, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };
      });
    } }],
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(req, module, module.exports);
  return module.exports;
}

const quantile = (values, q) => [...values].sort((a, b) => a - b)[Math.ceil(values.length * q) - 1];
const metric = values => ({ median: quantile(values, .5), p99: quantile(values, .99) });
const save = (name, value) => {
  const text = JSON.stringify(value);
  assert(Buffer.byteLength(text) < 5_000_000);
  fs.writeFileSync(path.join(out, name), text + '\n', { flag: 'wx' });
};
const variants = process.env.ROUND87_VARIANTS?.split(',') ?? ['head', 'head-delivery', 'working', 'revert-delivery'];
assert(variants.includes('working'));
const engines = {};
for (const variant of variants) engines[variant] = await engine(variant);
const fixtures = engines.working.equivalentFixtures.filter(fixture =>
  (process.env.ROUND87_FIXTURES?.split(',') ??
    ['flat-500', 'nested-d5-f4', 'array-1000', 'computed-visible-derived']).includes(fixture.name));
const timing = [];
const summary = [];
for (const fixture of fixtures) {
  const rows = Object.fromEntries(variants.map(variant => [variant, { mount: [], update: [] }]));
  for (let sample = -warmup; sample < count; sample++) {
    const order = sample % 2 ? variants : [...variants].reverse();
    const observations = [];
    for (const variant of order) {
      globalThis.gc?.();
      const schema = structuredClone(fixture.workspace);
      let start = performance.now();
      const root = engines[variant].nodeFromJSONSchema({ jsonSchema: schema, validationMode: 0 });
      const mount = performance.now() - start;
      const mounted = JSON.stringify(root.value);
      await new Promise(resolve => setTimeout(resolve, 0));
      start = performance.now();
      for (const interaction of fixture.interactions) root.find(interaction.path).setValue(interaction.value);
      const update = performance.now() - start;
      observations.push([mounted, JSON.stringify(root.value)]);
      await new Promise(resolve => setTimeout(resolve, 0));
      if (sample >= 0) { rows[variant].mount.push(mount); rows[variant].update.push(update); }
    }
    for (const observation of observations) assert.deepEqual(observation, observations[0]);
  }
  for (const variant of variants) for (const mode of ['mount', 'update']) {
    timing.push({ fixture: fixture.name, variant, mode, ms: rows[variant][mode] });
    summary.push({ fixture: fixture.name, variant, mode, ...metric(rows[variant][mode]) });
  }
  console.log(`TIMING ${fixture.name} equal values, ${count} samples`);
}

// Exercise the actual empty delivery operation repeatedly; context construction is outside timing.
const deliveryRows = Object.fromEntries(variants.map(variant => [variant, []]));
const contexts = {};
for (const variant of variants) {
  const api = engines[variant];
  const { root } = api.createTestTree({ type: 'string' });
  api.loadSchemaNodeAtMount(root, 'same', 1);
  root.pendingDelivery = undefined;
  root.runtime.deliveries.clear();
  contexts[variant] = api.createSettlementContext(root, 'input', 1, api.getSettlementScratch(root.runtime));
}
for (let sample = -warmup; sample < count; sample++) {
  for (const variant of sample % 2 ? variants : [...variants].reverse()) {
    const start = performance.now();
    for (let repetition = 0; repetition < 2000; repetition++)
      engines[variant].markCommitDeliveries(contexts[variant]);
    if (sample >= 0) deliveryRows[variant].push((performance.now() - start) / 2000);
  }
}
for (const variant of variants) {
  timing.push({ fixture: 'empty-delivery', variant, mode: 'commit', ms: deliveryRows[variant] });
  summary.push({ fixture: 'empty-delivery', variant, mode: 'commit', ...metric(deliveryRows[variant]) });
}

const nodeCounts = [];
function capture(action) {
  counts = { visited: new Map(), computed: new Map(), delivery: new Map(), changed: new Set() };
  action();
  const result = { changed: counts.changed.size };
  for (const kind of ['visited', 'computed', 'delivery']) {
    const entries = [...counts[kind].values()];
    const histogram = {};
    for (const entry of entries) histogram[entry.calls] = (histogram[entry.calls] ?? 0) + 1;
    result[kind] = { nodes: entries.length, calls: entries.reduce((sum, entry) => sum + entry.calls, 0),
      callsPerNode: histogram, unrelated: entries.filter(entry => entry.path.startsWith('/unrelated')).length };
  }
  counts = undefined;
  return result;
}
for (const variant of ['before-v', 'head', 'working']) {
  const api = await engine(variant, true);
  for (const fixture of fixtures) {
    let root;
    const result = capture(() => { root = api.nodeFromJSONSchema({ jsonSchema: structuredClone(fixture.workspace), validationMode: 0 }); });
    nodeCounts.push({ variant, fixture: fixture.name, mode: 'mount', ...result });
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  for (const size of [100, 1000]) for (const operation of ['push', 'remove-last', 'remove-first']) {
    const root = api.nodeFromJSONSchema({ jsonSchema: { type: 'object', properties: {
      rows: { type: 'array', items: { type: 'object', properties: { key: { type: 'number' } } } },
      unrelated: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } },
    } }, defaultValue: { rows: Array.from({ length: size }, (_, key) => ({ key })), unrelated: { a: 'a', b: 'b' } } });
    await new Promise(resolve => setTimeout(resolve, 0));
    const rows = root.find('/rows');
    const unrelated = root.find('/unrelated').value;
    const result = capture(() => operation === 'push' ? rows.push({ key: size }) : rows.remove(operation === 'remove-last' ? size - 1 : 0));
    assert.equal(root.find('/unrelated').value, unrelated);
    assert.equal(rows.value.length, operation === 'push' ? size + 1 : size - 1);
    nodeCounts.push({ variant, fixture: `rows-${size}+unrelated-3`, mode: operation, ...result });
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
const prefix = process.env.ROUND87_OUTPUT ?? 'round-87';
save(`${prefix}-timings.json`, timing);
save(`${prefix}-summary.json`, { environment: { head: '0189c443b', node: process.version,
  cpu: os.cpus()[0].model, mode: 'development synchronous core, validation off', warmup, samples: count,
  methodology: 'Alternating variant order; explicit GC before each core sample; fresh schema; no tracing in timing. Empty-delivery is per call, batches of 2000.' }, summary, nodeCounts });
console.log('ROUND87_MEASURED');
