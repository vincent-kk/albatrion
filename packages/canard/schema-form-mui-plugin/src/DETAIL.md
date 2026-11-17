# MUI 연결 계약

## Requirements

MUI 입력은 schema-form이 해석한 값과 상태를 표시합니다. 플러그인 context의 표시 옵션은 부품 간 일관성을 위한 설정이며 폼 실행 상태가 아닙니다.

## API Contracts

날짜·시간 입력도 disabled와 readOnly의 후속 변경을 MUI에 전달하며, 읽기 전용 상호작용은 MUI가 소유합니다. 라디오 그룹·체크박스 그룹·불리언 체크박스·슬라이더는 자기 선택 상태를 가지지만 MUI에 읽기 전용 모드가 없으므로 `disabled || readOnly`를 받습니다. 그렇지 않으면 코어가 이미 거부한 선택을 화면이 보여 주어 표시와 저장 값이 어긋납니다.

날짜·월 피커의 범위 제한은 `presentation.FieldInputProps.minimum`과 `maximum`에서 읽습니다. 코어는 문자열 스키마의 `minimum`/`maximum`을 입력에 넘기지 않으므로 스키마에서 읽으면 제한이 사라집니다. 제한값은 `YYYY-MM-DD`와 `YYYY-MM`으로 엄격하게 파싱하고 유효할 때만 피커에 넘깁니다. dayjs의 관대한 파싱은 `2024-02-31`을 `2024-03-02`로 넘겨 다른 날짜를 제한으로 만들기 때문입니다. 파싱은 제한값이 바뀔 때 한 번만 하며, 그리는 날짜마다 하지 않습니다.

슬라이더는 폼 값이 없을 때 최솟값을 값처럼 보여 주지 않습니다. 첫 사용자 변경 전까지 thumb와 값 라벨을 숨기고 `aria-valuenow`를 생략하되, 키보드로 포커스된 thumb는 보이고 포인터·키보드 조작은 그대로 받습니다. 폼에 값을 써 넣지 않으며, 외부에서 값이 `undefined`로 바뀌면 재마운트로 다시 미설정 상태가 됩니다.

enum 선택 identity는 원래 JSON 스칼라를 인코딩하므로 null과 문자열 null을 합치지 않습니다.

로컬 검증 표는 각 parameter 호출에 정적 배열로 두어 실행 없이 사례 수를 셀 수 있게 합니다. 표를 옮겨도 사례 이름·순서·단언을 보존하며, 공유 시나리오를 복제하지 않습니다.

입력 부품의 조상 MuiContext 참조와 부모의 부품 재수출은 저장소 원칙 4가 허용하는 조합입니다. 이 두 소유 경계의 집계 순환만 사례별로 예외 처리하며, 타입을 읽기 위해 부품을 다시 재수출하는 부모 배럴을 가져오지 않습니다.

## Acceptance Criteria

### mui-binding — 폼 상태 전달

- 입력의 초기 값·변경 값과 잠금·읽기 전용 상태를 보존합니다.

### scalar-identity — 선택지 identity 보존

- 같은 표시 문자열을 가진 서로 다른 JSON 스칼라는 선택·변경에서 구별됩니다.

## Boundary Exemptions

### `type.ts` — 상위 표시 context의 구체 타입 참조

- **Consumers**: `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputBoolean.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputBooleanSwitch.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputDate.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputMonth.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputNumber.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputRadioGroup.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputSlider.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputString.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputStringCheckbox.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputStringEnum.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputStringSwitch.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputTextarea.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputTime.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputUri.tsx`
- **Direct import**: `allowed`
- **Reason**: 입력 부품은 조상이 소유한 MuiContext를 타입 전용으로 읽습니다. 저장소 Module Contract Principle 4의 위로 열린 참조이며, 자기 부품을 재수출하는 부모 진입점을 읽으면 실제 배럴 순환을 만듭니다. Fractal 단위 그래프의 왕복은 구현 파일 간 순환을 뜻하지 않습니다.

## Last Updated

입력 바인딩·선택 identity 또는 context의 소유 경계가 바뀔 때 갱신합니다.
