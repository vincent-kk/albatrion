# manipulator contract

## Requirements

- `getValue`는 포인터가 가리키는 위치의 값을 반환하고, 위치가 없으면 예외 없이 `undefined`를 반환한다. 객체에서는 자신의 멤버를 읽고, 배열에서는 앞에 0이 붙지 않은 정규 인덱스의 자기 요소만 읽습니다. 존재하지 않는 위치에는 상속 멤버와 배열의 `length` 같은 비인덱스 속성이 포함됩니다.
- `setValue`는 포인터 경로를 따라 값을 설정하며, 필요한 중간 컨테이너를 자동 생성한다. 예약 멤버 세그먼트는 own 데이터 속성으로 기록되며 대상의 프로토타입은 변하지 않는다.
- 어떤 경로에서도 `Object.prototype`을 포함한 상속 객체는 변경되지 않는다.

숫자·문자열·불리언 같은 원시 중간값 아래의 쓰기가 실패하면 JSONPointerError의 INVALID_INPUT으로 보고합니다. 사용자 객체의 getter·setter가 던진 예외는 원시 중간값 실패로 바꾸지 않습니다.

## API Contracts

- URI fragment 문자열은 percent escape를 한 번 해제한 뒤 RFC 6901 토큰을 해석합니다. 일반 `/` 포인터의 percent 문자는 그대로 키 데이터입니다. 잘못된 fragment escape는 `INVALID_POINTER_TYPE`으로 실패합니다.
- 배열 포인터는 현재 prefix 형식을 유지합니다. 첫 `''` 또는 `'#'`는 루트 표시이며 실제 키가 아닙니다. 그 이름의 최상위 키는 각각 `['', '']`, `['', '#']` 또는 문자열 `/`, `/#`로 표현합니다.


- 세그먼트 읽기는 `@winglet/common-utils`의 자기 속성 검사 후 수행하며 쓰기·삭제는 데이터 속성 프리미티브를 경유합니다. 예약 멤버 세그먼트도 일반 키와 동일하게 경로로 순회·기록된다 — 건너뛰지도, 예외를 던지지도 않는다.
- 예약 멤버 세그먼트의 중간 경로 자동 생성도 own 데이터 속성으로 이루어진다(`/__proto__/x` 쓰기는 own `__proto__` 데이터 컨테이너를 만든다).
- 배열 컨텍스트의 `-` 세그먼트는 append로 해석된다(RFC 6901 §4). 자동 생성 판단보다 먼저 해석되므로 배열에 문자 그대로의 `-` 키가 생기지 않는다.
- overwrite가 false면 이미 존재하는 자기 소유 키를 덮어쓰지 않는다.
- preserveNull이 true면 중간 경로의 null을 컨테이너로 대체하지 않고 원본을 반환한다.
- 설정 값이 undefined면 해당 키를 삭제한다(own 속성만 — `delete` 의미론).

## Acceptance Criteria

### reserved-data-segment — 예약 멤버 세그먼트 own 데이터 취급

- 경로의 어느 깊이에서든 예약 멤버 세그먼트는 own 데이터 속성으로 읽히고 기록된다. 쓰기 후 대상의 프로토타입은 교체되지 않고, own이 아닌 예약 멤버 읽기는 `undefined`다.
- 전역 Object prototype이 오염되지 않는다.

### array-append — 배열 append 별칭

- 배열 컨텍스트의 `-` 세그먼트는 배열 끝 추가로 동작한다.

### intermediate-creation — 중간 경로 자동 생성

- 존재하지 않는 중간 경로는 다음 세그먼트 형태에 따라 배열 또는 객체로 생성된다.

## Boundary Exemptions

### `getValue.ts` — 단일 함수 직접 import 허용

- **Consumers**: `packages/winglet/json/src/JSONPointer/utils/patch/applyPatch/applySinglePatch.ts`
- **Direct import**: `allowed`
- **Reason**: 배럴 경유 import는 이 fractal의 재수출 그래프 전체를 소비자 번들에 끌어들인다. 단일 함수만 필요한 내부 소비자는 개별 파일을 직접 import하는 것이 의도된 형태다. 같은 이유로 구현 파일은 fractal 루트의 flat 단일 함수 파일로 유지한다.

## Last Updated

manipulator의 공개 경계·입력 해석·반환값 또는 실패 처리 계약이 바뀔 때 갱신합니다.
