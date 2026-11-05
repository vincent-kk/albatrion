# FormLabel — 필드 제목

## Purpose

Form.Label은 입력 선택을 몰라도 접근 가능한 제목을 연결할 수 있어야 합니다.

## Conventions

- 부모 Form의 정적 조각으로 제공하며 별도 폼 상태를 소유하지 않습니다.
- 조각별 설정 수명과 이유는 [DETAIL](DETAIL.md)에 둡니다.

## Boundaries

### Always do

- 필드 해석과 오류 격리는 FieldProxy에 맡겨 같은 정책의 이중 구현을 막습니다.

### Ask first

- 공개 props, 조각 설정 수명 또는 접근성 규약을 바꿀 때

### Never do

- FormCore나 형제 조각을 가져오거나 입력·노드 상태를 중복 소유하지 않습니다.
