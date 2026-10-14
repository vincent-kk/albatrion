# Authored schema identity

## Purpose

동등한 트리를 다시 만들지 않도록, Form 초기화 때 작성된 스키마끼리 비교한다.

## Boundaries

### Always do

- 객체 key 순서를 유지하고, JSON이 아닌 값은 참조로 비교한다.

### Ask first

- 작성된 스키마의 동등성 기준 변경

### Never do

- 비교하는 동안 스키마를 변경하거나 복제하지 않는다.
