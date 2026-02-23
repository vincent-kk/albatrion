# preprocessSchema

## Purpose
JSON Schema를 폼 시스템에서 사용하기 전에 전처리한다. `JsonSchemaScanner`로 스키마 트리를 순회하며 virtual 스키마 변환과 oneOf 변형을 적용한다.

## Structure
- `preprocessSchema.ts` — 공개 함수 및 모듈 수준 scanner 인스턴스
- `index.ts` — barrel export
- `utils/processOneOfSchema/` — oneOf 변형 처리 (ENHANCED_KEY 주입)
- `utils/processVirtualSchema/` — virtual 필드 조건 변환

## Conventions
- TypeScript strict 모드
- scanner는 모듈 수준 싱글턴으로 생성 (재사용)
- `mutate` 옵션으로 스키마 노드를 in-place 변형
- object 스키마: `processVirtualSchema` 적용
- oneOf 키워드 노드: `processOneOfSchema` 적용 (variant 인덱스 기록)
- 변형이 없으면 `undefined` 반환하여 원본 유지

## Boundaries

### Always do
- scanner를 모듈 싱글턴으로 유지하여 불필요한 재생성 방지
- `mutate`에서 변경이 없을 때 `undefined` 반환 (원본 보존)
- oneOf와 virtual 처리 순서 유지 (virtual 먼저, 그 다음 oneOf)

### Ask first
- scanner `options` 변경 (다른 키워드 처리 추가 등)
- `ENHANCED_KEY` 상수 변경 (노드 시스템 전반에 영향)
- 전처리 실행 시점 또는 호출 위치 변경

### Never do
- 전처리 결과를 원본 스키마 객체에 직접 반영
- scanner 인스턴스를 외부에서 재설정하거나 교체
- `processOneOfSchema`, `processVirtualSchema`를 이 모듈 밖에서 직접 호출

## Dependencies
- `@winglet/json-schema/filter` — `isObjectSchema`
- `@winglet/json-schema/scanner` — `JsonSchemaScanner`
- `@/schema-form/types` — `JsonSchema`
- `./utils/processOneOfSchema` — oneOf 변형
- `./utils/processVirtualSchema` — virtual 스키마 변환
