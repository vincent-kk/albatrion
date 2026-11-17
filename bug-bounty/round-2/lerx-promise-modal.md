# @lerx/promise-modal 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 7건입니다. 1라운드 문서([`../round-1/lerx-promise-modal.md`](../round-1/lerx-promise-modal.md))의 8건은 고쳐진 것으로 보고 제외했습니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다. 실행 환경은 React 19.2.6과 jsdom입니다.

재현 테스트: [`probes/lerx-promise-modal/`](probes/lerx-promise-modal/)

- 실행하려면 파일을 `packages/lerx/promise-modal/src/__bounty__/r2-promise-modal/`에 복사한 뒤 `yarn workspace @lerx/promise-modal test --run src/__bounty__/r2-promise-modal/`을 실행합니다.
- `manyRequests.render.test.tsx`는 통과하는 대조 테스트입니다(아래 "버그가 아니라고 확인한 가설" 참고).
- `dualPackageHooks.test.tsx`는 7번 항목의 재현입니다. `src/__bounty__/r2-release/`에 복사해 같은 방식으로 실행합니다. 3개 중 1개가 실패하고, 나머지 2개는 대조 테스트입니다.

원인 파일 위치: `packages/lerx/promise-modal/src/`

## 1. 모달 루트가 shadow root 안에 있으면 페이지 격리, 스타일, Tab 이동이 모두 동작하지 않습니다

- 심각도: 중간. 웹 컴포넌트 안에 마운트한 앱(마이크로 프런트엔드)에서 dimmed 모달을 사실상 쓸 수 없습니다. 모달 뒤의 페이지는 inert가 되지 않고, 모달은 스타일 없이 렌더되며, Tab을 누르면 항상 첫 컨트롤로 되돌아갑니다.
- 영향받는 공개 API: `ModalProvider`의 `root` prop, `useInitializeModal`, `initialize(element)`.
- 어긋난 계약:
  - `README.md:175`는 컨테이너 요소를 넘기라고만 적고 shadow root를 제외하지 않습니다. 문서가 제외하는 경우는 다른 realm과 iframe뿐입니다(`docs/en/SPECIFICATION.md:257`).
  - `SPECIFICATION.md:141`은 anchor의 조상 경로에 있는 형제 요소를 `document.body`까지 inert로 만든다고 적고 있습니다.
  - `SPECIFICATION.md:137`은 Tab과 Shift+Tab이 모달 안에서 순환한다고 적고 있습니다.
- 원인은 세 곳입니다.
  - `app/ModalManager.ts:278`부터 288행의 `updateInert`는 `parentElement`를 따라 올라가는데, shadow root 경계에서 `parentElement`가 `null`이 되어 멈춥니다. 그래서 shadow host 바깥의 페이지는 inert가 되지 않습니다.
  - `ModalManager.ts:443`부터 449행의 `applyStyleSheet`는 `styleManagerFactory(scope)`를 `shadowRoot` 설정 없이 호출하므로, 스타일시트가 document에만 들어가고 shadow 트리에는 적용되지 않습니다. `StyleManager` 자체는 `shadowRoot` 설정을 지원합니다.
  - `ModalManager.ts:373`부터 375행의 `trapTab`이 읽는 `document.activeElement`는 shadow host로 재지정된 값입니다. 그래서 `!frame.contains(current)`가 항상 참이 되고, 매번 키를 취소한 뒤 첫 컨트롤로 포커스를 옮깁니다.
- 1라운드와의 관계: Tab 부분은 1라운드 2번 항목(모달 안의 shadow root 컨트롤)과 같은 `activeElement` 재지정 메커니즘입니다. 1라운드 2번은 모달 안에 shadow root가 있는 경우이고, 이 항목은 모달 루트 자체가 shadow root 안에 있는 경우입니다. inert와 스타일시트 부분은 새로운 내용입니다.
- 재현: `shadowFocus.render.test.tsx`
  - "isolates page content outside a shadow host when the root lives in a shadow root": 페이지의 `closest('[inert]')`가 `null`입니다. light DOM 루트를 쓰는 대조 테스트는 통과합니다.
  - "injects the modal stylesheet where the shadow-root anchor can match it": document에는 스타일이 있지만 shadow root에는 없습니다.
  - "lets Tab move from the first to the second control when the root lives in a shadow root": 버튼 2개 중 첫 버튼에서 Tab을 눌렀는데 키가 취소됩니다.
- 확신도: 동작은 높음. 이 배치를 공식으로 지원하는지는 문서가 명시하지 않으므로, 계약 측면은 중간입니다.

## 2. `manualDestroy` 모달이 경로 변경으로 숨겨져도 화면에 표시된 채 키보드로 조작할 수 있습니다

- 심각도: 중간에서 낮음.
  - 기본 프레임에서는 대화상자가 새 경로에서도 그대로 보입니다. backdrop만 투명해지고 pointer-events가 꺼집니다.
  - README 예제의 애니메이션 프레임에서는 opacity가 0이지만 버튼이 Tab 순서에 남아, 키보드 사용자가 보이지 않는 요청을 Enter로 끝낼 수 있습니다.
  - 페이지는 inert가 아니고 모달은 끝나지 않았으므로, 이 상태가 계속 유지됩니다.
- 영향받는 공개 API: `manualDestroy` 옵션과 `usePathname`(또는 기본 경로 훅)의 조합.
- 어긋난 계약: `README.md:354`는 경로 이동이 대기 중인 요청을 끝내지 않고 숨긴다고 적고 있습니다. `SPECIFICATION.md:139`는 경로 숨김이 수동 종료 애니메이션 중에도 즉시 참여를 해제한다고 적고 있습니다.
- 원인: `components/Foreground/Foreground.tsx:51`과 `components/Background/Background.tsx:43`이 `visible` 클래스를 `modal.manualDestroy ? modal.alive : modal.visible`로 결정합니다. 이 분기는 끝난 노드의 종료 애니메이션을 위한 것인데, 경로 때문에 숨겨진 대기 중 노드도 `alive`이므로 표시 상태가 무기한 유지되고 `inert`나 `hidden`도 붙지 않습니다.
- 1라운드와의 관계: 새로운 종류입니다(숨김 조건과 표시 조건의 비대칭).
- 재현: `routeHiddenManual.render.test.tsx`의 "route hiding removes the frame from display and keyboard reach (manualDestroy=true)". 래퍼에 foreground `visible` 클래스가 남아 `true`가 나오고, 기대값은 `false`입니다. `manualDestroy=false` 대조 테스트는 통과합니다. 이 동작을 고정한 기존 테스트는 없습니다.
- 확신도: 중간.

## 3. shadow root 안의 컨트롤이 연 모달을 닫으면, 포커스가 그 컨트롤로 돌아오지 않습니다

- 심각도: 낮음에서 중간. Lit 같은 웹 컴포넌트 툴바에서 모달을 열고 닫으면, `delegatesFocus`가 없는 경우 포커스를 잃습니다. `delegatesFocus`가 있어도 원래 opener가 아니라 첫 컨트롤로 갑니다.
- 영향받는 공개 API: dimmed `confirm`, `alert`, `prompt`의 포커스 복원.
- 어긋난 계약: `SPECIFICATION.md:139`는 포커스가 연결된 opener로 돌아간다고 적고 있습니다.
- 원인: `ModalManager.ts:56`의 `register`가 opener로 `document.activeElement`, 즉 재지정된 shadow host를 기록합니다. `restoreFocus`(`ModalManager.ts:227`부터 233행)는 포커스할 수 없는 host에 `focus()`를 호출합니다.
- 1라운드와의 관계: 1라운드 2번 항목과 같은 `activeElement` 재지정 메커니즘이, 포커스 트랩 바깥의 opener 기록에서도 나타난 경우입니다.
- 재현: `shadowFocus.render.test.tsx`의 "restores focus to the opener inside a shadow root after the modal closes". `shadowRoot.activeElement`가 `null`이고, 기대값은 `#two` 버튼입니다.
- 확신도: 높음.

## 4. 숫자나 배열로 된 `content`가 아무것도 렌더되지 않습니다

- 심각도: 낮음. 오류 없이 내용이 사라집니다. 예를 들어 `alert({ title: 'Count', content: 42 })`가 그렇습니다.
- 영향받는 공개 API: `alert`, `confirm`, `prompt`의 `content`.
- 어긋난 계약: 공개 타입이 `content?: ReactNode | ComponentType<…>`(`core/handle/types/type.ts:58`)이고, `ReactNode`에는 숫자와 배열이 포함됩니다. `README.md:136`은 문자열과 엘리먼트만 언급합니다.
- 원인:
  - `components/Foreground/components/AlertInner.tsx`, `ConfirmInner.tsx:53`부터 64행, `PromptInner.tsx:94`부터 105행이 문자열이 아닌 값을 모두 `renderComponent`에 넘깁니다.
  - `@winglet/react-utils`의 `renderComponent`는 엘리먼트나 컴포넌트가 아닌 값에 `null`을 반환합니다.
  - `0`은 `content &&` 검사를 거쳐 "0"으로 그대로 렌더되므로, 동작도 일관되지 않습니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현: `contentTypes.render.test.tsx`의 "renders numeric ReactNode content (alert)", "renders array ReactNode content (confirm)", "renders numeric ReactNode content (prompt)". 세 테스트 모두 텍스트를 찾지 못합니다. 엘리먼트와 문자열 대조 테스트는 통과합니다.
- 확신도: 높음.

## 5. `<Activity mode="hidden">`이 호출 컴포넌트를 숨기기만 해도 `useModal` 요청이 취소됩니다

- 심각도: 낮음. 계약 충돌에 가깝습니다. 언마운트가 없었는데 `confirm`이 `false`로 끝나고, 다시 보이게 해도 모달은 돌아오지 않습니다. Activity로 이전 경로를 보존하는 라우터에서 일어날 수 있습니다.
- 영향받는 공개 API: `useModal`.
- 어긋난 계약: `README.md:234`는 호출 컴포넌트가 언마운트될 때 대기 중인 요청을 취소하려면 `useModal`을 쓰라고 적고 있습니다. React는 Activity를 숨길 때 언마운트 없이 effect를 정리합니다.
- 원인: `core/handle/hooks/useModal.ts:80`부터 89행의 `useOnUnmount`는 passive effect 정리 함수이므로, Activity를 숨길 때도 실행됩니다.
- 1라운드와의 관계: schema-form 1라운드 2번 항목(Activity가 숨길 때 파일 첨부가 사라지는 문제)과 같은 종류입니다.
- 재현: `activityHidden.render.test.tsx`의 "does not cancel a useModal request when the caller is hidden by Activity without unmounting". 실제 결과는 `false`이고, 기대값은 `undefined`(대기 상태 유지)입니다.
- 확신도: 동작은 높음. 버그로 볼지는 중간입니다. 의도된 동작이라면 README에 Activity 숨김도 취소로 이어진다고 적는 것이 정리 방향입니다.

## 6. 호환되는 패키지 사본 사이에서 소유권이 넘어가면, 공유 스타일시트가 제거되지 않고 남습니다

- 심각도: 낮음. 모든 프로바이더가 언마운트된 뒤에도 스타일시트가 남는 누수이고, 다음 attach 때 시트가 중복됩니다. `@winglet/style-utils`가 사본마다 따로 설치된 다중 번들 환경에서만 일어납니다.
- 영향받는 공개 API: 공유 런타임에서의 `ModalProvider` 마운트와 언마운트.
- 어긋난 계약: `SPECIFICATION.md:257`은 사본들이 스타일 식별자(style identity)와 페이지 효과를 공유한다고 적고 있습니다.
- 원인:
  - `ModalManager.ts:451`부터 455행의 `destroyStyleSheet`는 자기 사본의 `destroyScope(scope)`를 호출합니다.
  - 다른 사본의 `StyleManager` 레지스트리가 만든 시트는 그 레지스트리에서 찾을 수 없으므로 제거되지 않습니다.
  - 흔한 경로는 이렇습니다. A 사본의 소유자가 언마운트되면 A의 코드가 B 대기자를 attach하면서 A의 style-utils로 시트를 만듭니다. 나중에 B가 detach할 때 B의 `destroyScope`로는 그 시트를 지울 수 없습니다.
- 1라운드와의 관계: 새로운 종류입니다. 공유 상태가 사본별 레지스트리의 핸들을 담고 있어서 생기는 문제입니다.
- 재현: `styleCopies.render.test.ts`의 "removes the shared stylesheet when another compatible copy detaches the owner". 스타일시트가 1개 남고, 기대값은 0개입니다. 사본 하나만 쓰는 대조 테스트는 통과합니다.
- 확신도: 중간. `vi.resetModules`로 style-utils 사본을 분리해 다중 번들 상황을 흉내 냈습니다.

## 7. 다른 패키지 사본의 프로바이더가 렌더한 모달 안에서, 두 번째 사본의 hook이 예외를 던집니다

- 심각도: 중간. 1.0.0의 공유 런타임 약속은 주요 변경의 핵심 내용입니다. 기능 번들의 모달 내용이 자기 사본의 `useModalDuration`, `useModalOptions`, `useModalBackdrop`을 호출하면 예외가 나고 내용이 렌더되지 않습니다. 모달 틀 자체는 열립니다.
- 영향받는 공개 API: 사본 사이의 `useModalOptions`, `useModalDuration`, `useModalBackdrop`, `ModalProvider`, `alert`, `confirm`, `prompt`. `ModalManagerContext`나 `UserDefinedContext`를 읽는 hook도 같은 원리이지만 재현하지 않았습니다.
- 어긋난 계약:
  - `.changeset/promise-modal-shared-runtime.md:5`는 호환되는 사본(ESM과 CommonJS 빌드, 두 번들 등)이 하나의 모달 시스템을 공유하고 어느 번들에서든 모달 함수를 호출할 수 있다고 적고 있습니다.
  - `docs/en/SPECIFICATION.md:257`과 `docs/agents/skills/promise-modal-skill/SKILL.md:34`도 같은 내용이며, 어느 문서도 hook에 대한 예외를 적지 않습니다.
- 원인: `providers/ConfigurationContext/ConfigurationContext.ts:27`이 모듈을 평가할 때마다 context를 새로 만들고, `ModalManagerContext.ts:14`와 `UserDefinedContext.ts:9`도 같습니다. `Symbol.for` 레지스트리(`app/helpers/getModalManagerState/getModalManagerState.ts:5`부터 21행)를 거치는 것은 매니저 상태뿐입니다. 그래서 B 사본의 `useContext`가 A 사본의 프로바이더 아래에서 자기 빈 context를 읽고, `useConfigurationContext.ts:11`부터 15행이 "must be used inside a modal frame" 예외를 던집니다.
- 1라운드와의 관계: 새로운 종류입니다(공유 레지스트리 밖에 남은 모듈 식별자). 다른 사본의 `useActiveModalCount`는 공유 상태를 읽으므로 동작합니다. schema-form 2라운드 7번 항목(`registerPlugin`의 이중 패키지 문제)과 같은 종류입니다.
- 재현(`dualPackageHooks.test.tsx`): "content from the CommonJS copy can read its own copy's modal hooks under the ESM provider". 모달 내부 오류 경계가 예외를 잡아 내용이 없습니다. 기대는 내용이 duration과 함께 렌더되는 것입니다.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- 동시 요청 150건을 seed에 따른 순서로 Escape와 버튼 클릭을 섞어 끝내도, 모든 결과가 끝나고 노드가 모두 제거되며 frames, focusTargets, focused, nodeCleanups, inert, 리스너, body overflow에 누수가 없습니다(`manyRequests.render.test.tsx`, 통과). 다만 기본 프레임은 모든 프레임이 `useActiveModalCount`를 구독하므로 렌더 비용이 요청 수의 제곱에 비례합니다. 병적인 수준은 아닙니다.
- `useModalAnimation`에서 열림 애니메이션 도중 닫으면, 대기 중인 `requestAnimationFrame`이 취소되고 `onHidden`이 예약됩니다.
- `useDestroyAfter`는 요청이 끝난 뒤에만 시작되고, 지연 시간이 바뀌면 다시 예약됩니다. 문서에 적힌 동작입니다.
- 옵션 병합 순서는 Provider, `useModal` 설정, 호출 인자 순이고, `closeOnEscape` 결정 순서는 문서와 일치합니다.
- 렌더 중 예외를 던지는 Foreground, Background, Input, Title은 Presenter의 오류 경계가 해당 요청만 reject하고 제거합니다.
- dimmed 모달 위에 쌓인 dimmed가 아닌 토스트는 pointer-events가 올바르게 설정됩니다. 아래 모달의 background만 포인터를 차단합니다.
- prompt의 `disabled`는 확인 버튼에만 적용되며, 문서화된 동작입니다.
- 기본 프레임에 접근 가능한 이름이 없는 것은 문서화된 한계입니다.
- 단일 공유 backdrop 아래에 있는 모달이 어둡게 보이지 않는 것은 설계에 따른 것입니다.
