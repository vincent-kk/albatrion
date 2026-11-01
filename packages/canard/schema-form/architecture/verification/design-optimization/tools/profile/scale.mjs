// Scaling probe for the current engine: median ms per operation at several tree sizes.
import { performance } from 'node:perf_hooks';

import context from './context.mjs';

const cur = await import(new URL('current.mjs', context.engines));
const noop = () => {};
const seed = () => ({
  diagnostics: { status: 'stable' },
  loadSnapshot: undefined,
  latentRaw: new cur.PathKeyedMap('pair'),
  misfitPaths: new cur.PathKeyedSet(),
  inactiveValuesMemo: new cur.PathKeyedMap('path'),
});
const med = (fn, reps) => {
  for (let i = 0; i < Math.min(3, reps); i++) fn();
  const t = [];
  for (let i = 0; i < reps; i++) {
    const s = performance.now();
    fn();
    t.push(performance.now() - s);
  }
  t.sort((a, b) => a - b);
  return +t[t.length >> 1].toFixed(4);
};
const flat = (n) => {
  const properties = {},
    value = {};
  for (let i = 0; i < n; i++) {
    const type = ['number', 'string', 'boolean'][i % 3];
    properties[`field_${i}`] = { type };
    value[`field_${i}`] =
      type === 'number' ? i : type === 'string' ? String(i) : i % 2 === 0;
  }
  return { schema: { type: 'object', properties }, value };
};
const out = {
  blueprint: {},
  mount: {},
  wave: {},
  switchPad: {},
  leafWritePad: {},
};
for (const n of [1000, 2500, 5000, 10000, 20000]) {
  const { schema, value } = flat(n);
  const a = cur.blueprint(schema);
  out.blueprint[n] = med(
    () => cur.blueprint(schema),
    Number(process.env.D0_SAMPLES ?? (n > 5000 ? 7 : 15)),
  );
  out.mount[n] = med(
    () => {
      const r = cur.fieldNodeFactory(a, seed());
      cur.loadFieldNodeAtMount(r, value, cur.SetValueOption.Overwrite);
    },
    Number(process.env.D0_SAMPLES ?? (n > 5000 ? 7 : 15)),
  );
}
for (const n of [250, 1000, 4000]) {
  const p = {};
  for (let i = 0; i < n; i++) p[`field_${i}`] = { type: 'number' };
  const wv = (v) => {
    const r = {};
    for (let i = 0; i < n; i++) r[`field_${i}`] = v;
    return r;
  };
  const vals = [wv(0), wv(1)];
  const root = cur.fieldNodeFactory(
    cur.blueprint({ type: 'object', properties: p }),
    seed(),
  );
  cur.dispatchMount(root, wv(0));
  for (const c of root.children) c.subscribe(noop);
  let k = 0;
  out.wave[n] = med(
    () => root.setValue(vals[(k = 1 - k)]),
    Number(process.env.D0_SAMPLES ?? 31),
  );
}
for (const pad of [0, 100, 1000, 4000]) {
  const properties = {
    type: { type: 'string', enum: ['a', 'b'], default: 'a' },
  };
  for (let i = 0; i < pad; i++)
    properties[`pad_${i}`] = { type: 'number', default: i };
  const schema = {
    type: 'object',
    properties,
    oneOf: ['a', 'b'].map((v, i) => ({
      controls: { active: `./type === '${v}'` },
      properties: {
        x: { type: 'string', default: v.toUpperCase() },
        y: { type: 'number', default: i + 1 },
      },
    })),
  };
  const root = cur.buildFieldNodeTree({ jsonSchema: schema, onChange: noop });
  cur.mountFieldNode(root, undefined, undefined, { deferValidation: false });
  const t = root.find('type');
  let tg = false;
  out.switchPad[pad] = med(
    () => t.setValue((tg = !tg) ? 'b' : 'a'),
    Number(process.env.D0_SAMPLES ?? 101),
  );
  const pad0 = root.find('pad_0') ?? root.find('x');
  let c = 0;
  out.leafWritePad[pad] = med(
    () => pad0.setValue(pad0 === root.find('x') ? `v${++c}` : ++c),
    Number(process.env.D0_SAMPLES ?? 101),
  );
}
console.log(JSON.stringify(out));
