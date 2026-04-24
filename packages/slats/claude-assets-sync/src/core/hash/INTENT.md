# hash

## Purpose

SHA-256 기반 콘텐츠 해시 프리미티브. `hashManifest`(빌드 타임)와
`injectPlan`(런타임 비교)이 공통으로 사용하는 긴밀하게 결합된 3개의 헬퍼.

## Structure

- `index.ts` — 배럴 export
- `hash.ts` — `hashContent`, `hashFile`, `hashEquals`, `Sha256Hex` (단일 책임)

## Boundaries

### Always do

- SHA-256 을 소문자 hex 로 계산 (`dist/claude-hashes.json` 형식과 일치)
- `ENOENT` 는 소프트 미스로 처리 (`hashFile` 이 `null` 반환)

### Ask first

- SHA-256 이외의 다이제스트 알고리즘으로 전환 (manifest v1 호환성 파괴)
- 스트리밍 API 추가 (현재 호출자는 항상 파일 전체를 읽음)

### Never do

- 모듈 레벨 비동기 상태 도입 (캐시, 메모이제이션) — 호출자가 생명주기를 소유
- 같은 `core/*` 내 sibling fractal 에서 import — hash 는 최심 리프
