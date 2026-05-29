# promiseAfterMicrotask

## Purpose

값을 macrotask(setTimeout 0) 이후에 resolve하는 `Promise`로 래핑하는 유틸.
`BranchStrategy`의 `push`/`remove`/`update` 조작 메서드가 비동기 반환값을 제공할 때 사용된다.

## Structure

| 파일                       | 역할                                                            |
| -------------------------- | --------------------------------------------------------------- |
| `promiseAfterMicrotask.ts` | `promiseAfterMicrotask<Value>(value): Promise<Value>` 핵심 구현 |
| `index.ts`                 | barrel re-export                                                |

## Conventions

- 제네릭 함수: `<Value>(value: Value): Promise<Value>` — 값 타입을 보존한다
- `scheduleMacrotask`(`@winglet/common-utils/scheduler`) 기반 — microtask가 아닌 macrotask(setTimeout) 스케줄
- React 렌더 배치 완료 후 resolve되므로 이벤트 순서가 보장된다
- 단일 책임: 스케줄링 위임만 수행, 값 변환 없음

## Boundaries

### Always do

- `BranchStrategy` 조작 메서드(`push`, `remove`, `update`)의 public 경로 반환값을 이 함수로 래핑한다
- 반환 타입 `Promise<Value>`를 항상 유지한다

### Ask first

- `scheduleMacrotask` 대신 다른 스케줄러로 교체하는 경우 (타이밍 계약 변경)
- microtask 기반(`Promise.resolve`)으로 전환하는 경우 (이벤트 순서에 영향)

### Never do

- Promise를 즉시 resolve하도록 변경하는 것 (동기 반환과 혼용 시 이벤트 순서 파괴)
- `BranchStrategy/utils` 경계 밖에서 직접 import하는 것

## Dependencies

**외부**

- `@winglet/common-utils/scheduler` — `scheduleMacrotask`
