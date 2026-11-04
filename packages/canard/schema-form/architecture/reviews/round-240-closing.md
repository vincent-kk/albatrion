# 240라운드 닫기 — 이름 재구성(②) 범위 조사와 결정 다섯: 표 밖 이름의 규칙, 내장 정의 배열 `builtinFieldInputDefinitions`, 문서 사이트는 #361, 측정 산출물 제외·고정 자료 치환, 커밋 셋에 게이트는 ②-2 뒤; CLAUDE.md 여섯 파일의 이름 치환은 소유자 승인 대기

2026-10-13. fixy07의 범위 조사(scratchpad/07b-2/rename-inventory.md): 코어 schema-form, UI 플러그인 넷 + ajv 셋의 스토리, aileron 소비자 셋(production-test, benchmark-form, schema-form-scenarios), 문서; 경로 이름이 바뀌는 파일 119개, 디렉터리 9개, 서로 다른 옛 식별자 161개; 예상 커밋 셋(②-1 코어, ②-2 플러그인 일곱과 aileron 소비자, ②-3 문서).

### 240C-01 (1) 표 밖 이름의 규칙 — 힌트 낱말 `formType` → `inputType`; `FormTypeInput*`·`formTypeInput*` → `FieldInput*`·`fieldInput*`; `FormTypeTest*`·`formTypeTestFnFactory` → `FieldInputTest*`·`fieldInputTestFnFactory`; 렌더러 계열 `FormTypeRenderer*`(FormTypeRendererContext·Provider, types/formTypeRenderer.ts, CustomFormTypeRenderer 내부 이름) → `FieldRenderer*`; 코어 내장 정의 배열 `formTypeDefinitions`(디렉터리 src/formTypeDefinitions)는 Form prop·플러그인 키와 겹치지 않도록 디렉터리 `src/fieldInputs/`(플러그인 디렉터리와 같은 이름), 배열 `builtinFieldInputDefinitions`; (2) 패키지 CLAUDE.md 여섯(schema-form 7줄 — 승인된 절·두 줄 밖의 L76 제목 "FormTypeInput 우선순위"와 L79-81 `formTypeInputMap`·`formTypeInputDefinitions` 포함; antd-mobile 6줄, antd5 2줄, antd6 2줄, mui 3줄)은 이름 치환에 한해 소유자 승인을 묻고, 승인 전까지 옛 이름 grep 0 게이트에서 CLAUDE.md를 제외; (3) documents/ 사이트(394줄)는 fairy07의 #361 범위이며 07b-2 grep 게이트에서 documents/를 제외; (4) benchmark-form/results의 heapsnapshot·결과 파일은 측정 기록이라 그대로 두고 게이트에서 제외, schema-form의 blueprint JSON 고정 자료 둘은 치환; (5) 커밋은 셋으로 나누되 ②-1만 적용한 상태에서는 플러그인이 typecheck·build에 실패하므로(별칭 없음) 게이트는 ②-2 뒤에 플러그인 일곱을 포함해 확인하고, ②-1 커밋 메시지에 "②-2와 함께 빌드됨"을 적는다(squash 병합이라 중간 상태는 남지 않음); (6) 소유자가 물은 `FieldRendererProps`의 `Label`·`Error` 컴포넌트 추가는 소유자 답 뒤 ②-1에 포함 여부 결정

- 닫는 항목: LANDING-181(보충)
- 결정:
  - 【추론】 표 밖 이름은 표의 규칙을 기계적으로 넓힌 것이고, 유일하게 규칙으로 정할 수 없는 내장 배열은 "내장"을 접두어로 붙여 공개 이름과 겹치지 않게 한다. CLAUDE.md는 규칙상 소유자 승인이 먼저다.
- 근거: fixy07의 범위 조사; 239라운드 대응표; CLAUDE.md 편집 규칙; 231C-01 (2).
- 다음: 소유자에게 CLAUDE.md 여섯 파일 치환 승인과 Label·Error 추가 여부를 묻는다.
