# UI 입력 연결 계약

## Requirements

- 필드 배치 렌더러는 입력에 읽기 전용·비활성 상태를 전달합니다. 배치와 입력은 각자 받은 클래스와 스타일을 기존 표시 요소에 적용합니다. 배열 입력은 코어의 형식 불일치 상태를 기존 그룹에 전달합니다.

입력은 폼의 값과 상태를 라이브러리의 공개 prop으로 전달합니다. 입력의 유효성은 폼의 스키마 검증이 판단합니다.

## API Contracts

라이브러리가 지원하는 식별자 prop에 코어의 inputId와 labelId를 전달합니다. 보조 요소의 주소는 getInputId(key)에서 받습니다.

선택기와 피커의 편집 슬롯에는 코어 기본 ID를 넘깁니다. 입력 자체의 표시 제목은 keyed 주소를 사용하며 보이는 제목이 없으면 외부 제목을 참조합니다. Slider는 기본적으로 native 확정 이벤트로 저장하고 Switch 켜짐은 열거형 첫 항목입니다. 루트와 분기에 코어의 오류 메시지를 표시합니다.

비네이티브 열거형 Select는 공개 inputRef 핸들, URI는 주소 입력, 날짜·월·시간 피커는 편집 구획에 focusRef를 연결합니다. 비활성 입력은 앵커를 해제합니다.

Form.Label은 활성 피커의 편집 구획에 클릭 초점을 전달합니다. 달력 열기는 라이브러리 버튼이 맡습니다. Slider의 저장 전 thumb는 포커스나 드래그로 조작할 때 표시하고, 값 대신 현지화 가능한 미설정 안내를 발표합니다. 스키마가 허용하는 단계가 없으면 Slider를 비활성화합니다.

MuiContext의 상태 레이블은 각 입력의 별칭보다 우선하며 공개 타입에서도 설정할 수 있습니다.

## Acceptance Criteria

### control-bindings — 폼 상태 전달

- 저장된 값과 사용자 변경을 라이브러리의 공개 prop과 콜백으로 연결합니다.

## Boundary Exemptions

### `type.ts` — 상위 표시 context의 구체 타입 참조

- **Consumers**: `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputBoolean.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputBooleanSwitch.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputDate.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputMonth.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputNumber.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputRadioGroup.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputSlider.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputString.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputStringCheckbox.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputStringEnum.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputStringSwitch.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputTextarea.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputTime.tsx`, `**/packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputUri.tsx`
- **Direct import**: `allowed`
- **Reason**: 입력 부품은 조상이 소유한 MuiContext를 타입 전용으로 읽습니다. 저장소 Module Contract Principle 4의 위로 열린 참조이며, 자기 부품을 재수출하는 부모 진입점을 읽으면 실제 배럴 순환을 만듭니다. Fractal 단위 그래프의 왕복은 구현 파일 간 순환을 뜻하지 않습니다.

## Last Updated

입력 바인딩이나 부품의 소유 경계가 바뀔 때 갱신합니다.
