# discover

## Purpose

상위 워크스페이스와 모든 조상 `node_modules`(scoped + unscoped)를 순회하여
`package.json` 에 `claude.assetPath` 를 선언한 모든 패키지를 수집한다.
`commands/runCli` 가 호출하며, 루트 배럴을 통해 외부에도 공개된다.

## Structure

- `index.ts` — 배럴 export (`discover`, `ConsumerPackage`, `DiscoverOptions`)
- `discover.ts` — 메인 walker; workspace → node_modules 순회를 구동
- `types.ts` — `ConsumerPackage`, `DiscoverOptions`, 내부 `PkgJson`
- `utils/` — `readJsonOpt`, `tryAdd`, `enumerateWorkspaces`, `expandGlob`, `scanNodeModules`

## Boundaries

### Always do

- 패키지 이름으로 중복 제거하고 이름 순 정렬한 리스트를 반환 (cwd 에 가장 가까운 쪽이 우선)
- `package.json` 부재, 읽기 실패 등은 치명적이지 않게 처리 (skip + 계속)

### Ask first

- `claude.assetPath` 이외의 새 신호 추가 (환경 변수, lockfile 힌트 등)
- 순회 순서(먼저 workspace, 그다음 node_modules 조상) 변경

### Never do

- `commands/`, `core/`, `prompts/` 로부터 import — discover 는 리프 지향 모듈
- 네트워크 페치; 모든 처리는 로컬 파일시스템에서 수행
