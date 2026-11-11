# FieldRendererContext

## Requirements

렌더러 선택과 오류 표시 판단을 소유합니다. 원시 오류와 표시 허용을 분리하여 화면에서 숨겼다는 이유로 검증 결과를 지우지 않습니다.

## API Contracts

LabelRenderer·ErrorMessageRenderer는 node와 내용 중심의 전용 props를 받습니다. 부품을 만드는 FieldProxy에 현재 선택을 전달하며, context나 오류를 부품에 자동 주입하지 않습니다. InputRenderer의 그룹 props 계약은 유지합니다.

유효한 Form 렌더러·포맷터가 외부 설정보다 우선하고 누락 값은 플러그인으로 보완합니다. 최신 불변 참조로 해석하되 값·노드 상태를 초기화하거나 검증을 실행하지 않습니다. 기본 정책 선택·잘못된 값 보존·공개 명령 세대는 [FormCore](../../components/Form/components/FormCore/DETAIL.md)가 소유하고, 엔진의 정책 기록은 [RootNodeContext](../RootNodeContext/DETAIL.md)가 commit합니다.

FieldNodeState.ErrorVisibility는 undefined일 때 상속, true일 때 허용, false일 때 Form 공개 중에도 억제합니다. 상속 복귀는 그 키만 undefined로 지워 Edited·Touched를 보존합니다. 렌더러·입력의 presence와 OnChange release 조건을 이 override로 우회하지 않습니다. 자식 오류 집계는 숨긴 자식도 포함하는 [hooks 계약](../../hooks/DETAIL.md)이므로 presence 필터를 추가하지 않습니다.

## Acceptance Criteria

### live-configuration — 설정 교체 수명

Form·FormProvider의 렌더러·formatError 교체를 현재 화면에 적용하고, 가려진 외부 설정 변경은 선택을 바꾸지 않습니다. 같은 실효 정책에는 checker 참조를 유지합니다. 렌더러 종류 교체는 해당 UI subtree를 새로 만들 수 있으므로 노드 보존과 DOM 보존을 같은 약속으로 취급하지 않습니다.

### form-type-renderer-context-contract — 표시의 단일 판단

노드 override와 기본 edited·touched 정책은 하나의 순수 checker로 판단합니다. Context는 렌더러를 직접 실행하지 않으며 [FieldProxy](../../components/FieldProxy/DETAIL.md)의 실행·격리 경계를 유지합니다.

### error-release-history — release 사이의 적격성

OnChange 오류는 현재 live 조건을 만족하고 마지막 release 이후 모든 노드 상태·presence·committed 정책 조합에서도 적격일 때 표시합니다. 잠깐이라도 부적격이면 다음 release까지 보류하고 숨김은 즉시 반영합니다. 상태와 정책을 세대 순서로 합쳐 검사하므로 같은 React batch에서 화면에 나오지 않은 중간 조합도 판정에 포함됩니다. 엔진의 batch·walk 기록 압축, pending 해제·조용한 drop·명시적 root 판정·폐기의 release 수명은 [validation](../../core/engine/validation/DETAIL.md)과 [record](../../core/engine/record/DETAIL.md)가 소유합니다. 화면 뒤 예약 간격은 [validationScheduling](../../core/engine/validationScheduling/DETAIL.md)을 따릅니다.

표시 중이지만 보류된 후보만 같은 render의 release version을 읽고 passive subscriber를 붙입니다. 구독 뒤 version 차이를 따라잡아 render와 effect 사이의 release 및 Activity 재연결을 놓치지 않습니다. 표시를 위한 layout effect나 React 내부 표시 저장소를 추가하지 않습니다. 비후보는 release 구독·이력 읽기 비용을 내지 않으며 aggregate hook은 후보 version+1과 비후보 0을 사용합니다. 첫 release 전 version 0과 후보 종료 0이 같아 React가 필요한 재렌더를 버리는 일을 막기 위해서입니다.

### error-release-limits — 표시 지연의 한계

OnChange 밖에서는 live 조건을 사용합니다. hook disabled 변경의 즉시 표시, drop보다 늦게 렌더된 상태·presence의 hold 생략, commit-only 연속의 hold, release와 paint 사이 쓰기로 판정이 1~2프레임 보일 수 있는 한계를 유지합니다. 새 표시의 일반 release 대기는 약 두 프레임이며 reducer 통지는 현재 React 우선순위를 따르므로 노드 사건 없는 release는 한 paint 더 늦을 수 있습니다. transition 통지는 transition lane, passive catch-up은 default 우선순위를 따르며 오류 사건의 tracker는 동기 갱신합니다. 매 render가 이력을 다시 읽으므로 배달 순서만으로 표시를 확정하지 않습니다.

## Boundary Exemptions

### `components/ErrorRevealSubscriber.tsx` — 표시 판단과 해제 구독의 공동 소유

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 소비자는 FieldProxy 아래에 있지만 subscriber는 이 모듈의 표시 판단에 필요한 구독 절반입니다. 동일 render의 version과 passive catch-up을 같은 경계에서 변경하려고 유지합니다.

## Last Updated

렌더러 선택, 오류 override 또는 release 표시·구독·지연 계약이 바뀌면 갱신합니다.
