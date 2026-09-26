import assert from 'node:assert/strict';

// Invoked directly by `node model.mjs`; this file is an independent design experiment.
// Flat object hosts, scalar leaves, total guards/maps; no production imports or JSON Schema validator.
// P6 candidate replacement, initialization, and conflict policies are explicit model completions.

/** Value comparison preserves missing versus explicit null/empty values. */
function equal(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

/** Stable serialization for finite state comparison, independent of object insertion order. */
function key(value) {
  if (Array.isArray(value)) return `[${value.map(key).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.keys(value).sort().map(name => `${JSON.stringify(name)}:${key(value[name])}`).join(',')}}`;
  return JSON.stringify(value);
}

/** Canonical fragment identifier order is separate from guard evaluation order. */
function ids(schema, active) {
  return schema.fragments.filter(fragment => active.includes(fragment.id)).map(fragment => fragment.id);
}

/** Compose only declared, present keys; empty strings and null remain present in this model. */
function project(schema, raw, active) {
  const names = [...schema.base, ...schema.fragments.filter(f => active.includes(f.id)).flatMap(f => f.declares)];
  return Object.fromEntries(Object.entries(raw).filter(([name]) => names.includes(name)));
}

/** Exhaustive shape oracle at fixed raw; tiny fixtures only, not a production algorithm. */
function shapePoints(schema, raw) {
  return Array.from({ length: 2 ** schema.fragments.length }, (_, mask) =>
    schema.fragments.filter((_, index) => mask & (2 ** index)).map(f => f.id)
  ).filter(active => schema.fragments.every(f => f.guard(project(schema, raw, active)) === active.includes(f.id)));
}

/** ADR 0007 fixed empty conditional seed and immediate Gauss–Seidel toggles. */
function shape(schema, raw, rule, options = {}) {
  const canonical = schema.fragments.map(f => f.id);
  const mayHint = rule === 'old' || (options.uniqueShape === true && shapePoints(schema, raw).length === 1);
  const order = mayHint && options.hint ? options.hint : canonical;
  let active = [];
  for (let sweep = 0; sweep < schema.fragments.length + 1; sweep++) {
    const before = key(ids(schema, active));
    for (const name of order) {
      const fragment = schema.fragments.find(f => f.id === name);
      const enabled = fragment.guard(project(schema, raw, active));
      active = active.filter(id => id !== name);
      if (enabled) active.push(name);
    }
    active = ids(schema, active);
    if (key(active) === before) return { active, emit: project(schema, raw, active), status: 'stable' };
  }
  return { active, emit: project(schema, raw, active), status: 'budget-exceeded:shape' };
}

/** Apply caller writes without automatic writes; load clears the transition reference (F4). */
function mark(start, writes) {
  let raw = structuredClone(start?.raw ?? {});
  let load = !start;
  for (const write of writes) {
    if (write.op === 'load') { raw = structuredClone(write.value); load = true; }
    if (write.op === 'set') raw[write.key] = write.value;
    if (write.op === 'remove') delete raw[write.key];
  }
  return { raw, load, referenceActive: load ? [] : start.active };
}

/** Resolve a default by schema declaration order, then fill missing keys only. */
function defaults(schema, raw, active, marked, options) {
  const finalFragments = schema.fragments.filter(f => active.includes(f.id));
  const eligible = [...(marked.load ? Object.keys(schema.defaults) : []),
    ...finalFragments.filter(f => !marked.referenceActive.includes(f.id)).flatMap(f => f.declares)];
  const declarations = [schema.defaults, ...finalFragments.map(f => f.defaults)];
  const winners = {};
  for (const declaration of declarations) {
    for (const [name, value] of Object.entries(declaration)) {
      if (eligible.includes(name) && (options.winner !== 'first' || !Object.hasOwn(winners, name))) winners[name] = value;
    }
  }
  return { ...winners, ...raw };
}

/** Freeze source emit before the outermost entry; initialization variants are intentionally explicit. */
function edgeReference(schema, start, marked, rule, options) {
  if (options.reference === 'empty') return {};
  if (options.reference === 'loaded') return shape(schema, marked.raw, rule, options).emit;
  return start?.emit ?? {};
}

/** Read all sources from the completed candidate tree, then replace scalar target raw values. */
function injections(schema, candidate, reference, options) {
  const writes = {};
  for (const edge of schema.edges) {
    const sourcePresent = Object.hasOwn(candidate.emit, edge.from);
    const changed = sourcePresent !== Object.hasOwn(reference, edge.from) || !equal(candidate.emit[edge.from], reference[edge.from]);
    const targetDeclared = schema.base.includes(edge.to) || schema.fragments.some(f => candidate.active.includes(f.id) && f.declares.includes(edge.to));
    if (sourcePresent && changed && (targetDeclared || options.target === 'latent'))
      writes[edge.to] = edge.map(candidate.emit[edge.from]);
  }
  return writes;
}

/** 3.1 iterative writes persist; derived rounds precede transition rounds and have separate limits. */
function oldSettle(schema, start, writes, options = {}) {
  const marked = mark(start, writes);
  const reference = edgeReference(schema, start, marked, 'old', options);
  let raw = marked.raw;
  let derivedRounds = 0;
  let transitionRounds = 0;
  const trace = [];
  for (let round = 0; round < 64; round++) {
    const computed = shape(schema, raw, 'old', options);
    trace.push({ raw, active: computed.active });
    if (computed.status !== 'stable') return { raw, ...computed, trace };
    const derived = { ...raw, ...injections(schema, computed, reference, options) };
    if (key(derived) !== key(raw)) {
      if (derivedRounds++ >= 25) return { raw, ...computed, status: 'budget-exceeded:derived', trace };
      raw = derived;
      continue;
    }
    const injected = defaults(schema, raw, computed.active, marked, options);
    if (key(injected) !== key(raw)) {
      if (transitionRounds++ >= schema.fragments.length + 1)
        return { raw, ...computed, status: 'budget-exceeded:transition', trace };
      raw = injected;
      continue;
    }
    return { raw, ...computed, trace };
  }
  throw new Error('old model safety bound reached');
}

/** P6 proposal: discard ALL intermediate automatic writes, keeping explicit marked writes intact. */
function propose(schema, marked, candidate, reference, options) {
  const derived = { ...marked.raw, ...injections(schema, candidate, reference, options) };
  return defaults(schema, derived, candidate.active, marked, options);
}

/** Solve coupled raw/shape proposals. A repeated candidate rejects commit, not a proof of no fixed point. */
function p6Settle(schema, start, writes, options = {}) {
  const marked = mark(start, writes);
  const reference = edgeReference(schema, start, marked, 'p6', options);
  let raw = structuredClone(options.seed ?? marked.raw);
  const seen = [];
  const trace = [];
  for (let round = 0; round < 64; round++) {
    const computed = shape(schema, raw, 'p6', options);
    trace.push({ raw, active: computed.active });
    if (computed.status !== 'stable') return { status: computed.status, committed: null, trace };
    const next = propose(schema, marked, computed, reference, options);
    if (key(raw) === key(next)) return { raw, ...computed, trace };
    if (seen.includes(key(next))) return { status: 'candidate-cycle', committed: null, trace };
    seen.push(key(raw));
    raw = next;
  }
  return { status: 'budget-exceeded:model', committed: null, trace };
}

/** Enumerate missing/default values to independently certify default-only coupled fixed points. */
function defaultPoints(schema, start, writes, options = {}) {
  assert.equal(schema.edges.length, 0, 'oracle is complete only for default-only fixtures');
  const marked = mark(start, writes);
  const declarations = [schema.defaults, ...schema.fragments.map(f => f.defaults)];
  const allNames = declarations.flatMap(d => Object.keys(d));
  const names = allNames.filter((name, index) => allNames.indexOf(name) === index && !Object.hasOwn(marked.raw, name));
  let candidates = [marked.raw];
  for (const name of names) {
    const values = declarations.filter(d => Object.hasOwn(d, name)).map(d => d[name]);
    candidates = candidates.flatMap(raw => [raw, ...values.map(value => ({ ...raw, [name]: value }))]);
  }
  const solutions = [];
  for (const raw of candidates) {
    for (const active of shapePoints(schema, raw)) {
      const candidate = { active, emit: project(schema, raw, active) };
      if (key(propose(schema, marked, candidate, {}, options)) !== key(raw)) continue;
      const solution = { raw, active, emit: candidate.emit };
      if (!solutions.some(existing => key(existing) === key(solution))) solutions.push(solution);
    }
  }
  return solutions;
}

/** Fixtures use an executable schema DSL, whose predicate text is included in results.txt. */
function schema(base, fragments = [], defaults = {}, edges = []) {
  return { base, fragments, defaults, edges };
}

/** A fragment declares child presence and, separately, transition default candidates. */
function fragment(id, guard, declares, defaults = {}) {
  return { id, guard, declares, defaults };
}

/** One scalar injectTo edge; maps are pure and defined for every present source in the fixture. */
function edge(from, to, map) {
  return { from, to, map };
}

/** A committed snapshot can include latent raw and user overrides; no priming writes are implied. */
function snapshot(schema, raw) {
  return { raw, ...shape(schema, raw, 'p6') };
}

/** Replay the same ordered caller writes with either one entry or one entry per write. */
function replay(schema, start, writes, rule, batch, options = {}) {
  const settle = rule === 'old' ? oldSettle : p6Settle;
  const groups = batch ? [writes] : writes.map(write => [write]);
  let current = start;
  for (const group of groups) {
    current = settle(schema, current, group, options);
    if (current.status !== 'stable') break;
  }
  return current;
}

/** Compact observations retain raw, emit, and active distinctions; cycles retain their entire trace. */
function view(result) {
  if (result.committed === null) return result;
  return { raw: result.raw, emit: result.emit, active: result.active, status: result.status };
}

/** Both transaction partitions, under both rules, share the same schema and start snapshot. */
function compare(schema, start, writes, options = {}) {
  return Object.fromEntries(['old', 'p6'].map(rule => [rule, Object.fromEntries(
    ['sequential', 'batch'].map(partition => [partition, view(replay(schema, start, writes, rule, partition === 'batch', options))])
  )]));
}

/** Explicit caller partial write. Undefined is excluded; use remove for absence. */
function set(name, value) {
  return { op: 'set', key: name, value };
}

/** Whole-host load/reset is enough for these flat fixtures. */
function load(value) {
  return { op: 'load', value };
}

/** Assert fixture outputs instead of merely printing plausible model traces. */
function expect(result, emit, status = 'stable') {
  assert.equal(result.status, status);
  assert.deepEqual(result.emit, emit);
}

/** The only reporting side effect: one JSON record per named experiment. */
function report(id, title, schema, writes, results, classification) {
  console.log(JSON.stringify({ id, title, schema, writes, results, classification },
    (_, value) => typeof value === 'function' ? value.toString() : value));
}

console.log('Round 7 독립 red-team 모델: old=3.1, p6=최종 형상 후보 재구성. 값의 없음은 키 부재입니다.');
let scenarios = 0;

for (const [id, guard, kindDefault, oldX, finalX] of [
  ['E1a', G => !Object.hasOwn(G, 'kind') || G.kind === 'a', 'b', 'T', 'E'],
  ['E1b', G => G.kind === 'a', 'a', 'E', 'T'],
]) {
  const fixture = schema(['kind'], [fragment('then', guard, ['x'], { x: 'T' }), fragment('else', G => !guard(G), ['x'], { x: 'E' })], { kind: kindDefault });
  const results = {};
  for (const [rule, settle] of [['old', oldSettle], ['p6', p6Settle]]) {
    results[rule] = { empty: view(settle(fixture, null, [load({})])), explicit: view(settle(fixture, null, [load({ kind: kindDefault })])) };
    expect(results[rule].empty, { kind: kindDefault, x: rule === 'old' ? oldX : finalX });
    expect(results[rule].explicit, { kind: kindDefault, x: finalX });
  }
  assert.equal(defaultPoints(fixture, null, [load({})]).length, 1);
  report(id, '중간 기본값 폐기', fixture, [load({}), { alternative: load({ kind: kindDefault }) }], results, 'P6에서 해결됩니다. then/else는 같은 guard의 보수입니다.');
  scenarios++;
}

const branchFixture = schema(['kind'], [
  fragment('A', G => G.kind === 'a', ['x'], { x: 'A' }),
  fragment('B', G => G.kind === 'b', ['x'], { x: 'B' }),
]);
{
  const writes = [set('kind', 'a'), set('kind', 'b')];
  const results = compare(branchFixture, snapshot(branchFixture, {}), writes);
  for (const rule of ['old', 'p6']) {
    expect(results[rule].sequential, { kind: 'b', x: 'A' });
    expect(results[rule].batch, { kind: 'b', x: 'B' });
  }
  report('E2', '배치와 순차의 전이 기본값', branchFixture, writes, results, 'P6의 배치 동치 주장에 대한 반례입니다. 먼저 커밋된 x는 더 이상 없음이 아닙니다.');
  scenarios++;
}

const sourceFixture = schema(['src', 'tgt'], [], {}, [edge('src', 'tgt', value => `f(${value})`)]);
{
  const writes = [set('src', 'y'), set('src', 'x')];
  const starts = {};
  const results = {};
  for (const [rule, settle] of [['old', oldSettle], ['p6', p6Settle]]) {
    const mounted = settle(sourceFixture, null, [load({ src: 'x', tgt: 'custom' })]);
    expect(mounted, { src: 'x', tgt: 'f(x)' });
    starts[rule] = settle(sourceFixture, mounted, [set('tgt', 'mine')]);
    results[rule] = { mounted: view(mounted), sequential: view(replay(sourceFixture, starts[rule], writes, rule, false)), batch: view(replay(sourceFixture, starts[rule], writes, rule, true)) };
    expect(results[rule].sequential, { src: 'x', tgt: 'f(x)' });
    expect(results[rule].batch, { src: 'x', tgt: 'mine' });
  }
  report('E3', '순 변화 0인 원천의 에지', sourceFixture, [load({ src: 'x', tgt: 'custom' }), set('tgt', 'mine'), { partitioned: writes }], results, 'P6에서도 재현됩니다. 정상 진입의 직전 커밋과 진입 시작 emit은 동일합니다.');
  scenarios++;
}

{
  const fixture = schema([], [fragment('A', G => !Object.hasOwn(G, 'b'), ['a']), fragment('B', G => !Object.hasOwn(G, 'a'), ['b'])]);
  const results = {};
  for (const [rule, settle] of [['old', oldSettle], ['p6', p6Settle]]) {
    results[rule] = { forward: view(settle(fixture, null, [load({ a: 1, b: 2 })], { hint: ['A', 'B'] })), reverse: view(settle(fixture, null, [load({ a: 1, b: 2 })], { hint: ['B', 'A'] })) };
    expect(results[rule].forward, { a: 1 });
    expect(results[rule].reverse, rule === 'old' ? { b: 2 } : { a: 1 });
  }
  assert.equal(shapePoints(fixture, { a: 1, b: 2 }).length, 2);
  report('E9', '고정점 둘인 형상과 순서 힌트', fixture, [load({ a: 1, b: 2 })], results, 'F13 제한으로 이력 힌트 차이는 제거됩니다. 선언 순서는 고정하며 고정점 자체는 둘입니다.');
  scenarios++;
}

{
  const fixture = schema(['x'], [fragment('F', G => G.x !== 1, ['x'], { x: 1 })]);
  const writes = [load({})];
  const results = { old: view(oldSettle(fixture, null, writes)), p6: view(p6Settle(fixture, null, writes)), fixedPoints: defaultPoints(fixture, null, writes) };
  expect(results.old, { x: 1 });
  assert.equal(results.p6.status, 'candidate-cycle');
  assert.deepEqual(results.fixedPoints, []);
  report('N1', '자신을 끄는 기본값: 결합 고정점 부재', fixture, writes, results, 'P6 적용 범위와 실패 정책이 필요합니다. 최종 F가 켜져 있으면 x=1로 꺼지고, 꺼지면 주입이 폐기되어 다시 켜집니다.');
  scenarios++;
}

{
  const fixture = schema(['x'], [fragment('F', G => G.x === 1, ['x'], { x: 1 })]);
  const writes = [load({})];
  const results = { old: view(oldSettle(fixture, null, writes)), p6: view(p6Settle(fixture, null, writes)), p6AlternativeCandidate: view(p6Settle(fixture, null, writes, { seed: { x: 1 } })), fixedPoints: defaultPoints(fixture, null, writes) };
  expect(results.old, {});
  expect(results.p6, {});
  expect(results.p6AlternativeCandidate, { x: 1 });
  assert.equal(results.fixedPoints.length, 2);
  assert.equal(shapePoints(fixture, {}).length, 1);
  assert.equal(shapePoints(fixture, { x: 1 }).length, 1);
  report('N2', '자신을 켜는 기본값: 결합 고정점 둘', fixture, writes, results, 'P6의 해 선택 모호성입니다. 대체 seed는 사용자 쓰기 경로가 아닌 진단용 후보입니다. raw별 형상 유일성으로 결합 유일성을 증명할 수 없습니다.');
  scenarios++;
}

const chainFixture = schema(['a', 'b', 'c'], [], {}, [edge('a', 'b', value => value * 10), edge('b', 'c', value => value + 1)]);
{
  const start = snapshot(chainFixture, { a: 0, b: 0, c: 99 });
  const writes = [set('a', 1), set('a', 0)];
  const results = compare(chainFixture, start, writes);
  for (const rule of ['old', 'p6']) {
    expect(results[rule].sequential, { a: 0, b: 0, c: 1 });
    expect(results[rule].batch, { a: 0, b: 0, c: 99 });
    expect(replay(chainFixture, start, [set('a', 1)], rule, true), { a: 1, b: 10, c: 11 });
  }
  report('N3', 'a→b→c와 원천 왕복', chainFixture, { start: start.raw, writes }, results, 'P6의 배치 동치 반례입니다. 단일 a=1에서는 양쪽 모두 b=10,c=11로 전파됩니다.');
  scenarios++;
}

const targetFixture = schema(['on', 'src'], [fragment('F', G => G.on === true, ['tgt'], { tgt: 'D' })], {}, [edge('src', 'tgt', value => `f(${value})`)]);
{
  const start = snapshot(targetFixture, { on: false, src: 0 });
  const writes = [set('on', true), set('src', 1), set('tgt', 'mine')];
  const results = compare(targetFixture, start, writes);
  for (const rule of ['old', 'p6']) {
    expect(results[rule].sequential, { on: true, src: 1, tgt: 'mine' });
    expect(results[rule].batch, { on: true, src: 1, tgt: 'f(1)' });
  }
  const inputOnly = compare(branchFixture, snapshot(branchFixture, {}), [set('kind', 'a'), set('x', 'mine'), set('kind', 'b')]);
  for (const rule of ['old', 'p6']) for (const partition of ['sequential', 'batch']) expect(inputOnly[rule][partition], { kind: 'b', x: 'mine' });
  report('N4', 'batch의 fragment 전환과 사용자 target 입력', targetFixture, { start: start.raw, writes }, { ...results, defaultOnlyControl: inputOnly }, '기본값은 사용자 값을 보존하지만 injectTo 전체 교체는 덮습니다. 사용자/자동 쓰기 우선순위와 배치 의미를 별도 규정해야 합니다.');
  scenarios++;
}

{
  const start = snapshot(sourceFixture, { src: 'x', tgt: 'mine' });
  const writes = [load({ src: 'x', tgt: 'custom' })];
  const results = {};
  for (const [rule, settle] of [['old', oldSettle], ['p6', p6Settle]]) {
    results[rule] = { mountAbsent: view(settle(sourceFixture, null, writes)), mountLoaded: view(settle(sourceFixture, null, writes, { reference: 'loaded' })), resetRetained: view(settle(sourceFixture, start, writes)), resetEmpty: view(settle(sourceFixture, start, writes, { reference: 'empty' })) };
    expect(results[rule].mountAbsent, { src: 'x', tgt: 'f(x)' });
    expect(results[rule].mountLoaded, { src: 'x', tgt: 'custom' });
    expect(results[rule].resetRetained, { src: 'x', tgt: 'custom' });
    expect(results[rule].resetEmpty, { src: 'x', tgt: 'f(x)' });
  }
  report('N5', 'mount/reset의 시작 상태 정의', sourceFixture, { start: start.raw, writes }, results, '초기화 규칙의 모호성입니다. F4는 active 기준 초기화이며 injectTo 원천 기준까지 비운다는 뜻은 아닙니다.');
  scenarios++;
}

{
  const start = snapshot(targetFixture, { on: false, src: 0 });
  const writes = [set('src', 1), set('on', true)];
  const activeTarget = compare(targetFixture, start, writes);
  const latentTarget = compare(targetFixture, start, writes, { target: 'latent' });
  const reverseWrites = [set('on', true), set('src', 1)];
  const reverse = compare(targetFixture, start, reverseWrites);
  for (const rule of ['old', 'p6']) {
    expect(activeTarget[rule].sequential, { on: true, src: 1, tgt: 'D' });
    expect(activeTarget[rule].batch, { on: true, src: 1, tgt: 'f(1)' });
    expect(latentTarget[rule].sequential, { on: true, src: 1, tgt: 'f(1)' });
    expect(latentTarget[rule].batch, { on: true, src: 1, tgt: 'f(1)' });
    expect(reverse[rule].sequential, { on: true, src: 1, tgt: 'f(1)' });
  }
  report('N6', '같은 settle에 활성화되는 injectTo target', targetFixture, { start: start.raw, writes, reverseWrites }, { activeTarget, latentTarget, reverse }, '비활성 target 쓰기 허용 여부가 미결입니다. active-only에서는 원천 에지가 먼저 소진되어 P6도 경로 차이를 유지합니다.');
  scenarios++;
}

{
  const fixture = schema(['a', 'b'], [fragment('A', G => G.a === true, ['x'], { x: 'A' }), fragment('B', G => G.b === true, ['x'], { x: 'B' })]);
  const start = snapshot(fixture, { a: false, b: false });
  const writes = [set('a', true), set('b', true)];
  const lastWinner = compare(fixture, start, writes);
  const firstWinner = compare(fixture, start, writes, { winner: 'first' });
  for (const rule of ['old', 'p6']) {
    expect(lastWinner[rule].sequential, { a: true, b: true, x: 'A' });
    expect(lastWinner[rule].batch, { a: true, b: true, x: 'B' });
    expect(firstWinner[rule].batch, { a: true, b: true, x: 'A' });
  }
  // Both guards depend only on unconditional keys, which certifies unique shape for this fixture.
  const reverseHint = view(p6Settle(fixture, start, writes, { hint: ['B', 'A'], uniqueShape: true }));
  expect(reverseHint, { a: true, b: true, x: 'B' });
  const previouslyActive = snapshot(fixture, { a: false, b: true });
  const finalWinner = view(p6Settle(fixture, previouslyActive, [set('a', true)]));
  expect(finalWinner, { a: true, b: true, x: 'B' });
  report('N7', '최종 집합에 함께 남는 두 default 선언', fixture, { start: start.raw, writes, extra: { start: previouslyActive.raw, writes: [set('a', true)] } }, { lastWinner, firstWinner, reverseHint, finalWinner }, 'default 승자 규칙은 P6가 정하지 않습니다. last-wins를 정해도 기존 커밋값 때문에 배치 동치는 회복되지 않습니다. 승자는 새 조각만이 아닌 최종 활성 선언 전체에서 고릅니다.');
  scenarios++;
}

{
  const fixture = schema(['a', 'b', 'c'], [], {}, [edge('a', 'b', () => 0), edge('b', 'c', value => `f(${value})`)]);
  const start = snapshot(fixture, { a: 0, b: 0, c: 'mine' });
  const writes = [set('a', 1), set('b', 1)];
  const results = { old: view(oldSettle(fixture, start, writes)), p6: view(p6Settle(fixture, start, writes)) };
  expect(results.old, { a: 1, b: 0, c: 'f(1)' });
  expect(results.p6, { a: 1, b: 0, c: 'mine' });
  report('N8', 'chain 중간 에지가 최종 원천에서 사라짐', fixture, { start: start.raw, writes }, results, '강한 P6 후보 재구성으로 해결됩니다. D-12의 default만 폐기하고 injectTo 출력을 누적하면 이 반례는 남습니다.');
  scenarios++;
}

{
  const fixture = schema(['x'], [
    fragment('zero', G => G.x === 1, ['x'], { x: 0 }),
    fragment('one', G => !Object.hasOwn(G, 'x') || G.x === 0, ['x'], { x: 1 }),
    fragment('two', G => G.x === 2, ['x'], { x: 2 }),
  ]);
  const writes = [load({})];
  const results = { old: view(oldSettle(fixture, null, writes)), p6: view(p6Settle(fixture, null, writes)), fixedPoints: defaultPoints(fixture, null, writes), solutionSeed: view(p6Settle(fixture, null, writes, { seed: { x: 2 } })) };
  expect(results.old, { x: 1 });
  assert.equal(results.p6.status, 'candidate-cycle');
  assert.deepEqual(results.fixedPoints, [{ raw: { x: 2 }, active: ['two'], emit: { x: 2 } }]);
  expect(results.solutionSeed, { x: 2 });
  report('N9', '유일 고정점이 있어도 후보 반복은 수렴하지 않음', fixture, writes, results, '해 존재/유일성은 반복 알고리즘의 수렴 보장이 아닙니다. P6 구현에는 도달 가능성 또는 단조성/층화 같은 추가 조건이 필요합니다.');
  scenarios++;
}

{
  const writes = [set('kind', 'a'), set('kind', 'b')];
  const cases = ['', null, 'mine'].map(value => {
    const start = snapshot(branchFixture, { x: value });
    const results = compare(branchFixture, start, writes);
    for (const rule of ['old', 'p6']) for (const partition of ['sequential', 'batch']) expect(results[rule][partition], { kind: 'b', x: value });
    return { value, results };
  });
  const fixture = schema(['kind'], [fragment('F', G => G.kind === 'a', ['x'], { x: 'D' })]);
  const activeMissing = snapshot(fixture, { kind: 'a' });
  const results = { partial: view(p6Settle(fixture, activeMissing, [set('kind', 'a')])), reset: view(p6Settle(fixture, activeMissing, [load({ kind: 'a' })])) };
  expect(results.partial, { kind: 'a' });
  expect(results.reset, { kind: 'a', x: 'D' });
  report('C1', '없음/빈 값과 F4 reset 대조군', branchFixture, writes, { cases, resetFixture: fixture, resetStart: activeMissing.raw, results }, '기존 값, 빈 문자열, null은 기본값으로 덮지 않습니다. 활성 집합이 같아도 reset은 전이 기준을 비웁니다.');
  scenarios++;
}

// These finite checks exercise all short source paths, not just the hand-picked round trip.
{
  const start = snapshot(sourceFixture, { src: 'x', tgt: 'mine' });
  let paths = [[]];
  const cases = [];
  for (let length = 1; length <= 3; length++) {
    paths = paths.flatMap(path => ['x', 'y', 'z'].map(value => [...path, value]));
    for (const path of paths) {
      const results = compare(sourceFixture, start, path.map(value => set('src', value)));
      const final = path.at(-1);
      const expectedBatch = final === 'x' ? 'mine' : `f(${final})`;
      const expectedSequential = path.some(value => value !== 'x') ? `f(${final})` : 'mine';
      for (const rule of ['old', 'p6']) {
        expect(results[rule].batch, { src: final, tgt: expectedBatch });
        expect(results[rule].sequential, { src: final, tgt: expectedSequential });
      }
      cases.push({ path, different: expectedBatch !== expectedSequential });
    }
  }
  assert.equal(cases.length, 39);
  assert.equal(cases.filter(c => c.different).length, 10);
  report('C2', '원천 경로 39개 전수 검사', sourceFixture, { start: start.raw, alphabet: ['x', 'y', 'z'], lengths: [1, 2, 3] }, { paths: cases.length, divergentPaths: cases.filter(c => c.different).map(c => c.path) }, 'old/P6 모두 39개 중 10개에서 배치 분할 차이를 보입니다.');
  scenarios++;
}

assert.equal(scenarios, 16);
console.log(`PASS: ${scenarios}개 실험 그룹, 39개 원천 경로, 모든 자기 단언 통과. 제품 라이브러리는 실행하지 않았습니다.`);
