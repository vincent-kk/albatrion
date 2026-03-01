# src

## Purpose

claude-assets-sync 패키지의 메인 소스 디렉토리. npm 패키지의 Claude 에셋을 GitHub API를 통해 동기화하는 CLI 도구.

## Structure

- `index.ts` — 패키지 진입점 (공개 API re-export)
- `cli.ts` — CLI 실행 엔트리
- `commands/` — CLI 명령어 구현 (fractal)
- `core/` — 핵심 로직 (sync, GitHub, filesystem, CLI 정의)
- `utils/` — 유틸리티 (types, logger, paths)
- `components/` — ink 기반 React UI 컴포넌트

## Conventions

- TypeScript strict mode, ink (React for CLI) UI 패턴
- barrel export는 index.ts를 통해서만 수행
- 외부 의존성: commander, picocolors, ink

## Boundaries

### Always do

- core/, utils/는 organ으로 취급하고 index.ts barrel을 통해 접근
- 새 명령어 추가 시 commands/ 모듈에 구현 후 index.ts에 등록

### Ask first

- 공개 API (index.ts exports) 시그니처 변경
- 외부 의존성 추가

### Never do

- organ 디렉토리(core, utils, __tests__)에 CLAUDE.md 생성
- components/ 하위 fractal 모듈을 우회하여 직접 import

## Dependencies

- `commander`, `picocolors`, `ink`, `react`
