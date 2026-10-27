# D2-P1 — 정적 전체 쓰기의 세대 표식

## 판정

채택합니다. 측정 전에 고정한 규칙에서 두 bulk 행 모두 폭 밖 개선이고, 코어 여덟 행과 구독 두 행 중 폭 밖 악화는 0건입니다. 최종 측정 제품 커밋은 `b6aba988f`입니다. 앞선 후보와 빌드 완료 전 중단한 실행은 최종 판정에서 제외했습니다.

가설은 markWrite의 노드별 dirty 경로 등록, registerRecalculation의 노드별 역의존·조상 확장, computeStableNode의 dirtyChildren 배열과 경로 소비를 없애 약 2.5ms를 줄인다는 것이었습니다. 닿는 원장은 GOAL-011·SETTLE-017·SETTLE-047·NODE-060·TEST-080입니다.

## 같은 창의 A/B/A′

A·A′는 통합 `726c34bed`와 소스 차이가 없는 `e713089687a3559c115d4360bb07b50e2690a493`의 기록된 배포물입니다. Node v26.12.1, Apple M1 Max, NODE_ENV=production, 행마다20예열·100표본·독립3프로세스를 사용했습니다. 실제 빌드 시작 UTC `2026-10-26T23:26:39Z`를 모든 --quiet-since에 고정했고, 최종 재빌드와 재측정도 같은 독점 창에서 순서대로 실행했습니다.

폭(다)은 max(|A−A′|, A의3회최솟값범위, A′의3회최솟값범위)입니다. B−A와 B−A′의 부호가 같고 절대값이 모두 폭을 넘어야 개선/악화로 판정합니다. 두 bulk 모두 개선이고 어떤 행도 악화가 없어야 채택합니다. 수치는 표준 장치가 보고하는 프로세스별 최소의 중앙값(ms)입니다.

| 행                          |         A |         B |        A′ |   폭(다) | 판정   | B / 0.16.1 |
| --------------------------- | --------: | --------: | --------: | -------: | ------ | ---------: |
| mount-oneOf-80              |  2.078875 |  2.092875 |  2.144792 | 0.159333 | 미확정 |     5.949× |
| mount-flat-1000             |  2.137250 |  2.131083 |  2.073583 | 0.063667 | 미확정 |     1.023× |
| mount-nested-d6-f4          | 15.644541 | 15.621250 | 15.883292 | 0.331000 | 미확정 |     2.356× |
| single-flat-1000            |  0.077750 |  0.065083 |  0.090000 | 0.044667 | 미확정 |     0.121× |
| single-nested-d6-f4         |  0.177208 |  0.182958 |  0.186792 | 0.023458 | 미확정 |     4.847× |
| switch-oneOf-80             |  0.300125 |  0.481875 |  0.472584 | 0.172459 | 미확정 |     6.211× |
| bulk-flat-2000              |  2.393625 |  1.772667 |  2.415625 | 0.107375 | 개선   |     0.955× |
| bulk-nested-d6-f4           |  6.567083 |  4.022000 |  6.747625 | 0.180542 | 개선   |     1.065× |
| wave-1000                   |  2.077542 |  1.678709 |  2.114708 | 0.037166 | 개선   |          — |
| single-flat-1000-subscribed |  0.088208 |  0.091292 |  0.085125 | 0.014708 | 미확정 |          — |

bulk-nested의 6.567083→4.022000ms는 −2.545083ms(−38.75%)이며, D4의5ms까지 여유0.978ms와 0.16.1대비1.065×를 얻습니다. bulk-flat은2.393625→1.772667ms(−25.94%)입니다. switch-oneOf-80은0.481875ms이며 이번 변경의 개선으로 주장하지 않습니다.

## 원본과 동일성

- 기준 Node SHA256: `4563286f5862703164f47729acc6a7e3d251af2365ca2d72b9632bb6dc4d1a99`.
- 최종 Node SHA256: `3cd015751444657797806cd582d1b5ccc6df78a2ce366cca463801c4eb3d3d4a`.
- 기준 ESM SHA256: `2e3d15ffa4e976c0fef5d2a4740192d51b005875a17e395bc67c0b8b43c8d40c`.
- 최종 ESM SHA256: `516aa5f98104328bb726fffac00d710de1720e2b76fca8885337a94f8c9298a4`.
- npm0.16.1 SHA256: `5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46`.
- 판정 원본: `/private/tmp/450-d2-p1/judgement.json` 및 `subscribed/results.json`.
- before: `/private/tmp/claude-501/perf-runs/20261026T2339-b6aba98-d2p1-final-before`.
- head: `/private/tmp/claude-501/perf-runs/20261026T2340-b6aba98-d2p1-final-head`.
- aprime: `/private/tmp/claude-501/perf-runs/20261026T2340-b6aba98-d2p1-final-aprime`.

## 작업량·후퇴·검증

수정 전 새 시험은 깊이2/4 전체 쓰기에서 dirty add41/681로 실패했습니다. 최종 자격 경로는 add0·consume0·dirtyChildren0이며, 반복 쓰기와 같은 값 잎을 유지합니다. 대상 밖 조상으로 연결하는 경계 경로만 기존 색인을 사용하며, 무관한 하위트리는 계산하지 않습니다. 실제 no-op 파생 하나로 자격을 막은 폼과 값·배달 순서·payload·revision이 같습니다. 게이트·파생·잠복·가상·배열 길이·부분·키/종류 변경·batch·visit·load·automatic·misfit 거절 사례를 확인했습니다.

S7은 verify 모드에서만 독립 DirtyPathSet을 쓴 입력 기록으로 채우고 실제 노드의 세대 표식과 조상 경로의 집합을 비교합니다. 표식 제거 변이 시험은 추가 전 두 건 실패하고 추가 뒤 두 건 통과했습니다. verify 전용 단일 파일은 S7 확인9회를 보고했습니다. 그림자 장부와 순회는 출하 table 모드에 할당되지 않습니다.

코디네이터 승인 정정은 다음과 같습니다.

- dirty consume 작업량 기록1건을 ≤5461로 상한화(400C-02). 같은5461노드 입력을 실제 무효 조건 Merge로 보내 기존 경로의 consume 정확값5461을 새 사례에 유지했습니다. 파생을 넣으면 기존 sameShape도 거절하여 consume 대신 일반 delete가 실행되므로 이 보증에는 Merge를 사용했습니다.
- dirty-postorder의 자격 경로 add0으로 작업량 부분을 정정하고 실제 파생 하나가 있는 새 사례에 add>0·beginPostOrder 선행 단언을 그대로 유지했습니다.
- 기존 snapshot 파일·단언은 그대로 두고 fixture가 실제 세대 표식에서 논리 dirty 경로를 관측합니다(447C-03, 400C-03). S6의 기존 expect는 유지하고 실제 Merge 입력으로 기존 dirtyChildren 검증 경로를 고정했습니다.

## 메모리와 남은 관문

선택 숫자 슬롯의 논리 비용은 도달 노드당8바이트·트리당8바이트이며 엔진별 객체 확장·정렬 비용이 추가될 수 있습니다. context의 숫자 한 칸도 호출 수명만 보유합니다. B2는 canonical node-and-settle 장치에서 Node GC 자식1개×7회, Bun 자식7개×1회를 같은 창 A/B로 재며, B 중앙값≤A 7표본 최댓값을 통과 기준으로 고정했습니다. B2·최종 관문 결과는 아래에 기록합니다.

| 관문                                       | 최종 결과                   |
| ------------------------------------------ | --------------------------- |
| build · typecheck · lint                   | exit0                       |
| unit                                       | 502파일·3,610통과·기존todo1 |
| render · react18                           | 각128파일·760통과           |
| storybook                                  | 100파일·251통과             |
| production                                 | 9파일·20통과                |
| test:verify (table verify·wheel shadow·S7) | 635파일·4,414통과·기존todo1 |
| 기존 전후 배달                             | 72장면·323단계·차이0        |
| 정적 첫 적재/일반 적재                     | 6장면·12단계·차이0          |
| dist/index.d.ts                            | byte diff0                  |

첫 unit 실행의 global-errors.timing 시간 상한 실패는 단일 파일2건 재실행과 최종 전체 unit 모두 수정 없이 통과했습니다. 최종 로그는 `/private/tmp/450-d2-p1/{build-final,test-unit,test-render,test-react18,test-storybook,test-production,test-verify,lint,typecheck-window}.log`, 배달 원본은 `differential.json`·`public-differential.json`, 선언 차분은 빈 `dts.diff`입니다.

## B2 노드당 잔존 힙

| runtime | A 중앙값 B/node |   A 최솟값–최댓값 | B 중앙값 B/node |   B 최솟값–최댓값 | 판정 |
| ------- | --------------: | ----------------: | --------------: | ----------------: | ---- |
| node    |        1441.835 | 1435.049–1899.887 |        1439.141 | 1431.523–1900.143 | 통과 |
| bun     |        2224.974 | 2224.009–2225.272 |        2222.497 | 2221.892–2222.673 | 통과 |

`bench/legacy-compare/node-and-settle.bench.ts --heap-child`의 canonical B2를 NODE_ENV=production으로 실행했습니다. Node는 `--expose-gc --import tsx` 자식 한 개의7회이고 Bun은 해당 장치가 만든 새 자식7개의 각1회입니다. 모든 원표본은 `/private/tmp/450-d2-p1/heap-{node,bun}-{before,head}.json`, 판정은 `heap-judgement.json`, source 해시는 `heap-{before,head}.sha256`에 있습니다. 기준 ESM과 최종 ESM의 복사본을 번갈아 사용하고 마지막에 최종 dist를 복원했습니다. B2는 적재 직후의 잔존 힙이며 전체 교체 이후 선택 숫자 슬롯의 단독 실제 바이트 측정은 아닙니다.

속도·메모리 비용: bulk-nested는−2.545083ms이고, 선택 숫자 슬롯은 논리8B/도달 노드와8B/트리(+객체 확장·정렬)입니다. canonical B2 중앙값은 Node1,441.835→1,439.141B/노드, Bun2,224.974→2,222.497B/노드로 둘 다 A의7표본 최댓값 이하입니다. 이 작은 B2 차이를 메모리 개선의 증거로 주장하지 않습니다.

FCA는 같은 snapshot `f04ea088097837ede80b0b0bc3695b452236bced174bccdc3aa326130f155ba1`에서 전체 scan·여섯 scope validate·verification을 실행했습니다. 프로젝트 전체는 indeterminate(범위 밖 실패14, 동적 case 표 등 불확정 포함)이며 전체 통과로 주장하지 않습니다. 변경 소유범위의 오류는0이고 기존 settle.gate-wheel-differential의 동적 표 계수 경고1건을 인계합니다. 새 시험 파일은 정확히12·6·2건으로 상한 이내이며, fixture2개는 구성의 `**/fixtures` 제외 범위입니다. 계약 문서3개는 코드 앞에 갱신했고 최종 B2 실측도 반영했습니다. 자동 enrich는 추가 범위 변경을 하지 않도록 생략했습니다.

독립 모델 검토는 PR을 연 뒤 코디네이터가 맡깁니다. React --equivalent는447C-04에 따라 D4 통합 창에서 한 번 실행합니다. 이번 PR은 지정한10행 외 장면의 속도 개선을 주장하지 않습니다.
