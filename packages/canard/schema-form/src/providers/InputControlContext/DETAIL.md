# InputControlContext

## Requirements

폼 전체 readOnly·disabled를 UI 잠금 기본값으로 공급합니다. 엔진 쓰기 권한과 섞으면 명령형 복구까지 막히므로 core 상태를 변경하지 않습니다.

## API Contracts

제어값이 같으면 Context 참조를 유지합니다. 폼당 하나의 ref가 커밋된 readOnly·disabled의 OR를 보관하며 insertion effect에서만 갱신합니다. 개별 표현값은 Context에 유지하되 콜백은 합성 잠금만 읽어 반복 조회와 폼 렌더의 임시 객체 할당을 줄입니다. 자식의 layout setup보다 먼저 게시해야 같은 커밋에서 호출된 오래된 입력 콜백도 새 잠금을 따릅니다. 부모 layout effect에서 게시하면 자식 setup이 이전 잠금을 읽습니다. 렌더 중 게시하면 커밋되지 않은 concurrent 렌더의 잠금이 현재 입력에 샙니다. 입력마다 effect를 추가하지 않아 필드 수에 비례하는 커밋 비용을 피합니다.

격리 기준은 Suspense 발생 여부가 아니라 이 Provider의 커밋 여부입니다. 아직 커밋되지 않은 전환은 이전 잠금을 유지하지만 React 18 legacy root 등에서 fallback과 함께 Provider가 커밋되면 새 잠금을 게시합니다. mutation 단계의 자식 layout cleanup은 부모 insertion effect보다 먼저 실행될 수 있으므로 그 시점에는 이전에 게시한 잠금을 읽습니다. 잠금 게시가 모든 cleanup보다 앞선다는 보장은 하지 않습니다.

노드별 잠금과의 OR 결합·입력 콜백 집행은 [FieldInputBridge](../../components/FieldProxy/components/FieldInputBridge/DETAIL.md)가 소유하며, 이 Context는 노드별 값을 계산하지 않습니다.

## Acceptance Criteria

### input-control-context-contract — SURFACE-012: 전체 잠금은 완화하지 않습니다

폼 잠금이 참이면 개별 노드의 false로 해제하지 않습니다. Provider 부재는 잠금을 강제하지 않으며 명령형 쓰기는 UI 잠금과 별개입니다. 네이티브 제출 focus의 잠금은 [FormCore](../../components/Form/components/FormCore/DETAIL.md)를 따릅니다.

## Last Updated

전체 잠금의 의미 또는 소비자와의 책임 분리가 바뀌면 갱신합니다.
