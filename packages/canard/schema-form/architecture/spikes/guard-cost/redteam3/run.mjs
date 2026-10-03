/**
 * Attacks 1–8 on round-3-spec.md §B / §C2 / G1. Run: `node run.mjs [attackNumber]`.
 * Each attack prints one block; the report in reviews/raw-redteam3-contract.md cites these lines.
 */
import { AJV_VERSION, acceptingBranches, make07, make2020, verdict } from './ajv.mjs';
import { identify } from './algorithm-b.mjs';
import { analyzeHost, settle } from './form-model.mjs';
import * as C from './corpus.mjs';
import { resolvePointer } from './algorithm-b.mjs';

const only = process.argv[2] ? Number(process.argv[2]) : null;
const section = (n, title) => (only === null || only === n) && (console.log(`\n=== ${n}. ${title} ===`), true);
const J = (v) => JSON.stringify(v);
const unionOf = (entry) => { const p = entry.pointer.replace(/\/(oneOf|anyOf)$/, ''); return p === '' ? entry.root : resolvePointer(entry.root, '#' + p); };

/** For each sample: ajv verdict, ajv-accepting branches, guard-selected branches (A5 guards on the object). */
function compare(entry, opts = {}) {
  const union = unionOf(entry);
  const b = identify(union, entry.root, opts);
  const count = (union.oneOf ?? union.anyOf).length;
  const rows = [];
  for (const v of entry.samples) {
    const acc = acceptingBranches(entry.root, entry.pointer, count, v, { dialect: entry.dialect });
    let guardSel = '-';
    if (b.kind === 'discriminated') {
      const ajv = entry.dialect === '2020' ? make2020() : make07();
      try { guardSel = b.guards.map((g, i) => (ajv.compile(g)(v === null ? {} : v) ? i : -1)).filter((i) => i >= 0); }
      catch (err) { guardSel = 'guard-invalid: ' + err.message; }
    }
    rows.push(`${J(v)}  ajv-accepts=${J(acc)}  guard-selects=${J(guardSel)}`);
  }
  return { b, rows };
}

console.log(`ajv ${AJV_VERSION}`);

if (section(0, 'corpus sweep — what B returns per generator shape')) {
  for (const entry of C.corpus) {
    const { b, rows } = compare(entry);
    console.log(`\n[${entry.id}] → ${b.kind}${b.key ? ` key=${b.key} values=${J(b.values)}` : ''}${b.reason ? ` reason=${b.reason}` : ''}${b.unsupported ? ` unsupported=${b.unsupported}` : ''} nullable=${b.nullable}`);
    rows.forEach((r) => console.log('   ' + r));
  }
}

if (section(1, 'B.1 allOf flattening: tag in $ref base; recursive $ref termination')) {
  const e = C.openapi31TwoLevel;
  for (const resolveAllOfItemRefs of [false, true]) {
    try {
      const { b } = compare(e, { resolveAllOfItemRefs, sameKey: 'allOf' });
      console.log(`resolveAllOfItemRefs=${resolveAllOfItemRefs} sameKey=allOf → ${b.kind} key=${b.key} values=${J(b.values)}`);
    } catch (err) { console.log(`resolveAllOfItemRefs=${resolveAllOfItemRefs} → throws ${err.message}`); }
    const { b } = compare(e, { resolveAllOfItemRefs, sameKey: 'merge' });
    console.log(`resolveAllOfItemRefs=${resolveAllOfItemRefs} sameKey=merge → ${b.kind} key=${b.key} values=${J(b.values)}`);
  }
  console.log('note: even with item refs resolved, Cat is itself allOf (Persian→Cat→Pet); one-level flattening leaves Cat.allOf unflattened.');
  const conflict = { $defs: { Base: { type: 'object', properties: { kind: { type: 'integer' } }, required: ['kind'] } }, type: 'object', properties: { pet: { oneOf: [
    { allOf: [{ $ref: '#/$defs/Base' }, { properties: { kind: { const: '1' } } }] }, { allOf: [{ $ref: '#/$defs/Base' }, { properties: { kind: { const: 2 } } }] } ] } } };
  const cb = identify(conflict.properties.pet, conflict, { resolveAllOfItemRefs: true, sameKey: 'merge' });
  const cv = { kind: '1' };
  console.log(`base type:integer ∧ branch const:'1' (merge) → ${cb.kind} guards=${J(cb.guards)}; value ${J(cv)}: guard0=${make2020().compile(cb.guards[0])(cv)} ajv-accepts=${J(acceptingBranches(conflict, '/properties/pet/oneOf', 2, cv))}`);
  const r = compare(C.pydanticRecursive);
  console.log(`recursive union → ${r.b.kind} key=${r.b.key} values=${J(r.b.values)} (terminated)`);
  const cyc = { $defs: { A: { $ref: '#/$defs/A' } }, oneOf: [{ $ref: '#/$defs/A' }, { properties: { k: { const: 1 } } }] };
  try { identify(cyc, cyc); console.log('self $ref cycle → returned'); } catch (err) { console.log(`self $ref cycle → ${err.message} (guarded only because this implementation added a seen-set; spec has none)`); }
}

if (section(2, 'B.2 null: type:[object,null] branch vs null branch vs nullable:true')) {
  for (const e of [C.openapi31NullableType, C.openapi30Nullable, C.pydanticOptionalUnion, C.pydanticOptionalDiscriminated]) {
    const { b, rows } = compare(e);
    console.log(`[${e.id}] → ${b.kind} key=${b.key ?? '-'} nullable=${b.nullable}`);
    rows.forEach((r) => console.log('   ' + r));
    for (const v of e.samples.filter((s) => s === null)) console.log(`   ajv(root, {pet:null}) → ${J(verdict(e.root, { pet: null }, { dialect: e.dialect }))}`);
  }
  const outer = identify(C.pydanticOptionalDiscriminated.root.properties.pet, C.pydanticOptionalDiscriminated.root);
  console.log(`outer anyOf of Optional[discriminated] → ${outer.kind} nullable=${outer.nullable} (branch has oneOf → B must recurse; spec §B.2 says only "그 분기 자체가 호스트")`);
  const nb = C.openapi30Nullable.root;
  console.log(`nullable:true under strict:true 2020 → ${(() => { try { make2020({ strict: true }).compile(nb); return 'compiles'; } catch (e) { return 'throws: ' + e.message; } })()}`);
}

if (section(3, 'B.3 enum vs const; multi-element enum; two candidate keys')) {
  const ce = compare(C.pydanticConstEnum); console.log(`const+enum → ${ce.b.kind} values=${J(ce.b.values)}`);
  const z = compare(C.zodMultiEnumTag); console.log(`zod enum tag, multiEnum=false → ${z.b.kind} reason=${z.b.reason ?? '-'}`); z.rows.forEach((r) => console.log('   ' + r));
  const z2 = compare(C.zodMultiEnumTag, { multiEnum: true }); console.log(`zod enum tag, multiEnum=true → ${z2.b.kind} values=${J(z2.b.values)}`); z2.rows.forEach((r) => console.log('   ' + r));
  const t = compare(C.tsjsTwoTags); console.log(`two const keys (apiVersion first) → ${t.b.kind} reason=${t.b.reason ?? '-'} candidates=${J(t.b.candidates)} chosen=${t.b.key}`);
  t.rows.forEach((r) => console.log('   ' + r));
  const swapped = structuredClone(C.tsjsTwoTags);
  for (const br of swapped.root.properties.shape.anyOf) { const { apiVersion, ...rest } = br.properties; br.properties = { ...rest, apiVersion }; }
  const t2 = compare(swapped); console.log(`same schema, kind declared first → ${t2.b.kind} key=${t2.b.key} values=${J(t2.b.values)}`);
  const sorted = structuredClone(C.tsjsTwoTags);
  sorted.root.properties.shape.anyOf[0].properties = Object.fromEntries(Object.entries(sorted.root.properties.shape.anyOf[0].properties).sort());
  const t3 = compare(sorted); console.log(`branch0 keys sorted (a generator that sorts) → ${t3.b.kind} key=${t3.b.key ?? '-'}`);
}

if (section(4, 'B.4 overlapping values → select; does the form hide fields and change the verdict?')) {
  const e = C.overlappingAnyOf;
  const union = unionOf(e);
  const b = identify(union, e.root); console.log(`B → ${b.kind} reason=${b.reason} key=${b.key} values=${J(b.values)}`);
  for (const select of [0, 1]) {
    const { fragments } = analyzeHost(union, e.root, { select });
    for (const v of e.samples) {
      const s = settle(fragments, v);
      const before = verdict(e.root, { pet: v }); const after = verdict(e.root, { pet: s.emit });
      console.log(`select=${select} loaded=${J(v)} → emit=${J(s.emit)}  ajv(loaded)=${before.valid} ajv(emit)=${after.valid}`);
    }
  }
}

if (section(5, 'B.5 OpenAPI 3.0 mapping-only: does no value pass oneOf? does ajv discriminator:true throw on mapping?')) {
  const e = C.openapi30MappingOnly;
  for (const dialect of ['07', '2020']) {
    for (const v of e.samples) {
      const acc = acceptingBranches(e.root, e.pointer, 2, v, { dialect });
      const vd = verdict(e.root, { pet: v }, { dialect });
      console.log(`dialect=${dialect} ${J(v)} accepts=${J(acc)} oneOf-valid=${vd.valid}`);
    }
  }
  const { b } = compare(e); console.log(`B → ${b.kind} key=${b.key} values=${J(b.values)} unsupported=${b.unsupported} guards=${J(b.guards)}`);
  const withMapping = structuredClone(e.root);
  for (const [label, root] of [['mapping present', withMapping], ['mapping removed', (() => { const r = structuredClone(e.root); delete r.properties.pet.discriminator.mapping; return r; })()]]) {
    try { make07({ discriminator: true }).compile(root); console.log(`ajv discriminator:true, ${label} → compiles`); }
    catch (err) { console.log(`ajv discriminator:true, ${label} → throws: ${err.message}`); }
  }
  const p = C.pydanticDiscriminated.root;
  try { const fn = make2020({ discriminator: true }).compile(p); console.log(`ajv discriminator:true on pydantic output (const + mapping) → compiles; {kind:'cat',meow:'m'} valid=${fn({ pet: { kind: 'cat', meow: 'm' } })}`); }
  catch (err) { console.log(`ajv discriminator:true on pydantic output → throws: ${err.message}`); }
  const pb = compare(C.pydanticDiscriminated); console.log(`B on pydantic output → ${pb.b.kind} key=${pb.b.key} values=${J(pb.b.values)} unsupported=${pb.b.unsupported}`);
}

if (section(6, 'G1 with unevaluatedProperties:false at the union host + A5 always-emitted tag')) {
  const root = { type: 'object', unevaluatedProperties: false, oneOf: [
    { properties: { kind: { const: 'cat' }, meow: { type: 'string' } }, required: ['kind'] },
    { properties: { kind: { const: 'dog' }, bark: { type: 'boolean' } }, required: ['kind'] },
  ] };
  const { fragments, tag } = analyzeHost(root, root);
  console.log(`B → ${tag.verdict.kind} key=${tag.key} enum=${J(tag.enum)}`);
  for (const v of [{}, { kind: 'cat', meow: 'm' }, { kind: 'cat', meow: 'm', bark: true }, { kind: 'bird' }, { kind: 'cat', extra: 1 }]) {
    const s = settle(fragments, v);
    const before = verdict(root, v); const after = verdict(root, s.emit);
    console.log(`loaded=${J(v)} active=${J(s.active)} emit=${J(s.emit)} ajv(loaded)=${before.valid} ajv(emit)=${after.valid} ${J(after.errors)}`);
  }
}

if (section(7, 'C2: loaded valid, emitted invalid, and omitEmpty-off does not fix')) {
  const cases = [
    { name: 'omitEmpty on required string', root: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } }, value: { name: '' } },
    { name: 'minProperties:1 + omitEmpty on nested {}', root: { type: 'object', minProperties: 1, properties: { meta: { type: 'object' } } }, value: { meta: {} } },
    { name: 'omitTrailing + minItems:3', root: { type: 'object', properties: { xs: { type: 'array', minItems: 3, items: { type: ['integer', 'null'] } } } }, value: { xs: [1, null, null] } },
    { name: 'dependentRequired on key declared only in an inactive then', root: { type: 'object', properties: { a: { type: 'integer' } }, dependentRequired: { a: ['b'] }, if: { required: ['flag'] }, then: { properties: { b: { type: 'integer' } } } }, value: { a: 1, b: 2 } },
    { name: 'host required names a key declared only in a sibling select branch', root: { type: 'object', required: ['b'], anyOf: [{ properties: { a: {}, a2: {} }, required: ['a'] }, { properties: { b: {} }, required: ['b'] }] }, value: { a: 1, a2: 2, b: 3 } },
    { name: 'additionalProperties:{schema} extras kept', root: { type: 'object', properties: { id: {} }, additionalProperties: { type: 'string' } }, value: { id: 1, x: 'ok' } },
    { name: 'forbid fragment drops an invalid key (invalid→valid)', root: { type: 'object', properties: { a: {}, x: {} }, if: { required: ['a'] }, then: { not: { required: ['x'] } } }, value: { a: 1, x: 2 } },
  ];
  for (const c of cases) {
    const { fragments } = analyzeHost(c.root, c.root, { select: 0 });
    const line = [];
    for (const opts of [{ omitEmpty: true, omitTrailing: true }, { omitEmpty: false, omitTrailing: false }]) {
      const s = settle(fragments, c.value, opts);
      line.push(`omit=${opts.omitEmpty ? 'on' : 'off'} emit=${J(s.emit)} ajv(emit)=${verdict(c.root, s.emit).valid}`);
    }
    console.log(`${c.name}: ajv(loaded)=${verdict(c.root, c.value).valid} | ${line.join(' | ')}`);
  }
}

if (section(8, 'C2 default only for missing keys — loaded value matching no branch')) {
  const e = C.pydanticDiscriminated;
  const host = { ...e.root.properties.pet, properties: { note: { type: 'string', default: 'auto' } } };
  const root = { ...e.root, properties: { pet: host } };
  const { fragments, tag } = analyzeHost(host, root);
  console.log(`tag node: key=${tag.key} enum=${J(tag.enum)} (form-side schema; authored schema has no enum on kind)`);
  for (const v of [{ kind: 'bird' }, { kind: 'bird', meow: 'm' }, { kind: 'cat' }]) {
    const s = settle(fragments, v);
    const before = verdict(root, { pet: v }); const after = verdict(root, { pet: s.emit });
    console.log(`loaded=${J(v)} → raw=${J(s.raw)} emit=${J(s.emit)} same=${J(s.emit) === J(v)}`);
    console.log(`   ajv(loaded) ${before.valid} ${J(before.errors)}`);
    console.log(`   ajv(emit)   ${after.valid} ${J(after.errors)}`);
  }
}
