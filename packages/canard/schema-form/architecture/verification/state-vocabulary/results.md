# 상태 어휘 단계 구현 검증 결과

병합 기준은 `212967e0f1d2a044d40b9c090420b6b54a33d078`이며 #508·DR-16/17·466라운드 기록을 포함합니다. 승인된 v1와 Amendment 1–3을 구현했고 467라운드 기록을 추가했습니다. 원격 push·PR 생성·성능 창은 이 작업에서 실행하지 않았습니다.

## 1b947739d 당시 기능 관문

| 프로젝트 | 통과 | 실패 | skip | todo |
| --- | ---: | ---: | ---: | ---: |
| unit | 4226 | 0 | 0 | 1 |
| render | 1015 | 0 | 7 | 0 |
| react18 | 1013 | 0 | 9 | 0 |
| storybook | 254 | 0 | 0 | 0 |
| production | 21 | 0 | 0 | 0 |
| verify-unit | 4270 | 0 | 0 | 1 |
| verify-render | 1015 | 0 | 7 | 0 |
| scenarios | 45 | 0 | 0 | 0 |
| ajv6 | 130 | 0 | 0 | 0 |
| ajv7 | 135 | 0 | 0 | 0 |
| ajv8 | 334 | 0 | 0 | 0 |
| import-model | 2 | 0 | 0 | 0 |

schema-form lint 경고0·typecheck·정식 build가 통과했습니다. 외부 변경 패키지 scenarios와 AJV6/7/8의 typecheck·tests도 통과했습니다. production은 지정된 test:production 스크립트의 실제 NODE_ENV=production 경로로 실행했습니다. runtime·declaration·agent hash 빌드 산출물은 소스 커밋에 넣지 않습니다. [명령·횟수·소스 digest](raw/gate-summary.json) 및 해당 gzip JSON 보고서가 실행 증거입니다. 테스트는 이 작업대에서 한 번에 하나씩 순차 실행했습니다.

## Red·변이·비용

최초 fork 기준 red는 51건 중 통과18·실패33이며 새 심볼 부재로 실패했습니다. 코디네이터 msg_cd30dba4cb07의 승인으로 기존 상태 guard와 새 getter의 strict-false red를 분리했습니다. 현재는 두 그룹 모두 새 enum과 getter를 사용합니다. Amendment 3의 실제 static-first 시험은 모듈 spy·default d·undefined 입력·baseline 박스를 고정하고 별도 대입 제거 변이로 검증했습니다. [최초 red 요약](raw/initial-red.json), [여섯 변이](raw/mutations.json)에 각 표적과 실패 이유를 보존합니다.

baseline 매 commit 이동·memo 제거·child reset 기준 이동·loadSnapshot 사용·structuredClone·static-first 대입 제거의 여섯 변이가 각각 지정된 시험을 실패시켰습니다. 구조 복제 변이는 기준 Reflect.get 2200회로 ≤210 상한을 넘겼습니다. 각 실행 뒤 세 제품 파일의 바이트를 원래대로 복원했습니다. flat2000 비교1회, nested200×10 복귀 false·비교1회·기준 접근≤210, NaN 포함 반복 비교0회 및 쓰기의 기준 읽기/reader 호출0회가 현재 unit에서 통과했습니다.

## 전체 실행에서 확인한 원인과 보강

최초 전체 unit의 실패11건은 reveal-history 기대값의 옛 키, 현재 observer가 pinned 옛 노드에서 새 속성을 읽은 문제, 직접 spy 네 import 간선의 분류였습니다. AJV 런타임 dist 누락도 suite 로딩 실패를 일으켜 세 plugin의 정식 build로 준비했습니다. pinned 제품·revision·값·순서는 유지하고 pinned 빌드의 공용 observer 속성 읽기만 대응시켰습니다. 최종 관문 수정에서는 엔진 내부 spy를 엔진 fractal의 시험으로 옮기고 import-model 예외를 제거합니다. [보강 근거](raw/unit-repair.json)와 최초·부분 보강 JSON을 보존하며 최종 unit은 모두 통과합니다.

## 스냅숏·X1·원장

41개 대상(선택25·바퀴 이력15·large manifest1)의 키 변경을 일회성 tools로 증명했습니다. 출력은 required=41·total=54이며 역변환한 replay가 모든 기준 해시와 일치합니다. loading fixture와 private-history의 기존 별도 관문도 전체 unit에 포함됩니다. 제품 capture hook과 임시 update mode 변경은 제거했습니다. [도구 설명](tools/README.md)과 [X1 전량 분류](x1.md)를 참조합니다. X1 기준 rename735·recompute1358·schema/controls/props837, 현재 rename0·recompute1327·schema/controls/props807이며 현재 AST의 옛 노드 접근0입니다.

병합 기준 대비 원장 항목1416→1418, 보충 인용3665→3711, 소유자 답759→773이며 결정 원문 불일치·보충 불일치·해석 실패·ref 문제·소유자 미인용은 모두0입니다. 문장17영역 missing/bad classification0, 토큰 목록2394·잔여397은 동일합니다. 새 계획3개를 더한 plan-links 문제는 기존 ERROR-038의1건으로 동일합니다. doc-coverage 미인용66·다른 문제0도 동일합니다. 새 항목 VALUE-044·NODE-067의 모든 결정 코드 토큰을 인용 절에 넣고 문장마다 ID를 붙였습니다. [기준 검사](raw/ledger/base/summary.json)와 [최종 검사](raw/ledger/final/summary.json)에 검사 명령과 요약을 두고 [기준 전체 출력](raw/ledger/base/logs.json.gz)·[최종 전체 출력](raw/ledger/final/logs.json.gz)을 함께 보존합니다.

## FCA·경로·버전

filid facts bootstrap은 기준3149·현재3157 파일 exact, missing/uncertain/tool-error0으로 완료했습니다. 전체 저장소의 scan·6범위 validate·verification을 같은 snapshot으로 실행했습니다. [원시 다중집합 비교](raw/fca-comparison.json)에서 새 finding0·diagnostic0·verification 위반0입니다. 구조 finding566·실패26, diagnostic306, verification 위반30은 기준과 같습니다. 기존 위반 때문에 절대 판정은 FAIL이고 의존 분석 축의 indeterminate도 유지합니다. 이를 FCA PASS로 바꾸지 않습니다. Scan complete: 566 findings.

모든 변경 파일의 기계 경로와 package.json 버전을 감사했으며 경로 hit0·버전 변경0입니다. architecture README의 처음74행은 기준과 바이트 동일합니다. [감사 결과](raw/path-and-version-audit.json)를 참조합니다.

## 남은 단계

코디네이터가 성능 하네스·사전등록·독립 확인 뒤 B/F 측정 창을 수행하고 SV-1·SV-2·heap·절대 divergence 읽기 시간을 채웁니다. 이번 기능 관문은 성능 PASS를 주장하지 않습니다. 최종 독립 검토·PR 게시·병합과 Vincent의 버전·릴리스 결정이 남습니다.

## 최종 관문 수정 검증

1b947739d에 대한 Codex F1–F6·Opus O1–O3를 승인된 brief대로 반영했습니다. 위의 1b947739d 당시 원시와 수치는 보존하며 아래가 수정 후 최신 실행입니다.

| 프로젝트 | 통과 | 실패 | skip | todo |
| --- | ---: | ---: | ---: | ---: |
| unit | 4228 | 0 | 0 | 1 |
| render | 1018 | 0 | 7 | 0 |
| react18 | 1016 | 0 | 9 | 0 |
| storybook | 254 | 0 | 0 | 0 |
| production | 21 | 0 | 0 | 0 |
| verify-unit | 4272 | 0 | 0 | 1 |
| verify-render | 1018 | 0 | 7 | 0 |
| scenarios | 45 | 0 | 0 | 0 |
| ajv6 | 130 | 0 | 0 | 0 |
| ajv7 | 135 | 0 | 0 | 0 |
| ajv8 | 334 | 0 | 0 | 0 |
| import-model | 2 | 0 | 0 | 0 |

lint 경고0·typecheck·정식 build, 외부 scenarios·AJV6/7/8 typecheck/tests와 import-model 단독 검사를 순차 재실행했습니다. [최신 관문과 source digest](raw/final-gate/gate-summary.json), [명령 출력](raw/final-gate/commands.json)과 개별 gzip JSON을 보존합니다.

F1: root 출력·baseline에 의존하므로 루트 UpdateValue·UpdateState·RequestRefresh와 해당 노드 UpdatePath에서 다시 읽고 root/node 교체 때 재구독합니다. C는 load scope에 RequestRefresh를 항상 표시하고 S는 UpdateValue|RequestRefresh를 예약한 뒤 baseline 확정 후 배달합니다. 같은 출력 reset은 UpdateValue 없이도 RequestRefresh를 보냅니다. omitTrailing:true·omitEmpty:false로 빈 투영 배열을 보존한 뒤 push하면 /0이 absent→null로 바뀌며 로컬 값·경로·상태 사건 없이도 루트 구독으로 DOM이 갱신됩니다. [trace와 fixture](raw/final-gate/event-and-memo-trace.json)를 참조합니다.

F2·O1: 생성자에서 path/segments 두 memo 칸을 초기화하고 양쪽 분기 모두 주소가 같으면 파싱 경로를 재조회하지 않습니다. 320개 branchless 노드의 두 번째 sweep 파싱0이 통과합니다. 엔진 내부 spy는 settle 및 loadFieldNodeAtMount 시험으로 옮겼고 import-model 예외를 제거했습니다. 삭제한 spy 예외 식별자의 저장소 검색은 일치0입니다.

F3·F5·O2: 여섯 indexed type의 isMisfit, 두 API FieldNode 선언의 옛 이름14곳과 새 getter3개씩, mock override4곳, 시나리오 진단4곳을 고쳤습니다. bare 선언 검색을 추가해 기준 rename18·현재0을 기록했고 기존 X1 행은 보존했습니다. 전체 저장소의 props·schema/controls·작성 데이터와 gate/이전 상태 증인은 keep으로 분류합니다.

F4·F6: validator 교체 뒤 edit/revert와 같은 schema의 명시적 rebuild 뒤 baseline·edit/revert를 확인했습니다. 식 로드·default fill의 실제 baseline 박스, NaN의 첫 비교1·반복0을 강화했습니다. scratch source override의 F2 변이는 실패1(파싱320), 두 baseline 대입 제거는 지정된 세 시험 모두 실패, static-first 대입만 제거는 엔진·표면 두 시험 모두 실패했습니다. 작업 트리 제품 소스를 변이하지 않았습니다. [red·green·변이](raw/final-gate/mutations-and-focused.json)를 참조합니다.

원장 보충 인용은3711→3714이며 원문 불일치·ref·소유자 미인용·17영역 문장 문제는0입니다. 문서 미인용66·토큰 잔여397·기존 plan-links 문제1은 그대로입니다. [최신 원장 요약](raw/final-gate/ledger-summary.json)·[전체 출력](raw/final-gate/ledger-logs.json.gz)을 보존합니다.

FCA facts3160 exact, scan·6범위 validate·verification snapshot이 일치합니다. 병합 기준과 이전 HEAD 양쪽 대비 새 finding·diagnostic·verification 위반0이며 기존566/306/30 및 FAIL/indeterminate는 유지합니다. [양쪽 비교](raw/final-gate/fca-comparison.json), [경로·버전 감사](raw/final-gate/path-and-version-audit.json)를 참조합니다.

성능 규칙 파일은 측정 가지 소유이므로 추가하지 않았습니다. PR 본문의 다섯 측정란과 측정 창·최종 독립 검토는 코디네이터 후속입니다.
