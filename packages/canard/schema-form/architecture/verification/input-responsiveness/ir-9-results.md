# IR-9 — onError 발생 기록의 origin

`FormErrorRecord.surface`와 `aggregate`를 제거하고 필수 `origin`으로 발생을 만든 연산을 전달합니다. 콜백은 발생마다 기록 하나를 받으며 현재 오류 목록이나 해결 알림은 관리하지 않습니다. 전달 시점·호출자 throw/프로미스 거부·호스트 싱크·console·중복 제거·재진입 규칙과 실제 throw의 오류 묶음은 유지합니다.

onError is an event channel: it delivers the one record of each occurrence and does not maintain a current error list or report resolution.

`FormErrorRecord.surface` and `aggregate` were removed; `origin` names the operation that produced the record

## 변경과 기준

기준은 `f4018e82b`(#511 IR-8)이며 최초 IR-9 제품은 `d6ded31b3`입니다. round b 제품과 최종 관문은 아래에 별도로 기록합니다. 계약 `81d0249a3`을 제품·시험보다 먼저 커밋했고 최초 IR-9에서는 기존 원장·ADR·설계·계획의 기준 줄을 원래 순서대로 보존했습니다. round c에서 승인한 보충 14줄의 배치 교정은 아래에 별도로 기록합니다. quote 50·56–59의 원문과 각 맥락, 설계가 전한 상시 결정 67을 request 기록에 보관했습니다. 현행 스펙은 제자리에서 고쳤고 새 IR-9 설계 보충의 문장에는 현행 원장 ID를 연결했습니다.

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

최초 IR-9 당시 두 신규 e2e 파일은 각각 7·8 case였고 bundle 시험은 6 case입니다. round b의 최종 수와 추가 skip은 아래에 따로 기록합니다. coverage·skip·todo·fails를 삭제하거나 약화하지 않았습니다. C5의 same-id code 단언 강화와 buffered record fixture의 origin 추가는 baseline에서도 통과하는 보조 검증이며 red 주장에 넣지 않습니다. 이름만 바뀐 시험 파일은 없습니다. 제목을 고친 두 사례도 실제 origin·구조 단언 변경을 포함하며 제목 변경 자체는 red 근거로 세지 않습니다.

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

## 최초 IR-9 순차 관문(보정 전)

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

FormErrorOrigin과 batchFieldNodeLoad는 패키지 root index에서 내보내지 않습니다. [최초 제품 SHA256](raw/ir-9/product-sha256.json)은 d6ded31b3 시점의 제품 소스와 일치합니다. round b의 한 줄 수정과 빌드 증거는 아래에 따로 기록합니다. [빌드 manifest](raw/ir-9/build-artifacts.json)는 runtime 세 형식·공개 선언·agent hashes의 해시를 보존하며 `c774fe62c`에 소스와 분리 커밋했습니다. dist는 기존 ignore 대상으로 tracked build output 변경은 없으므로 강제 추가하지 않았습니다.

## 최초 IR-9 FCA·원장·경로 감사와 한계

`filid:scan` bootstrap은 adapter 기본 소스 범위 1,773 exact, missing·uncertain·tool-error 0입니다. scan·validate·verification snapshot은 모두 같습니다. [FCA 비교](raw/ir-9/fca-diff.json)는 기준의 finding 201 → 201, 신규·제거 모두 0입니다. canonical failed 12·skipped 1, 기존 indeterminate·unsupported 진단은 통과로 바꾸지 않습니다. full scan·validate·verification과 각 nextAction은 원시에 보존하며 이번 변경과 무관한 기존 문서 문제를 수정하지 않았습니다.

[원장 검사](raw/ir-9/ledger-checks.json)는 verbatim 불일치 0, 보충 인용 3,600 → 3,603·불일치/해석 실패 0, ref 문제 0, 기존 owner inventory 720/720 인용, 17영역 sentence missing·bad classifications 0입니다. 기존 plan-links 1건·doc-coverage 미인용 66개·tokens 잔여 398개는 유지하고 신규 문제는 0입니다. 첫 doc-coverage의 신규 bad ID 3개는 새 IR-9 보충에서 폐기된 ERROR-044를 현행 ERROR-164로 고쳐 해소했습니다. 초기·최종 로그를 둘 다 보존하며 기준 원문은 고치지 않았습니다.

[확장 감사](raw/ir-9/audit.json)는 모든 새 파일·추가 줄과 gzip을 해제한 전체 bytes를 검사합니다. 신규 기계 로컬 경로는 0이고 새 unsafe cast·non-null assertion 및 skip/todo/fails 변경도 0입니다. 기존 error/test 원장의 과거 경로 예시는 기준 줄 보존 요구에 따라 유지하며 신규 추가분과 분리합니다. 원장 도구가 출력한 과거 경로 예시는 raw log에서 portable 표기로 치환했습니다. 이 감사는 기존 원장 파일 전체가 경로 예시를 포함하지 않는다고 주장하지 않습니다.

scratch worktree·branch를 만들지 않아 제거 대상과 잔여 모두 0입니다. 최종 통합과 독립 코드 검토는 coordinator에게 제품 범위·설계 Amendment 1·이 증거와 함께 인계합니다.


## IR-9 round b — 결과 관문 보정

선언 증거는 index 재수출 파일만 비교하던 한계를 고쳐 공개 심볼 폐포와 전체 emitter 선언 트리로 교체했습니다. applyFormErrors의 groups Map 순회는 기존 nodes push와 같은 삽입 순서를 사용하며 nodes 배열과 non-null assertion을 없앤 동작 보존 정리입니다. dispatchResetForm·dispatchValidate의 타입 주위 줄바꿈은 서식만 바뀌었고 createFormErrorRecord의 추가 overload는 명시 origin이 있는 완성 기록과 내부 pending 기록을 형으로 구별합니다.

최초 IR-9의 mount guard는 항상 load라는 설명을 철회합니다. 가드 기록은 mount를 포함해 chainOrigin을 따르며 이 수정으로 개발·운영 모드의 origin 차이를 끝냅니다. 운영 모드는 이미 chainOrigin을 사용했습니다.


### 공개 선언과 커밋 이력

[커밋한 walker](raw/ir-9/walkPublicDeclarationClosure.mjs)는 공개 export 97개에서 패키지 선언 속성·시그니처·타입 인자를 깊이 7까지 추적했습니다. 공개 이름·시그니처는 같고 폐포 diff는 aggregate·surface 제거와 필수 origin 추가 세 줄뿐입니다. 전체 emitter 선언은 기준 1,351개, 후보 1,352개이며 SHA256은 각각 `3056c06cb23d58e6dc9f6879688ded32dcfab2fef88933406f5ad54f4a02baae`, `ef7a56281d0961953330cd6bb36d805ae3d9e3f744b2ddf3df73cf263e86eeeb`입니다. 바뀐 선언 21개(공개 record 운반 파일 2개·내부 선언 19개)와 공개 이름으로 도달하지 않는 내부 이름 넷은 [메타데이터](raw/ir-9/public-declaration.json)에 보존했습니다. index.d.ts만 비교한 이전의 빈 diff는 이 증거를 대신하지 못합니다.

처음 저장한 폐포 gzip 두 개에 checker가 만든 절대 import 경로가 남아 있었습니다. 승인받은 범위인 `daf4ff55f` 이후의 미공개 6개 커밋을 다시 구성해 생성 단계에서 package/repository 상대 표기로 바꿨습니다. [이력 감사·SHA 매핑](raw/ir-9/round-b/history-audit.json)은 각 커밋의 새 텍스트와 전체 gzip snapshot을 해제 검사해 신규 경로 0을 확인합니다. 기존 gzip 중 내용이 같은 것은 원래 blob을 보존했습니다. 제품·시험 blob도 보존했으며 새 제품 SHA는 `e1079152a`, 원래 시험 SHA는 `7448a4b84`입니다.

### 최종 시험과 변이

두 e2e 파일은 각각 origin 13·chain-origin 11 case이며 신규 core 파일은 6 case입니다. 기록을 비운 뒤 모든 발생의 개수·순서·code·origin을 정확히 단언하고 surface·aggregate 부재를 확인합니다. StrictMode 최초 mount·reset·rebuild는 각각 실제 기록 1개, 중복 0개였습니다. React 18 legacy root의 최초 mount·reset·write 세 경우도 검증하며 React 19에서는 A4에 따라 이 세 경우만 명시적으로 skip합니다.

A1/A6 시험은 리스너가 새 스키마로 reset할 때 blueprint 진단은 load, 그 트리의 GuardFailed는 write임을 같은 배열에서 확인합니다. 사슬 밖 reset의 GuardFailed는 load입니다. T2는 안쪽 리스너의 throw와 안쪽 guard 실패를 각각 관찰하고, guard 실패 뒤 reset이 MultipleErrors를 던지는 것도 확인합니다. 최외곽 정상/throw 종료, adoption 뒤 current/stale runtime, 독립 flush 동안 write 설정과 이후 undefined 복원을 모두 직접 검증하므로 defensive-only로 남긴 절은 없습니다.

첫 전체 unit은 새 legacy helper가 조상 root index를 import하여 import-model U=1 한 건으로 실패했습니다. `4dcf6646f`에서 같은 Form·ValidationMode 선언을 소유 모듈 진입점으로 가져오도록 고쳤고 예외·단언·발생 동작은 바꾸지 않았습니다. [실패 원시](raw/ir-9/round-b/initial-unit-import-failure.json.gz)와 [import-model green](raw/ir-9/round-b/import-helper-green.json.gz)을 보존합니다. 최종 helper 본문으로 제품만 `daf4ff55f`와 동일하게 되돌린 [최종 baseline red](raw/ir-9/round-b/final-baseline-red.json.gz)는 74개 중 통과 69·실패 2·허용 skip 3이며 양쪽 React major의 enclosed mount guard만 실패했습니다. 수정 복원 뒤 [최종 targeted green](raw/ir-9/round-b/final-targeted-green.json.gz)은 통과 71·실패 0·허용 skip 3입니다. [최종 시험 해시와 증거 적용 범위](raw/ir-9/round-b/final-test-proof.json)를 함께 보존합니다.

[변이 실행 표](raw/ir-9/round-b/mutation-runs.json)와 각 patch·원시 gzip은 다음 13종이 모두 실제 실패함을 보입니다. 모든 변이를 복구했고 단언을 담은 시험 파일은 실행 당시와 바이트가 같습니다. helper의 import 경로만 바뀌었으므로 변이 증거는 그 동일한 단언·제품 범위에 재사용하며 최종 baseline/targeted 결과를 별도로 다시 실행했습니다.

| 변이 | 실패 수 | 구별한 절 |
| --- | ---: | --- |
| reset-opener-write | 1 | core-only reload의 throwing onChange는 load |
| outer-clear-removed | 4 | 정상/throw 종료에서 현재 runtime origin 제거 |
| stale-clear-removed | 2 | adoption이 남긴 runtime origin 제거 |
| flush-set-removed | 1 | 독립 setState 리스너 동안 write |
| flush-restore-removed | 1 | 독립 flush 뒤 undefined 복원 |
| enclosed-set-and-restore | 2 | T2 안쪽 guard는 최외곽 reset의 load; 기존 리스너 두 경우는 이 변이에서 통과 |
| enclosed-overwrite | 4 | T2 중첩 쓰기가 최외곽 load를 덮어쓰지 않음 |
| batch-load-opener-write | 6 | A1 reset·rebuild·validator의 load |
| validation-wave-write | 2 | 검증 결과 리스너는 validate |
| merge-first-removed | 1 | A5 수집별 첫 오류·details 보존 |
| first-errors-write | 2 | 첫 commit의 applyFormErrors는 load |
| adoption-transfer-removed | 4 | rebuild·validator adoption의 origin 인계 |
| mount-opener-write | 2 | 최초 mount가 여는 사슬은 load |

### 현행 문서와 결정 보충

[교정 목록](raw/ir-9/round-b/current-spec-corrections.json)은 제거한 record 값이 남아 있던 8곳을 각각 보존합니다: README:2746, QUICK_REFERENCE:576, arrays-and-scale:154, validation-and-state:11, 영어 SPECIFICATION:882, 한국어 SPECIFICATION:880, providers DETAIL:13, RootNodeContext DETAIL:21입니다. 영어는 “reject; their record carries `origin: 'validate'`”, 한국어는 “실패하면 거부하며 기록의 origin은 `validate`입니다”로 고쳤습니다. 현행 스펙 전체를 다시 검색한 `rejected`·`thrown`·`sink` record 값의 잔여는 0입니다.

write·settle DETAIL의 mount guard 규칙은 현행 계약으로 교정했고 ERROR-041 및 ADR-0014에는 [채택한 review 결정](../../reviews/ir-9-round-b.md)의 보충을 추가했습니다. A6의 생성 중 load/사슬 실행 중 opener 구분은 README 두 언어·SPEC 두 언어·QUICK_REFERENCE·validation-and-state·errors DETAIL에 추가하고 ERROR-017과 ADR에도 보충했습니다. 기준 원장·ADR·설계·계획 줄은 삭제하거나 재배열하지 않았습니다.


round c 배치 교정 뒤 최종 원장 검사는 보충·충돌 인용 3,616, 원문 불일치·해석 실패 0입니다. 새 보충 두 줄은 parser가 실제 읽는 보충 필드 안에 두었습니다. 결정 원문 불일치 0, ref 문제 0, owner 720/720, 17영역 sentence missing·bad classifications 0이며 기존 plan-links 1·doc-coverage 미인용 66·tokens 잔여 398은 유지합니다. [round c 최종 검사](raw/ir-9/round-c/ledger-checks.json)와 [전체 portable 로그](raw/ir-9/round-c/ledger-logs.json.gz)를 보존합니다.


### round b 최종 감사와 한계

[전체 FCA 비교](raw/ir-9/round-b/fca-diff.json)는 기본 소스 facts 1,775개가 모두 exact이며 missing·needsResolution·uncertain·tool-error는 0입니다. scan·validate·verification의 snapshot은 일치합니다. finding은 201→201로 유지됐습니다. 정확한 문자열 비교에서 adoption-delivery의 기존 dynamic-table finding 한 건은 `expectResting`에 chainOrigin 단언을 추가하여 205→206행으로 이동했습니다. 이전·이후 메시지를 모두 남겼고 위치를 제외한 규칙·경로·뜻은 같습니다. 신규/해소 finding은 0, canonical failed 12·skipped 1이며 기존 문서 진단 176개와 각 nextAction도 동일합니다. 통합 verdict는 기존 위반 때문에 FAIL이고 분석의 indeterminate는 유지합니다. 전역 PASS로 해석하지 않습니다. Scan complete: 201 findings.

[확장 감사](raw/ir-9/round-b/audit.json)는 `daf4ff55f` 이후의 각 커밋, 새 파일·추가 줄, 모든 gzip의 해제한 전체 내용을 검사합니다. 신규 기계 경로·unsafe assertion은 0이며 React 19 legacy-root용 skip 세 줄만 승인된 변경입니다. 기존 skip·todo·fails 및 원장·ADR·설계·계획의 기준 줄은 보존했습니다. 불변 원장의 과거 경로 예시는 그 기준 줄 안에만 남고 새 raw 로그는 portable 표기로 보존합니다. scratch worktree·branch 생성과 잔여는 0입니다.

브라우저 측정·benchmark·실행시간 주장은 추가하지 않았습니다. 검토자는 `daf4ff55f` 이후 범위와 최초 IR-9의 `f4018e82b` 이후 범위를 구별해 볼 수 있습니다. 제품은 `e1079152a`, 시험은 `7448a4b84`와 import 경로만 고친 `4dcf6646f`, 빌드 증거는 별도 `874a3d296`입니다. 독립 검토와 통합은 이 결과·채택한 round b 결정·원시 증거와 함께 coordinator에게 인계합니다.


### round b 최종 순차 관문

helper import 보정 뒤 lint → typecheck → build → unit → render → react18 → verify → storybook → production → import-model을 순서대로 다시 실행했고 모두 exit 0입니다. [명령·콘솔 발췌](raw/ir-9/round-b/command-gates.json), [프로젝트별 집계](raw/ir-9/round-b/test-gates.json), 각 전체 JSON gzip을 보존합니다. build는 DEVELOPMENT_FLAG_OK와 runtime 세 형식의 GATE_SELECTION_DIST_OK도 통과했습니다. [빌드 manifest](raw/ir-9/round-b/build-artifacts.json)는 별도 build 커밋으로 보존했으며 ignore 대상 dist는 추가하지 않았습니다.

| 관문 | 통과 | 실패 | skip | todo |
| --- | ---: | ---: | ---: | ---: |
| lint | 경고 0 | 0 | — | — |
| typecheck·build | exit 0, artifact 검사 포함 | 0 | — | — |
| unit | 4,101 | 0 | 0 | 1 |
| render | 947 | 0 | 5 | 0 |
| react18 | 943 | 0 | 9 | 0 |
| verify | 5,092 | 0 | 5 | 1 |
| storybook | 254 | 0 | 0 | 0 |
| production | 21 | 0 | 0 | 0 |
| import-model | 2 | 0 | 0 | 0 |

render·verify의 skip 5는 기존 2건과 승인된 React 19 legacy-root 3건입니다. react18 skip 9건과 unit·verify todo 1건은 기존 상태입니다. 최종 관문의 실패를 숨기거나 단언·coverage를 줄인 변경은 없습니다.


## IR-9 round c — 원장 배치와 이름 교정

원장 README §3의 보충 필드 규칙에 따라 기존 IR 보충 14줄을 보충 칸으로 옮겼습니다. 까닭 아래의 11줄과 충돌 아래의 3줄을 앞의 빈 줄과 함께 제거한 뒤 지정 `sup-insert.mjs`로 다시 넣었습니다. ERROR-023·VALIDATE-046의 보충 없음은 보충 필드로 바꿨고 ERROR-017·041 뒤에 남은 이중 빈 줄도 정리했습니다. IR-8의 인용 줄에는 기존 인용보다 긴 뒷문장이 있어 도구 삽입 뒤 두 곳을 원래 인용문으로 되돌렸습니다. 인용 내용은 14줄 모두 바이트가 같으며 결정 자체를 바꾼 것은 없습니다.

[배치 교정 증거](raw/ir-9/round-c/placement-correction.json)는 각 항목·기존/현재 위치·인용 해시와 도구 계획을 보존합니다. 원장 전체에서 parsed list 필드 밖의 `>` 줄은 0개이고 IR 보충이 보충 필드 밖에 있는 경우도 0개입니다. sup-check는 보충·충돌 인용 3,616건, 원문 불일치 0·해석 실패 0입니다. 원래 충돌로 집계되던 세 줄은 보충으로 옮겨 집계 총합에 영향을 주지 않고, 이전에 읽히지 않던 11줄이 새로 집계됩니다.

React 18 legacy root helper는 `renderLegacyRootOrigin`과 같은 이름의 파일로 바꿨습니다. frozen `__legacy__` 엔진을 뜻하는 이름으로 읽히지 않도록 한 rename이며 모든 소스 참조를 함께 바꿨습니다. [rename-only 증거](raw/ir-9/round-c/rename-proof.json)는 새 이름을 되돌리면 helper·호출자 바이트가 기준 `0920ad9c5`와 같음을 확인합니다. 제품 로직과 시험 단언은 그대로이며 이전 round의 raw 해시는 당시 커밋의 역사적 증거로 보존합니다.

선언 메타데이터에서 errors/index.d.ts·errors/type.d.ts는 공개 record의 운반 파일로 분리했고 내부 변경 목록은 19개입니다. 전체 변경은 여전히 21개이며 공개 폐포 diff 세 줄·선언 트리 해시는 같습니다. 입력 SHA 필드는 `walker_input_commit`으로 이름을 바꿔 walker가 읽은 커밋임을 명시했고 writer도 같은 필드를 출력합니다.


round c 지정 관문은 lint → typecheck → import-model → unit → 두 origin 파일(render·react18) → 원장 전체 검사 → FCA validate → 새 커밋·해제 gzip 경로 감사 순서로 실행했습니다. lint 경고 0, typecheck exit 0, import-model 2건·unit 4,101건·origin 45건 통과, 시험 실패 0입니다. 기존 unit todo 1건과 승인된 React 19 legacy-root skip 3건을 유지했습니다. [명령과 실행 순서](raw/ir-9/round-c/command-gates.json), [시험 전체 JSON·집계](raw/ir-9/round-c/test-gates.json), [원장 전체 로그](raw/ir-9/round-c/ledger-logs.json.gz)를 보존합니다.

[round c FCA 비교](raw/ir-9/round-c/fca-diff.json)는 facts 1,775 exact이며 finding 201개와 기존 진단 176개가 위치를 포함한 정확한 키로 같습니다. canonical failed 12·skipped 1 및 indeterminate를 유지하며 신규/해소 finding은 0입니다. [새 커밋 감사](raw/ir-9/round-c/audit.json)는 각 새 커밋의 추가 텍스트와 모든 gzip snapshot을 해제 검사하며 신규 기계 경로는 0입니다. 승인된 이동 14줄의 원문, 그 외 원장 본문, 제품 로직·시험 단언·skip/todo/fails는 유지했습니다. 최종 결과 커밋도 커밋 뒤 같은 검사로 다시 확인합니다.
