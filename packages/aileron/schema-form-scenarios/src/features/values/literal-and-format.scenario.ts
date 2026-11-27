import type { FormScenario } from '../../types';

/** Enum, numeric enum, typeless const, and format-annotated strings. */
export const optionsSchema = {
  type: 'object',
  properties: {
    size: { type: 'string', enum: ['S', 'M', 'L'], default: 'M' },
    level: { type: 'number', enum: [1, 2, 3] },
    version: { const: 'v1' },
    released: { type: 'string', format: 'date' },
    contact: { type: 'string', format: 'email' },
  },
};

/** Literal-restricted values keep their kind; the validator rejects values outside the literal set. */
export const literalAndFormatScenario: FormScenario = {
  name: 'values.literal-and-format',
  description: 'LANDING-208 and BLUEPRINT-050 a typeless const is a primitive leaf of the literal kind; CONTROLS-025 and SCHEMA-002 the schema default fills on load; enum and const violations land on the node (VALIDATE-043 (4)); a numeric enum renders the number input, which shows an out-of-set value as given; the ajv8 plugin and the harness validator do not validate format by default, so a malformed email passes.',
  schema: optionsSchema,
  initialValue: { version: 'v1' },
  steps: [
    { action: 'batch', steps: [], expect: {
      shape: { '/size': 'present', '/level': 'present', '/version': 'present', '/released': 'present', '/contact': 'present' },
      values: { '/size': 'M' }, schemaTypes: { '/version': 'string' }, outputValue: { size: 'M', version: 'v1' }, errors: { '': [], '/version': [] },
    } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/size', value: 'L' }], expect: { values: { '/size': 'L' }, errors: { '/size': [] } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/level', value: 3 }], expect: {
      values: { '/level': 3 }, outputValue: { size: 'L', level: 3, version: 'v1' }, errors: { '/level': [] },
    } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/level', value: 7 }], expect: {
      values: { '/level': 7 }, errors: { '/level': [{ keyword: 'enum' }] },
    } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/version', value: 'v2' }], expect: {
      values: { '/version': 'v2' }, errors: { '/version': [{ keyword: 'const' }] },
    } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/released', value: '2026-10-13' }], expect: { values: { '/released': '2026-10-13' } } },
    { action: 'setValue', path: '/contact', value: 'not-an-email', expect: {
      outputValue: { size: 'L', level: 7, version: 'v2', released: '2026-10-13', contact: 'not-an-email' }, errors: { '/contact': [] },
    } },
  ],
};
