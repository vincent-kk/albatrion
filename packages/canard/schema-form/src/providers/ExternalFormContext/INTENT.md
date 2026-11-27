# ExternalFormContext

## Purpose

여러 Form에 기본 설정을 공급하며 개별 폼 선택을 보존합니다.

## Conventions

- 세부 선택·수명과 소유자 연결은 [DETAIL](DETAIL.md)에 둡니다.

## Boundaries

### Always do

- 정의는 불변 참조별로 재사용하여 무관한 기본값 변경이 입력을 교체하지 않게 합니다.

### Ask first

- 외부 설정의 공개 형이나 실시간 적용 수명을 바꿀 때

### Never do

- 노드를 직접 생성·조작하거나 기본 Context에 플러그인 렌더러를 하드코딩하지 않습니다.
