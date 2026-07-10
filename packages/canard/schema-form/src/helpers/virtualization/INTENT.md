# virtualization

## Purpose

초대형 폼의 렌더 가상화(지연 마운트)를 위한 React-free 코어. Form당 하나의 VirtualizationManager가 공유 IntersectionObserver와 idle backfill 큐로 placeholder → 실제 컴포넌트 교체(reveal)를 조율한다.

## Structure

- `type.ts` — `VirtualizationOptions`(공개 입력), `ResolvedVirtualizationOptions`(기본값 적용 결과)
- `resolveVirtualizationOptions/` — 옵션 정규화 (모듈 내부 전용, `VirtualizationManager.create`가 사용)
- `VirtualizationManager/` — 공유 IO + idle 펌프 + reveal 레지스트리(WeakSet) 관리 클래스
- `index.ts` — barrel export (`VirtualizationManager` + 타입만 공개)

## Conventions

- 이 모듈은 런타임에 React를 import하지 않는다 (type-only `ComponentType`만 허용 — `Placeholder` 옵션 타입)
- 생성은 `VirtualizationManager.create(input)` 정적 팩토리로 — 비활성/IO 부재 시 null 반환
- 게이트 판정은 self-selecting 메서드(`forBranch`/`forChild`)로 노출 — 소비층은 옵셔널 체인으로 조합하고, 옵션 원값은 비공개
- reveal은 단방향: 한 번 reveal된 노드는 되돌리지 않는다 (defer-once)
- register/unregister/disconnect는 모두 멱등; disconnect 후 register로 재개 가능(StrictMode 대응)
- requestIdleCallback 미지원 환경은 common-utils `scheduleCancelableMacrotaskSafe`로 폴백 (브라우저 setTimeout 기반 — 렌더링 창 보장)

## Boundaries

### Always do

- 브라우저 API(IntersectionObserver/requestIdleCallback)는 부재 가능성을 전제로 접근할 것
- reveal 시 registry 항목 제거 + unobserve + markRevealed를 함께 수행할 것

### Ask first

- 옵션 기본값(threshold/eagerCount/rootMargin/backfill/estimateHeight) 변경
- idle slice당 reveal 상한(현재 25) 또는 deadline 정책 변경

### Never do

- React/컴포넌트 레이어 import (의존 방향: providers/components → helpers)
- reveal 취소·역방향 전환 로직 추가
- 노드 값/상태 변경 (이 모듈은 렌더 타이밍만 다룬다)

## Dependencies

- `@/schema-form/core` — `SchemaNode` (type-only)
- `@winglet/common-utils/scheduler` — `scheduleCancelableMacrotaskSafe`
- `@aileron/declare` — `Fn`
