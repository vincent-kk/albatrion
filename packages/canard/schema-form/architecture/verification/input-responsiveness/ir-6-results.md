# IR-6 — 다음 화면 뒤 검증

## 입력과 범위

기준 레인 E는 facd72a71(제품814d21ad4), 비교 L은 공개0.16.1 별칭입니다. 코드 관문 대상 제품은 dc091af34이며 F는 독립 검토 뒤 확정할 IR-6의 최종 출하 번들입니다. 설계v3.1과 amendment1, store.load 식별자에 관한 코디네이터 승인을 적용합니다. 버전·G·virtualization 기본값은 변경하지 않습니다. 정식 측정은 독립 코드 검토와 window clear 뒤에만 시작합니다. 현재 성능 표본은 없습니다.

## 코드 검증

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

## 성능 관문 상태

G1–G5와 소유자 목표의 L·E·F 비교는 미측정입니다. 독립 코드 검토에서 `code accepted; window clear`를 받은 뒤 amendment A5의 사전 규칙을 커밋하고 정식 창을 시작합니다. 현재 표본 수0이며 코드 관문 통과를 성능 통과로 읽지 않습니다.

## 미결 항목

- A4 기존 한계: prepared load의 layout effect가 Suspense·Activity로 정리되어 !ready인 동안 보고된 기록은 load.records에 버퍼링되지만 다시 전달되지 않습니다. D1에서 마운트 슬롯 전에 숨겨진 폼의 쓰기 컴파일 실패가 이 경로를 탈 수 있으며 reportValidationFailure의 호스트 오류 싱크는 계속 받습니다. 이번 범위에서 수정하지 않습니다.
- if 게이트의 렌더 중 전체 컴파일(G), 검증 계산량 자체, virtualization 기본 off와 기존 useChildFields 결함은 범위 밖입니다.
- 실제 브라우저 측정은 production React19.2.6을 대상으로 하며 React18 브라우저 레인은 측정하지 않습니다.

판정: 코드 관문 통과, 독립 검토 대기, 측정 전
