# StaticFirstLoadCapability

## Purpose

청사진 identity에 연결된 정적 첫 로드 자격을 약한 sidecar로 보관한다.

## Conventions

- 완료된 분석 증거를 boolean 하나로 등록한다.
- 공개 Blueprint의 필드나 shape를 늘리지 않는다.

## Boundaries

### Always do

- 청사진 identity를 약한 키로 사용한다.
- 등록되지 않은 청사진의 자격 조회는 false를 반환한다.

### Ask first

- 자격 등록과 조회의 의미 또는 메모 수명을 바꿀 때

### Never do

- 조회할 때 선언 그래프를 다시 스캔하지 않는다.
- 살아 있는 폼 상태로 분석 증거를 대체하지 않는다.
