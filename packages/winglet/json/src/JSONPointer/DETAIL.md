# JSONPointer contract

## Requirements

- RFC 6901 포인터 구문(빈 문자열 루트, `#` fragment 루트, `/` 구분자)을 해석하는 공통 기반을 제공한다.
- 포인터 기반 연산은 예약 멤버 이름(`__proto__`, `constructor`, `prototype`)을 불투명한 문자열, 즉 own 데이터 속성으로 취급한다. 읽기는 own이 아니면 `undefined`이고, 쓰기는 own 데이터 속성을 만들며, 어떤 경로에서도 상속 객체는 변경되지 않는다.
- 하위 연산 fractal(값 조작, 이스케이프, 패치, 경로 변환)의 공개 표면을 entry point에서 단일 표면으로 재수출한다.

## API Contracts

- `JSONPointer` 상수는 `Root`(빈 문자열), `Fragment`(`#`), `Separator`(슬래시)를 제공하며 값은 RFC 6901 §5–6과 일치한다. 이 값들은 하위 호환 대상이다.
- 예약 멤버 접근 판별과 특수 경로는 `@winglet/common-utils`의 데이터 속성 프리미티브(`isReservedName` 판별자 포함)가 한 벌로 소유한다. 성능 임계의 최경량 순회 루프는 동일 판정의 인라인 분기를 가질 수 있으나, 예약 멤버 **접근**은 언제나 프리미티브를 경유하고 판정 동일성은 정합 스위트(RC-5)가 고정한다.
- 세 공개 쓰기 API(`setValue`, `applyPatch`, `mergePatch`)는 동일한 예약 멤버 입력에 대해 서로 정합하는 관측 결과를 낸다 — 하나만 조용히 무시하거나 하나만 예외를 던지지 않는다.

## Acceptance Criteria

### reserved-data — 예약 멤버 own 데이터 취급

- 예약 멤버 키를 담은 입력이 세 쓰기 API 각각에서 own 데이터 속성으로 기록되고, 반환 문서의 프로토타입은 교체되지 않는다.
- 세 API의 관측 결과(own 키 집합, 값, 프로토타입, 에러 유무)가 서로 정합한다.
- 전역 `Object.prototype`이 오염되지 않는다.

### root-pointer — 루트 포인터 의미론

- 빈 문자열과 `#`는 문서 전체를 가리키고, 단독 `/`는 빈 문자열 키를 가리킨다.

## History

- 2026-08-18 — 예약 멤버 의미론을 "차단(silent skip / throw)"에서 RFC 정합 own 데이터 취급으로 전환. 판별·접근을 `@winglet/common-utils` 데이터 속성 프리미티브 한 벌로 수렴시키면서 패키지 내부 판별자 `isForbiddenKey`와 `isPrototypeModification`은 소비자가 사라져 제거했다. 근거: RFC 6901/6902/7396이 멤버 이름을 불투명 문자열로 규정하고, `JSON.parse`가 이미 own `__proto__` 데이터 속성을 만든다.
- 2026-08-18 — `isForbiddenKey`를 manipulator 내부에서 이 fractal의 utils organ으로 승격(0.13.4). 이후 위 전환으로 같은 날 제거됨.

## Last Updated

2026-08-18 — 예약 멤버 RFC 정합(own 데이터) 계약으로 전환, 세 API 정합 계약 명문화
