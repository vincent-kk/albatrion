# InputControlContext

## Requirements

폼 전체 readOnly·disabled를 UI 잠금 기본값으로 공급합니다. 엔진 쓰기 권한과 섞으면 명령형 복구까지 막히므로 core 상태를 변경하지 않습니다.

## API Contracts

제어값이 같으면 Context 참조를 유지합니다. 노드별 잠금과의 OR 결합·입력 콜백 집행은 [FieldInputBridge](../../components/FieldProxy/components/FieldInputBridge/DETAIL.md)가 소유하며, 이 Context는 노드별 값을 계산하지 않습니다.

## Acceptance Criteria

### input-control-context-contract — SURFACE-012: 전체 잠금은 완화하지 않습니다

폼 잠금이 참이면 개별 노드의 false로 해제하지 않습니다. Provider 부재는 잠금을 강제하지 않으며 명령형 쓰기는 UI 잠금과 별개입니다. 네이티브 제출 focus의 잠금은 [FormCore](../../components/Form/components/FormCore/DETAIL.md)를 따릅니다.

## Last Updated

전체 잠금의 의미 또는 소비자와의 책임 분리가 바뀌면 갱신합니다.
