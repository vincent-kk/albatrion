# FieldRendererContext

## Requirements

폼 렌더러와 오류 표시 정책을 외부 설정 및 플러그인 폴백과 결합합니다.

## API Contracts

- Y1–Y3: 표시의 연속성 자료는 엔진의 노드별 { state, enabled }와 Form 정책 기준 box가 소유한다. visible은 현재 조건·enabled와, pending이면 마지막 판정 기준의 조건·enabled도 모두 만족할 때 참이다. React mount·복원·version remount·두 번째 표시·가상화 노출은 같은 노드 자료를 읽어 같은 지연 판정을 표시한다.
- 순수 checkShowError factory와 policy resolver는 undefined 정책을 external/default로 해석한다. Provider는 memoized 순수 resolver만 제공하고 엔진의 box를 읽거나 cache하지 않는다. 순수 visibility helper와 표시당 훅 하나가 기준을 현재 pending snapshot과 같은 렌더에서 읽는다. pending은 서버 false인 useSyncExternalStore 반환값만 사용한다. 보류하는 표시만 정착 알림을 구독하고 나머지는 no-op이다.
- React 표시 WeakMap·commit 기억·visibility layout effect는 없다. 배열 항목 mount는2회, 일반 쓰기는 layout effect0회이다. raw errors·공개 사건·revision·패키지 진입점은 유지한다.
- 엔진이 보지 못하는 external showError 기본값과 useChildFieldErrors disabled 인자는 현재 판정을 즉시 보여 주며, transition으로 지연된 reveal render는 이전 판정을 보여 줄 수 있다. 값이 아닌 commit-only 변경의 연속은 최신 판정을 받을 때까지 hold하며 baseline drop 전 약1~2프레임 안의 새 값 쓰기도 hold할 수 있다(코디네이터 msg_5abe110cb1c6).


- 폼 지정 렌더러·포맷터가 외부 설정보다 우선하며 누락된 값은 플러그인 폴백으로 보완합니다.
- 오류 표시 판단은 명시적 `FieldNodeState.ErrorVisible` 상태를 먼저 보고 정책 비트를 평가합니다. 기본은 dirty와 touched의 동시 충족입니다.

- Context 객체와 Provider는 `components/`, 소비 훅은 `hooks/`에 있습니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### form-type-renderer-context-contract — 관찰 가능한 동작

- 명시적 오류 표시 상태가 일반 dirty/touched 정책에 가려지지 않습니다.
- 사용자 렌더러가 없어도 소비자는 폴백 렌더러를 얻으며 Context 자체는 이를 렌더하지 않습니다.

## Last Updated

2026-09-16
