# VirtualizationContext

## Purpose

Form 전체가 공유하는 렌더 가상화(지연 마운트) `VirtualizationManager`를 Context로 공급한다. `Form`의 `virtualization` prop을 마운트 시점에 한 번 해석해 manager를 만들고, 하위의 `DeferredFieldProxy`와 `useChildFields`가 이 manager로 필드를 화면에 드러내는 시점을 제어하는 게이트를 구성한다.

## Conventions

- `manager`는 `useLazyConstant(() => ({ manager: VirtualizationManager.create(virtualization) }))`로 마운트 시 한 번만 만든다. 이후 `virtualization` prop이 바뀌어도 다시 만들지 않는다(마운트 시점의 값으로 고정).
- `VirtualizationManager.create`는 비활성(`virtualization`이 falsy)이거나 `IntersectionObserver`가 없으면 `null`을 반환한다. 소비 측은 `manager?.forBranch(...)`처럼 optional chaining으로 처리한다.
- 언마운트할 때 `useEffect` cleanup에서 `manager.disconnect()`를 호출해 공유 IntersectionObserver와 유휴 시간 작업 처리기를 정리한다.

## Boundaries

### Always do

- `virtualization` prop은 마운트 시 `useLazyConstant`로 한 번만 읽어 manager를 만든다.
- `useEffect` cleanup에서 `manager?.disconnect()`를 호출한다.
- `manager`가 `null`이어도 그대로 Context 값에 담아 하위로 전파한다(예외를 던지지 않는다).

### Ask first

- 마운트 이후의 `virtualization` prop 변경도 반영하도록 정책을 바꾸는 경우(현재는 마운트 시점의 값으로 고정)
- `VirtualizationContext` 인터페이스에 `manager` 외의 필드를 추가하는 경우

### Never do

- `VirtualizationManager.create`를 Provider 밖에서 호출하거나 렌더마다 다시 호출하지 않는다.
- `manager`가 `null`일 때 하위 소비 측이 예외를 던지도록 강제하지 않는다.
