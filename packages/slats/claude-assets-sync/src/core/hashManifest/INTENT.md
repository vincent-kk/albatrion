# hashManifest

## Purpose

`dist/claude-hashes.json`(스키마 v1)을 읽고 orphan 탐지를 위한 네임스페이스
prefix 집합을 계산한다. inject 시 source 쪽 해시의 유일한 진실 공급원이다.

## Structure

- `index.ts` — 배럴 export
- `hashManifest.ts` — `readHashManifest`, `computeNamespacePrefixes`, `HASH_MANIFEST_FILENAME`, `HashManifest`

## Boundaries

### Always do

- 지원하지 않는 `schemaVersion` 은 명시적 `Error` 로 거부
- 런타임에서 manifest 를 불변 읽기 전용 표면으로 취급

### Ask first

- `schemaVersion` 을 1 이상으로 진화
- `computeNamespacePrefixes` 의 `skills/<name>/` 패턴 이외 확장
  (모든 컨슈머의 orphan 의미에 영향)

### Never do

- 이 fractal 에서 manifest 쓰기 수행; 생성은 `scripts/buildHashes.mjs` 전담
- `injectDocs/`, `buildPlan/`, `commands/` 에서 import — hashManifest 는 리프
