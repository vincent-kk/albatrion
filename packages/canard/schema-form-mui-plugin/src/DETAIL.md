# MUI 연결 계약

## Requirements

MUI 입력은 schema-form이 해석한 값과 상태를 표시합니다. 플러그인 context의 표시 옵션은 부품 간 일관성을 위한 설정이며 폼 실행 상태가 아닙니다.

## API Contracts

날짜·시간 입력도 disabled와 readOnly의 후속 변경을 MUI에 전달하며, 읽기 전용 상호작용은 MUI가 소유합니다. 라디오 그룹·체크박스 그룹·불리언 체크박스·슬라이더는 자기 선택 상태를 가지지만 MUI에 읽기 전용 모드가 없으므로 `disabled || readOnly`를 받습니다. 그렇지 않으면 코어가 이미 거부한 선택을 화면이 보여 주어 표시와 저장 값이 어긋납니다.

날짜·월 피커의 범위 제한은 `presentation.FieldInputProps.minimum`과 `maximum`에서 읽습니다. 코어는 문자열 스키마의 `minimum`/`maximum`을 입력에 넘기지 않으므로 스키마에서 읽으면 제한이 사라집니다. 제한값은 `YYYY-MM-DD`와 `YYYY-MM`으로 엄격하게 파싱하고 유효할 때만 피커에 넘깁니다. dayjs의 관대한 파싱은 `2024-02-31`을 `2024-03-02`로 넘겨 다른 날짜를 제한으로 만들기 때문입니다. 파싱은 제한값이 바뀔 때 한 번만 하며, 그리는 날짜마다 하지 않습니다.

multipleOf가 있는 슬라이더는 0의 배수 격자를 사용하며 최솟값 이상인 첫 배수와 최댓값 이하인 마지막 배수 사이에서 이동합니다. 정수 타입은 그 격자와 정수의 교집합을 사용하며, multipleOf가 없는 숫자 타입은 작성한 범위 끝점을 유지합니다. 선택 가능한 값이 없는 범위는 비활성화하고 값을 쓰지 않습니다.

슬라이더는 폼 값이 없을 때 최솟값을 값처럼 보여 주지 않습니다. 첫 사용자 변경 전까지 thumb와 값 라벨을 숨기고 `aria-valuenow`를 생략하며 `aria-valuetext`로 값이 없음을 알리되(기본 `Not set`, `presentation.FieldInputProps.unsetValueText`로 변경), 키보드로 포커스된 thumb는 보이고 포인터·키보드 조작은 그대로 받습니다. lazy를 생략하거나 true이면 키보드 keyup과 포인터 놓기에서만 폼 값을 저장하고 false이면 이동마다 저장합니다. MUI가 키보드 keydown에도 onChangeCommitted를 호출하므로 키보드 확정은 keyup까지 보류합니다. 미설정 상태에서는 확정된 값(`onChangeCommitted`)도 저장합니다. MUI는 값이 최솟값 그대로면 `onChange`를 건너뛰므로 Home 키나 최솟값에서 놓은 포인터가 폼을 비워 둔 채 thumb만 최솟값에 남기기 때문입니다. 사용자 조작 없이 폼에 값을 써 넣지 않으며, 외부에서 값이 `undefined`로 바뀌면 재마운트로 다시 미설정 상태가 됩니다.

문자열 스위치는 enum[0]을 켜짐 값, enum[1]을 꺼짐 값으로 사용합니다. 문자열 상태 레이블은 context.switchLabels, presentation.FieldInputProps.alias, 스키마 switchLabels 튜플 순서로 선택합니다. context와 alias는 저장 enum 값의 문자열을 키로 하는 맵이며 선택한 맵에 키가 없으면 enum 값을 표시합니다. 맵을 주지 않으면 MUI 전용 튜플을 같은 enum 순서로 표시합니다. 불리언 스위치의 상태 레이블은 context.checkboxLabels, presentation.FieldInputProps.alias 순서로 선택하며 레이블이 없으면 기존 DOM을 유지합니다. 현재 상태 레이블은 기존 필드 레이블 안에서 보조 표시하고 접근성 이름을 바꾸지 않습니다.

불리언 체크박스의 체크·혼합 상태는 현재 폼 값을 표시합니다.

선택 그룹은 사용자가 조작한 enum 선택지만 바꾸며 enum 밖의 저장 값과 JSON identity는 보존합니다.

enum 선택 identity는 원래 JSON 스칼라를 인코딩하므로 null과 문자열 null을 합치지 않습니다. 단일 enum 선택기의 저장 값이 현재 선택지에 없으면 표시 선택값만 빈 값으로 두어 라이브러리 경고를 내지 않습니다. 폼의 원래 값은 사용자가 유효한 선택지를 고를 때까지 유지합니다.

로컬 검증 표는 각 parameter 호출에 정적 배열로 두어 실행 없이 사례 수를 셀 수 있게 합니다. 표를 옮겨도 사례 이름·순서·단언을 보존하며, 공유 시나리오를 복제하지 않습니다.

입력 부품의 조상 MuiContext 참조와 부모의 부품 재수출은 저장소 원칙 4가 허용하는 조합입니다. 이 두 소유 경계의 집계 순환만 사례별로 예외 처리하며, 타입을 읽기 위해 부품을 다시 재수출하는 부모 배럴을 가져오지 않습니다.

URI 입력의 스킴은 파싱한 초기 값에서 상태를 시작하며 Activity의 effect 재연결로 되돌리지 않습니다. URI 입력은 저장 값을 제어 입력으로 직접 표시하고 값이 `undefined`일 때만 마지막 사용자 스킴을 로컬 상태로 표시합니다. 외부 쓰기와 reset도 저장 값이 있으면 그 스킴을 표시하며, 값이 없으면 마지막 선택을 유지합니다. 서버와 첫 클라이언트 렌더도 저장된 스킴을 표시합니다.

URI 스킴은 RFC 3986 3.1절의 문법으로 분리하고 원래 대소문자와 구분자를 보존합니다. 스킴이 없는 문자열과 빈 문자열은 스킴을 덧붙이지 않으며 스킴만 있는 값도 유지합니다. 주소가 비어 있지 않을 때 경로 편집은 스킴을, 스킴 편집은 경로를 바꾸지 않습니다. 사용자가 주소를 지우거나 빈 주소에서 스킴만 고르면 값은 `undefined`이며 선택한 스킴은 다음 입력을 위한 로컬 상태로 보존합니다. 저장된 스킴 전용 문자열은 무편집 상태에서 그대로 왕복합니다. bare 설정은 http·https·ftp에 ://, 나머지에 :를 사용하고 명시한 구분자는 보존합니다.

코어가 전달하는 `inputId`는 사용자가 조작하는 요소에 둡니다. Select의 표시 combobox와 picker의 포커스 가능한 section group이 그 대상이며 숨은 native input은 별도의 고유한 keyed 주소를 사용합니다. 입력은 기본 컨트롤에 코어의 `inputId`를 사용하고 추가 요소는 `getInputId(key)`로 식별합니다. 필드 제목은 코어의 `labelId`를 사용하며 입력 자체 레이블은 keyed 주소를 사용합니다. `path`는 데이터 포인터이고 native 라디오 name은 `inputId`입니다. 모든 식별자는 불투명한 값이므로 덧붙이거나 파싱하지 않습니다. 렌더러와 입력은 같은 코어 주소를 받으므로 별도 제목 context로 재구성하지 않습니다. MUI Select의 표시 요소와 메뉴도 말단 이름 대신 keyed 주소를 사용하여 같은 말단 이름과 여러 Form을 구별합니다.

필드 레이블을 클릭하면 date·month·time picker의 section group에 포커스합니다. section group의 이름과 `inputId`는 그대로 연결하며, HTML 레이블이 직접 활성화할 수 없는 section group은 레이블 렌더러에서 클릭을 처리합니다. Select는 MUI의 레이블 활성화 처리를 사용합니다.

코어의 labelId는 renderer와 bound Label이 소유하고 입력 자체 legend는 getInputId('legend')를 사용합니다. 모든 입력은 labelId를 직접 읽어 주 컨트롤 또는 복합 그룹의 이름을 필드 제목으로 연결합니다. Form.Label과 Form.Input, bound Label을 렌더하는 사용자 renderer, hideLabel도 같은 이름을 유지합니다. 범위 양끝은 각각 제목과 연결하며 선택지·날짜 세부 입력·URI Protocol 같은 보조 컨트롤은 자기 이름을 유지하고 제목 있는 그룹 또는 description으로 소속을 연결합니다. 입력 정의에서 파생한 표는 primary·range-end·auxiliary 분류와 고유 id·존재하는 참조 대상을 요구합니다. 선택 그룹 제목은 접근성 트리에 한 번만 노출하며 입력 내부의 중복 legend는 hidden으로 제외합니다.

분기 입력은 배열·객체 자체의 검증 오류를 표시하며, 루트와 중첩 위치가 같은 오류를 보여 줍니다. 루트 오류가 없으면 기존 입력 DOM만 유지합니다.

### 슬라이더의 경계·격자·저장

모든 pointer·keyboard 저장은 필드 자신의 inclusive·exclusive 경계, multipleOf와 정수 타입을 만족합니다. 렌더링만으로 저장 값을 바꾸지 않으며 유효한 조작 값이 없는 격자는 아무 값도 저장하지 않습니다. 양쪽에 inclusive·exclusive가 함께 있으면 더 엄격한 경계가 이깁니다. 한쪽에 둘 다 없을 때만 기본 경계 0·100을 사용합니다.

multipleOf가 있으면 0을 anchor로 하는 정확한 십진 배수 격자를 사용합니다. 정수 타입은 그 격자와 정수의 교집합입니다. 첫 허용 값과 마지막 허용 값이 track 경계이며 Home·End가 이 값을 저장합니다.

multipleOf가 없는 number는 하한을 anchor로 기본 step 1을 적용합니다. inclusive 하한·상한은 원래 값 그대로 유지하며 Home·End가 저장합니다. exclusive 하한은 anchor 자체를 제외하여 Home이 한 step 뒤에서 시작합니다. exclusive 상한에서는 anchor에서 step으로 도달하는 값 중 상한보다 작은 마지막 값을 End가 저장합니다. integer는 경계 안의 정수만 선택합니다.

Arrow·PageUp·PageDown·Shift+Arrow는 저장 값이 미설정·격자 밖·경계 밖인 경우도 같은 격자 안으로 이동합니다. Page와 Shift는 열 step입니다. 십진 지수 표기의 작은 step도 십진 정수 연산으로 처리합니다. lazy 생략은 commit에서, false는 이동에서 저장하며 같은 완료 조작의 결과는 같습니다. 모바일 범위는 양끝에 같은 규칙을 적용합니다.

Number.MAX_SAFE_INTEGER에 이르는 track의 pointer 정밀도는 라이브러리의 부동소수점 좌표 한계이며 보장 범위 밖입니다.

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

### slider-values — 모든 조작의 유효 값

일반 로컬 실행과 pre-release는 전체 교차 범위를 실행합니다. PR은 224개 스키마 조합과 타입·step·양끝 경계·다섯 시작 상태·모든 조작 분류의 쌍을 유지하며, 두 lazy 모드는 선택한 각 입력에서 같은 단언으로 비교합니다.

- 독립 십진 참조 모델에서 경계 조합·multipleOf·타입·시작 값·키와 pointer·lazy를 교차하여 저장 값과 schema 유효성을 비교합니다.
- 미설정 표시·렌더 시 값 보존·commit 시점 및 기존 소수 경계 동작을 유지합니다.

## Last Updated

입력 바인딩·선택 identity 또는 context의 소유 경계가 바뀔 때 갱신합니다.
