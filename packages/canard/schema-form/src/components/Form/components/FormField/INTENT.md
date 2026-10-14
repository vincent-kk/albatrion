# FormField — 필드 묶음

## Purpose

`Form.Field`로 쓰이는 조각으로, 경로의 필드를 렌더러·입력·감싸개와 함께 한 묶음으로 그립니다.

## Conventions

- 진입점은 `FormField`와 `FormFieldProps`를 이름으로 내보내고, 부모 `Form`이 정적 멤버로 붙입니다.
- `FieldInput`·`FieldRenderer`·`Wrapper`를 주면 그 필드에서만 기본 구성 요소를 바꿉니다.

## Boundaries

### Always do

- 필드 해석과 오류 경계는 `FieldProxy`에 맡깁니다.

### Ask first

- `FormFieldProps`의 공개 속성을 바꿀 때

### Never do

- `FormCore`나 형제 조각을 가져오지 않고, 폼 상태를 따로 소유하지 않습니다.
