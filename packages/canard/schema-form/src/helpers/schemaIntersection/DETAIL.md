# Schema Intersection contract

## Requirements

잎 제약의 교차와 그 결과의 처분을 분리합니다. 같은 공집합도 작성 단계의 충돌인지 실행 중의 힌트인지에 따라 다르게 처리해야 하므로, 이 모듈은 소비자별 오류를 던지지 않습니다.

## API Contracts

`EMPTY_INTERSECTION`은 JSON 값이나 제약의 부재와 겹치지 않는 표시입니다. 이를 공개 스키마에 그대로 넣지 않으며, 정적 실패와 런타임 표현으로 바꾸는 책임은 [effectiveSchema](../../core/engine/blueprint/effectiveSchema/DETAIL.md)에 있습니다.

입력은 빌린 값입니다. 교차를 위해 입력을 변경하거나 깊이 복사하지 않으며, 한쪽 선언만 있으면 그 참조를 유지합니다. 결과의 소유권을 혼동하여 작성 스키마를 동결하거나 수정하지 않게 하기 위한 계약입니다.

## Acceptance Criteria

### SCHEMA-043 — const의 값 동등성과 pattern의 연언을 구별합니다

JSON const는 참조가 달라도 구조가 같으면 같은 제약이며, 이때 앞 선언의 참조를 유지합니다. 참조 비교만 쓰면 같은 객체·배열 값을 선언한 연언까지 충돌로 오인하기 때문입니다. enum의 얕은 비교와 깊은 비교 선택을 const에 잘못 적용하지 않습니다.

정규식을 하나로 합치는 연산은 제공하지 않습니다. 전방 탐색을 이어 붙이면 서로 다른 위치에서 일치하는 패턴을 잘못 거부하고, 역참조나 같은 이름의 캡처 그룹도 망가질 수 있습니다. pattern 목록의 연언 표현과 중복 제거는 [effectiveSchema](../../core/engine/blueprint/effectiveSchema/DETAIL.md)가 소유합니다.

### intersection-values — 잎 교차의 한계를 보존합니다

키워드별 교차만 계산하며 const와 enum 사이처럼 서로 다른 키워드의 불가능성을 추론하지 않습니다. 부분적인 만족 가능성 검사기가 되면 검증기가 소유한 의미를 불완전하게 재구현하게 됩니다.

단독으로 주어진 빈 enum 목록은 빌린 선언이며 공집합 표시와 다릅니다. 소비자는 리터럴 선언의 유효성 검사와 여러 기여의 교차 실패를 혼동하지 않습니다.

### intersection-empty-policy — 공집합의 처분을 소비자에게 남깁니다

범위 역전과 enum·const 충돌은 표시로 전달합니다. 오류 코드·작성 위치·실행 중 값의 유지 여부를 잎 함수가 결정하면 호출 문맥마다 필요한 정책을 적용할 수 없습니다.

## Boundary Exemptions

### `utils` — 잎 연산의 구현 소유

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 소비자는 같은 순수 연산을 공유하되 결과의 오류 정책은 따로 소유하므로, 구현을 직접 가져오지 않고 이 모듈의 계약을 사용합니다.

## Last Updated

잎 제약의 동등성·참조 보존·공집합 표시 또는 소비자와의 책임 경계가 바뀔 때 갱신합니다.
