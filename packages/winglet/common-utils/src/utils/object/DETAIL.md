# object contract

## Requirements

- 예약 멤버 이름(`__proto__`, `constructor`, `prototype`)을 불투명한 문자열, 즉 own 데이터 속성으로 취급하는 접근 프리미티브를 제공한다.
- 어떤 프리미티브 호출에서도 대상 객체의 프로토타입과 상속 객체(`Object.prototype` 포함)는 변경되지 않는다.
- 예약 멤버가 아닌 키에 대해서는 일반 프로퍼티 접근과 동일하게 동작하고, 배열 인덱스 접근을 방해하지 않는다.
- `cloneLite`는 own `__proto__` 키를 가진 입력의 클론에서 모든 own 키를 보존하고, 클론의 프로토타입은 입력의 프로토타입과 동일하다.

## API Contracts

- `isReservedName(key)`:
  - 예약 멤버 이름 세 가지에 대해서만 true를 반환한다. 오탐 없이 정확히 세 문자열만 판별하는 것이 계약이다.
  - 성능 민감 순회 루프가 "예약 멤버일 때만 프리미티브 경유" 분기를 만들 때 쓰는 공유 판별자다 — 소비자는 판별을 복제하지 않고 이것을 재사용한다.
- `getDataProperty(target, key)`:
  - key가 예약 멤버면 own 속성일 때만 그 값을 반환하고, own이 아니면 프로토타입 체인을 탐색하지 않고 `undefined`를 반환한다.
  - key가 예약 멤버가 아니면 `target[key]` 일반 접근과 동일하다.
- `setDataProperty(target, key, value)`:
  - key가 예약 멤버면 `__proto__` setter를 트리거하지 않고 열거 가능·쓰기 가능·구성 가능한 own 데이터 속성을 만든다. 대상의 프로토타입은 변하지 않는다.
  - key가 예약 멤버가 아니면 `target[key] = value` 일반 대입과 동일하다.
- `deleteDataProperty(target, key)`:
  - own 속성만 제거한다(JS `delete` 의미론). 예약 멤버 key로 호출해도 프로토타입 체인의 속성은 제거되지 않으며, 반환값은 `delete` 연산 결과와 같다.
- `cloneLite(target, maxDepth?)`:
  - own `__proto__` 키는 데이터 속성으로 복제된다 — 프로토타입 대입이 아니다.
  - `maxDepth`, 희소 배열, 중첩 구조, 비지원 타입 참조 반환 동작은 기존 계약 그대로다.
  - 일반 키 경로의 성능이 존재 이유다: 예약 멤버 분기는 키가 `__proto__`일 때만 발생한다.

## Acceptance Criteria

### reserved-primitives — 예약 멤버 접근 프리미티브 (RC-7)

- 예약 멤버 3종 × (읽기·쓰기·삭제) × (own 있음·없음) 전 조합에서 own 데이터 속성 의미론을 지킨다.
- 읽기는 체인으로 넘어가지 않고, 쓰기는 대상 프로토타입을 바꾸지 않으며, `Object.prototype`은 오염되지 않는다.
- 일반 키와 배열 인덱스는 일반 접근과 동일하게 동작한다.

### clone-lite-reserved — cloneLite 예약 멤버 정합 (RC-4 단위)

- own `__proto__`를 가진 입력의 클론이 모든 own 키를 보존하고 프로토타입이 입력과 동일하다.
- 기존 cloneLite 스위트(깊이 제한, 희소 배열, 중첩)가 전량 통과한다.
- 일반 키 경로 bench에 유의미한 회귀가 없다.

## History

- 2026-08-18 — 예약 멤버 접근 프리미티브 신설 및 cloneLite own `__proto__` 보존 계약 채택. 이전 cloneLite는 own `__proto__`를 프로토타입 대입으로 처리해 형제 키를 소실시켰다(`@winglet/json` mergePatch RC-4의 원인). RFC 6901/6902/7396이 멤버 이름을 불투명 문자열로 규정하는 것과 `JSON.parse`가 own `__proto__` 데이터 속성을 만드는 플랫폼 동작에 정합시켰다.

## Last Updated

2026-08-18 — 예약 멤버 접근 프리미티브(C-1)·cloneLite 정합(C-2) 계약 신설
