# BooleanNode

## Purpose

JSON Schema `boolean` 타입을 처리하는 단말 노드. 입력값을 boolean으로 파싱하고 `onChange` 이벤트를 발행한다.

## Structure

| 파일             | 역할                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| `BooleanNode.ts` | `BooleanNode extends AbstractNode<BooleanSchema, BooleanValue>` 클래스 구현 |
| `filter.ts`      | `isBooleanNode(input): input is BooleanNode` 타입 가드                      |
| `index.ts`       | `BooleanNode`, `isBooleanNode` re-export 전용 배럴                          |

## Conventions

- `parseBoolean` 파서로 입력값 변환; `nullable` 스키마인 경우 `null` 허용
- `defaultValue`가 있으면 생성자에서 즉시 `__emitChange__` 호출 후 `__initialize__()` 마지막 실행
- 이중 언더스코어 네이밍(`__value__`, `__emitChange__`, `__parseValue__`) — 내부 전용
- `SetValueOption` 비트마스크로 `EmitChange` / `Refresh` / `PublishUpdateEvent` 분기 처리
- 클래스 멤버 Domain-First 순서 준수 (Identity → Value → Events → Lifecycle)

## Boundaries

### Always do

- 값 변경 시 `__emitChange__`를 통해서만 내부 상태 갱신
- `nullable` 체크 후 `null` 허용 여부 결정 (`__parseValue__` 내부)
- `__initialize__()` 생성자 마지막에 호출

### Ask first

- `parseBoolean` 동작(falsy 처리 등) 변경
- 새 옵션(`options.*`) 추가

### Never do

- `__value__` 필드에 `__emitChange__` 우회하여 직접 할당
- 이 노드에 자식 노드 추가 (단말 노드)

## Dependencies

- 외부: `@aileron/declare` (`Nullish`)
- 내부 (schema-form): `@/schema-form/types` (`BooleanSchema`, `BooleanValue`)
- 내부 (sibling): `../../parsers` (`parseBoolean`), `../AbstractNode` (`AbstractNode`), `../type` (`NodeEventType`, `SchemaNodeConstructorProps`, `SetValueOption`, `UnionSetValueOption`)
- filter 전용: `../filter` (`isSchemaNode`)
