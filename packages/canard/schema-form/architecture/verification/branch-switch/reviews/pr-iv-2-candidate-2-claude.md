# Ⅳ-2 후보 2 독립 검토 (67405376f..527c43211, 제품 head 81e4b05a2)

## 판정

PASS with P3입니다. P1은 0건, P2는 0건, P3는 1건입니다. 후보 1의 P2-1과 P3-1~P3-5 여섯 건이 모두 코드와 문서에서 해소되었음을 추적으로 확인했습니다. 남은 P3 1건은 저장소에 복사한 후보 1 검토문의 표기 손상이며, 제품 동작과 측정에는 영향이 없습니다. 시간과 힙의 채택 판정은 진행 중인 후보 2 창이 내립니다.

## 발견

### P3-A 저장소에 복사한 후보 1 검토문에서 경로와 행 이름이 서식 도구 때문에 바뀌었습니다 (확인)

- 위치: `architecture/verification/branch-switch/reviews/pr-iv-2-candidate-1-claude.md:30`, :49. 46행과 48행은 역슬래시 이스케이프만 붙어 렌더링은 같습니다.
- 결함: 원문의 `settle/__tests__/settle.switch-selection-scratch.test.ts`가 `settle/**tests**/…`로 바뀌었습니다. 원문의 `single-*, leaf-gate-*`는 `single-_, leaf-gate-_`로 바뀌었습니다. 원문이 이 부분을 백틱 없이 써서 markdown이 강조로 해석했고, 서식 도구가 그 해석을 텍스트로 고정했습니다. 그래서 원문 쪽 표기에도 책임이 있습니다.
- 실패 시나리오: 시험 파일 경로나 행 이름으로 검색하면 수정 사양 5번과 P3-1의 용의자 문장이 나오지 않습니다. 또 "검토 판정을 그대로 복사한다"는 브리프 요구와 바이트가 다릅니다.
- 수정 사양:
  1. 30행의 경로를 백틱으로 감싸 `settle/__tests__/settle.switch-selection-scratch.test.ts`로 되돌립니다.
  2. 46, 48, 49행의 `single-*`와 `leaf-gate-*`를 각각 백틱으로 감쌉니다. 역슬래시와 밑줄은 원래의 별표로 되돌립니다.
  3. 검증: 원본 판정 파일과 diff했을 때 백틱 추가 말고는 차이가 없어야 합니다. 같은 파일에서 `grep -n '\*\*tests\*\*\|single-_\|leaf-gate-_'`의 결과는 0건이어야 합니다. 서식 도구를 다시 돌린 뒤에도 두 결과가 같아야 합니다.

## 확인한 것

1. P2-1 (2a19dffb2): 해소되었습니다.
   - `prepareStaticHost.ts:32-37`에서 keyOrders는 `{ bucket, names, keys }` 배열이며, TSDoc에 "최근에 넣은 네 버킷"이 적혀 있습니다.
   - `publishPreparedSelection.ts:17-23`의 조회는 `entry.bucket === bucket` identity 비교를 최대 네 번 합니다.
   - :46-52의 저장은 미적중이거나 이름 열이 다를 때만 일어납니다. 같은 bucket이 있으면 splice하고, 없으며 길이가 4이면 shift한 뒤 push합니다. 적중해도 순서를 갱신하지 않는 삽입 순서 퇴출이므로 사양과 같습니다.
   - 퇴출해도 공표 순서는 바뀌지 않습니다.
     - 미적중 경로는 매번 `Object.keys(Object.assign(null 프로토타입, baseline, dynamic))`로 다시 계산합니다(:44-45).
     - 적중하려면 이름 열이 정확히 같아야 합니다(:24-29).
     - baseline은 준비 때 한 번만 채워지고(`prepareStaticHost.ts:129`), Proxy set trap이 baseline 이름에 대한 쓰기를 막습니다.
     - dynamic 이름은 baseline과 겹치지 않습니다(:146-148).
     - dynamicNames 배열은 readonly이며, 제자리에서 바꾸는 소비자가 없습니다.
     - 따라서 퇴출 뒤의 재계산은 캐시 결과와 같습니다.
   - bucket을 강하게 참조하지만 문제는 없습니다. bucket은 같은 청사진 노드의 gate 표에 속하고, 청사진·템플릿·경로가 바뀌면 준비 호스트가 버려지기 때문입니다(:78-86).
   - `settle/DETAIL.md:25`에는 4 × (B + 2D) 상한이 적혀 있으며 실제 구조와 맞습니다. 항목 하나는 names(D)와 keys(B+D)를 담습니다.
   - 시험(scratch test :97-125)은 kind_1부터 kind_6까지 방문한 뒤 배열 여부와 길이 4를 확인합니다. 이어서 퇴출된 kind_1을 다시 방문하고 길이 4와 Object.keys 순서를 확인합니다.
     - 수정 전 WeakMap이면 toBeInstanceOf(Array)에서 실패합니다.
     - 상한이 없는 배열이면 길이 6에서 실패합니다.
     - unit 로그와 verify 로그에서 이 파일의 7개 사례가 모두 통과했습니다.
2. P3-1 (5073e443b): 해소되었습니다.
   - 감싼 지점은 43곳입니다: markCommitDeliveries 8, selectChildren 3, getDependencyIndex 11, registerRecalculation 2, releaseSettlementScratch 8, commitSlotChanges 5, finalizeExits 2, PendingExitMap 4.
   - 대상은 모두 native Map, Set, 배열로 선언되어 있습니다(`record/types/runtime.ts:118-160`, `record/types/record.ts:65`, 각 get\*Scratch 생성자). PendingExitMap은 size를 재정의하지 않으므로 `this.size`는 native 저장소를 읽습니다.
   - 꼭 필요한 초기화는 조건 없이 남아 있습니다: selectChildren의 `scratch.inUse = false`, markCommitDeliveries의 revisionTransitions 복원, `PendingExitMap.ts:107`의 `nonce = 0`, :101-104의 bucket 풀 반환.
   - 컨테이너를 새 객체로 바꾸는 지점은 없습니다. 비어 있을 때만 건너뛰므로 남는 참조도 없습니다.
   - 전체 diff에서 감싸지 않은 clear나 배열 비우기는 제품 코드에 0건이며, `PendingExitMap.test.ts`에만 있습니다. DETAIL은 `engine/DETAIL.md:5`와 `settle/DETAIL.md:5`에 있습니다.
3. P3-2 (57b6830ec): 해소되었습니다.
   - 정수형 키 여부는 `prepareStaticHost.ts:136`과 145에서 한 번 계산하고, `selectChildren.ts:168-170`에서 넘깁니다.
   - 중복 검사는 winglet의 hasOwnProperty를 씁니다. 이 함수는 `Object.prototype.hasOwnProperty.call`이라 null 프로토타입 baseline에서도 안전합니다.
   - 정렬은 baseline 플래그가 켜져 있거나 새로 넣은 dynamic 키가 정수형일 때만 합니다.
   - 순서는 이전과 같습니다.
     - 정수형 키가 없을 때 결과는 baseline 문자열의 삽입 순서, baseline에 없는 dynamic 문자열의 삽입 순서, dynamic 심볼 순입니다. 이는 열거 가능 키에 대한 `Reflect.ownKeys({...baseline, ...dynamic})`와 같습니다.
     - 정수형 키가 있을 때는 안정 정렬이 정수를 오름차순으로 앞에 두고, 이어서 문자열, 심볼 순으로 둡니다. 동률은 원래 순서를 유지합니다.
     - isPreparedSelectionIntegerKey는 이전에 인라인으로 있던 비교식과 같은 정규 배열 색인 판정(2^32−1 미만)입니다.
     - 제품 baseline에는 심볼이 없으므로 baseline 심볼을 빠뜨려도 영향이 없습니다. 이 점은 후보 1부터 그대로입니다.
   - 시험(:149-171)은 수정 전에 includes 2회 때문에 실패합니다. spy가 감싸는 구간에는 Reflect.ownKeys 호출만 있습니다.
4. P3-3과 P3-4: 두 문장 모두 코드와 맞습니다.
   - P3-3 (1b8cfa23c, `settle/DETAIL.md:25` 끝 문장):
     - Reflect.ownKeys(dynamic)는 열거 불가 키도 보고합니다.
     - 엔진의 쓰기는 set trap의 `enumerable: true` 정의(`createPreparedSelectionStructure.ts:44-49`)와 일반 대입뿐입니다.
     - childSelection에 다른 defineProperty는 없습니다.
   - P3-4 (f36703036, `settle/DETAIL.md:159`):
     - `selectEntryStep.ts:212-215`는 `getIdentity(경로, getBlueprintNodeIdentity(entry.node))`를 부릅니다.
     - 그 identity는 kind이거나 `union:` 마스크 토큰입니다.
     - DETAIL에 JSON 키 조회 문장은 남아 있지 않습니다.
5. P3-5 (81e4b05a2): 해소되었습니다.
   - `gateSelectionRound.ts`에서 declarations는 readonly이고, isAtomic 필드가 추가되었습니다. `selectRootGateDeclarations.ts:19`의 반환형도 readonly입니다. 유일한 소비자인 selectNodeSchema는 읽기만 합니다.
   - `selectNodeSchema.ts:80-90`은 저장한 isAtomic이 현재 값과 같을 때만 재사용하고, schema와 isAtomic을 함께 저장합니다.
   - 캐시 적중은 유지됩니다. Blueprint.isAtomic은 옵션 참조를 readonly로 저장하므로 쓰기 사이에 안정적입니다(`blueprint/blueprint.ts:121`, 153).
   - 시험(:173-192)은 수정이 없으면 실제 이유로 실패합니다. 이전 코드는 가짜 `{ schema: false }`를 재사용해 root.schema가 그 객체가 되기 때문입니다. 수정 뒤에는 merge memo가 원래 참조를 돌려줍니다.
   - 적중 쪽, 즉 isAtomic이 같을 때 merge를 부르지 않는다는 것을 고정한 시험은 없습니다. 다만 memo가 같은 참조를 돌려주므로 놓치더라도 관측 차이는 없고, isAtomic이 안정적이라 결함으로 세지 않았습니다.
6. 힙 탐침 (f74249291, 527c43211): 브리프 조건을 모두 충족합니다.
   - `wideBucketHeap.mjs`의 7개 표본은 createWideBucketHeapForm으로 매번 새 스키마와 새 청사진을 만듭니다. WeakSet으로 새 청사진임을 단언합니다.
   - GC 전후 힙 카운터만 읽고, 시계는 전혀 읽지 않습니다. smoke는 GC와 카운터를 건너뜁니다.
   - 이력은 2버킷과 80버킷 두 가지이고(:20-23), Node와 Bun에서 돌립니다. Node에는 --expose-gc를 붙인 프로세스 8개를 시간 행과 cold 측정이 끝난 뒤에 실행합니다(`window.mjs`).
   - summarizeWideBucketHeap는 행마다 B 중앙값 ≤ A 최댓값을 판정하며, exchangeContribution은 0입니다.
   - `summarize.mjs`는 이 결과를 adoptable과 증거에만 더하고, weightedExchange나 시간 행에는 넣지 않습니다.
   - `prepare.mjs`는 iv-2 최상위와 helpers의 .mjs를 모두 입력 해시에 넣으므로 새 장치 파일도 고정됩니다. device-tests 로그는 7건 통과입니다.
   - 81e4b05a2 이후 src 변경은 0입니다. `dist/index.mjs`의 SHA는 기록된 B 값 86c21cbe…과 같습니다.
   - 기계 경로를 확인했습니다.
     - 델타의 추가 줄과 .gz에서 절대 경로 접두는 0건입니다.
     - 원시 다섯 파일에는 `<scratch>/claude-501/perf-runs/…` 꼬리가 남아 있습니다: candidate-1의 retention.json과 retention-load-check.json, pair-samples.json.gz, preflight의 retention-load-check.json.gz와 smoke.log.gz입니다.
     - 이미 병합된 raw/iv-0, raw/iv-1과 같은 가림 방식이므로 결함으로 세지 않았습니다.
7. 시험·경계·커밋·해시:
   - src 시험은 델타에서 switch-selection-scratch 시험 하나만 바뀌었고, 추가만 있으며 삭제 줄은 0입니다. 전체 diff의 시험은 모두 신규입니다.
   - 수정된 `index.ts`는 없습니다.
   - 커밋 본문에 co-author나 session 줄은 0건입니다.
   - `dist/index.d.ts`의 SHA는 ed3bfe4d…로 기록값 A·B와 같고, 선언 차이는 0바이트입니다.
   - FCA는 202건으로 기준과 같고, finding의 정체도 후보 1과 같습니다.
   - 각 제품 커밋은 같은 커밋 안에 DETAIL 변경을 포함합니다.
   - 정적 로그: unit 610파일·3,993건, verify 747파일·4,805건, 순차 실행 모두 종료 0, 배달 차이 0, diagnoseDelivery 0, 격리 2,395파일입니다.

## 미확인

1. 지시에 따라 시험, typecheck, lint, build, 창을 실행하지 않았습니다. candidate-2-static에는 typecheck 전용 로그가 없고 결과 문서의 종료 0 주장만 있습니다. 형에 관련된 변경은 손으로 추적했습니다.
2. P2-1용과 P3-1용 리뷰 진단 원시 두 파일은 바이트가 같고 커밋 출처 필드가 없습니다.
   - P3-1이 할당 지점의 줄 번호를 옮기지 않았다는 설명은 코드와 맞습니다. 그래도 다시 실행했다는 사실 자체는 증명하지 못했습니다.
   - 관문 자체는 제품 head의 최종 row-diagnostics가 맡습니다. 그 원시에서 19/18과 7/12 합계를 직접 더해 보지는 않았습니다. node와 awk를 쓰지 않았기 때문입니다.
3. 힙 탐침의 실제 적재와 창 결과는 보지 못했습니다. 창이 진행 중이며, candidate-2-preflight는 추적되지 않은 디렉터리입니다.
4. 힙 탐침이 쓰는 design-optimization의 `fixtures.mjs`와 `materialize.mjs`는 입력 해시에 없습니다. 이는 기존 시간 장치(`b9-0/operation.mjs`)도 가진 공백이며, 두 레인이 같은 파일을 씁니다.
5. V8과 JSC에서 clear 생략의 실제 시간 이득은 재지 않았습니다.

## 실행한 명령

1. 워크트리에 대한 git log, show, diff, diff --stat, diff --name-status, status (범위는 67405376f..527c43211, fdfa0f3a7..527c43211, 81e4b05a2..527c43211).
2. 워크트리 파일과 브리프, 후보 1 판정에 대한 cat, sed, grep, find, wc, ls, diff.
3. 델타의 .gz 원시에 대한 gzip -dc | grep (기계 경로, 시험 이름, 집계).
4. `dist/index.d.ts`, `dist/index.mjs`, 리뷰 진단 원시에 대한 shasum -a 256.
5. build, test, lint, typecheck, node, yarn, bun은 실행하지 않았습니다.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `1b8cfa23cedc`, `2a19dffb2893`, `5073e443b265`, `57b6830ec910`, `67405376f122`, `81e4b05a2f99`, `f36703036b76`, `f74249291d5f`의 필요한 내용은 [본선 보존물](../../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
