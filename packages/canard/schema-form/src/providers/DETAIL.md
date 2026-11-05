# providers

## Requirements

폼별 설정·작업공간과 엔진 루트의 수명을 Context 경계로 분리합니다. Context를 편의 저장소로 합치면 여러 폼의 상태와 설정이 섞이므로 각 소유자가 자기 계약을 유지합니다.

## API Contracts

조립 순서는 [FormCore](../components/Form/components/FormCore/DETAIL.md)가 소유합니다. 각 Context는 설정 전달과 자기 수명만 담당하며 노드 로드·준비·reset·검증 예약·콜백 전달을 상위 providers 계약으로 복제하지 않습니다. 해당 계약은 [RootNodeContext](RootNodeContext/DETAIL.md)에 둡니다.

## Acceptance Criteria

### providers-contract — 폼별 소유권을 유지합니다

선택적 외부 설정을 폼 수준 설정으로 덮어쓸 수 있어야 하며, 설정이나 workspace를 다른 Form 인스턴스와 공유 상태로 만들지 않습니다. 오류 보고와 가상화 자원도 각각 [FormErrorContext](FormErrorContext/DETAIL.md)와 [VirtualizationContext](VirtualizationContext/DETAIL.md)의 수명을 따릅니다. React 이펙트 정리와 엔진 load 은퇴를 구별하여 숨겨진 폼의 준비된 콜백을 실수로 끊지 않습니다.

## Last Updated

Context 사이의 소유 경계 또는 조립 의존성이 바뀌면 갱신합니다.
