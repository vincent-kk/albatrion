# @canard/schema-form 쓰기·보유 원본 축소 설계

비교 기준은 `1c77ced57`, 현행은 `f395ce12a`입니다. 추적 파일은 읽기 전용입니다. 소유자 규칙 0에 따라 필요한 의미와 그 책임을 먼저 확정하고, 줄 수는 변경 규모와 중복의 증거로 사용합니다. 바운티 FIXES, 병합 기록, 통합점 패키지 문서에 결정된 동작과 계약은 유지합니다. 이 설계는 그 계약의 내부 구현을 정리합니다.

## 1. 엔진 동작

- 호출자 쓰기는 실제 저장 주소에 적용합니다. 살아 있는 대상은 정적 종류로 해석하여 원본·extras를 변경하며, 이번에 쓰인 원래 입력만 정착 규칙에 따라 최종 유효 목록으로 다시 해석할 수 있습니다. 비활성 주소는 살아 있는 호스트로 쓰고 정확한 후보의 보유 원본을 변경합니다. 떼어진 노드 참조는 쓰기를 거절합니다. Merge는 branch 객체에 대한 평범한 객체 입력에서 실제 지명한 own 키만 병합합니다. 그 외에는 해당 자리를 교체합니다. 통째 쓰기는 생략 키를 지우며, 명시 undefined는 없음입니다. 가상 쓰기는 호출 진입 시점의 물리 구성원 주소로 바꾸고, 부재 구성원의 undefined 칸은 보유합니다.
- 배치의 호출자 쓰기는 작성 순서대로 적용되어 후속 updater의 typed 저장값, 같은 가상 튜플 판정 및 Merge에 보입니다. 보통 공개 읽기는 마지막 커밋을 봅니다. 채움·게이트·파생·생김과 나감의 반응은 표시 구간의 최종 호출자 상태로 시작하며, 중간 호출자 상태는 반응의 에지를 만들지 않습니다. 배열 구조 동사와 subtree reset은 구간을 닫습니다. 구조 동사는 앞선 표시를 먼저 정착합니다. Subtree reset은 자기 범위를 우선 보류하고 나머지를 정착한 뒤 로드합니다. 그 정착이 대상을 떼어 reset이 거절되면 보류 표시를 다음 구간에 살리되 실제로 뒤따른 쓰기가 덮은 주소는 제외합니다. 폼 reset은 보류 표시를 비우고 즉시 로드합니다. 배달·검증·onChange는 바깥 경계에 모입니다. 폼이 자동 쓰기를 기본 억제하고 명시적 DisableAutomaticWrites 없이 EnableAutomaticWrites가 섞이는 기존 예외에서는 호출별로 정착합니다.
- 나갈 때 기본값은 원본 보존입니다. 마지막 살아 있던 커밋의 정책(node > fields > fragment > Form, 같은 층은 keep 우선)과 정상 보존 나감의 resolver를 적용하고, 나가는 부분 트리 안의 명시 호출자 범위에 대해서는 resolver를 억제합니다. 호출자와 함께 정착한 unset은 호출자 원본도 지웁니다. 이미 나가는 주소에 적용된 선언 쓰기와 취소된 이탈에서 이어진 범위는 정책 결과 위에 놓습니다. 정상 보존 나감에서 콜백의 마지막 non-undefined가 선언 inactiveValue에 앞서고, 이탈 주소에 쓰인 명시 non-undefined는 resolver보다 앞섭니다. 이탈이 취소되면 같은 노드의 직전 원본에 그 쓰기를 반영하고, 다시 나가도 해당 후보의 덮이지 않은 권리는 이어집니다. 실제 이탈을 커밋한 뒤 돌아오는 정확한 후보는 보유한 source·extras·자손 보유값을 복제해 새 노드로 돌아옵니다. 같은 경로의 다른 후보나 잘린 배열 자리의 신생 항목은 그 원본을 상속하지 않습니다.
- 겹친 쓰기 순서는 낮은 것부터 정합니다. 호출자 쓰기는 구간 내 호출 순서, 자동 쓰기는 호출자 뒤 실제 정착 라운드 순서, 같은 라운드에 적용할 겹친 승자는 낮은 쪽부터 채움 → injectTo → derived → unsetValue 순위입니다. 같은 종류 안에서는 원천의 트리 전위 문서 순서가 뒤일수록, 같은 원천 안에서는 조각 controls → 부모 fields → 노드 자체 순으로, 같은 층에서는 선언 및 반환 순서가 뒤일수록 높습니다. derive가 같은 대상의 이전 상위 종류를 보고 후보를 탈락시키는 자격 규칙도 유지합니다. 탈락하지 않은 쓰기는 실제 적용 순서로 접으며 서로 다른 깊이의 주소 때문에 나중 라운드의 수락 쓰기를 버리지 않습니다. 앞 승자를 계산한 후 다음 승자가 실제로 값을 바꾸는지 봅니다. 같은 라운드의 겹치지 않는 승자는 계산을 공유합니다. 나가는 주소에도 이 순서를 적용합니다. 나가는 대상 자체의 뒤 whole은 생략 키도 지우고, 자식 한 키 쓰기는 형제를 건드리지 않습니다. 살아 있는 부모에 대한 선언 whole은 활성 생략 자손을 지우며 비활성 자손은 실제로 지명했을 때만 갱신합니다. 자동 예산 실패는 호출자 원본 B와 배열·보유 바인딩을 되돌려 확정하며 실패한 자동 효과는 버립니다.

근거는 engine DETAIL의 SETTLE-043 및 virtual-storage-model, write DETAIL의 EVENT-013/019/061·WRITE-015, settle DETAIL의 SETTLE-011·WRITE-013/079/090/098·VALUE-031/040/043·NODE-065, derive/evaluateDeriveRound DETAIL의 SETTLE-004와 아래 수용 테스트입니다. 기준 커밋의 고정 출발점·확정/배달·원본 B·다시 들어오는 새 인스턴스 및 정적 빠른 경로의 계약을 유지합니다.

## 2. 결함과 수용 테스트

경로 약칭은 `E=packages/canard/schema-form/src/core/engine`, `T=E/__tests__`, `W=E/write/__tests__`, `S=E/settle/__tests__`입니다. 아래 FIXED는 통합 HEAD에서 수정된 상태를 뜻합니다. 새 설계의 검증 결과가 아닙니다.

| 행 | 상태 | 지켜야 할 자체 결함 수정 | 커밋된 검증 |
|---|---|---|---|
| R3.5 | FIXED | 중첩 Merge와 무관한 형제 쓰기, 두 Merge, updater, visitSubtree에서 생략한 중첩 키와 비활성 원본 보존 | W/batchMerge.round-three.test.ts (6건, 35–77행), W/batchInactiveMerge.test.ts |
| R6.1 | FIXED | 이미 비활성인 객체에 배치 Merge 두 번, 앞의 실제 키를 유지하며 지정한 중첩/말단만 변경 | W/batchInactiveMerge.test.ts, W/batchMerge.round-three.test.ts, T/batchDeclarativeWrites.test.ts |
| R6.2 | FIXED | 무관한 쓰기와 identity updater 또는 빈 자식 쓰기로 null·잘못된 종류의 조상을 잃지 않음. 자식 방출이 있을 때만 승격. 자기 저장값, 비활성 자식 제외, 명시 clear와 조상 생략 구별, 선언·extras 키 순서, 배열 조립을 보존 | src/__tests__/e2e/batchNonobjectAncestor.render.test.tsx, W/batchInactiveUpdater.test.ts, W/batchStoredKeyOrder.test.ts, W/batchStoredEmptyValue.test.ts, T/batchStoredAssemblyModel.test.ts, T/batchCallerReviewModel.test.ts |
| R5.C | FIXED | 자기 주소·부모 입력·조상 아래·가상 구성원의 선언 값이 적용 시점에 이미 이탈 중이면 정책 위에 보존. 이미 비활성이면 최신 결정을 저장하고 앞 분배가 덮지 않음. 취소된 이탈은 목표 자손에만 쓰고 같은 노드로 재진입. 객체 whole·키의 승자 순서를 이탈/재활성에서도 지킴 | T/departingDeclarativeWrites.test.ts, T/overlappingLatentWrites.test.ts, T/declarativeWriteRouting.test.ts, T/declarativeWriteRoutingModel.test.ts, T/departingRecordRank.test.ts, T/revivedRecordAddress.test.ts, T/virtualConstituentAddresses.test.ts |
| R5.D | FIXED | 겹친 승자는 전체 순위로 적용하고 뒤 승자가 처음 값과 같아도 앞 계산 결과와 비교하여 되돌릴 수 있음. 겹치지 않는 승자는 한 계산을 공유 | T/batchTwoLayerContract.test.ts, T/batchReactionDimensions.test.ts, T/overlappingLatentWrites.test.ts |
| R5.F | FIXED | 장벽이 reset 대상을 떼면 성공한 앞 쓰기를 지우지 않음. 뒤 whole은 실제 범위 전체를 이기고 뒤 Merge는 실제 키만 이김. 한 구성원 가상 Merge도 물리 주소로 계산 | T/refusedResetOverlap.test.ts (51–190행 부근), T/batchTwoLayerContract.test.ts (326행 이후), W/batchReset.round-three.test.ts |
| R5.G | FIXED | 취소된 첫 이탈의 명시 값을 같은 정착의 두 번째 이탈에서 유지. 이후 살아 있는 쓰기로 덮인 것만 제거. 기본·unset·inactiveValue·onInactive 및 중첩, 배열을 포함 | T/revivedDepartingWriteSecondExit.test.ts (169행 이후), T/declarativeWriteRoutingModel.test.ts |
| R5.H | FIXED | 살아 있는 부모 whole의 명시 값에 나감 정책 적용. 앞 생략/채움의 B 복구가 뒤에 지명된 손자 또는 미생성 배열 자리를 덮지 않음. 이탈 부모 아래 이미 비활성인 자리의 최신 명시값도 유지 | T/liveWholeWriteExit.test.ts, T/liveWholeFillOrder.test.ts, T/liveWholeNestedFillExit.test.ts, T/liveWholeInactiveSlotExit.test.ts |
| R5.I | FIXED | 같은 물리 경로의 다른 후보가 취소된 이탈의 정책 뒤 권리를 받거나 빼앗지 않음. 덮인 후보·채널만 교체 | T/revivedCandidateOwnership.test.ts, T/revivedDepartingWriteSecondExit.test.ts, T/revivedInactiveSlotDecision.test.ts |
| R5.J | FIXED | 앞 생략과 작업 값이 같은 명시 unset도 보유 결정을 갱신. 예산 실패 시 정적 호출자 B와 배열 및 슬롯 복구. updater의 생략과 외부 전달 출처 유지. 현재 지명되지 않은 이탈 이웃의 원본 보존 | T/equalNamedSourceExit.test.ts, T/retainedSourcesBudget.test.ts, T/retainedCallerView.test.ts, T/retainedDistributionDelivery.test.ts, T/retainedExitNeighbors.test.ts |
| R5.K | FIXED | 잘랐다가 자란 배열에서 옛 후보를 되살리지 않음. 같은 후보에 대한 나중 비활성 쓰기가 앞 권리를 덮음 | T/retainedArrayGeneration.test.ts, T/revivedInactiveSlotDecision.test.ts |

인접 계약도 전체 suite에서 유지합니다. R3.9·10의 배열 신원/오류/참조 이동과 성공 reset 장벽, R4.2·3·12·13의 가상 reset 물리 범위, 호출별 자동 옵션, own-key, R5.1·4 및 P1–P3의 가상 튜플·비활성 원본·입력 전달, R5.A·B·E의 선언 whole·typed updater·성공 reset 이전 반응입니다. 대표 검증은 W/batchReset.round-three.test.ts, T/batchReactionDimensions.test.ts, T/batchTypedRead.test.ts, W/batchEffectiveView.test.ts, S/settle.batch-automatic-object.test.ts, T/virtualConstituentAddresses.test.ts, T/ancestorWholeOverResolver.test.ts입니다. 발견 원문은 `bug-bounty/round-3/canard-schema-form.md` 5·9·10, `round-6/canard-schema-form.md` 1·2이며 R5.C–K의 직접 증거는 `round-5/FIXES.md` 210–267행과 476–499행입니다. 라운드 6에는 별도의 FIXES.md가 없습니다.

## 3. 설계

**주소를 해석하는 결정을 한 곳에 두고, 보존할 내용은 기존 슬롯 패치의 형태로 한 번 접습니다.** 단일 쓰기/배치가 같은 함수를 호출합니다. 단일 쓰기는 지금처럼 라이브 원본·분배에 적용합니다. 배치는 원본을 건드리지 않고 마지막 값과 실제 쓰기 범위를 접어 현행처럼 한 번 정착합니다. 배치 전체의 라이브 복제와 쓰기마다 실행하는 compute/derive는 표시 구간의 값 접기에 필요하지 않습니다.

### 주소 결정과 배치

`settle/utils/input/decideAddressWrite.ts`가 단일 주소의 효과를 결정합니다. 입력은 현재 선택된 바인딩 또는 정적 후보, 원본 입력과 주소의 현재 상태(살아 있음, 비활성, 이탈 중), 쓰기 종류/단계, 명시 입력의 존재 여부입니다. 결과는 통째 교체(생략 범위 포함), 지명 키만 병합, 건너뜀과 실제 저장 대상입니다. branch 객체의 명시 키에서만 재귀적으로 Merge를 내리고 후보 없는 extras는 값 그대로 교체합니다. 선택된 자식 > 현재 보유 후보 결합 규칙 > 선언 후보 순을 각각의 기존 사용처에서 유지합니다. 선언이 여럿인 아직 미선택 슬롯에서 타입을 확정하지 않는 source 읽기도 유지합니다. 자식 열거는 공통 후보 조회 한 곳을 사용합니다. 조회 결과에는 실제 선택된 인스턴스와 정확한 후보 엔트리가 같이 들어가므로 조립기나 슬롯 기록에서 후보를 다시 고르지 않습니다. 여기서 쓰는 객체 검사 범위는 현행 `isPlain`입니다. prototype을 추가로 제한하면 기존 값의 의미가 바뀝니다.

- `markWrite`·`createSlotValueOverlay`는 주소 결정을 같은 재귀 단계에서 적용합니다. 현행 `staticSpec`과 behaviors의 변환·투영, `nextExtras`, `arrayExtras`, `assembleObjectValue`, `assembleArrayValue`를 사용합니다. 생략을 뜻하는 값과 주소가 명시되어 undefined를 받은 경우를 별도로 전달합니다. 선택/dirty 등록, 호스트의 새 슬롯에 늦게 적용하는 분배, 최종 유효 목록과 원래 입력은 계속 정착 소유입니다. 반환 튜플/객체를 모든 주소에 할당할 필요가 없습니다. 고정된 지명·교체 사실을 방문자에게 전달하고 정적 scalar·same-value·epoch의 기존 자격은 그 자격이 증명한 결정의 특수 입력으로 씁니다.
- `composeBatchValue`는 같은 주소 결정의 결과로 조상만 복사합니다. 입력 컨테이너에 쓰지 않고 같은 경로 접기에서 원래 개별 쓰기의 실제 물리 범위와 출처를 얻습니다. 부분 컨테이너와 whole 단말/배열/extras를 구별합니다. 배치는 현행의 합성 루트 입력을 작업 전달값으로 사용하며 그 루트 주소에 새 전체 교체 권한을 부여하지 않습니다. 착지하는 `markWrite`는 이미 계산한 범위를 분배에 적용합니다. 범위의 최신 출처(Refresh)와 앞 whole도 유지하는 합집합(resolver/정리)을 같은 범위에서 조회합니다. 가상 그룹 자체의 입력 대상과 실제 구성원 범위를 구별합니다. 원본 B, own/external relay, 반환 참조 복원의 기존 경계도 유지합니다.
- `resolveStorageTargets`로 호출 때 승인한 가상 자리들을 한 번 분류합니다. 선언 index와 물리 주소를 함께 쓰므로 한 자리 가상 Merge에서도 tuple을 문자열 키처럼 다루지 않습니다. load 경로는 명시 clear를 포함합니다. reset은 성공 시 현행대로 전체 보류 단위를 버리고 대상 범위를 로드합니다. 거절 시 실제 보류·앞선 쓰기를 원래 순서대로 두고 나중 범위의 결정을 기존 보류 쓰기에 합성합니다. 뒤 whole이 보류 대상 전체를 덮으면 그 단위는 떨굽니다. 뒤 Merge가 일부만 덮으면 기존처럼 두 입력의 순차 결과를 공통 주소 결정으로 재구성하고 보류 whole의 나머지 clear를 보존합니다. 보류 whole `{x:old,y:old}` 뒤의 외부 Merge `{x:new}`은 거절 뒤 `{x:new,y:old}`를 남깁니다. 이때 생략 키, 배열 whole과 terminal/extras 교체의 실제 커버리지는 원래 호출 입력 기준입니다. reset이 이미 분리된 경우는 진입에서 거절합니다. 성공 reset용 별도 기록에는 후속 후보 트리의 내부 구조를 남기지 않습니다.
- updater 대상의 바탕은 대상 자신의 커밋된 storedValue입니다. 조상 whole이 대상 자체를 생략하면 부재를 돌려주고, 대상 자신을 undefined로 비우면 활성 branch의 조립된 빈 그릇을 돌려줍니다. 가상의 비활성 칸은 undefined입니다. 원본 보존과 stored/output 조립은 결과가 다르므로 계속 구별하지만, static spec·자식 후보 선택·사이클 경계는 한 순회가 책임집니다. 사용하지 않은 updater 뷰는 만들지 않습니다. 배치의 조상 경로 복사와 최종 라이브 계산은 서로 다른 적용 효과입니다.
- 조상 승격 결정에 자식 방출 증거를 공통으로 전달합니다. 알려진 라이브 방출은 계산 결과를 쓰고 아직 계산하지 않은 caller view에서는 위 정적 입력 조립 결과를 씁니다. 잠복 후보는 실제 슬롯 패치가 낸 방출 가능성, 선택된 자식이 있는 호스트는 그 자식의 방출만 씁니다. 숨은 입력만 있고 라이브 자식이 방출하지 않으면 조상을 승격하지 않습니다. 잘못된 조상에만 원래 source를 보존하며, 현행 `BATCH_HOST_SOURCE` 표현과 단일 descriptor 작성기를 재사용합니다. 구체적으로 `null`/스칼라 원본을 가진 객체에서 빈 child/identity는 source를 유지하고, 명시 child가 방출한 경우에만 source를 놓습니다. 단일 정착의 승격 허용 시점은 현행 계산 이후로 유지하여 게이트의 공개 평가 순서를 바꾸지 않습니다. 자동 쓰기에는 caller 조상 수리를 적용하지 않습니다.

형제 `write`는 `settle`의 진입점으로 공통 결정을 소비합니다. 배치의 사슬·리셋·배달은 write, 입력 결정·배치 합성의 값 계산은 settle이 소유합니다. 기존 `writeFieldNode`를 단일·배치의 정착 진입으로 써 패키지 표면은 그대로입니다. 실제 소비자가 남는 내부 이름만 진입점에 둡니다.

### 보유 원본과 B

기존 `retainedSources`를 확장하면서 `departingWrites`와 `RevivedSlotSource`를 삭제합니다. 하나의 정착 한정 자료구조 안에서 실제 호스트와 후보 바인딩당 최신 채택 결정을 하나 둡니다. 살아 있거나 잠시 나간 노드는 실제 발생 identity, 아직 없는 자식은 실제 호스트 + 정규화된 `BlueprintChildEntry`를 사용합니다. 같은 주소라도 후보 토큰/청사진이나 배열 세대가 다르면 별도 셀입니다. 이미 활성 노드/슬롯을 가리키는 연결을 재사용합니다. 이탈·복귀 조회는 그 호스트 아래 건드린 범위로 국한합니다. 새 전체 발생 순회나 전역 경로 원장은 필요 없습니다.

각 기록이 보관하는 것은 다음 세 가지 시점의 차이입니다.

| 내용 | 기록이 필요한 이유 |
|---|---|
| 처음 자동 변경 직전의 B | source·extras·대기 분배, 배열의 최초 길이/오래된 항목 연결, 영향받은 후보 슬롯의 원래 instance/overlay. 처음 한 번만 잡고 rollback에 사용합니다. 최초 배열 구조와 snapshot 정렬용 최초 count가 같은 시점인 경우 같은 값을 쓰며 fill 직전 길이는 별도 시점입니다. |
| 최근 채택 입력과 보유 의사 | 실제 수락 순번, 원래 입력 출처(호출자/지명 규칙/생략·채움), B 또는 현재 원본 선택. 활성의 지명값은 기존 노드 채널을 읽고, 부재한 지명값이 필요할 때만 후보 셀의 overlay를 저장합니다. 낮은 부모 분배가 나중에 다시 적용돼도 순번으로 최신 셀을 이기지 못합니다. 출력이 같은 unset도 의사는 갱신하되 dirty/Refresh/재평가를 유발하지 않습니다. |
| 정책 뒤에 적용할 남은 범위 | 같은 셀에 원래 지명 채널과 이탈 중 whole 범위를 저장합니다. own source·extras·array length와 지명 자손은 기존 `InactiveSlotOverlay` 조립 규칙으로 접습니다. 앞선 whole 아래 남은 델타는 뒤 whole이 덮고, 뒤 자손 쓰기는 해당 채널만 바꿉니다. 순번은 적용 시 부여하며 재활성 때문에 새 순번을 발급하지 않습니다. |

- **이탈 중**에는 적용 시점에 루트에서 실제 주소를 따라가다가 만나는 첫 이탈 경계의 발생에 정책 뒤 효과를 접습니다. 이미 비활성인 선언 대상의 undefined는 지명 payload가 아니며, 살아 있는 자리의 명시 unset은 적용합니다. 실제 이탈은 기존 보유 정책·압축·resolver가 만든 결과에 기록의 남은 효과를 적용합니다. 순번을 다시 비교해야 하는 것은 서로 다른 pending 경계의 효과가 같은 후보 자리로 옮겨지는 때입니다. 공통 후보 셀에 넣을 때 본래 순번으로 접고, 나중에 깊이순으로 정렬하지 않습니다. 배열 압축의 현재 보유 주소에도 정확한 바인딩으로 도달합니다.
- **이탈 취소**는 그 발생에만 아직 라이브 적용하지 않은 효과를 한 번 적용합니다. 이때 한 번의 whole에서 필요한 생략 clear와 두 번째 이탈에서 필요한 지명 채널은 다릅니다. 먼저 전체를 라이브에 적용하고, 남은 post-policy 범위는 같은 셀의 지명 채널로 좁힙니다. 앞선 명시 범위에 되돌림용 데이터를 붙이지 않습니다. 해당 셀의 후속 활성 쓰기와 실제 지명한 비활성 쓰기만 자신의 커버리지를 무효화합니다. 조상에 부분 자손 하나가 supersede됐을 때 다른 지명 자손과 extras를 유지합니다. 배열은 길이 자체가 own 채널입니다. 세대 종료는 작업 후보에서만 먼저 적용하며 B의 예전 바인딩은 예산 복구에 남습니다.
- **일반 비활성 쓰기**는 같은 후보 셀 선택을 수정하고 슬롯 채널에 보냅니다. 선택/진입이 분배를 다시 읽을 때 `getChildDistribution`이 그 후보의 최신 결정을 먼저 읽습니다. 최근 입력이 더 우세하면 앞 분배에서 그 자리를 다시 쓰지 않습니다. 부모 분배의 다른 키·출처·원본은 그대로 두어 `rewriteCoveringDistributions`의 조상 payload 복사를 지웁니다. 부재 슬롯과 아직 만들어지지 않은 하위 호스트는 이 셀의 패치를 진입 시 소비합니다. 정상 이탈은 셀에서 고른 현재/B 원본을 기존 `createExitSlotOverlay`에 넘깁니다. 자동 예산 오류는 B에서 같은 셀을 읽어 복구하고 정책 뒤 효과를 모두 버립니다.
- `pendingExits`는 공개 노드 수명·등록과 같은 인스턴스의 재선택을 다루므로 유지합니다. `inactiveSlotOverlays` 및 슬롯 소유의 정확한 후보 분리는 커밋 간 보유 표현이라 유지합니다. `inactiveSlotBaselines`는 변경 전 발행값·참조를 비교하는 배달 증거입니다. 정착별 B와 시점이 다르므로 소유를 유지하고 후보 조회만 공유합니다. `writtenInputs`, computed/output, 리스너/검증 출처, 순수 gate/derive의 평가 상태와 예산은 각각 소비자가 다릅니다. 정착 동안 보관하는 값과 커밋 후 슬롯의 값도 수명이 다릅니다. 클론과 신규 itemKey 및 오류·상호작용의 새 수명은 현행 그대로입니다.

순서 예시에서 낮은 이탈 자손 `y='low'` 뒤 높은 이탈 whole `{z:'hz'}`는 앞 자손과 생략 범위를 덮으므로 `{z:'hz'}`만 남습니다. 순서를 뒤집으면 뒤 자손을 높은 순번으로 접으므로 `{z:'hz',y:'low'}`가 남습니다. 이탈 취소 뒤 다른 후보의 동일한 `/y` 쓰기는 기존 후보의 지명 권리에 닿지 않습니다. 반대로 같은 후보가 다시 숨어 최신 쓰기를 받으면 예전 권리를 바꿉니다. 작업 배열 한 칸을 자른 뒤 같은 index를 새로 만들면 작업 세대가 달라 예전 payload가 보이지 않지만, 예산 실패에서는 첫 B의 바인딩을 연결합니다.

비용은 단일 스칼라 쓰기의 추가 할당 0, 일반 배치의 기존 주소 복사와 커버리지 수집 범위, 게이트/규칙의 실제 영향과 보유 슬롯에 비례하도록 제한합니다. 새 쓰기 이력, 매 라운드 전역 스캔, 주소마다 스냅숏, 작업 배열 전체의 매번 복사는 필요 없습니다. 배열의 첫 B 경계 캡처와 기존 keep 압축의 비용은 남습니다.


### 구현에서 먼저 확인할 불변식

| 관측 | 설계가 읽어야 할 정보 |
|---|---|
| 빈 Merge 뒤에도 앞 whole이 resolver를 억제 | 최신 출처와 누적 whole 범위가 같은 출력 속성이 아닙니다. 범위 데이터에 전체 교체의 최소 경계를 남기고, 빈 Merge는 자손 범위를 취소하지 않습니다. 교체 아래를 찾아갈 수 있다는 사실과 해당 키를 직접 교체했다는 사실도 나눕니다. |
| 앞선 caller 분배가 최신 잠복 자손을 다시 덮지 않음 | 슬롯/후보 선택 직전의 입력과 실제 새 자식의 해석 범위 모두 최신 결정에서 읽습니다. 중간 호스트가 아직 없다면 상위 후보의 자손 패치가 진입 시 같이 전달됩니다. `writtenInputs`의 호출자 값과 배달 출처는 고치지 않습니다. |
| 대기 이탈에서 조상과 자손 둘 다 쓰임 | 한 whole의 일반 생략 규칙으로 기존 후보를 잘라 내되, 후보가 둘이고 현재 살아 있는 분기가 다른 경우에는 그 쓰기가 실제 선택한 후보에만 적용합니다. 겹치는 범위의 경계에 순번을 둡니다. whole 이후의 높은 자손 쓰기와 whole 이전의 낮은 자손 쓰기가 같은 결과를 내면 결함입니다. |
| 복귀했다 다시 나가고 새 파생 입력이 지명함 | 복귀 처리에서 작업 원본을 갱신하며 이후 나감의 해당 후보 지명 권리만 남깁니다. 앞 권리를 없애는 활성 쓰기가 이어지면 그 키의 정책 결과가 다시 유효합니다. resolver 결과와 활성 원본에 들어간 새 값은 같은 우선순위 자료가 아닙니다. |
| 세대가 끝난 배열 위치에 새 값이 들어옴 | 작업 후보에서 이전 세대의 overlay·권리·자손만 떼어냅니다. B의 원래 위치와 binding은 독립된 수명이라 예산 복구까지 보존합니다. 새 세대 토큰은 배열 길이 변경을 실제로 적용할 때만 필요합니다. |

### 현행 구조의 책임과 처리

행 번호는 `f395ce12a` 기준입니다. 아래에서 정착과 보유 값의 형상이 처음부터 소유하고 있던 책임은 유지합니다.

| 현행 구조 | 성격과 처리 |
|---|---|
| `batchWrites`, `record/types/runtime.ts:272` | **필요, 유지.** 반응이 실행되기 전의 호출 순서와 옵션을 보관합니다. updater 콜백은 진입에서 한 번만 평가합니다. 구조 장벽과 자동 쓰기 혼합 예외를 이 기록이 구별합니다. |
| `composeBatchValue`/경로 복사, 현행 74/104줄 | **필요, 유지.** 커밋을 바꾸지 않고 값을 합성하는 적용 효과입니다. 별도 Merge/승격 규칙은 합칩니다. 직접 정착은 이미 라이브 값을 쓰므로 배치의 경로 복사까지 거치지 않습니다. |
| `mergeMarkedValue`·`collectMarkedMergeOrigins`, 현행 77/89줄 | **별도 판단은 부착 구조.** 합성 결과는 필요하며 경로 복사에 남습니다. 앞 호출의 Merge 키와 후보 경계를 한 결정에서 얻어 별도 출처 순회는 제거합니다. |
| `readLaterCoverage`·`subtractLaterMarks`, 현행 67/68줄 | **범위 재판정은 부착 구조.** 분리된 reset 표시를 거절 뒤 합치는 효과는 필요합니다. 해당 효과가 일반 주소/합성 결정을 호출하도록 하고 reset 전용 입력 해석을 지웁니다. |
| `writeOrigins`와 `replacementScope/Paths`, `settlement.ts:208,283–285` | **필요한 사실, 중복 표현은 통합.** 범위를 지우는 증거, 조상 방문 자격 및 마지막 배달 출처는 같은 쓰기에서 나옵니다. 지명/whole 및 Refresh의 논리 대상을 표현하고, 배치 범위가 있을 때 같은 원천에서 조회합니다. 단일 정착의 저렴한 교체 범위는 그 단일 입력 자체가 증명합니다. |
| `virtualReplacementPaths`·`virtualWriteFields`, `settlement.ts:287–289` | **필요, 승인 정보를 합침.** 가상 주소는 값을 저장하지 않으므로 호출 때 승인한 물리 구성원과 tuple index를 공유합니다. 실제 쓰기/리셋 범위를 그 목록에서 얻습니다. |
| `BATCH_HOST_SOURCE`, 현행 2줄과 각 쪽의 descriptor | **필요, 표현 유지.** 같은 합성 컨테이너에서 조상의 실제 원본과 지명 손자 효과를 구별합니다. 각 경로의 별도 작성/승격 판단을 공통 소유자로 옮깁니다. 바꾸지 않아도 되는 데이터 표현에 추가 래퍼를 두지 않습니다. |
| `writtenInputs`·`distributedInputs`, `settlement.ts:334–336` | **필요, 유지.** 입력은 최종 유효 목록 재해석, 분배는 선택/진입의 원래 입력을 제공합니다. 분배 원본에 거듭 복사해 최신 잠복결정을 투영하는 보조 경로는 최신 후보 조회로 대체합니다. 두 값이 같아지는 경우에도 소비자와 시간축이 다릅니다. |
| `pendingExits`, `settlement.ts:297` | **필요, 유지.** 일시 이탈과 발생·의존 등록 수명 및 같은 노드의 복귀를 소유합니다. 값의 두 번째 보유 장소로 쓰지 않습니다. |
| `departingWrites`·재생 플래그·`RevivedSlotSource`, `settlement.ts:190–196`, `departingWrite.ts:7–44` | **부착 구조, 제거.** 이탈 순번, 정책 뒤에 놓을 범위 및 후보 권한은 필요하며 모두 같은 후보 결정에 기록합니다. 각각 다른 레코드에서 다시 이름/순위를 찾는 회차를 없앱니다. |
| `retainedSources`와 `RetainedSource/RetainedArraySources/RetainedSlotSource`, `settlement.ts:116–162,340–344` | **필요, 통합.** 정착에 처음 닿은 B와 최신 입력을 보관합니다. 객체/배열의 별도 지명 맵과 이미 재활성된 권리 맵을 정확한 후보 셀의 같은 입력으로 합칩니다. 배열 작업 세대와 source B는 다른 시점입니다. |
| `arrayCounts`·`fillArrayCounts`, `settlement.ts:344–350` | **필요, 경계가 같은 것만 합침.** 로드 snapshot 정렬의 최초 count와 자동 변경 전 B는 호출자가 먼저 길이를 바꾸면 다를 수 있습니다. 현재 fill 직전 길이는 또 다른 시점입니다. 순회에 각각 필요한 값을 유지합니다. |
| `inactiveSlots`·`retainedSourceOverlay`·`inactiveSlotOverlays`, `record/types/record.ts:63–67`, `slots.ts:16–31` | **필요, 유지.** 이전 공개 발생을 건드리지 않는 커밋 간 슬롯 원본과 slot overlay입니다. 정착의 축약된 입력은 이 표현으로 소비되며 복제, 압축, 참조 수명 보장은 기존 채널에 둡니다. |
| `inactiveSlotBaselines`·`slotRestoredSource`, `record.ts:69`, `settlement.ts:368` | **필요, 유지.** 이전 배달/호출자 출처와 이번 결정을 비교하는 증거입니다. B는 이미 호출자 효과를 포함하므로 이 기준을 대신할 수 없습니다. |
| `inactiveValueOverrides`·`compactedSlotSources`, `settlement.ts:188,370` | **필요, 유지.** 먼저 계산한 resolver 결과와 현재 압축된 보유 주소의 커밋 효과입니다. resolver를 아직 평가하지 않은 최신 쓰기처럼 섞거나 이전 B의 슬롯 표식으로 대체하면 콜백 시점과 배열 주소의 의미가 바뀝니다. |
| `inputRelays`·`batchHasArrayOperation`, `runtime.ts:264–266` | **필요, 유지.** 자체 입력과 외부 새 값의 Refresh 경계, 구조 동사 이후 동일 최종 출력 참조 복원입니다. 물리 커버리지를 배달에 제공하되 이 사건의 수명을 바꾸지 않습니다. |

## 4. 제품 소스 규모

영향받는 88개 파일은 기준 5,251줄, 현행 7,877줄, 설계 중심 추정 6,916줄입니다. 엔진 전체는 같은 기준에서 40,468 → 44,189 → 43,228줄입니다. 현행 대비 중심 추정 순감 961줄, 기준 대비 순증 2,760줄입니다. 대상 파일군 기준 약 12%, 기준 이후 증가분의 약 37%를 덜어내는 규모입니다. 반영이 까다로운 생애주기·분배에 240줄, 앞 두 단계의 부가 연결에 90줄을 더 잡아도 약 630줄 순감입니다. 630–961줄은 구현 전 크기 추정입니다. 규칙 0에 따라 필요한 코드는 이 범위를 지키기 위해 줄이거나 미루지 않습니다.

기준/현행은 추적 제품 TS의 물리 줄입니다. 두 커밋의 아카이브에서 각각 직접 계수해 대조했습니다. 현행 줄 수와 경로 제한 `git diff --numstat --no-renames 1c77ced57 f395ce12a`에서 기준 줄 수를 역산하고 `git ls-tree`에서 존재 여부를 확인했습니다. 타입·주석·빈 줄을 포함하고 테스트·벤치·문서·생성물을 제외했습니다. 예상치는 삭제 파일 0, 신규 파일 예산, 변경할 파일에서 지우거나 남기는 분기 수를 합한 계획값입니다. 같은 길이로 추정한 호출자 연결도 포함했습니다. 아래 +/−는 파일 크기의 순증·순감 방향 합계이며 구현의 실제 추가/삭제 줄 수는 diff로 따로 보고합니다.

| 단계 | 추정 늘어나는 줄 | 추정 줄어드는 줄 | 순증감 | 단계 후 엔진 | 기준 대비 | 통합 HEAD 대비 |
|---|---:|---:|---:|---:|---:|---:|
| 1 | +164 | −425 | -261 | 43928 | +3460 | -261 |
| 2 | +55 | −126 | -71 | 43857 | +3389 | -332 |
| 3 | +309 | −938 | -629 | 43228 | +2760 | -961 |

경로는 E 기준입니다.

| 파일 | 기준 | 현행 | 설계 | 처리와 산정 근거 |
|---|---:|---:|---:|---|
| `record/types/runtime.ts` | 495 | 488 | 486 | 배치 표시에서 옵션 중복 분류 제거 |
| `settle/index.ts` | 17 | 18 | 22 | 형제 write에 주소 결정·커버리지 연결 |
| `settle/types/departingWrite.ts` | 0 | 44 | 0 | 이탈 배열·권리 트리 타입 삭제 |
| `settle/types/retainedSource.ts` | 0 | 0 | 60 | 기존 B와 후보별 입력·이탈 효과의 타입 |
| `settle/types/settlement.ts` | 363 | 413 | 389 | 보유 타입 이동과 이탈·재생 플래그 삭제 |
| `settle/utils/commit/markCommitDeliveries.ts` | 435 | 449 | 447 | 후보 입력 기록에서 자동 여부 읽기 |
| `settle/utils/commit/utils/getInputCommitTracking.ts` | 0 | 32 | 32 | 기존 relay 수명 유지, 범위 필드 연결 |
| `settle/utils/commit/utils/isExternalBranchValueChange.ts` | 0 | 50 | 48 | 같은 최신 입력 출처를 사용 |
| `settle/utils/commit/utils/readSettlementSource.ts` | 41 | 41 | 24 | 공통 최신 커버리지 사용 |
| `settle/utils/compute/childSelection/selectChildren.ts` | 356 | 359 | 357 | 새 후보 선택 결과에서 분배를 조회 |
| `settle/utils/compute/childSelection/selectEntryStep.ts` | 416 | 418 | 416 | 분배 후보 조회와 취소 이탈 적용 연결 |
| `settle/utils/compute/enterFieldNode.ts` | 52 | 69 | 67 | 진입 분배의 후보 조회 갱신 |
| `settle/utils/compute/primeHost.ts` | 194 | 196 | 196 | 취소 이탈 적용을 공통 경계에 연결 |
| `settle/utils/dependencies/getAliasedDependencyIndex.ts` | 0 | 343 | 341 | 복구 증거의 새 필드만 연결 |
| `settle/utils/derivation/runDeriveRounds.ts` | 169 | 207 | 201 | 적용 상태를 입력 결정으로 전달, 비교·순위 유지 |
| `settle/utils/derivation/utils/applyDeriveWrite.ts` | 43 | 75 | 68 | 실제 적용 주소와 선언 출처 전달 |
| `settle/utils/derivation/utils/retainEqualDeriveWrite.ts` | 0 | 27 | 23 | 같은 출력 입력에 공통 명시 채택 경로 |
| `settle/utils/derivation/utils/retainedSources/selectNamedRetainedSources.ts` | 0 | 43 | 0 | 명시 자손 재탐색 제거 |
| `settle/utils/inactive/hasExplicitInactiveValue.ts` | 56 | 56 | 48 | 주소 범위 조회 사용, 나감 조상 guard 유지 |
| `settle/utils/inactive/readExplicitWriteKind.ts` | 71 | 71 | 41 | 공통 커버리지 결과의 resolver 해석 |
| `settle/utils/input/decideAddressWrite.ts` | 0 | 0 | 85 | 주소·후보·merge/whole/생략 판단과 방문자 호출 |
| `settle/utils/input/getChildDistribution.ts` | 32 | 41 | 54 | 최신 후보 선택 우선, 앞 분배 재적용 방지 |
| `settle/utils/input/hasCallerInputOutput.ts` | 0 | 24 | 18 | 공통 방출 판정에 현재/잠복 증거 전달 |
| `settle/utils/input/hasDistributedChildInput.ts` | 31 | 31 | 27 | 공통 own 입력 자격 사용 |
| `settle/utils/input/interpretFieldNodeInput.ts` | 85 | 90 | 52 | 원본 복사 유지, 바인딩/사이클 순회 공유 |
| `settle/utils/input/isWithinReplacementPaths.ts` | 31 | 31 | 26 | 같은 경로 검사 사용, 방문·교체 술어 구별 |
| `settle/utils/input/markWrite.ts` | 212 | 309 | 259 | 범위·virtual·정책 기록 분기 제거, 라이브 dirty 유지 |
| `settle/utils/input/readStoredInput.ts` | 0 | 158 | 130 | 저장/방출 조립 유지, 정적 자식 순회 공유 |
| `settle/utils/input/rewriteCoveringDistributions.ts` | 0 | 77 | 0 | 최신 슬롯을 조회하므로 이전 payload 복사 제거 |
| `settle/utils/input/utils/acceptsRetainedWrite.ts` | 0 | 17 | 0 | recordSourceDecision에 수락 검사 통합 |
| `settle/utils/input/utils/recordArrayBoundary.ts` | 0 | 25 | 31 | 최초 구조/B 및 별도 fill 시작 길이를 연결 |
| `settle/utils/input/utils/recordNamedArrayItems.ts` | 0 | 82 | 41 | 배열 세대 종료 유지, 후보 기록은 공통 처리 |
| `settle/utils/input/utils/recordNamedObjectSlots.ts` | 0 | 49 | 0 | 이름 있는 후보 저장을 공통 처리로 이동 |
| `settle/utils/input/utils/recordRetainedSource.ts` | 0 | 25 | 0 | 공통 채택 기록으로 이동 |
| `settle/utils/input/utils/selectRetiredArrayBaseline.ts` | 0 | 31 | 22 | 퇴역 셀의 B 선택을 공통 조회로 수행 |
| `settle/utils/input/visitInputChildren.ts` | 0 | 0 | 43 | 정적 바인딩·순환 경계 방문 공유 |
| `settle/utils/input/visitVirtualWriteTargets.ts` | 0 | 0 | 28 | 승인한 실제 구성원/원래 index 열거 |
| `settle/utils/settlement/createSettlementContext.ts` | 85 | 85 | 85 | 공통 물리 범위의 초기화 연결 |
| `settle/utils/slots/createClearedArrayOverlay.ts` | 107 | 118 | 115 | 원본 후보 조회 공유, keep 압축 유지 |
| `settle/utils/slots/createExitSlotOverlay.ts` | 173 | 212 | 186 | 최신/B 및 슬롯 조회를 결정 셀에서 얻음 |
| `settle/utils/slots/createSlotValueOverlay.ts` | 148 | 153 | 133 | 공통 결정·조상 source 증거 적용, 지속 overlay 조립 유지 |
| `settle/utils/slots/enterSlotClone.ts` | 37 | 53 | 51 | 정확한 후보 셀 분배를 소비 |
| `settle/utils/slots/getSlotBinding.ts` | 48 | 48 | 58 | 후보 배타 범위 조회 제공 |
| `settle/utils/slots/markSlotChange.ts` | 69 | 67 | 58 | 배달 스냅숏 유지, B 캡처 공통 사용 |
| `settle/utils/slots/pruneArraySlotTail.ts` | 32 | 32 | 35 | 작업 세대 퇴역 연결 |
| `settle/utils/slots/readAbsentSlotSource.ts` | 54 | 63 | 66 | 최신 후보 셀/원본 해석 소비 |
| `settle/utils/slots/readRetainedChildInputs.ts` | 0 | 104 | 66 | 세 별도 맵 대신 셀 선택과 현행 caller fallback |
| `settle/utils/slots/restoreSlotSources.ts` | 46 | 32 | 27 | B의 한 후보 기록에서 복원 |
| `settle/utils/slots/retainExitedSlot.ts` | 73 | 73 | 75 | 기존 보유 커밋을 공통 효과에 연결 |
| `settle/utils/slots/utils/recordRetainedSlotWrite.ts` | 0 | 23 | 0 | 공통 채택 기록으로 이동 |
| `settle/utils/slots/utils/selectBaselineArrayBindings.ts` | 0 | 39 | 31 | B binding 조회 공통 선택으로 위임 |
| `settle/utils/slots/writeInactiveSource.ts` | 36 | 40 | 42 | 공통 후보 조회를 슬롯 적용에 연결 |
| `settle/utils/slots/writeSlotPath.ts` | 151 | 161 | 142 | 공통 후보·채택 결정, 슬롯 효과만 유지 |
| `settle/utils/source/applyDepartingSource.ts` | 0 | 0 | 75 | 이탈 정책 위와 취소 이탈에 적용할 같은 기록 소비 |
| `settle/utils/source/getSourceBoundary.ts` | 0 | 29 | 36 | B 캡처에 실제 후보 슬롯 접점 추가 |
| `settle/utils/source/readSourceDecision.ts` | 0 | 0 | 34 | 현재/B·후보 세대·범위 조회 |
| `settle/utils/source/recordNamedChildSource.ts` | 0 | 0 | 37 | 이름/배열 위치의 최신 후보 선택과 payload |
| `settle/utils/source/recordSourceDecision.ts` | 0 | 0 | 67 | 순번·동등 명시값·정책 뒤 범위 갱신 |
| `settle/utils/transition/applyDepartingWrites.ts` | 0 | 53 | 0 | 공통 이탈 효과 적용으로 대체 |
| `settle/utils/transition/applyRevivedDepartingWrites.ts` | 0 | 72 | 0 | 공통 이탈 효과 적용으로 대체 |
| `settle/utils/transition/finalizeExits.ts` | 131 | 137 | 134 | 정책과 resolver 뒤 공통 적용 호출 |
| `settle/utils/transition/findDepartingChild.ts` | 0 | 30 | 0 | 공통 주소 후보 결정이 보류 후보를 찾음 |
| `settle/utils/transition/findDepartingOwner.ts` | 0 | 51 | 48 | pending identity 조회 유지 |
| `settle/utils/transition/placeDeclarativeValue.ts` | 0 | 45 | 36 | 공통 주소 기록의 실제 상태별 적용 |
| `settle/utils/transition/recordDepartingWrite.ts` | 0 | 18 | 0 | 정착 기록 배열 제거 |
| `settle/utils/transition/restoreArrayStructure.ts` | 62 | 56 | 54 | B 구조 캡처를 그대로 소비 |
| `settle/utils/transition/restoreSourceB.ts` | 43 | 50 | 43 | 공통 B 선택, 오류/자동 효과 정리 유지 |
| `settle/utils/transition/transitionSettlement.ts` | 251 | 243 | 238 | 명시/채움·재해석 순번을 공통 입력으로 전달 |
| `settle/utils/transition/utils/captureRevivedSlotSource.ts` | 0 | 33 | 0 | 독립 권리 트리 제거 |
| `settle/utils/transition/utils/readRevivedSlotWrites.ts` | 0 | 44 | 0 | 공통 패치 적용과 후보 조회로 대체 |
| `settle/utils/transition/utils/recordRevivedChildSource.ts` | 0 | 32 | 0 | 부재 자손 역참조 맵 제거 |
| `settle/utils/transition/utils/revivedSlots/captureRevivedBindingSource.ts` | 0 | 100 | 0 | 독립 권리 트리 및 이름 재탐색 제거 |
| `settle/utils/transition/utils/supersedeRevivedSlotSource.ts` | 0 | 24 | 0 | 공통 후보 범위 갱신으로 대체 |
| `settle/utils/write/collectReplacementPaths.ts` | 29 | 29 | 19 | 같은 커버리지에서 교체 범위만 추출 |
| `settle/utils/write/readWriteCoverage.ts` | 0 | 0 | 37 | 물리 교체·최신 출처·부분 키 조회 |
| `settle/utils/write/releaseWrongKindHosts.ts` | 51 | 51 | 42 | 공통 자식 방출 조건, 실제 재계산 유지 |
| `settle/utils/write/writeFieldNode.ts` | 150 | 156 | 146 | 주소 효과를 소비, 사전 pruner·정착 유지 |
| `utils/batchHostSource.ts` | 0 | 2 | 14 | 기존 symbol과 descriptor 처리 단일화 |
| `write/utils/chain/composeBatchValue.ts` | 48 | 74 | 66 | 주소 결정을 받는 기존 경로 접기 |
| `write/utils/chain/flushBatchWrites.ts` | 119 | 176 | 108 | 별도 origin 스캔을 없애고 복합 옵션 분리 유지 |
| `write/utils/chain/readBatchValue.ts` | 38 | 103 | 90 | 바탕·부재 그대로, typed 읽기에 공통 결정 |
| `write/utils/chain/utils/collectMarkedMergeOrigins.ts` | 0 | 89 | 0 | 같은 합성에서 출처를 얻어 삭제 |
| `write/utils/chain/utils/mergeMarkedValue.ts` | 0 | 77 | 47 | 주소 방문 결과의 실제 값 접기만 유지 |
| `write/utils/chain/utils/replaceAtPath.ts` | 54 | 104 | 91 | 경로 복사 유지, 조상 방출/원본 증거 공유 |
| `write/utils/entry/dispatchResetSubtree.ts` | 43 | 85 | 73 | 동일 scope·정착 경계, 주소 범위에 위임 |
| `write/utils/entry/dispatchSetValue.ts` | 74 | 87 | 79 | 가상 승인과 쓰기 종류 계산 위임 |
| `write/utils/entry/utils/readLaterCoverage.ts` | 0 | 67 | 0 | 공통 주소 범위 사용으로 삭제 |
| `write/utils/entry/utils/subtractLaterMarks.ts` | 0 | 68 | 50 | 배치 주소 결정에 의뢰, 보류 replay 조립 유지 |

삭제되는 중복은 D01–03(주소·출처·거절 reset), D04–05(공통 후보/순환 및 승격 증거), D06(가상 쓰기 주소), D08–09(범위와 출처), D10–17(슬롯 후보·최신 결정·배열 B·이탈/취소·동등 명시값)입니다. D13의 fill 직전 길이와 최초 B 길이는 실제로 다른 시점일 때 각자 보유합니다. D04의 source/stored/output 결과와 D09의 소비자별 출처 정책도 다른 결과이므로 남깁니다. D07의 가상 게터 투영, D18의 일반 조립 갱신, D19–20의 구조/오류 재키와 D35–38의 마운트·계산·진단 중복은 범위 밖입니다. 기존 조립기 `assembleObjectValue` 121줄, `assembleArrayValue` 54줄과 물리 가상 주소 `resolveStorageTargets`는 유지하여 공통 결정을 소비하는 쪽에서 사용합니다. 전체 리스너 사슬의 try/finally를 감싸는 별도 구현도 추가하지 않습니다.

실제 삭제 대상 이름을 현재 소스의 unit/spec에서 검색했습니다. 삭제 예정인 기록 배열·권리 트리·가상 Merge 출처 수집을 직접 고정한 테스트 파일은 찾지 못했습니다. `declarativeWriteRoutingModel`·`batchStoredAssemblyModel`·`batchCallerReviewModel`은 이름에 Model이 있어도 공개 호출 결과를 관측하므로 유지합니다. `createSlotValueOverlay.test.ts`와 `isWithinReplacementPaths.test.ts`는 설계에서 살아남는 함수의 좁은 내부 검증이라 삭제 목록에 넣지 않습니다. 내부 이름이 바뀌는 경우에도 그 테스트가 증명하는 활성/잠복·whole/partial 계약을 확인합니다.

## 5. 속도 게이트

표의 P번호와 상한은 감사의 Accepted speed rows에서 가져왔습니다. 예전 비교쌍의 비율은 곱하지 않습니다. 새 단계마다 `1c77ced57` 대비 일반 행 1.03, 동일 입력의 승인 예외는 각 상한, 적용 직전 HEAD 대비 추가 손실 여부를 따로 확인합니다.

| 행 | 기존 상한/비교쌍 | 설계의 변화와 선행 측정 |
|---|---|---|
| P01, P02, P12, P14 | 일반 1.03, 참조 마운트 기록 1.134 | 참조 색인·마운트 구조의 변경은 없습니다. 공통 markWrite가 쓰기와 로드를 같이 소비하므로 static mount/mount-100, alias mount, derive-write, branch-null/non-null와 reset, R3 batch-merge도 대조합니다. |
| P04–05 | R2 기록 1.468/1.085, 참조 동일 배열·자체 쓰기 대조 | 후보 출처 조회가 relay 수명을 바꾸면 잘못된 리마운트가 더 큰 속도 회귀로 나타납니다. own/외부 mixed batch·같은 배열/다른 참조·IME를 측정하고 Refresh 횟수도 확인합니다. |
| P08–11 | batch push/pop 관찰자 없음/있음 1.738/1.505, 같은 빌드 batch/순차 진단 1.108/1.063, 일반 순차 1.03 | 동사별 실제 배치·이동과 한 번의 바깥 전달은 유지합니다. 표시 없는 구조 장벽에는 공유 주소 결정을 호출하지 않습니다. 같은 과거 측정쌍도 보존하여 무관찰자/관찰자를 각각 대조합니다. |
| P15 | 가상 getter 세 개 1.90–2.10, 각 값의 승인 상한을 유지 | 게터 구현은 범위 밖입니다. 후보 슬롯을 읽는 inactiveValues는 영향받을 수 있어 게터별 원자료 또는 현재 빌드와 독립 비교합니다. 2.10을 세 행의 공통 새 허용치로 쓰지 않습니다. |
| P18, P21 | 가상 write 약 1.03, 가상 동일 튜플 batch 1.05–1.09 | 승인 물리 주소를 한 번 계산합니다. 같은 튜플의 updater에서 전체 원본 보유를 미리 복사하면 위험합니다. 가상 동일 tuple 두 표시, 비활성 undefined, 한 자리 Merge부터 단계 1/2에서 측정합니다. |
| P19, P22–23 | 겹친 2규칙 약 1.21, 불겹침 1.03. #667 국소 쌍 `0bc5cb07b` 대비 일반 1.03 | 적용 순서와 compute 횟수는 그대로이며 후속 기록/순회 비용만 목표입니다. 순번 및 후보 조회가 불겹침 경로를 느리게 할 수 있으므로 두 규칙 겹침·불겹침·가상 파생/주입/쓰기를 3단계 첫 측정에 넣습니다. |
| P20, P28 virtual-reset | reset-8 1.10–1.12, R6 일반 1.03 | 거절 경로의 범위 재탐색을 줄입니다. 성공 reset-8과 거절 reset-8을 따로 재고 단일/가상/한 자리 virtual 장벽 및 표시 없는 reset을 대조합니다. |
| P24 | #667 overlap-array-32-4 min 1.0358, p10 1.0339. 비교쌍 `0bc5cb07b` | **최대 위험 행입니다.** 같은 실제 작업에 후보·배열 세대·정책 적용과 B 관리가 겹칩니다. 3단계 첫 대상이며 빈 슬롯/복귀/잘림-재성장과 예산 복구를 분리하여 원인을 추적합니다. 기존 +2.904/+2.749µs 행도 원시 시간으로 비교합니다. 원본 복제와 후보 탐색 실제 횟수를 진단 측정합니다. |
| P25–26, P29–30 | 일반 1.03. R6 국소 쌍 P26 scalar 1.0125/1.0177, same .9808/.9854, whole .9762/.9809, batch-2 .9567/.9471, 8 .9337/.9280, 32 .7739/.7709. 후속 P30 batch-8 1.0289 | **두 번째 위험은 plain scalar/same/whole와 batch-2/8입니다.** 32의 큰 이득으로 작은 배치 손실을 덮지 않습니다. 공유 주소 처리에서 scalar·same·shallow whole의 새 Map/객체/클로저 0을 목표로 합니다. batch-2/8/32, 중첩 Merge/updater, null·빈 상자, 출력 참조 보존을 각 단계에서 측정합니다. P29의 첫 batch-2 초과와 재측정, P30의 batch-8 좁은 여유를 보존해 해석합니다. |
| P27–28 나머지 | R6 일반 1.03, derive-write 초기 초과는 재측정에서 재현되지 않음 | disjoint/overlap/가상 write·derive·inject와 derive-write를 3단계 이전과 이후 모두 반복합니다. 연속 샘플 중 좋은 한 번만 선택하지 않습니다. |

P25의 일반 10행은 `plain-scalar`, `plain-same`, `plain-whole-shallow`, `plain-whole50`, `plain-merge-shallow`, `plain-merge50`, `ab-batch-plain-2/8/32`, `plain-nested`입니다. #667의 원시·정규화 수치는 `/tmp/bb5-form3-impl/report.md` 197–241행에 있습니다. 특히 P24에서 min 107.618→110.522µs, p10 107.947→110.696µs였던 동일 작업을 다른 동적 행과 섞어 평균 내지 않습니다.

측정용 소스는 scratch에 `git archive`로 빌드별로 나눕니다. 감사의 R6 harness는 `/tmp/bb6-form/bench/benchmark.tsx`와 `/tmp/bb6-form/run-shared-final-bench.sh`이고, R5 후속의 원래 #667 입력을 함께 씁니다. 실행 전에 스크립트·경로를 읽고 제품 후보와 대조의 빌드 플래그, Node/React 및 같은 양의 실제 작업을 확인합니다. 기록된 실행 경로를 그대로 써서 다른 worktree를 덮지 않으며 scratch 사본의 경로를 지정합니다. 필요한 자료가 기존 기준에서 수행하지 않던 작업이라면 공통 의미 대조용 입력과 원래 국소 비교쌍을 모두 두고 원시 시간과 gate를 별도 표시합니다. 설계 후보 제품 코드는 작성하지 않았습니다. 아래 표에서 통합점 직접 측정, 기존 비교쌍의 관측, 후보의 작업량 예측을 구별합니다.

실행마다 `/tmp/claude-501/bb5-speed.lock`을 원자적으로 만들고 owner에 작업·시작 시각을 적습니다. 동일 빌드 대조와 별도 프로세스 교대 실제 비교를 최소 60회 짧게 실행하고, min과 p10 각각을 해당 대조로 나눕니다. 대조 0.98–1.02 밖은 라운드를 늘려 다시 측정합니다. 40분 이내 잠금을 해제하고 원시 μs·min/p10·대조·입력/빌드 식별자를 함께 남깁니다. 승인값을 넘으면 다른 행과 정확성 검증을 계속한 뒤 해당 행의 비용을 줄입니다. 끝까지 초과하는 행은 시도한 변경과 남은 원인을 표에 기록합니다. 초과를 새 예외로 수용하지 않습니다.

### Speed rows above the accepted value

다음 표는 이 설계의 쓰기·보유 원본 범위에서 확인한 초과, 과거 비교쌍의 재현되지 않은 초과, 구현에서 초과할 수 있는 행을 한곳에 둡니다. 판정 상태는 행에 적었습니다. 비율과 시간 쌍은 min/p10 순이며, 대조 보정 비율과 원시 시간 차이는 따로 기록합니다. 바운티가 기록한 비교쌍에서만 성립하는 값은 해당 비교쌍을 명시합니다. 서로 다른 비교쌍의 비율을 합성해 통합점의 속도를 추정하지 않습니다.

| 행과 상태 | 기준 시간 | 승인값 | 측정값·원시 차이 또는 예상 | 원인과 줄일 작업 |
|---|---:|---:|---|---|
| P04 같은 내용의 새 배열 중계 · R2 구현자 관측만 상한 초과 | 원시 시간 미기록 | 감사의 기록 상한 1.468 | 구현자 1.481, 독립 1.468, 같은 참조 대조 0.975. 통합점 재현 여부 미확인 | 참조가 다른 가지 배열에서 필요한 원소 비교입니다. `isEqualRelayArray`를 부르는 `isExternalBranchValueChange`와 `commitSettlement`의 출처 조회에서 같은 후보를 다시 찾는 비용을 줄입니다. R2 FIXES 233행. |
| P27 `derive-write` · R6 국소 최초 초과, 유효 재실행 미재현 | 11.2204/11.2661 µs, 재실행 11.4560/11.5331 µs | 1.03 | 1.0415/1.0420, +0.3598/+0.3481 µs. 같은 코드 재실행 .9829/.9782, −0.1123/−0.1311 µs | 함수별 원인 미확정. `runDeriveRounds`의 실제 적용/계산 횟수를 고정하고, `markWrite`에서 순번·후보 기록을 다시 읽는 지점과 단일 쓰기의 추가 할당을 계수합니다. /tmp/bb6-form/report.md 22–44행. |
| P29 `ab-batch-plain-2` · R6 국소 최초 min 초과, 유효 재실행 미재현 | 4.8628/4.9237 µs, 재실행 4.8372/4.8502 µs | 1.03 | 1.0485/1.0193, +0.1345/+0.1183 µs. 같은 코드 재실행 .9915/.9895, −0.0176/−0.0066 µs | 원인 미확정. `flushBatchWrites`의 별도 출처 순회와 `composeBatchValue`의 경로 할당이 설계에서 제거 가능한 후보입니다. /tmp/bb6-form/report.md 104–117행. |
| P18 `virtual-write` · 같은 주소 분류를 공유한 별도 후보에서 초과 | 4.2717/4.3198 µs, `1c77ced57` | 약 1.03 | 별도 `virtual-admission` 후보 1.0530/1.0493, +0.2058/+0.1783 µs. 후보 대 통합점은 .9905/.9964. 이 설계의 후보는 미구현 | `dispatchSetValue`·`resolveStorageTargets`가 쓰는 호출 시점 자리 분류와 같은 튜플 비교가 경로입니다. 후보가 두 비교쌍에서 보여 준 값만으로 통합점의 비율이나 함수별 원인은 확정할 수 없습니다. 주소 분류를 한 번만 하고 기존 튜플 비교 전후의 할당을 비교합니다. /tmp/final-core/speed/virtual-admission-{baseline,integration}.json. |
| P30 `ab-batch-plain-8` · 설계 위험 | 13.2797/13.7107 µs, R6 최종 국소 시리즈 2 | 1.03 | 국소 1.0289/1.0118, +0.4253/+0.2247 µs로 통과. 새 주소마다 범위 객체를 만들면 min 여유가 작아 초과 위험. 설계 비율 미측정 | `composeBatchValue`와 `collectMarkedMergeOrigins`를 같은 순회로 바꾸어 주소마다 손실되는 할당을 줄입니다. 객체 생성을 없애기 위해 호출별로 같은 경로를 두 번 찾지 않습니다. /tmp/bb6-form/report.md 174–195행. |
| P24 `overlap-array-32-4` · 국소 승인값과 같은 역사값 | 107.618/107.947 µs, 기준 `0bc5cb07b` | min 1.0358 / p10 1.0339 | 1.0358/1.0339, +2.904/+2.749 µs로 역사값은 경계입니다. 설계의 배열 항목마다 B나 overlay를 복제하면 초과 위험 | `recordNamedArrayItems`·`recordArrayBoundary`와 `readRetainedChildInputs`의 후보·길이 처리에서 같은 작업의 실제 순회 수를 잽니다. 최초 B만 캡처하고 작업 세대의 실제 변경 후보만 갱신합니다. 함수별 비용은 아직 분리하지 않았습니다. /tmp/bb5-form3-impl/report.md 230–244행. |

R6 최종 측정의 `869b99397`과 통합점 `f395ce12a`를 `packages/canard/schema-form/src`에서 비교하니 테스트 파일 하나만 달랐습니다. 따라서 P30은 현행 제품 소스에 해당하는 유효한 **국소 비교**이며, 그 비교에서 초과는 없었습니다. 새 `1c77ced57 → f395ce12a` 직접 계열은 공유 잠금을 다른 성능 측정이 점유해 실행하지 못했습니다. 직접 기준 자료가 없는 행은 현재 초과 여부 미확인으로 남깁니다. 아래의 런타임 동등 자료와 기존 국소 결과는 각각 자기 비교 범위에서만 사용합니다.

별도 코어 작업의 `final-plain-baseline.json`은 `1c77ced57`에서 타입 전용 변경 두 개 뒤의 `891c7d713`까지의 비교입니다. 통합점부터 그 커밋까지의 변경을 확인했고 제품 런타임 변경은 없었습니다. 해당 비교에서 유효한 plain scalar, same, shallow whole, 배치 8·32회는 각각 1.0011/.9964, .9470/.9544, .9787/.9781, .9632/.9430, .7906/.7830이었습니다. 배치 2회 대조는 범위를 벗어나 초과 여부 판정에 쓰지 않습니다. 근거는 `/tmp/final-core/speed/final-plain-baseline.json`과 해당 작업의 `/tmp/final-core/report.md`입니다.

미측정 설계의 시간은 추정치로 숫자를 채우지 않습니다. 단일 scalar/same/whole은 공통 결정을 거쳐도 새 건별 자료가 생기지 않아야 하고, 배치와 배열은 기존 비교 대상의 순회 수가 감소하는 방향으로 구현합니다. 구현 시 P24, 2·8회 쓰기 배치, 불겹침 derive, 가상 동일 튜플, reset-8을 먼저 재서 예측을 검증합니다. 승인된 동작을 줄이지 않고 방문·복사·할당의 중복을 줄여 초과를 낮춥니다.

## 6. 적용 단계

각 단계는 한 번에 이전 소비자와 새 소비자를 교체합니다. 단계마다 `yarn workspace @canard/schema-form test --run --project unit`의 전체 범위가 녹색이어야 합니다. 세 단계 모두 순감으로 추정하지만 실제 줄 수와 새 코드의 책임을 함께 기록합니다. 필요한 코드의 채택은 역할·단일 구현·동작·속도 증거로 판단합니다. 변경 지점에 맞는 render, verify, 표의 속도 행과 PR-tier 8분 예산도 확인합니다. 회귀가 실패하면 동일 fixture로 현행과 비교하고 제거한 경로의 어떤 규칙이 빠졌는지 확인합니다. 테스트의 기대는 계약과 실제 외부 관측으로 판단합니다.

1. **주소와 물리 범위 통합**. 예상 −261줄. 단일 mark/잠복 overlay와 배치 Merge에 한 주소 결정으로 교체·부분 적용을 전달합니다. 같은 단계에 출처 재탐색, 가상 투영 중복, reset 전용 `readLaterCoverage`를 삭제합니다. 거절 reset 재구성은 뒤 선택이 이기는 실제 값 위에 앞 표시의 영향만 재구성하고, whole의 생략 범위를 유지합니다. 우선 R3.5·R6.1·R5.F와 가상/옵션/relay 인접 테스트, plain 및 batch-2/8/32, reset-8을 확인합니다.
2. **입력 순회와 조상 승격 통합**. 예상 −71줄. 바인딩/순환 경계를 공유하고 같은 방출 증거로 배치 원본의 복사와 단일 계산의 실제 승격을 결정합니다. R6.2 전체, nullable/비활성/identity 및 명시 clear, 배열과 키 순서, R5.B·W1 정적 빠른 경로, 배치 2/8 및 일반 same/whole을 확인합니다. null·스칼라 입력에서 바로 읽는 대상 값과 조상의 생략을 같은 값으로 축약하지 않습니다.
3. **이탈·복귀·되돌림 원본을 한 후보 기록으로 통합**. 예상 −629줄, 추정 오차가 가장 큽니다. 같은 단계에서 이탈 배열과 권리 트리를 삭제하고 최신 후보 결정을 분배 재진입에서 읽도록 바꿉니다. R5.C/D/G/H/I/J/K 전체의 독립 기대를 먼저 확인합니다. **가장 위험한 단계입니다.** 순번·정책 뒤 권한·배열 B를 한꺼번에 바꾸므로 R5.I/K의 같은 경로 서로 다른 후보 및 세대, R5.J의 예산 복구와 동등 명시값, R5.H의 앞 채움/뒤 지명과 P24를 첫 후보에서 확인합니다. 기존 원본을 읽을 수 없다면 지명 입력이나 순위를 새 탐색으로 복원하지 말고 부족한 최소 표현과 예상 비용을 소유자에게 보고합니다.

기존 원본 B 복구, 분리된 참조의 수명, 커밋 간 슬롯·복제, 배열 동사와 구간당 반응은 각각 현재의 소유자를 유지합니다. 실제 diff가 추정을 벗어나면 새 코드의 계약상 역할을 기록하고, 별도 장부나 재탐색이 살아났으면 해당 판단을 소유하는 지점으로 모읍니다. 승인 상한을 넘는 행은 다른 작업을 계속한 뒤 줄입니다. 바운티 결정 범위 밖의 동작이나 계약 변경이 필요한 경우에만 그 변경을 묻습니다.

## 7. 권고 설계

단일 쓰기와 배치의 **주소 결정은 하나**, 이탈·복귀·되돌림의 **보유 원본은 실제 후보별 기록 하나**로 구현합니다. 주소 결정은 채택할 입력과 교체 범위를 한 번 계산합니다. 기존 단일 정착과 배치의 경로 복사는 그 결과를 각 수명에 적용합니다. 정착 한정 후보 기록은 최초 자동 변경 직전 B와 최신 채택·정책 뒤 효과를 같은 실제 바인딩에 둡니다. 배치의 typed updater, 배열 동사와 reset 장벽, 나감·복귀의 값과 우선순위를 바운티에서 정한 대로 유지하면서 중복 Merge·출처·reset 범위 해석과 이탈 배열·권리 트리의 이중 기록을 제거할 수 있어 이 설계를 권고합니다. 세 적용 단계는 이 설계의 구현 순서입니다.

## 현행 검증 기록

`f395ce12a` 아카이브의 별도 사본에서 기존 로컬 의존성과 빌드 산출물을 사용했습니다. 최초 전체 unit 실행에서 사본의 React 18 타입·AJV별 중첩 의존성이 빠져 검증 4건이 실패했습니다. 사본의 의존성을 보완한 뒤 같은 전체 명령을 다시 실행해 파일 832개, 테스트 5,320건 통과, 예상 실패 2건, 건너뜀 5건을 확인했습니다. R6.2의 `batchNonobjectAncestor.render.test.tsx`도 render 프로젝트에서 5건 통과했습니다. 두 커밋 아카이브의 파일별 제품 줄과 보고서 표를 대조했습니다. 위 결과는 현행 소스의 검증입니다. 설계의 제품 변경, 후보 테스트 및 후보 성능 측정은 적용 시 검증합니다.
