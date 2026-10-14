/** Run with yarn node from repository root; stdout is reproducible JSONL evidence. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { legacyExperiments } from './legacy-experiments.mjs';
import { attackExperiments } from './attack-experiments.mjs';
import { eventExperiments } from './event-experiments.mjs';

const workspaceRequire = createRequire(new URL('../../../../../schema-form-ajv8-plugin/package.json', import.meta.url));
const Ajv2020 = workspaceRequire('ajv/dist/2020').default;
const version = workspaceRequire('ajv/package.json').version;
assert(version.startsWith('8.'));
const ajv = new Ajv2020({ strict: false, allErrors: true });
const records = [];
const record = (id, data) => records.push({ id, ...data });
const verdict = (schema, value) => { const validate = ajv.compile(schema); return { valid: validate(value), errors: structuredClone(validate.errors) }; };
legacyExperiments(ajv, record, verdict);
assert.equal(records.length, 18);
attackExperiments(ajv, record, verdict);
eventExperiments(record);
assert(records.every((entry, index) => records.findIndex((other) => other.id === entry.id) === index));
for (const r of records) console.log(JSON.stringify(r));
console.log(JSON.stringify({ status: 'PASS', meaning: 'observation assertions reproduced, not specification approval', legacy: 18, experiments: records.length, ajv: version }));
