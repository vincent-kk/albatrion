# types contract

## Requirements

- 기반 형 파일 여섯(`error`·`fieldInput`·`fieldRenderer`·`injectTo`·`jsonSchema`·`value`)은 `internal/` 칸에 있습니다.
- 공개 `Roll` 형 파일 둘(`fieldRenderer`·`jsonSchema`)은 `rolled/` 칸에 있습니다. `FieldRendererProps`, 스키마 형 열여섯(`BooleanSchema`·`NumberSchema`·`StringSchema`·`ArraySchema`·`ObjectSchema`와 각각의 `NonNullable`·`Nullable` 짝, `NullSchema`), `InferJSONSchema`가 여기서 원래 이름으로 정의됩니다.
- 진입점은 두 칸의 형과 `ShowError`를 이름 목록으로 내보냅니다. 루트 `src/index.ts`는 공개 형을 이 index에서 이름으로 재수출합니다.

## API Contracts

- 공개 이름과 겹치는 기반 형 열여덟은 `Base` 접두사를 가집니다(`BaseFieldRendererProps`, `BaseInferJSONSchema`, `BaseNumberSchema` 등). 공개 이름이 본명이고 내부 모양이 파생이라는 관계를 이름으로 드러내며, 한 관문이 두 형을 한 이름으로 실어야 하는 충돌을 없앱니다. 이 fractal 밖의 내부 소비자는 `Base*` 이름을 index에서 가져옵니다.
- `internal/jsonSchema.ts`는 `@winglet/json-schema`의 기반 스키마 형을 `Winglet*` 별칭으로 가져와 `Base*` 형과 구분합니다.
- `rolled/` 파일은 `internal/` 형 파일을 직접 가져오며 import와 export는 형 전용입니다. 런타임 값이나 초기화 동작이 없습니다.
- `internal/jsonSchema.ts`의 스키마 형 계약은 `src/DETAIL.md`의 스키마 절이 정합니다.
- 형제 fractal에서 오는 형은 `@/schema-form/core`·`@/schema-form/components/FieldProxy` 관문의 `import type`입니다. 이 형들을 쓰는 형제도 이 fractal의 index를 쓰므로 형 수준의 상호 참조가 있으나 런타임 순환은 없습니다.
- `core`는 값 형 `InferValueType` 하나를 이 fractal의 index로 가져옵니다.
- 공개 Form 조각 형(`FormFieldProps`·`FormInputProps`·`FormRenderProps`)의 `Roll` 표현은 이 fractal이 아니라 `components/Form`이 소유합니다. 이 fractal에 두면 `types`와 `components/Form` 사이에 형 순환이 생기기 때문입니다.

## Acceptance Criteria

### types-gateway — 관문으로만 소비

- 이 fractal 밖의 코드는 형 파일을 경로로 가져오지 않고 index를 거칩니다.
- 공개 형의 이름과 형 문자열은 패키지 공개 표면 스냅숏과 같습니다.

### rolled-contract — 공개 형의 Roll 표현

- 공개 형이 내부 기반 형의 변경을 반영하면서 `Roll` 변환을 유지합니다.
- 공개 형을 참조해도 런타임 초기화나 상태가 생기지 않습니다.

## Decisions

- 2026-10-15(8단계 소유자 리뷰 1차): 형제 fractal `src/rolled`를 이 fractal의 `rolled/` 칸으로 강등해 합쳤습니다. 이전 역할 칸 `types/types`는 `internal/`이 되었습니다. `rolled`가 형제였던 이유는 공개 이름 열여덟이 기반 형과 같아 한 관문에 함께 실을 수 없었기 때문이며, 기반 형에 `Base` 접두사를 붙여 그 충돌을 없앴습니다. `rolled`의 `form.ts`(Form 조각 형 셋)는 `components/Form`의 각 자식 fractal `type.ts`로 옮겼습니다.

## Last Updated

계약 기준: 8단계 이동 묶음 1(2026-10-15), 모델 B1.
