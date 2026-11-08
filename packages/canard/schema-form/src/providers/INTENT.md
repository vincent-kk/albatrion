# providers

## Purpose

폼 설정과 인스턴스별 작업공간을 Context 경계로 연결하며 노드 로드·보고·표시의 소유자를 분리합니다.

## Conventions

- 조립 순서는 FormCore, 세부 수명은 각 자식 계약에서 관리합니다. 상위에서 자식의 동작을 다시 정의하지 않습니다.

## Boundaries

### Always do

- Form 설정이 외부 기본값을 덮는 방향을 유지하여 인스턴스별 선택을 보장합니다.
- 폼별 상태를 Context 경계 안에 두어 여러 폼 사이의 오염을 막습니다.

### Ask first

- Context를 추가·분리·통합하거나 조립 의존성을 바꿀 때

### Never do

- 엔진 상태나 자식 수명을 상위 providers에 중복 저장하지 않습니다.
- 다른 Context의 내부 파일이나 가변 값을 직접 수정하지 않습니다.
