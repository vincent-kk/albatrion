# IR-9 — onError 발생 기록의 origin

`FormErrorRecord.surface`와 `aggregate`를 제거하고 필수 `origin`으로 발생을 만든 연산을 전달합니다. 콜백은 발생마다 기록 하나를 받으며 현재 오류 목록이나 해결 알림은 관리하지 않습니다. 전달 시점·호출자 throw/프로미스 거부·호스트 싱크·console·중복 제거·재진입 규칙과 실제 throw의 오류 묶음은 유지합니다.

onError is an event channel: it delivers the one record of each occurrence and does not maintain a current error list or report resolution.

`FormErrorRecord.surface` and `aggregate` were removed; `origin` names the operation that produced the record

## 변경과 기준

기준은 `f4018e82b`(#511 IR-8)이며 제품은 `d6ded31b3`입니다. 계약 `81d0249a3`을 제품·시험보다 먼저 커밋했고 기존 원장·ADR·설계·계획의 기준 줄은 모두 원래 순서대로 보존했습니다. quote 50·56–59의 원문과 각 맥락, 설계가 전한 상시 결정 67을 request 기록에 보관했습니다. 현행 스펙은 제자리에서 고쳤고 새 IR-9 설계 보충의 문장에는 현행 원장 ID를 연결했습니다.

시험은 `eda18be3f`에서 먼저 커밋했습니다. 최종 보정 본문 `8cb040a21`에서 제품만 일시적으로 기준 코드로 복원한 뒤 [최종 red](raw/ir-9/red-final-runs.json)를 실행했습니다. 제품 diff 0을 확인했고 291개 중 실패 120·통과 168·기존 skip 3입니다. [원시 JSON gzip](raw/ir-9/red-final-tests.json.gz)과 파일별 SHA256을 보존하며 현재 시험 26개 파일의 해시가 모두 일치합니다. 초기 [red](raw/ir-9/red-runs.json)는 287개 중 실패 117·통과 167·기존 skip 3이며 최종 red와 혼합하지 않습니다.

의존 패키지 dist가 없는 첫 실행과 외부 dist 심볼릭 링크가 다른 React 인스턴스를 읽은 실행은 setup 실패라 red로 세지 않았습니다. 기준과 소스가 같은 기존 로컬 의존 빌드를 이 worktree로 복사하여 설치 없이 준비했습니다. 제품 변경 뒤 전체 사전 회귀의 runtime bundle 부재는 지정 전체 build로 해소했고 capture mock의 필수 origin 기대값도 보정했습니다. 최종 순차 관문은 그 보정 뒤 실행했습니다.

## origin과 최외곽 규칙

| origin | 발생을 소유한 연산 |
| --- | --- |
| `load` | 트리 구성·mount·reset·rebuild·validator 변경과 그 로드 사슬 |
| `write` | 공개 쓰기·배열 동사·상태·batch·맥락·finishInput·외부 errors와 통지 리스너 |
| `validate` | 자동·명시적 전체 스키마 compile/run, 판정 전달과 그 리스너 |
| `submit` | SubmitWhileDegraded와 native submit capture에서 처음 드러난 실패 |
| `render` | RenderFailed 경계, ChildNodeComponentsOnTerminal 같은 렌더 계층 기록 |

사슬을 연 가장 바깥 연산이 origin을 정합니다. 트리 생성 중 만든 기록(블루프린트 진단·DialectMismatch)은 누가 생성을 불렀든 load다; 생성된 트리가 사슬 안에서 낸 기록은 그 사슬을 연 작업의 origin을 따른다. reset의 onChange 안에서 열린 쓰기는 load이며, write의 노드 리스너나 폼 onChange가 부른 reset은 write입니다. 검증 결과 파동에서 리스너가 던지거나 안쪽 쓰기가 실패하면 validate입니다. 로드 뒤 독립 setState는 write이고, 첫 commit의 applyFormErrors는 load, errors prop 변경은 write입니다. submit 안의 dispatchValidate가 이미 보고한 실패는 validate를 유지합니다. 개발 warnDevelopmentIssue의 콘솔 경고는 기록이 아닙니다.

내부 batchFieldNodeLoad는 RootNodeContext가 소비하며 공개 FieldNode.batch는 write를 유지합니다. chainOrigin은 enclosing collector가 없는 opener만 설정하고 adoption으로 옮기며 최외곽 전달 뒤와 지나간 stale runtime에서 지웁니다. standalone flush는 write/validate를 임시 설정하고 finally에서 복원합니다. 버퍼 기록의 원래 root·warning lifetime은 recordScopes로 이름을 바꾸어 공개 origin과 구별했습니다.

## 발생 자리와 전달 매핑

| 자리 | 생성·대기·전달 규칙 |
| --- | --- |
| createFormErrorRecord의 진단 overload 두 가지 | 오류·경고 모두 생성 시 load |
| fieldNodeFactory의 DialectMismatch·blueprint 경고 | direct dialect는 load, 진단 warning도 load로 대기 |
| dispatchMount·dispatchResetForm·dispatchBatch | load opener 또는 기본 write; 중첩은 기존 origin 보존 |
| commitSettlement·selectNodeSchema | pending 기록에 선택 origin을 허용하고 사슬 끝에 확정 |
| finishStaticFirstLoad·readStaticFirstWarning | static-first 경고도 같은 pending→delivery 경로 |
| evaluateGate | 가드 실패 기록은 mount 점검을 포함해 그 mount를 연 사슬의 origin을 쓴다(첫 mount·reset·rebuild는 load, 쓰기 리스너·onChange의 reset은 write) |
| adoptFieldNodeChain | chainOrigin과 pending warning 인계, ResetRebuiltByReference도 해당 사슬에 합류 |
| collectChainRecords | 호출별 merged Set으로 첫 error·details만 병합; record에 bundle 없음 |
| exitFieldNodeChain·finishQueuedErrors | 현재 사슬/flush origin으로 collect와 deliver 호출 |
| deliverChainRecords | 누락 origin을 reporter 호출 전에 채우며 같은 기록 객체를 유지 |
| dispatchValidate·reportValidationFailure·deliverValidationWave | compile/run 및 판정 파동은 validate |
| refuseDetachedWrite·refuseInactiveResolverWrite | 거부된 진입의 명시적 origin |
| capture·각 호출자 | 필수 capture(error, origin, componentStack?, path?); build/flush/reset은 load, boundary는 render, native submit은 submit |
| useTerminalChildren 두 보고 | render |

기록 형과 pending 형은 errors, 런타임 저장소 형은 record, 사슬·병합·전달은 write, 경고 생산은 기존 settle/surface/React 소유 경계를 유지합니다. 기존 발생 순회의 차수는 유지하며 트리 런타임에 선택 origin 한 칸과 수집 호출의 병합 Set을 추가합니다. 노드 고정 필드는 늘리지 않습니다. 브라우저 측정 창과 benchmark는 설계 범위에 따라 실행하지 않았고 실행시간 수치를 새로 주장하지 않습니다.

## 시험의 red와 green

T1은 construction warning, write listener, throwing onChange, explicit compile, load-slot compile, native degraded submit, render boundary를 양쪽 React major에서 관찰합니다. 각 기록에 origin이 있고 surface·aggregate가 없는지 T3 구조 단언을 함께 적용합니다. A1의 reset·rebuild·validator 변경, T2 중첩 load, P3-4의 write listener reset/adoption·validation listener·stale load 뒤 state·최초/prop 외부 errors를 양쪽 major에서 확인합니다. A5는 같은 수집 호출의 첫 오류·details 보존과 다음 수집 호출의 새 병합을 확인합니다.

두 신규 e2e 파일은 각각 7·8 case이고 bundle 시험은 6 case입니다. coverage·skip·todo·fails를 삭제하거나 약화하지 않았습니다. C5의 same-id code 단언 강화와 buffered record fixture의 origin 추가는 baseline에서도 통과하는 보조 검증이며 red 주장에 넣지 않습니다. 이름만 바뀐 시험 파일은 없습니다. 제목을 고친 두 사례도 실제 origin·구조 단언 변경을 포함하며 제목 변경 자체는 red 근거로 세지 않습니다.

[시험별 증거](raw/ir-9/per-test-evidence.json)는 바뀐 파일의 모든 194개 시험 이름에 baseline 상태와 unit/render/react18 green 상태를 연결합니다. [파일별 기존 필드와 새 단언](raw/ir-9/test-mapping.json), [최종 시험 SHA256](raw/ir-9/red-final-runs.json)을 함께 보존합니다.

| 시험 파일 | 이전 → 현재 단언 | baseline 실패/통과/skip | 최종 green |
| --- | --- | --- | --- |
| `__tests__/e2e/onError.chain-origin.render.test.tsx` | 신규 origin·구조 단언 | 16/0/0 | render 8, react18 8 |
| `__tests__/e2e/onError.origins.render.test.tsx` | 신규 origin·구조 단언 | 14/0/0 | render 7, react18 7 |
| `__tests__/e2e/validation-reset-report.test.tsx` | thrown → load | 2/20/0 | render 11, react18 11 |
| `__tests__/e2e/validation.after-paint.render.test.tsx` | sink/rejected → validate | 6/24/0 | render 15, react18 15 |
| `__tests__/e2e/validation.load-slot-failures.render.test.tsx` | sink/rejected → validate | 20/2/0 | render 11, react18 11 |
| `__tests__/e2e/validation.load-slot.render.test.tsx` | sink → validate | 2/20/0 | render 11, react18 11 |
| `__tests__/e2e/validation.mount-always.render.test.tsx` | sink → validate | 2/6/0 | render 4, react18 4 |
| `__tests__/e2e/validation.mount-owed.render.test.tsx` | sink/rejected → validate | 8/6/0 | render 7, react18 7 |
| `__tests__/e2e/validation.reset-failures.render.test.tsx` | sink → validate | 5/4/3 | render 6, react18 3 |
| `__tests__/migration/form-lifecycle.test.tsx` | sink → validate | 2/18/0 | render 10, react18 10 |
| `components/FieldProxy/__tests__/rendererBoundary.test.tsx` | sink → render | 8/6/0 | render 7, react18 7 |
| `core/__tests__/scenarios/array.source-b-structure.spec.ts` | thrown → write | 1/0/0 | unit 1 |
| `core/__tests__/surfaceIndex.test.ts` | 내부 binding 이름에 batchFieldNodeLoad 추가 | 1/0/0 | unit 1 |
| `core/engine/__tests__/validation-guard-integration.test.ts` | sink/thrown → load | 3/3/0 | unit 6 |
| `core/engine/validation/__tests__/validation.compile-failed.test.ts` | rejected → validate | 2/4/0 | unit 6 |
| `core/engine/validation/__tests__/validation.run.test.ts` | sink → validate | 1/7/0 | unit 8 |
| `core/engine/validation/__tests__/validation.same-id.test.ts` | reason 부재 전에 ValidatorCompileFailed code 단언 | 0/7/0 | unit 7 |
| `core/engine/write/__tests__/dispatch.all-failures.test.ts` |  + aggregate → aggregate 부재 | 3/6/0 | unit 9 |
| `core/engine/write/__tests__/dispatch.array-entry.test.ts` | thrown → write | 1/14/0 | unit 15 |
| `core/engine/write/__tests__/dispatch.bundle.test.ts` |  + aggregate → write | 2/4/0 | unit 6 |
| `core/engine/write/__tests__/dispatch.gate-failures.test.ts` | thrown/sink + aggregate → write/load | 6/1/0 | unit 7 |
| `core/engine/write/__tests__/dispatch.report.test.ts` | thrown + aggregate → write | 3/12/0 | unit 15 |
| `core/engine/write/__tests__/dispatch.source-path.test.ts` |  + aggregate → aggregate 부재 | 2/1/0 | unit 3 |
| `core/engine/write/__tests__/dispatch.standalone-errors.test.ts` | thrown/sink → write/validate | 9/1/0 | unit 10 |
| `providers/RootNodeContext/__tests__/bufferedRecords.test.ts` | 명시적 load fixture | 0/1/0 | unit 1 |
| `providers/RootNodeContext/__tests__/constructionErrors.test.ts` | capture(error) → capture(error, 'load') | 1/1/0 | unit 2 |

## 최종 순차 관문

[실행 명령·출력](raw/ir-9/command-gates.json)의 순서는 lint → typecheck → build → unit → render → react18 → verify → storybook → production → import-model이며 모두 exit 0입니다. 각 프로젝트의 JSON reporter 원시를 gzip으로 보존했습니다.

| 관문 | 통과 | 실패 | 기존 skip | 기존 todo |
| --- | --- | --- | --- | --- |
| lint | 경고 0 | 0 | — | — |
| typecheck·build | exit 0, artifact checks 포함 | 0 | — | — |
| unit | 4095 | 0 | 0 | 1 |
| render | 941 | 0 | 2 | 0 |
| react18 | 934 | 0 | 9 | 0 |
| verify | 5080 | 0 | 2 | 1 |
| storybook | 254 | 0 | 0 | 0 |
| production | 21 | 0 | 0 | 0 |
| import-model | 2 | 0 | 0 | 0 |

[공개 선언 diff](raw/ir-9/public-declaration.diff)와 [checker 폐포·선언 트리 비교](raw/ir-9/public-declaration.json)는 모든 공개 export의 속성·시그니처·타입 인자를 깊이 7까지 추적합니다. 공개 심볼 폐포에서 바뀐 것은 FormErrorRecord의 세 칸뿐이며, 내부 선언 파일(runtime·batchFieldNodeLoad·PendingFormErrorRecord·FormErrorService)은 바뀌지만 공개 심볼이 이름으로 닿지 않는다. 전체 emitter 선언 트리의 해시와 변경된 내부 선언 파일 목록을 보존합니다.

| 선언 | 변경 |
| --- | --- |
| FormErrorRecord.aggregate?: SchemaFormError | 제거 |
| FormErrorRecord.surface?: FormErrorSurface | 제거 |
| FormErrorRecord.origin: FormErrorOrigin | 필수로 추가 |
| 내부 별칭 FormErrorSurface | FormErrorOrigin으로 교체되며 공개 record.origin이 이 형을 참조 |
| src/index.ts·package.json | diff 0 |

FormErrorOrigin과 batchFieldNodeLoad는 패키지 root index에서 내보내지 않습니다. [제품 SHA256](raw/ir-9/product-sha256.json)은 d6ded31b3 제품 소스와 일치합니다. [빌드 manifest](raw/ir-9/build-artifacts.json)는 runtime 세 형식·공개 선언·agent hashes의 해시를 보존하며 `c774fe62c`에 소스와 분리 커밋했습니다. dist는 기존 ignore 대상으로 tracked build output 변경은 없으므로 강제 추가하지 않았습니다.

## FCA·원장·경로 감사와 한계

`filid:scan` bootstrap은 adapter 기본 소스 범위 1,773 exact, missing·uncertain·tool-error 0입니다. scan·validate·verification snapshot은 모두 같습니다. [FCA 비교](raw/ir-9/fca-diff.json)는 기준의 finding 201 → 201, 신규·제거 모두 0입니다. canonical failed 12·skipped 1, 기존 indeterminate·unsupported 진단은 통과로 바꾸지 않습니다. full scan·validate·verification과 각 nextAction은 원시에 보존하며 이번 변경과 무관한 기존 문서 문제를 수정하지 않았습니다.

[원장 검사](raw/ir-9/ledger-checks.json)는 verbatim 불일치 0, 보충 인용 3,600 → 3,603·불일치/해석 실패 0, ref 문제 0, 기존 owner inventory 720/720 인용, 17영역 sentence missing·bad classifications 0입니다. 기존 plan-links 1건·doc-coverage 미인용 66개·tokens 잔여 398개는 유지하고 신규 문제는 0입니다. 첫 doc-coverage의 신규 bad ID 3개는 새 IR-9 보충에서 폐기된 ERROR-044를 현행 ERROR-164로 고쳐 해소했습니다. 초기·최종 로그를 둘 다 보존하며 기준 원문은 고치지 않았습니다.

[확장 감사](raw/ir-9/audit.json)는 모든 새 파일·추가 줄과 gzip을 해제한 전체 bytes를 검사합니다. 신규 기계 로컬 경로는 0이고 새 unsafe cast·non-null assertion 및 skip/todo/fails 변경도 0입니다. 기존 error/test 원장의 과거 경로 예시는 기준 줄 보존 요구에 따라 유지하며 신규 추가분과 분리합니다. 원장 도구가 출력한 과거 경로 예시는 raw log에서 portable 표기로 치환했습니다. 이 감사는 기존 원장 파일 전체가 경로 예시를 포함하지 않는다고 주장하지 않습니다.

scratch worktree·branch를 만들지 않아 제거 대상과 잔여 모두 0입니다. 최종 통합과 독립 코드 검토는 coordinator에게 제품 범위·설계 Amendment 1·이 증거와 함께 인계합니다.


## IR-9 round b — 결과 관문 보정

선언 증거는 index 재수출 파일만 비교하던 한계를 고쳐 공개 심볼 폐포와 전체 emitter 선언 트리로 교체했습니다. applyFormErrors의 groups Map 순회는 기존 nodes push와 같은 삽입 순서를 사용하며 nodes 배열과 non-null assertion을 없앤 동작 보존 정리입니다. dispatchResetForm·dispatchValidate의 타입 주위 줄바꿈은 서식만 바뀌었고 createFormErrorRecord의 추가 overload는 명시 origin이 있는 완성 기록과 내부 pending 기록을 형으로 구별합니다.

최초 IR-9의 mount guard는 항상 load라는 설명을 철회합니다. 가드 기록은 mount를 포함해 chainOrigin을 따르며 이 수정으로 개발·운영 모드의 origin 차이를 끝냅니다. 운영 모드는 이미 chainOrigin을 사용했습니다.
