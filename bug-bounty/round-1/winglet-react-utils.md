# @winglet/react-utils 버그 바운티 결과

확인된 문제는 2건이며, 그중 1건은 문서 불일치입니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/winglet-react-utils/reactUtils.probe.test.tsx`](probes/winglet-react-utils/reactUtils.probe.test.tsx)

## 1. 문서는 `useOnUnmount`가 마운트 시점의 핸들러를 쓴다고 하지만, 실제로는 최신 핸들러를 호출합니다

- 심각도: 낮음. 문서 불일치이며, 소비자를 불필요한 ref 우회 코드로 이끕니다.
- 영향받는 공개 API: `useOnUnmount`, `useOnUnmountLayout`.
- 어긋난 계약:
  - `packages/winglet/react-utils/docs/en/SPECIFICATION.md:442`는 "Captured at mount time (stale closure)"라고 적고 있습니다.
  - `docs/agents/skills/react-utils-skill/knowledge/hooks.md:65`와 같은 스킬의 `SKILL.md:54`도 같은 설명입니다.
- 정리 방향: 코드(`useReference` 사용)와 기존 테스트 "should run the most recently provided handler"가 최신 핸들러 동작을 고정하고 있으므로, 고칠 대상은 문서입니다.
- 재현: 테스트 "useOnUnmount handler is captured at mount, as SPECIFICATION documents". 실제 `[2]`이고, 문서대로라면 `[1]`이어야 합니다.
- 확신도: 높음.

## 2. `useRestProperties`가 키 이름이 바뀌었는데도 이전 객체를 반환합니다

- 심각도: 낮음. 키가 바뀌었지만 값이 모두 `undefined`인 경우 오래된 객체가 반환됩니다. 결과를 펼쳐 전달하면 잘못된 prop 이름이 넘어갑니다.
- 영향받는 공개 API: `useRestProperties` (문서상 "얕은 비교").
- 원인: `packages/winglet/react-utils/src/hooks/useRestProperties.ts:77`이 키 개수와 `props[key] !== previous[key]`만 비교합니다. 그래서 `{ a: 1, c: undefined }` 다음의 `{ a: 1, b: undefined }`를 같다고 보고, 키 `c`를 가진 이전 객체를 반환합니다.
- 재현: 테스트 "useRestProperties does not return a previous object with different keys". 실제 키 `['a', 'c']`, 기대 키 `['a', 'b']`.
- 확신도: 중간. 드문 경우입니다.

## 관련 사항

- `@canard/schema-form`에서 확인된 React 19 `Activity` 첨부 파일 유실 버그는 `useOnUnmount`가 `useEffect` 정리 함수라는 점과 맞물려 있지만, 원인은 schema-form 쪽의 사용 방식입니다. 자세한 내용은 [`canard-schema-form.md`](canard-schema-form.md)에 있습니다.

## 버그가 아니라고 확인한 가설

- `useTimeout`과 `useDebounce`는 언마운트 때 취소됩니다. StrictMode 재마운트는 올바르게 다시 예약합니다. StrictMode에서 leading 호출이 두 번 일어나는 것은 React의 이중 effect 동작입니다.
- `useWindowSize`의 레이아웃 effect 측정과 서버 렌더링 값 `{0, 0}`은 문서와 일치합니다.
- `useLazyConstant`, `useTruthyConstant`, `useSnapshot`(한 번 캡처되는 `omit`은 문서화됨), `useVersion`(안정적인 `update`), `useHandle`은 모두 문서와 일치합니다.
- `Portal`은 StrictMode에서 등록 해제 후 재등록으로 요소를 복원합니다. 앵커와 프로바이더 연결도 올바릅니다.
- 리포터가 있는 `ErrorBoundary`는 잡은 오류마다 `onError`를 한 번 호출하고 `componentStack`을 넘기며, 타입은 `.`과 `./hoc`에서 내보냅니다. `fallback`이 null이면 그대로 존중합니다.
