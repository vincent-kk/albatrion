# difference — RFC 7396 병합 패치 생성

## Purpose

두 JSON 값을 비교해 RFC 7396 JSON Merge Patch 문서를 생성하는 연산을 소유한다. 생성한 병합 패치를 실제로 적용하는 것은 소유하지 않는다 — 형제 fractal `mergePatch`의 책임이다.

## Conventions

- 결과는 JSON Pointer 경로 목록이 아니라 병합 패치 문서다 — 키에 `/`나 `~`가 있어도 이스케이프하지 않고 그대로 둔다.
- 예약 멤버 이름(`__proto__`,`constructor`,`prototype`)은 source·target 양쪽에서 건너뛴다 — 병합 패치에 own 데이터로도 삭제 표시로도 나타나지 않는다. `mergePatch`·`applyPatch`가 따르는 own 데이터 재현 계약과는 다른, 이 fractal만의 선택이다.
- 배열은 항상 값 전체로 교체한다 — 원소 단위 병합은 하지 않는다.

## Boundaries

### Always do

- 예약 멤버를 건너뛸 때 소스·타깃 키 개수가 우연히 같아지는 경우에도 "변경 없음" 조기 종료를 적용하지 않는다
- 병합 패치 생성 규칙을 바꿀 때 RFC 7396 Appendix A 예제와의 정합 여부를 DETAIL.md에 명시한다

### Ask first

- 예약 멤버를 건너뛰는 대신 own 데이터로 포함하는 쪽으로 바꾸는 변경(형제 fractal과의 비대칭 제거)
- 배열을 원소 단위로 병합하는 최적화 도입

### Never do

- `differenceObjectPatch`를 entry point에 노출
- 결과 병합 패치 키에 RFC 6901 이스케이프(`~0`,`~1`)를 적용
