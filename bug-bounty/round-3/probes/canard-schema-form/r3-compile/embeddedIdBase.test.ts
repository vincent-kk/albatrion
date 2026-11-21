import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

const attempt = (fn: () => unknown) => {
  try {
    return fn();
  } catch (error) {
    return { error: String((error as any)?.code ?? error) };
  }
};

/** A compound document: `$defs/A` is an embedded resource whose local `#/$defs/X` means its own `$defs`. */
const compound = (withRootX: boolean) => ({
  $id: 'https://example.test/root.json',
  type: 'object',
  properties: { a: { $ref: '#/$defs/A' } },
  $defs: {
    A: {
      $id: 'https://example.test/a.json',
      type: 'object',
      properties: { x: { $ref: '#/$defs/X' } },
      $defs: { X: { type: 'string', default: 'inner' } },
    },
    ...(withRootX ? { X: { type: 'number', default: 1 } } : {}),
  },
});

describe('$ref inside an embedded $id resource', () => {
  it('AJV resolves #/$defs/X against the embedded resource (reference behavior)', () => {
    const ajv = new Ajv({ strict: false });
    const validate = ajv.compile(compound(true));
    expect([validate({ a: { x: 'text' } }), validate({ a: { x: 1 } })]).toEqual([true, false]);
  });

  it('the form builds the field the validator checks (root also has X)', () => {
    const result = attempt(() => {
      const root = tree(compound(true), {});
      return { type: root.find('/a/x')?.type, value: root.value };
    });
    expect(result).toEqual({ type: 'string', value: { a: { x: 'inner' } } });
  });

  it('the form loads a compound document whose root has no X', () => {
    const result = attempt(() => {
      const root = tree(compound(false), {});
      return { type: root.find('/a/x')?.type, value: root.value };
    });
    expect(result).toEqual({ type: 'string', value: { a: { x: 'inner' } } });
  });
});
