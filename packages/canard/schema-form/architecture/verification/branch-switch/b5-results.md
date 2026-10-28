# B5 — 설계 Ⅱ 이정표 단계 전체 재측정

B6과 B7을 병합한 설계 Ⅱ의 마감 상태를 공개 0.16.1 및 단계 시작과 같은 단일 창에서 비교하도록 준비했습니다. 제품·시험·기존 시간 루프는 바꾸지 않았습니다. 정식 창과 CPU 사전 검사는 아직 실행하지 않았으며, 아래 창 결과와 판정은 측정 담당께서 기입하십니다.

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

| 관문                       | 고정 판정선                                                                                                    | 판정           | 측정 근거      |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------- | -------------- |
| 446C-06 oneOf-80           | E 왕복 ≤ L×1.5이며 <1 ms입니다.                                                                                | 측정 담당 기입 | 측정 담당 기입 |
| discriminator-80           | 같은 형상 oneOf-80의 L을 기준으로 ≤1.5배이며 <1 ms입니다. 직접 L 쌍은 없습니다.                                | 측정 담당 기입 | 측정 담당 기입 |
| if-80                      | 같은 형상 active 왕복 + 게이트당 guard 호출 1회 비용 이내입니다. 왕복은 160 guard입니다. 직접 L 쌍은 없습니다. | 측정 담당 기입 | 측정 담당 기입 |
| TEST-093 형제 1000/0       | E siblings-1000 ≤ 3 × E siblings-0입니다.                                                                      | 측정 담당 기입 | 측정 담당 기입 |
| 다른 canonical 행 TEST-073 | B3와 같은 제외 목록을 적용한 전체 10/10 주판정 회귀가 0건입니다.                                               | 측정 담당 기입 | 측정 담당 기입 |
| Node 노드당 힙             | E 중앙값 ≤ S 중앙값입니다. PR별 E 중앙값 ≤ S 최대도 별도 보고합니다.                                           | 측정 담당 기입 | 측정 담당 기입 |

위 여섯 관문은 B3와 같은 선이며 형제 상한 3배를 이번 창 전에 다시 고정했습니다. 제거 경로 장부의 E `setLatentRaw`·`captureExitedRaw`·`updateInactiveValuesMemo` 최대 호출 0도 B3처럼 별도 확인합니다. TEST-073의 다른 행 주판정에서는 oneOf-80·discriminator-80·if-80·siblings-1000을 제외하되 전체 22행 원판정과 반창을 함께 공개합니다. 총합 행으로 관문을 판정하며 계측 단계의 절대 시간을 배포 번들과 직접 비교하지 않습니다.

| 보조 확인             | 판정           | 근거           |
| --------------------- | -------------- | -------------- |
| 제거 경로 최대 호출 0 | 측정 담당 기입 | 측정 담당 기입 |

## 창 환경·품질

| 항목                            | 값             |
| ------------------------------- | -------------- |
| 정식 시작 UTC                   | 측정 담당 기입 |
| 정식 종료 UTC                   | 측정 담당 기입 |
| Node / Bun                      | 측정 담당 기입 |
| CPU / 아키텍처 / OS             | 측정 담당 기입 |
| 조용한 창 승인                  | 측정 담당 기입 |
| CPU 사전 검사 시도 수           | 측정 담당 기입 |
| 프로세스별 CPU 최대 / 외부 합계 | 측정 담당 기입 |
| L 앞5/뒤5 비 중앙 / 품질 판정   | 측정 담당 기입 |
| 정식 창 수 / 재시도 수          | 측정 담당 기입 |
| 브라우저 경합 여부              | 측정 담당 기입 |

사전 검사는 5초 관측에서 외부 프로세스 하나가 30%를 넘거나 기존 장치의 heavy 조건이 있을 때 거절합니다. CPU 합계는 기록만 합니다. formal-start 생성 전 exit 3일 때만 사전 검사 원시를 보존하고 최소 2분 뒤 재검사하며, 30분이 지나면 코디네이터께 보고합니다.

| L 호환 행              |    앞5 중앙 ms |    뒤5 중앙 ms |       뒤/앞 비 |
| ---------------------- | -------------: | -------------: | -------------: |
| single-flat-1000       | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| mount-oneOf-80         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| mount-flat-1000        | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| mount-nested-d6-f4     | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| single-nested-d6-f4    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80        | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| bulk-flat-2000         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| bulk-nested-d6-f4      | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-nested-oneOf-20 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0      | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-100    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000   | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-4000   | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| leaf-gate-250          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| leaf-gate-1000         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| leaf-gate-4000         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| leaf-gate-8000         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12      | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |

## 세 레인 — 전체 22행

단위는 ms이며 셀은 최소값 중앙 / 프로세스 중앙값 최소~최대(폭)입니다.

| 행                          |       L 0.16.1 |    S 단계 시작 |    E 단계 종료 |
| --------------------------- | -------------: | -------------: | -------------: |
| single-flat-1000            | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| mount-oneOf-80              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| mount-flat-1000             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| mount-nested-d6-f4          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| single-nested-d6-f4         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| bulk-flat-2000              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| bulk-nested-d6-f4           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-discriminator-80     |        쌍 없음 | 측정 담당 기입 | 측정 담당 기입 |
| switch-if-80                |        쌍 없음 | 측정 담당 기입 | 측정 담당 기입 |
| switch-nested-oneOf-20      | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-100         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000        | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-4000        | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| leaf-gate-250               | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| leaf-gate-1000              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| leaf-gate-4000              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| leaf-gate-8000              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| wave-1000                   |        쌍 없음 | 측정 담당 기입 | 측정 담당 기입 |
| single-flat-1000-subscribed |        쌍 없음 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |

## 분기 쓰기당 환산

| 행                      | 쓰기 수 |     L µs/write |     S µs/write |     E µs/write |
| ----------------------- | ------: | -------------: | -------------: | -------------: |
| switch-oneOf-80         |       2 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-discriminator-80 |       2 |        쌍 없음 | 측정 담당 기입 | 측정 담당 기입 |
| switch-if-80            |       2 |        쌍 없음 | 측정 담당 기입 | 측정 담당 기입 |
| switch-nested-oneOf-20  |       2 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0       |       1 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-100     |       1 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000    |       1 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-4000    |       1 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12       |       2 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |

## 형제 선형항

0·100·1000·4000의 네 점에 대한 최소제곱 기울기와 절편을 보고합니다. L의 같은 비를 함께 남깁니다.

| 레인 |      1000/0 배 | 기울기 µs/1000형제 |        절편 µs |
| ---- | -------------: | -----------------: | -------------: |
| L    | 측정 담당 기입 |     측정 담당 기입 | 측정 담당 기입 |
| S    | 측정 담당 기입 |     측정 담당 기입 | 측정 담당 기입 |
| E    | 측정 담당 기입 |     측정 담당 기입 | 측정 담당 기입 |

## TEST-073

| 행                          |    전체 Δ% / p |     앞5 Δ% / p |     뒤5 Δ% / p | 주판정         |
| --------------------------- | -------------: | -------------: | -------------: | -------------- |
| single-flat-1000            | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| mount-oneOf-80              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| mount-flat-1000             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| mount-nested-d6-f4          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| single-nested-d6-f4         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| bulk-flat-2000              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| bulk-nested-d6-f4           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-discriminator-80     | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-if-80                | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-nested-oneOf-20      | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-100         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000        | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-4000        | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| leaf-gate-250               | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| leaf-gate-1000              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| leaf-gate-4000              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| leaf-gate-8000              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| wave-1000                   | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| single-flat-1000-subscribed | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |

## 단계 장부와 호환 범위

코디네이터 승인에 따라 S에는 B3 외부 호환 builder를, E에는 현재 B6 builder를 그대로 사용하며 B3 시간 루프와 판정을 유지합니다. 두 builder의 공통 타이머 경계는 같은 이름으로 대응하고, 삭제된 literalStar 타이머 넷은 E에서 부재·0으로 기록합니다. B3와 같이 wrapped 총합은 각 표본의 self 합이며 오버헤드를 빼지 않습니다. 개별 단계 중앙값의 합과 총합 중앙값은 다릅니다.

S의 wheelPreparation은 B0 staticList부터 첫 cap 구간으로 연결합니다. B0 원장과 현재 S 자체 프로세스 중앙값 폭을 대조하여 폭 밖 매핑은 비교에서 제외하고, B0에 없는 siblings-1000은 대조 불가로 기록합니다. 단계 차이는 진단이며 총합 관문을 대체하지 않습니다.

| 행                   | S wrapped / unwrapped µs | E wrapped / unwrapped µs |
| -------------------- | -----------------------: | -----------------------: |
| switch-oneOf-80      |           측정 담당 기입 |           측정 담당 기입 |
| switch-payload-12    |           측정 담당 기입 |           측정 담당 기입 |
| switch-siblings-0    |           측정 담당 기입 |           측정 담당 기입 |
| switch-siblings-1000 |           측정 담당 기입 |           측정 담당 기입 |

| 행                   | 단계                     |      S self µs |      E self µs |   최대호출 S/E | B0 매핑        |
| -------------------- | ------------------------ | -------------: | -------------: | -------------: | -------------- |
| switch-oneOf-80      | createFieldNode          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | computeNode              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | wheelPreparation         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | registerRecalculation    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | markWrite                | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | setLatentRaw             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | primeHost                | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | selectChildren           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | updateOutput             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | transitionSettlement     | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | commitSettlement         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | runDeriveRounds          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | finalizeExits            | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | enterFieldNode           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | createChildNode          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | restoreLatentState       | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | captureExitedRaw         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | evaluateGate             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | markCommitDeliveries     | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | updateInactiveValuesMemo | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | getControlLayers         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | assembleObject           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | enterSlotClone           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | cloneFromSlot            | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | createFromSlotOverlay    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-oneOf-80      | everythingElse           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | createFieldNode          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | computeNode              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | wheelPreparation         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | registerRecalculation    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | markWrite                | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | setLatentRaw             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | primeHost                | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | selectChildren           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | updateOutput             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | transitionSettlement     | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | commitSettlement         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | runDeriveRounds          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | finalizeExits            | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | enterFieldNode           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | createChildNode          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | restoreLatentState       | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | captureExitedRaw         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | evaluateGate             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | markCommitDeliveries     | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | updateInactiveValuesMemo | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | getControlLayers         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | assembleObject           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | enterSlotClone           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | cloneFromSlot            | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | createFromSlotOverlay    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12    | everythingElse           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | createFieldNode          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | computeNode              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | wheelPreparation         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | registerRecalculation    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | markWrite                | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | setLatentRaw             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | primeHost                | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | selectChildren           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | updateOutput             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | transitionSettlement     | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | commitSettlement         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | runDeriveRounds          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | finalizeExits            | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | enterFieldNode           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | createChildNode          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | restoreLatentState       | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | captureExitedRaw         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | evaluateGate             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | markCommitDeliveries     | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | updateInactiveValuesMemo | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | getControlLayers         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | assembleObject           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | enterSlotClone           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | cloneFromSlot            | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | createFromSlotOverlay    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0    | everythingElse           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | createFieldNode          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | computeNode              | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | wheelPreparation         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | registerRecalculation    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | markWrite                | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | setLatentRaw             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | primeHost                | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | selectChildren           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | updateOutput             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | transitionSettlement     | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | commitSettlement         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | runDeriveRounds          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | finalizeExits            | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | enterFieldNode           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | createChildNode          | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | restoreLatentState       | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | captureExitedRaw         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | evaluateGate             | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | markCommitDeliveries     | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | updateInactiveValuesMemo | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | getControlLayers         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | assembleObject           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | enterSlotClone           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | cloneFromSlot            | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | createFromSlotOverlay    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-1000 | everythingElse           | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |

### B0 원장과 같은 S 행 대조

| 행                | 단계           |     B0 self µs | 현재 S self µs |   현재 S 폭 µs | 판정           |
| ----------------- | -------------- | -------------: | -------------: | -------------: | -------------- |
| switch-oneOf-80   | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-payload-12 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| switch-siblings-0 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |

## 힙·보유 상한

기존 node-and-settle --heap-child를 사용하며 5001노드 기준 런타임·레인별 7표본을 보존합니다. 보유 상한은 고정 fixture의 관측이며 임의의 입력 이력 전체에 대한 증명은 아닙니다.

| 런타임 |  S 중앙 B/node |         S 최대 |         E 중앙 |       E−S 중앙 | 단계 중앙≤중앙 | PR별 중앙≤S최대 |
| ------ | -------------: | -------------: | -------------: | -------------: | -------------- | --------------- |
| node   | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입  |
| bun    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입  |

| 행                      | 호스트         |         슬롯 K |              M |            K·M |       보유노드 |   unread bytes |     read bytes | reset 후 슬롯호스트 |
| ----------------------- | -------------- | -------------: | -------------: | -------------: | -------------: | -------------: | -------------: | ------------------: |
| switch-oneOf-80         | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |      측정 담당 기입 |
| switch-discriminator-80 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |      측정 담당 기입 |
| switch-if-80            | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |      측정 담당 기입 |
| switch-nested-oneOf-20  | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |      측정 담당 기입 |
| switch-siblings-0       | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |      측정 담당 기입 |
| switch-siblings-100     | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |      측정 담당 기입 |
| switch-siblings-1000    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |      측정 담당 기입 |
| switch-siblings-4000    | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |      측정 담당 기입 |
| switch-payload-12       | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |      측정 담당 기입 |

## React whole-form — 보고 전용

B3와 같은 benchmark-form --equivalent --mode=render --fixture=oneOf-20을 S/E마다 한 번 실행하여 update-settled를 보고합니다. 각 실행의 L은 별도 쌍이며 합산하지 않습니다.

| 실행 | metric         |      L 중앙 ms |   현재 중앙 ms |             비 |
| ---- | -------------- | -------------: | -------------: | -------------: |
| S    | update-settled | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |
| E    | update-settled | 측정 담당 기입 | 측정 담당 기입 | 측정 담당 기입 |

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

측정 담당께서는 측정 담당 기입으로 표시한 모든 셀을 새 단일 창의 근거로 채우고, 여섯 관문 각각 PASS / FAIL / 판정 불가 한 줄을 남기십니다. 환경 실패·중단 원시를 보존하고 정식 시작 후 재시도하지 않습니다. raw/b5에는 창 종료 후 results.summary.json, quality.json, judgement.json, window.json, welch.json, stages.json, stage-mapping.json, heaps.json, retention.json, retention-bounds.json, guard-cost.json, siblings-slope.json, stage-hashes.json, validation.json, commands.json, react-S.json, react-E.json을 추가합니다. 저장소 자료에는 기계 로컬 경로를 적지 않습니다.
