# providers

## Requirements

폼별 설정·작업공간과 엔진 루트의 수명을 Context 경계로 분리합니다. Context를 편의 저장소로 합치면 여러 폼의 상태와 설정이 섞이므로 각 소유자가 자기 계약을 유지합니다.

## API Contracts

지원하는 내용 비교는 객체 쌍의 재방문을 기록하여 plain 객체·배열·Map과 Error·ArrayBuffer·DataView·typed array·박싱 원시값의 own 열거 프로퍼티를 통한 순환에서도 종료합니다. 내장 슬롯의 기존 값 판정과 own 열거 문자열 키의 그래프 판정을 분리하고 같은 객체 쌍은 다시 펼치지 않습니다. Date·RegExp·Set은 기존처럼 내부 상태만 비교하며 own 프로퍼티를 읽지 않습니다. 공유 참조의 모양 자체를 차이로 보지 않고 순환을 펼친 트리의 값 비교와 같은 결과를 냅니다. 방문 기록은 한 비교 동안만 보유하고 작은 그래프는 배열, 큰 그래프는 재사용 색인으로 비교하여 반복 탐색의 제곱 증가를 피합니다.

사용자 context의 snapshot 비교는 이 경계가 소유합니다. plain 객체·배열·지원 built-in은 내용을 비교하되 URL·URLSearchParams·불투명 class 인스턴스는 참조를 비교합니다. private 상태는 열거할 수 없으므로 새 인스턴스를 새 입력으로 보고 같은 인스턴스의 제자리 변경은 감지하지 않습니다. 전역 equals의 의미는 바꾸지 않습니다.

조립 순서는 [FormCore](../components/Form/components/FormCore/DETAIL.md)가 소유합니다. 각 Context는 설정 전달과 자기 수명만 담당하며 노드 로드·준비·reset·검증 예약·콜백 전달을 상위 providers 계약으로 복제하지 않습니다. 해당 계약은 [RootNodeContext](RootNodeContext/DETAIL.md)에 둡니다.

- 라이프사이클 소비자는 FieldLifecycleContext의 진입점을 직접 사용합니다. 상위 providers가 같은 이름을 재노출하지 않아 소유 경계를 우회하는 별도 주소를 만들지 않습니다.
- 라이프사이클 레지스트리는 FormRoot가 소유하고 FieldLifecycleContext의 Context 요소가 전달합니다. 다른 Provider와 달리 래퍼 컴포넌트가 없으며 Form 재렌더의 고정 호출 수를 유지하기 위한 예외입니다.

## Acceptance Criteria

### providers-contract — 폼별 소유권을 유지합니다

선택적 외부 설정을 폼 수준 설정으로 덮어쓸 수 있어야 하며, 설정이나 workspace를 다른 Form 인스턴스와 공유 상태로 만들지 않습니다. 오류 보고와 가상화 자원도 각각 [FormErrorContext](FormErrorContext/DETAIL.md)와 [VirtualizationContext](VirtualizationContext/DETAIL.md)의 수명을 따릅니다. React 이펙트 정리와 엔진 load 은퇴를 구별하여 숨겨진 폼의 준비된 콜백을 실수로 끊지 않습니다.

## Last Updated

Context 사이의 소유 경계 또는 조립 의존성이 바뀌면 갱신합니다.
