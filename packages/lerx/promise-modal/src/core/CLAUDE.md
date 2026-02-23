# core

## Purpose

모달의 핵심 비즈니스 로직을 제공하는 레이어. handle(API 함수)과 node(모달 노드 구현)로 구성.

## Structure

- `handle/` — alert, confirm, prompt API 함수 및 핸들러
- `node/` — 모달 노드 팩토리 및 구체 구현 (AlertNode, ConfirmNode, PromptNode)
- `__tests__/` — core 로직 통합 테스트
- `index.ts` — handle과 node를 재export

## Conventions

- handle: ModalManager.open()을 호출하여 모달 노드를 생성하고 Promise를 반환
- node: AbstractNode를 확장한 구독 기반 상태 관리
- Factory 패턴: nodeFactory가 모달 타입에 따라 적절한 노드 인스턴스 생성

## Boundaries

### Always do

- 새 모달 타입 추가 시 handle과 node 모두에 구현
- nodeFactory의 switch 문에 새 타입 분기 추가
- 기존 테스트 통과 확인

### Ask first

- AbstractNode의 구독/Promise 해결 메커니즘 변경
- handle → node 간 인터페이스 변경

### Never do

- core에서 React 컴포넌트 직접 렌더링
- ModalManager 외부 경로로 모달 열기
