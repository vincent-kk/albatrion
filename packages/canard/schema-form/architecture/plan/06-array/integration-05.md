# 06 배열 — 05 통합 계획 (두 번째 머지)

05(PR-4, #352)가 `1.0.0-beta`에 먼저 머지되었으므로(`afbba714d`, 원장 61라운드 `a0f15e9e0`) 06이 두 번째 머지 쪽으로 05의 배선과 이 브랜치를 잇는다(33C-01). 근거는 05 [log](../05-dispatch-and-validation/log.md)의 "06에 넘길 목록"과 원장 35C-01·35C-02·43C-01·58C-01·59C-01·61라운드이다. 원장이 스펙이며 이 문서는 순서와 완료 조건만 정한다.

## 1. 단위

### I1 기준 브랜치 병합과 충돌 해소

- `origin/1.0.0-beta`를 병합한다. 내용 충돌 15곳은 두 단계의 계약을 모두 지키는 합집합으로 푼다.
  - 겉면: `SchemaNode.ts`, `SchemaNode/DETAIL.md` 멤버 표, `surface.test.ts`(시험 이름은 05의 `26C-01 PR-4 …`, 멤버 수는 두 단계의 합), `type-contract.test.ts`. 자동 병합된 `SchemaNode/type.ts`, `src/core/index.ts`, `record/type.ts`도 합집합인지 읽어서 확인한다.
  - 정착: `settle/type.ts`, `transitionSettlement.ts`, `evaluateDeriveRound.ts`는 06의 비례 비용 수정(44C-01·48C-01·49C-01·51C-01)과 05의 오류 기록(58C-01)을 함께 지킨다.
  - 문서: `core/DETAIL.md`, `record/DETAIL.md`, `settle/DETAIL.md`는 두 쪽 문장을 모두 남기고, 05가 이미 확정한 문장(59C-01 등)을 쓴다. `PLAN.md`는 05 행을 기준 브랜치에서, 06 행을 이 브랜치에서 가져온다.
  - 성능 대장 `verification/performance-issues.md`: 05의 P-16–P-19, R-08–R-10을 그대로 두고, 06의 해결 행 R-08–R-16을 R-11부터 다시 매기고 06 문서의 인용을 함께 고친다. 06의 열림 행 P-20은 그대로 둔다.
  - 시나리오 패키지 `index.ts`, `src/types.ts`, `src/__tests__/families.test.ts`는 두 단계의 가족과 필드를 합친다.

### I2 확정된 오류 이름 (61라운드)

- 06의 자체 정의 `behaviors/utils/arrayMethodErrorCode.ts`와 `settle/utils/errors/settleErrorCode.ts`의 06 상수를 없애고 `src/errors/formErrorCode.ts`의 `SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY`, `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`를 쓴다(ERROR-197, ERROR-195).
- 06 문서의 "가칭" 표기를 지운다(`behaviors/DETAIL.md`, `arrayBehavior/DETAIL.md`, `settle/DETAIL.md`).

### I3 배열 동사의 진입 파일 (33C-01)

- `dispatch/utils/entry/dispatch{Push,Pop,Update,Remove,Clear}.ts`를 더하고 `dispatch/index.ts`에서 이름으로 내보낸다(LANDING-084, LANDING-064, EVENT-027, EVENT-035).
- 꼴은 `dispatchSetValue.ts`를 따른다: 첫 줄 `if (!enterSchemaNodeChain(node)) return;`(EVENT-008 되먹임 거부), `try`에서 `arrangeSchemaNodeItems` 호출, `catch`에서 `captureChainError`, `finally`에서 `exitSchemaNodeChain`.
- 겉면의 다섯 멤버는 진입 함수를 한 문장으로 부른다. `arrayBehavior/`에는 진입 사슬을 두지 않는다.
- 동사의 반환 값(log §4 M8)은 진입이 거부되면 `undefined`이다. `batch` 안의 동사가 `batchWrites` 대기열로 표현되지 않으면 대기열에 넣지 말고 멈춰 원장 질의로 올린다.
- 시험 `dispatch/__tests__/dispatch.array-entry.test.ts`(33C-01, EVENT-035, ERROR-197). 06 시험은 `batch` 합침이나 진입마다 한 번의 `onChange`를 단언하지 않는다.

### I4 `onError` 보고와 `UpdatePath` 배달

- ERROR-197: 비배열 노드의 배열 메서드 던짐은 진입 사슬의 오류 포착을 거쳐 `onError`로 보고된다(35C-01). 같은 자리 DETAIL의 "배선 PR이 보고를 더한다" 문장을 현재 계약으로 바꾼다.
- `UpdatePath`: 디스패처가 기록 수준의 `(previous, current)` 경로 사실을 EVENT-068의 payload `{ previous, current }`로 배달한다(35C-02, NODE-051). 경로 사실의 출처는 06의 재인덱싱 작업 칸이다.

### I5 05의 기록 계약

- 기록 칸 `state` → `interactionState`, 공개 `state`는 접근자. 06 코드와 시험을 맞춘다.
- `globalStateCounts`·`globalState`와 커밋 훅 `commitGlobalState.ts`(43C-01)가 배열 아이템이 형상에 들고 날 때(구조 연산, 소멸, 나감)도 센다.
- 05가 더한 경로 열쇠 런타임 저장소가 있으면 06의 재인덱싱(`rekeyArrayRuntimePaths.ts`)과 소멸 정리(`prunePerishedPaths.ts`)에 넣는다(실행 ADR D4). 목록은 병합 뒤 런타임 형을 읽어 정하고 이 계획의 기록에 남긴다.
- 검증기 계약: `compile`·`compileGuard`·`release`가 같은 사본을 받는다(VALIDATE-019).

### I6 `ifPredicates` 대역 제거

- 05가 지운 `src/core/__tests__/ifPredicate.ts`와 런타임 `ifPredicates`를 06의 고정물·시험·벤치에서 걷어내고 `src/core/__tests__/fixtures/createTestValidator.ts`로 바꾼다. `evaluateGate.ts`, `record/type.ts`는 기준 브랜치 쪽을 따른다.

### I7 58C-01·59C-01에 맞춘 시험과 장면

- 58C-01: 한 정착의 오류는 모두 발생 순서대로 기록되고 사슬 끝에서 하나로 묶인다(`MULTIPLE_ERRORS`, `details.errors`). 예산 정지는 앞선 오류를 지우지 않는다. 06의 예산 정지 시험(`settle.array-rekey.test.ts`)과 `source-b-structure` 장면의 기대를 확인한다.
- 59C-01: `INJECT_TARGET_MISSING`과 자동 쓰기의 `INVALID_VIRTUAL_NODE_VALUES`는 `details.sourcePath`를 가지며, 아이템마다 같은 없는 대상에 주입하면 아이템마다 오류가 하나씩 난다. 이를 단언하는 배열 시험을 하나 더한다.

### I8 게이트 재실행

- core unit, render, `tsc`, `eslint`, 시나리오 패키지, 원장 인용 검사, 공개 `<Form>` 가드.
- 배열 벤치 TEST-032 두 행을 같은 방식으로 다시 재어 진입 사슬이 더한 비용을 기록한다(P-14 수용 수치와 비교).
- 차등 검사: 병합 전 HEAD 대 병합 뒤, 05가 바꾼 오류 묶음 외에 값·방출·잠복·선언 차이가 없음을 확인한다.
- 검증 판정은 antigravity가 한다(소유자 지시). 샌드박스 하네스가 필요한 차등 검사만 Claude verifier가 맡고 그 까닭을 log에 적는다.

## 2. 완료 조건

- 위 단위가 모두 반영되고 각 게이트가 통과한다(게이트 원장 G23–G30).
- 원장과 다르거나 원장이 정하지 않은 것은 원장 관리자에게 묻고 답을 log에 남긴다.
- PR #353 본문의 "머지 순서 항목"을 "05 통합 결과"로 바꾼다.
