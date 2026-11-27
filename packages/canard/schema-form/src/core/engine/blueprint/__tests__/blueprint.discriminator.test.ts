import { describe, expect, it, vi } from 'vitest';

import { FormErrorCode, FormWarningCode } from '../../../../errors';
import { blueprint } from '../blueprint';

// filid:contract discriminator
describe('blueprint explicit discriminators', () => {
  const tagged = {
    type: 'object',
    controls: { discriminator: 'kind' },
    oneOf: [
      {
        properties: {
          kind: { type: 'string', const: 'cat' },
          meow: { type: 'string' },
        },
      },
      {
        properties: {
          kind: { type: 'string', enum: ['dog', 'wolf'] },
          bark: { type: 'boolean' },
        },
      },
    ],
  };
  it('lifts tag existence while gating each branch without rewriting the author schema', () => {
    const before = JSON.stringify(tagged);
    const root = blueprint(tagged).root;
    const kind = root.childEntries.find((edge) => edge.name === 'kind')!.node;
    expect(
      kind.declarations.filter((declaration) => !declaration.gates.length),
    ).toHaveLength(2);
    expect(
      root.childEntries.find((edge) => edge.name === 'meow')!.node
        .declarations[0].gates[0],
    ).toMatchObject({
      kind: 'discriminator',
      condition: { propertyName: 'kind', values: ['cat'] },
    });
    expect(JSON.stringify(tagged)).toBe(before);
  });
  it('does not infer discriminator gates from const values without explicit controls', () => {
    const root = blueprint({ ...tagged, controls: undefined }).root;
    expect(
      root.childEntries.every((edge) =>
        edge.node.declarations.every(
          (declaration) => !declaration.gates.length,
        ),
      ),
    ).toBe(true);
  });
  it('reads tags through branch and property references and static allOf', () => {
    const root = blueprint({
      type: 'object',
      controls: { discriminator: 'kind' },
      $defs: {
        tag: { type: 'string', enum: ['cat', 'lion'] },
        cat: {
          allOf: [
            {
              properties: {
                kind: { $ref: '#/$defs/tag', allOf: [{ enum: ['cat'] }] },
                value: { type: 'number' },
              },
            },
          ],
        },
      },
      oneOf: [
        { $ref: '#/$defs/cat' },
        { properties: { kind: { type: 'string', const: 'dog' } } },
      ],
    }).root;
    expect(
      root.childEntries.find((edge) => edge.name === 'value')!.node
        .declarations[0].gates[0].condition,
    ).toEqual({ propertyName: 'kind', values: ['cat'] });
  });
  it('combines explicit tag and branch active gates as a conjunction', () => {
    const root = blueprint({
      ...tagged,
      oneOf: [
        { ...tagged.oneOf[0], controls: { active: './enabled' } },
        tagged.oneOf[1],
      ],
    }).root;
    const gates = root.childEntries.find((edge) => edge.name === 'meow')!.node
      .declarations[0].gates;
    expect(gates.map((gate) => gate.kind)).toEqual(['discriminator', 'active']);
  });
  it('leaves a missing-tag branch ungated and excludes null branches', () => {
    const root = blueprint({
      ...tagged,
      oneOf: [
        ...tagged.oneOf,
        { properties: { free: { type: 'string' } } },
        { type: 'null', properties: { ignored: { type: 'string' } } },
      ],
    }).root;
    expect(
      root.childEntries.find((edge) => edge.name === 'free')!.node
        .declarations[0].gates,
    ).toHaveLength(0);
    expect(root.childEntries.some((edge) => edge.name === 'ignored')).toBe(
      false,
    );
  });
  it('rejects overlapping tags', () => {
    expect(() =>
      blueprint({ ...tagged, oneOf: [tagged.oneOf[0], tagged.oneOf[0]] }),
    ).toThrow(
      expect.objectContaining({
        code: FormErrorCode.DiscriminatorMismatch,
      }),
    );
  });

  it('does not infer a branch type from nested compositions during static tag reading', () => {
    const result = blueprint({
      type: 'object',
      controls: { discriminator: 'kind' },
      oneOf: [
        {
          properties: { kind: { type: 'string', const: 'a' } },
          oneOf: [{ properties: { child: { type: 'number' } } }],
        },
      ],
    });
    expect(result.root.childEntries.map((edge) => edge.name)).toEqual([
      'kind',
      'child',
    ]);
  });
  it('rejects a discriminator without any statically readable tag', () => {
    expect(() =>
      blueprint({
        type: 'object',
        controls: { discriminator: 'kind' },
        oneOf: [{ properties: { kind: { type: 'string' } } }],
      }),
    ).toThrow(
      expect.objectContaining({
        code: FormErrorCode.DiscriminatorMismatch,
      }),
    );
  });
  it('accepts declarations of one node that name different discriminator keys', () => {
    const collect = vi.fn();
    const result = blueprint(
      {
        type: 'object',
        properties: {
          a: {
            type: 'object',
            controls: { discriminator: 'k' },
            oneOf: [{ properties: { k: { type: 'string', const: 'x' } } }],
          },
        },
        oneOf: [
          {
            properties: {
              a: {
                type: 'object',
                controls: { discriminator: 'j' },
                oneOf: [{ properties: { j: { type: 'string', const: 'y' } } }],
              },
            },
          },
        ],
      },
      { collect },
    );
    expect(
      result.root.childEntries[0].node.childEntries.map(({ name }) => name),
    ).toEqual(['k', 'j']);
    expect(collect).not.toHaveBeenCalled();
  });
  it('rejects different tag kinds without a host tag type', () => {
    expect(() =>
      blueprint({
        ...tagged,
        oneOf: [
          tagged.oneOf[0],
          { properties: { kind: { type: 'number', const: 3 } } },
        ],
      }),
    ).toThrow(
      expect.objectContaining({
        code: FormErrorCode.DiscriminatorMismatch,
      }),
    );
  });
  it('warns for an empty static tag intersection and keeps its branch gated', () => {
    const collect = vi.fn();
    const root = blueprint(
      {
        ...tagged,
        oneOf: [
          {
            properties: {
              kind: { type: 'string', enum: ['a'], allOf: [{ enum: ['b'] }] },
              value: { type: 'string' },
            },
          },
        ],
      },
      { collect },
    ).root;
    expect(root.childEntries.map(({ name }) => name)).toEqual(['value']);
    expect(root.childEntries[0].node.declarations[0].gates[0]).toMatchObject({
      kind: 'discriminator',
      condition: { propertyName: 'kind', values: [] },
    });
    expect(collect).toHaveBeenCalledWith({
      code: FormWarningCode.DiscriminatorBranchUnreachable,
      level: 'warning',
      schemaPath: '#/oneOf/0',
      details: { propertyName: 'kind', reason: 'empty' },
    });
  });
});
