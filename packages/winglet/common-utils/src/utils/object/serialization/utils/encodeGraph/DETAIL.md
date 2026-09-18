# Graph traversal contract

## Requirements

두 기능이 같은 데이터 보존·omit·자원 한도 의미론을 사용하도록 순회와 token 생성을 공유합니다.

## API Contracts

encodeGraph는 root token과 flat node table을 반환합니다. discovery 순서로 identity를 부여하고 각 object를 한 번 방문합니다. sorted는 객체 속성명을 UTF-16 순서로 처리하며 opaque resolver는 비지원 객체·함수·symbol 값에 factory 범위 식별자를 제공합니다. 상태는 호출별 지역 데이터입니다.

Token과 GraphNode는 실제 결과 소비자인 parser에서 사용하는 경계 타입입니다. TraversalOptions와 TraversalState는 구현 타입이며 공개 배럴에 별도로 노출하지 않습니다. SerializationOptions는 상위 공통 소유자의 타입을 확장합니다.

함수 전용 helper는 utils에 둡니다. 이 모듈은 serialization 하위 기능들만 소비하며 package root에서 재수출하지 않습니다.

## Acceptance Criteria

### traversal-policy — 공통 순회

- graph/fingerprint 계약 검증에서 cycle, omit, 지원 타입, 순서, 입력 불변성 및 자원 한도를 함께 검증합니다.

## Last Updated

2026-09-18
