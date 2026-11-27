# Validation State Feature Scenarios contract

## Requirements

검증 시점·외부 오류·표시·상호작용·제출의 소비자 사례를 소유합니다. Form 속성과 소비자 전용 단언은 사례 상수와 소비자 실행에 두어 범용 장면 어휘가 렌더 계층에 종속되지 않게 합니다.

## API Contracts

모드·표시 정책·상태는 이름으로 적고 소비자가 엔진 열거형으로 바꿉니다. 표시 사례의 `ErrorVisibilityName`·`errorVisibilityCases`·`forcedRevealErrorsCase`는 현재 `errorVisibility` 정책과 핸들의 `revealErrors()`·`resetErrorVisibility()`에 대응시켜 관찰합니다. 존재하지 않는 핸들 속성으로 표시를 바꾸는 사례로 해석하지 않습니다. 외부 오류의 null·객체 입력은 형 변환으로 정정하지 않고 JavaScript 호출자처럼 그대로 전달하여 잘못된 입력의 계약을 검증합니다.

오류 표시와 노드의 오류 보유는 별도로 관찰합니다. 메시지 catalog에서 없는 keyword를 null로 넘기는 사례는 다음 issue의 표시까지 확인해야 첫 메시지를 숨긴 것만으로 성공하지 않습니다.

## Acceptance Criteria

### validation-state-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../../DETAIL.md)에 둡니다.

### validation-state-scene-coverage — 관찰을 보존하는 기준

- 검증 모드와 표시 정책을 빠짐없이 관찰하되 검증 결과와 메시지 표시를 같은 상태로 취급하지 않습니다.
- 검증 실패의 핸들 `submit()`은 호출자에게 거부를 돌려주고, 무효 네이티브 Enter 제출은 `onSubmit`·`onError`·호스트 싱크 호출 없이 표시와 초점을 처리하는지 관찰합니다. 표시·초점의 정책 및 잠금 예외는 [FormCore 계약](../../../../../canard/schema-form/src/components/Form/components/FormCore/DETAIL.md)을 따라, 검증 판정을 장애 보고로 오인하지 않습니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
