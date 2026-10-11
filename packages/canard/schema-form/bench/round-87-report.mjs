// Append-only Markdown derivation for the round-87 section of remeasure-86c02.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../architecture/verification/07-switch');
const final = JSON.parse(fs.readFileSync(path.join(out, 'round-87-final-summary.json')));
const trial = JSON.parse(fs.readFileSync(path.join(out, 'round-87-summary.json')));
const verification = JSON.parse(fs.readFileSync(path.join(out, 'round-87-verification.json')));
const fmt = value => value.toFixed(6);
const change = (before, after) => ((before - after) / before * 100).toFixed(1);
const trialBefore = trial.summary.find(row => row.fixture === 'empty-delivery' && row.variant === 'head-delivery');
const trialAfter = trial.summary.find(row => row.fixture === 'empty-delivery' && row.variant === 'working');
console.log(`
## 87라운드 추가 측정: 루프 적용과 iii 되돌림

앞의 표와 b1/b2 상한은 0189c443b의 역사적 측정입니다. 이번 작업은 후보 iii의 조건부 할당을 **되돌렸으며**, 다른 후보의 동작과 v의 범위는 유지했습니다. 새 정적 최초 로드/branchless 구조는 [설계 문서](./static-first-load-design.md)에만 있습니다.

### A — 범위, 방법과 수치

0189c443b가 변경한 제품 함수 전체에서 callback 배열 체인(map/filter/reduce/forEach/every/some/flat)을 검사했습니다. 배열은 인덱스 for, Map/Set은 순서를 유지하는 for-of, 이미 루프가 없는 함수는 유지했습니다. 범용 정착 경로와 예약 파일은 구조적으로 바꾸지 않았습니다.

동일 프로세스의 분리 번들 네 개를 순서 교대하여 비교했습니다: head=0189c443b, head-delivery=이번 루프+HEAD 배달 함수, working=최종 소스, revert-delivery=이번 루프+iii 이전 배달 함수 원문. 예열 ${final.environment.warmup}, 표본 ${final.environment.samples}, 매 코어 표본 전 명시 GC, 새 schema, validation OFF입니다. 표는 무계측 동기 호출 시간(ms)이며 모든 판의 mount/update 최종 값을 매 표본 비교했습니다. 기존 85C-01의 traced active/production Profiler 게이트를 대체하지 않습니다. 업데이트는 fixture의 쓰기 열을 동기로 호출한 합이며 타이머 배출은 시간 밖입니다. JIT와 번들 간 호출 형태 영향이 있어 미세한 차이를 일반화하지 않습니다.

| 행 | 작업 | HEAD median/p99 ms | 최종 median/p99 ms | 절감(+) |
| --- | --- | ---: | ---: | ---: |`);
for (const row of final.summary.filter(row => row.variant === 'working')) {
  const before = final.summary.find(item => item.fixture === row.fixture && item.mode === row.mode && item.variant === 'head');
  console.log(`| ${row.fixture} | ${row.mode} | ${fmt(before.median)} / ${fmt(before.p99)} | ${fmt(row.median)} / ${fmt(row.p99)} | ${change(before.median, row.median)}% |`);
}
console.log(`
#### 픽스처별 독립 프로세스 대조

연속 실행의 array update 회귀가 예열 이력에 민감하여 각 픽스처를 새 프로세스에서 HEAD/working 두 번들만으로 다시 쟀습니다. 같은 Node 24.20.0, 예열 20, 표본 101, GC/값 단언 조건입니다. 원 연속 실행은 위에 보존하며 이 대조로 덮어쓰지 않습니다.

| 행 | 작업 | HEAD median/p99 ms | 최종 median/p99 ms | 절감(+) |
| --- | --- | ---: | ---: | ---: |`);
for (const file of fs.readdirSync(out).filter(file => /^round-87-isolated-.*-summary\.json$/.test(file)).sort()) {
  const data = JSON.parse(fs.readFileSync(path.join(out, file)));
  for (const row of data.summary.filter(row => row.variant === 'working' && row.fixture !== 'empty-delivery')) {
    const before = data.summary.find(item => item.fixture === row.fixture && item.mode === row.mode && item.variant === 'head');
    console.log(`| ${row.fixture} | ${row.mode} | ${fmt(before.median)} / ${fmt(before.p99)} | ${fmt(row.median)} / ${fmt(row.p99)} | ${change(before.median, row.median)}% |`);
  }
}
console.log(`
독립 실행도 전 행의 개선을 보장하지 않습니다. 별도로 watch 비교 루프를 top-level helper로 분리한 메모리 전용 실험은 array update 0.138083→0.153083 ms로 느려 제품에 반영하지 않았습니다([실험](./round-87-compact-summary.json), [timing](./round-87-compact-timings.json)). 여러 실험 중 가장 좋은 숫자만 최종 개선율로 선택하지 않습니다.
`);
console.log(`
후보 iii의 공유 빈 Set + 작업 있을 때만 소멸 경로 진입 변형은 빈 배달에서 ${fmt(trialBefore.median)} → ${fmt(trialAfter.median)} ms (${change(trialBefore.median, trialAfter.median)}%)로 이득을 입증하지 못했습니다. p99도 ${fmt(trialBefore.p99)} → ${fmt(trialAfter.p99)} ms입니다. 이때 시간 표본에는 계측이 없었습니다. 따라서 조건부 automatic/ordered/departing 할당은 되돌렸고, automaticLog의 map 배열과 watch some callback을 제거하는 고전 루프만 유지했습니다. 초기 계수 probe는 없는 id를 키로 쓴 오류가 있어 폐기했고 최종 계수는 node 객체 identity로 다시 측정했습니다.

최종 결과는 mount 일부의 이득과 update 일부의 회귀가 함께 있습니다. 특히 array-1000 update의 회귀를 숨기거나 G26을 닫지 않습니다. 원칙 (3)의 루프 변환 자체가 모든 행에서 빨라짐을 뜻하지 않으며, 정적 첫 로드의 구조 제안도 이 update 회귀 해결책이 아닙니다.

| 함수/변경 | 속도 비용 | 메모리 비용 |
| --- | --- | --- |
| commitSettlement | 기존 경로/경고/선언 순서 유지, 배열 인덱스 for; O(N) 동일 | 기존 mismatch 결과 유지, 영구 추가 없음 |
| markCommitDeliveries | automaticLog 한 for, watch short-circuit for; iii 되돌림으로 per-node optional 및 ordered alias 분기 제거 | 조건부 방식 대비 빈 커밋에 Set 최대 3개와 배열 1개 추가; map 임시 배열 제거; 공유 전역 Set 없음 |
| computeNode | dirty children/선언/gate/relocation 각각 인덱스 for, 기존 wheel과 조기 반환 유지 | 새 저장소 없음, iterator 대신 기존 배열 참조 |
| enterSchemaNode | 이미 루프 없음; 기존 빈 latent 검사 유지 | 변화 없음 |
| selectChildren, staticIds, staticShape | 선언 filter→gate every→ID map을 단락 for로 융합; shape 전체 확인 뒤 계산하는 두 루프는 순서 때문에 유지 | 중간 map/callback 제거; 정적 선언/shape WeakMap 수명 동일, 정적 active 임시 배열 없음 |
| hasIndependentLeafDefaults | 중첩 every를 조기 중단 for로 대체, O(청사진 선언 수) | blueprint당 boolean WeakMap 그대로 |
| declarationIds, getControlLayers, selected | declaration ID/fragment 검색 인덱스 for; selected는 루프 없음 | 불변 ID 참조/약한 메모 동일, 영구 증가 없음 |
| transitionSettlement | 깊이 bucket의 nested for로 부모 우선 순서 유지; flat 제거 | O(생긴 노드 수) 펼침 배열 하나 제거, 기존 bucket 유지 |
| isOwnedNode, routeValidationIssues | isOwnedNode는 루프 없음; active ID/오류 비교/경로 인덱스 for | 펼침 ID 배열·before/next 키 합성 배열 제거, 조회용 Set은 반복 membership에 사용 |
| FormTypeInputArray, ArrayItems, 클릭 handler | wrapper/handler는 루프 없음; ArrayItems의 JSX 행을 for 한 번으로 생성 | O(행 수) 결과 JSX는 동일, memo/value-only 재사용 유지 |

iii의 allocation 상한 assertion은 되돌린 내부 구현에만 해당하므로 제거했고, 같은 빈 커밋의 값·배달 없음·revision 참조 보존 검증은 유지·보강했습니다. integer property 순서와 미변경 형제 참조를 고정한 loop-order characterization을 구현 전에 추가했습니다. 변경 전 관련 테스트 71파일/463사례 통과를 확인했습니다.

### C — 노드 계산 범위

소유자 질문 답: 이번 무의존 배열 측정에서 다른 형제 영역 계산은 0개입니다. mount에서 v 전→후 flat-500은 501노드 각각 2→1회(총 1002→501), nested-d5-f4는 1,365노드 각각 2→1회(2730→1365), array-1000은 4,000노드 각 1회+2노드 각 2회(4004→4004), derived는 2노드 각 2회·1노드 3회·2노드 각 4회(15→15)입니다. 1,000행 배열 push는 방문/변경 4/4, 끝 remove는 2/2, 첫 remove는 2000/1001이며 세 작업 모두 별도 형제 3노드 영역의 방문은 0입니다.

visited는 computeNode 진입의 서로 다른 객체 수이고 computed는 dirty 검사 뒤 계산한 객체 수입니다. 이 실험에서는 둘이 같습니다. changed는 커밋 직전 context.changedNodes의 고유 객체 수로, 값/형상 변경을 기록하는 장부이며 순수 경로 재배치 전체와 동일하지 않습니다. 앞 삭제는 뒤따르는 아이템/자손의 경로를 재배치하므로 실제로 같은 배열 안의 추가 노드를 계산합니다. 루트와 해당 배열의 조상 재조립도 포함합니다. 무관 형제의 값 참조도 같은지 단언했습니다.

| 배열 크기 | 작업 | compute 방문/계산 | changedNodes | commit 방문(소멸 포함) | 무관 형제 방문 |
| ---: | --- | ---: | ---: | ---: | ---: |`);
for (const row of final.nodeCounts.filter(row => row.variant === 'working' && row.mode !== 'mount'))
  console.log(`| ${row.fixture.match(/rows-(\d+)/)[1]} | ${row.mode} | ${row.visited.nodes}/${row.computed.nodes} | ${row.changed} | ${row.delivery.nodes} | ${row.computed.unrelated} |`);
console.log(`
### 재현과 증거

- [최종 timing 원표본](./round-87-final-timings.json), [최종 수치·노드 계수 요약](./round-87-final-summary.json), [공유 빈 집합 실험 timing](./round-87-timings.json), [실험 요약](./round-87-summary.json).
- 독립 대조: [flat](./round-87-isolated-flat-summary.json), [nested](./round-87-isolated-nested-summary.json), [array](./round-87-isolated-array-summary.json), [derived](./round-87-isolated-derived-summary.json); 각각 같은 이름의 -timings.json에 숫자 표본만 있습니다.
- raw에는 timing 숫자만 있고 per-sample span은 없습니다. [phase 요약](./round-87-phase-summary.json)은 기존 커밋 측정의 per-phase median/p99·호출 수만 집계했습니다. 기존 커밋 측정 파일은 삭제하거나 다시 쓰지 않았습니다. 모든 새 JSON은 5 MB 미만입니다.
- 최종 검증 결과는 [verification](./round-87-verification.json)에 명령/종료 상태/허용 실패와 소스 해시를 기록합니다. 예약 파일은 다른 작업에서 변경 중이었으며 이 작업은 수정하지 않았습니다.
- 최종 실행: ${verification.results[0].summary.find(line => /^\s+Tests /.test(line)).trim()}; tsc exit ${verification.results[1].exit}, eslint exit ${verification.results[2].exit}. 실패 네 건은 두 React 프로젝트의 EVENT-070 두 사례뿐입니다. 앞선 전체 실행에서 추가 REACT-028 두 건이 있었으나 단독/파일 전체/최종 전체 실행에서는 재현되지 않았고 이를 고치는 제품 변경은 하지 않았습니다.
- 검증 후 별도 작업이 예약 변경을 8955aa173으로 커밋하여 HEAD가 이동했습니다. 이 작업은 git 쓰기를 하지 않았습니다. 삭제된 core/types/index.ts의 tombstone을 기준 파일 집합에 포함하면 전체 src 해시가 검증 당시와 정확히 같으므로 해당 실행 증거를 재사용했습니다.

~~~sh
ROUND87_OUTPUT=round-87-replay node --expose-gc packages/canard/schema-form/bench/round-87-measure.mjs
ROUND87_OUTPUT=round-87-shared-replay ROUND87_VARIANTS=head-delivery,shared-delivery,working,revert-delivery node --expose-gc packages/canard/schema-form/bench/round-87-measure.mjs
ROUND87_OUTPUT=round-87-array-replay ROUND87_VARIANTS=head,working ROUND87_FIXTURES=array-1000 node --expose-gc packages/canard/schema-form/bench/round-87-measure.mjs
node packages/canard/schema-form/bench/round-87-budgets.mjs --table
node packages/canard/schema-form/bench/round-87-report.mjs
node packages/canard/schema-form/bench/round-87-check.mjs --run
node packages/canard/schema-form/bench/round-87-check.mjs
~~~

측정 재현 시에도 reserved 파일은 그대로 읽습니다. 검증은 PKG에서 npx --no-install을 사용하여 설치 없이 요청한 vitest/tsc/eslint 인수를 실행합니다. 변경 중인 별도 작업의 영향을 이번 성능 개선으로 해석하지 않습니다.
`);
