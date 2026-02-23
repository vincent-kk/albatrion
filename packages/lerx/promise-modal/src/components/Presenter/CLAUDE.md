# Presenter

## Purpose

개별 모달 노드를 렌더링하는 프레젠터 컴포넌트. 모달의 생명주기(마운트/언마운트)와 상태 구독을 관리.

## Structure

- `Presenter.tsx` — Presenter 컴포넌트 구현
- `index.ts` — Presenter 재export

## Conventions

- 각 모달 노드에 대해 하나의 Presenter 인스턴스 생성
- 노드의 구독 시스템을 통해 상태 변경 감지 및 리렌더링
- Background + Foreground 조합으로 모달 UI 구성

## Boundaries

### Always do

- 노드 구독 등록/해제 생명주기 관리
- 모달 닫힘 시 정리(cleanup) 수행

### Ask first

- 렌더링 구조 변경 (Background/Foreground 레이아웃)
- 애니메이션 통합 방식 변경

### Never do

- Presenter에서 모달 비즈니스 로직 처리
- 노드 상태를 직접 변경 (구독 패턴 우회)
