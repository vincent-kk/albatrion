# Ⅳ-2 후보 독립 검토 (fdfa0f3..67405376f)

## 판정

조건부 PASS입니다. P1은 0건이므로 FAIL이 아닙니다. 코드 추적으로는 관측 동작 변경, scratch 탈출, 재진입 오염, 공개 표면 변경을 찾지 못했습니다. 다만 P2가 1건 있어 "PASS with P3"로 분류하지 않았습니다. 병합 조건은 P2-1을 해소하거나 코디네이터가 그 상주 메모리를 명시적으로 수용하는 것입니다.

## 발견

### P2-1 키 순서 캐시가 "방문한 버킷 수 × 호스트 폭"만큼 상주합니다 (구조는 확인됨, 크기는 추정)

- 위치: src/core/engine/settle/utils/compute/childSelection/utils/publishPreparedSelection.ts:16-41 과 prepareStaticHost.ts:28-33, 139.
- 결함: membership이 바뀌는 공표 때마다, 처음 보는 literal 버킷에 대해 `{ names, keys }`를 WeakMap에 저장합니다.
  - `keys`는 baseline 키 전체와 dynamic 이름을 모두 담으므로 항목 하나가 호스트 폭(B+D) 크기입니다.
  - 항목 수에 상한이 없습니다.
  - 항목은 준비된 호스트가 사는 동안 남습니다(살아 있는 노드의 host-derived 기록).
  - `baselineKeys`도 호스트마다 O(B) 배열을 하나 더 둡니다.
- 실패 시나리오: 정적 필드 1,000개와 분기 80개를 가진 루트에서 80개 값을 한 번씩 고르면, 약 80 × 1,000 슬롯(수백 KB)이 폼 수명 동안 남습니다. 이전 코드에는 이런 상주가 없었습니다.
- 측정이 이를 보지 못하는 이유:
  - 창의 22행은 두 값만 교대하므로 힙 관문에 드러나지 않습니다.
  - 차가운 첫쓰기 장치는 첫 쓰기 하나만 재므로 두 번째 이후 버킷의 비용이 빠집니다.
- 규칙 위반:
  - 브리프의 불변식을 문자 그대로 어깁니다. 불변식은 폼 크기에 비례하는 새 상주 구조를 금지하며, 예외는 비용이 첫쓰기 추가항에 들어 있고 가중 교환비로 이길 때뿐입니다.
  - settle/DETAIL.md 22행은 "캐시는 문자열과 불변 bucket만 보유"라고만 적고 공간 비용을 밝히지 않습니다.
- 관측 동작에는 영향이 없습니다.
- 수정 사양:
  1. prepareStaticHost.ts:30-33에서 `keyOrders`의 형을 `{ readonly bucket: readonly number[]; readonly names: readonly string[]; readonly keys: readonly string[] }[]`로 바꿉니다. TSDoc에는 "가장 최근에 넣은 버킷 4개까지만 보유"라고 적습니다.
  2. publishPreparedSelection.ts:17의 조회를, 최대 4개 항목을 도는 for 루프의 `entry.bucket === bucket` 비교로 바꿉니다.
  3. 41행의 저장은 다음 순서로 바꿉니다. 같은 bucket 항목이 있으면 그 항목을 제거합니다. 없고 길이가 4이면 맨 앞 항목을 제거합니다. 그 뒤 push합니다.
  4. settle/DETAIL.md 22행에 다음 문장을 추가합니다. "공간은 준비된 호스트마다 최대 4 × (baseline 키 수 + 2 × dynamic 이름 수)이며 호스트 수명 동안 남는다."
  5. `settle/__tests__/settle.switch-selection-scratch.test.ts`에 사례를 하나 추가합니다. 서로 다른 버킷 6개를 차례로 방문한 뒤, `keyOrders.length`가 4 이하인지와 `Object.keys(root.structure)`가 기대 순서인지를 확인합니다.
  6. 검증: 위 시험 파일과 childSelection 시험이 통과해야 합니다. diagnoseRows 예산 `19 18 7 12`도 그대로 통과해야 합니다(Map·Set 생성은 늘지 않습니다).
- 대안: 코디네이터가 상주를 수용한다면 DETAIL에 O(방문 버킷 × 호스트 폭)을 적고, 넓은 호스트에서 여러 버킷을 방문하는 힙 탐침을 창에 추가합니다.

### P3-1 재사용 컨테이너를 크기 확인 없이 비우는 호출이 모든 쓰기 경로에 들어갔습니다 (가능성)

- 위치:
  - markCommitDeliveries.ts:421-427 (커밋마다 6회)
  - releaseSettlementScratch.ts:40-49 (정착마다 계산 3회, 등록 4회)
  - registerRecalculation.ts:99, 110
  - getDependencyIndex.ts:330-331 (바뀐 경로마다), 553-558 (질의마다 6회)
  - selectChildren.ts:341, 343 (호스트 선택마다, 마운트 포함)
  - finalizeExits.ts:125-126
  - commitSlotChanges.ts:34, 58-59
- 결함: V8에서 Map·Set의 clear는 C++ 내장 함수이며, 비어 있는 컬렉션에도 새 기본 크기 해시 표를 할당합니다. 같은 파일 releaseSettlementScratch.ts:14-37의 기존 코드는 그래서 `if (x.size) x.clear()`로 감쌉니다. 새 코드는 감싸지 않았습니다.
- 실패 시나리오 1, 보호 행 퇴보:
  - 게이트 없는 단일 잎 쓰기(`single-*`)는 이전에 Set 1개(expanded)와 배달 컨테이너 6개를 생성했습니다.
  - 지금은 clear를 약 11회 부릅니다(등록 시작 1회, 해제 4회, 배달 6회).
  - `leaf-gate-*` 행에는 계산 3회와 changedAncestors 2회가 더해집니다.
  - 창에서 `single-*`, `leaf-gate-*`, wave 행이 폭 밖으로 퇴보하면 이것이 첫 용의자입니다.
- 실패 시나리오 2, 감소 수치의 과대 표시: diagnoseRows는 `new Map/Set` 생성 지점만 셉니다. 그래서 "97→37" 감소에는 clear가 만드는 표 할당이 빠져 있습니다. 결과 문서가 이 수를 시간 판정이 아니라고 적고 있으므로 병합 판정 자체를 오도하지는 않습니다.
- 수정 사양: 위 Set·Map의 clear를 모두 `if (x.size) x.clear();`로 바꾸고, 배열 비우기는 `if (a.length) a.length = 0;`로 바꿉니다. 의미는 같습니다. 검증은 settle 시험(새 scratch 시험 7파일 포함), diagnoseRows 예산 재실행, 창의 보호 행입니다.

### P3-2 넓은 baseline에서 ownKeys 열거마다 O(B·D) 비교와 정렬이 일어납니다 (가능성)

- 위치: getPreparedSelectionKeys.ts:13-16, comparePreparedSelectionKeys.ts:9-25.
- 결함: dynamic 키마다 `baseline.includes`(O(B))를 부릅니다. 매 열거마다 정렬도 하며, 비교 한 번에 문자열→숫자→문자열 변환이 두 번 들어갑니다. 이전 spread는 O(B+D) 복사였습니다.
- 실패 시나리오: switch-siblings-1000에서 전환마다 한 번 일어나는 열거가 이전보다 느려질 수 있습니다. 창이 이 행을 재므로 판정은 창이 합니다.
- 수정 사양:
  1. prepareStaticHost에서 baseline에 정수형 키가 있는지 한 번 계산해 저장합니다.
  2. getPreparedSelectionKeys에 baseline 객체를 인수로 넘기고, `includes` 대신 `hasOwnProperty(baseline, key)`를 씁니다.
  3. 양쪽 모두 정수형 키가 없으면 정렬을 건너뜁니다.
  4. 검증: 기존 정수·심볼 순서 시험이 통과해야 합니다.

### P3-3 새 ownKeys가 열거 불가 키를 보고하고, 시험이 이를 기대값으로 고정합니다 (확인, 제품 경로에서는 도달 불가)

- 위치: getPreparedSelectionKeys.ts:14, settle.switch-selection-scratch.test.ts:95-113.
- 결함: 이전 `Reflect.ownKeys({ ...baseline, ...target })`는 열거 가능한 키만 복사했습니다. 새 시험은 `enumerable` 없이 정의한 심볼이 결과에 나오기를 기대합니다.
- 실패 시나리오:
  - 엔진은 dynamic에 일반 대입만 하므로 현재는 차이가 없습니다. 서술자 trap 때문에 Object.keys도 같습니다.
  - 나중에 누가 열거 불가 속성을 dynamic에 두면 Reflect.ownKeys 관측이 달라집니다.
- 수정 사양: settle/DETAIL.md 22행에 다음 문장을 추가합니다. "private view의 ownKeys는 dynamic의 열거 불가 키도 보고하며, 엔진은 그런 키를 만들지 않는다."

### P3-4 settle/DETAIL.md 156행이 더 이상 사실이 아닌 사양을 적고 있습니다 (확인)

- 위치: settle/DETAIL.md:156의 "기존 `(path, blueprint identity)` JSON 키로 후보를 조회한다".
- 같은 문서 9행과 실제 코드(selectEntryStep.ts:212-215의 getIdentity)는 직접 조회입니다.
- 수정 사양: 그 문장을 "PendingExitMap의 (path, kind/union token) 직접 조회로 후보를 찾는다"로 바꿉니다.

### P3-5 루트 선택 캐시의 강건성 (확인, 현재는 정확합니다)

- 위치: gateSelectionRound.ts:14-24, selectRootGateDeclarations.ts:23-45, selectNodeSchema.ts:76-86.
- 지적 (a): `RootGateSelection.schema`는 isAtomic 없이 저장됩니다.
  - 현재는 정확합니다. BlueprintNode는 Blueprint마다 새로 만들어지고(buildNodes의 templates는 분석 문맥별입니다), Blueprint 캐시는 isAtomic으로 갈립니다(blueprint.ts:35-39).
  - 그러나 같은 성격의 선례인 readAdmittedEdgeSchema.ts:46은 isAtomic을 함께 확인합니다.
- 지적 (b): 공유되는 `declarations`가 가변 배열 형인데, 그대로 `active`로 반환됩니다. 현재 호출자는 읽기만 합니다.
- 수정 사양:
  1. RootGateSelection에 `isAtomic`을 추가하고 schema와 함께 저장합니다. 값이 같을 때만 재사용합니다.
  2. `declarations` 형과 selectRootGateDeclarations의 반환형을 readonly 배열로 바꿉니다.
  3. 검증: typecheck와 선택 시험.

## 확인한 것

1. Scratch 수명과 재진입 안전:
   - 새 하위 scratch는 모두 정착 scratch 객체에 달려 있습니다.
   - 중첩 쓰기는 inUse 때문에 새 scratch를 받습니다(getSettlementScratch.ts:13-45). 따라서 B11 쓰기, B12 resolver, 구독자의 쓰기와 공유되지 않습니다.
   - 비우기는 각 소유자의 finally에 있습니다: selectChildren.ts:339-345, markCommitDeliveries.ts:420-431, finalizeExits.ts:124-127, commitSlotChanges.ts:57-60. 정착 종료 비우기는 releaseSettlementScratch.ts:38-60에 있습니다.
   - 아래 값들은 바깥으로 보관되지 않습니다:
     - publishGlobalStateDeltas는 deltas를 보관하지 않습니다.
     - watchIndex.affected는 후보 Set에 추가만 합니다.
     - 선택 frame은 context에 저장되지 않습니다.
   - presence 질의 결과는 같은 반복 안에서 소비되며, deferPresenceTemplate는 재진입하지 않습니다.
   - verify 그림자 재귀(registerRecalculation.ts:43-52)는 바깥 호출이 work를 받기 전에 끝납니다.
2. 관측 동등:
   - 단일 split run 병합(getDependencyIndex.ts:333-413): 결과 순서가 이전 안정 정렬과 같습니다(동률이면 앵커, 호스트, 멤버 순서).
     - plainOwners는 rank 오름차순으로 만들어집니다(254-259행).
     - 단일 조건은 모든 plain rank가 firstRank보다 작을 것을 요구합니다.
     - 단일 run의 앵커는 최대 1개이고, 그 rank는 firstRank 이상입니다.
   - PendingExitMap:
     - 삽입 순서, 같은 path·kind의 덮어쓰기 위치, 다른 kind 분리, 삭제 뒤 끝에 붙는 재삽입이 모두 같습니다.
     - 소멸 처리는 저장된 원래 path를 씁니다.
     - 진단 열거는 JSON 키를 지연 생성합니다.
   - 루트 선택 캐시는 mergeEffectiveSchema memo와 같은 참조를 돌려줍니다. 엔진 기록을 재설정하면 표와 memo가 함께 버려집니다.
   - 공표 키 순서 캐시는 이름 열이 정확히 같을 때만 재사용되므로 결과 순서가 이전과 같습니다.
   - ownKeys 순서는 열거 가능 문자열 키에 대해 이전과 같습니다.
   - kept terminal 단축(createExitSlotOverlay.ts:90-105)의 결과는 일반 경로와 같습니다.
   - 객체 retained entry 우선 조회: 객체 호스트 slot 키를 넣는 모든 경로가 (이름, 템플릿)의 첫 edge를 쓰므로 같은 binding을 돌려줍니다.
   - 조상 정책 공유: 정책 입력이 retain 루프 동안 바뀌지 않습니다.
   - misfit 색인 지연: 루프 중 misfitPaths가 늘어나는 경로가 없습니다.
   - revision 메모: 4개 초과 시 승격하며, 수명 복원 위치는 그대로입니다.
   - pendingOutputs 연결: 모든 읽기가 `?.size`, `?.has`, `?? []`이므로 동작이 같습니다.
3. 시험:
   - src 아래에서 수정되거나 삭제된 시험은 0개이고, 새 시험은 10개입니다.
   - 새 단위 시험은 컨테이너 identity 재사용, 정렬 0회, JSON 키 0개, Map 생성 0회를 고정하므로 항목을 되돌리면 실패합니다.
   - 할당 상한 자체는 수동 장치(checkAllocationBudget.mjs)이며 CI 시험 프로젝트 밖에 있습니다.
   - verify 증인 호출 지점은 diff에서 키 형식만 바뀌었고 비활성화되지 않았습니다.
4. 경계와 바이트:
   - 수정된 index.ts는 없습니다.
   - PendingExitMap은 engine의 organ에 있고 import가 없습니다. record와 settle은 이를 위쪽 방향으로 가져옵니다.
   - f81d1038c 뒤 src 변경은 0입니다.
   - 추가된 줄과 압축 원시에 기계 경로가 0건입니다. 커밋 본문에 co-author와 session 줄이 0건입니다.
   - 워크트리 dist/index.d.ts의 SHA-256은 기록값 ed3bfe4d…과 같습니다.
   - 공개 FieldNode 형은 runtime 멤버를 노출하지 않습니다. 바뀐 SettlementScratch는 공개 형에서 도달하지 않습니다.
   - FCA 요약은 202건이며 기준도 202건입니다.
5. 측정 장치:
   - instrumentDetails는 이전 guard도 계속 인식하므로 A 레인과 과거 창의 계측은 같습니다.
   - diagnoseRows는 선택적 행 필터와 site 보조 필드만 추가했습니다.
   - coldFirstWrite.mjs는 표본마다 A와 B의 새 스키마와 새 청사진을 시계 밖에서 만듭니다(WeakSet으로 단언합니다).
   - A/B 순서를 표본마다 교대하고, 예열은 0이며, 타이머는 setValue 한 줄만 감쌉니다.

## 미확인

1. 지시에 따라 시험, typecheck, lint, build, 창을 실행하지 않았습니다.
2. clear의 비용과 할당은 V8과 JSC에서 측정하지 않았습니다. P3-1은 구현 지식에 근거합니다.
3. P2-1의 메모리 크기는 계산 추정이며 힙으로 재지 않았습니다.
4. 기준 dist를 다시 만들지 않았습니다. 그래서 확인한 것은 기록된 A/B 해시와 현재 dist 해시가 같다는 데까지입니다. 그 dist가 후보 head로 만들어졌는지는 확인하지 못했습니다.
5. FCA를 다시 돌리지 않았습니다.
6. 첫 edge 논증은 grep으로 찾은 삽입 지점을 추적한 결과입니다. 런타임으로 전수 확인하지는 않았습니다.
7. 300 시드 등록 이력 시험과 B12 장면의 내용은 읽지 않았습니다.

## 실행한 명령

1. 워크트리에 대한 git 읽기 명령: log, diff, diff --stat, diff --name-status (범위는 fdfa0f3..67405376f와 f81d1038c..67405376f).
2. 워크트리 파일과 브리프에 대한 cat, sed, grep, find, wc.
3. raw/iv-2 아래 .gz 파일들에 대한 gzip -dc | grep -c (기계 경로 검색).
4. dist/index.d.ts에 대한 shasum -a 256과 ls.
5. build, test, lint, node, yarn은 실행하지 않았습니다.
