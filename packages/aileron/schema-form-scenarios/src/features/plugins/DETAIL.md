# Plugins Feature Scenarios contract

## Requirements

플러그인 출처·렌더러 교체·오류 격리의 소비자 사례를 소유합니다. 검증기·컴포넌트는 소비자가 생성하며 시나리오 import 자체에 등록이나 렌더 부작용을 넣지 않습니다.

## API Contracts

검증기 출처 `none`은 전역 플러그인 등록이 없는 환경에서만 실행합니다. ajv8을 미리 등록한 Storybook은 이 조건을 충족하지 않으므로 해당 사례는 e2e에서 확인합니다.

렌더러 표식은 출처와 자리를 함께 식별하며 라벨·오류 렌더러의 사례는 합성 API를 사용합니다. 기본 그룹과 단독 합성 자리 양쪽에서 등록된 라벨·오류 렌더러의 적용을 관찰합니다.

## Acceptance Criteria

### plugins-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../../DETAIL.md)에 둡니다.

### plugins-scene-coverage — 관찰을 보존하는 기준

- 미등록 사례는 등록 전에 실행하여 전역 상태가 없는 조건을 보존합니다.
- 격리 사례는 던지는 필드와 형제 입력을 함께 관찰하여 fallback 출현만으로 정상 동작 보존을 대신하지 않습니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
