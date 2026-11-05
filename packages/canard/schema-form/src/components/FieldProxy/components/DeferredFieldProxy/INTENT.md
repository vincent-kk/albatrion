# DeferredFieldProxy

## Purpose

미노출 노드의 빈 자리를 실제 React 서브트리로 바꾸는 렌더 경계입니다. 명령이 도착했을 때 입력 마운트와 DOM 동작을 연결하며, placeholder의 접근성·공간·경로 계약을 소유합니다.

## Conventions

- placeholder: `<div data-path={path} data-deferred aria-hidden style={{height}}>`. 실제 레이아웃 박스가 필요하므로 `display: contents`는 쓰지 않는다. 선택 사항인 `Placeholder` 컴포넌트는 wrapper "내부"의 시각적 채움만 맡고, 관찰 대상과 공간 예약은 wrapper가 소유한다.
- DOM 주소는 마운트된 wrapper와 같은 `data-path`로 노출하고 상태는 `data-deferred`로 구별합니다. 노드 identity와 노출 이력은 경로 문자열로 대체하지 않습니다.
- `NodeProxy`는 prop으로 받는다. `FieldProxy`를 직접 import하면 순환 의존이 생기기 때문이다.
- ref는 null-pattern 콜백을 쓴다. React 18과 호환되도록 ref cleanup 함수는 쓰지 않는다.
- 노출 명령 마스크는 `RequestFocus | RequestSelect`로 한정합니다. 값 교체·초기화가 보내는 Refresh로 대량의 미노출 필드가 마운트되지 않게 합니다.
- `revealed`의 초기값은 `manager.hasRevealed(node)`이다. 캐시를 다시 만들 때(배열 번호 재할당)도 노출 상태가 유지된다.

## Boundaries

### Always do

- `node.isPresent === false`이면 placeholder도 렌더하지 않고 `null` 반환 (`UpdateControlledProperties` 추적)
- 노출 커밋 뒤 보류한 focus/select를 공개 `request`로 동기 재실행하여 새 입력의 layout 구독에 연결합니다.
- placeholder를 언마운트할 때 `manager.unregister`가 반드시 호출되게 한다 (null-pattern ref)

### Ask first

- 노출 명령 마스크(`FORCE_REVEAL_EVENT`)를 바꿀 때
- placeholder DOM 계약(`data-path`+`data-deferred`, `aria-hidden`)을 바꿀 때
- 명령 보관 범위를 구독 전으로 넓히거나 reveal 취소를 도입하는 경우. 현재 보장의 한계는 [DETAIL](./DETAIL.md)에 둡니다.

### Never do

- 노출된 뒤에 다시 placeholder로 되돌리는 로직 추가
- `FieldInputBridge`/`FieldProxy`의 내부 구현을 직접 import
- placeholder에서 `data-deferred` 마커 생략 (마커 없는 `data-path`는 "실제로 마운트됨"을 뜻한다)
