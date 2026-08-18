# src — common-utils 진입 배럴

## Purpose

`@winglet/common-utils` 패키지의 소스 루트. 하위 공개 fractal(`constant`, `errors`, `libs`)과 `utils` 하위 organ 전체의 심볼을 이름으로 재수출하는 단일 진입 배럴(`index.ts`)만 소유한다.

개별 유틸리티의 동작·계약은 소유하지 않는다 — 각 하위 fractal이 소유하며, 이 fractal은 재수출 표면의 일관성(이름 유지, 와일드카드 금지)만 책임진다. 런타임 의존성은 0이고, 패키지 매니페스트의 sub-path export 선언이 하위 모듈 단위 tree-shaking을 지원한다.

## Boundaries

### Always do

- 새 공개 심볼은 원본 모듈의 이름 그대로 `index.ts`에 named re-export로 추가한다
- 재수출 대상 fractal이 추가되거나 이름이 바뀌면 이 파일과 패키지 매니페스트를 함께 갱신한다

### Ask first

- `index.ts`에 재수출이 아닌 로컬 구현을 추가하는 변경
- 재수출 심볼의 이름을 원본과 다르게 바꾸는(별칭을 붙이는) 변경

### Never do

- `export *` 와일드카드 재수출 추가
- 런타임 의존성(dependencies) 추가
