# @winglet/react-utils 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 5건이며, 그중 2건은 문서 불일치입니다. 1라운드 문서([`../round-1/winglet-react-utils.md`](../round-1/winglet-react-utils.md))의 2건은 고쳐진 것으로 보고 제외했습니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/winglet-react-utils/`](probes/winglet-react-utils/)

- `reactUtils.r2.probe.test.tsx`: 1번부터 4번까지의 재현입니다. `packages/winglet/react-utils/src/__bounty__/r2-periphery/`에 복사한 뒤 `yarn workspace @winglet/react-utils test --run src/__bounty__/r2-periphery/`로 실행합니다. 테스트 6개 중 5개가 실패하고, 통과하는 1개(원시 `createPortal` 대조군)는 대조 테스트입니다.
- `reactPeerFloor.test.ts`: 5번의 재현입니다. `src/__bounty__/r2-release/`에 복사해 실행합니다.

원인 파일 위치: `packages/winglet/react-utils/src/`

## 1. React 19 `<Activity>`가 숨겼다가 다시 보이면, `Portal` 안의 내용이 상태와 순서를 잃습니다

- 심각도: 중간. 예를 들어 모달 안의 폼이 Activity 숨김과 표시 뒤에 초기화됩니다. 원시 `createPortal`은 이렇게 되지 않습니다.
- 영향받는 공개 API: `Portal`, `Portal.with`, `Portal.Anchor`.
- 어긋난 계약:
  - React의 Activity 계약은 숨긴 동안 상태를 보존하는 것이고, 대조 테스트는 원시 `createPortal`이 상태를 유지한다는 것을 보여 줍니다(`c:2`).
  - `docs/agents/skills/react-utils-skill/knowledge/portal-system.md:77`은 포털이 등록 순서대로 렌더된다고 적고 있습니다.
- 원인: `components/Portal/Portal.tsx:115`가 effect 정리 함수에서 등록을 해제하는데, Activity는 숨길 때 이 정리 함수를 실행합니다. 프로바이더(`PortalContextProvider.tsx`)가 Map 항목을 지우면서 포털 하위 트리가 언마운트됩니다. 다시 보일 때 `register`(`Portal.tsx:112`)가 항목을 Map 끝에 다시 넣으므로 순서도 바뀝니다.
- 1라운드와의 관계: schema-form 1라운드 2번 항목(Activity가 숨길 때 effect 정리로 첨부 파일이 사라지는 문제)과 같은 종류입니다.
- 재현:
  - "portal content keeps its state across Activity hide and show (like createPortal does)": 실제 `a:0`, 기대 `a:2`.
  - "a hidden-then-shown Portal keeps its registration order (docs: registration order)": 실제 `['second', 'first']`, 기대 `['first', 'second']`.
- 확신도: 높음.

## 2. `withUploader`가 한 번의 클릭에 조상 요소의 `onClick`을 두 번 실행합니다

- 심각도: 낮음에서 중간. 카드, 행, 메뉴의 클릭 핸들러와 분석 이벤트가 두 번 실행되고, 조상의 토글은 스스로 취소됩니다.
- 영향받는 공개 API: `withUploader`.
- 어긋난 계약: 사용자의 클릭 한 번은 각 조상에 클릭 한 번이어야 한다는 기본 정확성입니다. `components-and-utilities.md`는 "원래 `onClick`이 먼저 실행되고 그다음 대화상자가 열린다"고만 적고, 두 번째 버블링은 언급하지 않습니다.
- 원인: `hoc/withUploader/withUploader.tsx:128`이 `inputRef.current?.click()`을 호출합니다. 숨겨진 `<input type="file">`(134행)이 감싼 컴포넌트와 같은 부모 아래의 React 형제이므로, 이 합성 클릭이 React 트리를 따라 모든 조상에게 다시 버블링됩니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현: "one click on the wrapped component fires an ancestor onClick once". 실제 2회 호출, 기대 1회.
- 확신도: 높음.

## 3. 문서 불일치: 문서는 `isReactComponent`가 `forwardRef` 컴포넌트를 거부한다고 하지만, 코드는 받아들입니다

- 심각도: 낮음.
- 영향받는 공개 API: `isReactComponent`, `remainOnlyReactComponent`, 그리고 문서에서 빠진 `isForwardRefComponent`, `isLazyComponent`.
- 어긋난 계약:
  - `docs/en/SPECIFICATION.md`의 897행과 909행은 `forwardRef`를 감지하지 못해 `false`를 반환한다고 적고 있고, 116행의 내보내기 표에는 `isForwardRefComponent`와 `isLazyComponent`가 없습니다.
  - `docs/agents/.../components-and-utilities.md`의 61행과 80행은 `forwardRef`가 실패하고 걸러진다고 적고, 소비자에게 직접 감지 코드를 쓰라고 안내합니다.
- 정리 방향: `utils/filter/isReactComponent.ts`가 forwardRef와 lazy 검사를 포함하고, `utils/filter/DETAIL.md`의 16행과 36행, 그리고 `__tests__/isReactComponent.exotic.test.tsx`가 이 동작을 고정하고 있으므로 고칠 대상은 문서입니다.
- 1라운드와의 관계: 1라운드 1번(문서 불일치)과 같은 종류입니다.
- 재현: "SPECIFICATION Filter: isReactComponent(forwardRef(...)) is false and remainOnlyReactComponent drops it". 실제 `true`.
- 확신도: 높음.

## 4. 문서 불일치: `portal-system.md`는 새 children 엘리먼트가 새 id로 다시 등록되어 다시 마운트된다고 하지만, 코드는 id와 상태를 유지합니다

- 심각도: 낮음. 이 설명을 믿은 소비자가 불필요한 메모이제이션이나 상태 끌어올리기를 하게 됩니다.
- 어긋난 계약: `docs/agents/skills/react-utils-skill/knowledge/portal-system.md:48`.
- 정리 방향: id는 `useLazyConstant`로 만들어 바뀌지 않고, `Map.set`이 항목을 제자리에서 교체합니다. 기존 `Portal.render.test.tsx`가 이 동작을 고정하고 있으므로 고칠 대상은 문서입니다.
- 관련 사항(재현하지 않음): 같은 문서는 anchor가 렌더를 일으키지 않는 ref라고 적고 있지만, 프로바이더는 `useState`(`setAnchor`)를 씁니다.
- 1라운드와의 관계: 1라운드 1번(문서 불일치)과 같은 종류입니다.
- 재현: "portal-system.md: a fresh children element re-registers and remounts the portalled subtree". 실제 `r:1`이고, 문서대로라면 `r:0`입니다.
- 확신도: 높음.

## 5. peer 범위가 React `>=16 <20`인데, 런타임은 React 16.14 미만에서 동작할 수 없습니다

- 심각도: 낮음. React 16.0부터 16.13까지는 peer 범위를 만족하지만 `react/jsx-runtime`이 없고, 16.8 미만에는 hooks도 없습니다.
- 어긋난 계약: `packages/winglet/react-utils/package.json`의 peer 범위, 그리고 패키지 `CLAUDE.md`의 "React 16-19" 표기.
- 원인: 배포된 `dist` 번들이 `react/jsx-runtime`(예: `dist/hoc/withErrorBoundary/withErrorBoundary.mjs`)과 hooks를 import합니다.
- 1라운드와의 관계: 새로운 종류입니다(배포 산출물 검사에서 발견).
- 재현: `reactPeerFloor.test.ts`. 범위가 허용하는 가장 낮은 버전은 16.0.0이고, 그 버전에 없는 API는 `react/jsx-runtime`, `useState`, `useEffect`, `useRef`, `forwardRef`입니다.
- 확신도: 높음. 다만 React 16이 설치되어 있지 않아 정적 검사로만 확인했습니다.

## 버그가 아니라고 확인한 가설

- 원시 `createPortal`은 Activity에서 상태를 유지합니다(대조 테스트 통과).
- 다음은 문서에 적힌 동작이거나 React effect의 일반적인 의미입니다. `useEffectUntil`은 effect가 성공하면 영구히 멈춥니다. `useDebounce`는 Activity가 다시 보일 때 다시 실행됩니다. `ErrorBoundary`에는 초기화 기능이 없습니다. `renderComponent`는 문자열과 숫자를 `null`로 바꿉니다.
- 코드를 읽어 확인한 결과, `useSnapshotReference`, `useVersion`, `useHandle`, `withErrorBoundaryForwardRef`는 문서와 일치합니다.
- React 19 전용 API는 쓰지 않습니다.
