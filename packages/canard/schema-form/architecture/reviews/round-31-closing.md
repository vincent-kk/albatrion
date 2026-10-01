# 31라운드 닫기 — 05 착수 뒤의 원장 해석 다섯: 진입 밖 명령의 배달 시점, 운영 모드 경고의 둘째 예외, `reason` 값의 닫힌 목록, 차등 시험의 독립 검증기, 가칭 이름의 확정 절차

2026-10-01. 05 작업자(브랜치 `feat/schema-form-dispatch-and-validation`, 워크트리 `.claude/worktrees/stage-05`)가 실행 계획을 쓰며 원장 해석 일곱 건을 물었다. 넷(ajv 기본값의 예외 VALIDATE-051, 가드 컴파일 공유 단위 VALIDATE-048, 운영 모드 경고의 일반 규칙 ERROR-021, `reason: 'duplicateSchemaId'`가 새 코드가 아님 ERROR-201)은 현행 항목의 문장 그대로라 확인만 했다. 나머지는 현행 항목에서 유도되나 원장이 문장으로 적지 않았거나(진입 밖 호출의 배달 시점, `reason` 값의 범위, 가칭 이름을 확정한 뒤의 기록), 작업자의 읽기가 원장의 문장과 달라(차등 시험의 독립 검증기) 편집자 결정으로 닫는다. 소유자에게 물을 것은 없다. 차등 시험의 독립 검증기 라이브러리를 개발 의존성으로 더하는 일은 05가 PR을 연 뒤 소유자 확인 묶음에 든다.

### 31C-01 `request(kind)`는 진입이 아니다 — 진입 안에서는 디스패처가 비트를 모아 최외곽 진입의 끝에 한 번, 진입 밖에서는 호출 안에서 동기로 배달한다

- 닫는 항목: EVENT-045(보충), EVENT-027(보충), EVENT-067(보충), EVENT-073(보충)
- 결정:
  - 【추론】 명령 메서드 `request(kind)`의 호출은 진입이 아니다: EVENT-027의 공개 쓰기 API 목록(`setValue`·`push`·`pop`·`update`·`remove`·`clear`·`batch`)에 명령이 없고, EVENT-045는 명령을 상태 변경·외부 오류와 함께 "정착을 거치지 않는 사건"으로 묶으며, EVENT-063대로 명령은 요청 사건만 내고 원본을 쓰지 않으므로 진입 깊이가 1 → 0이 될 때의 검증 요청과 `onChange`(EVENT-027)를 일으키지 않는다.
  - 【추론】 EVENT-045의 "같은 진입 규칙"은 루트의 진입 깊이 카운터가 정하는 배달 시점이다: 깊이가 0보다 크면 명령·상태 변경·외부 오류 사건의 비트는 노드마다 모아 두고(EVENT-067), 깊이가 1 → 0이 되는 최외곽 진입의 끝에 한 번 배달한다.
  - 【추론】 진입이 열려 있지 않을 때(깊이 0) 들어온 `request(kind)`는 기다릴 진입의 끝이 없으므로 그 호출 안에서 동기로 배달한다; 같은 노드에 합칠 다른 비트가 없으니 그 명령 하나가 배달되며, `setState`와 외부 오류 설정·지움도 같다. 오늘 `batch` 밖에서 부른 `publish`가 동기로 배달되는 것과 같은 모양이다.
  - 【추론】 EVENT-045의 "명령은 즉시 재발행 통로를 유지한다(`DeferrableNodeProxy`가 오늘 하는 것)"는 렌더 계층의 몫이다(GOAL 영역 T-3: `RequestFocus`·`RequestSelect`가 지연 마운트를 풀고 드러난 커밋 안에서 명령을 동기로 다시 발행한다). 코어(PR-4)는 리스너 없는 노드에 간 명령을 렌더 계층이 다시 발행할 수 있게 두는 것까지이고, 다시 발행하는 코드는 PR-7이다.
- 근거: EVENT-027 "같은 루트의 다른 공개 쓰기 API가 호출 스택에 없는 상태에서 이루어진 한 번의 공개 쓰기 호출. 공개 쓰기 API는 `setValue`·`push`·`pop`·`update`·`remove`·`clear`·`batch`이고", "읽기·`subscribe`·상태 칸 쓰기(§2의 R15)는 진입이 아니다. 구현은 루트의 **진입 깊이 카운터**이며, 깊이가 1 → 0이 될 때 검증을 먼저 요청하고 그다음 `onChange`를 부른다"; EVENT-045 "정착을 거치지 않는 사건이다. 같은 루트 디스패처가 **같은 진입 규칙**으로 배달한다. 최외곽 진입의 끝에서 한 번, 명령은 즉시 재발행 통로를 유지한다(`DeferrableNodeProxy`가 오늘 하는 것)"; EVENT-067 "한 진입 안에서 두 경로가 같은 노드를 바꾸면 비트는 합쳐져 그 노드에 한 번 배달된다"; EVENT-073 30라운드 보충 "같은 진입 안의 여러 명령은 디스패처가 비트를 합쳐 한 번 배달한다(EVENT-045·067)"; GOAL 영역 T-3 "`RequestFocus`/`RequestSelect`만 지연 마운트를 강제 해제한다(`DeferrableNodeProxy.tsx:9-14`)".

### 31C-02 운영 모드 경고의 예외는 둘이다 — ERROR-021의 가드 컴파일 시점에 WRITE-099의 `NON_JSON_WHOLE_VALUE`(핸들러가 있어도 개발 모드만)가 더해지고, 판정 비용 때문에 `hasConsumer()`로 거르는 경고는 예외가 아니다

- 닫는 항목: ERROR-021(보충), ERROR-196(보충), VALUE-037(보충)
- 결정:
  - 【추론】 ERROR-021의 "핸들러가 있으면 프로덕션에서도 경고를 받는다"가 일반 규칙이고, 소비자 조건은 ERROR 영역의 `hasConsumer()`(핸들러가 있음 또는 `NODE_ENV !== 'production'`)다.
  - 【추론】 ERROR-021이 "예외는 하나다"라고 적은 가드 컴파일 실패의 시점 차이에, 18라운드 뒤 블록 WRITE-099가 둘째 예외를 더했다: `NON_JSON_WHOLE_VALUE`의 깊이 점검은 핸들러가 있어도 프로덕션에서는 돌지 않는다. 뒤 결정이 이기므로 운영 모드에서 핸들러가 받지 못하는 경고는 이 코드 하나다.
  - 【추론】 `RESET_REBUILT_BY_REFERENCE`(ERROR-196)와 `MULTIPLE_GATED_BRANCHES_ACTIVE`의 "개발 모드이거나 핸들러가 있을 때만 판정"은 판정 비용(순회 한 번 더)을 소비자가 없을 때 아끼는 것이라 ERROR-021과 어긋나지 않는다: 핸들러가 있으면 프로덕션에서도 판정하고 전달한다. 구현은 이 둘을 `hasConsumer()`로, `NON_JSON_WHOLE_VALUE`를 개발 모드 조건으로 거르며, 나머지 경고는 ERROR-021대로 판정하고 소비자가 있으면 전달한다.
- 근거: ERROR-021 "핸들러가 있으면 프로덕션에서도 경고를 받는다. 예외는 하나다. 가드 컴파일 실패는 개발 모드가 시점을 앞당겨 마운트의 커밋 뒤에 보낸다(`surface`는 `'sink'`)"; WRITE-099 "`NON_JSON_WHOLE_VALUE`의 깊이 점검은 VALUE-037대로 개발 모드에서만 돌며, 핸들러가 있어도 프로덕션에서는 돌지 않는다."; ERROR-196 "그래서 개발 모드이거나 `onError` 핸들러가 있을 때만 판정한다.", "핸들러가 없는 프로덕션에서는 판정하지 않는다(`MULTIPLE_GATED_BRANCHES_ACTIVE`와 같은 관례).", "`onError` 핸들러가 있으면 모든 환경에서 경고 기록을 보내고, 전달 시점은 reset 사슬 끝이다".

### 31C-03 `details.reason`의 값은 원장이 코드마다 이름 붙인 것으로 닫힌다 — 이름 없는 원인에는 `reason`을 싣지 않는다

- 닫는 항목: ERROR-201(보충), ERROR-164(보충)
- 결정:
  - 【추론】 `reason`은 새 코드가 아니라 기록의 `details` 칸이며, 그 값은 코드마다 원장이 이름 붙인 것으로 닫힌 리터럴 합집합이다: `VALUE_TYPE_MISMATCH`는 `'unconvertible'`·`'ambiguous'`(VALUE-037), `DISCRIMINATOR_MISMATCH`는 `'missing'`·`'kind'`·`'overlap'`·`'key'`(25C-12), `VALIDATOR_COMPILE_FAILED`·`GUARD_FAILED`는 `'duplicateSchemaId'`(ERROR-201, 가칭) 하나다.
  - 【추론】 원장이 이름 붙이지 않은 원인(예: 검증기 `compile`이 던짐)에는 `reason`을 싣지 않고 그 코드의 ERROR-164 행이 정한 `details`(원래 예외 등)만 싣는다; 값을 하나 더하는 것은 원장 항목이지 코드만의 변경이 아니다.
- 근거: ERROR-201 "플러그인이 떼어 두지 못해 등록이 실패하면 새 코드 없이 있는 부류로 드러낸다.", "전체 컴파일은 `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED`, 가드는 `SCHEMA_FORM_ERROR.GUARD_FAILED`이며, `details`에 가칭 `reason: 'duplicateSchemaId'`와 `$id`를 싣는다."; VALUE-037 "`reason`은 받아 줄 형이 없으면 `'unconvertible'`, 둘 이상이면 `'ambiguous'`이고"; ERROR-164 25C-12 보충 "그래서 `DISCRIMINATOR_MISMATCH`는 넷이다: 키가 어느 분기에도 없음(`reason: 'missing'`), 분기끼리 종류가 다름(`reason: 'kind'`), 분기 사이 값이 겹침(`reason: 'overlap'`), 같은 노드의 선언 사이 판별 키가 다름(`reason: 'key'`".

### 31C-04 차등 시험의 독립 검증기는 ajv가 아닌 다른 라이브러리다 — 같은 메이저의 새 Ajv 인스턴스는 "다른 구현"이 아니다

- 닫는 항목: TEST-001(보충), TEST-017(보충)
- 결정:
  - 【추론】 TEST-001의 "독립 검증기는 폼이 쓰는 플러그인과 다른 구현이어야 하고"에서 다른 구현은 다른 라이브러리다: 폼이 쓰는 플러그인과 같은 메이저의 Ajv를 새로 만들어 작성 스키마를 바로 컴파일하는 것은 같은 구현이 다른 경로를 지나는 것이라, 1라운드가 막은 동어반복(같은 구현에 같은 값)을 피하지 못한다.
  - 【추론】 원장이 이미 아는 다른 구현은 `@cfworker/json-schema`(ADR 0004, VALIDATE 영역의 플러그인 구현체 후보)이며, 시험 하네스의 개발 의존성으로 쓰는 것이 자연스럽다; 다른 메이저의 ajv를 "다른 구현"으로 받는 것은 소유자 답 없이 하지 않는다. 개발 의존성을 더하는 일은 05가 PR을 연 뒤 소유자 확인 묶음에 든다.
  - 【추론】 나머지 모양은 TEST-001 그대로다: 독립 검증기는 폼을 거치지 않고 작성 스키마를 바로 컴파일하고, `FormHandle.getValue()`를 JSON으로 직렬화한 값을 넣어 `form.validate()`의 판정과 비교한다. 같은 메이저의 Ajv 직접 경로와의 비교는 회귀 검사로 더 둘 수 있으나 TEST-001의 오라클은 아니다.
- 근거: TEST-001 "독립 검증기는 폼이 쓰는 플러그인과 다른 구현이어야 하고 값은 JSON으로 직렬화한 뒤 넣는다.", 보충 "같은 플러그인에 같은 메모리 값을 넣으면 동어반복이다(`reviews/round-1.md` §7-8)."; TEST-017 "차등 시험(독립 검증기와의 판정 동치)"; VALIDATE 영역 "`@cfworker/json-schema`는 내장 후보가 아니라 플러그인 구현체 후보 가운데 하나가 된다." (`adr/0004-validator-plugin-compile-guard.md:64`).

### 31C-05 가칭 이름의 확정은 PR-4의 결정이되 원장이 함께 자란다 — PR 본문과 05 실행 기록에 적고, 원장 관리자가 보충으로 옮기며, 소유자·뒤 라운드가 이미 확정한 이름이 이긴다

- 닫는 항목: ERROR-164(보충)
- 결정:
  - 【추론】 ERROR-164가 "'(가칭)'인 코드 이름은 PR-4에서 확정한다"고 적었으므로 가칭 이름의 확정은 05 작업자의 결정이고 소유자 결정이 아니다; 확정한 이름(바꾼 것은 까닭과 함께)은 PR 본문과 `plan/05-dispatch-and-validation/log.md`에 적는다.
  - 【추론】 원장은 명세이므로 가칭 표기가 그대로 남으면 어긋난다: 05가 목록을 보내면 원장 관리자가 ERROR-164와 제목에 그 코드를 든 항목마다 05의 기록을 출처로 보충 한 줄을 더한다(옛 글은 자라기만 한다). 05가 새 라운드를 열 필요는 없다.
  - 【추론】 소유자 답이나 뒤 라운드가 이미 확정한 이름은 가칭 문장을 이긴다: `union`·`unionBehavior/`·`isUnionNode`(BLUEPRINT-035), 경고등 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`(SURFACE-061, `VALUE_TYPE_MISMATCH` 가칭을 대신함), `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND`는 낼 자리가 없어 확정에서 빠짐(CONTROLS-079). 공개 이름은 맨 `Node`로 시작하지 않는다(SURFACE-056).
- 근거: ERROR-164 "'(가칭)'인 코드 이름은 PR-4에서 확정한다."; BLUEPRINT-035 "원시 타입만의 다중 `type` 잎의 종류 이름은 `union`으로 확정하고 가칭을 푼다(가드 `isUnionNode`, 동작 모듈 `unionBehavior/`)."; SURFACE-061 제목 "경고등의 공개 이름 확정 — 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`; 뜻은 VALUE-037 그대로"; CONTROLS-079 "(가칭) `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND`는 낼 자리가 없으므로 PR-4의 코드 확정에서 뺀다."
