# 104라운드 파일 분리

모든 경로는 `packages/canard/schema-form/` 기준입니다. git 쓰기·커밋·설치는 하지 않았습니다. 1–2와 3–4는 아래의 서로 다른 파일 집합으로 커밋할 수 있습니다. 1–2만 있는 HEAD에서도 차등·렌더 시험은 통과했습니다.

## 1–2: HEAD fixture와 시험 실행 환경

- `package.json`
- `vite.config.ts`
- `src/core/blueprint/__tests__/blueprint.owned-inline-differential.test.ts`
- `src/core/blueprint/__tests__/blueprint.owned-inline-render.test.tsx`
- `src/core/blueprint/__tests__/fixtures/captureOwnedInlineObservables.ts`
- `src/core/blueprint/__tests__/fixtures/ownedInlineHead.json`
- `architecture/verification/07-switch/profile-104-owned/export-head-fixture.mjs`
- `architecture/verification/07-switch/profile-104-owned/check.mjs`
- `architecture/verification/07-switch/profile-104-owned/measure.mjs`

fixture는 제품 변경 전에 생성한 HEAD baf4cacb6의 59종 × collect 끔/켬 결과입니다. SHA-256은 `c776022c70bbf36c3e60258108dfcf0b9df6d97b6b518772e47270899004799a`이며 제품 변경 뒤에도 그대로입니다. production 실행은 package.json script가 설정을 읽기 전에 NODE_ENV를 지정합니다. 시험 실행은 `--configLoader runner --cache false`로 설정 임시 번들과 결과 캐시 생성을 억제합니다. 설정 파일에 cacheDir을 추가하지 않았습니다.

## 3–4: 제품 정책·소유 계약·정책 시험

- `src/core/blueprint/DETAIL.md`
- `src/core/blueprint/blueprint.ts`
- `src/core/blueprint/utils/analyze/buildNodes.ts`
- `src/core/blueprint/utils/analyze/collectDeclarations.ts`
- `src/core/blueprint/utils/analyze/compileBlueprintExpressions.ts`
- `src/core/blueprint/utils/analyze/createBlueprintGate.ts`
- `src/core/blueprint/utils/analyze/populateNodeChildren.ts`
- `src/core/blueprint/utils/analyze/populateVirtualNodes.ts`
- `src/core/blueprint/utils/declarations/copyBlueprintDeclarations.ts`
- `src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts`
- `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts`
- `src/core/blueprint/utils/effectiveSchema/utils/OwnedSchemaValues.ts`
- `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts`
- `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts`
- `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/applyControlHints.ts`
- `src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts`
- `src/core/blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts`
- `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup.ts`
- `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup/utils/freezeCreatedHintObjects.ts`
- `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts`
- `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts`
- `src/core/blueprint/utils/itemEntry/getItemEntry.ts`
- `src/core/blueprint/__tests__/blueprint.branchless-proof.test.ts`
- `src/core/blueprint/__tests__/mergeEffectiveSchema.test.ts`
- `src/core/blueprint/__tests__/blueprint.owned-inline-policy.test.ts`
- `src/core/blueprint/__tests__/blueprint.owned-inline-counts.test.ts`
- `src/core/blueprint/__tests__/fixtures/collectOwnedInlineRecords.ts`
- `src/core/blueprint/__tests__/fixtures/ownedInlineMounts.json`

이 28개 파일의 소유 fractal은 모두 `src/core/blueprint`입니다. 유효 schema·hint·declaration helper는 그 내부 구현이므로 별도의 INTENT/DETAIL 경계를 만들지 않았습니다. 기존 개발 프로젝트의 동결 단언을 운영 프로젝트로 옮기지 않았습니다. owned-inline 정책 시험과 계수 시험만 양쪽 환경에서 실행합니다.

## 5: 측정·판정·보고 증거

- `architecture/verification/07-switch/remeasure-86c02.md`의 `104라운드 owned-inline` 절
- `architecture/verification/07-switch/profile-104-owned/files.md`
- `architecture/verification/07-switch/profile-104-owned/summarize.mjs`
- `architecture/verification/07-switch/profile-104-owned/summary.json`
- 같은 디렉터리의 `build-*.json`, `count-working-*.json`, `forced-*.json`, `steady-*.json`, `noise-before-*.json`, `noise-after-*.json`, `process-*.json`, `check-*.json`, `check-*.txt`

raw 결과와 요약은 각각 5MB 이하입니다. 런타임 번들·소스맵과 새 Vite 캐시는 지정 scratchpad의 `bundles/`에만 두며 커밋 대상에 포함하지 않습니다. 작업 전부터 있던 패키지 `node_modules/.vite` 자료는 읽기 확인만 했고 바꾸지 않았습니다. `.seiri/tasks/round-104-owned-inline/gates.md`는 작업용 검증 ledger이며 위 커밋 집합에 포함하지 않습니다.
