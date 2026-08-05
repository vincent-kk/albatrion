# buildPlan Specification

## Requirements

- `buildPlan` 은 읽기 전용이다. 파일시스템을 읽어 판정할 뿐 아무것도 쓰지 않는다. 적용은 `injectDocs/` 의 몫이다.
- 매니페스트 항목마다 최대 하나의 action, 발견된 orphan 마다 하나의 action 을 낸다.
- `destinations` 에 없는 경로는 계획에서 통째로 빠진다. 이 부재가 kind 필터 실행이 요청하지 않은 kind 를 보고하지도 삭제하지도 않게 하는 기제다.
- 판정 어휘는 목적지 종류와 무관하다. 파일이든 공유 문서 안의 블록이든 같은 `ActionKind` 를 쓴다. 소비자는 `kind` 를 먼저, `target.kind` 를 나중에 분기한다.
- 파일 목적지 판정: 설치본이 없으면 `copy`, 해시가 같으면 `skip-uptodate`, 다르면 `warn-diverged`.
- 블록 목적지 판정: 문서가 없거나 그 블록이 없으면 `copy`, 본문이 매니페스트와 맞으면 `skip-uptodate`, 아니면 `warn-diverged`.
- `unsupported` 목적지는 `skip-unsupported` 이며 force 를 요구하지 않는다.
- `warn-diverged` 는 `requiresForce` 를 세운다. `--force` 없이 발견된 모든 orphan 도 마찬가지다.
- orphan 은 `--force` 가 있으면 `delete`, 없으면 `warn-orphan` 으로 나온다.
- orphan 탐색은 호출자가 준 스캔만 돈다. 블록 스캔은 명시된 소유 패키지의 블록만 살피므로 다른 패키지나 다른 도구의 블록은 삭제 후보가 되지 않는다.
- 존재하지 않는 orphan 스캔 루트는 실패가 아니다. 걷기가 조용히 비어 돌아온다.
- 한 계획 안에서 같은 공유 문서를 여러 번 읽지 않는다 (`utils/readDocument.ts` 의 계획 단위 캐시).
- 경로 비교는 POSIX 구분자로 정규화해서 한다 (`utils/toPosix.ts`).

## API Contracts

- `buildPlan(input: PlanInput): Promise<InjectPlan>`
- `PlanInput` — `{ sourceHashes, destinations, orphanScans, force }`
  - `destinations` 에 없는 `sourceHashes` 키는 무시된다
- `InjectPlan` — `{ actions: readonly Action[]; requiresForce: boolean }`

## Exported Types

- `ActionKind = 'copy' | 'skip-uptodate' | 'warn-diverged' | 'warn-orphan' | 'delete' | 'skip-unsupported'`
- `ActionTarget = Destination` — `ActionKind` 와 직교
- `Action` — `{ kind, relPath, target }`
- `InjectPlan`, `PlanInput`

## Acceptance Criteria

### AC-PLAN-FILE — 파일 목적지의 판정과 디렉터리 orphan

- 설치본이 없는 항목은 `copy`, 같은 항목은 `skip-uptodate`, 다른 항목은 `warn-diverged` 가 된다.
- 매니페스트에 없는데 스캔 루트 아래 남아 있는 파일은 orphan 으로 나온다.
- 존재하지 않는 orphan 루트를 스캔해도 실패하지 않는다.
- Verified by `__tests__/buildPlan.test.ts`.

### AC-PLAN-BLOCK — 블록 목적지의 판정

- 문서가 아직 없을 때, 그리고 문서는 있으나 이 블록이 없을 때 모두 `copy` 다.
- 본문이 매니페스트와 여전히 맞으면 `skip-uptodate` 다.
- 손으로 수정된 블록은 `warn-diverged` 가 되고 force 를 요구한다.
- Verified by `__tests__/buildPlan.test.ts`.

### AC-PLAN-ORPHAN — orphan 은 소유한 것만 대상으로 한다

- 이 패키지가 더 이상 배포하지 않는 블록은 `warn-orphan` 으로 경고된다.
- 같은 문서에 있는 다른 패키지의 블록은 건드리지 않는다.
- `--force` 아래에서 낡은 블록은 `delete` 로 바뀐다.
- Verified by `__tests__/buildPlan.test.ts`.

### AC-PLAN-ABSENCE — 부재가 필터의 기제다

- 목적지가 없는 경로는 계획에서 생략된다.
- 지원하지 않는 kind 는 force 를 요구하지 않고 보고된다.
- Verified by `__tests__/buildPlan.test.ts`.

## Last Updated

2026-08-06 — 구현에서 계약을 추출해 최초 작성.
