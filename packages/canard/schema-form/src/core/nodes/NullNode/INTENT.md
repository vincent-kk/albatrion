# NullNode

## Purpose

JSON Schema `null` 타입을 처리하는 단말 노드. `null` 또는 `undefined` 값만 허용하며 type-safe한 null 표현을 제공한다.

## Structure

| 파일          | 역할                                                               |
| ------------- | ------------------------------------------------------------------ |
| `NullNode.ts` | `NullNode extends AbstractNode<NullSchema, NullValue>` 클래스 구현 |
| `filter.ts`   | `isNullNode(input): input is NullNode` 타입 가드                   |
| `index.ts`    | `NullNode`, `isNullNode` re-export 전용 배럴                       |

## Conventions

- `__value__: NullValue | undefined` — `null | undefined` 외 값은 타입 수준에서 차단
- `__parseValue__`: `undefined` → `undefined`, 그 외 → 입력값 그대로 반환 (`parseBoolean` 같은 변환 없음)
- `nullable` 플래그 불필요 — `null` 타입 자체가 nullable 의미를 내포
- `SetValueOption` 비트마스크로 `EmitChange` / `Refresh` / `PublishUpdateEvent` 분기 처리
- `defaultValue`가 있으면 생성자에서 즉시 `__emitChange__` 호출 후 `__initialize__()` 마지막 실행

## Boundaries

### Always do

- `__emitChange__`를 통해서만 내부 상태 갱신
- `__initialize__()` 생성자 마지막에 호출

### Ask first

- `null` 이외의 값 허용 (타입 계약 변경 — `NullValue` 정의 수정 필요)
- `__parseValue__` 에 변환 로직 추가

### Never do

- `__value__`에 `null`/`undefined` 외 값 할당
- 자식 노드 추가 (단말 노드)

## Dependencies

- 외부: 없음
- 내부 (schema-form): `@/schema-form/types` (`NullSchema`, `NullValue`)
- 내부 (sibling): `../AbstractNode` (`AbstractNode`), `../type` (`NodeEventType`, `SchemaNodeConstructorProps`, `SetValueOption`, `UnionSetValueOption`)
- filter 전용: `../filter` (`isSchemaNode`)
