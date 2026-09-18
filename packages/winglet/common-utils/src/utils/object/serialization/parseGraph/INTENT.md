# parseGraph

## Purpose

외부 graph wire를 검증하고 안전하게 원본 참조 그래프를 복원합니다.

## Conventions

검증을 완료한 후 모든 node를 할당하고, 마지막에 edge를 채웁니다.

## Boundaries

### Always do

- 도달 불가능한 node까지 검증·자원 합산합니다.
- object/array는 own data property로 복원합니다.

### Ask first

- 허용 문법 또는 자원 한도를 변경합니다.

### Never do

- 사용자 constructor/eval/reviver를 실행합니다.
- validation/restoration helper를 entry point에서 export합니다.
