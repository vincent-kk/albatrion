# types

## Purpose

`@canard/schema-form`이 여러 fractal에서 함께 쓰는 형(스키마·값·입력·렌더러·오류·주입 처리기)을 소유하는 fractal. 공개 형의 `Roll` 변환은 형제 fractal `rolled`(`src/rolled`)가 맡는다.

## Conventions

- 형 파일은 역할 칸 types에 주제별로 둔다. 진입점 index는 이름 목록으로만 재수출하며 와일드카드 재수출을 쓰지 않는다.
- 형제 fractal(`core`·`components/Field`·`components/Form`)의 형은 각 관문 index에서 `import type`으로 가져온다. 값은 `ShowError` 열거 하나뿐이다.
- 형 계약 시험은 시험 칸에 두고 형 파일을 직접 가져온다.

## Boundaries

### Always do

- 형제 fractal에서 가져오는 것은 `import type`으로 한다(런타임 순환을 만들지 않기 위해).
- 공개 형을 바꾸면 `rolled`의 대응 형과 공개 표면 스냅숏을 함께 확인한다.

### Ask first

- 공개 형의 이름·모양 변경(패키지 공개 계약)
- 새 런타임 값 추가

### Never do

- 형제 fractal의 내부 파일을 경로로 가져오기
- 구현 로직을 이 fractal에 두기
