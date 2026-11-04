# DR-16 / DR-17 독립 구현 검토

판정: **REQUEST_CHANGES — P1 0건, P2 1건, P3 1건**입니다.

검토 기준은 `61457653ae19dfb1f11b97e29355fa3cd6af8f24`와 현재 작업 트리의 차이이며, 미추적 source/test도 포함했습니다. 요청된 brief, Amendments 13/15, 계획, 저장된 검증 증거, 저장소와 패키지 지침을 읽었습니다. 저장소 파일은 수정하지 않았고 테스트·빌드·설치·fetch·commit·push는 실행하지 않았습니다. 아래 재현은 코드 경로를 따른 정적 재현이며 실행한 결과로 제시하지 않습니다.

## F1 — [P2] 새 중첩 검사에서 던진 예외가 capture 밖으로 누출되고 host 전달도 중단됩니다

대상:

- `packages/canard/schema-form/src/providers/FormErrorContext/utils/isReportedFailureBundle.ts:27–33`
- `packages/canard/schema-form/src/providers/FormErrorContext/utils/createFormErrorService.ts:78–83`
- 같은 입력을 처리하는 `packages/canard/schema-form/src/core/engine/write/utils/report/forEachFailureLeaf.ts:10–15,41–44`

Amendment 13은 기준 구현에서 예외가 나지 않던 입력에 대해 capture가 새로 예외를 던지지 않을 것을 요구합니다. 새 구현은 미지의 중첩 SchemaFormError에 대해 `failure.details?.errors`를 읽지만, optional chaining은 getter의 throw를 막지 않습니다. 이 판정은 capture의 try보다 앞에서 실행되므로 getter가 던진 값이 그대로 밖으로 나가고 원래 실패의 onError 기록은 사라집니다. 기준 구현은 같은 중첩 객체가 seen/handlerFailures에 없다는 사실만 확인한 뒤 false를 반환하므로 내부 details를 읽지 않고 outer를 정상 기록합니다.

다음 형태의 입력이면 차이가 발생합니다. 생성자에 전달하는 details는 일반적인 `Record<string, unknown>`이며 getter도 그 형에 들어갑니다.

```ts
const inspectionFailure = new Error('inspection');
const details = {};
Object.defineProperty(details, 'errors', {
  get() { throw inspectionFailure; },
});
const inner = new SchemaFormError(
  FormErrorCode.MultipleErrors, 'inner', details,
);
const H = new Error('handler');
const outer = new SchemaFormError(
  FormErrorCode.MultipleErrors, 'outer', { errors: [inner, H] },
);
const records: unknown[] = [];
const service = createFormErrorService();
service.onError = record => { records.push(record); };
service.capture(outer, 'render', 'stack');
```

기준 코드에서는 records에 `error === outer`인 RENDER_FAILED 기록 하나가 들어갑니다. 현재 코드에서는 inner의 getter가 호출되어 `inspectionFailure`가 capture 밖으로 나가며 records는 비어 있습니다. 입력이 렌더 경계 callback으로 들어오면 오류를 격리해야 하는 보고 경로 자체가 실패하게 됩니다. getter가 있는 nested 배열의 own index나 검사 시 throw하는 Proxy 역시 새로 진입하는 검사 면입니다.

DR-17의 순회에도 같은 빈틈이 있습니다. `forEachFailureLeaf(outer, visit)`는 inner의 shape를 읽다가 중단되므로 inner와 뒤의 H 모두 visit되지 않습니다. 기존 raw host sink는 outer의 내부 details를 읽지 않았습니다. 새 host 경로에서 원래 실패 대신 검사 예외가 빠져나갈 수 있습니다.

수정은 입력 검사에서 발생한 예외를 불투명한 값/unknown 판정으로 처리하는 범위에 한정하시는 것이 좋겠습니다. DR-16은 새 중첩 판정이 실패하면 false로 돌아와 원래 outer를 capture하고, DR-17은 읽을 수 없는 묶음을 원래 identity의 leaf로 전달하도록 하십시오. `visit`나 기존 host sink가 던지는 예외까지 함께 삼키면 Amendment 15의 기존 sink 의미 보존 조건을 바꾸므로 구분해야 합니다. nested `details.errors` getter가 던지는 경우를 두 순회의 회귀 테스트에 추가하면 현재 빠진 조건을 직접 검증할 수 있습니다.

## F2 — [P3] 명시적 validate 전체가 host에 보고하지 않는다는 새 Form 계약 문구가 실제 동작과 다릅니다

대상: `packages/canard/schema-form/src/components/Form/DETAIL.md:10`.

새 문구는 “명시적 submit·validate의 caller는 묶음 하나를 거부 값으로 받으며 host 보고를 추가하지 않는다”라고 적습니다. 그러나 명시적 validate가 발행한 UpdateError 리스너의 오류는 caller에게 거부하지 않고 engine의 ownerless sink로 보냅니다. 이번에 추가한 `src/__tests__/e2e/hostFailureLeaves.render.test.tsx:149–153,182–197`도 바로 그 경로를 실행하여 validate가 resolve된 뒤 host `[A,B]` 또는 `[H,A,B]`를 기대합니다. 구현에서도 `utils/chain/deliverValidationWave.ts:36`이 `flushQueuedEvents(..., false, 'validate')`를 호출합니다.

이 문장은 “caller에게 거부되는 실패의 전달 방식”에 한정하고, validation-result wave의 리스너 실패는 명시적 validate 중에도 ownerless라는 예외를 적어 주십시오. 이는 Amendment 15가 engine sink 추가를 요구한 핵심 사례여서 문서가 두 채널을 혼동하게 해서는 안 됩니다. README/Specification의 같은 설명도 caller-owned rejection에 대한 조건부 설명임을 명확히 하면 좋겠습니다.

## 나머지 검토 결과

- DR-16의 seen/handlerFailures 우선 판정, SchemaFormError instance에만 중첩 진입하는 조건, dense/nonempty/own-index 검사, per-call visited, 재방문 unknown 처리는 요구와 맞습니다. render·submit·load가 공통 capture 판정을 사용합니다. 깊이 50,000 회귀는 base-red로 기록되어 있으며 최종 테스트에 onError 0회 단언이 남아 있습니다.
- DR-17은 별도 frame stack으로 깊이 우선·원소 순서와 identity를 유지하며 root를 visited에 먼저 넣습니다. malformed/revisited 값은 leaf로 남깁니다. source 검색에서 지정된 모든 product host 지점이 새 helper로 연결되고 raw sink는 wrapper 안에서만 소비됨을 확인했습니다. compile-failure slot skip은 non-bundle에만 적용됩니다.
- handler-first인 engine wave/OnChange/load flush와 original-first인 native submit/slot의 기존 호출 순서는 유지됩니다. React/ErrorBoundary 로그는 leaf helper를 거치지 않아 thrown bundle 자체가 남습니다. 새 render 회귀는 A/B 두 write-origin 기록과 boundary outer bundle 1회를 구분합니다.
- 새 write-owned helper는 write → engine → core의 명명 재수출로 provider에 제공되며 provider가 write의 내부 파일을 직접 import하지 않습니다. write DETAIL에 유지 이유가 있습니다. 패키지 src/index에는 helper가 추가되지 않았고 package.json 변경도 없습니다. 저장된 선언 비교는 root 97 exports, 916 reachable signatures의 semantic 차이가 없다고 기록합니다.
- 요구된 native validator/compile/degraded, explicit-submit guard, load, never-prepared reset, validation-wave, automatic OnChange, helper 순서/cycle/malformed/deep, DR-16 nested/unknown/cycle/plain/bare 테스트가 존재합니다. slot guard의 본문은 변경되지 않았습니다. 필수로 이름 붙은 테스트 누락은 찾지 못했으며 F1의 입력 검사 예외에 대한 추가 회귀가 필요합니다.
- 저장된 red/green JSON을 직접 읽어 focused 최종 unit 36, render 30 + 3 skip, react18 33 및 깊이 회귀의 passed를 확인했습니다. mutations.json의 10개 변이에 대해 요구 failed title이 실제 failed case 목록에 포함되고 before/restored hashes가 같은 것도 직접 대조했습니다. 테스트를 다시 실행한 것은 아닙니다.
- ledger 변경은 DR16C-01 1개와 DR17C-01 4개입니다. ERROR-008/019/028 및 EVENT-046에 새 결정을 연결하고 review 원문에 quote 75와 순서·render·malformed-slot 예외를 보존합니다. 저장된 ledger 비교는 26 checks에서 설명되지 않은 증가가 없으며 sup 수만 3640 → 3645라고 기록합니다. FCA 비교도 새 finding/diagnostic을 보고하지 않지만 기존 indeterminate/violation이 남아 있어 전체 FCA 통과로 해석하지 않았습니다.

## 검토 한계와 인계

F1은 정적 코드 경로로 확인했으며 작업 지시에 따라 재현 테스트를 실행하지 않았습니다. 주 작업자가 회귀를 실행하고 수정 여부를 결정해야 합니다. 제공된 reference 구현도 같은 검사 방식을 사용하므로 reference 일치만으로 F1을 배제할 수 없습니다.

확인 시점에 저장된 full gate JSON은 unit 4148 + 1 todo, render 1014 + 7 skip, react18 1012 + 9 skip, storybook 254, production 21을 모두 success로 기록했습니다. verify-unit/verify-render 및 최종 import-model의 완료는 이 검토에서 확인하지 않았습니다. lint/typecheck 로그는 비어 있고 build 로그에는 artifact gate marker가 존재하지만 이 보고서는 전체 실행을 독립 인증하지 않습니다. 남은 gate 완료와 F1/F2 반영 후 재검증은 주 작업자의 책임입니다.
