# buildPlan Specification

## Requirements

- 블록 본문은 Latin-1 byte view로 읽고 원본 바이트로 해시합니다. 중복 ID는 모든 본문을 비교하여 하나라도 다르면 force를 요구합니다. 파일 이름의 마커 바이트도 같은 인코딩으로 비교합니다.

- 매니페스트를 사용하는 실행은 선택한 지원 목적지의 원본 파일만 해시하여 오래된 항목을 실제 바이트와 맞춥니다. 조정한 경로는 source-hash-reconciled 알림으로 모든 출력 방식에 전달하며, 관계없는 파일이나 디렉터리를 더 읽지 않습니다. 깨진 매니페스트는 실행 오류로 남습니다.
- `buildPlan` 은 읽기 전용이다. 파일시스템을 읽어 판정할 뿐 아무것도 쓰지 않는다. 적용은 `injectDocs/` 의 몫이다.
- 매니페스트 항목마다 최대 하나의 action, 발견된 orphan 마다 하나의 action 을 낸다.
- `destinations` 에 없는 경로는 계획에서 통째로 빠진다. 이 부재가 kind 필터 실행이 요청하지 않은 kind 를 보고하지도 삭제하지도 않게 하는 기제다.
- 판정 어휘는 목적지 종류와 무관하다. 파일이든 공유 문서 안의 블록이든 같은 `ActionKind` 를 쓴다. 소비자는 `kind` 를 먼저, `target.kind` 를 나중에 분기한다.
- 파일 목적지 판정: 설치본이 없으면 `copy`, 해시가 같으면 `skip-uptodate`, 다르면 `warn-diverged`.
- 블록 목적지 판정: 문서가 없거나 그 블록이 없으면 `copy`, 본문이 매니페스트와 맞으면 `skip-uptodate`, 아니면 `warn-diverged`.
- `unsupported` 목적지는 `skip-unsupported` 이며 force 를 요구하지 않는다.
- `warn-diverged` 와 발견된 모든 orphan 은 `--force` 여부와 무관하게 `requiresForce` 를 세운다. `requiresForce` 는 적용이 사용자 소유일 수 있는 내용을 덮어쓰거나 지운다는 뜻이다. 렌더러는 `--force` 가 없으면 이것으로 실행을 막고, `--force` 가 있으면 이것으로 대화형 확인과 비대화형 stderr 목록을 띄운다. `--force` 아래의 orphan 이 이 표시를 세우지 않으면 삭제가 확인도 목록도 없이 일어난다.
- orphan 은 `--force` 가 있으면 `delete`, 없으면 `warn-orphan` 으로 나온다.
- orphan 탐색은 호출자가 준 스캔만 돈다. 블록 스캔은 명시된 소유 패키지의 블록만 살피므로 다른 패키지나 다른 도구의 블록은 삭제 후보가 되지 않는다.
- 존재하지 않는 orphan 스캔 루트는 실패가 아니다. 걷기가 조용히 비어 돌아온다.
- 디렉터리 orphan 탐색은 원본 해시 계산과 같은 잡음 필터(`.omc` 구획, `.DS_Store`, `*.log`)로 걸러낸다. orphan 은 이 패키지가 예전에 설치했지만 더 이상 배포하지 않는 내용인데, 잡음 파일은 원본에서 처음부터 빠지므로 설치된 적이 없다. 거르지 않으면 Finder 가 만든 `.DS_Store` 하나가 실행을 종료 코드 2로 막고 `--force` 가 그것을 지운다.
- 한 계획 안에서 같은 공유 문서를 여러 번 읽지 않는다 (`utils/readDocument.ts` 의 계획 단위 캐시).
- 경로 비교는 POSIX 구분자로 정규화해서 한다 (`core/utils/toPosix.ts`).
- 디렉터리 걷기, POSIX 정규화와 잡음 필터는 `core/utils/` 의 공유 organ 에서 온다. `hashManifest/` 도 같은 것을 쓰며, 두 소비자의 최저 공통 fractal 이 `core/` 이기 때문이다. 잡음 목록이 한 곳에 있어야 배포하지 않는 파일과 고아로 보지 않는 파일이 갈라지지 않는다.

- 이름의 대소문자·Unicode 정규화만 다른 후보는 목적지와 dev/ino가 같은지 확인한다. 파일시스템이 동일 파일로 해석하는 이름은 고아가 아니며 삭제하지 않는다. 구분하는 볼륨의 서로 다른 파일은 고아로 유지한다.

- 이름 후보는 대문자·소문자 변환과 NFD 정규화가 더 이상 바뀌지 않는 표기로 한 번 색인한다. 단순 소문자화로 놓치는 sigma·sharp S·long S도 파일시스템의 실제 dev/ino 비교로 보호하며, 고아마다 전체 매니페스트를 다시 정규화하지 않는다.

## API Contracts

- `buildPlan(input: PlanInput): Promise<InjectPlan>`
- `PlanInput` — `{ sourceHashes, destinations, orphanScans, force }`
  - `destinations` 에 없는 `sourceHashes` 키는 무시된다
- `InjectPlan` — `{ actions: readonly Action[]; requiresForce: boolean }`
- `collectFileWrites(plan: InjectPlan): string[]` — `copy` 와 `warn-diverged` 파일 액션의 목적지 경로. 렌더러가 적용 전 쓰기 대상 검사(`agentTarget` 의 `assertWriteTargetsContained`)에 넘긴다. 삭제와 블록 쓰기는 빠진다.

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
- 원본 해시 계산이 무시하는 잡음 파일은 `--force` 여부와 무관하게 orphan 이 아니다.
- 검증: `__tests__/buildPlan.test.ts`, `__tests__/orphanPolicy.test.ts`.

### AC-PLAN-BLOCK — 블록 목적지의 판정

- 문서가 아직 없을 때, 그리고 문서는 있으나 이 블록이 없을 때 모두 `copy` 다.
- 본문이 매니페스트와 여전히 맞으면 `skip-uptodate` 다.
- 손으로 수정된 블록은 `warn-diverged` 가 되고 force 를 요구한다.
- 검증: `__tests__/buildPlan.test.ts`.

### AC-PLAN-ORPHAN — orphan 은 소유한 것만 대상으로 한다

- 이 패키지가 더 이상 배포하지 않는 블록은 `warn-orphan` 으로 경고된다.
- 같은 문서에 있는 다른 패키지의 블록은 건드리지 않는다.
- `--force` 아래에서 낡은 블록은 `delete` 로 바뀐다.
- `--force` 아래에서 `delete` 가 된 orphan 도 `requiresForce` 를 세운다.
- 검증: `__tests__/buildPlan.test.ts`, `__tests__/orphanPolicy.test.ts`.

### AC-PLAN-ABSENCE — 부재가 필터의 기제다

- 목적지가 없는 경로는 계획에서 생략된다.
- 지원하지 않는 kind 는 force 를 요구하지 않고 보고된다.
- 검증: `__tests__/buildPlan.test.ts`.

## Last Updated

복사·생략·삭제의 계획과 강제 적용 판정이 바뀌면 갱신합니다.
