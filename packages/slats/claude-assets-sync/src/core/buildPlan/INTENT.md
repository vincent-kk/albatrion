# injectPlan

## Purpose

`injectDocs` 가 적용할 선언적 액션 리스트를 생성한다. source 해시와 target
트리를 비교하여 각 파일을 `copy`, `skip-uptodate`, `warn-diverged`,
`warn-orphan`, 또는 `--force` 시 `delete` 로 분류한다.

## Structure

- `index.ts` — 배럴 export
- `buildPlan.ts` — 플래너 함수 (파일시스템 읽기 외 IO 없음)
- `types.ts` — `Action`, `InjectPlan`, `PlanInput` 차별 union
- `utils/walkFiles.ts` — 비동기 재귀 파일 워커 (ENOENT-safe)
- `utils/toPosix.ts` — 크로스 플랫폼 forward-slash 정규화

## Boundaries

### Always do

- source 파일 1개당 1개 `Action`, `namespacePrefixes` 하위 orphan 1개당 1개 발행
- `warn-diverged` 나 `warn-orphan` 이 존재하면 `requiresForce` 를 true 설정

### Ask first

- 새 `Action.kind` 변형 추가 (모든 컨슈머가 반드시 처리해야 함)
- 제공된 `namespacePrefixes` 범위 밖에서 orphan 탐색 확장

### Never do

- 플랜을 실행 — 플래닝은 순수, 실행은 `inject/` 소관
- `inject/`, `commands/`, `prompts/` 에서 import
