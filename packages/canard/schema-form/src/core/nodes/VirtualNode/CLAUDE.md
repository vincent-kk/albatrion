# VirtualNode

## Purpose
스키마에 직접 정의되지 않은 가상 필드 노드. 여러 실제 노드에 대한 참조를 집합하여 복합 폼 필드(다중 값 제어)를 구현한다.

## Structure
- `VirtualNode.ts` — 메인 클래스, `AbstractNode` 상속
- `filter.ts` — `isVirtualNode` 타입 가드
- `index.ts` — re-export

## Conventions
- `type = 'virtual'`
- `value`는 참조 노드들의 값 배열 (`VirtualNodeValue = AllowedValue[]`)
- `setValue(values)` 호출 시 `values.length === refNodes.length` 필수
- 각 참조 노드의 `UpdateValue` 이벤트를 구독하여 자체 값 갱신
- 구독 해제는 `saveUnsubscribe`로 등록하여 노드 정리 시 자동 해제
- 클래스 멤버 Domain-First 순서 준수

## Boundaries

### Always do
- `setValue` 시 값 배열 길이와 참조 노드 수 일치 확인
- 불일치 시 `JsonSchemaError('INVALID_VIRTUAL_NODE_VALUES')` 던지기
- 참조 노드 구독은 `saveUnsubscribe`로 등록

### Ask first
- 참조 노드 없이 독립적인 값 저장 허용 (설계 변경)
- `children` 반환값 변경

### Never do
- `refNodes`를 생성자 외부에서 변경
- 길이 불일치 상태의 값 배열을 `__value__`에 저장
- `VirtualNode`를 JSON Schema의 실제 타입(`string`, `object` 등)으로 사용

## Dependencies
- `AbstractNode` — 기반 클래스
- `VirtualSchema`, `VirtualNodeValue` — `@/schema-form/types`
- `SchemaNode` — 참조 노드 타입
- `JsonSchemaError` — 유효성 오류
