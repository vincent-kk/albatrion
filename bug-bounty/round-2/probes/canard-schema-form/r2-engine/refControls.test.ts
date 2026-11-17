import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

describe('controls through $ref', () => {
  it('C1 gated oneOf branch given by $ref', () => {
    const root = tree(
      {
        type: 'object',
        properties: { type: { type: 'string', enum: ['A', 'B'], default: 'A' } },
        oneOf: [{ $ref: '#/$defs/A' }, { $ref: '#/$defs/B' }],
        $defs: {
          A: { controls: { active: "./type === 'A'" }, properties: { fa: { type: 'string', default: 'a' } } },
          B: { controls: { active: "./type === 'B'" }, properties: { fb: { type: 'string', default: 'b' } } },
        },
      },
      {},
    );
    expect(root.value).toEqual({ type: 'A', fa: 'a' });
    root.find('/type').setValue('B');
    expect(root.value).toEqual({ type: 'B', fb: 'b' });
  });

  it('C2 shared template with relative derived at two depths', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          x: { $ref: '#/$defs/P' },
          g: { type: 'object', properties: { y: { $ref: '#/$defs/P' } } },
        },
        $defs: {
          P: {
            type: 'object',
            properties: {
              a: { type: 'string', default: 'v' },
              b: { type: 'string', controls: { derived: '(../a) + "!"' } },
            },
          },
        },
      },
      {},
    );
    expect(root.value).toEqual({ x: { a: 'v', b: 'v!' }, g: { y: { a: 'v', b: 'v!' } } });
    root.find('/g/y/a').setValue('w');
    expect(root.value).toEqual({ x: { a: 'v', b: 'v!' }, g: { y: { a: 'w', b: 'w!' } } });
  });

  it('C3 $ref sibling controls.active gates the referenced node', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          on: { type: 'boolean', default: false },
          p: { $ref: '#/$defs/S', controls: { active: '../on === true' } },
          q: { $ref: '#/$defs/S' },
        },
        $defs: { S: { type: 'string', default: 'd' } },
      },
      {},
    );
    expect(root.value).toEqual({ on: false, q: 'd' });
    root.find('/on').setValue(true);
    expect(root.value).toEqual({ on: true, p: 'd', q: 'd' });
  });

  it('C4 $ref target gate applies to every referrer independently', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          a: { type: 'object', properties: { on: { type: 'boolean', default: true }, s: { $ref: '#/$defs/S' } } },
          b: { type: 'object', properties: { on: { type: 'boolean', default: false }, s: { $ref: '#/$defs/S' } } },
        },
        $defs: { S: { type: 'string', default: 'd', controls: { active: '../on === true' } } },
      },
      {},
    );
    expect(root.value).toEqual({ a: { on: true, s: 'd' }, b: { on: false } });
    root.find('/b/on').setValue(true);
    root.find('/a/on').setValue(false);
    expect(root.value).toEqual({ a: { on: false }, b: { on: true, s: 'd' } });
  });

  it('C5 allOf fragment controls.default and node default precedence', () => {
    const root = tree(
      {
        type: 'object',
        properties: { s: { type: 'string', default: 'std', allOf: [{ controls: { default: 'frag' } }] } },
      },
      {},
    );
    expect(root.value).toEqual({ s: 'frag' });
  });

  it('C6 recursive template: derived inside array items of recursive $ref', () => {
    const root = tree(
      {
        $defs: {
          n: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              label: { type: 'string', controls: { derived: '(../name) + "#"' } },
              kids: { type: 'array', items: { $ref: '#/$defs/n' } },
            },
          },
        },
        $ref: '#/$defs/n',
      },
      { name: 'r', kids: [{ name: 'c', kids: [{ name: 'g' }] }] },
    );
    expect(root.find('/kids/0/kids/0/label').value).toBe('g#');
    root.find('/kids/0/kids/0/name').setValue('h');
    expect(root.find('/kids/0/kids/0/label').value).toBe('h#');
    root.find('/kids/0/kids').insert(0, { name: 'z' });
    expect(root.find('/kids/0/kids/0/label').value).toBe('z#');
    expect(root.find('/kids/0/kids/1/label').value).toBe('h#');
    root.find('/kids/0/kids/1/name').setValue('i');
    expect(root.find('/kids/0/kids/1/label').value).toBe('i#');
  });
});
