# FieldRendererContext

## Requirements

폼 렌더러와 오류 표시 정책을 외부 설정 및 플러그인 폴백과 결합합니다.

## API Contracts

정책은 Form prop→FormProvider→기본 AfterEditAndTouch 순으로 고르며 같은 실효 값이면 checker 참조를 유지합니다. 정책 변경은 트리나 노드 상태를 덮어쓰지 않습니다.

`FieldNodeState.ErrorVisibility`는 노드 재정의로 undefined는 상속, true는 표시 허용, false는 Form 공개 중에도 억제입니다. Edited/Touched를 보존하면서 상속하려면 `node.setState({ [FieldNodeState.ErrorVisibility]: undefined })`로 그 키만 지웁니다. 렌더러와 입력은 여전히 `isPresent` 및 OnChange 해제 규칙을 따릅니다. `useChildFieldErrors`는 숨겨진 자식까지 집계하는 계약을 유지하며 presence 필터 없이 `errorVisible`·`childErrorVisibleList`를 반환합니다. 원시 오류는 표시와 무관하게 유지됩니다.

유효 정책 선택과 잘못된 값의 마지막 유효 정책 보존은 [FormCore 계약](../../components/Form/components/FormCore/DETAIL.md)이 소유합니다. 이 Context는 해석된 정책으로 순수 표시 조건을 제공합니다.

- H: 오류는 현재 적격이며 마지막 release 이후 모든 state·isPresent·커밋 정책 조합에서 계속 적격일 때만 표시한다. 잠깐이라도 부적격이면 다음 release를 기다리며 숨김은 즉시다. release는 pending true→false 정착, 조용한 post-paint drop, 수락한 explicit root 판정, 폐기다. pending이 없어도 새 표시는 약2프레임 뒤 release에서 나타난다. OnChange가 아니면 live 조건만 사용한다. 공개 `batch()` 또는 walk 하나에서는 그 쓰기 시퀀스의 첫 상태만 이력에 기록하고 중간 상태는 별도 이력으로 남기지 않습니다. 한 React batch 안의 서로 다른 공개 호출은 중간 상태도 기록합니다.
- H: Provider는 Form errorVisibility→외부 설정→AfterEditAndTouch 순으로 해석한 policy 값과 순수 checker를 memoize해 제공한다. 엔진 정책은 RootNodeContext가 commit하며 Provider는 기록하지 않는다. 순수 helper가 node/policy entries를 generation 순서로 병합하여 마지막 live state/committed policy 쌍까지 검사한다. live 조건은 같은 Context의 checkErrorVisibility(state)를 포함하며 이력이 없고 커밋 정책이 live 정책과 같으면 checker를 만들지 않고 live 결과를 반환한다.
- H: renderer/input은 enabled일 때만 live 조건을 한 번 검사하고, live일 때만 순수 isErrorRevealed로 기준과 정책 이력을 읽는다. held 표시만 같은 렌더에서 release version을 읽고 기존 첫 자식 뒤에 ErrorRevealSubscriber를 추가한다. subscriber는 passive effect에서 구독한 뒤 version 차이를 따라잡는다. FieldProxy는 모듈 reducer 하나, input은 기존 composition reducer를 재사용하며 enabled/live가 거짓인 표시에는 추가 effect·판단 배열·결과 객체·reveal 읽기가 없다. aggregate hook만 후보 version+1/비후보0의 client/server getter와 후보 전용 구독을 유지한다. 표시 layout effect는 없고 배열 filled-minus-empty mount2회·ordinary write layout0회를 유지한다.
- 최초 candidate snapshot0이 release 뒤 비후보0과 같으면 React가 강제 재렌더를 마지막 render와 같은 snapshot으로 버려 표시가 숨은 채 남는다. 후보의 version+1과 비후보0을 분리하여 후보 종료가 항상 snapshot 변경이 되게 한다. 엔진 version reader는 첫 release 전0을 유지한다.
- 알려진 한계는 hook disabled의 즉시 reveal, drop보다 늦은 state/isPresent render의 hold 생략, commit-only 연속의 hold, release와 paint 사이 task의 쓰기가 released verdict를1~2프레임 표시함, 한 React batch 안의 미표시 state/isPresent/policy 조합도 이력에 포함됨이다. reducer 해제 통지는 현재 이벤트 우선순위를 따르므로 노드 사건이 없는 release는 최악 한 paint 늦게 표시될 수 있어 약2프레임에 한 프레임이 더해질 수 있다. transition 안에서는 transition lane, passive catch-up은 default 우선순위다. 오류 변경이 함께 오면 기존 tracker는 sync로 재렌더하며 매 렌더가 이력을 다시 읽어 잘못된 오류를 표시하지 않는다. Activity의 passive 재연결도 동일 렌더 version과 비교해 따라잡는다.

- 폼 지정 렌더러·포맷터가 외부 설정보다 우선하며 누락된 값은 플러그인 폴백으로 보완합니다.
- 오류 표시 판단은 명시적 `FieldNodeState.ErrorVisibility` 상태를 먼저 보고 문자열 정책을 평가합니다. 기본은 edited와 touched의 동시 충족입니다.

- Context 객체와 Provider는 `components/`, 소비 훅은 `hooks/`에 있습니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### form-type-renderer-context-contract — 관찰 가능한 동작

- 명시적 오류 표시 상태가 일반 edited/touched 정책에 가려지지 않습니다.
- 사용자 렌더러가 없어도 소비자는 폴백 렌더러를 얻으며 Context 자체는 이를 렌더하지 않습니다.

## Boundary Exemptions

### `components/ErrorRevealSubscriber.tsx` — 표시 판단과 해제 구독의 공동 소유

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 두 제품 소비자는 FieldProxy 아래에 있지만 이 subscriber는 이 모듈이 소유한 표시 판단의 구독 절반이다. isErrorRevealed와 aggregate hook이 같은 reveal 기록을 읽으며, 소유 표시의 동일 렌더 version 읽기와 구독 catch-up 계약을 한 경계에서 변경하기 위해 유지한다.

## Last Updated

계약·경계·검증 조건이 변경될 때 갱신합니다.
