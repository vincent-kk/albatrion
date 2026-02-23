# promiseAfterMicrotask

## Purpose
값을 macrotask(setTimeout 0) 후에 resolve하는 Promise로 래핑하는 유틸. `BranchStrategy`의 `push`/`remove`/`update` 등 조작 메서드가 비동기 반환값을 제공할 때 사용된다.

## Structure
- `promiseAfterMicrotask.ts` — 핵심 구현
- `index.ts` — re-export

## Conventions
- `scheduleMacrotask` (`@winglet/common-utils/scheduler`)에 의존
- 제네릭 함수: `<Value>(value: Value): Promise<Value>`
- microtask가 아닌 macrotask(setTimeout) 기반이므로 이벤트 배치 완료 후 resolve됨

## Boundaries

### Always do
- `BranchStrategy` 조작 메서드의 반환값을 이 함수로 래핑
- 반환 타입 `Promise<Value>`를 항상 유지

### Ask first
- `scheduleMacrotask` 대신 다른 스케줄러로 교체 (타이밍 계약 변경)
- microtask 기반으로 전환 (이벤트 순서에 영향)

### Never do
- Promise를 즉시 resolve하도록 변경 (동기 반환값과 혼용 시 이벤트 순서 파괴)
- `BranchStrategy` 외부에서 이 함수를 직접 사용

## Dependencies
- `@winglet/common-utils/scheduler` (`scheduleMacrotask`)
