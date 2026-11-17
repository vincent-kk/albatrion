# Handle Layout Feature Scenarios contract

## Requirements

핸들·레이아웃·Provider 합성의 소비자 사례를 소유합니다. 컴포넌트 생성과 렌더 순서는 소비자가 맡아 엔진 없는 데이터 경계를 유지합니다.

## API Contracts

prop 교체 단계는 누적 props를 전제로 하며 reset 여부를 유지합니다. 교체할 때마다 다시 마운트하면 같은 스키마의 노드 동일성과 커밋된 props의 로드 경계를 검증하지 못합니다.

jsdom의 `select()`는 포커스를 옮기지 않으므로 e2e는 선택 범위를 대조하고 실제 포커스 이동은 Chromium 스토리에서 확인합니다. 레이아웃의 두 입력은 같은 경로라도 각자의 초안을 관찰해야 한 입력의 재렌더가 다른 초안을 덮는 회귀를 놓치지 않습니다.

## Acceptance Criteria

### handle-layout-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../../DETAIL.md)에 둡니다.

### handle-layout-scene-coverage — 관찰을 보존하는 기준

- prop 교체와 reset을 분리하여 같은 스키마의 노드 유지와 다른 스키마의 재생성을 구별합니다.
- 명령의 포커스·선택 관찰은 환경별 한계를 유지하고 값 변화의 단언과 분리합니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
