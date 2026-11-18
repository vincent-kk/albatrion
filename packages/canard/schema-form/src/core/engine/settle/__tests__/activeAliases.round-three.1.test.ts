import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue });

/** Inline every local `$ref` (non-recursive schemas only). */
const inline = (schema: any, root: any = schema): any => {
  if (Array.isArray(schema)) return schema.map((s) => inline(s, root));
  if (schema === null || typeof schema !== 'object') return schema;
  if (typeof schema.$ref === 'string') {
    let target = root;
    for (const n of schema.$ref.slice(2).split('/')) target = target[n];
    const { $ref, ...rest } = schema;
    return inline({ ...inline(target, root), ...rest }, root);
  }
  const out: any = {};
  for (const key of Object.keys(schema)) {
    if (key === '$defs') continue;
    out[key] = inline(schema[key], root);
  }
  return out;
};

const run = (schema: any, load: any, steps: ((root: any) => void)[]) => {
  const root = tree(schema, load);
  const seen: any[] = [root.value];
  for (const step of steps) {
    step(root);
    seen.push(root.value);
  }
  return seen;
};

const withQ = (Q: any, properties: any) => ({
  type: 'object',
  properties,
  $defs: { Q },
});

const fieldsGate = (key: string, expression: string) => ({
  type: 'object',
  properties: {
    a: { type: 'string', default: 'v' },
    t: { type: 'string', default: 't' },
  },
  controls: { fields: [{ targets: ['t'], controls: { [key]: expression } }] },
});

const twoDepths = (Q: any) =>
  withQ(Q, {
    flag: { type: 'boolean', default: false },
    x: { $ref: '#/$defs/Q' },
    g: {
      type: 'object',
      properties: {
        flag: { type: 'boolean', default: true },
        y: { $ref: '#/$defs/Q' },
      },
    },
  });

const sameDepth = (Q: any) =>
  withQ(Q, {
    g1: {
      type: 'object',
      properties: {
        flag: { type: 'boolean', default: false },
        y: { $ref: '#/$defs/Q' },
      },
    },
    g2: {
      type: 'object',
      properties: {
        flag: { type: 'boolean', default: true },
        y: { $ref: '#/$defs/Q' },
      },
    },
  });

describe('fields-entry gate in a template that reads outside the template', () => {
  it('O1 fields active, referrers at different depths, write the second referrer flag', () => {
    const schema = twoDepths(fieldsGate('active', '../flag === true'));
    const steps = [(root: any) => root.find('/g/flag')!.setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O2 fields active, referrers at the same depth', () => {
    const schema = sameDepth(fieldsGate('active', '../flag === true'));
    const steps = [
      (root: any) => root.find('/g2/flag')!.setValue(false),
      (root: any) => root.find('/g1/flag')!.setValue(true),
    ];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O3 single referrer (no aliasing) control', () => {
    const schema = withQ(fieldsGate('active', '../flag === true'), {
      g: {
        type: 'object',
        properties: {
          flag: { type: 'boolean', default: true },
          y: { $ref: '#/$defs/Q' },
        },
      },
    });
    const steps = [(root: any) => root.find('/g/flag')!.setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O4 node own active with an outer path, referrers at different depths', () => {
    const Q = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'v' },
        t: {
          type: 'string',
          default: 't',
          controls: { active: '../../flag === true' },
        },
      },
    };
    const schema = twoDepths(Q);
    const steps = [(root: any) => root.find('/g/flag')!.setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O5 fields visible with an outer path', () => {
    const schema = twoDepths(fieldsGate('visible', '../flag === true'));
    const read = (s: any) => {
      const root = tree(s, {});
      const before = [
        root.find('/x/t')!.isVisible,
        root.find('/g/y/t')!.isVisible,
      ];
      root.find('/g/flag')!.setValue(false);
      const after = [
        root.find('/x/t')!.isVisible,
        root.find('/g/y/t')!.isVisible,
      ];
      return { before, after };
    };
    expect(read(schema)).toEqual(read(inline(schema)));
  });

  it('O6 fields readOnly with an outer path', () => {
    const schema = twoDepths(fieldsGate('readOnly', '../flag === true'));
    const read = (s: any) => {
      const root = tree(s, {});
      const before = [
        root.find('/x/t')!.isReadOnly,
        root.find('/g/y/t')!.isReadOnly,
      ];
      root.find('/g/flag')!.setValue(false);
      const after = [
        root.find('/x/t')!.isReadOnly,
        root.find('/g/y/t')!.isReadOnly,
      ];
      return { before, after };
    };
    expect(read(schema)).toEqual(read(inline(schema)));
  });

  it('O7 fields derived with an outer path', () => {
    const schema = twoDepths(fieldsGate('derived', '(../flag) ? "yes" : "no"'));
    const steps = [(root: any) => root.find('/g/flag')!.setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O8 fields active, first referrer flag written instead', () => {
    const schema = twoDepths(fieldsGate('active', '../flag === true'));
    const steps = [
      (root: any) => root.find('/flag')!.setValue(true),
      (root: any) => root.find('/flag')!.setValue(false),
    ];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O9 fields active, second referrer flag turned on from off', () => {
    const schema = twoDepths(fieldsGate('active', '../flag === true'));
    const steps = [(root: any) => root.find('/g/flag')!.setValue(true)];
    expect(run(schema, { flag: true, g: { flag: false } }, steps)).toEqual(
      run(inline(schema), { flag: true, g: { flag: false } }, steps),
    );
  });

  it('O10 fields active with a non-equality expression', () => {
    const schema = twoDepths(fieldsGate('active', '!!(../flag)'));
    const steps = [(root: any) => root.find('/g/flag')!.setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O11 array items whose template reads the array owner', () => {
    const Q = fieldsGate('active', '../../flag === true');
    const schema = withQ(Q, {
      g1: {
        type: 'object',
        properties: {
          flag: { type: 'boolean', default: false },
          list: { type: 'array', items: { $ref: '#/$defs/Q' } },
        },
      },
      g2: {
        type: 'object',
        properties: {
          flag: { type: 'boolean', default: true },
          list: { type: 'array', items: { $ref: '#/$defs/Q' } },
        },
      },
    });
    const load = { g1: { list: [{}] }, g2: { list: [{}] } };
    const steps = [
      (root: any) => root.find('/g2/flag')!.setValue(false),
      (root: any) => root.find('/g1/flag')!.setValue(true),
    ];
    expect(run(schema, load, steps)).toEqual(run(inline(schema), load, steps));
  });
});
