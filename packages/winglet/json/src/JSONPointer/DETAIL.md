# JSONPointer contract

## Requirements

- RFC 6901 포인터 구문(빈 문자열 루트, `#` fragment 루트, `/` 구분자)을 해석하는 공통 기반을 제공한다.
- 포인터 기반 연산은 예약 멤버 이름(`__proto__`, `constructor`, `prototype`)을 불투명한 문자열, 즉 own 데이터 속성으로 취급한다. 읽기는 own이 아니면 `undefined`이고, 쓰기는 own 데이터 속성을 만들며, 어떤 경로에서도 상속 객체는 변경되지 않는다.
- 하위 연산 fractal(값 조작, 이스케이프, 패치, 경로 변환)의 공개 표면을 entry point에서 단일 표면으로 재수출한다.

## API Contracts

- `JSONPointer` 상수는 `Root`(빈 문자열), `Fragment`(`#`), `Separator`(슬래시)를 제공하며 값은 RFC 6901 §5–6과 일치한다. 이 값들은 하위 호환 대상이다.
- 예약 멤버 접근 판별과 특수 경로는 `@winglet/common-utils`의 데이터 속성 프리미티브(`isReservedName` 판별자 포함)가 한 벌로 소유한다. 성능 임계의 최경량 순회 루프는 동일 판정의 인라인 분기를 가질 수 있으나, 예약 멤버 **접근**은 언제나 프리미티브를 경유하고 판정 동일성은 정합 스위트(RC-5)가 고정한다.
- 세 공개 쓰기 API(`setValue`, `applyPatch`, `mergePatch`)는 예약 멤버를 자기 데이터로 다루고 프로토타입을 보존합니다. `applyPatch`는 중간 컨테이너의 존재를 요구하고 `setValue`는 누락된 컨테이너를 생성하므로 같은 경로의 성공 여부가 다를 수 있습니다.

## Acceptance Criteria

### reserved-data — 예약 멤버 own 데이터 취급

- 예약 멤버 키를 담은 입력이 세 쓰기 API 각각에서 own 데이터 속성으로 기록되고, 반환 문서의 프로토타입은 교체되지 않는다.
- 성공한 쓰기는 예약 멤버를 자기 데이터로 기록하고 프로토타입을 보존합니다. 중간 경로의 존재·생성 정책 차이는 각 API의 계약을 따릅니다.
- 전역 `Object.prototype`이 오염되지 않는다.

### root-pointer — 루트 포인터 의미론

- 빈 문자열과 `#`는 문서 전체를 가리키고, 단독 `/`는 빈 문자열 키를 가리킨다.

## Boundary Exemptions

### `enum.ts` — 포인터 문법 상수 root peer 유지

- **Consumers**: 하위 연산 fractal 전반과 `entry-point`
- **Direct import**: `allowed`
- **Reason**: RFC 6901 문법 상수는 이 fractal 전체가 공유하는 원자 단위다. 배럴 경유를 강제하면 상수 하나에 재수출 그래프 전체가 딸려온다 — 개별 파일 직접 import와 root peer 배치가 의도된 형태다.


## Last Updated

포인터 문법 또는 예약 멤버 접근 계약이 바뀌면 갱신합니다.
