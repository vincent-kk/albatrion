/** Schema adapter for the spike. Functions stand in for parsed reserved expressions. */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { attach, leaf, object, array, declareFragments, declareInjections,
  declareDerived, configureSchema, controlOption, prime } from './loop-v6.mjs';

// Same installed AJV and options as round8/proto/build-v4e.mjs; no installation.
const require = createRequire(fileURLToPath(new URL('../../../../../schema-form-ajv8-plugin/package.json', import.meta.url)));
const Ajv2020 = require('ajv/dist/2020').default;
export const ajv = new Ajv2020({ allErrors: false, strict: false });
const evaluate = (expr, value) => typeof expr === 'function' ? expr(value) : expr;
const at = (value, path) => path.reduce((v, key) => v?.[key], value) ?? {};

/** Build declarations without examining const/enum or choosing union branches. */
export function buildSchema(schema, value, options = {}) {
  const pending = [];
  const order = declarationOrder(schema);
  const warnings = [];
  const pureUnionDeclarations = new Map();
  const make = (name, definition, path) => {
    const node = definition.type === 'object' || definition.properties || definition.oneOf || definition.anyOf || definition.allOf || definition.if
      ? object(name) : definition.type === 'array' ? array(name, i => make(i, definition.items ?? {}, [...path, i])) : leaf(name);
    node.schema = definition;
    node.clearOrder = order.get(definition)?.clearValue ?? -1;
    node.effectiveSchema = definition;
    node.defaultValue = definition.default;
    node.expressionDefault = controlOption(definition, 'default');
    node.clearExpression = controlOption(definition, 'clearValue');
    pending.push(node);
    if (node.kind === 'object') populate(node, definition, path);
    return node;
  };
  const populate = (host, definition, path) => {
    const fragments = [];
    const collect = (part, parent, inheritedWhen, id, scopes = [], pureUnionGroup = null) => {
      if (!part || typeof part !== 'object') return;
      const active = controlOption(part, 'active');
      const localWhen = G => active === undefined || !!evaluate(active, G);
      const when = rootValue => inheritedWhen(rootValue) && localWhen(at(rootValue, path));
      const fragment = parent ?? { id, guard: localWhen, declares: [], defaults: {}, expressionDefaults: {}, children: [] };
      for (const [key, childSchema] of Object.entries(part.properties ?? {})) {
        if (childSchema === false) continue;
        let child = host.index.get(key);
        if (!child) child = attach(host, make(key, childSchema === true ? {} : childSchema, [...path, key]));
        if (pureUnionGroup !== null) {
          const groups = pureUnionDeclarations.get(child) ?? new Map();
          const count = (groups.get(pureUnionGroup) ?? 0) + 1;
          groups.set(pureUnionGroup, count);
          pureUnionDeclarations.set(child, groups);
          if (count >= 2) child.effectiveSchema = { branchConstraintsOmitted: true };
        }
        if (id === 'base') child.unconditional = true;
        else {
          fragment.declares.push(key);
          if (Object.hasOwn(childSchema, 'default')) fragment.defaults[key] = childSchema.default;
          const expression = controlOption(childSchema, 'default');
          if (expression !== undefined) fragment.expressionDefaults[key] = expression;
          child.controlLayers.push(...scopes, { schema: part, when });
        }
      }
      const nested = [];
      for (const keyword of ['allOf', 'oneOf', 'anyOf']) {
        for (const [index, branch] of (part[keyword] ?? []).entries()) {
          if (!branch || typeof branch !== 'object') continue;
          if (keyword !== 'allOf' && branch.if !== undefined && branch.else !== false && options.dev) {
            warnings.push({ code: 'missing-else-false', path: '/' + path.join('/'), keyword, index });
          }
          const guard = keyword !== 'allOf' && branch.if !== undefined ? ajv.compile(branch.if) : () => true;
          const reserved = controlOption(branch, 'active');
          const gate = G => guard(G) && (reserved === undefined || !!evaluate(reserved, G));
          const f = { id: `${id}/${keyword}/${index}`, guard: gate, declares: [], defaults: {}, expressionDefaults: {}, children: [] };
          const pureUnionGroup = keyword !== 'allOf' && branch.if === undefined && reserved === undefined ? `${id}/${keyword}` : null;
          collect(branch, f, rootValue => when(rootValue) && gate(at(rootValue, path)), f.id, [...scopes, { schema: part, when }], pureUnionGroup);
          nested.push(f);
        }
      }
      if (part.if !== undefined) {
        const validate = ajv.compile(part.if);
        for (const arm of ['then', 'else']) {
          const branch = part[arm];
          if (!branch || typeof branch !== 'object') continue;
          const reserved = controlOption(branch, 'active');
          const gate = G => (arm === 'then' ? validate(G) : !validate(G)) && (reserved === undefined || !!evaluate(reserved, G));
          const f = { id: `${id}/${arm}`, guard: gate, declares: [], defaults: {}, expressionDefaults: {}, children: [] };
          collect(branch, f, rootValue => when(rootValue) && gate(at(rootValue, path)), f.id, [...scopes, { schema: part, when }]);
          nested.push(f);
        }
      }
      if (id === 'base') fragments.push(...nested);
      else fragment.children.push(...nested);
    };
    collect(definition, null, () => true, 'base');
    declareFragments(host, fragments);
  };
  const root = make('', schema, []);
  configureSchema(root, schema, options);
  root.warnings.push(...warnings);
  const find = path => path.split('/').filter(Boolean).reduce((n, key) => n.index?.get(key), root);
  root.find = find;
  const injections = [];
  const derived = [];
  for (const node of pending) {
    const d = controlOption(node.schema, 'derived');
    if (d) {
      const from = find(d.from);
      if (!from) throw new Error(`Unknown dependency ${d.from}`);
      derived.push({ from, to: node, map: d.map, order: order.get(d) });
    }
    const inject = controlOption(node.schema, 'injectTo');
    for (const rule of inject ? Array.isArray(inject) ? inject : [inject] : []) {
      const to = find(rule.to);
      if (!to) throw new Error(`Unknown target ${rule.to}`);
      injections.push({ from: node, to, map: rule.map, order: order.get(rule) });
    }
  }
  declareInjections(root, injections);
  declareDerived(root, derived);
  prime(root, value, options);
  return root;
}

/** Body, allOf, then/else, branches; within each category preserve source order. */
function declarationOrder(schema) {
  const order = new WeakMap();
  let next = 0;
  const walk = part => {
    if (!part || typeof part !== 'object') return;
    for (const key of Object.keys(part)) {
      if (key === '&derived' && part[key]) order.set(part[key], next++);
      if (key === '&injectTo') for (const rule of Array.isArray(part[key]) ? part[key] : [part[key]]) order.set(rule, next++);
      if (key === '&clearValue') order.set(part, { clearValue: next++ });
      if (key === 'properties') for (const child of Object.values(part.properties)) walk(child);
    }
    for (const child of part.allOf ?? []) walk(child);
    walk(part.then); walk(part.else);
    for (const key of ['oneOf', 'anyOf']) for (const child of part[key] ?? []) walk(child);
  };
  walk(schema);
  return order;
}
