# mergePatch contract

## Requirements

- RFC 7396에 따라 merge patch 문서를 소스에 적용한 결과를 반환한다.
- 예약 멤버 이름을 데이터 키로 병합하지 않고 모든 깊이에서 건너뛴다.
- 기본 동작은 불변(immutable): 소스와 패치를 복제한 뒤 병합한다.

## API Contracts

- `mergePatch(source, mergePatchBody, immutable = true)`:
  - mergePatchBody가 undefined면 source를 그대로 반환한다.
  - mergePatchBody가 plain object가 아니면(null, 배열 포함) 그 값이 결과다 — 완전 치환. immutable이면서 배열 등 객체 타입이면 복제본을 반환해 호출자와 참조를 공유하지 않는다.
  - source가 plain object가 아니면 빈 객체에서 시작한다.
  - 패치의 null 값 키는 결과에서 삭제된다.
  - `__proto__`, `constructor`, `prototype` 키는 어떤 깊이에서도 병합되지 않는다(silent skip). 이 세 키를 제외한 나머지 키의 RFC 7396 동작은 불변이다.
  - 패치의 상속 속성은 병합하지 않는다(자기 소유 검사).
- immutable이 false면 source가 제자리에서 수정되어 반환값과 동일 참조다.

## Acceptance Criteria

### rfc7396 — RFC 7396 기본 의미론

- 비객체 패치는 완전 치환되고, null은 키를 삭제하며, 중첩 객체는 재귀 병합된다.

### reserved-member — 예약 멤버 병합 제외

- 최상위와 중첩 깊이 모두에서 예약 멤버 키가 결과에 나타나지 않는다.
- 전역 Object prototype 오염이 발생하지 않는다.
- 예약 멤버를 제외한 나머지 키는 정상 병합된다.

### immutability — 불변 기본값

- 기본 호출에서 소스 객체는 변경되지 않는다.
- immutable이 false면 소스가 제자리 수정된다.

## History

- 2026-08-18 — 예약 멤버 제외를 모든 깊이에 적용(이전에는 데이터 키로 병합되었다). 예약 멤버를 데이터 키로 전달하던 호출자는 이제 해당 키가 조용히 건너뛰어진다.

## Last Updated

2026-08-18 — 예약 멤버 병합 제외 계약 추가
