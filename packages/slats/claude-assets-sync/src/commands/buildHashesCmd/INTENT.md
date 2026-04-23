# buildHashesCmd

## Purpose

`claude-sync build-hashes [pkgRoot]` 의 얇은 commander 핸들러.
`scripts/buildHashes.mjs`(순수 Node ESM 라이브러리로 `./buildHashes` 서브패스
도 공유) 로 위임하고, `logger` 를 통해 한 줄 성공/실패 메시지를 렌더한다.

## Structure

- `index.ts` — 배럴 export (`buildHashesCmd`, `BuildHashesCmdOptions`)
- `buildHashesCmd.ts` — 단일 핸들러 함수, 헬퍼 없음

## Boundaries

### Always do

- 실패는 원본 메시지와 함께 `process.exit(1)` 로 전파
- `scripts/buildHashes.mjs` 의 import 를 유일한 통합 지점으로 유지

### Ask first

- `[pkgRoot]` 이외의 추가 플래그 도입
- 해시 생성 로직을 인라인화 (반드시 `scripts/` 에 보존하여
  `./buildHashes` 서브패스와 이 커맨드가 동일 구현 공유)

### Never do

- `core/`, `discover/`, `prompts/` 에서 import; 커맨드는 자기 완결
- manifest 스키마를 로컬에서 재작성; 해당 로직은 `scripts/buildHashes.mjs` 소유
