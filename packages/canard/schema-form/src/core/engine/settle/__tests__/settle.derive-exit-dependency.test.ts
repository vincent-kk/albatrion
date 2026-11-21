import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: object, defaultValue?: unknown) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as never) as any;

const gated = {
  type: 'object',
  properties: {
    on: { type: 'boolean', default: true },
    a: {
      type: 'string',
      default: 'av',
      controls: { active: '../on === true' },
    },
    b: { type: 'string', controls: { derived: '(../a) ?? "none"' } },
    c: { type: 'string', controls: { visible: '../a === "av"' } },
  },
};

describe('derive rules whose dependency leaves the shape', () => {
  it('re-evaluates derived when its dependency exits through a gate', () => {
    const root = tree(gated, {});
    expect(root.value).toEqual({ on: true, a: 'av', b: 'av' });
    root.find('/on').setValue(false);
    expect(root.find('/c').isVisible).toBe(false);
    expect(root.value).toEqual({ on: false, b: 'none' });
  });

  it('reaches the same value as mounting with the final input', () => {
    const mounted = tree(gated, { on: false });
    const sequenced = tree(gated, {});
    sequenced.find('/on').setValue(false);
    expect(sequenced.value).toEqual(mounted.value);
  });

  it('keeps a direct write made after the dependency exited', () => {
    const root = tree(gated, {});
    root.find('/on').setValue(false);
    root.find('/b').setValue('mine');
    expect(root.find('/b').value).toBe('mine');
  });

  it('re-evaluates derived when a oneOf switch removes its dependency', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['A', 'B'], default: 'A' },
          label: {
            type: 'string',
            controls: { derived: '(../fieldA) ?? "-"' },
          },
        },
        oneOf: [
          {
            controls: { active: "./type === 'A'" },
            properties: { fieldA: { type: 'string', default: 'fa' } },
          },
          {
            controls: { active: "./type === 'B'" },
            properties: { fieldB: { type: 'string' } },
          },
        ],
      },
      {},
    );
    root.find('/type').setValue('B');
    expect(root.value).toEqual({ type: 'B', label: '-' });
  });

  it('fires unsetValue when its dependency exits through a gate', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          on: { type: 'boolean', default: true },
          a: {
            type: 'string',
            default: 'av',
            controls: { active: '../on === true' },
          },
          t: {
            type: 'string',
            controls: { unsetValue: '(../a) === undefined' },
          },
        },
      },
      {},
    );
    root.find('/t').setValue('keep');
    root.find('/on').setValue(false);
    expect(root.value).toEqual({ on: false });
  });
});
