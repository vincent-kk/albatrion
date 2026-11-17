# FieldInputsContext

## Purpose

폼별 입력 맵·정의를 정규화하고 구성 오류를 로드 경계로 전달합니다.

## Conventions

- 세부 선택·수명과 소유자 연결은 [DETAIL](DETAIL.md)에 둡니다.

## Boundaries

### Always do

- 실패한 새 맵은 마지막 committed 유효 맵을 보존하여 기존 입력을 뜻밖에 교체하지 않게 합니다.

### Ask first

- 정규화·패턴 의미 또는 불변 참조 계약을 바꿀 때

### Never do

- 입력을 직접 선택·실행하거나 렌더 중 구성 오류를 보고하지 않습니다.
