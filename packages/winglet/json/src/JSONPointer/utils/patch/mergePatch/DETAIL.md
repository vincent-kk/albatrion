# mergePatch contract

## Requirements

- RFC 7396에 따라 merge patch 문서를 소스에 적용한 결과를 반환한다.
- 예약 멤버 이름(`__proto__`, `constructor`, `prototype`)을 불투명한 문자열로 취급해 모든 깊이에서 own 데이터 속성으로 병합한다. 병합 결과의 프로토타입은 교체되지 않고, 상속 객체는 변경되지 않는다.
- 기본 동작은 불변(immutable): 소스와 패치를 복제한 뒤 병합한다.

## API Contracts

- `mergePatch(source, mergePatchBody, immutable = true)`:
  - mergePatchBody가 undefined면 source를 그대로 반환한다.
  - mergePatchBody가 plain object가 아니면(null, 배열 포함) 그 값이 결과다 — 완전 치환. immutable이면서 배열 등 객체 타입이면 복제본을 반환해 호출자와 참조를 공유하지 않는다.
  - source가 plain object가 아니면 빈 객체에서 시작한다.
  - 패치의 null 값 키는 결과에서 삭제된다(own 속성만 — `delete` 의미론. 예약 멤버 키의 null도 own 데이터만 제거하고 상속 멤버는 건드리지 않는다).
  - 예약 멤버 키는 어떤 깊이에서도 own 데이터 속성으로 병합된다. 읽기·쓰기는 `@winglet/common-utils` 데이터 속성 프리미티브를 경유해 프로토타입 체인과 접촉하지 않는다. 예약 멤버가 아닌 키의 RFC 7396 동작은 불변이다.
  - 패치의 상속 속성은 병합하지 않는다(자기 소유 검사).
- immutable이 false면 source가 제자리에서 수정되어 반환값과 동일 참조다.

## Acceptance Criteria

### rfc7396 — RFC 7396 기본 의미론

- 비객체 패치는 완전 치환되고, null은 키를 삭제하며, 중첩 객체는 재귀 병합된다.

### reserved-member — 예약 멤버 own 데이터 병합

- 최상위와 중첩 깊이 모두에서 예약 멤버 키가 own 데이터 속성으로 결과에 나타나고, 형제 키는 소실되지 않는다.
- 반환 문서의 프로토타입이 교체되지 않고, 전역 Object prototype 오염이 발생하지 않는다.
- 예약 멤버를 제외한 나머지 키는 정상 병합된다.

### immutability — 불변 기본값

- 기본 호출에서 소스 객체는 변경되지 않는다.
- immutable이 false면 소스가 제자리 수정된다.

## History

- 2026-08-18 — 예약 멤버 의미론을 "모든 깊이에서 병합 제외(silent skip)"에서 RFC 7396 정합 own 데이터 병합으로 전환. 무오염 불변식은 그대로 유지된다 — 바뀐 것은 예약 멤버 키가 결과 문서에 데이터로 나타난다는 점이다. skip에 의존하던 호출자는 결과에서 예약 멤버 own 키를 관측하게 된다.
- 2026-08-18 — 예약 멤버 제외를 모든 깊이에 적용(0.13.4 — 이전에는 데이터 키로 병합되었다). 같은 날 위 전환으로 대체됨.

## Last Updated

2026-08-18 — 예약 멤버 own 데이터 병합 계약으로 전환(RFC 정합)
