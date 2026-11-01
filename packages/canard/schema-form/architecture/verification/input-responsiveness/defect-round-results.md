# 결함 라운드 결과

기준 제품은 `779713587`입니다. Amendment 8까지 승인된 DR-1~3·DR-5·DR-8~15와 D9 제한을 반영했습니다. 제품과 시험의 검증 기준은 `3372c4f51`이며 뒤의 커밋은 검증 자료·결과 문서입니다. 브라우저 측정·벤치·버전 변경은 수행하지 않습니다. DR-6 기록 경로 정리와 DR-7 측정은 다른 라운드이며 최종 push는 코디네이터가 담당합니다.

| 항목 | 재현·수정 | 증거 |
| --- | --- | --- |
| DR-1 / D1 | unmount된 슬롯 판정이 대기 중일 때 다른 루트 9개가 해제되면 사본이 실행 중 풀렸습니다. 커밋 counts와 별도의 inflight 핀을 컴파일 점검 전부터 finally까지 유지하고 LRU만 핀을 존중하도록 고쳤습니다. | [기준 red와 해시](raw/defect-round/dr123-provenance.json), [수정 회귀 132건](raw/defect-round/dr123-regression-green.json.gz), [변이](raw/defect-round/mutations.json) |
| DR-2 / D2 | 슬롯 ValidatorThrew의 host가 0이었고 MultipleErrors도 첫 원인을 누락했습니다. engine onError를 재포착하지 않고 원본·소비자 오류를 순서대로 host에 보냅니다. | 같은 기준 red·회귀·변이 자료 |
| DR-3 / D3 | duplicate-throw double에서 retained 충돌이 끝나도 전체 검증이 거부됐습니다. 전체 읽기만 같은 entry/copy를 한 번 재시도하며 성공 시 실패·거부·중복 guard 실패를 지웁니다. | [기준과 double 정의](raw/defect-round/dr123-provenance.json), [shipped plugin 최종 텍스트 기준 재현](raw/defect-round/exact-additional-provenance.json), [shipped green](raw/defect-round/dr3-plugin-green.json.gz) |
| DR-5 / D4 → DR-8 | reset이 던진 mount 오류는 이후 root boundary에서 host로 다시 갔습니다. Error 객체는 onError 1→1·host 0→1, primitive는 onError도 중복됐습니다. replacement의 prepared와 reported를 함께 설정하며 caller의 error는 유지합니다. | [원래 재현과 커밋 해시](raw/defect-round/dr5-provenance.json), [추가 검사·변이](raw/defect-round/dr89-provenance.json) |
| DR-5 / D5 → DR-9 | path `/0`을 재사용해도 FieldProxy가 옛 노드를 보유했습니다. useSyncExternalStore로 경로 prefix의 UpdateChildren을 구독하고 재탐색합니다. 부모 재렌더 없는 remove·insert·공개 remove/insert 조합의 reorder·분기 교체·없는 경로의 진입을 확인했습니다. | [원래 재현](raw/defect-round/dr5-base.json.gz), [추가 검사·StrictMode·legacy root](raw/defect-round/dr89-focused-green.json.gz) |
| DR-5 / D6 | 배열 의존 gate의 onInactive가 실제 한 번 호출되는 remove와 resetSubtree에서 defaultValue 읽기는 전·후 값 중 하나였습니다. 비재현으로 닫고 guard를 유지합니다. | [두 React 기준 실행](raw/defect-round/dr5-base.json.gz) |
| DR-5 / D7 | oneOf 전환의 leaving.onInactive에서 읽은 stable watcher의 `[kind, leaving, arriving]`은 전·후 값 중 하나였습니다. 비재현으로 닫고 guard를 유지합니다. | 같은 기준 실행 |
| DR-10 | inline errors 배열과 validator 교체 또는 같은 batch의 reset·schema 변경에서 폐기 root 쓰기로 fallback이 생겼습니다. effect가 store.load.root를 읽도록 고쳤습니다. | [기준 red](raw/defect-round/dr1011-provenance.json), [DR-10·12 green 20건](raw/defect-round/dr1012-focused-green.json.gz) |
| DR-11 | degraded 명시적 submit은 caller 거부만 있었고 onError가 없었습니다. 두 제출 통로에 실패 보고를 공급해 명시적 onError 1·host 0, native onError 1·host 1을 유지합니다. degraded validate의 실행 거부는 기준부터 origin validate 기록 1·host 0이므로 변경하지 않았습니다. | [정확한 기준 재현과 해시](raw/defect-round/exact-additional-provenance.json), [제출 회귀 10건](raw/defect-round/dr11-green.json.gz) |
| DR-12 | no-root 복구의 applyFormErrors listener 기록에서 origin write를 관측했습니다. reset의 호출에 load origin을 명시했습니다. | [기준 red 2건](raw/defect-round/dr12-provenance.json), [수정 green](raw/defect-round/dr1012-focused-green.json.gz) |
| DR-13 | mount/reset 슬롯 전 unchanged resetSubtree가 전체 판정을 대신하면서 형제 `/b` 오류를 배정하지 않았습니다. 로드 판정이 남은 자동 하위 요청을 root로 넓히며, stamp에 밀린 async slot/cadence root 실행은 대상을 pending에 되돌립니다. setValue와 OnRequest-only는 기준부터 정상인 guard입니다. | [기준 37개 중 28 red·9 guard](raw/defect-round/dr131415-provenance.json), [집중 green](raw/defect-round/dr131415-green.json.gz), [변이](raw/defect-round/amend78-mutations.json) |
| DR-14 | native submit에서 compile 실패와 throwing onError의 bundle이 submit 기록으로 재보고됐습니다. handler 예외 객체를 보존하고 이미 보고한 원인·handler 객체만 담은 bundle 및 bare handler capture를 생략합니다. unseen 객체 bundle은 계속 보고합니다. | 같은 기준 red·집중 green·변이 자료 |
| DR-11 상호작용 | degraded 명시적 submit의 throwing onError가 원인과 묶이지 않고 host로 나갔습니다. report 경로로 전달하고 `[SubmitWhileDegraded, handler error]` bundle을 caller에게 거부하며 host는 0입니다. native는 host 한 번을 유지합니다. | 같은 기준 재현·집중 green과 handler bundle 제거 변이 |
| DR-15 | React/native 이벤트에서 read→rebuild의 지연 경고가 새 load를 오염시켰고 same-root reset의 다음 읽기도 막았습니다. 읽을 때 scope를 잡아 보존하고 input 자신의 root가 retired면 버립니다. rebuild→read·실패한 rebuild·unmount도 검사했습니다. | [최종 시험 텍스트 기준 12 red·2 guard](raw/defect-round/dr15-final-provenance.json), [집중 green](raw/defect-round/dr131415-green.json.gz), [두 변이](raw/defect-round/amend78-mutations.json) |

DR-3 double의 compileGuard는 사본을 등록하지 않고 flag를 읽는 동기 guard를 반환합니다. shipped ajv6·7·8은 실제 중복 루트를 sibling instance로 분리하여 기본 재현에서 통과합니다. 별도 probe는 plugin compile을 한 번 성공시킨 뒤 duplicate 실패로 보이게 하고, 같은 copy에 compileGuard를 호출한 후 동일 사본 재컴파일과 기존 guard 정체성·판정을 검증했습니다. 정확한 기준에서 세 probe는 red, 수정 후 green입니다. ajv8의 compileGuard가 사본을 등록할 수 있어도 재시도 계약을 만족합니다.

| 변이 | 검출 |
| --- | --- |
| DR-1 pin 제거 | 실행 중 해제 검사 1건 실패 |
| DR-2 non-bundle host 전달 제거 | 원본 오류 누락 검사 1건 실패 |
| DR-3 retry 전 같은 id 축출 제거 | 재시도·guard 검사 2건 실패 |
| DR-8 reported 제거 | 원래 D4 검사 1건 실패 |
| DR-9 경로 구독 제거 | 구조 검사 5건 중 3건 실패. insert/reorder 일부는 기존 node tracker 렌더의 snapshot 재조회로 통과합니다. |
| DR-13 root 확대 제거 | mount/reset 형제 배정 2건 실패 |
| DR-13 async cadence 대상 복원 제거 | cadence supersession 1건 실패 |
| DR-13 async slot 대상 복원 제거 | slot supersession 1건 실패 |
| DR-14 known bundle 검사 제거 | native·service 2건 실패 |
| DR-15 retired-root 검사 제거 | retired load 3건 실패 |
| DR-15 원래 scope 대신 현재 scope 사용 | same-root reset 2건 실패 |
| DR-11 handler bundle 제거 | caller-owned bundle 1건 실패 |

모든 변이는 원복했습니다. 추가 변이의 실패 이름과 JSON은 [Amendment 7·8 변이 원장](raw/defect-round/amend78-mutations.json)에 있습니다. 최종 DR-1 공개 Form driver의 기준 재실행은 [해시와 raw](raw/defect-round/dr123-final-provenance.json)에 보존합니다. DR-1–3은 기존 검증 전체와 로드 관련 132건, DR-8·9는 양 React에서 실행 31건, DR-10·12는 20건, DR-11 제출은 10건의 집중 회귀에서 실패 0을 확인했습니다. DR-9 React18 legacy-root 검사 한 건은 React19 프로젝트에서 조건부 생략하며 기존 skip/todo는 별도 감사합니다.

추가 집중 회귀는 103통과·실패0입니다. 초기 전체 unit에서 새 fixture의 소유 경계·pointer 문법 위반을 찾아 제품 owner의 pointer helper 재사용과 시험 직접 import로 정정했습니다. 이어 DR-13의 기존 subtree scope 시험은 초기 root 판정을 마친 조건으로 보정했습니다. 이 실패 자료는 보존하며 최종 전체 unit·render·react18·verify로 다시 확인했습니다.

유지하는 한계는 다음과 같습니다.

- DR-1: 같은 id 교체는 inflight 핀을 무시하므로 커밋 소비자가 없는 사본이 실행 중 해제되어 ValidatorThrew가 날 수 있습니다. unpin은 plugin을 부르지 않아 실행 종료 뒤 다음 축출점까지 recent가 8개를 넘을 수 있습니다.
- DR-3: reset과 commit 사이의 `rebuild(); validate()` 또는 timer·transition으로 슬롯이 commit보다 먼저 실행돼 실패하면 해당 load는 unavailable로 남습니다. guard-only compile인 item G는 호출 순서와 생산 시점 변경으로 유보합니다.
- D9: ERROR-023 항목 2와 quote 59가 우선합니다. 생략된 render record의 componentStack·path는 onError에 도달하지 않고 boundary console.error에만 남습니다. seen 삭제 뒤 native submit은 같은 거부를 다시 onError에 보고할 수 있어 ERROR-019의 IR-8 round b 보충보다 이 제한이 우선합니다. DR-4는 철회됐습니다.
- DR-8: primitive props-driven reset은 WeakSet으로 중복 제거할 수 없어 load·render 기록이 각 한 번 생깁니다. 기존 ERROR-023 항목 2의 제한이며 guard로 보존했습니다.
- DR-14: 알려진 bundle 또는 bare handler 객체의 render capture는 RENDER_FAILED 기록·componentStack도 생략합니다. D9와 같은 ERROR-023 항목 2 우선 제한입니다. primitive handler 예외는 object 집합으로 식별하지 못하므로 bundle capture가 추가 기록할 수 있습니다.
- DR-15: 실패한 rebuild는 root를 유지하되 새 warning scope를 이미 시작하므로 다음 읽기를 다시 보고합니다. unmount 뒤 개발용 경고도 마지막 onError에 도달하는 기존 동작을 유지합니다.
- DR-9: identity 교체로 Input이 remount되면 focus를 잃는 REACT-023 제한, wildcard 첫 매치만 추적하는 제한, 경로 container당 리스너 한 개·사건마다 필터 호출 비용이 있습니다. useSyncExternalStore의 구독 후 재조회가 tearing을 막고 같은 wave의 재호출은 무해합니다.

일반 폼의 추가 경로 구독 비용은 0입니다. 기본 FormRootProxy는 입력 없는 `<FieldProxy />`, useChildFields의 일반·지연 자식은 node prop, FieldInputSlotWrapper도 node를 전달합니다. root proxy는 기존 네 리스너를 유지하며 Provider의 별도 한 리스너를 제외하여 계수했습니다. StrictMode와 React18 legacy-root에서 경로 구독을 모두 해제하는 것을 확인했습니다.

F1은 SPECIFICATION 두 언어의 ValidatorCompileFailed 셀을 IR-9 origin·host·rejection 용어로 정정했습니다. F2는 props.showError·handle.showError·FieldNodeState.ErrorVisible의 공개 주석에 OnChange만 hold한다는 문장을 추가했습니다. 55개 공개 도달 선언 파일을 byte 비교한 결과 이 세 주석만 달랐습니다. [주석 차분](raw/defect-round/public-comments.json)과 [평가한 공개 선언](raw/defect-round/public-declarations.json)은 97 exports·916 signatures의 동일성과 root index 선언 byte 동일성을 확인합니다. 존재하지 않는 onReady 문구도 현행 Provider 문서에서 제거했습니다. F4는 공개 batch/walk 한 쓰기 시퀀스의 첫 상태만 이력에 남는 예외와 한 React batch 안의 별도 공개 호출은 중간 상태도 기록한다는 구별을 README·영한 SPEC·quick reference·영문 agent knowledge·FieldRendererContext DETAIL에 반영했습니다.

| 관문 | 결과·증거 |
| --- | --- |
| lint·typecheck·build | exit 0, lint warnings 0. DEVELOPMENT_FLAG_OK·GATE_SELECTION_DIST_OK 세 번들. [프로세스 증거](raw/defect-round/gate-processes.json) |
| unit | 통과 4113·실패 0·skip 0·todo 1. [JSON](raw/defect-round/defect-final-unit-green.json.gz) |
| render / React19 | 통과 990·실패 0·skip 6·todo 0. [JSON](raw/defect-round/defect-final-render.json.gz) |
| react18 | 통과 987·실패 0·skip 9·todo 0. [JSON](raw/defect-round/defect-final-react18.json.gz) |
| verify-unit·verify-render | 통과 5147·실패 0·skip 6·todo 1. [JSON](raw/defect-round/defect-final-verify.json.gz) |
| storybook | 통과 254·실패 0·skip 0·todo 0. [JSON](raw/defect-round/defect-final-storybook.json.gz) |
| production | 통과 21·실패 0·skip 0·todo 0. [JSON](raw/defect-round/defect-final-production.json.gz) |
| import-model | 통과 2·실패 0·skip 0·todo 0. [JSON](raw/defect-round/defect-final-import-model.json.gz) |
| 공개 index·선언 | src/index.ts 변경0·root index.d.ts byte 동일·97 exports·916 signatures 동일. 승인 JSDoc 3곳만 차이 |
| FCA | 기준566→최종564 finding·실패26 동일·신규 finding/diagnostic0. 기존 indeterminate는 pass로 바꾸지 않았습니다. [비교](raw/defect-round/fca-comparison.json) |
| 원장 | verbatim0·sup 불일치/미해석0·ref0·owner 미인용0·17영역 missing/bad0. 기존 plan 문제1·doc 미인용66 유지, 새 문제0. [최종](raw/defect-round/ledger-final-summary.json)·[기준](raw/defect-round/ledger-base-summary.json) |
| 원장 수 변화 | 항목1416 동일·보충3616→3632(+16)·계획80→83(+3). token2390 동일·잔여398→397(새 보충이 기존 토큰1개를 포괄). 원문·기존 기록 삭제0 |
| 머신 경로·위험 단언·버전·skip/todo | 추가 텍스트와 모든 새 raw/gzip의 경로0·새 위험 product 단언0·버전 변경0·기존 skip/todo 동일. 새 DR-9 legacy-root case만 React19에서 조건부 제외. [감사](raw/defect-round/final-audits.json) |
| scratch 정리 | 비교용 Orca worktree와 scratch 브랜치 제거, 잔여0. [기록](raw/defect-round/cleanup.json) |
| 빌드 산출물 | 지정 build와 runtime artifact 검사를 수행했습니다. dist는 ignored이고 추적하는 재생성 bundle·adapter 차분이 없어 별도 build 커밋 대상0 |
| 전달 | 최종 로컬 HEAD 고정 링크의 한국어 PR 본문을 코디네이터에게 인계합니다. 지시에 따라 push하지 않았습니다 |

기존 원장·ADR·설계·계획 기록은 추가만 했으며 현행 INTENT·DETAIL·공개 명세·JSDoc은 정정했습니다. 머신 경로는 신규 자료에서 제거하고 JSON의 시험 단언은 유지했습니다. 재현 해시는 각 실행 당시 커밋 텍스트를 가리키며 이후 타입 보정은 별도 커밋·정확한 기준 재실행으로 보충했습니다.


## Amendment 9·10 결과 관문 정정

앞 표의 DR-13 완료 시 targets 재삽입 설명과 이전 최종 관문은 `4e7e1b5f3` 시점 기록으로 보존합니다. 새 설계는 실행이 끝날 때가 아니라 새 요청이 stamp를 올리기 전에 진행 중 실행의 대상을 후속 pending에 인계합니다. 실행 소유 객체는 그 cadence 또는 명시적 root 실행만 정착 때 지우며 하위 검증은 건드리지 않습니다. 완료 순서·거부에 따른 대상 유실과 중복 네 번째 실행을 닫습니다. 대체된 cadence 거부는 조용히 버리고 슬롯의 명시적 root 거부는 기존대로 onError·host에 한 번씩 보고합니다. 명시적 하위 validate가 쓰기에 대체되면 caller에게만 판정을 반환하는 기존 제한도 유지합니다.

DR-1은 구성의 unpinned guard read가 설치 중인 새 루트를 recent/counts에서 제거하지 않게 고쳤습니다. DR-2는 예약 load.retired만 late slot host 억제에 사용하고 같은 스키마 reset·unmount의 보고는 유지합니다. DR-14는 빈·희소 bundle을 capture 생략에서 제외합니다. node/root의 비용 표현도 정정합니다. 추가 경로 탐색·리스너 배달은 없고 렌더마다 상수 시간 snapshot hook 하나가 있습니다.

native degraded submit의 throwing onError는 DR-11에서 두 host 호출을 하나의 [원인, handler] bundle로 바꿉니다. validator bundle은 라운드 전부터 한 bundle이었으며 슬롯은 handler 오류를 IR-8부터, 첫 원인을 DR-2부터 원소별로 전달합니다. 두 통로의 형태를 통일하는 결정은 단계 마감 때 소유자에게 올립니다.

정확한 새 시험은 `cd6f8c1a8`입니다. 제품 `4e7e1b5f3`에서51통과·21실패·새 legacy 조건부 skip1, 원래 `779713587`에서31통과·41실패·skip1을 보존했습니다. cadence 거부는 두 기준·두 React 모두 red입니다. [커밋 시험 해시와 기준 raw](raw/defect-round/results-gates/red-provenance.json)를 참조하십시오. 기존 A1과 OnRequest-only guard를 포함한 집중 회귀는114통과·실패0·React19에서 새 legacy case1만 제외입니다. DR-15는 StrictMode·React18 legacy root의 원래 warning scope별 횟수를 확인합니다.

| 제거한 핵심 | 검출한 실패 |
| --- | --- |
| 요청 시점 handoff | 7 |
| 설치 root 축출 제외 | 1 |
| retired load host 억제 | 1 |
| nonempty dense bundle 검사 | 4 |
| unpin의 key 제거 | 3 |
| 경로 구조 구독 | 1 |
| 원래 warning scope | 5 |

모든 변이는 원복했습니다. [새 변이 raw와 실패 이름](raw/defect-round/results-gates/mutations.json)에 보존합니다. 아래 새 최종 관문이 이전 표를 대체합니다.
