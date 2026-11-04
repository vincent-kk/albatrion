# FormInput — 필드 입력

## Purpose

`Form.Input`으로 쓰이는 조각으로, 경로의 필드 입력만 그립니다.

## Conventions

- 진입점은 `FormInput`과 `FormInputProps`를 이름으로 내보내고, 부모 `Form`이 정적 멤버로 붙입니다.
- 렌더러는 Form 속성 `FormInputRenderer`, 없으면 플러그인의 `FormInputRenderer`입니다.

## Boundaries

### Always do

- 필드 해석과 오류 경계는 `FieldProxy`에 맡깁니다.

### Ask first

- `FormInputProps`의 공개 속성이나 렌더러 선택 순서를 바꿀 때

### Never do

- `FormCore`나 형제 조각을 가져오지 않고, 폼 상태를 따로 소유하지 않습니다.
