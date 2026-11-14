# validationScheduling

## Purpose

일회성 프레임 뒤 슬롯과 연속 입력의 주기를 도메인 상태와 독립된 시간 정책으로 소유합니다. 검증 실행과 결과의 수명은 호출자에게 남깁니다.

## Conventions

- 시계는 호출자가 주입하고 호스트의 프레임 지원·가시성은 예약 시점에 확인합니다.
- run이 실제 시작했을 때만 상한 시계를 갱신합니다.
- 시간 정책은 내부 경계이며 패키지 공개 옵션으로 늘리지 않습니다.

## Boundaries

### Always do

- 선행·watch·carry·후행과 마지막 실제 자동 실행 시작 기준 100ms 상한을 함께 보존합니다.
- 취소한 cadence의 모든 소유 핸들과 늦은 콜백을 무효화합니다.
- 프레임 부재·숨김·정지 fallback의 단일 실행을 보존합니다.

### Ask first

- 주기·상한·fallback 문턱을 바꾸거나 호출 경계를 넓힐 때.

### Never do

- 노드·커밋·stamp·요청 대상·오류·검증기 상태를 읽지 않습니다.
- validation·record·settle·write를 가져오지 않습니다.
- 예약 상한을 판정 완료나 paint의 시한으로 약속하지 않습니다.
