# BootstrapProvider

## Requirements

각 초기화 주체는 소유자 또는 대기자로 등록하며 cleanup은 자신만 해제합니다. 소유권이 바뀌면 앵커 상태를 갱신합니다.

## API Contracts

- 기본 초기화는 document.body를 사용하고 명령형 initialize(element)는 지정 요소를 사용합니다. 소유자 해제 뒤 대기자가 있으면 열린 모달을 이어받습니다.

## Acceptance Criteria

### bootstrap-provider-contract — 관찰 가능한 동작

- 대기자 해제는 소유자를 건드리지 않고 소유자 해제는 대기자에게 열린 모달을 전달합니다.

## Last Updated

결과 확정, 자원 소유권 또는 표시 계약이 바뀔 때 갱신합니다.
