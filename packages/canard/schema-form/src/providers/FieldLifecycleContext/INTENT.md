# FieldLifecycleContext

## Purpose

FormRoot가 소유한 라이프사이클 레지스트리를 입력 위치로 전달합니다. 폼별 예약이 다른 폼에 도달하지 않도록 Context 경계로 격리합니다.

## Conventions

- Provider 컴포넌트 없이 Context.Provider 요소를 직접 사용합니다. 래퍼 컴포넌트는 Form 재렌더의 고정 호출 수를 늘립니다.
- Context 밖의 훅은 null을 반환하여 내부 입력 시험과 레지스트리 없는 소비를 허용합니다.

## Boundaries

### Always do

- 레지스트리 생성과 오류 보고 정책은 FormRoot에 둡니다.

### Ask first

- Context 값의 모양 또는 Provider 계층을 바꿀 때

### Never do

- 폼 사이에 레지스트리를 공유하거나 Context에 DOM 상태를 보관하지 않습니다.
- 전달만을 위한 Provider 컴포넌트를 추가하지 않습니다.
