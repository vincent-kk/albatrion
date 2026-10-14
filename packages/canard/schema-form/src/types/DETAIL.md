# types contract

## Requirements

- 형 파일 여섯(`error`·`fieldInput`·`fieldRenderer`·`injectTo`·`jsonSchema`·`value`)은 `types/` 칸에 있고, 진입점은 그 형과 `ShowError`를 이름 목록으로 내보냅니다.
- 루트 `src/index.ts`는 이 fractal의 index와 형제 `rolled`의 index에서 공개 형을 이름으로 재수출합니다. `rolled`는 이 fractal의 기반 형을 index로 가져와 `Roll` 표현을 만듭니다.

## API Contracts

- `types/jsonSchema.ts`의 스키마 형 계약은 `src/DETAIL.md`의 스키마 절이 정합니다.
- 형제 fractal에서 오는 형은 `@/schema-form/core`·`@/schema-form/components/Field` 관문의 `import type`입니다. 이 형들을 쓰는 형제도 이 fractal의 index를 쓰므로 형 수준의 상호 참조가 있으나 런타임 순환은 없습니다.
- `core`는 값 형 `InferValueType` 하나를 이 fractal의 index로 가져옵니다.

## Acceptance Criteria

### types-gateway — 관문으로만 소비

- 이 fractal 밖의 코드는 형 파일을 경로로 가져오지 않고 index를 거칩니다.
- 공개 형의 이름과 형 문자열은 패키지 공개 표면 스냅숏과 같습니다.

## Last Updated

계약 기준: 정돈-3(2026-10-14), 모델 B1.
