# Controls Scenarios contract

## Requirements

제어 층과 상태 결합을 값 존재와 구별하는 공유 장면을 소유합니다. 화면에서 사라진 입력을 곧바로 비활성 노드로 취급하지 않도록 상태와 출력을 함께 관찰합니다.

## API Contracts

`states` 장면의 batch는 호출자의 직접 쓰기를 뜻하며 readOnly 입력을 타이핑한 것으로 바꾸지 않습니다. `clear`도 빈 문자열의 직접 쓰기로 치환하지 않아 화면 비우기와 노드 쓰기가 같은 기대를 공유하게 합니다.

`controls.virtualization`이라는 장면 이름은 소비자 렌더러가 Form 가상화 옵션을 주입하는 선택자입니다. 캐럿·IME·focus·trim의 계측은 전용 소비자 e2e가 맡아 장면 데이터에 React나 spy를 넣지 않습니다.

## Acceptance Criteria

### controls-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../DETAIL.md)에 둡니다.

### controls-scene-coverage — 관찰을 보존하는 기준

- 선언 범위와 나감 정책의 관찰을 유지하여 로컬 상태가 자식으로 새는 회귀를 검출합니다.
- 잠금 상태의 명령형 쓰기와 화면 입력 차단을 서로 다른 소비자 관찰로 유지합니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
