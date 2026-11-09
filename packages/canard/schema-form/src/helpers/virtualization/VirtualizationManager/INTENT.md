# VirtualizationManager

## Purpose

폼 하나의 관찰 자원과 노출 기록을 소유합니다. 입력 컨테이너와 게이트의 위치를 구별하고, 노드 identity에 붙은 단방향 기록으로 값 변경·배열 재배치·소비층 재생성에서 포커스와 선택이 사라지는 것을 막습니다. 자원 공유와 Placeholder 격리의 이유는 [DETAIL](./DETAIL.md)에 둡니다.

## Conventions

- 게이트 판정은 자기 자신 또는 null을 돌려주는 self-selecting 메서드(`forBranch`/`forChild`)로 노출한다. 소비하는 쪽은 옵셔널 체이닝으로 조합하고, 옵션 원값(`options`)은 비공개로 둔다.
- IntersectionObserver·idle tick·경로 공개의 reveal 트리거는 비공개 `reveal()` 한 곳으로 모은다. 이곳에서 registry 삭제, unobserve, 콜백 실행을 함께 처리한다.
- idle 백필은 `backfill === VirtualizationBackfill.Idle`일 때만 시작하며, register 시점에 조건을 확인해 시작한다.
- idle 콜백의 reveal 개수와 잔여 예산 기준을 유지합니다. 하위 트리의 실제 작업시간 상한으로 오인하지 않도록 [DETAIL](./DETAIL.md)의 예산 한계를 따릅니다.

## Boundaries

### Always do

- register/unregister/disconnect는 멱등하게 유지한다. 중복 호출이나 순서가 뒤바뀐 호출에도 안전해야 한다.
- markRevealed는 단방향(defer-once)이다. 한 번 revealed된 노드는 다시 placeholder로 되돌리지 않는다.
- 인스턴스는 항상 `create()` 팩토리로 만든다. SSR, IO 부재 시 null을 반환하는 로직을 재사용하기 위해서다.

- 비활성에도 노출 이력을 유지하고, 옵션이 달라진 commit에서만 revision을 통지합니다.

### Ask first

- idle 슬라이스 예산(`MAX_REVEALS_PER_SLICE`, `MIN_IDLE_BUDGET_MS`) 또는 폴백 예산(`utils/scheduleIdle.ts`의 `FALLBACK_BUDGET_MS`)을 바꾸는 경우
- `options`(threshold/eagerCount/rootMargin/backfill/estimateHeight)를 해석하는 방식을 바꾸는 경우. 값의 정의는 `resolveVirtualizationOptions`가 소유한다.
- reveal 정책(defer-once) 자체를 되돌리는 방향의 변경

### Never do

- `create()`를 거치지 않고 `new VirtualizationManager()`로 직접 인스턴스를 만드는 것(단위 테스트는 예외)
- Placeholder 방어와 전용 보고 훅 이외의 React 런타임 의존을 추가하는 것. 렌더 수명은 소비층이 소유합니다.
- `registry`/`revealedNodes`를 클래스 밖에서 직접 변경하는 것

## Dependencies

Placeholder를 폼마다 한 번 격리하기 위해 FormErrorContext의 전용 보고 훅만 소비합니다. 필드별 보고기를 생성자에 붙잡으면 다른 필드의 경로·폼으로 보고할 수 있으므로 보고기는 렌더 때 읽습니다.
