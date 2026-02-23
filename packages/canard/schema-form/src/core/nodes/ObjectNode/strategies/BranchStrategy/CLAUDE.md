# ObjectNode/BranchStrategy

## Purpose
객체의 각 프로퍼티를 자식 노드로 관리하고 `oneOf`/`anyOf` 조건부 스키마 분기를 처리하는 전략. 조건 변경 시 비활성 분기 노드를 reset하고 활성 분기 노드를 복원한다.

## Structure
- `BranchStrategy.ts` — 메인 전략 클래스
- `type.ts` — `ChildNodeMap` 타입
- `utils/` — 자식 노드 생성 및 조건 처리 유틸 함수들

## Conventions
- `__propertyChildren__` (기본 프로퍼티) + `__oneOfChildNodeMap__` + `__anyOfChildNodeMaps__`로 활성 자식 구성
- `__subnodes__`는 모든 조건부 분기 포함, `__children__`은 활성만
- `UpdateComputedProperties` 이벤트 구독으로 oneOf/anyOf 인덱스 변경 감지
- `__isolated__` 플래그: `setValue` 직접 호출 시 활성화, 조건부 필터링 적용
- `__draft__` + `__value__` 이중 버퍼로 점진적 값 갱신
- 클래스 멤버 Domain-First 순서 준수

## Boundaries

### Always do
- oneOf 분기 변경 시 이전 분기 노드 `__reset__`, 새 분기 노드 `__reset__` 후 복원
- `processValueWithCondition`으로 조건부 필드 필터링 적용
- `__locked__` 플래그로 자식-부모 재귀 업데이트 차단
- `validateSchemaType`으로 이전 값 재사용 가능 여부 확인

### Ask first
- oneOf/anyOf 분기 전환 타이밍이나 이벤트 순서 변경
- `__draft__`/`__value__` 이중 버퍼 패턴 변경
- `__isolated__` 플래그 동작 변경

### Never do
- `__oneOfChildNodeMapList__`의 노드를 `BranchStrategy` 외부에서 직접 조작
- `initialize()`를 `ObjectNode.__initialize__` 외부에서 직접 호출
- `__subnodes__`와 `__children__`을 동기화 없이 독립 수정

## Dependencies
- `ObjectNode` — 호스트 노드
- BranchStrategy utils — `getChildNodeMap`, `getChildren`, `getCompositionKeyInfo` 등
- `SchemaNodeFactory` — 자식 노드 생성
- `NodeEventType` — 이벤트 타입
