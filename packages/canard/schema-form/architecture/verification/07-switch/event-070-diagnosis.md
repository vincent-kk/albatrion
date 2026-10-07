# EVENT-070 진단 — Refresh가 오류 경계를 재생성하여 순환을 재개합니다

2026-10-07, `stage-07`의 HEAD `2cf20908c`를 대상으로 진단했습니다. 이 문서의 코드 위치는 이 HEAD의 패키지 상대 경로와 줄 번호입니다.

**현재 계약과 시험은 일치합니다. 문제는 렌더 바인딩의 오류 경계 수명입니다.** React의 중첩 갱신 한도는 실제로 예외를 던지지만, 일반 Refresh가 오류 경계까지 재마운트하여 실패 상태를 없애고 이펙트 순환을 재개합니다. 동기 정착·통지가 React의 한도를 우회하는 문제도, core 예산이 먼저 순환을 중단하는 문제도 아닙니다.

저장소에서는 지정 시험 실행과 이 보고서 작성만 수행했습니다. git 쓰기·설치·제품 코드 변경은 하지 않았습니다. 계측과 대조 실험은 `/private/tmp/event-070-diagnosis-20261007/pkg`의 복사본에서 수행했습니다. 모든 실행은 `vitest run`으로 자연 종료했으며, 가장 긴 시험 명령의 실측 시간은 20.932초입니다. 실행기는 420초 제한을 두었지만 제한에 도달하거나 프로세스를 강제 종료한 실행은 없습니다. `npx`에는 환경 변수 `npm_config_offline=true`, `npm_config_yes=false`를 적용했습니다.

## 1. 계약과 게이트

정본 문장은 `architecture/ledger/event.md:1115–1123`에 있습니다.

> core의 예산은 진입 사슬 단위이고(EVENT-008), React 이펙트를 거친 순환은 매번 새 진입이라 core 예산에 넣지 않는다.

> 통과: 두 이펙트 모두에서 React가 순환을 끊는다(throw나 중단).

> 실패(특히 패시브 이펙트 순환이 개발 모드 경고만 내고 계속 도는 경우): core가 진입 간 순환 감지를 더할지 소유자에게 올린다.

> 실패: 이것은 core 예산의 단위를 바꾸는 일이라 편집자가 정하지 않는다.

같은 계약은 `architecture/adr/0008-event-system.md:220–228`, `architecture/adr/0007-settle-cycle.md:427–435`, `architecture/adr/0014-error-policy.md:268–276`에 반복됩니다. `architecture/ledger/react.md:263–266`의 REACT-017 보충과 `architecture/ledger/event.md:1125–1126`은 React 18·19에서 같은 사례를 실행하도록 요구합니다.

`.seiri/tasks/schema-form-switch/gates.md:139–142`의 G22는 전체 `react18` 프로젝트와 두 프로젝트의 EVENT-070 사례가 모두 초록이어야 합니다. 이번 원본 재현은 EVENT-070 네 건이 실패하므로 G22는 충족되지 않습니다. 이번 진단에서 전체 `react18` 시험을 다시 실행하지 않았으므로 다른 사례의 현재 상태를 초록으로 주장하지 않습니다.

## 2. 인용된 설계 스파이크가 증명하는 범위

`architecture/adr/0008-event-system.md:214–216`은 기존 `spikes/events/entry.spike.test.tsx`의 React 19 결과 7/7을 인용합니다. 이 시험은 **이펙트를 거친 한 번의 파생 쓰기**와 **직접 리스너 쓰기**를 비교합니다. 무한 이펙트 순환의 중단을 증명한 시험은 아닙니다.

| 스파이크 | 실제 단언 | 이번 복사본 실행 결과 |
| --- | --- | --- |
| `architecture/spikes/events/entry.spike.test.tsx:119–127` | layout/passive × act/native에서 일관된 최종 상태, 진입·onChange·검증 각각 2회, 첫 방출의 stale 값 | React 19·18 각각 7/7 통과 |
| 같은 파일 `:148–174` | React 이펙트 대신 리스너가 쓰면 진입·onChange 각각 1회, 파동 2회, 최종 DOM 일치 | 위 7건에 포함되어 통과 |
| `architecture/spikes/events/caret.spike.test.tsx:56–347` | 캐럿·IME, 다중 쓰기의 커밋 수, batch, 리스너 되먹임의 최종 상태·tearing 없음. `sync`와 `microtask` 대안을 비교하며 일부 microtask 사례는 의도된 `it.fails`입니다 | 두 판 각각 20/20 통과 |
| `architecture/spikes/events/effect-feedback.spike.test.tsx:18–48` | 두 필드의 상호 쓰기, 200회 워치독 이전에 React 중단, 추가 flush 뒤 쓰기 수 불변, 워치독 오류 없음 | 두 판 layout/passive 모두 실패, 각각 `writes = 201` |

따라서 기존 C-10·캐럿 스파이크 54건은 통과하지만, EVENT-070을 위해 추가한 네 건은 실패합니다. `effect-feedback.spike.test.tsx:11`은 React 자체의 중단을 요구한다고 명시하며, 제품 시험은 그 단언을 이식한 것입니다.

제품 Vite 프로젝트의 포함 글롭은 스파이크를 제외합니다(`vite.config.ts:11–14,53,79`). 스파이크 실행에는 저장소 밖에 만든 설정을 사용하여 동일한 `render`·`react18` 프로젝트, React 18 별칭·CommonJS optimizer 설정을 유지하고 포함 글롭만 스파이크로 바꿨습니다. 실제 판은 React 19.2.6과 18.3.1입니다. 스파이크 파일과 필요한 `work-loop/proto`를 복사했고, 패키지별 AJV 해석과 tsconfig 기반 파일 위치를 명시했습니다. 이 준비 중의 누락 의존 경로로 인한 수집 실패는 위 시험 결과에 포함하지 않았습니다.

## 3. 지정 명령의 관측 결과

패키지 디렉터리에서 다음 명령을 실행했습니다.

```sh
npx vitest run --project render --project react18 --reporter=verbose -t "EVENT-070"
```

종료 코드는 1이며 20.932초에 자연 종료했습니다. 결과는 2파일 실패·146파일 건너뜀, 4사례 실패·894사례 건너뜀입니다. 네 실패 모두 같은 단언입니다.

```text
AssertionError: The watchdog is a failure, not React stopping the cycle:
expected 201 to be less than 200
src/components/Form/__tests__/Form.effectFeedback.test.tsx:48
```

| 프로젝트 / 이펙트 | 원본 시험의 `writes` | 복사본 계측의 `setValue` 호출 / 정상 반환 | React 한도 예외 위치 | 종료 수단 |
| --- | ---: | ---: | --- | --- |
| render / useLayoutEffect | 201 | 199 / 198 | 107번째 효과, `/a` | 워치독 오류를 오류 경계가 포착 |
| render / useEffect | 201 | 199 / 198 | 107번째 효과, `/a` | 동일 |
| react18 / useLayoutEffect | 201 | 199 / 198 | 107번째 효과, `/a` | 동일 |
| react18 / useEffect | 201 | 199 / 198 | 107번째 효과, `/a` | 동일 |

`writes`는 효과 진입 수입니다(`Form.effectFeedback.test.tsx:16`). 200·201번째 효과는 `:18`에서 워치독을 던져 `:19`의 쓰기 호출까지 가지 않으므로 실제 `setValue` 호출 수와 다릅니다. 107번째 호출은 값 정착 뒤 통지 중 발생한 React 예외를 사슬 끝에서 다시 던지므로 정상 반환 수가 한 번 적습니다.

시험 실행 자체가 무한히 멈추거나 Vitest timeout에 걸리지는 않습니다. 순환은 시험의 워치독까지 계속되고 워치독으로 중단됩니다. 복사본에서는 `renderForm`이 네 경우 모두 핸들을 반환했고, 추가 flush 뒤 쓰기 수 불변 단언(`:42`)도 통과했습니다. 이후 첫 실패가 `:48`입니다. 다음 줄의 워치독 기록 부재 단언(`:49`)도 실제 관측 기록과 맞지 않지만, 앞 단언이 던져 실행되지 않습니다.

오류가 조용히 사라진 것도 아닙니다. `setValue` 밖에서 `Maximum update depth exceeded`를 포착하고 다시 던지는 계측으로 전파를 확인했으며, `onError` 기록과 오류 싱크에 React 한도 오류와 워치독 오류가 남았습니다. React 18에서는 패시브 깊이 경고도 기록되었습니다. `src/__tests__/helpers/observeErrorSink.ts:12–22`가 호스트 오류와 `console.error`를 수집하므로 원본 CLI 로그에 이 오류 문자열이 직접 나오지 않습니다. CLI에 문자열이 없다는 사실은 React 한도가 발화하지 않았다는 증거가 아닙니다.

## 4. 원인 경로와 파일·줄 증거

1. **일반 caller 쓰기가 대상 입력의 Refresh를 만듭니다.** `src/core/dispatch/utils/entry/dispatchSetValue.ts:23,36,42`는 진입 → 동기 쓰기 → 사슬 종료를 수행합니다. `src/core/settle/utils/commit/commitSettlement.ts:62–66`은 원본이 변한 비입력 출처 경로를 Refresh 대상으로 모으고, `src/core/settle/utils/commit/markCommitDeliveries.ts:199–202`는 `RequestRefresh`를 표시합니다. 시험의 쓰기는 입력 바인딩 출처가 없는 `node.setValue`이므로 이 경로를 탑니다.
2. **통지는 같은 호출 스택에서 React를 갱신합니다.** `src/core/dispatch/utils/chain/exitSchemaNodeChain.ts:35` → `runDeliveryWaves.ts:14–23` → `deliverWave.ts:41` → `src/hooks/useSchemaNodeTracker.ts:44–45`의 `onStoreChange()`입니다. 마지막 훅은 `:54`에서 `useSyncExternalStore`를 사용합니다. 여기에 마이크로태스크·타이머로 리스너를 예약하는 단계는 없습니다.
3. **React 한도 예외는 보존되어 다시 던져집니다.** `deliverWave.ts:42`가 각 리스너 오류를 `captureChainError.ts:12–14`에 모읍니다. `exitSchemaNodeChain.ts:125–134`는 보고 뒤 최종 예외를 던집니다. 계측 스택은 React `forceStoreRerender` → `useSchemaNodeTracker.ts:45` → `deliverWave.ts:41` → `exitSchemaNodeChain` → `dispatchSetValue`입니다. 이 과정은 나머지 리스너 전달을 허용하지만 React 예외를 영구히 삼키지는 않습니다.
4. **Refresh key가 오류 경계까지 새로 만듭니다.** `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:23–28`은 인라인 입력을 `withErrorBoundary`로 감싼 컴포넌트로 만듭니다. `hooks/useFormTypeInputControl.ts:36,44–54`는 Refresh 개정 번호를 `generation`으로 읽습니다. `SchemaNodeInput.tsx:39,128–141`은 그 **이미 감싸진 컴포넌트 전체**에 `key={generation}`을 줍니다. 따라서 대상 원본 값이 다시 변하면 사용자 입력뿐 아니라 그 안의 ErrorBoundary도 교체됩니다.
5. **포착했던 실패 상태가 사라져 순환이 되살아납니다.** `packages/winglet/react-utils/src/hoc/withErrorBoundary/withErrorBoundary.tsx:73–78`의 실제 트리는 HOC → ErrorBoundary → 사용자 컴포넌트입니다. 그 패키지의 `components/ErrorBoundary.tsx:38–43`은 새 인스턴스를 `hasError: false`로 시작하고, `:51–55`에서 실패 상태를 설정하며, `:70–73`에서 fallback을 그립니다. peer 필드가 다시 쓰면 Refresh가 새 경계를 생성하여 이 상태를 초기화합니다. 계측에서는 107번째 React 예외 이후에도 109번째 `/a` 효과와 이후 교대 쓰기가 재개되었고, 총 사용자 입력 마운트 수가 201회였습니다.
6. **core의 25파동 한도는 이 순환의 중단 수단이 아닙니다.** `enterSchemaNodeChain.ts:17–27`은 새 진입에서 예산을 0으로 시작하고, `exitSchemaNodeChain.ts:79,115–117`은 깊이와 예산을 초기화합니다. `refuseListenerFeedback.ts:13–14`는 활성 사슬의 리스너 쓰기만 제한합니다. 각 효과 진입 시 실측 값은 `entryDepth=0`, `feedbackBudget=0`, `currentListener=false`였습니다. `FEEDBACK_LIMIT_EXCEEDED`가 이 사례를 끊은 것이 아니며, 이 제외 자체는 EVENT-070의 현행 규칙과 일치합니다.

React 설치본에서도 한도 동작을 확인했습니다. React 19.2.6은 `node_modules/react-dom/cjs/react-dom-client.development.js:4620–4633`, React 18.3.1은 `node_modules/react-dom18/cjs/react-dom.development.js:27327–27339`에서 일반 중첩 한도 초과를 throw하고 패시브 한도 초과는 콘솔 경고로 처리합니다. 이 사례는 외부 스토어의 동기 갱신을 통해 두 이펙트 모두 실제 throw 경로에 도달했습니다.

## 5. 원인을 반증할 수 있는 대조 실험

모든 변경은 복사본에만 적용했습니다. 엔진의 정착·배달·예산 코드는 변경하지 않았습니다.

| 조건 | 결과 | 효과 진입 / 입력 마운트 수 | 해석 |
| --- | --- | --- | --- |
| 원본 동작에 계측만 추가 | 네 건 실패 | 각각 201 / 201 | React 한도는 107번째에서 실제 발화하지만 순환이 재개됩니다 |
| `renderForm`을 동기 `act` 마운트로 전환 | 네 건 실패 | 각각 201 | 비동기 `act`만의 인공적인 실패가 아닙니다 |
| `SchemaNodeInput.tsx:141`의 key를 고정 | 네 건 통과 | 각각 109 / 2 | 경계 재생성이 원인임을 좁히지만, 정상 입력의 Refresh 재마운트도 없애므로 제품 수정안으로 사용할 수 없습니다 |
| HOC·오류 경계의 key를 고정하고, 그 안의 **사용자 입력**만 Refresh 번호로 key 변경 | 네 건 통과 | 각각 109 / 109 | 입력 재마운트를 유지하면서 경계의 실패 상태를 유지하면 React가 순환을 끊습니다 |
| 위 경계 수명 분리 + 원래 제품 시험과 스파이크 시험의 바이트·단언 복원 | 4파일·8건 통과, 종료 0 | 계측 제거 | 원래 기대값을 완화하지 않고 두 판·두 효과에서 통과했습니다 |

경계 수명 분리 실험은 인라인 입력 경로만 바꾼 원인 검증입니다. 조합 중 generation 보류·컨테이너 입력·모든 입력 공급 경로에 적용한 제품 구현은 아닙니다. 실험에서는 raw 입력의 key를 노드 Refresh 개정으로 직접 읽었으나, 제품 수정은 반드시 `useFormTypeInputControl`이 산출한 적용 `generation`을 사용해야 합니다.

주요 실행의 실제 경과 시간은 원본 20.932초, 추가 EVENT-070 스파이크 4.604초, 계측 4.492초, 동기 act 대조 4.510초, key 고정 4.414초, 경계 수명 분리 4.399초, 전체 스파이크 4.701초, 원래 단언 8건 재검증 4.651초입니다. 로그는 scratch 루트의 `baseline.log`, `spike-ready.log`, `instrumented-ready.log`, `synchronous-act.log`, `stable-key.log`, `persistent-boundary.log`, `all-spikes-ready.log`, `original-assertions-persistent.log`에 있습니다. 마운트 계측의 세부 기록은 `instrumented-mounts.log`입니다.

## 6. 어느 쪽이 잘못되었는지

현행 계약의 “**두 이펙트 모두에서 React가 순환을 끊는다(throw나 중단)**”는 문장에 대해 시험은 순환이 실제로 멈추는지 확인합니다. 단순히 React 오류 문자열이 한 번 기록되었다는 사실만으로 이 문장을 충족하지는 않습니다. 따라서 시험의 `< 200`·추가 flush·워치독 부재 단언은 타당합니다.

관측한 결함은 React가 중단한 입력을 자동 Refresh로 재생성하는 **제품 렌더 바인딩 구현**에 있습니다. React 예외를 삼켰다고 판단하여 리스너 예외 격리를 제거하거나, React가 순환을 보지 못한다고 판단하여 동기 정착 설계를 바꿀 근거는 없습니다. 경계 수명만 분리한 실험에서 기존 단언이 모두 통과하므로, 이 사례만으로 “React가 막지 못하니 core의 진입 간 예산이 필수”라고 결론낼 수도 없습니다.

`architecture/plan/07-switch/log.md:17`에는 “81라운드 3번”의 개발 모드 경고와 시험 통과 조건 변경이라는 작업 메모가 있습니다. 그러나 이 HEAD의 EVENT-070 원장·채택 ADR은 위 중단 계약을 유지합니다. 작업 메모를 현재 계약 변경의 근거로 삼아 경고만으로 초록을 만들면 안 됩니다. 원장 관리자가 그 처분의 정본과 현행 계약을 먼저 정합화해야 합니다.

## 7. 작업자용 수정 명세와 선행 원장 물음

**권장 방향은 오류 경계의 수명과 raw 입력의 Refresh 수명을 분리하는 것입니다.** 공개 API 시그니처, 동기 정착·통지, 진입 사슬 정의, 25파동 예산은 그대로 유지하는 방향입니다. 다만 일반 Refresh가 실패한 필드를 복구하던 관측 가능한 동작이 달라지고, EVENT-070 자체가 실패의 소유자 인계를 요구하므로 **제품 수정 전에 원장 물음을 먼저 보내야 합니다.**

원장 물음에는 다음 결정을 요청합니다.

> EVENT-070의 React 중단 계약을 유지하기 위해 자동·일반 Refresh에서는 필드 오류 경계의 실패 상태를 유지하고 raw 입력만 generation으로 재마운트해도 되는가? 필드의 명시적 reset·remount 및 `<Form key>` 중 어느 동작이 경계 실패 상태를 해제해야 하는가? `log.md:17`의 경고 전용 처분을 채택한다면 EVENT-070·채택 ADR·G22 통과 조건을 먼저 변경해야 하는가?

답이 경계 수명 분리를 허용하면 작업자는 다음 범위를 구현합니다.

| 파일 / 소유 영역 | 적용할 변경 |
| --- | --- |
| `src/components/SchemaNode/SchemaNodeInput/DETAIL.md` 및 입력 정규화 소유 문서 | 코드보다 먼저, 일반 Refresh의 raw 입력 교체와 오류 경계 실패 상태 유지, 승인된 복구 동작을 기록합니다 |
| `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx` | 바깥의 보호된 입력 컴포넌트 전체에 generation key를 주지 않습니다. 적용 generation을 사설 어댑터에 전달하여 그 안의 raw 입력에만 key를 줍니다. defaultValue·늦은 콜백 차단·IME 보류·컨테이너 판정은 유지합니다 |
| `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts` | 인라인 컴포넌트를 선택하는 기존 자리에서 안정된 오류 경계와 그 안의 generation별 입력을 조합합니다. 렌더마다 새 HOC를 만들지 않습니다 |
| `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInputWrapper.tsx` | preferred/override 입력에도 같은 수명 분리를 적용하고 memo 판정과 보고기 훅을 유지합니다 |
| `src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts`, `formTypeInputMap.ts` 및 이 모듈의 사설 어댑터·타입·진입점 | 정의·맵·플러그인 입력의 기존 감싸기 자리에서도 같은 정책을 사용합니다. generation 전달은 내부 형으로 한정하고 raw 입력으로 전달하기 전에 제거합니다. 공개 `FormTypeInputProps`·정의 타입·패키지 수출을 확장하지 않습니다 |
| `src/components/Form/__tests__/Form.effectFeedback.test.tsx`, `architecture/spikes/events/effect-feedback.spike.test.tsx` | 현재 EVENT-070 단언과 200회 워치독을 유지합니다. 인라인 외 정의·맵·override 경로와 승인된 경계 복구 동작의 검증은 각각 해당 소유 테스트에 추가합니다 |

범용 `@winglet/react-utils` HOC의 공개 API 변경 없이 schema-form의 사설 어댑터로 해결하는 방향을 우선합니다. 기존 모듈 수준·FormProvider·폼별 감싸기 자리와 문맥 보고기 읽기 요구는 `architecture/ledger/error.md:1831–1833`의 ERROR-117·68C-08을 유지해야 합니다.

단순히 key를 없애는 수정은 `architecture/ledger/react.md:364`의 REACT-024와 `architecture/ledger/event.md:613`의 EVENT-039가 요구한 **입력 재마운트**를 깨뜨립니다. 경고만 출력하거나 시험을 skip·제외·완화하는 수정, core 예산을 효과 진입 사이에 누적하는 수정, 통지를 비동기로 바꾸는 수정도 이 진단의 권장안이 아닙니다. 그런 설계·통과 조건 변경을 선택하면 해당 원장 물음과 계약 변경이 반드시 선행해야 합니다.

작업자의 완료 검증은 G22 CHECK의 전체 `react18` 실행과 두 판 EVENT-070 실행, 추가 EVENT-070 스파이크의 두 판 실행입니다. 함께 확인할 회귀는 입력 Refresh 재마운트·defaultValue, 늦은 onChange/onFileAttach, IME 조합 보류, 컨테이너 입력 보존, 오류 기록의 한 번 전달, 승인된 reset/remount 복구입니다. 본 진단의 복사본 통과를 저장소 수정 완료나 G22 완료로 기록하지 않습니다.
