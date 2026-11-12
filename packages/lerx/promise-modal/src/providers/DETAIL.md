# providers

## Requirements

부모 진입점은 소비 훅을 제공하고 Provider 마운트는 자식 진입점에서 연결합니다.

## API Contracts

- 기본값 위의 옵션과 모달별 옵션은 undefined를 건너뛰어 결합합니다. 설정 훅은 포털 내부의 모달 트리에서만 유효합니다.
- 매니저 Context는 변하지 않는 조작 함수를 전달하며 노드 저장소의 소유권은 ModalManager에 둡니다.

## Acceptance Criteria

### options-resolution — options prop은 대체와 폴백으로 해석된다

- options prop을 비우면 기본값으로 폴백하고 대체 객체를 주면 그 값이 적용됩니다.

### hooks-only-surface — 부모 진입점은 훅 전용이다

- 부모 진입점은 소비 훅만 제공하고 Provider는 자식 진입점에서 연결합니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
