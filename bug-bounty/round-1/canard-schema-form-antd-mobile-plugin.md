# @canard/schema-form-antd-mobile-plugin 버그 바운티 결과

확인된 문제는 3건이며, 그중 1건은 문서 불일치입니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트 (모두 [`probes/canard-schema-form-antd-mobile-plugin/`](probes/canard-schema-form-antd-mobile-plugin/) 아래): `rangeSlider.test.tsx`, `readOnly.test.tsx`

원인 파일 위치: `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/`

## 1. `format: "slider"`인 숫자 배열이 단일 핸들 슬라이더를 받아, 배열 기본값을 버리고 배열 자리에 숫자 하나를 기록합니다

- 심각도: 중간. 타입이 틀린 값이 폼에 기록됩니다.
- 영향받는 입력: `FieldInputSlider`.
- 어긋난 계약: `.changeset/mobile-range-slider-selection.md`는 "숫자 배열 스키마에는 범위 슬라이더를 고른다"고 적고 있고, README도 "`type`이 `"array"`이고 `format`이 `"slider"`이면 범위 슬라이더"라고 적고 있습니다.
- 원인: `FieldInputSlider.tsx:29`부터 34행에서 `range`는 `presentation.FieldInputProps.range`에서만 오는데, 입력 정의의 `test`는 배열 스키마에 맞으면서도 이 값을 설정하지 않습니다. 초기값이 스칼라 방식으로 계산되므로 `[10, 20]`은 `undefined`가 되고, `onAfterChange(30)`은 `30`을 저장합니다.
- 부수적인 문서 불일치: README의 우선순위 목록은 Array를 Slider보다 앞에 두지만, `index.ts`는 Slider를 먼저 둡니다.
- 재현: `rangeSlider.test.tsx`. 실제 `range`는 `undefined`이고 `getValue()`는 `30`입니다. 기대 동작은 `range`가 `true`이고 값이 배열인 것입니다.
- 확신도: 동작이 일어난다는 점은 높음. `range`를 일부러 선택 사항으로 둔 것인지는 중간입니다.

## 2. 읽기 전용인 선택 위젯이 사용자의 새 선택을 화면에 보여 주지만, 폼은 이전 값을 유지합니다

- 심각도: 중간에서 높음. 화면과 제출되는 값이 어긋납니다. 다른 세 UI 플러그인에도 같은 문제가 있습니다.
- 영향받는 입력: `FieldInputRadioGroup`, `FieldInputStringCheckbox`.
- 어긋난 계약: 플러그인 작성 스킬(`.claude/skills/react-plugin-implementation`)은 이런 위젯에 `disabled={disabled || readOnly}`를 씁니다.
- 원인: 이 위젯들은 비제어 방식이고 `disabled`만 받습니다(`FieldInputRadioGroup.tsx:70`, `FieldInputStringCheckbox.tsx:76`). #623 이후 코어는 폼이 읽기 전용일 때 `onChange`를 거부하지만, 위젯 자신의 상태는 이미 바뀐 뒤입니다.
- 재현: `readOnly.test.tsx`. 클릭 뒤 두 번째 선택지가 체크되어 보이는데, `getValue()`는 여전히 `'a'` 또는 `['a']`입니다.
- 확신도: 높음.

## 3. 문서 불일치: README는 Boolean 체크박스가 `undefined`에서 미정 상태를 보여 준다고 하지만, 코드는 `null`과 불리언이 아닌 값에서만 그렇게 합니다

- 심각도: 낮음.
- 원인: `FieldInputBoolean.tsx:21`이 `value !== undefined && typeof value !== 'boolean'`을 검사합니다.
- 재현: `readOnly.test.tsx`의 테스트 "boolean checkbox is indeterminate for an undefined value as the README states".
- 확신도: 높음.

## 확인하지 못한 가능성

- 슬라이더의 `focus(path)` 문제는 Ant Design 플러그인에서 확인되었고, 이 패키지의 슬라이더도 같은 문제가 있을 가능성이 있지만 재현 테스트는 없습니다.

## 버그가 아니라고 확인한 가설

- 체크박스, 스위치, 스테퍼의 `controlled: true` 선언은 changeset과 일치합니다.
- 스위치의 `data-focus-target`과 키보드 처리는 changeset과 일치합니다(기존 테스트).
- null, undefined, 불리언 메시지에 대한 Space 항목 규칙은 changeset과 일치합니다.
