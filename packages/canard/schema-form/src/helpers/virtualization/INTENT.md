# virtualization

## Purpose

초대형 폼의 렌더 가상화(지연 마운트) 코어다(React 의존은 `Placeholder` 방어로 한정). Form마다 VirtualizationManager 하나가 공유 IntersectionObserver와 idle backfill 큐로, placeholder를 실제 컴포넌트로 바꾸는 일(노출, reveal)을 조율한다.

## Conventions

- React 런타임 import는 `Placeholder` 방어(`withErrorBoundary`/`isReactComponent`)에만 허용하고, 그 밖에는 type-only `ComponentType`만 허용한다.
- 생성은 `VirtualizationManager.create(input)` 정적 팩토리로 하며, 비활성이거나 IO가 없으면 null을 반환한다.
- 게이트 판정은 스스로 대상을 고르는 메서드(`forBranch`/`forChild`)로 노출한다. 소비층은 옵셔널 체인으로 조합하고, 옵션 원값은 공개하지 않는다.
- reveal은 한 방향으로만 진행한다. 한 번 reveal된 노드는 되돌리지 않는다(defer-once).
- register/unregister/disconnect는 모두 멱등이며, disconnect 뒤에도 register로 다시 시작할 수 있다(StrictMode 대응).
- requestIdleCallback을 지원하지 않는 환경에서는 common-utils의 `scheduleCancelableMacrotaskSafe`로 폴백한다(브라우저 setTimeout 기반이라 렌더링 창을 보장한다).

## Boundaries

### Always do

- 브라우저 API(IntersectionObserver/requestIdleCallback)는 없을 수 있다고 가정하고 접근한다.
- reveal할 때 registry 항목 제거, unobserve, markRevealed를 함께 수행한다.

### Ask first

- 옵션 기본값(threshold/eagerCount/rootMargin/backfill/estimateHeight) 변경
- idle slice마다 reveal하는 수의 상한(현재 25)이나 deadline 정책 변경

### Never do

- React/컴포넌트 레이어를 import하지 않는다. 예외는 `Placeholder` 방어용 `withErrorBoundary`/`isReactComponent`다(의존 방향: providers/components → helpers).
- reveal 취소나 역방향 전환 로직을 추가하지 않는다.
- 노드 값이나 상태를 변경하지 않는다(이 모듈은 렌더 타이밍만 다룬다).
