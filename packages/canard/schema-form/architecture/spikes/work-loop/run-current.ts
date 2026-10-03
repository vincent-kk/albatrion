// @ts-nocheck — throwaway spike outside tsconfig `include`; the `@/schema-form` alias resolves only through vite.spike.config.mjs
/**
 * Current-library scenario runner (@canard/schema-form v0.16.0, src/core).
 * ONE case per process, same as `run-proto.mjs`.
 *
 *   cd <package dir> && vite-node --config vite.spike.config.mjs run-current.ts <case>
 *
 * Three lanes, because the current write path is split in time:
 *   write   — synchronous `setValue`, reading the written leaf back
 *   emit    — `setValue` then `root.value`, which is where ObjectNode's lazy
 *             `__composed__` actually rebuilds the emitted object. This is the
 *             lane comparable to the prototype's `flush()`.
 *   drain   — plus a macrotask drain, so the debounced root `onChange` runs.
 *             Amortized over K writes, as `bench/event-cascade.bench.ts` does,
 *             because one drain is dominated by the ~1 ms timer floor.
 */
import { nodeFromJSONSchema } from '@/schema-form/core';

import { measure, measureAsync, report } from './harness.mjs';

const CASE = process.argv[2];
const N_FLAT = 1000;
const N_ITEMS = 10000;
const ITEM_FIELDS = 5;
const N_FRAG = 200;
const N_FLAT_SMALL = 600;
const DRAIN_BATCH = 100;

const noop = () => {};
const drain = () => new Promise<void>((r) => setTimeout(r, 0));

const flatSchema = (n: number) =>
  ({
    type: 'object',
    properties: Object.fromEntries(
      Array.from({ length: n }, (_, i) => [`f${i}`, { type: 'string', default: `v${i}` }]),
    ),
  }) as any;

const itemsSchema = (fields: number) =>
  ({
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: Object.fromEntries(
            Array.from({ length: fields }, (_, f) => [`f${f}`, { type: 'string' }]),
          ),
        },
      },
    },
  }) as any;

const itemsDefault = (n: number, fields: number) => ({
  items: Array.from({ length: n }, (_, i) =>
    Object.fromEntries(Array.from({ length: fields }, (_, f) => [`f${f}`, `v${i}_${f}`])),
  ),
});

/**
 * Closest analogue today to the redesign's independent fragments.
 * `oneOf` branches are mutually exclusive, so 200 INDEPENDENT root conditionals
 * are NOT expressible as branches. `computed.active` is, but it takes one
 * expression per field — 600 expressions where the redesign has 200 guards.
 */
const conditionalSchema = (n: number, frags: number) => {
  const properties: Record<string, any> = {};
  for (let i = 0; i < n; i++) properties[`f${i}`] = { type: 'string', default: `v${i}` };
  for (let i = 0; i < frags; i++) {
    properties[`d${i}`] = { type: 'string', default: 'off' };
    for (let j = 0; j < 3; j++)
      properties[`c${i}_${j}`] = {
        type: 'string',
        default: `d${i}_${j}`,
        computed: { active: `../d${i} === "on"`, watch: [`../d${i}`] },
      };
  }
  return { type: 'object', properties } as any;
};

const build = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue, onChange: noop }) as any;

/** Build, then let construction settle before anything is measured. */
const ready = async (jsonSchema: any, defaultValue?: any) => {
  const node = build(jsonSchema, defaultValue);
  await drain();
  await drain();
  return node;
};

/** The `write` and `emit` lanes for one target inside one tree. */
function syncLanes(
  label: string,
  shape: string,
  root: any,
  target: any,
  extra: Record<string, unknown> = {},
) {
  report(
    measure({
      name: `${label} — WRITE lane: setValue only`,
      op: (i) => {
        target.setValue(`k${i & 1023}`);
        return target.value;
      },
    }),
    { case: CASE, lane: 'write', shape, ...extra },
  );
  report(
    measure({
      name: `${label} — EMIT lane: setValue + root.value`,
      op: (i) => {
        target.setValue(`m${i & 1023}`);
        return root.value;
      },
      samples: 9,
    }),
    { case: CASE, lane: 'emit', shape, ...extra },
  );
}

/** The drained lane, amortized over `K` writes to distinct targets. */
async function drainLane(
  label: string,
  shape: string,
  root: any,
  targets: any[],
  K = DRAIN_BATCH,
) {
  const r = await measureAsync({
    name: `${label} — DRAIN lane: ${K} writes + 1 drain`,
    op: async (i) => {
      for (let k = 0; k < K; k++) targets[k % targets.length].setValue(`d${i}_${k}`);
      await drain();
      return root.value;
    },
    samples: 9,
  });
  report(r, { case: CASE, lane: 'drain', shape, K, perOpNs: r.medianNs / K });
}

const cases: Record<string, () => Promise<void>> = {
  async 's1-same'() {
    const root = await ready(flatSchema(N_FLAT));
    syncLanes('S1a same field (flat 1000)', `flat ${N_FLAT}`, root, root.find('f500'));
  },

  async 's1-drain'() {
    const root = await ready(flatSchema(N_FLAT));
    const targets = Array.from({ length: DRAIN_BATCH }, (_, i) => root.find(`f${i}`));
    await drainLane('S1a (flat 1000)', `flat ${N_FLAT}`, root, targets);
  },

  async 's1-random'() {
    const root = await ready(flatSchema(N_FLAT));
    const targets = Array.from({ length: N_FLAT }, (_, i) => root.find(`f${i}`));
    report(
      measure({
        name: 'S1b random fields — WRITE lane',
        op: (i) => {
          const t = targets[(i * 7919) % N_FLAT];
          t.setValue(`k${i & 1023}`);
          return t.value;
        },
      }),
      { case: CASE, lane: 'write', shape: `flat ${N_FLAT}` },
    );
    report(
      measure({
        name: 'S1b random fields — EMIT lane',
        op: (i) => {
          targets[(i * 7919) % N_FLAT].setValue(`m${i & 1023}`);
          return root.value;
        },
        samples: 9,
      }),
      { case: CASE, lane: 'emit', shape: `flat ${N_FLAT}` },
    );
  },

  async 's2'() {
    const t0 = process.hrtime.bigint();
    const root = await ready(itemsSchema(ITEM_FIELDS), itemsDefault(N_ITEMS, ITEM_FIELDS));
    const buildMs = Number(process.hrtime.bigint() - t0) / 1e6;
    const target = root.find('/items/5000/f2');
    if (!target) throw new Error('find(/items/5000/f2) returned null');
    syncLanes(
      'S2 /items/5000/f2 (10000 x 5)',
      `array ${N_ITEMS} x ${ITEM_FIELDS}`,
      root,
      target,
      { buildMs },
    );
  },

  async 's2-drain'() {
    const root = await ready(itemsSchema(ITEM_FIELDS), itemsDefault(N_ITEMS, ITEM_FIELDS));
    const targets = Array.from({ length: DRAIN_BATCH }, (_, i) =>
      root.find(`/items/${5000 + i}/f2`),
    );
    await drainLane(
      'S2 (10000 x 5)',
      `array ${N_ITEMS} x ${ITEM_FIELDS}`,
      root,
      targets,
    );
  },

  async 's3a'() {
    const t0 = process.hrtime.bigint();
    const root = await ready(conditionalSchema(N_FLAT_SMALL, N_FRAG));
    const buildMs = Number(process.hrtime.bigint() - t0) / 1e6;
    syncLanes(
      'S3a unrelated field (600 + 600 active exprs)',
      `flat ${N_FLAT_SMALL} + ${N_FRAG} groups`,
      root,
      root.find('f500'),
      { buildMs },
    );
  },

  async 's3b'() {
    const root = await ready(conditionalSchema(N_FLAT_SMALL, N_FRAG));
    const d = root.find('d7');
    report(
      measure({
        name: 'S3b flip discriminator — EMIT lane (600 + 600 active exprs)',
        op: (i) => {
          d.setValue(i & 1 ? 'on' : 'off');
          return root.value;
        },
        samples: 9,
      }),
      { case: CASE, lane: 'emit', shape: `flat ${N_FLAT_SMALL} + ${N_FRAG} groups` },
    );
    report(
      await measureAsync({
        name: 'S3b flip discriminator + drain (600 + 600 active exprs)',
        op: async (i) => {
          d.setValue(i & 1 ? 'on' : 'off');
          await drain();
          return root.value;
        },
        samples: 9,
      }),
      { case: CASE, lane: 'drain-single', shape: `flat ${N_FLAT_SMALL} + ${N_FRAG} groups` },
    );
  },

  async 's4-flat'() {
    const root = await ready(flatSchema(N_FLAT));
    const values = Array.from({ length: 8 }, (_, s) =>
      Object.fromEntries(Array.from({ length: N_FLAT }, (_, i) => [`f${i}`, `b${s}_${i}`])),
    );
    report(
      measure({
        name: 'S4a root setValue whole object — EMIT lane (flat 1000)',
        op: (i) => {
          root.setValue(values[i & 7]);
          return root.value;
        },
        samples: 9,
      }),
      { case: CASE, lane: 'emit', shape: `flat ${N_FLAT}` },
    );
    report(
      await measureAsync({
        name: 'S4a root setValue whole object + drain (flat 1000)',
        op: async (i) => {
          root.setValue(values[i & 7]);
          await drain();
          return root.value;
        },
        samples: 9,
      }),
      { case: CASE, lane: 'drain-single', shape: `flat ${N_FLAT}` },
    );
  },

  async 's4-items'() {
    const root = await ready(itemsSchema(ITEM_FIELDS), itemsDefault(N_ITEMS, ITEM_FIELDS));
    const values = Array.from({ length: 4 }, (_, s) => ({
      items: Array.from({ length: N_ITEMS }, (_, i) =>
        Object.fromEntries(
          Array.from({ length: ITEM_FIELDS }, (_, f) => [`f${f}`, `b${s}_${i}_${f}`]),
        ),
      ),
    }));
    report(
      await measureAsync({
        name: 'S4b root setValue whole array + drain (10000 x 5)',
        op: async (i) => {
          root.setValue(values[i & 3]);
          await drain();
          return root.value;
        },
        samples: 7,
      }),
      { case: CASE, lane: 'drain-single', shape: `array ${N_ITEMS} x ${ITEM_FIELDS}` },
    );
  },

  async 's5'() {
    const root = await ready(flatSchema(N_FLAT));
    const targets = Array.from({ length: N_FLAT }, (_, i) => root.find(`f${i}`));
    const batched = await measureAsync({
      name: 'S5a 1000 setValue distinct fields + ONE drain (flat 1000)',
      op: async (i) => {
        for (let k = 0; k < N_FLAT; k++) targets[k].setValue(`b${i & 7}_${k}`);
        await drain();
        return root.value;
      },
      samples: 9,
    });
    report(batched, {
      case: CASE,
      lane: 'batch',
      shape: `flat ${N_FLAT}`,
      K: N_FLAT,
      perOpNs: batched.medianNs / N_FLAT,
    });
    const unbatched = await measureAsync({
      name: 'S5b 1000 setValue, a drain EACH (flat 1000)',
      op: async (i) => {
        for (let k = 0; k < N_FLAT; k++) {
          targets[k].setValue(`u${i & 7}_${k}`);
          await drain();
        }
        return root.value;
      },
      samples: 7,
    });
    report(unbatched, {
      case: CASE,
      lane: 'unbatched',
      shape: `flat ${N_FLAT}`,
      K: N_FLAT,
      perOpNs: unbatched.medianNs / N_FLAT,
    });
  },

  async 's6-flat'() {
    report(
      measure({
        name: 'S6a nodeFromJSONSchema flat 1000',
        op: () => build(flatSchema(N_FLAT)).value,
        samples: 9,
      }),
      { case: CASE, shape: `flat ${N_FLAT}` },
    );
  },

  async 's6-items'() {
    const schema = itemsSchema(ITEM_FIELDS);
    const def = itemsDefault(N_ITEMS, ITEM_FIELDS);
    report(
      measure({
        name: 'S6b nodeFromJSONSchema array 10000 x 5',
        op: () => build(schema, def).value,
        samples: 7,
        warmupMs: 2500,
      }),
      { case: CASE, shape: `array ${N_ITEMS} x ${ITEM_FIELDS}` },
    );
  },

  async 's6-cond'() {
    const schema = conditionalSchema(N_FLAT_SMALL, N_FRAG);
    report(
      measure({
        name: 'S6d nodeFromJSONSchema 600 + 600 active exprs',
        op: () => build(schema).value,
        samples: 9,
        warmupMs: 2500,
      }),
      { case: CASE, shape: `flat ${N_FLAT_SMALL} + ${N_FRAG} groups` },
    );
  },

  /** S7: what a read costs today, settled and with a child write pending. */
  async 's7'() {
    const root = await ready(itemsSchema(ITEM_FIELDS), itemsDefault(N_ITEMS, ITEM_FIELDS));
    const items = root.find('items');
    const mid = root.find('/items/5000');
    const leafNode = root.find('/items/5000/f2');
    leafNode.setValue('settled');
    await drain();
    void root.value;

    for (const [label, node] of [
      ['S7a root.value (settled)', root],
      ['S7b items.value (settled)', items],
      ['S7c mid object.value (settled)', mid],
      ['S7d leaf.value (settled)', leafNode],
    ] as const) {
      report(measure({ name: label, op: () => (node as any).value }), {
        case: CASE,
        read: label,
      });
    }
    report(
      measure({
        name: 'S7e root.value with a child write PENDING (recompose)',
        op: (i) => {
          leafNode.setValue(`p${i & 1023}`);
          return root.value;
        },
        samples: 9,
      }),
      { case: CASE, read: 'root-pending' },
    );

    const a = root.value;
    process.stderr.write(
      `  two settled root reads same reference: ${a === root.value}\n`,
    );
    leafNode.setValue('moved');
    const c = root.value;
    process.stderr.write(
      `  root.value after a pending write moved its reference: ${c !== a}\n` +
        `  two reads while pending same reference: ${c === root.value}\n`,
    );
  },
};

const run = cases[CASE];
if (!run) {
  process.stderr.write(
    `unknown case: ${CASE}\navailable: ${Object.keys(cases).join(', ')}\n`,
  );
  process.exit(2);
}
await run();
process.exit(0);
