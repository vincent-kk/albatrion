# 결정 62 (라) 설계 — 값 색인 분기 게이트를 선택 단계와 소유자 등록까지 넓히기

2026-10-21. 인용한 줄 번호의 기준 코드는 `47de7a441`입니다(마지막 제품 변경 `4847b1c1b`, #433). 검증자도 이 기준으로 대조했습니다(`verify.md`). 그 뒤 결정 62 (가)가 #435(`394c284a7`)로 병합되어 `selectChildren.ts`·`computeNode.ts`·`primeHost.ts`·`finalizePerished.ts`의 줄이 움직였습니다. 움직인 자리는 1.3절의 대응표에 적었습니다. 이 문서는 설계이며 제품 코드·시험·커밋을 바꾸지 않았습니다. 시간 측정은 하지 않았고, 호출 수를 세는 탐침 하나만 돌렸습니다(`experiments/count-table-model.mjs`, 결과 `experiments/counts-{5,20,80}.json`). 검증 판정(`verify.md`)의 발견 1~8을 반영한 개정 내용은 문서 끝 "개정 기록"에 있습니다.

소유자(Vincent)는 결정 62에서 (가)를 지금 구현하고 (라)를 설계하라고 정했고, "회귀와 오류가 발생되지 않도록 면밀히 검토해"라고 지시했습니다. 그래서 이 설계는 모든 단계를 "지금 코드가 하는 일과 같은 결과"라는 조건 아래에 두고, 같음을 보이는 논증·실행 중 단언·차등 시험을 단계마다 붙입니다.

경로는 따로 적지 않으면 `packages/canard/schema-form/src/core/engine/` 아래입니다. 진단은 `.seiri/tasks/branch-switch-441/diagnosis.md`(이하 "진단")이고, 99라운드 선례 설계는 `packages/canard/schema-form/architecture/verification/07-switch/gate-selection-design.md`(이하 "선례 설계")입니다.

## 0. 한눈에 보기

- **핵심 기제입니다.** 청사진 분석 때 "호스트의 무게이트 단말 키 하나와 원시 리터럴의 `===`(같은 키의 OR 포함)"인 분기 게이트를 비실행 인식기로 알아보고, 호스트마다 `감시 키 → 리터럴 → 단계(엔트리) 번호 목록` 표를 만듭니다. 바퀴는 그 키를 한 번 읽어 표를 찾고, 켜지는 엔트리와 "방문하지 않으면 결과가 달라질 수 있는 엔트리"(직전 자식·현재 구조·대기 퇴장·입력)만 기존 순서로 방문합니다. 의존 색인은 같은 표로 소유자를 나누어 살아 있지 않은 분기 소유자를 dirty 집합에 넣지 않습니다. 되살아나는 분할 소유자는 퇴장 직전 등록에서 이미 dirty가 되어 그대로 남으므로 되살림에 dirty 공백이 없고(3.4절), 중첩 호스트에서는 부모 색인의 자리를 닻 키로 지켜 `dirtyChildren`의 결과를 지금과 같게 둡니다.
- **복잡도입니다.** 판별 쓰기 한 번의 일이 O(N)에서 O(바뀐 분기 크기 + 기준 엔트리 수 + 표 밖 게이트 수 + 경로 깊이)로 바뀝니다. 첫 구현 범위는 직접 선택 계획을 가진 객체 호스트(루트·중첩·배열 아이템)입니다.
- **같음의 근거입니다.** (1) 표 게이트의 판정은 인식한 식의 의미와 같고, (2) 한 호스트 바퀴 안에서 감시 키의 투영은 바뀌지 않으며 그 읽기는 부작용이 없고, (3) 방문하지 않는 엔트리의 기존 처리 본문은 상태를 바꾸지 않으며, (4) 소유자 분할 뒤에도 형상 dirty 집합, 살아 있는 노드에 대한 dirty 판정, 매 `dirtyChildren` 호출의 결과가 같습니다. 넷 모두 검증 모드에서 실행 중 단언으로 확인합니다.
- **PR은 측정 전용 탐침 하나와 제품 PR 열다섯입니다.** 변경 하나에 재측정 하나가 되도록 나누었습니다. 8절에 순서·의존·가설·시험·기대 계수를 적었습니다.

## 1. 현재 경로 추적

### 1.1 판별 쓰기 한 번의 호출 경로(HEAD `47de7a441`)

진단의 줄 번호는 `47ad92cf3` 기준이었습니다. #433이 `writeFieldNode.ts`에 일곱 줄을 더해 쓰기 패스의 두 줄이 일곱 줄 밀렸고(진단의 `:139`·`:140`은 지금 `:146`·`:147`), 나머지 인용 줄은 그대로임을 확인했습니다. #433은 게이트 없는 정착에만 걸리므로(`settle/utils/write/writeFieldNode.ts:137-142`의 `!context.hasGates` 조건) 게이트 정착의 동작은 진단 때와 같습니다.

| 순서 | 자리 | 하는 일 | N 비례 몫(N=분기 수, 고정물) |
| --- | --- | --- | --- |
| 1 | `packages/canard/schema-form/src/core/surface/runtime/FieldNode.ts:296-297` → `write/utils/entry/dispatchSetValue.ts:52-58` | 공개 `setValue`가 `writeFieldNode(node, input, 'callerReplace', …)`를 부릅니다. | 없음 |
| 2 | `settle/utils/write/writeFieldNode.ts:112-124` | 정착 문맥을 만들고 루트를 게이트 레지스트리에 등록합니다. | 없음 |
| 3 | `settle/utils/write/writeFieldNode.ts:143` → `settle/utils/input/markWrite.ts:65-73` | 단말 `/kind`의 raw를 바꾸고 `changedRaw`·`changedNodes`·`dirtyPaths`에 넣습니다. | 없음 |
| 4 | `settle/utils/write/writeFieldNode.ts:146` → `settle/utils/dependencies/registerRecalculation.ts:21-31` | `changedRaw`마다 `getDependencyIndex(...).affected(changed, root)`의 소유자를 `dirtyPaths`·`dependencyOwnerPaths`에 넣고 부모를 `shapeDirtyPaths`에 넣습니다. | 소유자 3N+1개(루트 `''` 하나와 분기 페이로드 선언 3N개). 색인은 게이트를 가진 모든 선언 경로를 그 게이트 의존의 소유자로 넣기 때문입니다(`settle/utils/dependencies/getDependencyIndex.ts:82-92`). |
| 5 | `settle/utils/dependencies/registerRecalculation.ts:32-40`, `:41-65` | dirty 경로의 조상을 넣고, dirty 경로마다 `mayChangeAt`·`mayChangeOwnDeclarationAt`로 형상 dirty를 더합니다. | dirty 경로 3N+2개를 두 번 훑습니다. 살아 있지 않은 3N−3개가 그대로 남습니다. |
| 6 | `settle/utils/write/writeFieldNode.ts:147` → `settle/utils/compute/computeNode.ts:42`, `:115` | 루트는 dirty이고 형상 dirty이므로 바퀴 경로로 갑니다. | 없음 |
| 7 | `settle/utils/compute/computeNode.ts:153-198` | `declareChildren`의 엔트리·선언·게이트와 루트 선언의 게이트, 옮긴 게이트로 게이트 목록을 모읍니다. | 3N+2 엔트리 순회((가2)가 캐시로 바꾸는 중) |
| 8 | `settle/utils/compute/computeNode.ts:199` → `settle/utils/compute/primeHost.ts:29-113` | 구조를 게이트 없는 기준 엔트리로 되돌립니다(`:106-113`). 직접 계획이 있으면 `direct.baseline`만 돕니다(`:36-48`). | 첫 쓰기에서는 계획이 아직 없어 `declareChildren` 전체를 돕니다(`:40-48`, `prepare=false`). |
| 9 | `settle/utils/compute/computeNode.ts:200-202` | 기준 자식 가운데 dirty인 것(`/kind`)을 바퀴 전에 계산합니다. | 없음 |
| 10 | `settle/utils/compute/computeNode.ts:210-223` | 바퀴마다 증인 프레임을 만듭니다(결정 58). | 없음 |
| 11 | `settle/utils/compute/computeNode.ts:224-225` → `settle/utils/compute/selectNodeSchema.ts:27-29` | 루트 선언 N+1개의 게이트를 모두 평가합니다. | 평가 N |
| 12 | `settle/utils/compute/selectNodeSchema.ts:68-72` → `blueprint/effectiveSchema/utils/merge/mergeEffectiveSchema.ts:45-48`, `.../selectEffectiveDeclarations.ts:24-38` | 활성 ID로 유효 스키마를 찾습니다. 메모 열쇠를 만들려고 선언 N+1개를 걸러 냅니다. | 선언 N+1개 순회 |
| 13 | `settle/utils/compute/computeNode.ts:233-239` → `settle/utils/compute/childSelection/selectChildren.ts:139-156` | 직접 계획이 있으면(`DIRECT_CHILD_SELECTION_PLANS`, 계획이 없으면 여기서 만듦 `getDirectChildSelectionPlan.ts:49-114`) 단계 3N+2개를 순서대로 돕니다. | 단계 3N+2 |
| 14 | `settle/utils/compute/childSelection/selectChildren.ts:171-176` | 단계마다 게이트를 평가합니다(`evaluateGate`). | 평가 3N |
| 15 | `settle/utils/compute/childSelection/selectChildren.ts:218-251` | 꺼진 엔트리마다 직전 자식과 퇴장 대기를 찾고(`JSON.stringify` 열쇠, (가1)이 고치는 중), 필요하면 `inactiveEntries`에 넣거나 구조에서 지웁니다. | 꺼진 엔트리 3N−3 |
| 16 | `settle/utils/compute/childSelection/selectChildren.ts:252-408` | 켜진 엔트리를 만들거나 되살리거나 유지하고, dirty이면 계산합니다. 새로 생긴 자식은 `enterFieldNode`로 들어옵니다(`:344-353`). | 켜진 엔트리 수(분기 크기) |
| 17 | `settle/utils/compute/childSelection/selectChildren.ts:409-486` | 대기 출력 공표, 꺼진 엔트리의 입력 분배(`:410-453`), 직전 자식의 퇴장 대기 등록(`:454-470`), 자식 목록 조립. | 직전 자식 수와 `inactiveEntries` 수 |
| 18 | `settle/utils/compute/computeNode.ts:240-248` | 있음 등록(#431), dirty 자식 계산. `dirtyChildren`은 부모 색인의 모든 dirty 자손 항목을 훑습니다(`settle/utils/compute/dirtyChildren.ts:19-31`, 색인은 `settle/utils/scratch/DirtyPathSet.ts:71-86`이 엄격 접두마다 넣음). | 항목 약 3N개를 훑고 살아 있는 0~1개를 돌려줌 |
| 19 | `settle/utils/compute/computeNode.ts:252-282` | 옮긴 게이트 갱신(`getGateRegistry.ts:201-205`가 위치 집합 전체를 펼침), 바퀴 상한(`getGateBudgetCap.ts:80-84`가 게이트 목록을 원소별로 비교), 확인 바퀴 생략 술어(`canSkipGateWheel.ts:26-51`). | 위치 집합 크기 N+α, 게이트 목록 N |
| 20 | `settle/utils/write/writeFieldNode.ts:150` → `settle/utils/settlement/finishSettlement.ts:59` → `settle/utils/transition/transitionSettlement.ts:61-189` | 새로 들어온 페이로드의 기본값을 자동 쓰기로 채웁니다. | 없음 |
| 21 | `settle/utils/transition/transitionSettlement.ts:206` | 누적 `changedRaw`(`/kind`와 새 페이로드 셋)로 둘째 등록을 합니다(97C-01 (4)의 누적 질의). | 4번과 같은 3N+1 |
| 22 | `settle/utils/transition/transitionSettlement.ts:208` | 루트를 다시 계산합니다. 7~19번이 다시 돕니다(바퀴 W3). | 평가 4N, 단계 3N+2, 등 |

확인 바퀴 둘(W2·W4)은 결정 58의 술어로 생략됩니다(`settle/utils/compute/computeNode.ts:267-279`). 그래서 실행되는 루트 바퀴는 둘이고 바퀴마다 평가가 4N(선언 N + 단계 3N)이어서 합계 8N입니다(진단 1절 표와 같음).

### 1.2 호출 수 탐침(시간 없음)

탐침은 진단의 계수 전용 번들(`branch-switch-441/bundles/E9i.mjs`, `47ad92cf3`의 사본)을 씁니다. 위에서 적은 대로 게이트 정착의 코드는 HEAD와 같습니다. "단계 방문"의 표 모형 값은 4.1절 규칙(기준 2 + 켜짐 3 + 직전 자식 중 꺼진 것 + 대기 퇴장 + 현재 구조의 게이트 엔트리 + 입력 키)으로 센 상한입니다. 등록 칸은 "소유자 수/그중 살아 있는 페이로드/등록 직후 살아 있지 않은 dirty 경로 수"입니다.

| N | 장면 | 평가 | 실행된 루트 바퀴 | 단계 방문(현재 → 표 모형) | 등록마다 소유자/생존/비생존 dirty | dirtyChildren 훑은 항목 |
| --- | --- | --- | --- | --- | --- | --- |
| 5 | 마운트 | 100 | 5 | 85 → 37 | 0/0/0, 16/0/15, 16/3/12 | 82 |
| 5 | 첫 전환(kind_0→kind_4) | 40 | 2 | 34 → 19 | 16/3/12, 16/3/12 | 79 |
| 5 | 둘째 전환(→kind_0) | 20 | 1 | 17 → 8 | 16/3/12 | 40 |
| 5 | 없는 값('missing') | 20 | 1 | 17 → 8 | 16/3/12 | 46 |
| 5 | 같은 값 다시 쓰기 | 0 | 0 | 0 → 0 | 0/0/0 | 1 |
| 5 | 루트 일괄 setValue | 40 | 2 | 34 → 21 | 16/0/15 | 53 |
| 20 | 마운트 | 400 | 5 | 310 → 37 | 0/0/0, 61/0/60, 61/3/57 | 352 |
| 20 | 첫 전환 | 160 | 2 | 124 → 19 | 61/3/57, 61/3/57 | 349 |
| 20 | 둘째 전환 | 80 | 1 | 62 → 8 | 61/3/57 | 175 |
| 20 | 루트 일괄 setValue | 160 | 2 | 124 → 21 | 61/0/60 | 233 |
| 80 | 마운트 | 1600 | 5 | 1210 → 37 | 0/0/0, 241/0/240, 241/3/237 | 1432 |
| 80 | 첫 전환 | 640 | 2 | 484 → 19 | 241/3/237, 241/3/237 | 1429 |
| 80 | 둘째 전환 | 320 | 1 | 242 → 8 | 241/3/237 | 715 |
| 80 | 없는 값 | 320 | 1 | 242 → 8 | 241/3/237 | 721 |
| 80 | 같은 값 다시 쓰기 | 0 | 0 | 0 → 0 | 0/0/0 | 1 |
| 80 | 루트 일괄 setValue | 640 | 2 | 484 → 21 | 241/0/240 | 953 |

표의 값은 성격이 넷으로 나뉩니다. 섞어 읽지 않아야 합니다.

- **실측입니다.** 평가, 실행된 루트 바퀴, 등록마다 소유자·생존·비생존 dirty, `dirtyChildren` 훑은 항목은 지금 엔진(E9i)에서 실제로 센 값입니다.
- **공식입니다.** "단계 방문"의 화살표 오른쪽 값은 `count-table-model.mjs:81`의 공식으로 셌습니다. 공식은 기준 2와 켜짐 3을 고정값으로 두므로, 없는 값 장면에서도 켜짐을 3으로 세는 상한입니다.
- **가정입니다.** 뒤 절에서 쓰는 "평가 0"은 센 값이 아니라 가정입니다. 이 고정물의 루트 선언 게이트가 모두 `./kind === 'kind_i'` 하나씩이라 E5가 성립한다는 데서 나온 개연성 있는 가정입니다.
- **유도입니다.** 뒤 절에서 쓰는 "등록 소유자 4"는 실측한 생존 페이로드 수 3에 루트 `''` 하나를 더한 값입니다. 알고리즘을 실행해 얻은 값이 아닙니다.

**"단계 19"는 "일 19"가 아닙니다.** 모형에는 바퀴마다 남는 O(N) 자리(바퀴 상한 비교, 옮긴 게이트 펼치기, 게이트 목록 복사, 루트 유효 스키마 열쇠 만들기; 8절 PR-4a~4d)가 들어 있지 않습니다. 그 넷이 없어지기 전까지 분기 전환의 일은 단계 수보다 큽니다.

탐침에서 새로 안 사실이 셋 있습니다.

- **둘째 전환은 바퀴가 하나입니다.** 돌아오는 분기의 페이로드는 잠복 값으로 되살아나 기본값 채움이 없으므로 전이 패스가 바퀴를 돌리지 않습니다(`settle/utils/transition/transitionSettlement.ts:184-189`). 측정기의 장면(새 마운트 뒤 첫 전환)은 바퀴가 둘입니다.
- **같은 값 쓰기는 이미 상수입니다.** `markWrite`가 값이 같으면 `changedRaw`에 넣지 않으므로(`settle/utils/input/markWrite.ts:66-71`) 등록이 소유자를 하나도 내지 않고 루트는 형상 dirty가 아니어서 바퀴가 돌지 않습니다.
- **마운트는 바퀴가 다섯이고 평가가 20N입니다.** 적재(`load`)에서는 직접 계획을 쓰지 않으므로(`selectChildren.ts:139-144`의 `context.kind !== 'load'` 조건) 일반 선택기가 돕니다. 표 모형의 마운트 값(37)은 8절 PR-6에서 적재에도 표를 쓸 때의 값입니다.

### 1.3 #435 병합 뒤 줄 번호 대응

이 문서의 줄 번호는 `47de7a441` 기준입니다. #435(`394c284a7`) 뒤에 움직인 주요 자리는 다음과 같습니다. 구현 PR은 아래 오른쪽 열을 기준으로 다시 확인합니다.

| 파일 | `47de7a441` | `394c284a7` | 내용 |
| --- | --- | --- | --- |
| `settle/utils/compute/computeNode.ts` | `:42` | `:43` | dirty 확인 |
| 같은 파일 | `:115-152` | `:116-153` | 형상 dirty 아닌 경로(셋째 소비자 `computed.has(child)`는 `:127-133` → `:128-134`) |
| 같은 파일 | `:88,116,127,200,246` | `:89,117,128,172,218` | `dirtyChildren` 호출 다섯(여섯째 `canSkipGateWheel.ts:29`는 바뀌지 않음) |
| 같은 파일 | `:153-198` | `:154-170` | 게이트 목록 수집. 지금은 `getStaticGateList`(`settle/utils/compute/utils/getStaticGateList.ts`)의 얼린 목록을 `:156`에서 펼쳐 복사하고 옮긴 게이트를 덧붙입니다. |
| 같은 파일 | `:199`, `:200-202`, `:205` | `:171`, `:172-174`, `:177` | `primeHost`, 바퀴 전 dirty 자식, 첫 상한 |
| 같은 파일 | `:210-288` | `:182-263` | 바퀴 고리(`selectNodeSchema` `:197`, `selectChildren` `:205`, 있음 등록 `:212`, `dirtyChildren` `:218`, 옮긴 게이트 `:224-235`, 생략 술어 `:242-254`, 정지 `:258`) |
| `settle/utils/compute/childSelection/selectChildren.ts` | `:218-251` | `:218-253` | 꺼진 엔트리. 퇴장 대기 조회가 (가1)의 `context.pendingExitPaths`(경로 → 개수) 확인을 먼저 합니다(`:224-226`). |
| 같은 파일 | `:252-408` | `:254-415` | 켜진 엔트리(퇴장 대기 삭제와 색인 갱신 `:339-344`, 되살림 `:345-348`, 진입 `:351-360`, 자식 계산 `:408-411`) |
| 같은 파일 | `:409-486` | `:416-497` | 공표·분배·퇴장 대기 등록(`:478`과 색인 갱신 `:474-477`)·조립 |
| `settle/utils/compute/primeHost.ts` | `:73` | `:73-78` | 퇴장 대기 삭제와 색인 갱신 |
| `settle/utils/transition/finalizePerished.ts` | `:58` | `:58-62` | 퇴장 대기 삭제와 색인 갱신 |
| `settle/DETAIL.md` | `:165`, `:177` | `:170`, `:182` | "청사진 전순서대로 모든 게이트를 매번 평가", "게이트는 지금처럼 매 라운드 모두 평가한다" |

## 2. 표의 구성

### 2.1 비실행 인식기(청사진, 식 하나 단위)

**자리입니다.** `blueprint/compileBlueprintExpressions/compileBlueprintExpressions.ts:64-115`의 식 컴파일 고리에서 `key === 'active'`이고 `dependencies.length === 1`일 때만 인식기를 부릅니다. 결과는 `BlueprintExpression`의 새 선택 필드 `equality?: { readonly literals: readonly EqualityLiteral[] }`로 둡니다(형 선언 `blueprint/types/blueprint.ts:69-82`에서 고침; 호출 자리에서 형을 맞추지 않습니다). `EqualityLiteral`은 `string | number | boolean | null`입니다.

**비실행의 근거입니다.** 인식기는 함수를 만들거나 부르지 않고, `toString()`을 쓰지 않으며, 작성 문자열에서 `===`를 찾는 정규식 추측도 하지 않습니다. 대신 다음 순서로 **식 전체**를 구문 분석합니다.

1. 경로 치환을 공용 함수로 뽑습니다. `blueprint/compileBlueprintExpressions/createDynamicFunction/createDynamicFunction.ts:32-38`의 `.replace(JSON_POINTER_PATH_REGEX, …).trim().replace(TRAILING_SEMICOLON, '')` 사슬을 `createDynamicFunction/utils/substituteDependencyPaths.ts`의 `substituteDependencyPaths(pathManager, expression)`로 옮기고 `createDynamicFunction`이 그것을 부르게 합니다(동작 불변, 시그니처 불변 — `settle/__tests__/settle.gate-selection-counts.test.ts`가 `createDynamicFunction`을 감시하므로 바꾸지 않습니다).
2. 인식기는 **새 경로 관리자**(`getPathManager()`)로 같은 치환을 한 번 더 합니다. 컴파일 고리도 식마다 새 관리자를 쓰므로(`compileBlueprintExpressions.ts:73`) 의존 번호가 같습니다. 인식기는 자기 관리자의 의존 목록이 컴파일 결과의 `dependencies`와 원소별로 같은지 확인하고, 다르면 인식하지 않습니다.
3. 치환된 문자열을 손으로 짠 스캐너(정규식 없음)로 토큰으로 나눕니다. 허용 토큰은 `dependencies[0]`, 문자열 리터럴, 수 리터럴(앞의 단항 `-` 하나 허용), `true`·`false`·`null`, `===`, `||`, `(`, `)`, 공백입니다. 그 밖의 문자·토큰이 하나라도 있으면 인식하지 않습니다.
4. 문법은 다음뿐입니다. `E := T ('||' T)*`, `T := '(' E ')' | C`, `C := R '===' L | L '===' R | '(' C ')'`, `R := 'dependencies[0]' | '(' R ')'`, `L := 리터럴 | '(' L ')'`. 블록 꼴(`{`로 시작, `getFunctionBody.ts:13-17`)은 인식하지 않습니다.

구현 조건이 셋 있습니다(검증 발견 7).

- **괄호 모호성은 우선순위 파서로 풉니다.** T·C·R·L이 모두 `(`로 시작하므로 위 문법을 그대로 하향 파싱하면 갈림이 생깁니다. 그래서 먼저 일반식 문법(기본항 = 괄호식 | 참조 | 리터럴, 같음 = 기본항 `===` 기본항, 논리합 = 같음 (`||` 같음)*)으로 구문 트리를 만듭니다. 그 다음 괄호를 벗긴 각 논리합 항이 "참조 한쪽과 리터럴 한쪽의 `===`"인지 트리에서 확인합니다. 우선순위는 JavaScript와 같습니다(`||`가 `===`보다 느슨함). `a === b === c` 꼴과 `./x === 'a' || 'b'` 꼴은 트리 확인에서 거절됩니다.
- **참조 토큰은 정확히 일치해야 합니다.** 스캐너는 열다섯 글자 `dependencies[0]`을 한 토큰으로만 받습니다. 앞 글자가 식별자 문자이면 거절합니다. `dependencies[1]` 같은 다른 번호도 거절합니다.
- **참조 뒤에 `.`·`[`·`(`가 오면 거절합니다.** `dependencies[0].length`, `dependencies[0][1]`, `dependencies[0]()`처럼 값을 더 읽거나 부르는 꼴을 막기 위해서입니다.

**리터럴 해석입니다.** 표의 리터럴 값은 컴파일된 함수가 비교하는 값과 같아야 합니다.

- 문자열: 이스케이프는 `\\ \' \" \b \f \n \r \t \v`, 뒤에 숫자가 없는 `\0`, `\xHH`, `\uHHHH`, `\u{H…}`(U+10FFFF 이하)만 해석합니다. 줄 이음, 옛 8진(`\1`~`\7`, `\0` 뒤 숫자), `\8`·`\9`, 그 밖의 식별 이스케이프(`\a` 등), 날 줄바꿈 문자와 U+2028·U+2029는 인식하지 않습니다. 이 범위의 해석은 JavaScript 문자열 리터럴 의미와 같습니다.
- 수: `0`, `[1-9][0-9]*`, 소수부·지수부, `.5`·`5.` 꼴, `0x`·`0o`·`0b` 꼴만 받고 `Number(text)`로 읽습니다(이 꼴에서 `Number`와 리터럴 의미가 같음). 앞이 0인 여러 자리(옛 8진), 숫자 구분자 `_`, BigInt `n`, 결과가 유한하지 않은 수는 인식하지 않습니다.
- `undefined`·`NaN`·`Infinity`는 식별자이므로 인식하지 않습니다(선례 설계 §3.1·§3.3과 같음).

**표 키의 같음 판정입니다.** 표는 `Map<EqualityLiteral, …>`입니다. `Map`은 SameValueZero로 찾고, 리터럴은 NaN이 아닌 원시값뿐이므로 `Map.get(v)`이 원소를 찾는 것과 `v === 리터럴`이 참인 것은 모든 `v`에 대해 같습니다(−0과 0은 같은 칸, NaN인 `v`는 어느 칸도 찾지 않음, 객체인 `v`는 어느 칸도 찾지 않음). 선례 설계 §3.3과 같은 결론입니다.

**인식 범위입니다(첫 구현).** `./kind === 'a'`, `'a' === ./kind`, `(./kind === 'a') || (./kind === 'b')`를 인식합니다. 목록 포함(`['a','b'].includes(./kind)`), `controls.discriminator`의 판별 게이트(`blueprint/buildNodes/utils/declarations/collectDeclarations.ts:184-193`, 형 `blueprint/types/node.ts:45-49`), FRAGMENT-048의 앞·뒤 항 분리는 첫 구현에 넣지 않습니다(9절 이후의 별도 보충 설계, 10절 질문 2). 그 게이트들은 "표 밖 게이트"로 남아 지금처럼 매 바퀴 평가됩니다.

### 2.2 호스트 표(설정, 호스트 청사진 노드 단위)

**자리입니다.** `settle/utils/compute/childSelection/getGateSelectionTable.ts`(새 파일, PR-1b)에 `getGateSelectionTable(host: BlueprintNode, blueprint: Blueprint): GateSelectionTable | null`을 두고 `WeakMap<BlueprintNode, GateSelectionTable | null>`로 캐시합니다(`getDirectChildSelectionPlan.ts:35-38`과 같은 모양). 표는 직접 계획(`getDirectChildSelectionPlan`)을 바탕으로 하므로 같은 조직에 둡니다. 청사진 쪽에는 식 하나 단위의 인식 결과만 두고, 호스트 단위 구성은 settle이 소유합니다(blueprint의 진입점에 새 이름을 더하지 않음).

**만드는 때입니다.** 마운트 때 한 번 만듭니다. 이름 있는 함수 `prepareGateSelection(blueprint)`(새 파일 `settle/utils/compute/childSelection/prepareGateSelection.ts`)가 `blueprint.nodes`를 한 번 돌며 직접 계획(`prepare=true`)과 표를 만듭니다. 적재 진입점 `settle/loadFieldNodeAtMount/loadFieldNodeAtMount.ts:22-24`에서 `writeFieldNode(root, value, 'load', option)` 앞에, 청사진이 분기 없음이 아니고 식을 가질 때만 부릅니다. 의존 색인의 생성자 안에 숨기지 않습니다. 생성자가 다른 단위의 캐시를 채우는 숨은 효과가 되기 때문이고(seiri function-boundaries §2), 의존과 식이 없는 청사진에서는 생성자가 아예 불리지 않기 때문입니다(`getDependencyIndex.ts:347-351`이 빈 색인을 돌려줌). 미리 만들지 않은 경로(다른 적재 진입이나 PR-2a 이전)에서는 첫 비적재 선택이 지금처럼 게으르게 만들므로 정확성에는 영향이 없습니다. PR-3의 소유자 분할이 표를 읽을 때도 같은 캐시 질의 `getGateSelectionTable`을 부릅니다. 이것은 결과를 기억하는 질의일 뿐 의미상의 효과가 아닙니다. 청사진은 마운트마다 새로 만들어지는 것이 현행 사양이므로(438C-03) 계획과 표도 마운트마다 만들어집니다. 이렇게 해야 측정기 장면(새 마운트 뒤 첫 쓰기)에서 계획·표 생성의 O(N)이 쓰기가 아니라 마운트에 들어갑니다. 진단의 원인 7(첫 쓰기마다 계획 재생성, N=80 약 66 µs)도 함께 사라집니다. 이것은 (가3)의 한 형태이며 마운트 비용으로 옮겨집니다(9절).

미리 만든 계획이 적재 경로를 바꾸지 않음은 코드로 확인됩니다. 적재에서는 `selectChildren.ts:139-144`와 `primeHost.ts:36-39`가 `cached`를 `null`로 두어 계획을 읽지 않습니다. 비적재의 첫 쓰기에서는 `primeHost`가 지금은 `declareChildren` 전체에서 기준 엔트리를 고르고(`primeHost.ts:48-58`) 계획이 있으면 `direct.baseline`을 씁니다. 직접 계획의 엔트리는 선언이 정확히 하나이므로(`getDirectChildSelectionPlan.ts:77`) "게이트 없는 선언이 하나라도 있음"은 "그 하나가 게이트 없음"과 같고, 순서는 둘 다 `childEntries` 순서이므로 두 기준은 같습니다. PR-1의 특성화 시험이 이 첫 쓰기의 관측(값·순서·배달과 고정·불변식 섹션)을 고정합니다. 다만 계측 방문(visits, `createPlainNode.ts:55`의 `select:` 방문)은 줄어듭니다. 첫 비적재 쓰기에서 `primeHost.ts:48`의 `direct.baseline`과 `selectChildren`의 `direct.steps`가 `declareChildren` 호출을 생략하기 때문입니다. 그래서 PR-2a는 visits 섹션만 재캡처하고 다른 섹션은 바이트 동일을 단언합니다.

**자격 조건입니다(정적).**

| 번호 | 조건 | 근거 |
| --- | --- | --- |
| E1 | 호스트에 직접 계획이 있습니다. 즉 `oneOf`·`anyOf` 분기가 둘 이상이고, 엔트리 이름이 모두 다르며, 엔트리마다 선언 하나·게이트 하나 이하·가상 아님·자식 엔트리와 아이템 없음·노드 자신의 선언과 같은 선언이고, 게이트는 `active`·`appliesWhen` 없음·`hostPath === host.path`·자기 `controls/active` 아님·의존 하나입니다. | `getDirectChildSelectionPlan.ts:57-110` |
| E2 | 게이트 단계의 식에 `equality`가 있으면 그 단계는 표 단계 후보입니다. | 2.1절 |
| E3 | 후보의 감시 경로 `resolveDependencyPath(host.path, dependencies[0])`가 `host.path + '/' + escapeSegment(name)`과 같고, `name`이 계획의 기준 엔트리(게이트 없는 단계)이며 그 노드가 `strategy === 'terminal'`이어야 표 단계입니다. 아니면 표 밖 단계입니다. | 97C-01 (3)의 "그 이름의 엔트리가 하나"는 E1의 이름 유일성으로 충족 |
| E4 | 표 단계가 하나 이상이어야 표를 만듭니다. | — |
| E5 | 루트 선언 표는 호스트가 루트 템플릿이고, 루트의 게이트 가진 선언이 모두 게이트 하나짜리 표 게이트(`appliesWhen` 없음)일 때만 만듭니다. 아니면 루트의 `selectNodeSchema`는 지금 그대로 돕니다. | `selectNodeSchema.ts:27-29` |

**자료 모양입니다.** 같은 감시 키를 읽는 표 단계를 한 묶음(group)으로 둡니다.

```ts
interface GateSelectionGroup {
  readonly watchedName: string;                 // 감시하는 기준 단말 엔트리 이름
  readonly firstGate: BlueprintGate;            // 읽기 경로를 결합할 때 locate에 넘길 게이트
  readonly firstStepIndex: number;              // 비루트 호스트에서 첫 읽기 자리
  readonly buckets: ReadonlyMap<EqualityLiteral, readonly number[]>; // 리터럴 → 오름차순 단계 번호
  readonly literalsByGate: ReadonlyMap<BlueprintGate, ReadonlySet<EqualityLiteral>>; // 검증 모드용
}
interface GateSelectionTable {
  readonly plan: DirectChildSelectionPlan;
  readonly groups: readonly GateSelectionGroup[];
  readonly alwaysSteps: readonly number[];      // 기준 단계와 표 밖 게이트 단계, 오름차순
  readonly stepIndexByName: ReadonlyMap<string, number>;
  readonly tableSteps: ReadonlySet<number>;
  readonly root?: {                              // E5를 만족할 때만
    readonly ungatedIndices: readonly number[];  // 루트 선언 번호, 오름차순
    readonly groups: readonly {                  // 루트 선언 게이트의 감시 키마다 한 묶음
      readonly watchedName: string;              // 감시하는 기준 단말 엔트리 이름
      readonly firstGate: BlueprintGate;         // 읽기 경로를 결합할 때 locate에 넘길 게이트
      readonly buckets: ReadonlyMap<EqualityLiteral, readonly number[]>; // 리터럴 → 오름차순 선언 번호
    }[];
  };
}
```

루트 선언 표도 단계 표처럼 감시 키마다 묶음을 나눕니다. 루트 선언의 게이트가 서로 다른 기준 단말을 읽을 수 있으므로, 단일 칸 맵 하나로는 "묶음마다 그 키의 값으로 칸을 찾는다"(4.3절)를 표현할 수 없기 때문입니다.

한 리터럴이 여러 게이트의 리터럴 집합에 들면 그 단계가 모두 그 칸에 들어갑니다(두 분기가 같은 리터럴을 공유하는 경우). 칸 목록은 생성 때 단계 번호 오름차순으로 정렬해 둡니다. 생성 비용은 O(엔트리 수 + 리터럴 수)입니다.

## 3. 소유자 등록의 변경

### 3.1 분할 소유자의 정의

의존 색인의 게이트 고리(`getDependencyIndex.ts:82-92`)가 넣는 소유자 가운데 다음을 모두 만족하는 것을 **분할 소유자**라고 부릅니다.

- 게이트가 어떤 호스트 표의 표 게이트이고, 소유자 경로가 그 표 단계 엔트리의 선언 경로(`host.path + '/' + name`)입니다.
- 소유자 경로에 와일드카드가 없습니다(배열 아이템 호스트의 분할은 PR-5).
- PR-3a에서는 호스트가 루트(`host.path === ''`)여야 합니다. 루트가 아닌 호스트의 분할은 3.3절의 닻 기제와 함께 PR-3b에서 엽니다.
- `add`가 감시 경로를 접지 않았습니다(`getDependencyIndex.ts:289-301`의 `watched`가 없음).
- 그 소유자 경로가 트라이의 **어느 노드에서도** 분할이 아닌 기여(의존 고리 `:62-69`, 파생 고리 `:70-81`, 표 밖 게이트)로 들어 있지 않습니다. 생성자 끝에서 일반 소유자 경로의 집합을 만들어, 거기에 든 경로의 분할 표시는 모두 지웁니다.

트라이 노드는 지금의 `owners` 배열을 그대로 둡니다(있음 질의 `affectedByPresence`와 파생의 `affected`는 바뀌지 않음). 대신 노드마다 두 배열을 더합니다. `plainOwners`는 `owners`에서 분할이 아닌 항목을 원래 순서로 거른 것이고, `splitBuckets`는 이 노드에 분할 소유자가 있는 호스트 묶음별 `{ hostPath, ranksByName: Map<name, owners 안 순번>, firstRank }`입니다. 순번(rank)은 `owners` 배열 안의 위치입니다.

### 3.2 등록 알고리즘

`DependencyIndex`에 `affectedForRegistration(changedPath, root, sink)`을 더합니다. 이 메서드는 `affected`(`getDependencyIndex.ts:96-142`)와 같은 순서로 트라이를 걷되, 노드마다 다음을 **rank 순서로 합쳐** 내보냅니다.

1. 일반 소유자: 지금처럼 결합·확장한 경로를 내보냅니다.
2. 분할 묶음: 그 묶음의 `firstRank` 자리에서 호스트 경로를 한 번 내보내고, 그 호스트가 살아 있으면(루트에서 `structure`를 따라 찾음, O(깊이)) 호스트의 `structure`에 있는 자식 가운데 이 묶음의 이름을 가진 것을 각자의 rank 자리에서 내보냅니다. 살아 있는 자식 목록은 O(살아 있는 자식 수)로 모아 rank로 정렬합니다.
3. 적중 기록: 정착 문맥의 `splitHitEpochs: Map<SplitBucket, number>`에 이번 등록 세대를 적습니다.
4. 닻(PR-3b, 루트가 아닌 호스트만): 이번 등록에서 새로 "대표되는" 살아 있지 않은 구성원이 있는 정적 런(run)마다, 그 런의 첫 새 구성원의 rank 자리에서 닻 키 하나를 h의 모든 엄격 조상 맵에 넣습니다. 런과 대표의 정의, 닻 키의 모양과 수명은 3.3절에 있습니다.

`registerRecalculation`(`settle/utils/dependencies/registerRecalculation.ts:21-31`)은 게이트가 있는 정착에서 표가 하나라도 있으면 `affected` 대신 이 메서드를 부르고, 내보낸 경로를 지금과 같은 세 동작으로 처리하되 분할 소유자와 호스트 경로는 다음과 같이 다룹니다.

| 내보낸 것 | `dirtyPaths` | `dependencyOwnerPaths` | `shapeDirtyPaths` |
| --- | --- | --- | --- |
| 일반 소유자 p | 넣음(지금과 같음) | 넣음 | p의 부모(지금과 같음) |
| 분할 묶음의 호스트 h | 넣음 | 넣지 않음 | h |
| 살아 있는 분할 소유자 p | 넣음, `splitMarks.set(p, 세대)` | 넣지 않음(3.4절의 술어가 답함) | p의 부모 = h(이미 넣음) |

등록 세대 `registrationEpoch`는 `registerRecalculation`이 불릴 때마다 하나 올립니다. 호출 자리 여섯(`writeFieldNode.ts:146`, `transitionSettlement.ts:206`, `restoreSourceB.ts:49`, `releaseWrongKindHosts.ts:34`, `runDeriveRounds.ts:126`, `arrangeFieldNodeItems.ts:170`) 모두에 같은 규칙이 걸립니다. 표가 없는 청사진은 지금의 `affected` 경로를 그대로 써서 비용이 바뀌지 않습니다.

### 3.3 형상 dirty와 dirty 집합이 어떻게 같은가

**형상 dirty 집합은 같습니다.** 지금 코드에서 분할 소유자 p가 형상 dirty에 기여하는 길은 셋입니다. (a) `registerRecalculation.ts:28-30`이 p의 부모 h를 넣습니다. 새 경로도 h를 넣습니다. (b) `:51-52`의 `mayChangeAt(p)`는 p를 평가 위치로 가진 발생을 봅니다. 발생의 평가 위치는 그 게이트 호스트 경로와 읽기 경로의 가장 낮은 공통 조상이므로 호스트 경로 자신이거나 그 조상입니다(`settle/utils/gates/resolveGateOccurrence.ts:22-49`). 호스트 경로가 p인 게이트는 p 아래에 선언된 게이트이거나 p 엔트리의 자기 `controls/active`뿐인데(`getGateRegistry.ts:126-152`), 분할 소유자는 E1에 따라 자식 엔트리가 없는 잎이고 자기 active 게이트도 없습니다. 그래서 p를 평가 위치로 삼는 발생이 없고 이 질의는 늘 거짓입니다. (c) `:53-63`의 `mayChangeOwnDeclarationAt(p)`가 참이면 h를 넣습니다. h는 이미 들어 있습니다. 따라서 매 등록 직후의 형상 dirty 집합은 지금과 같고, 97C-01 (4)의 "매 호출의 누적 집합에 대한 질의"와 그 결과도 같습니다.

**dirty 집합의 차이는 정확히 "살아 있지 않은 분할 소유자"입니다.** 일반 소유자와 살아 있는 분할 소유자는 지금처럼 들어갑니다. 조상 확장(`registerRecalculation.ts:32-40`)은 h가 들어 있으므로 h의 조상을 지금과 같이 넣습니다.

**부모 색인의 순서입니다(검증 발견 1로 고친 부분).** 게이트 정착의 `DirtyPathSet.add`는 경로 전체를 그 경로의 모든 엄격 접두 맵에 열쇠로 넣고(`DirtyPathSet.ts:71-86`), 그 열쇠는 그 경로를 지울 때만 빠집니다(`:101-110`). `dirtyChildren(x)`은 x의 맵에서 각 자식 이름이 처음 나온 순서로 살아 있는 자식을 돌려줍니다(`dirtyChildren.ts:19-31`). 지금 코드에서 살아 있지 않은 분할 소유자 p의 열쇠는 계산할 노드가 없으므로 정착 내내 남습니다. 그 열쇠는 h의 모든 엄격 조상 x의 맵에서 "h 쪽 이름"의 자리를 붙잡습니다. 열쇠를 빼기만 하면 h를 계산해 h 자신의 열쇠가 지워진 뒤 `dirtyChildren(x)`의 결과가 달라질 수 있습니다. 첫 판의 "부모 색인의 순서도 같다"는 이 점에서 틀렸습니다.

검증자의 실패 장면은 실행으로 확인한 다음 꼴입니다(`experiments/revival-scene.md` 3절). 루트 아래에 표 호스트 h와 표 밖 호스트 g를 둡니다. h는 `kind`(기본값 `'none'`)와 `./kind === 'a'`·`'b'` 두 분기(`ha`·`hb`, 기본값 있음)를 가지므로 처음에는 어느 분기도 켜지 않습니다. g는 `type`을 `derived: "../../h/kind === 'b' ? 'y' : 'x'"`로 얻고, 분기 게이트가 `['x'].includes(./type)`·`['y'].includes(./type)` 목록 포함 꼴이라 표 밖입니다. `/h/kind`에 `'b'`를 한 번 씁니다. 지금 코드에서는 한 번도 살아 있지 않은 분할 소유자 `/h/ha`의 묵은 열쇠가 루트 맵에서 h의 자리를 맨 앞에 붙잡아, 파생 패스와 전이 패스의 계산 순서가 모두 [h, g]입니다. 그 열쇠를 빼면 두 패스 모두 [g, h]가 됩니다.

갈리지 않는 꼴도 실행으로 확인했습니다. 이 꼴들은 고정물로 쓰면 변이 V7을 잡지 못합니다.

- **h가 켜진 분기에서 출발하면 갈리지 않습니다.** 나가는 분기의 페이로드는 등록 때 살아 있었으므로 새 경로에서도 dirty로 남아 h의 자리를 붙잡습니다.
- **루트 일괄 쓰기로 h와 g를 함께 바꾸면 갈리지 않습니다.** 그 등록에서 g의 나가는 페이로드 열쇠가 `/h/ha`보다 먼저 들어가고, 그 열쇠는 두 코드 모두에 남습니다. 그래서 위 고정물은 g의 전환을 h 쓰기 뒤의 파생 라운드로 미룹니다. 계산 순서가 바뀌면 `changedNodes`·`stateDirtyNodes`·`entered`의 삽입 순서와 경고 작업 순서가 달라집니다(`settle/utils/commit/commitGlobalState.ts:31-34`, `settle/utils/commit/markCommitDeliveries.ts:65-93`, `settle/utils/commit/commitSettlement.ts:191`). 그래서 순서를 지키는 방법을 호스트 종류로 나눕니다. 관측 불가 증명(검증 발견 1의 (b))은 이 장면에서 성립하지 않으므로 택하지 않습니다.

- **루트 호스트(PR-3a)는 닻이 필요 없습니다.** h가 `''`이면 엄격 조상이 없으므로 "h 쪽 이름"의 자리를 붙잡는 조상 맵이 없습니다. 분할 소유자 p의 열쇠가 들어가는 맵은 `''`의 맵뿐이고, 거기서 p의 값은 p 자신의 이름입니다. p가 살아 있지 않은 동안 `dirtyChildren('')`은 그 이름을 `structure`로 거릅니다(`dirtyChildren.ts:23-29`). p가 진입하거나 되살아나면 같은 단계 안에서 `selectChildren.ts:401-404`가 곧바로 계산해 열쇠를 지웁니다. 진입·되살림과 그 계산 사이에는 `dirtyChildren` 호출이 없으므로 새 열쇠의 자리가 관측될 틈이 없습니다. 따라서 루트 호스트에서는 `dirtyChildren` 여섯 호출 자리(`47de7a441`의 `computeNode.ts:88,116,127,200,246`, `canSkipGateWheel.ts:29`; HEAD 번호는 1.3절)의 결과가 구성원과 순서 모두 같습니다. 측정 고정물은 이 경우입니다.
- **루트가 아닌 호스트(PR-3b)는 닻 키로 자리를 지킵니다(검증 발견 1의 (a)).**
  - **정적 런입니다.** 트라이 노드의 `owners` 배열에서 한 묶음의 분할 구성원이 잇달아 놓이고 그 사이에 h 아래가 아닌 소유자가 끼지 않은 최대 구간을 런 하나로 정합니다. 색인 생성 때 정하며 보통 묶음당 런 하나입니다. 한 등록 안에서 한 런의 새 열쇠는 다른 이름의 열쇠가 끼지 않은 채 잇달아 들어갑니다. 그래서 조상 맵에서 그 런이 차지하는 "h 쪽 이름"의 자리는 런의 가장 앞 새 열쇠 하나로 대표됩니다. 런의 앞 구성원이 계산되어 빠져도 다음 구성원과의 사이에 다른 이름의 열쇠가 없으므로 이름 순서는 그대로입니다.
  - **대표입니다.** 등록이 묶음을 적중할 때, 지금 코드가 그 등록에서 새 열쇠를 넣었을 구성원을 "새로 대표된다"고 합니다. 처음 적중 때는 런 구성원 가운데 살아 있는 것을 뺀 모두이고, 개수는 정적 런 크기에서 살아 있는 수를 빼서 셉니다. 그 뒤 적중 때는 직전 적중 뒤 계산으로 지워진 구성원 가운데 지금 살아 있지 않은 것만입니다. 지워진 구성원은 `DirtyPathSet.delete`의 고리가 분할 소유자 정적 표로 알아보아 묶음별 "풀린 집합"에 적어 둡니다. 살아 있는 구성원은 3.2절대로 진짜 열쇠로 들어갑니다. 있음 등록 같은 다른 길로 이미 진짜 열쇠가 있는 비생존 구성원을 대표로 세어도 결과는 같습니다. 더 앞의 진짜 열쇠가 자리를 정하고, 닻의 수명은 그 구성원이 지워질 때 함께 줄기 때문입니다.
  - **닻 키입니다.** 런마다, 새로 대표된 첫 구성원의 rank 자리에서 키 하나를 h의 엄격 조상 x 각각의 맵에 넣습니다. 키는 `'\u0000' + h + '\u0000' + 세대 + '\u0000' + 런 번호`이고, 값은 x에서 h 쪽으로 가는 이름입니다. **값은 그 조상 맵의 실제 열쇠가 갖는 것과 같은 escape된 이름이어야 합니다**(`DirtyPathSet.ts:76-83`이 escape된 경로 조각을 값으로 넣고, `dirtyChildren.ts:22`가 `unescapeSegment`로 풂). 실제 열쇠는 모두 엄격 자손 경로라 `/`로 시작하므로 겹치지 않습니다. 닻은 집합 구성원이 아니므로 `has`가 거짓이고, h 자신의 맵에는 넣지 않습니다.
  - **수명입니다.** 닻마다 대표 구성원 수를 세고, 대표 구성원이 지워질 때마다(그 자리의 살아 있는 노드를 계산할 때) 하나씩 줄입니다. **감소는 "구성원 경로 → 닻" 맵으로 찾은 대표 구성원에게만 일어납니다.** 대표가 아닌 살아 있는 구성원(3.2절에서 진짜 열쇠로 들어간 구성원)이 지워질 때 닻 수를 줄이면 닻이 일찍 사라지기 때문입니다. 대표 구성원이 지워지면 그 맵에서도 뺍니다. 0이 되면 모든 조상 맵에서 닻을 지웁니다. 지금 코드에서 그 런의 열쇠가 모두 사라지는 때와 같습니다. 정착 끝의 비움(`releaseSettlementScratch.ts:27-29`)은 맵과 함께 닻도 지웁니다.
  - **결과입니다.** 모든 조상 맵에서 각 이름이 처음 나오는 순서가 지금 코드와 같으므로, `dirtyChildren` 여섯 호출 자리의 결과가 구성원과 순서 모두 같습니다. 셋째 소비자인 `computeNode.ts:127-133`의 `computed.has(child)`도 같은 후보 목록을 받으므로 조상 바퀴로 가는 판정이 같습니다. `canSkipGateWheel`의 생략 판정과 실행되는 확인 바퀴 수도 같습니다. 첫 판이 적었던 "중첩 호스트에서 확인 바퀴 생략이 늘 수 있다"는 이 기제로 없어지며, 그 문장은 지웠습니다. h 자신의 맵에 닻을 두지 않아도 되는 까닭은 루트 호스트와 같습니다.
  - **비용입니다.** 적중마다 O(런 수 × h의 깊이 + 살아 있는 구성원 수 + 풀린 구성원 수)이며 분기 수와 무관합니다.
  - **배열 소비자입니다.** 튜플 위치는 와일드카드 없는 경로(`/arr/0`)로 만들어지므로(`blueprint/buildNodes/utils/children/populateNodeChildren.ts:255-260`) 와일드카드 없는 비루트 호스트도 배열 조상을 가질 수 있습니다. 그래도 닻은 배열 쪽 판정에 닿지 않습니다. 배열 부모 색인을 읽는 셋(`canReuseAppendedChild.ts:30`, `canReuseSplicedChildren.ts:30`, `canReuseTruncatedChildren.ts:25`)이 모두 게이트 정착에서 먼저 빠지기 때문입니다. 배열 아이템 호스트를 여는 PR-5에서 이 셋을 다시 확인합니다.

**h 자신의 열쇠입니다.** 3.2절은 h를 묶음의 첫 rank 자리에서 집합에 넣고, 지금 코드는 조상 확장 때 넣으므로 h 열쇠의 삽입 시점이 다릅니다. 그러나 조상 맵에서 "h 쪽 이름"의 자리는 같은 rank 시점의 구성원 열쇠(지금)와 h 열쇠·닻(새 경로)이 정합니다. 대표 구성원은 잎이라 부모 h의 선택 안에서만 계산되므로, h의 열쇠가 남아 있는 동안에는 닻도 남아 있습니다. 그래서 h 열쇠의 삽입 시점 차이는 관측되지 않습니다. h는 자기 맵에는 들어가지 않습니다(`DirtyPathSet.ts:72-86`은 엄격 접두에만 넣음).

**확인입니다.** 검증 모드 S3는 정착 전체에 걸쳐 그림자 `DirtyPathSet`을 둡니다. 그림자는 실제 집합의 모든 추가·삭제를 따라 하고, 등록 때는 지금 알고리즘(`affected` 전체)대로 넣습니다. 매 `dirtyChildren` 호출에서 그림자의 결과와 실제 결과를 견줍니다(5.1절 I6). 위 실패 장면은 PR-1의 특성화 묶음과 PR-3b의 시험 고정물로 두며, 파생 패스와 전이 패스의 루트 계산 순서가 모두 [h, g]임을 단언합니다.

### 3.4 진입·되살림 보충 규칙과 소유자 술어

**걱정한 공백입니다.** 지금은 살아 있지 않은 분할 소유자 p가 등록 때 dirty에 들어갑니다. 분할 뒤에는 이 삽입이 없으므로, 첫 판은 p가 퇴장 대기에서 되살아날 때(HEAD `selectChildren.ts:334-348`) dirty가 아니어서 `:408-409`에서 계산되지 않는 공백을 걱정했습니다. 진단(수정 가설 (다2))과 첫 판은 이것을 "진입 자식의 dirty 공백"이라 불렀으나 진입에 대해서는 틀렸습니다(검증 발견 3). 진입하는 잎은 `enterFieldNode.ts:48-59` → `markWrite.ts:72`, 또는 분배 입력이 없을 때 `restoreLatentState.ts:31-33,56`으로 이미 dirty가 됩니다. 진단 문서의 그 문장은 진단 작성자의 파일이므로 고치지 않았습니다.

**되살림의 dirty 공백도 생기지 않습니다(실행 확인).** 되살아나는 p는 지금 코드와 새 경로 모두에서 보충 이전에 이미 dirty입니다. 근거는 다음과 같습니다(줄 번호는 HEAD `394c284a7`).

1. **p가 퇴장하려면 감시 키 값이 p가 선택된 뒤 바뀌어야 합니다.** 감시 노드는 기준 단말이라 바퀴 첫 라운드 전에 `initialDirty`에서 계산되고(`computeNode.ts:172-174`), 바퀴 안에서는 다시 바뀌지 않습니다. 그래서 값은 계산 패스와 계산 패스 사이의 원시값 쓰기(쓰기, 자동 쓰기, 파생)로만 바뀝니다.
2. **모든 루트 계산 앞에 등록이 돕니다.** 호출 자리 여섯(`writeFieldNode.ts:146-147`, `runDeriveRounds.ts:126-128`, `transitionSettlement.ts:206-208`, `restoreSourceB.ts:49-50`, `releaseWrongKindHosts.ts:34-35`, `arrangeFieldNodeItems.ts:170-171`)이 모두 그렇습니다. 문맥 변경(`changeFieldNodeContext.ts:54`)은 원시값을 바꾸지 않습니다. 등록은 누적된 `changedRaw` 전체를 질의하므로(`registerRecalculation.ts:21`) 감시 키 쓰기 뒤의 모든 등록이 p의 묶음을 적중합니다. 조상의 원시값 쓰기도 `affected`가 그 아래 트라이를 모두 걸으므로 적중합니다(`getDependencyIndex.ts:134-140`).
3. **그러므로 p를 퇴장시키는 계산 패스 직전의 등록은 p가 살아 있을 때 p를 적중합니다.** 구조는 직전 계산 패스의 결과이기 때문입니다. 지금 코드도 새 경로(3.2절 표의 "살아 있는 분할 소유자")도 이때 p를 dirty에 넣습니다.
4. **그 등록과 퇴장 사이에 p는 계산되지 않습니다.** 호스트가 형상 dirty이므로(`registerRecalculation.ts:28-30`) 바퀴 경로로 가고, `primeHost`가 구조를 게이트 없는 엔트리로 되돌린 뒤(`primeHost.ts:111`) `initialDirty`를 구하므로 p는 그 목록에 없습니다. 꺼진 엔트리 처리(`selectChildren.ts:218-251`)와 퇴장 등록(`:461-480`)도 p를 계산하지 않습니다.
5. **dirty 열쇠는 그 자리의 살아 있는 노드를 계산할 때만 빠집니다**(`computeNode.ts:84,97,113,149,251,260,266`, `computeStableNode.ts:28`). 게이트 정착에는 정착 도중 비움이 없고(`transitionSettlement.ts:180`은 게이트 없는 정착에서만 닿음), `restoreSourceB`도 dirty 집합을 비우지 않습니다(`restoreSourceB.ts:45-49`).

따라서 p는 dirty인 채로 퇴장하고, 되살아나 계산될 때까지 dirty로 남습니다. 두 실행 고정물이 이를 보입니다. 설계자의 수렴 장면(`experiments/revival-scene-converging.md`)에서는 되살림 직전 루트 선택에서 `/pb`가 dirty였고, 검증자의 진동 장면(`experiments/revival-scene.md` 1절)에서는 대기 중의 등록이 "이미 있어 새로 넣지 않음"으로 기록되었습니다. 이 논증은 루트 호스트(PR-3a)에 대해 위 인용으로 닫히고, 루트가 아닌 호스트(PR-3b)에도 같은 단계가 그대로 적용됩니다.

**규칙은 방어로 남기며 결과를 바꾸지 않습니다.** 아래 규칙은 위 논증이 미래의 변경으로 깨질 때를 막는 값싼 방어입니다. 지금 엔진에서는 조건이 참일 때도 이미 든 열쇠를 다시 넣을 뿐이므로 dirty 집합, 계산 순서, 관측 어느 것도 바꾸지 않습니다. 진입에서도 도는 까닭은 `splitMarks`를 적어 두어, 같은 정착에서 계산된 뒤 나갔다가 되살아날 때 규칙이 표시와 어긋나지 않게 하려는 것입니다.

**규칙입니다.** `selectChildren`에서 자식 `child`가 정해진 직후(`:335` 다음), 그 자식이 새로 들어오거나 되살아나는 경우에만 다음을 합니다.

> p = `child.path`가 이 호스트 표의 분할 소유자이고, `lastHit = splitHitEpochs.get(p의 묶음)`이 있으며, `lastHit > (splitMarks.get(p) ?? -1)`이면 `dirtyPaths.add(p)`와 `splitMarks.set(p, lastHit)`를 합니다.

**검증 모드 S4입니다.** 분할 소유자가 진입하거나 되살아날 때, 규칙을 적용하기 **전에** `dirtyPaths.has(p)`가 참임을 단언합니다. 또 규칙이 실제로 새 열쇠를 넣은 횟수(`add` 전후 크기 차이)를 세어 정착 끝에 0임을 단언합니다. 이 단언이 깨지는 입력이 나오면 그것이 규칙이 실제로 필요하다는 첫 증거이며, 그때 아래 논증으로 규칙의 결과가 지금 코드와 같음을 다시 확인합니다.

**규칙의 결과가 지금 코드와 같은 이유입니다(방어 논증).** 지금 코드에서 등록으로 생긴 p의 dirty는 "p를 적중한 등록 R이 있고, R 뒤에 p 자리의 살아 있는 노드가 계산되지 않았다"와 같습니다. p의 삭제는 그 자리의 살아 있는 노드를 계산할 때만 일어나기 때문입니다(`computeNode.ts:83,96,112,148,276,285,291`).

- R 때 p가 살아 있었으면 3.2절이 p를 넣고 `splitMarks`를 R의 세대로 적습니다. 그 노드가 계산되면 두 경로 모두에서 p가 빠지고, 뒤의 되살림에서 `lastHit`가 표시와 같으므로 다시 넣지 않습니다. 계산되지 않았으면 p는 두 경로 모두에 남아 있습니다.
- R 때 p가 살아 있지 않았으면 지금 코드는 p를 넣었고 그 뒤 지울 노드가 없었습니다. 새 경로는 처음 들어오거나 되살아날 때 `lastHit > 표시`이므로 넣습니다.
- 같은 정착에서 들어와 계산된 뒤 나가고 다시 되살아나는 경우, 첫 진입에서 표시가 `lastHit`가 되므로 둘째에는 넣지 않습니다. 지금 코드도 첫 계산에서 지운 뒤 다시 넣지 않습니다.
- `restoreSourceB`는 `changedRaw`를 줄입니다(`settle/utils/transition/restoreSourceB.ts:45-46`). 줄어든 등록이 p를 적중하지 않으면 `lastHit`가 올라가지 않으므로, 앞에서 계산된 p를 다시 넣지 않습니다. 지금 코드도 다시 넣지 않습니다.
- 게이트 정착에서 정착 도중 `dirtyPaths.clear()`가 불리는 자리는 없습니다. `transitionSettlement.ts:180`은 `context.initialOutputs`가 있을 때만 닿고, 그것은 `!context.hasGates`일 때만 만들어집니다(`computeNode.ts:61-73`). 정착 끝의 비움(`releaseSettlementScratch.ts:27-29`)은 새 문맥 필드도 함께 비웁니다. 검증 모드는 게이트 정착의 정착 도중 비움이 없음을 단언합니다.

**소유자 술어입니다.** `dependencyOwnerPaths`는 `has`로만 읽힙니다(`settle/utils/compute/publishStateKeys.ts:25`, `settle/utils/commit/commitExitPolicyValues.ts:81`). 두 자리를 `isDependencyOwner(context, path)`로 바꿉니다. 이 함수는 `dependencyOwnerPaths.has(path)`이거나 path가 분할 소유자이고 그 묶음이 `splitHitEpochs`에 있으면 참입니다. 지금 코드에서 분할 소유자 p가 이 집합에 드는 조건은 "어떤 등록이 p의 감시 경로와 교차했다"이고, 이 집합은 정착 도중 줄지 않으므로(`restoreSourceB`도 비우지 않음) 두 판정은 같습니다. 있음 등록(`registerPresenceChanges.ts:101-102,130`, `flushPresenceTemplates.ts:46-47,74`, `publishPresenceOwner.ts:15`)은 지금처럼 실제 집합에 넣습니다.

### 3.5 바뀌지 않는 것

- 있음 질의(`affectedByPresence`, `getDependencyIndex.ts:152-210`)는 `owners` 전체를 지금 순서로 돕니다. #431의 등록은 그대로입니다.
- 파생 원천 수집(`settle/utils/derivation/collectDeriveSourcePaths.ts:20`)은 `affected`를 그대로 씁니다. 파생이 있는 폼에서는 이 자리의 O(N)이 남습니다(9절 잔여 목록).
- 문맥 소유자 등록(`settle/utils/context/changeFieldNodeContext.ts:43-51`)은 `@` 읽기이므로 표와 관계가 없습니다.

## 4. 선택 단계의 변경

### 4.1 한 바퀴의 알고리즘(표 호스트)

PR-1에서 `selectChildren.ts:159-407`의 단계 본문을 함수 하나(`selectEntryStep`)로 뽑아, 지금의 고리와 새 고리가 **같은 코드**를 부르게 합니다. 바뀌는 것은 "어느 단계를 부르는가"뿐입니다.

호스트 바퀴의 한 라운드(`computeNode.ts:210-288`의 한 번)에서 다음 조건이 모두 맞으면 표 경로를 씁니다. 하나라도 어긋나면 그 라운드 전체(루트의 `selectNodeSchema`와 `selectChildren`)를 지금 경로로 돕니다.

| 번호 | 실행 조건 | 까닭 |
| --- | --- | --- |
| G1 | `context.kind !== 'load'`이고 직접 계획을 쓰는 경우(`selectChildren.ts:139-152`와 같은 조건)이며 표가 있습니다. | 적재는 PR-6 전까지 지금 경로 |
| G2 | 내부 스위치 `gateSelectionTable.mode !== 'off'` | 차등 시험의 기준 실행 |
| G3 | 루트부터 호스트까지 모든 노드의 `raw === undefined` | `readProjectedValue.ts:42-56`의 wrong-kind 조상 공표·`undefined` 반환을 피함 |
| G4 | 감시 단말 경로가 라운드 시작 때 dirty가 아님 | 9번 단계(`computeNode.ts:200-202`)에서 이미 계산됨 |

**읽기 자리입니다.** 루트는 `selectNodeSchema`의 첫 표 게이트 자리(선언 고리의 시작), 비루트 호스트는 `firstStepIndex` 단계 직전에 묶음마다 한 번 읽습니다. 읽기는 `evaluateGate.ts:44-46,140-153`이 하던 일을 그대로 한 번 합니다. 즉 `getGateRegistry(...).locate(host, group.firstGate)`로 결합한 `watchPaths[0]`을 얻고, `readProjectedValue(context, path)`로 값을 읽고, `recordGateInput(context, path, v, 'value')`로 증인 프레임에 적습니다. 값은 정착 문맥의 호스트별 칸(`Map<host, { round, values }>`)에 두어 같은 라운드의 `selectChildren`이 다시 씁니다.

**방문 집합입니다.** 라운드 시작에 다음을 계산합니다.

- A = `alwaysSteps`(기준 단계와 표 밖 게이트 단계, 늘 방문) ∪ 묶음마다 `buckets.get(v)`(켜진 표 단계)
- R(퇴장·정리) = 다음 넷에 해당하는 표 단계
  1. 이름이 `prior`에 있고 그 자식의 청사진 노드가 엔트리 노드와 같음(`selectChildren.ts:219-224`)
  2. 이름이 라운드 시작의 `node.structure`에 있음(`:237-249`)
  3. `pendingExits`에 `[host.path + '/' + name, 엔트리 노드 식별자]` 열쇠가 있음(`:225-232`). PR-2b에서는 (가1)이 #435로 넣은 `context.pendingExitPaths`(자식 경로 → 개수)를 훑어 부모가 이 호스트인 경로만 고르고, 그 이름의 단계에 대해 JSON 열쇠로 정확히 확인합니다. 비용은 O(정착 전체의 대기 퇴장 경로 수)입니다. PR-2d에서 이 색인을 호스트 경로 → 자식 경로 → 개수의 두 층으로 넓혀 O(그 호스트의 대기 퇴장 수)로 줄입니다. 유지 자리는 `pendingExits`를 바꾸는 다섯 곳 전부입니다(`selectChildren.ts:337`, `:467`, `primeHost.ts:73`, `transition/finalizePerished.ts:58`, `scratch/releaseSettlementScratch.ts:14`). (가1)의 경로 색인을 같은 자리에서 이 모양으로 넓힙니다.
  4. `context.distributedInputs.has(node)`이고, 분배 입력이 일반 객체이며 이름이 그 입력의 자기 문자열 키(`Object.getOwnPropertyNames`)에 있음(`:237`, `:410-453`; 판정 함수 `settle/utils/input/hasDistributedChildInput.ts:28`)
- 방문 순서 V = A ∪ R를 단계 번호 오름차순으로 합칩니다. A의 두 목록은 미리 정렬되어 있고 R는 작으므로 합치기는 O(|A| + |R| log |R|)입니다. 비루트 호스트는 `firstStepIndex`보다 앞선 단계(표 단계가 없음)를 먼저 처리하고, 읽기를 한 뒤 나머지를 합쳐 처리합니다. R는 앞선 단계의 처리로 바뀌지 않습니다(앞선 단계는 자기 이름의 `next`·`pendingExits` 항목만 바꿈).

V의 단계마다 `selectEntryStep`을 부릅니다. 표 단계의 `admitted`는 평가 대신 "그 단계가 칸 목록 `buckets.get(v)`에 있는가"이고, `threw`는 늘 거짓입니다(인식한 식은 던질 수 없음: `===`와 `||`는 사용자 코드를 부르지 않고, 의존 배열 원소 읽기도 던지지 않음). 표 밖 게이트 단계는 지금처럼 `evaluateGate`로 평가합니다. 고리가 끝나면 `selectChildren.ts:409-486`은 바뀌지 않은 채 돕니다. 꺼진 엔트리의 분배 고리(`:410-453`)는 첫 고리에서 모인 `inactiveEntries`만 돌므로 자연히 R의 4번 항목만 처리합니다.

### 4.2 방문하지 않는 단계가 아무것도 바꾸지 않는 이유

V에 없는 단계는 표 단계이고 A에 없으므로 꺼진 엔트리입니다(기준 단계와 표 밖 단계는 늘 A에 있음). 지금 코드에서 꺼진 엔트리의 본문(`selectChildren.ts:218-250`)과 둘째 고리(`:410-453`)가 하는 일을 줄마다 보면 다음과 같습니다.

| 줄 | 하는 일 | V 밖에서 일어나지 않는 까닭 |
| --- | --- | --- |
| `:219-232` | 퇴장하는 자식 찾기 | R의 1·3번이 아니므로 `prior`에 같은 노드가 없고 대기 퇴장 열쇠도 없어 `exiting`이 `undefined`입니다. |
| `:233-236` | 던진 게이트 퇴장 표시 갱신 | `exiting`이 없으므로 일어나지 않습니다. 97C-01 (1)의 "던진 게이트로 나간 표시의 구성원"은 그 노드가 `prior`나 `pendingExits`에 있을 때만 생기므로 R의 1·3번에 포함됩니다. |
| `:237-238` | `inactiveEntries`에 넣기 | `next[name]`이 없고(R의 2번이 아님; `next`는 라운드 중 자기 이름 단계만 채움), 분배가 있어도 둘째 고리에서 `hasDistributedChildInput`이 거짓이라 아무것도 하지 않습니다(R의 4번이 아님). |
| `:239-249` | 구조에서 지우기와 대기 출력 표시 | `next[name]`이 없으므로 일어나지 않습니다. |
| `:410-453` | 꺼진 엔트리의 입력을 잠복으로 분배 | 위와 같이 입력 키가 없으므로 `:420-428`에서 넘어갑니다. |

공유 고리 상태에 대한 영향도 없습니다. `seen`은 켜진 단계(`:271`)와 둘째 고리(`:418`)에서만 바뀌는 `selectChildren` 안의 지역 변수라 함수 밖에서 관측되지 않고, `changed`는 지우기(`:245`)에서만 바뀌며, 이름이 유일하므로(E1) 다른 단계의 판정에 닿지 않습니다. 반대로 V가 필요한 것보다 큰 것은 늘 괜찮습니다. 방문한 단계는 지금과 같은 본문을 같은 순서로 실행하기 때문입니다.

### 4.3 루트 선언 선택(`selectNodeSchema`)

E5를 만족하면 `selectNodeSchema.ts:27-29`의 거르기를 다음으로 바꿉니다. 활성 선언 = `root.ungatedIndices` ∪ `root.groups`의 묶음마다 그 묶음의 감시 키 값 v로 찾은 `group.buckets.get(v)`를 선언 번호 오름차순으로 합친 목록입니다. 지금의 `filter`는 선언 순서를 지키고, 게이트가 하나뿐인 선언에서 `every`는 그 게이트의 판정과 같으므로 목록이 같습니다. 경고 계산(`:30-63`), `selectedDeclarationIds`(`:64-67`, 지금처럼 새 배열), 유효 스키마(`:68-72`), 루트 `active`(`:84-89`)는 같은 목록으로 그대로 돕니다. 유효 스키마 메모 열쇠를 만드는 O(선언 수)(`selectEffectiveDeclarations.ts:24-38`)는 PR-4d에서 칸별 메모로 없앱니다. `mergeEffectiveSchema`는 같은 ID 내용에 같은 참조를 돌려주므로(`mergeEffectiveSchema.ts:46-48`) 칸별 메모는 같은 참조를 냅니다.

### 4.4 같아야 하는 관측과 그 자리

| 관측 | 지금 정하는 자리 | 표 경로에서 같은 이유 |
| --- | --- | --- |
| 자식 순서와 `structure` | `primeHost.ts:106-113`의 기준, `selectChildren.ts:396`의 삽입, `:471-485`의 조립 | `next`의 삽입은 켜진 단계에서만 일어나고 켜진 단계는 모두 같은 순서로 방문합니다. 지우기는 R의 2번에서만 일어납니다. |
| 노드 이벤트와 배달 순서(EVENT-005) | `changedNodes` 삽입(`:375`, `:486`, 자식 계산), `captureFieldNodeChange` | 같은 노드를 같은 순서로 계산하고 같은 줄을 실행합니다. 방문하지 않은 단계는 이 집합에 닿지 않습니다(4.2절). |
| 퇴장 대기 | `:454-470` | 바뀌지 않은 코드가 `prior` 이름을 돕니다. |
| 던진 게이트 퇴장 | `:233-236`, `:255-256` | 4.2절 표의 둘째 줄. 표 밖 게이트는 지금처럼 평가하고 던집니다. |
| 옮긴 게이트 | `computeNode.ts:190-197`, `:252-261` | 표는 게이트 목록과 그 갱신을 바꾸지 않습니다. |
| 있음 등록(#431) | `selectChildren.ts:277-278`, `:459`, `computeNode.ts:240-243` | `presenceHosts`에 넣는 줄은 켜진 단계와 직전 이름 고리에만 있습니다. |
| 바퀴 상한(SETTLE-017) | `computeNode.ts:205,260`, `getGateBudgetCap.ts:73-93` | 게이트 목록이 같으므로 상한이 같습니다(97C-01 (5)). |
| 확인 바퀴 생략(결정 58) | `canSkipGateWheel.ts:26-51` | 증인 프레임의 입력은 같은 열쇠 `/kind`에 같은 값 하나이고, 지금도 같은 라운드의 반복 읽기는 같은 값이라 `consistent`가 참입니다. `gateCount`와 `throwVersion`도 같습니다. |
| 그림자 확인(`gateWheelEvaluation.mode === 'shadow'`) | `evaluateGate.ts:218-223`, `verifyGateWheelConfirmation.ts:16-33` | 이 모드에서만 표 경로가 모든 단계를 순서대로 돌며 표 단계의 평가 기록(게이트, 소유자 경로, `edgeName` 없음, 칸 판정)을 지금 위치에 넣습니다. 표 밖 게이트는 실제 평가가 기록합니다. 이 모드의 O(N)은 시험 전용입니다. |
| 오류와 실패 기록 | `recordSettlementFailure` 호출 자리 | 표 단계는 던지지 않고 E1의 엔트리는 선언 하나라 형 충돌이 없습니다. 표 밖 게이트의 예외 처리는 그대로입니다. |
| 레지스트리 발생 | `getGateRegistry.ts:168-198` | 첫 읽기의 `locate`가 호스트를 등록합니다. 그 뒤 같은 라운드에서 호스트 경로의 등록이 바뀌는 길이 없고(자식 등록은 다른 경로), 호스트 등록이 모든 자식 엔트리 게이트와 자기 선언 게이트를 이미 넣으므로(`:126-153`) 생략한 자리의 `locate`는 늦은 추가를 하지 않습니다. |

### 4.5 쓰기 패스와 전이 패스의 바퀴

- **W1(쓰기 패스)**: 루트 선언은 칸 조회(선언 수와 무관), 단계 방문은 기준 2 + 새 분기 3 + 직전 분기 3(R의 1번)입니다. 직전 분기 셋은 `:454-470`에서 퇴장 대기가 됩니다.
- **W3(전이 패스)**: `primeHost`가 다시 기준으로 되돌리므로 자식 바뀜이 생기는 것은 지금과 같습니다. 단계 방문은 기준 2 + 새 분기 3(기본값이 채워져 dirty이므로 계산) + 퇴장 대기 3(R의 3번)입니다. 확인 바퀴 둘은 지금처럼 결정 58이 생략합니다.

### 4.6 경우별 동작

| 경우 | 표 경로의 동작 | 같음의 근거 |
| --- | --- | --- |
| 판별 값이 어느 리터럴에도 없음 | A = 기준과 표 밖 단계, R가 직전 분기를 퇴장시킴 | `Map.get`과 `===`의 같음(2.1절) |
| 두 분기가 한 리터럴을 공유 | 칸에 두 분기 단계가 오름차순으로 들어 있어 둘 다 켜짐. 루트의 다중 활성 경고도 같은 목록에서 나옴 | `selectNodeSchema.ts:30-63`이 같은 `active`를 받음 |
| 분기 게이트가 표 밖 식 | 그 단계는 `alwaysSteps`에 들어 매 라운드 평가 | 지금과 같은 호출 |
| 호스트가 배열 아이템 | 아이템 템플릿에 표가 있으면 선택은 표 경로. 읽기 경로는 `locate`가 아이템별로 결합(`/items/3/kind`). 소유자 분할은 PR-5부터 | `getGateRegistry.ts:376-396`의 결합 |
| 같은 값 쓰기 | 등록·바퀴가 없음(지금과 같음) | `markWrite.ts:66-71` |
| 루트 일괄 setValue(판별 키와 페이로드 함께) | R의 4번이 입력에 이름이 있는 꺼진 분기를 방문해 잠복으로 분배. 켜진 분기는 진입 때 분배 입력을 받음. 등록은 하위 순회로 모든 묶음을 적중하되 살아 있는 분할 소유자만 넣음 | 4.2절 표의 `:410-453` 줄, 3.3절 |
| 표 밖 게이트가 던짐 | 그 단계에서 지금처럼 `gateThrowVersion`이 오르고 `threw` 처리 | `evaluateGate.ts:157-200` |
| 호스트나 조상이 wrong-kind(`raw !== undefined`) | G3로 그 라운드는 지금 경로 | — |
| 중첩 union 호스트 | 호스트 자신의 선택은 표 경로. 부모가 이 호스트의 조각 선언을 고르는 자리(부모의 일반 선택기)는 지금처럼 N개를 평가 | 선례 설계 §2의 두 평가 자리. 9절 잔여, 10절 질문 2 |
| 적재(마운트) | PR-6 전까지 지금 경로 | G1 |

## 5. 동치 논증

### 5.1 불변식과 실행 중 확인 자리

검증 모드는 `settle/utils/gates/gateSelectionTable.ts`(새 파일)의 내부 스위치 `gateSelectionTable.mode: 'table' | 'off' | 'verify'`입니다. 모양은 `gateWheelEvaluation`(`settle/utils/gates/gateWheelEvaluation.ts:2-22`)과 같고 패키지 진입점에 드러나지 않습니다. PR-1b가 틀을 넣고(기본 `'off'`), PR-2b부터 PR-5까지 vitest의 unit·render·storybook 설정 파일과 관측 동치 도구가 `'verify'`를 켭니다. 위반은 `verifyGateWheelConfirmation`처럼 오류를 던지고 계수(`violations`)를 올립니다. PR-1b에서는 스위치를 읽는 제품 경로가 없어 세 dist(`index.mjs`, `index.node.mjs`, `index.cjs`)에서 tree-shake되므로, 출하 번들의 기본 모드 단언은 PR-2b부터 합니다. PR-1 특성화의 visits 섹션은 계측 방문이라 관측 동작이 같아도 바뀌며, 그 섹션을 바꾸는 PR은 PR-2a(첫 쓰기 방문)와 PR-2b(게이트 평가 수)입니다. 두 PR은 visits 섹션만 재캡처하고 다른 섹션은 바이트 동일을 단언합니다.

**검증 모드의 재읽기가 부작용이 없다는 것은 G3 아래에서만 성립합니다.** G3이 깨진 라운드는 표 경로를 쓰지 않으므로 재읽기도 하지 않습니다. G3 아래에서는 `readProjectedValue`가 공표 분기(`readProjectedValue.ts:42-56`)에 닿지 않고, 감시 노드가 단말이라 끝의 공표(`:88-89`)도 일어나지 않습니다(대기 출력에는 호스트만 들어감, `selectChildren.ts:247,406`).

| 번호 | 불변식 | 확인 자리(검증 모드) |
| --- | --- | --- |
| I1 | 표 단계마다 칸 판정 = `Boolean(expression.evaluate([v]))` | 읽기 직후 묶음의 모든 표 게이트를 그 값으로 평가해 견줌(S1). 인식한 식은 순수하므로 이 확인 평가는 부작용이 없습니다. |
| I2 | 한 라운드 안에서 감시 경로의 모든 지금-자리 읽기는 v를 돌려주고 공표를 일으키지 않음 | 생략한 표 게이트 자리마다(방문하지 않는 단계와 루트 선언 포함, 그 자리의 원래 순서 시점에) `locate`로 결합한 경로를 `readProjectedValue`로 다시 읽어 `Object.is(v)`로 견줌. 이 확인은 O(N)이며 검증 모드에서만 돕니다. 읽기 앞뒤 `pendingOutputs`의 크기·내용 비교, 감시 경로가 라운드 내내 dirty가 아님, 호스트의 레지스트리 발생 수 불변도 함께 단언합니다(S2) |
| I3 | 방문하지 않은 단계는 4.2절의 네 조건을 모두 만족 | 모든 단계를 돌며 조건을 단언(S2′, O(N)) |
| I4 | 방문 단계는 오름차순으로 같은 본문을 실행 | 코드 구조(PR-1의 공용 본문)와 시험 |
| I5 | 매 등록 직후 형상 dirty 집합이 지금 알고리즘의 결과와 같음 | 사본 집합에 지금의 `affected` 등록을 돌려 견줌(S3) |
| I6 | 지금 알고리즘의 dirty 집합 − 새 dirty 집합 = 적중한 살아 있지 않은 분할 소유자이고, 매 `dirtyChildren` 호출의 결과(구성원과 순서)가 같음 | 정착 전체에 걸친 그림자 `DirtyPathSet`이 실제 집합의 모든 추가·삭제를 따라 하고 등록 때는 지금 알고리즘대로 넣음. 여섯 호출 자리(`47de7a441`의 `computeNode.ts:88,116,127,200,246`, `canSkipGateWheel.ts:29`; HEAD 번호는 1.3절)마다 그림자의 `dirtyChildren` 결과와 실제 결과를 배열로 견주고, 등록 직후에는 집합 차이를 견줌(S3). 등록 직후만 보던 첫 판의 확인 자리는 틀렸으므로 고쳤습니다. |
| I7 | 분할 소유자가 진입하거나 되살아날 때 보충 이전에 이미 dirty이고, 보충은 결과를 바꾸지 않음(3.4절의 논증) | 규칙 적용 전에 `dirtyPaths.has(p)`를 단언하고, 규칙이 실제로 새 열쇠를 넣은 횟수를 세어 정착 끝에 0임을 단언함(S4). 지금 코드와의 dirty 집합 비교 자체는 S3의 그림자 `DirtyPathSet`(I6)이 맡습니다 |
| I8 | `isDependencyOwner(p)` = 지금 집합의 `has(p)` | S3의 그림자 소유자 집합과 견줌 |
| I9 | 게이트 목록과 바퀴 상한이 같음 | 코드 불변, 계수 시험 |
| I10 | 증인 프레임의 입력·`consistent`가 같음 | 라운드 끝에서 직접 단언합니다. 그림자 전수 평가(생략한 표 게이트 자리마다 지금처럼 읽고 `recordGateInput`과 같은 규칙으로 그림자 프레임에 적음; 표 밖 게이트의 실제 읽기도 같은 그림자 프레임에 적음)의 입력 열쇠 집합·열쇠별 값(`Object.is`)·`consistent`가 실제 프레임과 같아야 합니다(S5) |

### 5.2 귀납

기준 실행 F(스위치 `'off'`)와 표 실행 O가 같은 정착에서 같은 사건 열(등록, 호스트 라운드, 단계 본문)을 지난다고 봅니다. 관계 ~를 "모든 관측 상태(노드 필드, `structure`, `changedNodes`·`entered`·`pendingExits`·`throwingGateExits`·`presenceHosts`·`pendingOutputs`·형상 dirty 등)가 같고, dirty 집합은 F = O ∪ G(적중한 살아 있지 않은 분할 소유자)이며, 부모 색인의 모든 맵에서 살아 있는 자식 이름이 처음 나오는 순서가 같음(루트 호스트는 G의 항목이 걸러지는 이름뿐이고, 중첩 호스트는 닻이 G의 자리를 지킴)"으로 둡니다. 이 관계에서는 매 `dirtyChildren` 호출의 결과가 같습니다.

- 등록은 ~를 지킵니다(3.3절, I5·I6). 계산이 G에 속하지 않는 열쇠를 지울 때도 두 실행이 같은 열쇠를 지우고, 대표 구성원을 지울 때는 F의 열쇠 삭제와 O의 닻 수 감소가 같은 맵 순서를 남기므로 ~가 유지됩니다.
- 라운드 시작에서 G3·G4가 성립하면 F의 첫 표 자리 읽기와 O의 읽기는 같은 값이고 둘 다 공표가 없으며, F의 뒤 읽기는 같은 값에 부작용이 없습니다(I2; 감시 노드는 기준 단말이라 선택이 그 스키마를 바꾸지 못하고(E1의 선언 하나), 라운드 안에서 dirty로 다시 표시되지 않으며, 다른 단계의 계산은 형제의 방출을 바꾸지 않음). 그래서 각 단계의 판정이 같습니다(I1).
- V의 단계는 같은 본문을 같은 입력 상태로 실행하므로 ~를 지킵니다. 진입·되살림에서 dirty 판정은 보충 이전에 이미 같습니다(3.4절, I7). V 밖 단계는 F에서도 상태를 바꾸지 않습니다(4.2절, I3).
- 라운드 끝의 코드(`selectChildren.ts:409-486`, `computeNode.ts:240-288`)는 같은 상태를 받으므로 `schemaChanged`·`changed`·`outputChanged`와 생략 판정이 같고, 라운드 수와 실행되는 확인 바퀴 수가 같습니다.
- 커밋은 같은 상태와 같은 소유자 술어(I8)를 받으므로 상태 키 공표·퇴장 정책·배달·`revision`·오류가 같습니다.

이 논증은 시험으로 하는 증명이 아닙니다. 그러나 각 단계의 전제(I1~I8)를 검증 모드가 실제 실행마다 확인하므로, 전제가 깨지는 입력이 시험이나 도구에 나타나면 즉시 실패합니다.

### 5.3 원래 자리마다의 동일성 검사(97C-01 (2))와의 관계

97C-01 (2)와 선례 설계 §4.2는 표를 쓰더라도 원래 평가 자리마다 `locate`와 상수 시간 동일성 검사를 하라고 정했습니다. 그 조건을 그대로 지키면 자리 수(3N+N)만큼의 일이 남아 기준 ①이 서지 않습니다(선례 설계 §6.1이 스스로 이 한계를 적음). 이 설계는 그 조건을 "자리마다의 검사" 대신 "라운드 진입 자격(G3·G4)과 정적 자격(E1·E3)으로 라운드 안의 읽기 불변을 증명하고, 검증 모드가 그 증명을 실행마다 확인한다"로 바꿉니다. 이것은 원장 문구의 변경이며 6절에 새 문구를 적었습니다.

## 6. 원장 영향

| 조항 | 지금 문구(요지) | 바꾸는 문구(제안) |
| --- | --- | --- |
| 96C-01 (가) (`architecture/ledger/blueprint.md:174`, `reviews/round-96-closing.md:9`) | "바퀴는 지금 그 게이트들을 평가하던 자리에서 표를 한 번 찾아 그 값들을 같은 순서로 반영한다" | "바퀴는 첫 표 게이트의 평가 자리에서 감시 키를 한 번 읽어 표를 찾고, 그 값에서 켜지는 엔트리와 직전 자식·현재 구조·대기 퇴장·입력 키에 해당하는 엔트리만 기존 순서로 방문한다. 방문하지 않는 엔트리는 기존 실행에서도 상태를 바꾸지 않음이 증명된 꺼진 엔트리다(결정 62 (라))." |
| 97C-01 (2) (`ledger/blueprint.md:175`) | 원래 평가 위치마다 상수 시간 동일성 검사 | "식 게이트의 감시 키가 호스트의 무게이트 단일 선언 단말 엔트리이고 라운드 진입 때 경로 위 모든 노드의 raw가 없고 그 키가 dirty가 아니면, 그 라운드 안의 읽기는 같은 값이고 공표가 없음이 증명되므로 한 번만 읽는다. 이 자격이 없으면 자리마다 지금처럼 평가한다. 판별 게이트(`controls.discriminator`)는 이 문구의 대상이 아니다." |
| 97C-01 (4) | 형상 dirty 판정은 매 호출의 누적 집합에 대한 질의 | 문장은 유지하고 다음을 더합니다. "dirty 집합에는 살아 있지 않은 표 소유자를 넣지 않는다. 분할 소유자는 퇴장 직전 등록에서 이미 dirty 가 되어 계산 없이 나가므로, 진입·되살림 때 dirty 공백은 생기지 않는다. 등록 시점 보충 규칙은 결과를 바꾸지 않는 방어로만 두며, 검증 모드가 '보충 이전에 이미 dirty 이고 보충 삽입 횟수는 0'을 단언한다. 변이 V5·V5′·V6 은 동치 변이이므로 변이 관문에서 제외한다. `dependencyOwnerPaths`의 질의는 적중 기록으로 답한다. 루트가 아닌 호스트에서는 그 소유자들이 부모 색인에서 차지하던 자리를 닻 키로 지켜, 매 `dirtyChildren` 호출의 구성원과 순서를 넣었을 때와 같게 둔다. 매 등록 직후의 형상 dirty 집합도 넣었을 때와 같다." |
| 97C-01 (5) 뒷부분 | "잠복 owner의 축약은 상태 키의 공표·나감 정책·배달 후보에 차이가 없음을 보이기 전에는 넣지 않는다" | PR-3a·3b의 차등·그림자 증거를 원장에 붙여 조건 충족으로 기록합니다(문구 자체는 유지, 충족 기록 추가). |
| SETTLE-020 (`ledger/settle.md:384-399`; 결정 칸 `:389`) | "한 바퀴에 **모든** 게이트(조각 게이트와 노드 게이트, 켜진 것과 꺼진 것 모두)를 평가한다" | 결정 칸의 문장은 그대로 두고, 보충에서 그 칸의 "평가"를 **"전수 평가와 같은 판정을 얻는 일"**로 명시적으로 다시 정의합니다(검증 발견 5). 제안 문구는 "이 결정의 '평가'는 각 게이트의 판정을 전수 평가와 같은 값으로 얻는 일이다. 표 게이트는 감시 키를 한 번 읽어 표를 찾는 것으로 판정을 얻고, 꺼진 표 게이트의 판정은 칸에 들지 않은 것으로 얻는다. 즉시 반영의 순서는 방문 엔트리의 기존 순서로 지킨다(결정 62 (라))."입니다. |
| BLUEPRINT-007 (`ledger/blueprint.md:15`, `:167` 이하) | "게이트가 읽는 것은 뽑지 않는다 — 전부 다시 평가" | 결정 문구는 유지하고 96C-01과 같은 자리에 보충을 더합니다. "표 자격 식에 한해 비실행 인식기가 읽는 키와 리터럴을 뽑는다(결정 62 (라))." |
| 109C-01 (3) (`architecture/ledger/goal.md:287`, `reviews/round-109-closing.md:9`) | "꺼진 분기의 게이트도 '모두 다시 평가'가 원장이 정한 것 — BLUEPRINT-007 — 이므로 평가 자체는 필요하되 그 평가가 상수 시간인지" | 보충을 더합니다. "결정 62 (라)로 '모두 다시 평가'는 SETTLE-020 보충의 뜻(전수 평가와 같은 판정을 얻는 일)으로 읽는다. 표 게이트의 꺼진 판정은 함수 호출 없이 표 조회의 결과로 얻으므로, 꺼진 분기 하나의 판정 비용은 상수 시간이 아니라 0이다." |
| 438C-02의 전제(`reviews/round-438-closing.md:9`) | "실행된 바퀴는 모든 게이트를 그대로 평가한다"를 결정 58의 무충돌 근거로 삼음 | "실행된 바퀴는 모든 게이트의 판정을 전수 평가와 같은 값으로 얻고, 증인 프레임에는 같은 입력을 기록한다"로 고칩니다. 결정 58의 술어와 코드(`canSkipGateWheel.ts`)는 바꾸지 않습니다. 검증자가 확인했듯이 97C-01 (2)의 변경은 438C-02가 기댄 논증을 깨지 않습니다. 표 판정은 증인 프레임에 기록된 `/kind` 값 하나의 함수이고, 라운드 안에서 그 값이 바뀌지 않음이 E1·G3·G4로 증명되기 때문입니다. |

**DETAIL을 먼저 고치는 커밋의 목록입니다(검증 발견 5).** 원장 문구와 함께 다음 넷을 각 PR의 DETAIL 커밋에서 고칩니다. 줄 번호는 `394c284a7` 기준입니다.

- `settle/DETAIL.md:170`의 "청사진 전순서대로 모든 게이트를 매번 평가하고"를 "청사진 전순서대로 모든 게이트의 판정을 얻고(표 게이트는 감시 키 한 번 읽기와 표 조회로)"로 고칩니다(PR-2b).
- `settle/DETAIL.md:182`의 "게이트는 지금처럼 매 라운드 모두 평가한다(SETTLE-020, BLUEPRINT-007)"를 같은 뜻으로 고칩니다(PR-2b).
- `settle/utils/compute/childSelection/getDirectChildSelectionPlan.ts:12`의 주석 "its condition still runs on every visit"를 표 단계의 판정이 표 조회로 얻어진다는 문장으로 고칩니다(PR-2b).
- 같은 파일 `:46`의 `prepare` 계약 주석("True only during a non-load selection that visits the candidates")을 마운트 때 미리 만들기도 `prepare`를 참으로 부른다는 문장으로 고칩니다(PR-2a).

바꾸지 않는 조항입니다. SETTLE-017(바퀴 상한·역의존 표; 같은 게이트 목록과 같은 표 자료를 씀), SETTLE-018(출발점 고정; `primeHost`가 그대로 기준에서 출발하고 직전 활성 집합은 R의 방문 판단에만 쓰이며 켜짐 판정에는 쓰이지 않음), SETTLE-044(직전 활성 집합 출발 금지; 같은 까닭), EVENT-005(배달 순서), 결정 58(`canSkipGateWheel.ts`), FRAGMENT-048(첫 구현 범위 밖), GOAL-011(이 설계가 분기 전환에서 처음 충족하는 목표). `evaluateGate.ts:209`의 "without caching" 주석도 그대로 맞습니다. 표 경로는 `evaluateGate`를 부르지 않을 뿐 그 함수가 결과를 캐시하지는 않습니다.

## 7. 위험 목록

| 순위 | 위험 | 생기는 자리 | 탐지 |
| --- | --- | --- | --- |
| 1 | 한 번 읽기가 자리마다의 읽기와 다른 값이나 다른 공표를 냄(overlay·omitEmpty·파생·같은 라운드 기본값으로 감시 값이 바뀌는 경로를 자격이 놓침) | 4.1절 읽기, G3·G4, E1·E3 | 검증 모드 S2, `settle/__tests__/fixtures/gateSelectionCases.ts`의 "overlay omitEmpty and root host schema changes"·"same-wheel default and derived key changes"·"wrong-kind ancestors" 사례를 `runGateSelectionCase`의 설정 훅으로 `'off'`와 `'table'`을 견줌, 변이 V1(읽기를 첫 자식 계산 뒤로 옮김) |
| 2 | R가 빠뜨린 꺼진 엔트리가 실제로 상태를 바꿈(던진 게이트 퇴장, 대기 퇴장 되살림, 일괄 입력의 잠복 분배) | 4.1절 R, 퇴장 대기 두 층 색인 | 검증 모드 S2′, "pending throwing exit followed by derived discriminator transition"·"FRAGMENT048 false front short circuits a throwing rear and preserves exits" 사례, 일괄 setValue 고정물, 변이 V2(R의 3번 제거)·V3(R의 4번 제거)·V4(색인을 한 자리에서 갱신 안 함) |
| 3 | 소유자 분할 뒤 되살림 자식의 dirty 판정이 갈림(세대 규칙, `restoreSourceB` 축소, 있음 등록과의 겹침) | 3.4절 | 검증 모드 S3·S4(진입·되살림 때 보충 이전에 `dirtyPaths.has(p)`가 참이고 보충 삽입 횟수는 0). 되살림 고정물은 설계자의 수렴 장면입니다(`experiments/revival-scene-converging.md` 장면 1). `kind`에 기본값 `'b'`와 `derived: '../kind === "a" ? "b" : undefined'`를 두고 루트 oneOf에 `./kind === 'a'`(`pa`)·`./kind === 'b'`(`pb`) 두 분기를 둡니다. 마운트 뒤 `/pb`에 `'kept'`, `/kind`에 `'a'`를 씁니다. 마지막 쓰기의 파생 라운드가 키를 `'b'`로 되돌리고, 그 등록이 대기 중인 `pb`의 묶음을 적중한 뒤 `pb`가 같은 노드로 되살아납니다. 끝 값은 `{ kind: 'b', pb: 'kept' }`이고 예외가 없습니다. 같은 문서의 장면 2(진입·계산 → 퇴장 → 비생존 적중 → 되살림)도 함께 둡니다. 검증자의 진동 장면(`experiments/revival-scene.md` 1절)은 `BUDGET_EXCEEDED`를 기록하는 보조 고정물로 둡니다. 감시 키 자체의 있음이 바뀌는 고정물도 둡니다. **변이 V5(되살림에서 보충 규칙 제거), V5′(진입에서 표시 갱신 제거), V6(세대 비교를 `has`로 바꿈)은 동치 변이입니다.** 3.4절대로 보충이 결과를 바꾸지 않으므로 어떤 고정물로도 잡히지 않습니다. 그래서 변이 관문에서 빼고 S4 단언으로 대신합니다 |
| 4 | 중첩 호스트에서 닻 키의 자리나 수명이 틀려 `dirtyChildren`의 순서가 바뀌고, 계산 순서·`changedNodes` 순서·경고 순서가 달라짐 | 3.3절(PR-3b) | 검증 모드 S3의 정착 전체 그림자 `DirtyPathSet`과 매 `dirtyChildren` 호출 비교. 검증자의 실행 확인 실패 장면 고정물(3.3절: 처음 `kind = 'none'`인 표 호스트 h와 `h/kind`에서 파생되는 목록 포함 꼴 표 밖 호스트 g, `/h/kind`에 `'b'` 한 번 쓰기; 파생 패스와 전이 패스의 루트 계산 순서가 지금 코드에서 [h, g]이고 묵은 열쇠를 빼면 [g, h]; 고정물은 [h, g]를 단언). 루트 일괄 쓰기로 둘을 함께 전환하는 꼴과 h가 켜진 분기에서 출발하는 꼴은 갈리지 않으므로 V7을 잡는 고정물로 쓰지 않습니다. 중첩 oneOf·배열 아이템 oneOf의 배달 기록 비교, 관측 동치 도구(Node·Bun 174비교). 변이 V7(닻을 넣지 않음 → 실패 장면 고정물이 [g, h]로 실패), V8(닻을 첫 삭제 때 지움 → 런이 둘 이상인 고정물이 실패) |
| 5 | 인식기의 리터럴 해석이 JavaScript와 다름 | 2.1절 | 검증 모드 S1, 이스케이프·수 꼴·−0·NaN 고정물("whole expression, literal escapes…", "strict primitive comparison…"), 인식기 단위 시험(거절 꼴 목록) |
| 6 | 마운트 비용 증가(계획·표 미리 만들기) | 2.2절 | 표 1의 oneOf-80 마운트 행, 원인 계수(마운트당 계획·표 생성 1회) |
| 7 | 검증 모드의 O(N) 비용이 시험 시간을 늘리거나 출하 경로에 섞임 | 5.1절 | 출하 번들에서 `gateSelectionTable.mode` 기본값 단언(PR-2b부터 `'table'`; PR-1b는 스위치를 읽는 제품 경로가 없어 세 dist에서 tree-shake되므로 출하 번들 단언 대신 소스 기본값 `'off'`를 단위 시험으로 확인), 빌드 산출물 형태 검사 |

## 8. 단계별 PR 계획

모든 제품 PR은 DETAIL을 먼저 고치는 커밋, 시험 커밋(가능하면 기준에서 red), 코드 커밋, 결과 문서 커밋의 순서를 따릅니다. 관문은 다음과 같습니다.

- typecheck·lint·build·전체 시험
- 관측 동치: Node·Bun 174비교 차이 0, `packages/canard/schema-form/src/core/__benchmarks__/fixtures/observationIdentity/`
- 분기 전환 동치: `.seiri/tasks/branch-switch-441/tools/equiv.mjs`의 네 순서 × N=5·80, 바이트 같음
- 변이 검출
- 측정 창: A/A′/B 3라운드, `.seiri/tasks/dirty-postorder-441/measure/tools/`, 분기 전환 다섯 행은 기울기 판정(442C 규칙)

**변경 하나에 재측정 하나입니다(96C-01·99C-01, 검증 발견 2).** 첫 판은 PR-2에 따로 잴 수 있는 변경 넷(마운트 때 미리 만들기, 표 선택, 루트 선언 표, 퇴장 대기 두 층 색인)을, PR-4에 넷을 묶었습니다. 이번 판은 각각을 PR 하나로 나누었습니다. 이득이 측정되지 않은 PR은 되돌립니다.

**의존 순서입니다.** 첫 판의 "PR-2와 PR-3은 독립이라 순서를 바꿀 수 있다"는 틀렸으므로 지웠습니다. 분할 소유자의 정의가 인식기와 표에 기대기 때문입니다.

- PR-0 → PR-1 → PR-1b 순서는 고정입니다.
- PR-2a·2b는 PR-1b 뒤에 옵니다. PR-2c와 PR-2d는 PR-2b 뒤에 옵니다.
- PR-3a는 PR-1b의 인식기·표와 PR-1의 공용 단계 본문(되살림 보충 규칙의 자리)에 기대며, PR-2 계열 뒤에 둡니다. PR-2보다 앞설 수 없습니다. PR-3b는 PR-3a 뒤에 옵니다. 검증자 권고대로 3.3절을 다시 검증받기 전에는 PR-3a·3b를 구현하지 않습니다.
- PR-4a~4d는 서로 독립이며 PR-2b 뒤에 옵니다.
- PR-5는 PR-3b 뒤, PR-6은 PR-2c 뒤, PR-7은 마지막입니다.
- PR-0의 몫별 결과는 위 제약 안에서 순서(예: PR-2a와 PR-2b, PR-4 넷의 순서)와 각 몫을 구현할지를 정하는 근거입니다.

| PR | 가설 하나 | 내용 | 시험 | 기대 계수(N=80 첫 전환, 값의 성격) | 뒤의 복잡도 |
| --- | --- | --- | --- | --- | --- |
| PR-0(측정 전용, 병합 없음) | 몫마다 상한이 잡음보다 뚜렷이 크다(99C-01 (나)) | 진단 탐침 번들 사본의 떼어 내기 변형 넷: S(선택만: V만 방문, 한 번 읽기, 루트 선언 표), R(등록만: 살아 있는 소유자만, 되살림 보충), M(마운트 미리 만들기만), S+R+M | 변형마다 `equiv.mjs` 네 순서 바이트 같음. 변형마다 **종단 시간 측정**: `branch-switch-441/tools/wall.mjs`(N=5·10·20·40·80, 세 세션 중앙값의 중앙값)과 측정기 장면(쓰기마다 새 마운트와 틱 대기)으로 첫 전환·둘째 전환·마운트 시간과 분기당 기울기를 냄. 측정 창 필요 | S: 평가 640 → 0(가정), 단계 484 → 19(공식). R: 소유자 241+241 → 4+4(유도). M: 첫 쓰기의 계획 생성 1 → 0 | 측정만 |
| PR-1 | 단계 본문을 뽑아도 동작이 같다 | DETAIL에 설계 기록, `selectEntryStep` 추출, 특성화 묶음 추가 | 기준 초록 고정: 아래 고정물 전부의 관측 스냅숏 | 변화 없음 | 그대로 |
| PR-1b | 인식기와 표를 넣어도 동작이 같다(스위치 `'off'`) | `substituteDependencyPaths` 추출, 인식기, `BlueprintExpression.equality` 필드, `getGateSelectionTable`, 내부 스위치(기본 `'off'`), 검증 모드 틀 | 인식기 단위 시험(받는 꼴·거절 꼴·리터럴 해석·2.1절 구현 조건 셋), 표 구성 시험(E1~E5), PR-1 스냅숏 불변, 전체 시험 불변 | 변화 없음 | 그대로 |
| PR-2a | 계획·표를 마운트에서 만들면 첫 전환이 그만큼 빨라진다 | `prepareGateSelection(blueprint)`를 `loadFieldNodeAtMount.ts:22-24`에서 부름. `getDirectChildSelectionPlan.ts:46` 주석 수정 | PR-1 특성화의 고정·불변식 섹션 불변(`primeHost` 기준 같음), visits는 첫 쓰기의 `declareChildren` 방문만 감소(재캡처, 시험 머리말에 PR-2a를 visits 변경 PR로 적음), 마운트 뒤 계획 존재 단언 | 첫 쓰기 계획 생성 1 → 0(실측 가능), 마운트당 생성 1 | 마운트에 O(N) 한 번 |
| PR-2b | 자식 선택을 표로 바꾸면 전환이 빨라진다 | 스위치 기본 `'table'`, G1~G4, V, 표 단계 판정, R의 대기 퇴장 몫은 (가1)의 `pendingExitPaths`를 훑어 부모가 호스트인 경로만 골라 JSON 열쇠로 정확히 확인. 검증 모드 S1·S2·S2′·S5. DETAIL `:170`·`:182`, 계획 주석 `:12` 수정 | PR-1 스냅숏의 visits 밖 섹션이 `'table'`·`'verify'`에서 같음(visits는 게이트 평가 수 감소로 재캡처), `gateSelectionCases`·`gateWheelCases`의 `'off'` 대 `'table'` 차등, `settle.gate-selection-counts.test.ts:54-57` 기대값을 표 게이트 0으로 고치고 옛 값을 문서에 기록, 변이 V1~V3 | 단계 평가 480 → 0(가정), 단계 방문 484 → 19 이하(공식). 루트 선언 평가 160은 그대로 | 자식 선택 O(바뀐 분기 + 대기 퇴장 총수) |
| PR-2c | 루트 선언도 표로 고르면 더 빨라진다 | E5 루트 선언 표(4.3절) | 루트 선언 고정물, 다중 활성 경고 고정물 | 루트 선언 평가 160 → 0(가정) | 루트 선언 선택 O(켜진 선언) |
| PR-2d | 대기 퇴장을 호스트별로 찾으면 R가 상수가 된다 | 퇴장 대기 두 층 색인(호스트 경로 → 자식 경로 → 개수), 갱신 자리 다섯(1.3절의 새 줄 번호) | (가1)의 특성화 시험, 변이 V4(한 자리에서 갱신 안 함) | R의 대기 퇴장 몫: 정착 전체 대기 퇴장 수 → 그 호스트의 대기 퇴장 수 | R O(그 호스트의 몫) |
| PR-3a | 루트 호스트의 비생존 소유자를 빼면 더 빨라진다 | 루트 호스트 분할 소유자, `affectedForRegistration`, 되살림 보충 규칙(세대; 방어이며 결과 불변, 3.4절), `isDependencyOwner`, 검증 모드 S3(정착 전체 그림자)·S4 | 매 등록 직후 형상 dirty 비교(97C-01 (4)), 상태 키·퇴장 정책·배달 후보 차등(97C-01 (5)), 되살림 수렴 고정물(장면 1·2)과 진동 보조 고정물(`BUDGET_EXCEEDED` 기록), `restoreSourceB` 고정물, 검증 모드 S4 단언(보충 이전 dirty, 보충 삽입 0). V5·V5′·V6은 동치 변이라 변이 관문에 두지 않음 | 소유자 241+241 → 4+4(유도), 비생존 dirty 237 → 0, `dirtyChildren` 훑기 1429 → 상수 | 루트 호스트 등록 O(바뀐 분기 + 깊이) |
| PR-3b | 중첩 호스트도 닻으로 같은 이득을 낸다 | 루트가 아닌 객체 호스트의 분할과 닻 키(3.3절) | 검증자 실패 장면 고정물(3.3절의 실행 확인 스키마, 파생·전이 패스 [h, g] 단언), 런이 둘 이상인 고정물, 중첩 oneOf 배달 기록 비교, 변이 V7·V8 | 중첩 호스트 전환의 등록이 분기 수와 무관 | 중첩 호스트 등록 O(바뀐 분기 + 런 수 × 깊이) |
| PR-4a | 바퀴 상한의 목록 비교를 없애면 기울기가 준다 | `getGateBudgetCap.ts:80-84`의 원소별 비교를 "얼린 정적 목록의 참조 + 옮긴 게이트 꼬리" 비교로 바꿈 | 게이트 목록·상한 동일 시험(97C-01 (5), SETTLE-017), 옮긴 게이트 고정물 | 라운드당 N 비교 2회 → 옮긴 게이트 수 | — |
| PR-4b | 옮긴 게이트 조회를 색인하면 기울기가 준다 | `getGateRegistry.ts:201-205`가 위치 집합 전체를 펼치는 대신 옮긴 발생만 담은 같은 순서의 집합을 유지 | `settle.gate-wheel-relocated.test.ts`, 순서 동일 단언 | 호출당 N+α 펼치기 → 옮긴 수 | — |
| PR-4c | 정적 게이트 목록 복사를 없애면 기울기가 준다 | `computeNode.ts:156`(`394c284a7`)의 펼침 복사를 첫 옮긴 게이트 덧붙임 때만 하는 쓰기 때 복사로 바꿈 | (가2)의 특성화 시험, 얼린 목록 불변 단언 | 호출당 N 복사 → 0(옮긴 게이트가 없을 때) | — |
| PR-4d | 루트 유효 스키마를 칸별로 기억하면 기울기가 준다 | 칸별 `EffectiveSchema` 메모(4.3절), `isAtomic` 식별자별 | 같은 참조 단언 | 호출당 선언 N+1 걸러내기 → 0 | 분기 전환 O(바뀐 분기 + 기준 + 깊이) |
| PR-5 | 배열 아이템 호스트도 같은 이득을 낸다 | 결합 가능한 템플릿 소유자와 확장 소유자의 분할(호스트 템플릿을 같은 확장으로 펼쳐 아이템 순서 유지), 배열 호스트 맵의 닻과 `canReuseAppendedChild.ts:28` 소비자 분석 | 배열 아이템 oneOf 고정물(아이템 추가·삭제·재색인), 확장 순서 단언 | 아이템 하나 전환의 등록이 아이템 수·분기 수와 무관 | 같음 |
| PR-6 | 적재에도 표를 쓰면 마운트가 준다 | G1에서 적재 제외를 풂. 먼저 적재가 직접 계획을 쓰지 않는 까닭을 코드와 이력에서 찾아 DETAIL에 적음(지금 문서에 근거 없음) | 마운트 스냅숏, 적재 전용 고정물(wrong-kind 입력, 잠복, 초기 출력) | 마운트 평가 1600 → 0(가정), 단계 1210 → 37(공식) | 마운트 선택 O(활성 분기) |
| PR-7 | 검증 모드를 시험 전용으로 내린다 | 설정 파일의 `'verify'`를 그림자 시험 묶음으로만 남김, 결과 문서와 원장 기록 | 그림자 시험 묶음 유지 | 변화 없음 | — |

PR-1의 특성화 묶음은 다음 고정물을 담습니다.

- 루트 oneOf(N=5·80, 측정 고정물 그대로), 중첩 oneOf(`/a` 아래), 배열 아이템 oneOf
- 두 분기 공유 리터럴, 표 밖 게이트가 섞인 분기, 던지는 표 밖 게이트, 없는 값, 같은 값
- 루트 일괄 setValue(판별 키 + 새 분기 페이로드 + 꺼진 분기 페이로드)
- 검증자 실패 장면(3.3절, `experiments/revival-scene.md` 3절): 처음 `kind = 'none'`인 표 호스트 h와 `h/kind`에서 파생되는 목록 포함 꼴 표 밖 호스트 g, `/h/kind`에 `'b'` 한 번 쓰기. 파생 패스와 전이 패스의 루트 계산 순서 [h, g]를 기록합니다
- 되살림 장면(위험 3): 설계자의 수렴 장면 1·2(`experiments/revival-scene-converging.md`; 장면 1은 `kind` 파생 `'../kind === "a" ? "b" : undefined'`와 `/kind`에 `'a'` 쓰기). 감싼 `selectChildren`으로 정착 안의 `revived`를 기록합니다(`settle/__tests__/settle.union-fold-selection.test.ts:45-60`의 방법)
- 진동 보조 장면: 검증자의 되살림 장면(`experiments/revival-scene.md` 1절, `/src`에 `'go'` 쓰기)은 `BUDGET_EXCEEDED` 예외와 그 뒤 값을 기록합니다
- 예산 초과 복구(`restoreSourceB`), 옮긴 게이트, wrong-kind 호스트, 마운트 직후 첫 쓰기(미리 만든 계획과 `primeHost` 기준의 같음)

관측은 `runGateSelectionCase`의 기록(노드 필드, 실패, 진단, 커밋 번호, 전역 상태, 잠복, 배달 순서)에 `revision`, `committedDeclarationIds`, 정착마다 `changedNodes`·`stateDirtyNodes`·`entered`의 삽입 순서를 더한 것입니다. 마지막 셋은 발견 1이 지적한 내부 순서 차이를 끝 상태 비교에서 잡기 위해 더합니다.

## 9. 측정 계획

| 표와 행 | PR-2a~PR-5 기대 방향 | PR-6 기대 방향 | 비고 |
| --- | --- | --- | --- |
| 표 2 oneOf 분기 전환 5·10·20·40·80개 | 크게 감소, 분기당 기울기 약 0 | 같음 | 핵심 행. 인과 계수(평가 수, 방문 단계 수, 등록 소유자 수, `dirtyChildren` 훑기)를 함께 냄 |
| 표 2 oneOf-80 필드(잎 하나 쓰기) | 같음 | 같음 | **회귀하면 안 되는 행**입니다. 표 경로는 판별 키가 아닌 잎 쓰기에서 등록 함수만 바뀌며, 분할 묶음을 적중하지 않으므로 일이 늘지 않아야 합니다. |
| 표 2 flat-1000·nested-d6 단일 입력 | 같음 | 같음 | 표 없는 청사진은 지금 `affected`를 그대로 씀 |
| 표 1 oneOf-80 마운트 | PR-2a에서 약간 증가(계획·표 생성 이동, 진단의 첫·둘째 쓰기 차이로 보아 N=80에서 수십 µs 규모로 추정) | 감소(평가 20N과 단계 5×(3N+2) 제거) | 소유자가 마운트 지연은 수용한다고 답함(`packages/canard/schema-form/architecture/reviews/round-441-owner-answers.md`) |
| 표 1 flat·nested 마운트 | 같음 | 같음 | 표 생성 고리는 union 호스트가 없으면 노드 한 번 훑기뿐 |
| 표 3 oneOf-80 루트 일괄 setValue | 감소 | 같음 | 쓰기 패스 바퀴 둘의 평가 16N과 단계 2×(3N+2) 제거 |
| 표 3 flat·nested 일괄 | 같음 | 같음 | 회귀 감시 |

잔여 O(N) 자리도 함께 적습니다. 파생이 있는 폼의 `collectDeriveSourcePaths`(`affected` 유지), 중첩 union 호스트의 부모 쪽 조각 선언 평가, 판별 키·목록 포함 꼴, 무관한 키 쓰기의 `mayChangeAt('')`가 루트 위치의 발생 N개를 훑는 일(`getGateRegistry.ts:208-217`; U19 성격, 이 설계 밖)입니다.

## 10. 미해결 질문

1. **원장 문구 변경의 승인입니다.** 결정 62는 지금 (라)의 설계까지만 승인되었습니다. 6절의 문구 변경(96C-01 (가), 97C-01 (2)·(4), SETTLE-020 결정 칸의 "평가" 재정의, BLUEPRINT-007·109C-01 (3) 보충, 438C-02 전제)과 DETAIL·주석 네 자리의 수정, 특히 97C-01 (2)의 "원래 평가 위치마다의 동일성 검사"를 "라운드 진입 자격과 한 번 읽기"로 바꾸는 것을 승인하시면 PR-0부터 시작합니다. 이 변경이 없으면 자리 수만큼의 일이 남아 기준 ①이 서지 않습니다(5.3절).
2. **첫 구현 범위입니다.** 첫 구현은 측정 고정물의 꼴(`controls.active`의 `===`와 같은 키 OR)만 표로 다룹니다. `controls.discriminator` 판별 키, 목록 포함 꼴, FRAGMENT-048의 앞·뒤 항, 중첩 union 호스트의 부모 쪽 평가는 지금처럼 O(N)으로 남습니다. 판별 게이트는 자리마다 호스트 대기 출력을 공표하므로(`evaluateGate.ts:47-59`, `readProjectedValue.ts:88-89`) 공표 시점의 같음을 따로 증명해야 합니다. 이 넷을 결정 62 안의 후속 보충 설계로 바로 이어 갈지, 첫 구현의 측정 결과를 본 뒤 정할지 정해 주십시오.

## 개정 기록

2026-10-21. Opus 검증자의 조건부 통과 판정(`.seiri/tasks/decision-62-442/verify.md`)의 발견 1~8을 반영했습니다. 제품 코드는 바꾸지 않았습니다. 그 사이 (가)가 #435(`394c284a7`)로 병합되어, 줄 번호 대응표(1.3절)를 함께 더했습니다.

| 발견 | 심각도 | 고친 자리 | 고친 내용 |
| --- | --- | --- | --- |
| 1 | 높음 | 0절, 3.1절, 3.2절 4항, 3.3절 "부모 색인의 순서", 5.1절 I6, 5.2절, 6절 97C-01 (4), 7절 위험 4, 8절 PR-3a·3b와 특성화 묶음 | "부모 색인의 순서도 같다"는 중첩 호스트에서 거짓임을 인정하고 지웠습니다. 닻 키 보존 기제(검증자의 (a))를 택했습니다. 루트 호스트(PR-3a)는 엄격 조상 맵이 없어 닻이 필요 없음을 증명했고, 루트가 아닌 호스트(PR-3b)는 정적 런마다 닻 키를 모든 엄격 조상 맵에 두고 대표 구성원이 모두 지워질 때 지웁니다. 이로써 `dirtyChildren` 여섯 호출 자리와 셋째 소비자 `computeNode.ts:127-133`의 `computed.has(child)`가 지금과 같은 후보를 받습니다. 첫 판의 "중첩 호스트에서 확인 바퀴 생략이 늘 수 있다"는 지웠습니다. 검증 모드 S3를 정착 전체 그림자 `DirtyPathSet`으로 바꾸어 매 `dirtyChildren` 호출을 견줍니다. 검증자의 실패 장면을 고정물로 더하고 변이 V7·V8을 두었습니다. |
| 2 | 높음 | 0절, 8절 전체, 9절 머리 | "PR-2와 PR-3은 독립"을 지우고 의존 순서를 적었습니다(PR-3a는 PR-1b와 PR-1에 기대며 PR-2 계열 뒤에 둠). 동작을 바꾸지 않는 PR-1b(인식기, `equality` 필드, 표 구성, 스위치 `'off'`, 검증 모드 틀)를 새로 두었습니다. 마운트 때 미리 만들기(PR-2a), 표 선택(PR-2b), E5 루트 선언 표(PR-2c), 대기 퇴장 두 층 색인(PR-2d)을 각자 PR로 나누었습니다. PR-4의 네 기제를 PR-4a~4d로 나누었습니다. PR-0에 몫별 변형 S·R·M·S+R+M과 종단 시간 측정을 명시했습니다. 제품 PR은 열다섯입니다. |
| 3 | 중간 | 0절, 3.4절 "문제입니다", 7절 위험 3, 8절 PR-3a와 특성화 묶음 | "진입 자식의 dirty 공백"을 "되살림의 dirty 공백"으로 고쳤습니다. 진입하는 잎은 `enterFieldNode.ts:48-59` → `markWrite.ts:72`, 또는 `restoreLatentState.ts:31-33,56`으로 이미 dirty가 됩니다. 규칙은 표시 갱신을 위해 진입에서도 돈다는 까닭을 적었습니다. V5를 되살림 고정물로 잡게 하고, 장면이 그 길을 지났음을 보이는 계수 단언과 변이 V5′를 더했습니다. 진단 문서의 같은 문장은 진단 작성자의 파일이라 고치지 않았고, 이 문서에서만 바로잡았습니다. |
| 4 | 중간 | 5.1절 머리와 I2·I6·I10 | I2는 검증 모드에서 생략한 표 게이트 자리마다 그 자리의 순서 시점에 읽고 `Object.is`로 견줍니다. I6의 확인 자리를 정착 전체 그림자와 매 `dirtyChildren` 호출로 고쳤습니다. I10은 그림자 전수 평가 프레임과 실제 증인 프레임의 입력 열쇠·값·`consistent`를 견주는 직접 단언(S5)으로 바꾸었습니다. 재읽기의 무부작용이 G3 아래에서만 성립함을 적었습니다. |
| 5 | 중간 | 6절 표와 그 아래 목록, 10절 질문 1 | 109C-01 (3) 보충 행을 더했습니다. SETTLE-020은 결정 칸(`ledger/settle.md:389`)의 "평가"를 "전수 평가와 같은 판정을 얻는 일"로 다시 정의하는 보충으로 고쳤습니다. DETAIL을 먼저 고치는 커밋의 목록(settle `DETAIL.md:170`·`:182` — `47de7a441`의 `:165`·`:177`, `getDirectChildSelectionPlan.ts:12`·`:46`)을 더했습니다. 438C-02의 논증이 깨지지 않는다는 검증자의 확인을 적었습니다. |
| 6 | 낮음 | 1.2절 표 아래 | 계수 값을 실측·공식·가정·유도로 나누어 적었습니다. "단계 19"가 "일 19"가 아니라는 점과 그 까닭(PR-4a~4d의 잔여 O(N))을 적었습니다. 8절 표의 기대 계수에도 값의 성격을 붙였습니다. |
| 7 | 낮음 | 2.1절 4항 아래 | 인식기 구현 조건 셋(괄호 모호성을 푸는 우선순위 파서와 트리 확인, `dependencies[0]` 정확 일치, 참조 뒤 `.`·`[`·`(` 거절)을 더했습니다. |
| 8 | 낮음 | 2.2절 "만드는 때" | 미리 만들기를 의존 색인 생성자에서 빼고, 적재 진입점 `loadFieldNodeAtMount.ts:22-24`에서 부르는 이름 있는 함수 `prepareGateSelection`으로 바꾸었습니다. 의존과 식이 없는 청사진에는 생성자가 불리지 않는다는 점(`getDependencyIndex.ts:347-351`)도 적었습니다. |

검증자가 "확인된 주장"에서 덧붙이라고 한 한 문장(둘째 고리의 `seen.set`은 지역 변수라 관측되지 않음)도 4.2절에 더했습니다.

**재검증 반영(2026-10-21).** `verify.md`의 "## 재검증" 절(판정 통과)이 남긴 문구 수정 넷을 반영했습니다. (1) 3.3절 배열 소비자의 근거를 "튜플 위치는 와일드카드 없는 경로라 비루트 호스트도 배열 조상을 가질 수 있으나, 배열 색인을 읽는 셋(`canReuseAppendedChild.ts:30`, `canReuseSplicedChildren.ts:30`, `canReuseTruncatedChildren.ts:25`)이 모두 게이트 정착에서 먼저 빠진다"로 바꾸었습니다. (2) 3.3절에 닻 자료 규칙 둘(값은 실제 열쇠와 같은 escape된 이름, 감소는 "구성원 → 닻" 맵으로 대표 구성원에게만)을 더했습니다. (3) `dirtyChildren` 여섯 자리의 HEAD 번호(`computeNode.ts:89,117,128,172,218`, `canSkipGateWheel.ts:29`)를 1.3절 대응표에 더하고, 3.3절과 I6에서 그 표를 가리키게 했습니다. (4) 109C-01 (3) 보충의 "비용은 0"을 "판정 비용은 0"으로 좁혔습니다.

**되살림·닻 실행 반영(2026-10-21).** 되살림 장면과 닻 장면을 실행한 결과(`experiments/revival-scene.md`, `experiments/revival-scene-converging.md`)를 반영했습니다. (1) 0절과 3.4절: 되살림의 dirty 공백은 생기지 않습니다. 퇴장 직전 등록이 살아 있는 p를 dirty로 만들고 p는 계산 없이 나가므로, 대기 중에도 dirty로 남습니다. 그 근거를 코드 인용 다섯 단계로 적었습니다. 보충 규칙은 방어로 남기되 결과를 바꾸지 않는다고 명시했습니다. 검증 모드 S4를 "진입·되살림 때 보충 이전에 `dirtyPaths.has(p)`가 참이고 보충 삽입 횟수는 0"이라는 단언으로 바꾸었습니다. (2) 5.1절 I7과 5.2절의 해당 문장을 같은 내용으로 맞추었습니다. (3) 7절 위험 3: V5·V5′·V6을 동치 변이로 분류해 변이 관문에서 빼고 S4 단언으로 대신했습니다. 되살림 고정물을 설계자의 수렴 장면으로 바꾸고, 검증자의 진동 장면은 `BUDGET_EXCEEDED`를 기록하는 보조 고정물로 두었습니다. (4) 3.3절과 7절 위험 4: 닻 실패 장면을 검증자의 실행 확인 스키마로 바꾸었습니다. 처음 `kind = 'none'`인 표 호스트 h와 `h/kind`에서 파생되는 목록 포함 꼴 g를 두고 `/h/kind`에 `'b'`를 한 번 씁니다. 지금 코드는 [h, g], 묵은 열쇠를 빼면 [g, h]입니다. 갈리지 않는 두 꼴(루트 일괄 전환, h가 켜진 분기에서 출발)도 적었습니다. (5) 8절: PR-1 특성화 묶음, PR-3a, PR-3b의 시험 칸을 위 고정물로 바꾸었습니다.

**root 표 묶음별 정정(2026-10-21).** 2.2절의 `GateSelectionTable.root`가 칸 맵 하나(`buckets`)였으나 4.3절은 "묶음마다 칸을 찾는다"고 적어 서로 어긋났습니다. PR-1b 워커에게 내려진 결정대로 `root: { ungatedIndices; groups: { watchedName; firstGate; buckets }[] }`로 고치고, 4.3절 문장을 `root.groups`의 묶음마다 그 감시 키 값으로 `group.buckets.get(v)`를 찾는 것으로 맞추었습니다. 5.1절 머리에 PR-1b의 스위치가 세 dist에서 tree-shake되며 출하 번들의 기본 모드 단언은 PR-2b부터라는 문장을 더했고, 같은 내용으로 7절 위험 7의 탐지 칸(PR-1b는 소스 기본값 `'off'`를 단위 시험으로 확인)을 맞추었습니다.

**97C-01 (4) 되살림 문장 승인본 반영(2026-10-21).** Vincent께서 승인하신 문장으로 6절 97C-01 (4) 추가분의 되살림 문장을 바꾸었습니다. 바뀐 문장은 "분할 소유자는 퇴장 직전 등록에서 이미 dirty 가 되어 계산 없이 나가므로, 진입·되살림 때 dirty 공백은 생기지 않는다. 등록 시점 보충 규칙은 결과를 바꾸지 않는 방어로만 두며, 검증 모드가 '보충 이전에 이미 dirty 이고 보충 삽입 횟수는 0'을 단언한다. 변이 V5·V5′·V6 은 동치 변이이므로 변이 관문에서 제외한다."입니다. 추가분의 나머지 문장(살아 있지 않은 표 소유자를 넣지 않음, `dependencyOwnerPaths` 질의, 닻 키, 형상 dirty 집합)은 그대로 두었습니다. 2.2절 root 묶음별 정정과 5.1절 tree-shake 문장은 바로 위 "root 표 묶음별 정정" 기록대로 이미 반영되어 있습니다.

**PR-2a visits 정정(2026-10-21).** PR-2a 구현에서, 마운트 때 계획과 표를 미리 만들면 첫 비적재 쓰기에서 `primeHost.ts:48`의 `direct.baseline`과 `selectChildren`의 `direct.steps`가 `declareChildren` 호출을 생략한다는 사실이 드러났습니다. 그래서 PR-1 특성화의 계측 방문(visits, `createPlainNode.ts:55`의 `select:` 방문)이 줄어듭니다. 관측 동작은 같으므로 "첫 쓰기 스냅숏 불변"은 계측 방문에 한해 틀렸습니다. 2.2절 둘째 단락 끝 문장, 8절 PR-2a 행의 시험 칸("고정·불변식 섹션 불변, visits는 첫 쓰기의 `declareChildren` 방문만 감소(재캡처)"), 5.1절 머리(visits를 바꾸는 PR은 PR-2a(첫 쓰기 방문)와 PR-2b(게이트 평가 수))를 고쳤습니다. 같은 까닭으로 8절 PR-2b 행의 "PR-1 스냅숏이 같음"도 "visits 밖 섹션이 같음(visits는 재캡처)"으로 맞추었습니다.

**PR-3 구현 표현: 구성원→닻 맵을 정적 런 순번·제외 기록·재대표 명시 맵으로 압축, 판정 동일(2026-10-22).** PR-3 묶음 워커는 3.3절의 "구성원 경로 → 닻" 맵을 다음 세 가지로 압축하기로 했습니다. 첫째, 정적 경로 → 런 색인은 청사진 단위로 공유합니다. 둘째, 첫 적중의 닻이 대표하는 구성원은 "런 구성원 가운데 첫 적중 때 살아 있던 순번(생존 제외 순번)을 뺀 것"으로 암묵 표현하고, 대표 개수만 셉니다. 셋째, 삭제된 대표는 제외 기록에 적고, 뒤 적중에서 다시 대표된 풀린 경로만 명시 경로 → 닻 맵에 넣습니다. 설계자는 3.3절의 판정(대표 여부, 닻 삽입 자리, 감소 대상, 닻 제거 시점)과 갈리는 반례를 찾지 못했습니다. 판정이 같으려면 구현이 다음 다섯 조건을 지켜야 하며, 이 조건은 3.3절의 정의를 그대로 옮긴 것입니다.

1. 대표 판정 순서는 명시 맵을 먼저 보고, 없으면 "런 구성원이고, 생존 제외 순번에 없고, 제외 기록에 없음"으로 첫 닻의 대표를 판정합니다. 명시 맵의 구성원이 삭제되면 그 닻을 하나 줄이고 명시 맵에서 뺍니다.
2. 풀린 집합(3.3절 "대표입니다")은 대표인지와 관계없이 **삭제된 모든 런 구성원**을 기록합니다. 첫 적중 때 살아 있어 진짜 열쇠로 들어갔다가 계산되고 그 뒤 나간 구성원도 다음 적중에서 새로 대표되어야 하기 때문입니다. 감소는 대표 판정이 참인 삭제에서만 일어납니다(V8).
3. 새로 대표되는 구성원은 등록 호출 한 번에 한 번만 셉니다. 한 등록의 `changedRaw`에 같은 묶음을 적중하는 경로가 여럿이어도, 지금 코드는 열쇠를 첫 삽입 때 한 번만 넣기 때문입니다.
4. 닻의 자리는 첫 새 대표의 rank이며, 암묵 표현에서는 런의 첫 비생존 순번입니다. 이 순번은 생존 제외 순번을 앞에서부터 건너뛰어 O(생존 + 1)에 얻습니다.
5. 생존 제외 순번, 제외 기록, 명시 맵, 대표 개수는 정착 단위 상태입니다. 정착 끝의 비움(`releaseSettlementScratch.ts:27-29`)에서 함께 지우고, 정적 경로 → 런 색인만 청사진 단위로 공유합니다.

**PR-3 구현 표현: 표를 의존 색인에 주입(2026-10-22).** 워커는 의존 색인(`settle/utils/dependencies/getDependencyIndex.ts`, dependencies 기관)이 compute 기관의 표(`settle/utils/compute/childSelection/`)를 직접 import 하지 않게 했습니다. 대신 compute 쪽이 마운트 준비(`prepareGateSelection`)와 첫 정착 준비에서 표를 `DependencyIndex`에 한 번 주입합니다. 이 방향은 지금의 기관 간 방향(compute가 dependencies를 import하고, 그 반대는 없음)과 같습니다. 직접 import 하면 dependencies → compute 간선이 생겨 기존의 compute → dependencies 간선과 고리를 이루므로, 주입이 맞습니다. 이 선택은 3.1·3.2절의 판정을 바꾸지 않습니다. 다만 3.1절의 "생성자 끝에서 일반 소유자 경로의 집합을 만들어 분할 표시를 지운다"는 "주입 때"로 읽어야 하며, 다음 세 조건이 필요합니다.

1. 의존 색인은 처음 등록할 때 늦게 만들어집니다(`registerRecalculation.ts:20`). 정적 첫 트리 적재처럼 마운트에서 등록이 없거나, 시험 고정물처럼 `loadFieldNodeAtMount`를 거치지 않는 경로에서는 색인이 주입보다 먼저 있을 수 있습니다. 그래서 주입은 이미 만들어진 트라이 전체를 다시 걸어 `plainOwners`·`splitBuckets`·정적 런과, 일반 기여가 있는 경로의 분할 표시 제거를 계산해야 합니다.
2. 주입은 표를 쓰는 첫 비적재 등록보다 앞서야 합니다. 주입 전의 등록은 지금의 `affected` 경로를 그대로 써야 합니다(3.2절 끝 문장과 같음). 주입은 청사진마다 한 번이며, 두 번 불려도 결과가 같아야 합니다.
3. 의존 색인 쪽에 필요한 표의 모양은 dependencies 기관 안의 구조적 형으로 선언합니다. 형 import도 compute → dependencies 방향만 두기 위해서입니다.

**PR-3 구현 표현의 코드 대조(2026-10-22).** 위 두 항목의 조건을 PR-3 커밋 `d3a62bcf6`(worktree `schema-form-gate-table-pr3`)의 코드와 대조했습니다. 반례는 없습니다.

- 압축 닻 조건 1~5는 모두 지켜집니다. 대표 판정은 `DirtyPathSet.releaseSplitMember`가 명시 맵(`memberAnchors`)을 먼저 보고, 없으면 첫 닻과 `excluded`로 판정합니다. 풀림 기록(`released`)은 삭제된 모든 런 구성원을 적고, 감소는 대표에서만 일어납니다. 한 등록 안의 둘째 적중은 직전 호출에서 비운 `released`를 보므로 다시 세지 않습니다. 닻 자리는 첫 비생존 순번이고, 정착 단위 상태는 `clear`에서 지웁니다.
- 표 주입 조건 1~3도 지켜집니다. `DependencyIndex.prepareRegistration`은 이미 만들어진 트라이 전체를 다시 걸으며, 한 번만 돕니다. 주입 전에는 `hasSplitOwners`가 거짓이라 옛 `affected` 경로를 씁니다. 표의 형은 `settle/types/gateSelectionTable`에서 가져오며 compute 기관을 import하지 않습니다.
- PR-3 측정의 입증(느림) 행(nested-d6-f4 bulk)은 표가 없는 장면입니다. 이 행은 3.2·3.3절의 비용식과 무관한 공용 경로의 상수 비용(`DirtyPathSet.delete`의 분할 확인, `dirtyChildren`의 그림자 조회)에서 생겼습니다. 같은 성격의 비용으로, `registerRecalculation`이 모든 정착에서 `registrationEpoch`를 문맥에 동적으로 더해 문맥 객체의 모양 전이가 하나 늘어나는 점도 확인했습니다(`experiments/pr3-shape/probe.mjs`). 이 필드는 문맥 리터럴에 선언하거나 분할 정착에서만 올리면 3.4절과 S4를 바꾸지 않고 없앨 수 있습니다.

**PR-3 검증 발견: 호스트 사건 중복 제거 분리(3.2 표의 호스트 행은 일반 소유자 행과 독립으로 적용)(2026-10-22).** Opus 검증자가 PR-3에서 차단 결함 하나를 찾았습니다. `affectedForRegistration`이 호스트 사건을 일반 소유자와 같은 `emitted` 집합으로 중복 제거했습니다. 그런데 oneOf 호스트 h는 늘 자기 감시 키 노드의 일반 소유자로 먼저 나옵니다. 그래서 3.2절 표의 호스트 행("`shapeDirtyPaths`에 h를 넣음")이 실제로는 한 번도 실행되지 않았고, 일반 소유자 행이 h의 부모만 형상 dirty에 넣었습니다. 등록 시점에 호스트가 아직 없으면(배열 쓰기로 생기는 튜플 위치) h가 형상 dirty에서 빠지고, 검증 모드 S3가 던집니다. 3.2절 표의 세 행은 서로 독립인 효과입니다. 같은 경로가 일반 소유자로 이미 나왔더라도, 호스트 행의 효과(`dirtyPaths`에 h, `shapeDirtyPaths`에 h 자신)는 따로 적용해야 합니다. 그래서 수정은 호스트 사건에 별도의 중복 집합을 두는 것입니다. 호스트 사건은 그 집합으로만 한 번씩 거르고, 일반 소유자와 살아 있는 분할 소유자는 지금의 `emitted`로 거릅니다. 같은 수정에 `registrationEpoch`를 정착 문맥 리터럴에 선언하는 변경도 들어갑니다. 이 변경은 생성 뒤 문맥 객체의 모양 전이를 하나 없애며(`experiments/pr3-shape/probe.mjs`), 세대는 분할 정착 안에서만 읽히므로 3.4절과 S4를 바꾸지 않습니다.
