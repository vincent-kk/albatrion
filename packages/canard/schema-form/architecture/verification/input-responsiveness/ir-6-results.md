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
