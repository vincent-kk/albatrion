/** Executed by run.mjs; this flat-host model implements round-3 A3, not the product runtime. */
export class WorkLoop {
  /** Schema and Ajv are caller-owned; options choose only explicitly reported interpretations. */
  constructor(schema, ajv, options = {}) {
    this.schema = schema;
    this.ajv = ajv;
    this.options = options;
    this.fragments = [{ id: 'base', body: { properties: schema.properties }, unconditional: true }];
    for (const [i, body] of (schema.allOf ?? []).entries()) this.addBody(body, `allOf[${i}]`);
    this.addConditional(schema, 'root');
    const branches = schema.oneOf ?? schema.anyOf ?? [];
    if (options.discriminator) {
      const key = options.discriminator;
      const values = branches.map((branch) => branch.properties[key].const);
      this.fragments.push({ id: 'discriminator', unconditional: true, body: { properties: { [key]: { enum: values } } } });
    }
    branches.forEach((body, i) => {
      const key = options.discriminator;
      const guard = key ? { required: [key], properties: { [key]: { const: body.properties[key].const } } } : undefined;
      this.fragments.push({ id: `union[${i}]`, body, guard: guard && ajv.compile(guard), selection: key ? undefined : i });
    });
    this.known = Object.keys(Object.assign({}, ...this.fragments.map((f) => f.body.properties)));
    this.raw = {};
    this.override = undefined;
    this.previousActive = [];
  }

  /** Normalize an allOf member; unsupported nested applicators are intentionally outside this model. */
  addBody(body, id) {
    this.fragments.push({ id, body: { properties: body.properties, not: body.not }, unconditional: true });
    this.addConditional(body, id);
  }

  /** Keep then/else separate, with complementary guards as in the fragment ADR. */
  addConditional(body, id) {
    if (!body.if) return;
    const guard = this.ajv.compile(body.if);
    if (body.then) this.fragments.push({ id: `${id}.then`, body: body.then, guard });
    if (body.else) this.fragments.push({ id: `${id}.else`, body: body.else, guard: (value) => !guard(value) });
  }

  /** Replace every leaf/extra; preserve null children only under the explicit A6 interpretation. */
  replace(value, preserveNull = true) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      this.raw = structuredClone(value);
      this.override = undefined;
    } else {
      if (value !== null || !preserveNull) this.raw = {};
      this.override = value;
    }
    return this;
  }

  /** Partial user writes revive the host; automatic writes retain its scalar/null override. */
  write(key, value, automatic = false) {
    this.raw[key] = structuredClone(value);
    if (!automatic) this.override = undefined;
    return this;
  }

  /** Return declared active child names, excluding prohibition-only declarations. */
  activeKeys(active) {
    const keys = active.flatMap((f) => Object.entries(f.body.properties ?? {}).filter(([, s]) => s !== false).map(([key]) => key));
    return keys.filter((key, i) => keys.indexOf(key) === i);
  }

  /** Inject defaults only for missing raw on newly activated children, never overwrite loaded values. */
  injectDefaults(fragment, beforeKeys) {
    for (const [key, child] of Object.entries(fragment.body.properties ?? {})) {
      if (child && !beforeKeys.includes(key) && !Object.hasOwn(this.raw, key) && Object.hasOwn(child, 'default')) this.raw[key] = structuredClone(child.default);
    }
  }

  /** Compose a fresh object, retaining extras; child terminal arrays apply their own emit projection. */
  compose(active) {
    if (this.override === null) return {};
    const keys = this.activeKeys(active);
    const result = {};
    for (const [key, value] of Object.entries(this.raw)) {
      if (!keys.includes(key) && this.known.includes(key)) continue;
      const child = Object.assign({}, ...active.map((f) => f.body.properties?.[key] || {}));
      let emitted = structuredClone(value);
      if (child.type === 'object' && value !== null && typeof value === 'object' && !Array.isArray(value)) {
        const subtree = new WorkLoop(child, this.ajv).replace(value).settle();
        this.raw[key] = subtree.raw;
        emitted = subtree.emit;
      }
      if (child['x-omitTrailing'] && Array.isArray(emitted)) {
        while (emitted.length && emitted.at(-1) === null) emitted.pop();
      }
      result[key] = emitted;
    }
    return result;
  }

  /** Apply host prohibition and omit policies after all guards, without modifying raw/local. */
  project(local, active) {
    if (this.override === null) return null;
    const prohibited = active.flatMap((f) => [
      ...Object.entries(f.body.properties ?? {}).filter(([, s]) => s === false).map(([key]) => key),
      ...(f.body.not?.required?.length === 1 ? f.body.not.required : []),
    ]);
    return Object.fromEntries(Object.entries(local).filter(([key, value]) => {
      const child = Object.assign({}, ...active.map((f) => f.body.properties?.[key] || {}));
      const empty = value === '' || value === null || (value && typeof value === 'object' && Object.keys(value).length === 0);
      return !prohibited.includes(key) && !(child['x-omitEmpty'] && empty);
    }));
  }

  /** Settle sequentially from unconditional fragments; return trace plus raw without cached-active input. */
  settle({ mode = 'A', selected = 0, activeOnly = false, cap } = {}) {
    if (this.override !== undefined && this.override !== null) return { raw: structuredClone(this.raw), override: this.override, emit: this.override, active: [], sweeps: 0 };
    let active = this.fragments.filter((f) => f.unconditional);
    for (const fragment of active) this.injectDefaults(fragment, []);
    const conditional = this.fragments.filter((f) => !f.unconditional);
    const limit = cap ?? conditional.length + 1;
    const trace = [];
    let activationSweep = 0;
    for (let sweep = 1; sweep <= limit; sweep++) {
      const previous = active.map((f) => f.id).join('|');
      const candidates = activeOnly && sweep > 1 ? conditional.filter((f) => active.includes(f)) : conditional;
      for (const fragment of candidates) {
        const local = this.compose(active);
        const enabled = fragment.selection === undefined ? fragment.guard(local) : selected === fragment.selection;
        trace.push({ sweep, id: fragment.id, local, enabled });
        if (enabled && !active.includes(fragment)) {
          const beforeKeys = this.activeKeys(active);
          active.push(fragment);
          this.injectDefaults(fragment, beforeKeys);
          activationSweep = sweep;
        } else if (!enabled && mode === 'B') active = active.filter((f) => f !== fragment);
      }
      if (previous === active.map((f) => f.id).join('|')) return this.result(active, trace, sweep, activationSweep, false);
    }
    return this.result(active, trace, limit, activationSweep, true);
  }

  /** Capture a detached observation; no result object aliases mutable raw state. */
  result(active, trace, sweeps, activationSweep, capped) {
    const local = this.compose(active);
    return { raw: structuredClone(this.raw), local, emit: this.project(local, active), active: active.map((f) => f.id), trace, sweeps, activationSweep, capped };
  }
}
