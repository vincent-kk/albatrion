# injectDocs Specification

## Requirements

- 규칙 원본의 검증 캐시는 원본 경로와 문맥을 함께 키로 사용합니다. 파일 복사는 원본 바이트를 파일로 검사하여 닫힌 관리 마커를 허용하고, 블록 삽입은 정규형을 fragment로 검사하여 중첩될 마커를 준비 단계에서 거부합니다. 두 검증과 실제 쓰기는 동일한 스냅샷을 사용하며 에이전트 종류·순서와 계획 후 원본 변경이 이를 바꾸지 않습니다.

- 선택한 규칙 원본과 실제 블록 대상의 Markdown 구획은 계획 준비에서 실행 전체 캐시로 파일과 문맥당 한 번 검증합니다. 열린 fence·HTML 주석 또는 모호한 마커는 파일명·시작 행·이유를 가진 단위 오류이며 해당 단위의 파일과 블록을 모두 쓰지 않습니다. 규칙 원본의 BOM·줄바꿈은 검증과 쓰기에서 같은 정규화 표현을 사용합니다.

- 해석한 실제 파일 목적지가 같고 원본 해시가 다르면 관련 단위 모두를 merge 실패로 처리하여 쓰지 않습니다. 해시가 같으면 첫 참여자의 작업만 적용하고 나머지는 같은 결과를 가리키는 별칭으로 보고합니다. 심볼릭 링크를 거친 같은 실제 목적지도 동일하게 판단합니다. 같은 프로젝트 목적지를 공유하는 agent는 입력 순서상 처음 하나로 계획합니다. 영속 소유 기록은 없으므로 공유 네임스페이스의 패키지들은 force 실행마다 함께 지정합니다. 단일 패키지 실행의 고아 탐색은 참여하지 않은 패키지의 소유권을 알 수 없습니다.

- 원자 교체는 링크가 하나이고 새 파일에 mode·owner·group을 복원할 수 있을 때 사용합니다. 하드 링크가 여럿이거나 소유권 복원이 거부되면 기존 inode에 쓰므로 링크와 그룹을 보존하지만 이 경우에는 crash-atomic하지 않습니다. 쓰기 비트가 없는 파일은 오류로 거부합니다. 사용자 심볼릭 링크는 실제 대상에 쓰며 끊긴 링크는 링크를 교체하지 않고 오류로 거부합니다.

- 계획과 결과는 core가 한 번 계산하며 일반·JSON·터미널은 그 모델을 표시합니다. 입력 화면은 누락된 인자와 확인 응답만 전달하고 같은 코어 실행 경로를 사용합니다.
- 각 단위의 key는 agent와 package를 결합한 코어 식별자입니다. 공유 스킬 네임스페이스의 관리 경로는 실행 전체에서 합쳐 다른 참여 패키지 파일을 고아로 삭제하지 않습니다.
- 일반 목적 orchestrator 객체와 렌더러별 기본 연산 조립은 금지합니다. 출력 방식에 따른 판정 차이를 막기 위해 작은 준비 함수·순수 계획 병합·결과 모델·단일 적용기만 사용합니다.

- `partitionActions` 는 계획을 병렬 가능한 일과 직렬화해야 하는 일로 가른다. 파일 복사·삭제는 서로 독립이므로 하나의 풀로, 블록 쓰기는 도착 문서별로 묶인다.
- 블록을 문서별로 묶는 이유는 여러 블록이 보통 하나의 `AGENTS.md` 를 공유하고, 동시 기록자가 각자 읽은 판본을 저장하면 마지막 하나의 변경만 남기 때문이다.
- 아무것도 바꾸지 않는 판정은 버려진다. `copy` 와 `delete` 는 항상 실행 가능하고, `warn-diverged` 는 force 가 주어졌을 때에만 실행 가능하다. CLI 의 "`--force` 는 덮어쓴다" 는 약속이 지켜지는 지점이 바로 여기다.
- `applyAction` 은 `file` 목적지만 다룬다. 블록 목적지가 들어오면 실패하지 않고 아무것도 하지 않는다 — 계획 전체를 풀에 먹이는 호출자가 실수로 문서를 망가뜨릴 수 없게 한다.
- `applyAction` 은 `copy` 와 `warn-diverged` 에서 상위 디렉터리를 만들고 소스를 복사한다. `delete` 에서 `ENOENT` 는 조용히 넘어가고, 그 외 실패는 호출자에게 전파한다.
- 원자 교체가 가능한 공유 문서는 같은 디렉터리의 임시 파일에 완전히 쓴 뒤 소유권과 mode를 복원하고 rename으로 교체합니다. 이 경로가 실패하면 원본을 유지하고 임시 파일을 정리합니다. in-place 경로는 같은 inode의 내용만 바꾸며 중간 쓰기 실패의 부분 기록은 알려진 한계입니다.
- `applyBlockActions` 는 하나의 공유 문서를 한 번의 read-modify-write 로 처리한다. 문서가 없으면 빈 내용에서 시작하고, 상위 디렉터리를 만들어 쓴다.
- 문서 변환은 바이트와 일대일 대응하는 문자열로 원본을 유지하고, 새 마커만 UTF-8로 인코딩하고 본문은 markerBlock의 바이트 정규형을 그대로 씁니다. 손상된 UTF-8이나 다른 인코딩의 사용자 본문도 재인코딩하지 않습니다.
- 이 도구의 블록 바깥 내용은 바이트 단위로 살아남는다. 문서는 다른 도구와 사용자의 땅이기도 하다.
- 강제 적용으로 실제 덮어쓴 항목은 updated에 기록하고 diverged 경고에서 제외합니다. 미적용·미리보기·실패한 항목은 갱신으로 보고하지 않습니다.
- `summarize` 는 순수하다. 계획이 이미 모든 판정을 담고 있으므로 파일시스템도 환경변수도 읽지 않는다.
- `skip-uptodate` 와 `skip-unsupported` 는 함께 `skipped` 로 집계되고, `warn-diverged` 와 `warn-orphan` 은 사유(`'diverged'` / `'orphan'`)를 단 `warnings` 로 집계된다.
- `exitCode` 는 호출자가 정해 넘기며 `InjectReport` 를 통해 전파된다.

- 파일 풀의 거부와 블록 적용 실패는 종료 코드 1로 보고한다. 실패한 작업은 생성·삭제 목록에서 제외하고 failed 경고에 기록하여 부분 성공을 실패로 위장하지 않는다.
- 적용하지 않은 단위의 보고는 생성·갱신·삭제를 실제 결과로 집계하지 않는다. force 거부는 기존 종료 코드 2와 무변경을 유지한다. 오류가 없는 dry-run만 계획의 생성·삭제를 미리보기로 집계하며, 계획 자체는 결과 보고와 별도로 그대로 보존한다.

## API Contracts

### 참여자와 실행 상태 모델

- 실행은 입력 검증, 전체 참여자 준비, 네임스페이스 병합, 확인, 적용, 결과 표시 순서입니다. 표시는 실행을 다시 판정하지 않습니다. 참여자는 패키지와 에이전트의 쌍이며 준비 중 성공 또는 실패가 됩니다. 실패는 해시 읽기, 원본 확인, Markdown 검증, 목적지 포함 관계 검증의 어느 단계에서도 생길 수 있습니다.
- 네임스페이스의 삭제 권한은 그곳에 파일을 소유할 수 있는 모든 참여자의 준비 성공으로만 얻습니다. 한 참여자의 실패로 소유 목록을 알 수 없으면 그 참여자가 접근할 수 있는 목적지의 고아 삭제를 모두 억제합니다. force는 이 불변식을 우회하지 않습니다. 실패자의 네임스페이스를 좁힐 증거가 없으면 같은 목적지의 모든 네임스페이스를 보호합니다.
- 준비 실패자와 실패 이유는 결과에 남습니다. 다른 참여자의 복사는 계속할 수 있으나 보호된 고아 파일은 삭제되지 않습니다. 참여자가 모두 성공하면 실행 전체의 관리 파일 합집합을 먼저 계산하고 그 밖의 고아만 force 아래에서 삭제합니다.
- runInjection과 executeUnits는 실행 완료 시 최종 결과 하나를 만듭니다. 진행 화면은 같은 계획과 실패 기록을 전달받고 최종 화면은 이 최종 결과를 표시합니다. 일반·JSON·터미널은 동일한 실패와 종료 코드를 표시합니다. JSON 표준 출력에는 종료 코드와 관계없이 문서 하나가 있습니다.
- 종료 코드의 단일 기준은 최상위 `src/DETAIL.md`의 종료 판정 표입니다. 미리보기는 강제 적용 필요로 차단하지 않지만 준비 오류를 숨기지 않으며 적용만 생략합니다.
- discover는 명시된 패키지 또는 스코프 별칭에서 발견한 디렉터리마다 참여자 기록을 남깁니다. agents.assetPath를 선언하지 않은 정상 패키지는 opt-out이며 소유 후보가 아닙니다. 읽거나 파싱할 수 없는 package.json, 해석 실패와 gate 실패는 opt-out으로 바꾸지 않습니다. 이름·manifest를 알 수 없는 실패자는 선택된 모든 agent 목적지의 모든 네임스페이스를 보호합니다. 이 보호는 prepare 전부터 적용합니다.
- 네임스페이스 키는 해석한 목적지 루트·asset kind·스킬 접두사입니다. 명확한 실패자의 소유 접두사를 알 수 있으면 그 접두사만 보호하며, 알 수 없으면 해당 루트 전체를 보호합니다. 실행 가능한 형제 계획의 보호된 delete 또는 warn-orphan은 적용 액션에서 빠지고 참여자·경로·이유를 가진 notice가 됩니다. force 확인과 deleted·created·updated 집계에는 나타나지 않으며 notice 자체는 종료 코드를 높이지 않습니다.
- 거부된 유닛은 원래 계획을 진단 증거로 보관하고 refused=true·requiresForce=false로 표시하며 모든 액션을 실행과 force 확인에서 제외합니다.
- 일반·JSON·터미널은 거부된 계획의 액션을 diagnostic 표시로만 보여 주며 JSON 단위의 diagnosticOnly는 refused에 대응합니다.
- 최종 RunResult는 units, errors, failures, notices, exitCode, dryRun을 담습니다. 실패는 unitKey(단위를 아직 모르면 요청 식별자), path(실제 목적지 또는 원본의 절대 경로, 발견 전이면 요청 문자열), stage(discover, gate, prepare, merge, apply), reason입니다. notice도 같은 경로·단계·이유를 가지며 실패와 별도로 집계합니다. units의 report는 성공한 액션만 집계하고 실패한 경로는 모든 출력의 마지막 화면에서 같은 이유와 함께 읽을 수 있습니다.
- 복사·삭제와 문서 쓰기는 쓰기 비트 없는 기존 대상과 dangling link를 거부합니다. 유효한 사용자 링크는 실제 대상을 사용하고 링크를 유지합니다. 프로젝트 링크의 외부 탈출은 계획 단계에서 거부합니다. 고아 삭제는 디렉터리 항목 자체를 unlink하며 링크를 따라가지 않습니다. 명시적으로 계획된 dangling orphan link도 그 항목만 제거하며 ENOENT는 무시합니다. 일반 고아 탐색이 내놓지 않는 링크는 그대로 둡니다. 파일 덮어쓰기도 문서와 동일하게 단일 링크·owner·group·mode 복원 가능 시 원자 교체하고, 그렇지 않으면 inode를 보존하는 in-place 쓰기를 사용합니다. 하드 링크와 owner·group의 원자 교체 조건은 Requirements의 규칙을 따릅니다.
- 두 프로세스의 동시 쓰기는 잠그지 않으므로 마지막 쓰기가 남습니다. 원자 쓰기 임시 디렉터리는 목적지 옆의 고유한 .agents-assets-sync- 접두사이며 고아 검색에서 제외합니다. in-place 경로의 중간 실패는 부분 바이트를 남길 수 있으나 실패 경로와 이유를 보고하고 다음 작업은 계속합니다.
- 생성 검증은 참여자 1~3개와 agent 1~3개(codex+agents 별칭 포함), 공유·분리 namespace, 같은·다른 hash 충돌, discover·prepare·merge·apply 실패, force·dry-run·yes 및 세 출력 모드를 조합합니다. 목적지는 없음·0444·0640·하드 링크·유효/끊어진 user/project 링크·case 별칭·파일 사이 실패를 포함합니다.
- 생성 검증은 규칙 원본의 BOM 개수·줄바꿈·블록/파일 검증 문맥, 에이전트 종류와 순서, 계획과 적용 사이 원본 변경을 조합하여 검사한 스냅샷만 쓰는지 비교합니다.
- 생성 검증은 여러 참여자와 공유 네임스페이스, 각 준비 단계 실패, force 양쪽 값, 모든 출력 모드를 비교합니다. 실패한 참여자가 소유할 수 있는 파일은 어떤 생성 실행에서도 삭제되지 않습니다.

- `partitionActions(actions: readonly Action[], force: boolean): { fileActions: Action[]; blockGroups: Map<string, Action[]> }`
  - `blockGroups` 의 키는 문서의 절대 경로
- `applyAction(action: Action, assetRoot: string): Promise<void>`
  - `file` 이외의 목적지에서는 무동작
- `applyBlockActions(fileAbs: string, actions: readonly Action[], assetRoot: string): Promise<void>`
- `summarize(plan: InjectPlan, exitCode: 0 | 1 | 2, failedActions?: readonly Action[], appliedActions?: readonly Action[]): InjectReport`
  - 실제 적용한 액션을 전달하면 실패 항목을 제외한 강제 덮어쓰기를 updated로 집계합니다. 생략하면 미리보기 의미를 유지합니다.

### 최종 결과의 JSON 사상

RunResult는 모듈 내부 실행 계약이며 패키지의 새 공개 API가 아닙니다. JSON의 units, errors, failures, notices, exitCode, dryRun은 같은 이름의 최종 결과 필드에 대응합니다. units는 key·aliasOf·package·agent·scope·projectRoot·destination·requiresForce·actions·report와 단위 오류를 표시하며 package는 target의 name/version, destination은 agentTarget.description입니다. failures와 notices의 unitKey·path·stage·reason은 그대로 직렬화합니다. schemaVersion·tool·version은 출력 문서의 고정 메타데이터입니다. 일반·터미널도 동일한 진단 레코드를 표시하며 렌더러가 실패를 새로 분류하지 않습니다.

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
