# manipulator contract

## Requirements

- `getValue`는 포인터가 가리키는 위치의 자기 소유 값을 반환한다.
- `setValue`는 포인터 경로를 따라 값을 설정하며, 필요한 중간 컨테이너를 자동 생성한다.
- 쓰기 경로에서 예약 멤버 이름 세그먼트를 만나면 어떤 변경도 없이 입력 객체를 그대로 반환한다.

## API Contracts

- 쓰기 연산의 세그먼트 순회는 예약 멤버 검사(`isForbiddenKey`)를 컨테이너 자동 생성보다 먼저 수행한다 — 예약 멤버 경로로는 중간 컨테이너조차 생성되지 않는다.
- 배열 컨텍스트의 `-` 세그먼트는 append로 해석된다(RFC 6901 §4). 자동 생성 판단보다 먼저 해석되므로 배열에 문자 그대로의 `-` 키가 생기지 않는다.
- overwrite가 false면 이미 존재하는 자기 소유 키를 덮어쓰지 않는다.
- preserveNull이 true면 중간 경로의 null을 컨테이너로 대체하지 않고 원본을 반환한다.
- 설정 값이 undefined면 해당 키를 삭제한다.
- 상속 속성은 읽기·쓰기 모두에서 자기 소유 검사(hasOwnProperty)로 걸러진다.

## Acceptance Criteria

### forbidden-segment — 예약 멤버 세그먼트 거부

- 경로의 어느 깊이에서든 `__proto__`, `constructor`, `prototype` 세그먼트를 만나면 값이 변경되지 않은 원본이 반환된다.
- 전역 Object prototype이 오염되지 않는다.

### array-append — 배열 append 별칭

- 배열 컨텍스트의 `-` 세그먼트는 배열 끝 추가로 동작한다.

### intermediate-creation — 중간 경로 자동 생성

- 존재하지 않는 중간 경로는 다음 세그먼트 형태에 따라 배열 또는 객체로 생성된다.

## Last Updated

2026-08-18 — 예약 멤버 판별자가 소유 fractal(JSONPointer) 공유 유닛으로 이동한 뒤에도 쓰기 계약이 불변임을 명시
