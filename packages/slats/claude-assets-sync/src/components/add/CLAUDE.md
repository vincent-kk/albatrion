# add

## Purpose

add 명령어의 ink 기반 대화형 UI 컴포넌트. 패키지 에셋을 탐색하고 선택하여 추가한다.

## Structure

- `index.ts` — barrel export
- `AddCommand.tsx` — 대화형 에셋 추가 플로우 (탐색→선택→동기화→결과)
- `BulkAddView.tsx` — 대량 추가 뷰

## Conventions

- ink React 컴포넌트 패턴 (함수형 컴포넌트, hooks)
- Props 타입은 컴포넌트와 동일 파일에서 export

## Boundaries

### Always do

- tree/ 모듈의 TreeSelect를 재사용하여 에셋 선택 UI 구현
- shared/ 모듈의 공통 컴포넌트 활용

### Ask first

- 컴포넌트 Props 인터페이스 변경

### Never do

- 컴포넌트에서 직접 파일시스템/네트워크 호출
