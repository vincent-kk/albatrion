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
