/**
 * Minimal executable model of round-3-spec.md §A3 (option A, monotone), §A5 (union owns the tag) and §C2 (load contract),
 * for a single object host. Enough to compute `emit` for a loaded value; not a rendering model.
 *
 * Fragments: `{ id, guard: (L)=>boolean | null (unconditional), declares: {name: schema}, forbids: [name] }`.
 * A `select` union contributes fragments whose guard is `() => selected === i`.
 */
import { make2020, make07 } from './ajv.mjs';
import { identify, normalizeBranch, resolvePointer } from './algorithm-b.mjs';

const isEmpty = (v) => v === undefined || v === '' || (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) || (Array.isArray(v) && v.length === 0);

/** Build fragments for `host` (an object schema) under `root`. Returns `{ fragments, tag }`. */
export function analyzeHost(host, root, { dialect = '2020', bOptions = {}, select = 0 } = {}) {
  const ajv = dialect === '2020' ? make2020() : make07();
  ajv.addSchema(root, 'root');
  const compileLocal = (schema) => ajv.compile(schema);
  const fragments = [{ id: 'properties', guard: null, declares: { ...(host.properties ?? {}) }, forbids: [] }];
  for (const [i, item] of (host.allOf ?? []).entries()) {
    const it = item.$ref ? resolvePointer(root, item.$ref) : item;
    if (it.if === undefined) fragments.push({ id: `allOf/${i}`, guard: null, declares: it.properties ?? {}, forbids: [] });
    else fragments.push(condFragment(`allOf/${i}`, it, compileLocal));
  }
  if (host.if !== undefined) fragments.push(condFragment('if', host, compileLocal));
  let tag = null;
  const unionKey = host.oneOf ? 'oneOf' : host.anyOf ? 'anyOf' : null;
  if (unionKey) {
    const b = identify(host, root, bOptions);
    const branches = host[unionKey].map((br) => normalizeBranch(br, root, bOptions)).filter((br) => br.type !== 'null');
    if (b.kind === 'discriminated') {
      tag = { key: b.key, enum: b.values.flat() };
      fragments.push({ id: 'tag', guard: null, declares: { [b.key]: { enum: tag.enum } }, forbids: [] });
      branches.forEach((br, i) => {
        const { [b.key]: _omit, ...declares } = br.properties ?? {};
        fragments.push({ id: `${unionKey}/${i}`, guard: compileLocal(b.guards[i]), declares, forbids: [] });
      });
    } else if (b.kind === 'select') {
      branches.forEach((br, i) => fragments.push({ id: `${unionKey}/${i}`, guard: () => select === i, declares: br.properties ?? {}, forbids: [] }));
    }
    tag = { ...(tag ?? {}), verdict: b };
  }
  return { fragments, tag };
}

function condFragment(id, it, compileLocal) {
  const then = it.then ?? {};
  const forbids = Object.entries(then.properties ?? {}).filter(([, s]) => s === false).map(([k]) => k);
  if (then.not?.required?.length === 1) forbids.push(then.not.required[0]);
  const declares = Object.fromEntries(Object.entries(then.properties ?? {}).filter(([, s]) => s !== false));
  return { id, guard: compileLocal(it.if), declares, forbids };
}

/**
 * §A3 option A + §C2. `raw` is the host's raw (loaded value). Returns `{ active, local, emit, raw }`.
 * Defaults are injected into `raw` for missing keys of fragments that turn active (§A3.3 / §C2).
 */
export function settle(fragments, rawIn, { omitEmpty = false, omitTrailing = false } = {}) {
  const raw = rawIn === null || typeof rawIn !== 'object' ? rawIn : { ...rawIn };
  if (raw === null || typeof raw !== 'object') return { active: [], local: undefined, emit: raw, raw }; // §C3 / §A6
  const declaredAnywhere = new Set(fragments.flatMap((f) => Object.keys(f.declares)));
  const active = new Set(fragments.filter((f) => f.guard === null).map((f) => f.id));
  const inject = (f) => {
    for (const [k, s] of Object.entries(f.declares)) if (!(k in raw) && s && s.default !== undefined) raw[k] = structuredClone(s.default);
  };
  fragments.filter((f) => active.has(f.id)).forEach(inject);
  const compose = () => {
    const L = {};
    for (const k of Object.keys(raw)) if (!declaredAnywhere.has(k)) L[k] = raw[k]; // extras (§C2)
    for (const f of fragments) if (active.has(f.id)) for (const k of Object.keys(f.declares)) if (k in raw) L[k] = raw[k];
    return L;
  };
  for (let round = 0; round <= fragments.length; round++) {
    const before = active.size;
    for (const f of fragments) {
      if (active.has(f.id) || f.guard === null) continue;
      if (f.guard(compose())) { active.add(f.id); inject(f); }
    }
    if (active.size === before) break;
  }
  const local = compose();
  const forbidden = new Set(fragments.filter((f) => active.has(f.id)).flatMap((f) => f.forbids));
  const emit = {};
  for (const [k, v] of Object.entries(local)) {
    if (forbidden.has(k)) continue;
    let out = v;
    if (omitTrailing && Array.isArray(out)) { out = [...out]; while (out.length && (out[out.length - 1] == null)) out.pop(); }
    if (omitEmpty && isEmpty(out)) continue;
    if (out === undefined) continue;
    emit[k] = out;
  }
  return { active: [...active], local, emit, raw };
}
