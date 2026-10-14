# 정돈-E 브리프 — 오류 코드 단일화와 문자열 리터럴 규약 상수화 (fixy08 → codex) — 정돈-3 병합 뒤 착수

> 2026-10-14, 원장 관리자. 근거: `string-literal-audit.md` §3·§5(E1–E5), 289라운드 D4(오류 코드는 object enum으로 root export — 발화 가능한 오류의 일람이자 안전한 상수 사용 계약), 291라운드(문자열 리터럴 규약은 JSON Schema `type` 값 외에 금지), 30라운드 D-1(종류 값은 TS 열거, 리터럴 합집합 불허). 217C-01 방식. **E1만 공개 표면이 늘고(루트에 `FormErrorCode`·`FormWarningCode`), E2–E5는 동작 불변.** 공개 표면 열거 게이트는 "추가분이 정확히 그 둘(과 형)"로 바꿔 적용한다.

## 1. 자리

- 워크트리 `/tmp/claude-501/stage-tidy-E`, 브랜치 `feat/schema-form-tidy-E`, base `1.0.0-beta`(정돈-3 병합 뒤). E1과 E2–E5는 커밋을 나눈다(E1은 공개 표면 변경이라 따로 읽혀야 한다).

## 2. 할 일

### E1 오류 코드 집합 셋을 하나로, 생성자를 좁히고, 루트에서 공개

- 정본은 `src/errors/codes/`(정돈-3 자리) 하나. 지금의 세 집합 — `errors/formErrorCode.ts`(61개 + `FORM_ERROR_CODE_TABLE`), `helpers/warning/warningCode.ts`(제3 집합, `NESTED_COMPOSITION_IGNORED_FOR_FORM`·`NULLABLE_ONE_OF_NULL_UNREACHABLE` 포함), `core/engine/blueprint/utils/diagnostics/constant.ts`(`BlueprintErrorCode`·`BlueprintWarningCode`, 값 28개 중복) — 를 object enum 둘로 합친다:
  - `FormErrorCode`: 키는 PascalCase, 값은 **지금 발화되는 그대로** 그룹 한정 문자열(`'SCHEMA_FORM_ERROR.RENDER_FAILED'`, `'JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA'`, `'UNHANDLED_ERROR.REGISTER_PLUGIN'`, `'VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED'`). 같은 이름의 union 형.
  - `FormWarningCode`: `'SCHEMA_FORM_WARNING.…'` 전부.
  - 빠진 상수 `SCHEMA_VALIDATION_FAILED`를 더한다. 생산자 없는 `PRESENTATION_KEY_SUSPECT`는 지우고 원장에 적는다(생산자가 없다는 사실, 다시 쓰려면 새 라운드). `NULLABLE_ONE_OF_NULL_UNREACHABLE`은 새 엔진이 내지 않지만(대기열 51) 소유자 결정 전까지 **값은 남기고** "현재 생산자 없음"을 주석 한 줄로.
- 생성자 넷(`SchemaFormError.ts:18`, `JSONSchemaError.ts:25`, `ValidationError.ts:20`, `UnhandledError.ts:18`)의 `code: string`을 클래스별 코드 형(그 그룹 접두어의 부분집합)으로 좁힌다. 클래스가 접두어를 붙이는 지금 방식은 값이 이미 접두어를 포함하므로 **접두어를 두 번 붙이지 않게** 고친다(발화되는 `error.code` 문자열은 전과 같아야 한다 — 시험으로 고정).
- 리터럴 발화 6곳을 상수로: `registerPlugin.ts:216`, `pathExactMatchFnFactory.ts:20`, `submitForm.ts:15,23`, `createDynamicFunction.ts:42`, `fieldInputDefinitions.ts:58`(`console.warn` → `warnDevelopmentIssue` 또는 상수). (d)의 `ERROR_CODES` 지역 맵과 `evaluateGate.ts:185`는 상수 경유이므로 형만 맞춘다.
- `DevelopmentIssue.code: string`, `TypeMismatchRecord.code: string`을 코드 형으로.
- 루트 `src/index.ts`에 `FormErrorCode`·`FormWarningCode`(값과 형)를 추가하고 README·SPECIFICATION에 "오류 처리는 가드와 `FormErrorCode` 상수로 비교한다" 절을 더한다(fairy08 문안). aileron scenarios의 `onErrorCodes` 리터럴은 상수로 바꾼다.
- failing-first: 루트 표면 시험에 두 이름을 먼저 단언; `error.code` 문자열이 전과 동일함을 발화 사이트별 시험(기존 시험의 기대값이 그대로 초록이어야 함)으로.

### E2 controls 키 어휘를 정본에 묶기

- 정본 `core/engine/types/controls.ts`의 `ChildSchemaControls`/`SchemaControls` 키 형을 하나 내고(`ControlKey = keyof ChildSchemaControls`), 독립 목록 다섯(`EXPRESSION_KEYS` 2벌 → 1벌, `KEY_NAMES`, `RULE_KEYS`, `OPTION_KEYS`)을 `satisfies readonly ControlKey[]`로 묶는다(`validateControlGroups.ts:99-117` 모양). `BlueprintExpression.key: string`(`blueprint/type.ts:235`)을 `ControlKey`로. `Reflect.get(controls, '<key>')` 22곳과 `hasOwnProperty` 4곳은 키 상수(`CONTROL_KEY.active` 같은 as const 객체) 경유로.

### E3 FieldNode 공개 형과 런타임 클래스의 컴파일 시점 연결

- `core/surface/utils/fieldNodeFactory.ts:96-100`의 구현 시그니처 `unknown` 반환을 없애고, `createFieldNode(...)`의 결과를 공개 `FieldNode` 형에 대입하는 한 줄(`const node: FieldNode = …` 또는 `satisfies`)을 두어 멤버 이름·시그니처 불일치가 컴파일 오류가 되게 한다. 런타임 시험 `surface.test.ts:30-41`(DETAIL 표 대조)은 남긴다.

### E4 경로 토큰·그룹 키워드 상수화

- `helpers/jsonPointer/enum.ts`의 `$.X`를 우회하는 리터럴 약 135줄(`'@'`·`'*'`·`'#'`·`'#/'`·`'/'`·`'..'`·`'.'` 비교·`startsWith`·`split`)을 `$.X` 경유로. 정규식 안의 토큰은 상수에서 조립하거나 그대로 두되 주석 한 줄로 정본을 가리킨다.
- `'controls'`·`'options'`·`'presentation'` 문자열 비교 6파일은 `SCHEMA_GROUP` as const 객체 하나(자리: `core/engine/types/` 또는 `constants/`)로.

### E5 중복 합집합 통합·좁은 자리 넓히기

- `'branch' | 'terminal'` 3벌 → 정본 하나(`core/engine/types/`에 `NodeStrategy`), layer 4벌, error surface 3벌, diagnostics cause·exceededBudget 2벌, mode 2벌, level 2벌, scope 5벌(정돈-1 뒤 남은 것만) → 각각 정본 하나.
- `isRenderableDateInputValue.ts:12`의 `type: string` → 날짜 포맷 합집합; `fieldInputDefinitions.ts:23-31`의 `testKeys: string[]` + 캐스트 → `ListMatchedHintKey[]`로.
- `TypeMismatchRecord.source`·`settlementTrace.entry.api` 같은 진단 문자열은 합집합 형으로 좁힌다(시험만 읽으므로 동작 영향 없음).

## 3. 게이트

정돈-3과 같다. 추가: 공개 표면 열거의 차이가 정확히 `FormErrorCode`·`FormWarningCode`(값·형)뿐임, G16 소비자 번들 크기(상수 객체 추가분 외 증가 없음, 수치 기록), `error.code` 문자열 전후 동일 시험 초록, 리터럴 판정 재실행(`string-literal-audit.md`의 UNGUARDED 1·2·4·5·6 항목이 0).

## 4. 범위 밖

- 대기열 51의 결정(경고 이식 여부)과 50(브랜치 선언 병합 의미)은 손대지 않는다. 문서 절은 fairy08 문안을 받아 넣는다.
