# types

## Purpose

`@canard/schema-form`이 여러 fractal에서 함께 쓰는 형(스키마·값·입력·렌더러·오류·주입 처리기)과, 그 가운데 공개하는 형의 `Roll` 표현을 소유하는 fractal. 형 파일은 관심사별 칸(스키마, 필드 입력·렌더러, 오류)에 두고, 공개 `Roll` 형은 rolled 칸에 둔다.

## Conventions

- 내부 형은 본명을 쓴다. 공개용 `Roll` 형은 rolled 칸에서 `Rolled` 접두사로 정의하고(`RolledNumberSchema`), 패키지 루트 index가 `RolledNumberSchema as NumberSchema`처럼 공개 이름으로 바꿔 내보낸다.
- rolled 칸의 파일은 다른 칸의 형 파일을 직접 가져오며, 이 fractal의 index를 거치지 않는다.
- 진입점 index는 모든 칸의 이름을 이름 목록으로 재수출하며 와일드카드 재수출을 쓰지 않는다.
- 형제 fractal(`core`·`components/FieldProxy`·`components/Form`)의 형은 각 관문 index에서 `import type`으로 가져온다. 값은 `ShowError` 열거 하나뿐이다.
- 형 계약 시험은 시험 칸에 두고 형 파일을 직접 가져온다.

## Boundaries

### Always do

- 형제 fractal에서 가져오는 것은 `import type`으로 한다(런타임 순환을 만들지 않기 위해).
- 공개 형을 바꾸면 rolled 칸의 대응 형과 공개 표면 스냅숏을 함께 확인한다.
- 새 공개 형은 rolled 칸에서 `Roll`로 감싼 뒤 index의 이름 목록과 루트 `src/index.ts`의 이름 목록에 함께 추가한다.

### Ask first

- 공개 형의 이름·모양 변경(패키지 공개 계약)
- `InferJSONSchema`의 형 추론 로직 변경(nullable 처리 방식에 영향)
- 새 스키마 범주 추가(NonNullable·Nullable 짝으로 추가해야 함)
- 새 런타임 값 추가

### Never do

- 형제 fractal의 내부 파일을 경로로 가져오기
- 구현 로직을 이 fractal에 두기
- `Roll`로 감싸지 않은 내부 형을 공개 이름으로 내보내기
