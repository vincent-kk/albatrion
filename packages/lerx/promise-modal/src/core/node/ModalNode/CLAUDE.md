# ModalNode

## Purpose

AbstractNode를 확장한 구체 모달 노드 구현체. Alert, Confirm, Prompt 세 가지 모달 타입의 상태 관리 및 Promise 해결 로직 제공.

## Structure

- `AlertNode.ts` — 알림 모달 노드 (resolve only)
- `ConfirmNode.ts` — 확인 모달 노드 (boolean resolve)
- `PromptNode.ts` — 입력 모달 노드 (값 resolve/reject)
- `index.ts` — 세 노드 클래스 재export

## Conventions

- 모든 노드는 AbstractNode<T, B> 제네릭 기반
- 구독 기반 상태 업데이트: subscribe/notify 패턴
- Promise 생명주기: 생성 → 상태 변경 → resolve/reject → 정리
- AlertNode: 닫기 시 void resolve
- ConfirmNode: 확인=true, 취소=false resolve
- PromptNode: 확인=입력값 resolve, 취소=reject

## Boundaries

### Always do

- AbstractNode의 추상 메서드 구현
- 제네릭 타입 파라미터 일관성 유지
- 노드 정리(cleanup) 시 구독 해제

### Ask first

- AbstractNode 상속 구조 변경
- resolve/reject 시맨틱 변경

### Never do

- 노드에서 React 렌더링 로직 포함
- Promise를 외부에서 직접 resolve/reject
