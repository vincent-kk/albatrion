# object — React 컴포넌트 딕셔너리 필터링

## Purpose

문자열 키 딕셔너리에서 React 컴포넌트로 판별되는 값만 남겨 새 객체를 만드는 단일 유닛을 소유한다. 컴포넌트 판별 로직은 소유하지 않는다 — filter 형제 fractal의 엔트리 포인트를 경유해 재사용한다.

## Boundaries

### Always do

- 컴포넌트 판별은 filter 형제 fractal의 엔트리 포인트(`isReactComponent`)만 재사용하고 판별 조건을 복제하지 않는다
- 판별 기준이나 반환 형태를 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- 함수 시그니처 확장(커스텀 판별자 주입 등 옵션 추가)
- 반환 타입이 입력 딕셔너리의 부분집합 형태를 벗어나는 변경

### Never do

- 입력 딕셔너리를 직접 변형(mutate)하는 경로 추가
- filter 형제 fractal을 거치지 않고 컴포넌트 판별 조건을 이 fractal 안에 재구현
