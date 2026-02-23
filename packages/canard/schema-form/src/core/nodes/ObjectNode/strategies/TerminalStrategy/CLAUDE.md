# ObjectNode/TerminalStrategy

## Purpose
자식 노드를 생성하지 않고 객체 값을 직접 관리하는 단순 전략. `additionalProperties`, 키 정렬, nullable 처리를 포함하여 단순 객체 타입을 처리한다.

## Structure
- `TerminalStrategy.ts` — 메인 전략 클래스
- `index.ts` — re-export

## Conventions
- `children`과 `subnodes` 모두 `null` 반환
- `sortObjectKeys`로 `propertyKeys` 순서에 맞게 키 정렬
- `additionalProperties === false`이면 정의되지 않은 키 제거
- `parseObject`로 입력값 파싱
- `getObjectDefaultValue`로 기본값 계산

## Boundaries

### Always do
- 입력값은 `__parseValue__`를 통해서만 처리
- `additionalProperties: false` 시 정의 외 키 제거
- 기본값은 생성자에서 `__setDefaultValue__`에 등록

### Ask first
- `sortObjectKeys` 동작 변경 (키 순서 정책)

### Never do
- `children`/`subnodes`를 `null` 이외의 값으로 반환
- 원본 입력 객체를 직접 수정

## Dependencies
- `ObjectNode` — 호스트 노드
- `parseObject` — `core/parsers`
- `getObjectDefaultValue` — `@/schema-form/helpers/defaultValue`
- `@winglet/common-utils/object` (`sortObjectKeys`)
