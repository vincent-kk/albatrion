# sharedResolvedPromises

## Purpose

`push`/`clear`의 locked(bulk) 경로에서 반환하는 이미 resolve된 공유 Promise 상수.
`applyValue`가 결과를 버리는 N개 항목 처리 시 매 항목마다 Promise 할당과 macrotask 스케줄을
생략하여 O(N) 낭비를 O(1)로 줄인다.

## Structure

| 파일                        | 역할                                                                         |
| --------------------------- | ---------------------------------------------------------------------------- |
| `sharedResolvedPromises.ts` | `RESOLVED_LENGTH: Promise<number>`, `RESOLVED_VOID: Promise<void>` 상수 정의 |
| `index.ts`                  | barrel re-export                                                             |

## Conventions

- locked 경로 전용 — 반환값은 placeholder이며 호출자가 읽지 않는다
- public(unlocked) 경로는 여전히 `promiseAfterMicrotask`를 사용하여 await 타이밍을 보장한다
- 단일 프로세스 공유 인스턴스 (불변, 재할당 없음)

## Boundaries

### Always do

- `__locked__ === true`인 경로에서만 사용한다
- 반환값을 소비하지 않는 호출자(caller가 결과를 버리는 bulk 경로)에만 적용한다

### Ask first

- public 경로에서 사용하는 경우 (await 타이밍이 달라짐)
- `RESOLVED_LENGTH`의 placeholder 값 `0`을 의미 있는 값으로 변경하는 경우

### Never do

- resolve 값(`0` / `void`)을 실제 데이터로 해석하거나 사용하는 것
- `BranchStrategy/utils` 경계 밖에서 직접 import하는 것

## Dependencies

내부 의존성 없음. 외부 의존성 없음.
