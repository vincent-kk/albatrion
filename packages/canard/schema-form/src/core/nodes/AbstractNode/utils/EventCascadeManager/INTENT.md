# EventCascadeManager

## Purpose

노드의 이벤트 발행, 구독, 배치 처리를 캡슐화하는 매니저. 마이크로태스크 배치로 재귀적 트리거를 방지하고, 동일 동기 스택의 이벤트를 하나의 배치로 병합한다. 무한 루프 감지(MAX_LOOP_COUNT=100) 기능을 포함한다. 임계값은 의도적으로 낮게 유지되며, 발산뿐 아니라 너무 약하게 감쇠하는 수렴 cycle 도 설계 결함으로 간주하여 검출한다. 전달 원장(delivery ledger)으로 타입별 단조 revision 을 제공하여, 구독 이전에 전달된 배치를 늦은 구독자가 감지(catch-up)할 수 있게 한다.

## Structure

- `EventCascadeManager.ts` — 클래스 본체
- `index.ts` — barrel export
- `utils/getEventCollection.ts` — 단일 이벤트를 `NodeEventCollection` 으로 변환
- `utils/mergeEventEntries.ts` — 배치 내 이벤트 엔티티 병합

## Conventions

- TypeScript strict 모드
- 배치 생명주기: `resolved=undefined` (수집 중) → `resolved=true` (실행 중)
- `publish()`: 마이크로태스크로 배치 → `dispatch()`: 동기 즉시 실행
- 배치 카운트는 macrotask 스케줄러로 리셋 (React Fiber 충돌 방지를 위해 `setTimeout` 사용)
- `cleanUp()`: 모든 unsubscribe 함수 실행 및 리스너 Set 초기화 (원장은 유지 — 노드 수명 동안 단조성 보장)
- 전달 원장: `__resolve__` 단일 지점에서 타입 비트별 카운터 증가, **리스너 유무와 무관**. `revision(mask)` 로 마스크 합산 조회 — 렌더~커밋 갭에 놓친 전달을 커밋 시점 구독자가 감지하는 근거

## Boundaries

### Always do

- 의존성 구독 해제 함수는 `saveUnsubscribe()` 로 등록
- 노드 소멸 시 반드시 `cleanUp()` 호출
- `publish()` vs `dispatch()` 구분: 비동기 배치 vs 동기 즉시
- 이벤트 전달은 반드시 `__resolve__` 단일 지점 경유 (원장 정확성의 전제)

### Ask first

- `MAX_LOOP_COUNT` 값 변경 (무한 루프 감도 조절)
- 배치 병합 로직 변경 (`mergeEventEntries`)

### Never do

- `__listeners__` Set 을 외부에서 직접 조작
- `cleanUp()` 없이 노드를 폐기 (메모리 누수)
- 동일 노드에서 `dispatch()` 를 반복 호출하여 루프 생성

## Dependencies

- `utils/getEventCollection` — 이벤트 컬렉션 생성
- `utils/mergeEventEntries` — 배치 이벤트 병합
- `@winglet/common-utils/scheduler` — `scheduleMicrotask`, `scheduleMacrotaskSafe`
- `@/schema-form/core/nodes/type` — 이벤트 타입 정의
- `@/schema-form/errors` — `SchemaFormError`
- `@aileron/declare` — `Fn`
