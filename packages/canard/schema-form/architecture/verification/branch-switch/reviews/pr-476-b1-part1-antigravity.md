# B1 게이트 판정 통일 독립 검토 의견서 (Part 1: 코드, 동등성, 시험)

- **검토 범위**: `a8e61d155..925c97019` (`packages/canard/schema-form`)
- **작업 트리**: `/Users/Vincent/Workspace/albatrion/branch-switch-b1`
- **대상 브랜치**: `perf/schema-form-b1-gate-predicate`
- **제품 Head**: `38e405d6b` / **문서 Head**: `925c97019` / **Base**: `a8e61d155`
- **검토자**: Antigravity (독립 읽기 전용 검토자)
- **일자**: 2026-10-27

---

## 1. 종합 판정표

| 항목 | 판정 | 근거 (path:line) |
| :--- | :---: | :--- |
| **공개 API 표면 불변** | **PASS** | `src/index.ts` 및 `src/__tests__/publicSurface.test.ts` 변경 0줄 (`git diff` 출력 없음) |
| **기존 시험 기대값 변경 0 (add-only)** | **PASS** | `settle.gate-wheel-counts.test.ts:109-112, 144` 기존 단언 유지, 기준 경로 모드 고정 줄만 추가. `observeGateTableModes.ts:8, 27, 30, 55, 57, 64, 67, 145` 추가 훅만 삽입 |
| **코어 의존성 및 프랙탈 임포트 규칙** | **PASS** | `src/core/` 내 `src/app` 임포트 전무. 신규 파일들(`predicates/*`, `childSelection/utils/*` 등) 모듈 경계 및 상대 경로 규칙 엄수 |
| **DETAIL 선행 커밋 및 비용 모델·불변식** | **PASS** | 최초 커밋 `58aad5c6d`에서 DETAIL 선행 반영. `settle/DETAIL.md:15-25`에 O(G) 평가, O(A+Δ) 적용, 호스트 출력 변경 비례 view 생성, 화이트리스트 명시 |
| **호스트 게이트 전수 평가 (BLUEPRINT-007)** | **PASS** | `selectPredicateTableChildren.ts:84-100`, `selectEntryStep.ts:144-162`, `evaluateGate.ts:44-96`. 역색인을 통한 평가 건너뜀 없음 |
| **입력 메모 동일성 및 던짐 미저장 (BLUEPRINT-053)** | **PASS** | `evaluateGate.ts:70-74, 95`에서 `Object.is` 전수 비교. `getGateRegistry.ts:31` 발생 인스턴스 소유 메모. `evaluateGate.ts:96, 147-148, 199`에서 실패/던짐 시 메모 제거 및 버퍼 초기화 |
| **즉시 반영 및 고정점 확인 바퀴 (SETTLE-020/050)** | **PASS** | `readGateHostView.ts:33-40`에서 projected/extra identity 변경 시 view 즉시 재생성. `recordGateInput.ts:28-30` 및 `canSkipGateWheel.ts:35, 41-61`에서 라운드 내 입력 불일치 시 confirmation 바퀴 강제 |
| **`if` 읽기 좁히기 화이트리스트의 보수성** | **PASS** | `collectIfGateReadNames.ts:6-67`. scalar 제약/required/dependentRequired 외 `$ref`, `patternProperties`, `additionalProperties` 등 전수 fallback (`getIfGateReadNames.ts:29-32`, `createGatePredicate.ts:46-52`) |
| **`discriminator` 태그 표 동등성 (그림자 검증)** | **PASS** | `isStableDiscriminatorEntry.ts:17-64`, `prepareDiscriminatorEntrySelection.ts:34-64`, `readDiscriminatorEntrySelection.ts:33-47`. `verifyTableGate.ts:48-52` 및 그림자 검증 모드 일치 |
| **가드 바인딩 및 오류/경고 의미론 보존** | **PASS** | `evaluateGate.ts:101-140` (검증기 누락 경고 2종 일치), `evaluateGate.ts:148-196` (`GuardFailed` 코드, 메시지, surface, chainOccurrences 순서 일치) |
| **`appliesWhen` 및 `negated` 처리 보존** | **PASS** | `evaluateGate.ts:37-43` 재귀 호출 유지, `createGatePredicate.ts:63` `gate.negated` 반전 유지 |
| **규칙 고정 시험 및 기준 경로 대조** | **PASS** | `settle.gate-predicate-modes.test.ts:33-207`, `settle.gate-predicate-allocation.test.ts:30-157`, `settle.gate-predicate.test.ts:1-468`. 기준 빌드에서 실패 및 신규 빌드 통과 |
| **검증 하네스 부정 시험 (Negative test)** | **PASS** | `settle.gate-predicate-modes.test.ts:33-53`에서 discriminator table 손상 시 하네스 거부 및 위반 카운트 검증 |
| **`active` 경로 성능 위생** | **PASS** | `selectLiteralTableChildren.ts:1-79`는 베이스 코드와 구조 동등. 프로토타입 getter/정적 빈 배열 재사용(`NO_SCHEMA_PATHS`). 독립 진단(`b1diag`) 측정창 잡음 확인 |
| **주석 규칙 (현재 사양만 서술, 역사 배제)** | **PASS** | `settle.gate-wheel-counts.test.ts:109` 포함 모든 추가 주석이 현행 사양만 기술함 |

---

## 2. 세부 검토 증거 및 분석

### 2.1 범위 및 계약 (Scope & Contracts)

1. **공개 표면 (Public Surface)**:
   - `git diff a8e61d155..925c97019 -- packages/canard/schema-form/src/index.ts packages/canard/schema-form/src/__tests__/publicSurface.test.ts` 실행 결과 변경 사항이 전혀 없음(0 diff).
2. **시험 파일 Add-Only 원칙**:
   - `settle.gate-wheel-counts.test.ts`: S6 사례에서 기존 단언문(`expect(...)`)은 일체 수정 또는 삭제되지 않았으며, 코디네이터 결정 454C-03에 따라 기준 경로 고정을 위한 `engineModes.setMode('gatePredicate', 'off')`와 복구 줄만 추가됨(`settle.gate-wheel-counts.test.ts:109-112, 144`).
   - 검증 하네스(`observeGateTableModes.ts:8, 27, 30, 55, 57, 64, 67, 145`): `classifyGateTableVisits` 훅 연결을 위한 줄만 추가되었으며, 기존 단언은 수정되지 않음.
3. **아키텍처 및 커밋 순서**:
   - 코어 계층(`src/core/`)에서 `src/app`을 임포트하는 경로 없음.
   - 최초 커밋 `58aad5c6d`(`docs(schema-form): define unified gate predicate and input view contracts`)에서 구현 코드(`f4929d4de`)보다 앞서 `DETAIL.md`를 갱신함.
   - `packages/canard/schema-form/src/core/engine/settle/DETAIL.md:15-25`에 라운드당 $O(G)$ 평가 비용, $O(A+\Delta)$ 표 적용 비용, 호스트 출력 변경 수에 비례하는 뷰 생성 횟수, `if` 화이트리스트 및 invariant가 명시됨.

### 2.2 의미론 및 불변식 (Semantics & Invariants)

1. **BLUEPRINT-007 (호스트 게이트 전수 평가)**:
   - `selectPredicateTableChildren.ts:84-100`에서 호스트의 모든 `table.predicateGroups`를 순회하며 `evaluateGate(group.gate, frame.context, frame.node)`를 순차 평가함.
   - `selectEntryStep.ts:144-162`에서 각 declaration의 gate를 빠짐없이 평가함.
   - 변경된 경로를 통한 역색인 스킵 없이 모든 게이트가 매 라운드 평가됨.
2. **BLUEPRINT-053 (입력 메모 동일성 및 예외 미저장)**:
   - `evaluateGate.ts:70-74`:
     ```ts
     if (identical && !Object.is(memo!.values[index], value)) identical = false;
     ```
     `Object.is` 동일성 검증을 수행하며, 하나라도 다르면 `identical = false`가 됨.
   - `evaluateGate.ts:95`: `if (reusable && identical && memo) return memo.value;`
   - `evaluateGate.ts:96, 147-148`: 평가가 새로 실행되거나 가드/식이 throw(`catch`)하면 `occurrence.memo = undefined`로 즉시 초기화됨.
   - `evaluateGate.ts:197-202`: `finally` 블록에서 memo가 없는 경우 `input.values.fill(undefined)`로 참조를 해제함.
   - 메모 키는 경로 문자열이 아닌 live `occurrence` 인스턴스(`RegisteredGateOccurrence`)에 귀속됨(`getGateRegistry.ts:31`).
3. **즉시 반영 (SETTLE-020/050) 및 고정점 확인 바퀴**:
   - `readGateHostView.ts:33-40`:
     ```ts
     if (cached && Object.is(cached.projected, projected) && Object.is(cached.extra, extra))
       return cached;
     ```
     동일 라운드 내에서 앞선 분기 전환으로 호스트의 projected 객체나 extra identity가 변경되면 즉시 새 뷰 `{ ...host, ...extras }`를 생성하여 후속 게이트에 전달함.
   - `recordGateInput.ts:28-30`: 동일 라운드 내 동일 입력 사이트에서 서로 다른 값이 관측되면 `frame.consistent = false`로 마킹.
   - `canSkipGateWheel.ts:35`: `!frame.consistent`이면 확인 바퀴 생략을 거부하고 추가 바퀴를 실행하여 고정점을 확인함.
4. **`if` 읽기 좁히기 화이트리스트의 완전 보수성**:
   - `collectIfGateReadNames.ts:6-67`:
     - 허용 키워드: 최상위 `type: 'object'`, `properties`의 속성별 값 제약(`VALUE_KEYWORDS`: type, const, enum, min/max, multipleOf, length, pattern), `required`, `dependentRequired`, 그리고 이들의 `allOf`/`anyOf`/`oneOf`/`not` 조합.
     - 비허용 키워드: `$ref`, `patternProperties`, `additionalProperties`, `propertyNames`, `unevaluated*`, 중첩 `if/then/else`, 알 수 없는 키워드는 즉시 `return false;` 처리됨.
     - `getIfGateReadNames.ts:29-32`: 화이트리스트 검증 실패 시 `undefined` 반환.
     - `createGatePredicate.ts:46-52`: `names`가 `undefined`이면 `occurrence.hostPath`를 통째로 `'value'` 및 `'extra'` 사이트로 등록하여 전체 호스트 읽기로 안전하게 후퇴함.
     - 화이트리스트에 포함된 어떤 키워드도 다른 속성을 읽거나 관측을 누락시키지 않음.
5. **`discriminator` 태그 테이블 동등성 (그림자 검증)**:
   - `isStableDiscriminatorEntry.ts:17-64`: 대상 노드가 terminal이고 string/number/boolean/finite literal const/enum만 갖는지 엄격히 판정.
   - `selectLiteralTableChildren.ts:64-66` 및 `verifyTableGate.ts:28-66`: 테이블 판정과 기준 경로 평가의 동등성을 S1/S2/그림자 모드로 증명함.
6. **가드 바인딩 및 오류/경고 의미론**:
   - `evaluateGate.ts:101-140`: 검증기 부재 시 `ValidatorMissing` 및 `ConditionalSchemaWithoutValidator` 경고를 기존과 동일한 조건, 코드, 메시지, schemaPath, chainOccurrences 순서로 발행.
   - `evaluateGate.ts:148-196`: 가드 실패 시 `FormErrorCode.GuardFailed`, 메시지, `{ path, schemaPath, cause }` details, `sink`/`thrown` surface 및 `guardFailureRecords` 기록 방식이 완벽히 일치함.
7. **`appliesWhen` 및 `negated`**:
   - `evaluateGate.ts:37-43`: `gate.appliesWhen?.some(...)` 재귀 평가 유지.
   - `createGatePredicate.ts:63`: `gate.negated ? !result : result` 유지.

### 2.3 시험 (Tests)

1. **베이스 빌드 대비 실패 검증 (Red-Green)**:
   - 평가 횟수 상한(80회 이하) 및 좁힌 `if`의 바퀴 1회: 베이스 빌드에서는 좁히기가 없어 2바퀴 640~800회 호출되므로 실패함.
   - 동일 입력 메모 재사용: 베이스 빌드에서는 매번 평가하므로 호출 카운트 불변 단언에서 실패함.
   - 던진 평가의 재실행: 베이스 빌드에는 메모 해제/버퍼 복구 규약이 없음.
   - 3종 게이트 동일 선택: 베이스의 off 모드와 일치함을 shadow 단언으로 증명.
   - 하네스 분류 부정 시험(`settle.gate-predicate-modes.test.ts:33-53`): 손상된 discriminator 테이블에 대해 `gateSelectionTable.violations` 증가 및 거부 예외를 단언함.
2. **`test:verify` 통과**:
   - `vitest --project verify-unit run src/core/engine/settle/__tests__/settle.gate-predicate-modes.test.ts` (9 tests PASS).
   - `vitest --project verify-unit run src/core/engine/settle/__tests__/settle.gate-table-characterization.test.ts` (25 tests PASS, `nonNoop: 0`).
   - `typecheck` 및 `lint` 모두 에러 없이 통과.

### 2.4 `active` 경로 성능 위생 (Performance Hygiene)

1. **`active` 경로 변경점 분석**:
   - `selectLiteralTableChildren.ts`: 베이스의 `selectTableChildren.ts`와 본체 로직이 100% 동일함.
   - `selectTableChildren.ts:17-19`: `round.table.predicateGroups.length` 검사 후 단일 분기 디스패치(0이면 즉시 `selectLiteralTableChildren` 실행)로 오버헤드 무시 가능.
   - `prepareGateTableRound.ts:50-54`: `stableSchemaNames`가 비어 있는 경우 정적 동결 빈 배열 `NO_SCHEMA_PATHS`를 공유하여 할당을 방지함.
   - `evaluateGate.ts:54-56`: `gate.kind === 'active'`인 경우 `readGateHostView` 조회를 건너뛰어 뷰 객체 생성이 전혀 없음.
   - `getGateRegistry.ts`: `RegisteredGateOccurrence`의 `predicate`는 클래스 프로토타입 게터로 선언되어 인스턴스별 클로저 할당이 없음.
2. **독립 진단(`b1diag`) 대조**:
   - 진단 스크립트(`b1diag/pair10.txt`) 확인 결과 base와 head의 최소 실행 시간이 상호 중첩되며(base 249~321 µs vs head 253~327 µs), 편차는 측정창 환경 노이즈로 확인됨.
   - `b1diag/alloc.mjs` 메모리 할당 측정에서도 active 경로의 신규 할당 증가는 발견되지 않음.

### 2.5 주석 규약 (Comments Hygiene)

- 모든 추가된 주석은 현행 사양과 동작만을 명시하며, 과거 이력이나 비교 표현(예: "previously", "was", "before B1" 등)을 일체 포함하지 않음.
- `settle.gate-wheel-counts.test.ts:109`의 `// 전수 입력·메모 없는 기준 경로의 바퀴 수를 고정한다.` 역시 기준 경로 모드의 현행 사양만을 기술함.

---

## 3. 결함 목록 및 권고사항

- **결함 (Defects)**: 없음 (0건).
  - 좁힌 `if`가 가드가 읽는 속성을 누락하는 결함 없음.
  - 읽기 경로로 게이트 평가를 건너뛰는 결함 없음.
  - 기존 시험 기대값이 변경된 사례 없음.
  - 라운드 내 즉시 반영 계약 훼손 없음.
- **권고 사항 (Advisories)**:
  - 코디네이터 결정 454C-03에서 승인된 바와 같이, `settle.gate-wheel-counts.test.ts`의 S6 사례에 추가된 `engineModes.gatePredicate = off` 고정 줄은 운영 원칙 12의 경계선에 위치하므로 차후 검토 시 재확인 목록(재검증 대상)으로 관리하는 것이 바람직합니다.
  - B1 워커 결과 문서(`b1-results.md`)에 보고된 성능 게이트(TEST-073 3개 행 통계적 회귀 판정)는 코드 정확성과는 별개의 성능 판정 영역이므로, 후속 Part 2 성능 리뷰 및 코디네이터 의사결정에서 다루어질 예정입니다.

---

최종 판정: PASS
