# 정적 첫 로드: 생성 순회에서 형상·채움·커밋 확정

상태: 원장 관리자 검토용 설계만입니다. 이 문서의 제품 경로는 구현하지 않았습니다. 기준 소스는 `0189c443b`, 결정은 85C-01·86C-02와 `origin/1.0.0-beta`의 87라운드 답입니다. 86라운드가 유보한 b1(분석을 최초 접근까지 지연), b2(노드 지연 생성)는 제안하지 않습니다. 생성 반환 전에 모든 노드·값·오류·revision을 확정합니다.

## 현재 비용과 제안 경계

현재 `loadSchemaNodeAtMount → writeSchemaNode → computeNode → finishSettlement`는 정적 폼에도 범용 scratch, 선언 선택, 전이, 상태 및 배달 후보를 마련합니다. 후보 v는 독립 스칼라 기본값을 가진 객체에서 compute를 2N에서 N으로 줄였지만, 후위 `initialOutputs` 목록과 깊이별 채움, 별도 커밋 방문은 남습니다. `array-1000`은 4,002개 노드 중 루트와 배열 두 노드가 각각 두 번 계산되어 4,004회이고 나머지 4,000개는 한 번입니다. 모두 두 번 계산한다고 일반화하지 않습니다.

제안은 **정적 eager 로드에서 노드를 한 번 내려가고 올라오며 형상·채움·출력·커밋 자료를 완성하고, 분기 없는 청사진에서는 분기 분석과 전용 색인을 만들지 않는 것**입니다. 한 번의 순회는 구현 목표이며 동등한 관측과 최소 계산이 계약입니다. 일반 경로는 조건 밖 입력에 그대로 남습니다.

## (i) 정적 첫 로드 경로

### 진입 판정과 fallback

청사진을 만드는 기존 순회에서 내부 capability 메타데이터를 수집합니다. 첫 로드 시 전체 스키마를 다시 검사하지 않습니다. `root.parent === null`, 첫 커밋 전, latent/pending-exit/기존 노드가 없고 다음 조건을 모두 증명한 경우에만 선택합니다.

- 작성된 게이트가 없고, `derived`, `injectTo`, `unsetValue`, watch/상태 표현식 등 다른 노드를 관측하거나 추가 전이를 만드는 선언이 없습니다. 정적 literal 기본값은 허용합니다. `controls.default`는 우선 보수적으로 일반 경로로 보냅니다.
- finite 정적 객체·배열·스칼라 형상입니다. 재귀 배열, virtual, 사용자 정의/whole-value 전략 및 미확정 동적 선언은 처음에는 일반 경로로 보냅니다. `$ref`/`allOf` 자체를 생략하지 않으며 청사진이 해소한 정적 결과만 사용합니다.
- 기본값·입력으로 자식 수를 즉시 결정할 수 있습니다. 배열 기본값 및 입력 배열은 부모의 원본 선택 후 자식을 생성합니다. 게이트 전환/부활/이탈/파생 라운드가 필요한 입력은 제외합니다.
- `DisableAutomaticWrites`는 별도 predicate가 아니라 같은 값 선택기의 플래그로 다룹니다. 명시 `undefined`, `null`, wrong-kind 입력에서 기존 해석을 증명하지 못한 조합은 **노드 변경 전에** 일반 경로를 선택합니다. 중간 생성 뒤 generic 경로를 재실행하지 않습니다.

판정은 외부 getter·renderer predicate를 다시 실행하지 않습니다. 현재 청사진의 순수 결과로 판정하며, 새로운 내부 metadata record는 생성부터 같은 필드를 같은 순서로 초기화합니다. 기존 공개 Blueprint/type surface는 넓히지 않습니다.

### 한 순회의 처리 순서

1. 기존 blueprint의 정적 문법·충돌·유한성 검증을 먼저 마칩니다. 기존 `setLoadValue`의 스냅숏 수명과 진입/실패 처리는 유지합니다. 커밋 번호 하나를 예약하되 배달은 아직 하지 않습니다.
2. 부모에 들어갈 때 원본 입력 우선순위와 부모 기본값을 해석하고 최종 자식 형상을 확정합니다. 작성 순서(정수 이름은 현재 `Object.values` 순서 포함)로 자식을 생성합니다. 부모가 배달에서 먼저여야 하므로 이때 배달 순서의 자리만 예약합니다.
3. 자식에 들어갈 때 자기 입력 또는 독립 기본값을 선택합니다. 부모 기본값이 제공한 명시 원본, null, 억제 플래그, literal container 기본값의 깊은 복사/공유 규칙은 기존 계약을 재사용합니다. 독립적인 기본값만 허용하므로 기존 깊이별 전이의 중간값을 관측하는 사용자가 없습니다. 의존성이 있으면 fallback입니다.
4. 자식 처리를 마치고 올라올 때 `Behavior.assemble`은 한 번만 호출합니다. local/emit·오류·required·초기 상태·payload·revision의 최종 값을 함께 준비합니다. mismatch와 경고는 기존 발생 순서의 자리에 기록하여 후위 계산 순서가 외부 오류 순서를 바꾸지 않게 합니다.
5. 최상위가 완성되면 전역 상태 집계를 확정하고 기존 진입 경계에서 한 번 공개합니다. 모든 노드의 revision을 리스너 호출 전에 확정하며 미구독 노드도 포함합니다. 값 getter는 이미 확정된 같은 참조를 읽습니다. 배달은 예약한 기존 순서로 기존 dispatcher가 수행합니다.

계산 중 미완성 값을 외부로 공개하지 않습니다. 생성 중 오류 보고 callback이나 재진입이 현재 관측할 수 있는 경계를 먼저 characterization하여 동등성이 입증되지 않으면 그 기능은 fallback입니다. 배달 목록을 최종적으로 순회하는 것은 **노드 재계산이 아니며** 이벤트 출력에 필요한 순회입니다. 전역 집계나 진단 확정에 최소한의 별도 마무리가 필요하면 이를 명시하고 single-pass 문구를 위해 계약을 훼손하지 않습니다.

### 생략할 범용 장부와 남길 자료

정적 선택은 blueprint의 불변 선언을 바로 사용하므로 occurrence별 `selectedDeclarationIds`, committed path index와 재등록을 만들지 않습니다. latent/pending-exit 조회, dirty 등록 및 host wheel, 빈 automatic/exited/perished 집합, 형상 재선택과 `initialOutputs` 재조립 목록도 필요하지 않습니다. 출처는 노드가 원본/기본값 중 무엇을 선택했는지 알고 있는 자리에서 정합니다.

실제 노드·부모/자식 참조·배열 identity·load snapshot·오류·최종 projection·배달 순서·previous·커밋 번호·revision은 남깁니다. 시간은 O(N) eager 생성/계산을 유지하면서 범용 장부와 중복 방문의 상수를 줄입니다. 추가 작업 메모리는 DFS 스택 O(D)와 기존 의미상 필요한 배달/경고 순서 O(N)입니다. 순서 보존용 새 셀을 도입한다면 scratch 감소분과 별도로 셀당 바이트를 측정합니다. 모든 per-node 메모리를 O(D)라고 주장하지 않습니다.

## (ii) branchless blueprint

분기 없음과 기능 없음은 다릅니다. `oneOf`/`anyOf`/`if`/`then`/`else`, discriminator, `controls.active` 및 참조를 통해 유입되는 게이트의 부재를 기존 선언 수집 과정에서 증명합니다. 루트에 키가 없다는 사실만으로 분기 없음을 판정하지 않습니다. 터미널 아래 무시되는 키도 현재 경고 정책을 유지합니다.

정적 판정에서는 선언과 종류/nullable의 fold, `$ref` 해소, allOf 정적 병합, 같은 이름의 충돌, 무한 eager 재귀, controls 형식/targets 검사, 경고, 작성 순서와 predicate identity 메모를 그대로 수행합니다. **조건 평가와 동적 선언 조합 분석**, gate-host/relocation 색인, 게이트 역의존 trie 및 빈 registry는 만들지 않습니다. 마지막에 capability만 확정하고 단순 소비자는 불변 빈 결과를 공유합니다. branchless가 증명되기 전에는 필요한 기능만 점진적으로 만들며, 미완성 mutable 공유 빈 Map/Set을 공개하지 않습니다.

`computed-visible-derived`처럼 분기 없는 폼에도 식과 의존성이 있으므로 식 컴파일·derive/watch/state 색인은 남깁니다. `getFeatureNodeIndex`는 게이트 색인이 아니라 state/watch 색인이므로 branchless라는 이유만으로 비우면 안 됩니다. state/watch도 없다는 독립 capability가 있을 때만 공유 빈 결과를 반환합니다. BLUEPRINT-002의 선언/Fragment 그래프를 없애지 않습니다. 불필요한 분기 메타데이터와 기능별 색인만 줄입니다.

시간은 정적 구조와 정합성 검사 O(S)를 유지하면서 분기용 추가 O(S) 스캔/등록을 생략합니다. 메모리는 불필요한 gate/dependency 인덱스 O(S)를 없애고 blueprint당 고정 capability record O(1)을 더합니다. 실제 제거 비율은 아래 분석 단계의 상한보다 작으며, 분석 전체를 0으로 만들 수 없습니다.

## 바꿀 파일과 손대는 함수의 루프 모양

아래 경로는 PKG 기준입니다. 먼저 `src/core/settle/DETAIL.md`, `src/core/blueprint/DETAIL.md`에 채택된 계약과 수용 기준을 반영합니다. 공개 경계 변화가 없으면 INTENT는 그대로입니다. 예약된 여섯 파일은 이 설계의 구현 범위에도 넣지 않았습니다.

| 파일 | 손대는 함수의 루프 모양 |
| --- | --- |
| `src/core/settle/utils/load/loadSchemaNodeAtMount.ts` | 손대는 함수의 루프 모양: `loadSchemaNodeAtMount`는 O(1) 자격 분기 한 번, 기존 finally 스냅숏 보존. |
| `src/core/settle/utils/load/loadStaticFirstTree.ts` (신설 제안) | 손대는 함수의 루프 모양: `loadStaticFirstTree`는 명시 스택 while 또는 DFS 자식 인덱스 for 한 번, 진입에서 shape/fill, 복귀에서 assemble/commit. |
| `src/core/settle/utils/load/canLoadStaticFirstTree.ts` (신설 제안) | 손대는 함수의 루프 모양: `canLoadStaticFirstTree`는 고정 필드 && 검사, 전체 노드 순회 없음. |
| `src/core/settle/utils/write/writeSchemaNode.ts` | 손대는 함수의 루프 모양: `writeSchemaNode`의 범용 fallback에는 새 순회 없음; 최초 분기 중복 진입 방지. |
| `src/core/settle/utils/compute/selectChildren.ts` | 손대는 함수의 루프 모양: `selectChildren`은 자식 for 하나의 선택/생성/하강 순서를 재사용할 내부 단위로 분리, generic wheel 유지. |
| `src/core/settle/utils/compute/enterSchemaNode.ts` | 손대는 함수의 루프 모양: `enterSchemaNode`의 입력 선택은 루프 없음; 정적 경로는 latent/pending-exit 경로 문자열을 만들지 않음. |
| `src/core/settle/utils/compute/updateOutput.ts` | 손대는 함수의 루프 모양: `updateOutput`은 기존 Behavior 호출을 한 번; 새 정적 경로의 후위 완료에서 사용. |
| `src/core/settle/utils/transition/readDefault.ts` | 손대는 함수의 루프 모양: `readDefault`의 독립 literal 선택은 선언 인덱스 for, 동적 제어는 generic으로 한정. |
| `src/core/settle/utils/commit/commitSettlement.ts` | 손대는 함수의 루프 모양: `commitSettlement`의 per-node 처리와 최외곽 확정을 분리; 정적 경로에 전체 후보 재순회를 추가하지 않음. |
| `src/core/settle/utils/commit/markCommitDeliveries.ts` | 손대는 함수의 루프 모양: `markCommitDeliveries`의 노드별 확정 단위를 정적 후위 완료에서 호출; 예약된 배달 자리 순서는 바꾸지 않음. |
| `src/core/settle/utils/commit/commitGlobalState.ts` | 손대는 함수의 루프 모양: `commitGlobalState`의 노드별 집계는 같은 방문에서 누적, 최외곽 키 for 한 번으로 publish. |
| `src/core/blueprint/blueprint.ts` | 손대는 함수의 루프 모양: `blueprint`는 기존 생성/동결 순회에 capability 확정을 결합, branchless 판정용 사전 전체 스캔 없음. |
| `src/core/blueprint/utils/analyze/type.ts` | 손대는 함수의 루프 모양: 함수 없음; AnalysisContext의 고정 capability 필드 또는 내부 sidecar 형을 정의. |
| `src/core/blueprint/utils/analyze/buildNodes.ts` | 손대는 함수의 루프 모양: `buildNodes`의 입력/선언/group 체인을 각 자료별 for로 융합하고 gate가 없으면 host-key 분석 생략. |
| `src/core/blueprint/utils/analyze/collectDeclarations.ts` | 손대는 함수의 루프 모양: `collectDeclarations`의 고정 키 검사와 선언 for 안에서 기능 존재를 기록; 분기 없음에 빈 gate/discriminator 분석 생략. |
| `src/core/blueprint/utils/analyze/populateNodeChildren.ts` | 손대는 함수의 루프 모양: `populateNodeChildren`의 자식 인덱스 for에서 순서·재귀·capability 결합. |
| `src/core/blueprint/utils/analyze/validateShape.ts` | 손대는 함수의 루프 모양: `validateShape`는 유한성 DFS 방문 표 유지; 이미 증명된 정적 결과를 공유하고 검증 생략 없음. |
| `src/core/blueprint/utils/analyze/compileBlueprintExpressions.ts` | 손대는 함수의 루프 모양: `compileBlueprintExpressions`는 선언 for에서 식이 있는 기능만 컴파일/등록; 분기 없음으로 derive를 지우지 않음. |
| `src/core/blueprint/utils/features/getFeatureNodeIndex/getFeatureNodeIndex.ts` | 손대는 함수의 루프 모양: `getFeatureNodeIndex`는 capability O(1) 검사 뒤 공유 빈 결과 또는 실제 builder 한 번. |
| `src/core/blueprint/utils/features/getFeatureNodeIndex/utils/buildFeatureNodeIndex.ts` | 손대는 함수의 루프 모양: `buildFeatureNodeIndex`의 childEntries/prefixItems/item 열거는 map/spread 없이 각각 인덱스 for, state/watch 수집 결합. |
| `src/core/settle/utils/transition/getTransitionCap.ts` | 손대는 함수의 루프 모양: `getTransitionCap`은 branchless capability이면 1 반환, 일반 경로만 실제 gate 순회. |
| `src/core/settle/utils/write/getDependencyIndex.ts` | 손대는 함수의 루프 모양: `getDependencyIndex`/`DependencyIndex`는 의존 없음이면 공유 빈 조회 결과; 실제 기능만 선언/에지 for로 등록. |

기존 entry point 밖으로 internal helper를 내보내지 않습니다. per-node helper 추출은 해당 commit/compute organ 아래 두며, 외부 소비자를 늘리거나 public Blueprint 형을 바꾸는 방향이면 원장 관리자 재검토 대상입니다. 새 helper의 구체 명칭은 구현 계획에서 확정합니다.

## 뒤집는 원장 항목 없음

각 링크의 `### ID` 제목이 근거입니다. 유지 방법이 증명되지 않은 행은 최적화 범위를 축소하며 원장 문구를 바꾸지 않습니다.

| 원장 `### ID` | 유지할 관측/제약 | 제안의 보존 장치 | 뒤집음 |
| --- | --- | --- | --- |
| [GOAL-071](../../ledger/goal.md) | 생성이 곧 첫 정착, 순서는 단일 순회 | eager 완성 뒤 반환; 재계산 없는 DFS, 순서 셀 | 없음 |
| [GOAL-011](../../ledger/goal.md) | 비용은 변경 영역과 의존 에지에 비례 | 최초 생성 최적화만; 업데이트의 dirty 범위 확대 없음 | 없음 |
| [NODE-006](../../ledger/node.md) | Behavior는 계산만, 같은 순서와 정적 공유 | 기존 Behavior 호출/선언/자식 순서 및 참조 규칙 재사용 | 없음 |
| [SETTLE-001](../../ledger/settle.md) | 동기·단방향 정착과 고정 단계 의미 | 노드 안에서 shape→fill→finalize 순서, 외부 공개 경계 유지 | 없음 |
| [SETTLE-005](../../ledger/settle.md) | 생긴 노드 채움·이탈·전이 상한 | 전이가 없음을 증명한 로드만, 나머지 generic wheel | 없음 |
| [SETTLE-017](../../ledger/settle.md) | 순회/기록/역의존/라운드 상한 | 같은 노드 계산 1회 목표, 동적 에지는 그대로 유지 | 없음 |
| [SETTLE-046](../../ledger/settle.md) | 로드의 최종 형상 채움과 inject/unset 발화 | literal fill만 통합, inject/unset는 일반 경로 | 없음 |
| [BLUEPRINT-001](../../ledger/blueprint.md) | 생성 때 순수 분석, 원본 불변 | 정적 검증 eager, capability를 기존 분석에 결합 | 없음 |
| [BLUEPRINT-002](../../ledger/blueprint.md) | ObjectBlueprint/Fragment/선언 구조 | 정적 그래프 유지, 분기용 부가 색인만 생략 | 없음 |
| [BLUEPRINT-012](../../ledger/blueprint.md) | 정적 충돌은 생성 오류, 동적 충돌은 정착 오류 | 충돌 검사·코드·위치·발생 순서 유지 | 없음 |
| [BLUEPRINT-044](../../ledger/blueprint.md) | 허용집합 fold와 S0–S6, terminal 경고 | 분기 부재는 gate 전용 단계에만 적용, 종류 판정은 유지 | 없음 |
| [EVENT-001](../../ledger/event.md) | 통지 전용 및 리스너 무관 카운터 | 구독과 무관하게 모든 대상의 payload/revision 준비 | 없음 |
| [EVENT-007](../../ledger/event.md) | 배달 집합 전체 revision이 리스너보다 먼저 | 전체 완성 전에는 배달 금지, root 집계까지 확정 | 없음 |
| [EVENT-024](../../ledger/event.md) | 마지막 통지 previous·커밋 번호·불변 payload | 초기 previous와 후속 A→B→A 단언, freeze 유지 | 없음 |
| [VALUE-013](../../ledger/value.md) | 읽기는 계산하지 않고 같은 참조 반환 | getter 전 eager memo 완료, 읽기 시 분석/생성 없음 | 없음 |
| [VALUE-035](../../ledger/value.md) | 채움은 생김 사건, visible은 생성 아님 | 최초 노드 생성과 fill 결합, 기존 노드 reload/visible 제외 | 없음 |

## 차등 테스트 설계

`src/core/settle/__tests__/static-first-load-differential.test.ts` 및 blueprint owner의 `__tests__`에 배치합니다. 일반 경로와 제안 경로에 별도 runtime을 만들고 같은 작성 스키마/입력을 공급합니다. 내부 eligibility 함수를 테스트 mock으로 false로 고정하여 generic oracle을 얻으며 공개 force 옵션은 만들지 않습니다. 기존 후보 v도 oracle에서 제외해 일반 shape→transition→commit 경로를 비교합니다.

- **값·identity**: local/emit/raw/default 및 자식 순서/paths를 비교합니다. 각 경로 안에서 value 두 번, find 두 번, children 두 번이 같은 참조인지 검사합니다. 서로 다른 runtime 간 객체 `===`는 요구하지 않습니다. 첫 로드 후 같은 값 쓰기와 부분 쓰기로 동일한 구조 공유와 미변경 형제 identity를 확인합니다.
- **오류**: static conflict/잘못된 type/무한 eager shape/terminal 경고는 생성 시점, code/path/순서를 비교합니다. wrong-kind 입력의 mismatch 목록, validation OFF/ON·sync/async 오류 배정과 reporter 호출 순서도 비교합니다. 예외 경계의 오류 후 상태까지 일치해야 합니다.
- **배달·revision**: dispatcher 경계에 `(path, event bit, source, previous, current, commit, revision)`을 기록합니다. 모든 노드의 비트별 revision을 무구독과 구독 양쪽에서 비교하고 첫 리스너 안에서 다른 모든 노드의 revision이 이미 확정됐는지 단언합니다. RequestRefresh·diagnostics·global-state·warning 순서, listener 재진입 및 이후 A→B→A도 비교합니다.
- **매트릭스**: 평면/깊은 객체/정수 및 escaped 이름/배열 0·1·1,000개, 입력 없음·부분 입력·부모/자식 default 충돌·null·wrong-kind·DisableAutomaticWrites, 정적 ref/allOf/recursive cut를 나눕니다. gates·latent·derived·injectTo·unsetValue·virtual·watch는 fallback을 선택하고 generic과 완전히 같음을 확인합니다. 테스트 파일별 case 상한을 지키고 acceptance group을 분리합니다.
- **복잡도**: 입력이 바뀐 형제 영역을 포함한 배열 push/remove와 첫 로드를 각각 계측합니다. 호출 횟수와 실제 dirty 계산을 구별하고 node object identity를 키로 사용합니다. 자격 있는 최초 로드에서 N개 노드가 각 1회 계산, N회 이하 assembly임을 단언합니다. timing과 tracing은 다른 실행으로 분리합니다.

구현 전에 위 테스트를 generic에서 통과시켜 기준을 고정하고, 최적 경로 후 같은 assertion을 그대로 실행합니다. scope/순서/참조/오류를 바꿔 수치를 맞추지 않습니다. 마지막 검증은 사용자 지정 PKG vitest(unit/render/react18), tsc, eslint이며 EVENT-070 네 사례만 예외입니다.

## 단계별 절감 예산과 한계

원 자료는 [기존 재측정](./remeasure-86c02.md)의 `86c02-final-core-traced.json`, `86c02-final-render-traced-production.json` 및 production plain 자료입니다. [요약 JSON](./round-87-phase-summary.json)은 per-phase median/p99, 호출 수, 함수별 ms/호출 수만 보존하며 개별 span trace는 복제하지 않습니다. `bench/round-87-budgets.mjs`가 아래 표를 재생성합니다.

**A**는 branchless mount의 analysis 전체 시간이라는 느슨한 상한입니다. 정적 검사·그래프 생성은 남으므로 전부 절약할 수 없습니다. **S**는 자격이 있는 static mount의 settlement+delivery를 표본 안에서 더한 값의 중앙값입니다. eager 생성 비용은 제거하지 않으므로 creation은 넣지 않았습니다. assembly·revision·필수 배달도 남으므로 S 역시 달성 예측치가 아닙니다. derived 폼의 첫 로드 S는 0이며, 식이 남아도 gate 분석을 생략할 여지는 A 범위 안에 있습니다.

코어 간극은 기존 게이트인 traced **active**에서 `new−1.5×old`의 양수분입니다. React 간극은 production plain **Profiler**에서 mount `new−1.2×old`, update `new−old`입니다. ON 코어는 기록만이며 비-AJV 잔차를 별도 1.5배 기준으로 표시합니다. median 비가법성과 계측 오버헤드 때문에 A+S를 간극에서 빼거나 목표 달성을 선언하지 않습니다. 모든 update와 branch 행의 이 두 설계 예산은 0입니다. 해당 미달 행에는 별도 PR-7 개선이 필요하며 G26은 열려 있습니다.

| 층 | 행 | 검증 | 작업 | 85C-01 간극 ms | 분석 상한 A ms | 첫 로드 상한 S ms |
| --- | --- | --- | --- | ---: | ---: | ---: |
| core | flat-50 | off | mount | 1.0898 | 0.9520 | 1.6887 |
| core | flat-50 | off | update | 0.0000 | 0.0000 | 0.0000 |
| core | flat-100 | off | mount | 1.7595 | 1.3704 | 2.4312 |
| core | flat-100 | off | update | 0.0000 | 0.0000 | 0.0000 |
| core | flat-500 | off | mount | 5.3120 | 4.3306 | 7.4320 |
| core | flat-500 | off | update | 0.0000 | 0.0000 | 0.0000 |
| core | nested-d3-f4 | off | mount | 1.6839 | 1.2408 | 2.1686 |
| core | nested-d3-f4 | off | update | 0.2253 | 0.0000 | 0.0000 |
| core | nested-d5-f4 | off | mount | 16.3792 | 11.7054 | 20.6165 |
| core | nested-d5-f4 | off | update | 0.2147 | 0.0000 | 0.0000 |
| core | array-100 | off | mount | 0.0000 | 0.1862 | 4.1035 |
| core | array-100 | off | update | 0.0043 | 0.0000 | 0.0000 |
| core | array-500 | off | mount | 0.0000 | 0.2081 | 18.0870 |
| core | array-500 | off | update | 0.0000 | 0.0000 | 0.0000 |
| core | array-1000 | off | mount | 0.0000 | 0.2058 | 33.5706 |
| core | array-1000 | off | update | 0.0000 | 0.0000 | 0.0000 |
| core | oneOf-5 | off | mount | 1.2379 | 0.0000 | 0.0000 |
| core | oneOf-5 | off | update | 0.8310 | 0.0000 | 0.0000 |
| core | oneOf-5 | on | mount | 기록만 | 0.0000 | 0.0000 |
| core | oneOf-5 | on | update | 기록만 | 0.0000 | 0.0000 |
| core | oneOf-10 | off | mount | 1.5804 | 0.0000 | 0.0000 |
| core | oneOf-10 | off | update | 1.1147 | 0.0000 | 0.0000 |
| core | oneOf-10 | on | mount | 기록만 | 0.0000 | 0.0000 |
| core | oneOf-10 | on | update | 기록만 | 0.0000 | 0.0000 |
| core | oneOf-20 | off | mount | 2.0736 | 0.0000 | 0.0000 |
| core | oneOf-20 | off | update | 1.6568 | 0.0000 | 0.0000 |
| core | oneOf-20 | on | mount | 기록만 | 0.0000 | 0.0000 |
| core | oneOf-20 | on | update | 기록만 | 0.0000 | 0.0000 |
| core | computed-visible-derived | off | mount | 0.4099 | 0.2194 | 0.0000 |
| core | computed-visible-derived | off | update | 0.2755 | 0.0000 | 0.0000 |
| core | if-then | off | mount | 0.4588 | 0.0000 | 0.0000 |
| core | if-then | off | update | 0.1582 | 0.0000 | 0.0000 |
| core | if-then | on | mount | 기록만 | 0.0000 | 0.0000 |
| core | if-then | on | update | 기록만 | 0.0000 | 0.0000 |
| core | oneOf-5 | non-AJV residual | mount | 0.0000 | 0.0000 | 0.0000 |
| core | oneOf-5 | non-AJV residual | update | 0.0100 | 0.0000 | 0.0000 |
| core | oneOf-10 | non-AJV residual | mount | 0.0000 | 0.0000 | 0.0000 |
| core | oneOf-10 | non-AJV residual | update | 0.0000 | 0.0000 | 0.0000 |
| core | oneOf-20 | non-AJV residual | mount | 0.0000 | 0.0000 | 0.0000 |
| core | oneOf-20 | non-AJV residual | update | 0.0360 | 0.0000 | 0.0000 |
| core | if-then | non-AJV residual | mount | 0.0000 | 0.0000 | 0.0000 |
| core | if-then | non-AJV residual | update | 0.0681 | 0.0000 | 0.0000 |
| render | flat-50 | off | mount | 0.0000 | 0.5811 | 1.1132 |
| render | flat-50 | off | update | 0.0000 | 0.0000 | 0.0000 |
| render | flat-100 | off | mount | 0.0000 | 1.0231 | 1.8182 |
| render | flat-100 | off | update | 0.0000 | 0.0000 | 0.0000 |
| render | flat-500 | off | mount | 0.0000 | 3.2367 | 6.1964 |
| render | flat-500 | off | update | 0.0000 | 0.0000 | 0.0000 |
| render | nested-d3-f4 | off | mount | 0.1636 | 0.9405 | 1.6940 |
| render | nested-d3-f4 | off | update | 0.0168 | 0.0000 | 0.0000 |
| render | nested-d5-f4 | off | mount | 0.0000 | 12.7487 | 21.6405 |
| render | nested-d5-f4 | off | update | 0.0360 | 0.0000 | 0.0000 |
| render | array-100 | off | mount | 0.0000 | 0.1874 | 4.4110 |
| render | array-100 | off | update | 0.0000 | 0.0000 | 0.0000 |
| render | array-500 | off | mount | 0.0000 | 0.2228 | 19.8049 |
| render | array-500 | off | update | 0.0000 | 0.0000 | 0.0000 |
| render | array-1000 | off | mount | 0.0000 | 0.1947 | 38.1925 |
| render | array-1000 | off | update | 0.0000 | 0.0000 | 0.0000 |
| render | oneOf-5 | off | mount | 1.0991 | 0.0000 | 0.0000 |
| render | oneOf-5 | off | update | 0.0000 | 0.0000 | 0.0000 |
| render | oneOf-5 | on | mount | 0.0000 | 0.0000 | 0.0000 |
| render | oneOf-5 | on | update | 0.0785 | 0.0000 | 0.0000 |
| render | oneOf-10 | off | mount | 1.6359 | 0.0000 | 0.0000 |
| render | oneOf-10 | off | update | 0.0000 | 0.0000 | 0.0000 |
| render | oneOf-10 | on | mount | 0.0000 | 0.0000 | 0.0000 |
| render | oneOf-10 | on | update | 0.0999 | 0.0000 | 0.0000 |
| render | oneOf-20 | off | mount | 2.5092 | 0.0000 | 0.0000 |
| render | oneOf-20 | off | update | 0.0000 | 0.0000 | 0.0000 |
| render | oneOf-20 | on | mount | 0.0000 | 0.0000 | 0.0000 |
| render | oneOf-20 | on | update | 0.1125 | 0.0000 | 0.0000 |
| render | computed-visible-derived | off | mount | 0.3560 | 0.2185 | 0.0000 |
| render | computed-visible-derived | off | update | 0.0182 | 0.0000 | 0.0000 |
| render | if-then | off | mount | 0.3236 | 0.0000 | 0.0000 |
| render | if-then | off | update | 0.0034 | 0.0000 | 0.0000 |
| render | if-then | on | mount | 0.0000 | 0.0000 | 0.0000 |
| render | if-then | on | update | 0.0906 | 0.0000 | 0.0000 |
| render | oneOf-5 | non-AJV residual | mount | 0.0000 | 0.0000 | 0.0000 |
| render | oneOf-5 | non-AJV residual | update | 0.1826 | 0.0000 | 0.0000 |
| render | oneOf-10 | non-AJV residual | mount | 0.2458 | 0.0000 | 0.0000 |
| render | oneOf-10 | non-AJV residual | update | 0.1828 | 0.0000 | 0.0000 |
| render | oneOf-20 | non-AJV residual | mount | 0.1052 | 0.0000 | 0.0000 |
| render | oneOf-20 | non-AJV residual | update | 0.2870 | 0.0000 | 0.0000 |
| render | if-then | non-AJV residual | mount | 0.0000 | 0.0000 | 0.0000 |
| render | if-then | non-AJV residual | update | 0.1309 | 0.0000 | 0.0000 |

## 원장 관리자에게 남기는 질문

1. 부모 우선 배달 자리를 진입 때 예약하고 노드 결과·revision을 후위에서 확정하되 첫 리스너 전에 전체를 완성하는 방식이 EVENT-007/SETTLE-001의 일괄 커밋 의미를 그대로 구현하는 것으로 인정됩니까? 동기 오류 reporter가 중간 상태를 관측하는 경우의 허용 경계를 확인해 주십시오.
2. 첫 구현의 eligibility를 무게이트·무표현식·무잠복·유한 객체/배열과 literal 기본값으로 제한하고, `controls.default`·virtual·recursive array·whole-value 전략을 fallback으로 두어도 됩니까? null/wrong-kind를 포함하는 확대 순서를 정해야 합니다.
3. BLUEPRINT-002의 정적 Fragment/선언 그래프는 보존하면서 분기 전용 분석/색인만 없애는 범위를 승인하십니까? branchless라도 derive/watch/state는 유지한다는 구분을 확인해 주십시오.
4. 순서 보존을 위한 O(N) 배달 자리와 O(D) DFS 스택은 허용하되 선택 선언·dirty·empty delivery 장부를 없애는 설계가 87라운드의 최소 순회 원칙에 맞습니까? 필수 출력 순회와 노드 재계산을 별도 계수로 보고할 것을 제안합니다.
5. A/S는 달성 가능한 절감량이 아니라 상한입니다. update·분기 미달 행은 이 제안으로 해결되지 않습니다. 이 둘을 먼저 PR-7에서 구현·재측정한 뒤 남은 행별 설계를 이어가며 G26을 계속 열어 두는 순서를 확인해 주십시오.
