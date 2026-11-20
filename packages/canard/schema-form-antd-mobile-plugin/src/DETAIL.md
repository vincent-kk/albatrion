# UI 입력 연결 계약

## Requirements

입력은 폼이 전달한 저장 값과 상태를 표시하며 라이브러리의 로컬 draft를 폼 값으로 오해하지 않습니다.

## API Contracts

입력은 labelId를 직접 읽어 주 컨트롤 또는 복합 그룹의 접근성 이름을 필드 제목과 연결합니다. inputId는 주 컨트롤, getInputId(key)는 보조 요소의 id입니다. 특정 렌더러만 전달하는 aria-labelledby에 의존하지 않습니다. renderer와 bound Label은 코어 labelId를 소유하며 입력 자체의 legend가 있으면 getInputId('legend')를 사용합니다.

같은 규칙은 플러그인 FieldRenderer, Form.Label과 Form.Input, bound Label을 렌더하는 사용자 renderer, hideLabel에서 유지합니다. 범위 양끝은 각각 필드 제목에 연결합니다. 선택지·날짜 세부 입력·URI Protocol 같은 보조 컨트롤은 자기 이름을 유지하고 제목 있는 그룹 또는 description으로 소속을 연결합니다. 이름 없는 컨트롤과 라이브러리의 기본 이름만 가진 컨트롤, 중복 id, 존재하지 않는 aria-labelledby·for 대상은 허용하지 않습니다. 선택 그룹의 제목은 접근성 트리에 한 번만 노출하며 중복 제목은 hidden으로 제외합니다.

숫자 Stepper의 빈 값은 allowEmpty를 지원하는 antd-mobile 5.2.0 이상에서 제공합니다. null을 렌더하지 못하는 이전 버전은 지원 범위 밖입니다.

### 슬라이더의 경계·격자·저장

모든 pointer·keyboard 저장은 필드 자신의 inclusive·exclusive 경계, multipleOf와 정수 타입을 만족합니다. 읽기 전용 number 슬라이더가 격자 지정 없이 시작하며 선택 범위 안의 저장 값이 있으면 그 접근성 값을 그대로 표시합니다. 렌더링만으로 저장 값을 바꾸지 않으며 유효한 조작 값이 없는 격자는 아무 값도 저장하지 않습니다. 양쪽에 inclusive·exclusive가 함께 있으면 더 엄격한 경계가 이깁니다. 한쪽에 둘 다 없을 때만 기본 경계 0·100을 사용합니다.

multipleOf가 있으면 0을 anchor로 하는 정확한 십진 배수 격자를 사용합니다. 정수 타입은 그 격자와 정수의 교집합입니다. 첫 허용 값과 마지막 허용 값이 track 경계이며 Home·End가 이 값을 저장합니다.

multipleOf가 없는 number는 하한을 anchor로 기본 step 1을 적용합니다. inclusive 하한·상한은 원래 값 그대로 유지하며 Home·End가 저장합니다. exclusive 하한은 anchor 자체를 제외하여 Home이 한 step 뒤에서 시작합니다. 구간이 기본 step보다 좁으면 유효한 inclusive 상한을 유일한 stop으로 유지합니다. exclusive 상한에서는 anchor에서 step으로 도달하는 값 중 상한보다 작은 마지막 값을 End가 저장합니다. integer는 경계 안의 정수만 선택합니다.

Arrow·PageUp·PageDown·Shift+Arrow는 저장 값이 미설정·격자 밖·경계 밖인 경우도 같은 격자 안으로 이동합니다. Page와 Shift는 열 step입니다. 십진 지수 표기의 작은 step도 십진 정수 연산으로 처리합니다. lazy 생략은 commit에서, false는 이동에서 저장하며 같은 완료 조작의 결과는 같습니다. 모바일 범위는 양끝에 같은 규칙을 적용합니다.

모바일의 marks가 있으면 스키마에 유효한 표시 stop의 기존 탐색을 유지합니다. multipleOf가 없는 number의 표시 stop은 기본 step에 맞추어 변경하지 않습니다.

Number.MAX_SAFE_INTEGER에 이르는 track의 pointer 정밀도는 라이브러리의 부동소수점 좌표 한계이며 보장 범위 밖입니다.

## Acceptance Criteria

### control-names — 레이아웃과 무관한 입력 이름

- 입력 정의에서 파생한 표는 각 정의의 primary·range-end·auxiliary 분류를 요구합니다.
- 네 레이아웃에서 이름·소속·고유 id·참조 대상을 검사하며 새 정의가 미분류이면 실패합니다.

### slider-values — 모든 조작의 유효 값

일반 로컬 실행과 pre-release는 전체 교차 범위를 실행합니다. PR은 224개 스키마 조합과 타입·step·양끝 경계·다섯 시작 상태·모든 조작 분류의 쌍을 유지하며, 두 lazy 모드는 선택한 각 입력에서 같은 단언으로 비교합니다.

- 독립 십진 참조 모델에서 경계 조합·multipleOf·타입·시작 값·키와 pointer·lazy를 교차하여 저장 값과 schema 유효성을 비교합니다.
- 미설정 표시·렌더 시 값 보존·commit 시점 및 기존 소수 경계 동작을 유지합니다.

## Last Updated

입력 바인딩·식별자 또는 부품 소유권의 경계가 바뀔 때 갱신합니다.
