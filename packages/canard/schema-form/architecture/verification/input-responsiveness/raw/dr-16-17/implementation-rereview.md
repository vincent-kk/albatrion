# DR-16 / DR-17 F1·F2 재검토

판정: **F1 CLOSED / F2 CLOSED — 이번 재검토 범위에서 미해결 finding은 없습니다.**

`implementation-review-brief.md`와 `implementation-review.md`, 원래 brief의 Amendments 13/15, 현재 작업 소스·테스트·문서를 대조했습니다. 코디네이터가 승인한 입력 읽기 보호, 읽을 수 없는 묶음의 불투명 처리, sink 예외 보존, 같은 report organ 안으로의 shape reader 추출을 기준으로 판단했습니다. 저장소 파일을 수정하지 않았으며 테스트·빌드·설치·fetch·commit·push를 실행하지 않았습니다. 이 보고서만 저장소 밖에 작성했습니다.

## F1 — 중첩 검사 예외 누출: 종결

- `src/providers/FormErrorContext/utils/isReportedFailureBundle.ts:16–40`은 배열 판정, length, own index, 원소 읽기, 중첩 인스턴스·code·details/errors 접근을 보호합니다. 검사에서 던지면 false가 되어 capture가 outer 원본을 기록합니다. seen/handlerFailures 우선 처리와 독립적인 iterative traversal은 유지됩니다.
- `src/core/engine/write/utils/report/readFailureBundle.ts:14–32`는 shape와 own 원소의 모든 읽기를 보호합니다. 읽기 실패는 undefined로 반환하며, `forEachFailureLeaf.ts:13–14,25–32`는 그 값을 원래 identity의 leaf로 방문합니다. reader는 같은 report organ의 명명된 내부 파일이고, `forEachFailureLeaf.ts:1`에서 직접 import합니다. 새 reader를 core 또는 패키지 public entry로 재수출하지 않았습니다.
- **방문 전 snapshot**: reader의 `readFailureBundle.ts:24–29`는 모든 own 원소를 임시 배열로 읽은 뒤에만 배열을 반환합니다. 예를 들어 index 0은 A이고 index 1 getter가 던져도 A가 먼저 방문되지 않으며 해당 묶음 하나만 전달됩니다. 중첩 묶음도 같은 규칙을 적용합니다. 이미 전달한 바깥 형제는 유지하고 읽을 수 없는 중첩 묶음만 하나의 leaf로 취급하는 구현입니다.
- **sink 예외 보존**: `visit`은 reader의 try/catch 밖인 `forEachFailureLeaf.ts:14,32`에서 실행됩니다. callback이 던진 값은 traversal이 잡거나 다른 값으로 바꾸지 않습니다. provider의 `reportFailureToHost.ts:8–9`와 engine의 `reportOwnerlessFailure.ts:7–8`도 추가 catch 없이 이 helper를 호출합니다.

회귀 검증의 구체성도 확인했습니다.

- `src/providers/FormErrorContext/__tests__/unreadableCapture.test.ts:7–39`: details/errors/index/length의 4가지 중첩 읽기 실패마다 capture가 던지지 않고 outer identity의 RenderFailed를 정확히 한 번 기록하도록 단언합니다.
- `src/core/engine/write/utils/report/__tests__/unreadableFailure.test.ts:7–49`: 같은 4가지 입력을 최상위와 중첩 양쪽에서 확인합니다. 특히 index 1 getter 실패를 사용하므로 snapshot 없이 index 0을 부분 전달하는 구현도 검출하며, direct `[failure]`와 nested `[A,failure,H]`의 길이·순서·identity를 확인합니다.
- 같은 파일 `:51–67`: non-bundle 및 bundle 양쪽에서 sink가 던진 오류의 전파를 확인합니다. 원래 객체를 그대로 던진다는 판단은 앞서 명시한 source의 catch 경계로도 확인했습니다.
- `src/providers/FormErrorContext/__tests__/nestedCapture.test.ts:50–69`와 `helpers/createCyclicCaptureFailure.ts:17–23`: 정상 capture 결과 외에 읽기 횟수가 128 미만임을 단언합니다. visited 제거 시 129번째 읽기의 fuse 예외가 새 입력 catch에 잡혀 false로 바뀌더라도, 읽기 횟수 단언이 실패하므로 회귀가 가려지지 않습니다. 바깥·안쪽 cycle을 각각 검증합니다.
- `nestedCapture.test.ts:106–112`의 깊이 50,000 회귀에는 `not.toThrow()`와 최종 onError 0회 조건이 그대로 남아 있습니다.

`src/core/engine/write/DETAIL.md:108`과 `src/providers/FormErrorContext/DETAIL.md:25`도 읽기 실패의 처리, 방문 전 snapshot, 호출별 임시 메모리, visit/sink 예외 비포획을 현재 구현에 맞게 설명합니다.

capture의 top-level duck-typed `domain.details?.errors` 읽기 자체는 `createFormErrorService.ts:78–80`에 남아 있습니다. 기준 커밋의 같은 코드도 그 읽기를 수행했으며 이번 수정은 새로 추가한 중첩 검사 면의 예외 누출을 닫습니다. 이를 모든 임의 top-level getter 입력에 대한 무조건적인 비예외 보장으로 확대 해석하지 않았습니다.

## F2 — caller rejection 문구의 범위: 종결

`src/components/Form/DETAIL.md:10`은 이제 **caller에게 거부하는 submit·validate 실패**의 묶음만 거부 값 하나로 유지하고 그 거부를 host에 추가 보고하지 않는다고 한정합니다. 이어 명시적 validate 중에도 검증 결과 파동의 리스너 실패는 caller가 없는 별도 통로로 host에 전달되며 validate 자체는 resolve할 수 있음을 명시합니다.

같은 조건부 설명과 예외가 다음 사용자 문서에도 반영되어 있습니다.

- `README.md:972`, `README-ko_kr.md:957`
- `docs/en/SPECIFICATION.md:952`, `docs/ko/SPECIFICATION.md:950`
- `docs/QUICK_REFERENCE.md:599`
- `docs/agents/skills/schema-form-skill/knowledge/troubleshooting.md:87`
- `docs/agents/skills/schema-form-skill/knowledge/validation-and-state.md:95`

이 설명은 `src/core/engine/write/utils/chain/deliverValidationWave.ts:36`의 `flushQueuedEvents(..., false, 'validate')` 및 `src/__tests__/e2e/hostFailureLeaves.render.test.tsx:182–197`의 validate resolve 후 host `[A,B]` / `[H,A,B]` identity·순서 단언과 일치합니다.

## 저장된 증거와 한계

기존 파일을 읽어 다음을 직접 확인했습니다. 테스트를 다시 실행한 결과는 아닙니다.

- `review-red.json`: 총 10개 중 읽기 실패 회귀 8개 failed, 기존 sink 전파 guard 2개 passed.
- `review-green.json`: 총 25개 모두 passed. 여기에는 추가한 10개 전체와 강화된 cycle 2개, 깊이 50,000을 포함한 nested capture 15개가 들어 있습니다.

위 결과는 F1 회귀의 red/green과 검토 대상 테스트의 존재·단언을 뒷받침합니다. 이번 재검토는 F1/F2 종결 및 요청된 snapshot/sink/cycle/document 조건에 한정되며 전체 gate, mutation 재실행, build/artifact, FCA·ledger 최신화의 완료를 독립 인증하지 않습니다. 그 최종 실행과 증거 갱신은 주 작업자가 계속 담당합니다.
