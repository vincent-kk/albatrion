// @ts-nocheck — throwaway crosscheck outside tsconfig `include`; `@/schema-form` resolves through spikes/work-loop/vite.spike.config.mjs
/**
 * D-5 crosscheck: what does the CURRENT core do with schema `default` when a
 * `defaultValue` (loaded record) is given? Which keys are filled, which are left
 * alone, and does anything mark nodes dirty/touched?
 *
 *   cd packages/canard/schema-form && \
 *   node ../../../node_modules/.bin/vite-node \
 *     --config architecture/spikes/work-loop/vite.spike.config.mjs \
 *     architecture/reviews/crosscheck-claude-d5-load-defaults.ts
 */
import { NodeState, nodeFromJSONSchema } from '@/schema-form/core';

const drain = () => new Promise<void>((r) => setTimeout(r, 0));
const show = (v: unknown) =>
  v === undefined ? 'undefined' : JSON.stringify(v, (_k, x) => (x === undefined ? '<undef>' : x));

const stateOf = (node: any) => ({
  dirty: node?.state?.[NodeState.Dirty] ?? false,
  touched: node?.state?.[NodeState.Touched] ?? false,
  raw: show(node?.state),
});

async function run(label: string, jsonSchema: any, defaultValue: any, after?: (root: any) => Promise<void>) {
  const calls: string[] = [];
  const input = defaultValue === undefined ? undefined : { ...defaultValue };
  const inputBefore = show(input);
  const root: any = nodeFromJSONSchema({
    jsonSchema,
    defaultValue: input,
    onChange: (v: any) => calls.push(show(v)),
  });
  const syncValue = show(root.value);
  await drain();
  await drain();
  const a = root.find('/a');
  const out: Record<string, unknown> = {
    case: label,
    loaded: inputBefore,
    rootValueSync: syncValue,
    rootValue: show(root.value),
    normalizedValue: show(root.normalizedValue),
    aValue: a ? show(a.value) : '(no node)',
    aDefaultValue: a ? show(a.defaultValue) : '(no node)',
    rootDefaultValue: show(root.defaultValue),
    aState: a ? stateOf(a) : '(no node)',
    rootState: stateOf(root),
    globalState: show(root.globalState),
    onChangeCalls: calls,
    loadedObjectMutated: show(input) !== inputBefore ? `YES -> ${show(input)}` : 'no',
  };
  if (after) {
    await after(root);
    out.after = {
      rootValue: show(root.value),
      onChangeCalls: calls,
      globalState: show(root.globalState),
    };
  }
  console.log(JSON.stringify(out, null, 2));
}

const branch = {
  type: 'object',
  properties: { a: { type: 'string', default: 'A' }, b: { type: 'string' } },
};
const branchNullable = {
  type: 'object',
  properties: { a: { type: ['string', 'null'], default: 'A' }, b: { type: 'string' } },
};
const branchKeepEmpty = {
  type: 'object',
  properties: {
    a: { type: 'string', default: 'A', options: { omitEmpty: false } },
    b: { type: 'string' },
  },
};
const terminal = { ...branch, terminal: true };
const rootDefault = { ...branch, default: { a: 'ROOT-A', b: 'ROOT-B' } };
const conditional = {
  type: 'object',
  properties: {
    a: { type: 'string', default: 'A' },
    b: { type: 'string' },
    c: { type: 'string', default: 'C', computed: { active: '../b === "on"' } },
  },
};

// 1–5: BranchStrategy object (the normal case)
await run('branch / empty form (no defaultValue)', branch, undefined);
await run('branch / {b:"x"} (a absent)', branch, { b: 'x' });
await run('branch / {a:"", b:"x"}', branch, { a: '', b: 'x' });
await run('branch / {a:"", b:"x"} with a.options.omitEmpty=false', branchKeepEmpty, { a: '', b: 'x' });
await run('branch / {a:null, b:"x"} (a non-nullable string)', branch, { a: null, b: 'x' });
await run('branch / {a:null, b:"x"} (a nullable string)', branchNullable, { a: null, b: 'x' });
await run('branch / {a:undefined, b:"x"} (key present, value undefined)', branch, { a: undefined, b: 'x' });
await run('branch / {b:"x", extra:1} (undeclared key)', branch, { b: 'x', extra: 1 });
// 6: root schema default vs given defaultValue
await run('branch + root schema default / empty form', rootDefault, undefined);
await run('branch + root schema default / {b:"x"}', rootDefault, { b: 'x' });
// 7: TerminalStrategy object (getObjectDefaultValue path)
await run('terminal / {b:"x"}', terminal, { b: 'x' });
await run('terminal / {a:"", b:"x"}', terminal, { a: '', b: 'x' });
await run('terminal / {a:null, b:"x"}', terminal, { a: null, b: 'x' });
await run('terminal / {a:undefined, b:"x"}', terminal, { a: undefined, b: 'x' });
// 8: first activation of a conditional (computed.active) field whose key is absent from the load
await run('conditional / {b:"x"} then b := "on"', conditional, { b: 'x' }, async (root) => {
  root.find('/b').setValue('on');
  await drain();
  await drain();
});
await run('conditional / {b:"x", c:"loaded"} then b := "on"', conditional, { b: 'x', c: 'loaded' }, async (root) => {
  root.find('/b').setValue('on');
  await drain();
  await drain();
});
// 9: nested object present as null / {} in the load, child carries a default
const nested = (terminal: boolean, nullable: boolean) => ({
  type: 'object',
  properties: {
    a: {
      type: nullable ? ['object', 'null'] : 'object',
      ...(terminal ? { terminal: true } : {}),
      properties: { c: { type: 'string', default: 'C' } },
    },
  },
});
await run('nested branch nullable / {a:null}', nested(false, true), { a: null });
await run('nested branch non-nullable / {a:null}', nested(false, false), { a: null });
await run('nested branch / {a:{}}', nested(false, false), { a: {} });
await run('nested terminal nullable / {a:null}', nested(true, true), { a: null });
await run('nested terminal / {a:{}}', nested(true, false), { a: {} });
// 10: oneOf branch — absent key in the initially active branch, and first activation of another branch
const oneOf = {
  type: 'object',
  properties: { category: { type: 'string', enum: ['movie', 'console'], default: 'movie' } },
  oneOf: [
    { computed: { if: "./category === 'movie'" }, properties: { moviePrice: { type: 'number' } } },
    { computed: { if: "./category === 'console'" }, properties: { consolePrice: { type: 'number', default: 100 } } },
  ],
};
await run('oneOf / {category:"console"} (active-branch key absent)', oneOf, { category: 'console' });
await run('oneOf / {category:"movie", moviePrice:75} then category := "console"', oneOf, { category: 'movie', moviePrice: 75 }, async (root) => {
  root.find('/category').setValue('console');
  await drain();
  await drain();
});
process.exit(0);
