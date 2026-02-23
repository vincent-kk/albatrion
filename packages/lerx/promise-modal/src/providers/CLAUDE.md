# providers

## Purpose

모달 시스템의 상태와 설정을 React Context로 관리하는 Provider 모듈 모음.

## Structure

- `ModalManagerContext/` — 모달 매니저 상태 (열린 모달 목록, open/close 핸들러)
- `ConfigurationContext/` — 모달 설정 (옵션, 지속시간, 배경)
- `UserDefinedContext/` — 사용자 정의 컴포넌트 및 데이터
- `index.ts` — 모든 Context와 훅 재export

## Conventions

- 각 Context는 독립적인 관심사 분리 (Single Responsibility)
- Provider 컴포넌트와 Consumer 훅을 쌍으로 제공
- 네이밍: `{Name}ContextProvider` (Provider), `use{Name}Context` (훅)

## Boundaries

### Always do

- 새 Context 추가 시 Provider + 훅 쌍으로 구현
- index.ts에 export 추가
- BootstrapProvider에서 래핑 순서 반영

### Ask first

- 기존 Context의 값 구조 변경
- Context 간 의존성 추가

### Never do

- Provider 외부에서 Context 값 직접 변경
- Context를 core 레이어에서 직접 참조
