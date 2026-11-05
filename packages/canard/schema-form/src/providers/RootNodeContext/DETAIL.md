# RootNodeContext

## Requirements

루트 트리의 생성·교체와 React commit을 연결합니다. 추측성 렌더의 트리 생성, 확정된 load의 콜백 수명, 검증 결과 수명을 분리하여 폐기된 렌더가 소비자에게 보고되거나 숨김이 엔진 정지로 취급되지 않게 합니다.

## API Contracts

### REACT-003 — 렌더 독립 생성 경계

React의 터미널·원자 판정과 app 소유 청사진 캐시는 생성 인자로 전달합니다. 초기 생성과 재생성은 같은 판정을 사용하여 같은 스키마의 형상이 경로마다 달라지지 않게 합니다. core는 React 표식이나 app 전역을 알 필요가 없습니다. 판정과 캐시 identity의 정의는 [schemaIdentity](../../helpers/schemaIdentity/DETAIL.md)와 [cache](../../app/cache/DETAIL.md)가 소유합니다.

### WRITE-043 — reset과 실제 루트

스키마·기본값 prop 변경만으로 현재 트리를 교체하지 않습니다. reset은 최신 committed props를 읽으며 함수 children에 주는 스키마는 실제 루트와 일치해야 합니다. 같은 스키마·검증기의 reset은 기존 트리를 재로드하고, 다른 구조·검증기는 동기적으로 교체합니다. binding은 새 루트를 즉시 가리키고 React는 외부 저장소로 따라갑니다. 자식 layout이 commit 전에 시작한 호출은 마지막 committed 설정을 사용합니다.

재대조 reset은 호출에 사용한 props와 이번 commit을 비교하고 원래 호출 옵션을 유지합니다. 같은 처리기에서 prop을 바꾼 뒤 reset하면 마지막 committed 값의 동기 로드와 새 prop의 재대조 로드가 각각 통지할 수 있습니다. 재대조 전에 unmount하면 그 재대조는 실행되지 않으며 prop만 transition 안에서 갱신하고 reset을 밖에서 호출한 경우 새 prop 반영을 약속하지 않습니다. reset 옵션은 자동 쓰기 억제·허용 비트만 받으며 같은 루트에서 옵션이 없으면 엔진의 현재 기본값을 따릅니다. 열린 바깥 사슬에서 대기 중인 설정을 임의 호출 옵션으로 바꿔 조기 적용하지 않습니다. 렌더 중 reset의 전달 시점은 소비자 오용이므로 보증하지 않습니다.

같은 스키마 reset은 트리·노드 신원·노드 소비자의 구독·캐시를 유지하고 첨부 파일을 비웁니다. 입력 DOM의 보존 범위는 [FieldInputBridge](../../components/FieldProxy/components/FieldInputBridge/DETAIL.md)가 소유합니다. 교체된 트리는 부모·자식·루트 참조를 끊지 않으므로 소비자가 옛 노드 하나를 보유하면 옛 트리 전체가 수거되지 않을 수 있습니다. 수명을 이어 가려면 현재 핸들에서 다시 찾습니다. 일반 reset의 로드 비용과 참조가 다른 스키마의 비교 비용은 각각 트리와 스키마 크기에 비례하며, 검증 캐시 축출 뒤의 재컴파일까지 없다고 보장하지 않습니다.

### SURFACE-064 — 청사진 보존과 rebuild

동일 스키마 reset은 다른 폼이 공유 캐시를 무효화해도 이 폼의 청사진을 유지합니다. rebuild는 committed 스키마의 캐시를 무효화하고 같은 reset 옵션으로 교체 경로를 강제합니다. 캐시 무효화만으로 살아 있는 폼을 몰래 바꾸지 않기 위한 규칙입니다. 스키마·검증기 변경에 의한 reset 교체까지 금지한다는 뜻은 아닙니다.

### REACT-007 — 준비된 load의 수명

첫 commit 전 load는 변경·상태·진단 콜백을 버리고 오류 기록만 보관합니다. 확정 commit은 루트 구독과 prepared 표시 뒤 기록을 flush하고 외부 오류·로드 검증을 연결합니다. StrictMode 재연결은 이미 준비된 load를 다시 flush하거나 예약하지 않습니다. 준비된 현행 load는 effect 연결 여부와 무관하게 engine chain 끝에서 콜백과 기록을 전달합니다. 교체된 load는 reset 사슬 뒤 은퇴하며 소비자 기록을 다시 배달하지 않습니다.

React는 숨김과 실제 unmount를 같은 cleanup으로 표현하므로 루트 구독은 cleanup에서 끊지 않습니다. retained handle·노드의 쓰기·reset·rebuild·validate·submit과 예약 슬롯은 unmount 뒤에도 전달할 수 있습니다. cleanup은 검증 캐시 retain만 해제하며 그 뒤 만든 새 루트는 retain하지 않아 축출 후 재컴파일할 수 있습니다.

숨김 중 일반 콜백은 마지막 연결 commit의 props를 쓰고 show에서 새 props가 반영됩니다. onError의 최신 insertion-effect 수명은 [FormErrorContext](../FormErrorContext/DETAIL.md)가 소유합니다. 숨김 중 ref는 null일 수 있으므로 보유 핸들이 필요합니다. show의 자식 layout 쓰기는 prepared load에서 즉시 전달되며 개발 StrictMode의 비멱등 replay도 전달될 수 있습니다.

### ERROR-077 — 생성 실패와 보고

생성·mount 실패는 렌더에서 잡아 load에 보관합니다. 공유 충돌은 루트를 제거하여 fallback으로 가고, 커밋 가능한 정착 실패는 degraded 트리를 유지합니다. 렌더 중 소비자 callback을 호출하지 않으며 SSR에는 commit 보고가 없습니다. 확정 load가 오류를 한 번 보고하고 host에 전달합니다. reset의 caller 오류와 자동 슬롯 실패는 별도 경로입니다.

교체 전 never-prepared load의 기록은 원래 root·warning scope를 보존해 새 build 기록 앞에 옮깁니다. mount 사슬 기록이 build 기록보다 먼저 전달될 수 있고 binding 교체 전 보고 중 handle.node는 옛 루트일 수 있습니다. 기록별 handler 실패를 격리하여 나머지 기록과 교체를 계속합니다. 새 load는 prepared·reported를 함께 확정하되 caller에게 던질 error는 보존하여 pending flush에서 같은 실패를 재보고하지 않습니다. 옛 생성 실패도 한 번만 capture·host 보고합니다.

버퍼 기록의 원래 root뿐 아니라 현행 root에도 오류 관찰자 guard를 적용하여 onError가 새 폼에 쓰는 우회를 막습니다. 실패 묶음의 잎 순회·빈 묶음 처리는 FormErrorContext의 책임입니다. 검증 슬롯은 엔진이 보고한 오류를 다시 capture하지 않습니다.

### VALIDATE-052 — 공통 로드 슬롯

최초 mount·reset·rebuild·검증기 교체는 표시 정책과 무관하게 다음 프레임 뒤 공통 슬롯을 사용합니다. None은 컴파일하지 않고 OnRequest-only는 컴파일만 하며 OnChange는 로드 이후 대체 요청이 없을 때 현재 snapshot을 판정합니다. 앞선 자동 요청·명시 root.validate는 슬롯 판정을 대체하고 하위 validate는 대체하지 않습니다. ErrorVisibility.Always도 최초 inline 판정을 만들지 않습니다. if 게이트의 동기 컴파일과 명시 validate·submit은 이 미룸과 별개입니다. 첫 결과 전 빈 목록을 성공으로 단정하지 않습니다.

adoption은 컴파일하지 않으므로 자동 compile 실패가 새 트리를 되돌리거나 reset·rebuild를 던지게 하지 않습니다. 자동 실패는 validate origin과 host에 한 번씩 보고하고 명시 호출은 거부를 유지합니다. 결과·요청 snapshot과 release 의미는 [validation](../../core/engine/validation/DETAIL.md)이 소유합니다.

### root-live-settings — 실행 설정 수명

commit은 구조 교체를 처리한 현행 root에 validationMode·자동 쓰기·비활성 정책·표시 정책을 함께 적용한 뒤 context와 외부 오류를 전달합니다. 표시 정책 변경은 reset 사유가 아니며 검증 모드·예약을 바꾸지 않습니다. 숨김 cleanup은 committed 설정을 지우지 않습니다.

load·activation은 하나의 유효 슬롯 토큰을 공유합니다. 실효 모드 변경은 이전 슬롯을 무효화하고 None→OnRequest는 컴파일 준비, None 또는 OnRequest→OnChange는 다음 쓰기를 기다리지 않고 판정을 예약합니다. 같은 설정의 최초 commit·StrictMode replay는 추가 활성화를 만들지 않습니다. 실행을 시작한 슬롯의 늦은 실패는 시작 root·validation epoch·은퇴 여부로 판정합니다. 같은 root reset·요청 stamp·token 교체만으로 같은 epoch의 실패를 버리지 않으며 루트 교체·은퇴·실효 모드 전환은 늦은 보고를 차단합니다.

### WRITE-045 — 외부 오류와 검증 콜백

외부 오류는 루트의 전체 목록과 실제 해석된 비루트별 목록에 함께 적용합니다. 별칭 경로를 같은 노드로 묶고 원래 순서를 유지하며 이전 목록에만 남은 경로는 비웁니다. 누락 노드는 건너뜁니다. 배열이 아닌 errors는 빈 목록으로 취급합니다. reset의 두 경로는 외부 오류를 동기 재적용하고 prop effect는 같은 commit의 구조 교체가 끝난 store.load.root에 적용하여 옛 트리로 새 오류가 새지 않게 합니다.

onValidate는 같은 참조와 연속 빈 목록을 중복 보고하지 않습니다. reset 뒤 집계가 비고 마지막 보고가 비어 있지 않으면 모드와 무관하게 빈 목록을 한 번 보충합니다. 첫 보고 전 OnRequest 재생성에 빈 보고를 합성하지 않습니다. 보충 callback이 던져도 load 자체 오류가 있으면 그 오류를 우선 caller에게 던집니다. 최초 오류 적용·reset은 load origin, errors prop 변경은 write이며 중첩하면 바깥 origin을 따릅니다.

## Acceptance Criteria

### live-configuration — 구성 오류와 복구

초기 잘못된 입력 맵·표시 정책은 트리를 만들지 않는 실패 load로 보관하고 확정 fallback에서 load origin으로 한 번 보고합니다. 유효한 구성으로 복구하면 새 load를 만들며 다른 스키마 오류가 나타나도 이미 보고한 구성 오류를 렌더 경계로 다시 던지지 않습니다. 잘못된 live 구성은 기존 루트·입력을 보존하고 같은 commit의 검증기 교체를 미룹니다. 복구 commit은 실제 load와 최신 검증기를 재대조합니다. 검증기 구성 실패는 참조 변경·명시 reset에서 재시도하며 매 렌더 반복하지 않습니다.

### root-node-context-contract — 관찰 가능한 동작

WRITE-046·WRITE-086. 살아 있는 노드 판정은 호출 시점 binding으로 하되 첫 준비 전에는 Context 루트를 사용하여 자식 layout 입력을 허용합니다. 교체된 노드의 늦은 입력은 거부합니다. 숨김·unmount는 준비된 load의 콜백·슬롯을 취소하지 않으며 옛 load의 은퇴와 구분합니다. 자동 검증 실패에서도 교체 트리를 유지하고 기록·host 보고를 중복하지 않습니다.

ERROR-196의 참조 차이 경고는 adoption을 소유한 [write](../../core/engine/write/DETAIL.md)가 판정합니다. 이 Provider는 오류 보고를 위해 별도 스키마 전수 비교를 추가하지 않습니다.

## Last Updated

루트 교체·commit·구성 복구·숨김·외부 오류 또는 검증 슬롯 수명이 바뀔 때 갱신합니다.
