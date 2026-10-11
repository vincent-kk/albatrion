# React 층 갱신 몫의 진단

대상은 커밋 `3a637c4cd`의 사본이며, React 19.2.6 profiling 빌드와 jsdom에서 쟀습니다. 진단은 읽기 전용 Opus debugger가 했고, 저장소는 바꾸지 않았습니다. 측정은 계수 2회와 시간 표본 11회입니다. 계측 하네스와 원자료는 세션 scratchpad에 있습니다(`diag.mjs`, `cmp.mjs`, `summ.mjs`, `prof.mjs`, `diag-out/`).

## 결론

**쓰기당 React 층 증가분의 대부분은 React 작업이 늘어서가 아니라, 측정 루프가 만든 겹침 효과입니다.** 해당 행은 array-push 두 행, flat, nested, computed입니다.

- 측정 루프는 `flushSync(apply)` 뒤에 `drainTicks(2)`를 부르고([measure-react.mjs:202-205](profile-114-g26/measure-react.mjs)), `drainTicks`는 `setTimeout(tick, 0)`을 두 번 겁니다.
- 옛 엔진은 이벤트를 microtask로 모으고, Refresh를 `useVersion`의 setState로 처리합니다. 그래서 커밋이 둘로 갈라지고, 그중 하나 또는 둘이 `flushSync`가 끝난 뒤에 돕니다. 그 일은 타이머의 최소 대기(약 1 ms) 안에 숨어서 wall에 잡히지 않습니다.
- 새 엔진은 정착을 쓰기 안에서 동기로 끝내고, Refresh 번호도 useSyncExternalStore로 읽습니다(REACT-024). 그래서 모든 변경이 SyncLane 한 번에 모여 `flushSync` 안에서 커밋 1회로 끝나고, 그 일이 wall에 그대로 더해집니다. 렌더가 늘고 커밋이 반으로 준 까닭도 이것입니다.

실제로 늘어난 작업은 마운트 때 필드마다 생기는 fiber 계층(필드당 +5)이며, 주로 array-replace-200에서 드러납니다.

## 근거

| fixture | G26 React 층 Δ | 그대로 잰 wall Δ | 타이머 하한 없는 wall Δ | CPU 활성 시간 Δ | 쓰기당 커밋(flushSync 안) |
| --- | --- | --- | --- | --- | --- |
| array-push-100 | +1.40 | +1.49 | +0.23 | +0.40 | 2(0)→1(1) |
| array-push-remove-100 | +1.18 | +1.47 | +0.10 | +0.64 | 2(0)→1(1) |
| flat-50 / 100 / 500 | +0.19 / +0.21 / +0.65 | +0.23 / +0.22 / +0.46 | +0.06 / −0.03 / −0.30 | 0.00 / −0.03 / −0.36 | 2(1)→1(1) |
| nested-d3-f4 / d5-f4 | +0.23 / +0.22 | +0.27 / +0.43 | +0.09 / +0.05 | 0.00 / +0.35(잡음으로 봄) | 2(1)→1(1) |
| array-replace-200 | +6.2 | +12.5 | +9.5 | +11.2 | 1(0)→1(1) |
| computed-visible-derived | +0.35 | +0.68 | +0.11 | −0.12 | 2.33(1)→1(1) |
| sample-0 / 1 / 2 / 3 | 약 0 | +0.06 / +0.10 / −0.06 / +0.12 | −0.03 / +0.05 / +0.12 / +0.03 | ±0.06 | 2(1)→1(1) |

단위는 쓰기당 ms이고, Δ는 새 판에서 옛 판을 뺀 값입니다. "타이머 하한 없는 wall"은 `drainTicks(2)` 대신 `setImmediate`를 네 번 기다린 대조 실험이며, 이때도 두 판의 커밋 수는 그대로였습니다. "CPU 활성 시간"은 계측하지 않은 실행의 event-loop 활성 시간(`performance.eventLoopUtilization().active`)입니다.

모든 행에서 같았던 것은 다음과 같습니다.

- 문맥 값의 변화는 커밋당 최상위 1회뿐이고, 필드 단위 변화는 없습니다.
- memo를 깨는 props 참조 변화는 Button의 onClick(쓰기당 49.5회) 하나이며, 두 판이 같습니다.
- DOM 연산 수와 host 업데이트 수가 같습니다.
- 이미 있는 항목이 다시 렌더되는 횟수가 같습니다(array-push-100의 Button, 쓰기당 51.5회).

fiber 방문은 커밋이 한 번이라 새 판이 절반 수준입니다(flat-50 쓰기당 200→115).

## 원인 순위

1. **측정 겹침 효과.** array-push·push-remove·flat·nested·computed 행 증가분의 약 80–100%, replace-200의 약 25%입니다. 다만 CPU 활성 시간으로 보면 array-push-100 +0.40 ms와 push-remove-100 +0.64 ms는 쓰기당 남습니다. 이 몫은 아래 2번과 코어 몫(쓰기당 약 0.11–0.14 ms)의 합으로 읽히며, 아직 다 가르지 못했습니다.
2. **마운트 때 필드마다 생기는 계층.** replace-200 잔여의 약 75%(React 몫 약 +7.8 ms)와 array-push의 쓰기당 0.1–0.25 ms입니다. 출처는 다음과 같습니다.
   - `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:13-17, 24-25`: 필드마다 Provider, `withErrorBoundary` 래퍼 함수, ErrorBoundary가 붙습니다.
   - `src/components/SchemaNode/SchemaNodeProxy/components/SchemaNodeField.tsx:29`: 따로 나뉜 컴포넌트입니다.
   - `src/helpers/formTypeInputDefinition/utils/withFormTypeInputErrorBoundary.tsx:19-22`: 래퍼 함수, ErrorBoundary, Input의 세 층이며 memo가 아닙니다.
   - `useFormTypeInputControl.ts:40-54, 66-77`: 입력 하나가 노드를 두 번 구독합니다.
   - `useChildNodeComponents.tsx:88-93`: 자식마다 layout effect가 하나 붙습니다.
   - replace-200 프로필에서 늘어난 비유휴 시간 +44 ms 가운데 GC가 +15.4 ms, react-dom이 +8.8 ms입니다.
3. **의존성 배열 없는 layout effect**(`useTerminalChildren.ts:27-35`). 쓰기당 0.005 ms 미만이라 무시할 수 있습니다.

## 고침 명세(결정 대기)

- **F1, 측정 정의.** `measure-react.mjs:204`의 `drainTicks(2)`를 `setImmediate` 네 번 기다림으로 바꿉니다. CPU 활성 시간을 별도 열로 적고, 관측 digest와 커밋 수(옛 2, 새 1)를 단언합니다. G26 갱신 지표의 정의가 바뀌므로 소유자의 결정이 필요합니다. 제품 비용은 0입니다. 커밋을 비동기로 미뤄 지표를 맞추는 고침은 쓰지 않습니다. 그렇게 하면 커밋이 다시 둘로 갈라지고, REACT-024의 동기 진입과 맞지 않습니다.
- **F2a, 입력 경계를 한 층으로.** `withFormTypeInputErrorBoundary`를 함수 하나로 바꿉니다. 이 함수는 `<ErrorBoundary onError={onError}><Component {...rest} key={inputGeneration} /></ErrorBoundary>`를 반환합니다. 입력마다 fiber 1개와 렌더 1회가 줄어듭니다. 경계는 key 바깥에 고정되고 입력만 generation으로 리마운트되므로, EVENT-039·112C-01과 REACT-019·024를 지킵니다. EVENT-040의 Remount는 `SchemaNodeField`의 `<Wrapper key={version}>`가 맡습니다.
- **F2b, 필드 경계를 직접 렌더.** `SchemaNodeProxy`가 `withErrorBoundary` 래퍼 대신 `<ErrorBoundary onError={report}>`를 직접 렌더합니다. 필드마다 fiber 1개가 줄어듭니다.
- **F2a·F2b의 전제.** `@winglet/react-utils`는 ErrorBoundary 클래스를 공개하지 않고(`hoc/index.ts`는 `withErrorBoundary`만 내보냄), 패키지 CLAUDE.md는 사용자 주입 구성 요소를 `withErrorBoundary`로 감싸라고 정합니다. 그래서 winglet의 공개 범위를 넓힐지, schema-form에 내부 클래스를 둘지, 지침을 어떻게 고칠지 결정이 필요합니다. 기대 효과는 추정이며, 필드당 fiber 2개, replace-200 약 −3 ms, array-push 쓰기당 약 −0.03 ms입니다.
- **F2c(선택).** `useTerminalChildren`의 effect가 terminal 전략일 때만 일하게 합니다. 효과가 작아 우선순위가 낮습니다.

## 확인하지 못한 것

- 옛 판의 첫 쓰기가 쓰기당 약 0.27 ms 더 무거운 까닭입니다. 마운트 때 남은 macrotask로 추정합니다. 이 때문에 sample 행에서는 겹침 효과가 가려집니다.
- 옛 판 배열 행의 두 커밋을 각각 어떤 이벤트가 일으켰는지는 추정입니다.
- F2의 절감량은 추정입니다.
- replace-200 프로필의 jsdom +2.4 ms는, DOM 연산 수가 같으므로 잡음일 수 있습니다.
