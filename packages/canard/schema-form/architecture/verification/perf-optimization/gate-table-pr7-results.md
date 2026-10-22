# 결정 62 PR-7 — 기본 시험의 출하 경로와 전용 verify 번들

기준 커밋은 `e04ce2e2728a9b4be15b6ceaac53e4430e12d528`입니다. 기본 unit·render·react18 시험이 실제 배포 설정으로 실행되도록 바꾸고, 그림자 검증은 별도 번들로 분리했습니다. 제품 코드, 저장 스냅샷, production·storybook 프로젝트 본문은 변경하지 않았습니다. 벤치마크는 실행하지 않았습니다.

## 실행 설정

| 프로젝트 | 환경 | gate wheel | gate table | derive shadow |
| --- | --- | --- | --- | --- |
| unit | Node | skip | table | off |
| render | jsdom, React 19 | skip | table | off |
| react18 | jsdom, React 18 | skip | table | off |
| verify-unit | Node | shadow | verify | on |
| verify-render | jsdom, React 19 | shadow | verify | on |

기본 세 프로젝트는 `setupShippedGateEvaluation.ts`를 사용합니다. `setupDeriveShadowEvaluation.ts`는 verify 두 프로젝트만 사용하며, 기존 그림자 `afterAll` 단언과 파일별 `GATE_TABLE_ASSERTIONS` 출력을 보존합니다. 기본 프로젝트 선택 목록은 기존 unit·render·react18·production·storybook이며 verify는 명시적으로 선택합니다. Node/jsdom을 보존하기 위해 검증 번들을 둘로 나눴습니다.

```sh
yarn workspace @canard/schema-form test --run --project unit --project render --project react18
yarn workspace @canard/schema-form test:verify --run
yarn workspace @canard/schema-form test --run --project verify-unit --project verify-render
```

PR-2b 결과 문서에서 도입한 `SCHEMA_FORM_GATE_WHEEL_MODE` 전환과 기존 `SCHEMA_FORM_GATE_SELECTION_MODE` 전환은 PR-7의 시험 setup에서 제거했으며, 이제 환경 변수 대신 프로젝트 선택으로 두 실행 구성을 고릅니다.

## verify 전용 파일

아래 파일은 모두 settle의 `__tests__`에 있으며, 기본 unit의 exclude에만 추가했고 verify-unit에는 그대로 포함했습니다. 각 파일 첫 줄에 verify 전용 실행과 이유를 표시했습니다.

| 파일 | 이유 |
| --- | --- |
| settle.gate-table-characterization.test.ts | 저장된 선택 이력의 방문 기록이 shadow 기준입니다. |
| settle.gate-table-wheel-characterization.test.ts | 저장된 바퀴 이력의 방문 기록이 shadow 기준입니다. |
| settle.gate-selection-preparation-invariants.test.ts | 고정된 섹션 해시가 shadow 실행 이력의 바이트를 비교합니다. |
| settle.gate-table-key-order.test.ts | 키 순서 변경을 거부하는 대조군이 같은 shadow 스냅샷을 사용합니다. |
| settle.derive-shadow.test.ts | package setup이 derive shadow를 켰다는 계약 자체를 검증합니다. |

새로 모드를 고정한 파일은 `settle.derive-convergence.test.ts`입니다. 정확한 결정 이력에는 빈 확인 평가가 포함되어야 하므로 첫 시험에서 derive shadow를 켰고, 잘못된 proof가 거부되는지 확인하는 시험에서도 이를 명시했습니다. 기존 `afterEach`가 각 프로젝트의 setup 값으로 복구합니다. 다른 동작 시험은 기본 출하 설정으로 남습니다.

`selectChildren.plan-lookup-counts.test.ts`는 기존 shadow/table의 `6B−2`회와 skip/table의 4회 기대를 각 시험에서 저장·고정·복구하므로 유지했습니다. `settle.gate-table-counts.test.ts`도 기존 skip 바퀴와 off/table 선택을 유지했습니다. `blueprint.owned-inline-counts.test.ts`의 네 동결 기대는 기본·verify 양쪽에서 그대로 통과하여 새 모드 고정이나 숫자 변경이 필요하지 않았습니다. 관련 대상 재검증은 11파일·80시험 통과입니다.

## 게이트 결과

기록 위치는 원본 저장소의 `.seiri/tasks/gate-table-pr7-442/gates/`입니다. 초기 immutable 설치와 필요한 Winglet 네 패키지 빌드 후 schema-form 빌드를 실행했습니다. 측정 창이 열려 있던 동안 CPU 집약 명령은 보류했습니다.

| 게이트 | 결과 | 증거 |
| --- | --- | --- |
| typecheck | 종료 0 | typecheck.log |
| lint | 종료 0 | lint.log |
| build 및 출하 모드 검사 | 종료 0, 세 번들 table | build-final.log |
| 기본 unit·render·react18 | 698파일, 4,931통과, 실패 0, 기존 todo 1 | default.json·default.log |
| verify-unit·verify-render | 589파일, 4,249통과, 실패 0, 기존 todo 1 | verify.json·verify.log |
| production | 9파일, 20통과, 실패 0 | production.json·production.log |
| Storybook | 실행 합집합 100파일, 251통과, 제품 단언 실패 0 | storybook.json·storybook-retry-1.json 및 각 log |
| 실행 파일 집합 | 변경 전과 동일한 고유 589파일 | before-files.json·final-selected-files.json·summary.log |
| FCA 기준 비교 | 새 구조·진단·검증 발견 0 | fca-delta.log 및 세 전체 보고서 |

첫 기본 실행은 701파일 중 697통과·4실패, 4,931통과·6실패·1todo였습니다. 위의 추가 전용 파일 세 개와 derive-convergence의 두 플래그 고정 후 최종 기본 전체 실행이 통과했습니다. 최초 실패 결과와 대상 재검증 결과도 `default-initial.*`, `mode-targeted.*`로 보존했습니다.

Storybook 첫 전체 실행은 26파일·81시험을 통과한 뒤 Chromium WebSocket 연결 종료로 종료 1이었습니다. JSON의 빈 파일 항목을 실행 성공으로 세지 않았습니다. 미실행 74파일만 단독 warm-cache 실행하여 74파일·170시험 통과·종료 0을 확인했습니다. 두 실행의 실제 단언을 가진 통과 파일 합집합은 100파일·251시험이며 제품 단언 실패는 0입니다. 브리프의 425C-02에 따라 분류했고, 최초 종료 1과 원문을 그대로 보존했습니다.

변경 전 수집은 unit 475·render 114·react18 114파일이었고, 최종 기본 수집은 unit 470·render 114·react18 114파일입니다. verify는 unit의 기존 475파일과 render의 기존 114파일을 실행합니다. 기본 실행의 고유 584파일과 verify의 고유 589파일의 합집합이 변경 전 고유 589파일과 정확히 같으며, 누락·추가는 없습니다. 각 실제 실행 파일에 단언이 존재하는지도 검사했습니다.

## verify 단언 계수

`verify.log`의 파일별 `GATE_TABLE_ASSERTIONS`를 합산했습니다. 기본 setup에는 이 출력이나 shadow 전용 `afterAll` 단언이 없습니다.

| 불변식 | 합계 |
| --- | ---: |
| S1 | 167,998 |
| S2 | 1,031,363 |
| S2′ | 315,311 |
| S3 | 136,690 |
| S4 | 2,557 |
| S5 | 7,711 |

scaffold 음성 대조의 `matching`과 `forced`는 각각 1회로 별도 기록하며 위 합계에 포함하지 않았습니다.

## 출하 번들 SHA256

세 값은 PR-6 결과와 같습니다. 런타임 산출물은 소스 커밋에 넣지 않았으며 빌드 후 추적 파일 변경도 없었습니다.

| 번들 | SHA256 |
| --- | --- |
| index.mjs | 0af0e9ae48656496245a1d01a0b099290e0eb628d3d3bc54b13e1f03f986e829 |
| index.node.mjs | 3aa549fa9d8709be6c0dc516db2f8c5a224c5cca8574899fd34196d8f075903d |
| index.cjs | a9d3dfb92a1cad88e442ffa2f04d130583df6a9ecaee38d05436d79dfa4b4d7e |

## FCA 분석 범위와 제한

기본 source 확장자 범위의 참조 사실 2,702개를 추출·제출했고 모두 exact이며 미해결 참조 사실은 없습니다. 전체 여섯 구조 범위와 검증 문서를 검사한 세 보고서의 snapshot은 `7996b2bc8229ceb7d4d2be6feb90d839dd13b6377674b1865391df37355fe913`로 일치합니다.

PR-6 전체 보고서와 작업트리 루트 경로만 정규화해 전체 발견 객체를 비교했습니다. 구조 384개(기존 failed 19 포함), 진단 130개, 검증 24개가 모두 동일하고 추가·제거가 없습니다. 전체 분석 상태는 기존과 같은 `indeterminate`이며 PASS로 바꾸지 않았습니다. 이번 변경의 게이트는 기존 발견을 유지하면서 새 발견이 없다는 조건을 확인합니다. 진단과 nextAction은 전체 보고서에 보존했습니다.

재현 검사는 작업 namespace의 `check-config.mjs`, `analyze-gates.mjs`, `compare-fca.mjs`이며 계획·게이트 원장·리뷰 인계도 같은 namespace에 보존합니다.
