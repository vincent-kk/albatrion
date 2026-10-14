# FieldProxy

## Requirements

노드 렌더링의 외부 진입점은 본체 FieldProxy입니다. 경로나 노드 참조로 찾은 노드를 입력 팩토리와 오류 경계를 갖춘 렌더러에 연결하며, 입력 처리와 지연 마운트는 본체의 부품 둘을 내부에서 조합합니다.

## API Contracts

- 위계: 본체 `FieldProxy.tsx`와 재귀 렌더 props 계약 `type.ts`는 뿌리에 있고, 본체의 내부 부품 fractal 둘(`FieldInputSlot`·`DeferredFieldProxy`)은 `components/`에 있으며 이 칸에는 index를 두지 않습니다. 부품은 Form의 자식들(독립 컴포넌트)과 달리 본체의 일부라 본체 아래에 둡니다. 진입점 `index.ts`는 `./FieldProxy`의 `FieldProxy`와 `./components/FieldInputSlot`의 형 `ChildField`만 이름으로 내보냅니다. 본체는 부품을 각 진입점으로 가져오고, 부품은 위로 열린 길로 뿌리의 `type.ts`를 가져오며, 부품끼리는 서로의 진입점을 가져옵니다.
- 재귀 렌더 props 계약 `FieldProxyProps`는 본체가 소유하고 `type.ts`에 선언합니다. 진입점은 이 형을 내보내지 않습니다. 부품 `FieldInputSlot`·`DeferredFieldProxy`는 `type.ts`에서 타입 전용 import로만 읽고, 입력 구현은 본체 구현을 값으로 역참조하지 않습니다. 본체는 자신을 `NodeProxy` prop으로 넘겨 재귀합니다.
- 비활성 노드는 렌더하지 않습니다. 하위 노드는 전달된 NodeProxy를 통해 같은 렌더 계약을 재사용합니다. 노드가 없을 때도 null을 반환합니다. 오류 표시가 꺼져 있으면 오류 포맷 함수의 결과를 노출하지 않습니다.
- 마운트된 노드는 data-path로 경로를 노출하며, 노드 구독은 React 생명주기에 맞춰 해제합니다.
- `UpdateJsonSchema`를 구독하여 유효 스키마가 바뀌면 렌더 props와 입력 선택을 갱신합니다. 프록시 하나가 구독·메모·스냅샷 ref를 소유하며 별도 필드 컴포넌트나 필드별 경로 Provider를 만들지 않습니다(REACT-012, 119라운드, 121C-01 F-A).
- 렌더러 경계는 ErrorBoundary를 직접 씁니다. children이 렌더마다 새 엘리먼트라 memo 비교가 항상 실패하므로 memo로 감싸지 않습니다. 소유 지점에서 한 번 선택한 렌더러가 그 내부에서 errorMessage를 계산합니다. formatError와 렌더러 예외는 원래 오류 identity·현재 path·componentStack·surface sink를 같은 폼 보고기로 전달하고 같은 fallback과 console.error를 유지합니다(ERROR-044·090·114).
- Refresh는 렌더러 경계와 입력 경계의 수명을 유지하고 해당 노드의 원본 입력만 다시 마운트합니다. RequestRemount는 래퍼 key를 바꾸어 경계까지 교체합니다(REACT-019·024, EVENT-039·040, 112C-01).
- 비용: 필드 전체의 Provider·감싸개·경계·분리 컴포넌트를 없애고 오류 메시지 계산을 렌더러 경계 안의 컴포넌트에 둡니다. 필드당 fiber 순감소 목표는 4개이며, 별도 필드 경계 상태와 경로 Provider를 보유하지 않습니다. 쓰기당 렌더와 DOM 반영 지연은 런타임 계수로 비교합니다.
  - 측정값(세션 129e): 필드당 fiber는 평면 24→20, 배열 항목 21→17이고, 쓰기당 렌더·커밋·호스트 갱신·이펙트 수는 같습니다. 마운트 할당은 array-1000에서 8.8 MB 적습니다.
  - 미확인: 쓰기 1회 할당은 한 실행에서 18~56 KB 많았지만 다른 실행에서는 방향이 반대였습니다. 다음 F2 고침부터 쓰기당 할당을 계수에 넣어 지켜봅니다(121C-01 덧붙임, Q131).
- `request(kind)`의 focus·select·refresh·remount 사건을 실행합니다. `RequestRemount`는 래퍼 key를 변경하며, 사용자 override는 노드 식별 정보처럼 덮어쓸 수 없는 필드를 대체하지 않습니다(EVENT-063·073).
- 입력의 자식 프록시 마운트 판정에는 본체와 가상화의 `DeferredFieldProxy` 자리를 포함합니다. 입력은 실제 자식 프록시 마운트 여부로 Refresh의 다시 마운트를 가릅니다(REACT-028).
- 가상화 reveal 기록은 매니저의 노드 identity 기록을 소비합니다. 한 번 노출된 필드는 배열 재인덱싱으로 placeholder가 되지 않으며 미노출 형제의 placeholder도 현재 경로를 표시합니다(LANDING-087).
- 런타임 계수 도우미 `__tests__/helpers/runtimeCounts.mjs`는 이 fractal의 시험과 부품 `FieldInputSlot`·형제 `Form`의 계수 시험이 함께 씁니다(검증 코드라 소비자가 아님).

## Acceptance Criteria

### field-contract — 관찰 가능한 동작

- enabled가 false인 노드는 입력과 래퍼를 남기지 않습니다.
- 재귀 렌더링에서도 동일한 노드 경로와 렌더러 연결 규칙이 적용됩니다.
- 실제 배열 remove 버튼으로 앞 아이템을 지우면 노출된 아이템의 노드와 입력 DOM identity가 유지되고, 새 경로에 placeholder가 겹치지 않습니다.
- 미노출 형제는 현재 경로의 placeholder로 유지되고 없어진 마지막 경로는 DOM에 남지 않습니다.

### field-proxy-contract — 관찰 가능한 동작

- 렌더러와 formatError 예외는 같은 경로와 폼 보고기로 한 번 전달되고, 형제 필드는 유지됩니다.
- 오류 표시 조건이 거짓이면 기존 오류가 있어도 오류 메시지를 렌더러에 표시하지 않습니다.
- 제어·비제어 입력의 필드당 fiber와 쓰기당 렌더 수가 같고, 형제·부모의 쓰기는 변경되지 않은 필드를 렌더하지 않습니다.
- Refresh 뒤 경계 identity는 같고 해당 입력 identity만 바뀝니다. 실패한 경계는 Refresh로 복구되지 않습니다.

## Boundary Exemptions

### `type.ts` — 부품의 위로 열린 형 import

- **Consumers**: `**/packages/canard/schema-form/src/components/FieldProxy/components/**`
- **Direct import**: `allowed`
- **Reason**: 부품 `FieldInputSlot`·`DeferredFieldProxy`는 이 fractal의 자식이라, 루트 Module Contract Principles 4(위로는 열림: 조상의 뿌리 파일을 직접 가져옴, 조상의 `index.ts`는 금지)에 따라 재귀 렌더 props 계약 `FieldProxyProps`를 뿌리 `type.ts`에서 타입 전용으로 직접 읽습니다. 진입점은 이 형의 바깥 소비자가 없어 내보내지 않으며, filid의 기본 판정은 자식에서 조상 뿌리 파일로 가는 import를 경계 우회로 보므로 저장소 원칙에 따라 여기 선언합니다.

## Last Updated

계약 기준: LANDING-087, 121C-01 F-A(Q131 채택), 125C-01 F-A', ERROR-044·090·114, REACT-012·019·024·028, EVENT-039·040·063·073, 112C-01; 소유자 구조 리뷰 5(2026-10-14, 326라운드): `Field` fractal의 이름이 본체 `FieldProxy`를 따르고, 옛 하위 `FieldProxy`의 문서·구현·시험을 뿌리로 합침.
