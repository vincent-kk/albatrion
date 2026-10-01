import type { FormScenario } from '../types';

/** VALIDATE-036: form output keeps the authored oneOf verdict. */
export const ifOnlyScenario = {
  name: 'validation.if-only-oneof-invalid',
  schema: { type: 'object', properties: { kind: { type: 'string' } }, oneOf: [
    { if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
      then: { properties: { a: { type: 'string' } }, required: ['a'] } },
    { if: { properties: { kind: { const: 'b' } }, required: ['kind'] },
      then: { properties: { b: { type: 'string' } }, required: ['b'] } },
  ] },
  steps: [
    { action: 'setValue', path: '', value: { kind: 'a', a: 'A' },
      expect: { outputValue: { kind: 'a', a: 'A' },
        errors: { '': [{ keyword: 'oneOf' }] } } },
  ],
} satisfies FormScenario;
