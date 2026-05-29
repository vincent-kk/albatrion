# sharedComputedSentinel

## Purpose

computed/conditional 스키마가 없는 평범한 노드가 공유하는, frozen 단일 `ComputedProperties` 인스턴스. 실제 `ComputedPropertiesManager`(PathManager + ~9 closure + dependencies 배열) 생성을 생략하여 노드당 mount 할당을 제거한다.

## Structure

- `sharedComputedSentinel.ts` — frozen 단일 인스턴스 + frozen 공유 빈 배열
- `index.ts` — barrel export

## Conventions

- `ComputedProperties` 인터페이스 16-member 전체 구현 (plain 노드 기본값)
- `recalculate()` 는 no-op, `getDerivedValue()`/`getPristine()` 는 undefined
- 모든 배열(`anyOfIndices`/`watchValues`/`dependencyPaths`/`dependencies`)은 frozen 공유

## Boundaries

### Always do

- `needsRealComputedManager() === false` 인 노드에만 할당
- 인스턴스와 배열 모두 `Object.freeze` (사고성 변이를 loud 실패로)

### Ask first

- 기본값 변경 (active/visible 등) — 전 plain 노드 동작에 영향

### Never do

- 인스턴스/배열을 mutable 로 노출 (공유 상태 오염 위험)
- 노드별 상태를 sentinel 에 저장

## Dependencies

- `../../ComputedPropertiesManager/type` — `ComputedProperties` 인터페이스
- `@winglet/common-utils/constant` — `VOID_FUNCTION` (no-op fallback)
