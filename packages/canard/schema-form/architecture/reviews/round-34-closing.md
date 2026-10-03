# 34라운드 닫기 — 05 실행 계획의 원장 해석 둘: 플러그인이 가져오는 검증기 계약 형의 자리, `JSONSchemaError` 별칭의 유지

2026-10-01. 05 작업자가 32C-01의 후속으로 물었다: 플러그인 패키지가 가져올 수 있는 모듈 경로는 공개 index 하나뿐인데(`package.json`의 `exports`는 `.` 하나), 새 검증기 계약 형을 어디서 가져오는가. 함께 계획 리뷰 소견 F1(`JSONSchemaError` 별칭 유지)의 원장 적합성을 물었다. 둘 다 현행 항목이 직접 답하므로 편집자 결정으로 닫는다. 소유자에게 물을 것은 없다.

### 34C-01 플러그인용 계약 형은 공개 `ValidatorPlugin`(`app/plugin/type.ts`)이며 PR-4가 개정한다 — 32C-01의 "공개 index가 아닌 모듈"은 코어 계약 형 `Validator`의 재내보내기와 Form 속성에 한한다

- 닫는 항목: LANDING-084(보충), VALIDATE-044(보충), LANDING-093(보충)
- 결정:
  - 【추론】 LANDING-084는 PR-4의 새 fractal 칸에 "`app/plugin/type.ts` 개정"을 적었고 VALIDATE-044는 플러그인이 `Validator`에 소비자 훅 `bind?`만 더 가진다고 했으므로, 플러그인이 구현하고 가져오는 계약 형은 오늘도 공개 index가 내보내는 `ValidatorPlugin`이며 그 개정은 PR-4의 몫이다; 32C-01의 "새 계약 형은 공개 index가 아닌 새 엔진 쪽 모듈에서 내보낸다"는 코어가 받는 계약 형 `Validator`(가칭)와 Form 속성 `validatorFactory`의 공개 형에 한한 말이고, 플러그인용 `ValidatorPlugin`에는 미치지 않는다.
  - 【추론】 PR-4의 `ValidatorPlugin` 개정은 더하기만 한다: `compileGuard?(root, pointer)`·`release?(root)`를 선택 멤버로 더하고, `compile` 결과 함수의 에러 정규화에 `rejectedKey`를 더한다; 선택으로 두는 까닭은 옛 엔진이 PR-7까지 공개 진입점을 섬기는 동안(LANDING-159 규칙 3) 소비자의 사용자 정의 플러그인이 형 검사에서 깨지지 않게 하는 것이며, 필수로 좁히는 것은 Form 속성이 `{ compile, compileGuard }` 객체가 되는 PR-7(LANDING-036 이주 33)에서 이주 항목과 함께 한다.
  - 【추론】 코어의 `Validator` 형은 `src/core/validation/`에 두고 공개 index에서 내보내지 않으며, `compileGuard`가 있는 `ValidatorPlugin` 값이 구조적으로 `Validator`를 만족하게 두 형을 맞춘다; ajv 플러그인 셋은 세 멤버를 모두 구현하고(LANDING-093 개발계획 P1), 코어 쪽 적합성은 코어의 시험이 플러그인 셋을 `Validator`로 받아 단언한다. 부속 경로(`exports`에 둘째 진입점)를 더하는 것은 공개 겉면 추가라 이 라운드가 열지 않는다.
- 근거: LANDING-084 "`src/core/dispatch/`, `src/core/validation/`, `app/plugin/type.ts` 개정. 진입 사슬은 `dispatch`가 쓰기 동사마다 진입 함수로 소유하고"; VALIDATE-044 "`Validator`는 `compile(copy)`, `compileGuard(root, pointer)`, 선택 `release(root)`(18C-56), 선택 방언 선언(VALIDATE-026), 그리고 `compile` 결과 함수의 에러 정규화(`dataPath`, 루트 경로 표기, `rejectedKey`)를 담는다.", "플러그인은 여기에 소비자 훅 `bind?`만 더 가진다."; LANDING-093 개발계획 P1 "ajv6·ajv7·ajv8의 `compileGuard`·`rejectedKey`·같은 `$id` 처리는 원장대로 PR-4에서 셋 다 구현한다(LANDING-064·093 그대로)."; LANDING-159 "규칙 3: `src/core/index.ts`와 `src/index.ts`는 PR-7까지 옛 엔진을 가리킨다."; LANDING 영역 형제 패키지 문단 "ajv 플러그인 셋은 `ValidatorPlugin`·`ValidateFunction`·`JSONSchema`·`JSONSchemaError`·`SchemaFormPlugin` 타입을 가져오며".

### 34C-02 `ValidationIssue` 개명은 PR-4에서 새 이름을 더하고 옛 별칭 `JSONSchemaError`를 PR-7까지 공개 index에 남긴다

- 닫는 항목: ERROR-032(보충), LANDING-024(보충)
- 결정:
  - 【추론】 ERROR-032가 PR-4에 둔 "`ValidationIssue` 개명"은 새 이름을 공개 index에 내보내 `onError`의 공개(PR-7)보다 먼저 세우는 것이고, 옛 이름 `JSONSchemaError`를 같은 형의 별칭으로 PR-7까지 남기는 것은 LANDING-159 규칙 3(공개 진입점은 PR-7까지 옛 엔진)과 맞다; 옛 `<Form>` 형과 플러그인 스토리 파일이 아직 옛 이름을 가져오기 때문이다.
  - 【추론】 별칭을 지우는 것은 LANDING-024 이주 21의 적용이며 전환(PR-7) 또는 이주 안내를 넣는 PR-8의 몫이다; ajv 플러그인 셋은 PR-4에서 새 이름으로 바꿔 가져온다(LANDING 영역 형제 패키지 문단).
- 근거: ERROR-032 "PR-4: 기록 형과 코드 형, core가 인자로 받는 보고기(`report`, `hasConsumer`), 사슬 끝의 기록마다 전달, core 경로의 핸들러 예외 규칙, 전달 중 쓰기 거부, 경고의 구조 키, 정착 경고 판정의 소비자 조건, `ValidationIssue` 개명", "착수 조건: 검증 결과 형의 `ValidationIssue` 개명(08 §14)이 `onError`의 공개보다 먼저(또는 같은 PR에) 선다."; LANDING-024 "| 21 | 인터페이스 `JSONSchemaError`(노드 오류 항목) | `ValidationIssue` |"; LANDING-159 "규칙 3: `src/core/index.ts`와 `src/index.ts`는 PR-7까지 옛 엔진을 가리킨다."
