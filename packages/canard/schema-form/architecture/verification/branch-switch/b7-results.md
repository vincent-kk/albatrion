# B7 — 지움 배열의 keep 아이템 압축 복원

**공식 A/B 창은 B6 병합 전 머리 `2406a34d9`와 기준 `0b9337cd9`로 1회 기록했습니다. B7 고정 관문은 통과입니다. 고정 장치 원판정은 채택 조건 미충족이며, 채택은 코디네이터가 결정합니다. 이 문단의 창은 후보 1 기록이며, B6 rebase 뒤 검증은 아래 최종 후보(rebase) 절에 별도로 기록했습니다.**

## 계약과 구현

지움과 함께 나가는 배열은 명시 keep 원본이 있는 아이템만 원래 순서대로 압축 보존합니다. 살아 있거나 이미 비활성인 자손, 아이템 자신의 스칼라 keep, 중첩 배열과 후보 종류를 같은 정책으로 처리합니다. 닫힌 동안 공표하는 경로도 압축하며 재진입 뒤 조건이 거짓인 keep은 자기 슬롯에 남아 조건이 열릴 때 복원됩니다. keep이 없는 배열은 길이 0이고 객체 호스트의 정책은 유지합니다.

압축 raw와 itemCount는 재생성 입력이며 kept 채널 패치는 옛 아이템 주소에 의존하지 않게 실체화합니다. 같은 이름의 다른 후보 종류를 첫 후보로 재해석하지 않고 각 원본의 선언 결합을 보존합니다. 후보 소유 검사와 길이 0 배열의 숨은 운반자는 소비처가 없어 제거했습니다. 실제 원본 후보 그래프도 생존 순서로 사적으로 복제하여 옛 참조의 항목 메모를 바꾸지 않고 이미 비활성인 keep의 마지막 정책을 이어갑니다.

추가 순회와 압축 raw·채널 패치 할당은 지움 배열 나감에서만 발생합니다. 임시 후보 매핑과 사적 원본 복제도 실제 지움 배열 압축에서만 생기고, 고정 노드 필드와 runtime 필드는 추가하지 않았습니다. 객체 지움과 지움 없는 배열의 overlay 방문은 수정 전후 각각 3회와 7회입니다. 이번 창의 쓰기당 장부 합계는 `switch-oneOf-80`이 A 중앙값 181.750 µs, A 프로세스 중앙값 범위 16.937 µs, B 중앙값 182.626 µs이고, `switch-siblings-0`이 A 중앙값 89.333 µs, 범위 7.229 µs, B 중앙값 88.042 µs입니다. Node 노드당 힙은 B 중앙값 1443.950바이트, A 최대 1898.019바이트입니다.

## 실패 먼저 확인

기준 제품 코드 `0b9337cd9`에 최종 계약 시험을 대입해 **9실패·3통과**를 확인하고 제품 코드를 복원했습니다. 실패 원인은 kept 원본 유실이나 재진입 아이템 누락이며 설정·import 오류가 아닙니다. 수정 코드의 핵심·겉면 계약 18개가 통과하고 React 18·19 화면 관찰 4개도 확인했습니다.

- `compacts live kept descendants in their original order`
- `restores scalar items that explicitly keep their own source`
- `recursively compacts nested clearing arrays`
- `preserves each kept candidate kind inside a compacted survivor`
- `preserves kept scalar item candidates at the same compacted index`
- `restores kept array items with inactive=false and candidateOwner=false`
- `restores kept array items with inactive=true and candidateOwner=false`
- `restores kept array items with inactive=false and candidateOwner=true`
- `restores kept array items with inactive=true and candidateOwner=true`

추가 검증에서는 중간 구현 `869ab553c`에서 옛 비활성 항목의 동일성 변경과 부모의 반복 나감 뒤 keep 배열 유실을 확인했습니다. 이미 비활성인 자손에 압축 원본 계획을 전달하지 않는 변이도 중첩 계약 시험에서 실패했으며, 최종 구현은 이 세 검증을 통과합니다.

[실패 이름과 대조군](raw/b7/fail-first.json).

## 전후 배달과 공개 겉면

- 고정 B4-2 장치: 72장면·430관측점, 차이 0건.
- 차이가 난 장면 이름: 없음 (`[]`).
- 마운트 장치: 6장면·12관측점, 차이 0건.
- 공개 `dist/index.d.ts`: 기준선과 3,054바이트 동일, 차분 0.

[배달](raw/b7/delivery.json), [마운트](raw/b7/mount-delivery.json), [공개 겉면](raw/b7/public-surface.json).

## 환경

Node 26.12.1, Bun 1.4.4, Apple M1 Max, arm64, Darwin 27.0.0입니다. Node 프로젝트는 8 GiB 힙으로 각각 순차 실행했습니다. Storybook의 비샤드 전부 실행과 `--browser.fileParallelism=false` 단독 실행은 약 50초에 브라우저 연결이 끊겼고 제품 단언 실패는 없었습니다. 코디네이터 승인에 따라 공식 `--run --project storybook --maxWorkers=1 --no-file-parallelism --browser.fileParallelism=false --shard=1/4`부터 `4/4`까지 순차 실행했습니다. 각 샤드는 25개 파일이며 합계 **25 + 25 + 25 + 25 = 100**입니다. 실제 실행 경로의 합집합도 100개이고 중복은 0개입니다. 사례 수는 62 + 62 + 57 + 70 = 251개이며 모두 통과했습니다. 연결이 끊긴 불완전 실행은 통과로 합산하지 않았습니다.

모든 측정 플러그인 산출물의 실제 해석 경로와 A/B 44동작 무시간 적재 점검이 통과했습니다. [적재 점검](raw/b7/preflight.json).

공식 창의 5초 CPU 사전 점검은 외부 프로세스 30% 초과 또는 장치 heavy가 있으면 거절합니다. 인계 전에 기록된 6회는 모두 거절이었습니다.

| 시작 UTC | 최고 프로세스 | CPU % | 승인 |
| --- | --- | ---: | --- |
| 2026-10-28T05:32:46.234Z | mediaanalysisd | 106.6407 | 아니오 |
| 2026-10-28T05:35:00.882Z | mediaanalysisd | 89.2670 | 아니오 |
| 2026-10-28T05:37:05.975Z | mediaanalysisd | 96.1008 | 아니오 |
| 2026-10-28T05:39:11.286Z | mediaanalysisd | 94.3448 | 아니오 |
| 2026-10-28T05:41:16.646Z | mds | 55.8106 | 아니오 |
| 2026-10-28T05:43:22.002Z | mds | 54.6955 | 아니오 |

이번 창 직전 점검은 2회입니다. 1회는 2026-10-28T05:50:06.438Z에 WindowServer 33.8014%로 거절했습니다. 2분을 기다린 뒤 2회는 2026-10-28T05:52:30.335Z에 Google Chrome Helper (Aperitif Renderer) 24.2547%였고 heavy는 비어 승인했습니다. 승인 직후 고정 장치가 자체 5초 검사를 통과해 정식 시작을 배타적으로 만들었습니다. 정식 시작은 2026-10-28T05:53:11.721Z이고 창 종료는 2026-10-28T06:02:21.050Z입니다. 종료 코드는 0이고 invalid는 false입니다. 정식 표본이 생긴 뒤 재실행은 없습니다. [CPU 사전 점검](raw/b7/cpu-prechecks.json), [CPU 전후](raw/b7/window.json).

## 관문

기준 A는 `0b9337cd9`, 현재 제품 B는 `2406a34d9`입니다. 아래 실행은 B6 병합 전 제품에 대한 것이며 rebase 뒤 관문은 별도로 기록합니다.

| 프로젝트 | 파일 | 통과 | todo | 결과 |
| --- | ---: | ---: | ---: | --- |
| unit | 563 | 3814 | 1 | 통과 |
| render | 130 | 763 | 0 | 통과 |
| react18 | 130 | 763 | 0 | 통과 |
| production | 9 | 20 | 0 | 통과 |
| verify | 698 | 4621 | 1 | 통과 |

`typecheck`, `lint`, `build`가 통과했습니다. Storybook은 공식 4개 샤드를 순차 실행해 100개 파일·251개 사례 전부가 통과했습니다. 연결이 종료된 불완전한 실행은 통과로 합산하지 않습니다.

[관문과 불완전 실행](raw/b7/gates.json).

## A/B 창과 힙

이 창의 측정 머리 B는 B6 병합 전 `2406a34d978d59d2a66480e24151d43948fda754`이고 기준 A는 `0b9337cd9`입니다. rebase 뒤 SHA는 코디네이터 지시가 오면 여기에 추가합니다. 공식 창은 1회이며 22행 × A/B 각 10프로세스 = 440프로세스, 20예열·100표본, `--quality=legacy`입니다. 대표값은 각 프로세스의 최소 지연 중앙값이고 A는 앞 5, A′는 뒤 5, B는 전체 10입니다.

legacy 품질비는 호환 레인 18행의 B10/A10 중앙비 **0.999368226**입니다. 유효 구간 0.95–1.05 안이므로 품질 판정은 **PASS**입니다.

[입력과 해시](raw/b7/inputs.json), [단계 함수 경계](raw/b7/stage-inputs.json), [품질](raw/b7/quality.json), [원판정](raw/b7/judgement.json).

### B7 고정 관문

판정은 고정 규칙의 결과만 적습니다. 채택은 코디네이터 결정입니다.

| 관문 | 판정 | 근거 |
| --- | --- | --- |
| legacy 품질비 0.95–1.05 | PASS | 18행 중앙비 0.999368226 |
| TEST-073 주판정 회귀 0 | PASS | 전체 22행·인접 10쌍 회귀 0. 앞 절반 회귀 1행(`leaf-gate-1000`). 뒤 절반 회귀 0 |
| switch-oneOf-80 장부 합계가 A 자체 폭 이내 | PASS | B 182.626 µs ≤ A 181.750 µs + 범위 16.937 µs |
| switch-siblings-0 장부 합계가 A 자체 폭 이내 | PASS | B 88.042 µs ≤ A 89.333 µs + 범위 7.229 µs |
| Node 노드당 힙 B 중앙값 ≤ A 최대 | PASS | B 1443.950 B/node ≤ A 최대 1898.019 B/node |

고정 장치 원판정은 **채택 조건 미충족**이고 `adopt`는 false입니다. `stageNoise`가 false인 이유는 아래 개별 단계 11건이 A 프로세스 중앙값 범위를 넘었기 때문입니다. 이 11건의 원수치와 원판정은 그대로 둡니다. 이 11건은 고정 장치의 stageNoise 근거로 남고, B7 장부 관문은 `switch-oneOf-80`과 `switch-siblings-0`의 합계입니다.

| 행 | 단계 | A 중앙 µs | A 범위 µs | B 중앙 µs |
| --- | --- | ---: | ---: | ---: |
| switch-oneOf-80 | primeHost | 2.500 | 0.146 | 2.708 |
| switch-payload-12 | markWrite | 1.708 | 0.083 | 1.875 |
| switch-payload-12 | registerRecalculation | 20.354 | 0.667 | 21.042 |
| switch-payload-12 | computeNode | 187.707 | 1.749 | 197.124 |
| switch-payload-12 | wheelPreparation | 8.479 | 0.270 | 8.792 |
| switch-payload-12 | selectChildren | 123.187 | 3.853 | 130.209 |
| switch-payload-12 | markCommitDeliveries | 15.937 | 0.146 | 16.500 |
| switch-payload-12 | cloneFromSlot | 17.623 | 0.164 | 18.040 |
| switch-payload-12 | enteringNodes | 18.293 | 0.126 | 18.832 |
| switch-payload-12 | everythingElse | 17.062 | 0.687 | 17.958 |
| switch-siblings-0 | markCommitDeliveries | 9.292 | 0.563 | 9.855 |

### 단계 장부 합계

단위는 쓰기당 µs입니다. A 범위는 A 세 프로세스 중앙값의 max−min입니다. `switch-payload-12`는 B7 장부 관문 행이 아니며 장치 플래그는 폭 이내입니다.

| 행 | A 중앙값 | A 프로세스 중앙값 | A 범위 | B 중앙값 | 폭 이내 | B7 관문 |
| --- | ---: | --- | ---: | ---: | --- | --- |
| switch-oneOf-80 | 181.750 | 195.8955, 178.9585, 181.7500 | 16.937 | 182.626 | 예 | PASS |
| switch-siblings-0 | 89.333 | 95.5210, 89.3335, 88.2920 | 7.229 | 88.042 | 예 | PASS |
| switch-payload-12 | 303.875 | 309.6460, 301.2290, 303.8745 | 8.417 | 310.771 | 예 | 해당 없음 |

[단계 요약](raw/b7/stages.json), [보충 단계](raw/b7/supplemental-stages.json).

### 전체 22행

단위는 ms입니다. 폭(다)는 요약의 `widthMs`이고 B/A10은 A 전체 10 기준입니다. 폭 판정 `미입증`은 지연 폭 라벨이며 B7 채택 관문이 아닙니다.

| 행 | A앞5 | B10 | A′뒤5 | A폭 | B폭 | A′폭 | 폭(다) | B/A10 | legacy비 | 폭 판정 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| single-flat-1000 | 0.067875 | 0.065375 | 0.061542 | 0.020542 | 0.009250 | 0.005625 | 0.020542 | 1.014 | 1.012 | 미입증 |
| mount-oneOf-80 | 2.195959 | 2.244167 | 2.180166 | 0.196000 | 0.337083 | 0.273500 | 0.273500 | 1.024 | 1.005 | 미입증 |
| mount-flat-1000 | 2.175584 | 2.188354 | 2.200292 | 0.108084 | 0.242208 | 0.186583 | 0.186583 | 0.996 | 0.999 | 미입증 |
| mount-nested-d6-f4 | 16.644833 | 16.585125 | 16.387833 | 0.956584 | 1.301958 | 0.553416 | 0.956584 | 1.007 | 1.001 | 미입증 |
| single-nested-d6-f4 | 0.116834 | 0.120104 | 0.121833 | 0.007458 | 0.016958 | 0.013458 | 0.013458 | 1.018 | 0.974 | 미입증 |
| switch-oneOf-80 | 0.203791 | 0.194250 | 0.219292 | 0.088000 | 0.061250 | 0.047541 | 0.088000 | 0.920 | 0.980 | 미입증 |
| bulk-flat-2000 | 1.924708 | 1.856500 | 1.877166 | 0.341708 | 0.187876 | 0.228084 | 0.341708 | 0.981 | 1.025 | 미입증 |
| bulk-nested-d6-f4 | 4.301792 | 4.227000 | 4.166833 | 0.245333 | 0.422292 | 0.123584 | 0.245333 | 1.010 | 1.006 | 미입증 |
| switch-discriminator-80 | 0.198250 | 0.184042 | 0.186625 | 0.048250 | 0.065709 | 0.054916 | 0.054916 | 0.943 | — | 미입증 |
| switch-if-80 | 0.304416 | 0.324292 | 0.308500 | 0.067875 | 0.087375 | 0.050541 | 0.067875 | 1.058 | — | 미입증 |
| switch-nested-oneOf-20 | 0.366125 | 0.343646 | 0.358250 | 0.036291 | 0.080541 | 0.111792 | 0.111792 | 0.949 | 0.964 | 미입증 |
| switch-siblings-0 | 0.075500 | 0.076354 | 0.073333 | 0.017958 | 0.031542 | 0.021333 | 0.021333 | 1.013 | 0.858 | 미입증 |
| switch-siblings-100 | 0.208583 | 0.223145 | 0.229208 | 0.014833 | 0.069792 | 0.070167 | 0.070167 | 1.016 | 0.992 | 미입증 |
| switch-siblings-1000 | 2.064000 | 2.069396 | 2.074708 | 0.084333 | 0.143000 | 0.054875 | 0.084333 | 1.002 | 1.004 | 미입증 |
| switch-siblings-4000 | 6.693583 | 6.799438 | 6.953666 | 0.355084 | 0.415875 | 0.371792 | 0.371792 | 0.999 | 1.007 | 미입증 |
| leaf-gate-250 | 0.033916 | 0.031396 | 0.034417 | 0.006334 | 0.006459 | 0.007084 | 0.007084 | 0.919 | 0.957 | 미입증 |
| leaf-gate-1000 | 0.028916 | 0.032729 | 0.032958 | 0.002292 | 0.010333 | 0.007334 | 0.007334 | 1.076 | 1.000 | 미입증 |
| leaf-gate-4000 | 0.772666 | 0.777604 | 0.791875 | 0.022875 | 0.041167 | 0.035750 | 0.035750 | 1.002 | 1.009 | 미입증 |
| leaf-gate-8000 | 1.584916 | 1.603521 | 1.615584 | 0.051126 | 0.077417 | 0.129959 | 0.129959 | 1.004 | 0.997 | 미입증 |
| wave-1000 | 1.695042 | 1.708250 | 1.716333 | 0.071041 | 0.085958 | 0.081500 | 0.081500 | 0.999 | — | 미입증 |
| single-flat-1000-subscribed | 0.070000 | 0.070771 | 0.071000 | 0.004750 | 0.017875 | 0.015375 | 0.015375 | 1.009 | — | 미입증 |
| switch-payload-12 | 0.406333 | 0.397645 | 0.435292 | 0.085125 | 0.050209 | 0.064916 | 0.085125 | 0.945 | 0.971 | 미입증 |

[프로세스별 최소값](raw/b7/results.summary.json).

### TEST-073

1000/ms 처리율의 Welch 검정입니다. 감소 15% 초과와 p<0.05를 함께 적용하고, 전체 인접 10쌍을 주판정으로 사용합니다. 주판정 회귀는 0행입니다. 앞 5 보조 회귀는 `leaf-gate-1000` 1행이고 뒤 5 보조 회귀는 0행입니다.

| 행 | 전체 변화% | 전체 p | 앞5 변화% / p | 뒤5 변화% / p | 주판정 회귀 |
| --- | ---: | ---: | --- | --- | --- |
| single-flat-1000 | 4.222 | 0.00528 | 8.680 / 1.05e-4 | 0.079 / 0.969 | 없음 |
| mount-oneOf-80 | -1.084 | 0.0568 | -0.677 / 0.418 | -1.483 / 0.055 | 없음 |
| mount-flat-1000 | 1.384 | 0.0417 | -0.470 / 0.636 | 3.244 / 4.51e-4 | 없음 |
| mount-nested-d6-f4 | 0.909 | 0.182 | 3.274 / 6.58e-4 | -1.400 / 0.146 | 없음 |
| single-nested-d6-f4 | -1.768 | 0.125 | -9.347 / 1.12e-9 | 6.536 / 1.32e-4 | 없음 |
| switch-oneOf-80 | 0.251 | 0.841 | 1.553 / 0.377 | -1.018 / 0.567 | 없음 |
| bulk-flat-2000 | 0.434 | 0.407 | 0.347 / 0.631 | 0.521 / 0.493 | 없음 |
| bulk-nested-d6-f4 | 0.552 | 0.425 | 3.507 / 3.75e-4 | -2.334 / 0.016 | 없음 |
| switch-discriminator-80 | 0.815 | 0.510 | -1.440 / 0.400 | 3.053 / 0.086 | 없음 |
| switch-if-80 | -4.661 | 3.11e-7 | 0.552 / 0.677 | -9.648 / 8.84e-15 | 없음 |
| switch-nested-oneOf-20 | 0.604 | 0.528 | 1.287 / 0.354 | -0.077 / 0.953 | 없음 |
| switch-siblings-0 | 0.435 | 0.732 | 1.861 / 0.301 | -0.965 / 0.593 | 없음 |
| switch-siblings-100 | -4.644 | 8.03e-8 | -4.375 / 1.61e-5 | -4.943 / 2.65e-4 | 없음 |
| switch-siblings-1000 | -0.099 | 0.732 | -0.624 / 0.160 | 0.428 / 0.249 | 없음 |
| switch-siblings-4000 | 0.280 | 0.390 | -0.130 / 0.774 | 0.697 / 0.136 | 없음 |
| leaf-gate-250 | 6.244 | 9.12e-5 | 4.561 / 0.052 | 7.987 / 2.07e-4 | 없음 |
| leaf-gate-1000 | -12.182 | 3.10e-15 | -21.967 / 3.11e-26 회귀 | -0.777 / 0.733 | 없음 |
| leaf-gate-4000 | -0.273 | 0.405 | -1.234 / 0.004 | 0.720 / 0.144 | 없음 |
| leaf-gate-8000 | 1.122 | 0.00110 | 1.193 / 0.015 | 1.051 / 0.029 | 없음 |
| wave-1000 | 0.001 | 0.997 | -2.321 / 6.97e-8 | 2.375 / 1.10e-7 | 없음 |
| single-flat-1000-subscribed | -1.425 | 0.290 | -5.782 / 0.001 | 3.049 / 0.124 | 없음 |
| switch-payload-12 | 5.872 | 9.01e-11 | 5.836 / 2.21e-6 | 5.908 / 8.57e-6 | 없음 |

### 힙과 보존량

각 7표본입니다. Bun은 보고만 하며 B7 채택 관문에 넣지 않습니다. Bun도 B 중앙값이 A 최대 이하입니다.

| 런타임 | A 중앙 B/node | A 최대 | B 중앙 | 기록 |
| --- | ---: | ---: | ---: | --- |
| node | 1440.346 | 1898.019 | 1443.950 | PASS |
| bun | 2233.204 | 2250.515 | 2239.455 | 보고 |

[힙 표본](raw/b7/heaps.json).

| 행 | 슬롯 | 보존 노드 | 읽기 전 B | 읽기 후 B | reset 후 slot Map |
| --- | ---: | ---: | ---: | ---: | ---: |
| switch-oneOf-80 | 3 | 3 | 5336 | 5656 | 0 |
| switch-payload-12 | 12 | 12 | 18120 | 18696 | 0 |
| switch-siblings-0 | 0 | 0 | 0 | 0 | 0 |

120쓰기 후 V8 strong-edge immediate dominator로 각 inactiveSlots Map이 독점 보유한 원본 트리 바이트입니다. `switch-siblings-0`은 호스트가 없습니다. resetSubtree, 배달 drain, full GC 2회 후 slot Map은 모두 0입니다. [보존량](raw/b7/retention.json), [별표 비용](raw/b7/wildcard-cost.json).

## 구조 점검

패키지 FCA 스캔의 전체 판정은 FAIL, 분석 완전성은 indeterminate이며 202건을 기록했습니다. 변경 경로의 지적은 0건이고 수정·추가 시험의 케이스 수는 모두 exact입니다. 기존 문서 참조와 파일별 시험 개수 제한 문제를 통과로 바꾸지 않았습니다. Scan complete: 202 findings.

[구조 점검](raw/b7/fca.json).

## 인계

독립 antigravity 검토와 PR 생성은 코디네이터가 수행합니다. 측정 머리는 B6 병합 전 `2406a34d9`이고, B6 병합 후 지정 stage에 rebase한 뒤의 SHA는 아직 없습니다. rebase 뒤 관문은 다시 실행하며 공식 A/B 창은 반복하지 않습니다.

## 후보 2

독립 검토(판정 FAIL)의 결함 10건을 모두 반영한 후보입니다. 제품 변경이 있으므로 후보 1의 측정 표는 이 후보에 적용되지 않으며, 후보 2의 측정은 별도 측정 실행기가 새 창에서 수행합니다.

### 규칙과 비용

**정적 keep 선언 플래그.** 청사진 노드의 선택 필드 `hasKeepDescendants`는 `unsetOnInactive`가 리터럴 true가 아닌 선언(false 또는 표현식)이 템플릿 아래에 있거나, 템플릿의 조각 범위 controls와 `controls.fields`가 자식에게 그런 선언을 하면 참입니다. 청사진 구축의 `markCandidateDescendants` 바로 뒤에서 `markKeepDescendants`가 선언을 한 번 훑어 표시하고, 선언이 하나라도 있을 때만 후보 도달성과 같은 구축 전용 역방향 그래프로 조상에 전파합니다. 선언이 없는 그래프는 할당이 없고 필드도 남지 않습니다. 지움 배열의 나감은 이 플래그가 없으면 아이템을 방문하지 않고 슬롯 전체를 버리므로, keep 선언이 없는 배열의 방문 수는 아이템 수와 무관하게 배열 하나이며 변경 전과 같습니다. 호출 수 시험은 7개 아이템 배열의 `readSlotExitPolicy` 호출을 1회로 고정합니다(검토 시점에는 22회).

**쓰기 주소 규칙.** 압축 배열 바로 아래의 생존 아이템은 배열 이동과 같은 장치(`DetachedWriteAddress.retain`)로 새 색인의 칸을 얻고 그 칸을 사적 복제본과 공유합니다. 따라서 닫힌 동안 옛 참조에 쓴 값은 재진입 뒤 같은 생존 아이템에 닿습니다. 생존하지 못한 아이템에는 `DetachedWriteAddress.discard`로 소멸 칸을 두고, 그 아이템과 자손에 대한 옛 참조 쓰기는 `writeFieldNode`에서 효과 없이 반환합니다. 이 소멸 표시는 생존 아이템이 하나라도 있어 압축 계획이 만들어지는 배열에 적용됩니다. 모든 아이템이 소멸해 슬롯이 통째로 버려지는 배열은 압축 계획이 없으며 기존 동작을 따릅니다.

**비용 문장.** keep 선언이 있는 지움 배열의 나감은 아이템 서브트리의 노드 수에 비례해 방문하고, 최종 나감에서는 압축 배열을 품은 나간 최상위 서브트리 전체를 사적으로 복제합니다(보유 서브트리를 통째로 유지하는 슬롯 모델의 기준선이며 B7이 도입한 것이 아닙니다). 복제 비용과 보유 메모리는 그 서브트리의 노드 수에 비례하고, 압축 배열 아래의 overlay 실체화된 raw에는 생존 아이템만 담깁니다. 재진입의 보존 자리 이름 조회는 별표 호환 경로와 공유하는 분배 기록 `retainedItemNames`의 배열 순회이므로 생존 아이템 n개의 복원 비용은 n의 제곱에 비례합니다. 집합으로 바꾸면 별표 호환 경로의 형식까지 바뀌므로 제거하지 않았습니다. keep 선언이 없는 배열, 지움 없는 나감, 객체 호스트의 방문과 할당은 변경 전과 같습니다.

### 검토 결함의 처리

| 결함 | 처리 | 파일과 시험 |
| --- | --- | --- |
| 1 (P1) 압축 뒤 옛 참조 쓰기가 다른 아이템에 떨어짐 | 생존 아이템은 새 색인의 칸으로 옮기고 소멸 아이템의 쓰기는 무효로 함 | `cloneSlotSubtree.ts`, `DetachedWriteAddress.ts`, `writeFieldNode.ts`, `createClearedArrayOverlay.ts`; `surface.clearing-array-keep.test.ts`의 `writes a survivor old reference to the same survivor after compaction`, `drops a write addressed at a discarded item after compaction` |
| 2 (P2) 지움 배열이 모든 아이템 서브트리를 방문함 | 정적 플래그로 keep 선언 없는 배열은 방문 생략 | `markKeepDescendants.ts`, `readKeepDeclarations.ts`, `isKeepControls.ts`, `collectTemplateParents.ts`, `createExitSlotOverlay.ts`; `markKeepDescendants.test.ts`, `visits a clearing array without keep declarations once, whatever its item count` |
| 3 (P2) 사적 복제가 서술보다 넓음 | 코드는 유지하고 settle `DETAIL.md`와 비용 문장을 실제 동작에 맞춤 | `settle/DETAIL.md` |
| 4 (P2) 비어 있는 keep 배열 자손만으로 아이템이 남음 | 그 배열이 명시 keep(`unsetOnInactive: false`)이므로 남는 것이 정책에 맞음. 지우는 배열은 아이템이 없으면 원본이 아님을 확인 | `keeps an item whose only kept source is an explicitly kept empty array` |
| 5 (P2) 도우미가 함수 이름 디렉터리에 있음 | 두 도우미를 `utils/slots/`의 평평한 파일로 이동 | `createClearedArrayOverlay.ts`, `materializeKeptSlotOverlay.ts` |
| 6 (P2) 후보 종류와 색인 이동 시험 없음 | 생존 아이템이 색인 2에서 0으로 이동하는 후보 소유 배열 시험 추가 | `rebinds kept item candidates when survivors shift to earlier indices` |
| 7 (P3) 비활성 후보에 활성 나감 입력을 넘김 | 활성 구조의 아이템에만 `context`를 넘김 | `createClearedArrayOverlay.ts` |
| 8 (P3) 실패 먼저 기록의 이름 불일치 | `passingControls`를 실제 시험 제목으로 고치고 기준에 대입하지 않은 시험 파일을 기록 | `raw/b7/fail-first.json` |
| 9 (P3) 배달 비교가 B7을 관측하지 못함 | 고정 장치(72장면·430관측점, 마운트 6장면·12관측점)에 지움 배열 아래 keep 장면이 없으므로 차이 목록이 비어 있는 것은 B7 동작에 대한 증거가 아닙니다. 알려진 공백으로 기록하며 이 PR에서 장치 코퍼스는 바꾸지 않습니다. | 이 절 |
| 10 (P3) 시험의 fixture 가져오기 방식 | 형제 시험과 같은 `@/schema-form/core/__tests__/makeFieldNodeTree` 별칭 사용. `retainedItemNames`의 제곱 비용은 비용 문장에 명시 | `surface.clearing-array-keep.test.ts` |

결함 4의 확인 결과: 비어 있는 branch 배열의 raw는 정의되지 않은 상태입니다. 그럼에도 명시 keep 배열이 아이템을 남기는 것은 기준선이 객체 호스트에서 쓰는 규칙(지우지 않는 배열은 원본으로 센다)을 그대로 따른 결과이며, 지우는 배열은 아이템이 없으면 원본이 아니므로 keep 선언 없는 배열의 길이는 0입니다. 검토 문서가 말한 `{ tags: [] }` 대신 실제 재진입 값은 아이템 `{}`이고, 길이는 원래 아이템 수입니다.

### 실패 먼저 확인

후보 1의 머리 `fae1785dc`의 제품 코드에 후보 2의 시험을 대입했을 때 실패한 시험은 다음과 같습니다.

- `writes a survivor old reference to the same survivor after compaction`
- `drops a write addressed at a discarded item after compaction`
- `visits a clearing array without keep declarations once, whatever its item count` (호출 22회)
- `marks the array when an item descendant declares unsetOnInactive false`
- `marks the array when an item descendant declares an expression`
- `marks the array when the item itself declares a keep`
- `marks a host whose controls.fields address a child with a keep`
- `marks every ancestor on the path to the declaration`
- `marks a recursive template that reaches a keep`

`rebinds kept item candidates when survivors shift to earlier indices`와 `keeps an item whose only kept source is an explicitly kept empty array`는 `fae1785dc`에서도 통과합니다. 두 시험은 실행된 적 없는 경로와 올바른 기존 동작을 고정하는 특성 시험입니다. 재귀 템플릿 시험은 처음 고정 입력이 스키마 오류(`RECURSIVE_SHAPE_UNBOUNDED`)였으므로 입력을 고친 뒤 플래그 계산 호출을 끈 상태에서 다시 대입해 실패를 확인했고 호출을 복원했습니다.

### 관문

코디네이터의 일정 변경에 따라 이 후보에서는 `typecheck`, `lint`, 표적 시험만 실행했습니다. 전체 다섯 프로젝트, Storybook 샤드, `build`, `test:verify`, 공개 선언 차분, 배달 비교는 B6 병합 뒤 rebase한 최종 후보에서 한 번 실행하며 이 절에는 아직 결과가 없습니다. 전체 유닛 한 번은 기본 힙에서 V8 힙 부족으로 종료되었으므로, 전체 실행에는 힙을 늘려야 합니다.

| 관문 | 결과 |
| --- | --- |
| typecheck | 통과 |
| lint | 통과 |
| 표적 유닛 시험(settle의 슬롯·배열·후보·나감·비활성·재진입, 겉면의 압축 시험과 분리 참조 시험, 배열 이동의 보존 정책, 청사진 전체, 슬롯·쓰기·분리 organ의 시험) | 182파일·1309사례 통과 |
| 화면 시험 `clearing-array-keep` (render, react18) | 2파일·4사례 통과 |

### 측정

| 항목 | 값 |
| --- | --- |
| 후보 2 A/B 창 | 측정 실행기가 기록 |

## 후보 3

후보 2(`54cae86ca`)의 delta 검토를 반영한 추가 기록입니다. 앞선 검토에서 반영한 생존 아이템의 쓰기 주소 이동, 정적 keep 선언 플래그, keep 없는 배열의 방문 생략, 후보 종류와 색인 이동의 결합 시험은 유지합니다. 이 절의 검증은 후보 3에만 해당하며, 위 후보 1의 성능 표를 후보 3의 측정 결과로 사용하지 않습니다.

### 델타 검토 결함의 처리

아래 제품·시험 경로는 `src/core/engine/` 기준이며 겉면 시험은 `src/core/surface/__tests__/`에 있습니다.

| 결함 | 처리 | 파일과 시험 |
| --- | --- | --- |
| 1 (P1) 먼저 나간 자손이 자기 쓰기 칸을 반환하면서 조상의 소멸 표시를 무시함 | 자기 칸이 있어도 고정 부모 사슬을 확인하고 조상이 소멸했으면 쓰기를 버립니다. | `settle/utils/detached/DetachedWriteAddress.ts`; `surface.clearing-array-keep.test.ts`의 `drops a write through an already inactive descendant of a discarded item`; 후보 4의 `drops a write through a descendant of an already inactive object inside a discarded item` |
| 2 (P3) `hasKeepFields`가 도우미 8줄 예산을 넘음 | 내보내기 하나와 영어 TSDoc을 가진 파일로 분리했습니다. 작업 지시의 한 단계 아래 배치를 따르고 패키지 규칙에 맞춰 함수 이름 디렉터리 대신 controls 주제 구획에 두었습니다. | `blueprint/utils/features/controls/hasKeepFields.ts`, `readKeepDeclarations.ts`; `markKeepDescendants.test.ts`의 `marks a host whose controls.fields address a child with a keep` |
| 3 (P3) 재귀 시험이 루트만 단언함 | `children` 배열 템플릿 자체의 `hasKeepDescendants`를 단언합니다. 아이템 역간선을 제거하면 이 단언이 실패하고 복원하면 통과함을 확인했습니다. | `blueprint/utils/features/__tests__/markKeepDescendants.test.ts`의 `marks a recursive template that reaches a keep`; 변이 대상 `collectTemplateParents.ts` |
| 4 (P3) DETAIL의 과거 비교 문구와 할당 없음 주장 | 정착 문서는 추가 아이템 방문의 조건과 방문 수를 현재 명세로 적었습니다. 청사진 문서는 keep 선언이 없으면 역방향 그래프를 만들지 않으며 템플릿 선언 검사마다 결과 객체 하나는 할당한다고 적었습니다. | `settle/DETAIL.md`, `blueprint/DETAIL.md` |
| 5 (P3) `readSourceTree`가 소멸 주소의 경로로 다른 생존 아이템을 읽음 | 소멸 표시가 있으면 경로 해석을 건너뛰고 그 옛 노드의 고정 원본만 읽습니다. 후보 종류 전환으로 먼저 나간 아이템 아래 배열이 압축 후 다른 행의 빈 배열을 읽는 경우를 고정했습니다. | `settle/utils/slots/readSourceTree.ts`, `settle/utils/slots/__tests__/readSourceTree.test.ts`의 `reads a discarded candidate descendant from its frozen source instead of a compacted survivor` |
| 6 (P3) 생존 아이템에서 지워진 채 먼저 나간 자손의 칸이 옛 색인에 남음 | 알려진 한계로 기록합니다. 슬롯으로 보존되지 않아 보유 그래프에서 닿지 않는 자손의 쓰기 칸은 압축 때 옮기지 않습니다. 배열 이동에도 있는 한계이며 이번 수정 범위에 포함하지 않습니다. | `settle/utils/slots/cloneSlotSubtree.ts`, `rekeySlotWriteAddresses.ts`; 이 절의 알려진 한계 |
| 7 (P3) 생존 아이템이 없는 배열의 옛 참조 쓰기 범위 | 조정자의 확인된 결정대로 코드를 유지합니다. 생존 아이템이 하나라도 있어 압축 계획이 만들어진 배열에서만 소멸 쓰기를 버립니다. 생존 아이템이 0개인 배열은 원래 경로에 잠재 쓰기를 남기는 동작을 유지합니다. | `createClearedArrayOverlay.ts`, `createExitSlotOverlay.ts`, `settle/DETAIL.md` |

### 규칙과 비용

**정적 keep 선언 플래그.** 청사진의 `hasKeepDescendants`는 아이템 자신·자손·조각 범위 controls·`controls.fields`의 가능한 keep 선언을 구축 시 한 번 해석하며, 역방향 그래프로 재귀 간선을 포함한 모든 조상에 전파합니다. keep 선언이 없으면 역방향 그래프를 만들지 않고 플래그도 두지 않습니다. 템플릿마다 선언 검사 결과 객체 하나는 만듭니다. keep 없는 지움 배열은 아이템 수와 무관하게 배열 하나만 방문하며, 7개 아이템의 `readSlotExitPolicy` 호출 1회를 시험으로 고정합니다.

**쓰기 주소와 소멸 원본 읽기.** 생존 아이템은 배열 이동과 같은 `DetachedWriteAddress.retain` 장치로 새 색인의 칸을 얻고 사적 복제본과 공유합니다. 분리 참조가 자기 칸으로 풀리든 가장 가까운 포착 조상의 칸으로 풀리든, 부모 사슬 어디에든 소멸 칸이 있으면 쓰기를 버립니다. 소멸 배열의 동사가 원본을 필요로 하면 `readSourceTree`는 그 노드의 고정 원본을 읽습니다. 생존 아이템 0개인 배열에는 압축 계획과 소멸 표시가 없으므로, 옛 참조 쓰기는 원래 경로의 잠재 쓰기입니다.

**비용 문장.** keep 선언이 있는 지움 배열은 아이템 서브트리 노드 수에 비례해 방문합니다. 최종 나감은 압축 배열을 품은 나간 최상위 서브트리 전체를 사적으로 복제하고, 압축 배열 아래에는 생존 아이템만 결합합니다. 복제 시간과 보유 메모리는 그 서브트리 노드 수에 비례하며 overlay의 실체화된 raw에는 생존 아이템만 담깁니다. 재진입의 `retainedItemNames` 조회는 공유 분배 기록의 배열 순회이므로 생존 아이템 n개의 복원 비용은 n의 제곱에 비례합니다. keep 선언이 없는 배열은 아이템을 방문하지 않고, 지움 없는 나감과 배열 자손이 없는 객체 호스트에는 압축 경로의 방문을 더하지 않습니다. 분리 참조의 읽기·쓰기는 조상 깊이에 비례하는 WeakMap 조회를 수행하며, 조상의 소멸 표시를 발견하면 반환용 주소 객체 하나를 만듭니다. 새로운 상주 색인이나 보유 객체는 더하지 않습니다.

### 실패 먼저 확인

제품 코드가 `54cae86ca`인 상태에서 다음 두 시험이 실패했습니다. 계약 문서와 시험을 먼저 작성했고, 제품 구현은 바꾸지 않은 채 실행했습니다.

- `drops a write through an already inactive descendant of a discarded item`: 기대값 `[{ keep: 12 }, { keep: 24 }]` 대신 `[{ keep: 5 }, { keep: 24 }]`였습니다.
- `reads a discarded candidate descendant from its frozen source instead of a compacted survivor`: 원래 배열 `[1, 2]` 대신 압축 생존 아이템의 지워진 배열 `[]`를 읽었습니다. 시험은 후보 종류 전환과 실제 압축으로 소멸 주소를 만듭니다.

강화한 `marks a recursive template that reaches a keep`는 정상 구현에서 통과했습니다. `collectTemplateParents`의 아이템 역간선 등록 두 줄만 임시 제거했을 때 루트 단언은 통과했지만 `children` 템플릿 단언은 `undefined`로 실패했습니다. 간선을 복원한 뒤 두 회귀 시험과 청사진 시험을 함께 실행하여 3파일·17사례 통과를 확인했습니다. [실패 먼저 기록](raw/b7/fail-first.json)의 `candidate3`에 두 실패와 재귀 변이 증거를 남겼습니다.

### 관문

승인된 검증 스케줄에 따라 이 후보에서는 패키지 `typecheck`, `lint`, 표적 시험만 실행했습니다. 전체 다섯 프로젝트, Storybook 샤드, `build`, `test:verify`, 공개 선언 차분, 배달 비교와 측정은 실행하지 않았습니다. 이 검증은 B6 병합 후 stage 가지에 rebase한 최종 후보에서 한 번 수행합니다.

| 관문 | 결과 |
| --- | --- |
| `yarn workspace @canard/schema-form typecheck` | 통과 |
| `yarn workspace @canard/schema-form lint` | 통과 |
| 표적 유닛: settle 슬롯·배열, 슬롯 유틸, 배열 동사 전체(분리 쓰기 주소 포함), 겉면의 압축·분리 참조, 청사진 feature 시험 | 79파일·522사례 통과 |
| `clearing-array-keep` 화면 시험(render, react18) | 2파일·4사례 통과 |

재현 명령은 다음과 같습니다. 유닛 실행에는 최대 힙 8 GiB를 지정했습니다.

```sh
NODE_OPTIONS=--max-old-space-size=8192 yarn workspace @canard/schema-form test --run --project unit src/core/engine/settle/__tests__/settle.retained-slot src/core/engine/settle/__tests__/settle.array src/core/engine/settle/utils/slots/ src/core/engine/settle/arrangeFieldNodeItems/ src/core/surface/__tests__/surface.clearing-array-keep.test.ts src/core/surface/__tests__/detached.test.ts src/core/engine/blueprint/utils/features/
yarn workspace @canard/schema-form test --run --project render --project react18 src/__tests__/e2e/clearing-array-keep.test.tsx
```

### 알려진 한계와 인계

- 생존 아이템에서 지워진 채 먼저 나간 자손은 슬롯으로 보존되지 않으므로, 그 자손의 쓰기 칸은 보유 그래프를 통한 재배치 대상이 아닙니다. 압축 뒤 옛 색인에 남아 다른 행을 향할 수 있습니다. 배열 이동에도 같은 한계가 있으며 이번 후보에서 수정하지 않았습니다.
- 고정 배달 비교 코퍼스(72장면·430관측점, 마운트 6장면·12관측점)에는 지움 배열 아래 keep 장면이 없습니다. 차이 목록이 비어 있어도 B7의 동작을 검증하는 증거는 아니며, 이 PR에서는 코퍼스를 바꾸지 않습니다.
- 최종 stage rebase 후 전체 검증과 측정, 독립 검토 및 PR 생성은 코디네이터와 별도 실행기가 수행합니다. 후보 3에서 측정 창을 실행하지 않았습니다.

### 측정

| 항목 | 값 |
| --- | --- |
| 후보 3 A/B 창 | 최종 rebase 후 측정 실행기가 기록 |

## 후보 4

후보 3(`057dea82d`)의 delta 재검토에서 남은 조상 소멸 경로와 후보 2 기록 누락을 다룹니다. 후보 2 절은 `54cae86ca`의 원문을 후보 3 앞에 복원했으며, 각 후보의 관문과 측정 기록은 해당 후보에만 적용됩니다.

### 델타 재검토 결함의 처리

| 결함 | 처리 | 파일과 시험 |
| --- | --- | --- |
| 1 (P1) 자기 칸이 없는 자손이 가장 가까운 포착 조상에서 멈추어 더 위 소멸 칸을 놓침 | 경로와 순서는 가장 가까운 칸에서 계산하고 소멸 여부는 그 위 부모 사슬 끝까지 확인합니다. 소멸 주소를 받은 `readSourceTree`는 옛 노드의 고정 원본을 읽습니다. | `settle/utils/detached/DetachedWriteAddress.ts`, `settle/utils/slots/readSourceTree.ts`; `surface.clearing-array-keep.test.ts`의 `drops a write through a descendant of an already inactive object inside a discarded item` |
| 2 (P3) 후보 2 절이 후보 3 절로 대체됨 | 첫 검토의 결함 10건 표, 실패 먼저 목록, 후보 2 관문과 측정 표를 원문으로 복원했습니다. 후보 3과 후보 4는 그 뒤에 둡니다. | 이 문서의 후보 2 절 |

### 실패 먼저 확인

조정자의 창 종료 회신 뒤 제품 코드가 `057dea82d`인 상태에서 `drops a write through a descendant of an already inactive object inside a discarded item`을 실행했습니다. `show`로 `group`이 먼저 나간 다음 지움과 함께 `list`를 닫고 `/list/0/group/keep`의 옛 참조에 5를 썼습니다. 마지막 `toEqual`에서 기대값 `[{ group: { keep: 12 } }, { group: { keep: 24 } }]` 대신 `[{ group: { keep: 5 } }, { group: { keep: 24 } }]`를 받아 실패했습니다(1실패·7건 필터 제외). 제품 구현을 고친 뒤 같은 시험을 포함한 겉면 8사례와 아래 표적 시험이 모두 통과했습니다. 기준 SHA·시험 이름·기대값·받은 값은 [실패 먼저 기록](raw/b7/fail-first.json)의 `candidate4`에 있습니다.

### 관문

모든 시험·typecheck·lint는 조정자의 창 종료 회신 뒤 실행했습니다. 패키지 typecheck·lint, settle 슬롯·배열·분리 참조와 겉면 압축 및 청사진 keep 플래그의 표적 유닛 시험, `clearing-array-keep`의 render·react18 화면 시험만 실행했습니다. 기본 힙으로 통과하여 힙 설정을 추가하지 않았습니다. 전체 프로젝트·build·배달 비교·측정은 실행하지 않았으며 최종 stage rebase 후 조정자와 별도 실행기가 수행합니다.

| 관문 | 결과 |
| --- | --- |
| typecheck | 통과 |
| lint | 통과 |
| 표적 유닛 시험 | 79파일·523사례 통과 |
| 화면 시험(render, react18) | 2파일·4사례 통과 |

재현 명령은 저장소 루트에서 각각 독립 호출합니다. 작업 실행에서는 `yarn --cwd`로 작업 디렉터리를 지정했습니다.

```sh
yarn workspace @canard/schema-form test --run --project unit src/core/surface/__tests__/surface.clearing-array-keep.test.ts --testNamePattern 'drops a write through a descendant of an already inactive object inside a discarded item'
yarn workspace @canard/schema-form test --run --project unit src/core/surface/__tests__/surface.clearing-array-keep.test.ts src/core/surface/__tests__/detached.test.ts src/core/engine/settle/utils/slots/ src/core/engine/settle/arrangeFieldNodeItems/ src/core/engine/settle/__tests__/settle.retained-slot src/core/engine/settle/__tests__/settle.array src/core/engine/blueprint/utils/features/
yarn workspace @canard/schema-form typecheck
yarn workspace @canard/schema-form lint
yarn workspace @canard/schema-form test --run --project render --project react18 src/__tests__/e2e/clearing-array-keep.test.tsx
```

### 알려진 한계와 인계

생존 아이템에서 지워진 채 먼저 나간 자손의 칸이 재배치되지 않는 한계와 생존 아이템 0개인 배열의 잠재 쓰기 범위는 후보 3의 기록을 따릅니다. 추가 조상 검사는 분리 참조의 읽기·쓰기에서만 수행하며 깊이에 비례하는 WeakMap 조회를 더합니다. 경로·순서는 가장 가까운 포착 조상의 칸을 기준으로 유지하고 상주 색인이나 보유 객체를 추가하지 않습니다. 이 후보에서는 성능을 측정하지 않습니다.

## 후보 5

B6 병합 뒤 rebase한 `941398ea704ffbba5b46d180c5628445688d2703`에 후보 4 delta 재검토의 두 지적을 반영합니다. 후보 1–4의 기록은 유지합니다. 앞선 rebase 머리의 전체 관문은 참고 증거로만 보존하며, 최종 관문은 이 수정이 들어간 제품에 대해 아래 최종 후보(rebase) 절에 기록합니다.

### 델타 재검토 결함의 처리

| 결함 | 처리 | 파일과 시험 |
| --- | --- | --- |
| 1 (P2) 사적 나감 복제본의 원래 행에 칸이 없어 나중 압축이 옛 참조를 옮기거나 버리지 못함 | 사적 나감 계획이 전달된 복제에서는 모든 원래 발생을 복제본의 쓰기 칸에 연결합니다. 재진입 복제와 종류 이전은 계획을 전달하지 않으므로 그 비용과 동작은 유지합니다. | `settle/utils/slots/cloneSlotSubtree.ts`; `surface.clearing-array-keep.test.ts`의 `keeps original row references on their rows when an already inactive list compacts under a clearing ancestor` |
| 2 (P3) 보유 그래프에서 떨어진 칸에도 소멸 보장을 약속한 문서 | 코디네이터 결정대로 코드 범위를 늘리지 않고 DETAIL의 보장 범위와 아래 알려진 한계를 명시합니다. | `settle/DETAIL.md`의 쓰기 칸·압축 계약 |

### 실패 먼저 확인

제품 `941398ea7`을 수정하지 않은 상태에서 지정 시험이 마지막 `toEqual`로 실패했습니다(1실패·8건 필터 제외). 목록은 먼저 Form 기본값을 상속해 비활성화되지만 그 안의 `tags` 압축 때문에 사적으로 복제됩니다. 이후 지우는 `section`이 닫힐 때 버려진 행의 `drop` 옛 참조에 5, 생존 행의 `keep` 옛 참조에 13을 쓰면 기대값 `[{ keep: 13, tags: [{ keep: 3 }] }]` 대신 `[{ drop: 5, keep: 12, tags: [{ keep: 3 }] }]`였습니다. 스키마·import·탐색 오류가 아닙니다.

조건 한 줄과 영어 TSDoc만 수정한 뒤 같은 시험이 통과했습니다(1통과·8건 필터 제외). DETAIL과 시험은 `87473ec6b`, 제품 수정은 `dd1462e50`으로 분리했습니다. [실패 먼저 기록](raw/b7/fail-first.json)의 `candidate5`에 기준 SHA·이름·기대값·받은 값을 담았습니다.

### 관문

지정된 슬롯·배열·분리 참조·겉면 압축·청사진 표적은 78파일·516사례가 통과했습니다. 실패 먼저와 수정 후 표적은 Node v24.20.0 기본 힙이며 힙 부족이나 재시도는 없었습니다. typecheck·lint 및 수정 후 전체 관문은 아래 최종 후보(rebase) 절에서 별도로 집계합니다. B6에서 삭제된 시험 경로 때문에 후보 4의 파일·사례 수와 같다고 가정하지 않습니다.

### 알려진 한계와 인계

지워진 채 먼저 나간 후보나 재진입 전에 잡은 옛 참조처럼 보유 그래프에서 떨어진 칸은, 버려진 색인에서도 소멸 표시를 받지 못하며 압축 뒤 그 색인을 차지한 생존 행에 쓸 수 있습니다. 배열 이동에도 같은 한계가 있습니다. 생존 아이템 0개인 배열에는 압축 계획과 소멸 표시가 없으므로 기존 잠재 쓰기 범위도 유지합니다.

사적 나감 복제는 복제 노드마다 원래 노드의 WeakMap 항목 하나를 더하며, 칸 객체 수는 같습니다. 새 영구 색인은 만들지 않고, 배열 이동·재진입 복제·종류 이전에는 이번 연결을 추가하지 않습니다. 후보 5에서 정식 측정 창을 실행하지 않았으며 최종 A/B 입력 준비 뒤 측정 실행기에게 인계합니다.

## 최종 후보(rebase)

### 기준과 충돌 해결

- 비교 기준 A: B6 병합 stage `687c1d92402f1fd689c17afc6e0842861345d8c6`.
- rebase 직후 머리: `941398ea704ffbba5b46d180c5628445688d2703`.
- 후보 5 수정 후 최종 검증 제품 B: `dd1462e501056da76c329a1c722b856cfb7a551c`.
- 기존 B7 15개 커밋을 순서대로 rebase했으며 squash하지 않았습니다. 후보 1–4의 수치·결함·알려진 한계 기록은 유지하고 승인된 후보 5의 시험·계약 커밋과 제품 수정 커밋을 추가했습니다. 후보 5 지시 수신 전에 완료된 `941398ea7` 전체 관문은 참고 증거로만 분리했고 아래 수치는 수정 후 제품에서 새로 한 번씩 실행한 결과입니다. 이 절의 전체 관문을 후보 1의 이전 측정 창과 합치지 않습니다.
- 충돌 파일은 `settle/DETAIL.md`, `settle/arrangeFieldNodeItems/DETAIL.md`, `settle/types/settlement.ts`, `blueprint/types/node.ts`, `settle/utils/slots/readSourceTree.ts`입니다(앞 경로는 `src/core/engine/` 기준). B6의 경로 경계와 슬롯 단일 원본 계약을 유지하고 B7의 압축·keep 선언·소멸 원본 읽기를 결합했습니다. 삭제된 `literalStarPrefixes`, `literalStarDescendantKeys`, `containsLiteralStar`는 되살리지 않았습니다.
- `DetachedWriteAddress.ts`의 압축 생존자 이동과 부모 사슬 소멸 검사는 유지합니다. `cloneSlotSubtree.ts`는 승인된 후보 5의 조건 한 줄과 영어 TSDoc을 고쳐 사적 나감 복제의 모든 원본을 복제본 칸에 연결합니다. `writeSlotPath.ts`는 B6의 `getSlotPathNames`를 사용하고 잘못된 슬롯 주소를 거절합니다. 충돌 해결과 명시적으로 승인된 후보 5 범위 외 제품·시험 변경은 없습니다.

### 표적 확인과 전체 관문

후보 5의 실패 먼저·수정 후 같은 시험과 78파일·516사례 표적을 먼저 확인했습니다. 최종 전체 unit에서 `clearing-array-keep` 겉면 9사례, 경로 격리 검사 5사례, `settle.pointer-path-work`의 siblings-0·oneOf-80 첫 실제 쓰기부터 full-parser 호출 0을 확인하는 2사례가 전부 초록입니다.

최종 제품에서 전체 시험은 프로젝트별로 한 번씩 순차 실행했습니다. 시험·typecheck·lint·build는 Node v24.20.0 기본 힙이며 힙 부족·힙 재시도·브라우저 연결 종료가 없었고 Storybook은 샤드 없이 한 번에 완료했습니다. build의 번들·선언 생성 뒤 마지막 typecheck 프로세스 종료 확인 직전에 unit을 시작한 짧은 겹침은 있었고, 해당 build의 exit 0을 이후 확인했습니다. 다른 시험 프로젝트는 겹치지 않았습니다. 설치는 하지 않았으며 배달과 측정 입력 준비는 Node v26.11.1, Bun 1.4.4 환경을 사용합니다.

| 관문 | 파일 | 통과 | todo | 실패 | 결과 |
| --- | ---: | ---: | ---: | ---: | --- |
| unit | 579 | 3853 | 1 | 0 | 통과 |
| render | 131 | 766 | 0 | 0 | 통과 |
| react18 | 131 | 766 | 0 | 0 | 통과 |
| production 프로젝트(`NODE_ENV=test`) | 9 | 20 | 0 | 0 | 통과 |
| storybook | 100 | 251 | 0 | 0 | 통과 |
| 다섯 프로젝트 합계 | 950 | 5656 | 1 | 0 | 통과 |
| verify-unit + verify-render | 715 | 4663 | 1 | 0 | 통과 |

`typecheck`, `lint`, 지정 `build`와 그 안의 development-flag·gate-selection 산출물 검사가 통과했습니다. 표의 production은 요청된 `test --run --project production` 호출입니다. 이 명령은 `NODE_ENV=test`로 실행되므로 B6 후보 3 인계에 기록된 `NODE_ENV=production`의 freeze 상한 실패를 해소했다는 증거로 쓰지 않습니다. 별도 `test:production`은 실행하지 않았습니다.

재현 명령은 저장소 루트 기준입니다. 각 프로젝트 종료를 확인한 뒤 다음 프로젝트를 실행했습니다.

```sh
yarn workspace @canard/schema-form typecheck
yarn workspace @canard/schema-form lint
yarn workspace @canard/schema-form build
yarn workspace @canard/schema-form test --run --project unit
yarn workspace @canard/schema-form test --run --project render
yarn workspace @canard/schema-form test --run --project react18
yarn workspace @canard/schema-form test --run --project production
yarn workspace @canard/schema-form test --run --project storybook
yarn workspace @canard/schema-form test:verify --run
```

[관문 요약과 원본 JSON 해시](raw/b7/final/gates.json).

### 전후 배달과 공개 겉면

A는 stage SHA의 별도 archive에서 지정 build를 실행했습니다. A/B 공개 `dist/index.d.ts`는 3,054바이트 동일하며 SHA-256은 `740dc55ca2f4f0503da3a7d6f968797a37cce7305e6d0d6b4d57c34e2b9158d6`입니다.

- B4-2 고정 장치: 72장면·430관측점, 차이 0건.
- 차이가 난 장면 이름: 없음 (`[]`).
- 마운트 장치: 6장면·12관측점, 차이 0건. 차이 장면 이름도 없음 (`[]`).
- 코퍼스에는 지움 배열 아래 keep 장면이 없습니다. 따라서 차이 0은 기존 배달 보존의 증거이며 B7 압축 계약은 위 표적·겉면·화면 시험으로 확인합니다.
- 후보 5 이전 배달 장치 첫 호출은 외부 scratch의 의존성 링크가 없어 모듈 적재 중 중단됐고 관측하지 못했습니다. 링크를 추가한 뒤 같은 A/B 입력으로 완료했으며 도구 로직·코퍼스는 바꾸지 않았습니다. 불완전 호출과 후보 5 이전 배달은 위 최종 성공 관측 수에 합치지 않았습니다. 후보 5 배달은 수정 후 B로 새로 실행했습니다.

[배달 요약](raw/b7/final/delivery-summary.json), [차이 목록](raw/b7/final/delivery-differences.json), [마운트 요약](raw/b7/final/delivery-mount-summary.json), [마운트 차이](raw/b7/final/delivery-mount-differences.json), [공개 겉면](raw/b7/final/public-surface.json).

### 최종 창

이 창의 측정 머리 B는 rebase 뒤 최종 제품 `ba0db9a426916b02e92a20c13bef6c7a30d7bb62`이고 기준 A는 B6 병합 stage `687c1d92402f1fd689c17afc6e0842861345d8c6`입니다. 공식 창은 1회이며 22행 × A/B 각 10프로세스 = 440프로세스, 20예열·100표본, `--quality=legacy`입니다. 대표값은 각 프로세스의 최소 지연 중앙값이고 A는 앞 5, A′는 뒤 5, B는 전체 10입니다. 후보 1의 창과 다른 B6 창은 이 수치에 합치지 않았습니다.

legacy 품질비는 호환 레인 18행의 B10/A10 중앙비 **0.9983922915008304**입니다. 유효 구간 0.95–1.05 안이므로 품질 판정은 **PASS**입니다. 호환 레인이 없어 뺀 행은 `switch-discriminator-80`, `switch-if-80`, `wave-1000`, `single-flat-1000-subscribed` 4행입니다.

입력 SHA-256은 `ee82857329a7d5e3d0b2ebefd0907648af95c2e5b68525ca5ca1130c9d18447c`입니다. 무시간 적재 점검 SHA-256은 `01517aa37326c05436982b24be808228042941ac68cb6584b515dfd8a3dd7132`이고 `timed`는 false이며 정식 표본이 아닙니다.

[입력과 해시](raw/b7/final/inputs.json), [단계 함수 경계](raw/b7/final/stage-inputs.json), [품질](raw/b7/final/quality.json), [원판정](raw/b7/final/judgement.json), [무시간 적재](raw/b7/final/untimed-load-check.json).

#### 환경

Node v26.11.1, Bun 1.4.4, Apple M1 Max, arm64, Darwin 27.0.0입니다. 5초 CPU 사전 검사의 기준은 프로세스 하나의 사용률 30%와 장치 heavy입니다. 이번 최종 창의 사전 검사는 1회이며 통과했습니다.

| 시도 | 시작 UTC | 최고 프로세스 | CPU % | 승인 |
| --- | --- | --- | ---: | --- |
| 1 | 2026-10-28T09:48:23.875Z | Stats | 5.4798 | 예 |

heavy는 비어 있습니다. 승인 직후 같은 프로세스가 formal-start를 배타적으로 만들었습니다. 정식 시작은 2026-10-28T09:48:28.990Z이고 창 종료는 2026-10-28T09:56:54.576Z입니다. 종료 코드는 0이고 invalid는 false입니다. 정식 표본이 생긴 뒤 재실행은 없습니다. [CPU 사전 점검](raw/b7/final/cpu-prechecks.json), [CPU 전후](raw/b7/final/window.json).

#### B7 고정 관문

판정은 고정 규칙의 결과만 적습니다. 채택은 코디네이터 결정입니다.

| 관문 | 판정 | 근거 |
| --- | --- | --- |
| legacy 품질비 0.95–1.05 | PASS | 18행 중앙비 0.9983922915008304 |
| TEST-073 주판정 회귀 0 | PASS | 전체 22행·인접 10쌍 회귀 0. 앞 절반 회귀 0. 뒤 절반 회귀 0 |
| switch-oneOf-80 장부 합계가 A 자체 폭 이내 | PASS | B 183.729 µs ≤ A 177.187 µs + 범위 8.270 µs |
| switch-siblings-0 장부 합계가 A 자체 폭 이내 | PASS | B 84.792 µs ≤ A 83.021 µs + 범위 2.813 µs |
| Node 노드당 힙 B 중앙값 ≤ A 최대 | PASS | B 1439.312 B/node ≤ A 최대 1897.229 B/node |

고정 장치 원판정은 **채택**이고 `adopt`는 true입니다. 장치 관문은 품질, TEST-073 주판정, 두 장부 합계, Node 힙입니다. 아래 개별 단계 7건은 A 프로세스 중앙값 범위를 넘은 진단 기록입니다. B7 장부 관문은 두 행의 합계로 판정합니다.

| 행 | 단계 | A 중앙 µs | A 범위 µs | B 중앙 µs |
| --- | --- | ---: | ---: | ---: |
| switch-oneOf-80 | markWrite | 1.791 | 0.125 | 1.959 |
| switch-oneOf-80 | wheelPreparation | 8.125 | 0.458 | 8.667 |
| switch-oneOf-80 | transitionSettlement | 4.125 | 0.000 | 4.271 |
| switch-oneOf-80 | everythingElse | 13.626 | 0.979 | 14.772 |
| switch-siblings-0 | registerRecalculation | 6.542 | 0.187 | 6.792 |
| switch-siblings-0 | primeHost | 3.355 | 0.083 | 3.458 |
| switch-siblings-0 | everythingElse | 11.667 | 0.147 | 11.916 |

#### 단계 장부 합계

단위는 쓰기당 µs입니다. A 범위는 A 세 프로세스 중앙값의 max−min입니다. `switch-payload-12`는 B7 장부 관문 행이 아니며 장치 플래그는 폭 이내입니다.

| 행 | A 중앙값 | A 프로세스 중앙값 | A 범위 | B 중앙값 | 폭 이내 | B7 관문 |
| --- | ---: | --- | ---: | ---: | --- | --- |
| switch-oneOf-80 | 177.187 | 177.1875, 179.0205, 170.7505 | 8.270 | 183.729 | 예 | PASS |
| switch-siblings-0 | 83.021 | 83.0210, 82.1665, 84.9795 | 2.813 | 84.792 | 예 | PASS |
| switch-payload-12 | 324.104 | 329.6455, 314.2710, 324.1040 | 15.374 | 321.313 | 예 | 해당 없음 |

`switch-siblings-0`의 후보 1에서 범위를 넘겼던 네 단계의 이번 포함 중앙값입니다. 폭 판정은 각 단계의 A 프로세스 중앙값 범위이고, B7 관문은 위 장부 합계입니다.

| 단계 | A 중앙 µs | A 범위 µs | B 중앙 µs | A 폭 이내 |
| --- | ---: | ---: | ---: | --- |
| computeNode | 54.251 | 1.209 | 55.041 | 예 |
| selectChildren | 25.708 | 1.166 | 26.167 | 예 |
| registerRecalculation | 6.542 | 0.187 | 6.792 | 아니오 |
| markWrite | 1.771 | 0.083 | 1.834 | 예 |

[단계 요약](raw/b7/final/stages.json), [보충 단계](raw/b7/final/supplemental-stages.json).

#### 전체 22행

단위는 ms입니다. 폭(다)는 요약의 `widthMs`이고 B/A10은 A 전체 10 기준입니다. 폭 판정 `미입증`은 지연 폭 라벨이며 B7 채택 관문이 아닙니다.

| 행 | A앞5 | B10 | A′뒤5 | A폭 | B폭 | A′폭 | 폭(다) | B/A10 | legacy비 | 폭 판정 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| single-flat-1000 | 0.110250 | 0.086292 | 0.102542 | 0.072500 | 0.065417 | 0.053083 | 0.072500 | 0.811 | 0.945 | 미입증 |
| mount-oneOf-80 | 2.351333 | 2.338021 | 2.341709 | 0.173501 | 0.073333 | 0.229583 | 0.229583 | 0.996 | 1.028 | 미입증 |
| mount-flat-1000 | 2.081709 | 2.122792 | 2.115916 | 0.050791 | 0.096459 | 0.099334 | 0.099334 | 1.015 | 1.000 | 미입증 |
| mount-nested-d6-f4 | 16.112750 | 16.455208 | 15.993000 | 0.338375 | 0.623666 | 0.716417 | 0.716417 | 1.022 | 0.987 | 미입증 |
| single-nested-d6-f4 | 0.120000 | 0.121875 | 0.115458 | 0.039958 | 0.036750 | 0.012875 | 0.039958 | 1.023 | 1.016 | 미입증 |
| switch-oneOf-80 | 0.203708 | 0.196104 | 0.201625 | 0.104167 | 0.144167 | 0.100083 | 0.104167 | 0.968 | 1.016 | 미입증 |
| bulk-flat-2000 | 1.854750 | 1.863604 | 1.927500 | 0.212167 | 0.115625 | 0.157584 | 0.212167 | 0.977 | 0.974 | 미입증 |
| bulk-nested-d6-f4 | 4.097125 | 4.193396 | 4.164250 | 0.313625 | 0.297334 | 0.427459 | 0.427459 | 1.016 | 1.006 | 미입증 |
| switch-discriminator-80 | 0.176459 | 0.169271 | 0.200375 | 0.013208 | 0.081708 | 0.107083 | 0.107083 | 0.958 | — | 미입증 |
| switch-if-80 | 0.299792 | 0.315063 | 0.307333 | 0.111666 | 0.072459 | 0.008624 | 0.111666 | 1.028 | — | 미입증 |
| switch-nested-oneOf-20 | 0.347958 | 0.351292 | 0.353875 | 0.107709 | 0.090542 | 0.149125 | 0.149125 | 1.001 | 1.010 | 미입증 |
| switch-siblings-0 | 0.082458 | 0.069188 | 0.070250 | 0.022709 | 0.032083 | 0.025333 | 0.025333 | 0.918 | 0.974 | 미입증 |
| switch-siblings-100 | 0.214042 | 0.208688 | 0.220125 | 0.015208 | 0.035083 | 0.040000 | 0.040000 | 0.961 | 0.993 | 미입증 |
| switch-siblings-1000 | 2.123042 | 2.066917 | 2.096792 | 0.112126 | 0.112416 | 0.077833 | 0.112126 | 0.980 | 0.979 | 미입증 |
| switch-siblings-4000 | 6.630500 | 6.628458 | 6.670042 | 0.195542 | 0.228042 | 0.078042 | 0.195542 | 0.995 | 0.936 | 미입증 |
| leaf-gate-250 | 0.031458 | 0.029875 | 0.030083 | 0.004750 | 0.012126 | 0.010417 | 0.010417 | 0.971 | 0.954 | 미입증 |
| leaf-gate-1000 | 0.027833 | 0.028354 | 0.031083 | 0.005042 | 0.012708 | 0.008376 | 0.008376 | 0.933 | 1.004 | 미입증 |
| leaf-gate-4000 | 0.783167 | 0.777604 | 0.783709 | 0.038083 | 0.046125 | 0.040333 | 0.040333 | 0.993 | 0.997 | 미입증 |
| leaf-gate-8000 | 1.575125 | 1.582104 | 1.579792 | 0.054875 | 0.094417 | 0.024292 | 0.054875 | 1.003 | 1.005 | 미입증 |
| wave-1000 | 1.675583 | 1.685479 | 1.665291 | 0.048916 | 0.108375 | 0.064418 | 0.064418 | 1.009 | — | 미입증 |
| single-flat-1000-subscribed | 0.070125 | 0.069771 | 0.073750 | 0.003167 | 0.006416 | 0.008500 | 0.008500 | 0.971 | — | 미입증 |
| switch-payload-12 | 0.412375 | 0.408896 | 0.408125 | 0.032000 | 0.089334 | 0.069209 | 0.069209 | 0.997 | 1.024 | 미입증 |

[프로세스별 최소값](raw/b7/final/results.summary.json).

#### TEST-073

1000/ms 처리율의 Welch 검정입니다. 감소 15% 초과와 p<0.05를 함께 적용하고, 전체 인접 10쌍을 주판정으로 사용합니다. 주판정 회귀는 0행입니다. 앞 5 보조 회귀는 0행이고 뒤 5 보조 회귀는 0행입니다.

| 행 | 전체 변화% | 전체 p | 앞5 변화% / p | 뒤5 변화% / p | 주판정 회귀 |
| --- | ---: | ---: | --- | --- | --- |
| single-flat-1000 | 0.512 | 0.8052 | -7.601 / 0.006397 | 9.052 / 0.003254 | 없음 |
| mount-oneOf-80 | 0.830 | 0.05314 | 1.786 / 0.001545 | -0.124 / 0.8479 | 없음 |
| mount-flat-1000 | -1.508 | 0.02161 | -4.219 / 1.68e-06 | 1.339 / 0.1671 | 없음 |
| mount-nested-d6-f4 | -1.716 | 0.003213 | -1.638 / 0.04666 | -1.793 / 0.02961 | 없음 |
| single-nested-d6-f4 | -3.464 | 0.002842 | -0.737 / 0.6583 | -6.087 / 0.000168 | 없음 |
| switch-oneOf-80 | -0.985 | 0.3958 | -2.332 / 0.1625 | 0.356 / 0.825 | 없음 |
| bulk-flat-2000 | 0.664 | 0.1531 | 1.590 / 0.01647 | -0.251 / 0.6998 | 없음 |
| bulk-nested-d6-f4 | -0.090 | 0.8974 | 0.127 / 0.898 | -0.307 / 0.7563 | 없음 |
| switch-discriminator-80 | -1.915 | 0.1269 | -1.032 / 0.5778 | -2.809 / 0.09648 | 없음 |
| switch-if-80 | -4.135 | 1.17e-06 | -3.210 / 0.006847 | -5.018 / 3.21e-05 | 없음 |
| switch-nested-oneOf-20 | 1.080 | 0.2662 | 0.452 / 0.7433 | 1.704 / 0.2126 | 없음 |
| switch-siblings-0 | 5.229 | 4.37e-05 | 8.870 / 1.85e-06 | 1.694 / 0.3357 | 없음 |
| switch-siblings-100 | 2.300 | 0.003189 | 2.534 / 0.0205 | 2.067 / 0.06331 | 없음 |
| switch-siblings-1000 | 0.436 | 0.09415 | 0.588 / 0.1173 | 0.284 / 0.4318 | 없음 |
| switch-siblings-4000 | 2.423 | 6.01e-11 | 4.527 / 8.9e-18 | 0.333 / 0.5157 | 없음 |
| leaf-gate-250 | 8.006 | 1.56e-06 | 10.805 / 5.29e-06 | 5.274 / 0.02439 | 없음 |
| leaf-gate-1000 | 3.830 | 0.02478 | -3.431 / 0.1394 | 11.802 / 2.43e-06 | 없음 |
| leaf-gate-4000 | -0.776 | 0.03553 | -2.191 / 3.82e-05 | 0.668 / 0.1897 | 없음 |
| leaf-gate-8000 | 0.721 | 0.007112 | 1.850 / 1e-06 | -0.390 / 0.3014 | 없음 |
| wave-1000 | -0.779 | 0.009802 | -1.035 / 0.01656 | -0.523 / 0.2149 | 없음 |
| single-flat-1000-subscribed | 4.010 | 0.003768 | 4.308 / 0.03227 | 3.705 / 0.05073 | 없음 |
| switch-payload-12 | 1.818 | 0.05685 | -9.134 / 4.54e-13 | 13.813 / 3.51e-23 | 없음 |

#### 힙과 보존량

각 7표본입니다. Bun은 보고만 하며 B7 채택 관문에 넣지 않습니다. Bun도 B 중앙값이 A 최대 이하입니다.

| 런타임 | A 중앙 B/node | A 최대 | B 중앙 | 기록 |
| --- | ---: | ---: | ---: | --- |
| node | 1445.085 | 1897.229 | 1439.312 | PASS |
| bun | 2228.351 | 2237.969 | 2228.241 | 보고 |

Node A 7표본은 1897.229, 1451.007, 1430.946, 1445.085, 1447.491, 1437.500, 1435.588 B/node입니다. Node B 7표본은 1895.819, 1450.707, 1430.946, 1439.312, 1440.179, 1437.647, 1434.470 B/node입니다. Bun A 7표본은 2237.969, 2235.445, 2228.578, 2228.351, 2227.931, 2227.471, 2227.502 B/node입니다. Bun B 7표본은 2237.995, 2228.241, 2228.174, 2234.935, 2235.031, 2228.166, 2227.418 B/node입니다.

[힙 표본](raw/b7/final/heaps.json).

| 행 | 슬롯 | 보존 노드 | 읽기 전 B | 읽기 후 B | reset 후 slot Map |
| --- | ---: | ---: | ---: | ---: | ---: |
| switch-oneOf-80 | 3 | 3 | 5456 | 5776 | 0 |
| switch-payload-12 | 12 | 12 | 19304 | 19880 | 0 |
| switch-siblings-0 | 0 | 0 | 0 | 0 | 0 |

120쓰기 후 V8 strong-edge immediate dominator로 각 inactiveSlots Map이 독점 보유한 원본 트리 바이트입니다. `switch-siblings-0`은 호스트가 없습니다. resetSubtree, 배달 drain, full GC 2회 후 slot Map은 모두 0입니다. [보존량](raw/b7/final/retention.json).

생존 아이템에서 이미 지워진 자손의 쓰기 칸 재배치 한계와 생존 아이템 0개인 배열의 잠재 쓰기 범위는 후보 3–5의 알려진 한계를 유지합니다. 독립 검토·PR 생성·통합은 코디네이터 소유입니다.
