/**
 * Shared harness for the guard-cost spike: timing, validator factories,
 * guard shapes and host-object builders.
 *
 * Timing note: the operations under test are 10ns–1ms, so every sample runs a
 * calibrated inner batch and divides. Timing one call at a time would measure
 * `hrtime` overhead at the low end.
 */
import { hrtime } from 'node:process';
import { createRequire } from 'node:module';
import fs from 'node:fs';

const pluginRequire = createRequire(
  '/Users/Vincent/Workspace/albatrion/packages/canard/schema-form-ajv8-plugin/package.json',
);
const rootRequire = createRequire(
  '/Users/Vincent/Workspace/albatrion/package.json',
);

const AjvModule = pluginRequire('ajv/dist/2020');
/** Ajv 2020-12 constructor resolved from the monorepo's ajv8 plugin. */
export const Ajv2020 = AjvModule.default ?? AjvModule;

const { Validator } = await import('@cfworker/json-schema');
export { Validator as CfValidator };

/** Global result sink; every measured loop feeds it so the JIT cannot elide the work. */
export const sink = { checksum: 0 };

/** Versions of everything that can move a number, for the report's environment table. */
export function environment() {
  return {
    node: process.version,
    v8: process.versions.v8,
    platform: `${process.platform} ${process.arch}`,
    ajv: pluginRequire('ajv/package.json').version,
    cfworker: JSON.parse(
      fs.readFileSync(
        new URL('./node_modules/@cfworker/json-schema/package.json', import.meta.url),
        'utf8',
      ),
    ).version,
    tinybench: rootRequire.resolve('tinybench'),
  };
}

/**
 * Measure one batched operation.
 *
 * @param {(n: number) => number} body runs `n` iterations and returns a checksum contribution
 * @param {{warmupMs?: number, samples?: number, targetSampleMs?: number}} [opts]
 * @returns {{medianNs: number, minNs: number, maxNs: number, spreadPct: number, batch: number, samples: number}}
 */
export function measure(body, opts = {}) {
  const {
    warmupMs = Number(process.env.SPIKE_WARMUP_MS ?? 2000),
    samples = Number(process.env.SPIKE_SAMPLES ?? 11),
    targetSampleMs = Number(process.env.SPIKE_SAMPLE_MS ?? 25),
  } = opts;

  let batch = 1;
  for (;;) {
    const t0 = hrtime.bigint();
    sink.checksum += body(batch);
    const ms = Number(hrtime.bigint() - t0) / 1e6;
    if (ms >= targetSampleMs || batch >= 5e7) break;
    batch = Math.ceil(batch * (ms > 0.05 ? Math.min(16, targetSampleMs / ms) : 16));
  }

  const warmupEnd = hrtime.bigint() + BigInt(warmupMs) * 1_000_000n;
  while (hrtime.bigint() < warmupEnd) sink.checksum += body(batch);

  const perOp = [];
  for (let s = 0; s < samples; s++) {
    const t0 = hrtime.bigint();
    sink.checksum += body(batch);
    perOp.push(Number(hrtime.bigint() - t0) / batch);
  }
  perOp.sort((a, b) => a - b);

  const medianNs = perOp[(perOp.length - 1) >> 1];
  return {
    medianNs,
    minNs: perOp[0],
    maxNs: perOp[perOp.length - 1],
    spreadPct: ((perOp[perOp.length - 1] - perOp[0]) / medianNs) * 100,
    batch,
    samples,
  };
}

/**
 * Build a loop with its own code object so the call to `fn` sits at a fresh
 * inline-cache site. Used where a single guard's isolated cost is wanted.
 *
 * The loop cycles through `values` rather than reusing one object: a
 * loop-invariant argument lets V8 hoist the whole call out (measured 0.7ns for
 * an Ajv guard, i.e. nothing). Cycling also matches ADR 0006, where every write
 * hands the guard a freshly copied host object.
 *
 * @param {(value: unknown) => boolean} fn guard predicate
 * @param {unknown[]} values power-of-two-length pool of structurally identical instances
 */
export function monomorphicLoop(fn, values) {
  if ((values.length & (values.length - 1)) !== 0) {
    throw new Error('values pool length must be a power of two');
  }
  return new Function(
    'fn',
    'values',
    'return function loop(n){let c=0;const m=values.length-1;' +
      'for(let i=0;i<n;i++){if(fn(values[i&m]))c++;}return c;};',
  )(fn, values);
}

/** Build a pool of `count` structurally identical, distinctly referenced instances. */
export function pool(factory, count = 8) {
  return Array.from({ length: count }, factory);
}

/** Compile a guard predicate with Ajv 2020 (sync, no `$async`, allErrors off). */
export function ajvGuard(schema) {
  const ajv = new Ajv2020({ allErrors: false, strict: false });
  return ajv.compile(schema);
}

/** Compile a guard predicate with @cfworker/json-schema (interpreter, shortCircuit on). */
export function cfGuard(schema) {
  const validator = new Validator(schema, '2020-12', true);
  return (value) => validator.validate(value).valid;
}

// ---------------------------------------------------------------------------
// Guard shapes (M1)
// ---------------------------------------------------------------------------

/** Single-property discriminator guard, the idiomatic `if` with `required`. */
export const g1 = (key = 'kind', value = 'a') => ({
  properties: { [key]: { const: value } },
  required: [key],
});

/** Conjunction of three discriminator properties. */
export const g2 = {
  properties: { kind: { const: 'a' }, mode: { const: 'x' }, level: { const: 'hi' } },
  required: ['kind', 'mode', 'level'],
};

/** Condition hoisted three levels up from the property it constrains. */
export const g3 = {
  properties: {
    a: {
      properties: { b: { properties: { kind: { const: 'x' } }, required: ['kind'] } },
      required: ['b'],
    },
  },
  required: ['a'],
};

/** Array-scanning guard: "some item carries the flag". */
export const g4 = {
  properties: {
    items: { contains: { properties: { flag: { const: true } }, required: ['flag'] } },
  },
  required: ['items'],
};

/** Composite negation over a disjunction — no short-circuit on the true verdict. */
export const g5 = { not: { anyOf: [g1('kind', 'a'), g1('mode', 'x')] } };

// ---------------------------------------------------------------------------
// Host builders
// ---------------------------------------------------------------------------

/**
 * An object with `siblings` filler keys plus whatever `extra` carries.
 * Filler keys are never named by any guard: they measure host width alone.
 */
export function host(siblings, extra = {}) {
  const object = {};
  for (let i = 0; i < siblings; i++) object[`f${i}`] = `v${i}`;
  return Object.assign(object, extra);
}

/** `count` items, with the flag-carrying item at `matchIndex` (-1 for no match). */
export function itemsArray(count, matchIndex) {
  const items = new Array(count);
  for (let i = 0; i < count; i++) items[i] = { flag: i === matchIndex, i };
  return items;
}

/** Write a result file next to the scripts. */
export function writeResult(name, payload) {
  const url = new URL(`./results/${name}.json`, import.meta.url);
  fs.mkdirSync(new URL('./results/', import.meta.url), { recursive: true });
  fs.writeFileSync(url, JSON.stringify(payload, null, 2));
  return url.pathname;
}
