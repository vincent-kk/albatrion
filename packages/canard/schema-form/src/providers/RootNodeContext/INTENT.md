# RootNodeContext

## Purpose

루트의 생성·교체·React commit을 연결하고 현재 루트의 콜백·외부 오류·검증 슬롯 수명을 소유합니다.

## Conventions

- 추측성 생성과 확정된 load의 보고를 분리하여 폐기 렌더의 부작용을 막습니다.
- 구조 입력과 live 실행 설정의 수명을 구분합니다.

## Boundaries

### Always do

- 트리 생성·마운트·인계는 core 경계를 사용하고 React 판정은 인자로 주입합니다.
- prepared load의 구독을 load 수명 동안 유지하고 effect cleanup은 검증 캐시 retain만 해제합니다.
- 외부 오류는 구조 교체가 끝난 현행 루트에 적용하여 옛 binding으로 새 오류가 새지 않게 합니다.
- 버퍼 기록의 원래 root·warning scope를 보존하고 replacement의 caller 오류와 보고 완료를 구분합니다.
- 자동 검증은 공통 슬롯으로 연결하여 표시 정책이 검증 일정을 바꾸지 않게 합니다.

### Ask first

- 기본 검증 모드·루트 교체·숨김 보고·reset과 rebuild의 관계를 바꾸는 경우.

### Never do

- 렌더 중 추측성 load의 소비자 callback을 호출하지 않습니다.
- cleanup을 루트 폐기로 취급하거나 root 교체 전 외부 오류를 적용하지 않습니다.
- Form 트리 바깥에서 이 Context를 사용하지 않습니다.
