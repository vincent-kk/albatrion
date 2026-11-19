import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

/**
 * Diagnostic: which placements of a `$ref` to a schema held only by the bound validator instance
 * (validation.mdx:60) does the form blueprint accept? Records the outcome per placement.
 */
const EXT = 'https://example.com/address.json';
const placements: [string, any, any][] = [
  ['terminal object with $ref', { type: 'object', properties: { billing: { type: 'object', terminal: true, $ref: EXT } } }, { billing: {} }],
  ['terminal object with allOf $ref', { type: 'object', properties: { billing: { type: 'object', terminal: true, allOf: [{ $ref: EXT }] } } }, { billing: {} }],
  ['additionalProperties map', { type: 'object', properties: { addresses: { type: 'object', additionalProperties: { $ref: EXT } } } }, { addresses: {} }],
  ['terminal array items', { type: 'object', properties: { list: { type: 'array', terminal: true, items: { $ref: EXT } } } }, { list: [] }],
  ['not', { type: 'object', properties: { billing: { type: 'object', not: { $ref: EXT } } } }, { billing: {} }],
];

describe('external $ref placement accepted by the blueprint (diagnostic)', () => {
  it('records which placements build', () => {
    const outcome = placements.map(([label, jsonSchema, defaultValue]) => {
      try {
        const root = nodeFromJSONSchema({ jsonSchema, defaultValue, validationMode: ValidationMode.None });
        return [label, 'built', root.find(Object.keys(defaultValue).map((k) => '/' + k)[0])?.type ?? 'missing', root.find(Object.keys(defaultValue).map((k) => '/' + k)[0])?.strategy];
      } catch (error) {
        return [label, (error as Error).message.slice(0, 60)];
      }
    });
    // Observed: only placements the blueprint does not expand into nodes accept an external $ref.
    expect(outcome.map((row) => [row[0], row[1] === 'built'])).toEqual([
      ['terminal object with $ref', false],
      ['terminal object with allOf $ref', false],
      ['additionalProperties map', true],
      ['terminal array items', false],
      ['not', true],
    ]);
  });
});
