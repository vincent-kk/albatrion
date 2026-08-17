# JSONPointer contract

## Requirements

- RFC 6901 포인터 구문(빈 문자열 루트, `#` fragment 루트, `/` 구분자)을 해석하는 공통 기반을 제공한다.
- 포인터 기반 쓰기 연산은 예약 멤버 이름(`__proto__`, `constructor`, `prototype`)을 데이터 키로 취급하지 않고 건너뛴다.
- 하위 연산 fractal(값 조작, 이스케이프, 패치, 경로 변환)의 공개 표면을 entry point에서 단일 표면으로 재수출한다.

## API Contracts

- `JSONPointer` 상수는 `Root`(빈 문자열), `Fragment`(`#`), `Separator`(슬래시)를 제공하며 값은 RFC 6901 §5–6과 일치한다. 이 값들은 하위 호환 대상이다.
- `isForbiddenKey(key)`는 예약 멤버 이름 세 가지에 대해서만 true를 반환한다. 오탐 없이 정확히 세 문자열만 차단하는 것이 계약이다.
- 쓰기 계열의 예약 멤버 처리 의미론은 무시(silent skip)다 — 예외를 던지지 않으며, 해당 키에 한해 대상 구조가 변경되지 않는다.

## Acceptance Criteria

### forbidden-key — 예약 멤버 판별

- `__proto__`, `constructor`, `prototype` 각각에 대해 `isForbiddenKey`가 true를 반환한다.
- 그 외 임의 문자열(빈 문자열, 유사 접두 문자열 포함)에 대해 false를 반환한다.

### root-pointer — 루트 포인터 의미론

- 빈 문자열과 `#`는 문서 전체를 가리키고, 단독 `/`는 빈 문자열 키를 가리킨다.

## History

- 2026-08-18 — `isForbiddenKey`를 manipulator 내부에서 이 fractal의 utils organ으로 승격. manipulator와 mergePatch 두 소비자의 최저 공통 fractal이 여기이기 때문이며, 패키지 공개 표면은 변하지 않았다.

## Last Updated

2026-08-18 — 예약 멤버 판별자 공유 계약 명문화 (merge patch 예약 멤버 처리 적용에 따름)
