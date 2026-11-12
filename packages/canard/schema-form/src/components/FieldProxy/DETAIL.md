# FieldProxy

## Requirements

노드를 렌더러에 연결하면서 사용자 표현의 실패를 그 필드에 가둡니다. 렌더 비용을 줄이는 변경도 오류의 격리 범위·입력 identity·보고 경로를 유지해야 합니다.

## API Contracts

오류 문구 선택·표시와 보류 버전·노드 추적 마스크는 FieldRendererContext의 공유 계산을 사용합니다. 프록시는 별도 오류 훅을 구독하지 않고 문구를 기존 렌더 경계 안에서 계산하여 포맷 실패의 격리를 유지합니다. 경계 타입과 실패한 경계의 복구 조건은 [getRendererBoundary](./utils/getRendererBoundary/DETAIL.md)가 소유합니다.

Label과 ErrorMessage는 각각 자기 렌더러·node·jsonSchema·required에 고정된 memo 부품입니다. 두 정체성은 독립적이며 오류·표시·formatError·context 또는 경로 변경으로 교체하지 않습니다. 전달된 props를 기본값 뒤에 펼치되 node는 바꿀 수 없습니다. Label의 undefined children만 필드 키나 배열 인덱스인 name으로 대체하고 null은 비웁니다. 같은 required를 그룹에도 전달합니다. 렌더러·스키마·필수 여부 변경은 해당 부품만 새로 만듭니다.

부품 생성 때 parentNode를 따라 배열 조상 유무를 한 번 판정합니다. 살아 있는 노드의 이름·주소를 바꾸는 엔진 경로는 배열 항목 재배치뿐이고 조상 종류는 고정되므로, 배열 조상이 없는 부품은 훅과 구독 없이 node.path·node.name을 읽습니다. 배열 아래 부품만 UpdatePath를 추적하여 캐시된 요소도 새 주소를 반영하고 DOM을 유지합니다. 마운트한 부품당 경로 추적 구독 하나가 필요하며 오류·Context는 읽지 않습니다.

패키지의 기본 LabelRenderer·ErrorMessageRenderer와 선택 참조가 같을 때만 생성 시 직접 호출 경로를 선택합니다. [폴백의 순수 함수 계약](../FallbackComponents/DETAIL.md)에 따라 컴포넌트 층 하나를 생략합니다. 사용자·플러그인 렌더러는 항상 요소로 렌더하여 훅과 컴포넌트 수명을 React가 소유하게 합니다.

렌더러의 `required`는 입력과 같은 [표시 값 해석 계약](./components/FieldInputBridge/DETAIL.md#api-contracts)을 따릅니다.

선택한 렌더러 컴포넌트가 바뀌면 그 렌더러가 소유한 UI만 재생성합니다. 포맷터 변경은 기존 오류를 다시 포맷하며 정상 경계의 입력 DOM을 유지합니다. 선택된 렌더러가 바뀌면 소유 경계를 교체합니다.

- 오류 표시의 자격·보류·해제는 [FieldRendererContext](../../providers/FieldRendererContext/DETAIL.md)와 [validation](../../core/engine/validation/DETAIL.md)의 계약을 소비합니다. 현재 `errorVisibility`와 `checkErrorVisibility(node.state)`를 사용하므로 정책을 최초 마운트 값으로 고정하지 않습니다. renderer.errors는 원본 목록이며 표시 여부로 목록을 고치지 않습니다.
- ErrorBoundary를 항상 첫 자식에 두고 보류 해제 구독자를 그 뒤에 두어, 표시 대기가 시작·종료될 때 렌더러와 입력이 교체되지 않게 합니다.
- 재귀 입력 수명은 [FieldInputBridge](./components/FieldInputBridge/DETAIL.md), 지연 DOM은 [DeferredFieldProxy](./components/DeferredFieldProxy/DETAIL.md)가 소유합니다. 재귀 렌더 props 형은 본체가 소유하고 NodeProxy prop으로 구현을 전달하여 자식의 역참조 순환을 막습니다.
- 노드 값은 가지 렌더러에도 전달되는 계약이므로 UpdateValue 구독을 성능만을 이유로 제거하지 않습니다. 형제 입력이 memo여도 부모가 받는 value가 낡아질 수 있습니다.

## Acceptance Criteria

### bound-parts — 독립적인 부품 정체성과 좁은 전달

기본값·명시적 undefined·null children·node 소유권을 보존하고 캐시한 요소도 문구·주소 변경을 반영합니다. 표시·context·입력 변경은 라벨 호출과 DOM을 유지하며 부품 교체는 다른 부품과 입력을 재마운트하지 않습니다.

### live-configuration — 설정 교체 수명

- 렌더러 교체와 포맷터 교체가 마운트 후 적용되며 노드 identity와 값은 유지합니다. 정상 포맷터 교체는 입력 DOM을 재마운트하지 않습니다.

### GOAL-059 — 사용자 표현의 실패를 필드 경계에 가둡니다

주입한 렌더러와 formatError의 실패는 같은 필드의 fallback으로 격리하여 형제 입력을 유지합니다. errorMessage를 경계 아래에서 계산해야 포맷 예외가 경계를 건너 폼 전체로 번지지 않습니다. 입력 어댑터의 격리는 [fieldInputDefinition](../../helpers/fieldInputDefinition/DETAIL.md), Placeholder 격리는 [매니저](../../helpers/virtualization/VirtualizationManager/DETAIL.md)의 책임입니다.

### ERROR-090 — 해석·소유 지점에 안정된 경계를 둡니다

렌더러 경계는 [getRendererBoundary](./utils/getRendererBoundary/DETAIL.md)가 선택된 렌더러마다 제공하는 타입을 사용합니다. 필드 전체의 별도 경계 상태와 경로 Provider는 만들지 않습니다. 보고기는 [FormErrorContext](../../providers/FormErrorContext/DETAIL.md)의 명시적 path 훅으로 연결하여 경로 전달만을 위한 필드별 Provider 비용을 피합니다.

### field-proxy-contract — 오류 표시와 복구 수명을 구별합니다

- 오류 표시가 꺼지면 포맷 결과를 숨기되 렌더 실패 경계와 원본 오류 목록은 유지합니다. 검증 표시를 숨기는 동작이 오류 격리까지 해제해서는 안 됩니다.
- Refresh는 렌더러 경계를 유지하고 원본 입력의 재마운트 범위는 FieldInputBridge의 계약을 따릅니다. 실패한 경계를 Refresh나 형제 쓰기로 복구하지 않습니다. RequestRemount는 래퍼 key를 바꾸므로 경계까지 교체하는 별개의 복구 수단입니다.

### field-contract — 재배치로 입력을 다시 지연하지 않습니다

- 배열 앞쪽을 삭제해도 살아 있는 노드와 입력 DOM identity를 유지합니다. 노출 이력은 [GOAL-066](../../helpers/virtualization/VirtualizationManager/DETAIL.md#goal-066--한-번-노출한-노드를-다시-지연하지-않습니다)을 따릅니다.
- 미노출 형제의 placeholder는 현재 경로를 표시하고 사라진 마지막 주소를 남기지 않습니다. DOM 주소를 재사용한 뒤 같은 경로에 입력과 오래된 placeholder가 겹치는 실패를 막습니다.

## Boundary Exemptions

### `type.ts` — 부품의 위로 열린 형 import

- **Consumers**: `**/packages/canard/schema-form/src/components/FieldProxy/components/**`, `**/packages/canard/schema-form/src/components/FieldProxy/utils/getRendererBoundary/**`
- **Direct import**: `allowed`
- **Reason**: 자식들은 재귀 렌더 props 계약을 타입 전용으로 읽습니다. 저장소의 위로 열린 import 원칙에 따라 조상의 구체 파일을 직접 쓰며, 외부 소비자가 없는 형을 진입점에 추가하지 않습니다.

## Last Updated

렌더러 격리 범위, 보고 경로, 표시 구독자의 위치, Refresh·Remount 수명 또는 재배치 계약이 바뀌면 갱신합니다.
