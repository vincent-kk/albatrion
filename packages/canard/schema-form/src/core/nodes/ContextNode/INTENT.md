# ContextNode

## Purpose

하위 노드들에게 공유 컨텍스트 데이터를 제공하는 특수 노드. 계산 속성 표현식에서 참조할 수 있는 공유 상태를 폼 트리에 주입한다.

## Structure

| 파일             | 역할                                                         |
| ---------------- | ------------------------------------------------------------ |
| `ContextNode.ts` | `ContextNode extends AbstractNode<ObjectSchema>` 클래스 구현 |
| `index.ts`       | `ContextNode` re-export 전용 배럴                            |

## Conventions

- `type = 'object'`로 선언되나 일반 ObjectNode와 달리 자식 노드를 관리하지 않음
- `__value__: unknown` — 임의의 값 저장; 타입 파라미터 없이 `unknown` 사용
- `applyValue` 호출 시 이전/현재 값 동등 비교 없이 항상 `NodeEventType.UpdateValue` 이벤트 발행
- `defaultValue`가 있으면 생성자에서 즉시 `__emitChange__` 호출 후 `__initialize__()` 마지막 실행
- filter 함수(`isContextNode`) 없음 — 외부에서 `node.type === 'object'` 비교로 구분 불필요

## Boundaries

### Always do

- `applyValue` → `__emitChange__` 경로를 통해서만 내부 값 변경
- `UpdateValue` 이벤트 발행 시 `{ previous, current }` 페이로드 모두 포함

### Ask first

- 값 동등 비교 로직 추가 (현재 항상 이벤트 발행하는 설계 변경)
- 자식 노드 지원 추가 (ObjectNode와 달리 Properties 처리 없음 — 설계 변경)

### Never do

- 이 노드를 일반 폼 필드(사용자 입력)로 사용
- `ObjectSchema.properties`를 통한 자식 노드 생성 로직 추가

## Dependencies

- 외부: 없음
- 내부 (schema-form): `@/schema-form/types` (`ObjectSchema`)
- 내부 (sibling): `../AbstractNode` (`AbstractNode`), `../type` (`NodeEventType`, `SchemaNodeConstructorProps`)
