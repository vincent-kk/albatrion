# hoc — HOC 재수출 진입점

## Purpose

react-utils가 공개하는 Higher-Order Component 표면을 단일 진입점으로 집계하는 재수출 경계다. 오류 경계 HOC 쌍과 파일 업로드 HOC는 각각 독립된 하위 fractal이 구현과 계약을 소유하며, 이 fractal은 그 계약을 재정의하지 않고 이름 지정 재수출만 수행한다.

## Boundaries

### Always do

- 하위 fractal이 공개하는 심볼만 이름 지정으로 재수출한다 — 와일드카드 재수출을 쓰지 않는다
- 새 HOC를 추가할 때는 먼저 독립된 하위 fractal로 만들고 이 진입점에서 재수출한다

### Ask first

- 재수출이 아닌 로직(어댑터, 변환 등)을 이 진입점에 추가하는 변경
- 하위 fractal의 공개 심볼 이름이 바뀔 때 이 진입점의 재수출 범위 조정

### Never do

- 하위 fractal의 구현 파일을 이 디렉터리에 직접 추가해 재수출을 우회
- 하위 fractal의 계약(예: fallback 의미론, 업로드 트리거 동작)을 이 문서에 복제
