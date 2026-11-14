# fieldInputs

## Requirements

기본 입력은 사용자 정의가 없는 폼의 편집 수단이며, 스키마 검증이나 값 수리를 대신하지 않습니다.

## API Contracts

- 입력 선택의 전체 우선순위와 수명은 [FieldInputBridge 계약](../components/FieldProxy/components/FieldInputBridge/DETAIL.md)에 둡니다. 이곳은 기본 정의 사이의 우선순위와 표현 정책을 소유합니다.
- 공개 Hint·props·presentation 형은 [types 계약](../types/DETAIL.md), 시험 객체의 실행 의미는 [fieldInputDefinition 계약](../helpers/fieldInputDefinition/DETAIL.md)을 따릅니다. 같은 형과 시험 규칙을 입력마다 다시 정의하지 않습니다.

## Acceptance Criteria

### REACT-027 — 빈 값과 무효 표시를 구별합니다

- 글·수·날짜·union 입력의 빈 칸은 nullable 여부와 관계없이 `undefined`를 보냅니다. 빈 칸을 자동으로 `null`로 바꾸면 투영 전 노드 값과 `omitEmpty: false` 소비자의 의미가 달라집니다. `null`은 그 뜻을 가진 명시적 입력 조작으로만 보냅니다.
- 해석이 필요한 초안은 입력이 소유합니다. 수·날짜의 브라우저 초안과 union의 형 해석은 각 자식 계약에 두어, 미완성 표시를 노드의 새 상태로 추가하지 않습니다.
- 무효 표시는 조작 요소나 선택지 묶음의 `aria-invalid`로 전달하고, 입력이 별도의 오류 문구를 만들지 않습니다. 문구는 폼 오류 렌더러와 소비자가 맡아 중복 진단을 막습니다. 정상 표시로 표현할 수 없는 값의 처리 한계는 각 입력 계약에 남깁니다.

### REACT-033 — union도 기본 폴백을 공유합니다

- 구체적인 정의를 일반 정의보다 앞에 두어 특수 입력이 가려지지 않게 하며, union은 문자열 정의 바로 앞에 둡니다. union 전용 선택 층을 추가하지 않아 사용자 입력의 기존 우선순위를 유지합니다.
- UI 플러그인에 union 정의가 없어도 내장 [union 입력](fieldInputDefinitions/FieldInputUnion/DETAIL.md)을 사용합니다. 같은 초안 규칙을 플러그인마다 복제하지 않으며, 내부 초안 해석기를 패키지 공개 API로 제공하지 않습니다. 별도 UI가 필요하면 공용 바인딩의 공개 경계부터 결정합니다.
- 기본 enum·radio·날짜 정의를 union까지 넓히지 않습니다. 리터럴 선택과 형 해석은 다른 책임이므로, 단일 종류 입력의 표시 규칙을 union에 암묵적으로 적용하지 않습니다.

### CONTROLS-083 — 잠금의 표현과 쓰기 차단을 구별합니다

- 입력은 전달된 readOnly·disabled의 표현을 맡으며, 모든 입력 쓰기를 거부하는 경계는 FieldInputBridge입니다. 네이티브 속성만으로 같은 차단을 보장한다고 가정하면 사용자 정의 입력이나 체크박스 계열에서 잠금이 새어 나갈 수 있습니다.

### form-type-definitions-contract — 기본 정의의 변경 범위

- 시험 함수는 부수 효과를 만들지 않으며, 기본 정의에 외부 UI 라이브러리를 등록하지 않습니다. 폴백 선택만으로 전역 설정이나 값이 달라지는 일을 막습니다.

## Last Updated

기본 정의의 우선순위·공통 값 정책·표현 책임이나 union 폴백의 공개 경계가 바뀔 때 갱신합니다.
