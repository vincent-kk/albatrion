# FormError — 필드 오류 표시

## Purpose

`Form.Error`로 쓰이는 조각으로, 경로의 필드 오류 메시지를 그립니다.

## Conventions

- 진입점은 `FormError`와 `FormErrorProps`를 이름으로 내보내고, 부모 `Form`이 정적 멤버로 붙입니다.
- 렌더러는 Form 속성 `FormErrorRenderer`, 없으면 플러그인의 `FormErrorRenderer`입니다.

## Boundaries

### Always do

- 오류를 보일지는 `FieldProxy`가 Form의 `showError`와 필드 상태로 정한 결과를 따릅니다.

### Ask first

- `FormErrorProps`의 공개 속성이나 렌더러 선택 순서를 바꿀 때

### Never do

- 오류를 직접 계산하거나 형식화하지 않고, `FormCore`나 형제 조각을 가져오지 않습니다.
