# ConfigurationContext

## Requirements

모달 옵션·애니메이션 지속시간·배경 설정을 Context로 전달합니다.

## API Contracts

- 옵션은 undefined를 무시하고 기본값과 결합하며 0과 false를 보존합니다. duration은 숫자 밀리초 또는 ms·s 문자열을 렌더 시 ms 문자열로 정규화하고 잘못된 값은 기본값과 개발 경고로 처리합니다.
- 컴포넌트 props는 마운트 시 정해져 열린 prompt가 재마운트되지 않습니다. 개발 모드에서 정체 변경을 prop당 한 번 경고하며 운영에서는 경고하지 않습니다.
- 설정 소비 훅은 모달 프레임·내용·푸터 안에서만 사용합니다. Provider 일반 자식과 밖에서는 사용 위치를 안내하는 Error를 던집니다.
- Provider는 기본 설정과 호출자가 전달한 override를 결합합니다.
- 소비자는 전체 설정 또는 역할별 훅을 통해 같은 설정 값을 읽습니다.

## Acceptance Criteria

### configuration-context-contract — 관찰 가능한 동작

- 사용자 override가 있으면 대응 기본값보다 우선합니다.
- 컴포넌트별 하드코딩 값으로 Context 설정을 우회하지 않습니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
