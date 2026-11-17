# Composite Scenarios contract

## Requirements

여러 기능이 한 정착과 렌더 수명에서 엇갈리는 복합 사례를 소유합니다. 개별 기능의 성공만으로는 전환·배열·주입·검증 사이의 타이밍 오류를 발견하지 못합니다.

## API Contracts

공유 단계로 표현하지 않는 Form 속성·브라우저 입력·비동기 제어는 소비자 꼬리로 둡니다. 꼬리가 공유 단계의 끝에서 이어지지 않으면 `tailStart`로 다시 로드하여 서로 다른 시작 상태의 결과를 섞지 않습니다.

`write`는 핸들 진입이고 `type`은 사용자 입력입니다. 상호작용 상태를 검증할 때 둘을 바꾸지 않습니다. `browserOnly` 마운트 관찰은 실제 뷰포트에서만 검증하며 jsdom의 생략은 검증 성공을 뜻하지 않습니다.

`reentryTail`은 Merge 쓰기 뒤 batch 재진입을 다룹니다. 경로의 통째 교체는 다른 종류의 잠복 source를 지우므로 이 재진입의 대체 준비 단계가 아닙니다(WRITE-094).

## Acceptance Criteria

### composite-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../../DETAIL.md)에 둡니다.

### composite-scene-coverage — 관찰을 보존하는 기준

- 번호 사례와 독립 회귀 장면의 주소를 구분하여 같은 데이터가 어느 계층에서 실패했는지 식별합니다.
- 꼬리의 시작 상태와 브라우저 전용 관찰을 보존하여 jsdom 통과로 실제 노출·IME·네이티브 입력을 검증했다고 주장하지 않습니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
