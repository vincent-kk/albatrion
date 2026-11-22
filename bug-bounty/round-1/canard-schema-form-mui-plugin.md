# @canard/schema-form-mui-plugin 버그 바운티 결과

확인된 문제는 6건이며, 그중 2건은 문서 불일치입니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다. 테스트 환경의 시간대는 UTC+9입니다.

재현 테스트 (모두 [`probes/canard-schema-form-mui-plugin/`](probes/canard-schema-form-mui-plugin/) 아래): `readOnly.test.tsx`, `uriScheme.test.tsx`, `monthRange.test.tsx`, `timeFormat.test.tsx`

원인 파일 위치: `packages/canard/schema-form-mui-plugin/src/fieldInputs/`

## 1. 읽기 전용인 선택 위젯이 사용자의 새 선택을 화면에 보여 주지만, 폼은 이전 값을 유지합니다

- 심각도: 중간에서 높음. 화면과 제출되는 값이 어긋납니다.
- 영향받는 입력: `FieldInputRadioGroup`, `FieldInputStringCheckbox`, `FieldInputBoolean`. `FieldInputSlider`도 같은 패턴이지만 재현 테스트는 없습니다.
- 어긋난 계약: 이 패키지의 `src/INTENT.md` Always do 규칙은 폼의 값, 잠금, 읽기 전용 상태를 선택된 입력에 전달하라고 합니다. 플러그인 작성 스킬(`.claude/skills/react-plugin-implementation`)은 이런 위젯에 `disabled={disabled || readOnly}`를 씁니다. 이 패키지의 StringEnum은 `readOnly`를 지킵니다.
- 원인: 이 위젯들은 비제어 방식이고 `disabled`만 받습니다(`FieldInputBoolean.tsx:57`과 62행, `FieldInputRadioGroup.tsx:91`과 110행, `FieldInputStringCheckbox.tsx:96`과 111행). #623 이후 코어는 폼이 읽기 전용일 때 `onChange`를 거부하지만, 위젯 자신의 상태는 이미 바뀐 뒤입니다.
- 재현: `readOnly.test.tsx`. 클릭 뒤 새 선택이 체크되어 보이는데, `getValue()`는 여전히 `'a'`, `['a']`, `false`입니다.
- 확신도: 높음.

## 2. 프로토콜 목록에 없는 스킴의 URI를 편집하면 스킴이 목록의 첫 항목으로 조용히 바뀝니다

- 심각도: 중간. 키 한 번 입력으로 저장 값이 망가집니다. Ant Design 플러그인에도 같은 문제가 있습니다.
- 영향받는 입력: `FieldInputUri`.
- 원인: 인식하지 못한 프로토콜을 프로토콜 목록의 첫 항목으로 대체하면서 경로는 유지하므로, 다음 키 입력이 `http://<경로>`를 기록합니다.
- 재현: `uriScheme.test.tsx`. 기본값 `wss://example.com/socket`에 "2"를 입력하면 실제 `http://example.com/socket2`, 기대 `wss://example.com/socket2`.
- 확신도: 높음.

## 3. 날짜와 월 피커가 범위 제한을 무시합니다

- 심각도: 중간. README가 두 피커 모두에 `minimum`/`maximum`을 안내하지만, 그 기능에 도달할 방법이 없습니다.
- 영향받는 입력: `FieldInputDate`, `FieldInputMonth`.
- 원인:
  - `FieldInputDate.tsx:74`부터 77행은 `jsonSchema.minimum`과 `jsonSchema.maximum`을 읽습니다. 그런데 코어가 문자열 스키마에서 이 키를 입력에 넘기기 전에 제거합니다(재현 테스트로 받은 스키마에 `type`과 `format`만 있음을 확인). `presentation.FieldInputProps.minimum`은 읽지 않습니다.
  - `FieldInputMonth.tsx`에는 `minDate`/`maxDate` 코드가 아예 없습니다.
  - Ant Design 플러그인은 FieldInputProps에서 제한값을 읽습니다.
- 재현: `monthRange.test.tsx`. 스키마 수준 제한, FieldInputProps 제한, 월 피커 모두에서 피커가 받은 `minDate`가 `undefined`입니다.
- 확신도: 높음.

## 4. 슬라이더가 폼 값이 `undefined`일 때 `minimum`을 보여 줍니다

- 심각도: 낮음에서 중간. 화면과 저장 값이 어긋납니다.
- 원인: `FieldInputSlider.tsx:92`가 `defaultValue ?? min`을 씁니다.
- 재현: `readOnly.test.tsx`의 테스트 "slider with no value does not display a value the form does not hold". `aria-valuenow`는 "10"인데 `getValue()`는 `undefined`입니다.
- 확신도: 높음.

## 5. 문서 불일치: README는 Boolean 체크박스가 `undefined`에서 미정 상태를 보여 준다고 하지만, 코드는 `null`과 불리언이 아닌 값에서만 그렇게 합니다

- 심각도: 낮음. 네 UI 플러그인 모두 같습니다.
- 원인: `FieldInputBoolean.tsx:41`이 `value !== undefined && typeof value !== 'boolean'`을 검사합니다.
- 재현: `readOnly.test.tsx`의 테스트 "boolean checkbox is indeterminate for an undefined value as the README states".
- 확신도: 높음.

## 6. 문서 불일치: 시간 저장 형식과 enum 배열 지원

- 심각도: 낮음.
- 시간 형식:
  - README는 "시간은 HH:mm:00Z 형식으로 저장된다"고 하지만, `FieldInputTime.tsx:91`은 오프셋 없는 `HH:mm:ss`를 기록하며 Ant Design 플러그인과도 다릅니다.
  - 기존 테스트 `FieldInputDateTime.null.test.tsx`가 의도적으로 "08:09:10"을 기대하므로, README와 그 테스트 사이의 충돌입니다.
  - 재현: `timeFormat.test.tsx`. 실제 "08:09:10", README대로라면 "08:09:00+09:00".
- enum 배열:
  - README는 StringEnum이 "문자열 또는 문자열 배열 선택"을 다룬다고 하지만, `FieldInputStringEnum.tsx:128`은 `type === 'string'`만 맞춥니다.
  - 재현: `readOnly.test.tsx`의 테스트 "StringEnum renders a Select for a string array enum as the README states". combobox가 렌더되지 않습니다.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- 슬라이더가 기본으로 움직일 때마다 값을 갱신하는 것(Ant Design은 놓을 때까지 기다림)은 기존 MUI 테스트가 고정한 의도된 차이입니다.
- 스위치의 `controlled: true` 선언은 changeset과 일치합니다.
- 라디오, 체크박스, Select에서 `null`과 `"null"`, 숫자의 enum 동일성은 올바릅니다.
