# @canard/schema-form-antd5-plugin 버그 바운티 결과

확인된 문제는 6건이며, 그중 1건은 문서 불일치입니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다. 테스트 환경의 시간대는 UTC+9입니다. 같은 코드를 가진 `@canard/schema-form-antd6-plugin`에도 같은 문제가 있습니다([`canard-schema-form-antd6-plugin.md`](canard-schema-form-antd6-plugin.md)).

재현 테스트 (모두 [`probes/canard-schema-form-antd5-plugin/`](probes/canard-schema-form-antd5-plugin/) 아래): `timeRangeLimits.test.tsx`, `readOnly.test.tsx`, `readOnlySelect.test.tsx`, `readOnlySlider.test.tsx`, `readOnlyPickers.test.tsx`, `uriScheme.test.tsx`, `focusSlider.test.tsx`

원인 파일 위치: `packages/canard/schema-form-antd5-plugin/src/fieldInputs/`

## 1. 시간 범위 입력의 `minimum`/`maximum`이 달력의 모든 날짜를 비활성화해, 범위를 고를 수 없습니다

- 심각도: 높음. 문서화된 기능을 쓰면 입력 자체를 쓸 수 없게 됩니다.
- 영향받는 입력: `FieldInputTimeRange`.
- 어긋난 계약: README는 "`presentation.FieldInputProps.minimum`과 `maximum`(HH:mm:00Z)이 선택 가능한 시간을 제한한다"고 적고 있습니다.
- 원인: `FieldInputTimeRange.tsx:69`부터 77행의 `disabledDate`가 분 단위의 전체 날짜·시각을 오늘의 09:00, 18:00과 비교합니다. 피커는 이 함수를 자정에 시작하는 날짜 칸에 대해서도 호출하므로, 오늘 이전의 모든 날, 오늘, 이후의 모든 날이 범위를 벗어나 비활성화됩니다. 기존 테스트는 같은 날의 시각으로만 `disabledDate`를 호출해서 통과합니다.
- 재현: `timeRangeLimits.test.tsx`의 테스트 "time-range minimum/maximum limit times, not calendar days". 실제로 11월의 30개 칸이 오늘을 포함해 모두 비활성화되고, 기대 동작은 비활성화된 날짜 칸이 없는 것입니다.
- 확신도: 높음.

## 2. 읽기 전용인 선택 위젯이 사용자의 새 선택을 화면에 보여 주지만, 폼은 이전 값을 유지합니다

- 심각도: 중간에서 높음. 화면과 제출되는 값이 어긋납니다.
- 영향받는 입력: `FieldInputRadioGroup`, `FieldInputStringCheckbox`, `FieldInputStringEnum`(Select), `FieldInputSlider`.
- 어긋난 계약: 플러그인 작성 스킬(`.claude/skills/react-plugin-implementation`)은 이런 위젯에 `disabled={disabled || readOnly}`를 씁니다. MUI의 StringEnum은 `readOnly`를 지키지만, Ant Design의 StringEnum은 지키지 않습니다.
- 원인: 이 위젯들은 비제어 방식(`defaultValue`를 읽음)이고 `disabled`만 받습니다(`FieldInputRadioGroup.tsx:75`, `FieldInputStringCheckbox.tsx:80`, `FieldInputStringEnum.tsx:102`, `FieldInputSlider.tsx:52`). #623 이후 코어는 폼이 읽기 전용일 때 `onChange`를 거부하지만, 위젯 자신의 상태는 이미 바뀐 뒤입니다.
- 재현:
  - `readOnly.test.tsx`: 클릭 뒤 두 번째 선택지가 체크되어 보이는데, `getValue()`는 여전히 `'a'` 또는 `['a']`입니다.
  - `readOnlySelect.test.tsx`: Select가 "beta"를 보여 주는데 저장된 값은 "alpha"입니다.
  - `readOnlySlider.test.tsx`: `aria-valuenow`는 11인데 저장된 값은 10입니다.
- 확신도: 높음.

## 3. 시간, 날짜 범위, 월 범위, 시간 범위 피커가 `readOnly`만 넘겨, 읽기 전용 패널에서 여전히 선택할 수 있습니다

- 심각도: 중간. 2번과 같은 화면·값 불일치입니다. `.changeset/ui-date-time-locks.md`가 날짜와 월 피커에 적용한 수정이 이 네 피커에는 적용되지 않았습니다.
- 영향받는 입력: `FieldInputTime`, `FieldInputDateRange`, `FieldInputMonthRange`, `FieldInputTimeRange`.
- 어긋난 계약: 패키지 `CLAUDE.md`는 "텍스트 입력만 막으면 달력 선택은 여전히 편집 가능하다"고 적고 있고, 그 때문에 날짜와 월 피커는 `readOnly`와 `disabled`를 함께 씁니다.
- 원인: `FieldInputTime.tsx:44`, `FieldInputDateRange.tsx:93`, `FieldInputMonthRange.tsx:92`, `FieldInputTimeRange.tsx:93`이 `readOnly={readOnly}`와 `disabled={disabled}`만 넘깁니다.
- 재현: `readOnlyPickers.test.tsx`. 시간 입력은 "03:30"을 보여 주는데 저장된 값은 여전히 "10:30:00Z"이고, 날짜 범위 입력은 "2024-01-03"을 보여 주는데 저장된 값은 여전히 `['2024-01-10', '2024-01-12']`입니다.
- 확신도: 높음.

## 4. 프로토콜 목록에 없는 스킴의 URI를 편집하면 스킴이 목록의 첫 항목으로 조용히 바뀝니다

- 심각도: 중간. 키 한 번 입력으로 저장 값이 망가집니다.
- 영향받는 입력: `FieldInputUri`. MUI 플러그인에도 같은 문제가 있습니다.
- 원인: `FieldInputUri.tsx:116`부터 121행에서 인식하지 못한 프로토콜은 `normalizedProtocols[0]`으로 대체되고 경로는 유지되므로, 다음 키 입력이 `http://<경로>`를 기록합니다.
- 재현: `uriScheme.test.tsx`. 기본값 `wss://example.com/socket`에 "2"를 입력하면 실제 `http://example.com/socket2`, 기대 `wss://example.com/socket2`.
- 확신도: 높음.

## 5. 슬라이더에서 `focus(path)`가 아무 일도 하지 않습니다

- 심각도: 낮음에서 중간.
- 영향받는 입력: `FieldInputSlider`.
- 어긋난 계약: `.changeset/schema-form-focus-target-marker.md`와 코어의 `field-input.md` 사용자 정의 입력 계약은 네이티브가 아닌 포커스 대상에 `data-focus-target`이 필요하다고 정합니다. antd-mobile 스위치는 이를 지키지만, 슬라이더 핸들(`div role="slider"`)에는 표시가 없고 네이티브 컨트롤도 없습니다. 라벨의 `for`도 div를 가리킵니다.
- 원인: `FieldInputSlider.tsx:50`.
- 재현: `focusSlider.test.tsx`. 실제 `document.activeElement`는 `body`이고, 기대값은 슬라이더 핸들입니다.
- 확신도: 높음.

## 6. 문서 불일치: README는 Boolean 체크박스가 `undefined`에서 미정(indeterminate) 상태를 보여 준다고 하지만, 코드는 `null`과 불리언이 아닌 값에서만 그렇게 합니다

- 심각도: 낮음.
- 원인: `FieldInputBoolean.tsx:23`이 `value !== undefined && typeof value !== 'boolean'`을 검사합니다. 한국어 README도 같은 설명입니다. 네 UI 플러그인 모두 같습니다.
- 재현: `readOnly.test.tsx`의 테스트 "boolean checkbox is indeterminate for an undefined value as the README states".
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- `maximum`보다 큰 값을 입력한 InputNumber는 blur 뒤 화면과 저장 값이 일치합니다.
- 라디오, 체크박스, Select에서 `null`과 `"null"`, 숫자의 enum 동일성은 기존 테스트가 다루고 있고 코드도 올바릅니다.
- 체크박스와 스위치의 `controlled: true` 선언은 changeset과 일치하며, 해당 컴포넌트는 값을 따로 들고 있지 않습니다.
- 렌더러 파트(필수 표시의 `aria-hidden`, 라벨과 오류 루트)는 changeset과 일치합니다.
- 배열 추가·삭제는 실제 버튼을 쓰므로 `disabled`가 클릭을 막고, 읽기 전용일 때는 숨겨집니다.
- `HH:mm:00Z` 시간 파싱은 `Z` 오프셋을 올바르게 읽습니다. 초는 표시에서만 빠지고 값에는 기록되지 않습니다.
- 그룹이 ErrorMessage에 `style={EMPTY_OBJECT}`를 넘기는 것은 스타일 선택이지 버그가 아닙니다.
