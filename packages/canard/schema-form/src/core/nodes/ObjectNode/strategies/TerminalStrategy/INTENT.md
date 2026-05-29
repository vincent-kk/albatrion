# ObjectNode/TerminalStrategy

## Purpose

자식 노드를 생성하지 않고 객체 값을 직접 관리하는 단순 전략. `additionalProperties`, 키 정렬, nullable 처리를 포함하여 단순 객체 타입을 처리한다.

## Structure

| 파일                  | 역할                                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| `TerminalStrategy.ts` | `ObjectNodeStrategy` 구현 클래스 — `applyValue`, `children`, `subnodes` |
| `index.ts`            | re-export 배럴                                                          |

## Conventions

- `children`과 `subnodes` 두 getter 모두 항상 `null` 반환
- `__parseValue__` 내에서 `sortObjectKeys(parseObject(input), __propertyKeys__)` 순서로 키 정렬
- `additionalProperties === false`이면 `ignoreUndefinedKey: true`로 정의 외 키 제거
- `getObjectDefaultValue`로 기본값 계산 후 생성자에서 `host.__setDefaultValue__` 호출
- 값 변경은 `__emitChange__` 단일 경로로만 처리 (`SetValueOption` 비트 플래그 해석)

## Boundaries

### Always do

- 입력값은 반드시 `__parseValue__`를 통해서만 파싱
- `additionalProperties: false` 스키마에서는 정의 외 키 반드시 제거
- 기본값은 생성자에서 `host.__setDefaultValue__`에 등록

### Ask first

- `sortObjectKeys` 동작 변경 (키 순서 정책이 BranchStrategy와 일관성에 영향)
- `SetValueOption` 비트 플래그 구성 변경

### Never do

- `children`/`subnodes`를 `null` 이외의 값으로 반환
- 원본 입력 객체를 직접 수정
- `__emitChange__` 우회하여 `__value__` 직접 할당

## Dependencies

- 내부: `@/schema-form/core/nodes/ObjectNode`(`ObjectNode`), `@/schema-form/core/nodes/type`(`HandleChange`, `NodeEventType`, `SetValueOption`, `UnionSetValueOption`), `../type`(`ObjectNodeStrategy`), `@/schema-form/core/parsers`(`parseObject`), `@/schema-form/helpers/defaultValue`(`getObjectDefaultValue`), `@/schema-form/types`(`ObjectValue`)
- 외부: `@winglet/common-utils/array`(`sortWithReference`), `@winglet/common-utils/object`(`getObjectKeys`, `sortObjectKeys`), `@aileron/declare`(`Nullish`)
