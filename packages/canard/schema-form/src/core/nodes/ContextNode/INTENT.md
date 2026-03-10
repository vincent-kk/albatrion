# ContextNode

## Purpose
하위 노드들에게 공유 컨텍스트 데이터를 제공하는 특수 노드. 계산 속성 표현식에서 참조할 수 있는 공유 상태를 폼 트리에 주입한다.

## Structure
- `ContextNode.ts` — 메인 클래스, `AbstractNode<ObjectSchema>` 상속
- `index.ts` — re-export

## Conventions
- `type = 'object'`로 선언되나 일반 ObjectNode와 달리 자식 노드를 관리하지 않음
- 임의의 값(`unknown`) 저장 가능
- `setValue` 호출 시 이전/현재 값 비교 없이 항상 `UpdateValue` 이벤트 발행
- 클래스 멤버 Domain-First 순서 준수

## Boundaries

### Always do
- `applyValue` 를 통해서만 내부 값 변경
- `UpdateValue` 이벤트 발행 시 `previous`/`current` 모두 포함

### Ask first
- 값 비교 로직 추가 (현재 항상 이벤트 발행)
- 자식 노드 지원 추가 (설계 변경)

### Never do
- 이 노드를 일반 폼 필드로 사용
- `ObjectSchema.properties`를 통한 자식 노드 생성

## Dependencies
- `AbstractNode` — 기반 클래스
- `ObjectSchema` — `@/schema-form/types`
- `NodeEventType` — `core/nodes/type`
