import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

const mk = (active: any, ref = true) => {
  const S = { type: 'string', default: 'd', controls: { active } };
  return {
    type: 'object',
    properties: {
      a: {
        type: 'object',
        properties: { on: { type: 'boolean', default: true }, s: ref ? { $ref: '#/$defs/S' } : S },
      },
    },
    $defs: { S },
  };
};

describe('$ref target node gate', () => {
  for (const [label, active] of [
    ['relative ../on', '../on === true'],
    ['absolute /a/on', '/a/on === true'],
    ['literal true', true],
    ['literal false', false],
    ['expression true', 'true'],
  ] as const)
    for (const ref of [false, true])
      it(`G ${label} ref=${ref}`, () => {
        const root = tree(mk(active, ref), {});
        const expected = active === false ? { a: { on: true } } : { a: { on: true, s: 'd' } };
        expect(root.value).toEqual(expected);
      });

  it('G toggle relative ref', () => {
    const root = tree(mk('../on === true'), { a: { on: false } });
    expect(root.value).toEqual({ a: { on: false } });
    root.find('/a/on').setValue(true);
    expect(root.value).toEqual({ a: { on: true, s: 'd' } });
  });
});

describe('$ref gate diagnostics', () => {
  it('G diag records', () => {
    const records: any[] = [];
    const root: any = nodeFromJSONSchema({
      jsonSchema: mk('../on === true') as any,
      defaultValue: {} as any,
      errorReporter: { report: (r: any) => records.push(r), hasConsumer: () => true },
    } as any);
    expect({
      value: root.value,
      records: records.map((r) => [r.code, r.path, r.schemaPath, String(r.message).slice(0, 120)]),
      diag: root.diagnostics?.status,
    }).toEqual({ value: { a: { on: true, s: 'd' } }, records: [], diag: 'stable' });
  });
});

describe('$ref gate order dependence', () => {
  it('G-order: an earlier branch-bearing keyword makes the same $ref gate work', () => {
    const schema: any = mk('../on === true');
    const withEarlier = { ...schema, then: {} };
    const root = tree(withEarlier, {});
    expect(root.value).toEqual({ a: { on: true, s: 'd' } });
  });
  it('G-order: sibling earlier property with an inline active gate', () => {
    const schema: any = mk('../on === true');
    schema.properties = { z: { type: 'string', controls: { active: true } }, ...schema.properties };
    const root = tree(schema, {});
    expect(root.value).toEqual({ a: { on: true, s: 'd' } });
  });
});
