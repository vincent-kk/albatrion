# MessageChannelScheduler contract

## Requirements

- `MessageChannelScheduler.getInstance(options?)`는 전역 싱글턴을 반환한다; 이미 인스턴스가 있고 파괴되지 않았다면 옵션은 무시되고 기존 인스턴스를 반환한다.
- `schedule(callback)`은 동기 컨텍스트에서 함께 호출된 태스크들을 하나의 배치로 묶어 단일 매크로태스크(하나의 `MessageChannel` 메시지)에서 실행한다.
- 빈 대기열에서 flush가 실행되면 스케줄러는 스스로 idle 상태로 복귀해야 하고, 배치 실행 중 새로 등록된 태스크가 있으면 그 배치의 메시지 핸들러가 다시 flush를 요청해야 한다 — 이 두 조건 중 하나라도 깨지면 스케줄러가 영구 정지한다.
- 태스크 실행 중 던져진 오류는 `onTaskError` 핸들러로만 전달되고, 같은 배치의 나머지 태스크 실행을 막지 않는다.
- `destroy()`는 멱등이며, 파괴된 스케줄러는 `schedule()` 호출 시 `MessageChannelSchedulerError`를 던진다.

## API Contracts

- `MessageChannelScheduler.getInstance(options?: SchedulerOptions): MessageChannelScheduler` — 싱글턴; 옵션은 최초 생성 시에만 적용된다.
- `schedule(callback: Fn): number` — 양의 정수 태스크 ID를 반환하거나, 대기 태스크가 `maxPendingTasks`를 넘고 `onMaxTasksExceeded`가 `false`를 반환하면 `-1`을 반환한다. 핸들러가 없는 상태로 한도를 넘기면 `MessageChannelSchedulerError('MAX_TASKS_EXCEEDED', ...)`를 던진다.
- `cancel(taskId: number): boolean`, `cancelAll(): number`, `isPending(taskId: number): boolean`, `getPendingCount(): number`, `destroyed: boolean`(getter), `destroy(): void` — 인스턴스 메서드/게터.
- 전역 핸들러 함수 `setImmediate`/`clearImmediate`/`getPendingCount`/`destroyGlobalScheduler`(그리고 `handler.ts`에는 있지만 `index.ts`에서 재수출되지 않는 `isPending`/`cancelAll`/`isSchedulerActive`)는 캐시된 전역 인스턴스를 지연 생성해 위 인스턴스 메서드로 위임한다.
- 태스크 콜백이 던진 예외는 `onTaskError(error, taskId)`로 전달된다; `Error`가 아닌 값을 던지면 `new Error(String(error))`로 감싼다.
- `MessageChannelSchedulerError`는 `errors`의 `BaseError`를 상속하고 `code: 'MESSAGE_CHANNEL_SCHEDULER'`로 생성된다; `isMessageChannelSchedulerError(error)`가 판별 가드다.

## Acceptance Criteria

### singleton-lifecycle — getInstance 싱글턴과 재생성

- `getInstance()`를 연속 호출하면 같은 인스턴스를 반환한다.
- `destroy()` 이후 `getInstance()`는 새 인스턴스를 반환한다.
- 이미 인스턴스가 있으면 이후 `getInstance` 호출의 옵션은 무시되고 최초 옵션이 유지된다 — 최초 `maxPendingTasks: 100`이 이후 `{ maxPendingTasks: 200 }` 호출에도 그대로 적용되어 101번째 `schedule` 호출이 'Max tasks exceeded: 100'으로 던진다.

### batch-generation-separation — 배치 세대 분리

- 배치 실행 중에 새로 스케줄한 태스크는 같은 배치가 아니라 다음 배치에서 실행된다.
- 동기 컨텍스트에서 함께 스케줄한 태스크(같은 배치)는 다음 배치의 어떤 태스크보다 먼저 모두 실행된다 — 배치 간 순서는 엄격하다.
- 배치 내부 태스크는 스케줄한 순서대로 실행된다.

### flush-idle-no-permanent-stop — idle/flush 상태 기계의 정지 없음

- 마지막 대기 태스크를 취소해도 이후 새로 스케줄한 태스크는 정상 실행된다.
- 첫 flush의 마이크로태스크 경계 이후에 등록한 태스크도 실행된다(유실되지 않는다).
- 실행 중인 태스크가 그 안에서 새로 등록한 태스크도 이어서 실행된다(중첩 스케줄).

### task-error-isolation — 태스크 오류 격리

- 한 태스크가 던진 오류는 `onTaskError(error, taskId)`로 전달되고, 해당 태스크의 `taskId`와 짝지어진다.
- 오류를 던진 태스크가 있어도 같은 배치의 앞뒤 태스크는 정상 실행된다.

### global-handler-delegation — 전역 핸들러 함수 위임

- 전역 `setImmediate`/`clearImmediate`로 스케줄·취소한 태스크는 인스턴스 API와 동일하게 동작한다(취소된 항목은 실행되지 않고, 실행이 끝난 항목·취소된 항목 모두 `isPending`이 `false`).
- `getPendingCount()`는 대기 중인 전역 태스크 수를 반영하고, 모두 실행되면 0으로 돌아온다.
- `cancelAll()`은 대기 중인 모든 전역 태스크를 취소하고 취소된 개수를 반환한다.

## Boundary Exemptions

### `error.ts` — 클래스와 같은 위치의 내부 보조 파일 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `index.ts`는 이 파일의 타입가드 `isMessageChannelSchedulerError`만 이름으로 재수출하고, 에러 클래스 `MessageChannelSchedulerError` 자체는 재수출하지 않는다 — 클래스는 스케줄러 내부(`schedule()`)에서 던지고 밖에서는 가드로만 판별하는 의도된 비대칭이다. organ으로 분리해도 이 노출 형태는 바뀌지 않으므로 같은 이름 파일(`MessageChannelScheduler.ts`) 옆에 flat으로 유지한다(패키지 전역 zero-peer 승인, `.filid` 설정의 scoped exempt와 쌍).

### `handler.ts` — 클래스와 같은 위치의 내부 보조 파일 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 이 파일이 정의한 7개 함수 중 `setImmediate`/`clearImmediate`/`getPendingCount`/`destroyGlobalScheduler` 네 개만 `index.ts`가 이름으로 재수출하고, `isPending`/`cancelAll`/`isSchedulerActive`는 모듈 내부와 `__tests__`에서만 쓰인다. organ으로 분리해도 이 노출 형태는 바뀌지 않으므로 같은 이름 파일 옆에 flat으로 유지한다(패키지 전역 zero-peer 승인, `.filid` 설정의 scoped exempt와 쌍).

## Last Updated

2026-08-18 — 최초 계약 작성
