# math — 순수 수학·통계 유틸리티

## Purpose

정수·실수를 다루는 부작용 없는 수학 프리미티브(산술 비교, 조합론, 배열 통계, 진법 변환, 부동소수점 근접 비교)를 함수당 1파일의 flat 컬렉션으로 소유한다. 여러 공개 함수가 공유하는 순수 헬퍼(예: 소수 자릿수 계산)는 organ에 감추고 엔트리 포인트에 노출하지 않는다.

## Conventions

- 오류 처리 정책은 함수군마다 다르다: 정수 전제 함수(`factorial`/`combination`/`permutation`/`digitSum`/`fromBase`/`toBase`)는 계약 위반 시 `Error`를 던지고, 비교·통계 함수(`clamp`/`inRange`/`min`/`max` 등)는 입력을 검증하지 않고 조용히 계산한다 — 새 함수는 이웃 함수군의 정책을 따른다.
- 정밀도가 계약인 함수(`round`/`gcd`/`lcm`)는 배정밀도 곱셈 대신 지수 표기 조작이나 소수 자릿수 스케일링으로 부동소수점 오차를 피한다.

## Boundaries

### Always do

- 소수 자릿수 계산이 필요한 새 함수는 organ의 `countDecimals`를 재사용한다 — 로직을 복제하지 않는다
- `round`/`gcd`/`lcm`처럼 정밀도가 계약인 함수를 수정하면 지수 표기 입력(예: `1e-7`)으로도 회귀 여부를 확인한다

### Ask first

- 기존 함수의 오류 처리 정책(throw vs 조용한 계산) 전환
- `min`/`max`의 NaN 위치 의존 동작, `isClose`의 오차 공식 등 문서화된 특수값 계약 변경

### Never do

- 함수 시그니처를 바꿔 기존 소비자의 인자 순서·타입을 깨는 변경
- organ의 내부 헬퍼를 fractal 외부로 노출
