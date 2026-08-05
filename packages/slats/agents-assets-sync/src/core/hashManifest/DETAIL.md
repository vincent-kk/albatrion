# hashManifest Specification

## Requirements

- 매니페스트의 출처는 둘이며 `resolveHashManifest` 가 `hashSource` 로 가른다. `'manifest'` 는 `readHashManifest`, `'directory'` 는 asset 디렉터리 런타임 해싱이다.
- `readHashManifest` 는 `<packageRoot>/dist/agents-hashes.json` 을 읽는다. `hashSource: 'manifest'` 인 타깃에게 이 파일이 source 쪽 해시의 유일한 진실 공급원이다.
- `hashSource: 'directory'` 는 `--asset-path` 로 asset 루트가 지정된 타깃이다. 이때 저장된 매니페스트는 다른 디렉터리를 기술할 수 있으므로 아예 읽지 않고, 지정된 디렉터리를 그 자리에서 훑어 메모리 매니페스트를 만든다. 빌드 산출물이 필요 없다.
- 런타임 계산은 `scripts/buildHashes.mjs` 와 같은 잡음 필터(`.omc/`, `.DS_Store`, `*.log`), 같은 POSIX 키, 같은 키 정렬을 쓴다. 같은 트리에 대해 두 경로의 `files` 는 같아야 한다. 두 구현이 갈라진 것은 `scripts/` 가 rolldown 이 import 할 수 있도록 순수 Node ESM 으로 남아야 해서이며, 그 대가를 동등성 검사가 치른다.
- `schemaVersion !== 1` 은 조용히 넘어가지 않고 명시적 `Error` 로 거부한다. 메시지는 `[agents-assets-sync]` 접두사와 발견된 버전을 포함한다.
- 파일이 없거나 JSON 이 깨진 경우의 오류는 그대로 전파된다. 호출자가 "빌드가 필요하다" 는 진단으로 바꾸는 것은 렌더러의 몫이다.
- 어느 출처든 매니페스트는 런타임에서 읽기 전용 표면으로만 다룬다. 디스크 쓰기는 `scripts/buildHashes.mjs` 전담이며 이 fractal 은 파일을 쓰지 않는다.
- `generatedAt` 은 필수 인자다. 이 fractal 은 시계를 읽지 않으며, 같은 입력이면 언제 불러도 같은 결과를 낸다. 시각은 렌더러가 실행 시작에 한 번 잡아 그 실행 내내 쓴다 — 계산된 매니페스트는 각 쌍이 해셔에 닿은 시각이 아니라 실행이 들여다본 시각을 기록한다.
- `computeNamespacePrefixes` 는 orphan 탐색 범위를 정한다. `skills/` 로 시작하고 세그먼트가 3개 이상인 경로에서만 `skills/<name>/` 접두사를 모으며, 중복은 제거된다.
- 이 접두사 집합이 orphan 삭제 후보의 상한이다. 다른 kind 나 다른 네임스페이스는 집합에 들어오지 않으므로 삭제 제안 대상이 되지 않는다.
- `previousVersions` 는 schema v1 에서 항상 빈 객체이며 예약 필드다.
- `core/` 안의 리프다. `buildPlan/`, `injectDocs/`, `commands/` 에서 import 하지 않는다.

## API Contracts

- `needsBuiltManifest(target: { hashSource; hashesPresent }): boolean`
  - 렌더러가 계획 전에 "이 target 은 빌드를 기다려야 하는가" 를 묻는 유일한 자리
- `resolveHashManifest(source: HashManifestSource, generatedAt: string): Promise<HashManifest>`
  - `source.hashSource === 'manifest'` → `readHashManifest(source.packageRoot)`
  - `source.hashSource === 'directory'` → `source.assetRoot` 를 훑어 계산
  - `generatedAt` 은 호출자가 소유한다. 계산 경로에서만 기록되고 판정에는 쓰이지 않는다.
- `readHashManifest(packageRoot: string): Promise<HashManifest>`
  - `schemaVersion !== 1` 이면 throw
- `computeNamespacePrefixes(manifest: HashManifest): string[]`
  - 각 원소는 후행 `/` 를 포함한다 (`'skills/foo/'`)
- `HASH_MANIFEST_FILENAME = 'agents-hashes.json'`

## Exported Types

- `HashManifestSource` — 매니페스트 하나를 어디서 얻을지 기술한다. `ConsumerPackage` 와 구조적으로 일치시켜, 렌더러가 매핑 없이 타깃을 그대로 넘길 수 있게 한다. `core/` 는 `commands/` 를 import 하지 않으므로 이 일치는 구조적 선언일 뿐 의존이 아니다.
  - `name: string`, `version: string`
  - `packageRoot: string`
  - `assetRoot: string` — 절대 경로
  - `assetPath: string` — `packageRoot` 기준 상대 경로. 계산된 매니페스트의 `assetRoot` 필드로 기록된다
  - `hashSource: 'manifest' | 'directory'`
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

### AC-MANIFEST-COMPUTE — 계산된 매니페스트는 빌드된 것과 같다

- `hashSource: 'directory'` 는 `dist/agents-hashes.json` 이 없어도 성공하며, `hashSource: 'manifest'` 는 그 파일이 없으면 실패한다.
- 같은 asset 트리에 대해 계산 경로의 `files` 는 `scripts/buildHashes.mjs` 가 만든 `files` 와 완전히 같다.
- 잡음 파일(`.DS_Store`, `*.log`, `.omc/**`)은 두 경로 모두에서 빠진다.
- 키는 중첩 디렉터리에서도 항상 `/` 구분자이며 사전순으로 정렬된다. 정렬은 `sortManifestFiles` 가 맡는다 — `readdir` 순서는 플랫폼이 정하므로, 정렬되지 않은 입력을 직접 주는 것만이 이 절에 부하를 거는 방법이다. 매니페스트는 사람이 읽고 diff 하는 파일이고, 디렉터리를 돌려주는 순서가 달라졌다는 이유로 항목이 움직이면 변경이 아닌 것이 변경으로 보인다.
- 계산된 매니페스트의 `assetRoot` 는 `packageRoot` 기준 상대 경로를 담는다.
- Verified by `__tests__/computeHashManifest.spec.ts` (`filid:contract AC-MANIFEST-COMPUTE`).

### AC-MANIFEST-GATE — 빌드가 필요한 target 은 한 곳에서 판정된다

- `hashSource: 'manifest'` 이고 매니페스트가 없으면 `needsBuiltManifest` 가 `true` 다. 매니페스트가 있으면 `false`.
- `hashSource: 'directory'` 는 `hashesPresent` 와 무관하게 언제나 `false` 다 — `dist/` 를 읽지 않으므로 그 부재가 이 target 에 대해 아무것도 말하지 않는다.
- 세 렌더러(plain, json, Ink)가 계획 전에 모두 이 술어에 묻는다. 판정을 한 곳에 두는 이유는 중복 제거만이 아니라, 어떤 렌더러도 직접 구동하지 않는 Ink 경로를 같은 검사 아래 두기 위해서다.
- Verified by `__tests__/needsBuiltManifest.spec.ts` (`filid:contract AC-MANIFEST-GATE`).

## History

- 2026-08-06 — "매니페스트가 source 해시의 유일한 진실 공급원" 이라는 계약이 `--asset-path` 로 완화됐다. 플래그가 asset 루트를 지정하면 그 디렉터리가 진실이고 저장된 매니페스트는 읽지 않는다 — `agents.assetPath` 선언도 빌드 산출물도 없이 그냥 `agents/` 나 `docs/` 에 에셋을 둔 패키지를 지원하기 위함이다.

## Last Updated

2026-08-06 — `resolveHashManifest` / `HashManifestSource` 와 `AC-MANIFEST-COMPUTE` 를 추가. 매니페스트 출처가 둘이 되었음을 Requirements 에 반영했다.
