# formTypeDefinitions

## Requirements

사용자나 플러그인 입력 정의가 없을 때 스키마에 맞는 기본 입력을 선택합니다.

## API Contracts

- 기본 배열 입력은 값 전달과 목록 표시를 별도 memo 경계로 나눕니다. node·자식 컴포넌트 배열 identity·자식 수·readOnly·disabled·jsonSchema·style이 같으면 값만 바뀐 부모 렌더에서 행과 버튼을 재생성하지 않습니다. 구조·제어·스키마·스타일 변경과 각 자식의 독립 구독은 반영합니다. 잎 갱신의 목록 작업은 O(N)에서 O(1) 속성 비교로 줄고 배열 입력당 React memo fiber와 직전 속성 객체를 보유합니다(86C-02 iv).

- 정의 배열의 앞쪽이 먼저 매칭되며 구체적인 형식 조건이 일반 타입 조건보다 우선합니다.
- 매칭 조건은 입력 힌트만 판정하고 실제 입력은 공통 FormTypeInputProps로 값과 변경을 전달합니다.
- 기본 정의는 열한 개이며 `{ type: 'union' }` 정의가 `FormTypeInputString`을 감싸 `FormTypeInputStringDefinition` 바로 앞에서 매칭됩니다. union 전용 우선순위 층을 더하지 않고 인라인·맵·Form·Provider·플러그인·기본 정의의 선택 순서를 유지합니다(REACT-033).
- 기본 union 입력은 `schemaType`과 유효 `jsonSchema.type`의 교집합을 유효 목록으로 삼고, 같은 내부 `interpret`를 글 입력·흐림·목록 변경 시 적용합니다. 결과의 JSON 종류가 목록에 있는 경우에만 보내며 입력기 조합 중에는 보내지 않습니다. 빈 칸은 `undefined`를 보내고, 변환할 수 없는 글은 입력이 초안으로 들다가 흐림에 노드 값 표시로 되돌립니다(REACT-033, LANDING-186).
- union의 `undefined`·nullable `null`은 빈 칸이고 다른 원시 값은 `String(value)`로 표시합니다. 객체·배열은 값 참조로 메모한 읽기 전용 표시이며 문자열화 실패는 무효 표지로 나타냅니다. `typeMismatch`가 참이면 `aria-invalid`와 무효 표지를 붙이며, 기본 입력은 객체·배열을 생성하거나 편집하지 않습니다(REACT-033).
- 수 입력은 빈 칸을 `undefined`로 전달합니다. 브라우저 `badInput`이면 노드에 쓰지 않고 입력이 초안을 보유하며, 흐림에는 마지막 노드 값으로 표시를 되돌립니다. 체크박스는 불리언 아닌 값을 미정 상태(`indeterminate`)로 표시합니다. 치다 만 글과 입력기 조합은 노드가 아닌 입력의 초안입니다(REACT-027).

## Acceptance Criteria

### form-type-definitions-contract — 관찰 가능한 동작

- 특수 형식에 맞는 입력이 일반 문자열·숫자 입력에 가려지지 않습니다.
- 조건 판정은 부수 효과를 만들거나 외부 UI 라이브러리 등록을 수행하지 않습니다.
- union은 유효 목록으로 해석한 허용 값만 보내고 조합 중에는 쓰지 않습니다. 수 입력의 빈 칸·badInput·흐림 복귀와 불리언 아닌 체크박스의 미정 표시가 노드 값과 초안을 구별합니다(REACT-027·033).

## Last Updated

계약 기준: REACT-027·033, LANDING-186.
