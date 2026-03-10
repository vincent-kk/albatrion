# ArrayNode

## Purpose
JSON Schema `array` 타입을 처리하는 노드. 배열 요소 관리와 `push`/`pop`/`update`/`remove`/`clear` 조작 메서드를 제공한다.

## Structure
- `ArrayNode.ts` — 메인 클래스, `AbstractNode` 상속
- `filter.ts` — 타입 가드 유틸리티
- `validate.ts` — 배열 스키마 구조 검증 (`validateArraySchema`)
- `strategies/` — `BranchStrategy` (중첩 노드), `TerminalStrategy` (단순 배열)
- `utils/` — `omitEmptyArray`, `resolveArrayLimits`

## Conventions
- TypeScript strict 모드
- `group === 'terminal'`이면 `TerminalStrategy`, 아니면 `BranchStrategy` 선택
- 빈 배열은 기본적으로 `undefined`로 변환 (`omitEmpty !== false`인 경우)
- `minItems` 조건을 충족할 만큼 기본 항목 자동 생성
- `push`/`remove` 등 조작 메서드는 `Promise<value>` 반환 (microtask 후 resolve)
- 클래스 멤버 Domain-First 순서 준수

## Boundaries

### Always do
- 전략 선택 로직은 생성자 내 `group === 'terminal'` 조건으로만 분기
- 배열 조작 메서드(`push`, `pop`, `remove`, `clear`)는 반드시 전략 객체에 위임
- `maxItems`/`minItems` 제약은 `resolveArrayLimits`로 계산한 값을 사용
- 스키마 검증 오류는 `JsonSchemaError`로 던지기
- `omitEmpty` 옵션 처리는 `onChange` 핸들러에서 `omitEmptyArray` 적용

### Ask first
- `BranchStrategy`와 `TerminalStrategy` 사이 전략 선택 조건 변경
- 새 배열 조작 메서드 추가 (두 전략 모두 수정 필요)
- `push` 반환 타입 변경 (현재 `Promise<number>`)

### Never do
- `__strategy__` 내부 필드에 `ArrayNode` 외부에서 직접 접근
- `BranchStrategy`의 `__keys__` 또는 `__sourceMap__`을 전략 클래스 외부에서 조작
- 전략 없이 배열 값을 직접 변경

## Dependencies
- `AbstractNode` — 기반 클래스
- `BranchStrategy`, `TerminalStrategy` — 전략 구현체
- `omitEmptyArray`, `resolveArrayLimits` — 내부 유틸
- `@winglet/common-utils/object` (`equals`) — 값 비교
