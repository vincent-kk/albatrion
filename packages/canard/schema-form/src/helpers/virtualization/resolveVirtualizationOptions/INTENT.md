# resolveVirtualizationOptions

## Purpose

가상화 옵션의 타입, backfill 값, 기본값 정규화를, 이를 소비하는 매니저와 독립적으로 소유한다.

## Conventions

- 값이 없는 필드는 정규화하되, 명시적으로 지정한 값은 바꾸지 않고 매니저 상태도 만들지 않는다.
- 옵션 타입과 값은 이 모듈의 진입점으로 내보낸다.

## Boundaries

### Always do

- 공개된 옵션 이름, 기본값, 열거형 값을 그대로 유지한다.
- 비활성 입력에는 null을 반환한다.

### Ask first

- 옵션 기본값이나 정규화 의미를 바꾸는 경우

### Never do

- VirtualizationManager나 부모의 호환성 내보내기에 의존하는 것
- 브라우저 observer를 만들거나 React 컴포넌트를 렌더링하는 것
