# manipulator contract

## Requirements

- `getValue`는 포인터가 가리키는 위치의 값을 반환한다. 일반 키 읽기에는 필터가 없으므로 프로토타입 체인의 상속 속성도 반환될 수 있으나, 예약 멤버 세그먼트(`__proto__`, `constructor`, `prototype`)는 own 데이터 속성만 읽고 own이 아니면 `undefined`다.
- `setValue`는 포인터 경로를 따라 값을 설정하며, 필요한 중간 컨테이너를 자동 생성한다. 예약 멤버 세그먼트는 own 데이터 속성으로 기록되며 대상의 프로토타입은 변하지 않는다.
- 어떤 경로에서도 `Object.prototype`을 포함한 상속 객체는 변경되지 않는다.

## API Contracts

- 세그먼트 순회의 읽기·쓰기·삭제는 `@winglet/common-utils`의 데이터 속성 프리미티브(`getDataProperty`/`setDataProperty`/`deleteDataProperty`)를 경유한다. 예약 멤버 세그먼트도 일반 키와 동일하게 경로로 순회·기록된다 — 건너뛰지도, 예외를 던지지도 않는다.
- 예약 멤버 세그먼트의 중간 경로 자동 생성도 own 데이터 속성으로 이루어진다(`/__proto__/x` 쓰기는 own `__proto__` 데이터 컨테이너를 만든다).
- 배열 컨텍스트의 `-` 세그먼트는 append로 해석된다(RFC 6901 §4). 자동 생성 판단보다 먼저 해석되므로 배열에 문자 그대로의 `-` 키가 생기지 않는다.
- overwrite가 false면 이미 존재하는 자기 소유 키를 덮어쓰지 않는다.
- preserveNull이 true면 중간 경로의 null을 컨테이너로 대체하지 않고 원본을 반환한다.
- 설정 값이 undefined면 해당 키를 삭제한다(own 속성만 — `delete` 의미론).
- 쓰기 경로의 키 존재 판정은 자기 소유 검사(hasOwnProperty)로 수행된다. 일반 키 읽기 경로에는 자기 소유 검사가 없다.

## Acceptance Criteria

### reserved-data-segment — 예약 멤버 세그먼트 own 데이터 취급

- 경로의 어느 깊이에서든 예약 멤버 세그먼트는 own 데이터 속성으로 읽히고 기록된다. 쓰기 후 대상의 프로토타입은 교체되지 않고, own이 아닌 예약 멤버 읽기는 `undefined`다.
- 전역 Object prototype이 오염되지 않는다.

### array-append — 배열 append 별칭

- 배열 컨텍스트의 `-` 세그먼트는 배열 끝 추가로 동작한다.

### intermediate-creation — 중간 경로 자동 생성

- 존재하지 않는 중간 경로는 다음 세그먼트 형태에 따라 배열 또는 객체로 생성된다.

## History

- 2026-08-18 — 예약 멤버 세그먼트 의미론을 "순회 중단 후 원본 반환(silent skip)"에서 RFC 정합 own 데이터 기록으로 전환. 판별·접근은 `@winglet/common-utils` 데이터 속성 프리미티브로 수렴. skip에 의존하던 호출자는 이제 예약 멤버 키가 own 데이터로 기록되는 것을 관측한다.
- 2026-08-18 — 초판이 공표한 무변경 보증과 읽기 경로 자기 소유 필터가 구현보다 강한 계약이어서 cross-review에서 반증됨(CTR-002·CTR-003). 계약을 실제 의미론으로 정정. 이후 위 전환으로 예약 멤버에 한해 읽기 own 필터가 계약이 되었다.

## Last Updated

2026-08-18 — 예약 멤버 세그먼트를 own 데이터 취급으로 전환(RFC 정합)
