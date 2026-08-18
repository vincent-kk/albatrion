# JSONPath — 경로 상수와 변환 유틸

## Purpose

Goessner JSONPath 표기의 특수 문자 상수(`$`,`@`,`.`,`#`)와 경로 변환 유틸 2종을 소유한다: `getJSONPath`는 객체 참조 동일성을 기준으로 루트에서 대상까지의 경로 문자열을 만들고, `convertJsonPathToPointer`는 AJV dataPath 형식 문자열을 RFC 6901 포인터 문자열로 변환한다.

포인터 구문과 예약 멤버 own 데이터 계약은 소유하지 않는다 — JSONPointer 형제 fractal의 책임이다.

## Conventions

- 두 유틸은 서로 역함수가 아니다: `getJSONPath`의 출력은 `$`로 시작하고, `convertJsonPathToPointer`가 기대하는 입력(AJV dataPath)은 `$`가 없다 — 한쪽 출력을 다른 쪽에 그대로 넣는 체이닝을 가정하지 않는다.
- enum.ts는 fractal root에 남는 공개 재수출 대상이다(근거는 DETAIL.md의 Boundary Exemptions).

## Boundaries

### Always do

- 상수 값(`Root`/`Current`/`Child`/`Filter`) 변경은 DETAIL.md 갱신을 동반한다
- `convertJsonPathToPointer`의 포인터 형식 통과 판별 로직을 바꿀 때 멱등성 스위트를 함께 갱신한다

### Ask first

- `getJSONPath` 반환 형식(대괄호·따옴표 표기 규칙 등) 변경
- JSONPointer와의 상호운용(체이닝) API 신설

### Never do

- `getJSONPath`의 방문 노드 추적을 제거해 순환 참조 입력에서 무한 루프를 유발하는 변경
- `convertJsonPathToPointer`에 객체를 인자로 받거나 순회하는 로직을 추가 — 문자열을 받아 문자열을 반환하는 순수 변환만 소유한다
