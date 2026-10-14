# FormRender — 렌더 함수 필드

## Purpose

`Form.Render`로 쓰이는 조각으로, 경로의 필드를 호출자의 렌더 함수로 그립니다.

## Conventions

- 진입점은 `FormRender`와 `FormRenderProps`를 이름으로 내보내고, 부모 `Form`이 정적 멤버로 붙입니다.
- `children` 렌더 함수가 그 필드의 `FieldRenderer`가 됩니다.

## Boundaries

### Always do

- 필드 해석과 오류 경계는 `FieldProxy`에 맡깁니다.

### Ask first

- `FormRenderProps`의 공개 속성을 바꿀 때

### Never do

- `FormCore`나 형제 조각을 가져오지 않고, 폼 상태를 따로 소유하지 않습니다.
