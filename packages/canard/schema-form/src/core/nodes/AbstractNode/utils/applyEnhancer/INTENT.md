# applyEnhancer

## Purpose

검증에만 쓰이는 항목(enhancer)을 폼 값 위에 얹어 검증 대상 값을 만든다. 얹을 자리가 값에 없으면 그 항목을 버려, 검증이 값에 없는 노드를 보지 않게 한다.

## Conventions

- 입력 값과 enhancer를 변경하지 않는다. 항목이 실제로 쓰인 경로만 얕게 복사한다.
- enhancer의 잎 항목은 그 부모 객체가 값에 있을 때만 쓰이고, 객체·배열 항목은 값이 같은 키에 무언가를 들고 있을 때만 따라 내려간다.
- 배열은 인덱스로 대응하며 배열 자체에 잎 항목을 쓰지 않는다.

## Boundaries

### Always do

- 루트 노드가 검증 직전에 값을 만들 때만 사용한다.

### Ask first

- 값에 없는 객체를 enhancer가 만들어 내도록 규칙을 넓히는 변경 — 부모의 `required`, 배열의 `maxItems` 같은 검증이 값과 어긋난다.

### Never do

- 폼이 방출하는 값(`value`, `normalizedValue`, `onChange`)을 만드는 데 사용하지 않는다.
