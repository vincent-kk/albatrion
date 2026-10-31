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

주기는 다음 프레임 뒤 선행 실행, 실행 이후 연속 요청의 프레임 이월, 첫 무요청 프레임 뒤 후행 실행, 마지막 자동 실행 시작 기준500ms 상한을 따릅니다. 시간 정책은 도메인 없는 validationScheduling 한 경계에 모으고 clock을 주입합니다. 런타임이 주기를 지연 소유하고 매 요청을 넘기며 실제 트리 폐기에서 모든 핸들을 취소합니다. 마운트는 일회성 슬롯이며 명시적 validate·제출과 기존 스탬프·최신 커밋·오류 배달은 도메인에 남깁니다. validationQueued는 모든 독자를 대조한 뒤 제거했습니다.

수정 전 증거: R1·R2 세 렌더 회귀는 React18·19 각3개 실패, R4 취소 API 부재 회귀1개 실패입니다. 정확한 1차 제품 c0b2f169a에서는 40프레임 스트림이 React18·19 모두40회 검증하여 예상2회(스트림 중 선행+상한)에 실패했고, 새 cadence API는 부재로 수집 실패했습니다. 폐기용 watch 프레임·carry 중 루트 validate 회귀도1차에서 실패했으며 현재 콜백을 바꾸는 대조는1차에서도 통과합니다. 새 주기의 첫 구현은 초기 배달 콜백을 영구 포착하는 회귀가 실패했고 최신 도메인 실행 본문을 보관하여 수정했습니다. 이 결과를 원시에서 구분합니다.

R7의 미발화 프레임 대기, R8의 Node setImmediate, R9 슬롯 주석, R10 한국어 INTENT, R11 React.Activity 직접 참조를 반영했습니다. R12 render-delay의 validation-on 행은 검증기 없는 동기 node-tree mount와 슬롯 예약만 재며 뒤 매크로태스크·판정 완료 지연을 재지 않는 범위임을 벤치 주석에 기록했습니다. R13 원장 색인·정본 위치·보충 형식과 R14 열 문서의 문장별 ID도 수정했습니다. 기존 원문은 VALIDATE-052 신규 색인 행 삽입만 승인된 예외이며 나머지 병합 prefix는 보존합니다.

R15와 Amendment3의 측정 추가는 window clear 뒤 커밋할 사전 규칙의 의무입니다. A5·G3의 전체 정의·문턱·환산·재측정·bootstrap과 stream-flat-2000-validate(준비3회·10페이지·60프레임·L/E/F), G6의 페이지별 실행 수≤2+ceil(기간÷500ms)와50ms 이상 프레임 총합 F≤E를 함께 기록합니다. G4는 non-burst의 매 키 배달만 판정합니다. 현재 정식 표본0입니다.

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

- R5 수용 한계: 같은 프레임 안의 쓰기 뒤 unmount하면 은퇴한 트리 검증이 한 번 실행됩니다. 판정은 구독자에게 배달되지 않고 실패는 호스트 싱크에만 도착합니다. cleanup 취소로 Suspense·Activity 숨김도 취소하는 것을 피하기 위해 한 실행 절감용 suspend/resume 기계를 추가하지 않습니다.
- R6 기존 한계: 비동기 명시적 dispatchValidate 실행 중 새 커밋이 도착하면 이전 커밋의 결과를 호출자에게 반환할 수 있습니다. 새 커밋에 대한 발행 검사는 유지하며 반환 동작은 이번 범위에서 바꾸지 않습니다.
- R4 기존 의존 제약: setImmediate와 MessageChannel이 모두 없는 호스트는 지원하지 않습니다. winglet의 스케줄러는 모듈 로드 시 실행 수단을 결정합니다.
- if 게이트의 렌더 중 전체 컴파일(G), 검증 계산량 자체, virtualization 기본 off와 기존 useChildFields 결함은 범위 밖입니다.
- 실제 브라우저 측정은 production React19.2.6을 대상으로 하며 React18 브라우저 레인은 측정하지 않습니다.

판정: 2차 코드 관문 통과, 독립 검토 대기, 측정 전


## 3차 수정 — Amendment 4·5

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
