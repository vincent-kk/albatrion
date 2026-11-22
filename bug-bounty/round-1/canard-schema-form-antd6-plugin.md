# @canard/schema-form-antd6-plugin 버그 바운티 결과

확인된 문제는 6건이며, 그중 1건은 문서 불일치이고 1건은 antd5에서만 재현 테스트로 확인했습니다. 이 패키지는 `@canard/schema-form-antd5-plugin`과 같은 코드를 갖고 있어 같은 문제가 있습니다. 각 항목의 자세한 계약과 원인 설명은 [`canard-schema-form-antd5-plugin.md`](canard-schema-form-antd5-plugin.md)에 있고, 이 문서는 antd6에서의 재현 결과와 원인 위치만 적습니다. 메인 세션에서 antd6 재현 테스트를 다시 실행해 같은 실패를 확인했습니다.

재현 테스트 (모두 [`probes/canard-schema-form-antd6-plugin/`](probes/canard-schema-form-antd6-plugin/) 아래): `timeRangeLimits.test.tsx`, `readOnly.test.tsx`, `readOnlySelect.test.tsx`, `readOnlySlider.test.tsx`, `readOnlyPickers.test.tsx`, `uriScheme.test.tsx`

원인 파일 위치: `packages/canard/schema-form-antd6-plugin/src/fieldInputs/`

## 1. 시간 범위 입력의 `minimum`/`maximum`이 달력의 모든 날짜를 비활성화해, 범위를 고를 수 없습니다

- 심각도: 높음.
- 원인: `FieldInputTimeRange.tsx:69`부터 시작하는 `disabledDate`.
- 재현: `timeRangeLimits.test.tsx`. 오늘을 포함한 11월의 모든 날짜 칸이 비활성화됩니다.
- 확신도: 높음.

## 2. 읽기 전용인 선택 위젯이 사용자의 새 선택을 화면에 보여 주지만, 폼은 이전 값을 유지합니다

- 심각도: 중간에서 높음.
- 영향받는 입력과 위치: `FieldInputRadioGroup.tsx:74`, `FieldInputStringCheckbox.tsx:79`, `FieldInputStringEnum.tsx:102`, `FieldInputSlider.tsx:52`. 모두 비제어 위젯에 `disabled={disabled}`만 넘깁니다.
- 재현: `readOnly.test.tsx`(라디오, 체크박스 그룹), `readOnlySelect.test.tsx`(Select가 "beta"를 보여 주는데 값은 "alpha"), `readOnlySlider.test.tsx`(`aria-valuenow` 11, 값 10).
- 확신도: 높음.

## 3. 시간, 날짜 범위, 월 범위, 시간 범위 피커가 `readOnly`만 넘겨, 읽기 전용 패널에서 여전히 선택할 수 있습니다

- 심각도: 중간.
- 위치: `FieldInputTime.tsx:43`과 44행, `FieldInputDateRange.tsx:92`와 93행, `FieldInputMonthRange.tsx:91`과 92행, `FieldInputTimeRange.tsx:92`와 93행.
- 재현: `readOnlyPickers.test.tsx`. 시간 입력은 "03:30"을 보여 주는데 값은 "10:30:00Z", 날짜 범위 입력은 "2024-01-03"을 보여 주는데 값은 `['2024-01-10', '2024-01-12']`입니다.
- 확신도: 높음.

## 4. 프로토콜 목록에 없는 스킴의 URI를 편집하면 스킴이 목록의 첫 항목으로 조용히 바뀝니다

- 심각도: 중간.
- 위치: `FieldInputUri.tsx:120`의 `normalizedProtocols[0]` 대체.
- 재현: `uriScheme.test.tsx`. 실제 `http://example.com/socket2`, 기대 `wss://example.com/socket2`.
- 확신도: 높음.

## 5. 슬라이더에서 `focus(path)`가 아무 일도 하지 않을 가능성이 높습니다

- 심각도: 낮음에서 중간.
- 상태: antd5에서만 재현 테스트로 확인했습니다. antd6의 `FieldInputSlider.tsx`도 같은 구조라 같은 문제가 있을 가능성이 높지만, antd6 재현 테스트는 없습니다.
- 확신도: 중간.

## 6. 문서 불일치: README는 Boolean 체크박스가 `undefined`에서 미정 상태를 보여 준다고 하지만, 코드는 `null`과 불리언이 아닌 값에서만 그렇게 합니다

- 심각도: 낮음.
- 위치: `FieldInputBoolean.tsx:23`.
- 재현: `readOnly.test.tsx`의 테스트 "boolean checkbox is indeterminate for an undefined value as the README states".
- 확신도: 높음.
