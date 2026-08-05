# hash

## Purpose

SHA-256 기반 콘텐츠 해시 프리미티브. `hashManifest/`(빌드 타임 매니페스트)와
`buildPlan/`(런타임 비교)이 공통으로 쓰는, 긴밀히 결합된 소수의 헬퍼만 둔다.

## Structure

- `index.ts` — 배럴 export
- `hash.ts` — `hashContent`, `hashFile`, `hashEquals` + `Sha256Hex`

## Conventions

- 다이제스트는 소문자 hex 로 낸다. `dist/agents-hashes.json` 이 기록하는
  형식과 같아야 매니페스트 해시와 직접 비교된다.
- `null` 은 "그 자리에 아무것도 없다" 는 뜻이다. `hashEquals` 는 어느 쪽이든
  `null` 이면 `false` — 없는 파일은 무엇과도 같지 않다.
- 비교는 대소문자를 무시하되 길이가 다르면 즉시 다르다.

## Dependencies

- 없음. `core/` 의 최심 리프이며 형제 fractal 에서 import 하지 않는다.
  `hashManifest/`, `buildPlan/`, `markerBlock/` 이 소비한다.

## Boundaries

### Always do

- SHA-256 을 소문자 hex 로 계산
- `ENOENT` 는 소프트 미스로 처리 (`hashFile` 이 `null` 반환)
- `ENOENT` 이외의 오류는 삼키지 말고 그대로 전파

### Ask first

- SHA-256 이외의 다이제스트 알고리즘으로 전환 (manifest v1 호환성 파괴)
- 스트리밍 API 추가 (현재 호출자는 항상 파일 전체를 읽음)

### Never do

- 모듈 레벨 상태 도입 (캐시, 메모이제이션) — 호출자가 생명주기를 소유
- 같은 `core/*` 내 형제 fractal 에서 import
