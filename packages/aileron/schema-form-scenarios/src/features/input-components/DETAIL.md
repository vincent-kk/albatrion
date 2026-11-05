# Input Components Feature Scenarios contract

## Requirements

입력 해석·정의 우선순위·파일 첨부의 소비자 사례를 소유합니다. React 컴포넌트와 File 객체는 소비자가 만들고 장면은 라벨·경로·기대값만 가져 런타임 결합을 막습니다.

## API Contracts

전역으로 누적되는 플러그인 정의는 이 부류의 probe inputType만 맞춥니다. 넓은 test가 다른 장면의 입력 해석까지 바꾸지 않게 합니다.

실제 컴포넌트는 소비자가 라벨로 해석하고 같은 승자 표식을 관찰합니다. 숫자 badInput·포매터 캐럿·IME는 전용 Browser gates가 실제 브라우저에서 확인하므로 이 부류의 jsdom 결과로 대체하지 않습니다.

`useChildFieldErrors`의 표시 관찰은 `errorVisible`·`childErrorVisibleList`를 사용하고 원시 `errorMatrix`와 구별합니다. 자식의 오류가 남아 있어도 정책이 표시를 가릴 수 있으므로, 메시지 유무만으로 자식 상태나 오류 보유를 추정하지 않습니다.

## Acceptance Criteria

### input-components-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../../DETAIL.md)에 둡니다.

### input-components-scene-coverage — 관찰을 보존하는 기준

- 입력 해석의 각 출처를 같은 라벨 계약으로 비교하여 컴포넌트 구현에 종속된 기대값을 만들지 않습니다.
- 전역 등록의 적용 범위를 유지하고 브라우저 전용 입력 계측을 데이터 장면으로 흉내 내지 않습니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
