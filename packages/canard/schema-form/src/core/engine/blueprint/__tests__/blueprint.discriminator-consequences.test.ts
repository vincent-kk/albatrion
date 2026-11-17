import { describe, expect, it, vi } from 'vitest';

import { FormErrorCode, FormWarningCode } from '../../../../errors';
import { blueprint } from '../blueprint';

describe('discriminator consequences', () => {
  it('C2 ignores a discriminator without a union and retains branchless capabilities', () => {
    const collect = vi.fn();
    const schema = { type: 'object', properties: { kind: { type: 'string' } } };
    const plain = blueprint(schema);
    const ignored = blueprint(
      { ...schema, controls: { discriminator: 'kind' } },
      { collect },
    );
    expect(ignored.capabilities).toEqual(plain.capabilities);
    expect(ignored.root.childEntries.map(({ name }) => name)).toEqual(['kind']);
    expect(collect.mock.calls.map(([record]) => record)).toEqual([
      {
        code: FormWarningCode.DiscriminatorIgnoredForForm,
        level: 'warning',
        schemaPath: '#/controls/discriminator',
        details: { propertyName: 'kind', reason: 'union' },
      },
    ]);
  });

  it.each([
    { type: 'string' },
    { type: 'number' },
    { type: 'array' },
    { type: ['object', 'string'] },
  ])('C3 ignores tags on the known non-object host $type', ({ type }) => {
    const collect = vi.fn();
    blueprint(
      {
        type,
        controls: { discriminator: 'kind' },
        anyOf: [{ const: 'a' }, { const: 'a' }],
      },
      { collect },
    );
    expect(collect.mock.calls.map(([record]) => record)).toContainEqual({
      code: FormWarningCode.DiscriminatorIgnoredForForm,
      level: 'warning',
      schemaPath: '#/controls/discriminator',
      details: { propertyName: 'kind', reason: 'host' },
    });
  });

  it.each([{ const: 4 }, { type: 'number', const: 4 }])(
    'C10 does not lift an unreachable tag %j',
    (tag) => {
      const collect = vi.fn();
      const result = blueprint(
        {
          type: 'object',
          controls: { discriminator: 'kind' },
          properties: { kind: { type: 'string' } },
          oneOf: [
            { properties: { kind: { const: 'a' }, value: { type: 'string' } } },
            { properties: { kind: tag, unreachable: { type: 'string' } } },
          ],
        },
        { collect },
      );
      const kind = result.root.childEntries.find(
        ({ name }) => name === 'kind',
      )?.node;
      expect(kind?.declarations.map(({ schema }) => schema)).not.toContainEqual(
        tag,
      );
      expect(collect.mock.calls.map(([record]) => record)).toEqual([
        {
          code: FormWarningCode.DiscriminatorBranchUnreachable,
          level: 'warning',
          schemaPath: '#/oneOf/1',
          details: { propertyName: 'kind', reason: 'kind' },
        },
      ]);
    },
  );

  it.each([
    { enum: [] },
    { const: 'a', enum: ['b'] },
    { type: 'string', enum: ['a'], allOf: [{ enum: ['b'] }] },
  ])('C11 records an empty intersection as a never-active branch %j', (tag) => {
    const collect = vi.fn();
    const result = blueprint(
      {
        type: 'object',
        controls: { discriminator: 'kind' },
        oneOf: [{ properties: { kind: tag, value: { type: 'string' } } }],
      },
      { collect },
    );
    const value = result.root.childEntries.find(
      ({ name }) => name === 'value',
    )?.node;
    expect(value?.declarations[0].gates[0]).toMatchObject({
      kind: 'discriminator',
      condition: { propertyName: 'kind', values: [] },
    });
    expect(result.root.childEntries.some(({ name }) => name === 'kind')).toBe(
      false,
    );
    expect(collect.mock.calls.map(([record]) => record)).toEqual([
      {
        code: FormWarningCode.DiscriminatorBranchUnreachable,
        level: 'warning',
        schemaPath: '#/oneOf/0',
        details: { propertyName: 'kind', reason: 'empty' },
      },
    ]);
  });

  it('C1 validates the key before ignoring a non-object host', () => {
    expect(() =>
      blueprint({ type: 'string', controls: { discriminator: '' } }),
    ).toThrow(
      expect.objectContaining({ code: FormErrorCode.InvalidControlShape }),
    );
  });

  it('keeps terminal object mismatch errors and suppresses unreachable warnings', () => {
    const collect = vi.fn();
    blueprint(
      {
        type: 'object',
        options: { terminal: true },
        controls: { discriminator: 'kind' },
        oneOf: [{ properties: { kind: { type: 'string', const: 4 } } }],
      },
      { collect },
    );
    expect(
      collect.mock.calls.some(
        ([record]) =>
          record.code === FormWarningCode.DiscriminatorBranchUnreachable,
      ),
    ).toBe(false);
    expect(() =>
      blueprint({
        type: 'object',
        options: { terminal: true },
        controls: { discriminator: 'kind' },
        oneOf: [{}],
      }),
    ).toThrow(
      expect.objectContaining({ code: FormErrorCode.DiscriminatorMismatch }),
    );
  });
});
