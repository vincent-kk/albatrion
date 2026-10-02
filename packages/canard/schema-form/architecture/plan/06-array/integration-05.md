# 06 배열 — 05 통합 계획 (두 번째 머지)

05(PR-4, #352)가 `1.0.0-beta`에 먼저 머지되었으므로(`afbba714d`, 원장 61라운드 `a0f15e9e0`) 06이 두 번째 머지 쪽으로 05의 배선과 이 브랜치를 잇는다(33C-01). 근거는 05 [log](../05-dispatch-and-validation/log.md)의 "06에 넘길 목록"과 원장 35C-01·35C-02·43C-01·58C-01·59C-01·61라운드이다. 원장이 스펙이며 이 문서는 순서와 완료 조건만 정한다.

## 1. 단위

### I1 기준 브랜치 병합과 충돌 해소

- `origin/1.0.0-beta`를 병합한다. 내용 충돌 15곳은 두 단계의 계약을 모두 지키는 합집합으로 푼다.
  - 겉면: `SchemaNode.ts`, `SchemaNode/DETAIL.md` 멤버 표, `surface.test.ts`(시험 이름은 05의 `26C-01 PR-4 …`, 멤버 수는 두 단계의 합), `type-contract.test.ts`. 자동 병합된 `SchemaNode/type.ts`, `src/core/index.ts`, `record/type.ts`도 합집합인지 읽어서 확인한다.
  - 정착: `settle/type.ts`, `transitionSettlement.ts`, `evaluateDeriveRound.ts`는 06의 비례 비용 수정(44C-01·48C-01·49C-01·51C-01)과 05의 오류 기록(58C-01)을 함께 지킨다.
  - 문서: `core/DETAIL.md`, `record/DETAIL.md`, `settle/DETAIL.md`는 두 쪽 문장을 모두 남기고, 05가 이미 확정한 문장(59C-01 등)을 쓴다. `PLAN.md`는 05 행을 기준 브랜치에서, 06 행을 이 브랜치에서 가져온다.
  - 성능 대장 `verification/performance-issues.md`: 05의 P-16–P-21, R-08–R-10을 그대로 두고, 06의 해결 행은 R-11–R-19, 06의 열림 행은 P-22로 기록하며 06 문서의 인용을 함께 고친다.
  - 시나리오 패키지 `index.ts`, `src/types.ts`, `src/__tests__/families.test.ts`는 두 단계의 가족과 필드를 합친다. `types.ts`에서 05는 기대 필드(`deliveryOrder`, `onChangeCount`, `validationRequestCount`, `onErrorCodes`)만 더했으므로 동작 어휘는 06 쪽(`pop`, 아이템 `update`)을 그대로 쓴다.
  - 겉면의 `setValue`·`resetSubtree`는 05의 진입(`dispatchSetValue`, `dispatchResetSubtree`)을 부르는 기준 브랜치 쪽을 따른다.

### I2 확정된 오류 이름 (61라운드)

- 06의 자체 정의 `behaviors/utils/arrayMethodErrorCode.ts`와 `settle/utils/errors/settleErrorCode.ts`의 06 상수를 없애고 `src/errors/formErrorCode.ts`의 `SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY`, `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`를 쓴다(ERROR-197, ERROR-195).
- 06 문서의 "가칭" 표기를 지운다(`behaviors/DETAIL.md`, `arrayBehavior/DETAIL.md`, `settle/DETAIL.md`).

### I3 배열 동사의 진입 파일 (33C-01)

- `dispatch/utils/entry/dispatch{Push,Pop,Update,Remove,Clear}.ts`를 더하고 `dispatch/index.ts`에서 이름으로 내보낸다(LANDING-084, LANDING-064, EVENT-027, EVENT-035).
- 꼴은 `dispatchSetValue.ts`를 따른다: 첫 줄 `if (!enterSchemaNodeChain(node)) return;`(EVENT-008 되먹임 거부), `try`에서 `arrangeSchemaNodeItems` 호출, `catch`에서 `captureChainError`, `finally`에서 `exitSchemaNodeChain`.
- 겉면의 다섯 멤버는 진입 함수를 한 문장으로 부른다. `arrayBehavior/`에는 진입 사슬을 두지 않는다.
- 동사의 반환 값(log §4 M8)은 진입이 거부되면 `undefined`이다.
- `batch` 안의 동사(62C-01, EVENT-061·EVENT-013·EVENT-035·GOAL-058·NODE-051): 부른 자리에서 `readBatchValue(node)`(직전 커밋에 이 배치의 앞선 표시를 얹은 값)를 읽어 행의 계획(36C-01)을 적용하고, 결과 배열 전체를 호스트의 `runtime.batchWrites`에 통째 쓰기로 표시한다. 정착은 `fn`이 끝난 뒤 한 번이다. 동기 결과는 읽은 배열에서 나온다(`push`는 결과 길이, `pop`·`remove`는 그 자리의 표시된 원본). 잘못된 종류 값에는 47C-02·48C-02를 적용하고, 비배열 호스트의 `ARRAY_METHOD_ON_NON_ARRAY`는 `fn`의 예외처럼 사슬 머리 끝에서 던진다(EVENT-017). 배치 끝 정착은 통째 쓰기라 아이템 키는 위치로 잇는다. `batch`의 문서 주석에 62C-01이 정한 문장을 더하고 `dispatch` DETAIL에 적는다.
- 33C-01이 미뤘던 시험을 이제 단언한다: 배열 동사를 담은 배치는 `onChange`를 한 번 부른다(EVENT-035).
- 시험 `dispatch/__tests__/dispatch.array-entry.test.ts`(33C-01, EVENT-035, ERROR-197). 06 시험은 `batch` 합침이나 진입마다 한 번의 `onChange`를 단언하지 않는다.

### I4 `onError` 보고와 `UpdatePath` 배달

- ERROR-197: 비배열 노드의 배열 메서드 던짐은 진입 사슬의 오류 포착을 거쳐 `onError`로 보고된다(35C-01). 같은 자리 DETAIL의 "배선 PR이 보고를 더한다" 문장을 현재 계약으로 바꾼다.
- `UpdatePath`: 05의 `markCommitDeliveries.ts`는 배달 스냅숏의 `path`와 노드의 `path`가 다르면 `UpdatePath`를 표시한다. 06의 재인덱싱이 남긴 `(previous, current)` 경로 사실의 노드(자손 포함)를 배달 후보에 넣어 EVENT-068의 payload `{ previous, current }`로 배달되게 한다(35C-02, NODE-051).

### I5 05의 기록 계약

- 기록 칸 `state` → `interactionState`, 공개 `state`는 접근자. 06 코드와 시험을 맞춘다.
- `globalStateCounts`·`globalState`와 커밋 훅 `commitGlobalState.ts`(43C-01): 지금은 `context.exited`와 자손만 빼므로, 소멸한 아이템(`context.perished`, 35C-09)과 자손의 상태도 빼도록 고친다. 구조 연산으로 들어온 아이템은 `context.entered`로 더해지는지 확인한다.
- 소멸 노드의 배달 저장소 정리: `markCommitDeliveries.ts`는 `context.exited` 중 떨어진 노드만 `deliverySnapshots`·`deliveryWatchIndex`에서 지우므로 소멸 노드도 지운다. 경로를 열쇠에 담는 `warningKeys`·`pendingWarningRecords`는 재인덱싱과 소멸 정리에 넣는다.
- 그 밖에 05가 더한 경로 열쇠 또는 노드 열쇠 런타임 저장소는 병합 뒤 런타임 형을 전부 읽어 06의 재인덱싱(`rekeyArrayRuntimePaths.ts`)과 소멸 정리(`prunePerishedPaths.ts`)에 넣고(실행 ADR D4), 저장소마다 처리를 log에 적는다.
- 검증기 계약: `compile`·`compileGuard`·`release`가 같은 사본을 받는다(VALIDATE-019).

### I6 `ifPredicates` 대역 제거

- 05가 지운 `src/core/__tests__/ifPredicate.ts`와 런타임 `ifPredicates`를 06의 고정물·시험·벤치에서 걷어내고 `src/core/__tests__/fixtures/createTestValidator.ts`로 바꾼다. `evaluateGate.ts`, `record/type.ts`는 기준 브랜치 쪽을 따른다.

### I7 58C-01·59C-01에 맞춘 시험과 장면

- 58C-01: 한 정착의 오류는 모두 발생 순서대로 기록되고 사슬 끝에서 하나로 묶인다(`MULTIPLE_ERRORS`, `details.errors`). 예산 정지는 앞선 오류를 지우지 않는다. 06의 예산 정지 시험(`settle.array-rekey.test.ts`)과 `source-b-structure` 장면의 기대를 확인한다.
- 59C-01: `INJECT_TARGET_MISSING`과 자동 쓰기의 `INVALID_VIRTUAL_NODE_VALUES`는 `details.sourcePath`를 가지며, 아이템마다 같은 없는 대상에 주입하면 아이템마다 오류가 하나씩 난다. 이를 단언하는 배열 시험을 하나 더한다.

### I9 통합 중에 찾은 비례하지 않는 비용 (44C-01, 49C-01)

- 배달 감시 전체 훑기: `settle/utils/commit/markCommitDeliveries.ts`가 배열 `remove`마다 폼의 모든 감시자를 훑는다(05의 경로·배열 자식 조건과 06이 더한 소멸·경로 사실 조건). 감시자 하나에 약 1.3µs이며 옮겨진 아이템 수와 무관하다(SETTLE-017, GOAL-011 위반). 나간 노드 조건만 남기고, 소멸 노드의 경로와 옮겨진 노드의 옛·새 경로를 감시 색인 조회(`watchIndex.affected`)에 넣는다.
- 소멸 정리·재인덱싱의 저장소 전체 훑기: 06의 `prunePerishedPaths.ts`, `pruneArrayTailPaths.ts`, `rekeyArrayRuntimePaths.ts`가 `remove`마다 런타임 저장소 전체(`committedDeclarationIds` 등)를 훑고 열쇠마다 `JSON.parse`한다. 저장소마다 경로 색인을 두거나 기존 경로 색인(`getLatentPathIndex`와 같은 꼴)을 써서 비용이 소멸·이동한 경로 수에 비례하게 한다.
- 각 수정은 고치기 전에 실패하는 규모 가드 시험을 갖고, 차등 검사로 뜻이 바뀌지 않았음을 확인한다.

### I10 P-23 개선 (64라운드 소유자 답, 63C-01)

- 소유자가 P-23을 받아들이지 않았다("속도개선을 해보세요. 너무 느리군요"). 05의 `settle/utils/commit/markCommitDeliveries.ts`와 그 주변(비트 값을 열쇠로 쓰는 리비전 원장의 펼침 복사, `markSchemaNodeEvent`의 할당, 후보마다 만드는 스냅숏 객체, 환경 읽기·동결 경로)의 비용을 뜻을 바꾸지 않고 줄인다. 배달·리비전 원장·이벤트 계약(EVENT 영역)은 그대로 둔다. 키 입력에 더해진 약 6µs 상수도 같이 본다.
- 통과 기준(원장 관리자): 같은 완료점 ABBA 재측정에서 "array 1000 루트 통째 쓰기"가 54라운드 수용 수치 이하(Node 레거시의 1.41–1.43배, Bun 2.87배). 닿으면 P-23을 해결로, P-14의 54라운드 수용은 그대로. 닿지 않으면 남은 차이와 원인을 행에 적고 원장 관리자가 소유자에게 다시 묻는다.
- 수정마다 커밋 하나, 리비전 원장과 값의 차등 검사, 기존 게이트. 검증 엔진은 게이트마다 log에 적는다.

### I8 게이트 재실행

- core unit, render, `tsc`, `eslint`, 시나리오 패키지, 원장 인용 검사, 공개 `<Form>` 가드.
- 배열 벤치 TEST-032 두 행을 같은 방식으로 다시 재어 진입 사슬이 더한 비용을 기록한다(P-14 수용 수치와 비교).
- 차등 검사: 병합 전 HEAD 대 병합 뒤, 05가 바꾼 오류 묶음 외에 값·방출·잠복·선언 차이가 없음을 확인한다.
- 검증 판정은 antigravity가 한다(소유자 지시). 샌드박스 하네스가 필요한 차등 검사만 Claude verifier가 맡고 그 까닭을 log에 적는다.

## 2. 계획 리뷰

antigravity(`0dd23346`) `rework-required`, 지적 여섯. 반영: 06 열림 행의 P-22 재번호(F1), 소멸 아이템의 전역 상태 계수(F2), 소멸 노드의 배달 저장소 정리(F3), G27–G28의 CHECK(F5), `resetSubtree` 진입(F6 첫째). 다르게 처리: F4(`batch` 안 동사를 바로 실행하자는 안)는 쌓인 쓰기와 순서가 뒤바뀌는 경우가 있어 원장 질의 Q28로 올렸고, 62C-01이 갱신 함수와 같은 표시 규칙으로 닫음. F6 둘째(시나리오 `update` 어휘 충돌)는 05가 기대 필드만 더해 충돌이 아님(병합 기준 `10f98eec2` 대비 diff). G29·G30은 측정과 외부 판정이라 EVIDENCE로 두고 까닭을 적음.

## 3. 완료 조건

- 위 단위가 모두 반영되고 각 게이트가 통과한다(게이트 원장 G23–G30).
- 원장과 다르거나 원장이 정하지 않은 것은 원장 관리자에게 묻고 답을 log에 남긴다.
- PR #353 본문의 "머지 순서 항목"을 "05 통합 결과"로 바꾼다.
