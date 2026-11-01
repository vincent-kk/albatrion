import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const load = (relative) => import(pathToFileURL(path.join(root, relative)).href);
const require = createRequire(path.join(root, 'packages/canard/schema-form-ajv8-plugin/package.json'));
const Ajv = require('ajv');
const version = require('ajv/package.json').version;
assert.equal(version, '8.17.1');
const { getHeavyValidationFixture } = await load('packages/aileron/benchmark-form/fixtures/input-responsiveness/getHeavyValidationFixture.ts');
const { transformErrors } = await load('packages/canard/schema-form-ajv8-plugin/src/validator/utils/transformErrors.ts');
const { sampleProcessCpu } = await load('packages/canard/schema-form/architecture/verification/branch-switch/tools/window/helpers/sampleProcessCpu.mjs');
const { readAncestorPids } = await load('packages/aileron/benchmark-form/browser-bench/interaction/helpers/readAncestorPids.ts');
const options = { allErrors: true, strictSchema: false, validateFormats: false, allowUnionTypes: true };
const warmup = 1000, rounds = 21, calls = 250;
const fixtures = ['flat-2000', 'nested-d5-f4', 'array-1000'];
function defaults(schema) {
  if (schema.default !== undefined) return structuredClone(schema.default);
  if (schema.type === 'object') return Object.fromEntries(Object.entries(schema.properties).map(([key, child]) => [key, defaults(child)]));
  return schema.type === 'string' ? 'ab' : undefined;
}
function quantile(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * fraction) - 1];
}
const compiled = fixtures.map((name) => {
  const fixture = getHeavyValidationFixture(`type-${name}-validate-nonburst`);
  const schema = fixture.schema;
  const valid = defaults(schema);
  if (name === 'array-1000') for (const item of valid.items) if (item.name.length % 2) item.name += 'x';
  let host = valid;
  const segments = fixture.target.slice(1).split('/');
  for (const segment of segments.slice(0, -1)) host = host[segment];
  host[segments.at(-1)] = 'ab';
  const invalid = structuredClone(valid);
  host = invalid;
  for (const segment of segments.slice(0, -1)) host = host[segment];
  host[segments.at(-1)] = 'a';
  const sync = new Ajv(options).compile(structuredClone(schema));
  const asyncValidate = new Ajv(options).compile({ ...structuredClone(schema), $async: true });
  assert.equal(sync(valid), true);
  assert.equal(sync(invalid), false);
  assert.equal(sync.errors.length, 1);
  const variants = [];
  for (const [verdict, value] of [['valid', valid], ['invalid', invalid]]) {
    for (const conversion of [false, true]) {
      variants.push({ mode: 'sync', verdict, conversion, samples: [], batches: [], run: () => {
        const ok = sync(value);
        return ok ? null : conversion ? transformErrors(sync.errors, schema) : sync.errors;
      }});
      variants.push({ mode: 'async', verdict, conversion, samples: [], batches: [], run: async () => {
        try { await asyncValidate(value); return null; }
        catch (error) {
          if (error instanceof Error && Array.isArray(error.errors)) return conversion ? transformErrors(error.errors, schema) : error.errors;
          throw error;
        }
      }});
    }
  }
  return { name, variants };
});
const excluded = readAncestorPids();
const observation = await sampleProcessCpu(30000);
const cpu = { startedAt: observation.startedAt, endedAt: observation.quietSince, durationSeconds: observation.durationSeconds,
  top: observation.rows.slice(0, 10).map((row) => ({...row, name: path.basename(row.name)})),
  heavy: observation.rows.filter((row) => !excluded.includes(row.pid) && row.cpuPercent > 30).map((row) => ({...row, name: path.basename(row.name)})), excluded };
const outputFile = process.argv[2];
if (cpu.heavy.length) {
  writeFileSync(outputFile, JSON.stringify({ kind: 'refused', samples: 0, cpu }, null, 2));
  console.log(JSON.stringify({ kind: 'refused', heavy: cpu.heavy }));
  process.exit(3);
}
const startedAt = new Date().toISOString();
for (const fixture of compiled) {
  for (const variant of fixture.variants) {
    if (variant.mode === 'async') for (let i = 0; i < warmup; i++) await variant.run();
    else for (let i = 0; i < warmup; i++) variant.run();
  }
  for (let round = 0; round < rounds; round++) {
    const order = round % 2 ? [...fixture.variants].reverse() : fixture.variants;
    for (const variant of order) {
      const samples = [];
      if (variant.mode === 'async') for (let i = 0; i < calls; i++) {
        const start = performance.now(); await variant.run(); samples.push((performance.now() - start) * 1000);
      }
      else for (let i = 0; i < calls; i++) {
        const start = performance.now(); variant.run(); samples.push((performance.now() - start) * 1000);
      }
      variant.samples.push(...samples);
      variant.batches.push({ medianUs: quantile(samples, 0.5), p95Us: quantile(samples, 0.95) });
    }
  }
}
const rows = compiled.flatMap(({ name, variants }) => variants.map(({ mode, verdict, conversion, samples, batches }) => ({
  fixture: name, mode, verdict, conversion, medianUs: quantile(samples, 0.5), p95Us: quantile(samples, 0.95), samples, batches,
})));
const select = (mode, verdict) => rows.find((r) => r.fixture === 'flat-2000' && r.conversion && r.mode === mode && r.verdict === verdict).medianUs;
const invalidRatio = select('sync', 'invalid') / select('async', 'invalid');
const validRatio = select('sync', 'valid') / select('async', 'valid');
const result = { kind: 'measured', startedAt, endedAt: new Date().toISOString(), node: process.version, arch: process.arch, ajv: version, options, warmup, rounds, calls, samplesPerCell: rounds * calls, cpu, invalidRatio, validRatio, adopted: invalidRatio <= 0.7 && validRatio <= 1.05, rows };
writeFileSync(outputFile, JSON.stringify(result));
console.log(JSON.stringify({ ...result, rows: rows.map(({samples, batches, ...row}) => row) }, null, 2));
