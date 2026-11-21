# MUI 연결 계약

## Requirements

MUI 입력은 schema-form이 해석한 값과 상태를 표시합니다. 플러그인 context의 표시 옵션은 부품 간 일관성을 위한 설정이며 폼 실행 상태가 아닙니다.

## API Contracts

날짜·시간 입력도 disabled와 readOnly의 후속 변경을 MUI에 전달하며, 읽기 전용 상호작용은 MUI가 소유합니다. 라디오 그룹·체크박스 그룹·불리언 체크박스·슬라이더는 자기 선택 상태를 가지지만 MUI에 읽기 전용 모드가 없으므로 `disabled || readOnly`를 받습니다. 그렇지 않으면 코어가 이미 거부한 선택을 화면이 보여 주어 표시와 저장 값이 어긋납니다.

날짜·월 피커의 범위 제한은 `presentation.FieldInputProps.minimum`과 `maximum`에서 읽습니다. 코어는 문자열 스키마의 `minimum`/`maximum`을 입력에 넘기지 않으므로 스키마에서 읽으면 제한이 사라집니다. 제한값은 `YYYY-MM-DD`와 `YYYY-MM`으로 엄격하게 파싱하고 유효할 때만 피커에 넘깁니다. dayjs의 관대한 파싱은 `2024-02-31`을 `2024-03-02`로 넘겨 다른 날짜를 제한으로 만들기 때문입니다. 파싱은 제한값이 바뀔 때 한 번만 하며, 그리는 날짜마다 하지 않습니다.

문자열 스위치는 enum[0]을 켜짐 값, enum[1]을 꺼짐 값으로 사용합니다. 문자열 상태 레이블은 context.switchLabels, presentation.FieldInputProps.alias, 스키마 switchLabels 튜플 순서로 선택합니다. context와 alias는 저장 enum 값의 문자열을 키로 하는 맵이며 선택한 맵에 키가 없으면 enum 값을 표시합니다. 맵을 주지 않으면 MUI 전용 튜플을 같은 enum 순서로 표시합니다. 불리언 스위치의 상태 레이블은 context.checkboxLabels, presentation.FieldInputProps.alias 순서로 선택하며 레이블이 없으면 기존 DOM을 유지합니다. 현재 상태 레이블은 기존 필드 레이블 안에서 보조 표시하고 접근성 이름을 바꾸지 않습니다.

불리언 체크박스의 체크·혼합 상태는 현재 폼 값을 표시합니다.

선택 그룹은 사용자가 조작한 enum 선택지만 바꾸며 enum 밖의 저장 값과 JSON identity는 보존합니다.

enum 선택 identity는 원래 JSON 스칼라를 인코딩하므로 null과 문자열 null을 합치지 않습니다. 단일 enum 선택기의 저장 값이 현재 선택지에 없으면 표시 선택값만 빈 값으로 두어 라이브러리 경고를 내지 않습니다. 폼의 원래 값은 사용자가 유효한 선택지를 고를 때까지 유지합니다.

로컬 검증 표는 각 parameter 호출에 정적 배열로 두어 실행 없이 사례 수를 셀 수 있게 합니다. 표를 옮겨도 사례 이름·순서·단언을 보존하며, 공유 시나리오를 복제하지 않습니다.

입력 부품의 조상 MuiContext 참조와 부모의 부품 재수출은 저장소 원칙 4가 허용하는 조합입니다. 이 두 소유 경계의 집계 순환만 사례별로 예외 처리하며, 타입을 읽기 위해 부품을 다시 재수출하는 부모 배럴을 가져오지 않습니다.

URI 입력의 스킴은 파싱한 초기 값에서 상태를 시작하며 Activity의 effect 재연결로 되돌리지 않습니다. URI 입력은 저장 값을 제어 입력으로 직접 표시하고 값이 `undefined`일 때만 마지막 사용자 스킴을 로컬 상태로 표시합니다. 외부 쓰기와 reset도 저장 값이 있으면 그 스킴을 표시하며, 값이 없으면 마지막 선택을 유지합니다. 서버와 첫 클라이언트 렌더도 저장된 스킴을 표시합니다.

URI 스킴은 RFC 3986 3.1절의 문법으로 분리하고 원래 대소문자와 구분자를 보존합니다. 스킴이 없는 문자열과 빈 문자열은 스킴을 덧붙이지 않으며 스킴만 있는 값도 유지합니다. 주소가 비어 있지 않을 때 경로 편집은 스킴을, 스킴 편집은 경로를 바꾸지 않습니다. 사용자가 주소를 지우거나 빈 주소에서 스킴만 고르면 값은 `undefined`이며 선택한 스킴은 다음 입력을 위한 로컬 상태로 보존합니다. 저장된 스킴 전용 문자열은 무편집 상태에서 그대로 왕복합니다. bare 설정은 http·https·ftp에 ://, 나머지에 :를 사용하고 명시한 구분자는 보존합니다.

코어가 전달하는 `inputId`는 사용자가 조작하는 요소에 둡니다. Select의 표시 combobox와 picker의 포커스 가능한 section group이 그 대상이며 숨은 native input은 별도의 고유한 keyed 주소를 사용합니다. 입력은 기본 컨트롤에 코어의 `inputId`를 사용하고 추가 요소는 `getInputId(key)`로 식별합니다. 필드 제목은 코어의 `labelId`를 사용하며 입력 자체 레이블은 keyed 주소를 사용합니다. `path`는 데이터 포인터이고 native 라디오 name은 `inputId`입니다. 모든 식별자는 불투명한 값이므로 덧붙이거나 파싱하지 않습니다. 렌더러와 입력은 같은 코어 주소를 받으므로 별도 제목 context로 재구성하지 않습니다. MUI Select의 표시 요소와 메뉴도 말단 이름 대신 keyed 주소를 사용하여 같은 말단 이름과 여러 Form을 구별합니다.

필드 레이블을 클릭하면 활성 또는 읽기 전용 date·month·time picker의 section group에 포커스합니다. 비활성 picker는 section group에 aria-disabled를 전달하며 레이블 클릭으로 포커스하지 않습니다. section group의 이름과 `inputId`는 그대로 연결하며, HTML 레이블이 직접 활성화할 수 없는 section group은 레이블 렌더러에서 클릭을 처리합니다. Select는 MUI의 레이블 활성화 처리를 사용합니다.

분기 입력은 배열·객체 자체의 검증 오류를 표시하며, 루트와 중첩 위치가 같은 오류를 보여 줍니다. 루트 오류가 없으면 기존 입력 DOM만 유지합니다.

### 입력의 접근성 이름

플러그인의 필드 레이블은 연결된 조작 요소 또는 그룹의 접근성 이름을 제공합니다. 플러그인 레이블 렌더러는 명시적으로 전달받은 레이블을 우선합니다. 기본 레이블 렌더러는 이름 후보의 공백을 정규화하고 텍스트나 렌더링할 자식이 없는 문자열·배열·Fragment를 건너뜁니다. MUI 기본 FormGroup에서 표시 제목을 쓸 때는 스키마의 표시 레이블이나 title을 사용하고, 그 값이 없으면 options의 `aria-label`, 코어의 필드 이름 순으로 제목을 고릅니다. 스키마의 `presentation.FieldInputProps.hideLabel`로 입력 제목을 숨기거나 표시 제목이 없는 분기 그룹을 렌더할 때는 options의 `aria-label`, 스키마 title, 코어의 필드 이름 순으로 숨은 제목을 고릅니다.

기본 FormGroup을 거치지 않고 명시적으로 배치한 Form.Input에 연결할 제목 요소와 입력 자체 레이블이 모두 없으면 플러그인은 대체 이름을 생성하지 않습니다. 이 경우 접근성 이름이 빌 수 있으므로 소비자가 Form.Label을 렌더하거나 실제 조작 요소에 `aria-label`을 제공합니다. 이름 없는 루트 배열과 객체는 제목 참조 없이 그룹을 표시할 수 있습니다. 기본 레이블 렌더러는 필수 표시를 `aria-hidden`으로 표시합니다.

같은 조작 요소 DOM 노드가 유지되는 동안 현재 문서의 레이블을 사용합니다. 조작 요소와 기본·외부 레이블의 마운트 순서가 달라도 레이블의 연결·제거와 텍스트 변경이 이름에 반영됩니다. Form.Input을 다시 마운트하면 새 조작 요소에 연결합니다. MUI Select의 variant 변경처럼 Form.Input이 유지된 채 라이브러리가 같은 id의 조작 요소를 교체한 다음 외부 Form.Label이 제거되면 새 요소에 이름을 다시 적용하지 않습니다. 입력 레이블이 화면에 남아 있어도 combobox의 접근성 이름이 빌 수 있습니다.

텍스트·비밀번호·텍스트 영역·숫자·단일 체크박스·스위치, 단일·다중 enum의 combobox 및 날짜·월·시간 피커의 초점 가능한 section group에 필드 이름을 연결합니다. 슬라이더는 엄지에 필드 제목을 연결합니다. 라디오와 체크박스 선택 그룹 및 제목 요소가 있는 배열과 객체는 그룹에 제목을 연결합니다. 기본 URI 편집기에서 주소 입력은 필드 제목을 참조하고 프로토콜 선택기는 별도 이름을 사용합니다. 기본 배열 편집기는 추가 버튼에 Add 문구를 표시하고 두 버튼의 title에 각각 add와 remove를 사용합니다.

코어의 `inputId`는 주 조작 요소에 두고, 추가 조작 요소와 입력 자체 레이블에는 `getInputId(key)`가 발급한 서로 다른 id를 둡니다. bound Label과 Form.Label이 소유하는 제목의 id는 `labelId`입니다. 레이블의 `for`는 연결 대상 주 조작 요소의 id를 가리키며, 복합 그룹에는 제목을 참조하는 `aria-labelledby`를 사용합니다. 필드 제목을 가리키는 `aria-labelledby`는 제목 요소가 문서에 있을 때 그 요소의 내용을 사용합니다. 아직 제목이 마운트되지 않았거나 제거된 동안에는 해당 참조가 이름을 제공하지 않습니다.

MUI Select의 조작 대상은 표시 combobox이고, date·month·time 피커의 조작 대상은 초점 가능한 section group입니다. 해당 요소는 div이므로 레이블 클릭은 MUI 또는 플러그인에서 전달합니다. 숨은 native input은 keyed id를 갖습니다. 외부 Form.Label과 입력 자체 레이블을 함께 그리면 이름은 현재 문서의 제목 주소와 입력 레이블에서 클라이언트가 결합합니다. 두 소스의 같은 텍스트는 한 번만 사용하며, 입력 label prop의 전달 경로가 달라도 같은 규칙을 적용합니다. 두 레이블이 별도 React 경계에서 그려지므로 서버 HTML의 결합 전 이름은 외부 제목입니다.

### 슬라이더의 경계·격자·저장

포함·배타 경계가 함께 있으면 더 엄격한 경계가 이기며 한쪽에 둘 다 없을 때만 기본 0 또는 100을 사용합니다. multipleOf가 있으면 표기법에 관계없이 0부터 정확한 십진 배수 격자를 계산하며 정수 타입은 그 격자와 정수의 교집합을 사용합니다. 첫 허용 값과 마지막 허용 값이 트랙 경계이므로 step으로 닿지 않는 상한은 선택 범위에 포함되지 않습니다.

multipleOf 없는 number는 작성한 하한을 기준으로 기본 step 1을 적용하고 포함된 하한과 상한을 선택할 수 있게 합니다. 배타 하한은 첫 step부터 선택하고 배타 상한에 닿는 step은 제외합니다. 범위가 기본 간격보다 좁으면 허용되는 포함 상한을 유지합니다. multipleOf 없는 integer는 경계 안의 정수를 선택합니다. 선택할 값이 없는 격자는 잠그고 저장하지 않습니다.

매 렌더에서 값 표시는 현재 저장 값과 현재 모드에서 정합니다. multipleOf 없는 number의 읽기 전용 모드에서는 선택 범위 안의 저장 값을 보존하며, 그 외에는 포함 상한을 포함한 허용 정지점 중 저장 값과 가장 가까운 점을 표시하며 동률은 큰 점을 선택합니다. 범위 밖이면 가까운 끝점을 표시합니다. 활성 조작 중에는 현재 draft를 표시합니다. 잠금 전환과 외부 저장 값 교체는 미확정 draft와 대기 중인 확정을 폐기합니다. 잠금 해제 뒤 취소한 조작의 키 해제나 포인터 완료는 값을 쓰지 않습니다. 어느 모드에서 시작했는지와 무관하게 읽기 전용, disabled, 편집 가능 사이를 전환한 결과는 현재 저장 값과 새 모드로 다시 계산합니다. readOnly와 disabled가 함께 설정되면 읽기 전용 표시 규칙을 적용하고 조작은 잠급니다.

엄지의 `aria-valuenow`와 표시되는 툴팁은 같은 표시 값을 스키마 단위로 제공합니다. 값이 있으면 별도 `aria-valuetext` 없이 그 수를 읽습니다. 초기 값이 없거나 외부 reset으로 다시 미설정이 되면 새 조작 전까지 `aria-valuenow`를 생략하고 `aria-valuetext`에 `Not set`을 제공하며 툴팁과 값 레이블을 숨깁니다. 이때 엄지는 키보드 초점에서만 보입니다. 눈금은 유효한 정지점의 시각 표시이고 내부 좌표로 환산해도 사용자 레이블을 유지합니다.

잠금과 렌더는 저장 값을 바꾸지 않습니다. 유효한 조작을 하면 lazy가 false일 때 이동마다, 생략하거나 true면 키보드 또는 포인터 확정에서 값이 저장됩니다. Home과 End는 현재 엄지에서 선택 가능한 첫 값과 마지막 값을 선택합니다. 위와 PageUp은 방향과 무관하게 증가하며 아래와 PageDown은 감소합니다. 가로 화살표는 LTR에서 Right, RTL에서 Left가 증가합니다. 기본 격자에서 화살표는 한 step, PageUp·PageDown과 Shift+화살표는 열 step을 이동합니다. 미설정의 탐색 기준은 첫 정지점입니다. 격자 밖에서 증가 키는 floor 인덱스에 이동량을 더하고 감소 키는 ceil 인덱스에서 이동량을 뺀 뒤 경계 안으로 제한합니다. 포인터는 라이브러리가 위치에 맞춰 선택한 정지점을 스키마 단위로 변환하여 표시하고 저장합니다. 읽기 전용·disabled·빈 격자에서는 키와 포인터가 값을 바꾸지 않습니다.

Number.MAX_SAFE_INTEGER에 이르는 트랙에서 포인터 정밀도는 라이브러리의 부동소수점 좌표 범위까지입니다.

MUI의 포인터는 먼저 기본 step으로 반올림하고 트랙 경계 안으로 제한합니다. 기본 step에 맞지 않는 포함 상한을 독립된 포인터 후보로 추가하는 설정은 없으므로 Home·End와 표시 정규화의 정지점 규칙으로 읽지 않습니다. MUI 연결은 기존 `showMarks` 옵션으로 기본 격자 눈금만 켜며 양끝 자막은 스키마 단위를 표시합니다. 라이브러리가 지원하는 사용자 눈금 배열은 공개 설정에 노출하지 않습니다. 가로 방향은 DOM의 dir 대신 MUI theme.direction을 따릅니다. 값 레이블도 스키마 단위를 사용하며 미설정 안내는 `unsetValueText`로 바꿀 수 있습니다. MUI가 키를 누를 때도 확정 콜백을 보내므로 키보드 확정을 키를 놓을 때까지 보류합니다. 기본 lazy에서는 이동 뒤 Shift를 먼저 놓아도 확정됩니다.

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
