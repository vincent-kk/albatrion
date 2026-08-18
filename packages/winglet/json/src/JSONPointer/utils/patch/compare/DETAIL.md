# compare contract

## Requirements

- `source`와 `target`을 비교해 `target`으로 변환하는 RFC 6902 연산(add/remove/replace/test) 배열을 반환한다.
- 배열 원소 삭제는 인덱스 역순으로 방출된다 — `applyPatch`가 배열을 앞에서부터 splice하므로, 오름차순 삭제는 뒤 인덱스가 이미 줄어든 배열을 가리키게 만든다.
- `toJSON` 또는 `toJson` 메서드를 가진 값은 비교 전에 그 반환값으로 축소된다. 축소 결과가 객체·배열이면 구조 비교를 계속하고, 스칼라면 값 전체를 교체한다.
- 특수 문자(`/`,`~`)를 포함한 키는 RFC 6901 이스케이프(`~1`,`~0`)를 거쳐 경로에 반영된다.

## API Contracts

- `compare(source, target, options?)`:
  - `options.strict`(기본 false): true면 REPLACE·REMOVE 연산 앞에 원래 값을 담은 TEST 연산을 추가한다. ADD 앞에는 TEST를 추가하지 않는다 — 추가 전 상태를 확인할 대상이 없다.
  - `options.immutable`(기본 true): 패치 값으로 들어가는 객체·배열을 클론한다. false면 `target`의 참조를 그대로 값으로 사용한다.
  - 동일 참조(`source === target`)는 빈 배열을 반환한다. `NaN`끼리는 참조가 달라도 동일로 취급된다.
  - 비배열 컨텍스트에서 기존 키 값이 `undefined`로 바뀌면 REMOVE로 처리된다. 배열 원소가 `undefined`로 바뀌는 것은 일반 값 변경(REPLACE)이다 — 배열은 원소의 위치이지 존재 여부가 아니기 때문이다.
  - `target`에만 있고 값이 `undefined`인 새 키는 ADD를 생성하지 않는다 — 추가해도 결과가 달라지지 않는다.

## Acceptance Criteria

### rfc6902-diff — 기본 diff 생성

- 객체·배열의 추가·삭제·교체가 각각 ADD·REMOVE·REPLACE로 보고되고, 동일 값·동일 참조는 빈 배열을 반환한다.
- 중첩 객체·배열, 타입 불일치(object↔array 등)에서 전체 교체가 올바른 경로로 보고된다.
- 특수 문자 키가 RFC 6901 규칙으로 이스케이프된다.

### strict-test-ops — strict 모드의 TEST 연산

- REPLACE·REMOVE 앞에는 원래 값을 담은 TEST 연산이 선행하고, ADD 앞에는 선행하지 않는다.
- 중첩 구조·배열 원소·타입 불일치 각 경로에서 TEST-REPLACE 또는 TEST-REMOVE 순서가 유지된다.

### immutable-values — immutable 옵션의 참조 처리

- `immutable: true`(기본)에서 패치 값의 객체·배열은 `target`과 다른 참조를 갖는다.
- `immutable: false`에서는 `target`의 원본 참조가 패치 값으로 그대로 쓰인다.
- 두 모드 모두 연산(`op`)·경로(`path`)는 동일하다 — 차이는 참조뿐이다.

### serialization-hook — toJSON/toJson 자동 직렬화

- `toJSON` 또는 `toJson`을 가진 값은 비교 전에 그 반환값으로 대체된다.
- 두 값이 모두 직렬화 훅을 가지면 각각의 반환값끼리 비교된다.

## Boundary Exemptions

### `compareRecursive.ts` — 재귀 코어 root peer 유지

- **Consumers**: `compare.ts`
- **Direct import**: `allowed`
- **Reason**: entry point가 재수출하지 않는 내부 전용 구현이다 — 진입점 `compare`와 재귀 코어는 한 몸의 두 파일이라 organ 재배치는 경로 깊이만 늘리고 경계를 바꾸지 못한다. flat root peer가 의도된 형태다.

## Last Updated

2026-08-18 — 최초 계약 작성
