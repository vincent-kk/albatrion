# UI 플러그인 연결 경계

## Purpose

UI 라이브러리의 입력과 표시 부품을 schema-form의 값·잠금·식별자 계약에 연결합니다.

## Conventions

입력 정의는 스키마 hint로 선택하며 부품의 표시 상태와 폼의 저장 상태를 구별합니다.

## Boundaries

### Always do

- 입력은 전달받은 식별자로 자기 컨트롤과 보조 컨트롤을 연결합니다.
- enum identity와 사용자 조작의 저장 시점 및 읽기 전용 상태를 보존합니다.

### Ask first

- 공개 입력 선택 우선순위·설정 또는 부품 등록의 경계를 바꾸는 경우

### Never do

- 렌더 중 폼 값을 묵시적으로 정규화하지 않습니다.
- 입력의 이름 연결을 특정 FieldRenderer의 추가 prop에 의존하지 않습니다.
