# IR-6 — 다음 화면 뒤 검증

## 입력과 범위

기준 레인 E는 facd72a71(제품814d21ad4), 비교 L은 공개0.16.1 별칭입니다. 1차 코드 관문 대상 제품은 dc091af34이며 F는 독립 검토 뒤 확정할 IR-6의 최종 출하 번들입니다. 설계v3.1과 amendment1, store.load 식별자에 관한 코디네이터 승인을 적용합니다. 버전·G·virtualization 기본값은 변경하지 않습니다. 정식 측정은 독립 코드 검토와 window clear 뒤에만 시작합니다. 현재 성능 표본은 없습니다.

## 1차 코드 검증

계약 커밋684868857이 제품 변경보다 앞섭니다. load identity 승인 계약a1eaf1c9a, 취소 호스트 계약310c184b7, amendment 계약6a4dbc52a도 해당 구현보다 먼저 기록했습니다. 기준 제품에서 새 코어 회귀4개와 React18·19의 새 렌더 회귀 각10개가 실패했습니다. 기존 폐기 규칙 확인1개는 기준에서도 통과합니다. 슬롯 도입 시험은 기준의 새 심볼 부재로 수집 실패를 확인했고, 전역 정리 회귀는 초기 구현의 cancelAnimationFrame 재조회 오류로 실패했습니다. 원시는 [code 자료](raw/ir-6/code/)에 있습니다.

최종 관문은 서로 겹치지 않게 실행했습니다. 파일 수는 Vitest JSON의 testResults 길이이며 describe 묶음까지 세는 numTotalTestSuites와 구분합니다. React18은 별도 실행했습니다.

| 관문 | 파일 | 통과 | 실패 | 비고 |
| --- | ---: | ---: | ---: | --- |
| unit | 611 | 4,023 | 0 | 기존 todo 1 |
| render (React19) | 136 | 793 | 0 | 처리되지 않은 오류 0, exit0 |
| react18 | 136 | 793 | 0 | 처리되지 않은 오류 0, exit0 |
| verify | 752 | 4,860 | 0 | 기존 todo 1, render와 중복 포함 |
| Storybook | 100 | 251 | 0 | 실제 브라우저 시험, 성능 창 아님 |
| production | 10 | 21 | 0 | 최종 build 후 다시 실행 |

lint·typecheck·build는 exit0입니다. production distinct freeze 수는 nested-d5-f4=1,706, flat-500=502, oneOf-20=111, sample-0=5입니다. Storybook 최초 실행은 subscription-kinds의 한 프레임 대기가 늦은 오류를 놓쳐 실패했고, 같은 두 프레임+매크로태스크 대기로 바꾼 뒤 전체251개가 통과했습니다. render 최초 실행에서 시험 단언은 통과했으나 jsdom 정리 뒤 전역 취소 함수 재조회로 처리되지 않은 오류3개와 exit1이 발생했으며, 예약 시 취소 함수를 보관한 뒤 최종 실행은 exit0입니다. 재현 파일은 [code-gates.json](raw/ir-6/code/code-gates.json)과 final-*.json.gz이며, `node packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/code/check-code-gates.mjs`는 원시·소스 해시·포착한 관문 결과를 대조합니다(시험 재실행 명령은 아닙니다).

기준 선언은 기준 소스로 build:types한 dist를 사용했습니다. 공개 루트의 실제 alias와 참조를 따라간 결과 공개 이름97개, 도달 파일64개, 선언 서명1,329개이며 의미 차이0, 도달 선언 파일의 바이트 차이0, dist/index.d.ts 바이트 차이0입니다. 주석만의 차이도 없습니다. 내부 barrel에 추가한 export는 패키지 공개 루트에서 도달하지 않습니다. [선언 비교 결과](raw/ir-6/code/public-declarations.json)에 방법과 index SHA를 기록했습니다.

FCA는 기준·후보 모두 절대 상태 indeterminate입니다. scan 위반201, validate finding202, verification 위반21, 진단177은 유지됩니다. 기준의 구조 실패·불확실성을 통과로 바꾸지 않았습니다. 후보 facts는 exact1,681, missing/needsResolution/uncertain/toolError/unadjudicated 모두0이며 unsupported173은 그대로입니다. validate·verification의 세 finding은 import 두 줄 추가로 네 동적 표의 줄 번호만2씩 이동했습니다. 표 선언 원문이 같음을 대조했으며, [차분](raw/ir-6/code/fca-diff.json)은 원시 차이와 그 네 위치만 정규화한 차이를 함께 보존합니다. 새 finding·새 진단은0입니다. 새 시험 파일 네 개의 case 수는5·6·9·1이며 cap을 넘지 않습니다.


## 2차 수정 — Amendment 2·3

최종 코드 관문 대상 제품은 aceed2c95입니다.

A4의 버퍼 보고 누락은 R1로 수정했습니다. prepared load 복원 시 reporter.root 설정 뒤 records를 순서대로 비우고 그 뒤 owed를 재예약합니다. React18 Suspense 재숨김·React19 Activity에서 숨김 중 쓰기 컴파일 실패가 복원 뒤 onError에 정확히 한 번 도착합니다. R2는 쓰기 요청 또는 명시적 루트 검증이 이미 있으면 마운트를 생략합니다. 조회는 양수 스탬프만 인정하며 비루트 검증의0은 마운트 의무를 남깁니다. 공개 노드 형을 넓히지 않는 engine 조회+surface 래퍼 패턴은 코디네이터 msg_7e0a5ed0ffd3의 답변으로 승인받았습니다. 컴파일 실패는 마운트 슬롯이 첫 검증이면 rejected, 쓰기 요청이 먼저이면 sink로 한 번 보고합니다.

주기는 다음 프레임 뒤 선행 실행, 실행 이후 연속 요청의 프레임 이월, 첫 무요청 프레임 뒤 후행 실행, 마지막 자동 실행 시작 기준100ms 상한을 따릅니다. 시간 정책은 도메인 없는 validationScheduling 한 경계에 모으고 clock을 주입합니다. 런타임이 주기를 지연 소유하고 매 요청을 넘기며 실제 트리 폐기에서 모든 핸들을 취소합니다. 마운트는 일회성 슬롯이며 명시적 validate·제출과 기존 스탬프·최신 커밋·오류 배달은 도메인에 남깁니다. validationQueued는 모든 독자를 대조한 뒤 제거했습니다.

수정 전 증거: R1·R2 세 렌더 회귀는 React18·19 각3개 실패, R4 취소 API 부재 회귀1개 실패입니다. 정확한 1차 제품 c0b2f169a에서는 40프레임 스트림이 React18·19 모두40회 검증하여 예상2회(스트림 중 선행+상한)에 실패했고, 새 cadence API는 부재로 수집 실패했습니다. 폐기용 watch 프레임·carry 중 루트 validate 회귀도1차에서 실패했으며 현재 콜백을 바꾸는 대조는1차에서도 통과합니다. 새 주기의 첫 구현은 초기 배달 콜백을 영구 포착하는 회귀가 실패했고 최신 도메인 실행 본문을 보관하여 수정했습니다. 이 결과를 원시에서 구분합니다.

R7의 미발화 프레임 대기, R8의 Node setImmediate, R9 슬롯 주석, R10 한국어 INTENT, R11 React.Activity 직접 참조를 반영했습니다. R12 render-delay의 validation-on 행은 검증기 없는 동기 node-tree mount와 슬롯 예약만 재며 뒤 매크로태스크·판정 완료 지연을 재지 않는 범위임을 벤치 주석에 기록했습니다. R13 원장 색인·정본 위치·보충 형식과 R14 열 문서의 문장별 ID도 수정했습니다. 기존 원문은 VALIDATE-052 신규 색인 행 삽입만 승인된 예외이며 나머지 병합 prefix는 보존합니다.

R15와 Amendment3의 측정 추가는 window clear 뒤 커밋할 사전 규칙의 의무입니다. A5·G3의 전체 정의·문턱·환산·재측정·bootstrap과 stream-flat-2000-validate(준비3회·10페이지·60프레임·L/E/F), G6의 페이지별 실행 수≤2+ceil(기간÷100ms)와50ms 이상 프레임 총합 F≤E를 함께 기록합니다. G4는 non-burst의 매 키 배달만 판정합니다. 현재 정식 표본0입니다.

전체 unit 최초 실행은 제품 단언 통과와 별개로 테스트 import 경계4곳 때문에 실패했습니다. 공용 프레임 fixture를 세 시험 소유자의 최소 공통 소유자 src의 시험 helper로 옮기고, 자식 validation은 진입점으로, timing 자신의 시험은 구체 구현으로 참조하도록 고쳤습니다. 검사를 완화하지 않았으며 failed-unit-import-model 원시를 보존합니다.

Amendment2만의 unit4025·render797·react18 797·verify4866 통과는 round-2/pre-amendment-3에 중간 증거로 보존하며 최종 결과로 합산하지 않습니다. 핵심 단위36개와 React18·19 렌더 각16개가 통과한 뒤, Amendment3까지 반영한 최종 소스로 다음 관문을 순차 완료했습니다.

| 최종 관문 | 파일 | 통과 | 실패 | 비고 |
| --- | ---: | ---: | ---: | --- |
| unit | 613 | 4,041 | 0 | 기존 todo1 |
| render | 137 | 799 | 0 | React19, exit0·처리되지 않은 오류0 |
| react18 | 137 | 799 | 0 | 별도 실행, exit0·처리되지 않은 오류0 |
| verify | 755 | 4,884 | 0 | 기존 todo1, 중복 포함 |
| Storybook | 100 | 251 | 0 | 별도 브라우저 시험 |
| production | 10 | 21 | 0 | 최종 build 뒤 재실행 |

lint·typecheck·build도 exit0입니다. 단위·렌더 뒤에는 도우미 JSDoc만 보강했고 실행 코드는 바꾸지 않았으며 verify는 그 주석까지 반영한 소스로 실행했습니다. 원시와 최종 소스63개 해시는 [2차 code-gates](raw/ir-6/code/round-2/code-gates.json)에 있습니다. `node packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/code/check-code-gates.mjs --round=2`가 원시·해시·포착 관문을 대조합니다.

### 공개 선언 관문의 보강과 양성 대조

기존 보수적 추적기는 공개 이름97개와 dist/index.d.ts 바이트가 같아도 내부 FieldNodeRuntime 전체와 새 ValidationCadence를 따라가 추가6·제거2의 AST 차이를 잡았습니다. 이 [원래 결과](raw/ir-6/code/round-2/public-declarations.json)는 지우지 않았습니다. 실제 경로는 공개 노드 → NodeSurface → NodeDiagnostics → FieldNodeRuntime<unknown>['diagnostics']이며, 97개 루트 중73개가 이 경로로 diagnostics만 선택하고24개는 런타임에 도달하지 않습니다. validationQueued·validationCadence·validationRun·ValidationCadence를 선택하거나 런타임 전체를 노출하는 공개 루트는0입니다.

코디네이터 msg_278fcc9f4950의 승인(msg_f0f5dd4389d5) 조건에 따라 비교기를 보강했습니다. TypeScript가 계산한 indexed-access 멤버를 직접 비교하고 그 멤버의 타입 선언을 계속 추적하며, 전체 런타임 또는 변경 내부 멤버가 노출되면 실패합니다. 각 공개 루트의 구체 경로와 선택 멤버를 모두 보존한 [평가 비교 결과](raw/ir-6/code/round-2/evaluated-public-declarations.json.gz)는 도달55파일·선언서명917개·의미 차이0입니다. 공개 선택 선언의 주석만의 차이도0이며, 내부 런타임 모듈의 바이트 차이는 선택되지 않은 필드 변경으로 원래 결과에 남습니다.

저장소 밖 scratch 복사본에서 실제 선택 멤버 diagnostics의 타입을 FieldNodeDiagnostics에서 number로 바꾸자 비교기가 exit1·추가1/제거9로 검출했습니다. 원상복구한 scratch는 exit0·차이0이며 제품은 수정하지 않았습니다. [양성 대조 조건](raw/ir-6/code/round-2/declaration-controls.json), 변경·복원 원시를 함께 보존합니다. 이 대조를 통과한 평가 결과를 공개 선언 관문 증거로 사용합니다.

### 최종 FCA와 원장

FCA 원시는 기준 facd72a71과 최종 소스를 비교합니다. 독립 timing fractal 추가로 마디는376→382, fractal80→81이지만 새 finding·진단은0입니다. scan201·validate202·verification21·진단177을 유지하고 절대 상태 indeterminate와 기존 실패12·skipped1도 보존합니다. 후보 facts는 exact1,699, missing/needsResolution/uncertain/toolError/unadjudicated0, unsupported175입니다. [2차 차분](raw/ir-6/code/round-2/fca-diff.json)은 기존 네 동적 표 위치의2줄 이동 세 finding만 정규화하고 원시 차이도 보존합니다.

원장 최종 검사는 ref-check 문제0, verbatim 불일치0, sup 불일치0·unparsed0, doc-coverage25문서·무태그0·기존 uncited66/문제66입니다. [원장 결과](raw/ir-6/code/round-2/ledger-checks.json)에 명령과 원시 요약을 보존합니다. VALIDATE-052 신규 색인 삽입 이외의 병합 원문 prefix와 소유자 발화9–18의 바이트 동일성, 버전·패키지 공개 진입점 무변경을 확인했습니다.

## 성능 관문 상태

G1–G6와 소유자 목표의 L·E·F 비교는 미측정입니다. 독립 코드 검토에서 `code accepted; window clear`를 받은 뒤 amendment A5의 사전 규칙을 커밋하고 정식 창을 시작합니다. 현재 표본 수0이며 코드 관문 통과를 성능 통과로 읽지 않습니다.

## 미결 항목

- W6/R-g: 5차에서 수정했습니다. 교체된 각 load의 경고 중복 범위를 보존하므로 서로 다른 load의 같은 경고는 각각 보고합니다.
- 소유자 예약 단계(Q30): #508 뒤 초기값 대비 차이 속성을 설계하고 상태 이름을 검토하여 다음 릴리스 전에 반영합니다. IR-6 범위 밖이며 버전과 릴리스는 소유자가 정합니다.
- W7 수용 한계: Always의 루트 input이 자체 mount layout effect에서 validate()하면 같은 commit에서 판정이 한 번 추가 실행됩니다. 기존 명시적 validate와 Always의 즉시 첫 판정을 모두 유지합니다.
- W8 수용 한계: Always inline 판정 뒤 조상 mount layout effect가 쓰면 그 판정이 무효화되어 최초 판정은 한 프레임 뒤 도착할 수 있습니다. 조상 effect보다 뒤의 추가 동기 flush 기계를 넣지 않습니다.

- R5 수용 한계: 같은 프레임 안의 쓰기 뒤 unmount하면 은퇴한 트리 검증이 한 번 실행됩니다. 판정은 구독자에게 배달되지 않고 실패는 호스트 싱크에만 도착합니다. cleanup 취소로 Suspense·Activity 숨김도 취소하는 것을 피하기 위해 한 실행 절감용 suspend/resume 기계를 추가하지 않습니다.
- R6 계약: explicit validate는 호출 시점 snapshot의 판정을 반환합니다(VALIDATE-006). submitForm은 await validate 전에 outputValue를 캡처하고 바로 그 값을 제출합니다. 새 커밋의 발행은 stamp·commit 검사가 보호하며 반환 재시도는 하지 않습니다(Q24).
- R4 기존 의존 선례: slot은 common-utils의 scheduleCancelableMacrotask를 그대로 사용합니다. 공개0.16.1도 같은 scheduler의 scheduleMacrotask를 BranchStrategy의 promiseAfterMicrotask에서 사용했으므로 새 환경 요구가 아닙니다(R-e, Q26).
- if 게이트의 렌더 중 전체 컴파일(G), 검증 계산량 자체, virtualization 기본 off와 기존 useChildFields 결함은 범위 밖입니다.
- 실제 브라우저 측정은 production React19.2.6을 대상으로 하며 React18 브라우저 레인은 측정하지 않습니다.

판정: 2차 코드 관문 통과, 독립 검토 대기, 측정 전


## 3차 수정 — Amendment 4·5

이 절의 React 표시 기억과 commit-only 폐기 설명은 당시 구현 기록입니다. 현행 계약은 아래5차 엔진 기준과 최신 commit 재요청 규칙이 대체합니다.

계약은 제품 변경 전에9e7736434로 커밋했습니다. 원문19를 맥락과 줄바꿈까지 request에 보존했고 상한은100ms입니다. 디바운스는 FieldInput이 소유하며 엔진은100ms 문턱 아래의 실시간감을 지킵니다. cap 뒤 watch, 첫 watch 프레임 상한 검사, 실제 시작한 run만 시계 갱신을 반영했습니다. 주기 구현은 utils/cadence, 형은 types, 슬롯은 utils/slot으로 git mv했으며 frame loop의 callback wiring과 순수 결정 함수로 import 순환을 없앴습니다.

쓰기 pending과 내부 정착 구독은 validation→engine→surface 래퍼→core로만 연결합니다. 현재 stamp의 라우팅·동일 판정·null·commit-only 폐기·실패와 명시적 루트 판정은 보류를 풀고 하위 트리 검증은 보존합니다. unavailable·폐기·새 요청 없는 stamp 무효화(비OnChange reset 포함)는 정착합니다. 같은 동기 콜백의 라우팅 뒤·배달 전에 한 번 통지하며 공개 사건·revision·패키지 진입점은 그대로입니다. 표시 셋은 한 useErrorVisibility를 공유하고 직전 layout commit의 노드별 기억, 서버 false snapshot, 보류 중에만 하는 내부 구독을 사용합니다. 이미 보이는 오류의 지연은 유지하고 새 표시는 현재 판정까지 보류하며 숨김은 즉시입니다. 동기 연속 입력은 다음 cap에서 풀리며 stale 비동기 실행은 후행까지 기다릴 수 있습니다. 새 요청 없는 commit-only 폐기는 이전 판정을 드러낼 수 있습니다.

Always는 state 없는 checkShowError()를 render에서 읽어 layout effect가 캡처하며 자식 layout 쓰기가 먼저여도 inline root.validate로 최신 커밋을 한 번 판정합니다. 동기 검증기는 첫 프레임 전에 표시하고 다른 모드는 기존 슬롯을 유지합니다. G5 mountFixture의 Form은 showError를 지정하지 않아 기본 DirtyTouched이며 Always인 마운트 행은 없습니다. U3가 해당 행의 컴파일을 첫 프레임 안으로 옮기지 않습니다. 이는 소스 설정 확인이며 정식 표본은0입니다.

### 2차 독립 검토의 각 finding 처리

Opus 검토는 conditional pass이며 P1은0이었습니다.

- P2-1: V1의 정확한 git mv 배치와 소유 계약 문장으로 수정했습니다.
- P2-2: reconnect 기록별 try/catch·호스트 보고로 뒤 기록과 owed 재예약을 보존했습니다.
- P3-1: 상한 실행도 watch로 돌아가 quiet 프레임 중복 실행을 없앴습니다.
- P3-2: 수동 프레임 helper는 setTimeout·clearTimeout만 fake하며 stall 사례만 시간을 전진합니다.
- P3-3: 생성자의 callback wiring과 순수 phase 결정으로 helper import 순환을 없앴습니다.
- P3-4: 숨긴 교체 load의 기록을 새 기록 앞에 원래 root와 함께 옮깁니다.
- P3-5: write DETAIL 문구는 계약 선행 커밋이 아니라 제품 aceed2c95에 함께 실렸던 사실을 기록합니다.

Codex 검토는 P0·P1이0이며 P2 다섯·P3 셋이었습니다.

- F1: cap 뒤 watch와 quiet 프레임 실행0 회귀로 수정했습니다.
- F2: 첫 watch→carry 프레임도100ms 경과를 검사합니다.
- F3: reconnect의 한 onError가 던져도 폼과 후속 기록을 유지합니다.
- F4: 숨긴 load를 rebuild해도 미전달 기록을 한 번 전달하고 각 원래 root를 유지합니다.
- F5: 수동 프레임 시험의 fallback 타이머를 독립 제어합니다.
- F6: stamp로 버린 자동 callback은 cap clock을 옮기지 않는 boolean 계약으로 수정했습니다.
- F7: jsdom·Storybook은 두 프레임+매크로태스크 뒤 pending이 끝날 때까지 유한 반복하고 보류된 비동기 경합 중간 단계만 frame-only 대기를 사용합니다.
- F8: Form.policies의 교체 validator compile 단언을 rerender 직후로 복구했습니다.

### 수정 전 재현과 실제 브라우저 검사

정확한2차 제품20c1c9af8과 그 settle helper를 임시 복원하고 새 회귀만 남겨 실행했습니다. React19 최초 집중 검사24개에서16개가 실패했고, 최종 Always compile·cascade 사례까지 포함한38개는 React18·19 각각18개가 실패했습니다. 오류 깜빡임·동일/새 메시지·무검증기·throw/compile·연속 입력·2000필드·배열 기억·Always·reconnect·숨김 rebuild가 포함됩니다. 구버전에서 조기 실패한 failure-release 두 사례는 뒤 호스트 오류2개도 남겼으며 후보 최종 결과와 구분합니다. 최종 단위19개 중16개 실패는 새 pending API 부재15개와 건너뛴 callback의 상한 시계1개입니다. 별도로 주기 수정 전에는100ms 스트림·cap 뒤 quiet·지연 watch·실제 시작 시계 네 회귀가 실패했습니다. 모든 후보 원문은 복구했습니다. 원시는 round-3 아래 보존합니다.

실제 Chromium의 새 CSF 스토리3개는 MutationObserver로 error 노드의 모든 텍스트 추가·변경과 key→settle 프레임 표본을 모았습니다. DirtyTouched는 먼저 touch한 required 상태에서 유효해지는 키, Touched는 미접촉 minLength 상태에서 c와 Tab을 연속 전송하는 자연 경로입니다. Tab handler에서 pending=true를 확인했고 이전 오류 표시는 관측되지 않았습니다. 같은 메시지 유지 사례도3프레임 안에 드러났습니다. 코디네이터 msg_5172e6debb16의 자연 경로 지시를 따랐으며 override 대체는 필요하지 않았습니다. 이미 보이던 오류의 accepted lag는 별도 렌더 회귀로 유지합니다.

3차 전체 관문·선언·FCA·원장 결과는 검증 중이며 정식 측정 창은 시작하지 않았습니다.

전체 unit 첫 실행은615파일·4059통과·2실패·기존todo1이었습니다. 내부 surface export 명시 목록에 승인된 pending query/subscriber 두 이름을 반영하고, 일반 입력 쓰기당 layout effect0회가4회로 늘어난 원인은 표시 기억 훅의 새 배열 참조로 확인했습니다. 노드 목록은 얕은 identity 비교로 안정화하고 표시 bit열이나 노드가 바뀔 때만 layout commit하여 기존0회 단언을 수정 없이 통과했습니다. 표시 기억은 여전히 render에서 쓰지 않습니다. 실패 원시와 두 수정의 집중 통과 원시를 보존하며 전체 순차 관문은 이 수정 뒤 재실행합니다.

코디네이터 msg_cc8e08d106e0은 U2의 구조 비용을 조건부 승인했습니다. 배열 항목 마운트는 자식 마운트 계수·input commit·renderer 표시 기억 commit·input 표시 기억 commit으로4회이며 종전보다2회 늘어납니다. 일반 입력 쓰기0회 조건은 그대로 유지합니다. G8은 기본 표시의 mount-array-1000 None·OnChange 행 쌍(E/F, L 병기)이며 None의 first-painted·eager-painted 중앙값 F/E≤1.02, OnChange의 F≤E를 요구합니다. 실패하면 병합하지 않고 기존 effect 통합과 엔진 대안 중 코디네이터 결정을 기다립니다. 이 조건을 D1 설계와 정식 창 전 사전 규칙 의무에 추가했으며 아직 표본0입니다.

추가 remount 회귀는 React18·19 모두 이미 보이던 오류의 input.errorVisible이 pending 중 version remount에서 false가 되는 실패를 재현했습니다. 안정된 노드별 입력 wrapper factory에 commit 기억 ref를 보유하고 공통 표시 훅만 layout에서 갱신하여 고쳤습니다. 이미 보이던 표시와 새로 보류한 표시 두 경우가 모두 remount 전후 같은 값을 유지합니다. renderer 기억은 기존 FieldProxy 수명에 남고 입력은 독립 subscription을 유지합니다. 초기 마운트4회 회귀와 함께 집중 검사3개가 통과했으며 이 최종 제품으로 전체 순차 관문을 다시 시작합니다.

### 3차 최종 코드 관문

최종 제품은 ba4b6c1044908f931db44fd6dbabc27b849782f7이며 계약9e7736434·c993fe039·23b1e7d44가 앞섭니다. 다음 지정 관문은 최종 실행 코드로 순차 수행했습니다. 단위·렌더·React18 이후에는 공통 표시 훅의 JSDoc 매개변수 이름만 바로잡았고 실행 코드는 바꾸지 않았습니다.

| 관문 | 파일 | 통과 | 실패 | 비고 |
| --- | ---: | ---: | ---: | --- |
| unit | 615 | 4,061 | 0 | 기존 todo1 |
| render | 140 | 824 | 0 | React19, 처리되지 않은 오류0 |
| react18 | 140 | 824 | 0 | 별도 실행, 처리되지 않은 오류0 |
| verify | 760 | 4,929 | 0 | 기존 todo1, 다른 관문과 중복 |
| Storybook | 101 | 254 | 0 | 실제 Chromium, 자연 key→Tab 포함 |
| production | 10 | 21 | 0 | 최종 build 뒤 다시 실행 |

lint·typecheck·build는 exit0이며 runtime 번들과 agents-hashes는 지정 build로 생성하고 소스 커밋에는 넣지 않았습니다. [3차 코드 관문](raw/ir-6/code/round-3/code-gates.json)은90개 소스 해시, 최종 번들 해시, 각 원시와 순서를 기록합니다. `node packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/code/check-code-gates.mjs --round=3`가 포착 결과와 현재 소스를 대조합니다. 이 명령은 시험을 재실행하거나 성능을 판정하지 않습니다.

평가 공개 선언은97개 루트·55개 도달 파일·917개 서명에서 의미 차이0, index.d.ts 바이트 차이0입니다. 각 루트의 경로와 실제 선택 diagnostics 멤버를 보존하고 전체 runtime·변경 내부 멤버·cadence 노출0과 unresolved0을 확인했습니다. 새 private validationPending·validationSettleListeners도 노출 검사의 대상에 추가했습니다. 저장소 밖 선택 멤버 변이의 양성 대조는 추가1/제거9·exit1이고 복원은 차이0·exit0입니다. [선언 비교](raw/ir-6/code/round-3/evaluated-public-declarations.json.gz), [대조 조건](raw/ir-6/code/round-3/declaration-controls.json)과 보수적 원래 추적기의 내부 변경 추가8/제거2도 함께 보존합니다.

FCA는 같은 snapshot75552ed038a51e99f71c9cbf6961c7f155b73383006237257d18c96ce6023314에서 scan·6범위 validate·verification을 수행했습니다. 후보 facts1714개는 모두 exact이며 missing·needsResolution·uncertain·toolError·unadjudicated0, unsupported175는 유지합니다. 마디384(organ303·fractal81), scan201·validate202·verification21·진단177이며 새 finding·진단은0입니다. 절대 상태 indeterminate, 기존 실패12·skipped1은 그대로 기록합니다. [FCA 차분](raw/ir-6/code/round-3/fca-diff.json)은 원시 차분을 보존하고 기존 동적 표 선언 네 위치의 줄 이동만 정규화합니다. 네 선언 원문이 같은 [대조](raw/ir-6/code/round-3/dynamic-table-line-controls.json)도 있습니다.

원장 검사는 ref-check 문제0, verbatim 불일치0, sup 불일치0·unparsed0입니다. doc-coverage는25문서·무태그0·기존 uncited66/문제66으로 새 문제는 없습니다. 병합 문서 prefix와 허가된 VALIDATE-052 신규 색인 행 이외의 원장 prefix, 소유자 원문9–19의 맥락·줄바꿈, 패키지 버전과 공개 src/index 보존을 [별도 대조](raw/ir-6/code/round-3/history-and-quotes.json)로 확인했습니다. 소비자 문서와 영문 agents knowledge는100ms 주기, 새 표시 보류, 비동기 연속 입력, Always 최초 판정과 unknown·raw 목록을 설명합니다.

판정: 3차 코드 관문 통과, 독립 검토 대기. 성능 G1–G6·G8과 소유자 목표의 L·E·F 비교는 아직 미측정이며 표본0입니다. `code accepted; window clear`를 받은 뒤 A5·G3·G6·G8을 포함한 사전 규칙을 커밋하고 정식 창을 시작합니다. worker_done은 아직 보내지 않습니다.


## 4차 수정 — Amendment 6

이 절의 W1/W2 React 기억 및 W6 한계는 당시 기록이며 아래5차 엔진 기준·load별 중복 억제가 대체합니다.

계약62d3999ae를 제품보다 먼저 커밋했습니다. 3차 검토의 모든 Fix를 반영하며 Record 세 건은 위 미결 항목과 RootNodeContext DETAIL에 이유를 기록했습니다. 성능 표본은0이고 측정 창은 열지 않았습니다.

### 3차 독립 검토 finding 처리

- codex P1-1 → W3: 실제 사슬 끝 요청과 같은 조건으로 validation 도메인이 공개 배달 전에 pending을 기록하고 요청 취소 시 자신이 기록한 stamp만 정착합니다. flushSync subscriber와 React18 legacy root의 이벤트 밖 쓰기 회귀로 확인합니다.
- codex P1-2 → W2: 새 표시의 layout commit에서 pending을 다시 읽고 자식 layout 쓰기가 시작한 보류를 paint 전에 재렌더합니다. wasVisible은 render에서 캡처하여 옛 remount cleanup과 구분합니다.
- codex P1-3·P2-8, Opus P2-1 → W1: FieldRendererProvider가 renderer/input/childErrors별 WeakMap을 한 번 만들고 각 표시의 layout commit·cleanup이 기억을 쓰고 삭제합니다. 상위 remount는 render에서 이전 기억을 읽으며 실제 숨김은 지웁니다. wrapper 전용 ref와 prop은 제거했습니다.
- codex P2-4 → W5: 원래 root의 기록 귀속을 유지하면서 활성 load.root에도 observer guard를 적용합니다. 실제 오류 서비스의 onError에서 현재 FormHandle 쓰기가 거부됩니다.
- codex P2-5 → W6: 숨긴 두 교체 load의 동일 경고 중복 억제는 수용 한계로 기록했습니다.
- codex P2-6 → W7: Always 루트 input 자체 mount 검증의 한 번 추가 실행은 수용 한계입니다.
- codex P2-7 → W8: 조상 mount 쓰기의 inline 최초 판정 무효화와 한 프레임 지연은 수용 한계입니다.
- codex P2-9 → W4: mount helper는 engine이 보고하거나 숨김 버퍼에 둔 검증 실패를 다시 capture하지 않습니다. MultipleErrors의 소비자 handler 꼬리만 호스트로 보냅니다. 비동기 mount 실패의 복원 후 onError1회와 던지는 onError의 호스트1회를 확인합니다.
- Opus P3-2 → W9: Always 값은 앞선 layout effect가 ref에 반영하고 connect effect는 ref를 읽어 정책만 바뀔 때 재연결하지 않습니다.
- Opus P3-1 → W10: 'valid'만 통과하는 검증기에 still-invalid 값을 쓰고 직후 빈 텍스트·제출 뒤 오류·pending=false를 단언합니다. pending 정착을 막은 양성 대조는 오류 텍스트 단언에서 실패했으며 원복했습니다.
- codex P3-10 → W11: 실제 key→Tab 경로에서 story가 비동기 verdict를 명시적으로 보류하고 실제 onChange 쓰기부터 프레임을 셉니다. MutationObserver와 프레임 샘플은 이전 오류를 관측하지 않았습니다.
- codex P3-11 → W12: idle helper는 write-pending만 대상으로 문서화하고 비동기 mount 시험은 시작·완료 promise를 기다립니다. test 전용 product export는 없습니다.
- codex P3-12 → W13: core 바인딩의 실제2000필드 Form에서 holding 표시3개만 listener set에 들어가고 각각 정착 콜백 한 번을 받는지 검사합니다.
- Opus P3-3 → W14: README·영문/국문 SPEC·QUICK_REFERENCE·agents knowledge의 custom UI 지침은 errorVisible과 useChildFieldErrors().showErrors를 가리킵니다.

### 수정 전 재현과 집중 확인

정확한3차 제품 c4d3ec4e3에서 React18 최종 집중15개 중10개가 실패했습니다. 상위 remount와 숨김 후 재표시, 같은 commit의 자식 보정(독립 훅·Form), 공개 배달 중 flushSync·legacy root, 비동기 mount 실패·던지는 handler·교체 load observer guard·Always 정책 재연결입니다. React19는 legacy root를 제공하지 않아 해당 한 사례를 명시적으로 skip하며 나머지 회귀는 같은 원인으로 실패했습니다. W13 구독 수 특성 검사는 기준에서도 통과하므로 신규 실패 증거로 세지 않습니다. 코어 pending-before-delivery와 취소 요청 정착 두 단위 회귀는 기준에서 실패했습니다. 원시의 중간 fixture와 최종 fixture를 구분하여 보존합니다.

후보의 집중 검사는 React18 30개 통과, React19 29개 통과·legacy1개 skip, 코어 pending17개 통과, 실제 Chromium 스토리3개 통과입니다. 최초 typecheck에서 시험 Context 형·event 형·미사용 지역 변수 오류를 발견해 수정했으며 제품 동작 변경은 없었습니다. 전체 최종 관문은 아래에 별도로 기록합니다.

### 4차 최종 코드 관문

최종 제품은 decbc967f9d8211b2572e974633c7329070b07e2이며 계약62d3999ae가 앞섭니다. 지정 관문은 같은 최종 실행 소스로 아래 순서대로 서로 겹치지 않게 실행했고 production은 최종 build 뒤 다시 실행했습니다.

| 관문 | 파일 | 통과 | 실패 | 비고 |
| --- | ---: | ---: | ---: | --- |
| unit | 616 | 4,063 | 0 | 기존 todo1 |
| render | 143 | 834 | 0 | React19 legacy root 부재1개 skip, 처리되지 않은 오류0 |
| react18 | 143 | 835 | 0 | legacy root 포함, 처리되지 않은 오류0 |
| verify | 764 | 4,941 | 0 | 기존 todo1·React19 legacy1개 skip, 다른 관문과 중복 |
| Storybook | 101 | 254 | 0 | 실제 Chromium, 명시적으로 판정을 보류한 자연 key→Tab 포함 |
| production | 10 | 21 | 0 | 최종 build 뒤 재실행 |

lint·typecheck·build도 exit0입니다. 배열 항목 마운트 layout effect4회·일반 입력 쓰기0회 회귀를 유지했습니다. 소스102개 해시와 최종 번들 해시, 각 관문 원시는 [4차 code-gates](raw/ir-6/code/round-4/code-gates.json)에 있습니다. `node packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/code/check-code-gates.mjs --round=4`가 포착한 원시·해시·관문 결과를 대조하며 시험이나 성능 측정을 다시 실행하지 않습니다. 생성 dist와 agents-hashes는 소스 커밋에 포함하지 않았습니다.

평가 공개 선언은97개 루트·55개 도달 파일·917개 서명에서 의미 차이0, index.d.ts 바이트 차이0입니다. 공개 루트73개는 diagnostics만 선택하고24개는 runtime에 도달하지 않으며 whole-runtime·변경 내부 멤버·cadence 노출과 unresolved는 모두0입니다. validationPendingEntryStamp도 노출 검사에 포함했습니다. 보수적 원래 추적기의 내부 차이 추가9/제거2는 [원래 결과](raw/ir-6/code/round-4/public-declarations.json.gz)에 보존합니다. 저장소 밖 scratch의 실제 diagnostics 타입 변이는 추가1/제거9·exit1, 원상복구는 차이0·exit0입니다. [평가 비교](raw/ir-6/code/round-4/evaluated-public-declarations.json.gz)와 [양성 대조](raw/ir-6/code/round-4/declaration-controls.json)를 함께 보존하며 [주석 포함 비교](raw/ir-6/code/round-4/public-comments.json)에서도 차이는 없습니다.

FCA는 snapshot f8d1fa57c142a328e8520ad23cd39da6f5cdf901f9fb583a485781834b0db90a에서 scan·6범위 validate·verification을 수행했습니다. facts1721개가 모두 exact이고 missing·needsResolution·uncertain·toolError·unadjudicated0, unsupported175는 유지합니다. 마디385(organ304·fractal81), scan201·validate202·verification21·진단177이며 신규 finding·진단0입니다. 절대 상태 indeterminate·기존 실패12·skipped1도 유지합니다. [FCA 차분](raw/ir-6/code/round-4/fca-diff.json)은 기존 동적 표 선언 네 위치의 줄 이동만 정규화하고 원시 차분을 함께 보존합니다.

원장 검사의 ref-check 문제0, verbatim 불일치0, sup 불일치0·unparsed0입니다. doc-coverage는25문서·무태그0·기존 uncited66/문제66으로 새 문제는 없습니다. 병합 문서 prefix, 허가된 VALIDATE-052 색인 행 이외의 원장 prefix, 소유자 원문9–19의 맥락·줄바꿈, 패키지 버전과 공개 진입점 보존은 [대조 기록](raw/ir-6/code/round-4/history-and-quotes.json)에 있습니다. 기준에서 실패한 사례의 이름과 후보 fixture 수정·pending 양성 대조는 [재현 기록](raw/ir-6/code/round-4/failure-observation.json)에 구분했습니다.

판정: 4차 코드 관문 통과, 독립 검토 대기. 성능 G1–G6·G8과 소유자 목표의 L·E·F 비교는 미측정이며 표본0입니다. `code accepted; window clear` 뒤 사전 규칙을 먼저 커밋하고 정식 창을 시작합니다. worker_done은 아직 보내지 않습니다.


## 5차 수정 — Amendment 8 v3

계약3e24757c0·18c55f51d·69c1c2f05가 제품보다 앞섭니다. Amendment7의 공개 전 X1 계약 두 커밋과 React 기억 초안은 승인에 따라 폐기·대체했습니다. X3는 false→true pending을 만든 사슬만 entry stamp를 소유하도록 유지합니다. React 표시 기억·layout effect는 제거하고 엔진 state 참조·enabled 및 Form 정책 box를 첫 쓰기 전에 기록합니다. holding display만 정착을 구독하고 pending은 useSyncExternalStore 반환값으로 읽으며 서버 snapshot은 false입니다. 노드 기준 기록은 scheduling을 import하지 않고 owed만 표시하며 write의 최외곽 종료·standalone 진입과 정책 연산이 기존 slot으로 drop을 예약합니다. generation이 바뀌면 모두 유지하고 재예약하며 settle은 listener 전에, unavailable·dispose는 pending 여부와 관계없이 기준을 지웁니다.

R-a는 현재 stamp의 commit-only 폐기에 targets를 다시 합쳐 cadence.request를 호출하고 최신 판정까지 hold합니다. explicit root도 OnChange이면 pending 여부와 관계없이 write 통로로 재요청하여 비동기 mount 중 context 변경의 기존 facd72a71 공백을 닫습니다. validate 반환과 submit 값은 호출 시점 snapshot 계약을 유지합니다. structurally equal setValue도 참조를 유지한 채 commit이 전진하므로 같은 재요청으로 검증합니다.

R-f/R-g는 숨긴 load 교체 시 reset 사슬 끝에서 옛 buffered 기록 뒤 새 reset 기록을 즉시 전달하고 원래 root와 load별 warning scope를 보존합니다. 공개 FormErrorRecord 형은 바꾸지 않습니다. R-h의 compile 실패 rejected→sink는 기존 ERROR-019 항목3·5와 Q12의 쓰기 선행 처리에 따릅니다. 소유자 예외로 분류하지 않습니다. hidden 자식은 값·검증을 유지하여 child-errors aggregate에 포함되고 inactive 자식은 값 제거·off-branch 라우팅 제외로 오류가 없습니다. codex round4의 hidden 집계 finding은 결함이 아닙니다(Q27).

알려진 표시 한계: 외부 provider 정책 및 hook disabled는 엔진에 기록되지 않아 즉시 현재 판정을 표시합니다. transition 지연은 이전 판정을 드러낼 수 있습니다. 느린 validator 중 context 내용의 commit-only 연속(새 함수·Date·Map·class identity 포함)은 멎을 때까지 hold합니다. paint 뒤 drop 전 약1~2프레임에 새 쓰기가 시작되면 새 표시를 verdict까지 hold합니다. React-only remount·restore·mirror·virtualization은 엔진 기준이 허용한 이전 오류를 지연 표시합니다.

### 변경한 시험 기대와 절차 전체 목록

- validation.visibility의 이미 보이는 오류, validation.reveal-lifetime W1 조상 remount, validation.remount의 visible=true: reveal과 write 사이 한 frame+task를 추가하여 painted 오류를 모델링했습니다. 기대값은 유지했습니다.
- validation.pending의 automatic commit-only discard와 explicit root commit row: 즉시 pending=false·정착1회에서 pending=true·정착0회로 바꾸고 최신 cadence 판정 뒤 정착1회를 단언합니다.
- arrayMountLayoutEffects: 항목별4회를2회(200개×2)로 복원하며 ordinary write0회는 유지합니다.
- validation.mount-owed의 hidden rebuild: reconnect 전 onError0회에서 reset 사슬 끝1회로 바꾸고 reconnect 뒤 추가0회를 확인합니다. bufferedRecords fake service에는 private warning scope fixture만 추가했습니다.
- visibility.commit: React map 인자를 제거하고 실제 ErrorVisible 구독·자식 보정 경로로 fixture를 바꿨으며 stale 오류가 보이지 않는 기대는 유지했습니다. surfaceIndex는 내부 바인딩 이름3개만 추가했습니다.
- 공개 전 Amendment7 초안의 Activity/Suspense restore·virtualization: pending 중 blank에서 엔진 기준이 허용한 이전 오류 표시로 변경했습니다. remount·mirror의 연속 표시 기대는 유지하며 React map/refcount 전용 시험은 제거했습니다. child hook의 hidden/re-show는 aggregate에 hidden 오류를 계속 포함하고 기준이 허용한 lag를 표시하도록 바꿨습니다.
- Touched blur fixture는 실제 ShowError.Touched 정책을 사용합니다. painted 뒤 다른 필드 쓰기는 첫 필드 오류를 매 frame 유지하고, drop 전 같은 필드 쓰기는 새 판정까지 hold하는 별도 절차로 구분했습니다.

전체 순차 코드 관문·선언 비교·FCA·원장 결과는 아래 최종 관문에 기록합니다. 성능 표본0이며 code accepted; window clear 전에는 측정하지 않습니다.

### 수정 전 실패 증거

정확한 검토 기준07c4d5d93의 실행 제품52개 해시를 대조하고 기준 소스를 복원한 채 새 시험을 실행했습니다. unit15개 중9개가 실패했습니다: X3 reverting chain, 자동 commit-only 재요청, pending이 없던 async mount 재요청, equal-content setValue commit과 engine 기준 기록·다음 paint drop·generation 변경·clearSubtree·enabled 기록·폐기입니다. 최종 flag 재예약 사례를 더한 기준 단위10개는6개 실패·4개 통과였습니다.

React19 최초10개 중6개, React18의 같은 display/reset 및 retry12개 중8개가 실패했습니다. 같은 task·같은 paint 전 다른 task의 state reveal과 policy reveal 네 사례, rAF 안에서 기록한 limit(iv), hidden reset의 load별 경고 두 건, context async gap의 hold·최신 판정, pending이 없던 async mount의 최신 판정이 각각 실패했습니다. React19 retry 두 사례도 별도로 모두 실패했습니다. 실패 이름과 각 단계 원시는 [5차 재현 기록](raw/ir-6/code/round-5/failure-observation.json)에 보존했습니다.

후속 unavailable/no-pending drop 회귀는 후보의 누락을 먼저 실패시킨 뒤 수정한 검사이며 기준07 실패 증거로 세지 않습니다. retained-old-handle 회귀는 기준의 특성 검사이고 후보의 stale closure를 useHandle로 수정했습니다. 처음 작성한 blur fixture의 정책 숫자 오류와 painted 뒤 다른 필드·drop 전 같은 필드 절차를 구분한 수정, 내부 import 대신 공개 FormProvider·오류 기록 source 순서로 바꾼 fixture를 구분하여 기록합니다. root 귀속은 기존 bufferedRecords 내부 시험이 계속 검증합니다.

### 공개 주석 변경 범위

R-i의 문서 전용 변경은 FormProps.showError와 FormHandle.showError, FieldNodeState.ErrorVisible, FieldInputProps·UnknownFieldInputProps.errorVisible, FieldRendererProps.errorVisible의 pending reveal 규칙 및 FieldNodeState.Dirty·Touched 설명입니다. Dirty는 사용자 입력만 설정하고 programmatic·자동 쓰기는 설정하지 않으며 Touched는 최초 blur 뒤 유지되고 clear/reset만 해제합니다. __legacy__는 수정하지 않습니다. 공개 타입의 의미·이름·index 바이트 차이와 승인된 주석 차이를 별도로 대조합니다.

정적 검사 lint는 exit0·오류0이며 FormRoot의 useImperativeHandle에 showError·props.showError가 불필요하다는 exhaustive-deps 경고1개가 있습니다. 최신 정책은 useHandle이 읽으므로 stale closure는 회귀로 검증했고, 명시한 의존성은 표시 기억을 보유하지 않습니다.

### 5차 최종 코드 관문

| 관문 | 파일 | 통과 | 실패 | 비고 |
| --- | ---: | ---: | ---: | --- |
| unit | 618 | 4,078 | 0 | 기존 todo1 |
| render | 149 | 863 | 0 | React19 legacy root1개 skip |
| react18 | 149 | 862 | 0 | React19 Activity2개 skip |
| verify | 772 | 4,985 | 0 | 기존 todo1·React19 legacy1개 skip, 다른 관문과 중복 |
| Storybook | 101 | 254 | 0 | 실제 Chromium, 자연 key→Tab 경합 포함 |
| production | 10 | 21 | 0 | 최종 build 뒤 재실행 |

같은 최종 실행 소스로 지정 관문을 순차 실행했습니다. 배열 항목 mount layout은2×200이며 일반 쓰기0회입니다. 성능 G1–G6·G8과 L/E/F는 미측정이며 worker_done은 아직 보내지 않습니다.

제품 커밋은 b4fbec91fecf48bfba5fa9f74f589cb556ff6760입니다. lint·typecheck·build는 exit0이며 지정 build가 재생성한 dist와 agents-hashes는 소스 커밋에서 제외했습니다. [5차 코드 관문](raw/ir-6/code/round-5/code-gates.json)은139개 소스·최종 번들 해시를 고정합니다. `node packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/code/check-code-gates.mjs --round=5`는 포착한 결과와 현재 소스를 대조하며 시험·성능을 다시 실행하지 않습니다.

평가 공개 선언은97개 루트·55개 도달 파일·917개 서명에서 의미 차이0, index.d.ts 바이트 차이0입니다. 루트73개는 diagnostics만 선택하며24개는 runtime에 닿지 않습니다. 새 reveal 노드·runtime 필드를 모두 노출 검사에 포함했고 whole-runtime·변경 멤버·cadence 노출과 unresolved는0입니다. 저장소 밖 diagnostics 타입 변이의 양성 대조는 추가1/제거9·exit1이고 복원은 차이0·exit0입니다. 보수적 원래 추적기는 node set을 통해 내부 레코드·행에 도달하여 추가143/제거2를 내며 [원시](raw/ir-6/code/round-5/public-declarations.json.gz)를 보존합니다. 승인된 평가 게이트와 이를 구분합니다.

[주석 포함 대조](raw/ir-6/code/round-5/public-comments.json)는 위 R-i의5개 파일에서14개 선언 기록의 추가/제거 쌍을 확인했고 그 밖의 파일 변경은 없습니다. 의미 대조는 주석을 제거하여0이며, 공개 주석 차이0이라고 주장하지 않습니다. [양성 대조](raw/ir-6/code/round-5/declaration-controls.json)와 [평가 결과](raw/ir-6/code/round-5/evaluated-public-declarations.json.gz)를 함께 보존합니다.

FCA는 snapshot0b55365d9bdf71f03115e72159c51a5550366bd12f7ace8c71bb4043d5dc9a2a에서 scan·6범위 validate·verification을 수행했습니다. facts1741개는 모두 exact이며 missing·needsResolution·uncertain·toolError·unadjudicated0, unsupported175는 유지합니다. 마디386(organ305·fractal81), scan201·validate202·verification21·진단177이며 [차분](raw/ir-6/code/round-5/fca-diff.json)의 새 finding·진단은0입니다. 절대 상태 indeterminate·기존 실패12·skipped1을 보존하고 기존 네 동적 표 선언의 줄 이동만 정규화했습니다.

원장 검사는 ref-check 문제0, verbatim 불일치0, sup 불일치0·unparsed0입니다. doc-coverage25문서·무태그0·기존 uncited66/문제66으로 새 문제는 없습니다. [원장 결과](raw/ir-6/code/round-5/ledger-checks.json), [병합 prefix·원문9–30 및18b 바이트 대조](raw/ir-6/code/round-5/history-and-quotes.json), [기준 제품52해시 대조](raw/ir-6/code/round-5/reviewed-product-controls.json)를 보존합니다. 소유자 원문27–30의 trailing space 다섯 줄은 바이트 보존 지시 때문에 유지하며 다른 whitespace 오류는0입니다. 저장한 원시에는 머신 절대 경로가 없습니다.

판정: 5차 코드 관문 통과, 독립 검토 대기. 성능 G1–G6·G8 및 L·E·F는 미측정·표본0이며 code accepted; window clear 뒤 사전 규칙을 먼저 커밋하고 정식 창을 시작합니다.


## 5b차 수정 — Amendment 9 v3

계약72aeee232·f15d5a065·c996a993c·959da29d9가 제품보다 앞섭니다. 5차의 첫 기준·pending-only 표시를 release 이력으로 대체합니다. node는 공개 write/walk sequence당 한 pre-change entry를 기록하며 커밋된 Form 정책 이력과 generation 순서로 병합합니다. 조용한 drop은 예약 cutoff 이하만 제거하여 뒤 node의 append가 앞 node의 수명을 늘리지 못합니다. re-arm을 끝낸 뒤 release version을 증가시키고 복사 listeners를 마지막에 통지합니다. 정책은 root별 no-cleanup layout에서만 commit하고 FormRoot 핸들·deps는 facd 모양으로 복원했습니다. 공개 패키지 이름과 raw 오류 목록은 유지합니다.

D는 수락한 root explicit verdict에서 route·settle 뒤·delivery 전에 전체 이력을 별도 release합니다. standalone 상태 진입은 closeNonSettleEntry의 finally에서 drop을 예약하여 listener 실패 뒤에도 수명을 지킵니다. dispose는 release listeners를 settle 전에 지워 조용히 해제합니다. P3-8 helper는 chain의 deliverValidationWave 옆으로 옮겼고 equal-content commit의 진전을 무조건 단언합니다. 두-target 재요청 사례는 기존 구현의 특성 검사이며 targets re-add를 지우는 양성 대조가 실패해야 합니다.

숨긴 reset 재생성은 ERROR-019 항목2와 R-f의 chain-end 전달 대상입니다. 같은-schema reset을 포함한 다른 hidden post-mount 사슬은 기존처럼 buffer하며 R1이 reconnect에서 순서대로 전달합니다. 같은-schema hidden reset의 chain-end 전달은 소유자 미결로 남기고 동작을 바꾸지 않았습니다. R-h는 RootNodeContext·validation API Contracts 안으로 옮겼고 Last Updated를 마지막에 유지했습니다. 여섯 공개 문서에 macrotask fallback·100ms stalled-frame timer·if render compile·Always 정의·handler 격리·code span을 복원했습니다.

### 변경한 기대와 절차

- 제거한 pending 조회·정착 구독·정책 box 바인딩은 release history/policy/version/구독/commit으로 대체했습니다. engine 시험은 record runtime을 직접 읽고 helper settleValidation은 pending 및 node/policy 이력이 모두 없어질 때까지 기다립니다. stories 두 곳은 한 story-local private accessor helper를 사용합니다.
- 코디네이터 msg_29959ddbd70f의 승인으로 단일 readFieldNodeRuntime 검증 bridge만 surface accessor에 직접 닿습니다. 예외는 surface DETAIL에, 참조는 src DETAIL에 두고 importModel은 그 정확한 importer/target 한 쌍을 별도 계수·출력하며 다른 D 위반0을 유지합니다.
- visibility.commit은 visibility.same-commit으로 이름을 바꾸고 startTransition에서 reveal과 새 display mount를 같은 commit에 넣었습니다. child input의 layout 정상화 뒤에 놓인 layout probe가 이전 오류를 한 번도 읽지 않는지 확인합니다. 공개 e2e도 같은 paint probe와 새 verdict를 검사합니다.
- validation.reveal-baseline은 첫 기준 한 개 대신 write별 entries를 검사하고 뒤 세대는 자기 cutoff까지 남는 기대를 사용합니다. pending 시험의 구독은 settle 횟수 대신 release 횟수이며 accepted root D의 별도 release와 unavailable 해제를 셉니다. dispose는 callback1회에서0회로 바꿉니다.
- engine-reveal의 same-task state·policy 및 rAF reveal은 조용한 직후 old error 대신 빈 표시를 단언합니다. 외부 provider 정책 reveal도 pending old error 대신 빈 표시로 바꿉니다. blur 첫 frame+task는 빈 표시이며 painted 분기만 두 번째 frame+task 뒤의 적격 오류를 유지합니다.
- limit(v)의 같은-handler showError·clearState는 중간 조합을 두 generation에 기록하므로 두 frame+task 뒤 release를 기다립니다. 순서대로 별도 commit한 showError 후 clearState는 이미 적격했던 오류를 유지합니다.

### 수정 전 재현과 fixture 구분

최종 fixture로 b40bb47e5의 실행 제품을 복원하여 core history10개 실패와 React18·19 각각13개 중10개 실패를 확인했습니다. transition layout probe·Dirty resetInteraction·ErrorVisible off/on·quiet reveal·D root release·외부 정책·blur frame/task·limit(v)·suspended committed policy를 구분합니다. 단일 batch/committed-policy 순서/root rebuild는 특성 검사입니다. older07 실패도 별도 보존합니다. 최초 fixture의 brace/타입 오류·manual clock 대기·조건부 renderer memo가 suspension을 막은 문제·inline validator 교체로 root가 재생성된 문제는 fixture 수정이며 제품 실패 증거에 섞지 않습니다.

IR-5 hydration의 기존 None/StrictMode 렌더 수와 배열 filled-minus-empty mount2회·ordinary-write0회 집중 검사를 유지합니다. 현재 성능 표본0이며 code accepted; window clear 전에는 측정하지 않습니다.

최종 fixture 재현은 b40의 React18·19 각각13개 중10개 실패·3개 특성 통과입니다. 07에서는 각각13개 중6개 실패·7개 통과로 도입 시점을 구분합니다. 신규 코어 이력10개는 b40에서 모두 실패하고 07의 코어14개는10개 실패·4개 통과입니다(이 안에는 기존 R-a 세 사례와 새 두-target 사례가 포함됩니다). 두-target target re-add만 제거한 양성 대조는 선택한1개가 실패했고 원본을 복구했습니다.

추가 절차 변경: validation.visibility의 already-visible, reveal-lifetime W1의 children, useChildFieldErrors.binding의 첫 array-child 표시 단언을 frame+task 뒤로 옮겨 기대값은 유지했습니다. hidden child re-show는 aggregate만 old error를 유지하고 renderer/input은 중간 enabled=false 이력 때문에 release까지 빈 표시를 기대합니다. 표면 이름 목록은 새 release 바인딩을 검사합니다. hydration·array mount 기대값은 바꾸지 않았습니다.

### 5b 최종 코드 관문

| 관문 | 파일 | 통과 | 실패 | 비고 |
| --- | ---: | ---: | ---: | --- |
| unit | 619 | 4,089 | 0 | 기존 todo1 |
| render | 151 | 875 | 0 | React19 legacy1개 skip |
| react18 | 151 | 874 | 0 | Activity2개 skip |
| verify | 775 | 5,008 | 0 | 기존 todo1·React19 legacy1개 skip, 다른 관문과 중복 |
| Storybook | 101 | 254 | 0 | 실제 Chromium |
| production | 10 | 21 | 0 | 최종 build 뒤 재실행 |

지정 관문은150개 소스 해시를 고정한 같은 실행 소스에서 순차 수행합니다. 같은-commit probe·순서에 따른 정책/state 조합·node별 cutoff 수명·예외 finally·D root release·suspended policy·두-target 재요청·IR-5 hydration과 배열 mount를 포함합니다. 성능 G1–G6·G8은 미측정입니다.

제품 커밋은 b39eba42de3320583753e910a42908532643a77e입니다. lint·typecheck·build는 exit0이며 lint 경고0입니다. 지정 build가 다시 만든 dist·agents-hashes는 소스 커밋에서 제외했습니다. [5b 코드 관문](raw/ir-6/code/round-5b/code-gates.json)은150개 소스 해시·최종 번들 해시를 고정하며 `node packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/code/check-code-gates.mjs --round=5b`가 포착한 결과·선언·양성 대조·문서 parity·FCA 차분을 대조합니다.

평가 공개 선언은97개 루트·55개 도달 파일·917개 서명에서 의미 차이0, index.d.ts 바이트 차이0입니다. 루트73개는 diagnostics만 선택하며24개는 runtime에 닿지 않습니다. 전체 runtime·변경 내부 멤버 노출 및 unresolved0입니다. 저장소 밖 diagnostics 타입 변이는 추가1/제거9·exit1이고 복원은 차이0·exit0입니다. 보수적 원래 추적기의 내부 차이 추가150/제거2는 [원시](raw/ir-6/code/round-5b/public-declarations.json.gz)에 보존합니다. 승인된 의미 게이트와 구분하며 [주석 포함 대조](raw/ir-6/code/round-5b/public-comments.json)는 승인된5파일·8멤버의14개 기록 추가/제거 쌍입니다. 공개 주석 차이0이라고 주장하지 않습니다.

FCA는 snapshot7f38048a15b4645640c6bba4ef981f7136c44b0f1d35867a423d4072981adcf3에서 scan·6범위 validate·verification을 수행했습니다. facts1748개 exact, missing·needsResolution·uncertain·toolError·unadjudicated0이고 unsupported175는 유지합니다. 마디386(organ305·fractal81), scan201·validate202·verification21·진단177이며 [차분](raw/ir-6/code/round-5b/fca-diff.json)의 새 finding·진단0입니다. 절대 상태 indeterminate·기존 실패12·skipped1을 보존합니다. 동적 표 네 선언의 기존 줄 이동만 정규화했고 해당 세 파일의5차 소스 해시가 같은지 먼저 확인했습니다. Scan complete: 기준선의202개 구조 finding과21개 검증 finding 유지, 신규0개입니다.

원장 검사는 ref-check1416항목·문제0, verbatim327조각·불일치0, sup3584인용·불일치0·unparsed0입니다. doc-coverage25문서·1144항목·무태그0·기존 uncited66/문제66으로 새 문제는 없습니다. 최종 검사에서 발견한 VALIDATE-052 색인/본문 담당 문구 불일치는959da29d9에서 맞춘 뒤 같은 참조 검사를 다시 통과했습니다. [원장 결과](raw/ir-6/code/round-5b/ledger-checks.json), [prefix·원문9–30 및18b 바이트 대조](raw/ir-6/code/round-5b/history-and-quotes.json), [기준 복원·실행 소스 대조](raw/ir-6/code/round-5b/reviewed-product-controls.json)를 보존합니다. 새 변경 whitespace0이며 전체07 차분의 허가된 원문27–30 trailing space 다섯 줄은 보존했습니다. 원시의 머신 절대 경로0입니다.

절차를 이름별로 기록합니다: `isFieldNodeValidationPending`·`subscribeFieldNodeValidationSettled`·`readFieldNodeShowErrorBaseline`·`recordFieldNodeShowErrorBaseline` 및 정책 box·`resolveShowError`는 제거했습니다. `readFieldNodeRevealBaseline`은 node entries, `readFieldNodeRevealPolicy`는 committed policy와 entries, `readFieldNodeRevealVersion`은 release snapshot, `subscribeFieldNodeRevealReleased`는 candidate-only 구독, `commitFieldNodeRevealPolicy`는 root layout commit을 담당합니다. src/stories의 제거 이름 match0입니다. pending 구독 시험은 automatic compile의2 release, explicit pending settle와 D의 별도 release, 누적3회와 dispose0회를 명시적으로 단언합니다. helper·stories·surfaceIndex·importModel 예외1개 및 앞 절의 frame/task·hidden re-show·same-commit fixture 변경을 모두 절차 변경으로 기록합니다.

H의 다섯 한계는 현재 계약입니다. hook disabled는 즉시 현재 오류를 드러냅니다. state/enabled 렌더가 drop 뒤까지 지연되면 hold를 생략합니다. commit-only 연속 변경은 멎을 때까지 hold합니다. release와 paint 사이 task의 새 value write는1–2프레임 released verdict를 보일 수 있습니다. 한 React batch 사이에만 존재한 미표시 조합도 계산하며 engine state가 policy commit보다 먼저 정렬됩니다. hidden same-schema reset의 chain-end 전달은 소유자 미결이며 변경하지 않았습니다.

판정: 5b 코드 관문 통과, 독립 검토 대기. 성능 G1–G6·G8 및 L·E·F는 미측정·표본0입니다. `code accepted; window clear` 전에는 창을 열지 않으며 worker_done도 보내지 않습니다.


## 5c차 수정 — Amendment 9c

비후보 표시 훅의 snapshot은0이며 candidate만 root release version을 읽습니다. getter와 subscribe는 node/candidate에 memoize하고 같은 getter를 server snapshot으로 사용합니다. 이로써 Always 마운트·hydration의 mount updateStoreInstance 검사에서 불필요한 전체 표시 재렌더를 막습니다. 수락한 root explicit verdict는 pending이면 settle을 통해, 아니면 직접 정확히 한 번 release하고 배달합니다. React18 legacy root의 동기 listener→layout 새 쓰기 이력을 보존합니다.

5b 기준 b40의 intermediate hide within one batch와 subtree walk shares one sequence 단위 실패는 entries 필드가 없어서 생긴 shape 실패입니다. 이를 사용자 동작 결함 재현으로 세지 않습니다. 새5c 회귀는0624741a0을 기준으로 확인합니다. 추가 검증과 주석·story 원복·열 보존·기존 요약 문장 복원은 최종 관문 뒤 기록합니다.

msg_d101f539b310 승인에 따라 React18 createRoot/hydrateRoot equality는0624741a0에서도 통과하는 특성 검사로 유지합니다. React18 mount passive effects flush와 mount verdict microtask의 상대 순서가 이 차이를 만드는지는 확인하지 않았고 다른 fixture를 찾지 않습니다. React19 두 경우의44 대24 실패가 mount 결함 재현입니다.

변경한 기대·절차: 마운트 회귀는 testing-library/act 없이 실제 hook을 mock wrapper로 세고10필드 createRoot와 renderToString→hydrateRoot를50ms 뒤 unmount하며 Always와 false 횟수 동등을 단언합니다. SSR 뒤 counter를 지웁니다. React18 legacy root는 release 재렌더 layout에서 ErrorVisible false→valid value→true를 쓰고 validate 직후와 다음 frame/task에서 이전 오류가 빈 표시인지 검사합니다. pending 단위 시험은 automatic1+explicit1의 누적3→2로 고치며, 해제한 listener0과 별도로 구독한 no-pending D listener1을 단언합니다. reset-reveal은 두 frame/task 각각 빈 표시 단언과 Dirty/resetInteraction 뒤 pending ErrorVisible false/true 변형을 더했고, reveal-history standalone true 뒤 한 frame/task에도 빈 표시를 확인합니다. 기존 값 기대는 이중 release 횟수 외에는 바꾸지 않았습니다.

9c의 runtime/read 요약과 conditions precondition을 현재 형태로 고쳤고, 이력이 없고 커밋 정책이 live와 같으면 순수 helper는 checker 구성 없이 live 값을 반환합니다. story adapter는 b40 대비 runtime helper import와 pending read 두 줄만 다릅니다. 열 IR-6 보충에 하위 검증의 전체 pending 보존·zero stamp의 mount 의무 미충족·숨김 탭 timer 제한과 검증 계산 비용을 복원했습니다. obsolete U2 re-export 문장은 제거했습니다.

첫 전체 unit은 새 mount 시험의 ancestor index import2곳을 보고하여4088통과/1실패였습니다. Form과 타입의 소유 모듈 진입점으로 고친 뒤152개 소스를 다시 고정하고 전체 순차 관문을 재시작했습니다. 시험의 global act-environment와 schema literal 타입 보정은 fixture 타입 수정이며 제품 결함 실패에 섞지 않습니다.

9c의 정확 getter를 적용한 첫 전체 render는876통과/2실패였습니다. no-validator와 compile-failure external reveal이 최초 candidate version0→release 후 noncandidate0으로 같은 snapshot을 읽습니다. 후보 snapshot+1만 넣은 대조에서 같은 두 시험이 통과했고 probe는 원복했습니다. 엔진 version0 계약을 유지하면서 candidate/noncandidate 영역을 분리할 승인을 코디네이터에게 질문했습니다. 해당 원시·복원 해시는 candidate-snapshot-controls에 보존합니다.

msg_12043ec1b07c가 후보 snapshot의 version+1·비후보0을 승인했습니다. React는 hook snapshot이 마지막 render와 달라야 강제 재렌더를 수락하므로 최초 candidate0이 release 뒤 비후보0과 같으면 재렌더가 버려져 숨은 표시가 남습니다. disjoint 범위는 모든 candidate 종료를 snapshot 변경으로 만듭니다. 회귀는 `IR-6 no validator releases external errors revealed by showError after a write`와 `IR-6 compile failure releases a newly revealed external error`이며 정확9c getter에서 실패했습니다. 엔진 reader의 첫 release 전0은 그대로입니다. 계약 먼저 갱신하고 전체 관문을 재시작합니다.

정적 관문에서 타입검사 종료를 확인하기 전에 build를 시작한 실행은 예비 실행으로 분류했습니다(둘 다exit0). 최종 증거는 typecheck 종료를 확인한 뒤 build를 시작하는 순차 실행으로 다시 고정합니다. 제품 소스 해시는 바뀌지 않았습니다.

### 5c 최종 코드 관문

계약3fe0a3e5c·564a0ac00이 제품977d5c5e893065259ba4aa1138cdb37a41ff2b1b보다 앞섭니다.

| 관문 | 파일 | 통과 | 실패 | 비고 |
| --- | ---: | ---: | ---: | --- |
| unit | 619 | 4,089 | 0 | 기존 todo1 |
| render | 153 | 878 | 0 | React19 legacy2개 skip |
| react18 | 153 | 878 | 0 | Activity2개 skip |
| verify | 777 | 5,011 | 0 | 기존 todo1·legacy2개 skip, 다른 관문과 중복 |
| storybook | 101 | 254 | 0 | 실제 Chromium |
| production | 10 | 21 | 0 | 최종 build 뒤 재실행 |

같은 최종152개 소스 해시에서 지정 시험·정적 관문을 순차 실행했습니다. lint·typecheck·build exit0, lint 경고0입니다. 예비 static 중첩은 최종 증거로 쓰지 않고 typecheck 종료→build의 최종 쌍을 다시 순차 실행했습니다. build 결과 dist·agents-hashes는 source commit에서 제외했습니다. [5c 코드 관문](raw/ir-6/code/round-5c/code-gates.json)은 source·bundle 해시, 포착한 결과와 [후보 snapshot 대조](raw/ir-6/code/round-5c/candidate-snapshot-controls.json), [열 보충 문서 parity](raw/ir-6/code/round-5c/supplement-parity.json)를 결합합니다. `node packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/code/check-code-gates.mjs --round=5c`가 이 기록을 대조하며 시험이나 성능을 재실행하지 않습니다.

[수정 전 재현](raw/ir-6/code/round-5c/failure-observation.json)은 정확0624741a0에서 React19 createRoot와 hydrateRoot 각각44 대24의 실패, React18 legacy root의 reentrant layout 뒤 previous verdict 표시 실패, 기존 pending 단위 시험의3 대2 release 실패를 보존합니다. React18 mount equality2개와 Dirty/resetInteraction ErrorVisible toggle 유무2개는 기준에서도 통과한 특성 검사입니다. 정확9c getter가 만든 최초 snapshot0 충돌의 기존 external reveal 두 실패는 승인된 offset 대조와 구분하고 원복·최종 보정 해시를 함께 남깁니다. 5b의 batch/walk entries-shape 실패는 사용자 동작 결함 재현으로 세지 않습니다.

평가 공개 선언은97개 루트·55파일·917서명에서 의미 차이0, index.d.ts 바이트 차이0, whole-runtime·변경 내부 멤버·unresolved 노출0입니다. scratch diagnostics 타입 변이 양성 대조+1/-9·exit1, 복원0·exit0입니다. 보수적 내부 tracer+150/-2와 승인된 public JSDoc5파일·8멤버14개 추가/제거 쌍은 별도로 보존합니다. [평가](raw/ir-6/code/round-5c/evaluated-public-declarations.json.gz), [양성 대조](raw/ir-6/code/round-5c/declaration-controls.json), [주석 대조](raw/ir-6/code/round-5c/public-comments.json)를 함께 보며 공개 주석 차이0이라고 주장하지 않습니다.

FCA snapshot f85dd77d0a4c08f286d6eb1404986aa886098d78463549fad8ad944bdb89cb65에서 scan·6범위 validate·verification을 수행했습니다. facts1750 exact, missing·needsResolution·uncertain·toolError·unadjudicated0, unsupported175입니다. 마디386(organ305·fractal81), scan201·validate202·verification21·진단177이며 [새 finding·진단은0](raw/ir-6/code/round-5c/fca-diff.json)입니다. 절대 indeterminate·기존 실패12·skipped1을 유지합니다. 기존 네 동적 표 선언의 줄 이동만 정규화했고 해당 소스가5b와 같은 해시임을 확인했습니다. Scan complete: 기존202개 구조 finding과21개 검증 finding 유지, 신규0개입니다.

최종 원장은 ref1416항목·문제0, verbatim327조각·불일치0, sup3584인용·불일치0·unparsed0입니다. doc-coverage25문서·1144항목·무태그0·기존 uncited66/문제66입니다. [원장](raw/ir-6/code/round-5c/ledger-checks.json), [병합 prefix·owner quotes9–30+18b·public index·version 보존](raw/ir-6/code/round-5c/history-and-quotes.json), [재사용 원시의 입력 해시](raw/ir-6/code/round-5c/reused-evidence-inputs.json)를 보존합니다. 새 변경 whitespace0, 기존 원문27–30 trailing space 다섯 줄 보존, 포착 원시의 머신 절대 경로0입니다.

판정: 5c 코드 관문 통과, 독립 검토 대기입니다. 다섯 H 한계와 hidden same-schema reset의 chain-end 전달 미결은 유지합니다. 성능 G1–G6·G8 및 L·E·F는 미측정·표본0이며 `code accepted; window clear` 전에는 측정하지 않습니다. worker_done은 보내지 않았습니다.


## 5d차 선행 조건 — Amendment 9d와 코드 수락

msg_ad3789bbda7a는5c 제품 동작을 수락하고 아래 다섯 항목 뒤 측정 창을 허가했습니다. Opus는P1/P2 없는 조건부PASS, codex는 기능 결함 없음입니다. write DETAIL의 superseded route·settle 뒤 release 문장을 지우고 한 번의 root release 계약만 남겼습니다. release version reader와 후보 getter의 두 주석을 정확히 보완하고 after-paint story의 triple negation을 단일 negation으로 바꿨습니다. 빌드 runtime 세 번들의 바이트·해시는5c와 같습니다.

[최종 legacy fixture의 수정 전 재실행](raw/ir-6/code/round-5c/baseline-finalfixture-red-react18.json.gz)은 f06bc9205 scratch worktree에서 지정 세 파일만0624741a0으로 복원하고, 커밋된 시험의SHA-256을 대조한 bare React18 JSON 실행입니다. `too short`가 빈 표시 대신 나타나는1실패를 확인했고 [failure-observation](raw/ir-6/code/round-5c/failure-observation.json)에 그 시험 해시와 관측을 추가했습니다.

새 결정적 시험은10개의 비후보 display를 마운트하고 parent layout에서 runtime bridge로 release version을 전진시킵니다. 모든 자식의 layout 뒤·passive effects 전의 전진을 고정하며 effects flush 뒤 각 display의 hook 호출이 전진 전과 같아야 합니다.062 getter에서 React18/19 각각 호출[2×10] 대[1×10]으로 실패했고, 현재 getter에서는 각1회로 통과합니다.50ms mount/hydration 두 사례는 함께 유지합니다.

[집중 관문](raw/ir-6/code/round-5d/focused-gates.json): render3통과, react18은 새결정적·mount/hydration·legacy4통과, importModel2통과, lint경고0·typecheck·build exit0입니다. FCA validate snapshot3a78c7676bab5f19d32b32e2f04fa241096f0cd5f198e549efc921b3d0b47f3b의 기존202finding·177diagnostic·failed12/skipped1·indeterminate를 유지하고 신규0입니다. 원장 ref1416문제0/verbatim327불일치0/sup3584불일치0·unparsed0/doccoverage기존66·무태그0입니다. 전체5c 관문을 대체 통과로 다시 주장하지 않고 승인된9d 집중 관문과 같은 runtime bundle 해시로 연결합니다.

측정 사전 규칙은 G1–G6과 G8이며 G7은 없다는 코디네이터 정정(msg_84f0444c1629)을 반영합니다. 선행 조건을 마쳤으므로 PhaseE 준비·사전 규칙 커밋·untimed smoke 뒤 첫 창을 시작합니다. 현재 timed 표본0입니다.


## Phase E — 정숙 browser 측정과 관문 실패

사전 규칙 커밋cfd4a9e2a 뒤 최종 측정 코드f113566a353d567e1f807daac96f212d8e77c079를 고정했습니다.9d 뒤 제품 소스·버전·공개 진입점은 바뀌지 않았습니다. L 공개0.16.1, E facd72a71c44a798f5484827509073a27fb678a3, F의 제품 SHA-256은 각각5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46,26266aad8a72b5876ace3b1c47e9c501d83d7ac2b13c7d32bea4e1c40e16350d,4c3d76b857d85df64b1ceb5f900c13aad6a5acaefa09a5092211c85240ee379f입니다. F는 수락된5c/5d runtime bundle과 같은 바이트입니다. 제품 소스를 바꾸면 다시 측정합니다.

환경은 Apple M1 Max·논리CPU10·darwin/arm64 27.0.0·RAM64.0GiB입니다. production React19.2.6, Chromium145.0.7632.6, Playwright1.58.0, AJV8.17.1, Node24.20.0, esbuild0.25.9, viewport900×700입니다. React18은 browser lane에서 측정하지 않았습니다. Spotlight indexing을 유지했습니다. E scratch 빌드는 기존 의존성의 패키지별 AJV8 연결을 복원한 뒤 성공했습니다. 설치·제품 수정은 없었습니다.

실제 CLI 전체18행 untimed smoke(레인별1예열·1보존)를 마친 뒤10:58:24.138–10:58:54.234 UTC 정숙 관찰을 수행했습니다. 외부 PID30초 평균 최대6.413%·heavy0으로 첫 시도에 승인됐습니다. 거절0회이므로 paired mode를 쓰지 않았습니다.10:58:54.471–11:17:19.434 UTC의 하나의 창을 중단하지 않고 마쳤습니다.18행×3레인×3예열=162페이지를 버리고18행×3레인×10=540새페이지를 보존했습니다. 표본별 정순/역순 레인 교대, 페이지별 외부 CPU와10초 간격 CPU 원시를 유지했습니다. 창 중 build·시험·lint·typecheck·다른 창은 실행하지 않았습니다. 실제 시작 msg_a30ae60446ef와 마지막 종료 msg_68dfe70ac233을 Orca status로 알렸습니다.

첫 준비는 필요한 AJV8 plugin 배포 빌드가 없어 중단됐고, 빌드 뒤 새 준비 폴더를 사용했습니다. 예비 untimed smoke의 first-key 준비용 End 키가 측정 창에 들어가는 것을 찾아 DOM selection으로 바꾼 뒤 새 번들을 고정하고 전체 smoke를 다시 통과했습니다. 예비 실행은 정식 표본으로 쓰지 않았습니다. [완전 원시](raw/ir-6/browser/main/archive-manifest.json)는 모든540페이지·smoke54페이지·complete·inputs·formal-start·승인과CPU의 압축 파일 해시를 고정합니다. [소스 연속성](raw/ir-6/browser/main/source-continuity.json)은 측정 뒤 표 포맷·archive 감사만 보완했으며 수치 집계·문턱·제품 및 나머지 측정 소스 해시가 그대로임을 확인합니다.

### 기계 계산 결과

아래 표는 `yarn workspace @aileron/benchmark-form check:browser-results --stage=ir-6`가 원시에서 재생성합니다. 명령의 exit0은 원시·표 재현 성공이며 성능 관문 통과를 뜻하지 않습니다. 숫자 표시는 소수3자리이고 판정은 반올림 전 값을 씁니다. 각 ET 숫자의 관측 interaction/실제key와 대체 출처를 병기합니다.16ms 문턱 아래 키는 검열되며 null을0으로 읽지 않습니다. ET 풀이 비는 bootstrap만 handler p95로 대체하며 모든8행에서 대체0회·undefined ratio0회였습니다.

<!-- IR6_MAIN_TABLES_START -->
최대 통계: 정숙 창. ET는16ms 문턱으로 검열됩니다. 괄호는 관측 interaction/실제key 수입니다.

| 행 | 레인 | processing p95 ms (출처; 관측/key) | duration p95 ms (출처; 관측/key) | arrival p95 ms (배달/key) | 미배달 | first/eager 중앙값 ms (페이지 수) | 최장frame ms / ≥50ms 합 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| type-flat-500-validate-nonburst | L | 8.600 (event; 20/200) | 16.000 (event; 20/200) | 9.900 (200/200) | 0 | 67.800 / 100.600 (10) | 0.000 / 0 |
| type-flat-500-validate-nonburst | E | 7.000 (event; 45/200) | 16.000 (event; 45/200) | 3.300 (200/200) | 0 | 73.950 / 89.350 (10) | 0.000 / 0 |
| type-flat-500-validate-nonburst | F | 5.500 (event; 21/200) | 16.000 (event; 21/200) | 10.300 (200/200) | 0 | 37.800 / 92.500 (10) | 0.000 / 0 |
| type-flat-500-validate-burst | L | 2.700 (event; 58/200) | 16.000 (event; 58/200) | 8.200 (20/200) | 180 | 66.950 / 99.950 (10) | 0.000 / 0 |
| type-flat-500-validate-burst | E | 5.200 (event; 81/200) | 16.000 (event; 81/200) | 1.200 (200/200) | 0 | 73.950 / 88.500 (10) | 0.000 / 0 |
| type-flat-500-validate-burst | F | 4.700 (event; 37/200) | 16.000 (event; 37/200) | 11.500 (10/200) | 190 | 38.800 / 91.100 (10) | 0.000 / 0 |
| type-array-1000-validate-nonburst | L | 11.200 (event; 200/200) | 32.000 (event; 200/200) | 25.600 (200/200) | 0 | 141.300 / 259.600 (10) | 0.000 / 0 |
| type-array-1000-validate-nonburst | E | 13.900 (event; 200/200) | 32.000 (event; 200/200) | 4.300 (200/200) | 0 | 161.650 / 222.250 (10) | 0.000 / 0 |
| type-array-1000-validate-nonburst | F | 5.500 (event; 188/200) | 24.000 (event; 188/200) | 22.400 (200/200) | 0 | 138.800 / 232.100 (10) | 0.000 / 0 |
| type-array-1000-validate-burst | L | 7.800 (event; 147/200) | 40.000 (event; 147/200) | 15.800 (62/200) | 138 | 141.500 / 260.150 (10) | 0.000 / 0 |
| type-array-1000-validate-burst | E | 9.200 (event; 140/200) | 40.000 (event; 140/200) | 1.400 (200/200) | 0 | 159.700 / 220.550 (10) | 0.000 / 0 |
| type-array-1000-validate-burst | F | 5.000 (event; 172/200) | 32.000 (event; 172/200) | 13.400 (26/200) | 174 | 139.250 / 229.850 (10) | 0.000 / 0 |
| type-nested-d5-f4-validate-nonburst | L | 8.300 (event; 137/200) | 16.000 (event; 137/200) | 13.900 (200/200) | 0 | 138.000 / 196.650 (10) | 0.000 / 0 |
| type-nested-d5-f4-validate-nonburst | E | 13.300 (event; 141/200) | 24.000 (event; 141/200) | 5.100 (200/200) | 0 | 141.500 / 165.700 (10) | 0.000 / 0 |
| type-nested-d5-f4-validate-nonburst | F | 6.500 (event; 131/200) | 16.000 (event; 131/200) | 14.700 (200/200) | 0 | 70.850 / 168.850 (10) | 0.000 / 0 |
| type-nested-d5-f4-validate-burst | L | 2.200 (event; 80/200) | 24.000 (event; 80/200) | 13.400 (24/200) | 176 | 138.850 / 196.550 (10) | 0.000 / 0 |
| type-nested-d5-f4-validate-burst | E | 13.000 (event; 91/200) | 24.000 (event; 91/200) | 3.600 (200/200) | 0 | 140.000 / 164.650 (10) | 0.000 / 0 |
| type-nested-d5-f4-validate-burst | F | 5.200 (event; 127/200) | 24.000 (event; 127/200) | 16.800 (16/200) | 184 | 68.350 / 166.700 (10) | 0.000 / 0 |
| type-flat-2000-validate-nonburst | L | 11.700 (event; 178/200) | 24.000 (event; 178/200) | 18.800 (200/200) | 0 | 186.300 / 267.350 (10) | 0.000 / 0 |
| type-flat-2000-validate-nonburst | E | 15.200 (event; 176/200) | 32.000 (event; 176/200) | 6.600 (200/200) | 0 | 186.650 / 229.250 (10) | 0.000 / 0 |
| type-flat-2000-validate-nonburst | F | 9.400 (event; 175/200) | 24.000 (event; 175/200) | 17.300 (200/200) | 0 | 91.350 / 233.950 (10) | 0.000 / 0 |
| type-flat-2000-validate-burst | L | 5.700 (event; 110/200) | 24.000 (event; 110/200) | 11.400 (72/200) | 128 | 186.050 / 267.250 (10) | 0.000 / 0 |
| type-flat-2000-validate-burst | E | 6.300 (event; 112/200) | 24.000 (event; 112/200) | 2.500 (200/200) | 0 | 186.900 / 229.650 (10) | 0.000 / 0 |
| type-flat-2000-validate-burst | F | 6.000 (event; 172/200) | 24.000 (event; 172/200) | 11.500 (26/200) | 174 | 94.150 / 233.050 (10) | 0.000 / 0 |
| mount-flat-500-validate | L | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 66.850 / 96.950 (10) | 84.000 / 10 |
| mount-flat-500-validate | E | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 68.500 / 83.750 (10) | 81.800 / 10 |
| mount-flat-500-validate | F | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 38.300 / 86.600 (10) | 0.000 / 0 |
| mount-nested-d5-f4-validate | L | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 139.350 / 197.600 (10) | 158.300 / 10 |
| mount-nested-d5-f4-validate | E | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 139.050 / 163.450 (10) | 157.300 / 10 |
| mount-nested-d5-f4-validate | F | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 68.550 / 167.250 (10) | 87.700 / 20 |
| mount-if-flat-500-validate | L | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 67.000 / 94.200 (10) | 79.800 / 10 |
| mount-if-flat-500-validate | E | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 104.600 / 119.350 (10) | 114.900 / 10 |
| mount-if-flat-500-validate | F | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 104.450 / 120.150 (10) | 120.800 / 10 |
| first-key-flat-500-validate | L | 1.700 (handler; 0/10) | 1.700 (handler; 0/10) | 6.400 (10/10) | 0 | 66.500 / 104.100 (10) | 82.200 / 10 |
| first-key-flat-500-validate | E | 4.300 (event; 2/10) | 16.000 (event; 2/10) | 3.600 (10/10) | 0 | 73.400 / 93.350 (10) | 85.400 / 10 |
| first-key-flat-500-validate | F | 3.500 (handler; 0/10) | 3.500 (handler; 0/10) | 6.400 (10/10) | 0 | 38.000 / 96.200 (10) | 0.000 / 0 |
| first-key-flat-2000-validate | L | 5.300 (event; 2/10) | 16.000 (event; 2/10) | 9.700 (10/10) | 0 | 186.100 / 272.900 (10) | 212.800 / 20 |
| first-key-flat-2000-validate | E | 6.400 (event; 3/10) | 16.000 (event; 3/10) | 4.300 (10/10) | 0 | 185.700 / 232.700 (10) | 216.100 / 10 |
| first-key-flat-2000-validate | F | 6.000 (event; 1/10) | 16.000 (event; 1/10) | 10.900 (10/10) | 0 | 90.850 / 234.000 (10) | 128.300 / 20 |
| mount-flat-500-none | L | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 29.300 / 54.000 (10) | 0.000 / 0 |
| mount-flat-500-none | E | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 36.700 / 51.900 (10) | 51.600 / 1 |
| mount-flat-500-none | F | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 37.650 / 53.500 (10) | 0.000 / 0 |
| mount-nested-d5-f4-none | L | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 53.000 / 98.300 (10) | 72.100 / 10 |
| mount-nested-d5-f4-none | E | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 67.200 / 89.350 (10) | 84.200 / 10 |
| mount-nested-d5-f4-none | F | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 68.100 / 92.250 (10) | 83.900 / 10 |
| stream-flat-2000-validate | L | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 187.600 / 269.200 (10) | 0.000 / 0 |
| stream-flat-2000-validate | E | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 191.500 / 234.250 (10) | 0.000 / 0 |
| stream-flat-2000-validate | F | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 95.450 / 236.550 (10) | 0.000 / 0 |
| mount-array-1000-none | L | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 124.750 / 250.300 (10) | 170.500 / 20 |
| mount-array-1000-none | E | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 143.900 / 199.800 (10) | 179.200 / 10 |
| mount-array-1000-none | F | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 138.750 / 207.900 (10) | 185.500 / 10 |
| mount-array-1000-validate | L | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 143.050 / 257.200 (10) | 182.800 / 20 |
| mount-array-1000-validate | E | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 155.800 / 211.250 (10) | 193.100 / 10 |
| mount-array-1000-validate | F | 관측 없음 (handler; 0/0) | 관측 없음 (handler; 0/0) | 관측 없음 (0/0) | 0 | 139.300 / 223.500 (10) | 182.900 / 10 |

| typing 행 | processing F/E · F/L | duration F/E · F/L | arrival F/E · F/L | bootstrap F/E 단측95%상한 (E·F 관측/key) | 0.16.1 손실 해소(processing/duration/arrival) |
| --- | --- | --- | --- | --- | --- |
| type-flat-500-validate-nonburst | 0.786 · 0.640 | 1.000 · 1.000 | 3.121 · 1.040 | 0.873 (45/200 · 21/200) | 예/예/아니요 |
| type-flat-500-validate-burst | 0.904 · 1.741 | 1.000 · 1.000 | 9.583 · 1.402 | 2.556 (81/200 · 37/200) | 아니요/예/아니요 |
| type-array-1000-validate-nonburst | 0.396 · 0.491 | 0.750 · 0.750 | 5.209 · 0.875 | 0.354 (200/200 · 188/200) | 예/예/예 |
| type-array-1000-validate-burst | 0.543 · 0.641 | 0.800 · 0.800 | 9.571 · 0.848 | 0.506 (140/200 · 172/200) | 예/예/예 |
| type-nested-d5-f4-validate-nonburst | 0.489 · 0.783 | 0.667 · 1.000 | 2.882 · 1.058 | 0.417 (141/200 · 131/200) | 예/예/아니요 |
| type-nested-d5-f4-validate-burst | 0.400 · 2.364 | 1.000 · 1.000 | 4.667 · 1.254 | 0.383 (91/200 · 127/200) | 아니요/예/아니요 |
| type-flat-2000-validate-nonburst | 0.618 · 0.803 | 0.750 · 1.000 | 2.621 · 0.920 | 0.672 (176/200 · 175/200) | 예/예/예 |
| type-flat-2000-validate-burst | 0.952 · 1.053 | 1.000 · 1.000 | 4.600 · 1.009 | 0.700 (112/200 · 172/200) | 아니요/예/아니요 |

| 관문 | 판정 | 기계 계산 근거(반올림 전 원시는 decision.json) |
| --- | --- | --- |
| G1 | PASS | {"lMedian":7.099999964237213,"lMedianSource":"event-median","fP95":9.400000035762787,"transferFactor":0.9049295820229301,"transferredP95":8.506338103378347,"comparable":true,"upperBound":0.6718750012369128} |
| G2 | FAIL | "위 typing 표의 각 상한≤1.10; 관측/key 병기" |
| G3 | PASS | [{"id":"type-flat-500-validate-nonburst","F":16,"E":16,"framesF":0,"framesE":0},{"id":"type-flat-500-validate-burst","F":16,"E":16,"framesF":0,"framesE":0},{"id":"type-array-1000-validate-nonburst","F":24,"E":32,"framesF":0,"framesE":0},{"id":"type-array-1000-validate-burst","F":32,"E":40,"framesF":0,"framesE":0},{"id":"type-nested-d5-f4-validate-nonburst","F":16,"E":24,"framesF":0,"framesE":0},{"id":"type-nested-d5-f4-validate-burst","F":24,"E":24,"framesF":0,"framesE":0},{"id":"type-flat-2000-validate-nonburst","F":24,"E":32,"framesF":0,"framesE":0},{"id":"type-flat-2000-validate-burst","F":24,"E":24,"framesF":0,"framesE":0}] |
| G4 | PASS | [{"id":"type-flat-500-validate-nonburst","arrivalP95":10.300000011920929,"undelivered":0,"keys":200},{"id":"type-array-1000-validate-nonburst","arrivalP95":22.399999976158142,"undelivered":0,"keys":200},{"id":"type-nested-d5-f4-validate-nonburst","arrivalP95":14.700000047683716,"undelivered":0,"keys":200},{"id":"type-flat-2000-validate-nonburst","arrivalP95":17.299999952316284,"undelivered":0,"keys":200}] |
| G5 | PASS | [{"id":"mount-flat-500-validate","F":38.30000001192093,"E":68.5},{"id":"mount-nested-d5-f4-validate","F":68.55000001192093,"E":139.05000001192093}] |
| G6 | PASS | [{"index":0,"durationMs":493.9000000357628,"validationRuns":6,"limit":7},{"index":1,"durationMs":493.7999999523163,"validationRuns":6,"limit":7},{"index":2,"durationMs":493.30000001192093,"validationRuns":6,"limit":7},{"index":3,"durationMs":493.10000002384186,"validationRuns":6,"limit":7},{"index":4,"durationMs":497.5,"validationRuns":6,"limit":7},{"index":5,"durationMs":492.10000002384186,"validationRuns":6,"limit":7},{"index":6,"durationMs":498.5999999642372,"validationRuns":6,"limit":7},{"index":7,"durationMs":493.89999997615814,"validationRuns":6,"limit":7},{"index":8,"durationMs":493.0999999642372,"validationRuns":6,"limit":7},{"index":9,"durationMs":493.19999998807907,"validationRuns":6,"limit":7}] |
| G8 | FAIL | [{"id":"mount-array-1000-none","F":138.75,"E":143.89999997615814},{"id":"mount-array-1000-validate","F":139.2999999821186,"E":155.80000001192093}] |

| G8 행 | first F/E | eager E / F ms | eager F/E | eager 상한 | 페이지 E/F |
| --- | --- | --- | --- | --- | --- |
| mount-array-1000-none | 0.964 | 199.800 / 207.900 | 1.041 | 1.02 | 10/10 |
| mount-array-1000-validate | 0.894 | 211.250 / 223.500 | 1.058 | 1.00 | 10/10 |

G7은 없습니다. first-key 입력지연은 보고 전용입니다.

| first-key 행 | 레인 | input delay 중앙값 / p95 ms | 관측/key |
| --- | --- | --- | --- |
| first-key-flat-500-validate | L | 관측 없음 / 관측 없음 | 0/10 |
| first-key-flat-500-validate | E | 0.350 / 0.400 | 2/10 |
| first-key-flat-500-validate | F | 관측 없음 / 관측 없음 | 0/10 |
| first-key-flat-2000-validate | L | 0.350 / 0.400 | 2/10 |
| first-key-flat-2000-validate | E | 0.400 / 0.400 | 3/10 |
| first-key-flat-2000-validate | F | 0.400 / 0.400 | 1/10 |

| stream 레인 | 표본 | duration ms | runs | frame script p95 ms |
| --- | --- | --- | --- | --- |
| L | 0 | 499.800 | 60 | 0.100 |
| E | 0 | 496.700 | 60 | 0.500 |
| F | 0 | 493.900 | 6 | 0.600 |
| F | 1 | 493.800 | 6 | 0.500 |
| E | 1 | 495.300 | 60 | 0.600 |
| L | 1 | 494.100 | 60 | 0.100 |
| L | 2 | 494.200 | 60 | 0.100 |
| E | 2 | 494.300 | 60 | 0.600 |
| F | 2 | 493.300 | 6 | 0.600 |
| F | 3 | 493.100 | 6 | 0.600 |
| E | 3 | 497.900 | 60 | 0.600 |
| L | 3 | 497.800 | 60 | 0.100 |
| L | 4 | 495.200 | 60 | 0.100 |
| E | 4 | 492.100 | 60 | 0.600 |
| F | 4 | 497.500 | 6 | 0.600 |
| F | 5 | 492.100 | 6 | 0.600 |
| E | 5 | 490.900 | 60 | 0.600 |
| L | 5 | 494.900 | 60 | 0.100 |
| L | 6 | 502.100 | 60 | 0.100 |
| E | 6 | 492.400 | 60 | 0.500 |
| F | 6 | 498.600 | 6 | 0.600 |
| F | 7 | 493.900 | 6 | 0.600 |
| E | 7 | 497.100 | 60 | 0.600 |
| L | 7 | 499.500 | 60 | 0.100 |
| L | 8 | 496.500 | 60 | 0.100 |
| E | 8 | 495.800 | 60 | 0.600 |
| F | 8 | 493.100 | 6 | 0.600 |
| F | 9 | 493.200 | 6 | 0.600 |
| E | 9 | 492.400 | 60 | 0.500 |
| L | 9 | 500.600 | 60 | 0.100 |
<!-- IR6_MAIN_TABLES_END -->

G1의 L 페이지중앙값 중앙값은7.099999964ms로6.425×1.10을 넘고×1.25 이내입니다. 따라서 등록된 환산계수0.904929582를 적용하여 F 행 p95 9.400000036ms→8.506338103ms≤16.67ms로 통과합니다. 같은 행의 bootstrap상한0.671875001<1이며 비교불가가 아니므로 G1 재측정 조항은 발동하지 않았습니다. 원래 행p95의 F/E=0.6184210530443535, F/L=0.8034188072940415입니다.

G2는 flat500 burst 하나에서 실패했습니다. E의 원래 pooled p95=4.899999976ms(81/200 interaction/key), F=4.599999964ms(37/200)이며 점추정 F/E는 약0.939입니다. 그러나 사전 등록한 공동 페이지 bootstrap 단측95%상한은2.555555519>1.10입니다. 행p95의 F4.700000048ms≤E5.199999988ms라는 별도 통계로 이 실패를 지우지 않습니다.16ms 검열로 두 레인의 관측 수·분포가 다르고 상한이 넓지만, 원인과 제품 회귀의 인과는 아직 검증하지 않았습니다.

G8은 first-painted가 두 모드에서 모두 줄었지만 eager-painted가 실패했습니다. None은 E199.800000012ms→F207.900000036ms, F/E1.040540541>1.02이고, OnChange는 E211.249999970ms→F223.5ms, F/E1.057988166>1.00입니다(각10페이지 중앙값). first/eager는 서로 다른 등록된 경계이므로 first의 개선으로 eager 실패를 대체하지 않습니다. 두 실패에 새 timed window나 제품 수정을 임의로 추가하지 않았습니다.

G3·G4·G5·G6은 통과했습니다. 모든 F typing 행의50ms 이상 frame은0, nonburst 미배달은 모두0/200입니다. 스트림은 모든 F페이지에서 등록된 run 상한과 frame 조건을 충족했습니다. 기본 표시 정책·virtualization off를 유지했습니다. G7은 없습니다. 소유자 목표의 L 비교는 위 행별 processing/duration/arrival 판정과 같이 일부 손실이 남아 있으며 성능 관문과 구별합니다.

### 재현·검증과 미결

benchmark 시험6파일44통과·실패0의 [JSON 원시](raw/ir-6/browser/main/benchmark-tests.json.gz)와 [최종 검증 영수증](raw/ir-6/browser/main/benchmark-verification.json)을 보존합니다. lint경고0, browser typecheck exit0이며 앞의6개 IR0/IR1/IR2 재현 명령도 모두 통과했습니다. 측정 뒤 archive 해시 감사와 표의 관측수·G8 eager 상세를 추가했고, 제품·수치 함수는 그대로입니다. 표 생성의 변수 범위 오류를 수정한 뒤 원시 재현을 다시 확인했습니다.9d 집중 관문과5c 전체 코드 관문은 앞 절의 범위로 유지하며 재실행 통과라고 바꾸지 않습니다.

수용한 다섯 H 한계와 hidden same-schema reset chain-end 전달의 소유자 미결은 유지합니다. G·virtualization 기본값·기존 useChildFields 다섯 결함·버전도 범위 밖입니다. G2·G8 실패에 대한 다음 조치는 코디네이터 결정 대기입니다. worker_done·병합 가능·완료 신호는 보내지 않습니다.

판정: G1·G3·G4·G5·G6 통과, G2·G8 실패 — 코디네이터 결정 대기


## G2/G8 원인 진단 — 정식 관문 증거가 아닌 진단 전용

코디네이터 msg_afdb44b8dc1c와 추가 지시 msg_1b6709e1d02d에 따라 진단했습니다. 정식 G1·G3·G4·G5·G6 PASS, G2·G8 FAIL은 그대로이며 G7은 없습니다. 소유자는 표시 훅을 개선한 뒤 등록된 전체 창을 다시 측정하고 남는 비용을 판단하기로 했습니다. 개선 설계와 설계 검토·후속 디스패치는 코디네이터 몫입니다. 여기서는 제품 커밋이나 새 정식 창을 만들지 않았습니다.

[수집 해시](raw/ir-6/browser/diagnosis/capture-manifest.json), [variant 출처](raw/ir-6/browser/diagnosis/variant-provenance.json), [정식 페이지·키 구동 자료](raw/ir-6/browser/diagnosis/formal-drivers.json.gz), [전체 진단 집계](raw/ir-6/browser/diagnosis/diagnostic-summary.json.gz)를 보존했습니다. 최종 근거는 mount20개와 burst45개 및 배달 마커 보강15개의 CPU profile/trace입니다. 같은900×700·production React19·기본 표시 정책·virtualization off·동일 IR6 하니스를 사용했습니다. 최종 profile은 레인·행당3예열과5새페이지, V1/V2/V3 대조는3예열과10새페이지입니다. 레인 순서는 표본 번호별 정순/역순 교대이며 모든 실행에 diagnosticOnly와 formalGateEvidence=false를 남겼습니다. 프로파일100µs·timeline·부가 DevTools 관측의 비용을 포함하므로 프로파일 중앙값을 정식 창의 중앙값과 동일시하지 않습니다.

예비 warmup0 mount, 초기 inline/reducer 대조, 재사용 fiber flag를 새 렌더로 잘못 세던 예비 burst, 배달 마커가 빠진 예비 보강은 preliminary로 따로 보존하며 최종 인과 근거에 쓰지 않았습니다. 최종 렌더 관측기는 활성화 전 commit부터 fiber/alternate identity를 저장하고 바뀐 fiber와 flag를 함께 봅니다. probe에서 flat500 첫키의 F 렌더는500개 전체가 아니라 루트와 대상 경로의14개 컴포넌트 관측으로 좁혀졌습니다. 브라우저 실행 경로를 담는 trace metadata.command_line만 제외했고 traceEvents·CPU profile·시간·키 원시는 그대로입니다.

### 1–3. G8 attribution과 scratch 대조

E/F의 profile eager 중앙값은 None236.5/242.5ms, OnChange253.9/260.3ms입니다. Eager 창 안에서 표시 hook/reveal의 F 표본 배타 시간은2.764/3.602ms이고, React commit/passive의 F−E 배타 차이는2.487/2.560ms입니다. FieldProxy/InputSlot render 포함 시간 차이는5.599/5.093ms입니다. 반면 엔진 mount/build/settle의 배타 차이는0.037/0.297ms이고 OnChange validation compile/첫 판정의 배타 차이는−0.036ms입니다. policy commit은 OnChange에서0.032ms/페이지가 관측됐고 None에서는 표본이 없었습니다. 정책 commit이나 엔진 build가 회귀 대부분이라는 근거는 없습니다.

함수별로 None의 pushSimpleEffect self+1.225ms, commitHookEffectListUnmount+1.239ms, useErrorVisibility+0.826ms 등이 보입니다. OnChange의 useErrorVisibility self+1.710ms·total+4.460ms와 commitHookEffectListUnmount+0.981ms가 보입니다. 공용 useSyncExternalStore·subscribeToStore·updateStoreInstance는 기존 tracker도 사용하므로 전부 새 표시 훅 비용이라고 할 수 없습니다. 아래 표는 그룹별 함수 self/total 차이와 원시 위치를 보존하며, 익명·동명 함수는 그룹 내 집계 추정치입니다. 포함 시간은 중첩되며 E의 layout 검증이 F에서 별도 task로 이동해 같은 commit 함수의 total 차이가 음수가 될 수 있습니다.

V1은 세 표시의 hold를 없앤 진단 대조입니다. 같은5레인 실행에서 F−E eager 회귀의86.475%(None)·95.028%(OnChange)를 제거하여, 이 두 조건에서 표시 훅이 회귀 대부분을 설명합니다. V1은 H 의미를 지키지 않아 제품 후보가 아닙니다.

V2는 같은 hold 계산과 reducer 재렌더·candidate일 때만 실제 구독하는 passive effect 하나를 사용합니다. V3는 renderer/input에 구독 hook을 두지 않고 reducer dispatch와 순수 판정을 쓰며 candidate인 경우에만 null child가 구독합니다. child-errors는 V2 hook을 유지합니다. 둘 다 live=false면 모든 reveal read를 생략합니다. 두 프로토타입 모두 정확 f113566a3 scratch에서만 만들고 build했으며 커밋하지 않았습니다. 집중 render 두 파일은 각각15통과·실패0·기존 보류1이고 전체 동시성·StrictMode·숨김 복원 등가성을 입증한 결과는 아닙니다.

V2 eager는207.55/221.80ms, V3는206.05/217.15ms입니다. V3가 F보다5.55/5.20ms 줄였지만 E보다6.65/3.85ms 남습니다. None V3/E 약1.03335와 OnChange V3/E 약1.01805이므로 V3 진단으로도 현재 G8 선을 충족했다고 주장할 수 없습니다. V3 잔여 비용을 세부적으로 분해하거나 이를 불가피한 비용이라고 입증한 것은 아닙니다.

### 4–5. G2의 페이지·키 구동과 handler 작업

독립 재생이 등록된 상한2.555555519를 정확히 재현했습니다. E의 최악 page5와 F의 최악 page9를 각각 제외하거나 함께 제외해도 진단 상한은2.555555519입니다. 공동 표집을 유지하기 위해 최악 page의 상대 레인 짝도 함께 제외한 두 경우도 같습니다. 독립 lane 삭제는 짝 구조를 바꾸므로 별도로 표시했습니다.

구동 요인은 단일 최고 지연 page가 아니라 관측 수와 분포의 이질성입니다. page pair8은 E의13관측·page p951.8ms와 F의1관측·p951.2ms입니다. 상한 이상인1,723개 재표집에서 pair8의 등장 비율은97.214%, 평균 복제 수는2.104입니다. 이 저지연 E 관측의 반복이 분모 pooled p95를1.8ms로 낮추고 F의 first-key4.6ms를 유지하는 조합에서2.556이 됩니다. pair8만 공동 제외한 진단 상한은0.938775507이며, 이는 사후 제외로 정식 실패를 고칠 근거가 아닙니다.

정식 F pooled p954.6ms 이상 관측은 page1·6·9의 key1 세 개입니다. 각각 processing4.6/4.6/4.7ms·handler3.9/3.9/4.0ms·input delay1.6/0.1/0.1ms입니다. 같은 원시의 모든200키 handler를 공동 bootstrap하면 F/E 상한0.857142827입니다. 이 대체 출처 진단은 등록된 ET 실패를 대체하지 않습니다. 모든 burst의 L/E/F 각200 handler 키와 각 page의 ET 관측을 아래에 나란히 남겼습니다.

정식 키의 CPU stack·검증 실행 시각은 보존되지 않았으므로 동일 세 키의 실행 내용을 직접 확정할 수 없습니다. 별도 첫키 재현에서 flat500의 F는 FieldProxy2·RendererWithErrorMessage2·FieldInputBoundary2·입력 object/string 각1 등의 루트와 대상 경로를 렌더했습니다. L은 SchemaNodeProxy·기존 FormTypeInput 경로를 사용합니다. F handler의 표본 engine write/settle 평균은2.289ms, L은0.533ms이며 writeFieldNode·computeNode·commitSettlement·finishSettlement·exitFieldNodeChain이 보입니다. F의 직접 display helper 표본은 약0.072ms입니다. 이 재현은 첫키 손실의 주부분이 표시 hook 하나보다 새 쓰기·정착 경로와 렌더 계약 비용에 있다는 근거입니다. 정확한 원정식 키별 인과와 함수별 개선 가능량은 미검증입니다.

마커를 추가한 재현 F의5개 첫 handler 안에는 validation run과 onValidate 배달이 모두0개입니다. 가장 가까운 선행 검증 실행은250.8ms 이상 전, 배달은245ms 이상 전이므로 이 재현에서는 직전 검증 task가 첫키 처리 비용을 만든 증거가 없습니다. E는5개 handler 각각에서 검증 실행·배달이 관측돼 D1의 task 이동과 구별됩니다. profile·DevTools 비용이 포함된5.1/2.9ms의 F/L 첫 handler 중앙값을 정식3.85/1.9ms와 같은 절대값으로 해석하지 않습니다.

### 6. 0.16.1 burst 비교와 개선 선택지

등록된 native processing 행p95의 L→F는 flat5002.7→4.7ms, nested2.2→5.2ms, flat20005.7→6.0ms이며 duration F/L은 셋 다1.000입니다. 같은200키 handler pooled p95는0.9→1.2ms,0.4→1.9ms,2.3→1.4ms입니다. 첫키 median은1.9→3.85ms,1.1→3.85ms,3.7→4.2ms입니다. 따라서 flat500·nested에는 실제 handler 꼬리 비용도 남고, flat2000은 대다수 키가 더 빨라졌는데도 첫키와 검열된 native 관측 분포의 차이 때문에 native 행p95만 소폭 큽니다. duration의 같은8ms 구간으로 이런 CPU 차이가 사라졌다고 판단하지 않습니다.

우선 선택지는 live=false 빠른 길과 candidate-only 구독 구조입니다. V3는 V2보다 mount 비용을 더 줄인 근거가 있지만, 현재 프로토타입은 G8 잔여 비용과 전체 동시성 검증이 남습니다. per-display 고정 비용·배열/판정 할당 등을 더 줄일 수 있는지의 상세 설계는 아직 하지 않았습니다. G1의 engine cadence는 프로토타입에서 그대로이나 mount만 측정했으므로 G1 재통과를 예측 보증하지 않습니다. G2 first-key의 쓰기·정착 비용과 sparse ET bootstrap은 별개여서 표시 개선만으로 G2 상한이 내려간다고 보장할 수 없습니다.

V2는 더 단순하지만 회귀 제거량이 None33.197%·OnChange6.077%에 그쳤습니다. 첫키 engine/write 경로를 추가 최적화하려면 별도 범위·기능 검증이 필요하며 여기서는 변경하지 않았습니다. 모든 handler 키를 별도 기준으로 다루는 방안도 새 소유자 결정·사전 등록 없이 현재 G2 판정을 바꿀 수 없습니다. 소유자가 택한 표시 훅 개선 뒤 전체 등록 창 재측정을 후속 설계·검토·디스패치로 이어갈 숫자를 제공하며 임의 제품 커밋·재측정·worker_done을 하지 않습니다.

<!-- IR6_DIAG_TABLES_START -->
모든 수치는 **진단 전용**입니다. 정식 G2/G8 FAIL을 유지합니다. CPU는100µs 표본의 페이지당 평균 추정치이며 포함 시간은 중첩됩니다. 공용 external-store 효과를 표시 훅만의 효과로 단정하지 않습니다. CPU표의0은 미관측일 수 있습니다.

| 조건 | 레인 | 페이지 | first 중앙값 ms | eager 중앙값 ms | F 대비 eager 감소 ms | F−E 회귀 제거 비율 |
| --- | --- | --- | --- | --- | --- | --- |
| mount-array-1000-none | E | 10 | 143.600 | 199.400 | 12.200 | 100.000% |
| mount-array-1000-none | F | 10 | 141.250 | 211.600 | 0.000 | 0.000% |
| mount-array-1000-none | V1 | 10 | 144.450 | 201.050 | 10.550 | 86.475% |
| mount-array-1000-none | V2 | 10 | 137.550 | 207.550 | 4.050 | 33.197% |
| mount-array-1000-none | V3 | 10 | 136.750 | 206.050 | 5.550 | 45.492% |
| mount-array-1000-validate | E | 10 | 157.550 | 213.300 | 9.050 | 100.000% |
| mount-array-1000-validate | F | 10 | 139.150 | 222.350 | 0.000 | 0.000% |
| mount-array-1000-validate | V1 | 10 | 144.250 | 213.750 | 8.600 | 95.028% |
| mount-array-1000-validate | V2 | 10 | 138.200 | 221.800 | 0.550 | 6.077% |
| mount-array-1000-validate | V3 | 10 | 134.800 | 217.150 | 5.200 | 57.459% |

| 프로파일 조건 | 레인 | 페이지 | first 중앙값 ms | eager 중앙값 ms |
| --- | --- | --- | --- | --- |
| mount-array-1000-none | E | 5 | 156.400 | 236.500 |
| mount-array-1000-none | F | 5 | 159.400 | 242.500 |
| mount-array-1000-validate | E | 5 | 172.600 | 253.900 |
| mount-array-1000-validate | F | 5 | 163.100 | 260.300 |

| 조건 | CPU 그룹 | E 배타/포함 ms | F 배타/포함 ms | F−E 배타/포함 ms |
| --- | --- | --- | --- | --- |
| mount-array-1000-none | other-native-gc-and-js | 82.443 / 82.443 | 84.516 / 84.516 | 2.073 / 2.073 |
| mount-array-1000-none | react-commit-passive | 22.362 / 28.787 | 24.849 / 30.434 | 2.487 / 1.648 |
| mount-array-1000-none | react-render-other | 73.486 / 125.001 | 71.161 / 128.478 | -2.325 / 3.477 |
| mount-array-1000-none | engine-mount-build-settle | 11.512 / 12.192 | 11.549 / 12.457 | 0.037 / 0.266 |
| mount-array-1000-none | engine-write-settle | 0.663 / 0.663 | 0.682 / 0.682 | 0.018 / 0.018 |
| mount-array-1000-none | shared-react-external-store | 7.846 / 7.846 | 8.061 / 8.061 | 0.215 / 0.215 |
| mount-array-1000-none | field-proxy-input-render | 36.343 / 39.262 | 37.996 / 44.860 | 1.653 / 5.599 |
| mount-array-1000-none | validation-schedule-compile-verdict | 0.029 / 0.029 | 0.000 / 0.000 | -0.029 / -0.029 |
| mount-array-1000-none | display-hook-and-reveal | 0.000 / 0.000 | 2.764 / 3.481 | 2.764 / 3.481 |
| mount-array-1000-none | policy-commit-layout | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / 0.000 |
| mount-array-1000-validate | other-native-gc-and-js | 85.851 / 85.851 | 83.406 / 83.406 | -2.445 / -2.445 |
| mount-array-1000-validate | react-commit-passive | 22.609 / 45.127 | 25.169 / 31.321 | 2.560 / -13.806 |
| mount-array-1000-validate | react-render-other | 71.536 / 124.084 | 72.035 / 130.003 | 0.499 / 5.919 |
| mount-array-1000-validate | engine-mount-build-settle | 11.177 / 11.987 | 11.473 / 12.375 | 0.297 / 0.389 |
| mount-array-1000-validate | engine-write-settle | 0.680 / 0.680 | 0.858 / 0.858 | 0.178 / 0.178 |
| mount-array-1000-validate | field-proxy-input-render | 37.010 / 40.499 | 39.189 / 45.592 | 2.179 / 5.093 |
| mount-array-1000-validate | shared-react-external-store | 7.691 / 7.691 | 7.245 / 7.245 | -0.447 / -0.447 |
| mount-array-1000-validate | validation-schedule-compile-verdict | 16.947 / 16.947 | 16.911 / 16.943 | -0.036 / -0.004 |
| mount-array-1000-validate | display-hook-and-reveal | 0.000 / 0.000 | 3.602 / 4.460 | 3.602 / 4.460 |
| mount-array-1000-validate | policy-commit-layout | 0.000 / 0.000 | 0.032 / 0.032 | 0.032 / 0.032 |

<details>
<summary>그룹별 함수 self/total 차이 상위(절댓값 기준, 원시 위치는 CPU profile에 보존)</summary>

| 조건 | 그룹 | 함수 | self E / F / F−E ms | total E / F / F−E ms |
| --- | --- | --- | --- | --- |
| mount-array-1000-none | other-native-gc-and-js | (program) | 55.048 / 57.496 / 2.448 | 55.048 / 57.496 / 2.448 |
| mount-array-1000-none | other-native-gc-and-js | (garbage collector) | 17.045 / 16.692 / -0.353 | 17.045 / 16.692 / -0.353 |
| mount-array-1000-none | other-native-gc-and-js | querySelectorAll | 0.819 / 1.143 / 0.324 | 0.819 / 1.143 / 0.324 |
| mount-array-1000-none | other-native-gc-and-js | (root) | 0.000 / 0.000 / 0.000 | 234.683 / 241.576 / 6.893 |
| mount-array-1000-none | other-native-gc-and-js | performWorkUntilDeadline | 0.114 / 0.063 / -0.052 | 152.963 / 157.746 / 4.783 |
| mount-array-1000-none | other-native-gc-and-js | workLoopSync | 0.592 / 0.591 / -0.001 | 125.407 / 128.948 / 3.541 |
| mount-array-1000-none | react-commit-passive | commitHookEffectListUnmount | 1.517 / 2.756 / 1.239 | 1.517 / 2.756 / 1.239 |
| mount-array-1000-none | react-commit-passive | recursivelyTraversePassiveMountEffects | 1.346 / 2.062 / 0.716 | 7.826 / 8.655 / 0.829 |
| mount-array-1000-none | react-commit-passive | subscribeFieldNode | 2.467 / 1.834 / -0.634 | 2.781 / 1.922 / -0.859 |
| mount-array-1000-none | react-commit-passive | flushPassiveEffects | 0.119 / 0.152 / 0.033 | 13.633 / 15.247 / 1.614 |
| mount-array-1000-none | react-commit-passive | commitPassiveMountOnFiber | 0.710 / 0.702 / -0.008 | 7.826 / 8.715 / 0.890 |
| mount-array-1000-none | react-render-other | renderWithHooks | 3.284 / 2.452 / -0.832 | 69.069 / 73.625 / 4.556 |
| mount-array-1000-none | react-render-other | setValueForStyle | 8.650 / 7.982 / -0.668 | 8.650 / 7.982 / -0.668 |
| mount-array-1000-none | react-render-other | useFieldRendererContext | 0.293 / 0.905 / 0.613 | 0.824 / 2.216 / 1.392 |
| mount-array-1000-none | react-render-other | beginWork | 1.706 / 1.477 / -0.229 | 82.033 / 86.833 / 4.800 |
| mount-array-1000-none | react-render-other | updateFunctionComponent | 0.193 / 0.158 / -0.035 | 72.268 / 76.971 / 4.704 |
| mount-array-1000-none | engine-mount-build-settle | loadStaticFirstTree | 1.429 / 1.668 / 0.239 | 7.676 / 7.698 / 0.022 |
| mount-array-1000-none | engine-mount-build-settle | createFieldNode | 0.533 / 0.743 / 0.210 | 2.006 / 1.954 / -0.052 |
| mount-array-1000-none | engine-mount-build-settle | declareArrayChildren | 0.358 / 0.155 / -0.203 | 0.871 / 0.852 / -0.020 |
| mount-array-1000-none | engine-mount-build-settle | createRootLoad | 0.092 / 0.094 / 0.002 | 12.192 / 12.457 / 0.266 |
| mount-array-1000-none | engine-mount-build-settle | buildFieldNodeTree | 0.091 / 0.092 / 0.001 | 2.940 / 3.174 / 0.234 |
| mount-array-1000-none | engine-mount-build-settle | blueprint | 0.242 / 0.305 / 0.062 | 2.625 / 2.827 / 0.202 |
| mount-array-1000-none | engine-write-settle | exitFieldNodeChain | 0.334 / 0.434 / 0.100 | 0.573 / 0.557 / -0.016 |
| mount-array-1000-none | engine-write-settle | runDeliveryWaves | 0.095 / 0.062 / -0.033 | 0.095 / 0.093 / -0.002 |
| mount-array-1000-none | engine-write-settle | enterFieldNodeChain | 0.029 / 0.062 / 0.033 | 0.029 / 0.062 / 0.033 |
| mount-array-1000-none | engine-write-settle | flushQueuedEvents | 0.030 / 0.000 / -0.030 | 0.114 / 0.031 / -0.083 |
| mount-array-1000-none | engine-write-settle | updateFieldNodeGlobalErrors | 0.031 / 0.000 / -0.031 | 0.031 / 0.000 / -0.031 |
| mount-array-1000-none | shared-react-external-store | pushSimpleEffect | 0.712 / 1.938 / 1.225 | 0.835 / 2.031 / 1.196 |
| mount-array-1000-none | shared-react-external-store | (anonymous) under shared-react-external-store | 1.261 / 1.004 / -0.257 | 3.556 / 2.740 / -0.816 |
| mount-array-1000-none | shared-react-external-store | exports.useSyncExternalStore | 0.308 / 0.138 / -0.170 | 2.981 / 4.101 / 1.120 |
| mount-array-1000-none | shared-react-external-store | useSyncExternalStore | 1.213 / 1.191 / -0.023 | 2.664 / 3.911 / 1.247 |
| mount-array-1000-none | field-proxy-input-render | (anonymous) under field-proxy-input-render | 10.668 / 11.660 / 0.992 | 25.237 / 29.575 / 4.338 |
| mount-array-1000-none | field-proxy-input-render | useFieldInputControl | 1.274 / 2.016 / 0.742 | 2.963 / 5.074 / 2.111 |
| mount-array-1000-none | field-proxy-input-render | get | 3.362 / 2.861 / -0.501 | 3.362 / 2.861 / -0.501 |
| mount-array-1000-none | field-proxy-input-render | FieldProxy | 6.126 / 6.380 / 0.254 | 14.409 / 15.899 / 1.490 |
| mount-array-1000-none | validation-schedule-compile-verdict | recentReleaseList | 0.029 / 0.000 / -0.029 | 0.029 / 0.000 / -0.029 |
| mount-array-1000-none | validation-schedule-compile-verdict | retainValidationRoot | 0.000 / 0.000 / 0.000 | 0.029 / 0.000 / -0.029 |
| mount-array-1000-none | display-hook-and-reveal | useErrorVisibility | 0.000 / 0.826 / 0.826 | 0.000 / 3.481 / 3.481 |
| mount-array-1000-none | display-hook-and-reveal | (anonymous) under display-hook-and-reveal | 0.000 / 0.340 / 0.340 | 0.000 / 0.401 / 0.401 |
| mount-array-1000-none | display-hook-and-reveal | useExternalFormContext | 0.253 / 0.530 / 0.277 | 0.363 / 0.810 / 0.446 |
| mount-array-1000-validate | other-native-gc-and-js | (program) | 59.009 / 55.758 / -3.251 | 59.009 / 55.758 / -3.251 |
| mount-array-1000-validate | other-native-gc-and-js | (garbage collector) | 16.833 / 17.096 / 0.263 | 16.833 / 17.096 / 0.263 |
| mount-array-1000-validate | other-native-gc-and-js | setTimeout | 0.383 / 0.277 / -0.106 | 0.383 / 0.277 / -0.106 |
| mount-array-1000-validate | other-native-gc-and-js | (anonymous) under other-native-gc-and-js | 0.925 / 1.000 / 0.075 | 14.829 / 34.025 / 19.196 |
| mount-array-1000-validate | other-native-gc-and-js | finish | 0.000 / 0.030 / 0.030 | 0.000 / 16.855 / 16.855 |
| mount-array-1000-validate | other-native-gc-and-js | validateMountRoot | 0.000 / 0.000 / 0.000 | 0.000 / 16.760 / 16.760 |
| mount-array-1000-validate | react-commit-passive | commitHookEffectListUnmount | 1.422 / 2.403 / 0.981 | 1.422 / 2.403 / 0.981 |
| mount-array-1000-validate | react-commit-passive | commitHookEffectListMount | 2.216 / 3.189 / 0.973 | 24.839 / 10.218 / -14.621 |
| mount-array-1000-validate | react-commit-passive | commitLayoutEffectOnFiber | 1.989 / 1.443 / -0.546 | 22.857 / 6.378 / -16.479 |
| mount-array-1000-validate | react-commit-passive | flushLayoutEffects | 0.150 / 0.120 / -0.030 | 23.007 / 6.468 / -16.540 |
| mount-array-1000-validate | react-commit-passive | recursivelyTraverseLayoutEffects | 1.248 / 1.376 / 0.128 | 22.857 / 6.376 / -16.482 |
| mount-array-1000-validate | react-render-other | setInitialProperties | 3.098 / 2.238 / -0.859 | 29.585 / 29.059 / -0.527 |
| mount-array-1000-validate | react-render-other | setValueForStyle | 8.771 / 8.043 / -0.728 | 8.771 / 8.043 / -0.728 |
| mount-array-1000-validate | react-render-other | completeWork | 2.185 / 2.826 / 0.641 | 41.453 / 40.820 / -0.633 |
| mount-array-1000-validate | react-render-other | beginWork | 1.420 / 1.327 / -0.093 | 80.938 / 87.682 / 6.743 |
| mount-array-1000-validate | react-render-other | renderWithHooks | 2.658 / 3.106 / 0.448 | 68.622 / 75.097 / 6.475 |
| mount-array-1000-validate | react-render-other | updateFunctionComponent | 0.063 / 0.156 / 0.093 | 71.469 / 77.805 / 6.336 |
| mount-array-1000-validate | engine-mount-build-settle | loadStaticFirstTree | 1.504 / 1.092 / -0.413 | 7.411 / 7.492 / 0.081 |
| mount-array-1000-validate | engine-mount-build-settle | createChildNode | 0.225 / 0.478 / 0.253 | 1.797 / 2.131 / 0.335 |
| mount-array-1000-validate | engine-mount-build-settle | assembleStaticFirstNode | 0.964 / 0.713 / -0.251 | 1.823 / 1.944 / 0.122 |
| mount-array-1000-validate | engine-mount-build-settle | createRootLoad | 0.031 / 0.000 / -0.031 | 11.987 / 12.375 / 0.389 |
| mount-array-1000-validate | engine-mount-build-settle | dispatchMount | 0.271 / 0.163 / -0.108 | 8.596 / 8.896 / 0.300 |
| mount-array-1000-validate | engine-write-settle | exitFieldNodeChain | 0.376 / 0.497 / 0.121 | 0.589 / 0.673 / 0.085 |
| mount-array-1000-validate | engine-write-settle | enterFieldNodeChain | 0.000 / 0.091 / 0.091 | 0.000 / 0.091 / 0.091 |
| mount-array-1000-validate | engine-write-settle | deliverWave | 0.062 / 0.114 / 0.051 | 0.062 / 0.206 / 0.144 |
| mount-array-1000-validate | engine-write-settle | flushQueuedEvents | 0.060 / 0.030 / -0.030 | 0.151 / 0.236 / 0.085 |
| mount-array-1000-validate | field-proxy-input-render | (anonymous) under field-proxy-input-render | 11.964 / 12.835 / 0.871 | 27.059 / 30.465 / 3.406 |
| mount-array-1000-validate | field-proxy-input-render | useChildFields | 0.412 / 0.911 / 0.499 | 3.455 / 3.181 / -0.274 |
| mount-array-1000-validate | field-proxy-input-render | FieldProxy | 5.694 / 6.041 / 0.347 | 14.070 / 15.525 / 1.455 |
| mount-array-1000-validate | field-proxy-input-render | useFieldRendererContext | 0.530 / 0.858 / 0.328 | 0.955 / 2.264 / 1.309 |
| mount-array-1000-validate | shared-react-external-store | mountWorkInProgressHook | 1.946 / 1.617 / -0.329 | 1.946 / 1.617 / -0.329 |
| mount-array-1000-validate | shared-react-external-store | updateStoreInstance | 0.150 / 0.474 / 0.325 | 1.180 / 1.408 / 0.228 |
| mount-array-1000-validate | shared-react-external-store | useSyncExternalStore | 1.320 / 1.006 / -0.314 | 3.288 / 2.613 / -0.675 |
| mount-array-1000-validate | shared-react-external-store | exports.useSyncExternalStore | 0.252 / 0.192 / -0.060 | 3.551 / 2.832 / -0.719 |
| mount-array-1000-validate | validation-schedule-compile-verdict | (anonymous) under validation-schedule-compile-verdict | 2.656 / 2.159 / -0.498 | 12.950 / 12.727 / -0.223 |
| mount-array-1000-validate | validation-schedule-compile-verdict | addNames | 0.566 / 0.835 / 0.269 | 0.566 / 0.835 / 0.269 |
| mount-array-1000-validate | validation-schedule-compile-verdict | keywordCode | 0.497 / 0.691 / 0.193 | 6.606 / 6.686 / 0.080 |
| mount-array-1000-validate | validation-schedule-compile-verdict | subschemaCode | 0.148 / 0.059 / -0.089 | 5.999 / 5.634 / -0.365 |
| mount-array-1000-validate | validation-schedule-compile-verdict | subSchemaObjCode | 0.031 / 0.000 / -0.031 | 5.882 / 5.572 / -0.310 |
| mount-array-1000-validate | display-hook-and-reveal | useErrorVisibility | 0.000 / 1.710 / 1.710 | 0.000 / 4.460 / 4.460 |
| mount-array-1000-validate | display-hook-and-reveal | (anonymous) under display-hook-and-reveal | 0.000 / 0.221 / 0.221 | 0.000 / 0.281 / 0.281 |
| mount-array-1000-validate | display-hook-and-reveal | get FormErrorRenderer | 0.000 / 0.139 / 0.139 | 0.000 / 0.139 / 0.139 |
| mount-array-1000-validate | display-hook-and-reveal | readFieldNodeRevealPolicy | 0.000 / 0.060 / 0.060 | 0.000 / 0.249 / 0.249 |
| mount-array-1000-validate | policy-commit-layout | commitFieldNodeRevealPolicy | 0.000 / 0.032 / 0.032 | 0.000 / 0.032 / 0.032 |

</details>

| 정식 원시 기반 burst | 레인 | ET 행p95 ms (관측/200key) | handler 행p95 / pooled p95 ms (200key) | 첫키 중앙값 / 나머지190키 p95 ms |
| --- | --- | --- | --- | --- |
| type-flat-500-validate-burst | L | 2.700 (58/200) | 0.900 / 0.900 | 1.900 / 0.800 |
| type-flat-500-validate-burst | E | 5.200 (81/200) | 1.500 / 1.500 | 4.350 / 1.300 |
| type-flat-500-validate-burst | F | 4.700 (37/200) | 1.200 / 1.200 | 3.850 / 1.000 |
| type-nested-d5-f4-validate-burst | L | 2.200 (80/200) | 0.400 / 0.400 | 1.100 / 0.400 |
| type-nested-d5-f4-validate-burst | E | 13.000 (91/200) | 3.800 / 3.800 | 11.900 / 1.700 |
| type-nested-d5-f4-validate-burst | F | 5.200 (127/200) | 1.900 / 1.900 | 3.850 / 0.800 |
| type-flat-2000-validate-burst | L | 5.700 (110/200) | 2.300 / 2.300 | 3.700 / 2.000 |
| type-flat-2000-validate-burst | E | 6.300 (112/200) | 2.900 / 2.900 | 4.800 / 2.800 |
| type-flat-2000-validate-burst | F | 6.000 (172/200) | 1.400 / 1.400 | 4.200 / 1.300 |

| 진단 bootstrap | 상한 |
| --- | --- |
| 정식 G2 동일 재생 | 2.556 |
| E 최악 페이지5 제외(독립 표집) | 2.556 |
| F 최악 페이지9 제외(독립 표집) | 2.556 |
| 각 레인의 최악 페이지 제외(독립 표집) | 2.556 |
| E 최악 페이지 쌍 제외(공동 표집) | 2.556 |
| F 최악 페이지 쌍 제외(공동 표집) | 2.556 |
| 페이지 쌍8 제외(공동 표집) | 0.939 |
| flat500 모든 handler 키 F/E | 0.857 |

| 정식 F 느린 키 | page/key | native processing ms | handler ms | input delay ms |
| --- | --- | --- | --- | --- |
| flat500 burst | 1/1 | 4.600 | 3.900 | 1.600 |
| flat500 burst | 6/1 | 4.600 | 3.900 | 0.100 |
| flat500 burst | 9/1 | 4.700 | 4.000 | 0.100 |

| 진단 첫 handler | 레인 | 페이지 | handler 중앙값 ms | engine 쓰기·정착 평균 ms | 표시 helper 평균 ms | 가장 가까운 선행 검증 실행 ms 전 | handler 내 검증 실행 수 | 선행 배달 ms 전 / handler 내 배달 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| type-flat-500-validate-burst | L | 5 | 2.900 | 0.533 | 0.000 | 272.300 | 0 | 257.700 / 0 |
| type-flat-500-validate-burst | E | 5 | 5.200 | 2.221 | 0.000 | 273.600 | 5 | 266.100 / 5 |
| type-flat-500-validate-burst | F | 5 | 5.100 | 2.289 | 0.072 | 250.800 | 0 | 245.000 / 0 |
| type-nested-d5-f4-validate-burst | L | 5 | 1.600 | 0.156 | 0.000 | 313.800 | 0 | 미계측 |
| type-nested-d5-f4-validate-burst | E | 5 | 6.300 | 2.497 | 0.000 | 326.900 | 5 | 미계측 |
| type-nested-d5-f4-validate-burst | F | 5 | 5.800 | 2.740 | 0.069 | 307.600 | 0 | 미계측 |
| type-flat-2000-validate-burst | L | 5 | 6.200 | 1.432 | 0.000 | 344.800 | 0 | 미계측 |
| type-flat-2000-validate-burst | E | 5 | 7.700 | 2.555 | 0.000 | 368.300 | 5 | 미계측 |
| type-flat-2000-validate-burst | F | 5 | 7.700 | 2.645 | 0.153 | 335.800 | 0 | 미계측 |

| 진단 첫 handler | 레인 | 첫 표본에서 관측한 렌더 컴포넌트 |
| --- | --- | --- |
| type-flat-500-validate-burst | L | SchemaNodeProxy×3, ErrorBoundary×4, PassRenderer×2, FormTypeInputObject×1, FormTypeInputString×1 |
| type-flat-500-validate-burst | E | FieldProxy×3, ErrorBoundary×6, RendererWithErrorMessage×3, PassRenderer×3, FieldInputBoundary×3, FieldInputObject×1, FieldInputString×2 |
| type-flat-500-validate-burst | F | FieldProxy×2, ErrorBoundary×4, RendererWithErrorMessage×2, PassRenderer×2, FieldInputBoundary×2, FieldInputObject×1, FieldInputString×1 |
| type-nested-d5-f4-validate-burst | L | SchemaNodeProxy×7, ErrorBoundary×12, PassRenderer×6, FormTypeInputObject×5, FormTypeInputString×1 |
| type-nested-d5-f4-validate-burst | E | FieldProxy×7, ErrorBoundary×14, RendererWithErrorMessage×7, PassRenderer×7, FieldInputBoundary×7, FieldInputObject×5, FieldInputString×2 |
| type-nested-d5-f4-validate-burst | F | FieldProxy×6, ErrorBoundary×12, RendererWithErrorMessage×6, PassRenderer×6, FieldInputBoundary×6, FieldInputObject×5, FieldInputString×1 |
| type-flat-2000-validate-burst | L | SchemaNodeProxy×3, ErrorBoundary×4, PassRenderer×2, FormTypeInputObject×1, FormTypeInputString×1 |
| type-flat-2000-validate-burst | E | FieldProxy×3, ErrorBoundary×6, RendererWithErrorMessage×3, PassRenderer×3, FieldInputBoundary×3, FieldInputObject×1, FieldInputString×2 |
| type-flat-2000-validate-burst | F | FieldProxy×2, ErrorBoundary×4, RendererWithErrorMessage×2, PassRenderer×2, FieldInputBoundary×2, FieldInputObject×1, FieldInputString×1 |

<details>
<summary>모든 burst 페이지의 검열된 ET 관측과 검열 없는 handler20개(키1→20 순서)</summary>

| 행 | 레인/page | ET 관측 processing ms | ET page p95 ms | handler20개 ms |
| --- | --- | --- | --- | --- |
| type-flat-500-validate-burst | L/0 | 2.600, 1.300, 1.100, 1.100, 0.900, 1.100, 0.800, 0.900, 0.800, 1.100, 0.900, 0.700, 0.900 | 2.600 | 1.900, 0.800, 0.700, 0.600, 0.700, 0.700, 0.500, 0.600, 0.600, 0.500, 0.600, 0.500, 0.600, 0.500, 0.600, 0.500, 0.500, 0.600, 0.600, 0.600 |
| type-flat-500-validate-burst | L/1 | 2.700, 1.400, 1.100, 1.200, 1.000, 0.100, 1.000, 0.900, 1.100, 0.900, 0.900, 1.000, 0.800 | 2.700 | 2.000, 0.900, 0.700, 0.800, 0.700, 0.700, 0.700, 0.600, 0.600, 0.500, 0.500, 0.500, 0.700, 0.500, 0.600, 0.500, 0.500, 0.500, 0.600, 0.600 |
| type-flat-500-validate-burst | L/2 | 2.700, 1.300, 0.200, 1.200, 1.000, 1.100, 0.900, 0.800, 0.900, 0.700, 0.900, 0.800, 0.800 | 2.700 | 2.100, 0.900, 0.900, 0.700, 0.700, 0.700, 0.700, 0.600, 0.600, 0.600, 0.500, 0.600, 0.600, 0.600, 0.500, 0.500, 0.500, 0.600, 0.400, 0.400 |
| type-flat-500-validate-burst | L/3 | 2.600, 1.200 | 2.600 | 1.900, 0.900, 0.800, 0.800, 0.800, 0.600, 0.600, 0.600, 0.600, 0.600, 0.700, 0.600, 0.600, 0.500, 0.400, 0.600, 0.600, 0.600, 0.500, 0.500 |
| type-flat-500-validate-burst | L/4 | 1.200, 1.200, 1.100, 1.000, 0.000, 1.100, 0.900, 0.700, 1.100, 0.900, 0.800, 0.900 | 1.200 | 1.900, 0.700, 0.800, 0.700, 0.800, 0.700, 0.500, 0.500, 0.600, 0.500, 0.600, 0.500, 0.500, 0.700, 0.500, 0.500, 0.400, 0.500, 0.500, 0.600 |
| type-flat-500-validate-burst | L/5 | 1.100, 0.900 | 1.100 | 1.900, 0.800, 0.800, 0.700, 0.700, 0.700, 0.700, 0.700, 0.700, 0.700, 0.700, 0.600, 0.600, 0.400, 0.600, 0.600, 0.500, 0.600, 0.500, 0.500 |
| type-flat-500-validate-burst | L/6 | 관측 없음 | 관측 없음 | 1.800, 0.800, 0.800, 0.600, 0.600, 0.600, 0.600, 0.600, 0.600, 0.600, 0.500, 0.500, 0.700, 0.600, 0.500, 0.400, 0.500, 0.500, 0.500, 0.600 |
| type-flat-500-validate-burst | L/7 | 1.000 | 1.000 | 2.000, 0.900, 0.700, 0.700, 0.600, 0.700, 0.700, 0.600, 0.600, 0.500, 0.600, 0.600, 0.500, 0.500, 0.600, 0.600, 0.500, 0.500, 0.500, 0.700 |
| type-flat-500-validate-burst | L/8 | 1.200 | 1.200 | 1.800, 0.900, 0.800, 0.700, 0.600, 0.600, 0.700, 0.600, 0.600, 0.600, 0.500, 0.600, 0.600, 0.600, 0.400, 0.500, 0.500, 0.500, 0.500, 0.600 |
| type-flat-500-validate-burst | L/9 | 1.000 | 1.000 | 1.800, 0.900, 0.900, 0.800, 0.600, 0.700, 0.700, 0.600, 0.500, 0.700, 0.600, 0.600, 0.500, 0.400, 0.500, 0.500, 0.500, 0.500, 0.500, 0.600 |
| type-flat-500-validate-burst | E/0 | 5.100, 1.800, 1.500, 1.400, 1.100, 0.100, 1.300, 1.100, 1.300, 0.900, 1.000, 1.500, 1.100, 1.200 | 5.100 | 4.400, 1.400, 1.200, 1.000, 0.700, 0.800, 0.700, 1.000, 0.700, 0.900, 0.500, 0.900, 0.600, 0.900, 0.600, 0.900, 0.600, 0.900, 0.700, 0.800 |
| type-flat-500-validate-burst | E/1 | 1.600 | 1.600 | 3.700, 1.200, 1.000, 0.900, 0.700, 0.900, 0.700, 0.900, 0.800, 1.100, 0.600, 0.900, 0.500, 0.900, 0.600, 1.000, 0.700, 0.900, 0.600, 0.900 |
| type-flat-500-validate-burst | E/2 | 4.900, 1.700, 1.400, 0.100, 1.300, 1.100, 1.400, 1.100, 1.300, 0.900, 1.400, 1.100, 1.200 | 4.900 | 4.200, 1.300, 1.200, 0.900, 0.700, 0.900, 0.800, 0.900, 0.800, 1.100, 0.700, 0.900, 0.500, 0.900, 0.600, 1.000, 0.600, 1.000, 0.700, 0.900 |
| type-flat-500-validate-burst | E/3 | 1.200 | 1.200 | 4.000, 1.300, 1.100, 1.000, 0.800, 1.100, 0.900, 1.000, 0.800, 1.100, 0.700, 1.000, 0.800, 1.100, 0.700, 1.100, 0.600, 0.900, 0.600, 0.900 |
| type-flat-500-validate-burst | E/4 | 1.300, 1.600 | 1.600 | 4.300, 1.300, 1.300, 0.900, 0.900, 1.000, 0.800, 0.800, 0.700, 1.000, 0.700, 1.000, 0.600, 0.900, 0.700, 0.900, 0.700, 1.000, 0.600, 1.000 |
| type-flat-500-validate-burst | E/5 | 5.200, 1.800, 0.100, 1.400, 1.400, 1.100, 1.200 | 5.200 | 4.400, 1.400, 1.200, 1.100, 0.900, 0.900, 0.800, 0.800, 0.800, 1.000, 0.500, 0.900, 0.700, 1.100, 0.500, 1.000, 0.700, 1.000, 0.500, 0.900 |
| type-flat-500-validate-burst | E/6 | 4.900, 1.800, 1.500, 1.400, 1.200, 1.300, 1.200, 1.000, 1.400, 1.300, 1.000, 1.300, 1.000, 1.000, 1.100 | 4.900 | 4.300, 1.500, 1.100, 0.900, 0.700, 0.900, 0.700, 0.900, 0.700, 1.100, 0.700, 0.900, 0.700, 1.000, 0.600, 1.000, 0.700, 1.000, 0.500, 0.800 |
| type-flat-500-validate-burst | E/7 | 1.300, 1.100 | 1.300 | 4.400, 1.300, 1.400, 1.000, 0.900, 0.900, 0.800, 1.000, 0.900, 1.200, 0.700, 1.000, 0.700, 1.000, 0.600, 1.100, 0.700, 0.800, 0.600, 0.800 |
| type-flat-500-validate-burst | E/8 | 0.200, 1.800, 1.300, 1.300, 1.300, 1.300, 1.100, 1.400, 1.400, 1.000, 1.500, 1.400, 1.100 | 1.800 | 4.700, 1.400, 1.300, 1.200, 0.900, 0.900, 0.800, 0.900, 0.900, 1.200, 0.800, 1.000, 0.600, 1.100, 0.700, 1.100, 0.700, 0.900, 0.700, 1.100 |
| type-flat-500-validate-burst | E/9 | 5.200, 1.800, 0.200, 1.400, 0.100, 1.300, 1.400, 1.600, 1.000, 1.300, 0.900, 0.100, 1.300 | 5.200 | 4.500, 1.400, 1.200, 1.000, 0.800, 1.000, 0.900, 0.900, 0.700, 1.200, 0.700, 1.000, 0.600, 1.000, 0.600, 1.000, 0.600, 0.900, 0.500, 0.800 |
| type-flat-500-validate-burst | F/0 | 0.200, 1.000 | 1.000 | 3.700, 0.800, 0.800, 0.600, 0.700, 0.600, 0.600, 0.500, 0.600, 0.500, 0.500, 0.400, 0.500, 0.400, 0.400, 0.500, 0.400, 0.500, 0.500, 1.200 |
| type-flat-500-validate-burst | F/1 | 4.600, 0.900, 1.100 | 4.600 | 3.900, 0.800, 0.700, 0.700, 0.600, 0.600, 0.500, 0.500, 0.400, 0.500, 0.400, 0.500, 0.500, 0.400, 0.400, 0.400, 0.400, 0.300, 0.400, 1.100 |
| type-flat-500-validate-burst | F/2 | 1.000, 0.800 | 1.000 | 3.900, 0.900, 0.700, 0.600, 0.600, 0.600, 0.500, 0.500, 0.500, 0.500, 0.500, 0.400, 0.400, 0.400, 0.400, 0.400, 0.400, 0.400, 0.400, 1.100 |
| type-flat-500-validate-burst | F/3 | 관측 없음 | 관측 없음 | 3.800, 0.900, 0.700, 0.500, 0.500, 0.600, 0.500, 0.400, 0.500, 0.500, 0.400, 0.500, 0.400, 0.300, 0.500, 0.400, 0.400, 0.400, 0.400, 1.200 |
| type-flat-500-validate-burst | F/4 | 0.900 | 0.900 | 3.400, 0.800, 0.600, 0.600, 0.500, 0.600, 0.600, 0.500, 0.600, 0.500, 0.400, 0.600, 0.400, 0.400, 0.400, 0.400, 0.400, 0.500, 1.100, 0.400 |
| type-flat-500-validate-burst | F/5 | 0.900 | 0.900 | 3.800, 0.900, 0.700, 0.600, 0.600, 0.600, 0.500, 0.600, 0.400, 0.500, 0.400, 0.400, 0.400, 0.400, 0.400, 0.500, 0.300, 0.300, 0.300, 1.000 |
| type-flat-500-validate-burst | F/6 | 4.600, 1.100, 1.000, 0.900, 1.000, 0.900, 0.700, 0.100, 0.900, 0.000, 1.000, 1.400, 0.900 | 4.600 | 3.900, 0.700, 0.600, 0.600, 0.500, 0.600, 0.400, 0.500, 0.400, 0.400, 0.500, 0.400, 0.400, 0.500, 0.400, 0.300, 0.500, 0.500, 1.100, 0.500 |
| type-flat-500-validate-burst | F/7 | 관측 없음 | 관측 없음 | 4.000, 0.600, 0.800, 0.700, 0.500, 0.400, 0.500, 0.500, 0.400, 0.400, 0.400, 0.400, 0.400, 0.400, 0.500, 0.400, 0.400, 0.500, 0.500, 1.000 |
| type-flat-500-validate-burst | F/8 | 1.200 | 1.200 | 3.500, 0.600, 0.700, 0.600, 0.500, 0.600, 0.400, 0.500, 0.500, 0.500, 0.400, 0.300, 0.400, 0.500, 0.600, 0.500, 0.500, 0.400, 0.500, 1.000 |
| type-flat-500-validate-burst | F/9 | 4.700, 1.000, 1.000, 1.000, 0.800, 0.800, 1.100, 0.800, 0.700, 0.800, 0.800, 0.700, 0.700, 1.400 | 4.700 | 4.000, 0.700, 0.600, 0.700, 0.700, 0.500, 0.600, 0.500, 0.500, 0.500, 0.400, 0.500, 0.500, 0.300, 0.400, 0.300, 0.400, 0.400, 0.400, 1.000 |
| type-nested-d5-f4-validate-burst | L/0 | 1.200, 1.100, 1.200 | 1.200 | 1.200, 0.300, 0.300, 0.400, 0.400, 0.300, 0.200, 0.300, 0.300, 0.300, 0.300, 0.300, 0.300, 0.300, 0.200, 0.300, 0.200, 0.100, 0.200, 0.200 |
| type-nested-d5-f4-validate-burst | L/1 | 1.000, 1.000, 1.000, 1.000, 1.000, 0.800, 0.900, 0.800, 0.900, 0.600, 1.000 | 1.000 | 1.000, 0.300, 0.300, 0.300, 0.200, 0.400, 0.300, 0.200, 0.200, 0.300, 0.100, 0.200, 0.200, 0.200, 0.300, 0.200, 0.200, 0.200, 0.100, 0.200 |
| type-nested-d5-f4-validate-burst | L/2 | 2.200, 0.900, 0.300, 1.000, 0.800, 0.700, 0.900, 0.800, 0.800, 0.800, 0.800 | 2.200 | 1.100, 0.400, 0.300, 0.300, 0.300, 0.200, 0.400, 0.200, 0.200, 0.300, 0.200, 0.100, 0.200, 0.300, 0.200, 0.200, 0.200, 0.100, 0.100, 0.200 |
| type-nested-d5-f4-validate-burst | L/3 | 0.900, 1.000, 1.200, 1.000 | 1.200 | 1.000, 0.400, 0.300, 0.200, 0.300, 0.200, 0.200, 0.100, 0.200, 0.300, 0.200, 0.200, 0.300, 0.300, 0.200, 0.200, 0.200, 0.200, 0.200, 0.200 |
| type-nested-d5-f4-validate-burst | L/4 | 1.100, 1.000, 0.900, 0.900, 0.900, 0.700, 0.900, 0.800, 0.700, 0.900, 0.900, 0.900 | 1.100 | 1.100, 0.400, 0.300, 0.400, 0.300, 0.200, 0.300, 0.200, 0.200, 0.200, 0.300, 0.100, 0.300, 0.300, 0.200, 0.200, 0.300, 0.200, 0.200, 0.200 |
| type-nested-d5-f4-validate-burst | L/5 | 2.100, 1.000, 0.900, 0.900, 0.900, 0.700, 0.900, 0.900, 0.900, 0.800 | 2.100 | 1.100, 0.300, 0.400, 0.300, 0.300, 0.300, 0.300, 0.300, 0.300, 0.200, 0.200, 0.200, 0.100, 0.200, 0.100, 0.100, 0.200, 0.300, 0.300, 0.200 |
| type-nested-d5-f4-validate-burst | L/6 | 1.000, 1.000 | 1.000 | 1.200, 0.200, 0.200, 0.300, 0.200, 0.300, 0.100, 0.300, 0.200, 0.200, 0.200, 0.200, 0.200, 0.100, 0.200, 0.200, 0.200, 0.200, 0.200, 0.200 |
| type-nested-d5-f4-validate-burst | L/7 | 0.900, 0.300, 0.800, 1.000, 1.100, 0.800 | 1.100 | 1.000, 0.300, 0.300, 0.400, 0.300, 0.200, 0.200, 0.200, 0.200, 0.200, 0.200, 0.200, 0.200, 0.200, 0.200, 0.200, 0.200, 0.300, 0.300, 0.200 |
| type-nested-d5-f4-validate-burst | L/8 | 0.200, 0.900, 0.800, 0.900, 0.700, 0.700, 0.800, 0.900 | 0.900 | 1.000, 0.400, 0.300, 0.300, 0.300, 0.200, 0.300, 0.200, 0.200, 0.200, 0.200, 0.100, 0.300, 0.200, 0.100, 0.200, 0.200, 0.300, 0.200, 0.100 |
| type-nested-d5-f4-validate-burst | L/9 | 1.000, 0.300, 0.900, 0.800, 0.900, 1.000, 0.700, 0.700, 1.000, 0.700, 1.500, 0.800, 0.800 | 1.500 | 1.100, 0.300, 0.300, 0.300, 0.300, 0.300, 0.200, 0.200, 0.200, 0.100, 0.100, 0.300, 0.300, 0.100, 0.200, 0.200, 0.100, 0.300, 0.200, 0.200 |
| type-nested-d5-f4-validate-burst | E/0 | 12.800, 1.700, 1.200, 1.500, 1.800, 5.000, 2.100, 1.000, 2.200, 2.100, 2.300, 1.100 | 12.800 | 11.900, 1.000, 0.900, 0.600, 0.700, 0.600, 0.700, 1.100, 2.100, 0.500, 1.500, 0.400, 1.500, 0.400, 1.400, 0.500, 1.400, 0.600, 1.500, 0.400 |
| type-nested-d5-f4-validate-burst | E/1 | 12.800, 1.800, 1.400, 1.400, 2.100, 2.200, 1.100, 2.300, 1.200, 2.500, 1.100 | 12.800 | 11.900, 1.000, 0.900, 0.700, 0.800, 0.700, 0.700, 0.700, 1.900, 0.600, 1.400, 0.500, 1.600, 0.500, 1.500, 0.300, 1.500, 0.500, 1.500, 0.500 |
| type-nested-d5-f4-validate-burst | E/2 | 12.700, 1.400, 1.500, 1.300, 2.700, 0.300, 2.200, 2.400, 1.200, 2.000, 1.100 | 12.700 | 11.800, 1.000, 0.900, 0.600, 0.800, 0.700, 0.700, 0.800, 1.800, 0.700, 1.600, 0.500, 1.500, 0.500, 1.400, 0.500, 1.600, 0.500, 1.500, 0.500 |
| type-nested-d5-f4-validate-burst | E/3 | 12.700, 1.300, 1.600, 1.300, 1.500 | 12.700 | 11.700, 1.000, 0.800, 0.700, 0.800, 0.600, 1.400, 0.700, 1.100, 0.800, 1.600, 0.500, 1.400, 0.500, 1.300, 0.400, 1.400, 0.500, 1.400, 0.500 |
| type-nested-d5-f4-validate-burst | E/4 | 12.900, 0.300, 1.300, 1.200, 5.000, 0.200, 0.300, 1.200, 1.100, 1.600, 1.700, 1.100 | 12.900 | 11.900, 1.000, 1.000, 0.700, 0.800, 0.600, 0.700, 0.500, 2.200, 0.700, 1.500, 0.500, 1.400, 0.400, 1.400, 0.500, 1.300, 0.500, 1.500, 0.500 |
| type-nested-d5-f4-validate-burst | E/5 | 12.900, 1.700, 1.300, 1.500, 1.900, 5.200, 2.200, 2.200, 2.100 | 12.900 | 11.800, 1.000, 1.000, 0.800, 0.900, 0.700, 0.800, 1.300, 1.300, 0.800, 1.500, 0.500, 1.500, 0.500, 1.400, 0.500, 1.500, 0.600, 1.400, 0.600 |
| type-nested-d5-f4-validate-burst | E/6 | 13.000, 1.600, 3.800, 1.400 | 13.000 | 12.000, 1.000, 0.900, 0.700, 0.800, 0.600, 0.700, 1.000, 1.800, 0.700, 1.800, 0.700, 1.700, 0.500, 1.600, 0.500, 1.400, 0.400, 1.600, 0.700 |
| type-nested-d5-f4-validate-burst | E/7 | 12.700, 1.600, 2.100, 2.700, 2.200, 2.200, 0.200, 0.200 | 12.700 | 11.700, 1.000, 1.000, 0.700, 0.900, 0.600, 1.200, 0.800, 1.900, 0.600, 1.500, 0.500, 1.500, 0.500, 1.500, 0.300, 1.300, 0.600, 1.400, 0.500 |
| type-nested-d5-f4-validate-burst | E/8 | 13.000, 1.500, 1.500, 2.000, 4.200, 2.600, 1.400, 1.100, 2.300, 1.200, 1.300, 2.200, 1.200 | 13.000 | 11.900, 1.000, 1.000, 0.700, 0.800, 1.300, 1.100, 0.800, 1.900, 0.600, 1.600, 0.600, 1.600, 0.500, 1.500, 0.500, 1.600, 0.500, 1.600, 0.500 |
| type-nested-d5-f4-validate-burst | E/9 | 12.900, 1.700, 4.900, 1.500, 2.400, 1.200 | 12.900 | 11.900, 1.000, 0.900, 0.600, 0.600, 0.700, 0.800, 0.900, 3.800, 0.700, 1.500, 0.700, 1.600, 0.700, 1.500, 0.500, 1.500, 0.400, 1.500, 0.500 |
| type-nested-d5-f4-validate-burst | F/0 | 4.900, 1.400, 1.500, 0.300, 5.200, 1.500, 1.200, 0.900 | 5.200 | 3.900, 0.800, 0.700, 0.500, 0.500, 0.600, 0.600, 0.700, 0.600, 0.500, 0.300, 0.400, 0.400, 0.500, 0.400, 0.400, 0.300, 0.400, 0.400, 0.400 |
| type-nested-d5-f4-validate-burst | F/1 | 4.700, 1.400, 0.200, 1.700, 1.400, 1.200, 1.200, 1.200 | 4.700 | 3.800, 0.800, 0.700, 0.600, 0.400, 1.000, 0.600, 0.600, 0.400, 0.500, 0.400, 0.400, 0.300, 0.300, 0.400, 0.300, 0.400, 0.400, 0.400, 0.200 |
| type-nested-d5-f4-validate-burst | F/2 | 1.500, 0.300, 1.200, 0.300, 1.100, 0.400, 0.200, 0.100, 1.000, 1.100, 0.200, 1.000, 0.100, 1.100 | 1.500 | 4.000, 0.800, 0.600, 0.500, 0.500, 0.500, 0.400, 1.000, 0.800, 0.500, 0.300, 0.400, 0.400, 0.400, 0.300, 0.300, 0.400, 0.300, 0.300, 0.400 |
| type-nested-d5-f4-validate-burst | F/3 | 1.500, 0.300, 1.300, 0.300, 1.300, 1.800, 3.400, 1.500, 1.100, 0.900, 1.000, 1.000, 0.900, 1.000 | 3.400 | 4.000, 0.700, 0.600, 0.700, 0.600, 0.600, 0.600, 0.700, 0.700, 0.600, 0.400, 0.400, 0.400, 0.200, 0.400, 0.400, 0.300, 0.400, 0.400, 0.400 |
| type-nested-d5-f4-validate-burst | F/4 | 0.400, 0.300, 1.300, 1.100, 1.200 | 1.300 | 3.800, 0.800, 0.600, 0.600, 0.600, 0.500, 1.200, 0.800, 0.600, 0.400, 0.400, 0.400, 0.400, 0.300, 0.300, 0.300, 0.400, 0.300, 0.200, 0.300 |
| type-nested-d5-f4-validate-burst | F/5 | 4.900, 1.800, 1.300, 1.300, 1.000, 1.200, 0.600, 0.400, 1.100, 1.000, 0.200, 1.100, 0.200, 1.000 | 4.900 | 3.900, 0.900, 0.600, 0.600, 0.500, 0.500, 0.500, 1.000, 0.800, 0.500, 0.300, 0.400, 0.300, 0.400, 0.400, 0.400, 0.400, 0.300, 0.400, 0.300 |
| type-nested-d5-f4-validate-burst | F/6 | 0.400, 0.300, 1.300, 1.300, 1.100, 2.300, 1.500, 1.100, 1.100, 1.000, 0.900, 1.000, 0.900, 1.300, 0.900, 0.900, 1.000, 1.000 | 2.300 | 3.800, 0.800, 0.500, 0.600, 0.500, 0.500, 0.600, 0.800, 0.600, 0.400, 0.400, 0.400, 0.400, 0.400, 0.400, 0.400, 0.400, 0.300, 0.400, 0.300 |
| type-nested-d5-f4-validate-burst | F/7 | 0.300, 1.400, 1.700, 3.300, 1.200, 1.000, 0.900, 0.900, 1.000, 1.000, 1.100, 0.800, 0.900, 1.100 | 3.300 | 3.800, 0.900, 0.600, 0.600, 0.700, 0.600, 0.500, 1.100, 0.600, 0.600, 0.500, 0.400, 0.300, 0.400, 0.400, 0.300, 0.400, 0.300, 0.300, 0.400 |
| type-nested-d5-f4-validate-burst | F/8 | 1.300, 1.300, 2.700, 1.600, 2.300, 1.300, 1.100, 1.000, 1.000, 1.100, 1.000, 0.900, 1.000, 0.900, 0.800, 1.000 | 2.700 | 3.900, 0.900, 0.600, 0.600, 0.500, 0.600, 1.900, 0.700, 0.700, 0.600, 0.400, 0.500, 0.400, 0.400, 0.400, 0.300, 0.400, 0.400, 0.300, 0.400 |
| type-nested-d5-f4-validate-burst | F/9 | 1.500, 1.200, 1.800, 1.600, 3.000, 1.200, 0.900, 1.100, 0.800, 0.800, 1.300, 1.000, 0.900, 0.900, 0.900, 0.900 | 3.000 | 3.800, 0.800, 0.700, 0.500, 0.500, 0.500, 0.700, 0.800, 0.600, 0.500, 0.300, 0.400, 0.300, 0.300, 0.400, 0.300, 0.400, 0.300, 0.300, 0.400 |
| type-flat-2000-validate-burst | L/0 | 5.100, 2.900, 3.100, 3.300, 3.000, 2.800, 3.100, 2.800, 0.000, 2.800 | 5.100 | 3.600, 2.000, 1.700, 1.900, 1.900, 1.900, 1.800, 1.800, 1.800, 1.900, 1.800, 1.800, 1.800, 1.700, 1.900, 1.800, 1.700, 1.700, 1.600, 1.600 |
| type-flat-2000-validate-burst | L/1 | 5.200, 3.100, 3.200, 3.000, 3.100, 2.800, 2.900, 2.900 | 5.200 | 3.700, 2.000, 2.000, 1.900, 1.800, 1.800, 1.800, 1.900, 1.900, 1.700, 1.900, 1.700, 1.700, 1.600, 1.700, 1.700, 1.700, 1.700, 1.600, 1.700 |
| type-flat-2000-validate-burst | L/2 | 0.500, 0.400, 3.200, 3.100, 3.200, 3.500, 0.400, 3.100, 3.400, 3.000 | 3.500 | 3.600, 2.000, 1.900, 1.800, 1.700, 2.000, 1.800, 1.700, 2.000, 1.700, 1.800, 2.000, 1.900, 1.800, 1.900, 1.900, 1.600, 1.800, 1.800, 1.700 |
| type-flat-2000-validate-burst | L/3 | 0.500, 3.100, 3.000, 2.900, 3.100, 3.100, 2.800, 3.100, 2.800, 2.900 | 3.100 | 3.700, 2.100, 1.800, 1.800, 1.800, 2.000, 1.900, 1.800, 1.800, 1.800, 1.800, 1.800, 1.700, 1.900, 1.700, 1.800, 1.700, 1.700, 1.900, 1.800 |
| type-flat-2000-validate-burst | L/4 | 0.500, 3.100, 3.300, 3.000, 3.000, 3.100, 2.800, 3.200, 3.200, 3.500, 2.700 | 3.500 | 3.800, 2.000, 1.900, 1.700, 2.200, 1.900, 1.900, 1.900, 1.800, 1.800, 1.800, 1.900, 1.700, 1.600, 1.900, 1.800, 1.700, 1.500, 1.700, 1.600 |
| type-flat-2000-validate-burst | L/5 | 5.500, 0.400, 3.100, 2.900, 3.400, 3.200, 0.400, 3.200, 0.400, 2.900, 3.500, 2.800 | 5.500 | 4.100, 2.000, 1.800, 1.900, 1.800, 1.800, 2.000, 1.900, 1.800, 1.700, 2.000, 1.800, 1.800, 1.800, 1.700, 1.700, 1.800, 1.700, 1.500, 1.600 |
| type-flat-2000-validate-burst | L/6 | 0.600, 0.400, 3.100, 0.400, 3.200, 3.000, 3.000, 2.900, 2.700, 0.100, 2.800, 2.700, 2.800 | 3.200 | 3.700, 2.300, 1.900, 1.700, 1.900, 1.900, 1.800, 1.800, 2.000, 1.800, 1.800, 1.800, 1.600, 1.700, 1.500, 1.800, 1.700, 1.600, 1.600, 1.500 |
| type-flat-2000-validate-burst | L/7 | 0.400, 0.400, 3.300, 3.100, 2.900, 2.800, 3.400, 2.800 | 3.400 | 3.600, 1.900, 1.800, 1.900, 1.800, 2.100, 1.800, 1.800, 1.900, 1.900, 1.700, 1.700, 1.800, 1.700, 1.700, 1.600, 1.800, 1.900, 1.600, 1.600 |
| type-flat-2000-validate-burst | L/8 | 0.500, 0.300, 3.100, 0.400, 3.200, 3.000, 3.100, 2.700, 0.000, 3.000 | 3.200 | 3.600, 2.100, 1.900, 1.800, 1.800, 1.800, 1.900, 1.800, 1.900, 1.800, 1.800, 1.800, 1.800, 1.600, 1.600, 1.600, 1.800, 1.800, 1.700, 1.700 |
| type-flat-2000-validate-burst | L/9 | 5.700, 3.500, 3.600, 3.400, 3.400, 3.400, 3.300, 3.700, 3.300, 3.700, 3.300, 3.400, 3.200, 3.100, 3.000, 3.000, 3.100, 3.200 | 5.700 | 4.000, 2.100, 1.900, 2.100, 1.900, 2.000, 1.800, 1.900, 2.200, 1.800, 2.200, 1.900, 2.000, 1.900, 1.900, 1.900, 1.700, 1.800, 1.900, 1.800 |
| type-flat-2000-validate-burst | E/0 | 6.100, 3.100, 3.100, 3.200, 2.800, 4.100, 2.600, 2.700, 3.800, 2.700 | 6.100 | 4.800, 2.100, 1.900, 1.900, 1.700, 1.900, 1.500, 1.800, 1.600, 2.800, 1.500, 2.600, 1.500, 2.700, 1.500, 2.600, 1.400, 2.600, 1.300, 2.600 |
| type-flat-2000-validate-burst | E/1 | 3.100, 2.800, 3.100, 2.900, 3.900, 2.500, 3.500, 2.500, 3.700 | 3.900 | 4.900, 2.000, 1.800, 2.000, 1.700, 1.900, 1.500, 1.800, 1.700, 2.700, 1.400, 2.800, 1.300, 2.500, 1.400, 2.500, 1.400, 2.700, 1.400, 2.700 |
| type-flat-2000-validate-burst | E/2 | 6.100, 3.000, 2.800, 3.200, 2.900, 3.900, 3.100, 4.000, 2.400, 4.100, 2.900, 4.200, 2.900, 3.900, 2.800, 3.800 | 6.100 | 4.800, 2.100, 1.900, 1.800, 1.800, 1.800, 1.700, 2.000, 1.700, 2.900, 1.700, 2.800, 1.500, 2.800, 1.500, 2.900, 1.500, 2.600, 1.500, 2.800 |
| type-flat-2000-validate-burst | E/3 | 6.300, 3.500, 2.800, 2.700, 4.000, 3.800, 2.700, 3.900, 2.300, 2.700, 4.000 | 6.300 | 5.000, 2.200, 1.800, 2.000, 1.800, 1.900, 1.600, 1.700, 1.500, 2.700, 1.600, 2.700, 1.500, 2.600, 1.500, 2.600, 1.300, 2.600, 1.500, 2.900 |
| type-flat-2000-validate-burst | E/4 | 3.200, 0.400, 3.000, 3.100, 3.000, 3.100, 2.500, 2.600, 2.600, 3.500, 2.600, 3.600 | 3.600 | 4.800, 1.900, 1.900, 1.900, 1.800, 1.800, 1.500, 1.800, 1.800, 2.700, 1.400, 2.600, 1.400, 2.700, 1.500, 2.500, 1.400, 2.600, 1.400, 2.600 |
| type-flat-2000-validate-burst | E/5 | 3.100, 0.400, 3.000, 3.000, 2.800, 2.700, 3.900, 2.800, 2.700, 3.600, 2.500, 3.800 | 3.900 | 4.700, 2.000, 1.900, 2.000, 1.800, 1.800, 1.600, 1.600, 1.600, 2.800, 1.600, 2.800, 1.500, 2.600, 1.500, 2.800, 1.400, 2.600, 1.400, 2.700 |
| type-flat-2000-validate-burst | E/6 | 3.200, 2.900, 3.100, 2.700, 2.800, 4.100, 4.100, 2.900, 2.500, 3.500, 2.500, 3.700 | 4.100 | 5.000, 2.000, 1.900, 2.000, 1.700, 1.800, 1.500, 1.700, 1.600, 2.900, 1.400, 2.800, 1.500, 2.700, 1.500, 2.600, 1.300, 2.500, 1.300, 2.500 |
| type-flat-2000-validate-burst | E/7 | 6.100, 2.900, 2.700, 2.900, 2.600, 4.000, 2.600, 3.600, 2.500 | 6.100 | 4.700, 2.000, 1.900, 2.000, 1.800, 1.700, 1.600, 1.700, 1.800, 2.700, 1.500, 2.800, 1.400, 2.700, 1.500, 2.600, 1.400, 2.600, 1.500, 2.600 |
| type-flat-2000-validate-burst | E/8 | 3.100, 0.500, 3.200, 2.500, 3.000, 3.900, 3.100, 2.800, 3.700 | 3.900 | 4.900, 2.000, 1.900, 1.900, 1.700, 1.900, 1.500, 1.800, 1.700, 2.800, 1.500, 2.800, 1.500, 2.800, 1.600, 2.600, 1.400, 2.500, 1.500, 2.600 |
| type-flat-2000-validate-burst | E/9 | 6.300, 3.300, 3.200, 3.100, 3.100, 4.000, 2.600, 3.800, 2.200, 3.600, 2.500, 3.800 | 6.300 | 4.800, 2.100, 2.100, 1.900, 1.900, 1.900, 1.600, 1.700, 1.600, 2.700, 1.500, 2.800, 1.400, 2.800, 1.600, 2.700, 1.300, 2.500, 1.400, 2.800 |
| type-flat-2000-validate-burst | F/0 | 0.500, 0.500, 0.400, 0.500, 0.400, 0.700, 0.300, 0.400, 0.400, 0.500, 0.400, 0.300, 0.400, 0.000, 0.000, 2.200 | 2.200 | 4.100, 1.300, 1.400, 1.200, 1.200, 1.200, 1.200, 1.100, 1.100, 1.100, 0.900, 1.000, 1.000, 0.900, 1.000, 0.900, 0.900, 0.900, 1.000, 0.800 |
| type-flat-2000-validate-burst | F/1 | 5.700, 2.400, 2.400, 2.500, 2.400, 0.400, 2.200, 0.300, 0.400, 2.300, 2.400, 2.200, 0.000, 0.000 | 5.700 | 4.200, 1.200, 1.200, 1.200, 1.200, 1.300, 1.100, 1.000, 1.200, 1.100, 1.100, 1.000, 1.000, 0.900, 0.900, 0.900, 0.900, 0.800, 0.900, 1.000 |
| type-flat-2000-validate-burst | F/2 | 6.000, 0.400, 2.500, 2.400, 2.300, 2.300, 0.500, 2.200, 0.400, 0.400, 0.400, 0.400, 0.000, 2.300, 2.400, 2.200 | 6.000 | 4.400, 1.400, 1.300, 1.300, 1.300, 1.300, 1.100, 1.300, 1.000, 1.000, 1.000, 1.000, 1.100, 1.000, 1.000, 0.900, 0.900, 0.900, 1.000, 1.100 |
| type-flat-2000-validate-burst | F/3 | 5.600, 2.400, 0.500, 0.400, 2.400, 2.200, 2.300, 2.300, 2.400, 2.400, 2.200, 2.100, 2.200, 2.200, 2.100, 2.200, 2.200, 2.100, 2.200, 2.000 | 2.400 | 4.200, 1.200, 1.100, 1.200, 1.300, 1.200, 1.100, 1.200, 1.100, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.100, 1.000, 0.900, 0.900 |
| type-flat-2000-validate-burst | F/4 | 2.400, 2.400, 0.600, 0.400, 2.500, 2.200, 0.400, 0.400, 0.500, 2.200, 0.400, 0.500, 2.500, 2.000, 1.900, 2.100, 0.000 | 2.500 | 4.300, 1.200, 1.200, 1.200, 1.300, 1.300, 1.200, 1.200, 1.200, 1.100, 1.100, 1.000, 0.900, 1.000, 0.900, 1.000, 1.000, 0.900, 0.900, 0.900 |
| type-flat-2000-validate-burst | F/5 | 5.600, 2.600, 2.300, 2.300, 2.500, 2.200, 2.500, 2.800, 2.400, 2.400, 2.200, 2.500, 2.300, 2.200, 2.200, 2.000, 1.900, 2.200, 2.000 | 5.600 | 4.200, 1.400, 1.200, 1.200, 1.200, 1.100, 1.100, 1.100, 1.200, 1.100, 1.100, 1.000, 1.100, 1.000, 1.100, 0.900, 0.800, 1.000, 0.900, 1.000 |
| type-flat-2000-validate-burst | F/6 | 5.700, 2.400, 2.300, 0.400, 2.300, 0.500, 0.400, 0.500, 0.400, 0.400, 0.300, 0.400, 2.200, 2.100, 2.000 | 5.700 | 4.200, 1.300, 1.200, 1.200, 1.100, 1.200, 1.200, 1.100, 1.200, 1.000, 1.100, 1.000, 1.100, 0.900, 1.000, 0.900, 0.900, 0.900, 0.900, 0.900 |
| type-flat-2000-validate-burst | F/7 | 5.500, 2.300, 2.300, 2.400, 2.300, 2.500, 2.300, 2.500, 2.300, 2.300, 2.300, 2.100, 2.200, 2.200, 2.100, 2.000, 2.200, 2.000, 2.200, 2.200 | 2.500 | 4.100, 1.300, 1.300, 1.300, 1.200, 1.200, 1.300, 1.100, 1.100, 1.200, 1.100, 1.000, 1.000, 1.000, 0.900, 0.900, 1.100, 1.000, 0.900, 1.000 |
| type-flat-2000-validate-burst | F/8 | 0.500, 0.400, 0.600, 2.700, 2.500, 2.500, 0.600, 2.600, 2.300, 2.400, 2.100, 2.100, 0.300, 0.000, 0.000, 0.000, 2.000 | 2.700 | 4.000, 1.300, 1.300, 1.200, 1.200, 1.300, 1.200, 1.200, 1.300, 1.200, 1.100, 0.900, 1.100, 0.900, 1.000, 1.000, 1.100, 0.900, 0.900, 0.900 |
| type-flat-2000-validate-burst | F/9 | 2.500, 0.500, 0.400, 0.500, 0.400, 0.500, 0.500, 0.400, 0.400, 0.400, 2.200, 0.400, 0.500, 0.100, 0.100, 0.100, 2.200, 2.000 | 2.500 | 4.200, 1.200, 1.300, 1.300, 1.200, 1.200, 1.200, 1.200, 1.100, 1.100, 1.100, 1.100, 1.000, 1.100, 1.000, 0.900, 1.000, 0.900, 1.000, 1.000 |

</details>
<!-- IR6_DIAG_TABLES_END -->

재현 명령은 `node packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/browser/diagnosis/tools/checkDiagnosis.mjs`입니다. 원시 hash·최종 profile 집계·bootstrap 진단·모든 표를 재생하며 browser나 새 성능 창을 시작하지 않습니다. 정식 원시와 MAIN_TABLES 블록은394e8898f와 동일합니다.

판정: 진단 전용 자료 작성, 정식 G2·G8 실패 유지 — 개선 설계·검토 디스패치 대기

## 6차 수정 — Amendment 10

승인된 D1–D6을 적용한다. enabled/live가 거짓이면 reveal을 읽지 않고, live 표시는 순수 판단을 사용하며 held 표시만 기존 첫 자식 뒤에 passive subscriber를 추가한다. FieldProxy는 모듈 reducer를, input은 기존 composition reducer를 사용한다. aggregate getter의 후보 version+1/비후보0은 유지한다. 계약 커밋 ee1b4e824가 제품 변경보다 앞선다.

해제의 reducer dispatch는 현재 이벤트 우선순위를 따른다. 노드 사건 없는 해제는 최악 한 paint 늦어 약2프레임에 한 프레임이 더해질 수 있다. transition은 transition lane, passive catch-up은 default이며 매 렌더가 이력을 다시 읽는다. 오류 변경의 기존 tracker는 sync를 유지한다.

동일 커밋에서 입력 형제의 layout effect가 history를 해제하고 검증기는 미해결로 두는 실제 Form 시험을 추가했다. [catch-up 제거 React19](raw/ir-6/code/round-6/red-catchup-render.json.gz)에서는 이 시험과 Activity 재연결이 false→true assertion에서 실패한다. [React18](raw/ir-6/code/round-6/red-catchup-react18.json.gz)도 동일 커밋 catch-up이 실패하며 Activity는 harness로 건너뛴다. 변이 코드는 scratch에만 존재한다.

[모든 live 표시를 구독하는 변이 React19](raw/ir-6/code/round-6/red-mount-render.json.gz)와 [React18](raw/ir-6/code/round-6/red-mount-react18.json.gz)는 mount/hydration의 Always=hidden 계수 비교에서 실패한다. aggregate release 전 passive 시험은 그대로 유지한다.

[V3 fragment 배치 변이 React19](raw/ir-6/code/round-6/red-fragment-render.json.gz)와 [React18](raw/ir-6/code/round-6/red-fragment-react18.json.gz)는 hold 시작의 입력 DOM identity 비교에서 실패한다. 현재 구현은 ErrorBoundary/FieldInput을 항상 첫 자식에 고정한다.

코디네이터 msg_408720d9d417 승인에 따라 test3·5는 baseline set 항목의 rootNode를 release 함수에 전달한다. release는 같은 root runtime의 전체 이력을 해제하므로 이 수명의 루트가 정식 인자이며, 루트와 runtime identity를 시험에서 확인한다. record의 재귀 제네릭 형을 캐스트하지 않고 제품 시그니처·공개 표면은 유지한다.

최종 관문은 unit619파일/4089통과(todo1), render154/882통과(기존2skip), react18 154/881통과(기존2+Activity1skip), verify778/5015통과(todo1·기존2skip), storybook101/254통과, production10/21통과입니다. 각 프로젝트의 범위는 겹치므로 합산하지 않습니다. 타입 identity 표현 정리 뒤 정확한 최종 생명주기 fixture는 render3/react18 2통과+Activity1skip으로 다시 확인했습니다. 예비 typecheck와 겹친 unit은 예비 원시로 분리하고 독립 serial unit 결과를 최종 증거로 사용합니다.

lint 경고0·typecheck·build exit0이며 production은 새 build 다음에 실행했습니다. unit에 포함된 importModel2사례도 통과했습니다. [정적 관문](raw/ir-6/code/round-6/static-checks.json), [관문·입력 해시](raw/ir-6/code/round-6/code-gates.json), [생명주기 최종 React19](raw/ir-6/code/round-6/final-lifecycle-render.json.gz)·[React18](raw/ir-6/code/round-6/final-lifecycle-react18.json.gz)를 보존합니다. 제품 커밋은61e28eb44이며 dist는 source commit에서 제외했습니다.

공개 선언은97root·55도달파일·917서명에서 의미 차이0·index 바이트 차이0·unsafe runtime 노출0입니다. [평가 결과](raw/ir-6/code/round-6/evaluated-public-declarations.json.gz)와 [양성·복원 대조](raw/ir-6/code/round-6/declaration-controls.json)를 보존합니다. 양성 주입은+1/−9와 exit1, 복원은 차이0·exit0입니다. 기존 승인 public JSDoc14쌍·5파일은 그대로이며 내부 전체 그래프의 보수 비교 차이는 공개 계약 차이로 세지 않습니다.

FCA는 로컬 추출기로1753자료를 갱신한 뒤 [차분](raw/ir-6/code/round-6/fca-diff.json)에서 기존 finding202·diagnostic177·failed12/skipped1·indeterminate를 유지하며 새 차이0입니다. 초기 미갱신 자료의 검사는 예비 원시로 분리했습니다. [원장 관문](raw/ir-6/code/round-6/ledger-checks.json)은 ref1416문제0/verbatim327불일치0/sup3584불일치0·unparsed0, doc-coverage25문서·1144항목·기존uncited66·무태그0입니다. [연속성 대조](raw/ir-6/code/round-6/continuity-controls.json)는 aggregate의 두 번째 mount 시험과 same-commit 시험, 기존 주요 회귀, public index·version 보존과 원문33·36 맥락 포함 바이트를 확인합니다. 새 diff의 유일한 trailing whitespace는 소유자 원문36의 공백 보존이며 다른 공백 오류는0입니다.

명령 node packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/code/round-6/checkRound6.mjs가2884개 소스 해시·원시 시험·선언·FCA·정적 관문을 대조합니다. [경로 감사](raw/ir-6/code/round-6/machine-path-audit.json)는 새 머신 경로0을 확인하고 이전540표본의 G2/G8 FAIL을 그대로 재현합니다. 이는 개선 후보의 정식 성능 증거가 아닙니다. 코드 검토와 사전 진단 뒤 go Phase E를 기다리며 verification.md는 수정하지 않았습니다.

정리: catch-up·mount·fragment 실패 변이의 세 scratch를 각각 JSON 저장·인용 직후 Orca rm으로 제거했습니다. Orca 비동기 정리 뒤 red branch 세 개는 사라졌고 각 base config key는 남았습니다. diag-display는 진단 결과 커밋 ff184c918 직후 제거했고 temp/ir6-diag-display branch와 base key는 남았습니다. 이 잔여 상태를 우회하지 않고 코디네이터에 보고하며 lane-e는 측정 수락까지 유지합니다.

### 6차 사전 진단 — 정식 성능 증거 제외

ccf4ec8ae의 개선 제품과 E(facd72a71), F-old(394e8898f와 같은 제품), V1 inline 진단 참조를 비교했습니다. 각 모드·레인에3예열/10새페이지, 총24예열 폐기·80유지 페이지를 forward/reverse 교차 순서로 끝까지 수집했습니다. 프로파일러는 사용하지 않았고, 시작 msg_da27813af3d8·종료 msg_1d10fe3a46f0 사이에 검사·빌드가 겹치지 않았습니다. 모든 자료는 diagnosticOnly=true·formalGateEvidence=false이며 이전 정식 G2/G8 FAIL은 유지합니다.

<!-- IR6_R6_DIAG_TABLES:START -->
| 모드 | 중앙값(ms) | E | F-old | F-new | V1 | F-new/E | F-new−V1(ms) | F-new−F-old(ms) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| None | first | 146.300 | 142.050 | 138.250 | 148.300 | 0.944976 | -10.050 | -3.800 |
| None | eager | 204.200 | 213.950 | 206.650 | 205.450 | 1.011998 | 1.200 | -7.300 |
| OnChange | first | 157.300 | 140.850 | 136.550 | 146.300 | 0.868086 | -9.750 | -4.300 |
| OnChange | eager | 214.050 | 224.450 | 215.650 | 216.450 | 1.007475 | -0.800 | -8.800 |
<!-- IR6_R6_DIAG_TABLES:END -->

두 모드 모두 F-new eager가 F-old보다 낮아 brief의 추가 질문 조건은 발동하지 않습니다. E 대비 eager 잔여 차이는 None2.45ms·OnChange1.60ms이며, 새 정식 창에서 확인할 비용입니다. first도 F-old보다3.80/4.30ms 낮았습니다. 약2프레임에 최악 한 paint가 더해질 수 있는 표시 우선순위 한계를 함께 유지합니다. V1은 H를 지키지 않는 진단 참조입니다.

[요약](raw/ir-6/browser/diagnosis/round-6/summary.json), [80페이지·입력](raw/ir-6/browser/diagnosis/round-6/diagnostic-complete.json.gz), [원시 해시](raw/ir-6/browser/diagnosis/round-6/capture-manifest.json)로 대조합니다. 개선 제품 코드 검토와 go Phase E를 기다리며 verification.md와 정식 수집은 시작하지 않았습니다.

사전 진단의 모든 표와80페이지 원시는 node packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/browser/diagnosis/round-6/checkRound6Diagnosis.mjs로 대조합니다. [정리 재확인](raw/ir-6/code/round-6/workspace-cleanup.json)은 네 디렉토리 제거·lane-e와 본 작업공간 보존, 잔여 branch/config를 기록합니다.

판정: 표시 개선·사전 진단 완료, 독립 검토와 정식 재측정 대기(이전 G2/G8 FAIL 유지).
