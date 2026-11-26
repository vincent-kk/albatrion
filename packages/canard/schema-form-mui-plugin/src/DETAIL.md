# UI 입력 연결 계약

## Requirements

- 필드 배치 렌더러는 입력에 읽기 전용·비활성 상태를 전달합니다. 배치와 입력은 각자 받은 클래스와 스타일을 기존 표시 요소에 적용합니다. 배열 입력은 코어의 형식 불일치 상태를 기존 그룹에 전달합니다.
- 필드 배치 렌더러는 보이는 제목을 그리지 않고, 입력이 자기 캡션을 보이며 그 keyed 주소를 참조합니다. 배열 입력은 항목에 `hideLabel`을 넘겨 항목의 캡션을 숨기므로, 배열 입력의 그룹과 캡션 없는 항목 입력은 labelId를 참조합니다. 그래서 렌더러는 루트가 아닌 배열 필드와 배열 항목에 `hidden` 속성을 가진 제목 요소를 그려 labelId와 필드 이름(배열 항목은 인덱스)을 담고, 이 참조가 접근성 이름을 얻게 합니다. 이 요소가 없으면 참조가 존재하지 않는 요소를 가리킵니다. 입력은 labelId를 id로 가진 요소를 그리지 않으므로 제목은 렌더러가 그립니다. 캡션이 없을 때 입력이 `aria-labelledby`를 생략하는 방법은 끊긴 참조만 없애고 컨트롤을 이름 없이 남기므로 택하지 않습니다. 제목을 보이게 하면 소비자의 화면 배치가 바뀌므로 숨깁니다.

입력은 폼의 값과 상태를 라이브러리의 공개 prop으로 전달합니다. 입력의 유효성은 폼의 스키마 검증이 판단합니다.

## API Contracts

라이브러리가 지원하는 식별자 prop에 코어의 inputId와 labelId를 전달합니다. 보조 요소의 주소는 getInputId(key)에서 받습니다.

선택기와 피커의 편집 슬롯에는 코어 기본 ID를 넘깁니다. 입력 자체의 표시 제목은 keyed 주소를 사용하며 보이는 제목이 없으면 외부 제목을 참조합니다. Slider는 기본적으로 native 확정 이벤트로 저장하고 Switch 켜짐은 열거형 첫 항목입니다. 루트와 분기에 코어의 오류 메시지를 표시합니다.

비네이티브 열거형 Select는 메뉴와 숨은 native input에 각각 폼 범위의 보조 ID를 전달합니다. Select는 공개 inputRef 핸들, URI는 주소 입력, 날짜·월·시간 피커는 편집 구획에 focusRef를 연결합니다. 비활성 입력은 앵커를 해제합니다.

Form.Label은 활성 피커의 편집 구획에 클릭 초점을 전달합니다. 달력 열기는 라이브러리 버튼이 맡습니다. Slider의 저장 전 thumb는 포커스나 드래그로 조작할 때 표시하고, 값 대신 현지화 가능한 미설정 안내를 발표합니다. 미설정 Slider의 처음 표시 값과 같은 값을 선택하면 네이티브 확정 이벤트에서 저장하며, 즉시 저장 설정에서도 이 선택을 보존합니다. 스키마가 허용하는 단계가 없으면 Slider를 비활성화합니다.

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
