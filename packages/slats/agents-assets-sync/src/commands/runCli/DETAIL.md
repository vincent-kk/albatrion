# runCli Specification

## Requirements

- `runCli(argv)` 는 유일한 CLI 진입점이며, argv 에서 `--package <name...>` 을 읽는다. 미리 해석된 메타데이터는 받지 않는다.
- `--package` 는 세 가지 모양을 받는다:
  - `@<scope>` — 그 npm scope 아래 설치된 패키지를 열거
  - `@<scope>/<name>` — scoped 패키지 하나
  - `<name>` — unscoped 패키지 하나 그 밖의 모양은 파일시스템 IO 이전에 2로 종료한다.
- 모든 가변 플래그는 하나의 수집기를 공유한다. 플래그 반복과 쉼표 구분이 같은 결과를 낸다 — `--flag a,b --flag c` 와 `--flag a --flag b --flag c`.
- 플래그: `--package <name...>`, `--agent <type...>`, `--scope <user|project>`, `--asset <kind...>`, `--asset-path <path>`, `--dry-run`, `--force`, `--yes`, `--no-interactive`, `--root <path>`, `--json`.
- `--asset-path` 은 단일 값이며 `--asset` 과 별개다. commander 는 long option 을 완전 일치로 매칭하고 가변 수집은 `-` 로 시작하는 다음 토큰에서 멈추므로, `--asset skills --asset-path agents` 도 서로를 삼키지 않는다.
- `--asset-path` 의 모양 검증은 파일시스템 IO 이전에 action 에서 한다 — 빈 값, 절대 경로, `~` 로 시작하는 값은 2로 종료한다. 경로가 packageRoot 안에 있는지와 실제로 디렉터리인지는 타깃마다 다르므로 `resolvePackage` 가 판정한다.
- `--asset-path` 오류는 `--json` 이어도 action 에서 종료한다. `--package` 누락과 같은 계층이라 stdout 은 비고 진단은 stderr 로만 나간다.
- `--package` 값이 하나도 없으면 2로 종료한다. 해석된 패키지가 0개면 경고만 남기고 0으로 끝난다 — 아무 일도 하지 않은 것은 실패가 아니다. 다만 `--json` 은 그 경우에도 렌더러까지 진행해 `units: []` 인 문서를 낸다. 문서가 없으면 소비자가 "성공했지만 대상이 없음" 과 파싱 실패를 구분할 수 없기 때문이다.
- `renderOrFallback` 은 target 해석 이후 실행당 정확히 한 번 호출되며 렌더러 분기를 소유한다. 분기 순서: `--json` → `renderJson`; 비TTY 이거나 `flags.interactive === false` → `renderPlain`; 나머지 → `ui/` 동적 import. 패키지가 ESM 전용이므로 `await import()` 로 충분하다.
- `renderOrFallback` 의 `env.isTTY` 는 테스트를 위해 주입 가능하며, 생략 시 `process.stdout.isTTY` 를 쓴다.
- `--json` 이 켜지면 액션 진입 즉시 `divertLogsToStderr()` 가 호출된다. 이후의 모든 진단은 — 종료 경로의 것까지 — stderr 로 간다. stdout 은 JSON 문서만의 것이다.
- 비대화형 경로의 필수 플래그 검증은 `resolveScopeFlag` / `resolveAgentFlag` / `resolveAssetFlag` 가 맡아 실패 시 2로 종료한다. `--json` 렌더러는 대신 `parse*Flag` 를 써서 실패를 값으로 받아 자기 문서에 담는다.
- asset 누락 정책은 `--package` 값의 개수로 갈린다. 값이 정확히 하나이고 그 값이 패키지 이름이면 strict 다 — `agents.assetPath` 가 없으면 2로 종료한다. 값이 여럿이면 soft skip 이라 나머지 배치가 계속된다.
- scope alias 는 언제나 soft skip 으로 열거된다. workspace 안의 어떤 패키지가 asset 을 선언하지 않는 것은 정상이기 때문이다.
- `--asset-path` 가 있으면 `agents.assetPath` 부재 검사 자체를 건너뛴다. 실패는 위와 **같은** strict / soft skip 분기를 탄다. 새 정책을 만들지 않는다.
- asset 루트 봉쇄는 **출처와 무관하게** 같다. 선언된 `agents.assetPath` 든 `--asset-path` 든, 해석된 위치가 packageRoot 안이어야 한다. 판정은 철자가 아니라 실제 위치로 한다 — `resolve` 는 어휘적이고 `stat` 은 링크를 따라가므로, 심볼릭 링크된 asset 루트는 검사를 통과하면서 디스크 어디든 가리킬 수 있기 때문이다. 여기서 읽은 바이트가 에이전트가 지시문으로 되읽는 디렉터리에 들어간다.
- "실제 디렉터리여야 한다" 는 요구는 두 출처가 다르다. 플래그는 호출자가 있다고 단언한 경로이므로 부재가 오류다. 선언은 매니페스트를 동반하며 배포 tarball 이 소스 트리를 쳐냈을 수 있으므로 부재를 허용한다.
- 그래서 scope alias 와 `--asset-path` 를 함께 주면 열거의 필터가 바뀐다. `agents.assetPath` 선언 여부가 아니라 그 디렉터리의 존재가 패키지를 남기고 거른다.
- 해시 출처는 target 마다 실제로 답할 수 있는 쪽으로 정해진다. `--asset-path` 는 언제나 그 디렉터리를 진실로 삼는다. 선언된 `agents.assetPath` 는 `dist/agents-hashes.json` 이 있으면 그것을 읽고, 없으면 선언된 디렉터리를 런타임에 해싱한다. 선언은 "이 패키지가 에셋을 싣는다" 는 말이지 "빌드가 돌았다" 는 말이 아니므로, 빌드 산출물의 부재만으로 실행을 세우지 않는다.
- 매니페스트도 디렉터리도 없으면 출처는 `manifest` 로 남아 게이트에 걸린다. 없는 디렉터리를 해싱하면 빈 매니페스트가 나오고, 빈 매니페스트는 이미 설치된 항목 전부를 orphan 으로 만든다 — `--force` 와 만나면 그 삭제가 실제로 실행된다. 답할 수 있는 출처가 하나도 없는 것은 계획할 수 없는 것이지, 아무것도 없다고 계획할 일이 아니다.
- 게이트 판정은 렌더러 분기 **이전**, action 에서 한 번 내린다. 해시를 댈 수 없는 타깃은 `selectInjectableTargets` 가 사유와 함께 걸러내므로 렌더러는 그런 타깃을 아예 보지 않는다. 같은 술어를 세 렌더러가 각자 해석하면 실행 판정이 출력 형식에 따라 갈리는데, 판정은 실행의 것이지 렌더러의 것이 아니다.
- 그 실패는 `agents.assetPath` 부재와 **같은** strict / soft skip 분기를 탄다. `--package` 값이 정확히 하나이고 그 값이 패키지 이름이면 2로 종료하고, 값이 여럿이거나 scope alias 면 사유만 남기고 나머지 배치가 계속된다. 새 정책을 만들지 않는다.
- scope 열거는 `<cwd>/node_modules/@<scope>/*` 를 파일시스템 루트까지 거슬러 올라가며 훑는다. 디렉터리 이름은 선언된 패키지 이름과 다를 수 있으므로 권위는 `package.json` 의 `name` 필드에 있고, 중첩 설치는 nearest-wins 로 중복 제거된다.
- scope 열거는 `targets/resolveScopeAlias.ts` 안에만 있다. `runCli/**` 의 다른 어떤 파일도 형제 `package.json` 을 읽지 않는다.
- `utils/` 는 없다. 부속은 파이프라인 단계별 organ 셋으로 나뉜다 — `targets/`(argv → `ConsumerPackage[]`, 파일시스템·모듈해석), `flags/`(CLI 값 하나 검증, 순수), `renderers/`(상호 배타적인 출력 경로 셋). 간선은 `runCli.ts` → `targets/`, `runCli.ts` → `renderers/`, `runCli.ts` → `flags/`, 그리고 `renderers/` → `flags/` 넷뿐이다. `targets/` 는 나머지 둘 중 어느 것도 import 하지 않으며, 이행 체인이 아니라 `runCli.ts` 를 정점으로 하는 한 방향 그래프다.
- 해석된 target 은 렌더링 전에 `packageName` 으로 중복 제거된다.
- commander 의 program name 은 런타임에 `argv[1]` 의 basename 에서 파생된다. `npx @slats/agents-assets-sync` 와 설치된 `inject-agents-settings` 가 각각 자기 이름으로 도움말과 오류를 낸다.
- 렌더러가 0이 아닌 코드를 돌려주면 그 코드로 프로세스가 종료된다.
- soft skip 은 진단이자 값이다. 경고는 사람이 읽는 전사를 위해 남기고, 같은 문자열을 수집해 `--json` 이 stderr 를 긁지 않고도 빈 실행을 설명하게 한다.

## API Contracts

- `runCli(argv: readonly string[] = process.argv): Promise<void>`
- `DefaultFlags`
  - `package?: string[]` (가변; 값 0개 → exit 2)
  - `agent?: string[]` (가변; 빈 값은 "묻거나 거부")
  - `scope?: string`, `asset?: string[]`, `assetPath?: string`, `root?: string`
  - `dryRun?: boolean`, `force?: boolean`, `yes?: boolean`, `json?: boolean`
  - `interactive?: boolean` — commander `--no-interactive` 관례. 플래그가 없으면 `true`.

`index.ts` 가 수출하는 것은 이 둘뿐이다. 아래는 그 밖의 내부 단위이며, 바꿔도 공개 계약 변경이 아니다.

## Internal Unit Contracts

- `classifyTarget(value)` → scope | package | invalid
- `resolvePackage(name, opts?, originCwd?): Promise<ResolvedMetadata | null>`
  - 2단 해석: cwd 기준 require 를 먼저 (`npx -p` 로 불렸을 때 호스트 프로젝트의 `node_modules` 를 잡기 위해), 실패하면 엔진 기준 require. `originCwd` 생략 시 `process.cwd()`.
  - `opts.skipMissingAsset` — asset 누락을 종료 대신 `null` 로 돌려준다
  - `opts.skipReasons` — soft skip 사유를 여기에 덧붙인다. 채우는 것이 목적인 인자이며, 경고 출력과 별개로 값으로도 남긴다
  - `opts.assetPathOverride` — `agents.assetPath` 대신 쓸 경로. 있으면 부재 검사를 건너뛰고 대신 포함/존재 검사를 한다
- `ResolvedMetadata` — `{ packageRoot, packageName, packageVersion, assetPath, assetPathSource }`
  - `assetPathSource: 'package' | 'flag'` — `assetPath` 가 어디서 왔는지. `toConsumerPackages` 가 이것으로 `hashSource` 를 정한다
- `resolveScopeAlias(scope, rootCwd, assetPathOverride?, skipReasons?): Promise<ResolvedMetadata[]>`
- `resolveTargets(targets, rootCwd, assetPathOverride?): Promise<{ resolved: ResolvedMetadata[]; skipped: string[]; strict: boolean }>`
  - `skipped` 는 soft skip 된 패키지마다의 사유. `--json` 이 `errors` 로 실어 빈 실행을 설명한다
  - `strict` 는 이 실행이 패키지 이름 하나만 지목했는지다. asset 누락에 쓰는 그 분기를 게이트도 쓰게 하려고 값으로 돌려준다 — 두 곳이 각자 세면 갈라진다
- `selectInjectableTargets(targets, skipReasons): ConsumerPackage[]`
  - 해시를 댈 수 없는 타깃(`needsBuiltManifest`)을 경고하고 `skipReasons` 에 사유를 적은 뒤 나머지를 돌려준다. 종료 여부는 action 이 `strict` 로 정한다 — 이 함수는 종료하지 않는다
- `toConsumerPackages(metadata): Promise<ConsumerPackage[]>`
  - `assetRoot` 를 `packageRoot` 기준으로 해석하고, 해시 출처 판정을 `resolveHashSource` 에 맡긴다
- `resolveHashSource(metadata, assetRoot): Promise<Pick<ConsumerPackage, 'hashSource' | 'hashesPresent'>>`
  - `assetPathSource: 'flag'` → `'directory'`. 선언(`'package'`) 이면 `dist/agents-hashes.json` 이 있을 때 `'manifest'`, 없고 asset 디렉터리가 있으면 `'directory'`, 둘 다 없으면 `'manifest'` 로 남겨 게이트에 넘긴다
  - `hashesPresent` 는 `dist/agents-hashes.json` 을 실제로 찾았을 때만 `true` 다. `'directory'` 로 정해진 target 은 그 파일을 읽지 않으므로 언제나 `false` 이며, 게이트도 이 값을 보지 않는다
- `renderOrFallback(targets, flags, originCwd, notices?, env?): Promise<number>`
- `renderPlain(targets, flags, originCwd): Promise<number>`
- `renderJson(targets, flags, originCwd, notices?): Promise<number>`
  - `notices` 는 렌더러 이전 단계의 메시지다. 실행을 실패시키지 않으면서 `errors` 에 실린다
- `resolveScopeFlag` / `resolveAgentFlag` / `resolveAssetFlag` — 실패 시 exit 2
- `parseScopeFlag` / `parseAgentFlag` / `parseAssetFlag` — 실패를 값으로 반환
- `resolveAssetPathFlag(value?: string): string | undefined` — 모양 검증만, 실패 시 exit 2. `parse` 짝이 없다 (렌더러가 부르지 않으므로)

## Acceptance Criteria

### AC-RUNCLI-CLASSIFY — `--package` 값은 모양으로 분류된다

- `@<scope>` 는 scope alias, `@<scope>/<name>` 은 scoped 패키지, `<name>` 은 unscoped 패키지로 분류된다.
- 빈 문자열, 단독 `@`, scope 나 name 이 빠진 형태, 여분의 슬래시, 대문자를 포함한 이름은 모두 invalid 다.
- Verified by `__tests__/classifyTarget.spec.ts` (`filid:contract AC-RUNCLI-CLASSIFY`).

### AC-RUNCLI-RESOLVE — 단일 패키지 해석은 cwd 를 먼저 본다

- scoped/unscoped 패키지는 `<originCwd>/node_modules` 에서 해석되며, 중첩된 originCwd 에서는 조상 `node_modules` 를 따라 올라간다.
- cwd 해석이 실패하면 엔진 기준 해석으로 대체되고, 둘 다 실패하면 2로 종료한다.
- 둘 다 일치할 수 있는 경우 cwd 기준 해석이 우선한다.
- `agents.assetPath` 가 없을 때 strict 모드는 2로 종료하고, `skipMissingAsset` 모드는 `null` 을 돌려 배치가 계속되게 한다.
- asset 루트가 packageRoot 밖으로 해석되면 출처와 무관하게 거부한다 — `../` 로 나가는 선언도, 밖을 가리키는 심볼릭 링크도 마찬가지다.
- packageRoot 안에 있지만 디렉터리가 아닌 경로는 "디렉터리가 아니다" 로 거부한다. 봉쇄 위반과 같은 문구를 쓰면 사용자는 경로를 패키지 안으로 옮기려 드는데, 정작 고칠 것은 디렉터리를 가리키는 일이다. 이 구분은 두 출처 모두에 적용된다.
- 해석은 `createRequire` 가 보는 것까지만 닿는다. `exports` 가 `./package.json` 을 막고 main 진입점마저 `import` 조건만 가진 ESM 전용 패키지는 두 단계 모두 `ERR_PACKAGE_PATH_NOT_EXPORTED` 로 실패해 2로 종료한다 — `node_modules` 를 걷는 것은 이 organ 의 몫이 아니기 때문이다. 엔진 자신이 그런 패키지였으므로, 엔진은 자기 `package.json` 을 export 해서 자기 dispatcher 의 타깃이 된다.
- Verified by `__tests__/resolvePackage.spec.ts` (`filid:contract AC-RUNCLI-RESOLVE`).

### AC-RUNCLI-SCOPE-ALIAS — scope 열거의 권위는 선언된 이름이다

- 조상 `node_modules` 를 따라 올라가며 수집하고, scope 디렉터리가 없는 레벨은 건너뛴다.
- 디렉터리 basename 이 아니라 선언된 `name` 이 권위이며, 다른 scope 로 선언된 항목은 걸러진다.
- 점으로 시작하는 항목, `package.json` 이 없거나 깨진 항목, `name` 이 문자열이 아닌 항목은 건너뛴다.
- 중복은 nearest-wins 로 제거되고 발견 순서(가까운 조상 우선)가 유지된다.
- 일치가 0건이면 2로 종료한다.
- Verified by `__tests__/resolveScopeAlias.spec.ts` (`filid:contract AC-RUNCLI-SCOPE-ALIAS`).

### AC-RUNCLI-ASSET-PATH — `--asset-path` 는 선언을 이기고 디렉터리를 진실로 만든다

- 빈 값, 절대 경로, `~` 로 시작하는 값은 파일시스템 IO 이전에 2로 종료한다.
- `agents.assetPath` 를 선언한 패키지에 함께 주면 플래그가 이기고, 해석 결과의 `assetPathSource` 는 `'flag'` 다.
- 선언이 없는 패키지에 주면 해석에 성공한다 — 부재 검사를 건너뛰기 때문이다.
- 존재하지 않는 디렉터리는 단일 타깃에서 2로 종료하고, 배치(`skipMissingAsset`)에서는 `null` 로 건너뛴다. packageRoot 밖으로 나가는 경로의 거부는 `AC-RUNCLI-RESOLVE` 가 두 출처 공통으로 소유한다.
- 플래그가 해시 출처에 미치는 영향은 `AC-RUNCLI-HASH-SOURCE` 가 소유한다.
- Verified by `__tests__/assetPathOverride.spec.ts` (`filid:contract AC-RUNCLI-ASSET-PATH`), `src/__tests__/cli.test.ts`.

### AC-RUNCLI-HASH-SOURCE — 해시 출처는 답할 수 있는 쪽으로 정해진다

- `assetPathSource: 'flag'` 인 target 은 매니페스트가 있어도 `hashSource: 'directory'` 이고 `hashesPresent` 는 `false` 다. `assetRoot` 는 플래그 값으로 계산된다.
- 선언된 asset 경로에 `dist/agents-hashes.json` 이 있으면 `'manifest'` 이고 `hashesPresent` 는 `true` 다.
- 선언된 asset 경로에 매니페스트가 없고 그 디렉터리가 있으면 `'directory'` 로 내려간다 — 빌드 없이 계획된다.
- 매니페스트도 디렉터리도 없으면 `'manifest'` 인 채 `hashesPresent: false` 로 남아 게이트(`AC-MANIFEST-GATE`)에 걸린다. 그 뒤의 실행 판정은 `AC-RUNCLI-GATE-VERDICT` 가 소유한다.
- Verified by `__tests__/hashSource.spec.ts` (`filid:contract AC-RUNCLI-HASH-SOURCE`), `src/__tests__/cli.test.ts`.

### AC-RUNCLI-GATE-VERDICT — 게이트 판정은 실행의 것이지 렌더러의 것이 아니다

- 해시를 댈 수 없는 타깃은 렌더러 분기 이전에 걸러지므로, 세 렌더러 중 어느 것도 그런 타깃을 계획하거나 그에 대해 판정하지 않는다.
- 패키지 이름 하나만 지목한 실행에서 그 하나가 걸리면 2로 종료한다. `--json` 이든 아니든 같다 — `--json` 은 렌더러 이전 실패의 관례대로 stdout 이 비고 진단은 stderr 로 간다.
- 값이 여럿이거나 scope alias 인 실행은 사유를 남기고 0으로 끝난다. `--json` 은 그 사유를 `errors` 에 싣고 나머지 타깃의 `units` 를 낸다. `--json` 이든 아니든 같다.
- Verified by `src/__tests__/cli.test.ts`.

### AC-RUNCLI-DISPATCH — 렌더러 분기와 무프롬프트 구동

- `--package`, `--agent`, `--scope` 를 주면 비TTY 에서 아무것도 묻지 않고 완료된다.
- 비TTY 에서 `--agent` 가 없으면 2로 종료한다.
- 알 수 없는 `--agent` / `--asset` 값은 2로 종료한다.
- `--agent=claude,codex` 는 agent 당 하나씩의 구간을 전사(transcript)에 낸다.
- `--asset=skills` 는 `AGENTS.md` 항목을 계획에서 통째로 없앤다.
- `--asset` 과 `--asset-path` 를 함께 줘도 서로의 값을 삼키지 않는다.
- Verified by `src/__tests__/cli.test.ts`.

### AC-RUNCLI-JSON-STREAM — `--json` 은 stdout 을 독점한다

- `--json` 실행의 stdout 전체가 하나의 JSON 객체로 파싱된다.
- 플래그 오류는 느슨한 텍스트가 아니라 `exitCode: 2` 인 문서로 보고된다.
- 렌더러에 닿기 전에 실패하면 stdout 은 비고 진단은 stderr 로만 나간다.
- Verified by `src/__tests__/json.test.ts`.

## History

- 2026-08-06 — 게이트 판정이 렌더러마다 달랐다. plain 과 Ink 는 걸린 타깃을 조용히 빼고 0으로 끝냈고, `--json` 은 같은 상황에서 1을 냈다 — 같은 입력에 출력 형식만으로 CI 판정이 갈렸다. 술어(`needsBuiltManifest`)는 한 곳이었지만 **그 답으로 무엇을 할지**는 아무도 소유하지 않은 것이 원인이라, 판정을 렌더러 분기 위 action 으로 올렸다. 새 정책 대신 `agents.assetPath` 부재가 이미 쓰던 strict / soft skip 분기를 그대로 쓴다. 렌더러가 판정을 못 하게 만드는 쪽을 택한 이유는, 셋이 합의하도록 고치면 넷째 렌더러가 생길 때 같은 버그가 다시 나기 때문이다.
- 2026-08-06 — 선언이 packageRoot 안의 파일을 가리킬 때 "resolves outside" 라고 보고하던 오분류를 고쳤다. 봉쇄 검사는 이미 통과한 지점이었으므로 그 문구는 사실이 아니었고, 사용자를 엉뚱한 수정으로 이끌었다.
- 2026-08-06 — `resolvePackage` 의 2단 해석이 ESM 전용 패키지 앞에서 멈춘다는 것이 드러났다. 두 단계 모두 `createRequire` 를 쓰는데, `require` 조건도 `./package.json` 도 없는 패키지는 subpath 와 bare specifier 양쪽에서 `ERR_PACKAGE_PATH_NOT_EXPORTED` 로 실패한다. 구 CJS 빌드는 main 진입점 fallback 으로 해석돼 이 구멍을 가리고 있었다. 해석기를 고치는 대신 엔진 매니페스트가 `./package.json` 을 export 하도록 한 이유는 경계다 — ESM 전용 패키지에 닿는 다른 길은 `node_modules` 를 걷는 것이고, 그것은 `resolveScopeAlias.ts` 만의 몫이다.
- 2026-08-06 — 선언된 `agents.assetPath` 가 매니페스트 없이도 동작하게 됐다. 이전에는 `--asset-path` 로 부른 실행만 디렉터리를 해싱했고, 기본 경로는 `dist/agents-hashes.json` 이 없으면 아무것도 하지 않고 "빌드부터 하라" 고만 했다 — 같은 디렉터리가 거기 있는데도. 선언은 에셋의 위치를 말할 뿐 빌드 여부를 말하지 않으므로, 부재는 오류가 아니라 다른 출처로 내려갈 신호다. 디렉터리 존재를 조건에 넣은 것은 취향이 아니라 안전 장치다 — 없는 디렉터리의 빈 매니페스트는 설치된 항목 전부를 orphan 으로 만들고 `--force` 가 그것을 삭제한다.
- 2026-08-06 — asset 루트 봉쇄가 선언 경로까지 확대됐다. 처음에는 `--asset-path` 에만 어휘적 검사를 뒀는데, 그러면 opt-in 경로만 보호되고 기본 경로(`agents.assetPath`)는 `../` 로 자유롭게 나가는 거꾸로 된 상태가 된다. 동시에 검사를 realpath 기준으로 옮겼다 — 어휘적 검사는 심볼릭 링크된 asset 루트를 막지 못하고, 그 경로로 읽힌 파일은 에이전트가 지시문으로 되읽는 곳에 안착한다.
- 2026-08-06 — `--asset-path` 가 추가되며 "asset 루트는 `agents.assetPath` 가 정한다" 는 전제가 깨졌다. 선언 없이 `agents/` 나 `docs/` 에 에셋만 둔 패키지를 위해서다. fallback 이 아니라 override 로 정한 이유: 플래그가 조건부로 이기면 어느 경로가 쓰였는지 실행 결과만 보고는 알 수 없다. 같은 이유로 override 는 저장된 매니페스트도 무시한다 — 그 매니페스트가 기술하는 트리가 플래그가 가리키는 트리라는 보장이 없다.
- 2026-08-06 — `--json` 이 plain 경로를 강제한다는 계약이 폐기됐다. `renderJson` 이 독립 렌더러가 되었고, 분기에서 `--json` 이 TTY 판정보다 먼저 평가된다. 같은 변경으로 `parse*Flag` 계열이 생겼다 — JSON 렌더러는 플래그 오류에서 종료할 수 없고 그것을 자기 문서에 담아야 하기 때문이다.

## Last Updated

2026-08-06 — 게이트 판정을 action 으로 올리고 `AC-RUNCLI-GATE-VERDICT` 를 추가. `resolveTargets` 가 `strict` 를 값으로 돌려주고 `selectInjectableTargets` 가 걸러내므로, 렌더러는 해시를 댈 수 없는 타깃을 보지 못한다. 이전 갱신: 해석이 `createRequire` 가 보는 범위까지라는 한계를 `AC-RUNCLI-RESOLVE` 에 명시했고, 해시 출처 판정을 `resolveHashSource` 로 떼어내며 `AC-RUNCLI-HASH-SOURCE` 를 추가했다.
