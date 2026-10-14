// Invoked explicitly to derive the round-102 report; stdout is written with the native patch tool.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const work = path.dirname(fileURLToPath(import.meta.url));
const directory = path.dirname(work);
const pkg = path.resolve(directory, '../../..');
const repo = path.resolve(pkg, '../../..');
const head = '268832c7cb6eea67475b56ab5a78408a55ec47a3';
const fixtures = ['nested-d5-f4', 'flat-500', 'oneOf-20', 'sample-0'];
const scales = ['nested-d3-f4', 'nested-d4-f4', 'nested-d5-f4', 'flat-100', 'flat-500', 'flat-1000', 'oneOf-5', 'oneOf-10', 'oneOf-20', 'oneOf-40', 'sample-0'];
const fragmentScales = ['fragment-chain-10', 'fragment-chain-20', 'fragment-chain-40', 'fragment-flat-10', 'fragment-flat-20', 'fragment-flat-40'];
const files = fs.readdirSync(work);
const read = name => JSON.parse(fs.readFileSync(path.join(work, name), 'utf8'));
const median = values => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];
const sum = (object, predicate) => Object.entries(object).filter(([key]) => predicate(key)).reduce((value, [, count]) => value + count, 0);
const fn = (record, name) => sum(record.counts, key => key.startsWith('function|') && key.endsWith('|' + name));
const site = (record, field, pattern) => sum(record[field], key => pattern.test(key));
const hash = text => createHash('sha256').update(text).digest('hex');
const format = value => value.toFixed(4);
const table = (headers, rows) => ['| ' + headers.join(' | ') + ' |', '| ' + headers.map(() => '---').join(' | ') + ' |', ...rows.map(row => '| ' + row.join(' | ') + ' |')].join('\n');
const productLink = (file, line) => `[${file}:${line}](../../../src/${file}#L${line})`;

assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), head);
execFileSync('git', ['--no-optional-locks', 'diff', '--quiet', 'HEAD', '--', 'packages/canard/schema-form/src'], { cwd: repo });

const counts = Object.fromEntries([...scales, ...fragmentScales].map(name => [name, Object.fromEntries(['head', 'old'].map(version => [version, read(`counts-${version}-${name}.json`)]))]));
for (const [name, records] of Object.entries(counts)) {
  assert.equal(records.head.observed.sha256, records.old.observed.sha256, name);
  assert.equal(records.head.countingOnly, true);
  assert.equal(records.old.countingOnly, true);
}

const definitions = [
  ['type-read', '종류·허용 타입 읽기', 'readAllowedTypes / extractSchemaInfo', c => fn(c, 'readAllowedTypes'), c => fn(c, 'extractSchemaInfo'), 'old의 extractSchemaInfo는 타입 외 정보도 읽습니다. 동일 역할의 대표 호출 비교이며 두 열의 함수가 같은 연산은 아닙니다.'],
  ['schema-read', 'object schema 읽기', 'readSchemaObject / extractSchemaInfo', c => fn(c, 'readSchemaObject'), c => fn(c, 'extractSchemaInfo'), 'HEAD의 반복 typeof·반환과 old의 복합 정보 추출을 구분합니다. type-read 행과 중복되므로 합산하지 않습니다.'],
  ['type-resolution', '노드 타입 집합 결정', 'resolveNodeTypes / factory 정보 추출', c => fn(c, 'resolveNodeTypes'), c => fn(c, 'extractSchemaInfo'), 'old의 별도 group/nullable 청사진 결과는 없습니다.'],
  ['strategy', '자식 전략 결정', 'resolveNodeStrategy / BranchStrategy constructor', c => fn(c, 'resolveNodeStrategy'), c => site(c, 'counts', /^function\|.*ObjectNode\/strategies\/BranchStrategy\/BranchStrategy\.ts:.*\|BranchStrategy.constructor$/), 'old는 object 호스트에서 전략을 만듭니다.'],
  ['merge', '실제 유효 스키마 fold', 'mergeSchemaContributions / getMergeSchemaHandler 호출', c => fn(c, 'mergeSchemaContributions'), c => fn(c, 'getMergeSchemaHandler'), 'old의 processAllOfSchema 입구와 구분합니다. 본 fixture에는 old의 실제 allOf 병합이 없습니다.'],
  ['merge-api', '유효 스키마 API 입구', 'mergeEffectiveSchema / processAllOfSchema', c => fn(c, 'mergeEffectiveSchema'), c => fn(c, 'processAllOfSchema'), 'cache hit 및 조기 반환도 셉니다. 실제 fold 수가 아닙니다.'],
  ['contribution', '선택된 기여 적용', 'applySchemaContribution / 실제 교집합 handler', c => fn(c, 'applySchemaContribution'), c => fn(c, 'intersectStringSchema') + fn(c, 'intersectObjectSchema'), 'oneOf의 빈 static fold는 기여 적용을 하지 않습니다.'],
  ['constraints', '제약 키워드 처리', 'applyConstraintKeywords / 실제 교집합 handler', c => fn(c, 'applyConstraintKeywords'), c => fn(c, 'intersectStringSchema') + fn(c, 'intersectObjectSchema'), '키가 없어도 HEAD의 범용 helper는 호출됩니다.'],
  ['number-reads', '제약 숫자 판독', 'numberValue', c => fn(c, 'numberValue'), c => fn(c, 'numberValue'), '본 fixture의 HEAD에서는 적용당 32회입니다.'],
  ['declarations', '선언·fragment 방문', 'collectDeclarations / reference scanner 방문', c => fn(c, 'collectDeclarations'), c => fn(c, 'getStackEntriesForNode'), 'old는 fragment/declaration 공개 기록을 만들지 않으며 전체 스키마 스캐너 방문을 대응시켰습니다.'],
  ['fragment-enumeration', 'fragment 키워드 검사', 'collectDeclarations 고정 keyword loop / scanner schema-list 원소', c => site(c, 'counts', /^loop\|.*collectDeclarations\.ts:130\|/), c => site(c, 'counts', /^loop\|.*getStackEntriesForNode\.cjs:.*\|pushSchemaListChildren$/), 'HEAD의 5개 keyword 검사와 old의 실제 목록 원소 방문은 다른 단위입니다.'],
  ['children', '자식 입력 호스트 열거', 'populateNodeChildren / scanner map 호스트', c => fn(c, 'populateNodeChildren'), c => fn(c, 'pushMapChildren'), '실제 edge 원소와 property group binding은 별도 원시 계수에서 확인합니다.'],
  ['template-key', 'template 및 host-bound 키 생성', 'getTemplateKey + buildNodes JSON', c => fn(c, 'getTemplateKey') + site(c, 'counts', /^path-operation\|.*buildNodes\.ts:42\|/), () => 0, 'old는 같은 template cache를 만들지 않습니다. reference table은 아래 traversal 열에서 셉니다.'],
  ['shape', '정적 shape traversal 입구', 'visitShape / reference scanner 방문', c => fn(c, 'visitShape'), c => fn(c, 'getStackEntriesForNode'), 'HEAD의 complete guard 때문에 입구 재방문과 실제 subtree 확장을 구분해야 합니다.'],
  ['child-diagnostics', 'child target 검사', 'validateChildTargets', c => fn(c, 'validateChildTargets'), () => 0, '노드와 edge를 한 번씩 훑는 별도 정적 진단 단계입니다. old에 동일 단계는 없습니다.'],
  ['dependency-index', '역의존 index 실제 생성', 'DependencyIndex constructor / PathManager 생성', c => fn(c, 'DependencyIndex.constructor'), c => fn(c, 'getPathManager'), 'oneOf에서 getter는 3회지만 실제 index 생성은 1회입니다. old는 expression dependency 위치 사전을 만듭니다.'],
  ['dependency-insertion', '의존 경로 등록', 'DependencyIndex.add / PathManager.set', c => fn(c, 'DependencyIndex.add'), c => site(c, 'counts', /^function\|.*getPathManager\.ts:23\|set$/), '등록 호출과 최종 unique 경로·owner 개수는 같지 않습니다.'],
  ['registry', 'gate 위치 조회', 'GateRegistry.locate / simple-equality selector', c => fn(c, 'GateRegistry.locate'), c => fn(c, 'getSimpleEquality.callback'), 'old는 gate registry 대신 root 선택 함수를 사용합니다.'],
  ['gate-registration', 'gate 등록 입구', 'GateRegistry.register / condition 표현식 준비', c => fn(c, 'GateRegistry.register'), c => fn(c, 'getExpressionFromSchema'), 'HEAD의 대부분은 등록된 위치에 대한 guard hit이며 새 등록 429개라는 뜻이 아닙니다.'],
  ['budget', 'gate budget 수집', 'getGateBudgetCap collect / 조건식 준비', c => site(c, 'counts', /^function\|.*getGateBudgetCap\.ts:36\|collect$/), c => fn(c, 'getExpressionFromSchema'), 'budget index는 1회 만들어 node/child 선언을 재열거합니다.'],
  ['path-index', '경로 index add', 'PathStoreIndex.add', c => fn(c, 'PathStoreIndex.add'), () => 0, 'HEAD 단순 mount fast path는 노드 전체를 index에 다시 넣지 않습니다.'],
  ['dependency-path', '상대 의존 경로 해석', 'resolveDependencyPath / PathManager.set', c => fn(c, 'resolveDependencyPath'), c => site(c, 'counts', /^function\|.*getPathManager\.ts:23\|set$/), 'old의 set은 expression 등장 수이며 매 평가마다 경로를 다시 해석하지 않습니다.'],
  ['gates', 'gate 판단', 'evaluateGate / simple-equality selector', c => fn(c, 'evaluateGate'), c => fn(c, 'getSimpleEquality.callback'), 'oneOf의 HEAD는 생성 함수 400회, old는 사전 조회 selector 1회입니다.'],
  ['projection', 'gate 투영 값 읽기', 'readProjectedValue / simple-equality dependency 읽기', c => fn(c, 'readProjectedValue'), c => fn(c, 'getSimpleEquality.callback'), '이 fixture의 old selector는 dependency 배열의 한 값을 읽습니다.'],
  ['freeze', 'Object.freeze', 'mount 중 freeze 호출', c => site(c, 'counts', /^freeze\|/), c => site(c, 'counts', /^freeze\|/), '모든 대상이 서로 다른 객체입니다. 동일 객체를 다시 freeze한 사례는 0입니다.'],
  ['path-strings', '경로 관련 문자열 생산 site', 'path/pointer/dependency template + joinSegment', c => site(c, 'counts', /^path-string\|/), c => site(c, 'counts', /^path-string\|/), 'AST site 계수로 expression dependency 코드 문자열도 포함합니다. JSON 키 직렬화는 별도 행이며 전체 문자열 할당을 세는 계수가 아닙니다.'],
  ['revision', '초기 revision 슬롯 읽기', '17개 이전 bit 읽기 callback', c => fn(c, 'SchemaNodeRevisionLedger.constructor.callback'), c => fn(c, 'SchemaNodeRevisionLedger.constructor.callback'), 'HEAD의 live runtime node당 17회입니다. old의 EventCascade 초기화와 같은 연산은 아닙니다.'],
  ['runtime-node', '런타임 노드 생성', 'constructedNodes', c => c.dimensions.constructedNodes, c => c.dimensions.constructedNodes, 'oneOf에서 old는 비활성 후보도 runtime node로 구성하고 HEAD는 template만 만듭니다.'],
];

const workKinds = definitions.map(([id, title, operation, headCount, oldCount, note]) => ({ id, title, operation, note,
  fixtures: fixtures.map(name => {
    const record = counts[name], nodeCount = record.head.dimensions.blueprintNodes;
    return { fixture: name, templateNodes: nodeCount, head: { perMount: headCount(record.head), perTemplateNode: headCount(record.head) / nodeCount, perLiveNode: headCount(record.head) / record.head.dimensions.liveNodes }, old: { perMount: oldCount(record.old), perTemplateNode: oldCount(record.old) / nodeCount, perLiveNode: oldCount(record.old) / record.old.dimensions.liveNodes } };
  }),
}));

const identities = Object.fromEntries(fixtures.map(name => {
  const c = counts[name].head, result = {};
  for (const kind of ['readAllowedTypes', 'readSchemaObject', 'freeze', 'mergeSchemaContributions', 'evaluateGate', 'readProjectedValue', 'resolveDependencyPath']) {
    const values = Object.entries(c.schemaIdentities).filter(([key]) => key.startsWith(kind + '|')).map(([, value]) => value);
    result[kind] = { calls: values.reduce((a, b) => a + b, 0), semanticKeys: values.length, objectIdentities: c.uniqueSchemas[kind] ?? 0, maxPerKey: Math.max(0, ...values) };
  }
  const selection = {};
  for (const [key, value] of Object.entries(c.schemaIdentities).filter(([key]) => key.startsWith('mergeSchemaContributions|'))) {
    const modeFree = key.replace(/\|(static|runtime):/, '|');
    selection[modeFree] = (selection[modeFree] ?? 0) + value;
  }
  result.mergeSelectionIgnoringMode = { uniqueKeys: Object.keys(selection).length, repeatedKeys: Object.values(selection).filter(value => value > 1).length, duplicateCalls: Object.values(selection).reduce((value, count) => value + count - 1, 0) };
  return [name, result];
}));

const scaling = [...scales, ...fragmentScales].map(name => {
  const c = counts[name].head, old = counts[name].old;
  return { fixture: name, nodes: c.dimensions.blueprintNodes, liveNodes: c.dimensions.liveNodes, fragments: c.dimensions.fragments, schemaObjects: c.dimensions.schemaObjects, depthSum: c.dimensions.schemaDepthSum,
    declarations: fn(c, 'collectDeclarations'), types: fn(c, 'readAllowedTypes'), merges: fn(c, 'mergeSchemaContributions'), freezes: site(c, 'counts', /^freeze\|/), visits: fn(c, 'visitShape'),
    templateKeyCharacters: site(c, 'stringCharacters', /^path-operation\|.*getTemplateKey\.ts:15\|/), boundKeyCharacters: site(c, 'stringCharacters', /^path-operation\|.*buildNodes\.ts:42\|/),
    schemaPathCharacters: site(c, 'stringCharacters', /^path-string\|.*populateNodeChildren\.ts:77\|/), dataPathCharacters: site(c, 'stringCharacters', /^path-string\|.*populateNodeChildren\.ts:161\|/),
    inputOrderCopiedElements: site(c, 'stringCharacters', /^array-spread\|.*populateNodeChildren\.ts:78\|/), finalOrderCopiedElements: site(c, 'stringCharacters', /^array-spread\|.*collectDeclarations\.ts:67\|/),
    flattenedReturnCopiedElements: site(c, 'stringCharacters', /^array-spread\|.*collectDeclarations\.ts:(114|170)\|/),
    gateEvaluations: fn(c, 'evaluateGate'), projections: fn(c, 'readProjectedValue'), dependencyPaths: fn(c, 'resolveDependencyPath'), oldScannerVisits: fn(old, 'getStackEntriesForNode'), oldTypeReads: fn(old, 'extractSchemaInfo'),
    oldPathRelatedCharacters: site(old, 'stringCharacters', /^path-string\|/), oldEqualityLookups: fn(old, 'getSimpleEquality.callback') };
});

const variants = [
  ['allowed-once', 'type-read', 'schema identity별 readAllowedTypes memo', 'memo 비용 포함; schemaPath·진단 mode는 무시하는 측정용 cache입니다.'],
  ['schema-read-once', 'schema-read', 'schema identity별 readSchemaObject memo', '객체 fixture 한정입니다. boolean 일반 지원 수정안이 아닙니다.'],
  ['merge-once', 'merge', 'node별 최초 fold만 사용', '선택 집합 변경도 무시합니다. 필요한 상태까지 제거한 넓은 상한으로 직접 채택할 수 없습니다.'],
  ['merge-selection-once', 'merge', 'node와 declaration ID 집합별 fold 재사용', 'static/runtime mode 및 callback policy는 무시합니다. 실제 같은 선택 재계산의 비용을 가늠하는 측정용 memo입니다.'],
  ['merge-replay', 'merge', '최초 warmup의 fold 결과를 발생 순서대로 replay', '정규화 전체 생략 상한입니다. 다른 입력·진단·참조 동일성의 정확성은 보장하지 않습니다.'],
  ['types-replay', 'type-resolution', '노드 타입 결정 결과 replay', '필요한 group/nullable/type 검증도 포함해 생략합니다.'],
  ['declarations-replay', 'declarations', '최상위 collector의 선언·fragment·ID 상태 replay', '새 공개 분석 결과 생성과 진단 전체까지 포함한 단계 상한입니다.'],
  ['children-replay', 'children', '자식 입력 및 binding 결과 replay', '재귀 build와 최종 child entry 구성은 유지하며 입력 열거·binding을 생략합니다.'],
  ['strategy-replay', 'strategy', '전략 결정 replay', '유효 전략 검증 전체 상한입니다.'],
  ['template-replay', 'template-key', 'getTemplateKey 결과 replay', 'host-bound key는 유지합니다. 구현 후보의 speedup과 동일하지 않습니다.'],
  ['path-strings-replay', 'path-strings', 'template key 및 함수 내 경로·JSON 문자열 replay', '공개 경로 생산까지 포함하므로 중복 직렬화만 제거한 시간보다 넓은 상한입니다.'],
  ['constraint-present', 'constraints', '13개 제약 키가 없는 contribution의 범용 제약 처리 생략', 'Object.keys/some guard 비용을 포함합니다. 일반 제약·invalid target 상태의 정확성 검증은 별도입니다.'],
  ['freeze-zero', 'freeze', 'Object.freeze를 identity 함수로 대체', '유일한 공개 객체 동결도 제거합니다. 동결·불변 계약을 위반하는 전체 단계 상한입니다.'],
  ['shape-once', 'shape', 'root에서만 visitShape 시작', '비활성 또는 분리된 template의 정적 검증이 누락될 수 있습니다.'],
  ['child-targets-zero', 'child-diagnostics', 'validateChildTargets 생략', '정적 오류 경로를 보존하는 구현이 아닙니다.'],
  ['dependency-replay', 'dependency-index', '역의존 index replay', '이전 warmup의 node·owner 참조를 포함할 수 있어 일반 동작은 보장하지 않습니다.'],
  ['dependency-paths-once', 'dependency-path', 'hostPath와 authored dependency 문자열별 해석 memo', 'Map key 구성 비용을 포함합니다. wildcard/rekey 일반 수정은 검증하지 않았습니다.'],
  ['gates-once', 'gates', 'gate identity와 owner 위치별 결과 memo', '값 변경·projection epoch를 무시합니다. 사용자 callback과 실패 재평가에도 적용하면 잘못됩니다.'],
  ['projected-once', 'projection', 'settlement context와 path별 값 읽기 memo', '중간 쓰기와 flush를 무시합니다.'],
  ['registry-replay', 'registry', 'GateRegistry.locate 결과 replay', '등록의 동적 위치·owner 일반 정확성은 보장하지 않습니다.'],
  ['budget-replay', 'budget', 'fixture에 맞는 합성 gate budget index 사용', 'oneOf root 크기만 반영한 측정용 값으로 일반 budget 규칙을 대체할 수 없습니다.'],
  ['path-index-zero', 'path-index', 'PathKeyedMap 저장은 유지하고 path index add 생략', 'affected/ancestor 조회 의미를 보존하지 않습니다.'],
  ['revision-initial-empty', 'revision', '초기 17개 previous bit 읽기를 빈 배열로 대체', '빈 previous인 mount 경로의 상한입니다. nonempty plain previous 일반 동작은 틀립니다.'],
  ['order-once', 'declarations', 'collector에서 input.order 재복사 생략', '공개 배열 frozen 상태와 생산 순서를 유지하는 좁은 후보입니다.'],
  ['declaration-sink', 'declarations', 'recursive collector 반환 배열 flatten을 단일 sink로 대체', '방문·ID·추가 순서를 유지하는 좁은 후보입니다. chain scale의 제곱 복사를 제거합니다.'],
];

const noise = Object.fromEntries(fixtures.map(name => [name, Object.fromEntries(['forced', 'steady'].map(regime => {
  const controls = [1, 2, 3].map(run => read(`control-${name}-${regime}-r${run}.json`));
  return [regime, { envelopeMs: Math.max(...controls.flatMap(row => [Math.abs(row.boundMs), ...(regime === 'forced' ? [Math.abs(median(row.pairedDeltasMs))] : [])])), controls: controls.map(row => ({ run: row.run, differenceOfMediansMs: row.boundMs, pairedMedianMs: row.pairedDeltasMs ? median(row.pairedDeltasMs) : undefined, artifact: `profile-102-work/control-${name}-${regime}-r${row.run}.json` })) }];
}))]));

const bounds = variants.map(([variant, workKind, method, limitation]) => ({ variant, workKind, method, limitation,
  fixtures: fixtures.map(name => ({ fixture: name, columns: Object.fromEntries(['forced', 'steady'].map(regime => {
    const runs = [1, 2, 3].map(run => read(`${variant}-${name}-${regime}-r${run}.json`));
    const pairedIntervals = runs.map(row => row.pairedDeltasMs ? [row.pairedDeltasMs.toSorted((a, b) => a - b)[40], row.pairedDeltasMs.toSorted((a, b) => a - b)[60]] : null);
    const differences = runs.map(row => row.boundMs);
    return [regime, { medianBoundMs: median(differences), rangeMs: [Math.min(...differences), Math.max(...differences)], noiseMs: noise[name][regime].envelopeMs,
      aboveNoise: differences.every(value => value > noise[name][regime].envelopeMs) && (regime === 'steady' || pairedIntervals.every(interval => interval[0] > 0)),
      runs: runs.map((row, index) => ({ run: row.run, headMedianMs: row.metrics.head.median, variantMedianMs: row.metrics.variant.median, boundMs: row.boundMs, pairedMedianMs: row.pairedDeltasMs ? median(row.pairedDeltasMs) : undefined, pairedMedianInterval95Ms: pairedIntervals[index], sameObservedValue: row.observations.head.sha256 === row.observations.variant.sha256, artifact: `profile-102-work/${variant}-${name}-${regime}-r${row.run}.json` })) }];
  })) })) }));

const baseline = fixtures.map(name => ({ fixture: name, columns: Object.fromEntries(['forced', 'steady'].map(regime => {
  const runs = [1, 2, 3].map(run => read(`old-${name}-${regime}-r${run}.json`));
  return [regime, { headMedianMs: median(runs.map(row => row.metrics.head.median)), oldMedianMs: median(runs.map(row => row.metrics.variant.median)), gapMs: median(runs.map(row => row.boundMs)), gapRangeMs: [Math.min(...runs.map(row => row.boundMs)), Math.max(...runs.map(row => row.boundMs))], runs: runs.map(row => ({ run: row.run, head: row.metrics.head, old: row.metrics.variant, artifact: `profile-102-work/old-${name}-${regime}-r${row.run}.json` })) }];
})) }));

/** Attribute every function's self time to one work family; inclusive totals are never summed. */
function cpuKind(row) {
  const text = row.file + ' ' + row.function;
  if (row.function === '(garbage collector)') return 'GC';
  if (/^\((program|idle|root)\)$/.test(row.function)) return 'V8 ' + row.function;
  if (/profile-102-work|canonical adapter|node:internal|inspector|internal\//.test(text)) return '계측·런타임·경계 표본';
  if (/SchemaNodeRevisionLedger/.test(text)) return 'revision';
  if (/readProjectedValue|flushPendingGateReads/.test(text)) return 'projection';
  if (/resolveDependencyPath|PathKeyedMap|PathStoreIndex/.test(text)) return 'path-index/dependency-path';
  if (/getGateRegistry|getGateBudgetCap|getDependencyIndex|registerBlueprintDependency/.test(text)) return 'index/registry';
  if (/evaluateGate|selectChildren|evaluateBlueprintExpression|getConditionIndex|getSimpleEquality/.test(text)) return 'gates/selection';
  if (/getTemplateKey/.test(text)) return 'template-key';
  if (/readAllowedTypes|readSchemaObject|resolveNodeTypes|inferAllowedTypes|AllowedTypes|extractSchemaInfo/.test(text)) return 'type/schema-read';
  if (/effectiveSchema|schemaIntersection|processAllOfSchema/.test(text)) return 'merge/constraints';
  if (/collectDeclarations|deriveCapabilities|collectStaticSchemas/.test(text)) return 'declarations';
  if (/populateNodeChildren|populateChildren|populateVirtualNodes/.test(text)) return 'children';
  if (/resolveNodeStrategy/.test(text)) return 'strategy';
  if (/diagnostics|visitShape|validateShape/.test(text)) return 'static-validation';
  if (/JSONSchemaScanner|getReferenceTable|getResolveSchema/.test(text)) return 'schema-traversal';
  if (/buildNodes|blueprint\.ts/.test(text)) return '분석 wiring·최종 동결';
  if (/EventCascadeManager|mergeEventEntries/.test(text)) return 'old event delivery';
  if (/getComputedProperties|needsRealComputedManager|ComputedPropertiesManager/.test(text)) return 'old computed 초기화';
  if (/schemaNodeFactory|SchemaNode|Node\/|BranchStrategy|record\/|settle\//.test(text)) return 'mount/runtime';
  return '기타';
}

const cpuProfiles = fixtures.flatMap(name => ['head', 'old'].map(version => {
  const runs = [1, 2, 3].map(run => read(`cpu-${version}-${name}-r${run}.json`));
  const denominatorUs = runs.reduce((value, row) => value + row.cpu.denominatorUs, 0), rows = new Map();
  for (const run of runs) for (const row of run.cpu.functions) {
    const key = JSON.stringify([row.function, row.file, row.line, row.column]);
    const accumulated = rows.get(key) ?? { function: row.function, file: row.file, line: row.line, column: row.column, selfUs: 0, totalUs: 0, selfSamples: 0, totalSamples: 0, workKind: cpuKind(row) };
    for (const field of ['selfUs', 'totalUs', 'selfSamples', 'totalSamples']) accumulated[field] += row[field];
    rows.set(key, accumulated);
  }
  for (const label of ['(garbage collector)', '(program)', '(idle)']) if (![...rows.values()].some(row => row.function === label)) rows.set(label, { function: label, file: '(V8)', line: 0, column: -1, selfUs: 0, totalUs: 0, selfSamples: 0, totalSamples: 0, workKind: cpuKind({ function: label, file: '(V8)' }) });
  const functions = [...rows.values()].map(row => ({ ...row, selfPct: 100 * row.selfUs / denominatorUs, totalPct: 100 * row.totalUs / denominatorUs, selfMsPerMount: row.selfUs / 303000, totalMsPerMount: row.totalUs / 303000 })).sort((a, b) => b.selfUs - a.selfUs);
  const selfGroups = {};
  for (const row of functions) selfGroups[row.workKind] = (selfGroups[row.workKind] ?? 0) + row.selfUs;
  return { fixture: name, version, mounts: 303, intervalUs: 100, denominatorUs, sampleCount: runs.reduce((value, row) => value + row.cpu.samples, 0), selfSumUs: functions.reduce((value, row) => value + row.selfUs, 0), selfGroups: Object.fromEntries(Object.entries(selfGroups).map(([key, value]) => [key, { selfUs: value, selfPct: value * 100 / denominatorUs }])),
    functions, runs: runs.map(row => ({ run: row.run, samples: row.cpu.samples, denominatorUs: row.cpu.denominatorUs, windowUs: row.cpu.windowUs, coverage: row.cpu.denominatorUs / row.cpu.windowUs, artifact: `profile-102-work/cpu-${version}-${name}-r${row.run}.json`, rawProfile: `profile-102-work/cpu-${version}-${name}-r${row.run}.cpuprofile` })) };
}));

const designText = fs.readFileSync(path.join(directory, 'analysis-records-design.md'), 'utf8');
const designSnapshot = { path: 'analysis-records-design.md', sha256: hash(designText), observedSourceRevision: designText.match(/HEAD 단면 `([a-f0-9]+)`/)?.[1] ?? null,
  headings: designText.split('\n').flatMap((line, index) => /^#{1,3} /.test(line) ? [{ line: index + 1, title: line.replace(/^#+ /, '') }] : []), note: '다른 작업자의 문서는 읽기만 했습니다. 102 계수와 source chain은 요청된 HEAD 기준이며 문서의 별도 source 단면 계수를 그대로 옮기지 않습니다.' };

const fixSpecs = [
  { rank: 1, id: 'revision-empty-initial', title: '공유 빈 previous의 17개 bit 읽기를 생략하십시오.', variants: ['revision-initial-empty'], change: 'SchemaNodeRevisionLedger constructor에서 shared empty previous identity만 분기해 counts=[]로 시작하고 기존 mask 갱신을 그대로 수행합니다. ledger 및 nonempty plain record에는 기존 복사를 유지합니다.', chain: 'core/record/utils/SchemaNodeRevisionLedger.ts:18–26', preserved: 'bit getter의 undefined/증가 값, read(mask), immutable previous snapshot과 이벤트 전달 순서가 같아야 합니다. Blueprint 및 정적 분석·진단 경로는 건드리지 않습니다.', overlap: '분석 기록 설계의 범위 밖입니다.', limit: '측정 변형은 모든 plain previous를 빈 값으로 취급합니다. 구현은 공유 empty identity에 한정해야 합니다.' },
  { rank: 2, id: 'successful-gate-epoch-cache', title: '순수 gate의 성공 결과를 의존 projection 버전 동안 재사용하십시오.', variants: ['gates-once'], change: 'GateRegistry occurrence에 (gate, host, edge binding, dependency epoch) 성공 결과 하나를 저장합니다. primitive equality처럼 순수성이 증명된 compiled 식부터 적용하며 동일 projection epoch에서 20개 gate를 각 1회 평가합니다.', chain: 'core/settle/utils/compute/selectChildren.ts:156–164 → core/settle/utils/gates/evaluateGate.ts:26,35,111–115', preserved: 'Blueprint의 20개 gate·expression·dependency 기록과 컴파일 호출을 모두 유지합니다. 값·extras·구조·wildcard·rekey·flush·host 변경에서 invalidation하며 throw 및 사용자 callback은 memo하지 않습니다. 정적 오류·경고는 원래 compile/collect 위치, 순서, 횟수대로 남깁니다.', overlap: '분석 기록 생성 감소와 독립적인 settlement 작업입니다. view 정체성과 read dependency 의미는 설계의 보존 조건을 따릅니다.', limit: '측정용 once memo는 값 전환을 무시하므로 직접 구현으로 쓸 수 없습니다. 중간 값 변경·동일 gate의 다중 host·실패 반복 검증이 필요합니다.' },
  { rank: 3, id: 'projection-epoch-cache', title: '같은 projection epoch의 동일 경로 읽기를 재사용하십시오.', variants: ['projected-once'], change: 'SettlementContext에 (path, projection epoch) read 결과를 저장하고 pending flush 및 실제 write 전에 invalidation합니다. 한 epoch의 /kind 400회 탐색을 1회로 줄입니다.', chain: 'core/settle/utils/gates/evaluateGate.ts:111–115 → core/settle/utils/gates/readProjectedValue.ts:25,34,61', preserved: 'resolved root/extra 값, absent key, wildcard, parent/array context 및 이전 gate가 만든 projection을 똑같이 관측해야 합니다. 첫 read의 flush와 실패 처리는 생략하지 않습니다. 정적 분석의 기록·진단은 유지합니다.', overlap: '분석 기록 설계 밖입니다. gate cache와 중첩되므로 두 절감 상한을 더하지 않습니다.', limit: 'context 단위 무조건 memo는 올바르지 않습니다. 원시 객체에 대한 외부 변경을 버전으로 관측할 수 없는 경로는 일반 경로를 유지합니다.' },
  { rank: 4, id: 'singleton-contribution-fast-fold', title: '증명된 단일 정적 기여에는 범용 제약 교집합 순회를 우회하십시오.', variants: ['merge-replay', 'constraint-present', 'merge-once'], change: '단일 ungated conjunction, 검증된 scalar type, nullable/pattern/options/custom atomic 없음, 제약 키 없음이 확정된 경우에만 같은 renderer-hint schema를 직접 구성합니다. 나머지는 기존 ordered fold를 사용합니다. oneOf의 선택 변경은 별도 결과를 계속 생성합니다.', chain: 'core/blueprint/utils/analyze/buildNodes.ts:92–100 → core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:48–53 → applySchemaContribution.ts:43', preserved: '현재 key 존재·enumeration 순서, property 참조, normalized type, nullable와 EffectiveSchema 참조 cache 조건을 그대로 보존합니다. invalid/multiple/gated/collect/isAtomic 경로는 원래 검증 및 진단을 동일 순서로 실행합니다.', overlap: '설계의 static 임시 node 제거와 scalar 배열 공유는 이미 별도이며, 102는 남은 helper 순회라는 작업을 대상으로 합니다.', limit: 'merge-replay는 전체 fold 예산입니다. 필요한 결과 생성은 남으므로 전부 회수할 수 없습니다. merge-once의 oneOf 0.35 ms에는 서로 다른 선택 제거까지 들어가며 안전한 memo 이득이 아닙니다. merge-selection-once는 소음 밖 이득이 없습니다.' },
  { rank: 5, id: 'single-declaration-child-stream', title: '단일 ungated 자식 입력은 중간 Map 수집과 재열거 없이 전달하십시오.', variants: ['children-replay'], change: '한 선언의 object properties를 eager snapshot으로 한 번 열거하고 기존 entry 순서 그대로 child build에 전달하는 좁은 경로를 추가합니다. overlay·공유 template·gate·control·virtual의 일반 경로는 유지합니다.', chain: 'core/blueprint/utils/analyze/populateNodeChildren.ts:31,77–87,160–181', preserved: 'name insertion 순서, input order/schemaPath/hostPath, fragment membership, child node cache key, bound declaration의 필드와 gate 원소, childEntries 및 모든 정적 검사 순서·횟수가 같아야 합니다.', overlap: '설계의 eager snapshot·slot cursor·숫자 연결과 겹칩니다. 단일 기여의 동일한 입력을 다시 조립하지 않는 작업 제거가 목적입니다.', limit: 'children-replay에는 binding 전체 생략도 포함됩니다. 단일 경로 구현의 실제 시간은 이 상한보다 작을 수 있습니다.' },
  { rank: 6, id: 'one-collector-sink', title: '선언을 처음부터 최종 소유자의 sink에 한 번 수집하십시오.', variants: ['declarations-replay', 'declaration-sink', 'order-once'], change: 'collectDeclarations의 recursive 반환 배열을 단일 ordered sink로 교체하고 기록을 소유자의 최종 declaration/fragment view에 한 번 배정합니다. 진단과 ID 예약은 기존 DFS 위치에 둡니다.', chain: 'core/blueprint/utils/analyze/collectDeclarations.ts:27,62–76,114,170', preserved: 'declaration/fragment ID, role·scope·context·validationOnly·membership, own enumerable 필드, frozen final arrays, 원본/바인딩 gate 관계를 동일하게 남깁니다. 무효 schema나 callback의 진단을 dedupe하거나 다른 시점에 내보내지 않습니다.', overlap: '설계의 권위 declaration과 frozen view 단일 생성에 겹칩니다. H개의 반환 scratch 배열 재사용만으로는 상위 호출의 flatten 복사 작업이 없어지지 않습니다. 반환 배열을 유지하는 것과 한 번 수집하는 것은 작업량이 다릅니다.', limit: '전체 declarations-replay는 큰 예산이지만 sink-only와 order-only는 네 주 fixture에서 소음 밖 이득이 없습니다. O(F²) 개선은 chain probe로 입증됐으며 nested 주 간극의 원인으로 확대하지 않습니다.' },
  { rank: 7, id: 'reuse-frozen-empty-memberships', title: '값이 같은 frozen 빈 membership만 공유해 새 동결 작업을 줄이십시오.', variants: ['freeze-zero'], change: 'module-owned frozen empty arrays를 빈 gates/overlays/inheritedOverlays/childEntries에 사용하고 실제 membership이 생길 때만 독립 배열을 만들어 최종 freeze합니다. 필드별 공유 허용 범위를 명시합니다.', chain: 'core/blueprint/utils/analyze/collectDeclarations.ts:46,67–72 → core/blueprint/blueprint.ts:73–89', preserved: '각 공개 view와 비어 있지 않은 배열은 frozen으로 남고 own field·순서·기존에 보장한 참조 동일성을 유지합니다. 공개 mutable 배열이나 getter/Proxy는 도입하지 않습니다.', overlap: '설계의 module-owned 빈 배열 및 gate-prefix 재사용과 직접 겹칩니다.', limit: '현재 freeze 24,911회는 모두 서로 다른 대상입니다. freeze-zero는 필요 동결까지 뺀 넓은 상한입니다. 빈 배열 공유의 좁은 속도 효과를 따로 증명하지 않았으며 전체 상한을 회수한다고 주장하지 않습니다.' },
  { rank: 8, id: 'structured-internal-template-key', title: '내부 template key에서 완성 경로의 이중 직렬화를 제거하십시오.', variants: ['template-replay', 'path-strings-replay'], change: 'source occurrence, context, ordered gate identity와 host binding identity를 보존하는 내부 interned tuple key를 사용하고 host-bound key가 template 문자열을 다시 JSON화하지 않게 합니다. 공개 schema/data 경로와 order 배열은 기존처럼 생성합니다.', chain: 'core/blueprint/utils/analyze/buildNodes.ts:35–42 → getTemplateKey.ts:15–34', preserved: 'template 동치 관계, cache hit/miss, ID 예약 순서, 재귀 판정과 host 재바인딩이 같아야 합니다. 경로 충돌·scope/context·동일 source 다중 host를 key에 반영하며 정적 진단 occurrence를 합치지 않습니다.', overlap: '설계는 과거 streaming key가 시간 이득 없이 미채택됐다고 기록하고 현재 인코딩을 유지합니다. 102의 제거 상한은 streaming 구현을 다시 채택할 근거가 아니며 새로운 key 구조는 별도 범위입니다.', limit: '경로 replay에는 필요한 공개 문자열 생산까지 포함됩니다. getTemplateKey replay도 새 key 구조의 실속도와 같지 않습니다. 공개 path/order 총량 O(N·depth)는 보존 계약상 남습니다.' },
  { rank: 9, id: 'bind-dependency-path-once', title: '동일 host·authored dependency의 순수 경로 해석을 한 번 바인딩하십시오.', variants: ['dependency-paths-once', 'dependency-replay'], change: 'registry occurrence의 dependency를 최초 host binding 때 resolve하고 index와 gate reads가 같은 완성 경로를 빌립니다. 중복 (resolved watch path, owner) 등록은 첫 삽입 순서를 유지해 제거합니다.', chain: 'core/settle/utils/gates/getGateRegistry.ts:156–166 → core/settle/utils/paths/resolveDependencyPath.ts:7 → write/getDependencyIndex.ts:119', preserved: 'relative/absolute path, escaping, wildcard, ancestor/descendant affected 의미, host rekey 및 owner insertion 순서를 보존하고 relocation 때만 다시 바인딩합니다. 진단 생성에는 영향을 주지 않습니다.', overlap: '설계의 원본 host와 bound view 구분 및 역의존 의미 보존과 연결됩니다. source-only key로 서로 다른 host를 합치지 않습니다.', limit: 'oneOf의 forced 열에서만 안정적입니다. index 전체 replay 상한과 경로 해석 상한은 중첩되며 실제 index는 이미 한 번 생성합니다.' },
  { rank: 10, id: 'reuse-validated-type-facts', title: '선언에서 검증한 타입 사실을 node grouping과 fold에 전달하십시오.', variants: ['types-replay'], change: 'scalar 선언에서 얻은 검증된 allowed-type 사실을 type grouping과 contribution 단계가 그대로 읽도록 내부 분석 frame에 전달합니다. 입력 occurrence의 원래 검증/진단 호출은 남기고 순수 타입 집합 재계산만 줄입니다.', chain: 'core/blueprint/utils/analyze/collectDeclarations.ts:42 → core/blueprint/utils/types/resolveNodeTypes.ts:33–40 → effectiveSchema/utils/applySchemaContribution.ts:43', preserved: '다중 타입·nullable·boolean schema·추론·gated group 결과와 정적 오류의 source path/순서/횟수가 같아야 합니다. schema identity만으로 서로 다른 진단 occurrence를 합치지 않습니다.', overlap: '설계의 scalar frozen singleton과 겹치지만 객체 생산량보다 실제 검증 이후 재계산을 줄이는 별도 문제입니다.', limit: 'oneOf forced type-resolution replay만 소음 밖입니다. readAllowedTypes memo 및 schema-read memo는 안정적인 개선이 없으므로 무조건 cache를 권하지 않습니다.' },
];

for (const bound of bounds.filter(bound => bound.fixtures.some(row => Object.values(row.columns).some(column => column.aboveNoise))))
  assert(fixSpecs.some(spec => spec.variants.includes(bound.variant)), bound.variant);

const timerArtifacts = files.filter(name => /-(forced|steady)-r[123]\.json$/.test(name));
const successfulRuns = timerArtifacts.map(read);
assert.equal(successfulRuns.length, (variants.length + 2) * 4 * 2 * 3);
for (const row of successfulRuns) {
  assert.equal(row.samples, 101); assert.equal(row.warmup, 20);
  assert.equal(row.actualMounts.head, 121); assert.equal(row.actualMounts.variant, 121);
  assert.equal(row.timingsMs.head.length, 101); assert.equal(row.timingsMs.variant.length, 101);
  assert.equal(row.emptyTimingsMs.before.length + row.emptyTimingsMs.after.length, 202);
  assert(row.elapsedMs < 480000);
}
for (const profile of cpuProfiles) {
  assert.equal(profile.selfSumUs, profile.denominatorUs);
  for (const run of profile.runs) assert(run.coverage > .99 && run.coverage <= 1.00001);
}
for (const version of ['head', 'old']) for (const name of fixtures) for (const run of [1, 2, 3]) {
  const profile = read(`cpu-${version}-${name}-r${run}.json`);
  assert.equal(profile.counterInstrumentation, false); assert.equal(profile.forcedGC, false);
  assert.equal(profile.samples, 101); assert.equal(profile.warmup, 20);
}
const processFiles = files.filter(name => name.startsWith('process-') && name.endsWith('.json'));
const processRecords = processFiles.map(name => ({ artifact: name, ...read(name) }));
const setupFailures = processRecords.filter(record => record.status !== 0);
const builds = files.filter(name => name.startsWith('build-') && name.endsWith('.json')).map(read);
const controlBuild = read('build-control.json'), headBuild = read('build-head.json');
assert.equal(controlBuild.sha256, headBuild.sha256);
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const generatedFiles = [...files.map(name => ({ file: 'profile-102-work/' + name, bytes: fs.statSync(path.join(work, name)).size })), ...fs.readdirSync(scratch).filter(name => name.startsWith('profile102-')).map(name => ({ file: path.join(scratch, name), bytes: fs.statSync(path.join(scratch, name)).size }))];
assert(generatedFiles.every(row => row.bytes <= 5000000));
assert(!files.some(name => /\.(cjs|map)$/.test(name)));
const validation = { timerArtifacts: successfulRuns.length, cpuArtifacts: 24, countArtifacts: Object.keys(counts).length * 2, processArtifacts: processRecords.length, maximumProcessElapsedMs: Math.max(...processRecords.map(row => row.elapsedMs ?? 0)), signals: processRecords.filter(row => row.signal).map(row => ({ artifact: row.artifact, signal: row.signal })), setupFailures, maximumArtifactBytes: Math.max(...generatedFiles.map(row => row.bytes)), headAndControlByteIdentical: true, sourceDiffEmpty: true, allFixtureObservedValuesEqualAcrossEngines: true,
  successfulMeasurementProcessesNaturallyEnded: processRecords.filter(row => /timer-worker|count-worker|cpu-worker/.test(row.artifact)).every(row => row.status === 0 && !row.signal), artifactLimitBytes: 5000000, commandLimitMs: 480000,
  caveat: '초기 bundle/변형 설정 실패는 자연 종료했고 성공 결과와 구분합니다. timer JSON이 없는 실패는 속도 근거에서 제외했습니다. 최종 값 해시는 Blueprint 전체 및 정적 진단의 동등성을 증명하지 않습니다.' };

validation.cpuWindowCoverageRange = [Math.min(...cpuProfiles.flatMap(profile => profile.runs.map(run => run.coverage))), Math.max(...cpuProfiles.flatMap(profile => profile.runs.map(run => run.coverage)))];
validation.retainedSetupFailureRecords = setupFailures.length;
validation.correctedSetupIssues = ['원본 outfile anchor 범위', 'scratch bundle의 NODE_PATH', 'registry method의 class 한정', 'path replay의 module 상수 제외', 'freeze identity의 hoisting', 'budget replay의 이전 gate identity 제거'];

const summary = { schemaVersion: 1, title: '102: mount 간극의 작업량 귀속', head,
  methodology: { counting: '99C-01 (다): 원본 HEAD/0.16.0 소스와 winglet production CJS에 메모리 AST entry/loop/freeze/path/동적 함수 counters를 넣고 fresh mount 1회만 계수합니다. 계수 bundle은 시간·CPU 측정에 사용하지 않습니다.',
    forced: '95C-01: fresh fixture process, 엔진별 warmup 20, clone 및 forced collection/anchor를 clock 밖에서 수행, 101 H/V pair의 순서를 교대합니다. run 1/3은 H 시작, run 2는 V 시작입니다. 동일한 pooled 202 empty/drain median을 두 엔진에 적용합니다.',
    steady: 'fresh fixture process, 엔진 block마다 warmup 20 후 101회 연속 mount; forced GC 없음. block 순서는 run 1/3 H→V, run 2 V→H입니다. clone과 관측은 clock 밖입니다.',
    cpu: 'fresh process, uninstrumented bundle, warmup 20 후 101 consecutive mounts, forced GC 없음, V8 Inspector Profiler interval 100µs. 원시 timeDelta 구간을 모든 mount window와 교차시켜 가중합니다. GC/program/idle/driver를 분모에서 빼지 않습니다. 3회 가중 합계이며 재귀 total은 같은 함수당 표본을 한 번만 셉니다.',
    mount: 'round-99 canonical production adapter의 nodeFromJSONSchema + Promise 64 checkpoint + setImmediate sentinel입니다. React 렌더 측정이 아닙니다. validation off, subscribers 0입니다.',
    noiseRule: 'fixture/열별 byte-identical control의 3회 |difference-of-medians| 최대값을 envelope로 사용하며 forced는 |paired median|도 포함합니다. 세 회차 모두 envelope보다 큰 difference-of-medians이고 forced는 각 paired median의 근사 95% 순서통계 구간 [41,61] 하한이 0보다 클 때만 ↑입니다. steady ordinal 차이를 paired CI로 사용하지 않습니다.',
    limitations: ['전체 단계 replay/skip은 필요한 공개 결과·진단 작업도 제거하므로 넓은 상한이며 구현 speedup 예측이 아닙니다.', '상한은 겹칩니다. fold/read/type/freeze/children/gate/projection을 합산하지 않습니다.', 'CPU 시간은 짧은 표본의 가중 시간입니다. 경계 표본에 clone/driver가 섞이며 tiny old/sample은 함수 비율을 정밀하게 해석할 수 없습니다.', '일부 서로 다른 역할을 대응시킨 old 열은 연산 동일성을 뜻하지 않으며 원시 site 계수가 정본입니다.'] },
  environment: read('cpu-head-nested-d5-f4-r1.json').environment,
  dimensions: Object.fromEntries(fixtures.map(name => [name, { head: counts[name].head.dimensions, old: counts[name].old.dimensions, normalization: 'static: HEAD blueprint node / old constructed latent node; runtime: 별도 live node 분모' }])),
  workKinds, identityEvidence: identities, scaling, baseline, noise, bounds, cpuProfiles, fixSpecs, designSnapshot, builds, validation,
  artifacts: { driver: 'profile-102-work/measure.mjs', reportGenerator: 'profile-102-work/summarize.mjs', counts: 'profile-102-work/counts-{head,old}-{fixture}.json', cpu: 'profile-102-work/cpu-{head,old}-{fixture}-r{1,2,3}.{json,cpuprofile}', bounds: 'profile-102-work/{variant}-{fixture}-{forced,steady}-r{1,2,3}.json', process: 'profile-102-work/process-*.json', scratchBundles: scratch } };

const report = [];
report.push('# 102: mount 간극의 작업량 귀속', '', '`268832c7c`의 HEAD와 `src/__legacy__` 0.16.0을 같은 production adapter로 비교했습니다. 큰 간극은 단순 fixture에서 숨은 O(N²) 노드 순회가 발견돼서 생긴 것으로 볼 수 없습니다. HEAD는 노드당 실제 정규화 1회, 여러 분석 단계, 약 18회 서로 다른 객체의 동결, live node당 17개 초기 revision 읽기를 수행합니다. oneOf는 다른 양상입니다. 동일 gate 위치 20개를 400회 평가하고 같은 `/kind`를 400회 읽으며 동일 상대 경로를 641회 해석했습니다. old는 단순 equality 사전을 1회 조회합니다.', '', '객체 수를 줄인 결과와 작업 단위를 없앤 결과를 구분했습니다. 아래 replay·skip 수치는 한 단계 전체를 없애는 상한이며, 필요한 공개 결과를 그대로 만드는 안전한 부분 수정이 그 시간을 모두 회수한다는 뜻은 아닙니다.');
report.push('', '## 계측과 분모', '', summary.methodology.counting, '', summary.methodology.forced, '', summary.methodology.steady, '', summary.methodology.cpu, '', summary.methodology.mount, '', '모든 계측은 순차 실행했습니다. 세 회차마다 fresh process를 사용했고 별도 GC가 없는 steady 열을 forced 열과 섞지 않았습니다. 환경은 Apple M1 Max / arm64 / Node v26.10.0 / V8 14.6.202.34-node.35 / esbuild 0.25.9입니다. bundle과 map은 지정된 scratchpad에만 있습니다.');
report.push('', table(['fixture', 'template N / schema F', 'live HEAD / old', '생성 runtime HEAD / old'], fixtures.map(name => { const c = counts[name]; return [name, `${c.head.dimensions.blueprintNodes} / ${c.head.dimensions.schemaObjects}`, `${c.head.dimensions.liveNodes} / ${c.old.dimensions.liveNodes}`, `${c.head.dimensions.constructedNodes} / ${c.old.dimensions.constructedNodes}`]; })), '', '정적 작업의 node 분모는 HEAD blueprint N이며 old의 잠재 후보 runtime node 수와 같습니다. oneOf의 live 6개를 정적 template 63개의 분모 대신 쓰면 branch 크기 증가를 잘못된 차수로 읽게 됩니다. runtime 작업은 JSON에 live node당 값도 함께 제공합니다.');
report.push('', '## mount 시간과 소음', '', table(['fixture', 'forced HEAD / old / 간극 ms', 'steady HEAD / old / 간극 ms', 'control envelope forced / steady ms'], baseline.map(row => [row.fixture, [row.columns.forced.headMedianMs, row.columns.forced.oldMedianMs, row.columns.forced.gapMs].map(format).join(' / '), [row.columns.steady.headMedianMs, row.columns.steady.oldMedianMs, row.columns.steady.gapMs].map(format).join(' / '), [noise[row.fixture].forced.envelopeMs, noise[row.fixture].steady.envelopeMs].map(format).join(' / ')])), '', '세 회차의 중앙값을 표시했습니다. 각 회차 median/p5/p95/p99·101개 원시 시간·forced paired 차이·empty/drain은 개별 JSON에 보존했습니다. ' + summary.methodology.noiseRule);
report.push('', '## 작업 계수', '', '각 셀은 `HEAD mount당 횟수 / old mount당 횟수 (HEAD node당 / old node당)`입니다. 0은 해당 작업 또는 공개 기록이 없다는 뜻이며 old가 아무 일도 하지 않는다는 뜻은 아닙니다. 대응 함수·다른 단위·중복 행을 아래와 JSON에 명시했습니다. 이 표를 합산해 총 작업량 하나로 만들지 마십시오.', '', table(['작업', ...fixtures], workKinds.map(kind => [kind.title, ...kind.fixtures.map(row => `${row.head.perMount} / ${row.old.perMount} (${row.head.perTemplateNode.toFixed(3)} / ${row.old.perTemplateNode.toFixed(3)})`)])));
report.push('', ...workKinds.map(kind => `- **${kind.title}**: ${kind.operation}. ${kind.note}`));
report.push('', '### 반복의 실제 단위', '', '- 타입 읽기: nested/flat/sample에서 `readAllowedTypes=3N`, schema identity는 N개입니다. collector → group resolver → contribution 적용의 세 경로입니다. `readSchemaObject`는 nested 9,213/1,365, flat 3,009/501, oneOf 644/83개 identity입니다. 값 반환·typeof 수준의 반복이라 두 memo 후보는 안정적인 시간 이득이 없었습니다.', '- 실제 병합: nested 1,365, flat 501, sample 3회입니다. runtime `mergeEffectiveSchema` 입구를 다시 fold로 세면 안 됩니다. HEAD의 static normalization reuse가 이미 이중 병합을 없앴습니다. oneOf는 71회이고 `(node, mode, selected IDs)`는 모두 다르지만 mode를 빼면 **67개 선택 집합, 4회 정적/런타임 재계산**입니다. 선택 집합을 유지하는 memo는 개선이 없었고, 선택 변경까지 무시한 node-only memo의 큰 수치는 안전한 중복 제거 예산이 아닙니다.', '- 제약: simple fixture에 제약 키가 없어도 contribution당 `numberValue` 32회, minimum/maximum 교집합 각 5회, enum/const/multipleOf helper 각 1회가 실행됩니다. 이는 병합 안의 범용 검사 작업입니다.', '- 동결: nested 24,911회 = 18N + object 호스트 341, flat 9,019회 = 18N + 1입니다. **동결 대상도 각각 24,911/9,019개이고 같은 객체를 재동결하지 않습니다.** freeze-zero는 필요한 immutable output까지 생략한 예산입니다.', '- gate: oneOf의 gate/location key는 20개이고 key당 20회, 총 400회입니다. projection은 동일 context/path 1개를 400회, resolveDependencyPath는 동일 host/dependency 1쌍을 641회 실행합니다. 생성한 Function도 HEAD 20개/호출 400회, old 0개/0회이며 old의 단순 equality callback은 1회입니다.', '- index: oneOf dependency index 생성 1회/add 100회, getter 3회; budget index 수집 145회/생성 1회입니다. GateRegistry locate 400회·register 429회는 대부분 기존 위치의 guard hit입니다. 단순 폼에서 이 index/registry 작업은 실행되지 않습니다. PathStoreIndex.add는 2회, oneOf 8회이고 ancestor loop는 oneOf 13회입니다. 노드마다 모든 조상 path index를 재구축하는 패턴은 관측되지 않았습니다.', '- shape: nested/flat/sample `visitShape=2N−1`은 outer node loop와 edge 진입을 함께 센 값입니다. `complete` guard가 subtree 재확장을 막으므로 O(N)입니다. old의 전체 reference scanner는 authored schema당 1회 방문합니다.', '- revision: nested 23,205 / flat 8,517 / sample 51회는 live node당 17개 빈 previous bit 읽기입니다. 변형도 ledger당 배열 하나를 유지하면서 이 읽기·fill 작업을 없애므로 객체 수 감소와 다른 증거입니다.');
report.push('', '### 반복을 만드는 호출 경로', '', table(['작업', 'HEAD의 호출 경로', 'old 대응'], [
  ['타입 3회', `${productLink('core/blueprint/utils/analyze/buildNodes.ts', 49)} → collectDeclarations.ts:42 → readAllowedTypes; resolveNodeTypes.ts:33–40 → readAllowedTypes; buildNodes.ts:92 → mergeSchemaContributions.ts:51 → applySchemaContribution.ts:43 → applyTypeContribution`, '__legacy__/core/nodes/schemaNodeFactory.ts:131 → processAllOfSchema.ts:29 조기 반환 → extractSchemaInfo.ts:13'],
  ['경로와 key 재직렬화', `${productLink('core/blueprint/utils/analyze/buildNodes.ts', 35)} → getTemplateKey.ts:15; buildNodes.ts:42에서 key+hostPaths를 다시 stringify; populateNodeChildren.ts:77/161 및 core/SchemaNode/utils/binding/buildSchemaNodeTree.ts의 runtime child path`, 'schemaNodeFactory 및 AbstractNode joinSegment 경로; 원시 site/문자량은 counts-old JSON'],
  ['order 복사', `${productLink('core/blueprint/utils/analyze/populateNodeChildren.ts', 78)} → buildNodes → collectDeclarations.ts:67에서 input.order 재복사`, '동일한 blueprint order 공개 벡터 없음'],
  ['fragment 반환 flatten', `${productLink('core/blueprint/utils/analyze/collectDeclarations.ts', 130)} → recursive collectDeclarations → :114/$ref 및 :170/keyword의 result.push(...반환 배열)`, '__legacy__/helpers/jsonSchema/getResolveSchema/utils/getReferenceTable.ts:16 → winglet JSONSchemaScanner.cjs:15/47 → getStackEntriesForNode.cjs:74'],
  ['gate·projection 재읽기', `${productLink('core/settle/utils/compute/selectChildren.ts', 156)} → :160–164 evaluateGate → getGateRegistry.ts:83/86 → evaluateGate.ts:111–115 → resolveDependencyPath.ts:7 / readProjectedValue.ts:25`, '__legacy__/getConditionIndexFactory.ts:52 → getSimpleEquality.ts:59 사전 lookup'],
  ['dependency/budget 별도 열거', `${productLink('core/settle/utils/write/getDependencyIndex.ts', 32)} → :39–61 declarations/gates; getGateBudgetCap.ts:36/50–53에서 node와 child declarations 재열거`, 'PathManager.ts:23 set 및 condition 식 20개 준비'],
  ['shape 입구 재방문', `${productLink('core/blueprint/utils/diagnostics/validateShape.ts', 13)} → visitShape.ts:14/20–25 complete guard → :41 child visit`, 'getReferenceTable scanner authored node 방문'],
  ['초기 ledger', `${productLink('core/record/utils/SchemaNodeRevisionLedger.ts', 18)} → :19–20 Array.from callback 17회 → :22–26 mask update`, 'AbstractNode의 EventCascade / computed manager 초기화'],
]));
report.push('', '## 성장 차수', '', '단순 nested에서 declaration/type/fold/freeze/shape 방문 횟수는 N에 선형입니다. key와 경로의 문자열 길이, 조상 order의 복사 원소 수는 O(Σ depth)이며 균형 4분 트리에서는 O(N log N)입니다. 문자열이 호출 N회라는 이유만으로 생산 바이트도 O(N)이라고 볼 수 없습니다. public full path/order를 유지하는 데 필요한 양과, 이를 임시 input·key에서 다시 복사하는 양을 구분하십시오.', '', table(['fixture', 'N', 'decl / type / merge / freeze / shape', 'template / bound key 문자', 'schema / data path 문자', 'input / final order 복사 원소', 'old scanner / 타입 / path 관련 문자'], scaling.filter(row => /^(nested|flat)-/.test(row.fixture)).map(row => [row.fixture, row.nodes, [row.declarations, row.types, row.merges, row.freezes, row.visits].join(' / '), `${row.templateKeyCharacters} / ${row.boundKeyCharacters}`, `${row.schemaPathCharacters} / ${row.dataPathCharacters}`, `${row.inputOrderCopiedElements} / ${row.finalOrderCopiedElements}`, `${row.oldScannerVisits} / ${row.oldTypeReads} / ${row.oldPathRelatedCharacters}`])));
report.push('', 'fragment 사슬은 input 크기 F가 증가하고 runtime/template N은 1입니다. 깊은 `allOf`의 각 상위 collector가 하위 반환 배열 전체를 합치므로 복사 원소는 k(k+1)/2입니다. F가 같은 평면 목록에서는 k개입니다. 이것이 확인된 진짜 제곱 중간 작업입니다. 공개 order 자체도 깊이 합계가 제곱으로 늘지만, 동일한 공개 내용 조건에서는 그 최종 벡터를 삭제할 수 없습니다. old scanner는 chain/flat 모두 F회 방문합니다.', '', table(['fixture', 'N / F', '반환 flatten 복사', '최종 order 재복사', 'fold 호출', 'old scanner'], scaling.filter(row => row.fixture.startsWith('fragment-')).map(row => [row.fixture, `${row.nodes} / ${row.fragments}`, row.flattenedReturnCopiedElements, row.finalOrderCopiedElements, row.merges, row.oldScannerVisits])));
report.push('', 'oneOf branch 크기를 늘리면 고정 live 6개에 대해 dormant template/fragment 양이 늘어납니다. gate 평가 20B, path 해석 32B+1은 B에 **선형**입니다. 분기 크기 증가를 O(B²)라고 부르지 않습니다. template occurrence당 subtree 재분석이나 fragment당 subtree 재병합의 초선형 패턴은 이 scale 집합에서 발견되지 않았습니다. chain의 여러 선언은 fold 2회 안에서 선형 처리됩니다.', '', table(['fixture', 'template / fragment / live', 'gate / projection / resolve path', 'old equality lookup / scanner'], scaling.filter(row => row.fixture.startsWith('oneOf-')).map(row => [row.fixture, `${row.nodes} / ${row.fragments} / ${row.liveNodes}`, `${row.gateEvaluations} / ${row.projections} / ${row.dependencyPaths}`, `${row.oldEqualityLookups} / ${row.oldScannerVisits}`])));
report.push('', '## 계수 없는 steady CPU profile', '', '세 fresh process의 가중 합계를 표시합니다. 아래 `self / total %`의 분모는 GC·program·idle·driver를 포함한 모든 mount window 표본입니다. self 합은 분모와 정확히 일치하고 total은 호출 관계 때문에 더할 수 없습니다. source map은 제품 HEAD 파일:줄에 매핑했습니다. driver frame의 줄 번호는 채집 당시 드라이버 revision의 번호입니다. 모든 함수의 self/total·표본·ms/mount는 summary JSON의 cpuProfiles에 있으며 각 회차 원시 .cpuprofile도 보존했습니다.', '', 'Profiler 자체의 부하가 있으므로 profile clock은 end-to-end 이득 열로 사용하지 않았습니다. 100µs는 요청 interval이며 실제 timeDelta는 달라집니다. window 경계에 걸친 표본은 일부 clone/driver 시간을 담습니다. 특히 old oneOf와 sample-0는 수십~수백 표본 수준이므로 작은 함수의 순위·비율은 정밀 추정으로 읽지 마십시오. 경계 표본을 임의로 삭제해 분모를 작게 만들지 않았습니다.');
for (const profile of cpuProfiles) {
  const top = profile.functions.slice(0, 12);
  for (const label of ['(garbage collector)', '(program)', '(idle)']) {
    const found = profile.functions.find(row => row.function === label);
    if (!top.includes(found)) top.push(found);
  }
  report.push('', `### ${profile.fixture} / ${profile.version === 'head' ? 'HEAD' : '0.16.0'}`, '', `303 mounts / ${profile.sampleCount} window 표본 / 분모 ${(profile.denominatorUs / 1000).toFixed(3)} ms. 회차 coverage ${profile.runs.map(row => (row.coverage * 100).toFixed(3) + '%').join(', ')}.`, '', table(['함수 · source:line', 'self / total %', 'self / total ms/mount', '작업 대응'], top.map(row => [`\`${row.function}\` · \`${row.file.replace('packages/canard/schema-form/src/', '')}:${row.line}\``, `${row.selfPct.toFixed(2)} / ${row.totalPct.toFixed(2)}`, `${row.selfMsPerMount.toFixed(4)} / ${row.totalMsPerMount.toFixed(4)}`, row.workKind])));
}
report.push('', '## 작업 제거 상한', '', '셀은 `세 회차 difference-of-medians 중앙값 [최소, 최대] ms`이며 `↑`만 위의 control/paired 규칙을 통과했습니다. 음수는 변형이 느려졌다는 뜻입니다. forced와 steady는 별도 열입니다. 모든 후보는 counters 없이 20+101 mounts를 세 회차 실행했습니다. 순수 memo에는 lookup 비용을 포함했습니다. replay는 최초 warmup의 결과를 발생 순서로 빌리며 결과가 틀릴 수 있는 측정용 코드입니다. 최종 값 해시 일치는 전체 Blueprint·정적 진단 동등성 증명이 아닙니다.');
for (const name of fixtures) report.push('', '### ' + name, '', table(['변형', 'forced bound ms', 'steady bound ms'], bounds.map(bound => {
  const row = bound.fixtures.find(row => row.fixture === name);
  return [bound.variant, ...['forced', 'steady'].map(regime => { const value = row.columns[regime]; return `${value.aboveNoise ? '↑ ' : ''}${format(value.medianBoundMs)} [${value.rangeMs.map(format).join(', ')}]`; })];
})));
report.push('', table(['변형', '생략한 작업', '해석 제한'], variants.map(([name, , method, limitation]) => [name, method, limitation])));
report.push('', '관측상 채택을 뒷받침하지 않는 항목도 남겼습니다. allowed/schema-read memo, 같은 selection의 merge memo, strategy replay, order-only/sink-only, root-only shape, child-target skip, registry replay, budget 합성 및 path index add skip은 각 주 fixture에서 두 열에 공통으로 안정적인 이득이 없습니다. 특히 cheap read의 호출 횟수만 보고 cache를 추가하거나, fragment chain의 제곱 개선을 nested mount 전체의 큰 개선으로 해석해서는 안 됩니다.');
report.push('', '## 소음 밖 상한에 대응하는 단일 변경 명세', '', '아래 순위는 안전하게 좁힐 수 있는 변경과 두 열의 재현성을 우선한 것입니다. 제품 변경은 수행하지 않았습니다. 전체 단계 생략 상한이 큰 경우에도 수정은 반복 중간 작업만 제거하며 공개 결과 생성과 정적 검증은 유지합니다. 어느 명세에도 전체 상한 회수를 보장하지 않습니다.');
for (const spec of fixSpecs) report.push('', `### ${spec.rank}. ${spec.title}`, '', `대응: ${spec.variants.map(value => '\`' + value + '\`').join(', ')}. ${spec.change}`, '', `근거 경로: \`${spec.chain}\`.`, '', `보존 조건: ${spec.preserved}`, '', `설계 중첩: ${spec.overlap}`, '', `측정 한계: ${spec.limit}`);
report.push('', '각 구현의 acceptance는 기존 captureBlueprintObservables 전체 비교, frozen 상태와 필수 reference 관계, static 오류·warning의 code/source path/발생 순서/개수 비교입니다. boolean·nullable·충돌 constraint·무효 pattern·custom collect/isAtomic·gated inactive branch·$ref 다중 host·order-sensitive overlays를 포함해야 합니다. 성공 fixture의 값 해시만으로 통과시키면 안 됩니다. gate/projection 수정은 중간 값 쓰기, 앞 gate의 flush, extras, 배열 rekey와 같은 occurrence의 다른 host도 검증해야 합니다.', '', `설계 문서 읽기 단면: SHA256 \`${designSnapshot.sha256}\`, 문서의 source 단면 \`${designSnapshot.observedSourceRevision}\`. ${designSnapshot.note}`);
report.push('', '## 산출물 검증', '', `성공 time artifact ${validation.timerArtifacts}개, CPU artifact 24개, count artifact ${validation.countArtifacts}개를 검사했습니다. 각 시간 열은 engine당 정확히 warmup 20 + measured 101회, empty/drain 202개이며 CPU는 forced GC/counter 없이 20+101회입니다. GC/program 포함 self 가중 합과 분모 보존, window coverage, HEAD/control bundle byte 일치, 모든 fixture의 old/HEAD 값 해시 일치를 확인했습니다.`, '', `측정 driver process 기록의 최대 elapsed는 ${(validation.maximumProcessElapsedMs / 1000).toFixed(3)}초이고 signal 기록은 ${validation.signals.length}개입니다. 기록된 worker는 스스로 종료했습니다. 초기 설정 실패 ${setupFailures.length}건은 성공 시간 artifact와 분리했습니다. 가장 큰 생성 artifact는 ${validation.maximumArtifactBytes.toLocaleString('en-US')} bytes로 5 MB 이하입니다. 성공 결과만 근거로 사용했습니다.`, '', 'HEAD와 src의 tracked diff가 없으며 git write·설치·제품 소스 변경은 하지 않았습니다. 두 설계 문서는 편집하지 않았습니다. repository 내부 bundle/map은 만들지 않았습니다. monorepo build/lint/typecheck/test는 제품 변경이 없는 이 분석의 검증 수단으로 실행하지 않았으며, 지정된 계측 adapter와 데이터·artifact 검사를 사용했습니다.', '', '- [계측 driver](profile-102-work/measure.mjs)', '- [보고서 생성 계산](profile-102-work/summarize.mjs)', '- [전체 요약 JSON](profile-102-work-summary.json)', '- raw counts: `profile-102-work/counts-{head,old}-{fixture}.json`', '- raw CPU: `profile-102-work/cpu-{head,old}-{fixture}-r{1,2,3}.{json,cpuprofile}`', '- raw time: `profile-102-work/{variant}-{fixture}-{forced,steady}-r{1,2,3}.json`', '- 자연 종료 및 build hash: `profile-102-work/process-*.json`, `build-*.json`', '', `bundle/map 위치: \`${scratch}\`.`, '');

const outputs = { summary: JSON.stringify(summary, null, 2) + '\n', report: report.join('\n') };
outputs.report = outputs.report.replace('세 회차의 중앙값을 표시했습니다.', '세 회차의 중앙값을 표시했습니다. HEAD·old·간극은 각각 세 회차의 중앙값이므로 표시한 HEAD−old와 간극이 정확히 일치하지 않을 수 있습니다.').replace('가장 큰 생성 artifact는', '가장 큰 실행별·scratch 산출물은').replace('초기 설정 실패 ' + setupFailures.length + '건', '기록에 남은 초기 설정 실패 ' + setupFailures.length + '건');
outputs.report += '\n계수의 문자열 길이는 UTF-16 code unit, 배열 spread 길이는 복사한 원소 수입니다. CPU window 표본 coverage 범위는 ' + validation.cpuWindowCoverageRange.map(value => (value * 100).toFixed(3) + '%').join('–') + '이며, profile 시작/끝에서 표본 interval이 없는 부분은 분모에 만들지 않았습니다. 수정한 setup 문제는 summary.validation.correctedSetupIssues에 기록했고, 실패 시간은 상한 집계에 사용하지 않았습니다.\n';
validation.maximumPerRunOrBundleBytes = validation.maximumArtifactBytes;
for (let attempt = 0; attempt < 5; attempt++) {
  validation.outputBytes = { report: Buffer.byteLength(outputs.report), summary: Buffer.byteLength(outputs.summary) };
  validation.maximumArtifactBytes = Math.max(validation.maximumPerRunOrBundleBytes, ...Object.values(validation.outputBytes));
  const next = JSON.stringify(summary, null, 2) + '\n';
  if (next === outputs.summary) break;
  outputs.summary = next;
}
for (const value of Object.values(outputs)) assert(Buffer.byteLength(value) <= 5000000);
const [command, target, startText, lengthText] = process.argv.slice(2);
if (command === '--part') {
  const start = Number(startText), length = Number(lengthText);
  console.log(JSON.stringify({ target, start, total: outputs[target].length, sha256: hash(outputs[target]), chunk: outputs[target].slice(start, start + length) }));
} else {
  console.log(JSON.stringify({ reportBytes: Buffer.byteLength(outputs.report), summaryBytes: Buffer.byteLength(outputs.summary), reportCharacters: outputs.report.length, summaryCharacters: outputs.summary.length, validation, aboveNoise: bounds.filter(bound => bound.fixtures.some(row => Object.values(row.columns).some(column => column.aboveNoise))).map(bound => bound.variant), baseline }));
}
