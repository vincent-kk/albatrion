# StringNode

## Purpose
JSON Schema `string` 타입을 처리하는 단말 노드. 빈 문자열 omit, blur 시 trim 옵션, nullable 지원을 제공한다.

## Structure
- `StringNode.ts` — 메인 클래스, `AbstractNode` 상속
- `filter.ts` — `isStringNode` 타입 가드
- `index.ts` — re-export

## Conventions
- `omitEmpty !== false`이면 빈 문자열(`''`)을 `undefined`로 변환
- `options.trim === true`이면 `Blurred` 이벤트 시 `trim()` 적용
- `onChange` 핸들러는 생성자에서 omitEmpty 여부에 따라 분기 설정
- `parseString`으로 입력값 변환
- 클래스 멤버 Domain-First 순서 준수

## Boundaries

### Always do
- 빈 문자열 처리는 `__onChangeWithOmitEmpty__`를 통해 수행
- `trim` 기능은 `Blurred` 이벤트 구독으로만 구현
- `nullable` 체크 후 `null` 허용 여부 결정

### Ask first
- trim 적용 타이밍 변경 (현재 blur 시)
- omitEmpty 기본값 변경 (현재 `true`)

### Never do
- `__value__`에 빈 문자열 저장 (omitEmpty 활성화 시)
- 자식 노드 추가 (단말 노드)

## Dependencies
- `AbstractNode` — 기반 클래스
- `parseString` — `core/parsers`
- `StringSchema`, `StringValue` — `@/schema-form/types`
- `NodeEventType` (`Blurred`) — `core/nodes/type`
