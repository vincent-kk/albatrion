# formTypeInputDefinition

## Purpose

플러그인/사용자가 제공한 `FormTypeInputMap`과 `FormTypeInputDefinition[]`을 정규화하여 내부에서 사용할 `NormalizedFormTypeInputDefinition[]`으로 변환한다. 컴포넌트에 `withErrorBoundary`를 자동 적용한다.

## Conventions

- 유효한 React 컴포넌트(`isReactComponent`)만 정규화 결과에 포함
- 모든 컴포넌트는 `withErrorBoundary`로 래핑
- 와일드카드(`*`)를 포함한 경로는 `INCLUDE_WILDCARD_REGEX`로 감지 후 세그먼트 매칭
- `FormTypeTestObject`는 `formTypeTestFnFactory`로 테스트 함수로 변환

## Boundaries

### Always do

- 정규화 결과의 모든 컴포넌트에 `withErrorBoundary` 적용
- 유효하지 않은 React 컴포넌트는 조용히 건너뛸 것

### Ask first

- `INCLUDE_WILDCARD_REGEX` 패턴 변경 (와일드카드 경로 매칭 동작에 영향)
- `NormalizedFormTypeInputDefinition` 인터페이스 확장

### Never do

- `formTypeInputMap` 키를 JSONPointer 없이 임의 문자열로 허용
- 정규화 함수 내에서 React 렌더링 또는 훅 호출
