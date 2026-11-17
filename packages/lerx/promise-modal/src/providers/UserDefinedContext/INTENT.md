# UserDefinedContext

## Purpose

사용자가 정의한 context 데이터를 모달 시스템 내부에 주입하는 Context. UI 컴포넌트 선택은 ConfigurationContext가 소유합니다.

## Conventions

- BootstrapProvider의 Props를 통해 사용자 정의 값 전달
- 모달 컴포넌트에서 useUserDefinedContext로 접근

## Boundaries

### Always do

- 사용자 데이터만 이 Context로 전달하여 UI 선택 책임과 분리
- 타입 안전성 유지

### Ask first

- Context 값 구조 확장
- 새 사용자 정의 슬롯 추가

### Never do

- 사용자 정의 데이터를 props drilling으로 전달
- 라이브러리 내부 로직에서 사용자 정의 값에 의존
