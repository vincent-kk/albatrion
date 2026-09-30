# getDerivedValueFactory — 파생 값의 타입 보존

## Purpose

`computed.derived` 또는 `&derived`를 의존성 값에서 파생 값을 얻는 함수로 만듭니다. 노드 값에 적용하는 시점은 `AbstractNode`가 결정하며 이 팩토리는 값을 적용하지 않습니다.

## Conventions

- 명시적 `computed.derived`가 있으면 `&derived`보다 먼저 사용합니다. 앞선 설정이 없을 때만 별칭을 읽습니다.
- 파생 값은 boolean 상태가 아니므로 `createDynamicFunction`의 boolean 강제 변환을 끕니다. 숫자·문자열·객체 결과를 원래 타입으로 유지합니다.
- 표현식이 없으면 함수를 만들지 않습니다. 노드는 정의 여부를 확인한 뒤 현재 의존성으로 `getDerivedValue()`를 평가합니다.

## Boundaries

### Always do

- derived 컴파일에서 boolean 강제 변환을 끕니다.
- 표현식이 없으면 `undefined`를 반환합니다.

### Ask first

- derived 값의 우선순위 변경 (`__reset__` 로직과 연관)

### Never do

- derived 표현식을 boolean으로 강제 변환하지 않습니다.
- `ComputedPropertiesManager` 외부에서 이 팩토리를 직접 호출하지 않습니다.
