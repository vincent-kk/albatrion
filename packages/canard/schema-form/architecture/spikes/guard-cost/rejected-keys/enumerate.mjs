// Enumerates ajv error shapes for every "rejection" schema form, across ajv 6 / 7 / 8 (draft-07, 2019-09, 2020-12).
// Run: node enumerate.mjs  → writes results.jsonl beside this file and prints a compact table.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = '/Users/Vincent/Workspace/albatrion';
const req8 = createRequire(`${ROOT}/packages/canard/schema-form-ajv8-plugin/src/x.js`);
const req7 = createRequire(`${ROOT}/packages/canard/schema-form-ajv7-plugin/src/x.js`);
const req6 = createRequire(`${ROOT}/x.js`);

const OPTS = { allErrors: true, strictSchema: false }; // matches the ajv8 plugin defaults

const runtimes = [
  { id: 'ajv8-draft07', ctor: req8('ajv'), version: req8('ajv/package.json').version, opts: OPTS },
  { id: 'ajv8-2019', ctor: req8('ajv/dist/2019'), version: req8('ajv/package.json').version, opts: OPTS },
  { id: 'ajv8-2020', ctor: req8('ajv/dist/2020'), version: req8('ajv/package.json').version, opts: OPTS },
  { id: 'ajv7-draft07', ctor: req7('ajv'), version: req7('ajv/package.json').version, opts: OPTS },
  { id: 'ajv7-2019', ctor: req7('ajv/dist/2019'), version: req7('ajv/package.json').version, opts: OPTS },
  { id: 'ajv6-draft07', ctor: req6('ajv'), version: req6('ajv/package.json').version, opts: { allErrors: true } },
].map((r) => ({ ...r, ctor: r.ctor.default ?? r.ctor }));

// Each case: rejection form, schema, data. `@host` variants nest the form under /host to show the instancePath prefix.
export const cases = [
  ['properties-false', { type: 'object', properties: { x: false } }, { x: 1 }],
  ['properties-false@host', { type: 'object', properties: { host: { type: 'object', properties: { x: false } } } }, { host: { x: 1 } }],
  ['additionalProperties-false', { type: 'object', properties: { a: {} }, additionalProperties: false }, { a: 1, x: 1 }],
  ['additionalProperties-false@host', { type: 'object', properties: { host: { type: 'object', properties: { a: {} }, additionalProperties: false } } }, { host: { a: 1, x: 1 } }],
  ['additionalProperties-false@2keys', { type: 'object', properties: { a: {} }, additionalProperties: false }, { a: 1, x: 1, y: 1 }],
  ['unevaluatedProperties-false', { type: 'object', properties: { a: {} }, unevaluatedProperties: false }, { a: 1, x: 1 }],
  ['not-required-1', { type: 'object', not: { required: ['x'] } }, { x: 1 }],
  ['not-required-1@host', { type: 'object', properties: { host: { type: 'object', not: { required: ['x'] } } } }, { host: { x: 1 } }],
  ['not-required-2', { type: 'object', not: { required: ['x', 'y'] } }, { x: 1, y: 1 }],
  ['propertyNames-pattern', { type: 'object', propertyNames: { pattern: '^[a-w]+$' } }, { a: 1, x: 1 }],
  ['propertyNames-false', { type: 'object', propertyNames: false }, { x: 1 }],
  ['patternProperties-false', { type: 'object', patternProperties: { '^x': false } }, { x: 1 }],
  ['dependentRequired', { type: 'object', dependentRequired: { x: ['y'] } }, { x: 1 }],
  ['dependencies-array', { type: 'object', dependencies: { x: ['y'] } }, { x: 1 }],
  ['if-then-properties-false', { type: 'object', if: { required: ['flag'] }, then: { properties: { x: false } } }, { flag: 1, x: 1 }],
  ['if-then-additionalProperties-false', { type: 'object', properties: { flag: {} }, if: { required: ['flag'] }, then: { additionalProperties: false } }, { flag: 1, x: 1 }],
  ['oneOf-additionalProperties-false', { type: 'object', oneOf: [{ properties: { a: {} }, additionalProperties: false }, { required: ['zzz'] }] }, { a: 1, x: 1 }],
  ['anyOf-properties-false', { type: 'object', anyOf: [{ properties: { x: false } }, { required: ['zzz'] }] }, { x: 1 }],
];

/** Runs every case (plus `extraCases`) on every runtime; returns flat rows (one per ajv error, or one note row). */
export function enumerate(extraCases = []) {
  const rows = [];
  for (const rt of runtimes) {
    for (const [form, schema, data] of [...cases, ...extraCases]) {
      let errors;
      try {
        const ajv = new rt.ctor(rt.opts);
        const validate = ajv.compile(schema);
        const ok = validate(data);
        errors = ok ? [] : validate.errors;
      } catch (e) {
        rows.push({ runtime: rt.id, version: rt.version, form, schema, data, compileError: String(e.message).split('\n')[0] });
        continue;
      }
      for (const e of errors) {
        rows.push({
          runtime: rt.id, version: rt.version, form, schema, data,
          instancePath: e.instancePath ?? e.dataPath, // ajv6/7 name it dataPath
          schemaPath: e.schemaPath, keyword: e.keyword, params: e.params, message: e.message,
          raw: e,
        });
      }
      if (errors.length === 0) rows.push({ runtime: rt.id, version: rt.version, form, schema, data, note: 'VALID (no errors)' });
    }
  }
  return rows;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = enumerate();
  writeFileSync(
    join(HERE, 'results.jsonl'),
    rows.map(({ schema, data, raw, ...r }) => JSON.stringify(r)).join('\n') + '\n',
  );
  for (const r of rows) {
    if (r.compileError) { console.log(`${r.runtime}\t${r.form}\tCOMPILE-ERROR\t${r.compileError}`); continue; }
    if (r.note) { console.log(`${r.runtime}\t${r.form}\t${r.note}`); continue; }
    console.log(`${r.runtime}\t${r.form}\tip=${JSON.stringify(r.instancePath)}\tsp=${r.schemaPath}\tkw=${r.keyword}\tparams=${JSON.stringify(r.params)}\tmsg=${r.message}`);
  }
}
