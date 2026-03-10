# ArrayNode/BranchStrategy

## Purpose
배열 요소마다 자식 `SchemaNode`를 생성·관리하는 전략. 복잡한 객체 배열에 사용되며, 각 요소에 대한 독립적인 노드 트리를 유지한다.

## Structure
- `BranchStrategy.ts` — 메인 전략 클래스
- `type.ts` — `ChildSegmentKey` 타입
- `utils/` — `getChildSchema`, `promiseAfterMicrotask`

## Conventions
- `__keys__` (순서 배열) + `__sourceMap__` (키 → 데이터·노드 맵)으로 요소 관리
- 각 요소는 revision 카운터(`__revision__`)로 생성된 고유 키(`#N`)를 가짐
- 배치 변경은 `RequestEmitChange` 이벤트로 deferred 처리
- `__locked__` 플래그로 재귀 업데이트 방지
- `push`/`remove` 후 `__updateChildName__`으로 배열 인덱스 이름 갱신
- 클래스 멤버 Domain-First 순서 준수

## Boundaries

### Always do
- 요소 제거 시 `__cleanUp__`을 통한 자식 노드 정리
- `push` 시 `maxItems` 제약 확인 (`unlimited` 플래그로 우회 가능)
- 요소 추가·제거 후 `__expire__()`로 캐시 무효화
- 변경 전파 시 `NodeEventType.RequestEmitChange` 이벤트 사용

### Ask first
- `__locked__` / `__batched__` 플래그 로직 변경
- `ChildSegmentKey` 생성 방식(현재 `#revision`) 변경
- 자식 노드 변경이 부모로 전파되는 타이밍 조정

### Never do
- `__sourceMap__`을 클래스 외부에서 직접 수정
- `__revision__`을 재설정하거나 키 충돌 유발
- `initialize()`를 `ArrayNode.__initialize__` 외부에서 직접 호출

## Dependencies
- `ArrayNode` — 호스트 노드
- `getChildSchema` — 인덱스별 자식 스키마 결정
- `promiseAfterMicrotask` — 비동기 반환값 래핑
- `resolveArrayLimits` — minItems/maxItems 계산
- `SchemaNodeFactory` — 자식 노드 생성
