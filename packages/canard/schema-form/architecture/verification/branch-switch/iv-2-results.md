# Ⅳ-2 — 루트 호스트 전환 상수

기준 HEAD는 `fdfa0f3a70da6a3a3ada1bc6d66933b2902ba270`입니다. Phase A에는 제품 변경과 시간 창이 없습니다. Ⅳ-0의 저장된 `allocations.json`, `owners.json`, `floor.json` 및 `diagnostics.json.gz`를 투영하고, 기존 `diagnoseRows`를 두 표적 행에만 시계 없이 실행하여 파일 안의 생성 위치를 분해했습니다. 도구에 행 필터와 보조 `line:column` 라벨만 추가했으며 기존 파일별 합계와 배달 경계를 유지했습니다.

## Phase A — 귀속과 우선순위

단위는 **쓰기당**입니다. oneOf 행의 공개 왕복 두 쓰기와 다릅니다. 타이머 `net µs`는 모든 호출을 합친 self 보정값이므로 호출 수를 다시 곱하지 않습니다. 서로 다른 floor/details 타이머 집합의 수치를 합하지 않습니다. 생성 위치별 시간은 **unattributed**이며 표의 시간은 해당 함수의 전체 self입니다. 일반 객체·배열·Proxy·클로저 및 revision ledger 생성은 Map/Set 관측 범위 밖이므로 그 할당 수를 추정하지 않습니다.

시계 없는 12쓰기에서 oneOf-80 **29 Map + 68 Set**, siblings-0 **15 Map + 19 Set**을 재현했습니다. 파일별 중앙값도 Ⅳ-0과 모두 일치합니다. 새 site 라벨은 각각 57개·33개(일부 중앙값 0 포함)이며 하위 타이머 owner는 65개·35개입니다. [재현 입력](raw/iv-2/attribution-diagnostics.json), [소스와 계측 manifest](raw/iv-2/attribution-inputs.json), [전체 귀속 표](raw/iv-2/attribution.md)와 [수치 JSON](raw/iv-2/attribution.json)를 보존합니다.

| 순서 | 대상                                         | oneOf / siblings 호출 | Map+Set/쓰기(oneOf / siblings)                        | details net µs(oneOf / siblings)         | 분류와 계획                                                                                                                      |
| ---- | -------------------------------------------- | --------------------- | ----------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1    | selectChildren 선택 구조                     | 1 / 1                 | 1+0 / 1+0                                             | 37.240 / 19.516                          | reusable scratch; Map·배열·Set 재사용, 준비된 버킷 순서, Proxy 열거 spread 제거                                                  |
| 2    | computeNode 주변 부기                        | 5 / 4                 | 3+1 / 3+1                                             | 17.453 / 14.041                          | reusable scratch; 라운드·선택 wrapper/원본 증인은 유지하고 중복 준비만 제거                                                      |
| 3    | markCommitDeliveries                         | 1 / 1                 | 1+3 / 1+3                                             | 16.178 / 9.911                           | reusable scratch; 임시 후보·자동 노드·부모 색인 재사용, revision 의미 유지                                                       |
| 4    | registerRecalculation + owner 수집           | 1 / 1                 | 직접 2+2 / 0+2                                        | 15.824 / 7.259                           | reusable scratch; events·single-run 정렬/클로저 제거, 등록 순서 유지                                                             |
| 5    | registerPresenceChanges + affectedByPresence | 1 / 1                 | 직접 1+4 / 0+0; projection 0+0 / 2+1; 질의 0+36 / 0+0 | 14.324 / 1.516                           | reusable scratch; 6회 질의마다 Set 6개가 실제 최대 할당원. 원래 반환 집합 수명 확인 뒤 범위 안 재사용                            |
| 6    | commitSettlement / commitSlotChanges         | 1 / 1; slot 1 / 0     | slot 0+2 / 0+0                                        | 7.574+7.509 / 3.328+0                    | reusable scratch; 커밋 후보와 슬롯 집합 수명 유지, 중복 부기만 축소                                                              |
| 7    | retainExitedSlot + 조상 정책                 | 3 / 0                 | 기본 행에서 0 / 0                                     | retain 5.153 / 0; 조상 정책 unattributed | pure in (ancestor layers, selected ids) — cacheable per host; effective schema·직전 policy 값까지 정확한 키를 증명한 경우만 캐시 |
| 8    | finalizeExits + pending/retain loop          | 1+1+1 / 0             | 1+1 / 0+0                                             | 4.890+3.877+1.399 / 0                    | reusable scratch; pending 키의 JSON 제거와 보조 집합 재사용, 확정 나감 순서 유지                                                 |
| 9    | createExitSlotOverlay                        | 3 / 0                 | 관측된 Map/Set 0 / 0                                  | 3.368 / 0                                | reusable scratch; 값·정책 입력이 바뀌지 않은 경우만 지연 생성/불변 결과 재사용                                                   |
| 10   | captureDetachedFieldNodeReads                | 3 / 0                 | 관측 범위 밖                                          | 3.243 / 0                                | must stay; 이미 snapshot이 있는 노드는 재포착 0. 신규 나감의 포착은 B11 마지막 커밋 읽기의 입력                                  |
| 11   | getRetainedChildEntry / readSlotExitPolicy   | 3 / 0                 | 0 / 0                                                 | 0.718 / 0; policy 1.659 / 0              | 조회는 reusable scratch/identity 색인, policy snapshot은 must stay. 비활성 노드를 살려 두지 않음                                 |
| 12   | advanceFieldNodeRevision / payload           | unattributed          | 3+0 / 3+0                                             | 자체 타이머 unattributed                 | immutable ledger는 must stay; 정착 내 동일 전이의 Map 재사용을 검토. payload 생략은 기존 자격을 유지                             |

이 표는 함수 self와 생성 수에 따른 작업 순서입니다. 나감 관련 7–11은 하나의 계약으로 구현하며 1–6과의 커밋 순서는 코디네이터 재배열에 따릅니다. `getDependencyIndex`의 oneOf 38 Set 가운데 36개는 `affectedByPresence`의 6회×6개이고 2개는 `affectedForRegistration`입니다. 새 상주 폼 크기 비례 구조는 추가하지 않으며, 지연 준비가 필요하면 첫쓰기 일회 비용을 가중치 1의 추가항에 넣습니다.

선택에 membership Δ가 없을 때 `publishPreparedSelection`은 이미 이전 structure·children을 재사용합니다. 신규 버킷 캐시는 결과 노드가 아니라 순수 선언 ID·순서·스키마 선택만 보유해야 합니다. 슬롯은 재진입 입력이며 NODE-044에 따라 공개 노드 identity를 재사용하지 않습니다.

`captureDetachedFieldNodeReads`의 기존 조건은 `!detachedReads.has(node)`입니다. 이는 신규 나감에서 포착을 수행하는 조건입니다. detachedReads가 없다는 이유로 전체 포착을 생략하면 B11의 마지막 커밋 읽기를 잃으므로, 브리프의 “no detached reads → 0”은 의미 확인이 필요합니다. 제품 변경 전에 코디네이터에게 이 차이를 알립니다.

## 미채택 Ⅳ-1의 후속

후보 1 P3-2(국소 바퀴 뒤 조상 shape 재확인)와 후보 2 P3-1(예외 후퇴 뒤 H 안쪽 후보 소거)은 **closed-with-Ⅳ-1**입니다. 이 기준에는 국소 바퀴가 병합되지 않았으므로 해당 제품 코드는 이 PR로 옮기지 않습니다.

## 검증 상태

Phase A의 원시 대조와 IV-0 도구 검사가 통과했습니다. 새 worktree에 의존 workspace dist가 없어 최초 진단 적재가 실패했으며, 기존 지정 build로 준비한 뒤 Node v26.12.1에서 시계 없는 진단을 통과했습니다. Phase A에는 시간 표본·정식 마커를 생성하지 않았습니다. 최종 제품 관문과 두 창의 미채택 판정은 아래에 기록합니다.

## 항목 1 — 선택 준비물과 scratch

oneOf-80의 쓰기당 **29 Map+68 Set → 28 Map+67 Set**, siblings-0 **15 Map+19 Set → 14 Map+19 Set**입니다. 선택의 seen Map·inactive 배열·literal active Set을 정착 scratch의 동시 선택 깊이별 풀에서 빌리고 finally에서 비웁니다. 새 노드 참조는 남지 않습니다. 단일 root literal bucket의 선언·ID·effective schema 및 실제 이름 증인으로 확인한 공표 키 순서를 재사용합니다. membership Δ=0이면 이전 structure·children을 유지하는 기존 분기를 그대로 사용합니다. private Proxy는 gate의 own-property 관측에 필요하며 ownKeys의 값 객체 spread만 키 병합으로 교체했습니다.

[무계측 계수](raw/iv-2/item-1-diagnostics.json)의 상한 `28 67 14 19`는 Phase A 원시에서 `oneOf Map 29 > 28`로 먼저 실패한 뒤 새 소스 진단에서 통과했습니다. 새 공개 관측·컨테이너 참조 시험 두 건은 수정 전에 각각 서로 다른 Map/ID 참조로 실패하고 수정 뒤 통과했습니다. 준비 공표·oneOf 작업량·형제 준비를 포함해 준비·작업량 4파일 10건 및 추가 중첩/예외·정수/심볼 열거 시험을 확인하고, 표·선택 모드 14파일 92건과 package typecheck·lint를 통과했습니다. 최초 풀 프레임/버킷 생성의 비용은 아직 시간으로 측정하지 않았으며 첫쓰기 추가항에 포함할 예정입니다.

## 항목 2 — presence 질의의 여섯 Set

oneOf-80 **28 Map+67 Set → 28 Map+31 Set**이며 siblings-0은 **14 Map+19 Set** 그대로입니다. `affectedByPresence`는 명시적인 빌린 작업 인수를 받을 때만 결과 네 Set·내부 두 Set을 매 질의 전에 비워 재사용합니다. caller는 다음 질의 전에 기존 누적 집합으로 결과를 소비하며 기본 호출은 독립 결과를 유지합니다. 정착 종료에서 여섯 Set을 비웁니다. 최초 실제 presence 질의에만 트리당 여섯 Set을 만들고 크기 비례 캐시는 추가하지 않았습니다.

상한 `28 31 14 19`는 항목 1 원시의 Set 67로 먼저 실패한 뒤 [새 시계 없는 원시](raw/iv-2/item-2-diagnostics.json)에서 통과했습니다. 새 시험은 6개 질의의 결과 identity 재사용에서 먼저 실패하고, 수정 뒤 값·키 순서 및 기본 결과의 독립성을 유지했습니다. dependency·presence·선택 모드 28파일 211건, typecheck·lint가 통과했습니다.

## 항목 3 — 재계산 등록의 수집

oneOf-80 **28 Map+31 Set → 28 Map+27 Set**, siblings-0 **14 Map+19 Set → 14 Map+17 Set**입니다. owner/host 중복, 조상 확장 집합과 events 배열을 정착 scratch로 재사용합니다. plain 등록은 closure 대신 경로 자료로 남깁니다. 앞쪽 plain 기여 뒤 단일 split run이 오는 경우 생존 순번을 확인하여 plain→닻→호스트→멤버 순서를 직접 합치며 member closure와 events 정렬을 만들지 않습니다. 여러 run/끼어든 plain 기여는 기존 안정 정렬을 유지합니다.

계수 상한은 이전 원시에서 먼저 실패하고 [새 원시](raw/iv-2/item-3-diagnostics.json)에서 통과했습니다. 새 정렬 호출 0 시험도 수정 전에 실패했습니다. 진단 중 root의 plain 기여 하나가 host 기여와 별개로 앞에 있음을 확인하여 두 기여를 모두 보존했습니다. split 등록·dependency·scratch의 11파일 35건(300개 시드 이력 포함), typecheck·lint가 통과했습니다. 원시의 Map/Set 관측은 배열·closure 할당 수를 추정하지 않으며 정렬 0은 별도 직접 시험입니다.

## 항목 4 — 배달 후보 작업

oneOf-80 **28 Map+27 Set → 27 Map+24 Set**, siblings-0 **14 Map+17 Set → 13 Map+14 Set**입니다. automatic/candidate/departing 방문 Set, parent→진입 자식 Map과 departing 배열을 정착 예약에 두고 marker의 finally에서 비웁니다. 실제 pending payload·불변 revision 원장 및 기존 여섯 출처 순서는 바꾸지 않았습니다.

이전 원시의 상한 실패 후 [새 원시](raw/iv-2/item-4-diagnostics.json)가 `27 24 13 14`를 통과했습니다. 새 시험은 scratch 부재로 먼저 실패한 뒤 같은 빈 컨테이너·옛 revision 불변·현재 값·새 재진입 identity를 확인했습니다. 배달/watch/required·revision의 7파일 46건, typecheck·lint가 통과했습니다.

## 항목 5 — 계산 시각과 pending output

oneOf-80 **27 Map+24 Set → 25 Map+23 Set**, siblings-0 **13 Map+14 Set → 11 Map+13 Set**입니다. 게이트 계산이 처음 실제 실행될 때 presence compute/round Map 둘과 pending output Set 하나를 scratch에서 연결하고, 호출마다 새 clock 숫자를 씁니다. 종료에는 노드 참조를 비웁니다. gate wheel 입력·table round·confirm 증인은 그대로입니다.

이전 원시에서 실패한 `25 23 11 13` 상한은 [새 원시](raw/iv-2/item-5-diagnostics.json)에서 통과했습니다. 신규 빈 컨테이너 재사용 시험은 scratch 부재로 먼저 실패했습니다. presence·wheel·table 23파일 196건과 typecheck·lint의 종료 0을 확인했습니다.

## 항목 6 — 나감 경로

oneOf-80 **25 Map+23 Set → 23 Map+21 Set**, siblings-0은 **11 Map+13 Set** 그대로입니다. 보류 나감은 기존 path와 kind/union token으로 직접 조회하는 중첩 색인으로 바꾸었고 JSON 키는 진단 열거 때만 만듭니다. 저장한 이전 path로 소멸·재키의 대기 개수를 관리합니다. 빈 내부 Map 풀은 최대 16개이며 나머지 경로·값·kind는 정착 종료에서 비웁니다. Map의 기존 JSON 키 순서·다른 kind 분리와 fixture 관측은 유지했습니다.

나감의 조상 Set을 재사용하고, misfit/resize/소멸이 없는 경우 빈 보조 컨테이너를 만들지 않습니다. 조상 정책은 최종 선택·스키마·직전 policy 값이 고정된 **하나의 retain phase**에서 host별로 공유하고 finally에서 버립니다. 서로 다른 commit에 걸친 캐시는 키를 정확하게 증명하지 못해 추가하지 않았습니다. 객체 retained entry는 기존 불변 template 색인으로 먼저 조회합니다. kept terminal은 patch 없는 두 불변 결과를 공유하여 결과 객체·빈 방문 배열을 만들지 않으며 clear/array/기존 patch는 원래 재귀를 유지합니다.

신규 나감의 detached 포착은 유지했습니다. 이미 포착된 세 노드의 재포착은 0이라는 기존 조건을 직접 시험으로 고정했습니다. 이 조건을 “snapshot이 없으면 포착을 생략”으로 바꾸지 않았습니다.

할당 상한 `23 21 11 13`은 앞 원시에서 먼저 실패한 뒤 [새 원시](raw/iv-2/item-6-diagnostics.json)에서 통과했습니다. 실제 oneOf 나감의 selection JSON 키 0과 kept 결과 공유 시험도 먼저 실패했습니다. pending·부활·소멸·union 6파일 32건, slot/나감/비활성 22파일 130건, B12/kept leaf 7파일 40건 및 새 identity-map/재포착/entry 조회 3파일 7건을 확인했습니다. 최종 typecheck·lint 종료 0입니다.

## 항목 7 — 슬롯과 전역 커밋 작업

oneOf-80 **23 Map+21 Set → 22 Map+18 Set**, siblings-0 **11 Map+13 Set → 10 Map+12 Set**입니다. 슬롯 커밋의 ancestor 방문·binding Set 둘은 실제 slot-dirty 커밋에서만 빌립니다. 전역 상태 delta Map·departing Set·탐색 배열도 재사용하되 loadNodes 집합은 로드의 독립 수명을 유지했습니다. 각 소유자의 finally에서 참조를 비우며 실제 원장·payload·비활성 메모는 풀링하지 않았습니다.

상한 `22 18 10 12`가 이전 원시에서 실패하고 [새 원시](raw/iv-2/item-7-diagnostics.json)에서 통과했습니다. 신규 빈 작업 재사용 시험은 작업 부재로 먼저 실패했으며 슬롯·전역 상태·비활성·배달 19파일 93건, typecheck·lint 종료 0입니다.

## 항목 8 — 불변 revision 전이의 작은 메모

oneOf-80 **22 Map+18 Set → 19 Map+18 Set**, siblings-0 **10 Map+12 Set → 7 Map+12 Set**입니다. 기존 bit-only 자격·동일 previous+mask 전이·불변 ledger constructor와 payload 의미는 유지했습니다. 이전 원장별 네 mask까지 작은 연결 레코드로 조회하고 다섯째부터 Map으로 한 번 승격합니다. 조회는 승격 전 최대 네 비교, 승격 뒤 O(1)이며 메모는 기존 commit/load finally에서 해제됩니다. 새 상주 폼 크기 비례 구조나 ledger의 지연 생성·가변화를 추가하지 않았습니다.

이전 원시에서 실패한 `19 18 7 12` 상한은 [새 원시](raw/iv-2/item-8-diagnostics.json)에서 통과했습니다. 작은 mask의 Map 생성 0 시험은 먼저 실패했고 승격·옛 snapshot·동일 전이·관측 경로·예외 수명 6파일 18건과 typecheck·lint 종료 0을 확인했습니다.

## 구현 누적과 다음 후보

시계 없는 계수의 누적은 oneOf-80 **29 Map+68 Set → 19 Map+18 Set**(총 97→37), siblings-0 **15 Map+19 Set → 7 Map+12 Set**(총 34→19)입니다. 이 수치는 시간 개선 판정이 아니며 아래 승인된 창으로 판정합니다. 조립 메모는 이번 1–8 항목의 창 뒤 표적 행이 폭 안일 때 검토할 다음 후보로 남깁니다. 계수 구현을 마친 시점에는 별도 시간 창을 열지 않았습니다.

## 최종 정적 관문 — 후보 1

제품 커밋 `f81d1038c` 뒤 장치 커밋 `c70c4adfb`까지 제품·artifact-check 입력의 diff가 0입니다. Node v26.12.1에서 지정 build와 typecheck·lint를 통과했습니다. 이전 Ⅳ-1의 OOM 증거에 따라 처음부터 8 GiB·maxWorkers 4로 다섯 프로젝트와 verify를 아래 순서로 한 번씩 실행했습니다.

| 프로젝트    | 통과 파일 | 통과 사례 | todo | 소요 초 |
| ----------- | --------: | --------: | ---: | ------: |
| unit        |       610 |      3990 |    1 |   98.71 |
| render      |       132 |       768 |    0 |   62.20 |
| storybook   |       100 |       251 |    0 |   34.92 |
| react18     |       132 |       768 |    0 |   61.57 |
| production  |        10 |        21 |    0 |    3.09 |
| test:verify |       747 |      4802 |    1 |  166.73 |

공개 `index.d.ts`는 기준과 **바이트 차이 0**이며 SHA-256은 `ed3bfe4d2c42fab94543b2afeca4f4d904e987ae7e865385116218b3d4614b3d`입니다. 레거시 격리 2394파일과 첫 실제 쓰기 파서 4건을 통과했습니다. 전체 배달 **79장면·429단계와 B12 7장면·21단계 차이 0**이며, 독립 diagnoseDelivery도 차이 0입니다. 계측 입력 731개 소스 해시를 최종 제품과 전부 대조한 뒤 기존 항목 8의 진단 번들을 재사용했습니다. [정적 로그와 제품 해시](raw/iv-2/static/artifacts.json)에 빌드·시험·배달의 압축 원시를 함께 보존했습니다.

기준 아카이브의 첫 build는 패키지별 의존성 연결 누락으로 AJV 6을 찾았고, 외부 배달 폴더의 첫 적재는 workspace 모듈 연결 누락으로 실패했습니다. 최초 로그를 보존하고 기존 설치 의존성만 연결한 뒤 같은 지정 명령의 종료 0을 확인했습니다. 설치나 제품 수정, 시간 표본 재실행은 없었습니다. dist는 기존부터 비추적 산출물이므로 소스 커밋에 추가하지 않았습니다.

FCA facts **1682/1682 exact**, full validation **202건(오류 1·경고 200·정보 1)**으로 기준 202건을 넘지 않습니다. 기존 FieldProxy↔FieldInputSlot cycle과 문서 findings로 전체 판정 **FAIL**, 분석 **indeterminate**를 유지합니다. 상한 관문 통과를 FCA 전체 통과로 표현하지 않습니다. 세 검사 모두 같은 snapshot을 썼으며 [FCA 원시](raw/iv-2/fca/summary.json)를 보존했습니다.

장치 `tools/iv-2`의 lint·checkJs·format과 cold 원시 검증 3건도 통과했습니다. IV-1의 judgment 함수 세 개는 바꾸지 않았습니다. 코디네이터 답 `msg_0799e247ae05`에 따라 세 mount 형상은 표본마다 A/B 새 폼·새 blueprint를 시계 밖에서 구성하고, cold 첫 실제 쓰기를 **예열 0·100표본**으로 측정합니다. 각 형상의 `max(0, B_cold 중앙값−A_cold 중앙값)`만 가중치 1로 B에 더하며 조정 교환비가 엄격히 음수여야 채택합니다. 원시 표본·중앙값·새 폼 생성 수를 요약 때 다시 대조합니다.

첫 입력 prepare는 기존 supplemental 계측기가 새 lazy misfit guard를 인식하지 못해 시간 표본 없이 중단했습니다. 실패 폴더와 로그를 보존했습니다. 기존 계측기의 정확 일치 허용 목록에 새 guard를 추가하되 이전 guard·본문 owner·wrapped 레인은 유지했습니다. 장치 시험이 수정 전 `0 !== 1`로 실패한 뒤 4건 모두 통과했고 기존 B9-0 checkTools도 통과했습니다. 제품 바이트와 앞 정적 관문은 바뀌지 않았습니다.

입력 고정 후보는 `67405376f`입니다. 첫 untimed smoke는 AJV8 plugin dist 부재로 적재에서 중단했으며, 코디네이터 답 `msg_b2a439d10b6d`의 승인 후 설치·lockfile 수정 없이 기존 plugin 지정 build를 실행했습니다. 이 build 전후 schema-form 제품 번들 셋과 고정 입력 해시는 동일했습니다. 이어서 untimed smoke(공개 A44/B44/레거시36, stage 9종, nested 추가 9종, retention 120쓰기)와 실제 CLI 1행·1프로세스·예열1/표본1 예행을 통과했습니다. exit details 1/1 및 cold 첫 쓰기 0/1의 실제 CLI 예행도 통과했고 formal marker는 없습니다.

## 창 1 — 후보 1, 검토 뒤 수정으로 대체됨

A `fdfa0f3a7`, B `67405376f`를 승인 `msg_e9ba22e94cc6` 아래 한 창에서 측정했습니다. 2026-10-29 10:22:02–10:56:33 UTC, Node 26.12.1·Bun 1.4.4입니다. pilot은 current 1.285052, legacy 1.110817이며 공개 창 quality는 1.001766으로 통과했습니다. 22행×레인당10프로세스·20/100·legacy, 장부30·supplemental30·exit6, cold A/B각100·warm0, Node/Bun heap과 retention4를 재시도 없이 완료했습니다. 입력 해시와 dist 복원도 확인했습니다. [후보 1 원시](raw/iv-2/candidate-1/judgment.json)를 보존합니다.

**미채택입니다.** 표적 두 행은 모두 폭 안으로 개선 없음이며 항목 1–8의 누적 시간 개선을 증명하지 못했습니다. 구독 쓰기 보호 행 1개가 폭 밖으로 퇴보했고 Bun heap도 실패했습니다. 이 후보를 병합하지 않으며 코디네이터 지시 `msg_982c136b30ef`에 따라 검토 수정을 적용한 후보 2로 대체합니다.

| 행                          |      A µs |     A′ µs |      B µs |   폭 µs | 판정  | 가중 기여 µs |
| --------------------------- | --------: | --------: | --------: | ------: | ----- | -----------: |
| single-flat-1000            |    57.000 |    56.250 |    60.209 |   4.500 | 폭 안 |        0.000 |
| mount-oneOf-80              |  2368.500 |  2253.750 |  2270.167 | 186.250 | 폭 안 |        0.000 |
| mount-flat-1000             |  2139.917 |  2137.792 |  2154.521 |  42.709 | 폭 안 |        0.000 |
| mount-nested-d6-f4          | 16375.000 | 16280.125 | 16429.084 | 662.292 | 폭 안 |        0.000 |
| single-nested-d6-f4         |   113.291 |   113.667 |   114.771 |   7.208 | 폭 안 |        0.000 |
| switch-oneOf-80             |   162.375 |   160.958 |   162.187 |  16.709 | 폭 안 |        0.000 |
| bulk-flat-2000              |  1789.042 |  1773.416 |  1792.209 | 146.251 | 폭 안 |        0.000 |
| bulk-nested-d6-f4           |  3993.167 |  3979.166 |  4103.854 | 115.167 | 폭 안 |        0.000 |
| switch-discriminator-80     |   147.708 |   151.083 |   148.958 |  11.084 | 폭 안 |        0.000 |
| switch-if-80                |   274.125 |   272.000 |   282.458 |  10.208 | 폭 안 |        0.000 |
| switch-nested-oneOf-20      |   281.917 |   292.875 |   308.187 |  41.041 | 폭 안 |        0.000 |
| switch-siblings-0           |    58.041 |    59.666 |    60.250 |   6.125 | 폭 안 |        0.000 |
| switch-siblings-100         |    77.083 |    76.000 |    81.855 |   9.709 | 폭 안 |        0.000 |
| switch-siblings-1000        |   315.458 |   314.667 |   317.667 |  22.083 | 폭 안 |        0.000 |
| switch-siblings-4000        |  2667.792 |  2666.958 |  2661.938 | 166.083 | 폭 안 |        0.000 |
| leaf-gate-250               |    22.250 |    23.208 |    24.708 |   2.543 | 폭 안 |        0.000 |
| leaf-gate-1000              |    21.875 |    22.500 |    24.187 |   2.542 | 폭 안 |        0.000 |
| leaf-gate-4000              |   737.875 |   734.750 |   734.229 |  33.709 | 폭 안 |        0.000 |
| leaf-gate-8000              |  1564.708 |  1568.125 |  1565.292 |  27.959 | 폭 안 |        0.000 |
| wave-1000                   |  1670.625 |  1675.875 |  1672.396 |  45.707 | 폭 안 |        0.000 |
| single-flat-1000-subscribed |    65.875 |    66.000 |    71.458 |   5.208 | 퇴보  |     2791.500 |
| switch-payload-12           |   351.834 |   363.917 |   363.062 |  14.792 | 폭 안 |        0.000 |

| cold 첫 쓰기 형상  |    A µs |    B µs | 양의 차이 추가 µs |
| ------------------ | ------: | ------: | ----------------: |
| mount-oneOf-80     | 597.062 | 618.521 |            21.459 |
| mount-flat-1000    |  90.417 | 101.355 |            10.938 |
| mount-nested-d6-f4 | 254.188 | 164.999 |             0.000 |

원교환 **+2791.500 µs**, 첫쓰기 추가 **+32.397 µs**, 조정 교환 **+2823.897 µs (+0.620829%)**로 엄격한 음수 관문을 실패했습니다. 보호 행 single-flat-1000-subscribed의 기여 +2791.500 µs가 전부이며, 폭 안 차이는 0으로 정규화했습니다. TEST-073 전체 주 비교 퇴보는 0건입니다.

| 표적 장부         | owner                 | A self µs | B self µs | 통과   |
| ----------------- | --------------------- | --------: | --------: | ------ |
| switch-oneOf-80   | computeNode           |    41.229 |    36.957 | 예     |
| switch-oneOf-80   | selectChildren        |    35.521 |    36.624 | 아니오 |
| switch-oneOf-80   | markCommitDeliveries  |    16.583 |    17.083 | 아니오 |
| switch-oneOf-80   | registerRecalculation |    15.646 |    15.437 | 예     |
| switch-oneOf-80   | commitSettlement      |    10.937 |    10.897 | 예     |
| switch-siblings-0 | computeNode           |    17.313 |    16.937 | 예     |
| switch-siblings-0 | selectChildren        |    19.041 |    19.668 | 아니오 |
| switch-siblings-0 | markCommitDeliveries  |    10.042 |    10.896 | 아니오 |
| switch-siblings-0 | registerRecalculation |     7.709 |     7.958 | 아니오 |
| switch-siblings-0 | commitSettlement      |     3.458 |     3.479 | 아니오 |

| oneOf-80 exit owner           | A self µs | B self µs | 호출 A/B | 통과   |
| ----------------------------- | --------: | --------: | -------: | ------ |
| finalizeExits                 |     5.229 |     5.460 |      1/1 | 아니오 |
| finalizePendingExitLoop       |     4.375 |     4.293 |      1/1 | 예     |
| captureDetachedFieldNodeReads |     5.084 |     5.313 |      3/3 | 아니오 |
| visitFieldNodes               |     4.374 |     4.417 |      3/3 | 아니오 |
| retainExitedSlot              |     7.167 |     6.981 |      3/3 | 예     |
| createExitSlotOverlay         |     5.375 |     4.959 |      3/3 | 예     |
| readSlotExitPolicy            |     3.771 |     3.833 |      3/3 | 아니오 |
| finalizeRetainLoop            |     2.000 |     2.084 |      1/1 | 아니오 |

보호 장부는 nested·siblings-1000 통과, payload-12는 294.730→303.021 µs로 A 폭 7.480 µs를 넘어 실패했습니다. Node heap B 중앙값 1439.886≤A 최대1896.899 bytes/node는 통과했고, Bun은 2254.241>A 최대2248.573으로 실패했습니다. 종료 CPU 상위10(%)은 mds_stores6.40, Stats5.44, WindowServer5.12, 2.1.312 3.84, node2.24, ControlCenter1.92, bluetoothd0.96, codex0.96, mdworker_shared0.64, configd0.64입니다.

기록 전용 0.16.1 기준 Ⅳ-0 L 중앙값과 비교하면 oneOf-80 B162.1875/44.229=3.667배, siblings-0 B60.250/16.042=3.756배입니다. 다른 창 사이의 기록 비교이며 채택 판정에는 쓰지 않습니다.

## 후보 2 검토 수정 — P2-1

준비 호스트의 keyOrders를 최근에 넣은 네 버킷의 배열로 제한했습니다. 조회는 최대 네 identity 비교이며 새 저장은 같은 버킷을 제거하거나 가장 오래된 항목을 버린 뒤 추가합니다. DETAIL에 호스트 폭에 비례하는 상주 공간 상한을 먼저 명시했습니다. 여섯 버킷 방문·퇴출 버킷 재방문의 키 순서와 캐시 크기 시험이 수정 전에 실패하고 수정 뒤 통과했습니다. 해당 5건과 childSelection·공표 4파일 31건, typecheck·lint 종료 0입니다. [새 무계측 원시](raw/iv-2/review-p2-1-diagnostics.json)의 예산은 oneOf-80 19 Map+18 Set, siblings-0 7 Map+12 Set 그대로입니다. 시간·전체 힙 판정은 후보 2의 별도 창까지 미확정입니다.

## 후보 2 검토 수정 — P3-1

새 재사용 경로 43곳의 native Map·Set clear와 배열 초기화에 size/length 검사를 넣었습니다. PendingExitMap의 native 저장소도 같은 조건으로 비우되 nonce 초기화와 메타데이터 수명은 유지합니다. 빈 컨테이너의 reset 호출을 생략하는 변경이며 컨테이너 수·참조 해제·중첩 쓰기 분리는 그대로입니다. scratch 7파일을 포함한 등록·identity-map 9파일 20건과 typecheck·lint가 종료 0입니다. [새 무계측 예산](raw/iv-2/review-p3-1-diagnostics.json) 19/18·7/12를 재확인했습니다. 이 계수는 clear 내부의 런타임 할당을 세는 수가 아니며 시간·힙 이득은 다음 창에서 판정합니다.

## 후보 2 검토 수정 — P3-2

baseline의 정수형 키 유무를 준비할 때 한 번 계산해 호스트의 boolean으로 남깁니다. dynamic 중복 검사를 baseline own-property 조회로 바꾸고 양쪽에 정수형 키가 없으면 sort를 생략했습니다. 정수형 키의 수치 순서와 문자열·심볼 순서는 유지합니다. 새 비정수 키 시험은 선형 includes 2회로 먼저 실패한 뒤 includes·sort 모두 0회로 통과했습니다. 기존 정수·심볼 순서와 childSelection·공표를 포함한 5파일 37건, typecheck·lint 종료 0입니다. 상주 비용은 호스트 boolean 하나이며 넓은 호스트의 시간 판정은 다음 창에 남깁니다.

## 후보 2 검토 수정 — P3-3·P3-4·P3-5

P3-3은 `1b8cfa23c`에서 ownKeys가 열거 불가 dynamic 키도 보고하며 엔진이 그런 키를 만들지 않는다는 가정을 명시했습니다. P3-4는 `f36703036`에서 퇴장 후보를 PendingExitMap의 path/kind·union-token으로 직접 조회한다는 현재 계약으로 고쳤습니다. 두 문장은 수정 전 부재·수정 후 존재를 대조한 문서 수정이며 제품 바이트는 바꾸지 않았습니다.

P3-5는 root effective schema와 isAtomic predicate identity를 함께 저장·비교하고 공유 선언 배열과 반환형을 readonly로 바꾸었습니다. 실제 oneOf-80의 준비된 캐시에 다른 predicate와 schema를 둔 시험이 기존 선택 함수에서 잘못된 schema 재사용으로 실패한 뒤 새 비교에서 원래 유효 schema를 유지했습니다. 선택·atomic hints·순서·모드 11파일 77건과 typecheck·lint 종료 0입니다. 버킷마다 predicate 참조 하나와 조회 identity 비교 하나가 더해지며 값·노드는 보유하지 않습니다.

## 최종 정적 관문 — 후보 2

최종 제품 `81e4b05a2`를 지정 build로 다시 만들었고 build/typecheck·lint가 종료 0입니다. 아래 다섯 프로젝트와 verify는 8 GiB·maxWorkers 4에서 이전 프로젝트가 종료 0일 때만 다음을 시작하는 순차 driver로 완료했습니다.

| 프로젝트    | 통과 파일 | 통과 사례 | todo | 소요 초 |
| ----------- | --------: | --------: | ---: | ------: |
| unit        |       610 |      3993 |    1 |   96.00 |
| render      |       132 |       768 |    0 |   59.76 |
| storybook   |       100 |       251 |    0 |   35.02 |
| react18     |       132 |       768 |    0 |   57.82 |
| production  |        10 |        21 |    0 |    2.91 |
| test:verify |       747 |      4805 |    1 |  160.38 |

앞선 시도에서 unit 종료를 확인하기 전에 render를 시작한 실행 실수가 있었습니다. 겹친 render 트리를 SIGINT로 중단(130)하고 양쪽 로그를 보존했으며, 그 unit 통과도 최종 세트로 세지 않고 unit부터 전체 순차 세트를 다시 실행했습니다. 위 표와 [후보 2 정적 증거](raw/iv-2/candidate-2-static/artifacts.json)는 다시 실행한 완료 세트입니다. 외부 순차 driver도 기계 경로를 지운 압축 원시로 보존했습니다.

공개 선언은 기준과 바이트 차이 0, 기존 SHA `ed3bfe4d…`입니다. 격리 2395파일, 첫 실제 쓰기 파서 4건, 배달 79장면·429단계+B12 7장면·21단계 차이 0 및 diagnoseDelivery 차이 0을 다시 확인했습니다. 최종 제품 소스의 진단 입력은 732개이며 새 diagnoseRows 상한 19/18·7/12가 통과했습니다. 제품 바이트가 바뀌었으므로 후보 1의 제품 증거를 재사용하지 않았습니다.

FCA는 같은 새 snapshot에서 facts 1683/1683 exact, full validation 202건(오류 1·경고 200·정보 1)입니다. 경로를 정규화한 findings의 rule·path·message가 후보 1과 전부 같으며 기존 FAIL·indeterminate를 유지합니다. [후보 2 FCA 원시](raw/iv-2/candidate-2-fca/summary.json)에 세 검사의 결과와 진단을 보존했습니다.

승인 `msg_62de4b2d1f33`의 추가 heap-only 탐침은 정적 필드 정확히 1,000개(common·kind·passive998)와 oneOf80인 새 폼을 사용합니다. 0/79 두 값의 80회 교대와 80값 각각 선택을 Node/Bun·A/B별 새 폼 7개로 비교하고 매 선택 뒤 전체 활성 읽기를 수행합니다. 생성 함수가 돌아온 뒤 폼을 살려 GC 전후 카운터를 읽어 생성 지역 변수가 다음 표본을 보유하지 않게 합니다. 각 행 B 중앙값≤A 최댓값 및 A/B의 80버킷−2버킷 증분을 기록하며 시간·가중 교환 기여는 0입니다. 장치 lint·checkJs와 원시 위조·누락·재사용 거절을 포함한 7건이 통과했습니다. 이후 실제 적재 smoke·예행과 pilot은 통과했으나 공식 창은 아래의 환경 거절로 이 heap 단계에 도달하지 못했습니다.

## 창 2 — 후보 2, 환경 거절·미완료·미채택

A `fdfa0f3a7`, B `527c43211`을 승인 `msg_1a880d6f6dcf` 아래 새 고정 루트에서 한 번 실행했습니다. pilot은 current 1.275971·legacy 1.173746이며 실제 CLI 예행과 heap-only 8조합 무계측 smoke를 먼저 통과했습니다. 공개 22행·440프로세스와 정착 장부 30프로세스, supplemental 24프로세스를 완료했습니다.

창은 2026-10-29 11:39:14–12:14:29 UTC에 실행됐으며 `supplemental-switch-siblings-1000-B-0`가 표본 시작 전 외부 CPU 부하로 거절되어 runner 종료 1로 끝났습니다. ordinary 120초·Spotlight 600초 규칙을 바꾸지 않았고 자동 재시도도 하지 않았습니다. 실패 CPU 원시·stderr·명령·runner 로그와 완료 표본은 [창 2 부분 원시](raw/iv-2/candidate-2-window2/partial-judgment.json)에 보존했습니다. `window-end.invalid=false`는 공개 quality flag일 뿐이며 장치 완료를 뜻하지 않습니다.

종료 CPU 상위10(%)은 mds48.53, mediaanalysisd46.61, WindowServer29.05, Cursor Helper12.45, Cursor9.58, launchd9.58, Stats6.70, Magnet6.39, loginwindow6.39, mds_stores6.07입니다. mds와 함께 ordinary 프로세스 mediaanalysisd가 한도를 넘겼으므로 ordinary 대기 한도로 거절됐습니다. dist 복원과 고정 입력 검사는 finally에서 완료했습니다.

완료 공개 행의 quality는 1.000053이며 전부 폭 안입니다. 표적 두 행은 **개선 없음**입니다.

| 행                          |      A µs |     A′ µs |      B µs |   폭 µs | 판정  | 가중 기여 µs |
| --------------------------- | --------: | --------: | --------: | ------: | ----- | -----------: |
| single-flat-1000            |    56.875 |    55.750 |    57.333 |   3.292 | 폭 안 |        0.000 |
| mount-oneOf-80              |  2289.917 |  2345.791 |  2285.771 | 225.334 | 폭 안 |        0.000 |
| mount-flat-1000             |  2140.083 |  2148.250 |  2139.187 | 121.708 | 폭 안 |        0.000 |
| mount-nested-d6-f4          | 16281.542 | 16422.792 | 16294.979 | 806.250 | 폭 안 |        0.000 |
| single-nested-d6-f4         |   110.708 |   111.583 |   111.791 |   7.959 | 폭 안 |        0.000 |
| switch-oneOf-80             |   161.792 |   159.792 |   158.834 |  18.416 | 폭 안 |        0.000 |
| bulk-flat-2000              |  1755.375 |  1770.000 |  1827.250 | 149.084 | 폭 안 |        0.000 |
| bulk-nested-d6-f4           |  4041.417 |  4063.667 |  4131.188 | 148.708 | 폭 안 |        0.000 |
| switch-discriminator-80     |   142.542 |   148.458 |   147.730 |  10.834 | 폭 안 |        0.000 |
| switch-if-80                |   273.666 |   265.167 |   274.854 |   8.499 | 폭 안 |        0.000 |
| switch-nested-oneOf-20      |   291.375 |   291.292 |   311.625 |  23.792 | 폭 안 |        0.000 |
| switch-siblings-0           |    55.666 |    59.625 |    57.334 |   5.417 | 폭 안 |        0.000 |
| switch-siblings-100         |    82.125 |    79.917 |    81.520 |  12.375 | 폭 안 |        0.000 |
| switch-siblings-1000        |   319.125 |   322.500 |   319.250 |  15.000 | 폭 안 |        0.000 |
| switch-siblings-4000        |  2615.000 |  2631.458 |  2638.042 |  84.916 | 폭 안 |        0.000 |
| leaf-gate-250               |    23.667 |    22.417 |    24.437 |   3.000 | 폭 안 |        0.000 |
| leaf-gate-1000              |    22.042 |    23.125 |    22.458 |   3.834 | 폭 안 |        0.000 |
| leaf-gate-4000              |   736.209 |   733.250 |   738.521 |  21.251 | 폭 안 |        0.000 |
| leaf-gate-8000              |  1555.875 |  1548.334 |  1554.813 |  29.792 | 폭 안 |        0.000 |
| wave-1000                   |  1669.791 |  1688.250 |  1672.125 | 109.001 | 폭 안 |        0.000 |
| single-flat-1000-subscribed |    66.417 |    65.250 |    66.750 |   2.750 | 폭 안 |        0.000 |
| switch-payload-12           |   362.917 |   346.959 |   355.708 |  23.375 | 폭 안 |        0.000 |

공개 가중 교환비는 **0 µs (0%)**, 보호 행의 폭 밖 퇴보는 0건입니다. cold 추가항·조정 교환비·exit details·기존 Node/Bun heap·wide-root 2/80버킷 heap·retention은 **미측정**이며 null로 남깁니다. 0으로 보거나 통과로 세지 않습니다. 그러나 cold 추가항은 정의상 비음수이므로 공개 합 0을 엄격한 음수로 만들 수 없고, 표적 개선 관문도 이미 실패했습니다. 코디네이터 답 `msg_438f82fea6e9`에 따라 추가 측정·재개 없이 미채택으로 확정하고 기록 전용 PR로 닫습니다.

| 표적 장부         | owner                 | A self µs | B self µs | 통과   |
| ----------------- | --------------------- | --------: | --------: | ------ |
| switch-oneOf-80   | computeNode           |    39.834 |    36.854 | 예     |
| switch-oneOf-80   | selectChildren        |    34.314 |    37.480 | 아니오 |
| switch-oneOf-80   | markCommitDeliveries  |    16.396 |    18.042 | 아니오 |
| switch-oneOf-80   | registerRecalculation |    15.312 |    15.042 | 예     |
| switch-oneOf-80   | commitSettlement      |    10.708 |    11.187 | 아니오 |
| switch-siblings-0 | computeNode           |    17.293 |    17.646 | 아니오 |
| switch-siblings-0 | selectChildren        |    19.001 |    19.979 | 아니오 |
| switch-siblings-0 | markCommitDeliveries  |    10.083 |    11.042 | 아니오 |
| switch-siblings-0 | registerRecalculation |     7.833 |     7.938 | 아니오 |
| switch-siblings-0 | commitSettlement      |     3.458 |     3.479 | 아니오 |

기록 전용 0.16.1 기준과 비교하면 oneOf-80 158.834/44.229=3.591배, siblings-0 57.334/16.042=3.574배입니다. 서로 다른 창 사이의 기록 비교이며 채택 계산에는 쓰지 않습니다.

## 최종 결론과 보존 범위

**컨테이너 할당은 전환 비용의 주인이 아니다.** oneOf-80의 new Map/Set 생성은 97→37, siblings-0은 34→19로 줄었지만 두 후보 모두 표적 행의 폭 밖 개선을 증명하지 못했습니다. 이 계수는 런타임 clear 내부의 표 할당이나 배열·closure 전체를 세지 않습니다. 개별 owner의 작은 감소를 전체 전환 개선으로 합산하지 않으며 제품 후보는 병합하지 않습니다. 조립 메모와 나가는 노드당 남은 비용은 후속 후보로 남기고 이 작업에서 추가 구현·창을 열지 않습니다.

[후보 1 검토](reviews/pr-iv-2-candidate-1-claude.md)는 조건부 PASS(P1 0·P2 1·P3 5), [후보 2 검토](reviews/pr-iv-2-candidate-2-claude.md)는 PASS with P3(P1 0·P2 0·P3 1)였습니다. 후보 1의 여섯 제품 지적은 별도 커밋으로 고쳤고, 마지막 P3-A의 경로·와일드카드 표기는 원본에 백틱만 더한 뒤 서식 도구 재실행과 원본 대조를 통과했습니다(백틱 외 차이 0, 손상 토큰 0). 마지막 수정은 문서뿐이므로 제품·측정 바이트는 바뀌지 않았습니다.

제품 소스와 실제 측정 장치는 보존용 `perf/schema-form-iv-2-switch-constants` 브랜치에 남깁니다. 기록 전용 `perf/schema-form-iv-2-record`는 기준 머리의 제품을 유지하고 이 결과·원시·검토·IV-2 장치만 옮깁니다. 측정 재현에 필요한 제품 후보는 각 입력 manifest의 candidateCommit과 보존용 브랜치를 사용하며, 기록 브랜치의 제품을 후보 B로 간주하지 않습니다.

## 기록 전용 브랜치 검증

기준은 `fdfa0f3a70da6a3a3ada1bc6d66933b2902ba270`, 제품 보존 머리는 `5aee0fa24b45199d8b2c231d74fffbac3c90e3ab`입니다. 결과 1·원시 144·검토 2·IV-2 장치 24와 승인 `msg_2e0651826f98`의 공유 helper 예외 1로 총 172파일을 옮겼습니다. 공유 helper는 dynamic import에 URL의 `.href`를 넘기는 한 줄만 바꾸며 검사 약화는 없습니다. `src`·`dist`·모든 `package.json`·lockfile의 기준 대비 차이는 0입니다.

기록 브랜치에서는 Node26의 도구 checkJs·ESLint·Prettier만 통과시켰습니다. 제품 빌드·시험과 추가 측정은 실행하지 않았습니다. 결과 문서의 상대 링크는 모두 존재하고 압축 원시를 포함한 기록 파일에서 기계 로컬 경로는 검출되지 않았습니다. 실제 실행 장치의 공유 계측 변경은 제품 보존 브랜치에 있으므로 기록 브랜치만으로 새 측정을 재현한다고 주장하지 않습니다.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `1b8cfa23cedc`, `5aee0fa24b45`, `67405376f122`, `81e4b05a2f99`, `c70c4adfb1b4`, `f36703036b76`, `f81d1038cae9`의 필요한 내용은 [본선 보존물](../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
