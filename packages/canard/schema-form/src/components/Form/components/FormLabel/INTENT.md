# FormLabel — 필드 제목

## Purpose

`Form.Label`로 쓰이는 조각으로, 경로의 필드 제목을 접근 가능한 label로 그립니다.

## Conventions

- 진입점은 `FormLabel`과 `FormLabelProps`를 이름으로 내보내고, 부모 `Form`이 정적 멤버로 붙입니다.
- 렌더러는 Form 속성 `FormLabelRenderer`, 없으면 플러그인의 `FormLabelRenderer`입니다.

## Boundaries

### Always do

- label에 `htmlFor={path}`와 id `label:${path}`를 둘 다 둡니다.

### Ask first

- label의 id 규약이나 렌더러 선택 순서를 바꿀 때

### Never do

- 입력의 종류를 판정하지 않고, `FormCore`나 형제 조각을 가져오지 않습니다.
