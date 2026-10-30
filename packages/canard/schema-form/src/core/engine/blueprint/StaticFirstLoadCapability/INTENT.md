# StaticFirstLoadCapability

## Purpose

청사진 생성 때 고정한 정적 첫 로드 자격을 재분석 없이 읽는다.

## Conventions

- 완료된 분석의 내부 Blueprint 고정 boolean 사실을 읽는다.
- 노드의 필드나 공개 패키지 표면은 늘리지 않는다.

## Boundaries

### Always do

- 생성 사실은 모드 초기화와 분리한다.
- 등록되지 않은 청사진의 자격 조회는 false를 반환한다.

### Ask first

- 자격 등록과 조회의 의미 또는 메모 수명을 바꿀 때

### Never do

- 조회할 때 선언 그래프를 다시 스캔하지 않는다.
- 살아 있는 폼 상태로 분석 증거를 대체하지 않는다.
