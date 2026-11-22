# @lerx/promise-modal 버그 바운티 결과

확인된 문제는 8건입니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 React 19로 다시 실행해 같은 실패를 확인했습니다. 탐색 에이전트는 React 18(`test:react18`)에서도 같은 실패를 확인했습니다.

재현 테스트 (모두 [`probes/lerx-promise-modal/`](probes/lerx-promise-modal/) 아래):

- `radioTrap.render.test.tsx`, `focusEdges.render.test.tsx`, `rootMoveFocus.render.test.tsx`, `escapeReentry.render.test.tsx`, `ownershipRoute.render.test.tsx`, `tabbableEdges.test.ts`

원인 파일:

- `ModalManager.ts`: `packages/lerx/promise-modal/src/app/ModalManager.ts`
- `getTabbableElements.ts`: `packages/lerx/promise-modal/src/app/utils/getTabbableElements.ts`

다른 패키지와의 관계: promise-modal은 `@winglet/style-utils`의 `StyleManager`로 스타일을 주입하므로, [`winglet-style-utils.md`](winglet-style-utils.md)의 선택자 스코프 버그도 영향을 줍니다.

## 1. 선택된 항목이 없는 라디오 그룹을 통해 포커스가 트랩을 빠져나갑니다

- 심각도: 중간. 패치 changeset이 이 경우를 처리한다고 명시적으로 약속했습니다. 첫 컨트롤이 선택되지 않은 라디오 그룹이면 그 그룹이 처음 포커스를 받고, Shift+Tab 한 번으로 모달 밖으로 나가는 흔한 배치에서 일어납니다.
- 영향받는 공개 API: `confirm`, `alert`, `prompt`로 연 dimmed 모달의 Tab 포커스 트랩.
- 어긋난 계약: `.changeset/promise-modal-radio-focus-trap.md`는 트랩이 "선택이 없는 그룹에서는 방향에 따른 진입을 쓴다"고 적고 있고, `src/app/DETAIL.md`의 요구 사항 둘째 문단도 같습니다.
- 원인:
  - `ModalManager.ts:367`부터 382행의 `trapTab`은 `current === first/last`가 요소 동일성으로 맞을 때만 감쌉니다.
  - `getTabbableElements.ts:50`부터 58행은 선택되지 않은 그룹을 방향에 따라 라디오 하나로 대표합니다. 앞으로 갈 때는 첫 라디오, 뒤로 갈 때는 마지막 라디오입니다.
  - 포커스가 그룹의 다른 쪽 끝에 있으면 아무것도 맞지 않아 트랩이 키를 취소하지 않고, 브라우저 기본 Tab이나 Shift+Tab이 그룹과 모달을 빠져나갑니다. 처음 포커스는 첫 라디오에 놓이는데, 역방향 목록에는 그 라디오가 없습니다. Shift+Tab으로 감싸면 마지막 라디오에 포커스가 가는데, 정방향 목록에는 그 라디오가 없습니다.
- 재현: `radioTrap.render.test.tsx`의 테스트 "traps Shift+Tab from the initially focused radio of an unchecked leading group"과 "traps Tab from a radio entered by Shift+Tab in an unchecked trailing group". 실제로 키 입력이 취소되지 않습니다.
- 확신도: 높음.

## 2. 열린 shadow root 안의 컨트롤에 Tab으로 도달할 수 없습니다

- 심각도: 중간. Lit나 Shoelace 기반 디자인 시스템 같은 웹 컴포넌트 안의 컨트롤에 키보드 사용자가 도달하지 못합니다.
- 영향받는 공개 API: 포커스 트랩.
- 어긋난 계약: WAI-ARIA 대화상자 패턴의 키보드 계약은 Tab이 대화상자 안의 다음 탭 가능한 요소로 이동한다고 정합니다. `.changeset/promise-modal-keyboard-and-focus.md`도 "Tab을 그 안에 유지한다"고 적고 있고, 문서화된 유일한 한계는 모달 밖의 포털입니다.
- 원인:
  - `getTabbableElements.ts:9`의 `querySelectorAll`은 shadow root 안을 보지 않습니다.
  - 그래서 마지막 light DOM 버튼이 경계로 취급되고, 거기서 Tab을 누르면 취소되어 첫 컨트롤로 감싸집니다. shadow 안의 컨트롤은 영원히 건너뛰어집니다.
  - 포커스가 이미 shadow root 안에 있으면 `document.activeElement`는 호스트 요소인데, 호스트는 목록에 없으므로 마지막 shadow 컨트롤에서 누른 Tab은 모달을 빠져나갑니다.
- 재현: `focusEdges.render.test.tsx`의 테스트 "does not make controls inside an open shadow root unreachable by Tab". 실제로 키 입력이 취소되고 포커스가 `#a`로 돌아갑니다.
- 확신도: 높음.

## 3. 포커스가 첫 컨트롤 앞의 `tabindex="-1"` 요소에 있으면 Shift+Tab으로 모달을 빠져나갑니다

- 심각도: 중간. WAI-ARIA 대화상자 패턴은 대화상자가 열릴 때 `tabindex="-1"`인 정적 제목에 포커스를 두라고 권장합니다. 마지막 컨트롤 뒤에 놓인 음수 tabindex 요소에서 Tab을 눌러도 같은 일이 일어납니다.
- 영향받는 공개 API: 포커스 트랩.
- 어긋난 계약: `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:137`(Accessibility 절)은 "Tab and Shift+Tab cycle"이라고 적고 있습니다. keyboard-and-focus changeset도 "Tab을 그 안에 유지한다"고 적고 있습니다.
- 원인: `ModalManager.ts:374`부터 381행의 트랩은 포커스가 프레임 밖일 때, 프레임 자체일 때, 정확히 첫째나 마지막 컨트롤일 때의 세 경우만 처리합니다. 프레임 안이지만 첫 컨트롤 앞이나 마지막 컨트롤 뒤에 있는 요소는 처리되지 않고, 브라우저 기본 이동이 모달을 빠져나갑니다.
- 재현: `focusEdges.render.test.tsx`의 테스트 "keeps Shift+Tab inside when focus sits on a tabindex=-1 element before the first control". 실제로 키 입력이 취소되지 않습니다.
- 확신도: 높음.

## 4. 소유 프로바이더의 `root`가 다른 요소로 바뀌면 포커스를 잃습니다

- 심각도: 낮음에서 중간. 대기 중인 모달은 이동을 견디지만, 키보드 포커스는 `body`로 떨어지고(비활성화된 페이지에는 더 이상 닿지 못함) 모달 안으로 돌아오지 않습니다. 프롬프트에 입력하던 사용자는 커서를 잃습니다. `root`를 `null`로 바꿨다가 되돌리는 경로는 포커스를 되돌리므로 두 경로의 동작이 다릅니다.
- 영향받는 공개 API: `ModalProvider`의 `root` prop, `initialize(element)`.
- 어긋난 계약:
  - README의 "Roots and initialization": "같은 앵커를 옮기면 입력과 프로미스가 보존된다".
  - `SPECIFICATION.md:139`: "다시 나타나거나 다시 초기화되면 대기 중인 저장소를 다시 평가한다".
  - `ModalManager.ts:241`의 `updateAccessibility` 문서 주석: "앵커가 붙으면 이미 커밋된 UI 안으로의 포커스 이동도 허용한다".
- 원인:
  - `ModalManager.ts:106`과 107행의 `appendChild`가 앵커를 옮기고, 노드를 옮기면 그 안의 포커스된 요소가 blur됩니다.
  - `attach`(`ModalManager.ts:145`부터 151행)는 125행의 `null` 경로와 달리 `state.focused`를 비우지 않으므로, `updateAccessibility(true)`가 258행부터 260행에서 최상위 모달을 건너뜁니다.
- 재현: `rootMoveFocus.render.test.tsx`의 테스트 "keeps focus inside the pending dimmed modal when the root element changes". 이동 뒤 `second.contains(activeElement)`가 거짓입니다. 실제 브라우저에서도 노드를 옮기면 포커스된 요소가 blur되므로 jsdom 특유의 현상이 아닙니다.
- 확신도: 높음.

## 5. 최상위 모달의 입력이 Escape에 스스로 취소하면, Escape 한 번에 모달 두 개가 닫힙니다

- 심각도: 낮음에서 중간. Input의 `onKeyDown`에서 Escape로 프롬프트를 취소하는 것은 자연스러운 패턴인데, 그 아래 모달까지 조용히 취소됩니다.
- 영향받는 공개 API: Escape 처리, `PromptInputProps.onCancel`, 콘텐츠의 `onCancel` 콜백.
- 어긋난 계약: `SPECIFICATION.md:135`: "한 번 누를 때 최대 한 모달만 닫는다".
- 원인:
  - 문서 keydown 리스너(`ModalManager.ts:345`부터 354행)는 React 루트 리스너 뒤에 실행됩니다.
  - React 처리기가 `preventDefault` 없이 최상위 모달을 이미 끝냈다면, `visibleNodes()`가 그 노드를 빼고, 순회가 그 아래 모달을 취소합니다.
  - 순회를 이벤트 이전 상태에 묶어 두는 장치가 없습니다.
- 재현: `escapeReentry.render.test.tsx`의 테스트 "closes at most one modal when the top prompt cancels itself on Escape". 아래 `confirm`이 `false`로 끝나는데, 기대 동작은 대기 상태로 남는 것입니다.
- 확신도: 동작이 일어난다는 점은 높음. 다만 계약 충돌입니다. 막힌(prevented) 이벤트는 무시된다고 문서화되어 있으므로, 소비자가 `preventDefault`를 호출해야 한다고 볼 여지도 있습니다.

## 6. 경로(pathname) 훅이 다른 대기 프로바이더에게 소유권이 넘어가면, 살아 있는 모달이 숨겨지고 끝나지 않습니다

- 심각도: 낮음에서 중간. 프로미스는 대기 상태로 남고 모달은 보이지 않습니다. 이전 소유자가 찍어 둔 경로는 새 소유자의 훅이 결코 보고하지 않습니다. #625의 대기열 경로 수정은 대기 중인 요청만 다시 찍기 때문에, 이 경우는 그 바로 옆에 남은 빈틈입니다.
- 영향받는 공개 API: `ModalProvider` 소유권 인계와 `usePathname` prop의 조합(공유 런타임, 여러 번들 시나리오).
- 어긋난 계약: README의 "소유자가 언마운트되면 첫 대기자가 넘겨받는다", 그리고 공유 런타임 changeset이 받는 쪽 프로바이더의 경로를 쓰는 이유로 든 "요청이 이전 프로바이더의 경로 아래 숨은 채 열리지 않게 한다".
- 원인: `packages/lerx/promise-modal/src/providers/ModalManagerContext/ModalManagerContextProvider.tsx:75`부터 81행에서, 새 소유자의 pathname 레이아웃 effect가 `initiator`가 자기 경로와 다른 살아 있는 노드를 모두 숨깁니다. 이전 소유자가 만든, 이전 경로를 지닌 노드까지 포함됩니다.
- 재현: `ownershipRoute.render.test.tsx`의 테스트 "keeps a live modal visible when ownership transfers to a waiter with another pathname hook". 노드가 `visible === false`로 끝나고 settle되지 않습니다.
- 확신도: 중간. 설계상 한계일 수도 있지만, 이 동작을 고정한 테스트는 없습니다.

## 7. 트랩이 `contenteditable=""`, `"plaintext-only"`, `"TRUE"`를 포커스 가능한 요소로 인식하지 않습니다

- 심각도: 낮음. 값 없는 `<div contenteditable>` 편집기에 Tab으로 도달하지 못합니다. 그 편집기 말고 다른 컨트롤이 버튼 하나뿐이면, 그 버튼이 첫 경계이자 마지막 경계가 되어 Tab이 항상 버튼으로 감싸집니다. 포커스가 편집기 안에 있으면 Tab이 모달을 빠져나갑니다. 대부분의 편집기 라이브러리는 `contenteditable="true"`를 내보내므로 영향은 제한적입니다.
- 영향받는 공개 API: 포커스 트랩.
- 어긋난 계약: `getTabbableElements`의 문서 주석은 "브라우저 탭 순서의 컨트롤"을 반환한다고 적고 있고, WAI-ARIA 대화상자 키보드 계약도 있습니다.
- 원인: `getTabbableElements.ts:10`이 정확한 선택자 `[contenteditable="true"]`만 씁니다.
- 재현: `tabbableEdges.test.ts`의 매개변수화된 테스트 3개 "treats contenteditable=... as a sequential focus target like the browser". 실제 `['first']`, 기대 `['first', 'editor']`. `"true"` 대조 사례는 통과합니다. jsdom은 contenteditable 요소를 포커스 가능하게 만들지 않으므로, 재현 테스트가 브라우저처럼 `tabIndex = 0`을 직접 설정합니다.
- 확신도: 중간에서 높음.

## 8. 중첩 모달을 연 요소가 사라진 뒤 그 모달을 닫으면, 남은 dimmed 모달 밖에 포커스가 남습니다

- 심각도: 낮음. 페이지는 비활성 상태이고 dimmed 모달이 아직 대기 중인데, 포커스는 닫힌 모달이나 `body`에 머뭅니다. Tab을 누르면 트랩이 포커스를 되찾지만, 스크린 리더 사용자는 위치를 잃습니다.
- 영향받는 공개 API: 포커스 복원.
- 어긋난 계약: WAI-ARIA 지침은 대화상자를 연 요소가 더 이상 없으면 다른 논리적 요소로 포커스를 옮기라고 합니다. 이는 `SPECIFICATION.md:139`의 "연결이 끊긴 opener는 무시한다"는 문구와 충돌하는데, 그 문구는 비활성 opener에 대해서만 대체 동작을 정합니다.
- 원인: `ModalManager.ts:227`부터 235행의 `restoreFocus`는 `target.closest('[inert]')`일 때만 `focusFrame(remaining[0])`으로 대체합니다. 연결이 끊긴 대상은 어느 분기에도 맞지 않습니다.
- 재현: `focusEdges.render.test.tsx`의 테스트 "moves focus into the remaining dimmed modal when the nested opener was removed". 아래 모달의 프레임이 `activeElement`를 포함하지 않습니다.
- 확신도: 중간. 문서의 빈틈으로 분류할 수도 있습니다.

## 버그가 아니라고 확인한 가설

- StrictMode에서 마운트 effect로 연 모달이 `useModal`의 언마운트 정리로 취소되는 것은, 정리 함수 없는 사용자 effect에서 일어나는 표준 StrictMode 동작입니다.
- dimmed가 아닌 토스트가 위에 있을 때 Tab 트랩이 적용되지 않는 것, Escape를 받지 않는 dimmed가 아닌 모달을 Escape가 건너뛰는 것은 문서와 테스트에 있습니다.
- 이중 닫기와 이중 settle은 `AbstractNode.__settled__`, `closeModal`, `dispatchModal`의 `settled` 플래그가 막습니다.
- AbortSignal: 이미 중단된 요청은 만들어지지 않고, 대기열의 요청을 중단하면 제거되며, settle·거부·프로바이더 언마운트 취소 때 리스너가 제거되고, 열림 애니메이션 중 중단하면 모달이 닫힙니다.
- 대기자가 있는 소유자가 언마운트되면 대기자가 처리기를 받고, 대기 중인 요청은 대기자의 옵션으로 처리되며, 이전 처리기는 다시 설치되지 않습니다(#625).
- 같은 커밋 안의 재마운트와 StrictMode 이중 effect: 세대 확인이 파기 마이크로태스크를 막고, 프롬프트 입력이 유지됩니다.
- 마지막 프로바이더를 제거하면 살아 있는 노드가 취소되고, 대기 중인 요청은 문서대로 대기열에 남습니다.
- `useModal` 취소는 살아 있는 `modalNode` getter를 통해 대기 중인 요청에도 닿습니다.
- 다른 모달이 열려 있지 않을 때 연결이 끊긴 opener를 무시하는 것은 기존 테스트가 고정하고 있습니다. 아직 비활성인 opener는 남은 dimmed 프레임으로 포커스를 대체합니다.
- 스크롤 잠금은 쌓인 모달 사이에서 공유되고 우선순위를 복원합니다. `inert`는 보존되고, root가 옮겨지면 다시 기록되며, `root={null}`에서 해제됩니다.
- 탭 목록의 hidden, `display: none`, `inert`, disabled, 닫힌 `details`, `visibility` 처리는 올바릅니다.
- `useDestroyAfter`는 경로 숨김에서 시작되지 않고, settle된 `manualDestroy` 모달은 경로로 돌아와도 다시 나타나지 않습니다.
- 지속 시간 정규화는 숫자, `.5s`, 잘못된 값 같은 경계 입력에서 올바릅니다.
- `mergeDefined`는 명시적인 `undefined`를 상속하고, `closeOnEscape` 결정 순서는 문서와 일치합니다.
- 서버 렌더링: `window`를 읽는 `usePathname`은 포털이 렌더될 때만 호출되고, 포털은 서버에서 렌더되지 않습니다.
