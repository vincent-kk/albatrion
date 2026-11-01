# IR-8 — 다음 프레임 뒤 공통 로드 검증

기준은 `c5d963b2d`(IR-6 #509·IR-7 #510 포함)이며, 제품 구현은 `7f04fe29d`입니다. 승인 설계와 Amendments 1–3을 적용했습니다. 최초 마운트·동일 스키마 reset·교체 reset·rebuild·검증기 교체가 같은 Provider 예약 함수와 같은 엔진 진입점을 사용합니다. 아래 실행 관문은 모두 통과했고, FCA·원장 검사는 기준 대비 새 finding 또는 문제가 없습니다. FCA의 기존 `indeterminate`는 유지합니다.

## 동작과 비용

Provider는 모든 모드에서 `scheduleLoadValidation`을 예약하고 다음 프레임 뒤 슬롯에서 `startFieldNodeLoadValidation` → `dispatchLoadValidation`을 호출합니다. `None`은 생략하고, OnRequest-only는 전체 스키마를 컴파일만 하며, OnChange(Always 포함)는 컴파일 후 현재 로드 시작 이후 쓰기 요청·명시적 루트 검증이 없을 때 첫 판정을 냅니다. 하위 `validate()`는 이 의무를 대신하지 않습니다. 최초 예약은 `!load.prepared` 안에 있어 StrictMode replay에서도 한 번입니다.

컴파일 실패는 새 트리를 유지하고 `validationUnavailable`을 설정하여 검증만 비활성화합니다. 자동 경로는 로드마다 `onError(surface: 'sink')` 한 번과 `reportOwnerlessError` 한 번입니다. reset·rebuild는 이 실패로 던지지 않으며 명시적 `validate()`·submit은 계속 거부합니다. 명시적 검증이 먼저 보고하면 같은 로드의 슬롯은 중복 보고하지 않습니다.

`failValidationCompile(node, failure)`가 쓰기와 로드의 실패 처리를 공유합니다. 보고기는 write의 `ensureValidationFailureReporter(runtime)`가 설치하며, 로드 진입점과 기존 request wave가 함께 사용합니다. 컴파일 실패 이외의 예외는 unavailable로 만들지 않고 보고기로 보냅니다. adoption은 더 이상 컴파일하지 않으며 패키지 공개 엔진 표면의 동작은 유지합니다.

모든 로드 시작은 요청 stamp를 증가시키고 finally의 사슬 종료 직전에 load stamp를 기록합니다. deferred reset은 이전 pending을 정착합니다. 같은 로드 객체라도 다음 reset은 토큰을 바꾸어 이전 슬롯을 버립니다. 이전 로드의 명시적 컴파일 실패는 caller에게만 거부하고 새 로드의 flags·보고를 바꾸지 않습니다. 오래된 `ValidatorThrew`는 기존 rejected 보고를 유지합니다.

- 로드 프레임 밖으로 옮긴 비용: Always 최초 로드, 아직 컴파일하지 않은 replacement reset·rebuild·검증기 교체의 전체 컴파일과 첫 판정입니다. IR-1의 전체 컴파일 관측값은 flat-500 **36.6 ms**, nested-d5-f4 **77.5 ms**였습니다. IR-8의 새 측정값이나 절감 보장으로 해석하지 않습니다.
- OnRequest-only 초기 로드는 기존에 없던 백그라운드 컴파일 비용을 추가합니다. Vincent의 quote 54: **"그 비용은 수용한다. 컴파일 비용 이월은 사용성을 불균일하게 만든다"**. Always 첫 표시도 슬롯까지 늦어집니다. 개발·운영 모드에 같은 규칙을 적용합니다.
- 런타임에는 선택적 load stamp, load에는 최신 슬롯 토큰 하나, 컴파일 캐시에는 중복 원인 표식이 추가됩니다. 실패 보고 closure는 런타임당 한 번 설치합니다. 기존 frame/macrotask·100 ms fallback을 재사용하며 별도 주기나 검증 루프를 추가하지 않습니다. 중복 원인 조회는 같은 검증기의 counted roots를 순회하고 기존 펼침 배열은 만들지 않습니다.

## L1–L6와 수용 한계

| 항목 | 유지하거나 수용한 범위 |
| --- | --- |
| L1 | 스키마 해석·트리 구성과 `if` 가드 컴파일은 로드 프레임에 남습니다. 개발 빌드의 if 게이트는 전체 스키마도 구성 중 컴파일하며 None도 이 예외를 가집니다. guard-only 플러그인 계약 G는 후속입니다. |
| L2 | Always의 첫 오류 표시도 첫 화면 뒤 한 슬롯(약 1–2프레임) 늦습니다. quote 49가 IR-6의 최초 inline 판정을 대체합니다. |
| L3 | 슬롯 첫 판정의 `ValidatorThrew`는 기존 rejected 표면이고 host 보고는 없습니다. 이번 변경은 컴파일 실패의 자동 표면을 통일합니다. |
| L4 | 같은 스키마 객체·검증기 쌍의 reset·rebuild는 컴파일 캐시 조회입니다. OnRequest-only 초기 비용 추가와 새 객체·검증기 교체의 비용 이동을 구분합니다. |
| L5 | unavailable은 해당 로드 동안 유지되고 다음 로드가 지웁니다. 같은 객체의 캐시된 실패도 다음 로드마다 한 번 다시 보고합니다. |
| L6 | unmount 뒤 reset의 새 루트는 retain되지 않아 축출·재컴파일될 수 있습니다. Activity/Suspense 숨김도 effect가 끊겨 슬롯이 retain 전에 컴파일할 수 있습니다. unmount된 OnRequest 폼도 슬롯에서 컴파일하고 실패하면 sink·host에 보고합니다. 실행 중 다른 루트가 8개를 초과해 최근 해제 목록에 들어가면(release 또는 retain 없는 compile) eviction이 validator.release를 호출해 플러그인에 따라 VALIDATOR_THREW가 발생할 수 있습니다. stage에도 있던 실행 중 참조 보유(run-time retain) 후보이며 IR-8에서 수명 계약은 바꾸지 않습니다. |

visible replacement에서 같은 `$id`지만 내용이 다른 새 객체는 commit cleanup의 old-root release 뒤 컴파일되어 등록 충돌이 사라질 수 있습니다. 두 mounted 폼이 같은 `$id`를 공유하거나 if 게이트가 reset 중 동기 컴파일하는 경우의 중복 실패는 유지합니다. 컴파일 시점의 중복 원인은 상대 루트를 해제한 뒤에도 캐시에 보존합니다.

트리 구성 자체가 실패해 이전 load를 반환한 reset은 그 load의 캐시를 다시 조회하며 요청이 없으면 같은 값의 판정을 한 번 더 수행할 수 있습니다. `retainEqualValidationIssues`로 onValidate는 추가되지 않는 수용한 동작입니다. stale `next.error` 후보는 남깁니다.

## Red와 green

제품 수정 전에 계약을 `b9619c417`·`86edda96d`로 커밋했습니다. 이후 시험을 먼저 커밋하고 stage 제품으로 red를 실행했습니다. 호스트·화면 관찰을 보정한 최종 실패 시험 본문은 `32d1977cc`이며 `e9cc22a57`이 그 stage 원시와 SHA256을 보존합니다. 임시로 제품 파일만 stage 바이트로 바꾸고 외부 snapshot에서 복원했으며 scratch worktree·branch는 만들지 않았습니다.

[최종 red 목록·시험 해시](raw/ir-8/red-runs-final.json): render **35 pass / 25 fail**, react18 **33 pass / 24 fail / 3 skip**, unit **19 pass / 5 fail**입니다. 최초 red도 [별도 목록](raw/ir-8/red-runs.json)에 남깁니다. 실패 수는 assertion 수이며 guard나 새 내부 이름의 부재를 제품 결함 수로 합산하지 않습니다.

| 시험 | stage red 또는 guard | 구현 후 증거 |
| --- | --- | --- |
| T1 | OnRequest compile이 0에 머물고 슬롯 오류 기록이 없습니다. | 양쪽 React에서 슬롯 전 compile 0, 뒤 1; 성공 시 verdict 0, 실패 시 sink·host 각 1; 이후 validate·submit은 거부하고 중복 보고 없음. |
| T2 | Always가 layout에서 컴파일하여 최초 프레임 전 0회 단언을 깨뜨립니다. | true·Always mask·StrictMode에서 슬롯 전 compile·onValidate·표시 0, 슬롯 뒤 첫 오류 표시. |
| T3 | reset·rebuild adoption이 동기 throw하고 validator 교체도 즉시 실패를 보고합니다. | visible·hidden, 양쪽 React에서 새 root·필드·쓰기 유지, 슬롯 sink·host 각 1, explicit 거부. 검증기 교체는 props를 연결 commit에서 반영한 뒤 슬롯 전에 숨깁니다. |
| T4 | reset 직후 pending이 true입니다. 횟수 단언은 guard입니다. | reset 직후 pending false; 별도 보관한 로드 슬롯을 풀기 전 cadence만 진행해 실행 0, 슬롯 뒤 default 판정 1과 새 목록 전달. |
| T5 | reset=false의 최초 쓰기 우선 처리는 기존 계약 guard입니다. reset=true는 round b에서 새 로드 슬롯 1개를 직접 단언해 강화했습니다. | 슬롯 전 쓰기가 cadence에서 최신값을 한 번 판정하고 로드 슬롯은 추가 verdict를 내지 않음. |
| T6 | 교체 reset·rebuild가 None에서도 컴파일합니다. 최초·동일 스키마는 guard입니다. | guard-free None의 최초·동일 reset·교체 reset·rebuild·검증기 교체 compile 0. |
| T7 | core-only mount·reload 기본 동작은 기존 계약 guard입니다. | Provider 없이 각 로드가 사슬 끝 OnChange 요청을 유지. 최종 import-only 수정 `77d59be62`는 자식 index를 사용하며 unit·import-model에서 재확인. |
| T8 | 실패하는 root replacement reset은 stage에서 throw합니다. 동일 스키마·성공 교체의 횟수는 guard이며 새 entry 계측 이름 부재는 red 기전으로 세지 않습니다. | stale callback을 직접 먼저 풀면 엔진 load entry 0, 최신 토큰을 풀면 1; 판정 또는 실패 보고도 한 번. |
| T9 | reset=false의 기존 explicit-first는 guard입니다. validate 직후 같은 act의 reset은 stage에서 rejected를 먼저 보고해 host 0이 됩니다. | 새 load 세대의 슬롯만 sink·host 각 1, 이전 caller promise는 거부. reset 없는 경우 rejected 1, host 0. |
| T10 | write→reset 뒤 default 한 번 판정은 stage에서도 green인 guard입니다. | 실제 frame scheduler에서 default로 정확히 한 번 실행. |
| T11 | 검증기 없는 write→reset의 pending 해제는 guard입니다. | 슬롯 뒤 pending false. |
| B2 | compile 때의 중복 원인이 competing root release 뒤 사라집니다. | cached failure의 duplicateSchemaId 유지. |
| B3 | 같은 `$id`·다른 내용 새 객체의 reset이 adoption에서 충돌합니다. | register/release 추적 검증기로 old release 뒤 새 스키마 컴파일·검증 성공, onError 없음. |

round b에서 패키지의 15-case cap에 맞춰 T3·T9·B3를 `validation.load-slot-failures.render.test.tsx`로 옮겼습니다. 이동은 red 커밋 뒤에 이뤄졌으므로 최초 IR-8 red SHA256은 분할 전 파일을 가리킵니다. 원래 파일과 새 파일은 native submit 회귀를 포함해 각각 11 case입니다. T10·T11은 after-paint, B2는 same-id, T7은 core의 지정 파일에 있습니다.

적응한 시험은 mount-always의 inline 표시·rejected 기대, after-paint의 load compile 표면, IR-7 reset-failures의 adoption 및 initially-hidden 표면, same-id의 인계 원자성, Form.policies의 검증기 교체 대기, LANDING-025의 OnRequest sink, surfaceIndex의 바인딩 이름, binding-input·onChange의 load-relative stamp입니다. W4는 기존 `reportOwnerlessError` fallback이 event와 console에 노출되는 것을 중복 집계하지 않도록 단일 reportError host를 stub합니다. core-only guard import 경계 오류 1건은 수정 전 원시를 보존하고 자식 진입점으로 고쳤습니다.

[전체 green 원시와 집계](raw/ir-8/test-gates.json)는 validation.reveal-history, Form.resetCommit, 캐시 reset, validation.visibility, lifetime 및 기존 IR-7 T6 build-time onError 격리를 포함합니다. 이들 추가 회귀의 기대를 삭제하거나 완화하지 않았습니다. 비동기 로드 판정은 write pending과 별개이므로 settleValidation 주석도 reset 슬롯을 포함하도록 고쳤습니다.

## 순차 관문

[명령·종료 코드·출력](raw/ir-8/command-gates.json)에 lint → typecheck → build → unit → render → react18 → verify → storybook → production → import-model 순서를 보존합니다.

| 관문 | 최종 결과 |
| --- | --- |
| lint | 경고 0, exit 0 |
| typecheck·build | exit 0; development flag·gate-selection artifact checks 포함 |
| unit | 4,093 pass, 0 fail, 기존 todo 1 |
| render | 924 pass, 0 fail, 기존 skip 2 |
| react18 | 917 pass, 0 fail, 기존 skip 9 |
| verify | 5,061 pass, 0 fail, 기존 skip 2·todo 1 |
| storybook | 254 pass, 0 fail |
| production | 21 pass, 0 fail |
| import-model | 2 pass; U asserted 0·D 0·S1 0 |
| 공개 표면·버전 | src/index.ts diff 0, baseline 대비 index.d.ts 동일, package.json diff 0 |
| skip/todo/fails | [정적 원본 대조](raw/ir-8/skip-source-audit.json)의 추가·삭제 0 |
| 경로·기록 보존 | [audit](raw/ir-8/audit.json): 새 텍스트·gzip의 machine path 0, 기존 원장·ADR·design·plan 20개 기록의 모든 줄 보존 |

최초 전체 unit의 import-model 실패는 [초기 관문](raw/ir-8/command-gates-initial.json)과 `gate-unit-attempt1.json.gz`에 별도 보존했습니다. 수정 뒤 모든 관문을 위 순서로 다시 통과했습니다. 최종 제품 [SHA256](raw/ir-8/product-sha256.json)과 [빌드 manifest](raw/ir-8/build-artifacts.json)를 보존합니다. dist는 기존 gitignore 대상이고 tracked build output 변경은 없으므로 강제 추가하지 않았으며, 생성물 해시만 별도 build 커밋 `80d949ca3`에 두었습니다.

### FCA와 원장

`filid:scan`의 facts bootstrap 뒤 1,769 exact, missing·uncertain·tool-error 0입니다. scan·validate·verification의 snapshot이 같습니다. [비교](raw/ir-8/fca-diff.json)는 기존 IR-7 최종 스캔의 finding 202 → 201, **추가 0·제거 1**입니다. B6/C3-6의 정규식 소유 경로 정정으로 기존 app/cache 문서 경고 하나가 사라졌습니다. canonical failed 12·skipped 1과 unsupported 진단은 기존 상태이며 전체 판정을 PASS로 바꾸지 않습니다.

[원장 검사](raw/ir-8/ledger-checks.json)는 verbatim 오류 0, 보충 인용 3,597개 중 불일치·해석 실패 0, ref 문제 0, owner 720/720 인용, 17영역 문장 missing·bad classifications 0입니다. 보충 인용은 기준 3,584개에서 13개 추가했습니다. plan-links의 기존 ERROR-038 비현행 참조 1건, doc-coverage 미인용 66개, tokens 2,390개 중 기존 잔여 398개는 기준과 같습니다. 새 문제는 0입니다.

열 개 ADR/design 투영은 이번 branch의 새 문장에 ledger ID를 붙여 doc-coverage의 새 untagged 40개를 0으로 고쳤습니다. sup-insert는 기존 `보충: 없음` 줄을 다시 쓰므로 이번 append-only 지시와 맞지 않아 실행하지 않았고, 기존 줄을 유지한 채 provenance 인용을 직접 추가했습니다. doc-coverage는 실행했으며 기존 문제와 새 문제를 구분해 판정했습니다.

## 범위 밖 후보와 인계

- L3: 슬롯 verdict의 ValidatorThrew 표면 통일.
- G: if 가드만 컴파일하는 플러그인 계약.
- 기존 후보: 구성 실패 reset의 stale next.error.
- 실행 중 참조 보유 (run-time retain): L6의 최근 해제 목록 진입·축출에 따른 실행 중 release; 검토의 메모리 재현 지적을 기록하며 이번에 수정하지 않습니다.
- IR-9: onError 목록 표면. 이번 공개 선언에는 추가하지 않았습니다.

브라우저 측정 창과 benchmark는 실행하지 않았습니다. 같은 전체 컴파일 작업의 실행 시점을 옮기는 변경이며 IR-6 측정 행의 guard-free OnChange 최초 마운트는 이미 슬롯에서 실행되었습니다. 새 IR-8 수치를 추정해 측정 결과로 적지 않습니다.

scratch worktree·branch를 만들지 않았으므로 제거 대상과 잔여 모두 없습니다. 최종 통합·독립 검토는 coordinator에게 소스 범위와 이 증거를 인계합니다.


## IR-8 round b — results-gate 수정

검토 기준은 `0df36857c`이며 제품 두 수정은 `0f8f02e47`입니다. F1은 캐시된 duplicate 판정에 read-time scan을 OR하던 부분을 제거하여 뒤늦게 retain한 같은 $id 루트가 과거 실패의 reason을 바꾸지 않게 했습니다. readValidationEntry는 컴파일 전에 해제된 같은 $id 루트를 축출하므로 컴파일 시점 counted-root 판정만으로 충분합니다. F3은 캐시 항목의 `rejection` memo를 통해 같은 compile 실패를 항상 같은 SchemaFormError 객체로 거부합니다. slot이 이미 onError로 보고한 native submit 거부는 seen에서 걸러 host에만 추가 보고하고, handle.submit은 그 객체로 계속 거부합니다. native 경로의 host 보고는 제거하지 않았습니다.

계약은 `ad14fad2b`, 최종 시험 본문은 `c2cc703be`로 제품보다 먼저 커밋했습니다. F1은 A를 먼저 compile한 뒤 B를 retain하고 A의 dispatchValidate를 호출합니다. [수정 전 증거](raw/ir-8/round-b/red-runs.json)는 0df 제품에서 unit 22 pass/1 fail, render·react18 각각 47 pass/2 fail입니다. 실패는 뒤늦은 reason 추가와 native submit의 onError 2회이며 setup 실패를 red로 세지 않았습니다.

T3·T9·B3는 본문을 유지해 별도 failures 파일로 옮겼고 B3의 최종 validate await만 act로 감쌌습니다. src/DETAIL에 두 e2e 파일의 core vi.mock 감싸기 이유와 정확한 파일 목록을 선언했습니다. [warning audit](raw/ir-8/round-b/act-warnings.json)는 양쪽 major·두 파일 총 44 pass, act warning 0입니다.

| 강화 항목 | round b 단언과 red 증거 |
| --- | --- |
| T10 | reset 직후 pending false, 첫 advanceValidationFrame/settleValidation 전 validator 실행 0; reset advance 제거 시 양쪽 major에서 default 단일 판정 단언 실패 |
| T11 | reset 반환 직후, 프레임 전 pending false; c5d 원래 stage에서는 true여서 실패 |
| T5 reset=true | reset이 새 load slot을 정확히 1개 예약함; c5d에서는 0으로 실패 |
| W4 | sink 표면과 원래 compile error·handler error의 host 보고 각각 1회; c5d의 rejected 표면에서 실패 |
| Form.policies | rerender 직후, frame/settle 전 second.compile 0; c5d의 동기 compile 때문에 실패 |
| binding-input | loadStamp = stampBefore + 1과 request delta 1; mount advance만 제거한 scratch에서 실패 |
| dispatch.onChange | 같은 load-start advance와 request delta를 함께 단언; reset advance만 제거한 scratch에서 실패 |

[mutation 원시·patch·최종 시험 SHA256](raw/ir-8/round-b/mutation-runs.json)은 mount 제거 unit 1 fail, reset 제거 unit 1 fail, reset 제거 render·react18 각각 T10 1 fail/T11 1 pass를 보존합니다. 강화 시험을 원래 IR-8 stage `c5d963b2d` 제품에서 실행한 결과 양쪽 major 모두 1 pass/5 fail이며 T5 reset=false는 기존 guard로 통과합니다. 이 baseline 차이를 0df 제품 red와 혼합하지 않습니다. scratch는 `c2cc703be`에서 생성해 설치 없이 기존 의존 산출물만 연결했으며 증거 커밋 `171238ebe` 직후 Orca로 제거했습니다.

기존 계약 guard는 after-paint의 실행 실패 보고 장면(검토 기준 :187), T5 reset=false, T9 reset=false, T7 core-only 및 reset-failures의 initially-hidden construction 오류(검토 기준 :170)입니다. 이 guard를 IR-8 변경의 red 증거로 세지 않습니다.

추가 수용 한계:

- dispatchResetForm.ts:35의 pending 목록 비우기는 clearFieldNodeFormErrors가 같은 일을 하므로 중복된 방어 절이며, 제거해도 시험은 실패하지 않습니다. 해당 줄은 유지했습니다.
- 호스트가 이미 보고된 컴파일 거부 객체를 렌더 중 다시 던지면 경계 capture는 seen 때문에 그 RENDER_FAILED 기록을 한 번 생략하고 seen에서 지웁니다.
- L6의 run-time retain 후보는 stage의 OnChange mount slot과 IR-7 L1 unmount 뒤 쓰기에도 있던 노출입니다. 새 OnRequest 슬롯은 동기 compile만 하므로 해당 비동기 실행 창을 추가하지 않습니다.

경로 감사는 일반 파일과 gzip 전체를 읽고 temporary 절대 경로까지 포함합니다. 기존 command-gates-initial.json 명령 필드의 임시 경로 1개를 portable 표기로 고쳤으며 이전 audit가 이 패턴을 누락했다는 사실도 audit.json에 명시했습니다.
