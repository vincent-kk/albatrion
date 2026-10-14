# fieldInputDefinition

## Requirements

사용자 입력 맵과 정의를 공통 선택 형식으로 정규화합니다.

## API Contracts

- 유효한 React 컴포넌트만 남기고 각 컴포넌트에 오류 경계를 적용합니다.
- 인라인과 preferred 입력도 공유하는 사설 어댑터가 해석 지점에서 ErrorBoundary를 한 번 적용하고, 렌더 때 입력 props의 path로 폼 보고기를 읽습니다. memo 입력 감싸개가 적용 세대를 직접 소비하여 별도 generation 전달 컴포넌트를 만들지 않습니다. 경계의 수명은 Refresh 세대와 독립적이며, 경계의 직접 자식인 원본 입력만 바인딩이 전달한 적용 세대로 key를 변경합니다. 적용 세대는 내부 props에만 존재하며 사용자 입력과 공개 입력 타입에는 노출하지 않습니다(EVENT-039·070, 112C-01, 121C-01 F-B).
- 객체형 테스트를 함수로 변환하며 wildcard 경로는 세그먼트 규칙으로 매칭합니다.

## Acceptance Criteria

### form-type-input-definition-contract — 관찰 가능한 동작

- 유효하지 않은 컴포넌트는 정규화 결과에 포함되지 않습니다.
- 정규화는 React 컴포넌트를 렌더하거나 훅을 실행하지 않습니다.
- 정규화된 입력은 Refresh로 실패 상태를 잊지 않으며, 정상 입력은 적용 세대 변경 시 원본 입력만 다시 마운트합니다. RequestRemount와 폼 key 교체는 경계를 포함하여 다시 마운트합니다(EVENT-040·042, 112C-01).
- generation 전달용 fiber를 제거하고, 제어·비제어 입력의 필드당 fiber와 자기 필드 쓰기·전역 문맥 변화의 렌더 수를 각각 하나 줄입니다. 필드별 클로저·훅·보유 객체를 추가하지 않습니다(121C-01 F-B).

## Last Updated

2026-10-10 — ERROR-090·114·117, EVENT-039·040·042·070, 112C-01, 121C-01 F-B.
