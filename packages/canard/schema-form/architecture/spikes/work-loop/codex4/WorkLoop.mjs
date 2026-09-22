/** Loaded by run.mjs; models round-4 A, independently of the product runtime. */
import assert from 'node:assert/strict';

const clone = (v) => structuredClone(v);
const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const present = (o, k) => Object.hasOwn(o, k) && o[k] !== undefined;
const empty = (v) => v === '' || v === null || (typeof v === 'object' && v !== null && Object.keys(v).length === 0);

/** Build ordered, parent-gated fragments; false/not never declare fields (A4-5). */
function fragments(schemas, ajv, forceSelection) {
  const result = [];
  function visit(body, id, parent, guard) {
    if (!object(body)) return;
    const own = { id, parent, guard, properties: Object.fromEntries(Object.entries(body.properties ?? {}).filter(([, s]) => s !== false)) };
    result.push(own);
    (body.allOf ?? []).forEach((s, i) => visit(s, `${id}/allOf/${i}`, id));
    if (body.if) {
      const test = ajv.compile(body.if);
      visit(body.then, `${id}/then`, id, (g) => test(g));
      visit(body.else, `${id}/else`, id, (g) => !test(g));
    }
    const union = body.oneOf ?? body.anyOf;
    if (!union) return;
    const keys = Object.keys(union[0]?.properties ?? {});
    const key = !forceSelection && keys.find((k) => union.every((s) => object(s.properties?.[k]) && Object.hasOwn(s.properties[k], 'const')) && union.every((s, i) => union.slice(0, i).every((p) => !equal(s.properties[k].const, p.properties[k].const))));
    if (key) {
      const values = union.map((s) => s.properties[key].const);
      const explicit = present(body.properties?.[key] ?? {}, 'default') ? body.properties[key].default : union.find((s) => present(s.properties[key], 'default'))?.properties[key].default;
      result.push({ id: `${id}/selector`, parent: id, properties: { [key]: { enum: values, default: explicit === undefined ? values[0] : explicit } } });
    }
    union.forEach((s, i) => {
      const test = key && ajv.compile({ required: [key], properties: { [key]: { const: s.properties[key].const } } });
      visit(s, `${id}/union/${i}`, id, key ? (g) => test(g) : (_, selection) => selection === i);
    });
  }
  schemas.forEach(({ body, id }) => visit(body, id));
  return result;
}

/** A host retains child storage across activation changes; only replace clears absent data. */
export class WorkLoop {
  constructor(schema, ajv, options = {}, registry, path = '') {
    this.schema = schema;
    this.ajv = ajv;
    this.options = options;
    this.path = path;
    this.schemas = registry ?? [{ id: 'root', body: schema }];
    this.all = fragments(this.schemas, ajv, options.forceSelection);
    this.children = {};
    const declarations = {};
    for (const f of this.all) for (const [key, body] of Object.entries(f.properties)) (declarations[key] ??= []).push({ id: `${f.id}/properties/${key}`, body });
    for (const [key, sources] of Object.entries(declarations)) {
      const host = sources.some(({ body }) => object(body) && (body.properties || body.allOf || body.oneOf || body.anyOf || body.if || body.type === 'object' || body.type?.includes?.('object')));
      this.children[key] = host ? new WorkLoop(sources[0].body, ajv, options, sources, `${path}/${key}`) : { raw: undefined, path: `${path}/${key}` };
    }
    this.raw = undefined;
    this.extras = {};
    this.selection = this.all.some((f) => f.id.includes('/union/')) && !this.all.some((f) => f.id.endsWith('/selector')) ? options.selection ?? 0 : undefined;
    this.initialSelection = this.selection;
    this.previousActive = [];
    this.initial = undefined;
    this.loaded = false;
  }

  /** Stage a full replacement recursively, including latent children below null. */
  replace(value, initial = false) {
    if (!this.loaded || initial) {
      this.initial = clone(value);
      const branches = this.schema.oneOf ?? this.schema.anyOf ?? [];
      const passing = branches.map((s, i) => ({ i, pass: this.ajv.compile(s)(value), score: Object.keys(object(value) ? value : {}).filter((k) => Object.hasOwn(s.properties ?? {}, k)).length })).filter((x) => x.pass).sort((a, b) => b.score - a.score || a.i - b.i);
      if (passing.length && this.selection !== undefined) this.selection = this.initialSelection = passing[0].i;
      this.loaded = true;
    }
    this.raw = value !== undefined && !object(value) ? clone(value) : undefined;
    this.extras = Object.fromEntries(Object.entries(object(value) ? value : {}).filter(([k, v]) => !Object.hasOwn(this.children, k) && v !== undefined));
    for (const [key, node] of Object.entries(this.children)) {
      const next = object(value) && present(value, key) ? value[key] : undefined;
      if (node instanceof WorkLoop) node.replace(next);
      else node.raw = clone(next);
    }
    this.loadPending = true;
    return this;
  }

  /** Stage a partial descendant write; defaults use a separate path and do not promote hosts. */
  write(path, value) {
    const keys = Array.isArray(path) ? path : path.split('/').filter(Boolean);
    this.raw = undefined;
    const [key, ...rest] = keys;
    const node = this.children[key];
    if (rest.length) {
      assert(node instanceof WorkLoop);
      node.write(rest, value);
    } else if (node instanceof WorkLoop) node.replace(value);
    else if (node) node.raw = clone(value);
    else this.extras = Object.fromEntries([...Object.entries(this.extras).filter(([k]) => k !== key), ...(value === undefined ? [] : [[key, clone(value)]])]);
    return this;
  }

  removeKey(path) { return this.write(path, undefined); }

  /** Reset immutable initial value and manual choice; injectTo still runs in settle. */
  reset() {
    this.selection = this.initialSelection;
    for (const node of Object.values(this.children)) if (node instanceof WorkLoop) node.selection = node.initialSelection;
    return this.replace(this.initial);
  }

  /** Return raw/selection/extras only, for purity and history comparisons. */
  state() {
    return { raw: clone(this.raw), selection: this.selection, extras: clone(this.extras), children: Object.fromEntries(Object.entries(this.children).map(([k, n]) => [k, n instanceof WorkLoop ? n.state() : clone(n.raw)])) };
  }

  /** Compose active declarations with recursive inherited overlays, without mutating raw. */
  compose(fs, active) {
    const declarations = {};
    for (const f of fs) if (active.includes(f.id)) for (const [k, body] of Object.entries(f.properties)) (declarations[k] ??= []).push({ body, id: `${f.id}/properties/${k}`, fragment: f.id });
    const local = {}, emit = {}, children = {};
    for (const [k, defs] of Object.entries(declarations)) {
      const node = this.children[k];
      const annotations = Object.assign({}, ...defs.map((d) => d.body));
      const value = node instanceof WorkLoop ? (children[k] = node.compute(defs)).emit : clone(node.raw);
      if (value === undefined) continue;
      local[k] = value;
      if (annotations['x-omitEmpty'] && empty(value)) continue;
      let projected = value;
      if (annotations['x-omitTrailing'] && Array.isArray(value)) {
        let end = value.length;
        while (end && value[end - 1] === null) end--;
        projected = value.slice(0, end);
      }
      emit[k] = projected;
    }
    Object.assign(local, clone(this.extras));
    Object.assign(emit, clone(this.extras));
    return { local, emit: this.raw === undefined ? emit : clone(this.raw), children, declarations };
  }

  /** A4 compute is pure, restarts unconditionally, and uses sequential projected guards. */
  compute(schemas = this.schemas) {
    const fs = fragments(schemas, this.ajv, this.options.forceSelection);
    let active = [];
    for (const f of fs) if (!f.guard && (!f.parent || active.includes(f.parent))) active.push(f.id);
    const cap = fs.length + 1;
    const trace = [];
    let stable = false, sweeps = 0;
    for (; sweeps < cap;) {
      sweeps++;
      let changed = false;
      for (const f of fs) {
        const eligible = !f.parent || active.includes(f.parent);
        const g = this.raw === undefined ? this.compose(fs, active).emit : {};
        const enabled = eligible && (!f.guard || f.guard(g, this.selection));
        if (enabled !== active.includes(f.id)) {
          active = enabled ? [...active, f.id] : active.filter((id) => id !== f.id);
          changed = true;
        }
        if (f.guard) trace.push({ sweep: sweeps, fragment: f.id, g: clone(g), enabled });
      }
      if (!changed) { stable = true; break; }
    }
    return { ...this.compose(fs, active), active, settle: { status: stable ? 'stable' : 'budget-exceeded', sweeps }, trace };
  }

  /** Gather default writes outside compute; last active declaration wins at injection time. */
  defaults(result, load, writes = []) {
    for (const [key, defs] of Object.entries(result.declarations)) {
      const node = this.children[key];
      const transitioning = defs.some((d) => !this.previousActive.includes(d.fragment));
      const chosen = [...defs].reverse().find((d) => Object.hasOwn(d.body, 'default'));
      const absent = node instanceof WorkLoop ? node.raw === undefined && Object.keys(node.extras).length === 0 && Object.values(node.children).every((n) => n instanceof WorkLoop ? false : n.raw === undefined) : node.raw === undefined;
      if ((load || transitioning) && absent && chosen) {
        if (!(node instanceof WorkLoop) || !equal(chosen.body.default, {})) writes.push({ node, value: clone(chosen.body.default), path: node.path, kind: 'default' });
      }
      if (node instanceof WorkLoop && result.children[key]) node.defaults(result.children[key], load, writes);
    }
    return writes;
  }

  /** Commit only completed rounds; capped pending writes are discarded before application. */
  settle({ selected, inject, maxRounds = 25 } = {}) {
    if (selected !== undefined) this.selection = selected;
    const rounds = [];
    const suppress = this.options.disableDefaultInjection && this.loadPending;
    let result, capped = false;
    for (let round = 1; round <= maxRounds; round++) {
      const before = this.state();
      result = this.compute();
      assert.deepEqual(this.state(), before, 'compute mutated raw state');
      const derived = inject ? inject(result, this) : [];
      const writes = derived.length ? derived : suppress ? [] : this.defaults(result, this.loadPending && round === 1);
      rounds.push({ round, emit: clone(result.emit), active: result.active, sweeps: result.settle.sweeps, writes: writes.map(({ path, value, kind }) => ({ path, value, kind })) });
      if (!writes.length) break;
      if (round === maxRounds) { capped = true; break; }
      for (const w of writes) {
        if (w.apply) w.apply();
        else if (w.node instanceof WorkLoop) w.node.replace(w.value);
        else w.node.raw = clone(w.value);
      }
    }
    if (capped) result.settle.status = 'budget-exceeded';
    result.rounds = rounds;
    result.state = this.state();
    this.commit(result);
    return clone(result);
  }

  commit(result) {
    this.previousActive = result.active;
    this.loadPending = false;
    this.last = result;
    for (const [k, child] of Object.entries(result.children)) this.children[k].commit(child);
  }
}
