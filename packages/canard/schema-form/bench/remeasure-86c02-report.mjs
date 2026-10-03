// Report derivation entry: reads saved samples and prints Markdown; does not run benchmarks.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(pkg, 'architecture/verification/07-switch');
const read = name => JSON.parse(fs.readFileSync(path.join(out, `${name}.json`), 'utf8'));
const core = read('86c02-final-core-plain');
const phases = read('86c02-final-core-traced');
const react = read('86c02-final-render-plain-production');
const development = read('86c02-final-render-plain');
const reactPhases = read('86c02-final-render-traced-production');
const stages = ['baseline', 'i', 'ii', 'iii'].map(stage => read(`86c02-${stage}-core-traced`));
const beforeArray = read('86c02-before-iv-render-plain-production');
const afterArray = read('86c02-iv-render-plain-production');
const datasets = [core, phases, react, development, reactPhases, ...stages, beforeArray, afterArray];
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];
const fmt = value => Number.isFinite(value) ? value.toFixed(4) : '—';
const pair = (data, row, version = 'old') => data.rows.find(candidate =>
  candidate.fixture === row.fixture && candidate.mode === row.mode &&
  candidate.validation === row.validation && candidate.version === version);
const phaseSum = (row, names) => median(row.samples.map(sample =>
  names.reduce((sum, name) => sum + (sample.phases[name] ?? 0), 0)));
const ajv = row => median(row.samples.map(sample => Object.entries(sample.details)
  .filter(([name]) => name.startsWith('AJV:')).reduce((sum, [, item]) => sum + item.ms, 0)));
const calls = (row, name) => median(row.samples.map(sample => Object.entries(sample.details)
  .filter(([site]) => site.endsWith(`:${name}`)).reduce((sum, [, item]) => sum + item.calls, 0)));
const nonAjvPhase = (row, phase) => median(row.samples.map(sample => {
  const pure = Object.entries(sample.details).filter(([site]) =>
    phase === 'validation-registration' ? site.startsWith('AJV:compile') :
      phase === 'validation-run' && (site === 'AJV:validate' || site === 'AJV:guard'))
    .reduce((sum, [, item]) => sum + item.ms, 0);
  return (sample.phases[phase] ?? 0) - pure;
}));

for (const data of datasets) {
  assert(data.environment.warmup >= 10 && data.environment.samples >= 100);
  for (const row of data.rows) {
    assert(row.samples.length >= 100);
    assert(Number.isFinite(row.total.median));
  }
}
assert(react.environment.mode === 'production-profiling');
assert(development.environment.mode === 'development');
assert(react.rows.every(row => row.profiler.median > 0 && row.commits.median > 0));

const text = [
  '# 86C-02 재측정 — 다섯 코드 후보', '',
  `측정 HEAD: \`${core.environment.head}\`. 아래 new는 이 worktree의 다섯 후보 적용 소스이며 old는 보존 0.16.0 코어 + 태그의 React 바인딩입니다. 실행 환경: ${core.environment.cpu}, Node ${core.environment.node}, V8 ${core.environment.v8}, React ${core.environment.react}, AJV ${core.environment.ajv}.`, '',
  '## 방법과 판정 단위', '',
  '- BF equivalent의 flat 50/100/500, nested d3/d5(fanout=4), array 100/500/1000, derived, oneOf 5/10/20 및 진단의 if/then을 사용했습니다. 원본 진단과 같은 쓰기 열·배출·값/최종 렌더 경로 단언을 유지했습니다.',
  '- 각 픽스처·검증 설정마다 예열 12쌍, 표본 101쌍, old/new 순서 교대, 매 표본 명시적 GC입니다. p99는 최근접 순위의 100번째 값입니다. 측정 프로세스와 테스트는 병렬로 실행하지 않았습니다.',
  '- OFF는 validator를 주입하지 않습니다. 원 진단 하니스는 OFF에서도 validator를 전달했으므로 이 보고서의 ON/OFF 분리는 그 조건을 교정한 재측정입니다. ON의 AJV 컴파일/실행/guard를 따로 계측합니다.',
  '- validator 없는 if/then은 기존 계약대로 조건 스키마가 비활성이고 개발 Form은 CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR 경고를 냅니다. OFF는 분기 검증 실행을 흉내 내는 대체 validator가 아닙니다. 이 경고 비용도 개발 기록의 한계이며 production 게이트에는 없습니다.',
  '- 코어 게이트는 원 진단과 같은 배타 단계 합(active) 중앙값입니다. 옛 엔진의 호출 반환 뒤 비동기 정착도 포함하고 타이머 대기는 제외합니다. 무계측 synchronous는 옛 엔진의 그 작업을 제외하므로 게이트 대신 보조 자료로 둡니다. span 계측 비용·JIT의 한계가 있으며 phase 상한을 무계측 React Profiler 값에서 빼지 않습니다.',
  '- React 게이트는 양쪽 모두 production react-dom/profiling + Profiler의 actualDuration 합 중앙값입니다. 개발 빌드 수치는 같은 표에 “개발 빌드, owner-stack 예산 비대칭”으로 남기며 게이트로 쓰지 않습니다. 커밋 수와 wall은 원 표본에 있습니다.',
  '- 목표: 코어 OFF mount/update 1.5×; React production mount 1.2×, update 1.0×. ON/OFF 차이의 비-AJV 몫도 1.5×로 별도 판정합니다. p99는 기록하며 중앙값으로 판정합니다.', '',
  '## 후보별 분리 측정', '',
  'i→ii→iii는 각 단계 후 같은 큰 픽스처를 별도 실행했습니다. v는 iii 이후 코어 비교이며 iv는 코어를 바꾸지 않습니다. iv는 i/ii/iii만 적용한 배열 production 실행과 i/ii/iii/iv만 적용한 별도 실행을 비교하여 v를 제외했습니다. 별도 실행의 환경/JIT 변동을 제거한 인과 추정치는 아니므로 증가도 그대로 기록합니다. old 대비 비율 변화도 함께 제시합니다.', '',
  '| 후보 | 픽스처·작업 | 이전 median ms | 이후 median ms | 변화(절감 +) | old 대비 비율 이전→이후 |',
  '| --- | --- | ---: | ---: | ---: | --- |',
];
for (const [label, before, after, metric] of [
  ['i', stages[0], stages[1], 'active'], ['ii', stages[1], stages[2], 'active'],
  ['iii', stages[2], stages[3], 'active'], ['iv', beforeArray, afterArray, 'profiler'],
  ['v', stages[3], phases, 'active'],
]) {
  for (const previous of before.rows.filter(row => row.version === 'new' &&
    (label === 'iv' ? row.mode === 'update' : row.mode === 'mount'))) {
    const current = pair(after, previous, 'new');
    const oldBefore = pair(before, previous)[metric].median;
    const oldAfter = pair(after, current)[metric].median;
    const a = previous[metric].median, b = current[metric].median;
    const scope = label === 'v' && /array|computed/.test(previous.fixture) ? 'v 미적용 대조' : label;
    text.push(`| ${scope} | ${previous.fixture} ${previous.mode} | ${fmt(a)} | ${fmt(b)} | ${fmt(a - b)} ms (${((a - b) / a * 100).toFixed(1)}%) | ${(a / oldBefore).toFixed(2)}× → ${(b / oldAfter).toFixed(2)}× |`);
  }
}
text.push('', '연산 검증: i의 두 자식 경로 직렬화 6→2 이하, ii의 정적 발생 경로 등록 5→0, iii의 빈 배달 커밋 Set 생성 6→3, iv의 값 전용 rerender 자식 호출 2→1, v의 독립 기본값 5노드 출력 조립 10→5. 각 연산 검증은 적용 전에 실패를 확인했고 기존 동작 특성은 유지했습니다.', '',
  '| 후보 | 시간·메모리 비용 | 보존 범위 |', '| --- | --- | --- |',
  '| i | 빈 lookup/직렬화와 같은 ID 재등록 제거; 영구 메모리 증가 없음 | 모든 노드·생김·입력 분배 |',
  '| ii | 정적 발생별 O(ND) 경로 색인 제거; 선언 소유자별 O(선언 수) weak cache | 게이트 경로 색인·VALIDATE-048·제어 source 우선순위 |',
  '| iii | 빈 임시 Set 3개 감소; 작업이 있는 후보의 O(N) 비용 유지 | revision·payload·방문 순서 |',
  '| iv | 값 갱신 목록 작업 O(N)→고정 속성 비교; 입력당 memo fiber·직전 props 보유 | 자식 identity/구조/readOnly/disabled/schema/style |',
  '| v | 중복 계산·재계산 등록 감소; 최초 로드 O(N) 후위 참조 목록과 blueprint당 boolean | 독립 스칼라 기본값만, 전체 생성·기본값 쓰기 순서·즉시 확정 |', '',
  '## 행별 목표 판정', '',
  '| 층·빌드 | 픽스처 | 검증 | 작업 | old median / p99 ms | new median / p99 ms | 비율 | 목표 | 판정 |',
  '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- |');
const failures = [];
let passed = 0, missed = 0;
for (const [label, data, metric, gated] of [
  ['코어·배타 active', phases, 'active', true],
  ['코어·무계측 synchronous 대조(비동기 정착 제외)', core, 'synchronous', false],
  ['React·production profiling', react, 'profiler', true],
  ['React·개발 빌드, owner-stack 예산 비대칭', development, 'profiler', false],
]) {
  for (const row of data.rows.filter(row => row.version === 'new')) {
    const old = pair(data, row), a = old[metric], b = row[metric];
    const ratio = b.median / a.median;
    const limit = data === phases ? 1.5 : row.mode === 'mount' ? 1.2 : 1;
    const gate = gated && (data !== phases || row.validation === 'off');
    const verdict = !gate ? '기록' : ratio <= limit ? '충족' : '미달';
    if (gate) {
      if (ratio <= limit) passed++;
      else { missed++; failures.push({ label, row, ratio, limit,
        gap: b.median - limit * a.median, data: data === phases ? phases : reactPhases }); }
    }
    text.push(`| ${label} | ${row.fixture} | ${row.validation} | ${row.mode} | ${fmt(a.median)} / ${fmt(a.p99)} | ${fmt(b.median)} / ${fmt(b.p99)} | ${ratio.toFixed(3)}× | ${gate ? limit.toFixed(1) + '×' : '—'} | ${verdict} |`);
  }
}
text.push('', `직접 게이트 행: 충족 ${passed}, 미달 ${missed}. 아래 ON/OFF 비-AJV 판정은 별도입니다. 미달이 남으면 G26을 통과로 처리하지 않습니다.`, '',
  '## 코어·React 배타 단계 (각 중앙값 ms)', '',
  '계측 오버헤드가 포함된 원 진단 방식입니다. 중앙값은 합에 대해 가법적이지 않습니다. old/new 모두 같은 span 삽입 규칙을 사용하되 함수 호출 수는 다릅니다.', '',
  '| 층 | 픽스처 | 검증 | 작업 | 판 | 분석 | 생성 | 정착 | 검증 등록 | 검증 실행 | 배달 | React render | React commit | active | wall |',
  '| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
for (const [label, data] of [['core', phases], ['React production', reactPhases]])
  for (const row of data.rows) text.push(`| ${label} | ${row.fixture} | ${row.validation} | ${row.mode} | ${row.version} | ${['analysis','creation','settlement','validation-registration','validation-run','delivery','react-render','react-commit'].map(name => fmt(row.phases[name].median)).join(' | ')} | ${fmt(row.active.median)} | ${fmt(row.total.median)} |`);

text.push('', '## ON/OFF 차이의 AJV와 비-AJV', '',
  'delta=ON active 중앙값−OFF active 중앙값, AJV=컴파일·검증·guard 배타 표본 합의 중앙값, 비-AJV=delta−AJV 차이입니다. 이는 독립 표본 간 잔차이며 음수는 절감 보장이 아니라 잡음/경로 차이입니다. old 잔차≤0인데 new>0이면 유한 배율로 통과시키지 않습니다. new 잔차≤0은 양의 추가 비용 없음으로 표시합니다. React에서는 AJV 바깥의 추가 렌더도 잔차에 포함하는 보수적 상한입니다.', '',
  '| 층 | 픽스처 | 작업 | old delta / AJV / 비-AJV ms | new delta / AJV / 비-AJV ms | 비-AJV 배율 | 1.5× 판정 |',
  '| --- | --- | --- | ---: | ---: | ---: | --- |');
let residualMissed = 0;
for (const [label, data] of [['core', phases], ['React production', reactPhases]]) {
  for (const on of data.rows.filter(row => row.version === 'new' && row.validation === 'on')) {
    const values = ['old','new'].map(version => {
      const current = pair(data, on, version), off = pair(data, { ...on, validation: 'off' }, version);
      const delta = current.active.median - off.active.median;
      const ajvDelta = ajv(current) - ajv(off);
      return [delta, ajvDelta, delta - ajvDelta];
    });
    const [old, next] = values;
    const ratio = old[2] > 0 ? next[2] / old[2] : Infinity;
    const pass = next[2] <= 0 || ratio <= 1.5;
    if (!pass) {
      residualMissed++;
      failures.push({ label: `${label} 비-AJV 잔차`, row: on, ratio, limit: 1.5,
        gap: next[2] - 1.5 * Math.max(old[2], 0), data, residual: true });
    }
    const ratioText = next[2] <= 0 ? '양의 추가분 없음' :
      Number.isFinite(ratio) ? fmt(ratio) + '×' : 'old 잔차≤0, 유한 배율 없음';
    text.push(`| ${label} | ${on.fixture} | ${on.mode} | ${old.map(fmt).join(' / ')} | ${next.map(fmt).join(' / ')} | ${ratioText} | ${pass ? '충족' : '미달'} |`);
  }
}
text.push('', `비-AJV 잔차 미달 ${residualMissed}행. AJV 자체의 증가를 이 잔차에 포함해 면제하지 않습니다.`, '',
  '## 미달 행의 이유와 구조 후보 상한', '',
  'b1은 분석 span 전체, b2는 생성+정착 span 전체를 완전히 미룬다는 계측상 최대 예산입니다. 둘의 하한은 0이고 구현 이득이 아닙니다. 일반 업데이트에는 최초 생성 지연을 적용할 수 없으므로 상한을 0으로 둡니다. React의 전체 렌더에서는 결국 모든 노드가 필요하므로 mount에서도 실현 이득 0이 가능합니다. b1/b2의 절감은 payload·revision 비용을 포함하지 않습니다.', '',
  '| 층 | 픽스처 | 검증 | 작업 | 게이트 비율/목표 | 목표까지 간극 ms | 단계별 초과 이유: new 비용(Δ old) ms | b1 상한 ms | b2 상한 ms |',
  '| --- | --- | --- | --- | --- | ---: | --- | ---: | ---: |');
for (const failure of failures) {
  const row = pair(failure.data, failure.row, 'new');
  const old = pair(failure.data, row);
  const top = Object.keys(row.phases).filter(name => name !== 'wait')
    .map(name => {
      const current = failure.residual ? nonAjvPhase(row, name) - nonAjvPhase(
        pair(failure.data, { ...row, validation: 'off' }, 'new'), name) : row.phases[name].median;
      const previous = failure.residual ? nonAjvPhase(old, name) - nonAjvPhase(
        pair(failure.data, { ...row, validation: 'off' }), name) : old.phases[name].median;
      return { name, current, delta: current - previous };
    }).sort((a,b) => b.delta - a.delta).slice(0,3)
    .map(({ name, current, delta }) => `${name} ${fmt(current)} (Δ${delta >= 0 ? '+' : ''}${fmt(delta)})`).join(', ');
  const mount = row.mode === 'mount';
  text.push(`| ${failure.label} | ${row.fixture} | ${row.validation} | ${row.mode} | ${failure.ratio.toFixed(3)}× / ${failure.limit.toFixed(1)}× | ${fmt(failure.gap)} | ${top} | ${fmt(mount ? row.phases.analysis.median : 0)} | ${fmt(mount ? phaseSum(row, ['creation','settlement']) : 0)} |`);
}
text.push('', '표는 old 대비 배타 비용 증가가 큰 세 단계를 보입니다. 비-AJV 잔차 행은 각 단계에서 AJV를 뺀 ON−OFF 비용의 증가를 사용합니다. 독립 실행과 중앙값 비가법성 때문에 이 세 단계의 합이 게이트 간극과 같지는 않으며, 작은 React Profiler 초과는 계측 실행의 변동과 구별해 해석해야 합니다.', '',
  '- 정적 mount에는 blueprint의 선행 정합성 검사·선언 분석, 모든 runtime 노드 생성, 커밋 방문 및 리스너와 무관한 revision/payload 비용이 남습니다. i/ii/v는 해당 작업을 모두 없애지 않습니다.',
  '- 배열은 blueprint가 작고 runtime 발생 수가 큽니다. ii는 경로 색인을 줄였지만 모든 아이템의 생성·상태/배달 초기화는 유지합니다. v는 배열 컨테이너 기본값에 적용하지 않습니다.',
  '- derived 및 분기 업데이트에는 의존 등록, 게이트 고정점, 파생의 추가 라운드, 전이/커밋이 남습니다. b1/b2로 최초 분석·생성을 미뤄도 이 업데이트 비용을 없앨 수 없습니다.',
  '- React Profiler에는 코어 작업과 React 렌더링이 포함되고 commit DOM 작업·대기는 별도입니다. 기본 배열 memo는 값만 바뀐 목록 재생성을 줄이며 mount와 구조 변경에는 모든 행이 필요합니다.', '',
  '| 구조 후보 | 뒤집힐 원장/설계 항목 | 소유자에게 필요한 결정 |', '| --- | --- | --- |',
  '| b1 blueprint deferral | BLUEPRINT-001·002·012·044, ADR 0014 생성 자리의 정적 오류 포착 | 최초 접근까지 정적 오류를 늦출지. 구현하지 않았습니다. |',
  '| b2 lazy shape/fill | GOAL-071 A3·GOAL-062·VALUE-002(P3)·013·035·SETTLE-001·005·046; lazy proxy라면 NODE-004 | 생성=첫 정착 및 getValue/find/렌더 즉시 관측을 바꿀지. 구현하지 않았습니다. |', '',
  '## 최초 로드 연산 수', '', '| 픽스처 | 단계 | computeNode | updateOutput | selectChildren |', '| --- | --- | ---: | ---: | ---: |');
for (const data of [stages[3], phases]) for (const row of data.rows.filter(row => row.version === 'new' && row.mode === 'mount' && row.validation === 'off' && ['flat-500','nested-d5-f4','array-1000','computed-visible-derived'].includes(row.fixture)))
  text.push(`| ${row.fixture} | ${data === phases ? 'v 후' : 'v 전'} | ${calls(row,'computeNode')} | ${calls(row,'updateOutput')} | ${calls(row,'selectChildren')} |`);
text.push('', '## 검증·재현', '',
  '- 전체 vitest unit/render/react18: 3,047 통과, todo 1, 실패 4. 실패는 EVENT-070 useLayoutEffect/useEffect 두 사례가 각 React 프로젝트에서 발생한 것으로 사용자 허용 범위와 일치합니다.',
  '- PKG의 `npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json`, `npx --no-install eslint "src/**/*.{ts,tsx}"` 통과. `--no-install`은 설치 금지 조건을 고정합니다.',
  '- 여섯 예약 파일은 HEAD와 동일하며 git 쓰기·설치·runtime 번들 생성은 하지 않았습니다.',
  '- [b3 설계안](./b3-payload-proposal.md)은 revision/통지 기준을 유지하는 payload 객체 생성 지연만 제안합니다. 코드에는 반영하지 않았습니다.', '',
  '```sh', 'yarn node packages/canard/schema-form/bench/remeasure-86c02.mjs', 'yarn node packages/canard/schema-form/bench/remeasure-86c02.mjs iv', 'yarn node packages/canard/schema-form/bench/remeasure-86c02-report.mjs',
  '# 단계 ii 재현: HEAD 소스에 i,ii 파일만 메모리에서 대입; git/디스크 소스 변경 없음',
  'PHASE_SOURCE_REF=b44dc7ebf PHASE_CANDIDATES=i,ii PHASE_OUTPUT=86c02-replay-ii PHASE_FIXTURES=flat-500,nested-d5-f4,array-1000,computed-visible-derived yarn node --expose-gc packages/canard/schema-form/bench/branchless-phase-diagnosis.mjs', '```', '',
  '원 표본: 아래 JSON은 환경·모든 개별 표본·배타 단계·함수별 시간/호출 수·Profiler·커밋 수를 포함합니다.', '');
for (const name of ['86c02-final-core-plain','86c02-final-core-traced','86c02-final-render-plain-production','86c02-final-render-plain','86c02-final-render-traced-production','86c02-baseline-core-traced','86c02-i-core-traced','86c02-ii-core-traced','86c02-iii-core-traced','86c02-before-iv-render-plain-production','86c02-iv-render-plain-production'])
  text.push(`- [${name}](./${name}.json)`);
if (process.argv.includes('--check')) {
  assert(fs.readFileSync(path.join(out, 'remeasure-86c02.md'), 'utf8').trim() === text.join('\n').trim());
  console.log(`MEASUREMENTS_OK: ${passed} met, ${missed} missed, ${residualMissed} non-AJV residual misses`);
} else console.log(text.join('\n'));
