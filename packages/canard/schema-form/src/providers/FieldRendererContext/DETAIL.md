# FieldRendererContext

## Requirements

폼 렌더러와 오류 표시 정책을 외부 설정 및 플러그인 폴백과 결합합니다.

## API Contracts

- H: 오류는 현재 적격이며 마지막 release 이후 모든 state·enabled·커밋 정책 조합에서 계속 적격일 때만 표시한다. 잠깐이라도 부적격이면 다음 release를 기다리며 숨김은 즉시다. release는 pending true→false 정착, 조용한 post-paint drop, 수락한 explicit root 판정, 폐기다. pending이 없어도 새 표시는 약2프레임 뒤 release에서 나타난다. OnChange가 아니면 live 조건만 사용한다.
- H: Provider는 Form showError→외부 설정→DirtyTouched 순으로 해석한 policy 값과 순수 checker를 memoize해 제공한다. 엔진 정책은 RootNodeContext가 commit하며 Provider는 기록하지 않는다. 순수 helper가 node/policy entries를 generation 순서로 병합하여 마지막 live state/committed policy 쌍까지 검사한다.
- H: 표시당 hook은 node에 memoize한 release version getter를 client/server snapshot 양쪽에 사용한다. subscribe는 node/candidate에 memoize하며 live 적격이지만 history가 거부한 candidate만 release listener를 등록하고 등록 직후 catch-up을 한 번 호출한다. React 표시 수명 저장소와 표시 layout effect는 없고 ordinary render의 subscription passive effect도 추가하지 않는다. 배열 filled-minus-empty mount는2회·ordinary write layout0회다.
- 알려진 한계는 hook disabled의 즉시 reveal, drop보다 늦은 state/enabled render의 hold 생략, commit-only 연속의 hold, release와 paint 사이 task의 쓰기가 released verdict를1~2프레임 표시함, 한 React batch 안의 미표시 state/enabled/policy 조합도 이력에 포함됨이다.


- 폼 지정 렌더러·포맷터가 외부 설정보다 우선하며 누락된 값은 플러그인 폴백으로 보완합니다.
- 오류 표시 판단은 명시적 `FieldNodeState.ErrorVisible` 상태를 먼저 보고 정책 비트를 평가합니다. 기본은 dirty와 touched의 동시 충족입니다.

- Context 객체와 Provider는 `components/`, 소비 훅은 `hooks/`에 있습니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### form-type-renderer-context-contract — 관찰 가능한 동작

- 명시적 오류 표시 상태가 일반 dirty/touched 정책에 가려지지 않습니다.
- 사용자 렌더러가 없어도 소비자는 폴백 렌더러를 얻으며 Context 자체는 이를 렌더하지 않습니다.

## Last Updated

2026-09-16
