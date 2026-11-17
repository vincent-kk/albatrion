// Shared measurement library for JSONSchemaScanner before/after evaluation.
// Loads the BUILT scanner entry points relative to this package or a supplied dist directory.
// Run `yarn build` first so dist is current, then e.g. `node benchmark/bench.mjs`.
import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Package location is bound to this harness file, independent of the caller's cwd. */
export const packageRoot = fileURLToPath(new URL('../', import.meta.url));

/**
 * Load a built package's scanner entry points and optional resolver adapter.
 * @param {string} buildDirectory Absolute or cwd-relative dist directory; defaults to this package's dist.
 * @returns {Promise<object>} Scanner constructors and available resolver factory.
 * @throws When a build is missing or its entry points cannot be imported.
 */
export async function loadScanners(
  buildDirectory = resolve(packageRoot, 'dist'),
) {
  const build = pathToFileURL(resolve(buildDirectory) + '/');
  const sync = await import(
    new URL('utils/JSONSchemaScanner/sync/index.mjs', build)
  );
  const asyncM = await import(
    new URL('utils/JSONSchemaScanner/async/index.mjs', build)
  );
  const main = await import(new URL('index.mjs', build));
  return {
    JSONSchemaScanner: sync.JSONSchemaScanner,
    JSONSchemaScannerAsync: asyncM.JSONSchemaScannerAsync,
    createReferenceResolver: main.createReferenceResolver,
    createReferenceResolverAsync: main.createReferenceResolverAsync,
  };
}

/**
 * Refuse stale runtime entry points before making a claim about current source.
 * @param {string} root Package root containing src and dist; defaults to this harness's package.
 * @returns {void}
 * @throws When either scanner build is missing or any source file is newer.
 */
export function assertFreshBuild(root = packageRoot) {
  const newestSource = latestModification(resolve(root, 'src'));
  for (const driver of ['sync', 'async']) {
    const entry = resolve(
      root,
      `dist/utils/JSONSchemaScanner/${driver}/index.mjs`,
    );
    if (newestSource > statSync(entry).mtimeMs)
      throw new Error(
        `Stale build: src is newer than ${entry}; run yarn workspace @winglet/json-schema build`,
      );
  }
}

/** Return the newest file timestamp beneath a source directory; filesystem errors propagate. */
function latestModification(directory) {
  return Math.max(
    0,
    ...readdirSync(directory, { withFileTypes: true }).map((entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory()
        ? latestModification(path)
        : statSync(path).mtimeMs;
    }),
  );
}

// --- JSON Pointer navigation returning the ORIGINAL subtree by reference ---
// Used only by the frozen-build adapter, whose callback API accepts original targets.
export function unescapeSegment(seg) {
  return seg.replace(/~1/g, '/').replace(/~0/g, '~');
}
export function getByPointer(root, pointer) {
  if (pointer === '#' || pointer === '' || pointer === '#/') return root;
  let p = pointer;
  if (p[0] === '#') p = p.slice(1);
  if (p[0] === '/') p = p.slice(1);
  const segs = p.split('/').map(unescapeSegment);
  let cur = root;
  for (const s of segs) {
    if (cur == null) return undefined;
    cur = cur[s];
  }
  return cur;
}

// --- deterministic schema generators (no Math.random) ---
export function genWide(n) {
  const properties = {};
  for (let i = 0; i < n; i++)
    properties[`p${i}`] = { type: 'string', minLength: i % 5 };
  return { type: 'object', properties };
}
export function genDeep(n) {
  let node = { type: 'string' };
  for (let i = 0; i < n; i++)
    node = { type: 'object', properties: { child: node } };
  return node;
}
export function genBranchy(breadth, depth) {
  function build(d) {
    if (d === 0) return { type: 'string' };
    const properties = {};
    for (let i = 0; i < breadth; i++) properties[`b${i}`] = build(d - 1);
    return { type: 'object', properties };
  }
  return build(depth);
}
export function genMixed(breadth, depth) {
  function build(d) {
    if (d === 0) return { type: 'number' };
    const properties = {};
    for (let i = 0; i < breadth; i++) properties[`m${i}`] = build(d - 1);
    return {
      type: 'object',
      properties,
      allOf: [{ type: 'object' }],
      items: build(Math.max(0, d - 2)),
    };
  }
  return build(depth);
}
// refHeavy: N refs each pointing at a rich definition subtree.
export function genRefHeavy(refCount, defNodeBreadth = 3, defNodeDepth = 3) {
  const def = genBranchy(defNodeBreadth, defNodeDepth);
  const properties = {};
  for (let i = 0; i < refCount; i++)
    properties[`r${i}`] = { $ref: '#/definitions/D' };
  return { type: 'object', properties, definitions: { D: def } };
}

// --- timing helpers ---
export function timeit(fn, { warmup = 5, iters = 30 } = {}) {
  for (let i = 0; i < warmup; i++) fn();
  const samples = [];
  for (let i = 0; i < iters; i++) {
    const t0 = performance.now();
    fn();
    samples.push(performance.now() - t0);
  }
  samples.sort((a, b) => a - b);
  return {
    median: samples[Math.floor(samples.length / 2)],
    min: samples[0],
    max: samples[samples.length - 1],
    mean: samples.reduce((a, b) => a + b, 0) / samples.length,
  };
}
export async function timeitAsync(fn, { warmup = 3, iters = 15 } = {}) {
  for (let i = 0; i < warmup; i++) await fn();
  const samples = [];
  for (let i = 0; i < iters; i++) {
    const t0 = performance.now();
    await fn();
    samples.push(performance.now() - t0);
  }
  samples.sort((a, b) => a - b);
  return {
    median: samples[Math.floor(samples.length / 2)],
    min: samples[0],
    max: samples[samples.length - 1],
    mean: samples.reduce((a, b) => a + b, 0) / samples.length,
  };
}

// count nodes visited via an enter counter
export function countVisited(Scanner, schema, options = {}) {
  let n = 0;
  new Scanner({ visitor: { enter: () => n++ }, options }).scan(schema);
  return n;
}

export function round(x, d = 3) {
  const f = 10 ** d;
  return Math.round(x * f) / f;
}
