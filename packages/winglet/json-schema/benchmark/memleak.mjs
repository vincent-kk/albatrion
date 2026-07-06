// Memory-leak probe. Run with: node --expose-gc memleak.mjs
// For each scenario: warm, gc, record baseline retained heap, then run many
// iterations in batches, gc + sample heap after each batch. A leak = monotonic
// retained-heap growth across batches beyond noise. Emits JSON.
import {
  loadScanners,
  genBranchy,
  genRefHeavy,
  getByPointer,
} from "./_lib.mjs";

const { JsonSchemaScanner, JsonSchemaScannerAsync } = await loadScanners();

if (typeof globalThis.gc !== "function") {
  console.log(JSON.stringify({ error: "run with --expose-gc" }));
  process.exit(2);
}
const gc = globalThis.gc;

function heapMB() {
  return process.memoryUsage().heapUsed / (1024 * 1024);
}
function settle() {
  gc();
  gc();
}

async function scenario(
  name,
  iterFn,
  { batches = 8, perBatch = 500, isAsync = false } = {},
) {
  // warm
  for (let i = 0; i < 50; i++) isAsync ? await iterFn() : iterFn();
  settle();
  const samples = [heapMB()];
  for (let b = 0; b < batches; b++) {
    for (let i = 0; i < perBatch; i++) isAsync ? await iterFn() : iterFn();
    settle();
    samples.push(heapMB());
  }
  const first = samples[1]; // after first batch (steady state)
  const last = samples[samples.length - 1];
  const growth = last - first;
  // linear-ish growth across the last (batches-1) batches
  const tail = samples.slice(1);
  const slope = (tail[tail.length - 1] - tail[0]) / (tail.length - 1);
  return {
    name,
    baselineMB: +samples[0].toFixed(2),
    samplesMB: samples.map((x) => +x.toFixed(2)),
    growthMB: +growth.toFixed(2),
    slopeMBperBatch: +slope.toFixed(3),
    // verdict: retained growth under ~2MB and slope near zero → no leak
    leakSuspected: growth > 2 && slope > 0.15,
  };
}

const branchy = genBranchy(4, 5);
const refSchema = genRefHeavy(100, 3, 2);

const results = [];

// 1. new instance each iteration, discarded
results.push(
  await scenario("new-instance-scan", () => {
    new JsonSchemaScanner({ visitor: { enter: () => {} } }).scan(branchy);
  }),
);

// 2. reused instance
{
  const scanner = new JsonSchemaScanner({ visitor: { enter: () => {} } });
  results.push(
    await scenario("reused-instance-scan", () => {
      scanner.scan(branchy);
    }),
  );
}

// 3. refHeavy scan + getValue (clone/inlining churn — exercises R1)
results.push(
  await scenario(
    "refHeavy-scan-getValue",
    () => {
      const s = new JsonSchemaScanner({
        options: { resolveReference: (ref) => getByPointer(refSchema, ref) },
      });
      s.scan(refSchema);
      s.getValue();
    },
    { batches: 8, perBatch: 300 },
  ),
);

// 4. async scan + getValue
results.push(
  await scenario(
    "async-scan-getValue",
    async () => {
      const s = new JsonSchemaScannerAsync({
        options: {
          resolveReference: async (ref) => getByPointer(refSchema, ref),
        },
      });
      await s.scan(refSchema);
      s.getValue();
    },
    { batches: 6, perBatch: 200, isAsync: true },
  ),
);

const anyLeak = results.some((r) => r.leakSuspected);
console.log(JSON.stringify({ anyLeak, results }, null, 2));
process.exit(0);
