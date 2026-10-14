# 문자열 리터럴 규약 전수 판정 (2026-10-14, 1.0.0-beta 48b1a59fb, 제품 코드 674파일)

> 291라운드 소유자 물음("문자열 리터럴은 JSON Schema `type` 정도를 제외하면 쓰고 싶지 않다. 바뀔 때 변경 표면이 너무 크다. 이런 게 더 있나? method·event dispatch는 문제없나?")에 대한 답. 원장 관리자가 `debugger` 서브에이전트(읽기 전용)로 `=== '…'`·`case '…'` 비교 전부를 값과 좌변 형으로 묶어 판정했다. 기준: 값이 리터럴 합집합(또는 열거)으로 형이 잡히면 바꿀 때 컴파일러가 모든 자리를 잡는다(SAFE); 합집합이 있어도 중복 정의되거나 일부 자리가 `string`이면 WEAK; 형이 없으면 UNGUARDED. tsc는 돌리지 않았고 형은 읽어서 확인했다. 시험·스토리·벤치·`__legacy__`는 제외.

## 1. SAFE — 바꾸면 컴파일러가 전부 잡는다

| 영역 | 정의 | 근거 |
| --- | --- | --- |
| 노드 사건·요청 종류 | 숫자 열거 `FieldNodeEventType`·`FieldNodeRequestType` | `core/engine/record/constants/FieldNodeEventType.ts:2`, `FieldNodeRequestType.ts:4`; 참조 129곳 전부 멤버 접근, 리터럴 0 (30라운드 D-1 결정대로) |
| 쓰기 옵션·검증 모드·노드 상태 | 열거 `WriteOption`·`ValidationMode`·`FieldNodeState` | `core/engine/types/value.ts:20`, `types/state.ts:9,19` |
| FormHandle 메서드 | 인터페이스 `components/Form/type.ts:125`, 구현은 `useImperativeHandle`이 형으로 검사 | `components/Form/components/FormContents.tsx:64-93` |
| 쓰기 종류 'load'·'input'·'automatic'·'callerPartial'·'callerReplace' | `FieldNodeWriteKind` | `settle/type.ts:7`, 소비 `writeFieldNode.ts:41` |
| 게이트 종류 'if'·'active'·'discriminator' | 판별 합집합 | `blueprint/type.ts:53-65` |
| 선언 역할·범위·문맥 | 합집합 | `blueprint/type.ts:86-92` |
| 배열 연산·계획·결과 | 판별 합집합 | `record/types/behavior.ts:23-41` |
| 파생 규칙 종류 | `DeriveRuleKind` | `settle/derive/type.ts:9` |
| 플러그인 등록 | 형 있는 구조 분해 | `app/plugin/registerPlugin.ts:195` |

## 2. WEAK — 합집합은 있으나 중복 정의 또는 일부 자리가 넓다

| 영역 | 문제 | 근거 |
| --- | --- | --- |
| 전략 'branch'·'terminal' | 같은 합집합이 세 곳에 따로 정의(비교 63곳은 모두 형 있는 필드) | `blueprint/type.ts:144`, `record/types/behavior.ts:80`, `core/surface/type.ts:49` |
| 중복 인라인 합집합 | layer 4벌, error surface 3벌, diagnostics cause 2벌, mode 2벌, level 2벌, scope 5벌 | 각 파일 목록은 판정 원문 |
| 날짜 입력 포맷 | 합집합은 있으나 보조 함수가 `type: string` | `fieldInputs/utils/isRenderableDateInputValue.ts:12` |
| 오류 레코드의 코드 | `FormErrorCode`로 검사되지만 상수 집합이 셋으로 중복(`errors/formErrorCode.ts`, `helpers/warning/warningCode.ts`, `blueprint/utils/diagnostics/constant.ts`) | 정돈-E |

## 3. UNGUARDED — 형이 없어 바꾸면 조용히 놓친다 (순위)

1. **오류 클래스 생성자의 `code: string`** 넷(`errors/SchemaFormError.ts:18`, `JSONSchemaError.ts:25`, `ValidationError.ts:20`, `UnhandledError.ts:18`). 그래서 리터럴 6곳이 통과했고, `'SCHEMA_VALIDATION_FAILED'`(`components/Form/utils/submitForm.ts:23`)는 상수 자체가 없다(이미 드리프트). `DevelopmentIssue.code: string`, `TypeMismatchRecord.code: string`도 같다. `PRESENTATION_KEY_SUSPECT`는 생산자가 없다.
2. **controls 키 어휘**(active·visible·readOnly·disabled·derived·unsetValue·resetInteraction·unsetOnInactive·injectTo·fields·watch·discriminator). 정본은 `core/engine/types/controls.ts:27-71`인데 독립 목록이 다섯(`EXPRESSION_KEYS` 2벌, `KEY_NAMES`, `RULE_KEYS`, `OPTION_KEYS: string[]`), `BlueprintExpression.key: string`(`blueprint/type.ts:235`), `Reflect.get(controls, '<key>')` 22곳과 `hasOwnProperty` 4곳이 문자열로 읽는다. 정본에 묶인 곳은 `validateControlGroups.ts:99-117` 하나뿐.
3. **FieldNode 공개 형과 런타임 클래스가 컴파일 시점에 연결되지 않음.** `core/surface/type.ts:47-132`의 공개 형과 `core/surface/FieldNode.ts:48`(`implements FieldNodeRecord`만)은 `fieldNodeFactory`의 구현 시그니처가 `unknown`을 반환(`utils/fieldNodeFactory.ts:96-100`)하고 가드가 `instanceof`뿐이라 서로 검사되지 않는다. 지금 48개 멤버 이름은 일치하며, 유일한 보호는 런타임 시험 `surface/__tests__/surface.test.ts:30-41`(DETAIL 표와 대조). 형에서 이름을 바꾸거나 시그니처를 바꿔도 컴파일은 통과하고 실행 때 깨진다.
4. **경로 토큰** '@'·'*'·'#'·'/'·'..'·'.'. 정본 `helpers/jsonPointer/enum.ts:3`을 65곳이 쓰지만 엔진이 리터럴로 우회하는 줄이 약 135줄(`navigation/utils/query/findNodes.ts:16-29`, `settle/utils/write/getDependencyIndex.ts:52-147` 등).
5. **스키마 그룹 키워드** 'controls'·'options'·'presentation' 문자열 비교 6파일(`applySchemaContribution.ts:55-64`, `mergeSingleStaticContribution.ts:72-74`, `createValidatorCopy.ts:56`, `collectInlineTerminalWarnings.ts:47`, `removeFormGroups.ts:14-16`).
6. **FieldInput 힌트 키** `testKeys: string[]` + `as (keyof FieldInputTestObject)[]` 캐스트(`fieldInputDefinitions.ts:23-31,78`), `ListMatchedHintKey`와 중복.
7. **진단 추적 문자열** `TypeMismatchRecord.source: string`, `settlementTrace.entry.api: string` 등(시험만 읽음).

## 4. 답 — method·event dispatch는 안전한가

사건·요청 dispatch는 안전하다(숫자 열거, 리터럴 0). 정착·쓰기 어휘와 FormHandle 메서드도 안전하다. 안전하지 않은 것은 (가) 오류 코드가 `string`으로 들어가는 생성자, (나) 스키마가 쓰는 어휘(controls 키, 그룹 키워드, 경로 토큰)가 문자열로 읽히는 엔진 자리, (다) FieldNode 공개 형과 클래스의 연결 부재다. 즉 "이름으로 찾는" 누수는 메서드·사건이 아니라 스키마 어휘와 오류 코드에 있다.

## 5. 정돈-E 범위 (소유자 결정 D4를 넓힘)

| 번호 | 조치 | 공개 표면 |
| --- | --- | --- |
| E1 | 오류 코드 상수 집합 셋을 `errors`의 object enum 하나로 합치고(값은 지금 발화되는 그대로 `'SCHEMA_FORM_ERROR.RENDER_FAILED'` 꼴), 생성자 넷의 `code`를 클래스별 코드 형으로 좁혀 리터럴 6곳을 상수로, 빠진 `SCHEMA_VALIDATION_FAILED` 추가·원장 항목, 생산자 없는 `PRESENTATION_KEY_SUSPECT` 처분. 루트에서 `FormErrorCode`·`FormWarningCode` 공개 | 추가(공개) |
| E2 | controls 키 목록 다섯을 `satisfies readonly (keyof ChildSchemaControls)[]`로 정본에 묶고(`validateControlGroups.ts:99-117` 모양), `BlueprintExpression.key`를 키 형으로, `Reflect.get(controls, '…')`는 키 형 상수 경유 | 없음 |
| E3 | `fieldNodeFactory`에서 런타임 클래스를 공개 `FieldNode` 형에 대입해 컴파일 시점 연결(구현 시그니처 `unknown` 제거) | 없음 |
| E4 | 경로 토큰 리터럴 약 135줄을 `helpers/jsonPointer/enum.ts`의 `$.X`로, 그룹 키워드 셋은 상수 하나로 | 없음 |
| E5 | 중복 인라인 합집합(전략 3벌, layer 4벌, surface 3벌, cause 2벌, mode 2벌, level 2벌, scope 5벌)을 정본 하나씩으로; 날짜 포맷 보조 함수와 `testKeys`를 합집합 형으로 | 없음 |

E1은 공개 표면 추가라 소유자 결정 D4의 연장선이고, E2–E5는 동작 불변이다. 모두 성능 최적화 전에 끝내야 한다(최적화가 엔진 자리를 바꾸므로).
