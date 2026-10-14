# types contract

## Requirements

- 형 파일은 네 칸에 있습니다. `schema/`는 `jsonSchema`·`value`·`injectTo`, `field/`는 `fieldInput`·`fieldRenderer`·`inferFieldInputSchema`, `error/`는 `error`, `rolled/`는 공개 `Roll` 형 `fieldRenderer`·`jsonSchema`를 둡니다.
- 공개 `Roll` 형 열여덟은 `rolled/`에서 `Rolled` 접두사로 정의됩니다: `RolledFieldRendererProps`, 스키마 형 열여섯(`RolledBooleanSchema`·`RolledNumberSchema`·`RolledStringSchema`·`RolledArraySchema`·`RolledObjectSchema`와 각각의 `NonNullable`·`Nullable` 짝, `RolledNullSchema`), `RolledInferJSONSchema`.
- 진입점은 네 칸의 형과 `ShowError`를 이름 목록으로 내보냅니다. 루트 `src/index.ts`는 `Rolled*` 형을 `RolledNumberSchema as NumberSchema`처럼 공개 이름으로 바꿔 재수출합니다.

## API Contracts

- 내부 형은 본명을 쓰고, 공개 `Roll` 형만 `Rolled` 접두사를 가집니다. 공개 이름은 루트 index의 재수출에서만 생깁니다.
- `Roll`은 공개 형을 평평한 객체로 펴서 사용자 편집기의 형 표시를 좋게 하는 것뿐이며 런타임 동작이 없습니다. 스키마 형은 `JSONSchemaChildren`을 거쳐 자기 자신을 다시 가리키는 재귀 형이라, 정의 자리에서 `Roll`로 감싸면 TypeScript가 순환 별칭으로 거부합니다. 그래서 재귀 고리 밖의 `Rolled*` 이름이 내부 형을 감쌉니다.
- `rolled/` 파일은 다른 칸의 형 파일을 직접 가져오며 import와 export는 형 전용입니다. 런타임 값이나 초기화 동작이 없습니다.
- `schema/jsonSchema.ts`는 `@winglet/json-schema`의 기반 스키마 형을 `Winglet*` 별칭으로 가져와 이 패키지의 스키마 형과 구분합니다. 이 파일의 스키마 형 계약은 `src/DETAIL.md`의 스키마 절이 정합니다.
- 공개 `RolledInferJSONSchema`(재수출 이름 `InferJSONSchema`)는 사용자가 작성하는 스키마를 값 형에서 추론합니다. 내부 `InferFieldInputSchema`(`field/`)는 virtual 노드와 여러 종류의 합집합 스키마까지 아는 입력 추론으로, `FieldInputProps` 계열만 씁니다. 작성 쪽 형과 내부 형을 가를 때 이 구분이 기준입니다.
- 형제 fractal에서 오는 형은 `@/schema-form/core`·`@/schema-form/components/FieldProxy` 관문의 `import type`입니다. 이 형들을 쓰는 형제도 이 fractal의 index를 쓰므로 형 수준의 상호 참조가 있으나 런타임 순환은 없습니다.
- `core`는 값 형 `InferValueType` 하나를 이 fractal의 index로 가져옵니다.
- 공개 Form 조각 형(`FormFieldProps`·`FormInputProps`·`FormRenderProps`)의 `Roll` 표현은 이 fractal이 아니라 `components/Form`이 소유합니다. 이 fractal에 두면 `types`와 `components/Form` 사이에 형 순환이 생기기 때문입니다.

## Acceptance Criteria

### types-gateway — 관문으로만 소비

- 이 fractal 밖의 코드는 형 파일을 경로로 가져오지 않고 index를 거칩니다.
- 공개 형의 이름과 형 문자열은 패키지 공개 표면 스냅숏과 같습니다.

### rolled-contract — 공개 형의 Roll 표현

- 공개 형이 내부 형의 변경을 반영하면서 `Roll` 변환을 유지합니다.
- 공개 형을 참조해도 런타임 초기화나 상태가 생기지 않습니다.

## Decisions

- 2026-10-15(8단계 소유자 리뷰 1차, 332·337·338라운드): 형제 fractal `src/rolled`를 이 fractal의 `rolled/` 칸으로 강등해 합쳤습니다. 이전 역할 칸 `types/types`는 관심사별 칸 `schema/`·`field/`·`error/`로 나뉘었습니다. `rolled`가 형제였던 이유는 공개 이름 열여덟이 내부 형과 같아 한 관문에 함께 실을 수 없었기 때문이며, 공개 쪽에 `Rolled` 접두사를 붙이고 루트 index에서 이름을 바꿔 그 충돌을 없앴습니다. 정의 자리에서 `Roll`로 펴는 안은 스키마 형의 재귀 때문에 성립하지 않았습니다. `rolled`의 `form.ts`(Form 조각 형 셋)는 `components/Form`의 각 자식 fractal `types/` 칸으로 옮겼습니다.

## Last Updated

계약 기준: 8단계 이동 묶음 1(2026-10-15), 모델 B1.
