// Formats the paired diagnostic samples; it never runs a benchmark or changes engine code.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(pkg, 'architecture/verification/07-switch');
const read = name => JSON.parse(fs.readFileSync(path.join(out, `branchless-phase-${name}.json`), 'utf8'));
const core = read('core-traced');
const react = read('render-traced');
const plain = read('core-plain');
const renderPlain = read('render-plain');
const componentProbe = read('render-components');
const ownerProbe = read('render-components-fresh');
const names = ['flat-50', 'flat-100', 'flat-500', 'nested-d3-f4', 'nested-d5-f4', 'array-100', 'array-500', 'array-1000', 'computed-visible-derived'];
const largest = ['flat-500', 'nested-d5-f4', 'array-1000', 'computed-visible-derived'];
const labels = { analysis: '분석/청사진', creation: '노드 생성', settlement: '정착·채움', 'validation-registration': '검증 등록', 'validation-run': '검증 실행', delivery: '배달 표시·통지', 'react-render': 'React render', 'react-commit': 'React commit/effects', other: '진입·기타', wait: '대기·미귀속' };
const quantile = (values, q) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * q) - 1];
const median = values => quantile(values, .5);
const summary = values => ({ median: median(values), p99: quantile(values, .99) });
const ms = value => value.toFixed(4);
const ratio = (a, b) => b <= 0 ? '—' : `${(a / b).toFixed(2)}×`;
const row = (data, fixture, mode, version, validation = 'off') => data.rows.find(r => r.fixture === fixture && r.mode === mode && r.version === version && r.validation === validation);
const ajv = sample => Object.entries(sample.details).filter(([site]) => site.startsWith('AJV:')).reduce((sum, [, item]) => sum + item.ms, 0);
const hot = (fixture, needle) => {
  const samples = row(core, fixture, 'mount', 'new').samples;
  return median(samples.map(s => Object.entries(s.details).filter(([k]) => k.includes(needle)).reduce((sum, [, item]) => sum + item.ms, 0)));
};
const arrayProbeNew = componentProbe.rows.find(r => r.fixture === 'array-1000' && r.version === 'new');
const arrayListCost = median(arrayProbeNew.samples.map(s => Object.entries(s.details)
  .filter(([site]) => /FormTypeInputArray.tsx:(30:callback|71:Button)/.test(site))
  .reduce((sum, [, item]) => sum + item.ms, 0)));
const arrayProbeRender = median(arrayProbeNew.samples.map(s => s.phases['react-render'] ?? 0));
const text = [];
const add = (...lines) => text.push(...lines, '');
const table = (headers, rows) => add(`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map(cells => `| ${cells.join(' | ')} |`));

add('# 분기 없는 폼의 단계별 재진단 — 84라운드',
  '상태: 측정·설계 변경 후보 보고. 속도 수용이나 G26 통과 판정이 아니다. 제품 코드와 설계 원장은 수정하지 않았다.',
  '84라운드 소유자 답(`origin/1.0.0-beta`, `bc0d80f7d`)이 83C-01의 수용 제안을 거절했다. 82C-01의 단계 분해와 65C-01~03의 **추가 순회·장부라는 구조와 의미를 보존하는 구현 개선의 구분**을 적용했다. `TEST-026`, `TEST-027`, `GOAL-011`을 기준으로 삼았다. 기존 residual-breakdown.md의 선형 판정은 이번 결론의 전제가 아니다.');

add('## 결론',
  '분기가 없어도 새 엔진은 작성 스키마 전체의 청사진을 만들고, 범용 정착에서 노드 생김을 등록하고, 기본값을 별도 전이 단계에서 채우고, 선택 선언과 배달 장부를 커밋한다. 옛 엔진의 생성자 중심 처리보다 **분석과 생성 이후 정착**이 비싸다. 선형이라는 사실은 이 중복 작업의 필요성이나 소유자 수용을 증명하지 않는다.',
  '단순 노드 인스턴스 수가 늘어난 것은 아니다. 큰 세 픽스처의 생성 수는 양쪽 모두 501 / 1,365 / 4,002다. 생성과 정착의 경계가 다르므로 두 단계의 합도 함께 비교했다. 검증기가 없는 분기 없는 행에는 AJV가 개입하지 않는다.',
  'React가 코어 차이보다 더 느려진 대표 행도 분리했다. fresh array-1000 갱신의 render 초과 약 26.99 ms는 React 19 개발용 owner stack 수집 경로의 JSX 비용 차이 약 27.57 ms로 설명된다(추가 101쌍). 이는 엔진 계약의 구조 비용이 아니라 비교 시 통제할 개발 진단 비용이다. 반대로 무분기 코어 마운트의 분석·정착 초과는 그 진단 비용으로 설명되지 않는다.',
  '갱신은 일률적으로 느리지 않다. 큰 평면과 배열의 지정된 잎 갱신은 새 엔진이 더 빠르며, 중첩·derived와 분기 전환에는 정착 비용이 남는다. 따라서 “모든 무분기 갱신이 구조적으로 느리다”는 결론도 이 표본은 지지하지 않는다.');

table(['최대 크기', '분석 배율', '생성 배율', '정착 배율', '배달 배율', '생성+정착 배율', '활성 비용 old→new ms'], largest.map(f => {
  const o = row(core, f, 'mount', 'old'), n = row(core, f, 'mount', 'new');
  const combined = r => median(r.samples.map(s => (s.phases.creation ?? 0) + (s.phases.settlement ?? 0)));
  return [f, ...['analysis', 'creation', 'settlement', 'delivery'].map(p => ratio(n.phases[p].median, o.phases[p].median)), ratio(combined(n), combined(o)), `${ms(o.active.median)}→${ms(n.active.median)}`];
}));

add('## 환경·재현',
  `- 측정 HEAD: \`${core.environment.head}\`; 실행 시각 UTC: ${core.environment.date}.`,
  `- ${core.environment.platform}/${core.environment.arch}, ${core.environment.cpu}, 논리 CPU ${core.environment.cpus}, RAM ${(core.environment.memory / 1024 ** 3).toFixed(0)} GiB. Node ${core.environment.node}, V8 ${core.environment.v8}, React ${core.environment.react}, AJV ${core.environment.ajv}.`,
  '- 모든 엔진·React는 development 모드다. production 성능으로 일반화하지 않는다. source-only esbuild 번들을 메모리에서 실행하며 dist는 사용하지 않는다.',
  '- `performance.now()` 진입/종료 래퍼를 TypeScript AST로 메모리 안의 함수 본문에만 삽입했다. CPU profile은 사용하지 않았다. 중첩 span은 자식 시간을 뺀 배타 시간이다. async 함수 전체를 감싸지 않으며 AJV 동기 컴파일/검증/가드를 직접 감쌌다.',
  '- 각 픽스처×검증 설정마다 예열 12쌍, 기록 101쌍. 매 표본 old/new 순서를 교대하며 표본 전에 `global.gc()`를 호출한다. 엔진 간 병렬 측정과 다른 테스트 스위트 실행은 없다. p99는 정렬한 101개 중 100번째 값(최근접 순위)이다.',
  '- old 코어는 `src/__legacy__/core/nodeFromJSONSchema.ts`와 그 보존 의존성이다. npm alias의 코어 번들을 비교 기준으로 쓰지 않는다. `__legacy__`에는 React 바인딩이 없어서 로컬 태그 `@canard/schema-form@0.16.0`의 컴포넌트·provider·hook을 `git show`로 읽고, core import만 보존 소스로 연결했다. 따라서 React old 열은 **0.16.0 바인딩 + 지정된 보존 코어**다. 태그/소스 파일은 디스크에 복원하지 않았다.',
  '- BF `fixtures/equivalent`의 동일 스키마 쌍·상호작용 열을 사용했다. flat/nested는 잎 10개 쓰기, array는 `/items/0/name` 한 번, derived는 source와 trigger 세 번, oneOf는 마지막 분기와 첫 분기로 두 번 전환한다. d3/d5는 BF의 fanout=4 픽스처다.',
  '- if/then은 같은 값·형상을 유지하면서 `kind=a→b→a`에 따라 `detail.minLength=3` 가드를 활성화하는 추가 공통 스키마다. 무제한 형상 확장 전체를 대표하지 않는다. oneOf는 BF의 표현식 선택 픽스처이며, 검증 ON에서는 원래 스키마의 oneOf 중복 일치 오류가 양쪽에서 검증될 수 있다.',
  '- 각 쓰기 뒤 microtask와 setImmediate를 비우고 timer tick도 기다렸다. 매 기록 표본에서 루트 값 일치와 최종 입력 반영을 단언했고, React에서는 최종 `[data-path]:not([data-deferred])` 집합도 대조했다. 오류 상태 전체·모든 중간 렌더 경로의 차등 시험을 뜻하지는 않는다.',
  '- 대기·미귀속 열에는 timer/event-loop 대기, span 외부 하니스·React scheduling, 계측 잔여 오버헤드가 들어간다. 엔진 실행으로 오인하지 않도록 **활성 비용=배타 span의 합**과 **전체 wall**을 별도로 기록했다. 이 활성 비용은 OS CPU-time 카운터가 아니다.',
  '- 원 표본, 함수별 시간·호출 수, 계측 위치 목록, 환경은 아래 JSON에 보존했다. smoke 파일은 본 측정에서 제외한다.');
add('```sh',
  '# worktree 루트에서, 반드시 순차 실행',
  'yarn node --expose-gc packages/canard/schema-form/bench/branchless-phase-diagnosis.mjs',
  'yarn node --expose-gc packages/canard/schema-form/bench/branchless-phase-diagnosis.mjs --render',
  'yarn node --expose-gc packages/canard/schema-form/bench/branchless-phase-diagnosis.mjs --plain',
  'PHASE_FIXTURES=flat-500,nested-d5-f4,array-1000,computed-visible-derived,oneOf-20,if-then yarn node --expose-gc packages/canard/schema-form/bench/branchless-phase-diagnosis.mjs --render --plain',
  'yarn node --expose-gc packages/canard/schema-form/bench/branchless-render-component-probe.mjs',
  'PHASE_FIXTURES=array-1000 yarn node --expose-gc packages/canard/schema-form/bench/branchless-phase-diagnosis.mjs --render --component-probe --owner-stack',
  'yarn node packages/canard/schema-form/bench/branchless-phase-report.mjs', '```');
add(...['core-traced', 'render-traced', 'core-plain', 'render-plain', 'render-components', 'render-components-fresh'].map(name => `- [${name} 원 표본](./branchless-phase-${name}.json)`));

add('## 단계 경계',
  '- 분석: old의 JSON Schema 해석·정규화·reference 처리(`helpers/jsonSchema`, `resolveReferences`); new의 `blueprint`. React old의 `preprocessSchema`도 포함한다. new 청사진의 일반 정합성 검사는 검증 등록이 아니라 분석이다.',
  '- 생성: old factory의 인스턴스 구성에서 중첩 분석·채움·배달 시간을 제외한 값; new `createSchemaNode`. old 생성자 안의 기본값 준비와 strategy 초기 구성 일부는 생성에 남으므로 **생성+정착 합산**도 제시했다.',
  '- 정착·채움: old 초기화·파싱·값 전파·computed·branch 처리, new `writeSchemaNode`/`loadSchemaNodeAtMount` 및 계산·전이·커밋 중 별도 등록/배달을 뺀 몫. `selectChildren` 안의 장부와 자식 채택은 여기에 속한다.',
  '- 검증 등록: old `ValidationManager` 구성, new validation entry/guard 등록 및 AJV compile. OFF/no-validator의 old 열에 남는 소수 µs 미만은 즉시 반환하는 생성자 비용이며 실제 컴파일이 아니다.',
  '- 배달: old EventCascadeManager·publish·예약 callback(중첩 채움/AJV 제외); new 변경 포착·배달 표시·flush. old 리스너 안에서 이뤄지는 계산 중 별도 포착되지 않은 작업은 배달에 남을 수 있다.',
  '- React: 설치된 React 19 development 모듈을 메모리에서 계측했다. `renderRootSync/Concurrent`와 `commitRoot/flushMutationEffects/flushLayoutEffects/flushPassiveEffects`에서 엔진 span을 제외한다. Profiler actualDuration은 별도 교차검사용이며 이 배타 단계에 다시 더하지 않는다.',
  '- 비율은 new/old. 분모 0은 `—`다. 0.0000은 반올림일 수 있다. 시간은 모두 ms. 단계별 중앙값의 합과 총시간 중앙값은 일반적으로 같지 않다.');

for (const [title, data, selectedPhases] of [
  ['코어', core, ['analysis', 'creation', 'settlement', 'validation-registration', 'validation-run', 'delivery', 'other', 'wait']],
  ['BF React 경로', react, Object.keys(labels)],
]) {
  add(`## ${title}: phase × size`);
  for (const mode of ['mount', 'update']) {
    add(`### ${mode}`);
    const lines = [];
    for (const phase of selectedPhases) for (const fixture of names) {
      const o = row(data, fixture, mode, 'old').phases[phase], n = row(data, fixture, mode, 'new').phases[phase];
      lines.push([labels[phase], fixture, ms(o.median), ms(n.median), ratio(n.median, o.median), ms(o.p99), ms(n.p99), ratio(n.p99, o.p99)]);
    }
    table(['단계', '크기', 'old median', 'new median', '배율', 'old p99', 'new p99', 'p99 배율'], lines);
    table(['크기', '활성 old median/p99', '활성 new median/p99', '활성 배율', 'wall old median/p99', 'wall new median/p99', 'wall 배율'], names.map(f => {
      const o = row(data, f, mode, 'old'), n = row(data, f, mode, 'new');
      return [f, `${ms(o.active.median)}/${ms(o.active.p99)}`, `${ms(n.active.median)}/${ms(n.active.p99)}`, ratio(n.active.median, o.active.median), `${ms(o.total.median)}/${ms(o.total.p99)}`, `${ms(n.total.median)}/${ms(n.total.p99)}`, ratio(n.total.median, o.total.median)];
    }));
  }
  add(`### ${title}: new 전체 비용의 단계별 점유율`,
    '각 표본에서 단계/wall 비율을 구한 뒤 중앙값을 냈다. 중앙값은 가산적이지 않아 행 합이 정확히 100%가 아닐 수 있다. 뒤의 활성 비중 표는 대기·미귀속을 제외한 같은 계산이다.');
  for (const denominator of ['elapsed', 'active']) {
    const included = denominator === 'active' ? selectedPhases.filter(p => p !== 'wait') : selectedPhases;
    add(`분모: ${denominator === 'active' ? '활성 비용' : '전체 wall'}`);
    table(['크기/연산', ...included.map(p => labels[p])], names.flatMap(f => ['mount', 'update'].map(mode => {
      const r = row(data, f, mode, 'new');
      return [`${f}/${mode}`, ...included.map(p => `${median(r.samples.map(s => 100 * (s.phases[p] ?? 0) / s[denominator])).toFixed(1)}%`)];
    })));
  }
}

add('## 계측을 끈 대조 실행',
  '동일 예열·표본·완료점으로 래퍼를 제거했다. sync는 API 호출 및 동기 React flush 블록의 합이며 비동기 완료 전체가 아니다. 계측 확대 배율로 단계 시간을 일괄 나누지 않는다. 세부 단계는 원인 위치와 예산 상한이며, 수용 목표는 비계측 BF 완료점/Profiler로 다시 정해야 한다.');
table(['경로/크기/연산', 'plain sync old median/p99', 'plain sync new median/p99', 'plain sync 비', 'traced/plain sync old', 'traced/plain sync new', 'plain wall old→new median'], [['core', core, plain], ['render', react, renderPlain]].flatMap(([lane, traced, control]) => control.rows.filter(r => r.version === 'new' && r.validation === 'off').map(n => {
  const o = row(control, n.fixture, n.mode, 'old'), nt = row(traced, n.fixture, n.mode, 'new'), ot = row(traced, n.fixture, n.mode, 'old');
  return [`${lane}/${n.fixture}/${n.mode}`, `${ms(o.synchronous.median)}/${ms(o.synchronous.p99)}`, `${ms(n.synchronous.median)}/${ms(n.synchronous.p99)}`, ratio(n.synchronous.median, o.synchronous.median), ratio(ot.synchronous.median, o.synchronous.median), ratio(nt.synchronous.median, n.synchronous.median), `${ms(o.total.median)}→${ms(n.total.median)}`];
})));
table(['React 크기/연산', 'plain Profiler old median/p99', 'plain Profiler new median/p99', 'Profiler 비', 'commit 수 old→new'], renderPlain.rows.filter(r => r.version === 'new' && r.validation === 'off').map(n => {
  const o = row(renderPlain, n.fixture, n.mode, 'old');
  return [`${n.fixture}/${n.mode}`, `${ms(o.profiler.median)}/${ms(o.profiler.p99)}`, `${ms(n.profiler.median)}/${ms(n.profiler.p99)}`, ratio(n.profiler.median, o.profiler.median), `${o.commits.median}→${n.commits.median}`];
}));

add('## 분기: validation OFF/ON과 AJV의 몫',
  'OFF는 ValidationMode.None(0), ON은 OnChange(1)이다. 양쪽에 같은 옵션의 새 AJV 인스턴스를 표본마다 제공하며 작성 스키마도 새 identity다. 따라서 **cold registration**을 재며 warm cache hit 비용은 아니다. AJV 생성은 측정 밖, 컴파일·가드·실행은 안이다.',
  'OFF가 AJV 0을 뜻하지 않는다. new는 development의 entry guard 등록에서 전체 검증 함수를 먼저 컴파일한다(`SchemaNode/utils/schemaNodeFactory.ts:113`, `validation/utils/cache/readValidationEntry.ts:56`). if/then 선택 가드는 OFF에서도 필수다. 그래서 ON−OFF를 AJV 비용으로 부르지 않고 직접 측정한 AJV span을 뺀다. 차감은 각 원 표본에서 한 뒤 중앙값/p99를 구한다.');
for (const [lane, data] of [['core', core], ['render', react]]) {
  add(`### ${lane}`);
  table(['픽스처/연산', '검증', '활성 old median/p99', '활성 new median/p99', 'AJV old median/p99', 'AJV new median/p99', 'non-AJV old median/p99', 'non-AJV new median/p99', 'non-AJV 비'], ['oneOf-5', 'oneOf-10', 'oneOf-20', 'if-then'].flatMap(f => ['mount', 'update'].flatMap(mode => ['off', 'on'].map(validation => {
    const o = row(data, f, mode, 'old', validation), n = row(data, f, mode, 'new', validation);
    const ao = summary(o.samples.map(ajv)), an = summary(n.samples.map(ajv));
    const no = summary(o.samples.map(s => s.active - ajv(s))), nn = summary(n.samples.map(s => s.active - ajv(s)));
    const pair = s => `${ms(s.median)}/${ms(s.p99)}`;
    return [`${f}/${mode}`, validation, pair(o.active), pair(n.active), pair(ao), pair(an), pair(no), pair(nn), ratio(nn.median, no.median)];
  }))));
}
add('oneOf-20의 ON 갱신에서는 AJV 자체가 약 0.01 ms인 반면 non-AJV 정착은 훨씬 크다. 이 부분은 AJV 때문에 불가피하다는 설명으로 넘길 수 없다. 가드 수·선택 후보의 범위에 따른 정착 작업을 별도 줄여야 한다.');

add('## 배열 React 갱신의 추가 분해',
  'fresh mount 직후 첫 갱신의 array-1000 계측에서는 React render 11.4110→40.6498 ms(3.56×), commit 12.096→12.475 ms(1.03×)였다. 같은 행의 코어 활성 비용은 0.389→0.211 ms다. 따라서 **이 관측의 초과는 코어 정착이 아니라 React render**에 있다.',
  '이를 바로 새 엔진의 전체 자식 재렌더 결함이라고 해석하지 않았다. 별도 probe에서 old/new 폼을 유지하고 `/items/0/name`의 값을 매번 바꾸며 예열 12회 + 101회를 재었다. 배열 컴포넌트·map callback·버튼·SchemaNodeInput의 배타 시간과 호출 수를 추가 계측했다. 이 probe는 fresh mount 직후의 첫 갱신과 서로 다른 시나리오다.');
table(['크기', 'retained render old median/p99', 'retained render new median/p99', '배율', 'map callback old/new', 'Button old/new', 'SchemaNodeInput old/new'], ['array-100', 'array-500', 'array-1000'].map(f => {
  const o = componentProbe.rows.find(r => r.fixture === f && r.version === 'old');
  const n = componentProbe.rows.find(r => r.fixture === f && r.version === 'new');
  const time = r => summary(r.samples.map(s => s.phases['react-render'] ?? 0));
  const count = (r, pattern) => median(r.samples.map(s => Object.entries(s.details).filter(([site]) => pattern.test(site)).reduce((sum, [, value]) => sum + value.calls, 0)));
  const ot = time(o), nt = time(n);
  return [f, `${ms(ot.median)}/${ms(ot.p99)}`, `${ms(nt.median)}/${ms(nt.p99)}`, ratio(nt.median, ot.median), `${count(o, /FormTypeInputArray.tsx:29:callback/)}/${count(n, /FormTypeInputArray.tsx:30:callback/)}`, `${count(o, /FormTypeInputArray.tsx:69:Button/)}/${count(n, /FormTypeInputArray.tsx:71:Button/)}`, `${count(o, /SchemaNodeInput.tsx:26:callback/)}/${count(n, /SchemaNodeInput.tsx:30:callback/)}`];
}));
const arrayPlainOld = row(renderPlain, 'array-1000', 'update', 'old');
const arrayPlainNew = row(renderPlain, 'array-1000', 'update', 'new');
add(`비계측 fresh 행의 Profiler actualDuration은 ${ms(arrayPlainOld.profiler.median)}→${ms(arrayPlainNew.profiler.median)} ms(${ratio(arrayPlainNew.profiler.median, arrayPlainOld.profiler.median)})다. 이 값과 위 retained probe를 함께 봐야 한다.`,
  '공통으로 확인된 경로는 `components/SchemaNode/SchemaNodeInput/type.ts:33`의 UpdateValue 구독 → `SchemaNodeInput.tsx:121` → `formTypeDefinitions/FormTypeInputArray.tsx:29`의 전체 map과 `:71` Button이다. 1,000개 input을 모두 다시 그린 것은 아니며 SchemaNodeInput 호출은 old 5회/new 4회다. 아이템 목록·버튼의 O(N) 재생성은 양쪽 공통이고 기본 렌더러의 memo/안정된 row props로 줄일 (a) 후보다.',
  '이 공통 map/버튼 호출 수만으로 최초 계측 fresh 행의 추가 약 29 ms를 설명할 수 없어, 아래에서 React의 개발용 owner stack 수집 분기를 별도로 측정했다.');

add('### fresh 갱신의 초과: React 19 개발용 owner stack 예산',
  '설치된 `node_modules/react/cjs/react-jsx-runtime.development.js:324–349`는 JSX 생성 횟수가 10,000 미만이면 각 JSX에 `Error("react-stack-top-frame")`와 debug task를 새로 만들고, 예산 밖이면 공통 객체를 사용한다. `node_modules/react-dom/cjs/react-dom-client.development.js:17306–17309`는 render 준비 때 마지막 초기화로부터 1초가 지났으면 이 전역 카운터를 0으로 돌린다.',
  '이 조건을 바꾸지 않고 JSX 호출 직전의 카운터를 읽어 수집 경로/비수집 경로의 호출 수와 배타 시간을 각각 기록했다. fresh array-1000에 예열 12쌍 + 101쌍을 다시 적용했다. React나 제품 파일은 수정하지 않았으며 예산도 강제로 초기화하지 않았다.');
const jsxTime = s => (s.details['React:jsx-owner-stack']?.ms ?? 0) + (s.details['React:jsx-no-owner-stack']?.ms ?? 0);
table(['엔진', 'owner stack 수집 표본/전체', '수집 JSX 호출 median', '비수집 JSX 호출 median', 'JSX median/p99 ms', '전체 render median/p99 ms', 'JSX 제외 render median/p99 ms'], ['old', 'new'].map(version => {
  const r = row(ownerProbe, 'array-1000', 'update', version);
  const jsx = summary(r.samples.map(jsxTime));
  const rest = summary(r.samples.map(s => s.phases['react-render'] - jsxTime(s)));
  return [version, `${r.samples.filter(s => (s.details['React:jsx-owner-stack']?.calls ?? 0) > 0).length}/101`, median(r.samples.map(s => s.details['React:jsx-owner-stack']?.calls ?? 0)), median(r.samples.map(s => s.details['React:jsx-no-owner-stack']?.calls ?? 0)), `${ms(jsx.median)}/${ms(jsx.p99)}`, `${ms(r.phases['react-render'].median)}/${ms(r.phases['react-render'].p99)}`, `${ms(rest.median)}/${ms(rest.p99)}`];
}));
add('old 101표본 모두 비수집, new 101표본 모두 수집이었다. JSX 배타 비용 차이 약 27.57 ms가 render 차이 약 26.99 ms를 설명한다. 나머지 render는 오히려 new가 약간 작다. **코어가 더 느려 전체 실행의 시계상 위치가 달라지면 React의 1초 진단 예산 분기가 달라질 수 있어, old/new 순서를 교대해도 비용이 대칭이 되지 않는다.** 원래 두 실행의 카운터를 소급 복원할 수는 없지만, 추가 101쌍에서 같은 fresh render 초과를 재현하고 그 몫을 직접 분리했다.',
  '분류는 (a) 측정 조건/개발 진단 비용이다. 이것을 새 엔진의 NODE/SETTLE 계약 탓이나 새 원장 계약 변경의 근거로 삼지 않는다. TEST-026의 React 19 Profiler 비교를 유지하면서 양쪽의 owner stack 조건을 동일하게 통제하거나 production profiling 경로를 추가해야 한다. 약 27.57 ms는 진단 비용 차이의 측정값이며 제품 최적화로 달성한 절감량이 아니다. 기본 배열 렌더러가 N개 row를 다시 만드는 공통 비용은 별도의 (a) 후보로 남는다.');

add('## 원인과 (a)/(b) 분류',
  '아래 절감량은 **해당 배타 span을 전부 없앴을 때의 계측 상한**이다. 아직 구현·ablation을 하지 않았으므로 실현된 개선율이 아니며 하한은 0이다. 여러 행이 같은 span을 공유하므로 합산하지 않는다. (a)의 내부 자료구조 변경에도 검증은 필요하지만 원장 계약을 뒤집을 필요는 없다. (b)는 계약을 바꾸는 대안을 정확히 특정해 원장 관리자에게 올리는 항목이며 이번 작업에서 승인하거나 구현하지 않았다.');

table(['항목', '근거와 제안', '코드 (src/core 기준)', '원장 영향', '최대 크기 절감 예산'], [
  ['(a) React 개발 진단의 비교 조건 통제', 'fresh array-1000에서 old는 101/101 비수집, new는 101/101 owner stack 수집이었다. 같은 React 진단 조건 또는 production profiling으로 비교한다. 제품 동작을 바꾸는 개선은 아니다.', 'node_modules/react/cjs/react-jsx-runtime.development.js:324; node_modules/react-dom/cjs/react-dom-client.development.js:17306', 'TEST-026 준수 방식의 개선; NODE/SETTLE/EVENT 계약 변경 없음.', 'JSX 진단 경로 차이 약 27.57 ms가 render 초과 약 26.99 ms를 설명. 제품 절감량으로 합산하지 않음'],
  ['(a) 기본 배열 렌더러의 값 변경과 목록 재생성 분리', '양쪽 모두 잎 하나의 값 쓰기에 N개 row element와 N+1개 Button을 다시 만든다. 기본 배열 입력은 value prop을 쓰지 않으므로 자식 identity/구조·readOnly·disabled·schema·style을 보존하는 memo 경계를 검토한다. 사용자 입력 컴포넌트의 UpdateValue 구독을 통째로 없애는 제안은 아니다.', '../formTypeDefinitions/FormTypeInputArray.tsx:29, 71; ../components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:121', '계약 변경 없음. GOAL-011 유지, 사용자 FormTypeInput의 최신 값 관측은 유지.', `retained array-1000의 new map+Button 배타 합 ${ms(arrayListCost)} ms(활성 render ${ms(arrayProbeRender)} ms의 ${(100 * arrayListCost / arrayProbeRender).toFixed(1)}%); reconciliation 절감은 별도. fresh 진단 예산 차이와 합산하지 않음`],
  ['(a) 정적 첫 로드 fast path', '게이트·잠복·pending exit가 없는 최초 로드도 일반 자식 선택의 key 직렬화, pendingExits 조회, entered·selectedDeclarationIds 등록을 한다. 정적 템플릿과 검증된 조건으로 불필요한 장부만 생략/축소한다.', 'settle/utils/compute/selectChildren.ts:118, 200, 214, 225; computeNode.ts:46', '계약 변경 없음. NODE-006의 정적 선택 메모, GOAL-011을 유지. 단순히 node를 생략하지 않는다.', largest.slice(0, 3).map(f => `${f}: selectChildren ≤${ms(hot(f, '/selectChildren.ts:'))} ms`).join('; ')],
  ['(a) 정적 선언의 재등록·경로 색인', '분기 없는 선택 ID를 각 커밋의 path-keyed 저장소에 복제한다. 검증 라우팅/derived 등 실제 소비자의 동일한 관측을 유지하면서 정적 선택은 blueprint 조회로 공유하는 후보.', 'settle/utils/commit/commitSettlement.ts:48–52; validation/utils/route/routeValidationIssues.ts:28; settle/utils/controls/getControlLayers.ts:44', 'NODE-006·SETTLE-017·VALIDATE-048 보존. 오류 경로와 source selection을 지키면 ledger 변경 없음.', `array-1000: commitSettlement 배타 전체 ≤${ms(hot('array-1000', '/commitSettlement.ts:'))} ms; 이 중 선언 색인만의 몫은 미분리`],
  ['(a) 빈 배달 작업 집합', 'automaticLog가 비었어도 Set을 만들고 changed/entered/stateDirty/revision 후보를 모아 또 ordered Set으로 합친다. 기존 65C-03의 한 방문·기존 필드 사용 원칙 안에서 재사용/조건부 할당을 검토한다.', 'settle/utils/commit/markCommitDeliveries.ts:33, 56, 74, 98', 'EVENT-001/007/024 및 SETTLE-006은 그대로. 구독 없는 노드의 revision을 생략하면 (b)로 넘어간다.', `array-1000: markCommitDeliveries 배타 전체 ≤${ms(hot('array-1000', '/markCommitDeliveries.ts:'))} ms; 빈 집합만의 몫은 이보다 작고 미분리`],
  ['(b) 청사진 선행 분석을 최초 접근 시점으로 미룸', '한 번의 전체 선언 그래프·정합성 검사·식 컴파일을 제거/지연하는 설계. 단순 분석 루프 최적화는 (a); 분석 단계 자체의 eager 계약을 바꾸는 경우만 (b).', 'blueprint/blueprint.ts:44–84; SchemaNode/utils/binding/buildSchemaNodeTree.ts:38', 'BLUEPRINT-001·BLUEPRINT-002·BLUEPRINT-012·BLUEPRINT-044: 생성 시 별도 정적 분석과 정적 오류 시점. 원장 관리자 선결.', `flat-500 ≤${ms(row(core, 'flat-500', 'mount', 'new').phases.analysis.median)} ms; d5 ≤${ms(row(core, 'nested-d5-f4', 'mount', 'new').phases.analysis.median)} ms. 배열은 ≤${ms(row(core, 'array-1000', 'mount', 'new').phases.analysis.median)} ms라 우선순위 낮음`],
  ['(b) 즉시 전체 형상·채움을 지연 생성/읽기 계산으로 전환', '지금은 flat/d5의 computeNode·updateOutput이 노드당 두 번 돈다(형상 계산 뒤 default 채움 재계산). 일반 생김/채움을 lazy read로 바꾸면 마운트를 줄일 수 있지만 getValue/find 및 렌더 관측 시점이 달라진다. 정적 경우에 같은 최종 결과·오류·순서를 입증한 순회 융합만은 (a)일 수 있다.', 'settle/utils/compute/computeNode.ts:20, 63; settle/utils/transition/transitionSettlement.ts:44–68; SchemaNode/utils/binding/mountSchemaNode.ts:14', 'GOAL-071·GOAL-062·VALUE-013·VALUE-035·SETTLE-001·SETTLE-005·SETTLE-046; 레코드를 지연 proxy로 바꾸면 NODE-004도 영향. 원장 관리자 선결.', `최대 defer 상한은 생성+정착: flat-500 ${ms(row(core, 'flat-500', 'mount', 'new').phases.creation.median + row(core, 'flat-500', 'mount', 'new').phases.settlement.median)} ms, d5 ${ms(row(core, 'nested-d5-f4', 'mount', 'new').phases.creation.median + row(core, 'nested-d5-f4', 'mount', 'new').phases.settlement.median)} ms, array-1000 ${ms(row(core, 'array-1000', 'mount', 'new').phases.creation.median + row(core, 'array-1000', 'mount', 'new').phases.settlement.median)} ms. full render에서는 결국 전부 필요하므로 총비용 이득 0도 가능`],
  ['(b) 구독 노드에만 revision/payload 생성', '커밋 전체에 대한 배달 장부를 없애는 대안. 65C-03이 S4로 명시적으로 거절했던 설계이므로 구현 최적화라는 이름으로 적용할 수 없다.', 'settle/utils/commit/markCommitDeliveries.ts:100, 131; record/utils/markSchemaNodeEvent.ts', 'EVENT-001 #2·EVENT-007·EVENT-024·SETTLE-006을 변경해야 함. 늦은 구독·flushSync·previous 계약과 65C-03 결정 재검토.', `배달 단계 전체 상한: flat-500 ${ms(row(core, 'flat-500', 'mount', 'new').phases.delivery.median)} ms, d5 ${ms(row(core, 'nested-d5-f4', 'mount', 'new').phases.delivery.median)} ms, array-1000 ${ms(row(core, 'array-1000', 'mount', 'new').phases.delivery.median)} ms. 실제 구독한 BF에서는 이 상한만큼 줄지 않음`],
]);

add('### 추가 순회의 계수 증거');
table(['크기', 'old/new 생성 수', 'new computeNode 호출', 'new updateOutput 호출', 'new selectChildren 호출', 'new 전이 배타 ms'], largest.map(f => {
  const o = row(core, f, 'mount', 'old'), n = row(core, f, 'mount', 'new');
  const count = needle => median(n.samples.map(s => Object.entries(s.details).filter(([k]) => k.includes(needle)).reduce((sum, [, value]) => sum + value.calls, 0)));
  return [f, `${median(o.samples.map(s => s.calls.creation ?? 0))}/${median(n.samples.map(s => s.calls.creation ?? 0))}`, count('/computeNode.ts:'), count('/updateOutput.ts:'), count('/selectChildren.ts:'), ms(hot(f, '/transitionSettlement.ts:'))];
}));
add('노드 수가 같고 new의 생성 span은 더 작아도 새 정착에는 여러 Set/Map 기록과 전이·커밋 순회가 더해진다. 이는 노드 인스턴스 자체의 상수 차이와 별개다. 배열은 작성 템플릿 수가 거의 일정해 분석비가 작지만 런타임 노드 4,002개에 대한 정착·배달은 남는다. derived는 5개 노드여도 의존 등록과 자동 쓰기의 추가 계산이 있어 일반 정착의 고정비를 여러 번 낸다.',
  'BF `scale-schemas.ts:22,39`의 flat/nested는 잎마다 default를 두고, `:58–68`의 배열은 완성된 아이템 값들을 배열 default로 준다. 새 엔진은 먼저 형상을 계산하고 `transitionSettlement.ts:44–68`에서 default를 쓴 다음 다시 계산한다. flat-500은 501개 생성에 compute/updateOutput 각 1,002회, d5는 1,365개 생성에 각 2,730회지만 array-1000은 4,002개 생성에 각 4,004회다. 따라서 “분기 유무”만이 작업량을 정하지 않는다. **기본값의 배치가 범용 채움의 재계산 횟수를 바꾼다**는 구체적인 계수 차이가 있다. 잎 기본값이 독립적임을 입증한 최초 로드의 순회 융합은 (a) 후보이며, 모든 폼에서 채움 시점/읽기 의미를 옮기는 것은 표의 (b)다.',
  '현재 측정에서 곧바로 원장 변경이 필요하다고 확정할 수는 없다. (a)의 실제 개선과 소유자가 정할 목표값을 먼저 비교해야 한다. (b)는 기능을 덜 제공함으로써 얻는 예산의 상한이며 성능상 필연적인 설계 변경이라고 주장하지 않는다.');

add('## 처분',
  '- P-133·P-134: **소유자 수용(84라운드) — 번들 축소는 뒤 단계**로 변경했다. 기존 fractal별 바이트 내역은 유지했다.',
  '- 속도 행은 수용 처리하지 않았다. G26의 목표 속도와 (b)의 계약 변경은 원장 관리자 판단 대상으로 남긴다.',
  '- git write, 설치, src 제품 변경, 별도 테스트 스위트 실행 없이 진단 스크립트·원 표본·이 보고서만 작성했다. 이 기록은 제품 수정의 성능 개선 증명이 아니다.');
fs.writeFileSync(path.join(out, 'branchless-phase-diagnosis.md'), text.join('\n') + '\n');
console.log('packages/canard/schema-form/architecture/verification/07-switch/branchless-phase-diagnosis.md');
