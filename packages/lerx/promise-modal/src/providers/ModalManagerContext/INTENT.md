# ModalManagerContext

## Purpose

모달 매니저 상태를 React Context로 제공. 열린 모달 목록 관리, 모달 open/close 핸들러 제공.

## Structure

- `ModalManagerContextProvider.tsx` — Context Provider 컴포넌트
- `useModalManagerContext.ts` — useModalManagerContext, useModalManager 훅
- `index.ts` — Provider, 훅 재export

## Conventions

- useModalManagerContext: 전체 Context 값 접근
- useModalManager: 모달 관리 전용 인터페이스 (open, close, refresh)
- ModalManager 싱글톤과 연동하여 상태 동기화

## Boundaries

### Always do

- ModalManager.openHandler 설정을 통해 모달 열기 연동
- 모달 상태 변경 시 React 리렌더링 트리거

### Ask first

- Context 값 구조 변경
- ModalManager와의 연동 방식 변경

### Never do

- Context 외부에서 모달 목록 직접 조작
- ModalManager 상태와 Context 상태 불일치 허용
