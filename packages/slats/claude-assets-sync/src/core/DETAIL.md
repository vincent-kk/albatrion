# core Specification

## Requirements

- `injectDocs` 는 유일한 런타임 오케스트레이터다. source manifest 를 읽고,
  타겟 루트를 해석하고, 플랜을 빌드하고, 8-worker 풀 아래에서 적용한다.
- 플랜이 `warn-diverged` / `warn-orphan` 액션을 포함할 때 `--force`:
  - 상호작용: 호출자가 공급한 `confirmForce(plan)` 뒤에서 게이팅되며,
    거부 시 파일시스템 변경 없이 `InjectReport.exitCode === 2` 반환.
  - 비상호작용: 발산 파일 리스트가 stderr 로 방출되고 플랜은 적용된다.
- `--dry-run` 은 플랜 출력 이후 짧게 리턴; exit code 0.
- `resolveScope` 는 `project` / `local` 에 대해 가장 가까운 조상 `.claude`
  를 자동 탐지하고 해당 시 description 에 `(auto-located)` 태그 부착.
- `readHashManifest` 는 `schemaVersion !== 1` 을 명시적 오류로 거부.
- `buildPlan` orphan 탐지는 제공된 `namespacePrefixes`(현재 `skills/<name>/`)
  내부만 순회.

## API Contracts

- `injectDocs(opts: InjectOptions): Promise<InjectReport>`
  - `InjectOptions` = `{ packageName, packageVersion, packageRoot, assetRoot, scope, dryRun, force, originCwd?, confirmForce? }`
  - `InjectReport` = `{ created, updated, skipped, warnings, deleted, exitCode }` (`exitCode: 0 | 1 | 2`)
- `readHashManifest(packageRoot: string): Promise<HashManifest>`
- `computeNamespacePrefixes(manifest: HashManifest): string[]`
- `buildPlan(input: PlanInput): Promise<InjectPlan>`
- `resolveScope(scope: Scope, cwd?: string): ScopeResolution`
- `isValidScope(value: unknown): value is Scope`
- `isInteractive(): boolean`
- `findNearestDotClaudeAncestor(start: string): string | null`
- `hashContent(buffer: Buffer | string): Sha256Hex`
- `hashFile(absPath: string): Promise<Sha256Hex | null>`
- `hashEquals(a: Sha256Hex | null, b: Sha256Hex | null): boolean`

## Last Updated

2026-04-24
