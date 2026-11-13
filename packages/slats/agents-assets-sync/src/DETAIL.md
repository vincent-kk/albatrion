# agents-assets-sync Specification

## Requirements

- 렌더러는 대상의 실행 가능 여부를 다시 판정하지 않습니다. 새 렌더러를 추가해도 출력 방식에 따라 종료 코드가 달라지지 않게 하기 위한 경계입니다.
- `@canard/schema-form@0.12.0`이 의존하는 `@slats/claude-assets-sync@^0.2.0`은 설치 호환성을 위해 레지스트리에 남겨야 합니다.

- 엔진은 `inject-agents-settings` 실행 파일(명령 분배기) 하나를 노출합니다. 소비자는 `package.json`에 `agents.assetPath`를 선언하거나 호출자가 `--asset-path`로 지정합니다. 엔진은 이 트리를 선택된 각 에이전트가 사용하는 위치에 주입하며, 호출마다 명시한 대상 하나 또는 스코프 별칭으로 지정한 배치를 처리합니다.
- 모든 선택은 플래그로 지정할 수 있습니다. `--package`, `--agent`, `--scope`와 내용이 달라진 경우의 `--force --yes`를 지정한 실행은 질문 없이 완료됩니다.
- `--package=<name>`은 필수입니다. 명령 분배기는 `createRequire(...).resolve()`로 해당 패키지의 `package.json`을 해석하여 `{ name, version, agents.assetPath }`를 읽으며, `--asset-path`가 주어지면 선언 대신 사용합니다. 따라서 `createRequire`가 볼 수 있는 대상만 접근할 수 있습니다. 대상의 `exports`가 `./package.json`을 노출하거나 주 진입점을 require할 수 있어야 합니다. 이 패키지는 자신의 매니페스트를 노출하므로 ESM 전용이어도 자신의 명령 분배기로 지정할 수 있습니다.
- `--agent=<claude|codex|agents>`는 반복 지정과 쉼표로 구분한 값을 허용합니다. 생략하면 대화형 TTY는 선택 화면을 표시하고 다른 모든 환경에서는 2로 종료합니다. 두 에이전트를 선택한 실행은 쌍마다 계획 하나를 만듭니다.
- `--asset=<skills|rules|commands>`는 실행 범위를 좁힙니다. 제외한 종류는 계획에 없으므로 실행 중 그 종류의 항목을 보고하거나 삭제하지 않습니다.
- `--asset-path=<path>`는 자산을 `agents/`나 `docs/` 같은 디렉터리에 배포하지만 선언하지 않은 패키지를 위해 각 대상의 패키지 루트에 상대적인 자산 루트를 지정합니다. 모든 대상에서 `agents.assetPath`를 덮어쓰고 해당 디렉터리만 해시 원본으로 삼으므로 `dist/agents-hashes.json`을 읽거나 요구하지 않습니다. 빈 값·절대 경로·`~`로 시작하는 값은 파일시스템 IO 전에 2로 종료합니다. 패키지 루트 밖의 경로나 디렉터리를 가리키지 않는 경로는 단일 대상이면 2로 종료하고 배치에서는 건너뜁니다.
- 항목별 SHA-256 비교에서 없으면 복사하고 같으면 건너뛰며 다르면 경고하고 `--force`를 요구합니다. codex 규칙 블록도 마커 사이의 본문으로 같은 방식으로 비교합니다.
- `--force`는 내용이 달라진 항목을 덮어씁니다. TTY에서는 `--yes`가 없으면 Ink의 `ConfirmForce` 대화상자가 먼저 내용이 달라진 항목과 고아 항목을 나열합니다. 비대화형 실행에서는 목록을 stderr에 쓰고 실행을 계속합니다.
- `--dry-run`은 계획만 출력하고 쓰지 않습니다.
- `--json`은 stdout에 JSON 문서 하나만 쓰고 모든 진단을 stderr로 보내는 세 번째 렌더러를 선택합니다. `--no-interactive`는 대신 일반 텍스트 렌더 경로를 강제합니다. 문서는 `schemaVersion`, `dryRun`, `exitCode`, `errors`와 `(package, agent)` 쌍마다 목적지·계획 액션·보고를 담는 `unit` 하나를 가집니다. 플래그 오류는 `exitCode: 2` 및 빈 `units`와 함께 `errors`에 들어갑니다. 실행을 실패시키지 않은 각 대상의 생략 사유도 `errors`에 들어가므로 `errors`가 비어 있지 않다는 사실만으로 `exitCode`가 2인 것은 아닙니다. 렌더러보다 앞선 실패는 stdout을 비워 두고 종료 코드로만 보고합니다.
- 대화형 TTY 밖에서 `--scope`나 `--agent`가 없으면 2로 종료합니다.
- `--package` 누락, 해석할 수 없는 패키지, `--asset-path` 없이 `agents.assetPath` 누락, 유효하지 않은 `--agent`·`--asset`·`--asset-path` 값은 2로 종료합니다.
- 자산 루트가 패키지 밖으로 해석되면 선언된 `agents.assetPath`와 `--asset-path` 중 어느 쪽에서 지정했든 거부합니다. 표기가 아니라 해석한 위치로 판단하므로 패키지 밖으로 향하는 심볼릭 링크도 거부합니다.
- `dist/agents-hashes.json`(스키마 v1)은 빌드 때 `buildHashes`로 생성하며 `previousVersions: {}`는 향후 사용을 위해 예약합니다. `--asset-path`를 사용한 실행은 같은 문서를 메모리에서 계산하므로 빌드 출력이 필요하지 않습니다.
- 선언된 `agents.assetPath`에 해당 파일이 없으면 같은 메모리 계산으로 대체하여 빌드하지 않은 패키지도 주입할 수 있습니다. 이 대체에는 선언된 디렉터리가 있어야 합니다. 없는 디렉터리의 해시는 빈 매니페스트로 성공하고 빈 매니페스트는 설치된 파일을 모두 `--force`가 삭제하는 고아 항목으로 만들기 때문입니다. 둘 다 없으면 대상을 보고하고 계획하지 않습니다.
- 그 대상은 `agents.assetPath`가 없는 대상과 같은 방식으로 거부합니다. 패키지 하나를 지정한 실행은 2로 종료하고, 여러 패키지나 스코프 전체를 지정하면 생략을 보고합니다. 렌더러를 고르기 전에 거부하므로 이 판정은 실행의 책임이며 `--json`에 따라 달라지지 않습니다.
- `--version`, Ink 배너·바닥글, `--json` 문서가 보고하는 버전은 모두 `scripts/inject-version.js`가 `package.json`에서 생성한 `utils/version.ts`를 사용합니다. `yarn version:sync`는 이 생성기를 실행하고 `build`, `dev` 및 각 `version:major|minor|patch` 변경이 이를 거치므로 보고하는 버전이 변경에서 뒤처지지 않습니다.

## API Contracts

- `runCli(argv: string[]): Promise<void>`는 CLI 진입점입니다. 플래그를 읽고 대상을 해석한 뒤 `renderOrFallback`으로 Ink(`ui.renderInjectApp`) 또는 일반 텍스트(`renderPlain`)로 분기합니다. 다른 프로그래밍용 실행 조율기는 노출하지 않으며 비대화형 동작이 필요한 호출자는 코어 기본 연산을 직접 조합합니다.
- `.`에서 재수출하는 코어 기본 연산은 `readHashManifest`, `computeNamespacePrefixes`, `resolveProjectRoot`, `resolveAgentTarget`, `resolveDestinations`, `formatBlockId`, `parseBlocks`, `isValidScope`, `isValidAgent`, `MARKER_PREFIX`, `PROJECT_ANCHORS`, `PROJECT_ROOT_MARKERS`, `HASH_MANIFEST_FILENAME`입니다. 전체 계약은 `core/DETAIL.md`에 있습니다.
- `buildHashes(opts): Promise<{ outPath, fileCount }>`는 `./buildHashes` 서브패스(Node ESM)이며 독립 CLI는 `agents-build-hashes`입니다. `packageRoot`, `packageName`, `packageVersion`, `assetPath` 네 값은 모두 필수입니다. 없으면 구현이 예외를 던지고 타입 선언도 이를 명시합니다. `.omc/**`, `*.log`, `.DS_Store`는 무시합니다.

## 서브패스 내보내기

- `.` — ESM, `runCli` + 코어 기본 연산 + 타입
- `./buildHashes` — Node ESM; `buildHashes`
- `./package.json`은 매니페스트 자체입니다. ESM 전용 패키지는 `createRequire`에서 보이지 않고 명령 분배기는 모든 대상을 이 방식으로 읽으므로, 이 서브패스를 막으면 엔진 자신만 자신의 CLI로 주입할 수 없는 패키지가 됩니다.

## 내보내는 타입

- `Scope`, `ProjectRootResolution`, `AssetType`
- `AgentType`, `AssetKind`, `AgentTarget`, `Destination`, `OrphanScan`
- `HashManifest`, `InjectReport`

작업 함수와 화면 사건의 함수형 표기는 인자·반환 Promise·실패 전파를 보존합니다. 공통 별칭은 호출 감싸개가 아니므로 pool의 동시 실행이나 명령 종료 코드의 소유권을 바꾸지 않습니다.

## Acceptance Criteria

### AC-JSON — 기계가 읽는 출력은 문서 하나입니다

- `--json`으로 CLI를 실행하면 stdout 전체가 `schemaVersion: 1`인 JSON 객체 하나로 파싱됩니다.
- 에이전트가 여럿이면 문서는 `(package, agent)` 쌍마다 목적지와 액션을 명시하는 `unit` 하나를 담습니다.
- 유효하지 않은 `--agent`가 주어져도 문서를 파싱할 수 있고 `exitCode`는 2이며 `errors`는 문제의 값을 명시합니다.
- 해석할 수 없는 `--package`가 주어지면 stdout은 비어 있고 진단은 stderr에 있습니다.
- `--asset-path`가 주어지면 unit은 실제 계획을 담고 매니페스트 오류는 없습니다. 디렉터리 원본도 매니페스트 원본과 같은 경로로 문서에 도달합니다.
- 모든 대상을 건너뛰어도 `units: []`와 `exitCode: 0`인 문서를 출력하며 `errors`는 각 생략 사유를 담습니다. 아무것도 해석하지 못한 실행도 작업을 하지 않은 실행이며, 문서가 없으면 읽는 쪽에서 이를 비정상 종료와 구별할 수 없습니다.
- `__tests__/json.test.ts`에서 검증합니다.

### AC-CLI-FLAGS — 질문 없이 CLI를 구동할 수 있습니다

- `--package`, `--agent`, `--scope`를 지정하고 비TTY 환경에서 CLI를 실행하면 질문 없이 완료됩니다.
- 비TTY 환경에서 `--agent`가 없으면 2로 종료합니다.
- 알 수 없는 `--agent`나 `--asset` 값이 주어지면 2로 종료합니다.
- `__tests__/cli.test.ts`에서 검증합니다.

### AC-CLI-ROUTING — 각 에이전트가 자신의 계획을 받습니다

- `--agent=claude,codex`가 주어지면 출력은 에이전트마다 구획 하나를 가집니다.
- `project` 스코프에 `--agent=codex`가 주어지면 규칙 항목은 병합 대상인 `AGENTS.md`를 명시하고 스킬 항목은 `.agents/skills`를 명시합니다.
- `--agent=codex --asset=skills`가 주어지면 `AGENTS.md` 항목은 나타나지 않습니다.
- `__tests__/cli.test.ts`에서 검증합니다.

### AC-CLI-ASSET-PATH — 선언하지 않은 자산 트리도 주입할 수 있습니다

- `agents.assetPath`와 `dist/agents-hashes.json`이 없는 패키지에 실행 시 `--asset-path`를 넘기면 계획은 그 디렉터리의 파일을 나열하고 매니페스트 진단은 나타나지 않습니다.
- 같은 패키지에 `--asset-path`를 넘기지 않으면 2로 종료합니다.
- `--asset`과 `--asset-path`를 함께 넘겨도 어느 쪽도 다른 쪽의 값을 소비하지 않습니다.
- 절대 경로인 `--asset-path`를 넘기면 2로 종료합니다.
- 스코프 별칭과 `--asset-path`를 넘기면 해당 디렉터리를 보유한 패키지만 계획하고 나머지는 건너뜁니다. 선언을 필터로 사용하지 않습니다.
- `__tests__/cli.test.ts`에서 검증합니다.

### AC-CLI-UNBUILT-MANIFEST — 선언된 자산 트리는 빌드 전에도 주입할 수 있습니다

- `agents.assetPath`를 선언하고 `dist/agents-hashes.json`을 배포하지 않는 패키지를 `--asset-path` 없이 지정하면 실행 시 선언된 디렉터리의 해시를 계산하고 계획에 파일을 나열합니다.
- 같은 패키지에 선언된 디렉터리도 없으면 어떤 원본도 응답할 수 없습니다. 실행은 그 사실을 명시하고 대상을 계획하지 않습니다.
- 그 패키지만 지정하면 `--json` 사용 여부와 무관하게 2로 종료합니다.
- 사용 가능한 패키지와 함께 스코프 별칭으로 도달하면 `--json` 사용 여부와 무관하게 0으로 종료하고 사용 가능한 패키지를 계획합니다.
- `__tests__/cli.test.ts`에서 검증합니다.

### AC-ASSET-PATH-APPLY — 계산한 매니페스트는 계획뿐 아니라 적용도 구동합니다

- 처음 적용하는 실행에서는 지정한 디렉터리의 모든 자산이 원본 바이트 그대로 목적지에 도착합니다.
- 아무것도 바꾸지 않은 두 번째 실행은 최신 상태를 보고하고 다시 쓰지 않습니다.
- 로컬 복사본을 편집하면 실행은 `--force`를 요구하며 2로 종료합니다. `--force`는 원본 바이트를 복원하고 덮어쓴 항목을 stderr에 명시합니다.
- 원본 디렉터리를 편집하면 다음 실행은 중간 빌드 없이 변경을 감지하며 `--force` 뒤의 실행은 최신 상태로 정착합니다.
- `--agent=codex`를 사용하면 규칙을 `AGENTS.md`에 마커 블록으로 병합합니다. 반복 실행은 멱등이며 이 도구의 마커 밖 내용은 바이트 단위로 보존됩니다.
- `__tests__/assetPathRoundTrip.test.ts`에서 검증합니다.

### AC-VERSION-SYNC — 보고하는 버전은 매니페스트 버전입니다

- 생성된 `utils/version.ts`의 `VERSION`은 `package.json`의 `version` 필드와 같습니다.
- `__tests__/version.test.ts`에서 검증합니다.

- 종단 간 시험은 빌드한 실행 파일을 구동하므로 `dist/`가 검증 대상을 결정합니다. `dist/`가 없거나 `src/`보다 오래되면 생략 사유를 명시하고 실행을 거부합니다. 조용한 생략은 검증 공백을 숨기고 오래된 빌드는 실행하지 않은 코드의 통과를 보고하기 때문입니다. 이 비교에서는 검증 파일을 제외하므로 시험을 편집해도 다시 빌드할 필요는 없습니다.
- 이 시험은 임시 루트에 자신의 소비자 패키지를 설치합니다. 형제 워크스페이스의 `dist/agents-hashes.json`에 의존하면 안 됩니다. 이 파일은 git에서 무시하고 이 패키지의 빌드로 생성하지 않으므로 새 체크아웃에서 같은 결과를 재현할 수 없기 때문입니다.


## Last Updated

CLI 대상 판정, 해시 원본 또는 공개 실행 계약이 바뀌면 갱신합니다.
