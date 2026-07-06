// Shared measurement library for JsonSchemaScanner before/after evaluation.
// Loads the BUILT scanner via the package's own subpath exports (self-
// reference), so this runs from a checkout without any absolute paths.
// Run `yarn build` first so dist is current, then e.g. `node benchmark/bench.mjs`.

export async function loadScanners() {
  const sync = await import("@winglet/json-schema/scanner");
  const asyncM = await import("@winglet/json-schema/async-scanner");
  return {
    JsonSchemaScanner: sync.JsonSchemaScanner,
    JsonSchemaScannerAsync: asyncM.JsonSchemaScannerAsync,
  };
}

// --- JSON Pointer navigation returning the ORIGINAL subtree by reference ---
// Mirrors @canard/schema-form getReferenceTable pattern (returns original ref,
// no clone) so the R1 original-mutation / aliasing bug is exercised faithfully.
export function unescapeSegment(seg) {
  return seg.replace(/~1/g, "/").replace(/~0/g, "~");
}
export function getByPointer(root, pointer) {
  if (pointer === "#" || pointer === "" || pointer === "#/") return root;
  let p = pointer;
  if (p[0] === "#") p = p.slice(1);
  if (p[0] === "/") p = p.slice(1);
  const segs = p.split("/").map(unescapeSegment);
  let cur = root;
  for (const s of segs) {
    if (cur == null) return undefined;
    cur = cur[s];
  }
  return cur;
}

// Resolver that returns the ORIGINAL subtree by reference (real-world pattern).
export function makeOriginalRefResolver(rootGetter) {
  return (ref) => getByPointer(rootGetter(), ref);
}

// --- deterministic schema generators (no Math.random) ---
export function genWide(n) {
  const properties = {};
  for (let i = 0; i < n; i++)
    properties[`p${i}`] = { type: "string", minLength: i % 5 };
  return { type: "object", properties };
}
export function genDeep(n) {
  let node = { type: "string" };
  for (let i = 0; i < n; i++)
    node = { type: "object", properties: { child: node } };
  return node;
}
export function genBranchy(breadth, depth) {
  function build(d) {
    if (d === 0) return { type: "string" };
    const properties = {};
    for (let i = 0; i < breadth; i++) properties[`b${i}`] = build(d - 1);
    return { type: "object", properties };
  }
  return build(depth);
}
export function genMixed(breadth, depth) {
  function build(d) {
    if (d === 0) return { type: "number" };
    const properties = {};
    for (let i = 0; i < breadth; i++) properties[`m${i}`] = build(d - 1);
    return {
      type: "object",
      properties,
      allOf: [{ type: "object" }],
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
    properties[`r${i}`] = { $ref: "#/definitions/D" };
  return { type: "object", properties, definitions: { D: def } };
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
