# MUI 연결 계약

## Requirements

MUI 입력은 schema-form이 해석한 값과 상태를 표시합니다. 플러그인 context의 표시 옵션은 부품 간 일관성을 위한 설정이며 폼 실행 상태가 아닙니다.

## API Contracts

날짜·시간 입력도 disabled와 readOnly의 후속 변경을 MUI에 전달하며, 읽기 전용 상호작용은 MUI가 소유합니다. 라디오 그룹·체크박스 그룹·불리언 체크박스·슬라이더는 자기 선택 상태를 가지지만 MUI에 읽기 전용 모드가 없으므로 `disabled || readOnly`를 받습니다. 그렇지 않으면 코어가 이미 거부한 선택을 화면이 보여 주어 표시와 저장 값이 어긋납니다.

날짜·월 피커의 범위 제한은 `presentation.FieldInputProps.minimum`과 `maximum`에서 읽습니다. 코어는 문자열 스키마의 `minimum`/`maximum`을 입력에 넘기지 않으므로 스키마에서 읽으면 제한이 사라집니다. 제한값은 `YYYY-MM-DD`와 `YYYY-MM`으로 엄격하게 파싱하고 유효할 때만 피커에 넘깁니다. dayjs의 관대한 파싱은 `2024-02-31`을 `2024-03-02`로 넘겨 다른 날짜를 제한으로 만들기 때문입니다. 파싱은 제한값이 바뀔 때 한 번만 하며, 그리는 날짜마다 하지 않습니다.

슬라이더의 간격은 0의 배수 격자를 사용하며 최솟값 이상인 첫 배수와 최댓값 이하인 마지막 배수 사이에서 이동합니다.

슬라이더는 폼 값이 없을 때 최솟값을 값처럼 보여 주지 않습니다. 첫 사용자 변경 전까지 thumb와 값 라벨을 숨기고 `aria-valuenow`를 생략하며 `aria-valuetext`로 값이 없음을 알리되(기본 `Not set`, `presentation.FieldInputProps.unsetValueText`로 변경), 키보드로 포커스된 thumb는 보이고 포인터·키보드 조작은 그대로 받습니다. 미설정 상태에서는 확정된 값(`onChangeCommitted`)도 저장합니다. MUI는 값이 최솟값 그대로면 `onChange`를 건너뛰므로 Home 키나 최솟값에서 놓은 포인터가 폼을 비워 둔 채 thumb만 최솟값에 남기기 때문입니다. 사용자 조작 없이 폼에 값을 써 넣지 않으며, 외부에서 값이 `undefined`로 바뀌면 재마운트로 다시 미설정 상태가 됩니다.

enum 선택 identity는 원래 JSON 스칼라를 인코딩하므로 null과 문자열 null을 합치지 않습니다.

로컬 검증 표는 각 parameter 호출에 정적 배열로 두어 실행 없이 사례 수를 셀 수 있게 합니다. 표를 옮겨도 사례 이름·순서·단언을 보존하며, 공유 시나리오를 복제하지 않습니다.

입력 부품의 조상 MuiContext 참조와 부모의 부품 재수출은 저장소 원칙 4가 허용하는 조합입니다. 이 두 소유 경계의 집계 순환만 사례별로 예외 처리하며, 타입을 읽기 위해 부품을 다시 재수출하는 부모 배럴을 가져오지 않습니다.

URI 입력의 스킴은 파싱한 초기 값에서 상태를 시작하며 Activity의 effect 재연결로 되돌리지 않습니다. URI 입력은 저장 값을 제어 입력으로 직접 표시하고 값이 `undefined`일 때만 마지막 사용자 스킴을 로컬 상태로 표시합니다. 외부 쓰기와 reset도 저장 값이 있으면 그 스킴을 표시하며, 값이 없으면 마지막 선택을 유지합니다. 서버와 첫 클라이언트 렌더도 저장된 스킴을 표시합니다.

URI 스킴은 RFC 3986 3.1절의 문법으로 분리하고 원래 대소문자와 구분자를 보존합니다. 스킴이 없는 문자열과 빈 문자열은 스킴을 덧붙이지 않으며 스킴만 있는 값도 유지합니다. 주소가 비어 있지 않을 때 경로 편집은 스킴을, 스킴 편집은 경로를 바꾸지 않습니다. 사용자가 주소를 지우거나 빈 주소에서 스킴만 고르면 값은 `undefined`이며 선택한 스킴은 다음 입력을 위한 로컬 상태로 보존합니다. 저장된 스킴 전용 문자열은 무편집 상태에서 그대로 왕복합니다. bare 설정은 http·https·ftp에 ://, 나머지에 :를 사용하고 명시한 구분자는 보존합니다.

입력의 DOM 식별자는 코어가 전달하는 Form 범위의 `id`를 사용하며 `path`는 데이터 포인터로 유지합니다. 단일 입력의 레이블은 실제 입력의 id와 연결하고, 복합 선택과 분기의 제목은 FieldRenderer가 받는 `labelId`와 `aria-labelledby`로 연결합니다. 각 선택지는 고유한 id를 가지며 라디오의 native name은 scoped id입니다.

렌더러의 labelId는 내부 제목 context로 그룹 입력에만 전달하며 사용자 정의 입력의 DOM props에 추가하지 않습니다.

선택 그룹의 제목은 해당 입력이 한 번만 소유하며 렌더러가 같은 식별자나 보이는 제목을 덧붙이지 않습니다. 일반 분기의 접근성 제목은 숨겨진 요소로 연결하여 배열 항목과 hideLabel의 기존 표시를 유지합니다.

분기 입력도 코어 기본 렌더러와 같이 배열·객체 자체의 검증 오류를 표시합니다. 루트 입력은 코어와 동일하게 자식 입력만 구성합니다.

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
