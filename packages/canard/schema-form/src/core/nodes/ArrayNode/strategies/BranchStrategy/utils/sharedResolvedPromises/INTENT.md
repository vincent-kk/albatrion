# sharedResolvedPromises

## Purpose

`push`/`clear` 의 locked(bulk) 경로에서 반환하는, 이미 resolve 된 공유 Promise 상수. `applyValue` 가 결과를 버리는 N개 항목 처리 시 매 항목마다 Promise 할당 + macrotask 스케줄을 생략하여 O(N) 낭비를 O(1) 로 줄인다.

## Structure

- `sharedResolvedPromises.ts` — `RESOLVED_LENGTH` / `RESOLVED_VOID` 상수
- `index.ts` — barrel export

## Conventions

- locked 경로 전용 — 반환값은 placeholder 이며 읽히지 않음
- public(unlocked) 경로는 여전히 `promiseAfterMicrotask` 사용 (await 타이밍 동일 보장)
- 단일 프로세스 공유 인스턴스 (불변, 재할당 없음)

## Boundaries

### Always do

- `__locked__ === true` 인 경로에서만 사용
- 반환값을 소비하지 않는 호출자에만 적용

### Ask first

- public 경로에서 사용 (await 타이밍이 달라짐)

### Never do

- resolve 값을 의미 있는 데이터로 사용 (placeholder 0/void)

## Dependencies

- (없음)
