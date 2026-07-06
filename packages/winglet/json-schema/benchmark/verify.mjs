// Correctness / bug invariants. Each check returns { pass, detail }.
// On CURRENT code several are expected to FAIL; after fixes all must PASS.
import {
  loadScanners,
  getByPointer,
  makeOriginalRefResolver,
} from "./_lib.mjs";

const { JsonSchemaScanner, JsonSchemaScannerAsync } = await loadScanners();

const results = [];
function check(id, title, fn) {
  try {
    const r = fn();
    results.push({ id, title, pass: !!r.pass, detail: r.detail });
  } catch (e) {
    results.push({ id, title, pass: false, detail: `THREW: ${e.message}` });
  }
}
async function checkAsync(id, title, fn) {
  try {
    const r = await fn();
    results.push({ id, title, pass: !!r.pass, detail: r.detail });
  } catch (e) {
    results.push({ id, title, pass: false, detail: `THREW: ${e.message}` });
  }
}

// Build a schema whose resolver returns ORIGINAL subtrees (real-world pattern).
function refSchema() {
  return {
    type: "object",
    properties: {
      x: { $ref: "#/definitions/A" },
      y: { $ref: "#/definitions/A" }, // same ref twice → aliasing probe
    },
    definitions: {
      A: {
        type: "object",
        properties: { b: { $ref: "#/definitions/B" } },
      },
      B: { type: "string" },
    },
  };
}

// V1: scan()+getValue() must NOT mutate the original schema.
check("V1", "original schema unchanged after scan+getValue", () => {
  const schema = refSchema();
  const before = JSON.stringify(schema);
  const scanner = new JsonSchemaScanner({
    options: { resolveReference: makeOriginalRefResolver(() => schema) },
  });
  scanner.scan(schema).getValue();
  const after = JSON.stringify(schema);
  return {
    pass: before === after,
    detail:
      before === after
        ? "original preserved"
        : `MUTATED: definitions.A.properties.b = ${JSON.stringify(schema.definitions.A.properties.b)}`,
  };
});

// V2: output subtree must not be the same reference as original definitions.A
check("V2", "output not aliased to original definitions subtree", () => {
  const schema = refSchema();
  const out = new JsonSchemaScanner({
    options: { resolveReference: makeOriginalRefResolver(() => schema) },
  })
    .scan(schema)
    .getValue();
  const shared = out.properties.x === schema.definitions.A;
  return {
    pass: !shared,
    detail: shared
      ? "output.properties.x === original definitions.A"
      : "distinct refs",
  };
});

// V3: same $ref twice → outputs must not be aliased to each other
check("V3", "multiple occurrences of same ref not aliased in output", () => {
  const schema = refSchema();
  const out = new JsonSchemaScanner({
    options: { resolveReference: makeOriginalRefResolver(() => schema) },
  })
    .scan(schema)
    .getValue();
  const aliased = out.properties.x === out.properties.y;
  return {
    pass: !aliased,
    detail: aliased ? "x and y share reference" : "x and y distinct",
  };
});

// V4: definition keys containing '/' and '~' must be RFC6901-escaped in path
check("V4", "definition keys escaped in visited paths", () => {
  const schema = {
    type: "object",
    definitions: { "a/b": { type: "string" }, "c~d": { type: "number" } },
  };
  const paths = [];
  new JsonSchemaScanner({ visitor: { enter: (e) => paths.push(e.path) } }).scan(
    schema,
  );
  const okSlash = paths.includes("#/definitions/a~1b");
  const okTilde = paths.includes("#/definitions/c~0d");
  return {
    pass: okSlash && okTilde,
    detail: `paths=${JSON.stringify(paths)}`,
  };
});

// V5a: additionalProperties:false must be skipped (already true) —
//      items:false must be treated consistently (object-only policy → skipped)
check("V5a", "boolean subschemas (items:false) not visited as garbage", () => {
  const schema = { type: "array", items: false };
  const visited = [];
  new JsonSchemaScanner({
    visitor: { enter: (e) => visited.push(e.path) },
  }).scan(schema);
  // policy: only non-null object subschemas are visited; items:false → no child entry
  const visitedItems = visited.includes("#/items");
  return {
    pass: !visitedItems,
    detail: `visited=${JSON.stringify(visited)}`,
  };
});

// V5b: properties as a string must not explode into index garbage entries
check(
  "V5b",
  "non-object properties value does not create garbage entries",
  () => {
    const schema = { type: "object", properties: "abc" };
    const visited = [];
    new JsonSchemaScanner({
      visitor: { enter: (e) => visited.push(e.path) },
    }).scan(schema);
    const garbage = visited.some((p) => p.startsWith("#/properties/"));
    return { pass: !garbage, detail: `visited=${JSON.stringify(visited)}` };
  },
);

// V5c: composition array with boolean/non-object element must not create garbage
check("V5c", "non-object composition element guarded", () => {
  const schema = { allOf: [{ type: "string" }, false, "x"] };
  const visited = [];
  new JsonSchemaScanner({
    visitor: { enter: (e) => visited.push(e.path) },
  }).scan(schema);
  const badElem =
    visited.includes("#/allOf/1") || visited.includes("#/allOf/2");
  return { pass: !badElem, detail: `visited=${JSON.stringify(visited)}` };
});

// V5d: mutate returning a valid falsy schema (false) is honored (not confused with void)
check("V5d", "mutate distinguishes void from falsy schema (documented)", () => {
  // Under object-only policy, false schema has no children; mutate false should
  // still be recorded in resolves so getValue reflects it.
  const schema = { type: "object", properties: { a: { type: "string" } } };
  const out = new JsonSchemaScanner({
    options: {
      mutate: (e) => (e.path === "#/properties/a" ? false : undefined),
    },
  })
    .scan(schema)
    .getValue();
  return {
    pass: out.properties.a === false,
    detail: `properties.a=${JSON.stringify(out.properties.a)}`,
  };
});

// V6: throwing resolver → state reset; getValue() === undefined; rescan works
check(
  "V6",
  "failed scan resets state (getValue undefined) and rescan works",
  () => {
    const schema = refSchema();
    const scanner = new JsonSchemaScanner({
      options: {
        resolveReference: () => {
          throw new Error("boom");
        },
      },
    });
    let threw = false;
    try {
      scanner.scan(schema);
    } catch (e) {
      threw = e.message === "boom";
    }
    const gv = scanner.getValue();
    // rescan with a benign scanner on same instance-like flow
    const scanner2 = new JsonSchemaScanner();
    const rescan = scanner2.scan({ type: "string" }).getValue();
    return {
      pass: threw && gv === undefined && !!rescan,
      detail: `threw=${threw} getValue=${gv === undefined ? "undefined" : JSON.stringify(gv)} rescanOk=${!!rescan}`,
    };
  },
);

// V7: async mutate must be awaited (result must not be a Promise)
await checkAsync(
  "V7",
  "async mutate awaited (schema not a Promise)",
  async () => {
    const schema = { type: "object", properties: { a: { type: "string" } } };
    const scanner = new JsonSchemaScannerAsync({
      options: {
        mutate: async (e) => {
          if (e.path === "#/properties/a") return { ...e.schema, title: "T" };
          return undefined;
        },
      },
    });
    await scanner.scan(schema);
    const out = scanner.getValue();
    const a = out.properties.a;
    const isPromise = a && typeof a.then === "function";
    return {
      pass: !isPromise && a.title === "T",
      detail: isPromise
        ? "a is a Promise (await missing)"
        : `a=${JSON.stringify(a)}`,
    };
  },
);

// V8: async filter works at runtime (documented — should already pass)
await checkAsync("V8", "async filter awaited at runtime", async () => {
  const schema = {
    type: "object",
    properties: { a: { type: "string" }, b: { type: "number" } },
  };
  const visited = [];
  const scanner = new JsonSchemaScannerAsync({
    visitor: { enter: (e) => visited.push(e.path) },
    options: { filter: async (e) => e.path !== "#/properties/b" },
  });
  await scanner.scan(schema);
  return {
    pass:
      visited.includes("#/properties/a") && !visited.includes("#/properties/b"),
    detail: `visited=${JSON.stringify(visited)}`,
  };
});

// V9: resolver call count for the same ref appearing multiple times (baseline: no cache)
check(
  "V9",
  "resolver call count for repeated ref (records caching behavior)",
  () => {
    const schema = {
      type: "object",
      properties: {
        x: { $ref: "#/definitions/A" },
        y: { $ref: "#/definitions/A" },
        z: { $ref: "#/definitions/A" },
      },
      definitions: { A: { type: "string" } },
    };
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
    // This is a behavior record, not a pass/fail on baseline (default = no cache).
    return { pass: true, detail: `resolver calls (default) = ${calls}` };
  },
);

const failed = results.filter((r) => !r.pass);
const summary = {
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  results,
};
console.log(JSON.stringify(summary, null, 2));
process.exit(0);
