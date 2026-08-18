# react-utils — React 유틸리티 패키지 루트

## Purpose

React 훅, DOM 위치 재배치를 위한 포털 렌더링 시스템, 오류 격리·파일 업로드 HOC, 컴포넌트 타입 판별·렌더 유틸을 하나의 공개 표면으로 통합 소유하는 패키지 최상위 fractal이다. 각 영역의 구현과 계약은 하위 organ 또는 fractal이 소유하며, 이 fractal은 그것을 이름 지정 재수출로 집계하는 경계 책임만 진다.

패키지 매니페스트는 루트 진입점과 별개로 하위 organ·fractal마다 독립 entry(subpath export)를 선언한다 — 전체 표면이 필요한 소비자는 루트를, tree-shaking이 필요한 소비자는 해당 subpath를 사용한다.

## Boundaries

### Always do

- 새 하위 organ/fractal의 공개 심볼은 루트 배럴에 이름 지정으로만 재수출한다 — 와일드카드 재수출을 쓰지 않는다
- 하위 계약(개별 훅·HOC·컴포넌트 동작)은 해당 하위 문서 또는 구현이 정본이며 이 문서에서 재정의하지 않는다

### Ask first

- 패키지 매니페스트 exports 필드에 새 subpath entry를 추가하거나 제거하는 변경
- 루트에 재수출이 아닌 구현 로직을 직접 추가하는 변경

### Never do

- 하위 fractal의 엔트리 포인트를 우회해 그 내부 파일을 루트에서 직접 import하는 코드 추가
- 루트 index.ts에 `export *` 형태의 와일드카드 재수출 추가
