# injectDocs Specification

## Requirements

- 선택한 규칙 원본과 실제 블록 대상의 Markdown 구획은 계획 준비에서 실행 전체 캐시로 파일당 한 번 검증합니다. 열린 fence·HTML 주석 또는 지원하지 않는 중첩 fence는 파일명·시작 행·수정 방법을 가진 단위 오류이며 해당 단위의 파일과 블록을 모두 쓰지 않습니다. 다른 단위는 계속 처리합니다. 원본을 자동으로 닫거나 정규화하지 않습니다.

- 같은 파일 목적지의 서로 다른 원본 해시는 관련 단위의 실행 오류이며 쓰지 않습니다. 같은 프로젝트 목적지를 공유하는 agent는 입력 순서상 처음 하나로 계획합니다. 영속 소유 기록은 없으므로 공유 네임스페이스의 패키지들은 force 실행마다 함께 지정합니다. 단일 패키지 실행의 고아 탐색은 참여하지 않은 패키지의 소유권을 알 수 없습니다.

- 원자 교체는 기존 mode 비트를 그대로 보존하며 쓰기 비트가 없는 파일은 오류로 거부합니다. 사용자 심볼릭 링크는 실제 대상에 쓰며 끊긴 링크는 링크를 교체하지 않고 오류로 거부합니다. 대상을 새로 추측하면 사용자 dotfiles 구성을 바꾸기 때문입니다.

- 계획과 결과는 core가 한 번 계산하며 일반·JSON·터미널은 그 모델을 표시합니다. 입력 화면은 누락된 인자와 확인 응답만 전달하고 같은 코어 실행 경로를 사용합니다.
- 각 단위의 key는 agent와 package를 결합한 코어 식별자입니다. 공유 스킬 네임스페이스의 관리 경로는 실행 전체에서 합쳐 다른 참여 패키지 파일을 고아로 삭제하지 않습니다.
- 일반 목적 orchestrator 객체와 렌더러별 기본 연산 조립은 금지합니다. 출력 방식에 따른 판정 차이를 막기 위해 작은 준비 함수·순수 계획 병합·결과 모델·단일 적용기만 사용합니다.

- `partitionActions` 는 계획을 병렬 가능한 일과 직렬화해야 하는 일로 가른다. 파일 복사·삭제는 서로 독립이므로 하나의 풀로, 블록 쓰기는 도착 문서별로 묶인다.
- 블록을 문서별로 묶는 이유는 여러 블록이 보통 하나의 `AGENTS.md` 를 공유하고, 동시 기록자가 각자 읽은 판본을 저장하면 마지막 하나의 변경만 남기 때문이다.
- 아무것도 바꾸지 않는 판정은 버려진다. `copy` 와 `delete` 는 항상 실행 가능하고, `warn-diverged` 는 force 가 주어졌을 때에만 실행 가능하다. CLI 의 "`--force` 는 덮어쓴다" 는 약속이 지켜지는 지점이 바로 여기다.
- `applyAction` 은 `file` 목적지만 다룬다. 블록 목적지가 들어오면 실패하지 않고 아무것도 하지 않는다 — 계획 전체를 풀에 먹이는 호출자가 실수로 문서를 망가뜨릴 수 없게 한다.
- `applyAction` 은 `copy` 와 `warn-diverged` 에서 상위 디렉터리를 만들고 소스를 복사한다. `delete` 에서 `ENOENT` 는 조용히 넘어가고, 그 외 실패는 호출자에게 전파한다.
- 공유 문서의 새 내용은 같은 디렉터리의 임시 파일에 완전히 쓴 뒤 rename으로 교체합니다. 실패하면 원본과 권한을 유지하고 임시 파일을 정리하여 부분 기록이 사용자 내용을 잃게 하지 않습니다.
- `applyBlockActions` 는 하나의 공유 문서를 한 번의 read-modify-write 로 처리한다. 문서가 없으면 빈 내용에서 시작하고, 상위 디렉터리를 만들어 쓴다.
- 문서 변환은 바이트와 일대일 대응하는 문자열로 원본을 유지하고, 새 마커와 본문만 UTF-8로 인코딩합니다. 손상된 UTF-8이나 다른 인코딩의 사용자 본문도 재인코딩하지 않습니다.
- 이 도구의 블록 바깥 내용은 바이트 단위로 살아남는다. 문서는 다른 도구와 사용자의 땅이기도 하다.
- 강제 적용으로 실제 덮어쓴 항목은 updated에 기록하고 diverged 경고에서 제외합니다. 미적용·미리보기·실패한 항목은 갱신으로 보고하지 않습니다.
- `summarize` 는 순수하다. 계획이 이미 모든 판정을 담고 있으므로 파일시스템도 환경변수도 읽지 않는다.
- `skip-uptodate` 와 `skip-unsupported` 는 함께 `skipped` 로 집계되고, `warn-diverged` 와 `warn-orphan` 은 사유(`'diverged'` / `'orphan'`)를 단 `warnings` 로 집계된다.
- `exitCode` 는 호출자가 정해 넘기며 `InjectReport` 를 통해 전파된다.

- 파일 풀의 거부와 블록 적용 실패는 종료 코드 1로 보고한다. 실패한 작업은 생성·삭제 목록에서 제외하고 failed 경고에 기록하여 부분 성공을 실패로 위장하지 않는다.
- 적용하지 않은 단위의 보고는 생성·갱신·삭제를 실제 결과로 집계하지 않는다. force 거부는 기존 종료 코드 2와 무변경을 유지한다. 오류가 없는 dry-run만 계획의 생성·삭제를 미리보기로 집계하며, 계획 자체는 결과 보고와 별도로 그대로 보존한다.

## API Contracts

- `partitionActions(actions: readonly Action[], force: boolean): { fileActions: Action[]; blockGroups: Map<string, Action[]> }`
  - `blockGroups` 의 키는 문서의 절대 경로
- `applyAction(action: Action, assetRoot: string): Promise<void>`
  - `file` 이외의 목적지에서는 무동작
- `applyBlockActions(fileAbs: string, actions: readonly Action[], assetRoot: string): Promise<void>`
- `summarize(plan: InjectPlan, exitCode: 0 | 1 | 2, failedActions?: readonly Action[], appliedActions?: readonly Action[]): InjectReport`
  - 실제 적용한 액션을 전달하면 실패 항목을 제외한 강제 덮어쓰기를 updated로 집계합니다. 생략하면 미리보기 의미를 유지합니다.

## Exported Types

- `InjectReport` — `{ created, updated, skipped, warnings, deleted, exitCode }`
  - `warnings: { relPath: string; reason: string }[]`

## Acceptance Criteria

### AC-APPLY-PARTITION — force 가 실행 가능성을 결정한다

- 파일 작업과 블록 작업은 갈라지고, 블록은 도착 문서별로 묶인다.
- 아무것도 바꾸지 않는 판정은 어느 쪽에도 들어가지 않는다.
- `warn-diverged` 는 force 가 주어졌을 때에만 실행 가능해진다.
- 검증: `__tests__/applyActions.test.ts`.

### AC-APPLY-BLOCK — 공유 문서는 한 번에 통째로 쓰인다

- 문서와 그 상위 디렉터리가 없으면 만들어진다.
- 기존 문서에 덧붙일 때 외부 내용은 흐트러지지 않는다.
- 같은 복사를 두 번 적용해도 블록은 하나로 남는다.
- 한 문서에 대한 두 블록은 한 번의 통과로 함께 쓰인다.
- force 아래에서 diverged 블록은 소스 본문으로 덮어써진다.
- 삭제는 지명된 블록만 지우고 외부 블록은 그대로 둔다. 삭제가 문서를 비우면 문서 내용은 빈 문자열이 된다.
- 검증: `__tests__/applyActions.test.ts`.

### AC-APPLY-FILE — 파일 적용은 자기 몫만 한다

- 복사는 없는 상위 디렉터리를 만들어 가며 수행된다.
- 블록 목적지가 들어오면 무시된다 — 그 일은 `applyBlockActions` 의 몫이다.
- 검증: `__tests__/applyActions.test.ts`.

## Last Updated

파일·블록 적용 및 결과 집계 계약이 바뀌면 갱신합니다.
