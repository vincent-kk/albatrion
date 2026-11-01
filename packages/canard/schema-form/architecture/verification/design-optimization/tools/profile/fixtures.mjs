// Scenario fixtures shared by run.mjs and compare.mjs; mirrors bench/legacy-compare and event-cascade.bench.ts.
const noop = () => {};
export let sink = 0;

function seed(cur) {
  return {
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,
    latentRaw: new cur.PathKeyedMap('pair'),
    misfitPaths: new cur.PathKeyedSet(),
    inactiveValuesMemo: new cur.PathKeyedMap('path'),
  };
}
function materialize(root) {
  // same walk as loadDistEngine.materializeMountedValues
  const stack = [{ node: root, leave: false }];
  const seen = new Set();
  while (stack.length) {
    const { node, leave } = stack.pop();
    if (leave) {
      void node.value;
      continue;
    }
    if (seen.has(node)) continue;
    seen.add(node);
    stack.push({ node, leave: true });
    const ch = node.children;
    for (let i = (ch?.length ?? 0) - 1; i >= 0; i--) {
      const c = ch[i];
      const cand =
        c !== null && typeof c === 'object' && 'node' in c ? c.node : c;
      if (cand !== null && typeof cand === 'object' && 'value' in cand)
        stack.push({ node: cand, leave: false });
    }
  }
  return root;
}
function flat(count, mixed) {
  const properties = {};
  const value = {};
  for (let i = 0; i < count; i++) {
    const type = mixed ? ['number', 'string', 'boolean'][i % 3] : 'number';
    properties[`field_${i}`] = { type };
    value[`field_${i}`] =
      type === 'number' ? i : type === 'string' ? String(i) : i % 2 === 0;
  }
  return { schema: { type: 'object', properties }, value };
}
function oneOfSchema(pad, legacy, distinct = false) {
  const cond = (v) =>
    legacy
      ? { computed: { if: `./type === '${v}'` } }
      : { controls: { active: `./type === '${v}'` } };
  const k = (v, n) => (distinct ? `${v}_${n}` : n);
  const properties = {
    type: { type: 'string', enum: ['a', 'b'], default: 'a' },
  };
  for (let i = 0; i < pad; i++)
    properties[`pad_${i}`] = { type: 'number', default: i };
  return {
    type: 'object',
    properties,
    oneOf: [
      {
        ...cond('a'),
        properties: {
          [k('a', 'x')]: { type: 'string', default: 'A' },
          [k('a', 'y')]: { type: 'number', default: 1 },
        },
      },
      {
        ...cond('b'),
        properties: {
          [k('b', 'x')]: { type: 'string', default: 'B' },
          [k('b', 'y')]: { type: 'number', default: 2 },
        },
      },
    ],
  };
}
const microtasks = async () => {
  for (let k = 0; k < 8; k++) await Promise.resolve();
};

export function setup(scenario, engine, mods) {
  const cur = engine === 'current' ? mods.current : null;
  const leg = engine === 'legacy' ? mods.legacy : null;
  if (scenario === 'mount' || scenario === 'mount-bp') {
    const { schema, value } = flat(10000, true);
    if (cur) {
      const analysis = cur.blueprint(schema);
      return () => {
        const root = cur.fieldNodeFactory(
          scenario === 'mount-bp' ? cur.blueprint(schema) : analysis,
          seed(cur),
        );
        cur.loadFieldNodeAtMount(root, value, cur.SetValueOption.Overwrite);
        if (root.children.length !== 10000) throw new Error('mount fixture');
        sink += 1;
      };
    }
    return () => {
      const root = materialize(
        leg.legacyNodeFromJSONSchema({
          jsonSchema: schema,
          defaultValue: value,
          onChange: noop,
        }),
      );
      if (root.children.length !== 10000)
        throw new Error('legacy mount fixture');
      sink += 1;
    };
  }
  if (scenario.startsWith('switch')) {
    const pad = scenario === 'switch-wide' ? 1000 : 0;
    const distinct = scenario === 'switch-distinct';
    // current engine shares same-key branch fields (x keeps its value); verify the discriminator and, for distinct keys, the active branch key
    const check = (root, toggle) => {
      const v = root.value;
      const t = toggle ? 'b' : 'a';
      if (
        v.type !== t ||
        (distinct && !(`${t}_x` in v)) ||
        (distinct && `${toggle ? 'a' : 'b'}_x` in v)
      )
        throw new Error(
          `switch did not commit: ${JSON.stringify(v).slice(0, 120)}`,
        );
    };
    let toggle = false;
    if (cur) {
      const root = cur.buildFieldNodeTree({
        jsonSchema: oneOfSchema(pad, false, distinct),
        onChange: noop,
      });
      cur.mountFieldNode(root, undefined, undefined, {
        deferValidation: false,
      });
      materialize(root);
      return () => {
        toggle = !toggle;
        root.find('type').setValue(toggle ? 'b' : 'a');
        check(root, toggle);
        sink += 1;
      };
    }
    const root = materialize(
      leg.legacyNodeFromJSONSchema({
        jsonSchema: oneOfSchema(pad, true, distinct),
        onChange: noop,
      }),
    );
    return async () => {
      toggle = !toggle;
      root.find('type').setValue(toggle ? 'b' : 'a');
      await microtasks();
      check(root, toggle);
      sink += 1;
    };
  }
  if (scenario === 'leaf-wide' || scenario === 'leaf-wide-oneof') {
    // one leaf write beside 4,000 sibling number fields, with or without a root oneOf
    const schema = oneOfSchema(4000, !cur, false);
    if (scenario === 'leaf-wide') delete schema.oneOf;
    let c = 0;
    if (cur) {
      const root = cur.buildFieldNodeTree({
        jsonSchema: schema,
        onChange: noop,
      });
      cur.mountFieldNode(root, undefined, undefined, {
        deferValidation: false,
      });
      const leaf = root.find('pad_7');
      return () => {
        leaf.setValue(++c);
        if (root.value.pad_7 !== c) throw new Error('leaf');
        sink += 1;
      };
    }
    const root = leg.legacyNodeFromJSONSchema({
      jsonSchema: schema,
      onChange: noop,
    });
    const leaf = root.find('pad_7');
    return async () => {
      leaf.setValue(++c);
      await microtasks();
      if (root.value.pad_7 !== c) throw new Error('legacy leaf');
      sink += 1;
    };
  }
  if (scenario === 'wave') {
    const props = {};
    for (let i = 0; i < 1000; i++) props[`field_${i}`] = { type: 'number' };
    const schema = { type: 'object', properties: props };
    const wv = (v) => {
      const r = {};
      for (let i = 0; i < 1000; i++) r[`field_${i}`] = v;
      return r;
    };
    const values = [wv(0), wv(1)];
    let deliveries = 0;
    let next = 0;
    if (cur) {
      const root = cur.fieldNodeFactory(cur.blueprint(schema), seed(cur));
      cur.dispatchMount(root, wv(0));
      if (root.children.length !== 1000) throw new Error('wave fixture');
      for (const c of root.children)
        c.subscribe(() => {
          deliveries++;
        });
      return () => {
        next = 1 - next;
        const before = deliveries;
        root.setValue(values[next]);
        if (deliveries - before !== 1000)
          throw new Error(`wave delivered ${deliveries - before}`);
        sink += 1;
      };
    }
    const root = leg.legacyNodeFromJSONSchema({
      jsonSchema: schema,
      onChange: noop,
      defaultValue: wv(0),
    });
    const ch = root.children.map((c) => c.node);
    if (ch.length !== 1000) throw new Error('legacy wave fixture');
    for (const c of ch)
      c.subscribe(() => {
        deliveries++;
      });
    return async () => {
      next = 1 - next;
      const before = deliveries;
      root.setValue(values[next]);
      await microtasks();
      if (deliveries - before < 1000)
        throw new Error(`legacy wave delivered ${deliveries - before}`);
      sink += 1;
    };
  }
  throw new Error(`unknown scenario ${scenario}`);
}
