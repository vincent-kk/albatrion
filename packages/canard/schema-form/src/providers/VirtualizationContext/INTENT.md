# VirtualizationContext

## Purpose

Form 전체에서 공유하는 렌더 가상화(지연 마운트) `VirtualizationManager`를 Context로 공급한다. `Form`의 `virtualization` prop을 마운트 시점에 한 번 해석해 manager를 생성하고, 하위 `DeferrableNodeProxy`·`useChildNodeComponents`가 이를 통해 reveal 게이트를 구성한다.

## Conventions

- `manager`는 `useLazyConstant(() => ({ manager: VirtualizationManager.create(virtualization) }))`로 마운트 시 1회만 생성 — 이후 `virtualization` prop이 바뀌어도 재생성하지 않는다(mount-frozen)
- `VirtualizationManager.create`는 비활성(`virtualization` falsy) 또는 `IntersectionObserver` 부재 시 `null`을 반환 — 소비 측은 `manager?.forBranch(...)` 형태의 optional chaining으로 처리
- unmount 시 `useEffect` cleanup에서 `manager.disconnect()`를 호출해 공유 IntersectionObserver와 idle pump를 정리한다

## Boundaries

### Always do

- `virtualization` prop을 마운트 시 `useLazyConstant`로 1회만 읽어 manager 생성
- `useEffect` cleanup에서 `manager?.disconnect()` 호출
- `manager`가 `null`인 경우도 그대로 Context 값에 담아 하위로 전파 (예외를 던지지 않음)

### Ask first

- `virtualization` prop 변경을 마운트 이후에도 반영하도록 정책 변경 시 (현재는 mount-frozen)
- `VirtualizationContext` 인터페이스에 `manager` 이외 필드 추가 시

### Never do

- `VirtualizationManager.create`를 Provider 외부 또는 렌더마다 재호출
- `manager`가 `null`일 때 하위 소비 측에서 예외를 던지도록 강제
