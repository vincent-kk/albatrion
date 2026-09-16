# bootstrap

## Requirements

공개 ModalProvider가 모달 시스템의 초기화와 Context 구성을 담당합니다.

## API Contracts

- BootstrapProvider의 공개 이름과 초기화 훅의 공개 이름은 내부 구현 이름과 구분합니다.
- 하위 Context는 설정, 매니저 상태, 사용자 지정 값의 의존 순서로 연결합니다.

## Acceptance Criteria

### bootstrap-contract — 관찰 가능한 동작

- 공개 Provider 사용만으로 하위 모달 소비자가 필요한 Context를 얻습니다.
- 초기화 책임을 일반 렌더 컴포넌트로 분산하지 않습니다.

## Last Updated

2026-09-16
