// Speed benchmark across corpora. Emits JSON (median/min/mean ms per corpus).
import {
  loadScanners,
  genWide,
  genDeep,
  genBranchy,
  genMixed,
  genRefHeavy,
  getByPointer,
  timeit,
  timeitAsync,
  countVisited,
  round,
} from "./_lib.mjs";

const { JsonSchemaScanner, JsonSchemaScannerAsync } = await loadScanners();

const corpora = {
  "branchy(6,5)": genBranchy(6, 5),
  "wide(10000)": genWide(10000),
  "deep(400)": genDeep(400),
  "mixed(4,7)": genMixed(4, 7),
};

const report = { sync: {}, syncNoop: {}, async: {}, refHeavy: {}, meta: {} };

// pure traversal, no callbacks
for (const [name, schema] of Object.entries(corpora)) {
  const nodes = countVisited(JsonSchemaScanner, schema);
  const t = timeit(() => new JsonSchemaScanner().scan(schema));
  report.sync[name] = {
    nodes,
    median: round(t.median),
    min: round(t.min),
    mean: round(t.mean),
  };
}

// traversal with noop enter/exit (visitor dispatch cost)
for (const [name, schema] of Object.entries(corpora)) {
  const noop = () => {};
  const t = timeit(() =>
    new JsonSchemaScanner({ visitor: { enter: noop, exit: noop } }).scan(
      schema,
    ),
  );
  report.syncNoop[name] = {
    median: round(t.median),
    min: round(t.min),
    mean: round(t.mean),
  };
}

// async with sync noop callbacks (thenable-guard / microtask overhead)
for (const [name, schema] of Object.entries(corpora)) {
  const noop = () => {};
  const t = await timeitAsync(async () => {
    await new JsonSchemaScannerAsync({
      visitor: { enter: noop, exit: noop },
    }).scan(schema);
  });
  report.async[name] = {
    median: round(t.median),
    min: round(t.min),
    mean: round(t.mean),
  };
}

// refHeavy: scan + getValue (reference inlining path, exercises R1 clone cost)
{
  const schema = genRefHeavy(300, 3, 3);
  const nodesPerDef = countVisited(JsonSchemaScanner, genBranchy(3, 3));
  const t = timeit(
    () => {
      const s = new JsonSchemaScanner({
        options: { resolveReference: (ref) => getByPointer(schema, ref) },
      });
      s.scan(schema);
      s.getValue();
    },
    { warmup: 3, iters: 20 },
  );
  report.refHeavy["refHeavy(300)+getValue"] = {
    refs: 300,
    defNodes: nodesPerDef,
    median: round(t.median),
    min: round(t.min),
    mean: round(t.mean),
  };
}

// refHeavy repeated same ref (cache probe — resolver call count)
{
  const schema = genRefHeavy(200, 2, 2);
  let calls = 0;
  new JsonSchemaScanner({
    options: {
      resolveReference: (ref) => {
        calls++;
        return getByPointer(schema, ref);
      },
    },
  })
    .scan(schema)
    .getValue();
  report.meta.resolverCallsFor200SameRef = calls;
}

console.log(JSON.stringify(report, null, 2));
process.exit(0);
