# src

## Purpose

Shared CLI engine that lets any npm package ship one set of agent docs (skills, rules, commands) and inject them where each coding agent keeps them. The engine owns the `inject-agents-settings` dispatcher; consumers only declare `agents.assetPath` in `package.json` and let `agents-build-hashes` hash their asset tree at build time — where that build output is absent, the declared directory is hashed at run time instead. A package that declares nothing is reachable through `--asset-path`, which names the asset root at the call site.

## Structure

버전 상수는 패키지 매니페스트에서 생성되므로 수정의 정본은 매니페스트입니다. 종단 간 검증은 빌드된 CLI 실행 파일을 구동하므로, 소스만 고친 상태에서는 변경이 검증되지 않습니다.

빌드 시 해시 생성 코드는 순수 Node ESM으로 유지하며 런타임 번들과 분리합니다. 대화형 UI도 지연 로딩하는 내부 표면이며 공개 배럴에서 재수출하지 않습니다.

## Conventions

- 모든 선택은 플래그로 지정할 수 있어야 하며, Ink 선택 화면만이 유일한 실행 경로가 되어서는 안 됩니다.
- TypeScript strict 모드와 ESM 전용 빌드를 유지합니다.
- 빌드용 해시 진입점은 런타임 조율을 수행하지 않으며, CLI 실행 파일은 argv를 runCli에 전달하는 얇은 진입점으로 유지합니다.
- 생성된 버전 상수는 직접 편집하지 않습니다. 버전을 바꾸려면 패키지 매니페스트를 수정하고 `yarn version:sync`를 실행합니다.

## Boundaries

### Always do

- 핵심 계산·실행 모듈은 UI에 의존하지 않게 유지하고, 각 렌더러가 그 기본 연산을 조합하도록 합니다.
- 형제 프랙탈의 공개 진입점을 통해서만 경계를 넘습니다.
- 대화형 UI의 런타임 로딩은 renderOrFallback의 동적 import 한 곳에서 수행하며, 루트 공개 배럴에 UI를 재수출하지 않습니다.

### Ask first

- AgentType에 에이전트를 추가하거나 에이전트별 설치 위치를 바꾸는 변경
- 현재 단일 dispatcher 외에 최상위 명령을 추가하는 변경
- runCli, HashManifest, InjectReport의 공개 형태를 바꾸는 변경

### Never do

- renderOrFallback 밖에서 대화형 UI를 런타임 import
- 핵심 연산·UI·공용 유틸리티에서 패키지 매니페스트를 읽거나 node_modules를 순회
- 공유 AGENTS.md에서 이 도구의 마커 밖에 있는 내용을 수정
