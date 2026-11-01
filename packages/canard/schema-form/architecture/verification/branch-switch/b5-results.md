# B5 — 설계 Ⅱ 이정표 단계 전체 재측정

B6과 B7을 병합한 설계 Ⅱ의 마감 상태를 공개 0.16.1 및 단계 시작과 같은 단일 창에서 비교했습니다. 제품·시험·기존 시간 루프는 바꾸지 않았습니다. 단일 창의 품질은 통과(0.16.1 앞5/뒤5 비 중앙 1.007674944)입니다. 관문별 원판정은 아래와 같으며 채택 여부는 코디네이터께서 정하십니다.

## 입력·프로토콜

- L은 설치된 공개 `@canard/schema-form@0.16.1`입니다. 배포 manifest에는 gitHead가 없어 커밋 SHA를 추정하지 않고 버전과 아래 번들 SHA-256으로 식별합니다.
- S는 `0eb03ff3bb54bf06af95271d157aefece1b9bf32`이며 B0 원장 단계 시작입니다. E는 `ad0be79baa89b32f89fbc4549549620fa5b2ab29`이며 B7 #484 병합 머리입니다.
- 각 레인은 빌드된 불변 번들 사본으로 실행하고 창 전후 SHA-256을 대조합니다. S의 공개 번들은 B3와 바이트·해시가 같으며 E는 B7 최종 후보와 같습니다. AJV8 플러그인의 지정 dist 빌드와 S/E 각 44동작 및 L 36동작의 무시간 적재 검사를 통과했습니다. L 검사는 S/E 준비에서 각각 36동작씩 확인했습니다.
- B3의 교대 장치를 그대로 사용하여 각 행에서 S0/E0…S9/E9 새 프로세스를 실행합니다. 주표는 L/S/E 각 10프로세스입니다. 장치가 함께 만드는 E 역할의 L 10개는 보조로 보존하고, S 역할의 L 10개만 주표·품질에 사용합니다.
- 22행, 역할별 10프로세스, 20예열·100표본, `--quality=legacy`를 고정합니다. 총합 대표값은 프로세스 최소값 10개의 중앙값이며, 폭은 프로세스별 100표본 중앙값 10개의 최소~최대와 차이를 함께 기록합니다.
- 창 품질은 L 주표의 호환 18행에서 앞 5/뒤 5 프로세스 중앙값의 뒤/앞 비를 구한 뒤 행간 중앙값이 0.95–1.05인지 판정합니다. 품질 미달 시 비율 관문은 판정 불가로 남기며 정식 시작 뒤 재실행하지 않습니다.
- TEST-073은 전체 10/10 프로세스의 100표본을 처리율 1000/ms로 바꾸어 Welch 양측 검정으로 판정합니다. 처리율 감소 15% 초과와 p<0.05가 함께 성립할 때 회귀이며 앞 5·뒤 5를 보조로 병기합니다.
- 왕복은 2쓰기이며 형제·leaf·bulk·wave는 1쓰기, single은 10쓰기, mount는 1마운트입니다. L fixture 쌍이 없는 discriminator·if·구독 두 행은 쌍 없음으로 남깁니다. payload-12에는 실제 L 쌍이 있습니다.
- 단계 장부는 oneOf-80·payload-12·siblings-0·siblings-1000의 S/E 각 3프로세스, 총 24개입니다. 힙은 Node/Bun 각 S/E 7표본이며 Node는 단계 시작 중앙값을 상한으로, 기존 PR별 S 최댓값 기준도 함께 보고합니다. Bun은 보고 전용입니다.
- 보존량은 전환 9행의 120쓰기 후 슬롯 Map이 독점 보유한 V8 strong-edge dominator 바이트와 K·M 상한, 읽기 전후 및 reset 후 상태를 기록합니다. 공유 청사진과 외부 보유 detached 노드는 제외하고 중첩 Map 바이트를 합산하지 않습니다.

### 불변 번들 SHA-256

| 레인 | 파일           | 바이트 | SHA-256                                                            |
| ---- | -------------- | -----: | ------------------------------------------------------------------ |
| L    | index.mjs      | 260013 | `5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46` |
| S    | index.node.mjs | 750076 | `59932cf4b9b12e52ce2610d3c4c1ad212705c1a714265234fbf24c753c55841b` |
| S    | index.mjs      | 750818 | `0896a2b1fd02d558836f2df78b80976df38e0d3552202c686484ad6be4dbafb6` |
| S    | index.cjs      | 769065 | `f3056727e71c551f8bdf03a279e2ccfcfbff0dcfab0579e3316b1bfc96f564c8` |
| S    | index.d.ts     |   3054 | `740dc55ca2f4f0503da3a7d6f968797a37cce7305e6d0d6b4d57c34e2b9158d6` |
| E    | index.node.mjs | 814210 | `e02f52140198c010bf3f3bedeeb7abb341704bafeabf026167d5cee22c761531` |
| E    | index.mjs      | 814952 | `bf83e2beb934a400083c785272ae6c4161126e43182d0db0606b27676adcb040` |
| E    | index.cjs      | 832016 | `e0d6893a1eb66db9ba2e4b22af2c11e7450508da1f5ebdc154de0cc264ff7134` |
| E    | index.d.ts     |   3054 | `740dc55ca2f4f0503da3a7d6f968797a37cce7305e6d0d6b4d57c34e2b9158d6` |

입력과 계측 번들 해시는 [입력](raw/b5/inputs.json)과 [단계 해시](raw/b5/stage-hashes-before.json)에 보존했습니다. [준비 검증](raw/b5/preparation.json)과 [무시간 적재](raw/b5/preflight.json)는 정식 성능 표본이 아닙니다.

## 관문 — 창 전에 고정합니다

| 관문 | 고정 판정선 | 판정 | 측정 근거 |
| --- | --- | --- | --- |
| 446C-06 oneOf-80 | E 왕복 ≤ L×1.5이며 <1 ms입니다. | FAIL | 왕복 343.875 µs, 0.16.1의 4.375배이며 1 ms 미만입니다. 상한은 1.5배·1 ms입니다. |
| discriminator-80 | 같은 형상 oneOf-80의 L을 기준으로 ≤1.5배이며 <1 ms입니다. 직접 L 쌍은 없습니다. | FAIL | 왕복 231.667 µs로, 같은 형상 oneOf-80의 L 78.604 µs 대비 2.947배입니다. 1 ms 미만이지만 1.5배를 넘습니다. 직접 L 쌍은 없습니다. |
| if-80 | 같은 형상 active 왕복 + 게이트당 guard 호출 1회 비용 이내입니다. 왕복은 160 guard입니다. 직접 L 쌍은 없습니다. | FAIL | 왕복 373.521 µs, active+160 guard 상한 348.502 µs입니다. guard는 0.028918 µs/호출입니다. 직접 L 쌍은 없습니다. |
| TEST-093 형제 1000/0 | E siblings-1000 ≤ 3 × E siblings-0입니다. | FAIL | 19.454배입니다. 창 전에 고정한 상한은 3배입니다. |
| 다른 canonical 행 TEST-073 | B3와 같은 제외 목록을 적용한 전체 10/10 주판정 회귀가 0건입니다. | PASS | 전체 10/10 주판정 회귀는 0건입니다. |
| Node 노드당 힙 | E 중앙값 ≤ S 중앙값입니다. PR별 E 중앙값 ≤ S 최대도 별도 보고합니다. | FAIL | S 중앙 1439.098 B/node, E 중앙 1439.346 B/node입니다. E 중앙은 S 최대 1889.510 B/node 이하입니다. Bun은 아래 보고입니다. |

위 여섯 관문은 B3와 같은 선이며 형제 상한 3배를 이번 창 전에 다시 고정했습니다. 제거 경로 장부의 E `setLatentRaw`·`captureExitedRaw`·`updateInactiveValuesMemo` 최대 호출 0도 B3처럼 별도 확인합니다. TEST-073의 다른 행 주판정에서는 oneOf-80·discriminator-80·if-80·siblings-1000을 제외하되 전체 22행 원판정과 반창을 함께 공개합니다. 총합 행으로 관문을 판정하며 계측 단계의 절대 시간을 배포 번들과 직접 비교하지 않습니다. 품질이 0.95–1.05 안이므로 비율 관문을 판정 불가로 바꾸지 않았습니다.

| 보조 확인 | 판정 | 근거 |
| --- | --- | --- |
| 제거 경로 최대 호출 0 | PASS | E의 setLatentRaw·captureExitedRaw·updateInactiveValuesMemo 최대 호출은 0입니다. |

## 창 환경·품질

측정 도구 window.mjs를 코디네이터가 dist 복사 뒤 chmod 644를 넣도록 정정했습니다. 그 다음 정정의 SHA-256은 `33ea25071f63da61a77a26d2d948748de17f1b5b26cb697d8c6308cd03f6fd9f`였습니다. 사전 점검에서 측정 담당 자신의 프로세스(cursor-agent)를 제외했습니다(코디네이터 결정). 해시 검증에서 바뀐 항목은 window.mjs 하나뿐이며, 현재 SHA-256은 `d1d7fea124e4fc98b65d8be7bcbfd7027b40408caa33c5c10e089bebb2b6e008`입니다. 공개 번들과 단계 번들 해시는 준비 기록과 같습니다.

중단된 창은 2026-10-28T11:04:33.874Z에 시작해 2026-10-28T11:13:15Z에 E 레인 dist 복사의 `EACCES`로 끝났습니다. 이 창은 환경 실패로 판정 불가이며, 요약은 `raw/b5/aborted-window/`에 두었습니다. 중단 표본은 아래 새 창의 판정에 합치지 않습니다.

이어 연 새 창의 측정 시점 체크아웃 HEAD는 `b978f85245f130c69476873c6dc895b90d4ea403`이고 제품 E는 `ad0be79baa89b32f89fbc4549549620fa5b2ab29`입니다. 교대·단계·힙 자식은 Node v26.11.1을 사용했고, React 벤치 프로세스가 보고한 Node는 v26.12.1입니다. Bun은 1.4.4입니다.

cursor-agent를 외부 부하로 센 사전 검사 12회는 거절되었습니다. 코디네이터 결정 이후의 13회째(2026-10-28T11:55:48.299Z)는 cursor-agent 7.59%를 제외했고, 그 밖의 최상위는 BetterTouchTool 6.42%, 외부 합계는 52.15%였습니다. 이 검사만 승인하고 정식 창을 한 번 열었습니다. formal-start 이후 재실행은 없습니다.

| 항목 | 값 |
| --- | --- |
| 정식 시작 UTC | 2026-10-28T11:55:58.718Z |
| 정식 종료 UTC | 2026-10-28T12:04:44.690Z |
| Node / Bun | v26.11.1 / 1.4.4 |
| CPU / 아키텍처 / OS | Apple M1 Max / arm64 / Darwin 27.0.0 |
| 조용한 창 승인 | 승인. quietSince 2026-10-28T11:55:58.717Z |
| CPU 사전 검사 시도 수 | 13회. 마지막 1회만 승인 |
| 프로세스별 CPU 최대 / 외부 합계 | BetterTouchTool 6.42% / 52.15%. cursor-agent 7.59%는 제외 |
| L 앞5/뒤5 비 중앙 / 품질 판정 | 1.007674944 / 통과 |
| 정식 창 수 / 재시도 수 | 1 / 0 |
| 브라우저 경합 여부 | 별도 브라우저 경합은 관측하지 않았습니다. |

사전 검사는 5초 관측에서 외부 프로세스 하나가 30%를 넘거나 기존 장치의 heavy 조건이 있을 때 거절합니다. 측정 담당 자신의 cursor-agent는 외부 부하에서 제외합니다. CPU 합계는 기록만 합니다. formal-start 생성 전 exit 3일 때만 사전 검사 원시를 보존하고 최소 2분 뒤 재검사하며, 30분이 지나면 코디네이터께 보고합니다.

| L 호환 행 | 앞5 중앙 ms | 뒤5 중앙 ms | 뒤/앞 비 |
| --- | ---: | ---: | ---: |
| single-flat-1000 | 0.677771 | 0.841979 | 1.242277 |
| mount-oneOf-80 | 0.427687 | 0.441855 | 1.033125 |
| mount-flat-1000 | 2.210021 | 2.234896 | 1.011256 |
| mount-nested-d6-f4 | 9.305020 | 9.272958 | 0.996554 |
| single-nested-d6-f4 | 0.063812 | 0.064105 | 1.004584 |
| switch-oneOf-80 | 0.116062 | 0.114917 | 0.990130 |
| bulk-flat-2000 | 1.677792 | 2.087125 | 1.243972 |
| bulk-nested-d6-f4 | 4.007021 | 3.955938 | 0.987252 |
| switch-nested-oneOf-20 | 0.082271 | 0.099771 | 1.212706 |
| switch-siblings-0 | 0.060479 | 0.051355 | 0.849129 |
| switch-siblings-100 | 0.264083 | 0.257500 | 0.975070 |
| switch-siblings-1000 | 2.802854 | 2.899916 | 1.034630 |
| switch-siblings-4000 | 8.889771 | 8.910625 | 1.002346 |
| leaf-gate-250 | 0.184708 | 0.189854 | 1.027860 |
| leaf-gate-1000 | 1.011291 | 1.057187 | 1.045383 |
| leaf-gate-4000 | 3.583792 | 3.622376 | 1.010766 |
| leaf-gate-8000 | 5.294521 | 5.310125 | 1.002947 |
| switch-payload-12 | 0.318479 | 0.296375 | 0.930595 |

## 세 레인 — 전체 22행

단위는 ms이며 셀은 최소값 중앙 / 프로세스 중앙값 최소~최대(폭)입니다.

| 행 | L 0.16.1 | S 단계 시작 | E 단계 종료 |
| --- | ---: | ---: | ---: |
| single-flat-1000 | 0.532562 / 0.567792~1.056895 (0.489103) | 0.071355 / 0.099730~0.161750 (0.062020) | 0.077666 / 0.101312~0.168500 (0.067188) |
| mount-oneOf-80 | 0.344520 / 0.417021~0.495979 (0.078958) | 2.044688 / 2.308604~2.520625 (0.212021) | 2.336646 / 2.658270~2.854646 (0.196375) |
| mount-flat-1000 | 2.092313 / 2.138687~2.261875 (0.123187) | 2.134563 / 2.323042~2.511021 (0.187978) | 2.127812 / 2.346105~2.473833 (0.127729) |
| mount-nested-d6-f4 | 6.538855 / 6.784250~9.596583 (2.812333) | 15.948875 / 16.727729~18.221687 (1.493958) | 16.231709 / 17.357500~18.106583 (0.749083) |
| single-nested-d6-f4 | 0.034583 / 0.057167~0.071520 (0.014353) | 0.179625 / 0.285230~0.326479 (0.041249) | 0.180542 / 0.264938~0.326834 (0.061895) |
| switch-oneOf-80 | 0.078604 / 0.092645~0.124250 (0.031604) | 0.499145 / 0.528541~0.702625 (0.174084) | 0.343875 / 0.368125~0.575667 (0.207542) |
| bulk-flat-2000 | 1.433646 / 1.608062~2.243063 (0.635000) | 1.844000 / 1.992166~2.249813 (0.257646) | 1.827146 / 1.971125~2.129833 (0.158708) |
| bulk-nested-d6-f4 | 3.481396 / 3.844750~4.031480 (0.186730) | 4.049270 / 4.729375~5.182146 (0.452771) | 4.038104 / 4.863688~5.342896 (0.479208) |
| switch-discriminator-80 | 쌍 없음 | 0.874084 / 1.003396~1.108062 (0.104666) | 0.231667 / 0.295209~0.349687 (0.054479) |
| switch-if-80 | 쌍 없음 | 1.190270 / 1.303167~1.434625 (0.131458) | 0.373521 / 0.434167~0.524125 (0.089958) |
| switch-nested-oneOf-20 | 0.053979 / 0.074709~0.107062 (0.032354) | 0.585187 / 0.672084~1.003604 (0.331521) | 0.525563 / 0.621000~0.819375 (0.198375) |
| switch-siblings-0 | 0.029750 / 0.033313~0.066167 (0.032854) | 0.099230 / 0.102041~0.208271 (0.106229) | 0.106729 / 0.114563~0.192083 (0.077520) |
| switch-siblings-100 | 0.135751 / 0.208500~0.302729 (0.094229) | 0.285604 / 0.365583~0.515625 (0.150042) | 0.277187 / 0.323875~0.478500 (0.154625) |
| switch-siblings-1000 | 2.490833 / 2.713605~3.139021 (0.425416) | 2.056062 / 2.262521~2.605104 (0.342583) | 2.076271 / 2.310542~2.623833 (0.313292) |
| switch-siblings-4000 | 8.684104 / 8.025271~9.079896 (1.054625) | 6.733187 / 7.088730~7.418500 (0.329770) | 6.677188 / 6.798104~7.209000 (0.410896) |
| leaf-gate-250 | 0.103417 / 0.125312~0.214938 (0.089625) | 0.034521 / 0.047625~0.082313 (0.034688) | 0.032958 / 0.045854~0.089312 (0.043458) |
| leaf-gate-1000 | 0.585000 / 0.662396~1.271688 (0.609292) | 0.035083 / 0.048834~0.085292 (0.036459) | 0.032146 / 0.048688~0.083979 (0.035291) |
| leaf-gate-4000 | 2.665146 / 3.014522~3.980875 (0.966353) | 0.804625 / 0.939334~1.201313 (0.261979) | 0.820230 / 0.940250~1.242021 (0.301771) |
| leaf-gate-8000 | 5.121020 / 5.254396~5.341125 (0.086729) | 1.562813 / 1.607042~1.644375 (0.037333) | 1.564417 / 1.611104~1.644937 (0.033833) |
| wave-1000 | 쌍 없음 | 1.652313 / 1.795167~1.983854 (0.188688) | 1.654521 / 1.772583~1.964000 (0.191417) |
| single-flat-1000-subscribed | 쌍 없음 | 0.086833 / 0.091542~0.125729 (0.034187) | 0.088000 / 0.117646~0.138334 (0.020688) |
| switch-payload-12 | 0.213771 / 0.240791~0.365292 (0.124501) | 0.890604 / 1.044125~1.562833 (0.518708) | 0.570166 / 0.601125~0.955291 (0.354166) |

## 분기 쓰기당 환산

| 행 | 쓰기 수 | L µs/write | S µs/write | E µs/write |
| --- | ---: | ---: | ---: | ---: |
| switch-oneOf-80 | 2 | 39.302 | 249.573 | 171.938 |
| switch-discriminator-80 | 2 | 쌍 없음 | 437.042 | 115.833 |
| switch-if-80 | 2 | 쌍 없음 | 595.135 | 186.761 |
| switch-nested-oneOf-20 | 2 | 26.990 | 292.594 | 262.782 |
| switch-siblings-0 | 1 | 29.750 | 99.230 | 106.729 |
| switch-siblings-100 | 1 | 135.751 | 285.604 | 277.187 |
| switch-siblings-1000 | 1 | 2490.833 | 2056.062 | 2076.271 |
| switch-siblings-4000 | 1 | 8684.104 | 6733.187 | 6677.188 |
| switch-payload-12 | 2 | 106.885 | 445.302 | 285.083 |

## 형제 선형항

0·100·1000·4000의 네 점에 대한 최소제곱 기울기와 절편을 보고합니다. L의 같은 비를 함께 남깁니다.

| 레인 | 1000/0 배 | 기울기 µs/1000형제 | 절편 µs |
| --- | ---: | ---: | ---: |
| L | 83.727 | 2168.144 | 70.726 |
| S | 20.720 | 1648.386 | 191.829 |
| E | 19.454 | 1633.365 | 201.803 |

## TEST-073

| 행 | 전체 Δ% / p | 앞5 Δ% / p | 뒤5 Δ% / p | 주판정 |
| --- | ---: | ---: | ---: | --- |
| single-flat-1000 | -0.047 / 0.978 | 7.188 / 0.0016 | -8.287 / 3.234e-4 | 선 안 |
| mount-oneOf-80 | -11.655 / 6.861e-145 | -13.105 / 8.406e-90 | -10.170 / 1.267e-58 | 선 안 |
| mount-flat-1000 | 1.817 / 0.0051 | 0.762 / 0.3885 | 2.901 / 0.0022 | 선 안 |
| mount-nested-d6-f4 | -2.079 / 2.082e-4 | -2.372 / 0.0023 | -1.786 / 0.0271 | 선 안 |
| single-nested-d6-f4 | 2.704 / 0.0687 | 2.796 / 0.1916 | 2.612 / 0.2052 | 선 안 |
| switch-oneOf-80 | 36.490 / 2.024e-113 | 44.094 / 5.218e-66 | 29.460 / 1.022e-48 | 선 안 |
| bulk-flat-2000 | 1.775 / 2.453e-6 | 1.460 / 0.0077 | 2.095 / 4.446e-5 | 선 안 |
| bulk-nested-d6-f4 | -1.554 / 0.0329 | -0.827 / 0.4085 | -2.281 / 0.0312 | 선 안 |
| switch-discriminator-80 | 233.681 / 0 | 235.959 / 2.013e-290 | 231.384 / 1.699e-293 | 선 안 |
| switch-if-80 | 191.938 / 0 | 185.981 / 0 | 197.780 / 8.564e-269 | 선 안 |
| switch-nested-oneOf-20 | 13.073 / 2.272e-27 | 10.151 / 1.331e-11 | 16.426 / 1.002e-18 | 선 안 |
| switch-siblings-0 | -6.721 / 1.818e-5 | -10.258 / 1.607e-6 | -3.121 / 0.174 | 선 안 |
| switch-siblings-100 | 1.783 / 0.1728 | 1.683 / 0.3272 | 1.875 / 0.3281 | 선 안 |
| switch-siblings-1000 | -1.327 / 0.0041 | -1.374 / 0.0344 | -1.280 / 0.0517 | 선 안 |
| switch-siblings-4000 | 3.164 / 1.911e-34 | 2.691 / 7.317e-13 | 3.638 / 1.477e-24 | 선 안 |
| leaf-gate-250 | 7.239 / 8.126e-4 | -0.719 / 0.81 | 15.254 / 8.725e-7 | 선 안 |
| leaf-gate-1000 | 5.162 / 0.0148 | -1.693 / 0.5421 | 12.849 / 6.795e-5 | 선 안 |
| leaf-gate-4000 | -0.863 / 0.2634 | -2.367 / 0.0353 | 0.682 / 0.518 | 선 안 |
| leaf-gate-8000 | 0.076 / 0.6893 | -0.048 / 0.8586 | 0.200 / 0.4529 | 선 안 |
| wave-1000 | -0.070 / 0.8571 | -0.638 / 0.2237 | 0.502 / 0.3791 | 선 안 |
| single-flat-1000-subscribed | -4.750 / 3.068e-6 | -1.824 / 0.181 | -7.463 / 5.153e-7 | 선 안 |
| switch-payload-12 | 55.469 / 7.782e-156 | 60.158 / 5.510e-90 | 50.886 / 1.425e-68 | 선 안 |

보조 반창의 앞5 회귀는 0건이고 뒤5 회귀도 0건입니다. 전체 10/10 주판정 회귀는 0건입니다. 보조 반창은 주판정을 대체하지 않습니다.

## 단계 장부와 호환 범위

코디네이터 승인에 따라 S에는 B3 외부 호환 builder를, E에는 현재 B6 builder를 그대로 사용하며 B3 시간 루프와 판정을 유지합니다. 두 builder의 공통 타이머 경계는 같은 이름으로 대응하고, 삭제된 literalStar 타이머 넷은 E에서 부재·0으로 기록합니다. B3와 같이 wrapped 총합은 각 표본의 self 합이며 오버헤드를 빼지 않습니다. 개별 단계 중앙값의 합과 총합 중앙값은 다릅니다.

S의 wheelPreparation은 B0 staticList부터 첫 cap 구간으로 연결합니다. B0 원장과 현재 S 자체 프로세스 중앙값 폭을 대조하여 폭 밖 매핑은 비교에서 제외하고, B0에 없는 siblings-1000은 대조 불가로 기록합니다. 단계 차이는 진단이며 총합 관문을 대체하지 않습니다.

| 행 | S wrapped / unwrapped µs | E wrapped / unwrapped µs |
| --- | ---: | ---: |
| switch-oneOf-80 | 247.729 / 222.208 | 172.395 / 154.479 |
| switch-payload-12 | 497.980 / 444.708 | 289.271 / 247.625 |
| switch-siblings-0 | 85.771 / 74.354 | 82.709 / 72.541 |
| switch-siblings-1000 | 2084.604 / 2067.854 | 2122.292 / 2078.708 |

| 행 | 단계 | S self µs | E self µs | 최대호출 S/E | B0 매핑 |
| --- | --- | ---: | ---: | ---: | --- |
| switch-oneOf-80 | markWrite | 4.333 | 1.771 | 4/1 | 폭 안 |
| switch-oneOf-80 | registerRecalculation | 12.667 | 12.188 | 1/1 | 폭 안 |
| switch-oneOf-80 | primeHost | 2.833 | 2.500 | 1/1 | 폭 안 |
| switch-oneOf-80 | updateOutput | 7.125 | 7.271 | 6/6 | 폭 안 |
| switch-oneOf-80 | computeNode | 34.270 | 33.355 | 5/5 | 폭 안 |
| switch-oneOf-80 | wheelPreparation | 8.709 | 2.833 | 1/1 | 폭 안 |
| switch-oneOf-80 | createChildNode | 3.834 | 0.000 | 3/0 | B0 대응 없음 |
| switch-oneOf-80 | enterFieldNode | 3.417 | 0.000 | 3/0 | B0 대응 없음 |
| switch-oneOf-80 | assembleObject | 9.084 | 9.250 | 2/2 | 폭 안 |
| switch-oneOf-80 | selectChildren | 32.667 | 29.772 | 1/1 | 폭 안 |
| switch-oneOf-80 | transitionSettlement | 5.375 | 4.062 | 1/1 | 매핑 불일치·비교 제외 |
| switch-oneOf-80 | getControlLayers | 14.417 | 1.415 | 12/6 | 매핑 불일치·비교 제외 |
| switch-oneOf-80 | setLatentRaw | 11.459 | 0.000 | 6/0 | 폭 안 |
| switch-oneOf-80 | captureExitedRaw | 5.999 | 0.000 | 3/0 | 폭 안 |
| switch-oneOf-80 | finalizeExits | 23.436 | 18.376 | 1/1 | 폭 안 |
| switch-oneOf-80 | markCommitDeliveries | 11.271 | 11.979 | 1/1 | 폭 안 |
| switch-oneOf-80 | updateInactiveValuesMemo | 18.959 | 0.000 | 1/0 | 폭 안 |
| switch-oneOf-80 | commitSettlement | 8.668 | 9.167 | 1/1 | 폭 안 |
| switch-oneOf-80 | everythingElse | 16.584 | 13.438 | 1/1 | B0 대응 없음 |
| switch-oneOf-80 | cloneFromSlot | 0.000 | 7.979 | 0/3 | B0 대응 없음 |
| switch-oneOf-80 | enterSlotClone | 0.000 | 0.792 | 0/3 | B0 대응 없음 |
| switch-payload-12 | markWrite | 6.874 | 1.771 | 13/1 | 매핑 불일치·비교 제외 |
| switch-payload-12 | registerRecalculation | 19.417 | 18.250 | 1/1 | 폭 안 |
| switch-payload-12 | primeHost | 2.708 | 2.437 | 1/1 | 폭 안 |
| switch-payload-12 | updateOutput | 6.624 | 7.228 | 15/15 | 폭 안 |
| switch-payload-12 | computeNode | 47.143 | 49.626 | 14/14 | 폭 안 |
| switch-payload-12 | wheelPreparation | 9.520 | 3.292 | 1/1 | 매핑 불일치·비교 제외 |
| switch-payload-12 | createChildNode | 5.146 | 0.000 | 12/0 | B0 대응 없음 |
| switch-payload-12 | enterFieldNode | 6.564 | 0.000 | 12/0 | B0 대응 없음 |
| switch-payload-12 | assembleObject | 37.292 | 37.979 | 2/2 | 폭 안 |
| switch-payload-12 | selectChildren | 56.749 | 52.586 | 1/1 | 폭 안 |
| switch-payload-12 | transitionSettlement | 7.625 | 8.105 | 1/1 | 폭 안 |
| switch-payload-12 | getControlLayers | 46.106 | 3.480 | 48/24 | 매핑 불일치·비교 제외 |
| switch-payload-12 | setLatentRaw | 33.500 | 0.000 | 24/0 | 매핑 불일치·비교 제외 |
| switch-payload-12 | captureExitedRaw | 13.604 | 0.000 | 12/0 | 매핑 불일치·비교 제외 |
| switch-payload-12 | finalizeExits | 100.271 | 32.856 | 1/1 | 폭 안 |
| switch-payload-12 | markCommitDeliveries | 14.938 | 15.396 | 1/1 | 폭 안 |
| switch-payload-12 | updateInactiveValuesMemo | 40.354 | 0.000 | 1/0 | 매핑 불일치·비교 제외 |
| switch-payload-12 | commitSettlement | 17.354 | 14.646 | 1/1 | 매핑 불일치·비교 제외 |
| switch-payload-12 | everythingElse | 22.686 | 15.583 | 1/1 | B0 대응 없음 |
| switch-payload-12 | cloneFromSlot | 0.000 | 17.230 | 0/12 | B0 대응 없음 |
| switch-payload-12 | enterSlotClone | 0.000 | 1.958 | 0/12 | B0 대응 없음 |
| switch-siblings-0 | markWrite | 1.500 | 1.771 | 1/1 | 매핑 불일치·비교 제외 |
| switch-siblings-0 | registerRecalculation | 6.709 | 6.584 | 1/1 | 폭 안 |
| switch-siblings-0 | primeHost | 2.937 | 3.292 | 1/1 | 매핑 불일치·비교 제외 |
| switch-siblings-0 | updateOutput | 3.750 | 3.709 | 4/4 | 폭 안 |
| switch-siblings-0 | computeNode | 14.521 | 13.731 | 4/4 | 매핑 불일치·비교 제외 |
| switch-siblings-0 | wheelPreparation | 3.396 | 2.499 | 1/1 | 폭 안 |
| switch-siblings-0 | evaluateGate | 5.250 | 5.042 | 6/6 | 폭 안 |
| switch-siblings-0 | assembleObject | 2.542 | 2.583 | 1/1 | 폭 안 |
| switch-siblings-0 | selectChildren | 14.478 | 15.166 | 1/1 | 폭 안 |
| switch-siblings-0 | transitionSettlement | 1.271 | 1.292 | 1/1 | 폭 안 |
| switch-siblings-0 | markCommitDeliveries | 9.084 | 9.062 | 1/1 | 폭 안 |
| switch-siblings-0 | updateInactiveValuesMemo | 0.208 | 0.000 | 1/0 | 매핑 불일치·비교 제외 |
| switch-siblings-0 | commitSettlement | 3.396 | 3.125 | 1/1 | 폭 안 |
| switch-siblings-0 | everythingElse | 11.957 | 11.248 | 1/1 | B0 대응 없음 |
| switch-siblings-1000 | markWrite | 2.396 | 2.292 | 1/1 | 대조 불가 |
| switch-siblings-1000 | registerRecalculation | 8.938 | 9.729 | 1/1 | 대조 불가 |
| switch-siblings-1000 | primeHost | 662.667 | 677.145 | 1/1 | 대조 불가 |
| switch-siblings-1000 | updateOutput | 7.292 | 7.437 | 4/4 | 대조 불가 |
| switch-siblings-1000 | computeNode | 301.314 | 304.041 | 4/4 | 대조 불가 |
| switch-siblings-1000 | wheelPreparation | 5.875 | 4.709 | 1/1 | 대조 불가 |
| switch-siblings-1000 | evaluateGate | 6.854 | 7.792 | 6/6 | 대조 불가 |
| switch-siblings-1000 | assembleObject | 255.562 | 259.437 | 1/1 | 대조 불가 |
| switch-siblings-1000 | selectChildren | 703.104 | 711.291 | 1/1 | 대조 불가 |
| switch-siblings-1000 | transitionSettlement | 1.729 | 1.833 | 1/1 | 대조 불가 |
| switch-siblings-1000 | markCommitDeliveries | 22.729 | 23.459 | 1/1 | 대조 불가 |
| switch-siblings-1000 | updateInactiveValuesMemo | 0.292 | 0.000 | 1/0 | 대조 불가 |
| switch-siblings-1000 | commitSettlement | 75.500 | 75.688 | 1/1 | 대조 불가 |
| switch-siblings-1000 | everythingElse | 17.958 | 18.791 | 1/1 | 대조 불가 |

### B0 원장과 같은 S 행 대조

siblings-1000은 B0 계측 행이 없어 이 표에 없습니다. 폭 밖 항목은 비교에서 제외하며 원인이나 성능 변화로 읽지 않습니다.

| 행 | 단계 | B0 self µs | 현재 S self µs | 현재 S 폭 µs | 판정 |
| --- | --- | ---: | ---: | ---: | --- |
| switch-oneOf-80 | markWrite | 4.375 | 4.333 | 0.438 | 폭 안 |
| switch-oneOf-80 | registerRecalculation | 12.959 | 12.667 | 1.272 | 폭 안 |
| switch-oneOf-80 | computeNode | 35.147 | 34.270 | 2.876 | 폭 안 |
| switch-oneOf-80 | wheelPreparation | 8.687 | 8.709 | 0.814 | 폭 안 |
| switch-oneOf-80 | primeHost | 2.917 | 2.833 | 0.479 | 폭 안 |
| switch-oneOf-80 | selectChildren | 35.978 | 32.667 | 3.355 | 폭 안 |
| switch-oneOf-80 | evaluateGate | 0.000 | 0.000 | 0.000 | 폭 안 |
| switch-oneOf-80 | runDeriveRounds | 0.000 | 0.000 | 0.000 | 폭 안 |
| switch-oneOf-80 | transitionSettlement | 4.958 | 5.375 | 0.313 | 매핑 불일치·비교 제외 |
| switch-oneOf-80 | finalizeExits | 23.873 | 23.436 | 3.063 | 폭 안 |
| switch-oneOf-80 | getControlLayers | 15.520 | 14.417 | 0.751 | 매핑 불일치·비교 제외 |
| switch-oneOf-80 | captureExitedRaw | 5.709 | 5.999 | 0.499 | 폭 안 |
| switch-oneOf-80 | setLatentRaw | 11.208 | 11.459 | 1.333 | 폭 안 |
| switch-oneOf-80 | updateOutput | 6.958 | 7.125 | 0.606 | 폭 안 |
| switch-oneOf-80 | assembleObject | 9.979 | 9.084 | 1.104 | 폭 안 |
| switch-oneOf-80 | commitSettlement | 8.500 | 8.668 | 0.833 | 폭 안 |
| switch-oneOf-80 | updateInactiveValuesMemo | 18.666 | 18.959 | 2.146 | 폭 안 |
| switch-oneOf-80 | markCommitDeliveries | 11.876 | 11.271 | 1.541 | 폭 안 |
| switch-payload-12 | markWrite | 5.709 | 6.874 | 0.416 | 매핑 불일치·비교 제외 |
| switch-payload-12 | registerRecalculation | 18.687 | 19.417 | 1.063 | 폭 안 |
| switch-payload-12 | computeNode | 45.123 | 47.143 | 2.478 | 폭 안 |
| switch-payload-12 | wheelPreparation | 9.062 | 9.520 | 0.375 | 매핑 불일치·비교 제외 |
| switch-payload-12 | primeHost | 2.645 | 2.708 | 0.104 | 폭 안 |
| switch-payload-12 | selectChildren | 57.252 | 56.749 | 0.880 | 폭 안 |
| switch-payload-12 | evaluateGate | 0.000 | 0.000 | 0.000 | 폭 안 |
| switch-payload-12 | runDeriveRounds | 0.000 | 0.000 | 0.000 | 폭 안 |
| switch-payload-12 | transitionSettlement | 7.688 | 7.625 | 0.896 | 폭 안 |
| switch-payload-12 | finalizeExits | 102.416 | 100.271 | 7.353 | 폭 안 |
| switch-payload-12 | getControlLayers | 45.476 | 46.106 | 0.583 | 매핑 불일치·비교 제외 |
| switch-payload-12 | captureExitedRaw | 12.124 | 13.604 | 0.412 | 매핑 불일치·비교 제외 |
| switch-payload-12 | setLatentRaw | 31.273 | 33.500 | 0.519 | 매핑 불일치·비교 제외 |
| switch-payload-12 | updateOutput | 6.561 | 6.624 | 0.273 | 폭 안 |
| switch-payload-12 | assembleObject | 37.105 | 37.292 | 4.166 | 폭 안 |
| switch-payload-12 | commitSettlement | 15.771 | 17.354 | 0.646 | 매핑 불일치·비교 제외 |
| switch-payload-12 | updateInactiveValuesMemo | 35.854 | 40.354 | 3.583 | 매핑 불일치·비교 제외 |
| switch-payload-12 | markCommitDeliveries | 14.709 | 14.938 | 0.625 | 폭 안 |
| switch-siblings-0 | markWrite | 1.417 | 1.500 | 0.042 | 매핑 불일치·비교 제외 |
| switch-siblings-0 | registerRecalculation | 6.666 | 6.709 | 0.042 | 폭 안 |
| switch-siblings-0 | computeNode | 13.813 | 14.521 | 0.396 | 매핑 불일치·비교 제외 |
| switch-siblings-0 | wheelPreparation | 3.354 | 3.396 | 0.062 | 폭 안 |
| switch-siblings-0 | primeHost | 2.834 | 2.937 | 0.042 | 매핑 불일치·비교 제외 |
| switch-siblings-0 | selectChildren | 13.876 | 14.478 | 0.792 | 폭 안 |
| switch-siblings-0 | evaluateGate | 4.980 | 5.250 | 0.667 | 폭 안 |
| switch-siblings-0 | runDeriveRounds | 0.000 | 0.000 | 0.000 | 폭 안 |
| switch-siblings-0 | transitionSettlement | 1.229 | 1.271 | 0.062 | 폭 안 |
| switch-siblings-0 | finalizeExits | 0.000 | 0.000 | 0.000 | 폭 안 |
| switch-siblings-0 | getControlLayers | 0.000 | 0.000 | 0.000 | 폭 안 |
| switch-siblings-0 | captureExitedRaw | 0.000 | 0.000 | 0.000 | 폭 안 |
| switch-siblings-0 | setLatentRaw | 0.000 | 0.000 | 0.000 | 폭 안 |
| switch-siblings-0 | updateOutput | 3.666 | 3.750 | 0.145 | 폭 안 |
| switch-siblings-0 | assembleObject | 2.541 | 2.542 | 0.042 | 폭 안 |
| switch-siblings-0 | commitSettlement | 3.417 | 3.396 | 0.105 | 폭 안 |
| switch-siblings-0 | updateInactiveValuesMemo | 0.167 | 0.208 | 0.000 | 매핑 불일치·비교 제외 |
| switch-siblings-0 | markCommitDeliveries | 8.563 | 9.084 | 0.521 | 폭 안 |

## 힙·보유 상한

기존 node-and-settle --heap-child를 사용하며 5001노드 기준 런타임·레인별 7표본을 보존합니다. 보유 상한은 고정 fixture의 관측이며 임의의 입력 이력 전체에 대한 증명은 아닙니다. Node의 단계 관문은 E 중앙값 ≤ S 중앙값이고, E 중앙값 ≤ S 최대는 별도 보고입니다. Bun은 보고 전용입니다.

| 런타임 | S 중앙 B/node | S 최대 | E 중앙 | E−S 중앙 | 단계 중앙≤중앙 | PR별 중앙≤S최대 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| node | 1439.098 | 1889.510 | 1439.346 | 0.248 | FAIL | PASS |
| bun | 2214.272 | 2214.759 | 2228.069 | 13.797 | 보고 | 보고 |

120쓰기 후 슬롯 Map의 V8 strong-edge dominator 보유량입니다. 공유 청사진과 외부에서 보유한 detached 노드는 제외하며 중첩 Map 바이트는 합산하지 않습니다. K는 호스트가 보유한 비활성 엔트리 수, M은 보유 서브트리 최대 노드 수입니다.

| 행 | 호스트 | 슬롯 K | M | K·M | 보유노드 | unread bytes | read bytes | reset 후 슬롯호스트 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| switch-oneOf-80 | `root` | 3 | 1 | 3 | 3 | 5456 | 5776 | 0 |
| switch-discriminator-80 | `root` | 3 | 1 | 3 | 3 | 5528 | 5848 | 0 |
| switch-if-80 | `root` | 3 | 1 | 3 | 3 | 5528 | 5920 | 0 |
| switch-nested-oneOf-20 | `/outer/inner` | 3 | 1 | 3 | 3 | 5456 | 5776 | 0 |
| switch-siblings-0 | 없음 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| switch-siblings-100 | 없음 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| switch-siblings-1000 | 없음 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| switch-siblings-4000 | 없음 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| switch-payload-12 | `root` | 12 | 1 | 12 | 12 | 19304 | 19880 | 0 |

## React whole-form — 보고 전용

B3와 같은 benchmark-form --equivalent --mode=render --fixture=oneOf-20을 S/E마다 한 번 실행하여 update-settled를 보고합니다. 각 실행의 L은 별도 쌍이며 합산하지 않습니다. 이 표는 채택 관문이 아닙니다.

| 실행 | metric | L 중앙 ms | 현재 중앙 ms | 비 |
| --- | --- | ---: | ---: | ---: |
| S | update-settled | 6.402458 | 6.547917 | 1.023 |
| E | update-settled | 6.490146 | 6.585270 | 1.015 |

## oneOf-80 누적 — 이전 창 인용

아래 값은 해당 문서의 채택된 최종 창에서 인용한 µs/쓰기입니다. 이번 B5 창의 수치가 아니며 서로 다른 창을 합쳐 개선율을 계산하지 않습니다. 0.16.1과 단계 시작의 최초 원장 값은 B3 누적표가 인용한 B0 09:28 창을 그대로 옮겼습니다.

| 위치      | 이전 창 인용 µs/write | 출처·창                                                                                                            |
| --------- | --------------------: | ------------------------------------------------------------------------------------------------------------------ |
| 0.16.1    |                43.730 | [B3 누적표](b3-results.md)가 인용한 B0 09:28 창입니다.                                                             |
| 단계 시작 |               261.291 | [B3 누적표](b3-results.md)가 인용한 같은 B0 창입니다.                                                              |
| B1 후     |               252.406 | [B1](b1-results.md)의 마지막 승인 교대 창이며 504.812 µs 왕복÷2입니다.                                             |
| B2-P2 후  |               220.573 | [B2-P2](b2-p2-results.md)의 채택 창이며 441.146 µs 왕복÷2입니다.                                                   |
| B4-1 후   |               146.219 | [B4-1](b4-1-results.md)의 후보 2 B10이며 0.292438 ms 왕복÷2입니다.                                                 |
| B4-2 후   |              187.0835 | [B4-2](b4-2-results.md)의 B10이며 0.374167 ms 왕복÷2입니다.                                                        |
| B3 재측정 |               152.041 | [B3](b3-results.md)의 E이며 0.304083 ms 왕복÷2를 문서 표시값으로 인용했습니다. 같은 창 L/S는 36.729/245.531입니다. |
| B6 후     |                96.688 | [B6](b6-results.md)의 후보 3 최종 창 B10이며 0.193376 ms 왕복÷2입니다.                                             |
| B7 후     |               100.875 | [B7](b7-results.md)의 후보 6 최종 창 B10이며 0.201750 ms 왕복÷2입니다.                                             |

## 채택·기각 이력

단계에 채택된 PR은 #474 B0, #476 B1, #478 B2-P2, #480 B4-1, #481 B4-2, #482 B3, #483 B6, #484 B7입니다. 기각된 가설은 B2-P1, B2-P1b, B2-P3이며 누적 채택 효과에 포함하지 않습니다. 설계 Ⅲ 착수 여부는 소유자께서 별도로 정하십니다.

## 준비 검증·측정 인계

AJV8 dist build, E 재귀 build, S archive build·typecheck·lint 및 지정 산출물 검사를 통과했습니다. 계측 번들도 타이머를 끈 채 48동작을 통과했습니다. 새 추출기를 B3 과거 자료로 재생하여 10개 산출물의 계산 결과가 동일함을 확인했으며 그 자료를 B5 측정으로 사용하지 않았습니다. S archive의 초기 build는 workspace 의존성 dist 부재로 실패했으며 의존성 빌드 후 전체 build가 통과했습니다. 제품 소스·시험·배포 산출물의 커밋 차분은 없습니다. 성능 창을 열거나 새 기능 회귀 시험을 실행하지 않았습니다. 결과 문서와 휴대 가능한 준비 증거만 커밋하며 원표본·로그·실행 번들은 저장소 밖에 유지합니다.

이 문서의 창 수치는 2026-10-28T11:55:58.718Z–2026-10-28T12:04:44.690Z의 단일 정식 창입니다. 중단된 앞 창은 판정에 합치지 않았고, formal-start 이후 재실행은 없습니다. 여섯 관문과 제거 경로의 원판정은 위의 표와 같습니다. 채택 여부는 이 문서가 정하지 않습니다. 휴대 가능한 요약은 [판정](raw/b5/judgement.json), [22행](raw/b5/results.summary.json), [품질](raw/b5/quality.json), [Welch](raw/b5/welch.json), [단계](raw/b5/stages.json), [B0 매핑](raw/b5/stage-mapping.json), [힙](raw/b5/heaps.json), [보유](raw/b5/retention.json), [React S](raw/b5/react-S.json), [React E](raw/b5/react-E.json)에 있습니다. 저장소 자료에는 기계 로컬 경로를 적지 않습니다.
