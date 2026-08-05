# hashManifest

## Purpose

inject 시 source 쪽 해시를 공급한다. `dist/agents-hashes.json`(스키마 v1)을 읽거나, `--asset-path` 로 지정된 asset 디렉터리를 그 자리에서 훑어 같은 모양의 매니페스트를 만든다. orphan 탐지를 위한 네임스페이스 prefix 집합도 여기서 계산한다.

## Structure

- `index.ts` — 배럴 export
- `__tests__/needsBuiltManifest.spec.ts` — `AC-MANIFEST-GATE` 결속 spec
- `hashManifest.ts` — `resolveHashManifest`, `needsBuiltManifest`, `readHashManifest`, `computeNamespacePrefixes`, `HASH_MANIFEST_FILENAME`
- `type.ts` — `HashManifest`, `HashManifestSource`
- `utils/computeHashManifest.ts` — asset 디렉터리 → 메모리 매니페스트 (organ)
- `utils/sortManifestFiles.ts` — 매니페스트 키를 사전순으로 (organ)
- `__tests__/computeHashManifest.spec.ts` — `AC-MANIFEST-COMPUTE` 결속 spec

## Boundaries

### Always do

- 지원하지 않는 `schemaVersion` 은 명시적 `Error` 로 거부
- 런타임에서 manifest 를 불변 읽기 전용 표면으로 취급
- 계산 경로의 잡음 필터 · POSIX 키 · 키 정렬을 `scripts/buildHashes.mjs` 와 일치시킨다. 한쪽을 바꾸면 다른 쪽도 바꾸고 동등성 검사를 돌린다

### Ask first

- `schemaVersion` 을 1 이상으로 진화
- `computeNamespacePrefixes` 의 `skills/<name>/` 패턴 이외 확장 (모든 컨슈머의 orphan 의미에 영향)

### Never do

- 이 fractal 에서 manifest 를 디스크에 쓰기; 파일 생성은 `scripts/buildHashes.mjs` 전담
- `injectDocs/`, `buildPlan/`, `commands/` 에서 import — hashManifest 는 리프
