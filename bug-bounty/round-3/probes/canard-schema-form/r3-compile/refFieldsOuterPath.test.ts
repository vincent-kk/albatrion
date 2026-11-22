import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

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
  properties: { a: { type: 'string', default: 'v' }, t: { type: 'string', default: 't' } },
  controls: { fields: [{ targets: ['t'], controls: { [key]: expression } }] },
});

const twoDepths = (Q: any) =>
  withQ(Q, {
    flag: { type: 'boolean', default: false },
    x: { $ref: '#/$defs/Q' },
    g: {
      type: 'object',
      properties: { flag: { type: 'boolean', default: true }, y: { $ref: '#/$defs/Q' } },
    },
  });

const sameDepth = (Q: any) =>
  withQ(Q, {
    g1: {
      type: 'object',
      properties: { flag: { type: 'boolean', default: false }, y: { $ref: '#/$defs/Q' } },
    },
    g2: {
      type: 'object',
      properties: { flag: { type: 'boolean', default: true }, y: { $ref: '#/$defs/Q' } },
    },
  });

describe('fields-entry gate in a template that reads outside the template', () => {
  it('O1 fields active, referrers at different depths, write the second referrer flag', () => {
    const schema = twoDepths(fieldsGate('active', '../flag === true'));
    const steps = [(root: any) => root.find('/g/flag').setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O2 fields active, referrers at the same depth', () => {
    const schema = sameDepth(fieldsGate('active', '../flag === true'));
    const steps = [
      (root: any) => root.find('/g2/flag').setValue(false),
      (root: any) => root.find('/g1/flag').setValue(true),
    ];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O3 single referrer (no aliasing) control', () => {
    const schema = withQ(fieldsGate('active', '../flag === true'), {
      g: {
        type: 'object',
        properties: { flag: { type: 'boolean', default: true }, y: { $ref: '#/$defs/Q' } },
      },
    });
    const steps = [(root: any) => root.find('/g/flag').setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O4 node own active with an outer path, referrers at different depths', () => {
    const Q = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'v' },
        t: { type: 'string', default: 't', controls: { active: '../../flag === true' } },
      },
    };
    const schema = twoDepths(Q);
    const steps = [(root: any) => root.find('/g/flag').setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O5 fields visible with an outer path', () => {
    const schema = twoDepths(fieldsGate('visible', '../flag === true'));
    const read = (s: any) => {
      const root = tree(s, {});
      const before = [root.find('/x/t').isVisible, root.find('/g/y/t').isVisible];
      root.find('/g/flag').setValue(false);
      const after = [root.find('/x/t').isVisible, root.find('/g/y/t').isVisible];
      return { before, after };
    };
    expect(read(schema)).toEqual(read(inline(schema)));
  });

  it('O6 fields readOnly with an outer path', () => {
    const schema = twoDepths(fieldsGate('readOnly', '../flag === true'));
    const read = (s: any) => {
      const root = tree(s, {});
      const before = [root.find('/x/t').isReadOnly, root.find('/g/y/t').isReadOnly];
      root.find('/g/flag').setValue(false);
      const after = [root.find('/x/t').isReadOnly, root.find('/g/y/t').isReadOnly];
      return { before, after };
    };
    expect(read(schema)).toEqual(read(inline(schema)));
  });

  it('O7 fields derived with an outer path', () => {
    const schema = twoDepths(fieldsGate('derived', '(../flag) ? "yes" : "no"'));
    const steps = [(root: any) => root.find('/g/flag').setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O8 fields active, first referrer flag written instead', () => {
    const schema = twoDepths(fieldsGate('active', '../flag === true'));
    const steps = [
      (root: any) => root.find('/flag').setValue(true),
      (root: any) => root.find('/flag').setValue(false),
    ];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O9 fields active, second referrer flag turned on from off', () => {
    const schema = twoDepths(fieldsGate('active', '../flag === true'));
    const steps = [(root: any) => root.find('/g/flag').setValue(true)];
    expect(run(schema, { flag: true, g: { flag: false } }, steps)).toEqual(
      run(inline(schema), { flag: true, g: { flag: false } }, steps),
    );
  });

  it('O10 fields active with a non-equality expression', () => {
    const schema = twoDepths(fieldsGate('active', '!!(../flag)'));
    const steps = [(root: any) => root.find('/g/flag').setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O11 array items whose template reads the array owner', () => {
    const Q = fieldsGate('active', '../../flag === true');
    const schema = withQ(Q, {
      g1: {
        type: 'object',
        properties: { flag: { type: 'boolean', default: false }, list: { type: 'array', items: { $ref: '#/$defs/Q' } } },
      },
      g2: {
        type: 'object',
        properties: { flag: { type: 'boolean', default: true }, list: { type: 'array', items: { $ref: '#/$defs/Q' } } },
      },
    });
    const load = { g1: { list: [{}] }, g2: { list: [{}] } };
    const steps = [
      (root: any) => root.find('/g2/flag').setValue(false),
      (root: any) => root.find('/g1/flag').setValue(true),
    ];
    expect(run(schema, load, steps)).toEqual(run(inline(schema), load, steps));
  });
});

describe('diagnostic: does an unrelated state or derive control change the outcome', () => {
  const withExtra = (schema: any, extra: any) => ({
    ...schema,
    properties: { ...schema.properties, extra },
  });

  it('D1 O1 plus an unrelated visible control', () => {
    const schema = withExtra(twoDepths(fieldsGate('active', '../flag === true')), {
      type: 'string',
      controls: { visible: '../flag === true' },
    });
    const steps = [(root: any) => root.find('/g/flag').setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('D2 O1 plus an unrelated derived control', () => {
    const schema = withExtra(twoDepths(fieldsGate('active', '../flag === true')), {
      type: 'string',
      controls: { derived: '(../flag) ? "a" : "b"' },
    });
    const steps = [(root: any) => root.find('/g/flag').setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('D3 O4 plus an unrelated visible control', () => {
    const Q = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'v' },
        t: { type: 'string', default: 't', controls: { active: '../../flag === true' } },
      },
    };
    const schema = withExtra(twoDepths(Q), { type: 'string', controls: { visible: '../flag === true' } });
    const steps = [(root: any) => root.find('/g/flag').setValue(false)];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });
});

describe('other gate shapes reading outside a reused template', () => {
  it('O12 oneOf branch gates that read the referrer sibling', () => {
    const Q = {
      type: 'object',
      properties: { a: { type: 'string', default: 'v' } },
      oneOf: [
        { controls: { active: '../mode === "a"' }, properties: { pa: { type: 'string', default: 'A' } } },
        { controls: { active: '../mode === "b"' }, properties: { pb: { type: 'string', default: 'B' } } },
      ],
    };
    const schema = withQ(Q, {
      g1: { type: 'object', properties: { mode: { type: 'string', default: 'a' }, y: { $ref: '#/$defs/Q' } } },
      g2: { type: 'object', properties: { mode: { type: 'string', default: 'a' }, y: { $ref: '#/$defs/Q' } } },
    });
    const steps = [(root: any) => root.find('/g2/mode').setValue('b')];
    expect(run(schema, {}, steps)).toEqual(run(inline(schema), {}, steps));
  });

  it('O13 recursive template whose field reads the parent node', () => {
    const schema = {
      type: 'object',
      properties: { root: { $ref: '#/$defs/N' } },
      $defs: {
        N: {
          type: 'object',
          properties: {
            open: { type: 'boolean', default: true },
            label: { type: 'string', default: 'L', controls: { active: '../../../open === true' } },
            kids: { type: 'array', items: { $ref: '#/$defs/N' } },
          },
        },
      },
    };
    const root = tree(schema, { root: { open: true, kids: [{ open: true, kids: [{}] }] } });
    const before = root.find('/root/kids/0/kids/0/label') !== null;
    root.find('/root/kids/0/open').setValue(false);
    const after = root.find('/root/kids/0/kids/0/label') !== null;
    expect({ before, after }).toEqual({ before: true, after: false });
  });
});

describe('diagnostic: recursive template control', () => {
  it('D4 O13 plus an unrelated visible control', () => {
    const schema = {
      type: 'object',
      properties: {
        root: { $ref: '#/$defs/N' },
        extra: { type: 'string', controls: { visible: '../root/open === true' } },
      },
      $defs: {
        N: {
          type: 'object',
          properties: {
            open: { type: 'boolean', default: true },
            label: { type: 'string', default: 'L', controls: { active: '../../../open === true' } },
            kids: { type: 'array', items: { $ref: '#/$defs/N' } },
          },
        },
      },
    };
    const root = tree(schema, { root: { open: true, kids: [{ open: true, kids: [{}] }] } });
    const before = root.find('/root/kids/0/kids/0/label') !== null;
    root.find('/root/kids/0/open').setValue(false);
    const after = root.find('/root/kids/0/kids/0/label') !== null;
    expect({ before, after }).toEqual({ before: true, after: false });
  });
});

describe('edge controls alone in a reused template with an outer path', () => {
  it('E1 unsetValue only', () => {
    const Q = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'v' },
        t: { type: 'string', controls: { unsetValue: '../../flag === true' } },
      },
    };
    const schema = twoDepths(Q);
    const load = { x: { t: 'keepX' }, g: { flag: false, y: { t: 'keepY' } } };
    const steps = [(root: any) => root.find('/g/flag').setValue(true)];
    expect(run(schema, load, steps)).toEqual(run(inline(schema), load, steps));
  });

  it('E2 resetInteraction only', () => {
    const Q = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'v' },
        t: { type: 'string', controls: { resetInteraction: '../../flag === true' } },
      },
    };
    const schema = twoDepths(Q);
    const read = (s: any) => {
      const root = tree(s, { g: { flag: false } });
      root.find('/g/y/t').setValue('typed');
      const before = root.find('/g/y/t').isEdited ?? root.find('/g/y/t').edited;
      root.find('/g/flag').setValue(true);
      const after = root.find('/g/y/t').isEdited ?? root.find('/g/y/t').edited;
      return { before, after };
    };
    expect(read(schema)).toEqual(read(inline(schema)));
  });
});

describe('context reads in a reused active-only template', () => {
  it('C1 both referrers follow a context change', async () => {
    const { setContext } = await import('../../core');
    const Q = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'v' },
        t: { type: 'string', default: 't', controls: { active: '@.on === true' } },
      },
    };
    const schema = twoDepths(Q);
    const read = (s: any) => {
      const root = nodeFromJSONSchema({ jsonSchema: s, defaultValue: {}, context: { on: false } } as any) as any;
      const before = root.value;
      setContext(root, { on: true });
      return { before, after: root.value };
    };
    expect(read(schema)).toEqual(read(inline(schema)));
  });
});

describe('context reads: which controls follow a context change at the second referrer', () => {
  const runContext = async (Q: any, extra?: any) => {
    const { setContext } = await import('../../core');
    const base = twoDepths(Q);
    const schema = extra ? { ...base, properties: { ...base.properties, extra } } : base;
    const read = (s: any) => {
      const root = nodeFromJSONSchema({ jsonSchema: s, defaultValue: {}, context: { on: false } } as any) as any;
      const state = () => ({
        value: root.value,
        visible: [root.find('/x/t')?.isVisible, root.find('/g/y/t')?.isVisible],
        readOnly: [root.find('/x/t')?.isReadOnly, root.find('/g/y/t')?.isReadOnly],
      });
      const before = state();
      setContext(root, { on: true });
      return { before, after: state() };
    };
    return { ref: read(schema), inline: read(inline(schema)) };
  };
  const field = (controls: any) => ({
    type: 'object',
    properties: { a: { type: 'string', default: 'v' }, t: { type: 'string', default: 't', controls } },
  });

  it('C2 visible reading context', async () => {
    const r = await runContext(field({ visible: '@.on === true' }));
    expect(r.ref).toEqual(r.inline);
  });

  it('C3 readOnly reading context', async () => {
    const r = await runContext(field({ readOnly: '@.on === true' }));
    expect(r.ref).toEqual(r.inline);
  });

  it('C4 active reading context with an unrelated path-reading visible control', async () => {
    const r = await runContext(field({ active: '@.on === true' }), {
      type: 'string',
      controls: { visible: '../flag === true' },
    });
    expect(r.ref).toEqual(r.inline);
  });

  it('C5 derived reading context', async () => {
    const r = await runContext(field({ derived: '(@).on ? "yes" : "no"' }));
    expect(r.ref).toEqual(r.inline);
  });

  it('C6 active reading context with a single referrer', async () => {
    const { setContext } = await import('../../core');
    const schema = withQ(field({ active: '@.on === true' }), {
      g: { type: 'object', properties: { y: { $ref: '#/$defs/Q' } } },
    });
    const read = (s: any) => {
      const root = nodeFromJSONSchema({ jsonSchema: s, defaultValue: {}, context: { on: false } } as any) as any;
      setContext(root, { on: true });
      return root.value;
    };
    expect(read(schema)).toEqual(read(inline(schema)));
  });
});

describe('diagnostic: absent child at the second referrer with the aliased index present', () => {
  const withExtra = (schema: any) => ({
    ...schema,
    properties: { ...schema.properties, extra: { type: 'string', controls: { visible: '../flag === true' } } },
  });

  it('D5 O9 (second referrer turns on from off) plus an unrelated visible control', () => {
    const schema = withExtra(twoDepths(fieldsGate('active', '../flag === true')));
    const load = { flag: true, g: { flag: false } };
    const steps = [(root: any) => root.find('/g/flag').setValue(true)];
    expect(run(schema, load, steps)).toEqual(run(inline(schema), load, steps));
  });

  it('D6 node own active, second referrer turns on from off, plus an unrelated visible control', () => {
    const Q = {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'v' },
        t: { type: 'string', default: 't', controls: { active: '../../flag === true' } },
      },
    };
    const schema = withExtra(twoDepths(Q));
    const load = { flag: true, g: { flag: false } };
    const steps = [(root: any) => root.find('/g/flag').setValue(true)];
    expect(run(schema, load, steps)).toEqual(run(inline(schema), load, steps));
  });

  it('D7 context: field starts active at both referrers and turns off', async () => {
    const { setContext } = await import('../../core');
    const Q = {
      type: 'object',
      properties: { a: { type: 'string', default: 'v' }, t: { type: 'string', default: 't', controls: { active: '@.on === true' } } },
    };
    const schema = withExtra(twoDepths(Q));
    const read = (s: any) => {
      const root = nodeFromJSONSchema({ jsonSchema: s, defaultValue: {}, context: { on: true } } as any) as any;
      const before = root.value;
      setContext(root, { on: false });
      return { before, after: root.value };
    };
    expect(read(schema)).toEqual(read(inline(schema)));
  });
});

describe('control: one array whose item template reads the array owner', () => {
  it('A1 every item follows the owner flag (no $ref reuse)', () => {
    const schema = {
      type: 'object',
      properties: {
        flag: { type: 'boolean', default: false },
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: { a: { type: 'string', default: 'v' }, t: { type: 'string', default: 't', controls: { active: '../../../flag === true' } } },
          },
        },
      },
    };
    const root = tree(schema, { list: [{}, {}] });
    root.find('/flag').setValue(true);
    const on = root.value;
    root.find('/flag').setValue(false);
    expect({ on, off: root.value }).toEqual({
      on: { flag: true, list: [{ a: 'v', t: 't' }, { a: 'v', t: 't' }] },
      off: { flag: false, list: [{ a: 'v' }, { a: 'v' }] },
    });
  });
});
