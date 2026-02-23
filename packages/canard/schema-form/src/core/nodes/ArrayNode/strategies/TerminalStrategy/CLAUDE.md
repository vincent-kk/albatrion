# ArrayNode/TerminalStrategy

## Purpose
자식 노드를 생성하지 않고 배열 값을 직접 관리하는 단순 전략. 원시값 배열(`string[]`, `number[]` 등)이나 단순 객체 배열에 사용된다.

## Structure
- `TerminalStrategy.ts` — 메인 전략 클래스
- `index.ts` — re-export

## Conventions
- `children`는 항상 `null` 반환 (자식 노드 없음)
- `__defaultItemValue__`와 `__defaultPrefixItemValues__`로 신규 항목 기본값 관리
- `push` 시 기존 배열을 복사하여 새 배열 생성 (불변 패턴)
- `__locked__` 플래그로 초기화 중 재귀 이벤트 방지
- `parseArray`로 입력값 파싱

## Boundaries

### Always do
- `push`/`remove`/`update` 시 배열 불변성 유지 (스프레드 복사)
- `maxItems` 제약 확인 후 push 허용
- `minItems` 기본값 채움은 생성자에서만 수행
- 반환값은 `Promise.resolve(value)` 직접 사용 (BranchStrategy와 달리 macrotask 불필요)

### Ask first
- `null` 반환 조건 변경 (현재 `nullable` 체크)
- `prefixItems` 기본값 처리 방식 변경

### Never do
- `__value__` 배열을 직접 변경(mutate) — 항상 새 배열 생성
- `children`을 `null` 이외의 값으로 반환

## Dependencies
- `ArrayNode` — 호스트 노드
- `resolveArrayLimits` — minItems/maxItems 계산
- `parseArray` — 입력값 파싱
- `getObjectDefaultValue` — prefixItems 기본값 계산
