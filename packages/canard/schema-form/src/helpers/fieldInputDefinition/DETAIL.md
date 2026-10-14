# fieldInputDefinition

## Requirements

사용자가 넘긴 입력 맵과 정의를 하나의 공통 선택 형식으로 정규화합니다.

## API Contracts

- 이 fractal은 진단 문자열 포맷터 `formatFieldInputMapError`를 `utils/`에 두고, 진단 상자 원소는 `helpers/error` 진입점에서 가져옵니다.
- 유효한 React 컴포넌트만 남기고 각 컴포넌트에 오류 경계를 적용합니다.
- 인라인 입력과 preferred 입력도 함께 쓰는 비공개 어댑터가 입력을 해석하는 지점에서 ErrorBoundary를 한 번 적용하고, 렌더할 때 입력 props의 path로 폼 보고기를 읽습니다. memo 입력 감싸개가 적용 세대를 직접 받아 쓰므로 세대를 전달하는 별도 컴포넌트를 만들지 않습니다. 경계의 수명은 Refresh 세대와 별개이며, 경계의 직접 자식인 원본 입력만 바인딩이 넘겨 준 적용 세대로 key를 바꿉니다. 적용 세대는 내부 props에만 존재하고 사용자 입력과 공개 입력 타입에는 드러나지 않습니다(EVENT-039·070, 112C-01, 121C-01 F-B).
- 객체 형태의 테스트를 함수로 변환하고, wildcard 경로는 세그먼트 규칙으로 매칭합니다.

- 정규화 함수(`normalizeFieldInputDefinitions`·`normalizeFieldInputMap`)는 `utils/`에, 경로 정규식 상수는 `constants/regex.ts`에 있습니다. 뿌리에는 문서, 진입점, 타입 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### form-type-input-definition-contract — 관찰 가능한 동작

- 유효하지 않은 컴포넌트는 정규화 결과에 들어가지 않습니다.
- 정규화 중에는 React 컴포넌트를 렌더하거나 훅을 실행하지 않습니다.
- 정규화된 입력은 Refresh를 거쳐도 실패 상태를 잊지 않습니다. 정상 입력은 적용 세대가 바뀔 때 원본 입력만 다시 마운트합니다. RequestRemount와 폼 key 교체는 경계까지 포함해 다시 마운트합니다(EVENT-040·042, 112C-01).
- 세대를 전달하던 fiber를 없애고, 제어 입력과 비제어 입력 모두 필드마다 fiber가 하나 줄고, 자기 필드 쓰기와 전역 문맥 변화로 일어나는 렌더 수도 각각 하나씩 줄어듭니다. 필드별 클로저, 훅, 보유 객체는 추가하지 않습니다(121C-01 F-B).

## Last Updated

2026-10-14 — 정돈-1; ERROR-090·114·117, EVENT-039·040·042·070, 112C-01, 121C-01 F-B.
