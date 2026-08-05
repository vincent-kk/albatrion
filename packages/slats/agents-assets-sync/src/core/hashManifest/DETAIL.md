# hashManifest Specification

## Requirements

- `readHashManifest` 는 `<packageRoot>/dist/agents-hashes.json` 을 읽는다. 이 파일이 inject 시 source 쪽 해시의 유일한 진실 공급원이다.
- `schemaVersion !== 1` 은 조용히 넘어가지 않고 명시적 `Error` 로 거부한다. 메시지는 `[agents-assets-sync]` 접두사와 발견된 버전을 포함한다.
- 파일이 없거나 JSON 이 깨진 경우의 오류는 그대로 전파된다. 호출자가 "빌드가 필요하다" 는 진단으로 바꾸는 것은 렌더러의 몫이다.
- 매니페스트는 런타임에서 읽기 전용 표면으로만 다룬다. 생성은 `scripts/buildHashes.mjs` 전담이며 이 fractal 은 쓰지 않는다.
- `computeNamespacePrefixes` 는 orphan 탐색 범위를 정한다. `skills/` 로 시작하고 세그먼트가 3개 이상인 경로에서만 `skills/<name>/` 접두사를 모으며, 중복은 제거된다.
- 이 접두사 집합이 orphan 삭제 후보의 상한이다. 다른 kind 나 다른 네임스페이스는 집합에 들어오지 않으므로 삭제 제안 대상이 되지 않는다.
- `previousVersions` 는 schema v1 에서 항상 빈 객체이며 예약 필드다.
- `core/` 안의 리프다. `buildPlan/`, `injectDocs/`, `commands/` 에서 import 하지 않는다.

## API Contracts

- `readHashManifest(packageRoot: string): Promise<HashManifest>`
  - `schemaVersion !== 1` 이면 throw
- `computeNamespacePrefixes(manifest: HashManifest): string[]`
  - 각 원소는 후행 `/` 를 포함한다 (`'skills/foo/'`)
- `HASH_MANIFEST_FILENAME = 'agents-hashes.json'`

## Exported Types

- `HashManifest`
  - `schemaVersion: 1`
  - `package: { name: string; version: string }`
  - `generatedAt: string`
  - `algorithm: 'sha256'`
  - `assetRoot: string`
  - `files: Record<string, Sha256Hex>` — 매니페스트 경로 → 소스 해시
  - `previousVersions: Record<string, never>` — 예약

## Acceptance Criteria

### AC-MANIFEST-READ — 지원하지 않는 스키마는 거부된다

- `schemaVersion` 이 1이면 파싱된 매니페스트가 반환된다.
- `schemaVersion` 이 1이 아니면 호출이 throw 하고, 그 메시지가 실행의 진단으로 표면화된다.
- `dist/agents-hashes.json` 이 없는 패키지는 실행이 그 사실을 보고하고 건너뛴다.
- Verified by `src/__tests__/json.test.ts`, `src/__tests__/cli.test.ts`.

### AC-MANIFEST-NAMESPACE — orphan 탐색은 관리 중인 네임스페이스로 제한된다

- `skills/<name>/...` 경로들은 중복 없는 `skills/<name>/` 접두사 집합이 된다.
- `skills/` 로 시작하지 않는 경로는 접두사를 만들지 않으므로 그 위치는 orphan 스캔 대상이 되지 않는다.
- Verified by `core/agentTarget/__tests__/agentTarget.test.ts` (`resolveDestinations` 의 `namespacePrefixes` 소비 경로).

## Last Updated

2026-08-06 — 구현에서 계약을 추출해 최초 작성.
