# checkComputedOptionFactory — 상태 조건의 우선순위

## Purpose

노드 상태 조건을 설정 위치의 우선순위에 따라 boolean 계산 함수로 만듭니다. 분기 인덱스나 derived 값의 계산은 맡지 않습니다.

## Conventions

- 루트 설정, 노드 설정, `computed` 설정, `&` 별칭 순으로 찾습니다. `false`도 명시적 설정이므로 하위 표현식으로 대체하지 않습니다.
- boolean 리터럴은 상수 함수로 보존하고 문자열 표현식만 boolean 강제 변환으로 컴파일합니다. 두 입력 형태의 결과 계약을 같게 합니다.
- 해당 조건이 없으면 계산 함수를 만들지 않습니다.

## Boundaries

### Always do

- `ConditionFieldName`에 속한 상태 조건만 이 팩토리에 전달합니다.
- 문자열 조건은 `createDynamicFunction`의 boolean 강제 변환을 켭니다.

### Ask first

- 루트·노드·computed·별칭의 탐색 우선순위 변경

### Never do

- 이 팩토리를 `ComputedPropertiesManager` 외부에서 직접 호출하지 않습니다.
- 문자열 상태 조건을 boolean 강제 변환 없이 컴파일하지 않습니다.
