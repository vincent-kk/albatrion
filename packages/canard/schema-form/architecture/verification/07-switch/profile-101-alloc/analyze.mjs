// Read-only report derivation; stdout is consumed by the native file editor, no report writes here.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const artifacts = path.dirname(fileURLToPath(import.meta.url));
const directory = path.dirname(artifacts);
const pkg = path.resolve(directory, '../../..');
const repo = path.resolve(pkg, '../../..');
const head = '619798ddc6d6c70f27e1a7058421b94a4a6713b1';
const analysisStartedMs = Date.now();
const names = ['nested-d5-f4', 'flat-500', 'oneOf-20', 'sample-0'];
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length * .5) - 1];
const average = values => values.reduce((a, b) => a + b, 0) / values.length;
const quantile = (values, p) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * p) - 1];
const relative = file => path.relative(directory, file);
const fmt = (value, digits = 0) => value.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });
const definitions = [
  { id: 'declarations', name: '선언·fragment 기록 및 수집 작업 벡터', paths: ['/analyze/collectDeclarations.ts'],
    retained: 'fragment, 원본 declaration, order/gates 및 fragment의 declares/overlays/inheritedOverlays/children 배열은 청사진에 남습니다.',
    discarded: '방문 stack, 재귀 result 배열, keyword tuple iterator는 분석 뒤 버립니다.',
    erasure: 'collectDeclarations의 최외곽 호출 결과와 생성 fragment를 seed tape에서 가져오고 ID/capability/owner 상태만 재생합니다. 재귀 생산·검사 전체를 생략합니다.',
    overlap: 'readAllowedTypes와 정적 진단 같은 하위 계산도 생략합니다. 타입 묶음과 상한을 더할 수 없습니다.' },
  { id: 'node-staging', name: '노드 기록·타입 group·생성용 staging 벡터', paths: ['/analyze/buildNodes.ts', '/types/resolveNodeTypes.ts'],
    retained: '최종 BlueprintNode, node.declarations, childEntries, union일 때 schemaType 배열은 남습니다.',
    discarded: 'type group, collected→owned/conjunction 복사, nonNull staging, 로컬 nodes 벡터 및 static merge용 node 복사본은 버립니다.',
    erasure: 'resolveNodeTypes 결과, nonNull 및 nodes 벡터를 재사용하고 collected/owned/conjunction staging을 기존 선언 배열로 대체합니다. 최종 노드 객체는 새로 만듭니다.',
    overlap: '타입 판정 및 readAllowedTypes를 생략합니다. buildNodes의 hostPaths/boundKey 할당도 이 귀속 칸에 들어가지만 key 실험에서 제거합니다.' },
  { id: 'child-bindings', name: '자식 SchemaInput·binding 선언·작업 배열', paths: ['/analyze/populateNodeChildren.ts'],
    retained: 'child entry, 경로에 바인딩한 declaration 복사본 및 entry.declarations/gates는 청사진에 남습니다.',
    discarded: 'properties/tuples Map, SchemaInput, order/gate 병합 배열, entries tuple과 filter/map 작업 결과·callback은 버립니다.',
    erasure: '자식 입력 수집 결과와 binding 선언 배열을 재사용합니다. fragment 참조는 현재 context에 연결합니다. buildNodes 재귀 호출과 최종 child entry 생성은 유지합니다.',
    overlap: '입력 수집 및 바인딩 callback의 계산도 생략합니다. SchemaInput 자체를 공유하는 실험이며 생산용 안전한 공유는 아닙니다.' },
  { id: 'effective-merge', name: '정규화·병합 state·memo 및 결과', paths: ['/effectiveSchema/'],
    retained: '정규화 schema/effective 결과는 실제 blueprint node를 key로 하는 DEFAULT_NO_ACTIVE/DEFAULT_MEMO 또는 runtime node.schema에서 유지됩니다.',
    discarded: 'static 임시 node 복사본을 key로 만든 memo, 기여 state, patterns/types/선택 선언/key 배열은 버립니다. 이 static memo는 청사진 본체에 남지 않습니다.',
    erasure: 'mergeEffectiveSchema 전체 결과를 호출 순서 tape에서 가져오며 state, memo, 정규화 결과를 clock 안에 만들지 않습니다.',
    overlap: 'apply/finalize/타입 읽기·정적 검사도 생략합니다. 타입·선언 상한과 더하지 않습니다.' },
  { id: 'allowed-types', name: 'allowed-type 임시 배열', paths: ['/types/'],
    retained: '일부 결과가 최종 union schemaType/정규화 type에 사용됩니다. scalar 노드에서는 allowed 배열 자체가 청사진 필드로 남지 않습니다.',
    discarded: 'values/result/union 입력, group의 allowed 배열과 타입 읽기 callback 대부분을 버립니다.',
    erasure: 'readAllowedTypes 결과를 재사용하여 이 함수가 만드는 타입 배열과 검사를 생략합니다. 다른 타입 helper의 독립 호출과 최종 schemaType는 남습니다.',
    overlap: '검증·union 계산도 생략합니다. 수집·병합·type group 재사용과 중복됩니다.' },
  { id: 'strategy-cases', name: '전략 판정 case tree와 필터 벡터', paths: ['/types/resolveNodeStrategy.ts'],
    retained: 'branch/terminal 문자열만 노드에 남습니다.',
    discarded: 'count/relevant 필터, case record/Map, pending stack, gate key와 callback은 전부 버립니다.',
    erasure: 'resolveNodeStrategy의 반환 문자열을 재사용합니다. case tree·필터·정적 terminal 검사는 clock 안에서 만들거나 실행하지 않습니다.',
    overlap: '순수 할당 비용뿐 아니라 진단·renderer 판정 비용도 빠집니다.' },
  { id: 'template-keys', name: 'template-key 문자열·인코딩 배열', paths: ['/analyze/getTemplateKey.ts'],
    retained: 'constructing/templates Map의 key로 분석 중 유지되며 최종 청사진에는 남지 않습니다.',
    discarded: 'inputs/gates tuple, 중복 제거 배열, hostPaths 및 두 JSON 인코딩용 배열·문자열은 분석 뒤 버립니다.',
    erasure: 'getTemplateKey + hostPaths + boundKey 결과를 재사용합니다. key 생성·JSON 인코딩·중복 제거를 생략하고 실제 template lookup은 유지합니다.',
    overlap: 'hostPaths/boundKey의 source sample은 node-staging에 귀속됩니다. 표의 개수는 중복 없이 귀속한 값이고 이 상한은 그 칸 일부도 제거합니다.' },
  { id: 'first-load-frames', name: '첫 로드 frame 및 load 작업 슬롯', paths: ['/settle/utils/load/'],
    retained: 'runtime의 structure/children 및 최종 value는 남습니다. 청사진에 load frame은 남지 않습니다.',
    discarded: 'DFS Frame, stack, warning/delta 작업 슬롯은 mount 정착 뒤 버립니다.',
    erasure: 'DFS Frame만 pool에서 재사용하고 node/input/index/flags를 초기화합니다. 구조·children·warning/delta의 필수 최종 기록과 실제 load/commit은 유지합니다.',
    overlap: '전체 load site가 아니라 frame 제거의 상한입니다. nested의 1,365 frame을 없애도 전체 site 16,734 표본이 모두 없어지는 것은 아닙니다.' },
  { id: 'runtime-nodes', name: '런타임 노드 및 초기 container', paths: ['/SchemaNode/'],
    retained: 'RuntimeSchemaNode와 structure/children/interactionState는 runtime graph에 남습니다. 청사진 객체는 아닙니다.',
    discarded: 'factory의 경로 문자열·options 및 최초 load가 교체하는 branch placeholder container는 버립니다.',
    erasure: 'createSchemaNode 결과를 seed에서 재사용합니다. 실제 RuntimeSchemaNode 생성 및 초기 container를 만들지 않습니다. runtime graph까지 공유합니다.',
    overlap: '잘못된 runtime 공유로 다른 settle 경로를 탈 수 있습니다. 정상적인 새 node 생성의 순수 비용과 동일시하지 않습니다.' },
  { id: 'object-assembly', name: '값 조립 Map·names·Set·출력 record', paths: ['/assembleObject.ts'],
    retained: '조립한 object/patch는 local/emit에, STABLE_SHAPES names는 runtime node 수명 동안 남습니다.',
    discarded: 'childValues Map, seen Set, oldNames, 조립 작업 벡터는 버립니다.',
    erasure: 'assembleObject 결과 object를 재사용하여 조립용 자료구조와 최종 output object 모두를 만들지 않습니다.',
    overlap: '값 조립 계산 및 STABLE_SHAPES 등록도 생략합니다. 최종 값 object의 소유권 검증이 없습니다.' },
  { id: 'dependency-paths', name: '의존 경로 segment·바인딩 문자열', paths: ['/settle/utils/paths/'],
    retained: '정규 경로 일부는 dependency trie/registry에 남습니다. 대부분의 단기 경로는 청사진에 남지 않습니다.',
    discarded: 'split/filter parts 및 상대 경로 slice/join 결과 대부분은 읽기 뒤 버립니다.',
    erasure: 'resolveDependencyPath의 정규 경로 문자열을 재사용하여 segment 배열 및 계산을 만들지 않습니다.',
    overlap: 'gate 및 dependency-index 재사용이 이 함수의 호출도 제거합니다.' },
  { id: 'gate-workspaces', name: 'gate 입력·projected 읽기·read plan·binding 슬롯', paths: ['/settle/utils/gates/', '/analyze/collectGateEvaluationReads.ts'],
    retained: 'registry의 occurrence/host binding, READ_PLANS의 occurrence 배열은 node/blueprint 수명 동안 남습니다.',
    discarded: '평가용 host/input 복사본, projected path 배열, evaluation callback, pending flush closure는 버립니다.',
    erasure: 'evaluateGate의 boolean을 재사용하고 flushPendingGateReads를 생략합니다. 입력 복사·projected read·read-plan 생산을 clock 안에서 하지 않습니다.',
    overlap: '경로 해석·expression 평가·registry 접근·출력 flush도 빠집니다. 경로/index 상한과 더하지 않습니다.' },
  { id: 'selection-workspaces', name: '자식 선택 next·active·ids·seen 벡터', paths: ['/compute/selectChildren.ts'],
    retained: 'next structure/children과 selected declaration IDs는 runtime/settlement에 남습니다. STATIC_SHAPES/STATIC_IDS는 blueprint key의 cache입니다.',
    discarded: 'seen/inactive/active 작업 배열, priorNames 등의 선택 workspace는 settle 뒤 버립니다.',
    erasure: 'next record, seen Set, inactive/active/ids/children 배열을 pool에서 재사용합니다. 실제 gate 평가·자식 생성·선택 루프는 실행합니다.',
    overlap: 'Set.clear 뒤 backing storage와 retained array 재사용의 위험은 남습니다. 대부분의 branchless fixture는 이 경로를 사용하지 않습니다.' },
  { id: 'dependency-index', name: '역의존 trie·owner record·선언 dictionary', paths: ['/write/getDependencyIndex.ts'],
    retained: 'owner/children trie와 ownerPaths Set은 blueprint를 key로 한 INDEXES에서 유지됩니다.',
    discarded: 'declaration dictionary, entries tuple, path segment 및 constructor 작업 배열은 버립니다.',
    erasure: 'getDependencyIndex 결과를 재사용하여 새 trie, owner record, 선언 dictionary를 만들지 않습니다.',
    overlap: 'derive/context-owner/index 준비 및 경로 해석도 생략합니다. 같은 fixture를 새 blueprint마다 재사용하는 비제품 실험입니다.' },
];

/** Assign self allocations once; native leaves retain their nearest product-source owner. */
function assign(file) {
  if (file.includes('/types/resolveNodeStrategy.ts')) return 'strategy-cases';
  if (file.includes('/types/resolveNodeTypes.ts')) return 'node-staging';
  return definitions.find(row => row.paths.some(pattern => file.includes(pattern)))?.id ?? 'other';
}

const baseline = {}, sites = {}, baselineReferences = [];
const originalBundleChecks = ['head', 'old'].map(version => {
  const file = path.join(directory, 'profile-101-gc/bundles', version + '.cjs');
  const sha256 = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(sha256, read(path.join(directory, 'profile-101-gc', 'build-' + version + '.summary.json')).sha256);
  return { version, file: relative(file), sha256 };
});
for (const name of names.slice(0, 3)) {
  const buckets = Object.fromEntries([...definitions.map(row => row.id), 'other'].map(id => [id,
    { objects: 0, bytes: 0, blueprintObjects: 0, blueprintBytes: 0, restObjects: 0, restBytes: 0 }]));
  const ownerSites = new Map(); const totals = [];
  for (let run = 1; run <= 3; run++) {
    const file = path.join(directory, 'profile-101-gc/supplement', `objects-supp-default-${name}-old-w20-r${run}.summary.json`);
    baselineReferences.push(relative(file));
    const summary = read(file), heap = summary.heap.head;
    assert.equal(summary.samples, 101); assert.equal(summary.samplingIntervalBytes, 1);
    assert.equal(heap.unknownObjectsPerMount, 0);
    totals.push(heap);
    for (const row of heap.functions) {
      const owner = row.owner ?? row, id = assign(owner.file), bucket = buckets[id];
      const objects = row.samples / 303, bytes = row.bytes / 303;
      bucket.objects += objects; bucket.bytes += bytes;
      bucket[row.phase === 'blueprint' ? 'blueprintObjects' : 'restObjects'] += objects;
      bucket[row.phase === 'blueprint' ? 'blueprintBytes' : 'restBytes'] += bytes;
      const key = `${owner.function}|${owner.file}:${owner.line}`;
      const held = ownerSites.get(key) ?? { function: owner.function, file: owner.file, line: owner.line, bundle: id, objects: 0, bytes: 0 };
      held.objects += objects; held.bytes += bytes; ownerSites.set(key, held);
    }
  }
  const total = { objects: average(totals.map(row => row.objectsPerMount)), bytes: average(totals.map(row => row.bytesPerMount)),
    blueprintObjects: average(totals.map(row => row.blueprintObjectsPerMount)), blueprintBytes: average(totals.map(row => row.blueprintBytesPerMount)),
    restObjects: average(totals.map(row => row.restObjectsPerMount)), restBytes: average(totals.map(row => row.restBytesPerMount)) };
  assert(Math.abs(Object.values(buckets).reduce((sum, row) => sum + row.objects, 0) - total.objects) < 1e-6);
  assert(Math.abs(Object.values(buckets).reduce((sum, row) => sum + row.bytes, 0) - total.bytes) < 1e-5);
  const aboveTwoPercent = [...ownerSites.values()].filter(row => row.objects >= total.objects * .02);
  assert(aboveTwoPercent.every(row => row.bundle !== 'other'), 'Uncovered allocation site >= 2%');
  baseline[name] = { total, bundles: buckets, aboveTwoPercent };
  sites[name] = [...ownerSites.values()].toSorted((a, b) => b.objects - a.objects);
}

/** Deterministic ordinary bootstrap; report uncertainty without claiming independent consecutive samples. */
function bootstrapError(values, seed) {
  const result = [], center = median(values); let state = seed >>> 0;
  const draw = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  for (let repetition = 0; repetition < 1999; repetition++) {
    const sample = [];
    for (let i = 0; i < values.length; i++) sample.push(values[Math.floor(draw() * values.length)]);
    result.push(median(sample));
  }
  const lower = quantile(result, .005), upper = quantile(result, .995);
  return { lower, upper, error: Math.max(center - lower, upper - center), resamples: 1999, seed };
}

const controls = {};
for (const name of names) for (const regime of ['forced', 'steady']) {
  const rows = [1, 2, 3].map(run => read(path.join(artifacts, `control-${name}-${regime}-r${run}.json`)));
  for (const row of rows) {
    assert.equal(row.warmup, 20); assert.equal(row.samples, 101); assert.equal(row.windows.length, 202);
    assert.equal(row.observations.head.sha256, row.observations.variant.sha256);
    assert.equal(row.correction, median([...row.emptyTimingsMs.before, ...row.emptyTimingsMs.after]));
    assert.equal(row.actualMounts.head, 121); assert.equal(row.actualMounts.variant, 121); assert.equal(row.seedIsFirstWarmup, true);
    if (regime === 'forced') assert(!row.gc.some(event => row.windows.some(window => event.start >= window.begin && event.start < window.end)));
  }
  const empties = rows.flatMap(row => [...row.emptyTimingsMs.before, ...row.emptyTimingsMs.after].map(ms => Math.abs(ms - row.correction)));
  controls[name + '/' + regime] = { maxAbsoluteNoopBoundMs: Math.max(...rows.map(row => Math.abs(row.boundMs))),
    emptyP95AbsoluteResidualMs: quantile(empties, .95), noopBoundMs: rows.map(row => row.boundMs),
    references: [1, 2, 3].map(run => `profile-101-alloc/control-${name}-${regime}-r${run}.json`) };
}

const timingReferences = [], diagnostics = {};
const bundles = definitions.map((definition, index) => {
  const timings = {};
  for (const name of names) {
    timings[name] = {};
    for (const regime of ['forced', 'steady']) {
      const control = controls[name + '/' + regime];
      const rows = [1, 2, 3].map(run => {
        const file = path.join(artifacts, `${definition.id}-${name}-${regime}-r${run}.json`), row = read(file);
        assert.equal(row.head, head); assert.equal(row.samples, 101); assert.equal(row.warmup, 20);
        assert.equal(row.actualMounts.head, 121); assert.equal(row.actualMounts.variant, 121); assert.equal(row.seedIsFirstWarmup, true);
        assert.equal(row.timingsMs.head.length, 101); assert.equal(row.timingsMs.variant.length, 101);
        assert.equal(row.windows.length, 202); assert.equal(row.forcedGC, regime === 'forced');
        assert.equal(row.observations.head.sha256, row.observations.variant.sha256);
        assert(row.elapsedMs < 480_000);
        const expected = median([...row.emptyTimingsMs.before, ...row.emptyTimingsMs.after]);
        assert.equal(row.correction, expected);
        assert(Math.abs(row.metrics.head.median - (median(row.timingsMs.head) - expected)) < 1e-8);
        assert(Math.abs(row.metrics.variant.median - (median(row.timingsMs.variant) - expected)) < 1e-8);
        const errors = { head: bootstrapError(row.timingsMs.head, 71_101 + index * 1000 + names.indexOf(name) * 10 + run),
          variant: bootstrapError(row.timingsMs.variant, 93_101 + index * 1000 + names.indexOf(name) * 10 + run) };
        const noise = Math.max(.001, control.maxAbsoluteNoopBoundMs,
          control.emptyP95AbsoluteResidualMs + errors.head.error + errors.variant.error);
        const windows = row.windows;
        const gc = Object.fromEntries(['head', 'variant'].map(version => {
          const selected = windows.filter(window => window.version === version);
          const pauses = selected.map(window => row.gc.filter(event => event.start >= window.begin && event.start < window.end));
          return [version, { mountsWithGC: pauses.filter(events => events.length).length,
            meanPauseMs: pauses.reduce((sum, events) => sum + events.reduce((s, event) => s + event.ms, 0), 0) / 101 }];
        }));
        if (regime === 'forced') assert.equal(gc.head.mountsWithGC + gc.variant.mountsWithGC, 0);
        timingReferences.push(relative(file));
        return { run, file: relative(file), boundMs: row.boundMs, headMs: row.metrics.head.median, variantMs: row.metrics.variant.median,
          noiseMs: noise, aboveNoise: row.boundMs > noise, belowNegativeNoise: row.boundMs < -noise,
          targetActive: Object.values(row.tapeLengths).some(length => length > 0), tapeLengths: row.tapeLengths, bootstrap: errors, gc };
      });
      const active = rows.every(row => row.targetActive);
      timings[name][regime] = { representativeBoundMs: median(rows.map(row => row.boundMs)),
        representativeHeadMs: median(rows.map(row => row.headMs)), representativeVariantMs: median(rows.map(row => row.variantMs)),
        minBoundMs: Math.min(...rows.map(row => row.boundMs)), maxBoundMs: Math.max(...rows.map(row => row.boundMs)),
        maxNoiseMs: Math.max(...rows.map(row => row.noiseMs)),
        aboveNoise: active && rows.every(row => row.aboveNoise),
        regressionAboveNoise: active && rows.every(row => row.belowNegativeNoise), targetActive: active, rows };
    }
  }
  const allocationDiagnostics = {};
  for (const name of names.slice(0, 3)) {
    const control = read(path.join(artifacts, `allocation-control-${name}-r1.json`));
    const variant = read(path.join(artifacts, `allocation-${definition.id}-${name}-r1.json`));
    allocationDiagnostics[name] = { controlObjects: control.objects, variantObjects: variant.objects,
      objectsRemoved: control.objects - variant.objects, bytesRemoved: control.bytes - variant.bytes,
      controlBlueprintObjects: control.blueprintObjects, variantBlueprintObjects: variant.blueprintObjects,
      blueprintObjectsRemoved: control.blueprintObjects - variant.blueprintObjects,
      file: `profile-101-alloc/allocation-${definition.id}-${name}-r1.json`, tapeLengths: variant.tapeLengths };
  }
  return { ...definition, allocations: Object.fromEntries(names.slice(0, 3).map(name => [name, baseline[name].bundles[definition.id]])),
    sourceSites: Object.fromEntries(names.slice(0, 3).map(name => [name, sites[name].filter(site => site.bundle === definition.id)])),
    timings, allocationDiagnostics };
});

const fixCatalog = {
  'effective-merge': { title: 'buildNodes의 일회성 static 정규화에서 memo staging 생략',
    change: '일회성 static normalization 전용 경로가 선택 선언을 같은 순서로 mergeSchemaContributions에 넘기고 최종 effective 결과에 바로 씁니다. 임시 node 객체, options-key memo/Map, declaration-ID 문자열 cache를 만들지 않습니다. 실제 node의 DEFAULT_NO_ACTIVE 등록과 일반 runtime/public memo 경로는 유지합니다.',
    identical: 'isAtomic/collect 전달, 선언 선택 순서, apply/finalize 및 정적 type/const/pattern 오류·경고를 기존과 동일하게 실행합니다. 최종 schema/effective 필드와 freeze 상태를 바꾸지 않습니다.',
    estimatedBlueprintObjectsSavedPerNestedNode: [8, 12], target: 'static memo/key와 임시 node/options staging; 최종 schema/effective record는 유지' },
  'declarations': { title: 'FRAGMENT_KEYWORDS tuple destructuring을 직접 index 읽기로 변경',
    change: '한 loop에서 const [keyword, rank] 대신 const entry = FRAGMENT_KEYWORDS[keywordIndex], keyword = entry[0], rank = entry[1]로 읽습니다. node마다 반복 생성되는 tuple iterator/next record를 만들지 않습니다.',
    identical: 'keyword rank/순서, 방문/ref 검출, declaration/fragment ID, gates/order/owner와 validateControlGroups/readAllowedTypes/capability 수집을 그대로 실행합니다. 선언 record 자체의 단순 재사용을 재제안하는 사양이 아닙니다.',
    estimatedBlueprintObjectsSavedPerNestedNode: [10, 15], target: 'keyword tuple iteration protocol; final fragment/declaration은 유지' },
  'child-bindings': { title: '자식 입력 생산을 인자 기반 직접 loop로 결합',
    change: 'Object.entries→forEach와 filter→map→spread 체인을 순서 보존 생산기로 바꾸고 shared appendChildInput(context, node, declaration, name, schema, index, childrenControls)에 인자를 넘깁니다. 이름-스키마의 per-entry tuple 대신 flat snapshot을 사용하고 per-child callback/빈 gate 벡터/복사 단계용 base record 없이 최종 SchemaInput에 직접 씁니다.',
    identical: 'Object.entries와 같은 own enumerable key 순서와 키/값의 선행 snapshot 및 getter/Proxy trap 순서를 유지한 뒤 callback을 실행합니다. index/order, prototype/escaped 이름, discriminator 입력 복제, children-control gate 순서, array/prefixItems 정적 오류와 virtual 처리, 최종 binding declaration/entry의 내용·freeze를 유지합니다.',
    estimatedBlueprintObjectsSavedPerNestedNode: [10, 14], target: 'entries tuple/callback/base/filter-map gate scratch; 필요한 최종 binding record는 유지' },
  'template-keys': { title: 'template key 인코딩용 nested 배열을 streaming key로 대체',
    change: 'inputs/gates/hostPaths 배열 및 이중 JSON stringify의 배열 staging 대신 동일 문자열을 만드는 key encoder에 직접 씁니다. constructing의 미바인딩 key와 templates의 host 바인딩 key를 두 명시적 모드로 생성하고 기존 JSON 문자열과 byte 단위로 같게 만듭니다.',
    identical: 'ref-only canonical location, conjunction/declaration context, gate kind/path/negated/appliesWhen dedup와 hostPath 구별, 문자열 escape를 모두 유지합니다. key 문자열 자체가 기존과 같으므로 template/cycle 동치와 충돌 동작도 바꾸지 않습니다. blueprint 필드는 바꾸지 않습니다.',
    estimatedBlueprintObjectsSavedPerNestedNode: [10, 16], target: 'key tuple/gate/hostPaths 배열; 최종 두 key 문자열 및 실제 lookup은 유지' },
  'gate-workspaces': { title: '컴파일된 active gate의 인자형 projected evaluator',
    change: '컴파일된 active expression만 context/hostPath와 shared projected-read 함수를 명시적 인자로 받는 evaluator 경로로 바꿉니다. 빈 host/input object 복사와 read callback closure를 만들지 않습니다. authored function, discriminator, validator-if 경로는 기존 방식으로 유지합니다.',
    identical: 'projected 값 읽기 및 pending flush의 순서, declaration/gate 등록과 host binding, 예외 포착·boolean 검사·warning/error 코드와 경로·횟수를 유지합니다. gate boolean을 memo하거나 projected state를 다음 mount로 재사용하지 않습니다.',
    estimatedBlueprintObjectsSavedPerNestedNode: [0, 0], estimatedOneOfRuntimeObjectsSaved: [160, 800], target: 'compiled active evaluation input/closure; gate/read-plan/registry 기록은 유지' },
  'dependency-paths': { title: '정규 의존 경로를 occurrence/index 준비 때 한 번 생성',
    change: '같은 blueprint gate host+dependency 쌍의 상대 경로 resolve를 occurrence/index 준비 시 한 번 계산해 binding record에 보관합니다. evaluate/read/flush 단계는 보관된 정규 경로를 사용합니다.',
    identical: 'array * host의 실제 index 바인딩, ../ 이동과 @/#/absolute 처리 및 JSON Pointer escaping을 유지합니다. projected value 자체는 cache하지 않고 기존 순서로 읽습니다. 동적 host는 해당 occurrence 수명 단위에서 별도로 계산합니다.',
    estimatedBlueprintObjectsSavedPerNestedNode: [0, 0], estimatedOneOfRuntimeObjectsSaved: [2500, 4000], target: 'repeated split/filter/slice/join; distinct path record는 유지' },
  'dependency-index': { title: 'trie 삽입의 owner/watch segment를 한 번만 파싱',
    change: 'add에서 반복하던 ownerParts/watchedParts/indexedParts split을 한 번의 parse와 단일 segment walk로 결합합니다. 같은 owner의 parse 결과는 constructor 범위에서 재사용합니다. 노드/owner 레코드에 직접 씁니다.',
    identical: '* array watch의 ancestor collapse, bindable 판정, owner dedup/순서와 역의존 질의를 유지합니다. 새 blueprint마다 새 trie를 만들고 INDEXES의 수명/격리를 유지합니다.',
    estimatedBlueprintObjectsSavedPerNestedNode: [0, 0], estimatedOneOfRuntimeObjectsSaved: [900, 1700], target: 'add의 segment scratch; 필수 trie/owner/Set는 유지' },
  'runtime-nodes': { title: 'branch container를 최초 authoritative 단계에서 한 번 생성',
    change: 'factory constructor의 일회용 {} / [] placeholder를 늦추고 최초 load/selection이 최종 structure/children을 한 번 생성하도록 합니다. RuntimeSchemaNode는 mount마다 새로 만듭니다.',
    identical: 'gate가 초기 노드를 읽는 시점과 정착 callback 순서, active/detached/required 및 초기 interactionState를 유지합니다. 서로 다른 mount의 node/runtime/구독은 공유하지 않습니다. 정적 blueprint/warning 처리는 그대로 실행합니다.',
    estimatedBlueprintObjectsSavedPerNestedNode: [0, 0], estimatedRuntimeContainersSavedPerNestedMount: [682, 1364], target: '폐기되는 branch placeholder; 최종 RuntimeSchemaNode graph는 유지',
    limitation: 'oneOf의 양수 상한은 runtime 전체 공유 실험입니다. 작은 placeholder 제거가 그 시간 차이를 달성한다는 증거는 없으며, nested/flat에서 큰 퇴행이 있으므로 우선순위가 가장 낮습니다.' },
};
const preferred = ['effective-merge', 'declarations', 'template-keys', 'child-bindings',
  'gate-workspaces', 'dependency-paths', 'dependency-index', 'runtime-nodes'];
const uncoveredSpecs = bundles.filter(bundle => names.some(name => ['forced', 'steady'].some(regime => bundle.timings[name][regime].aboveNoise)) && !preferred.includes(bundle.id));
assert.equal(uncoveredSpecs.length, 0, 'A fix spec is required for: ' + uncoveredSpecs.map(row => row.id).join(', '));
const fixes = preferred.flatMap(id => {
  const bundle = bundles.find(row => row.id === id);
  const evidence = names.flatMap(name => ['forced', 'steady'].filter(regime => bundle.timings[name][regime].aboveNoise).map(regime => ({ name, regime,
    boundMs: bundle.timings[name][regime].representativeBoundMs, maxNoiseMs: bundle.timings[name][regime].maxNoiseMs })));
  if (!evidence.length) return [];
  const spec = fixCatalog[id], savings = spec.estimatedBlueprintObjectsSavedPerNestedNode;
  return [{ bundle: id, ...spec, evidence, estimatedBlueprintObjectsPerNestedNodeAfterSingleFix:
    [baseline['nested-d5-f4'].total.blueprintObjects / 1365 - savings[1], baseline['nested-d5-f4'].total.blueprintObjects / 1365 - savings[0]],
    estimateKind: '소스 구조에 근거한 계획 범위; V8 folding/JIT·호출 상호작용을 검증한 생산 측정값이 아님' }];
});
const planningSavings = fixes.map(row => row.estimatedBlueprintObjectsSavedPerNestedNode).reduce((sum, range) => [sum[0] + range[0], sum[1] + range[1]], [0, 0]);
const density = baseline['nested-d5-f4'].total.blueprintObjects / 1365;
const combined = Object.fromEntries(names.slice(0, 3).map(name => {
  const control = read(path.join(artifacts, `allocation-control-${name}-r1.json`));
  const result = read(path.join(artifacts, `allocation-combined-analysis-${name}-r1.json`));
  return [name, { controlObjects: control.objects, controlBlueprintObjects: control.blueprintObjects, objects: result.objects,
    blueprintObjects: result.blueprintObjects, blueprintObjectsPerNode: result.blueprintObjects / ({ 'nested-d5-f4': 1365, 'flat-500': 501, 'oneOf-20': 63 }[name]),
    file: `profile-101-alloc/allocation-combined-analysis-${name}-r1.json` }];
}));

const processFiles = fs.readdirSync(artifacts).filter(file => file.startsWith('process-'));
const processes = processFiles.map(file => ({ file: 'profile-101-alloc/' + file, ...read(path.join(artifacts, file)) }));
assert(processes.every(row => row.signal === null && row.elapsedMs < 480_000));
const workers = processes.filter(row => row.args.includes('--timer-worker'));
assert.equal(workers.length, 360); assert(workers.every(row => row.status === 0));
const chronology = workers.toSorted((a, b) => Date.parse(a.started) - Date.parse(b.started));
assert(chronology.every((row, index) => !index || Date.parse(row.started) >= Date.parse(chronology[index - 1].ended)), 'Overlapping measurement workers');
let largest = { bytes: 0, file: '' }, files = 0;
function scan(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
  const file = path.join(dir, entry.name); if (entry.isDirectory()) scan(file);
  else { const bytes = fs.statSync(file).size; assert(bytes <= 5_000_000, file); files++;
    if (bytes > largest.bytes) largest = { bytes, file: relative(file) }; }
} }
scan(artifacts);
assert.equal(execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), head);
const sourceTree = execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD:packages/canard/schema-form/src'], { cwd: repo, encoding: 'utf8' }).trim();
assert.equal(sourceTree, 'e04227e4378968282541c7bc072edd7ddff6437c');
execFileSync('git', ['--no-optional-locks', 'diff', '--exit-code', '--', 'packages/canard/schema-form/src'], { cwd: repo });

const summary = { schemaVersion: 1, title: '101 할당 중간 구조별 제거 상한', head, sourceTree,
  environment: read(path.join(artifacts, 'control-nested-d5-f4-forced-r1.json')).environment,
  method: { allocationCount: '기존 1-byte V8 allocation sampling의 101 samples × 3 산술 평균; major/minor로 수거한 할당 포함; allocation folding 유지; 정확한 JavaScript 객체 전수조사가 아님',
    attribution: 'native leaf는 가장 가까운 제품 source owner에 자기 할당을 귀속. 한 sample은 한 bundle에만 집계. 함수 안 여러 구조의 정확한 개수/byte 분리는 하지 못하므로 source family + retained/discarded 구조를 명시함',
    performance: '95C-01 validation-off sentinel: fresh process, 각 엔진 warmup 정확히 20(seed capture는 variant 첫 예열), 101 alternating pairs ×3, clone outside clock; forced GC 및 뒤 check anchor outside clock; steady는 forced GC/anchor 없이 엔진마다 101 consecutive fresh mounts ×3',
    correction: '회차의 앞/뒤 pooled 202 empty end-to-end controls median을 두 엔진 모두에 동일하게 차감. clock은 64 microtasks 뒤 setImmediate sentinel 안에서 캡처',
    representative: '각 회차 head median−variant median 3개의 median. 회차별 원시 timing, paired delta, noise/GC는 참조 파일 및 rows에 보존',
    noise: 'max(1µs, 동일 fixture/regime no-op 3회 abs bound 최대, empty residual p95 + 두 엔진 median ordinary bootstrap 99% 오차 합). 1999 resamples, deterministic seed. 세 회차 모두 넘고 target이 활성일 때만 aboveNoise=true. 연속 표본 독립성이나 제품 개선 유의성을 주장하지 않음',
    steadyRole: '기록 열; 자연 GC 포함. GC pause 평균을 median bound에 더하거나 빼지 않음',
    allocationDiagnosticWarmup: '별도 seed 1 mount 후 warmup 20와 profiler 1 mount; 시간 측정과 다른 진단 상태이며 303 창 평균/성능 증거로 쓰지 않음',
    boundMeaning: 'seed/shared structure를 사용하는 비제품 제거 실험의 종단 차이. 검사·loop·하위 계산·JIT/shape 유지도 달라질 수 있으며 순수 allocator 비용이나 채택 가능한 개선량이 아님. 중복 상한 합산 금지' },
  fixtures: names, baseline, baselineReferences, originalBundleChecks, controls, bundles, rankedFixSpecs: fixes,
  outlook: { currentBlueprintObjectsPerNestedNode: density, legacyWholeMountObjectsPerNestedNode: 89398 / 1365,
    targetBlueprintObjectsPerNode: 65, unsafeCombinedDiagnostic: combined,
    safeOneChangePlanningRange: [density - planningSavings[1], density - planningSavings[0]],
    verdict: '잡음 초과 묶음의 아래 한 변경 사양만으로 65/node 근접을 입증하지 못합니다. 계획 범위는 보수적으로 100/node를 넘습니다. 이상화 재사용 진단은 32.2/node이나 최종 선언/fragment/effective 결과와 정적 검사까지 재사용하므로 동일 계약 수정의 예상값이 아닙니다.',
    forcedStructures: ['서로 다른 id/path/schemaPath/role/scope를 가진 BlueprintNode, PropertyDeclaration, BlueprintFragment',
      '선언의 order/gates와 fragment의 declares/overlays/inheritedOverlays/children 순서 기록',
      'template 재사용 시 occurrence host/name/path/gates가 다른 child-binding/entry 기록',
      '정규화 schema/effective 결과와 active 선언·gate/read/dependency 의미를 보존하는 기록'],
    ledgerQuestion: '빈 frozen 배열 공유, order/gate suffix 표현, fragment/declaration/child-binding의 중복 메타데이터를 한 authoritative record/view로 표현할 수 있는지 ledger가 결정해야 합니다. 공개 청사진 내용·정적 진단 경로/순서/횟수 유지가 조건입니다. 이 기록들이 V8 sample 기준 65 이상의 하한을 강제한다고 증명하지는 않았습니다.' },
  audit: { timingWorkerCount: workers.length, timingWindowCount: 360 * 202, profilerMountCount: 48,
    allTimingWorkersNaturalStatusZero: true, exactlyTwentyWarmupsBothEngines: true, successfulProcesses: processes.filter(row => row.status === 0).length,
    failedSetupProcesses: processes.filter(row => row.status !== 0).map(row => ({ file: row.file, args: row.args, status: row.status })),
    maximumCommandSeconds: Math.max(...processes.map(row => row.elapsedMs)) / 1000, checkedFiles: files, largest,
    outputHashMatches: 360, coveredEveryAtLeastTwoPercentOwner: true, allocationTotalsConserved: true,
    productSourcesUnchanged: true, gitWrites: false, installs: false, sequential: true, measurementWorkerIntervalsDoNotOverlap: true },
  timingReferences, builds: Object.fromEntries(['head', 'control', ...definitions.map(row => row.id), 'combined-analysis'].map(id => [id, read(path.join(artifacts, `build-${id}.json`))])),
};

const mark = row => row.aboveNoise ? ' **↑**' : row.regressionAboveNoise ? ' **↓**' : row.targetActive ? '' : ' °';
const cell = row => `${fmt(row.representativeBoundMs, 4)}${mark(row)}`;
let report = `# 101 중간 구조별 할당·종단 제거 상한\n\n`;
report += `HEAD \`${head}\`, source tree \`${sourceTree}\`, ${summary.environment.cpu}, Node ${summary.environment.node}, V8 ${summary.environment.v8}. 측정은 지정 stage-07 worktree에서만 순차 실행했습니다. 제품 코드·git·설치는 변경하지 않았습니다.\n\n`;
report += `청사진 병합, 선언 수집, key 인코딩, 자식 입력/binding의 제거가 주요 후보입니다. 노드 staging과 frame 재사용은 할당을 줄이더라도 시간 이득을 보장하지 않았습니다. runtime node 공유는 nested/flat에서 크게 퇴행했습니다. oneOf에서는 gate/projected read, 경로, dependency index도 비용 묶음입니다.\n\n`;
report += `## 집계와 해석\n\n`;
report += `기존 보강의 303개 창을 재사용했습니다. 이 HEAD의 제품 source tree와 기존 bundle의 source tree가 같습니다. 아래 ‘객체’는 1-byte V8 allocation sample 수이며 정확한 JavaScript 객체 수가 아닙니다. 기본 allocation folding으로 한 sample이 여러 JS 객체를 담을 수 있습니다. major/minor로 수거한 할당도 포함했습니다. byte/평균 크기로 개수를 추정하지 않았습니다.\n\n`;
report += `native leaf 자기 할당을 가장 가까운 제품 source owner에 한 번만 귀속했습니다. 함수 안의 record/array/iterator별 정확한 byte 분해는 원 profile에 없으므로 **중간 구조의 source family 단위**로 집계했습니다. 최종 기록과 폐기 구조를 함께 만드는 함수는 보존/폐기 항목을 따로 밝혔습니다. 특히 frame 1,365개를 load site 전체 표본 16,734개와 혼동하지 않습니다. getTemplateKey 실험이 지우는 hostPaths/boundKey 표본은 buildNodes 칸에 귀속되어 있습니다. 각 표본을 이중 집계하지 않았습니다.\n\n`;
report += `## mount당 객체·bytes\n\n각 셀은 **객체 / bytes**입니다. 303개 창 산술 평균을 각각 반올림했습니다.\n\n| 묶음 | nested-d5-f4 | flat-500 | oneOf-20 |\n|---|---:|---:|---:|\n`;
for (const bundle of bundles) report += `| ${bundle.name} | ${names.slice(0, 3).map(name => `${fmt(bundle.allocations[name].objects)} / ${fmt(bundle.allocations[name].bytes)}`).join(' | ')} |\n`;
report += `| 기타 (<2% source owner만 남음) | ${names.slice(0, 3).map(name => `${fmt(baseline[name].bundles.other.objects)} / ${fmt(baseline[name].bundles.other.bytes)}`).join(' | ')} |\n`;
report += `| **전체** | ${names.slice(0, 3).map(name => `${fmt(baseline[name].total.objects)} / ${fmt(baseline[name].total.bytes)}`).join(' | ')} |\n\n`;
report += `청사진 / 그외 객체: ${names.slice(0, 3).map(name => `${name} ${fmt(baseline[name].total.blueprintObjects)} / ${fmt(baseline[name].total.restObjects)}`).join('; ')}. JSON에는 묶음별 청사진/그외 객체·bytes와 모든 source owner를 보존했습니다.\n\n`;
report += `## 보존·폐기 구조와 제거 빌드\n\n`;
for (const bundle of bundles) {
  const allSites = Object.values(bundle.sourceSites).flat().filter((site, i, array) => array.findIndex(other => other.file === site.file && other.line === site.line && other.function === site.function) === i);
  const primarySites = allSites.toSorted((a, b) => b.objects - a.objects).slice(0, 12);
  report += `### ${bundle.name} — ${bundle.id}\n\n`;
  report += `- 보존: ${bundle.retained}\n- 폐기: ${bundle.discarded}\n- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): ${primarySites.map(site => `\`${site.file.split('/src/')[1] ?? site.file}:${site.line}\` (${site.function})`).join(', ')}. 나머지는 JSON sourceSites를 참조하십시오.\n- 측정 빌드: ${bundle.erasure}\n- 상한의 범위: ${bundle.overlap}\n\n`;
}
report += `## 두 종단 시간 열\n\n`;
report += `각 fixture/묶음/회차는 새 Node process입니다. 엔진별 warmup 정확히 20 뒤 101쌍을 교대로 마운트하고 첫 순서는 H–V / V–H / H–V입니다. seed는 variant의 첫 예열에서 캡처하며 별도 마운트를 추가하지 않습니다. 각 엔진 실제 호출 수는 121로 검사했습니다. clone은 clock 밖입니다. 강제 GC 열은 GC와 그 뒤 setImmediate check anchor도 밖입니다. steady는 엔진마다 101개 연속 fresh mount×3이며 강제 GC/anchor를 넣지 않습니다. 두 열 모두 64 Promise checkpoint 뒤 sentinel **안에서** 종료 clock을 캡처했습니다. 앞/뒤 pooled 202개 빈 종단 중앙값을 두 엔진에 같은 값으로 뺐습니다.\n\n`;
report += `표는 회차별 **HEAD median − variant median** 3개의 중앙값(ms)입니다. 양수는 제거 빌드가 빠른 방향이고 음수는 퇴행입니다. **↑**는 세 회차 모두 잡음 폭을 넘는 양수, **↓**는 세 회차 모두 음의 잡음 폭을 넘는 퇴행입니다. °는 seed/측정에서 대상 호출이 없는 칸이며 그 차이를 구조 비용으로 해석하지 않습니다. 표시 없는 값은 이 보수적 문턱을 통과하지 못했습니다.\n\n`;
report += `잡음은 max(1µs, 같은 fixture/regime no-op 회차 abs bound 최대, 빈 대기 residual p95 + 두 median의 ordinary bootstrap 99% 오차 합)입니다. 1,999회 deterministic bootstrap을 사용했습니다. 연속 표본의 독립성이나 생산 개선의 통계적 유의성을 보장하는 표시는 아닙니다. 특히 flat steady 대조군이 큰 편차를 보여 이 열의 작은 차이는 채택하지 않았습니다.\n\n`;
report += `| fixture | no-op 강제 GC 최대 abs ms | no-op steady 최대 abs ms |\n|---|---:|---:|\n`;
for (const name of names) report += `| ${name} | ${fmt(controls[name + '/forced'].maxAbsoluteNoopBoundMs, 4)} | ${fmt(controls[name + '/steady'].maxAbsoluteNoopBoundMs, 4)} |\n`;
for (const name of names) {
  report += `\n### ${name}\n\n| 묶음 | 강제 GC 상한 ms | steady 상한 ms | 최대 잡음 GC / steady ms |\n|---|---:|---:|---:|\n`;
  for (const bundle of bundles) report += `| ${bundle.id} | ${cell(bundle.timings[name].forced)} | ${cell(bundle.timings[name].steady)} | ${fmt(bundle.timings[name].forced.maxNoiseMs, 4)} / ${fmt(bundle.timings[name].steady.maxNoiseMs, 4)} |\n`;
}
report += `\n상한은 seed 재사용, 계산·검사 생략, retained shape 및 JIT 상태 변화까지 포함합니다. 실제 allocator 시간으로 동일시하거나 서로 합산하지 않습니다. steady에는 자연 GC가 들어갑니다. 회차별 GC 창 수/평균 pause는 JSON에 기록했으며 median 차이에 더하거나 빼지 않았습니다. 강제 GC 표의 clock 안 GC는 모두 0입니다.\n\n`;
report += `## 별도 할당 진단\n\n`;
report += `각 빌드/fixture마다 별도 process에서 seed 1 mount 준비 후 warmup 20 뒤 한 mount를 1-byte profiler로 확인했습니다. 이는 **1회 진단**이며 시간 측정의 정확히 20예열 상태, 303개 창 평균이나 성능 증거와 구별합니다. 같은 source라도 warmup/seed 유지·allocation folding/JIT에 따라 control의 nested 청사진은 191,213개(140.1/node)로 기존 236,708개(173.4/node)와 달랐습니다. 따라서 기존 귀속 개수에서 이 진단의 감소량을 직접 빼지 않습니다. 음수 감소량은 진단에서 오히려 더 할당한 경우입니다.\n\n| 제거 빌드 | nested 객체 감소 | nested 청사진 감소 | flat 객체 감소 | oneOf 객체 감소 |\n|---|---:|---:|---:|---:|\n`;
for (const bundle of bundles) report += `| ${bundle.id} | ${fmt(bundle.allocationDiagnostics['nested-d5-f4'].objectsRemoved)} | ${fmt(bundle.allocationDiagnostics['nested-d5-f4'].blueprintObjectsRemoved)} | ${fmt(bundle.allocationDiagnostics['flat-500'].objectsRemoved)} | ${fmt(bundle.allocationDiagnostics['oneOf-20'].objectsRemoved)} |\n`;
report += `\nfirst-load-frames는 nested에서 1,364개 표본 감소와 시간 퇴행이 함께 나왔습니다. node-staging도 제거된 자료구조가 있어도 시간 개선을 보장하지 않았습니다. source 함수의 큰 개수를 작은 한 literal의 제거량으로 오해하면 안 됩니다.\n\n`;
report += `## 잡음 초과 묶음의 한 변경 수정 사양\n\n우선순위는 큰 종단 상한과 안전하게 한 번에 제거할 수 있는 범위를 함께 반영했습니다. 아래 예산은 173.4/node 기준의 **구조적 계획 범위**입니다. 상한의 전체 절감량을 실제 사양의 절감량으로 쓰지 않았습니다. 소스 구조 추정이며 V8 folding/JIT를 재측정하기 전에는 달성 수치가 아닙니다.\n\n`;
for (const [index, fix] of fixes.entries()) {
  report += `### ${index + 1}. ${fix.title} — ${fix.bundle}\n\n`;
  report += `- 변경: ${fix.change}\n- 동일 계약: ${fix.identical}\n- 제거 대상: ${fix.target}.\n- 잡음 초과 근거: ${fix.evidence.map(row => `${row.name}/${row.regime} ${fmt(row.boundMs, 4)}ms (N≤${fmt(row.maxNoiseMs, 4)}ms)`).join('; ')}.\n`;
  report += `- nested 분석 예산: ${fix.estimatedBlueprintObjectsSavedPerNestedNode.join('–')}개/node 제거, 단독 적용 후 ${fix.estimatedBlueprintObjectsPerNestedNodeAfterSingleFix.map(n => fmt(n, 1)).join('–')}개/node.\n`;
  if (fix.estimatedOneOfRuntimeObjectsSaved) report += `- oneOf runtime 예산: ${fix.estimatedOneOfRuntimeObjectsSaved.join('–')}개/mount 제거; cold blueprint에는 절감을 적용하지 않습니다.\n`;
  if (fix.estimatedRuntimeContainersSavedPerNestedMount) report += `- nested runtime container 예산: ${fix.estimatedRuntimeContainersSavedPerNestedMount.join('–')}개/mount 제거; 분석 density에는 절감을 적용하지 않습니다.\n`;
  if (fix.limitation) report += `- 제한: ${fix.limitation}\n`;
  report += '\n';
}
report += `사양 채택 시 Blueprint 전체의 id/path/schemaPath/kind/schemaType/strategy, 선언·fragment·entry/gate/order/owner/dependency 및 freeze 상태를 기존 결과와 비교해야 합니다. 잘못된 type/중복 type, allOf 충돌, terminal 불일치, ref/array/control 진단의 코드·schemaPath·details·순서·횟수도 기존대로여야 합니다. 네 fixture의 value hash 일치는 이 계약 검증을 대체하지 않습니다. 이번에는 제품 수정이나 그 테스트를 작성하지 않았습니다.\n\n`;
report += `## 65개/node 전망과 ledger 결정\n\n`;
report += `기존 nested cold 분석은 ${fmt(density, 1)}개/node이고 0.16.0의 **전체 mount**는 약 65.5개/node입니다. 서로 다른 범위의 비교임을 유지합니다. 잡음 초과 묶음의 위 한 변경 사양을 합친 계획은 ${summary.outlook.safeOneChangePlanningRange.map(n => fmt(n, 1)).join('–')}개/node이며, 현재 사양만으로 65/node 근접을 입증하지 못합니다. 계획 범위 합도 독립적인 성능/할당 효과 측정은 아닙니다.\n\n`;
report += `동시에 분석 구조를 재사용한 비제품 진단은 nested ${fmt(combined['nested-d5-f4'].blueprintObjects)}개 / ${fmt(combined['nested-d5-f4'].blueprintObjectsPerNode, 1)}개/node, flat ${fmt(combined['flat-500'].blueprintObjectsPerNode, 1)}개/node, oneOf ${fmt(combined['oneOf-20'].blueprintObjectsPerNode, 1)}개/node였습니다. 최종 declaration/fragment/정규화 결과까지 seed에서 가져오고 정적 검사를 생략하는 값입니다. **65보다 낮은 이상화 제거 결과가 있어도 동일 계약 사양으로 65를 달성했다는 뜻은 아닙니다.** 이 진단은 별도 성능 열을 만들지 않았습니다.\n\n`;
report += `분석 구조가 유지해야 하는 기록은 다음과 같습니다.\n\n`;
for (const row of summary.outlook.forcedStructures) report += `- ${row}\n`;
report += `\n${summary.outlook.ledgerQuestion} 관측 profiler는 여러 JavaScript 객체를 한 allocation block으로 접기 때문에 이 목록만으로 65 sample/node의 엄밀한 하한을 산출할 수도 없습니다. 다음 선택은 더 큰 유효 범위의 구조 제거·직접 final record 쓰기, frozen empty/order/gate 공유, authoritative declaration/binding view 설계 중 무엇을 공개 계약 안에서 허용할지입니다.\n\n`;
report += `## 재현·검사 기록\n\n`;
report += `- driver: [profile-101-alloc/measure.mjs](profile-101-alloc/measure.mjs), 읽기 전용 집계: [profile-101-alloc/analyze.mjs](profile-101-alloc/analyze.mjs). production bundle은 write:false esbuild 결과를 이 artifact directory에만 저장했습니다. 서비스는 stdin EOF로 종료했습니다.\n`;
report += `- 재현: \`node profile-101-alloc/measure.mjs --build\`, 묶음별 \`--matrix <id>\`, 할당 확인 \`--allocations <id>\`. 묶음 단위 명령도 분할할 수 있도록 \`--timers <id> <1|2|3> [fixture...]\`를 제공합니다. 모든 실행 cwd는 지정 worktree여야 합니다.\n`;
report += `- ${workers.length}개 타이머 worker, ${fmt(360 * 202)}개 시간 창, 출력 hash 일치 360/360, 모든 ≥2% source owner 분류, count/byte 보존 합계, 보정 및 101×3 길이를 검사했습니다.\n`;
report += `- 기록된 process 최대 ${fmt(summary.audit.maximumCommandSeconds, 3)}초; worker/빌드 서비스는 signal 없이 자체 종료했습니다. setup 실패는 시간/할당 표에 포함하지 않았습니다. 최초 자식 tape의 frozen fragment 참조 및 합성 빌드의 memo 이름 충돌을 고친 뒤 해당 결과 전체를 재수집했습니다. node-staging의 최종 빌드는 모든 type-group/nonNull/nodes staging 재사용을 적용했습니다. 초기 별도 seed가 20예열 밖에서 실행된 시간 자료는 모두 교체했으며 표/JSON은 정확히 20예열 재측정본만 사용합니다.\n`;
report += `- 파일 최대 ${fmt(largest.bytes)} bytes, 모든 새 artifact ≤5,000,000 bytes. 제품 src diff 없음, HEAD/source tree 확인, git write/설치/제품 bundle overwrite 없음. 각 process 파일에 실행 인자·시간·driver hash가 있습니다.\n`;
report += `- 상세 데이터: [profile-101-alloc-summary.json](profile-101-alloc-summary.json). ↑ 외 숫자는 공식 채택 판정이 아닙니다. steady는 기록용 열입니다.\n`;

if (process.argv.includes('--transport')) {
  const { createInterface } = await import('node:readline');
  const serialized = JSON.stringify({ summary, report }), pieces = [];
  for (let at = 0; at < serialized.length; at += 4000) pieces.push(serialized.slice(at, at + 4000));
  let index = 0;
  const input = createInterface({ input: process.stdin, terminal: false });
  const deadline = setTimeout(() => { throw new Error('Finite report transport exceeded seven minutes'); },
    Math.max(1, 420000 - (Date.now() - analysisStartedMs)));
  function send() {
    console.log('PAYLOAD_PART ' + index + ' ' + JSON.stringify(pieces[index]));
    index++;
    if (index === pieces.length) {
      console.log('PAYLOAD_DONE'); clearTimeout(deadline); input.close(); process.stdin.pause(); process.stdin.unref?.();
    }
  }
  input.on('line', line => { assert.equal(line.trim(), 'next'); send(); });
  console.log('PAYLOAD_READY ' + pieces.length); send();
} else if (process.argv.includes('--payload')) console.log('REPORT_PAYLOAD=' + JSON.stringify({ summary, report }));
else console.log(JSON.stringify({ bundles: bundles.length, fixes: fixes.map(row => row.bundle), audit: summary.audit,
  safePlanning: summary.outlook.safeOneChangePlanningRange, combined: summary.outlook.unsafeCombinedDiagnostic,
  marked: bundles.flatMap(bundle => names.flatMap(name => ['forced', 'steady'].filter(regime => bundle.timings[name][regime].aboveNoise).map(regime => `${bundle.id}/${name}/${regime}`))) }));
