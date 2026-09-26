// Runs every enumerated ajv error through the plugin-style normalization and then rejectedKey().
// Prints, per (runtime, form): which errors yield a key and which yield null.
// Run: node check.mjs
import { enumerate } from './enumerate.mjs';
import { rejectedKey } from './rejectedKey.mjs';

/** Mirrors the ajv6 plugin: JS path ('.a.b', "['x']") → JSON pointer, root → '/'. */
const jsPathToPointer = (p) => {
  if (!p) return '/';
  const segs = [];
  for (const m of p.matchAll(/\.([^.[\]]+)|\['([^']*)'\]|\[(\d+)\]/g)) segs.push(m[1] ?? m[2] ?? m[3]);
  return '/' + segs.join('/');
};

/** Mirrors transformErrors of the ajv7/ajv8 plugins (required → append missingProperty; root → '/'). */
const normalize = (row) => {
  let dataPath = row.runtime.startsWith('ajv6') ? jsPathToPointer(row.instancePath) : row.instancePath || '/';
  if (row.keyword === 'required' && row.params?.missingProperty)
    dataPath = (dataPath === '/' ? '' : dataPath) + '/' + row.params.missingProperty;
  return { dataPath, schemaPath: row.schemaPath, keyword: row.keyword, message: row.message, details: row.params };
};

const extra = [
  // `not` whose subschema is not exactly one required name → must stay null
  ['not-required-plus-keyword', { type: 'object', not: { required: ['x'], minProperties: 1 } }, { x: 1 }],
  // `not` reached through a local $ref: schemaPath points into definitions, still resolvable
  ['not-required-1@ref', { type: 'object', definitions: { noX: { not: { required: ['x'] } } }, allOf: [{ $ref: '#/definitions/noX' }] }, { x: 1 }],
  // key needing RFC 6901 escaping
  ['additionalProperties-false@slash-key', { type: 'object', additionalProperties: false }, { 'a/b': 1 }],
];

const rows = enumerate(extra);
const byForm = new Map();
for (const row of rows) {
  const id = `${row.runtime}\t${row.form}`;
  if (!byForm.has(id)) byForm.set(id, []);
  if (row.compileError) { byForm.get(id).push(`COMPILE-ERROR`); continue; }
  if (row.note) { byForm.get(id).push(row.note); continue; }
  const err = normalize(row);
  const key = rejectedKey(err, row.schema, row.data);
  byForm.get(id).push(`${err.keyword}@${err.dataPath}→${key === null ? 'null' : key}`);
}
for (const [id, outcomes] of byForm) console.log(`${id}\t${outcomes.join(' | ')}`);
