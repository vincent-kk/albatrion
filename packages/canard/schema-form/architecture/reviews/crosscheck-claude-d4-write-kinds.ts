// D-4 evidence: what each current SetValueOption preset does to an object/array.
// Run: cd packages/canard/schema-form && node /Users/Vincent/Workspace/albatrion/node_modules/.bin/vite-node \
//   --config architecture/spikes/work-loop/vite.spike.config.mjs architecture/reviews/crosscheck-claude-d4-write-kinds.ts
import {
  NodeEventType,
  SetValueOption,
  nodeFromJSONSchema,
} from '@/schema-form/core';

const tick = () => new Promise((r) => setTimeout(r, 0));

// Same bits as src/components/SchemaNode/SchemaNodeInput/type.ts:33-37
const HANDLE_CHANGE_OPTION =
  SetValueOption.Replace |
  SetValueOption.Propagate |
  SetValueOption.EmitChange |
  SetValueOption.PublishUpdateEvent;

const objectSchema = {
  type: 'object',
  properties: { a: { type: 'number' }, b: { type: 'number' } },
} as const;

const make = async (jsonSchema: any, defaultValue: any) => {
  const emitted: any[] = [];
  const root: any = nodeFromJSONSchema({
    jsonSchema,
    defaultValue,
    onChange: (v: any) => emitted.push(v),
  });
  await tick();
  const refresh: Record<string, number> = {};
  const inject: string[] = [];
  const watch = (n: any) => {
    n.subscribe(({ type, options }: any) => {
      if (type & NodeEventType.RequestRefresh)
        refresh[n.path] = (refresh[n.path] ?? 0) + 1;
      if (type & NodeEventType.UpdateValue)
        inject.push(`${n.path}:${options?.[NodeEventType.UpdateValue]?.inject}`);
    });
    for (const c of n.children ?? []) watch(c.node);
  };
  watch(root);
  return { root, emitted, refresh, inject };
};

const options: Array<[string, number | undefined]> = [
  ['(none)', undefined],
  ['Default', SetValueOption.Default],
  ['HANDLE_CHANGE_OPTION', HANDLE_CHANGE_OPTION],
  ['Merge', SetValueOption.Merge],
  ['Overwrite', SetValueOption.Overwrite],
];

console.log('== 1. branch object {a:1,b:2}; setValue({a:9}, opt) ==');
for (const [label, opt] of options) {
  const { root, refresh } = await make(objectSchema, { a: 1, b: 2 });
  if (opt === undefined) root.setValue({ a: 9 });
  else root.setValue({ a: 9 }, opt);
  await tick();
  console.log(
    JSON.stringify({
      option: label,
      value: root.value,
      b: root.find('/b').value,
      refresh,
    }),
  );
}

console.log('== 2. branch object with extra key x; setValue({a:9}, opt) ==');
for (const [label, opt] of options) {
  const { root } = await make(objectSchema, { a: 1, b: 2, x: 'extra' });
  const before = root.value;
  if (opt === undefined) root.setValue({ a: 9 });
  else root.setValue({ a: 9 }, opt);
  await tick();
  console.log(JSON.stringify({ option: label, before, after: root.value }));
}

console.log('== 3. extras vs Normalize (StableReset) ==');
{
  const { root } = await make(objectSchema, { a: 1, b: 2, x: 'extra' });
  const loaded = root.value;
  root.setValue({ a: 5, x: 'extra2' }, SetValueOption.Merge);
  await tick();
  const merged = root.value;
  root.resetSubtree();
  await tick();
  console.log(
    JSON.stringify({ loaded, afterMergeWithExtra: merged, afterResetSubtree: root.value }),
  );
}

console.log('== 3b. Normalize bit isolated: setValue({a:1,x:"e"}, opt) ==');
for (const [label, opt] of [
  ['Overwrite', SetValueOption.Overwrite],
  ['Reset', SetValueOption.Reset],
  ['StableReset (= Reset|Refresh|Normalize)', SetValueOption.StableReset],
  ['Overwrite|Normalize', SetValueOption.Overwrite | SetValueOption.Normalize],
] as Array<[string, number]>) {
  const { root } = await make(objectSchema, { a: 0, b: 2 });
  root.setValue({ a: 1, x: 'e' }, opt);
  await tick();
  console.log(JSON.stringify({ option: label, value: root.value }));
}

console.log('== 4. terminal object (terminal:true) {a:1,b:2}; setValue({a:9}, opt) ==');
for (const [label, opt] of options) {
  const { root } = await make({ ...objectSchema, terminal: true }, { a: 1, b: 2 });
  if (opt === undefined) root.setValue({ a: 9 });
  else root.setValue({ a: 9 }, opt);
  await tick();
  console.log(JSON.stringify({ option: label, value: root.value }));
}

console.log('== 5. branch array [1,2,3] (items object); setValue([{v:9}], opt) ==');
const arraySchema = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: { type: 'object', properties: { v: { type: 'number' } } },
    },
  },
};
for (const [label, opt] of options) {
  const { root } = await make(arraySchema, { list: [{ v: 1 }, { v: 2 }, { v: 3 }] });
  const list = root.find('/list');
  if (opt === undefined) list.setValue([{ v: 9 }]);
  else list.setValue([{ v: 9 }], opt);
  await tick();
  console.log(JSON.stringify({ option: label, value: root.value }));
}

console.log('== 6. leaf write /a with HANDLE_CHANGE_OPTION (what an input sends) ==');
{
  const { root, refresh, emitted } = await make(objectSchema, { a: 1, b: 2 });
  const n = emitted.length;
  root.find('/a').setValue(9, HANDLE_CHANGE_OPTION);
  await tick();
  console.log(
    JSON.stringify({ value: root.value, refresh, rootOnChange: emitted.slice(n) }),
  );
}

console.log('== 7. injectTo: user write vs resetSubtree (PreventInjection) ==');
{
  const schema = {
    type: 'object',
    properties: {
      a: {
        type: 'number',
        default: 1,
        injectTo: (value: number) => ({ '../b': value * 10 }),
      },
      b: { type: 'number' },
    },
  };
  const { root } = await make(schema, undefined);
  const initial = root.value;
  root.find('/a').setValue(3, HANDLE_CHANGE_OPTION);
  await tick();
  const afterUser = root.value;
  root.find('/b').setValue(99, HANDLE_CHANGE_OPTION);
  await tick();
  const afterB = root.value;
  root.resetSubtree();
  await tick();
  console.log(
    JSON.stringify({ initial, afterUserA3: afterUser, afterB99: afterB, afterResetSubtree: root.value }),
  );
}

console.log('== 8. Automatic: null parent, derived child ==');
{
  const schema = {
    type: 'object',
    properties: {
      p: {
        type: 'object',
        nullable: true,
        properties: { q: { type: 'string', default: 'dq' } },
      },
    },
  };
  const { root } = await make(schema, { p: null });
  const initial = root.value;
  root.find('/p/q').setValue('user', HANDLE_CHANGE_OPTION);
  await tick();
  const afterUser = root.value;
  const auto = await make(schema, { p: null });
  auto.root
    .find('/p/q')
    .setValue('auto', HANDLE_CHANGE_OPTION | SetValueOption.Automatic);
  await tick();
  console.log(
    JSON.stringify({
      initial,
      afterUserWriteIntoNullParent: afterUser,
      afterAutomaticWriteIntoNullParent: auto.root.value,
      qNodeValue: auto.root.find('/p/q').value,
    }),
  );
}
