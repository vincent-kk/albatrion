# MessageChannelScheduler — MessageChannel 기반 매크로태스크 배치 스케줄러

## Purpose

`MessageChannel`로 매크로태스크를 배치 실행하는 스케줄러 클래스를 소유한다. 동기 컨텍스트에서 스케줄된 태스크를 자동으로 하나의 배치로 묶어 단일 매크로태스크에서 실행하고, 태스크별 오류를 격리하며, 싱글턴(`getInstance`/`destroy`)으로 전역 공유된다. 형제 fractal `scheduler`의 `scheduleMacrotask`와 전역 `setImmediate`/`clearImmediate` 핸들러가 네이티브 `setImmediate`가 없는 환경에서 쓰는 폴백 엔진이다.

## Conventions

- idle/flush 상태는 `__idle__` 플래그 하나로 게이트한다: 빈 큐에서 flush가 실행되면 반드시 스스로 idle로 돌아가야 하고, 배치 실행 중 새로 등록된 태스크가 있으면 반드시 새 flush를 다시 요청해야 한다 — 어느 한쪽이라도 놓치면 스케줄러가 영구 정지한다.
- 보조 파일 `error.ts`/`handler.ts`는 같은 이름 파일 `MessageChannelScheduler.ts` 옆에 flat으로 유지한다 — 노출 형태와 근거는 DETAIL.md의 Boundary Exemptions를 따른다.

## Boundaries

### Always do

- idle/flush 상태 전이를 바꾼 뒤 `MessageChannelScheduler.flush.test.ts`의 정지 인시던트 케이스를 통과시킨다
- 태스크 실행 오류는 `onTaskError` 핸들러로만 격리하고 나머지 배치 실행을 계속한다
- flush/idle 계약을 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- 싱글턴 생성 이후 옵션(`maxPendingTasks` 등)을 재적용 가능하게 바꾸는 것 — 현재는 최초 `getInstance` 호출의 옵션만 유효하다
- `schedule`/`cancel`의 태스크 ID 체계(양의 증가 정수) 변경

### Never do

- 빈 큐에서 flush를 실행하고도 idle 복귀를 생략하는 경로 추가(스케줄러 영구 정지)
- 배치 실행 중 등록된 태스크를 다음 flush 요청 없이 버려두는 경로 추가
