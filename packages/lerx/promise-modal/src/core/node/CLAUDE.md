# node

## Purpose

모달 노드 시스템의 구현 모듈. nodeFactory를 통해 모달 타입별 노드 인스턴스를 생성.

## Structure

- `ModalNode/` — 구체 노드 구현 (AlertNode, ConfirmNode, PromptNode)
- `nodeFactory.ts` — ManagedModal 타입에 따른 팩토리 함수
- `type.ts` — ModalNode, AlertNode, ConfirmNode, PromptNode 타입 export
- `index.ts` — nodeFactory와 타입 재export

## Conventions

- Factory 패턴: `modal.type`에 따라 switch 분기로 적절한 노드 생성
- 모든 노드는 AbstractNode 기반 (구독, Promise 해결, 생명주기)
- 알 수 없는 타입은 Error throw (unreachable by design)

## Boundaries

### Always do

- 새 모달 타입 추가 시 ModalNode에 클래스 구현, nodeFactory에 분기 추가
- `type.ts`에 export 타입 추가

### Ask first

- nodeFactory의 분기 로직 변경
- AbstractNode 인터페이스 수정

### Never do

- nodeFactory 외부에서 직접 노드 인스턴스 생성
- 노드 클래스에서 DOM 직접 조작
