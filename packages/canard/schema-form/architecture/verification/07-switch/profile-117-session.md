# 117 측정 세션 — React 분해, 동률 규칙, A/A와 child selection 판정

branch change 1의 현재 판정은 **REJECT**입니다. 분기 축의 BF·초회·후속 기울기는 모두 줄었지만, 105C-01의 최소 크기를 넘는 회귀가 4행에서 관측되었습니다.

측정 대상은 HEAD `02026967958e29d1735848c39e79f76b94fe61e3`와 이 작업트리의 기존 미커밋 child selection 변경입니다. 측정 worker 기록의 범위는 2026-10-07T09:23:51.743Z부터 2026-10-07T10:58:26.664Z까지이며, 시각은 UTC입니다. 제품 소스는 수정하거나 되돌리지 않았고, git 쓰기와 설치는 실행하지 않았습니다. 소스 전체와 기존 차이의 해시는 [최초 기록](profile-117-session/baseline.json), [D 직전 확인](profile-117-session/audit-before-D.json), [최종 확인](profile-117-session/audit-final.json)에서 대조할 수 있습니다.

Node v26.10.0, V8 14.6.202.34-node.35, Apple M1 Max에서 순차 실행했습니다. React는 19.2.6 production profiling 빌드를 사용했습니다. 기록된 측정 worker 568개는 모두 code 0, signal null로 자연 종료했고, 실행 구간의 중첩은 0개입니다. 최장 worker는 100.760초로 8분 이내였습니다.

번들은 지정된 scratchpad/bundles에만 두었습니다. [번들 준비와 해시](profile-117-session/bundles.json)에 HEAD·working·0.16.0의 해시와 자연 종료한 빌드 서비스가 기록되어 있습니다. 기존 준비 도구는 파일을 수정하지 않고 현재 HEAD를 고정하는 메모리 어댑터로 실행했으며, BF의 분기 fixture만 40까지 확장했습니다. cacheDir은 설정하지 않았습니다.

## 공통 계측 방법

공식 코어 열은 95C-01의 종단 시간에서 공통 빈 호출 상수 C를 쓰기 수만큼 뺀 값입니다. 각 실제 호출 바로 앞에서 같은 64 Promise checkpoint와 FIFO setImmediate sentinel을 실행하는 별도 빈 호출을 측정하고, 빈 호출의 종단−microtask 꼬리를 세 번째 원시 열 pairedEmptyTailMs로 보존했습니다. OFF는 1-pass, ON은 2-pass이며 음수값을 잘라내지 않았습니다.

검증 (가)는 종단에서 짝 빈 꼬리를 독립적으로 보정한 값과 microtask 값의 표본별 차이 중앙값을 각 회차와 pooled에서 비교합니다. 기존 p95 빈 대기 편차, 1000회 bootstrap, C/M 불확실성과 1µs 하한을 유지했습니다. 별도 경계 검증에서 엔진 예약·실행·microtask 및 sentinel의 pending·sentinel 뒤 후속 작업이 모두 0이어야 합니다. 시간과 경계 조건을 모두 충족해야 통과로 표시했습니다.

0.16.0의 검증 (나)가 어느 회차나 pooled에서 벗어나면 해당 행의 모든 회차에 microtask+별도 callback 실행 합계를 사용했습니다. A의 세 BF 코어 행은 fallback이 없었으며, B의 array-replace-200은 이 규칙에 따라 구 판의 합계 열을 사용했습니다. 이 선택을 새 엔진에 확장하지 않았습니다.

A·B의 wall과 코어는 버전당 3회×101표본을 합한 중앙값이며, 예열은 20회였습니다. 같은 BF 상호작용을 React와 코어 단독에서 각각 실행했습니다. 코어에서는 React를 로드하지 않았고 schema clone·강제 GC·validator 준비는 clock 밖에 두었습니다. React 계층 몫은 wall−코어로 정의했으며, BF drainTicks(2) 대기와 React 연결 비용을 포함하는 잔여값입니다. 순수 렌더 CPU 시간과 동일하게 해석하지 않습니다.

일량은 시간 측정과 분리한 계수 전용 3표본에서 실제 component 호출, commit, node listener 호출, root computeNode 호출을 셌습니다. 0.16.0에는 새 settle pipeline이 없으므로 settle pass 0은 해당 단계의 부재를 뜻합니다. 공식 시간 번들에는 이 계수 instrumentation을 넣지 않았습니다.

## (A) 배열 BF 업데이트의 코어와 React 계층 분해

세 배열 행 모두 HEAD의 코어 비중이 5% 미만이며 React 잔여 몫이 지배적입니다. 코어 지배 조건에 해당하지 않아 추가 core 표 행은 없습니다. 아래 단위는 ms이며, R/C/L/S는 render 호출·commit·listener delivery·settle pass입니다.


| fixture | 버전 | wall ms | 코어 ms | React 잔여 ms | 코어/React % | React R/C/L/S | 코어 단독 R/C/L/S |
| --- | --- | --- | --- | --- | --- | --- | --- |
| array-push-100 | 0.16.0 | 236.514 | 2.980 | 233.534 | 1.26/98.74 | 11050/200/3300/0 | 0/0/600/0 |
| array-push-100 | HEAD | 391.433 | 17.676 | 373.757 | 4.52/95.48 | 12850/100/1300/100 | 0/0/0/100 |
| array-push-remove-100 | 0.16.0 | 504.756 | 4.535 | 500.220 | 0.90/99.10 | 18000/400/6500/0 | 0/0/1100/0 |
| array-push-remove-100 | HEAD | 765.153 | 29.678 | 735.475 | 3.88/96.12 | 20000/200/2600/200 | 0/0/0/200 |
| array-100 | 0.16.0 | 2.393 | 0.068 | 2.325 | 2.85/97.15 | 141/2/35/0 | 0/0/4/0 |
| array-100 | HEAD | 3.230 | 0.154 | 3.076 | 4.77/95.23 | 40/1/25/1 | 0/0/0/1 |

배열 행의 raw wall·core·계수 자료는 [원자료 목록의 A·B 항목](profile-117-session/raw-evidence.md)에 있으며, 분해 수치와 공식 열 선택은 [A·B 분해 JSON](profile-117-session/split-AB.json)에서 확인할 수 있습니다.

## (B) 94C-02 동률 규칙과 남은 React 업데이트 행

소유자 판단 필요로 표시된 업데이트 24행을 요청하신 G26의 기존 세 회차에만 대조했습니다. 목표 초과가 세 회차 모두에서 성립할 때만 미달로 남겼습니다. array-500 wall의 회차 배율은 1.023359/1.001867/0.988247이고 sample-2 profiler는 0.916161/1.066653/0.938916이므로 두 행은 동률·충족으로 처리했습니다. 남은 행은 wall 14개와 profiler 8개입니다. 새 분해 표본을 사용해 G26 판정을 다시 바꾸지 않았습니다.


| fixture | G26 업데이트 지표 | 목표 × | 회차 1 × | 회차 2 × | 회차 3 × | 동률 적용 결과 |
| --- | --- | --- | --- | --- | --- | --- |
| sample-0 | wall | 1.0 | 1.008996 | 1.009298 | 1.005343 | 미달로 남습니다. |
| sample-1 | wall | 1.0 | 1.042580 | 1.050052 | 1.031084 | 미달로 남습니다. |
| sample-2 | wall | 1.0 | 1.024040 | 1.034103 | 1.011215 | 미달로 남습니다. |
| sample-3 | wall | 1.0 | 1.011912 | 1.010380 | 1.019246 | 미달로 남습니다. |
| flat-50 | wall | 1.0 | 1.084876 | 1.085671 | 1.058967 | 미달로 남습니다. |
| flat-100 | wall | 1.0 | 1.078688 | 1.081815 | 1.078806 | 미달로 남습니다. |
| flat-500 | wall | 1.0 | 1.205342 | 1.201364 | 1.193018 | 미달로 남습니다. |
| nested-d3-f4 | wall | 1.0 | 1.145168 | 1.100275 | 1.098189 | 미달로 남습니다. |
| nested-d5-f4 | wall | 1.0 | 1.099745 | 1.097938 | 1.096024 | 미달로 남습니다. |
| array-100 | wall | 1.0 | 1.354643 | 1.349573 | 1.355670 | 미달로 남습니다. |
| array-500 | wall | 1.0 | 1.023359 | 1.001867 | 0.988247 | 동률·충족입니다. |
| array-push-100 | wall | 1.0 | 1.639871 | 1.660528 | 1.650956 | 미달로 남습니다. |
| array-replace-200 | wall | 1.0 | 1.056830 | 1.083592 | 1.086756 | 미달로 남습니다. |
| array-push-remove-100 | wall | 1.0 | 1.506942 | 1.526604 | 1.528153 | 미달로 남습니다. |
| computed-visible-derived | wall | 1.0 | 1.182276 | 1.176257 | 1.178949 | 미달로 남습니다. |
| sample-2 | profiler | 1.0 | 0.916161 | 1.066653 | 0.938916 | 동률·충족입니다. |
| flat-50 | profiler | 1.0 | 1.033830 | 1.037629 | 1.042336 | 미달로 남습니다. |
| flat-100 | profiler | 1.0 | 1.007585 | 1.027020 | 1.023789 | 미달로 남습니다. |
| nested-d3-f4 | profiler | 1.0 | 1.046100 | 1.032240 | 1.046531 | 미달로 남습니다. |
| nested-d5-f4 | profiler | 1.0 | 1.074579 | 1.088774 | 1.081691 | 미달로 남습니다. |
| array-push-100 | profiler | 1.0 | 1.225526 | 1.256439 | 1.209045 | 미달로 남습니다. |
| array-replace-200 | profiler | 1.0 | 1.046656 | 1.074500 | 1.083122 | 미달로 남습니다. |
| array-push-remove-100 | profiler | 1.0 | 1.139320 | 1.054650 | 1.120870 | 미달로 남습니다. |
| computed-visible-derived | profiler | 1.0 | 1.080456 | 1.067197 | 1.064902 | 미달로 남습니다. |

세 회차의 구 판·HEAD 중앙값과 source SHA-256은 [동률 규칙 원자료](profile-117-session/tie-B.json)에 기록되어 있으며, 입력은 [G26 summary](profile-114-g26/summary.json)입니다.

남은 각 fixture의 wall을 같은 BF 쓰기 수로 분해한 현재 값은 다음과 같습니다. 단위는 ms이며, 코어/React 비중은 HEAD wall 기준입니다.


| fixture | BF 쓰기 수 | 0.16 wall/코어/React ms | HEAD wall/코어/React ms | HEAD 코어/React % | React 잔여 증가 ms |
| --- | --- | --- | --- | --- | --- |
| array-push-100 | 100 | 236.514/2.980/233.534 | 391.433/17.676/373.757 | 4.52/95.48 | 140.222626 |
| array-push-remove-100 | 200 | 504.756/4.535/500.220 | 765.153/29.678/735.475 | 3.88/96.12 | 235.254377 |
| array-100 | 1 | 2.393/0.068/2.325 | 3.230/0.154/3.076 | 4.77/95.23 | 0.751417 |
| sample-0 | 1 | 2.886/0.021/2.865 | 2.922/0.124/2.797 | 4.26/95.74 | -0.067334 |
| sample-1 | 1 | 2.841/0.026/2.815 | 2.984/0.139/2.845 | 4.65/95.35 | 0.029583 |
| sample-2 | 1 | 2.926/0.029/2.898 | 2.982/0.140/2.842 | 4.69/95.31 | -0.055376 |
| sample-3 | 1 | 2.899/0.029/2.870 | 2.938/0.137/2.801 | 4.66/95.34 | -0.069832 |
| flat-50 | 10 | 25.345/0.161/25.184 | 27.412/0.305/27.106 | 1.11/98.89 | 1.922584 |
| flat-100 | 10 | 25.351/0.254/25.097 | 27.509/0.304/27.206 | 1.10/98.90 | 2.108959 |
| flat-500 | 10 | 25.807/2.200/23.608 | 30.404/0.331/30.073 | 1.09/98.91 | 6.465998 |
| nested-d3-f4 | 10 | 25.218/0.102/25.116 | 27.756/0.383/27.372 | 1.38/98.62 | 2.256418 |
| nested-d5-f4 | 10 | 26.071/0.154/25.917 | 28.619/0.510/28.109 | 1.78/98.22 | 2.192124 |
| array-replace-200 | 1 | 105.759/3.016/102.743 | 113.770/4.822/108.948 | 4.24/95.76 | 6.205415 |
| computed-visible-derived | 3 | 7.693/0.044/7.649 | 8.984/0.281/8.703 | 3.12/96.88 | 1.053875 |

104차에서는 sample·nested·array·computed의 쓰기당 고정 pipeline 비용을 약 0.06ms로 수용했고, 110차에서는 flat-50·100의 초회 비용 0.07–0.1ms만 수용했습니다. 아래 비교는 같은 fixture와 초회·후속 구분, 시간 규모를 대조한 결과입니다. 본 세션은 pipeline 단계별 제거 실험을 하지 않았으므로, 크기가 양립하는 경우에도 특정 단계가 유일한 원인이라는 재확정은 아닙니다. 기존 수용 범위는 넓히지 않았습니다.


| fixture | 코어 초회 증가 µs | 코어 후속 증가 µs | 104·110차 원인과의 비교 |
| --- | --- | --- | --- |
| array-push-100 | 147.419 | 239.084 | 104·110라운드에서 수용한 동일 행과 같은 규모가 아닙니다. 기존 수용으로 포함하지 않습니다. |
| array-push-remove-100 | 161.456 | 58.209 | 104·110라운드에서 수용한 동일 행과 같은 규모가 아닙니다. 기존 수용으로 포함하지 않습니다. |
| array-100 | 85.958 | 27.333 | 이후 갱신 차이는 104라운드의 동일 행에 남은 쓰기당 고정비와 같은 규모입니다. 첫 갱신 차이는 그 기록의 약 0.06 ms보다 크므로 동일 크기로 확대하지 않습니다. |
| sample-0 | 102.875 | 32.375 | 이후 갱신 차이는 104라운드의 동일 행에 남은 쓰기당 고정비와 같은 규모입니다. 첫 갱신 차이는 그 기록의 약 0.06 ms보다 크므로 동일 크기로 확대하지 않습니다. |
| sample-1 | 113.000 | 36.958 | 이후 갱신 차이는 104라운드의 동일 행에 남은 쓰기당 고정비와 같은 규모입니다. 첫 갱신 차이는 그 기록의 약 0.06 ms보다 크므로 동일 크기로 확대하지 않습니다. |
| sample-2 | 111.167 | 34.291 | 이후 갱신 차이는 104라운드의 동일 행에 남은 쓰기당 고정비와 같은 규모입니다. 첫 갱신 차이는 그 기록의 약 0.06 ms보다 크므로 동일 크기로 확대하지 않습니다. |
| sample-3 | 107.874 | 36.084 | 이후 갱신 차이는 104라운드의 동일 행에 남은 쓰기당 고정비와 같은 규모입니다. 첫 갱신 차이는 그 기록의 약 0.06 ms보다 크므로 동일 크기로 확대하지 않습니다. |
| flat-50 | 90.750 | 4.416 | 첫 갱신 차이는 110라운드의 동일 두 행에서 수용한 0.07–0.1 ms 규모와 맞습니다. 양의 React 잔여 차이는 별도 stage 07의 코드 수준 대상입니다. |
| flat-100 | 73.333 | -2.417 | 첫 갱신 차이는 110라운드의 동일 두 행에서 수용한 0.07–0.1 ms 규모와 맞습니다. 양의 React 잔여 차이는 별도 stage 07의 코드 수준 대상입니다. |
| flat-500 | -116.167 | -191.084 | 코어는 구 판보다 빠릅니다. 양의 wall 차이는 코어 수용 원인으로 설명되지 않으며 React 잔여 몫이 증가했습니다. |
| nested-d3-f4 | 113.125 | 14.751 | 이후 갱신 차이는 104라운드의 동일 행에 남은 쓰기당 고정비와 같은 규모입니다. 첫 갱신 차이는 그 기록의 약 0.06 ms보다 크므로 동일 크기로 확대하지 않습니다. |
| nested-d5-f4 | 131.332 | 21.375 | 이후 갱신 차이는 104라운드의 동일 행에 남은 쓰기당 고정비와 같은 규모입니다. 첫 갱신 차이는 그 기록의 약 0.06 ms보다 크므로 동일 크기로 확대하지 않습니다. |
| array-replace-200 | 1805.377 | 23.133 | 104·110라운드에서 수용한 동일 행과 같은 규모가 아닙니다. 기존 수용으로 포함하지 않습니다. |
| computed-visible-derived | 114.374 | 57.541 | 이후 갱신 차이는 104라운드의 동일 행에 남은 쓰기당 고정비와 같은 규모입니다. 첫 갱신 차이는 그 기록의 약 0.06 ms보다 크므로 동일 크기로 확대하지 않습니다. |

flat-50·100의 초회 차이 90.750/73.333µs는 110차의 동일 두 행과 같은 규모입니다. sample·nested·array-100·computed의 후속 차이는 14.751–57.541µs로 104차 고정비와 크기 비교상 양립하지만, 초회 85.958–131.332µs를 전부 기존 약 60µs 수용에 포함하지 않았습니다. flat-500의 코어는 구 판보다 빨라 wall 증가를 기존 코어 수용 원인으로 설명할 수 없습니다. push·remove·replace의 큰 코어 증가도 기존 동일 행·규모의 수용에 포함하지 않았습니다.

양의 React 잔여 증가가 관측된 array-push-100, array-push-remove-100, array-100, sample-1, flat-50, flat-100, flat-500, nested-d3-f4, nested-d5-f4, array-replace-200, computed-visible-derived은 stage 07의 코드 수준 개선 대상입니다. sample-0·2·3은 이번 잔여 중앙값 차이가 음수이므로 새로운 양의 잔여 증가로 표시하지 않았습니다.

profiler-update의 남은 8행은 React render 영역 자체의 관측입니다. 코어 단독 setValue clock은 actualDuration 밖에 있으므로 profiler 값에서 이를 빼서 가짜 부분합을 만들지 않았습니다. 같은 fixture의 위 wall 분해를 연결하고, profiler 미달은 React render 영역의 stage 07 코드 수준 대상으로 남겼습니다.

남은 fixture의 실제 일량은 아래와 같습니다. 튜플 순서는 A와 같은 R/C/L/S이며, 단독 코어의 render·commit은 모두 0입니다.


| fixture | 0.16 React R/C/L/S | HEAD React R/C/L/S | 0.16 코어 R/C/L/S | HEAD 코어 R/C/L/S |
| --- | --- | --- | --- | --- |
| array-push-100 | 11050/200/3300/0 | 12850/100/1300/100 | 0/0/600/0 | 0/0/0/100 |
| array-push-remove-100 | 18000/400/6500/0 | 20000/200/2600/200 | 0/0/1100/0 | 0/0/0/200 |
| array-100 | 141/2/35/0 | 40/1/25/1 | 0/0/4/0 | 0/0/0/1 |
| sample-0 | 22/2/24/0 | 20/1/13/1 | 0/0/2/0 | 0/0/0/1 |
| sample-1 | 31/2/29/0 | 30/1/19/1 | 0/0/3/0 | 0/0/0/1 |
| sample-2 | 31/2/29/0 | 30/1/19/1 | 0/0/3/0 | 0/0/0/1 |
| sample-3 | 31/2/29/0 | 30/1/19/1 | 0/0/3/0 | 0/0/0/1 |
| flat-50 | 220/20/240/0 | 200/10/130/10 | 0/0/20/0 | 0/0/0/10 |
| flat-100 | 220/20/240/0 | 200/10/130/10 | 0/0/20/0 | 0/0/0/10 |
| flat-500 | 220/20/240/0 | 200/10/130/10 | 0/0/20/0 | 0/0/0/10 |
| nested-d3-f4 | 400/20/350/0 | 400/10/250/10 | 0/0/40/0 | 0/0/0/10 |
| nested-d5-f4 | 580/20/470/0 | 600/10/370/10 | 0/0/60/0 | 0/0/0/10 |
| array-replace-200 | 8219/1/220/0 | 11422/1/13/1 | 0/0/203/0 | 0/0/0/1 |
| computed-visible-derived | 89/7/117/0 | 81/3/53/4 | 0/0/25/0 | 0/0/0/4 |

## (C) HEAD 대 HEAD 9회 A/A 대조

공식 core의 마운트·BF·초회·후속 92행과 OFF 고정 분기 축의 BF·초회·후속 12행을 측정했습니다. 축 마운트의 4개 중복을 포함한 기존 표시 방식은 108행이며, 계산은 104개 고유 행을 사용했습니다. 각 행은 9회×101개, 총 909개의 ordinal 대응 차이를 합쳤습니다. 표본마다 두 독립 HEAD 인스턴스의 순서를 교대했으며, 강제 GC는 clock 밖에 두었습니다.

차이는 첫 HEAD−둘째 HEAD이며, 99% 구간은 기존 1999회·seed 101 bootstrap으로 구했습니다. A/A 차이 중앙값 절댓값의 최댓값은 array-1000 마운트의 19.999µs이며, 대응 차이 중앙값과 구간은 -19.999 [-81.292, 55.334]µs입니다. D의 잡음 바닥에는 이 최댓값을 일괄 적용하지 않고 같은 행의 절댓값을 사용했습니다.


| fixture | 검증 | 모드 | A/A 대응 중앙값 [99%] µs | 절댓값 µs | 행별 자료 |
| --- | --- | --- | --- | --- | --- |
| sample-0 | OFF | 마운트 | -0.666 [-1.541, 0.459] | 0.666 | [통계·raw 경로](profile-117-session/analysis-C-sample-0-off.json) |
| sample-0 | OFF | BF | 0.167 [-1.084, 1.708] | 0.167 | [통계·raw 경로](profile-117-session/analysis-C-sample-0-off.json) |
| sample-0 | OFF | 초회 | 0.167 [-1.084, 1.708] | 0.167 | [통계·raw 경로](profile-117-session/analysis-C-sample-0-off.json) |
| sample-0 | OFF | 후속 | 0.083 [-0.376, 0.666] | 0.083 | [통계·raw 경로](profile-117-session/analysis-C-sample-0-off.json) |
| sample-1 | OFF | 마운트 | -1.292 [-2.250, -0.333] | 1.292 | [통계·raw 경로](profile-117-session/analysis-C-sample-1-off.json) |
| sample-1 | OFF | BF | -0.750 [-2.125, 0.833] | 0.750 | [통계·raw 경로](profile-117-session/analysis-C-sample-1-off.json) |
| sample-1 | OFF | 초회 | -0.750 [-2.125, 0.833] | 0.750 | [통계·raw 경로](profile-117-session/analysis-C-sample-1-off.json) |
| sample-1 | OFF | 후속 | 0.000 [-0.417, 0.625] | 0.000 | [통계·raw 경로](profile-117-session/analysis-C-sample-1-off.json) |
| sample-2 | OFF | 마운트 | -0.583 [-2.250, 1.125] | 0.583 | [통계·raw 경로](profile-117-session/analysis-C-sample-2-off.json) |
| sample-2 | OFF | BF | 0.042 [-0.875, 1.083] | 0.042 | [통계·raw 경로](profile-117-session/analysis-C-sample-2-off.json) |
| sample-2 | OFF | 초회 | 0.042 [-0.875, 1.083] | 0.042 | [통계·raw 경로](profile-117-session/analysis-C-sample-2-off.json) |
| sample-2 | OFF | 후속 | -0.292 [-0.750, 0.208] | 0.292 | [통계·raw 경로](profile-117-session/analysis-C-sample-2-off.json) |
| sample-3 | OFF | 마운트 | 0.499 [-2.417, 3.000] | 0.499 | [통계·raw 경로](profile-117-session/analysis-C-sample-3-off.json) |
| sample-3 | OFF | BF | 0.583 [-0.458, 1.751] | 0.583 | [통계·raw 경로](profile-117-session/analysis-C-sample-3-off.json) |
| sample-3 | OFF | 초회 | 0.583 [-0.458, 1.751] | 0.583 | [통계·raw 경로](profile-117-session/analysis-C-sample-3-off.json) |
| sample-3 | OFF | 후속 | -0.083 [-0.541, 0.500] | 0.083 | [통계·raw 경로](profile-117-session/analysis-C-sample-3-off.json) |
| flat-50 | OFF | 마운트 | -0.833 [-2.208, 0.416] | 0.833 | [통계·raw 경로](profile-117-session/analysis-C-flat-50-off.json) |
| flat-50 | OFF | BF | 0.332 [-2.166, 2.667] | 0.332 | [통계·raw 경로](profile-117-session/analysis-C-flat-50-off.json) |
| flat-50 | OFF | 초회 | 0.208 [-0.834, 1.209] | 0.208 | [통계·raw 경로](profile-117-session/analysis-C-flat-50-off.json) |
| flat-50 | OFF | 후속 | -0.083 [-0.208, 0.166] | 0.083 | [통계·raw 경로](profile-117-session/analysis-C-flat-50-off.json) |
| flat-100 | OFF | 마운트 | -0.458 [-2.583, 1.501] | 0.458 | [통계·raw 경로](profile-117-session/analysis-C-flat-100-off.json) |
| flat-100 | OFF | BF | 0.123 [-2.335, 2.498] | 0.123 | [통계·raw 경로](profile-117-session/analysis-C-flat-100-off.json) |
| flat-100 | OFF | 초회 | 0.417 [-1.082, 1.292] | 0.417 | [통계·raw 경로](profile-117-session/analysis-C-flat-100-off.json) |
| flat-100 | OFF | 후속 | 0.042 [-0.126, 0.208] | 0.042 | [통계·raw 경로](profile-117-session/analysis-C-flat-100-off.json) |
| flat-500 | OFF | 마운트 | -2.625 [-10.374, 6.667] | 2.625 | [통계·raw 경로](profile-117-session/analysis-C-flat-500-off.json) |
| flat-500 | OFF | BF | -0.542 [-5.749, 5.416] | 0.542 | [통계·raw 경로](profile-117-session/analysis-C-flat-500-off.json) |
| flat-500 | OFF | 초회 | -0.416 [-4.041, 3.750] | 0.416 | [통계·raw 경로](profile-117-session/analysis-C-flat-500-off.json) |
| flat-500 | OFF | 후속 | 0.126 [-0.125, 0.292] | 0.126 | [통계·raw 경로](profile-117-session/analysis-C-flat-500-off.json) |
| nested-d3-f4 | OFF | 마운트 | -0.083 [-2.167, 2.249] | 0.083 | [통계·raw 경로](profile-117-session/analysis-C-nested-d3-f4-off.json) |
| nested-d3-f4 | OFF | BF | -0.543 [-3.376, 2.792] | 0.543 | [통계·raw 경로](profile-117-session/analysis-C-nested-d3-f4-off.json) |
| nested-d3-f4 | OFF | 초회 | -0.500 [-1.833, 1.125] | 0.500 | [통계·raw 경로](profile-117-session/analysis-C-nested-d3-f4-off.json) |
| nested-d3-f4 | OFF | 후속 | 0.041 [-0.125, 0.167] | 0.041 | [통계·raw 경로](profile-117-session/analysis-C-nested-d3-f4-off.json) |
| nested-d5-f4 | OFF | 마운트 | -5.667 [-30.749, 18.374] | 5.667 | [통계·raw 경로](profile-117-session/analysis-C-nested-d5-f4-off.json) |
| nested-d5-f4 | OFF | BF | 0.917 [-1.416, 4.588] | 0.917 | [통계·raw 경로](profile-117-session/analysis-C-nested-d5-f4-off.json) |
| nested-d5-f4 | OFF | 초회 | 1.041 [-0.500, 1.959] | 1.041 | [통계·raw 경로](profile-117-session/analysis-C-nested-d5-f4-off.json) |
| nested-d5-f4 | OFF | 후속 | -0.042 [-0.167, 0.125] | 0.042 | [통계·raw 경로](profile-117-session/analysis-C-nested-d5-f4-off.json) |
| array-100 | OFF | 마운트 | -1.250 [-5.292, 3.751] | 1.250 | [통계·raw 경로](profile-117-session/analysis-C-array-100-off.json) |
| array-100 | OFF | BF | -0.834 [-3.833, 2.208] | 0.834 | [통계·raw 경로](profile-117-session/analysis-C-array-100-off.json) |
| array-100 | OFF | 초회 | -0.834 [-3.833, 2.208] | 0.834 | [통계·raw 경로](profile-117-session/analysis-C-array-100-off.json) |
| array-100 | OFF | 후속 | -0.125 [-0.583, 0.459] | 0.125 | [통계·raw 경로](profile-117-session/analysis-C-array-100-off.json) |
| array-500 | OFF | 마운트 | -2.750 [-17.083, 18.875] | 2.750 | [통계·raw 경로](profile-117-session/analysis-C-array-500-off.json) |
| array-500 | OFF | BF | 1.459 [-0.958, 4.625] | 1.459 | [통계·raw 경로](profile-117-session/analysis-C-array-500-off.json) |
| array-500 | OFF | 초회 | 1.459 [-0.958, 4.625] | 1.459 | [통계·raw 경로](profile-117-session/analysis-C-array-500-off.json) |
| array-500 | OFF | 후속 | 0.208 [-0.334, 0.876] | 0.208 | [통계·raw 경로](profile-117-session/analysis-C-array-500-off.json) |
| array-1000 | OFF | 마운트 | -19.999 [-81.292, 55.334] | 19.999 | [통계·raw 경로](profile-117-session/analysis-C-array-1000-off.json) |
| array-1000 | OFF | BF | -0.250 [-3.249, 3.916] | 0.250 | [통계·raw 경로](profile-117-session/analysis-C-array-1000-off.json) |
| array-1000 | OFF | 초회 | -0.250 [-3.249, 3.916] | 0.250 | [통계·raw 경로](profile-117-session/analysis-C-array-1000-off.json) |
| array-1000 | OFF | 후속 | -0.125 [-1.499, 1.334] | 0.125 | [통계·raw 경로](profile-117-session/analysis-C-array-1000-off.json) |
| computed-visible-derived | OFF | 마운트 | -1.042 [-3.666, 1.624] | 1.042 | [통계·raw 경로](profile-117-session/analysis-C-computed-visible-derived-off.json) |
| computed-visible-derived | OFF | BF | -0.209 [-2.583, 1.709] | 0.209 | [통계·raw 경로](profile-117-session/analysis-C-computed-visible-derived-off.json) |
| computed-visible-derived | OFF | 초회 | -0.374 [-1.542, 1.125] | 0.374 | [통계·raw 경로](profile-117-session/analysis-C-computed-visible-derived-off.json) |
| computed-visible-derived | OFF | 후속 | 0.084 [-0.459, 0.543] | 0.084 | [통계·raw 경로](profile-117-session/analysis-C-computed-visible-derived-off.json) |
| oneOf-5 | OFF | 마운트 | 0.625 [-4.209, 5.625] | 0.625 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-5-off.json) |
| oneOf-5 | OFF | BF | 4.000 [-1.916, 8.751] | 4.000 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-5-off.json) |
| oneOf-5 | OFF | 초회 | 2.041 [-2.000, 5.458] | 2.041 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-5-off.json) |
| oneOf-5 | OFF | 후속 | -0.041 [-0.750, 0.916] | 0.041 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-5-off.json) |
| oneOf-5 | OFF | 고정 축 BF | -0.666 [-2.875, 1.167] | 0.666 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-5-off.json) |
| oneOf-5 | OFF | 고정 축 초회 | -0.209 [-1.500, 1.166] | 0.209 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-5-off.json) |
| oneOf-5 | OFF | 고정 축 후속 | 0.042 [-0.958, 1.083] | 0.042 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-5-off.json) |
| oneOf-5 | ON | 마운트 | 4.292 [-23.999, 27.874] | 4.292 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-5-on.json) |
| oneOf-5 | ON | BF | -0.042 [-3.584, 3.834] | 0.042 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-5-on.json) |
| oneOf-5 | ON | 초회 | 0.250 [-2.625, 2.875] | 0.250 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-5-on.json) |
| oneOf-5 | ON | 후속 | -0.124 [-0.958, 0.751] | 0.124 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-5-on.json) |
| oneOf-10 | OFF | 마운트 | 1.875 [-4.333, 7.041] | 1.875 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-10-off.json) |
| oneOf-10 | OFF | BF | -1.750 [-8.417, 3.167] | 1.750 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-10-off.json) |
| oneOf-10 | OFF | 초회 | 0.333 [-5.500, 3.875] | 0.333 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-10-off.json) |
| oneOf-10 | OFF | 후속 | 0.417 [-0.875, 1.750] | 0.417 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-10-off.json) |
| oneOf-10 | OFF | 고정 축 BF | 0.332 [-2.834, 5.542] | 0.332 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-10-off.json) |
| oneOf-10 | OFF | 고정 축 초회 | 0.875 [-1.917, 3.833] | 0.875 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-10-off.json) |
| oneOf-10 | OFF | 고정 축 후속 | 0.208 [-1.958, 1.667] | 0.208 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-10-off.json) |
| oneOf-10 | ON | 마운트 | -13.584 [-40.125, 6.125] | 13.584 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-10-on.json) |
| oneOf-10 | ON | BF | -2.001 [-5.541, 1.250] | 2.001 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-10-on.json) |
| oneOf-10 | ON | 초회 | -1.708 [-4.125, 1.750] | 1.708 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-10-on.json) |
| oneOf-10 | ON | 후속 | -0.333 [-1.333, 1.084] | 0.333 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-10-on.json) |
| oneOf-20 | OFF | 마운트 | -4.292 [-20.958, 8.000] | 4.292 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-20-off.json) |
| oneOf-20 | OFF | BF | 2.376 [-14.126, 18.582] | 2.376 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-20-off.json) |
| oneOf-20 | OFF | 초회 | 1.250 [-9.667, 11.292] | 1.250 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-20-off.json) |
| oneOf-20 | OFF | 후속 | -0.166 [-2.042, 1.292] | 0.166 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-20-off.json) |
| oneOf-20 | OFF | 고정 축 BF | 1.502 [-9.001, 9.958] | 1.502 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-20-off.json) |
| oneOf-20 | OFF | 고정 축 초회 | 0.666 [-4.375, 6.166] | 0.666 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-20-off.json) |
| oneOf-20 | OFF | 고정 축 후속 | -1.125 [-3.916, 2.042] | 1.125 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-20-off.json) |
| oneOf-20 | ON | 마운트 | 8.917 [-16.875, 39.751] | 8.917 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-20-on.json) |
| oneOf-20 | ON | BF | -1.417 [-6.333, 4.000] | 1.417 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-20-on.json) |
| oneOf-20 | ON | 초회 | -0.417 [-4.583, 2.917] | 0.417 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-20-on.json) |
| oneOf-20 | ON | 후속 | 0.167 [-2.167, 2.167] | 0.167 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-20-on.json) |
| oneOf-40 | OFF | 마운트 | -5.083 [-14.667, 8.584] | 5.083 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-40-off.json) |
| oneOf-40 | OFF | BF | 15.541 [-6.541, 36.708] | 15.541 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-40-off.json) |
| oneOf-40 | OFF | 초회 | 12.000 [-5.584, 26.292] | 12.000 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-40-off.json) |
| oneOf-40 | OFF | 후속 | 0.833 [-4.167, 5.250] | 0.833 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-40-off.json) |
| oneOf-40 | OFF | 고정 축 BF | 1.250 [-21.084, 17.001] | 1.250 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-40-off.json) |
| oneOf-40 | OFF | 고정 축 초회 | 1.791 [-17.417, 16.334] | 1.791 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-40-off.json) |
| oneOf-40 | OFF | 고정 축 후속 | 4.417 [-4.750, 12.542] | 4.417 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-40-off.json) |
| oneOf-40 | ON | 마운트 | -19.083 [-43.167, 6.250] | 19.083 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-40-on.json) |
| oneOf-40 | ON | BF | -5.083 [-14.334, 4.124] | 5.083 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-40-on.json) |
| oneOf-40 | ON | 초회 | -6.542 [-12.791, 0.959] | 6.542 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-40-on.json) |
| oneOf-40 | ON | 후속 | -0.875 [-5.167, 3.166] | 0.875 | [통계·raw 경로](profile-117-session/analysis-C-oneOf-40-on.json) |
| if-then | OFF | 마운트 | -0.208 [-3.291, 2.125] | 0.208 | [통계·raw 경로](profile-117-session/analysis-C-if-then-off.json) |
| if-then | OFF | BF | -0.209 [-1.500, 1.125] | 0.209 | [통계·raw 경로](profile-117-session/analysis-C-if-then-off.json) |
| if-then | OFF | 초회 | -0.374 [-1.416, 0.666] | 0.374 | [통계·raw 경로](profile-117-session/analysis-C-if-then-off.json) |
| if-then | OFF | 후속 | -0.082 [-0.499, 0.458] | 0.082 | [통계·raw 경로](profile-117-session/analysis-C-if-then-off.json) |
| if-then | ON | 마운트 | 5.084 [-13.458, 25.292] | 5.084 | [통계·raw 경로](profile-117-session/analysis-C-if-then-on.json) |
| if-then | ON | BF | 0.123 [-1.626, 2.167] | 0.123 | [통계·raw 경로](profile-117-session/analysis-C-if-then-on.json) |
| if-then | ON | 초회 | 0.041 [-1.500, 1.208] | 0.041 | [통계·raw 경로](profile-117-session/analysis-C-if-then-on.json) |
| if-then | ON | 후속 | 0.042 [-0.541, 0.500] | 0.042 | [통계·raw 경로](profile-117-session/analysis-C-if-then-on.json) |

C의 시간 검증 (가)는 sample-0·1·2와 flat-50의 마운트에서 완전히 충족되지 않았습니다. 아래 통합 검증 표에 실패를 그대로 기록했으며, 경계가 0이라는 사실로 시간 실패를 통과로 바꾸지 않았습니다.

## (D) branch change 1의 9회 판정

HEAD 번들 branch1-head.cjs와 working 번들 branch1-working.cjs를 같은 104개 고유 행에서 9회 대조했습니다. 양수 대응 차이는 working이 빠르다는 뜻이며, 표의 중앙값은 버전별 중앙값을 뺀 값이 아니라 909개 표본별 HEAD−working 차이의 중앙값입니다. 모든 행의 99% 구간과 A/A 바닥을 아래에 제시했습니다.

회귀는 99% 구간 전체가 0 아래이고, 대응 차이 중앙값 절댓값이 max(같은 행 A/A 중앙값 절댓값, HEAD 중앙값의 0.5%)보다 클 때입니다. 유의한 이득은 구간 전체가 0 위이고 대응 차이 중앙값이 같은 행 A/A 크기보다 클 때로 계산했습니다. 유의한 이득은 45행이며, 그중 고정 분기 축은 12행입니다.

현재 판정은 **REJECT**입니다. 105C-01의 최소 크기를 넘는 회귀가 4행에서 관측되었습니다. 분기 기울기 감소만으로 채택할 수 없습니다. 회귀 4행의 기준값은 다음과 같습니다.


| fixture | 검증 | 모드 | HEAD µs | 대응 중앙값 [99%] µs | \|A/A\| µs | 0.5% µs | 최소 크기 µs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| flat-500 | OFF | 초회 | 145.083 | -1.083 [-2.583, -0.001] | 0.416 | 0.725 | 0.725 |
| if-then | OFF | 마운트 | 542.209 | -5.292 [-8.167, -2.500] | 0.208 | 2.711 | 2.711 |
| if-then | ON | BF | 296.583 | -2.292 [-4.751, -0.458] | 0.123 | 1.483 | 1.483 |
| if-then | ON | 초회 | 207.125 | -1.458 [-3.166, -0.042] | 0.041 | 1.036 | 1.036 |

분기 기울기는 OFF 고정 축 kind_0→kind_4→kind_0의 5·10·20·40분기 pooled 중앙값에 절편을 포함한 최소제곱 직선을 맞춰 구했습니다. BF는 두 쓰기의 합계이고 초회는 첫 kind_4 쓰기, 후속은 왕복 뒤 다시 kind_4로 바꾸는 한 쓰기입니다. 단위는 µs/분기입니다.


| 모드 | HEAD 기울기 µs/분기 | working 기울기 µs/분기 | 감소 % |
| --- | --- | --- | --- |
| 고정 축 BF | 47.443 | 38.168 | 19.55 |
| 고정 축 초회 | 31.920 | 25.461 | 20.23 |
| 고정 축 후속 | 15.400 | 12.289 | 20.20 |


| 모드 | 분기 수 | HEAD 중앙값 µs | working 중앙값 µs |
| --- | --- | --- | --- |
| 고정 축 BF | 5 | 683.251 | 640.458 |
| 고정 축 BF | 10 | 917.583 | 824.459 |
| 고정 축 BF | 20 | 1415.626 | 1234.625 |
| 고정 축 BF | 40 | 2341.333 | 1972.251 |
| 고정 축 초회 | 5 | 403.583 | 384.000 |
| 고정 축 초회 | 10 | 571.584 | 515.459 |
| 고정 축 초회 | 20 | 900.625 | 784.708 |
| 고정 축 초회 | 40 | 1523.167 | 1275.750 |
| 고정 축 후속 | 5 | 258.250 | 247.292 |
| 고정 축 후속 | 10 | 328.708 | 300.334 |
| 고정 축 후속 | 20 | 493.041 | 437.667 |
| 고정 축 후속 | 40 | 794.334 | 673.583 |

아래의 최소 크기 미만 음수 행은 회귀로 계산하지 않았습니다. 구간이 0을 포함하는 행도 회귀로 계산하지 않았습니다. 분기 기울기 감소가 관측되어도 다른 행의 회귀를 상쇄하지 않았습니다.


| fixture | 검증 | 모드 | HEAD µs | working µs | 대응 중앙값 [99%] µs | \|A/A\| µs | 회귀 최소 µs | 행별 결과 | 행별 자료 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| sample-0 | OFF | 마운트 | 210.167 | 210.917 | -0.500 [-1.417, 0.334] | 0.666 | 1.051 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-0-off.json) |
| sample-0 | OFF | BF | 125.709 | 125.500 | 0.499 [-0.459, 1.458] | 0.167 | 0.629 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-0-off.json) |
| sample-0 | OFF | 초회 | 125.709 | 125.500 | 0.499 [-0.459, 1.458] | 0.167 | 0.629 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-0-off.json) |
| sample-0 | OFF | 후속 | 41.333 | 41.583 | -0.083 [-0.750, 0.416] | 0.083 | 0.207 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-0-off.json) |
| sample-1 | OFF | 마운트 | 263.375 | 263.542 | -0.083 [-1.374, 0.750] | 1.292 | 1.317 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-1-off.json) |
| sample-1 | OFF | BF | 136.875 | 136.292 | 0.166 [-1.166, 1.376] | 0.750 | 0.750 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-1-off.json) |
| sample-1 | OFF | 초회 | 136.875 | 136.292 | 0.166 [-1.166, 1.376] | 0.750 | 0.750 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-1-off.json) |
| sample-1 | OFF | 후속 | 46.125 | 46.292 | 0.042 [-0.583, 0.458] | 0.000 | 0.231 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-1-off.json) |
| sample-2 | OFF | 마운트 | 349.750 | 350.416 | 0.167 [-1.249, 1.791] | 0.583 | 1.749 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-2-off.json) |
| sample-2 | OFF | BF | 141.333 | 140.542 | 0.876 [-0.334, 2.042] | 0.042 | 0.707 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-2-off.json) |
| sample-2 | OFF | 초회 | 141.333 | 140.542 | 0.876 [-0.334, 2.042] | 0.042 | 0.707 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-2-off.json) |
| sample-2 | OFF | 후속 | 44.625 | 44.292 | 0.292 [-0.167, 0.750] | 0.292 | 0.292 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-2-off.json) |
| sample-3 | OFF | 마운트 | 753.584 | 752.708 | 2.457 [-0.125, 4.708] | 0.499 | 3.768 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-3-off.json) |
| sample-3 | OFF | BF | 138.625 | 139.625 | -0.625 [-2.084, 0.542] | 0.583 | 0.693 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-3-off.json) |
| sample-3 | OFF | 초회 | 138.625 | 139.625 | -0.625 [-2.084, 0.542] | 0.583 | 0.693 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-3-off.json) |
| sample-3 | OFF | 후속 | 45.666 | 45.625 | 0.084 [-0.292, 0.625] | 0.083 | 0.228 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-sample-3-off.json) |
| flat-50 | OFF | 마운트 | 415.041 | 415.333 | -0.750 [-2.542, 0.957] | 0.833 | 2.075 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-flat-50-off.json) |
| flat-50 | OFF | BF | 300.668 | 299.834 | 1.749 [-1.415, 4.081] | 0.332 | 1.503 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-flat-50-off.json) |
| flat-50 | OFF | 초회 | 124.792 | 124.083 | 1.166 [0.292, 2.416] | 0.208 | 0.624 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-flat-50-off.json) |
| flat-50 | OFF | 후속 | 15.500 | 15.416 | -0.083 [-0.250, 0.084] | 0.083 | 0.083 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-flat-50-off.json) |
| flat-100 | OFF | 마운트 | 617.708 | 619.541 | -1.208 [-2.832, 0.333] | 0.458 | 3.089 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-flat-100-off.json) |
| flat-100 | OFF | BF | 302.208 | 301.124 | 0.125 [-2.207, 2.374] | 0.123 | 1.511 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-flat-100-off.json) |
| flat-100 | OFF | 초회 | 127.458 | 126.084 | 0.541 [-0.625, 1.749] | 0.417 | 0.637 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-flat-100-off.json) |
| flat-100 | OFF | 후속 | 15.542 | 15.625 | 0.000 [-0.208, 0.250] | 0.042 | 0.078 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-flat-100-off.json) |
| flat-500 | OFF | 마운트 | 2299.667 | 2301.375 | -4.459 [-15.000, 7.209] | 2.625 | 11.498 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-flat-500-off.json) |
| flat-500 | OFF | BF | 335.084 | 337.498 | -1.503 [-4.206, 1.206] | 0.542 | 1.675 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-flat-500-off.json) |
| flat-500 | OFF | 초회 | 145.083 | 145.958 | -1.083 [-2.583, -0.001] | 0.416 | 0.725 | 회귀입니다. | [통계·raw 경로](profile-117-session/analysis-D-flat-500-off.json) |
| flat-500 | OFF | 후속 | 17.083 | 17.125 | 0.000 [-0.250, 0.209] | 0.126 | 0.126 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-flat-500-off.json) |
| nested-d3-f4 | OFF | 마운트 | 581.542 | 580.584 | -1.041 [-2.958, 1.583] | 0.083 | 2.908 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-nested-d3-f4-off.json) |
| nested-d3-f4 | OFF | BF | 380.833 | 380.626 | -0.790 [-3.000, 1.584] | 0.543 | 1.904 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-nested-d3-f4-off.json) |
| nested-d3-f4 | OFF | 초회 | 138.500 | 137.792 | 0.625 [-0.459, 1.750] | 0.500 | 0.693 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-nested-d3-f4-off.json) |
| nested-d3-f4 | OFF | 후속 | 22.583 | 22.625 | 0.000 [-0.208, 0.167] | 0.041 | 0.113 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-nested-d3-f4-off.json) |
| nested-d5-f4 | OFF | 마운트 | 6036.083 | 6029.250 | 2.459 [-21.125, 30.166] | 5.667 | 30.180 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-nested-d5-f4-off.json) |
| nested-d5-f4 | OFF | BF | 510.998 | 512.249 | -1.002 [-3.752, 2.376] | 0.917 | 2.555 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-nested-d5-f4-off.json) |
| nested-d5-f4 | OFF | 초회 | 179.250 | 179.083 | 0.251 [-1.416, 1.832] | 1.041 | 1.041 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-nested-d5-f4-off.json) |
| nested-d5-f4 | OFF | 후속 | 31.917 | 32.083 | -0.124 [-0.292, 0.126] | 0.042 | 0.160 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-nested-d5-f4-off.json) |
| array-100 | OFF | 마운트 | 1080.500 | 1081.583 | -2.125 [-4.459, 0.126] | 1.250 | 5.402 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-array-100-off.json) |
| array-100 | OFF | BF | 155.875 | 156.958 | 0.166 [-1.374, 1.792] | 0.834 | 0.834 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-array-100-off.json) |
| array-100 | OFF | 초회 | 155.875 | 156.958 | 0.166 [-1.374, 1.792] | 0.834 | 0.834 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-array-100-off.json) |
| array-100 | OFF | 후속 | 50.125 | 50.000 | 0.208 [-0.209, 0.626] | 0.125 | 0.251 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-array-100-off.json) |
| array-500 | OFF | 마운트 | 3879.750 | 3892.666 | -21.541 [-84.624, 50.625] | 2.750 | 19.399 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-array-500-off.json) |
| array-500 | OFF | BF | 165.417 | 164.292 | 2.751 [-0.291, 5.333] | 1.459 | 1.459 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-array-500-off.json) |
| array-500 | OFF | 초회 | 165.417 | 164.292 | 2.751 [-0.291, 5.333] | 1.459 | 1.459 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-array-500-off.json) |
| array-500 | OFF | 후속 | 53.584 | 53.750 | -0.167 [-0.667, 0.417] | 0.208 | 0.268 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-array-500-off.json) |
| array-1000 | OFF | 마운트 | 6857.584 | 6873.250 | 72.000 [-162.541, 236.667] | 19.999 | 34.288 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-array-1000-off.json) |
| array-1000 | OFF | BF | 178.625 | 177.458 | 3.291 [-2.917, 10.126] | 0.250 | 0.893 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-array-1000-off.json) |
| array-1000 | OFF | 초회 | 178.625 | 177.458 | 3.291 [-2.917, 10.126] | 0.250 | 0.893 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-array-1000-off.json) |
| array-1000 | OFF | 후속 | 60.125 | 60.458 | 0.416 [-0.916, 1.833] | 0.125 | 0.301 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-array-1000-off.json) |
| computed-visible-derived | OFF | 마운트 | 663.041 | 663.750 | -1.625 [-4.291, 2.125] | 1.042 | 3.315 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-computed-visible-derived-off.json) |
| computed-visible-derived | OFF | BF | 285.417 | 285.250 | 0.792 [-2.083, 2.999] | 0.209 | 1.427 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-computed-visible-derived-off.json) |
| computed-visible-derived | OFF | 초회 | 139.125 | 138.708 | -0.125 [-1.333, 1.667] | 0.374 | 0.696 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-computed-visible-derived-off.json) |
| computed-visible-derived | OFF | 후속 | 70.834 | 71.209 | -0.084 [-0.791, 0.541] | 0.084 | 0.354 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-computed-visible-derived-off.json) |
| oneOf-5 | OFF | 마운트 | 1205.625 | 1150.583 | 54.626 [50.833, 59.791] | 0.625 | 6.028 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-5-off.json) |
| oneOf-5 | OFF | BF | 988.958 | 951.333 | 39.292 [33.958, 44.541] | 4.000 | 4.945 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-5-off.json) |
| oneOf-5 | OFF | 초회 | 629.084 | 610.417 | 20.167 [16.791, 23.583] | 2.041 | 3.145 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-5-off.json) |
| oneOf-5 | OFF | 후속 | 267.125 | 256.834 | 10.416 [9.333, 11.500] | 0.041 | 1.336 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-5-off.json) |
| oneOf-5 | OFF | 고정 축 BF | 683.251 | 640.458 | 43.000 [41.124, 45.209] | 0.666 | 3.416 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-5-off.json) |
| oneOf-5 | OFF | 고정 축 초회 | 403.583 | 384.000 | 21.666 [20.667, 23.042] | 0.209 | 2.018 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-5-off.json) |
| oneOf-5 | OFF | 고정 축 후속 | 258.250 | 247.292 | 9.792 [8.792, 10.834] | 0.042 | 1.291 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-5-off.json) |
| oneOf-5 | ON | 마운트 | 9424.334 | 9381.708 | 56.209 [34.292, 85.333] | 4.292 | 47.122 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-5-on.json) |
| oneOf-5 | ON | BF | 1162.791 | 1111.708 | 47.334 [43.832, 51.124] | 0.042 | 5.814 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-5-on.json) |
| oneOf-5 | ON | 초회 | 766.375 | 738.917 | 25.625 [22.916, 28.750] | 0.250 | 3.832 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-5-on.json) |
| oneOf-5 | ON | 후속 | 295.875 | 286.125 | 9.667 [8.750, 10.916] | 0.124 | 1.479 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-5-on.json) |
| oneOf-10 | OFF | 마운트 | 1558.542 | 1464.750 | 100.208 [92.959, 105.125] | 1.875 | 7.793 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-10-off.json) |
| oneOf-10 | OFF | BF | 1179.667 | 1112.625 | 65.792 [61.666, 72.541] | 1.750 | 5.898 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-10-off.json) |
| oneOf-10 | OFF | 초회 | 750.959 | 719.291 | 30.709 [28.125, 35.458] | 0.333 | 3.755 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-10-off.json) |
| oneOf-10 | OFF | 후속 | 324.875 | 313.000 | 13.541 [12.458, 14.291] | 0.417 | 1.624 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-10-off.json) |
| oneOf-10 | OFF | 고정 축 BF | 917.583 | 824.459 | 95.459 [92.833, 97.208] | 0.332 | 4.588 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-10-off.json) |
| oneOf-10 | OFF | 고정 축 초회 | 571.584 | 515.459 | 57.542 [55.583, 59.751] | 0.875 | 2.858 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-10-off.json) |
| oneOf-10 | OFF | 고정 축 후속 | 328.708 | 300.334 | 28.375 [27.334, 29.209] | 0.208 | 1.644 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-10-off.json) |
| oneOf-10 | ON | 마운트 | 10480.375 | 10377.167 | 107.291 [84.834, 133.416] | 13.584 | 52.402 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-10-on.json) |
| oneOf-10 | ON | BF | 1386.709 | 1312.833 | 76.666 [71.667, 81.417] | 2.001 | 6.934 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-10-on.json) |
| oneOf-10 | ON | 초회 | 911.042 | 875.750 | 37.041 [34.333, 40.209] | 1.708 | 4.555 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-10-on.json) |
| oneOf-10 | ON | 후속 | 366.667 | 351.083 | 15.333 [14.541, 16.375] | 0.333 | 1.833 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-10-on.json) |
| oneOf-20 | OFF | 마운트 | 2334.542 | 2134.625 | 199.250 [187.167, 209.916] | 4.292 | 11.673 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-20-off.json) |
| oneOf-20 | OFF | BF | 1618.917 | 1520.250 | 107.292 [94.957, 120.084] | 2.376 | 8.095 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-20-off.json) |
| oneOf-20 | OFF | 초회 | 1029.917 | 990.000 | 42.292 [31.291, 49.833] | 1.250 | 5.150 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-20-off.json) |
| oneOf-20 | OFF | 후속 | 469.000 | 447.334 | 21.375 [19.791, 22.958] | 0.166 | 2.345 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-20-off.json) |
| oneOf-20 | OFF | 고정 축 BF | 1415.626 | 1234.625 | 181.834 [174.583, 187.250] | 1.502 | 7.078 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-20-off.json) |
| oneOf-20 | OFF | 고정 축 초회 | 900.625 | 784.708 | 116.417 [111.417, 121.125] | 0.666 | 4.503 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-20-off.json) |
| oneOf-20 | OFF | 고정 축 후속 | 493.041 | 437.667 | 55.459 [53.000, 57.875] | 1.125 | 2.465 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-20-off.json) |
| oneOf-20 | ON | 마운트 | 13056.416 | 12862.500 | 190.458 [146.250, 219.833] | 8.917 | 65.282 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-20-on.json) |
| oneOf-20 | ON | BF | 1899.249 | 1757.792 | 138.458 [131.250, 143.208] | 1.417 | 9.496 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-20-on.json) |
| oneOf-20 | ON | 초회 | 1235.916 | 1169.875 | 64.208 [59.292, 68.459] | 0.417 | 6.180 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-20-on.json) |
| oneOf-20 | ON | 후속 | 526.292 | 501.250 | 24.708 [23.124, 26.417] | 0.167 | 2.631 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-20-on.json) |
| oneOf-40 | OFF | 마운트 | 3771.292 | 3457.917 | 316.000 [305.458, 328.916] | 5.083 | 18.856 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-40-off.json) |
| oneOf-40 | OFF | BF | 2527.583 | 2305.833 | 228.791 [207.667, 249.666] | 15.541 | 15.541 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-40-off.json) |
| oneOf-40 | OFF | 초회 | 1605.541 | 1515.834 | 88.375 [71.416, 103.416] | 12.000 | 12.000 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-40-off.json) |
| oneOf-40 | OFF | 후속 | 749.083 | 707.541 | 41.125 [38.291, 43.375] | 0.833 | 3.745 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-40-off.json) |
| oneOf-40 | OFF | 고정 축 BF | 2341.333 | 1972.251 | 378.583 [366.626, 389.250] | 1.250 | 11.707 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-40-off.json) |
| oneOf-40 | OFF | 고정 축 초회 | 1523.167 | 1275.750 | 250.750 [243.209, 259.791] | 1.791 | 7.616 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-40-off.json) |
| oneOf-40 | OFF | 고정 축 후속 | 794.334 | 673.583 | 121.541 [117.167, 124.917] | 4.417 | 4.417 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-40-off.json) |
| oneOf-40 | ON | 마운트 | 18473.875 | 18120.834 | 347.584 [324.750, 378.875] | 19.083 | 92.369 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-40-on.json) |
| oneOf-40 | ON | BF | 2881.875 | 2628.209 | 254.708 [245.750, 264.792] | 5.083 | 14.409 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-40-on.json) |
| oneOf-40 | ON | 초회 | 1858.584 | 1756.291 | 100.541 [95.542, 108.583] | 6.542 | 9.293 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-40-on.json) |
| oneOf-40 | ON | 후속 | 836.958 | 784.583 | 52.583 [48.417, 55.541] | 0.875 | 4.185 | 이득입니다. | [통계·raw 경로](profile-117-session/analysis-D-oneOf-40-on.json) |
| if-then | OFF | 마운트 | 542.209 | 547.834 | -5.292 [-8.167, -2.500] | 0.208 | 2.711 | 회귀입니다. | [통계·raw 경로](profile-117-session/analysis-D-if-then-off.json) |
| if-then | OFF | BF | 148.166 | 149.208 | -0.374 [-1.917, 1.250] | 0.209 | 0.741 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-if-then-off.json) |
| if-then | OFF | 초회 | 99.083 | 99.416 | -0.374 [-1.292, 0.792] | 0.374 | 0.495 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-if-then-off.json) |
| if-then | OFF | 후속 | 38.750 | 38.916 | -0.083 [-0.500, 0.417] | 0.082 | 0.194 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-if-then-off.json) |
| if-then | ON | 마운트 | 8382.625 | 8389.541 | -13.833 [-37.125, 12.501] | 5.084 | 41.913 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-if-then-on.json) |
| if-then | ON | BF | 296.583 | 298.333 | -2.292 [-4.751, -0.458] | 0.123 | 1.483 | 회귀입니다. | [통계·raw 경로](profile-117-session/analysis-D-if-then-on.json) |
| if-then | ON | 초회 | 207.125 | 208.500 | -1.458 [-3.166, -0.042] | 0.041 | 1.036 | 회귀입니다. | [통계·raw 경로](profile-117-session/analysis-D-if-then-on.json) |
| if-then | ON | 후속 | 72.583 | 72.917 | -0.208 [-0.792, 0.333] | 0.042 | 0.363 | 회귀가 아닙니다. | [통계·raw 경로](profile-117-session/analysis-D-if-then-on.json) |

성능 회귀만으로 이미 REJECT이며, 독립 종단 검증 (가)에도 미충족 행이 남아 있습니다. 이 세션을 모든 행이 검증된 공식 통과 표로 표시하지 않습니다. branch change 1의 판정과 stage 07 전체 수용은 별개이며, 기존 성능 수용 표시나 목표를 수정하지 않았습니다.

## 종단 검증과 원자료 확인

C·D의 새 엔진 경계에서는 모든 진단 호출의 예약·실행·pending·후속 작업이 0이었습니다. 아래 실패는 독립된 짝 빈 꼬리 보정 시간 조건의 실패입니다. 회차 목록이 비어 있어도 pooled 조건을 넘으면 실패로 남겼습니다. 차이와 잡음의 단위는 µs입니다.


| 단계 | fixture | 검증 | 모드 | 버전 | pooled 차이/잡음 µs | 미충족 회차 | pooled 시간 조건 | 경계 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C | sample-0 | OFF | 마운트 | head | -7.542/3.998 | 1, 5, 9 | 미충족입니다. | 0회입니다. |
| C | sample-0 | OFF | 마운트 | working | -7.583/4.040 | 6, 9 | 미충족입니다. | 0회입니다. |
| C | sample-1 | OFF | 마운트 | head | -7.292/4.873 | 없습니다. | 미충족입니다. | 0회입니다. |
| C | sample-1 | OFF | 마운트 | working | -7.375/4.914 | 없습니다. | 미충족입니다. | 0회입니다. |
| C | sample-2 | OFF | 마운트 | head | -5.167/5.082 | 없습니다. | 미충족입니다. | 0회입니다. |
| C | sample-2 | OFF | 마운트 | working | -5.083/4.499 | 없습니다. | 미충족입니다. | 0회입니다. |
| C | flat-50 | OFF | 마운트 | head | -5.916/5.248 | 없습니다. | 미충족입니다. | 0회입니다. |
| C | flat-50 | OFF | 마운트 | working | -6.001/4.956 | 없습니다. | 미충족입니다. | 0회입니다. |
| D | sample-0 | OFF | 마운트 | head | -7.625/3.417 | 1, 2, 7, 9 | 미충족입니다. | 0회입니다. |
| D | sample-0 | OFF | 마운트 | working | -7.626/3.583 | 1, 2, 4, 7, 9 | 미충족입니다. | 0회입니다. |
| D | sample-1 | OFF | 마운트 | head | -7.416/4.375 | 없습니다. | 미충족입니다. | 0회입니다. |
| D | sample-1 | OFF | 마운트 | working | -7.458/4.709 | 없습니다. | 미충족입니다. | 0회입니다. |
| D | sample-2 | OFF | 마운트 | head | -5.125/4.459 | 없습니다. | 미충족입니다. | 0회입니다. |
| D | sample-2 | OFF | 마운트 | working | -5.375/5.000 | 없습니다. | 미충족입니다. | 0회입니다. |
| D | flat-50 | OFF | 마운트 | head | -6.250/5.835 | 없습니다. | 미충족입니다. | 0회입니다. |

각 미충족 회차의 차이와 잡음은 [판정 JSON](profile-117-session/verdict.json)의 endpointFailures와 각 행 analysis 파일에서 확인할 수 있습니다. 빈 호출 C/M과 경로별 bootstrap은 [A 보정](profile-117-session/calibration-A.json), [B 보정](profile-117-session/calibration-B.json), [C 보정](profile-117-session/calibration-C.json), [D 보정](profile-117-session/calibration-D.json)에 있습니다.

산출물 검증은 [측정 자료 검증](profile-117-session/audit-measurements.json)에 기록했습니다. 208개 C·D 행의 pooled 대응 중앙값과 같은 호출의 종단 차이를 원시 열에서 다시 계산했고, 분기 축 12행·회귀 4행의 99% 구간은 quickselect 중앙값으로 독립 재계산했습니다. 기울기 여섯 값도 별도의 합계식으로 대조했습니다. React 분해 산술, 세 회차 표본 수, 자연 종료, 순차 실행 구간과 5MB 파일 상한을 확인했습니다.

원자료의 직접 링크는 [전체 raw evidence 목록](profile-117-session/raw-evidence.md)에 있습니다. 측정과 분석 스크립트, 지정 규칙의 git ref·SHA-256, 입력 파일의 SHA-256은 [재현 자료와 source 기록](profile-117-session/report-sources.json)에 있습니다. source 보존과 보고서 링크의 최종 검증은 [소스 최종 검증](profile-117-session/audit-final.json), [보고서 검증](profile-117-session/audit-report.json)에 있습니다.
