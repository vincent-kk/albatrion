// Visit-sequence + resolver-call + output snapshot for a battery of schemas.
// Emits a deterministic JSON snapshot used as the behavior-equivalence GATE:
// the E2 refactor / P2 / P3(default off) / E1(default) must reproduce it.
import { loadScanners, getByPointer } from "./_lib.mjs";

const { JsonSchemaScanner, JsonSchemaScannerAsync } = await loadScanners();

function snapshotCase(schema, options = {}) {
  const enterSeq = [];
  const exitSeq = [];
  const resolverCalls = [];
  const opts = { ...options };
  if (opts.__withResolver) {
    delete opts.__withResolver;
    opts.resolveReference = (ref, entry) => {
      resolverCalls.push(ref);
      return getByPointer(schema, ref);
    };
  }
  const scanner = new JsonSchemaScanner({
    visitor: {
      enter: (e) =>
        enterSeq.push({
          path: e.path,
          dataPath: e.dataPath,
          keyword: e.keyword ?? null,
          depth: e.depth,
        }),
      exit: (e) =>
        exitSeq.push({
          path: e.path,
          hasReference: e.hasReference ?? false,
          referenceResolved: e.referenceResolved ?? false,
        }),
    },
    options: opts,
  });
  scanner.scan(schema);
  const output = scanner.getValue();
  return { enterSeq, exitSeq, resolverCalls, output };
}

async function snapshotCaseAsync(schema, options = {}) {
  const enterSeq = [];
  const exitSeq = [];
  const resolverCalls = [];
  const opts = { ...options };
  if (opts.__withResolver) {
    delete opts.__withResolver;
    opts.resolveReference = (ref) => {
      resolverCalls.push(ref);
      return getByPointer(schema, ref);
    };
  }
  const scanner = new JsonSchemaScannerAsync({
    visitor: {
      enter: (e) =>
        enterSeq.push({
          path: e.path,
          dataPath: e.dataPath,
          keyword: e.keyword ?? null,
          depth: e.depth,
        }),
      exit: (e) =>
        exitSeq.push({
          path: e.path,
          hasReference: e.hasReference ?? false,
          referenceResolved: e.referenceResolved ?? false,
        }),
    },
    options: opts,
  });
  await scanner.scan(schema);
  const output = scanner.getValue();
  return { enterSeq, exitSeq, resolverCalls, output };
}

const cases = {
  simpleObject: () =>
    snapshotCase({
      type: "object",
      properties: { a: { type: "string" }, b: { type: "number" } },
    }),
  nested: () =>
    snapshotCase({
      type: "object",
      properties: {
        a: { type: "object", properties: { c: { type: "string" } } },
        b: { type: "array", items: { type: "number" } },
      },
    }),
  tupleItems: () =>
    snapshotCase({
      type: "array",
      prefixItems: [{ type: "string" }, { type: "number" }],
      items: { type: "boolean" },
    }),
  composition: () =>
    snapshotCase({
      allOf: [{ type: "object" }],
      anyOf: [{ type: "string" }, { type: "number" }],
      oneOf: [{ type: "boolean" }],
    }),
  conditional: () =>
    snapshotCase({
      if: { type: "object" },
      then: { type: "string" },
      else: { type: "number" },
      not: { type: "null" },
    }),
  additionalProps: () =>
    snapshotCase({
      type: "object",
      properties: { a: { type: "string" } },
      additionalProperties: { type: "number" },
    }),
  defs: () =>
    snapshotCase({
      type: "object",
      $defs: { E: { type: "string" } },
      definitions: { A: { type: "number" } },
    }),
  refResolve: () =>
    snapshotCase(
      {
        type: "object",
        properties: { x: { $ref: "#/definitions/A" } },
        definitions: {
          A: { type: "object", properties: { n: { type: "string" } } },
        },
      },
      { __withResolver: true },
    ),
  refChain: () =>
    snapshotCase(
      {
        type: "object",
        properties: { x: { $ref: "#/definitions/A" } },
        definitions: {
          A: { $ref: "#/definitions/B" },
          B: { type: "string" },
        },
      },
      { __withResolver: true },
    ),
  refCycle: () =>
    snapshotCase(
      {
        type: "object",
        properties: { x: { $ref: "#/definitions/A" } },
        definitions: {
          A: {
            type: "object",
            properties: { self: { $ref: "#/definitions/A" } },
          },
        },
      },
      { __withResolver: true },
    ),
  filterSkip: () =>
    snapshotCase(
      {
        type: "object",
        properties: { a: { type: "string" }, b: { type: "number" } },
      },
      { filter: (e) => e.path !== "#/properties/b" },
    ),
  maxDepth: () =>
    snapshotCase(
      {
        type: "object",
        properties: {
          a: { type: "object", properties: { deep: { type: "string" } } },
        },
      },
      { maxDepth: 2 },
    ),
};

const asyncCases = {
  asyncRefResolve: () =>
    snapshotCaseAsync(
      {
        type: "object",
        properties: { x: { $ref: "#/definitions/A" } },
        definitions: { A: { type: "string" } },
      },
      { __withResolver: true },
    ),
  asyncFilter: () =>
    snapshotCaseAsync(
      {
        type: "object",
        properties: { a: { type: "string" }, b: { type: "number" } },
      },
      { filter: (e) => e.path !== "#/properties/b" },
    ),
  asyncNested: () =>
    snapshotCaseAsync({
      type: "object",
      properties: {
        a: { type: "object", properties: { c: { type: "string" } } },
      },
    }),
};

const snapshot = {};
for (const [name, fn] of Object.entries(cases)) snapshot[name] = fn();
for (const [name, fn] of Object.entries(asyncCases))
  snapshot[name] = await fn();

console.log(JSON.stringify(snapshot, null, 2));
process.exit(0);
