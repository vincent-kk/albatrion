// Harsh stress: extreme sizes, cycles, adversarial inputs. Each case must
// terminate without throwing (unless the throw is the expected outcome) and
// within a sane time budget. Emits JSON with {ok, ms, note} per case.
import {
  loadScanners,
  genWide,
  genDeep,
  genBranchy,
  genRefHeavy,
  getByPointer,
} from "./_lib.mjs";

const { JsonSchemaScanner, JsonSchemaScannerAsync } = await loadScanners();

const cases = {};
function run(name, fn, budgetMs = 20000) {
  const t0 = performance.now();
  try {
    const note = fn();
    const ms = performance.now() - t0;
    cases[name] = { ok: ms <= budgetMs, ms: Math.round(ms), note };
  } catch (e) {
    cases[name] = {
      ok: false,
      ms: Math.round(performance.now() - t0),
      note: `THREW: ${e.message}`,
    };
  }
}
async function runAsync(name, fn, budgetMs = 20000) {
  const t0 = performance.now();
  try {
    const note = await fn();
    const ms = performance.now() - t0;
    cases[name] = { ok: ms <= budgetMs, ms: Math.round(ms), note };
  } catch (e) {
    cases[name] = {
      ok: false,
      ms: Math.round(performance.now() - t0),
      note: `THREW: ${e.message}`,
    };
  }
}

// 1. Very wide: 200k properties
run("wide-200k", () => {
  const schema = genWide(200000);
  let n = 0;
  new JsonSchemaScanner({ visitor: { enter: () => n++ } }).scan(schema);
  return `visited=${n}`;
});

// 2. Very deep: 20k nesting (stack-based → must not overflow)
run("deep-20k", () => {
  const schema = genDeep(20000);
  let maxDepth = 0;
  new JsonSchemaScanner({
    visitor: { enter: (e) => (maxDepth = Math.max(maxDepth, e.depth)) },
  }).scan(schema);
  return `maxDepth=${maxDepth}`;
});

// 3. Branchy explosion: breadth 4 depth 9 (~349k nodes)
run("branchy(4,9)", () => {
  const schema = genBranchy(4, 9);
  let n = 0;
  new JsonSchemaScanner({ visitor: { enter: () => n++ } }).scan(schema);
  return `visited=${n}`;
});

// 4. Direct self-cycle via resolver returning original subtree (must terminate)
run("self-cycle-ref", () => {
  const schema = {
    type: "object",
    properties: { x: { $ref: "#/definitions/A" } },
    definitions: {
      A: { type: "object", properties: { self: { $ref: "#/definitions/A" } } },
    },
  };
  const out = new JsonSchemaScanner({
    options: { resolveReference: (ref) => getByPointer(schema, ref) },
  })
    .scan(schema)
    .getValue();
  return `terminated; x.type=${out.properties.x.type}`;
});

// 5. Mutual cycle A->B->A
run("mutual-cycle-ref", () => {
  const schema = {
    type: "object",
    properties: { x: { $ref: "#/definitions/A" } },
    definitions: {
      A: { type: "object", properties: { toB: { $ref: "#/definitions/B" } } },
      B: { type: "object", properties: { toA: { $ref: "#/definitions/A" } } },
    },
  };
  let n = 0;
  new JsonSchemaScanner({
    visitor: { enter: () => n++ },
    options: { resolveReference: (ref) => getByPointer(schema, ref) },
  })
    .scan(schema)
    .getValue();
  return `terminated; visited=${n}`;
});

// 6. High ref fan-out + getValue (inlining churn)
run("refHeavy-2k+getValue", () => {
  const schema = genRefHeavy(2000, 3, 3);
  const s = new JsonSchemaScanner({
    options: { resolveReference: (ref) => getByPointer(schema, ref) },
  });
  s.scan(schema);
  const out = s.getValue();
  return `inlined refs; r0.type=${out.properties.r0.type}`;
});

// 7. Adversarial junk inputs (must not crash, must not create garbage traversal)
run("adversarial-junk", () => {
  const schemas = [
    { type: "object", properties: "abcdef" },
    { type: "array", items: false },
    { type: "array", items: true },
    { allOf: [false, "x", 3, null, { type: "string" }] },
    { type: "object", additionalProperties: false },
    { type: "object", properties: { a: null, b: 5, c: { type: "string" } } },
    { definitions: "notanobject" },
    { $defs: 42 },
    { if: "x", then: false, else: { type: "string" } },
  ];
  let totalVisited = 0;
  for (const schema of schemas) {
    new JsonSchemaScanner({ visitor: { enter: () => totalVisited++ } }).scan(
      schema,
    );
  }
  return `no-crash; totalVisited=${totalVisited}`;
});

// 8. Repeated scan on a single reused instance (state hygiene under churn)
run("reused-instance-1000x", () => {
  const schema = genBranchy(4, 5);
  const scanner = new JsonSchemaScanner();
  let last = 0;
  for (let i = 0; i < 1000; i++) {
    scanner.scan(schema);
    const out = scanner.getValue();
    last = Object.keys(out.properties).length;
  }
  return `stable; lastKeys=${last}`;
});

// 9. Async: deep + remote-ish resolver (must not overflow / hang)
await runAsync("async-deep-refs", async () => {
  const schema = genRefHeavy(500, 2, 3);
  const s = new JsonSchemaScannerAsync({
    options: { resolveReference: async (ref) => getByPointer(schema, ref) },
  });
  await s.scan(schema);
  const out = s.getValue();
  return `async ok; r0.type=${out.properties.r0.type}`;
});

const allOk = Object.values(cases).every((c) => c.ok);
console.log(JSON.stringify({ allOk, cases }, null, 2));
process.exit(allOk ? 0 : 1);
