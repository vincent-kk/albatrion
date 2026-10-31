# FieldRendererContext

## Requirements

폼 렌더러와 오류 표시 정책을 외부 설정 및 플러그인 폴백과 결합합니다.

## API Contracts

- U2의 useErrorVisibility는 checkShowError로 계산한 조건을 공통으로 보정하는 바인딩 전용 표시 단위다. FieldProxy·FieldInputSlot·useChildFieldErrors가 같은 단위를 쓴다. visible = condition && (wasVisible || !pending)이며 표시 중 오류는 다음 판정까지 유지하고 새 표시는 pending 종료까지 보류한다. 숨김은 즉시 반영한다.
- 노드 identity 배열은 얕은 비교로 안정화하고 표시 bit열이 바뀔 때만 layout commit을 예약해 표시가 같은 일반 입력 쓰기는 layout effect0회를 유지한다. visibility 기억 자체는 여전히 render에서 쓰지 않는다.
- wasVisible은 노드별 Map으로 기억하며 layout effect에서만 직전 commit 값을 기록한다. 렌더에서 기록하지 않고 cleanup으로 초기화하지 않아 StrictMode 재실행과 배열 항목 이동에 안전하다. 해석 노드 변경은 새 노드 기억으로 시작하고 null 렌더는 false를 기록한다.
- pending은 useSyncExternalStore로 읽고 서버 스냅숏은 false이다. 현재 표시를 보류하는 동안에만 내부 정착 알림을 구독하고 나머지는 no-op subscribe이다. 같은 폼의 노드 묶음을 한 구독으로 읽으며 공개 반환 형이나 raw errors는 바꾸지 않는다. 동기 연속 입력은 다음100ms cap, stale 비동기 판정은 후행까지 보류할 수 있다.

- 폼 지정 렌더러·포맷터가 외부 설정보다 우선하며 누락된 값은 플러그인 폴백으로 보완합니다.
- 오류 표시 판단은 명시적 `FieldNodeState.ErrorVisible` 상태를 먼저 보고 정책 비트를 평가합니다. 기본은 dirty와 touched의 동시 충족입니다.

- Context 객체와 Provider는 `components/`, 소비 훅은 `hooks/`에 있습니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### form-type-renderer-context-contract — 관찰 가능한 동작

- 명시적 오류 표시 상태가 일반 dirty/touched 정책에 가려지지 않습니다.
- 사용자 렌더러가 없어도 소비자는 폴백 렌더러를 얻으며 Context 자체는 이를 렌더하지 않습니다.

## Last Updated

2026-09-16
