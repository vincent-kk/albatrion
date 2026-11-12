# ModalManagerContext

## Purpose

모달 매니저 상태를 React Context로 제공. 저장소에 연결하는 안정된 모달 조작 함수 제공.

## Conventions

- Context 범위의 전환 시간·확정 후 파괴 훅을 소유하며 저장소 자체 구독은 app에 위임합니다.

- useModalManagerContext: 전체 Context 값 접근
- useModalManager: 모달 관리 전용 인터페이스
- ModalManager 싱글톤과 연동하여 상태 동기화

## Boundaries

### Always do

- ModalManager.openHandler 설정을 통해 모달 열기 연동
- 모달 상태 변경 시 React 리렌더링 트리거

### Ask first

- Context 값 구조 변경
- ModalManager와의 연동 방식 변경

### Never do

- ModalManager를 우회하여 별도 모달 목록 조작
- ModalManager 상태와 Context 상태 불일치 허용
