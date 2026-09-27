import { describe, expect, it } from 'vitest';

import { blueprint } from '../index';
import { BlueprintErrorCode } from '../utils/diagnostics/constant';

// filid:contract type-inference-round19
describe('round 19 untyped host inference', () => {
  it('folds object branches after retaining null in the allowed union', () => {
    expect(
      blueprint({
        anyOf: [{ type: 'object' }, { type: 'null' }],
      }).root,
    ).toMatchObject({
      kind: 'object',
      schemaType: 'object',
      nullable: true,
      strategy: 'branch',
    });
  });

  it('recurses through an untyped branch union', () => {
    expect(
      blueprint({
        anyOf: [{ anyOf: [{ type: 'object' }, { type: 'object' }] }],
      }).root,
    ).toMatchObject({ kind: 'object', schemaType: 'object' });
  });

  it('treats an array variant host like an explicitly typed array', () => {
    const result = blueprint({
      oneOf: [
        { type: 'array', items: { type: 'string' } },
        { type: 'array', items: { type: 'string' } },
      ],
    });
    expect(result.root).toMatchObject({
      kind: 'array',
      schemaType: 'array',
      strategy: 'branch',
    });
    expect(result.root.item?.kind).toBe('string');
  });

  it('does not use an active-gated branch to infer the host', () => {
    expect(() =>
      blueprint({
        oneOf: [{ type: 'object', controls: { active: './enabled' } }],
      }),
    ).toThrow(
      expect.objectContaining({ specific: BlueprintErrorCode.UnknownJsonSchema }),
    );
  });

  it('does not use a branch converted into a discriminator gate', () => {
    expect(() =>
      blueprint({
        controls: { discriminator: 'kind' },
        oneOf: [
          {
            type: 'object',
            properties: { kind: { type: 'string', const: 'cat' } },
          },
          {
            type: 'object',
            properties: { kind: { type: 'string', const: 'dog' } },
          },
        ],
      }),
    ).toThrow(
      expect.objectContaining({ specific: BlueprintErrorCode.UnknownJsonSchema }),
    );
  });

  it('rejects an object and array union even without a primitive branch', () => {
    expect(() =>
      blueprint({ anyOf: [{ type: 'object' }, { type: 'array' }] }),
    ).toThrow(
      expect.objectContaining({ specific: BlueprintErrorCode.UnknownJsonSchema }),
    );
  });

  it('keeps an unconstrained branch as an error at its authored path', () => {
    expect(() =>
      blueprint({ anyOf: [{ const: 'cat' }, { type: 'object' }] }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.UnknownJsonSchema,
        details: expect.objectContaining({
          schemaPath: '#/anyOf/0',
          guidance: expect.stringContaining('type'),
        }),
      }),
    );
  });

  it('cuts a recursive reference contribution while retaining a later branch', () => {
    expect(
      blueprint({ anyOf: [{ $ref: '#' }, { type: 'object' }] }).root,
    ).toMatchObject({ kind: 'object', schemaType: 'object' });
  });

  it('cuts a branch whose typed reference target re-enters itself', () => {
    expect(
      blueprint({
        $defs: { loop: { type: 'array', $ref: '#/$defs/loop' } },
        anyOf: [{ $ref: '#/$defs/loop' }, { type: 'object' }],
      }).root,
    ).toMatchObject({ kind: 'object', schemaType: 'object' });
  });

  it('reports an empty union after cutting its only recursive branch', () => {
    expect(() => blueprint({ anyOf: [{ $ref: '#' }] })).toThrow(
      expect.objectContaining({ specific: BlueprintErrorCode.UnknownJsonSchema }),
    );
  });

  it.each([
    [{ const: 'cat' }, 'string', 'string', false],
    [{ enum: [1, 2, null] }, 'number', 'number', true],
    [{ const: null }, 'null', 'null', true],
  ] as const)(
    'infers a single primitive or null kind from a branchless literal',
    (schema, kind, schemaType, nullable) => {
      expect(blueprint(schema).root).toMatchObject({
        kind,
        schemaType,
        nullable,
        strategy: 'terminal',
      });
    },
  );

  it.each([
    [{ enum: ['cat', 1] }],
    [{ const: { name: 'cat' } }],
  ] as const)(
    'rejects mixed or object literals without an explicit type',
    (schema) => {
      expect(() => blueprint(schema)).toThrow(
        expect.objectContaining({ specific: BlueprintErrorCode.UnknownJsonSchema }),
      );
    },
  );
});
