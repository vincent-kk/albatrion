# BootstrapProvider

## Requirements

각 초기화 주체는 소유자 또는 대기자로 등록하며 cleanup은 자신만 해제합니다. 소유권이 바뀌면 앵커 상태를 갱신합니다.

## API Contracts

- root prop 변경과 initialize 호출 중 마지막 값이 유효 root이며 앵커 생성·이동·분리는 매니저만 수행합니다. null로 전환해도 열린 입력과 Promise 및 포털은 유지합니다.
- useInitializeModal의 manual 모드는 initialize 전까지 null과 같습니다. 컴포넌트 props는 마운트 시점 값이며 변경은 개발 모드에서 prop당 한 번 경고합니다. 바뀌는 데이터는 context로 전달합니다.
- 기본 초기화는 document.body를 사용하고 명령형 initialize(element)는 지정 요소를 사용합니다. 소유자 해제 뒤 대기자가 있으면 열린 모달을 이어받습니다.

## Acceptance Criteria

### bootstrap-provider-contract — 관찰 가능한 동작

- 대기자 해제는 소유자를 건드리지 않고 소유자 해제는 대기자에게 열린 모달을 전달합니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
