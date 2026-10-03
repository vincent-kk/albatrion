import { createRequire } from 'node:module';

const require = createRequire(new URL('../../../schema-form-ajv8-plugin/package.json', import.meta.url));
const version = require('ajv/package.json').version;
if (version !== '8.17.1') throw new Error(`Expected ajv 8.17.1, got ${version}`);
const Ajv = require('ajv');
const ajv = new Ajv({ strict: false, allErrors: true, useDefaults: false });
console.log(JSON.stringify({ version, options: { strict: false, allErrors: true, useDefaults: false } }));
const schemas = {
  falseProperty: { type: 'object', properties: { x: false } },
  notRequired: { type: 'object', properties: { x: { type: 'string' } }, not: { required: ['x'] } },
  requiredAndFalse: { type: 'object', properties: { x: false }, required: ['x'] },
  conditionalFalse: { type: 'object', properties: { mode: { type: 'string' }, x: { type: 'string' } }, if: { properties: { mode: { const: 'ban' } }, required: ['mode'] }, then: { properties: { x: false } } },
  selfNegating: { type: 'object', if: { not: { required: ['x'] } }, then: { properties: { x: { type: 'number', default: 1 } } } },
};
for (const [name, schema] of Object.entries(schemas)) {
  const validate = ajv.compile(schema);
  const inputs = name === 'conditionalFalse' ? [{ mode: 'ban', x: 'secret' }, { mode: 'ban' }] : name === 'selfNegating' ? [{}, { x: 1 }] : [{ x: 'secret' }, {}, { x: null }];
  for (const input of inputs) {
    const value = structuredClone(input);
    console.log(JSON.stringify({ name, input, valid: validate(value), output: value, errors: validate.errors }));
  }
}
