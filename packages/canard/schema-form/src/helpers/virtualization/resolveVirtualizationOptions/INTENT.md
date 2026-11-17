# resolveVirtualizationOptions

## Purpose

가상화의 활성화·기본값·옵션 의미를 매니저의 상태와 독립적으로 소유합니다. 가상화는 접근성과 전체 노출 비용을 바꾸므로 명시적인 선택으로 유지합니다.

## Conventions

- 값이 없는 필드는 정규화하되, 명시적으로 지정한 값은 바꾸지 않고 매니저 상태도 만들지 않는다.
- 옵션 타입과 값은 이 모듈의 진입점으로 내보낸다.

## Boundaries

### Always do

- 공개된 옵션 이름·기본값·열거형 의미를 유지하여 폼의 렌더 시점이 조용히 달라지지 않게 합니다.
- 비활성 입력에는 null을 반환한다.

### Ask first

- 기본 활성화 여부, 옵션 기본값이나 정규화 의미를 바꾸는 경우. 기본 off의 이유는 [DETAIL](./DETAIL.md)에 둡니다.

### Never do

- VirtualizationManager나 부모의 호환성 내보내기에 의존하는 것
- 브라우저 observer를 만들거나 React 컴포넌트를 렌더링하는 것
