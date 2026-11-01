# 상태 어휘 단계 구현 검증 결과

병합 기준은 `212967e0f1d2a044d40b9c090420b6b54a33d078`이며 #508·DR-16/17·466라운드 기록을 포함합니다. 승인된 v1와 Amendment 1–3을 구현했고 467라운드 기록을 추가했습니다. 원격 push·PR 생성·성능 창은 이 작업에서 실행하지 않았습니다.

## 최종 기능 관문

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

최초 전체 unit의 실패11건은 reveal-history 기대값의 옛 키, 현재 observer가 pinned 옛 노드에서 새 속성을 읽은 문제, 직접 spy 네 import 간선의 분류였습니다. AJV 런타임 dist 누락도 suite 로딩 실패를 일으켜 세 plugin의 정식 build로 준비했습니다. pinned 제품·revision·값·순서는 유지하고 pinned 빌드의 공용 observer 속성 읽기만 대응시켰습니다. importModel은 정확한 네 spy importer/target을 별도 계수하고 나머지 위반0을 유지합니다. [보강 근거](raw/unit-repair.json)와 최초·부분 보강 JSON을 보존하며 최종 unit은 모두 통과합니다.

## 스냅숏·X1·원장

41개 대상(선택25·바퀴 이력15·large manifest1)의 키 변경을 일회성 tools로 증명했습니다. 출력은 required=41·total=54이며 역변환한 replay가 모든 기준 해시와 일치합니다. loading fixture와 private-history의 기존 별도 관문도 전체 unit에 포함됩니다. 제품 capture hook과 임시 update mode 변경은 제거했습니다. [도구 설명](tools/README.md)과 [X1 전량 분류](x1.md)를 참조합니다. X1 기준 rename735·recompute1358·schema/controls/props837, 현재 rename0·recompute1327·schema/controls/props807이며 현재 AST의 옛 노드 접근0입니다.

병합 기준 대비 원장 항목1416→1418, 보충 인용3665→3711, 소유자 답759→773이며 결정 원문 불일치·보충 불일치·해석 실패·ref 문제·소유자 미인용은 모두0입니다. 문장17영역 missing/bad classification0, 토큰 목록2394·잔여397은 동일합니다. 새 계획3개를 더한 plan-links 문제는 기존 ERROR-038의1건으로 동일합니다. doc-coverage 미인용66·다른 문제0도 동일합니다. 새 항목 VALUE-044·NODE-067의 모든 결정 코드 토큰을 인용 절에 넣고 문장마다 ID를 붙였습니다. [기준 검사](raw/ledger/base/summary.json)와 [최종 검사](raw/ledger/final/summary.json)에 검사 명령과 요약을 두고 [기준 전체 출력](raw/ledger/base/logs.json.gz)·[최종 전체 출력](raw/ledger/final/logs.json.gz)을 함께 보존합니다.

## FCA·경로·버전

filid facts bootstrap은 기준3149·현재3157 파일 exact, missing/uncertain/tool-error0으로 완료했습니다. 전체 저장소의 scan·6범위 validate·verification을 같은 snapshot으로 실행했습니다. [원시 다중집합 비교](raw/fca-comparison.json)에서 새 finding0·diagnostic0·verification 위반0입니다. 구조 finding566·실패26, diagnostic306, verification 위반30은 기준과 같습니다. 기존 위반 때문에 절대 판정은 FAIL이고 의존 분석 축의 indeterminate도 유지합니다. 이를 FCA PASS로 바꾸지 않습니다. Scan complete: 566 findings.

모든 변경 파일의 기계 경로와 package.json 버전을 감사했으며 경로 hit0·버전 변경0입니다. architecture README의 처음74행은 기준과 바이트 동일합니다. [감사 결과](raw/path-and-version-audit.json)를 참조합니다.

## 남은 단계

코디네이터가 성능 하네스·사전등록·독립 확인 뒤 B/F 측정 창을 수행하고 SV-1·SV-2·heap·절대 divergence 읽기 시간을 채웁니다. 이번 기능 관문은 성능 PASS를 주장하지 않습니다. 최종 독립 검토·PR 게시·병합과 Vincent의 버전·릴리스 결정이 남습니다.
