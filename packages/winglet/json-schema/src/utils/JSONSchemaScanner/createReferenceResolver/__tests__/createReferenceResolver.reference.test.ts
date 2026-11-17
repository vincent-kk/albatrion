import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { JSONSchemaScanner } from '../../sync';
import { createReferenceResolver } from '../createReferenceResolver';

describe('reference resolution and address preservation', () => {
  it('distinguishes a property named id from an identifier keyword', () => {
    const target = { type: 'object', properties: { id: { type: 'string' } } };
    const schema = {
      $defs: { A: target },
      properties: { use: { $ref: '#/$defs/A' } },
    };
    const output = new JSONSchemaScanner({
      options: { resolveReference: createReferenceResolver(schema) },
    })
      .scan(schema)
      .getValue<typeof schema & { properties: { use: typeof target } }>()!;
    expect(output.properties.use).toEqual(target);
  });
  it('follows chains through the public resolver and accepts a false target', () => {
    const schema = {
      properties: { a: { $ref: '#/$defs/A' } },
      $defs: { A: { $ref: '#/$defs/B' }, B: false },
    };
    const scanner = new JSONSchemaScanner({
      options: { resolveReference: createReferenceResolver(schema) },
    });
    expect(scanner.scan(schema).getValue()).toEqual({
      properties: { a: false },
      $defs: schema.$defs,
    });
  });

  it.each([false, true])(
    'preserves a boolean sibling address %s in old dialects',
    (hidden) => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $ref: '#/definitions/A',
        hidden,
        definitions: {
          A: { type: 'object', properties: { next: { $ref: '#/hidden' } } },
        },
      };
      const outcomes: unknown[] = [];
      const scanner = new JSONSchemaScanner({
        options: {
          maxDepth: 0,
          resolveReference: createReferenceResolver(schema),
        },
        visitor: {
          exit: (e) => {
            outcomes.push(e.references);
          },
        },
      });
      const output = scanner.scan(schema).getValue()!;
      expect(output).toEqual(schema);
      expect(outcomes).toContainEqual([
        expect.objectContaining({ skipped: 'relocation' }),
      ]);
      const before = new Ajv({ strict: false }).compile(schema);
      const after = new Ajv({ strict: false }).compile(output);
      expect([after({}), after({ next: 1 })]).toEqual([
        before({}),
        before({ next: 1 }),
      ]);
    },
  );

  it('indexes an anchor in an old retained reference definition container', () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#Node',
      definitions: { A: { $id: '#Node', type: 'string' } },
    };
    const output = new JSONSchemaScanner({
      options: { resolveReference: createReferenceResolver(schema) },
    })
      .scan(schema)
      .getValue()!;
    const before = new Ajv({ strict: false }).compile(schema),
      after = new Ajv({ strict: false }).compile(output);
    expect([after('s'), after(1)]).toEqual([before('s'), before(1)]);
  });
});
