# MUI 연결 계약

## Requirements

MUI 입력은 schema-form이 해석한 값과 상태를 표시합니다. 플러그인 context의 표시 옵션은 부품 간 일관성을 위한 설정이며 폼 실행 상태가 아닙니다.

## API Contracts

날짜·시간 입력도 disabled와 readOnly의 후속 변경을 MUI에 전달하며, 읽기 전용 상호작용은 MUI가 소유합니다. enum 선택 identity는 원래 JSON 스칼라를 인코딩하므로 null과 문자열 null을 합치지 않습니다.

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
