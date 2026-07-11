# VirtualizationManager

## Purpose

Form당 하나씩 존재하는 상태형 가상화 조율자. 공유 IntersectionObserver, idle backfill 펌프, reveal 레지스트리를 소유하며 placeholder → 실제 컴포넌트 전환(reveal)을 조율한다. 유일한 생성 진입점은 `static create()`이며, SSR 등 IntersectionObserver 부재 환경이거나 virtualization이 비활성화된 입력이면 null을 반환한다.

## Structure

- `VirtualizationManager.ts` — 클래스 본체: 게이팅(`forBranch`/`forChild`), 등록 생명주기(`register`/`unregister`/`disconnect`), reveal 레지스트리(`Map<Element, Fn>`)와 리빌드-내구 reveal 기록(`WeakSet<SchemaNode>`), idle 백필 펌프
- `scheduleIdle.ts` — `requestIdleCallback` 래퍼. 미지원 환경은 `scheduleCancelableMacrotaskSafe`로 폴백. `IdleDeadlineLike` 타입 정의
- `index.ts` — barrel: `VirtualizationManager` 클래스만 재노출 (`scheduleIdle`/`IdleDeadlineLike`는 모듈 내부 전용)

## Conventions

- 게이트 판정은 self-selecting 메서드(`forBranch`/`forChild`)로 노출 — 소비 측은 옵셔널 체이닝으로 조합하고 옵션 원값(`options`)은 비공개 유지
- IntersectionObserver 콜백과 idle tick, 두 reveal 트리거는 사설 `reveal()` 한 곳으로 수렴 — registry 삭제·unobserve·콜백 실행을 함께 수행
- idle 백필은 `backfill === VirtualizationBackfill.Idle`일 때만 기동 (register 시 조건부 시작)
- 슬라이스당 reveal 상한(`MAX_REVEALS_PER_SLICE`=25)과 최소 잔여 idle 예산(`MIN_IDLE_BUDGET_MS`=4ms)으로 커밋 크기를 제한

## Boundaries

### Always do

- register/unregister/disconnect는 멱등하게 유지 — 중복 호출·순서 뒤바뀜에도 안전해야 함
- markRevealed는 단방향(defer-once) — 한 번 revealed된 노드는 다시 placeholder로 되돌리지 않음
- 인스턴스 생성은 항상 `create()` 팩토리 경유 — 비활성/SSR/IO 부재 시 null 반환 로직을 재사용

### Ask first

- idle 슬라이스 예산(`MAX_REVEALS_PER_SLICE`, `MIN_IDLE_BUDGET_MS`) 또는 폴백 예산(`scheduleIdle.ts`의 `FALLBACK_BUDGET_MS`) 변경
- `options`(threshold/eagerCount/rootMargin/backfill/estimateHeight) 해석 방식 변경 — 값 정의는 `resolveVirtualizationOptions` 소유
- reveal 정책(defer-once) 자체를 되돌리는 방향의 변경

### Never do

- `create()`를 우회한 직접 `new VirtualizationManager()` 인스턴스화 (단위 테스트 제외)
- React 런타임 import 추가 (Placeholder의 type-only `ComponentType` 참조는 기존 예외)
- `registry`/`revealedNodes`를 클래스 외부에서 직접 변경

## Dependencies

- `resolveVirtualizationOptions` (동일 부모 하위 sibling) — `create()`의 옵션 정규화에 사용
- `../type.ts`(부모 virtualization/ 소유 peer 파일) — `VirtualizationBackfill` enum(런타임 값), `ResolvedVirtualizationOptions`/`VirtualizationOptions`/`VirtualizationPlaceholderProps` 타입
- `@winglet/common-utils/scheduler` — `scheduleCancelableMacrotaskSafe` (idle 폴백)
- `@/schema-form/core` — `SchemaNode` (type-only)
- `@/schema-form/helpers/{warning,error}` — SSR 비활성 dev 경고(`warnDevelopmentIssue`+`VIRTUALIZATION_DISABLED_FOR_FORM`, `formatVirtualizationDisabledWarning`)
- `@aileron/declare` — `Fn`
- 형제 프랙탈은 entry point(`index.ts`) 경유 — 내부 파일 직접 import 금지
