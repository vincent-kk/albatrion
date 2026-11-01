# Decision 62 PR-6: 적재 중 게이트 선택 표 사용 결과

PR-3 병합 `f39897f506562fd2053f2a953de0362ffbdf21ff`를 기준으로, 마운트에서 이미 준비한 직접 선택 계획과 게이트 표를 적재에도 사용했습니다. 제품 구현은 `67c2697b4b98f31bc1cc394def2d989753d3004a`입니다. 출하 기본 모드는 `table`이며 공개 export를 늘리지 않았습니다.

oneOf-80의 mount는 A 2.720583 ms, A′ 2.830125 ms, B 2.160250 ms로 **입증(빠름)**입니다. 기본 10행과 추가 회귀 7행의 판정은 빠름 1·동치 범위 안 14·미입증 2·느림 0입니다. 분기 전환 다섯 행과 442C 기울기는 동치 범위 안입니다. N≥20의 모든 mount가 빠르리라는 가설은 충족하지 않았습니다. N20은 동치 범위 안, N40과 표 밖 중첩 게이트 mount는 미입증으로 남깁니다.

## 적재 제외의 이유와 변경 조건

117C-01은 모든 호스트의 계획을 mount의 primeHost에서 만들던 구현이 if-then mount·BF와 flat-500 첫 갱신에서 회귀했기 때문에, 둘 이상의 union 분기를 실제로 도는 첫 비적재 전환에서 지연 생성하기로 결정한 기록입니다. 적재의 선택 결과가 달라진다는 이유로 금지한 것이 아닙니다. 근거는 [round-117-closing](../../reviews/round-117-closing.md), [branch1b-2](../07-switch/branch1b-2.md), [branch1c-F3](../07-switch/branch1c-F3.md), [branch1d-design](../07-switch/branch1d-design.md)입니다. PR-2a의 마운트 사전 준비 뒤에도 남아 있던 사용 제외와, 일반 load의 지연 준비를 구별했습니다.

- selectChildren과 primeHost는 캐시에 이미 있는 계획을 load에도 사용합니다. 미준비 load는 계획 함수를 부르지 않고 기존 선택으로 돌아갑니다. createSettlementContext의 일반 load 준비 제외는 유지합니다.
- prepareGateTableRound는 `context.kind === 'load' && !DIRECT_CHILD_SELECTION_PLANS.get(node.blueprintNode)`를 조상 순회 전에 거절합니다. 준비된 계획이 있어도 게이트가 있는 객체·허용 모드·모든 조상의 raw 부재·감시 경로가 dirty 아님 조건을 유지합니다.
- load의 읽기 전 공표는 `immediate && (!direct || context.kind === 'load')`로 유지합니다. 표 밖 단계는 원래 자리에서 공표하고 평가합니다. verify+skip은 원래 표 단계의 묶음 읽기 전 공표가 pendingOutputs와 changedNodes의 순서 집합을 바꾸지 않는지 S2로 확인합니다. 이 추가 검사는 shadow에 적용하지 않습니다.
- 초기 출력 수집, 비활성 입력의 잠복 분배, 최초 상태 키 계산, 적재 확인 바퀴, 검증과 배달 순서는 유지합니다. load에 증인 프레임이나 확인 바퀴 생략을 추가하지 않았습니다. 라운드 캐시와 pending-exit 색인의 초기화·형식·갱신·수명도 유지했습니다.

## 무시간 계수와 특성화

아래 mount 계수는 skip 바퀴의 실제 함수 진입입니다. 표의 식 확인을 수행하는 verify도 실제 evaluateGate 진입은 0이며 최종 값과 배달은 off와 같습니다.

| 항목 | 기준/참조 | 준비된 표 | 근거 |
| --- | ---: | ---: | --- |
| oneOf-5 mount 게이트 평가 | 100 | 0 | loading-counts |
| oneOf-5 mount 단계 방문 | 85 | 22 | loading-counts |
| oneOf-80 mount 게이트 평가 | 1,600 | 0 | loading-counts |
| oneOf-80 mount 단계 방문 | 1,210 | 22 | loading-counts |
| mount 사전 공표, B=5/10/20/40 | shadow 6B−2 = 28/58/118/238 | skip 4/4/4/4 | plan-lookup-counts |
| oneOf-20 production freeze | 116 | 111 | owned-inline-counts |
| 같은 dev freeze | 1,569 | 1,564 | owned-inline-counts |

37회는 초기 설계의 상한 가설이었으며 실제 방문값 22회로 대체했습니다. shadow의 원래 전 단계 방문 계약은 시험에서 table+shadow를 명시하고 유지합니다. skip은 비활성 선언을 건너뛰므로 사전 공표가 상수 4회입니다. 두 모드를 finally로 복구하며 verify의 추가 S2 호출을 제품 계수에 섞지 않습니다. freeze 5개 감소는 준비된 계획의 ids를 사용해 common·kind·활성 payload 셋의 정적 ID 배열을 다시 만들고 동결하지 않는 결과입니다.

적재 14개 fixture를 off/table/verify로 비교했습니다. 잘못된 종류와 무일치 판별값, 비활성 기본값과 명시적 잠복 입력, 초기 output/default와 실제 onChange 순서, bulk 입력, 중첩 호스트, union 안 union, tuple, 배열 항목, 표 밖 조상 게이트, form reset·판별 잎 subtree reset·기본값이 판별자를 바꾸는 reset을 포함합니다. 모든 fixture의 관측이 같고 verify 위반은 0입니다.

기존 특성화 111개 JSON 중 87개는 바이트 동일하고 fixed/invariant 197절은 전부 동일합니다. visits 61행만 재기준했습니다. 이후 쓰기의 누적 visits 변화는 mount prefix 감소이며 mount 이후 suffix는 같습니다. 큰 manifest에 있던 fixture는 크기가 줄어도 같은 section 형식을 유지합니다. 표 생성은 1회임을 유지하고 적재의 캐시 조회와 구별했으며 writer 진입 전 정확히 한 번 준비한다는 시험은 보존했습니다. reset 관측은 선택적 콜백으로 주입해 역사적 기준 번들이 현재 reset 내부 경로에 의존하지 않습니다.

## 검증과 변이

증거 이름은 원본 저장소의 `.seiri/tasks/gate-table-pr6-442/`를 기준으로 합니다.

| 관문 | 결과 | 증거 |
| --- | --- | --- |
| typecheck·lint·build | 종료 0, dist 기본 table | gates/typecheck-last.log, lint-last.log, build-final.log |
| 전체 verify | 712파일, 4,993통과, 1todo, 실패 0 | gates/full-verify-final.json |
| 전체 skip | 4,952통과, 아래 shadow 기준 비교37개와 계수4개를 분류 | gates/full-skip.json 및 full-skip-classification.md |
| 계수 계약 보강 후 집중 검사 | 기본/전역 skip 각각14통과 | gates/lookup-both-shadow.json, lookup-both-skip.json |
| Storybook table 전체 | 100파일, 251통과, 실패 0 | gates/storybook-full.json |
| Node/Bun 엄격 관찰 동치 | 각각174비교, 차이0, 음성 대조4 | observation/strict-node.json, strict-bun.json |
| mount raw-dist 보강 | 11fixture, 런타임별22비교, 차이0, verify 위반0 | mount-observation/node.json, bun.json |
| branch-switch 동치 | 4순서×N5/80, 8비교, 차이0 | branch-equivalence/result.json |
| load 제외 복구 변이 | 두 mount 계수 시험 모두 실패, 원복 후 둘 다 통과 | gates/mutation-load-guard.json, mutation-restored.json |
| FCA 전체6범위 | 구조384·진단130·검증24, 기준 대비 새 발견0, 전역 indeterminate | gates/fca-final-delta.json 및 전체 보고서 |

Storybook은 Chromium 연결 종료 없이 전체를 통과했습니다. FCA는 2,701개 참조 사실이 exact이고 세 보고서의 snapshot이 일치합니다. 기존 130개 진단과 nextAction은 보존했으며 전역을 PASS로 바꾸지 않았습니다. 구조·진단·검증 발견의 전체 객체를 작업트리 루트 경로만 정규화해 PR-3 기준과 비교했습니다.

전체 skip의 실패는 아래 다섯 파일에 한정됩니다. 앞 네 파일의37개는 shadow 진단/방문 기준과 skip의 차이로 승인받았습니다. 마지막4개는 verify 검사의 추가 호출을 세던 문제여서 원래 shadow 계약과 새 skip 제품 계약을 명시했습니다. 원본 실패 로그와 JSON은 보존했습니다.

| settle/__tests__ 파일 | 실패 수 | 이유 |
| --- | ---: | --- |
| settle.gate-table-characterization.test.ts | 21 | shadow 기준 선택 관측 |
| settle.gate-table-wheel-characterization.test.ts | 13 | shadow 기준 바퀴 관측 |
| settle.gate-selection-preparation-invariants.test.ts | 2 | shadow 진단을 포함한 비visits 해시 |
| settle.gate-table-key-order.test.ts | 1 | 음성 대조 전 정상 스냅샷 전제 |
| selectChildren.plan-lookup-counts.test.ts | 4 | verify+skip의 추가 S2 공표 호출; 보강 후 두 바퀴 모두 통과 |

전체 verify 이후의 마지막 수정은 위 계수 시험과 계약 문서뿐입니다. 제품 구현과 dist는 동일하며 수정·추가 사례를 두 바퀴에서 각각14개씩 확인했습니다. 따라서 유효한 전체 실행과 집중 실행을 함께 증거로 사용합니다. 임시 skip 설정과 변이는 모두 원복했습니다.

## A/A′/B 측정

최종 창은 UTC 2026-10-22 03:34:16경부터 03:49:41까지입니다. A와 A′는 PR-3 병합 raw dist의 독립 사본, B는 제품67c2697b4의 raw dist이며 내부 build/mount export footer만 붙여 원본 접두를 보존했습니다. production, `{node-home}/bin/node` v26.12.0, 행·판·라운드마다 새 프로세스, 20예열·100표본, 동시 자식1, 행/판 순서 회전입니다. 초기3라운드 뒤 어느 판의 프로세스 최소값 중앙값이1ms 미만인13개 행은 추가12라운드를 실행했습니다.

총621개 자식이 보존 표본62,100개와 예열12,420개를 생성했습니다. 감사에서 종료0·표본 수·환경·SHA256·자식 실행 구간 중복0을 확인했습니다. 첫 창은 Ajv2020을 루트에서 해석하지 못한 준비 오류로 ON 표본 수집 전에 중단됐고 `measure/`에 보존했습니다. 승인된 재시도는 설치된 Ajv8 플러그인 패키지로 createRequire 기준만 바꿨으며 추가 설치·제품 변경은 없습니다. canonical117의 schema-form 패키지와 실제 Ajv8.17.1 진입점·package 해시가 동일함을 감사했습니다.

oneOf는 canonical branches builder이며 N40/80은 크기 목록만 메모리에서 확장했습니다. mount는 새 폼 build/mount 및 값 materialization부터 실제 root onChange까지 중 늦은 완료점을 사용합니다. switch는 untimed mount 뒤 /kind 한 번을 쓰며 find·최종 확인은 clock 밖입니다. if-then은117의 스키마와 authored b→a 두 쓰기를 사용하고 BF는 두 root onChange 완료 시간의 합입니다. flat-500은 /field_000 첫 쓰기 하나입니다. 쓰기 대상 찾기와 schema clone·검증 서비스 생성은 clock 밖입니다. ON은 validationMode1 및 fresh Ajv 서비스입니다. nested 행은 canonical d6f4에 첫 root toggle=true와 /n0 여섯 번의 잎 active='/toggle === true'를 추가한 표 밖 게이트 mount입니다.

표는 프로세스별100표본의 최소값을 모은 중앙값입니다. 작은 행은 추가12라운드만, 나머지는 초기3라운드를 사용합니다. 기존442C 분류기를 적용하며 작은 행은 A/A′ 차이와 두 기준 판의 라운드 최대/최소 폭 중 큰 값을 잡음으로 사용합니다. 비소형 행은 라운드별 A/A′ 최대 차이와 B/A 방향·잡음 초과 여부를 사용합니다. 반올림 전 값과 모든 원본은 `measure-retry/`에 있습니다.

| 행 | A ms | A′ ms | B ms | ΔB/A % | ΔB/A′ % | 잡음 % | 판정 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| oneOf-5-mount | 0.742709 | 0.562958 | 0.714292 | -3.826131 | 26.881733 | 86.054290 | 동치 범위 안 |
| oneOf-10-mount | 0.816167 | 0.894771 | 0.686250 | -15.917943 | -23.304399 | 62.953209 | 동치 범위 안 |
| oneOf-20-mount | 1.352167 | 1.220979 | 1.186708 | -12.236548 | -2.806846 | 50.589095 | 동치 범위 안 |
| oneOf-40-mount | 1.641125 | 1.550708 | 1.327208 | -19.128159 | -14.412771 | 17.211813 | 미입증 |
| oneOf-80-mount | 2.720583 | 2.830125 | 2.160250 | -20.596063 | -23.669449 | 4.795501 | 입증(빠름) |
| oneOf-5-switch | 0.334833 | 0.339626 | 0.253583 | -24.265941 | -25.334523 | 108.570466 | 동치 범위 안 |
| oneOf-10-switch | 0.258417 | 0.302854 | 0.271958 | 5.239980 | -10.201615 | 101.957071 | 동치 범위 안 |
| oneOf-20-switch | 0.262063 | 0.299521 | 0.256792 | -2.011161 | -14.265778 | 81.008572 | 동치 범위 안 |
| oneOf-40-switch | 0.304876 | 0.249437 | 0.308375 | 1.147846 | 23.628411 | 54.025636 | 동치 범위 안 |
| oneOf-80-switch | 0.253063 | 0.259271 | 0.234333 | -7.401121 | -9.618314 | 13.040215 | 동치 범위 안 |
| if-then-mount-off | 0.227916 | 0.238416 | 0.235250 | 3.217626 | -1.328138 | 86.140075 | 동치 범위 안 |
| if-then-mount-on | 3.786375 | 3.968583 | 3.894083 | 2.844621 | -1.877244 | 7.318199 | 동치 범위 안 |
| if-then-bf-off | 0.093208 | 0.113479 | 0.092291 | -0.983821 | -18.671296 | 248.372093 | 동치 범위 안 |
| if-then-bf-on | 0.143355 | 0.136603 | 0.130521 | -8.952283 | -4.452668 | 47.587335 | 동치 범위 안 |
| flat-500-first-off | 0.035374 | 0.035313 | 0.033500 | -5.299015 | -5.132743 | 27.468479 | 동치 범위 안 |
| flat-500-first-on | 0.058604 | 0.059396 | 0.057645 | -1.635554 | -2.947168 | 20.129469 | 동치 범위 안 |
| nested-gate-d6-f4-mount | 87.404541 | 86.884125 | 87.982208 | 0.660912 | 1.263848 | 0.868525 | 미입증 |

oneOf-80만 빠름을 입증했습니다. N40 mount와 nested-gate mount의 미입증은 동치나 개선의 입증으로 해석하지 않습니다. N20의−12.236548%/−2.806846%는50.589095% 잡음 안에 있어 빠름을 주장할 수 없습니다. 작은 행의 잡음 폭이 큰 한계도 유지합니다.

442C는 다섯 switch 행의 반올림 전 중앙값에 최소제곱 직선을 적합합니다. 기울기는 A−0.502997043, A′−0.950461290, B−0.234212769 µs/분기이며 보정 폭0.447464247, 구간[−1.397925538,−0.055532796]로 B는 동치 범위 안입니다. 음수 적합값은 이 표본 범위에서 크기에 따른 증가가 관측되지 않았다는 뜻이며 물리적 음의 비용을 뜻하지 않습니다. 행별 판정은 기울기로 덮어쓰지 않았습니다.

## 번들 해시와 전달

| 번들 | SHA256 |
| --- | --- |
| 기준 index.node.mjs | cdcc40fe0da4992fdd95b646aa5fe83f14a8a1e44f115313a7ef45ee814f19cb |
| 후보 index.mjs | 0af0e9ae48656496245a1d01a0b099290e0eb628d3d3bc54b13e1f03f986e829 |
| 후보 index.node.mjs | 3aa549fa9d8709be6c0dc516db2f8c5a224c5cca8574899fd34196d8f075903d |
| 후보 index.cjs | a9d3dfb92a1cad88e442ffa2f04d130583df6a9ecaee38d05436d79dfa4b4d7e |

추적 소스와 시험만 제품 커밋에 넣었고 생성 dist는 소스 커밋에 넣지 않았습니다. 조사·승인 계획·원본 로그·재기준 감사·동치·변이·FCA·측정 자료와 독립 검증용 인계는 원본 저장소의 `.seiri/tasks/gate-table-pr6-442/`에 보존합니다. 계약 → 시험 → 제품 → 이 결과 문서의 네 커밋을 유지하고 draft PR로 전달합니다.
