# B2-P3 — 변화량 적용

판정: 미채택 — 단계 0/4개 충족, TEST-073 주판정 회귀 0개, Node 힙 통과; 후보 유지 여부는 코디네이터가 결정합니다.

| 총합 (µs/왕복 1회) | A 앞5 | B 전체10 | A′ 뒤5 | 폭 (다) | 관측 |
| --- | ---: | ---: | ---: | ---: | --- |
| switch-oneOf-80 | 405.417 | 361.791 | 369.083 | 245.041 | 개선 입증 없음 |
| switch-payload-12 | 970.250 | 776.396 | 858.708 | 286.875 | 개선 입증 없음 |

| oneOf-80 단계 (µs/쓰기, self) | A | B | 고정 상한 | B/A | 상한 또는 절반 | 비악화 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| setLatentRaw + captureExitedRaw | 17.376 | 12.062 | 8 | 0.694 | 미달 | 통과 |
| assembleObject | 9.667 | 6.208 | 3 | 0.642 | 미달 | 통과 |
| registerRecalculation | 12.729 | 15.688 | 5 | 1.232 | 미달 | 악화 |
| markCommitDeliveries | 11.542 | 11.750 | 6 | 1.018 | 미달 | 악화 |

| payload-12 단계 (µs/쓰기, self) | A | B |
| --- | ---: | ---: |
| setLatentRaw + captureExitedRaw | 48.500 | 30.834 |
| assembleObject | 35.812 | 10.500 |
| registerRecalculation | 19.917 | 23.751 |
| markCommitDeliveries | 15.562 | 13.833 |

| 힙 (B/노드, 5,001노드·7표본) | A 중앙 | A 최대 | B 중앙 | 판정 |
| --- | ---: | ---: | ---: | --- |
| node | 1439.395 | 1890.761 | 1439.027 | 통과 |
| bun | 2227.522 | 2234.781 | 2234.003 | 보고 |

| oneOf-80 호출/쓰기 | A | B |
| --- | ---: | ---: |
| getBlueprintNodeIdentity | 61 | 25 |
| PathKeyedMap.set | 22 | 22 |
| PathKeyedMap.delete | 12 | 12 |
| indexLatentDescendant | 9 | 0 |

| JSON pair 호출/쓰기 | A 한정 저장·색인 | B 한정 저장·색인 | B 선택부 pending | B 전이·선언 키 생성 | B 잠복 descendant 해석 |
| --- | ---: | ---: | ---: | ---: | ---: |
| switch-oneOf-80 | 30 | 0 | 6 | 16 | 3 |
| switch-payload-12 | 120 | 0 | 24 | 61 | 12 |

| 조건·검증 | 결과·범위 |
| --- | --- |
| 기준/후보 | A `8d9d885bf`(B1과 제품 동일), B `7253507fd`; 2026-10-27T16:13:13.734Z 창 종료 |
| 최종 채택 규칙 | 코디네이터 15:19 UTC 지시: 네 단계 중 셋 이상이 고정 상한 이하 또는 A의 절반 이하, 네 단계 모두 비악화, 주판정 TEST-073 회귀 0, Node 힙 통과. 총합·폭은 B3 누적 판단용 |
| 시간 프로토콜 | 22행·440 독립 PID, A0 B0 … A9 B9, 역할별 20예열·100표본. A앞5/A′뒤5/B전체10 최소값 중앙, 폭=max(\|A−A′\|,rangeA,rangeA′) |
| 창 품질/CPU | 동일 0.16.1의 호환 18행 B/A 최소값 중앙비 중앙 0.995436203, 범위 0.95~1.05; 시작/끝 CPU heavy 0/0 |
| 단계 정의 | 각 판·행 3프로세스×100쓰기. 프로세스별 self 중앙의 중앙, 잠복 합은 같은 쓰기의 두 self를 더한 뒤 집계하여 중복 포함을 피함. 계측·coverage·할당은 scratch 사본에만 적용 |
| TEST-073 | 전체 인접10쌍·각1,000 처리량 표본 Welch: 회귀 0 /22행; 앞5·뒤5 보조 회귀 2건 |
| 검사 | build·typecheck·lint 통과; unit 3677+기존todo1, render/react18 각760, production 20, verify 4481+기존todo1, Storybook 251 사례 |
| 동치/표면 | 배달72장면·323지점 및 공개관측6장면·12지점 차이0; 값·raw/local/emit 키 순서·사건·payload·revision·잠복 원본·inactiveValues·떼어진 참조·재진입 비교. 공개 index.d.ts 바이트 동일 |
| 장치 검사 | 선택적 payload를 포함한22행은 기존 사후 검사기의21행 고정 assert에 걸림. 실패 기록 보존 후 독립 검사로440 PID·행/역할 순서·100표본·minima·번들 SHA와 원본 prefix를 검증했고 시간 재수집 없음 |
| red/green | 잠복 JSON 호출·pair 색인·기존 노드 조상 문자열·inactive 선언 방문 상한은 기준판 실패 확인. 신규6파일·8사례 추가, 기존 기대값 변경0 |
| FCA seam | 전체 FAIL·분석 미완료: 기존 245개(오류24·경고221), 변경 경로 지적0. 신규 시험 exact 2+2+1+1+1+1 |
| 악화 원인 분석 | 재계산은 부모 사슬 조회를 위해 매 등록마다 liveByPath Map을 만들고 경로별 조회·분해를 더하여 얕은 형상의 문자열 slice 절감보다 비용이 컸습니다. 배달은 이미 Δ 후보를 순회해 Set 지연화·검증 단축만으로 장부 비용을 줄이지 못했습니다 |
| 절감 기여 | oneOf-80 잠복 처리 −30.6%, 조립 −35.8%; 재계산 등록 +23.2%, 배달 +1.8%로 묶음은 유지 조건 미달 |
| 한정 JSON 계약 | 코디네이터 지시로 저장·메타데이터·색인 및 공통 키 codec 경로의0회를 판정. 선택부뿐 아니라 전이·선언 키와 captureLatentDescendants의 JSON도 위 계수대로 남아 있어 전체 쓰기의 JSON0을 주장하지 않음 |
| 보류/범위 | 존재 등록 두 번째 diff는 B2-P2 병합 뒤 라운드별 변경 이름을 SettlementContext로 받으면 제거 가능. 선택부 JSON은 위 계수로 남고, inactiveValues 전수 메모는 변경하지 않음 |
| 비용/한계 | 이름별 첫 선언 순위는 청사진당 O(E) 준비·O(고유 이름 수) 보유, 조립 O(A log A+extras+propertyOrder). 잠복 조회는 영속 색인을 재사용하며 union 키 메모만 타입 목록 참조1개 추가. flat 힙은 분기 순위 캐시의 최대 보유량을 직접 검증하지 않음 |
| 재개/산출물 | 최초4GB unit OOM 및 B2-P2 창 중단 원본 보존 후 8GB 직렬 전체 재실행. 측정 사본 적재 실패는 예열·정식표본0 확인 후 연결 보완·코디네이터 재개 승인으로 수집. AJV8 미빌드 중단 창9행·180프로세스는 판정에서 제외하고 별도 승인 새 창을 수집. dist는 git 비추적이므로 소스 커밋의 생성물0·추적 산출물 커밋0; A/B 번들과 원자료는 아래 경로 |
| 원자료 요약 | `raw/b2-p3/judgement.json`, `results.summary.json`, `quality.json`, `window.json`, `stages.json`, `validation.json`, `filid.json`; 전체 표본 덤프는 작업 기계에 보존 |

| TEST-073 지적 | 구간 | 처리량 변화 % | p |
| --- | --- | ---: | ---: |
| switch-siblings-0 | early | -16.12 | 2.48e-08 |
| switch-siblings-100 | late | -16.36 | 2.41e-14 |
