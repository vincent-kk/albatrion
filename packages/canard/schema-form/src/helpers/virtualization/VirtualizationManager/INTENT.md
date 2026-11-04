# VirtualizationManager

## Purpose

Form마다 하나씩 존재하며 상태를 가진 가상화 조율자다. 공유 IntersectionObserver, idle backfill 펌프, reveal 레지스트리를 소유하고, placeholder에서 실제 컴포넌트로 바뀌는 전환(reveal)을 조율한다. 인스턴스를 만드는 진입점은 `static create()` 하나뿐이며, IntersectionObserver가 없거나 virtualization이 비활성화된 입력이면 null을 반환한다. SSR은 경고 없이 전체 렌더링하며, 하이드레이션으로 마운트된 노드는 소비층이 노출 원장에 기록한다. IO 부재 경고는 브라우저에만 적용한다.

## Conventions

- 게이트 판정은 자기 자신 또는 null을 돌려주는 self-selecting 메서드(`forBranch`/`forChild`)로 노출한다. 소비하는 쪽은 옵셔널 체이닝으로 조합하고, 옵션 원값(`options`)은 비공개로 둔다.
- IntersectionObserver 콜백과 idle tick, 이 두 reveal 트리거는 비공개 `reveal()` 한 곳으로 모은다. 이곳에서 registry 삭제, unobserve, 콜백 실행을 함께 처리한다.
- idle 백필은 `backfill === VirtualizationBackfill.Idle`일 때만 시작하며, register 시점에 조건을 확인해 시작한다.
- 슬라이스 하나당 reveal 상한(`MAX_REVEALS_PER_SLICE`=25)과 최소 잔여 idle 예산(`MIN_IDLE_BUDGET_MS`=4ms)으로 커밋 크기를 제한한다.

## Boundaries

### Always do

- register/unregister/disconnect는 멱등하게 유지한다. 중복 호출이나 순서가 뒤바뀐 호출에도 안전해야 한다.
- markRevealed는 단방향(defer-once)이다. 한 번 revealed된 노드는 다시 placeholder로 되돌리지 않는다.
- 인스턴스는 항상 `create()` 팩토리로 만든다. 비활성, SSR, IO 부재 시 null을 반환하는 로직을 재사용하기 위해서다.

### Ask first

- idle 슬라이스 예산(`MAX_REVEALS_PER_SLICE`, `MIN_IDLE_BUDGET_MS`) 또는 폴백 예산(`utils/scheduleIdle.ts`의 `FALLBACK_BUDGET_MS`)을 바꾸는 경우
- `options`(threshold/eagerCount/rootMargin/backfill/estimateHeight)를 해석하는 방식을 바꾸는 경우. 값의 정의는 `resolveVirtualizationOptions`가 소유한다.
- reveal 정책(defer-once) 자체를 되돌리는 방향의 변경

### Never do

- `create()`를 거치지 않고 `new VirtualizationManager()`로 직접 인스턴스를 만드는 것(단위 테스트는 예외)
- React 런타임 import 추가. 예외는 `Placeholder` 방어용 `withErrorBoundary`/`isReactComponent`와 type-only `ComponentType`이다.
- `registry`/`revealedNodes`를 클래스 밖에서 직접 변경하는 것

## Dependencies

idle callback을 제공하지 않는 환경에서도 백필을 진행할 수 있도록 취소 가능한 macrotask 폴백을 사용한다. 옵션의 의미는 resolveVirtualizationOptions가 소유하며, 형제 프랙탈의 진입점을 통해 타입과 값을 소비한다.
