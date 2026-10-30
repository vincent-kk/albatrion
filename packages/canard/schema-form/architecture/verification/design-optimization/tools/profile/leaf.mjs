// Single leaf write cost vs sibling count, with and without a root oneOf; current and legacy, same process.
import { performance } from 'node:perf_hooks';

import context from './context.mjs';

const cur = await import(new URL('current.mjs', context.engines));
const leg = await import(new URL('legacy.mjs', context.engines));
const noop = () => {};
const schemaOf = (n, oneOf, legacy) => {
  const properties = {
    type: { type: 'string', enum: ['a', 'b'], default: 'a' },
  };
  for (let i = 0; i < n; i++)
    properties[`pad_${i}`] = { type: 'number', default: i };
  const s = { type: 'object', properties };
  if (oneOf)
    s.oneOf = ['a', 'b'].map((v, i) => ({
      ...(legacy
        ? { computed: { if: `./type === '${v}'` } }
        : { controls: { active: `./type === '${v}'` } }),
      properties: {
        x: { type: 'string', default: v.toUpperCase() },
        y: { type: 'number', default: i + 1 },
      },
    }));
  return s;
};
const yieldTask = () => new Promise((r) => setTimeout(r, 0));
const med = async (fn, reps, asyncFn) => {
  const t = [];
  for (let i = 0; i < reps; i++) {
    await yieldTask();
    const s = performance.now();
    if (asyncFn) await fn();
    else fn();
    t.push(performance.now() - s);
  }
  t.sort((a, b) => a - b);
  return +t[t.length >> 1].toFixed(4);
};
const res = [];
for (const oneOf of [false, true])
  for (const n of [250, 1000, 4000, 8000]) {
    const root = cur.buildFieldNodeTree({
      jsonSchema: schemaOf(n, oneOf, false),
      onChange: noop,
    });
    cur.mountFieldNode(root, undefined, undefined, { deferValidation: false });
    const leaf = root.find('pad_7');
    let c = 0;
    const lr = leg.legacyNodeFromJSONSchema({
      jsonSchema: schemaOf(n, oneOf, true),
      onChange: noop,
    });
    await yieldTask();
    await yieldTask();
    const ll = lr.find('pad_7');
    let d = 0;
    for (let w = 0; w < 5; w++) {
      leaf.setValue(++c);
    }
    const curMs = await med(
      () => {
        leaf.setValue(++c);
        if (root.value.pad_7 !== c) throw new Error('cur');
      },
      Number(process.env.D0_SAMPLES ?? 41),
    );
    const legMs = await med(
      async () => {
        ll.setValue(++d);
        for (let k = 0; k < 8; k++) await Promise.resolve();
        if (lr.value.pad_7 !== d) throw new Error('leg');
      },
      Number(process.env.D0_SAMPLES ?? 41),
      true,
    );
    res.push({ oneOf, siblings: n, currentMs: curMs, legacyMs: legMs });
  }
console.table(res);
