# 02 통합 검증 대조

## 판정 범위

검증자는 PLAN 전체와 02의 request → adr-and-axes → verification 순서로 읽고, TEST-067·077, BLUEPRINT-039, ERROR-164, LANDING-159, WRITE-099 원문을 대조했습니다. 구현 중간 보고서의 부분 성공을 최종 통합 성공으로 사용하지 않습니다. 이 문서는 통합 실행 준비 단계이며, 아래 대기 항목은 아직 통과 판정이 아닙니다.

## 실제 검증 명령

루트에는 lint·typecheck·test 스크립트가 없습니다. 패키지 지정 명령으로 검증합니다. schema-form의 test는 Vitest이므로 종료형 검증에는 `--run`을 붙입니다.

| 범위 | 명령 | 상태 |
| --- | --- | --- |
| schema-form 세 프로젝트 | `yarn workspace @canard/schema-form test --run` | 최종 구현 준비 신호 대기 |
| schema-form lint | `yarn workspace @canard/schema-form lint` | 최종 실행 대기 |
| schema-form strict | `yarn workspace @canard/schema-form typecheck --strict` | 최종 실행 대기 |
| schema-form 빌드·산출물 | `yarn workspace @canard/schema-form build` | 최종 실행 대기; dist는 커밋 제외 |
| 시나리오 | `yarn workspace @aileron/schema-form-scenarios test` | 기존 4파일·10시험 증거 있음; 최종 변경 범위 대조 필요 |
| 시나리오 strict·lint | `yarn workspace @aileron/schema-form-scenarios typecheck` / `lint` | 기존 exit 0 증거 있음 |
| common-utils | 패키지 test·lint·typecheck·build | merge 보고서의 1,166시험 및 exit 0 증거 재사용 대상 |
| v7 | REPORT-v7.md의 Node 회귀 명령 | 기존 35시험 증거 재사용 대상 |
| filid | 루트 조정자가 PR 경계에서 1회 수행 | 검증자가 별도 실행하지 않음 |

unit은 `src/**/*.{spec,test}.ts`, render는 TSX와 DOM 의존 VirtualizationManager 시험이며 두 글롭은 `src/__legacy__`를 포함합니다. Storybook은 addon-vitest가 스토리를 수집해 headless Chromium으로 실행합니다. spikes의 v7은 제품 Vitest 글롭 밖의 별도 회귀 장치입니다.

## 원장 게이트 대조

| 게이트 | 현재 증거와 제한 |
| --- | --- |
| 기반 하니스·옛 시험 | harness-report.md의 236파일·3,870시험은 당시 blueprint 진입점 부재로 전체 exit 1이었습니다. 최종 통합 성공으로 인용할 수 없습니다. Storybook 당시 49파일·390시험은 exit 0입니다. |
| 기준선 고정 | baseline/의 고정 결과와 해당 보고서를 사용합니다. 02 엔진 비교 게이트는 기준선이며 03부터 비교합니다. |
| 잎 교차·legacy 보존 | legacy-migration.md: 80주소 이동, 원래 주소 잔존 0·목적지 누락 0, 31파일·572시험. const의 깊은 비교만 원장 허용 변경입니다. |
| 컴파일러 이동 | expression-migration.md: 전후 543 AST 시험 호출 동일, 이동 후 54파일·543시험. nullable 생성자 때문에 당시 패키지 타입 검사는 실패했으므로 별도 통합 확인이 필요합니다. |
| 병합·제거 | effective-schema-report.md: 2파일·25시험. 패키지 strict 당시 nullable 생성자 오류가 남아 있었습니다. |
| E1–E42·union·코드별 사례 | 청사진 worker의 최종 결과와 실제 실행을 대조할 예정입니다. 정착·값 변경·렌더 게이트는 이후 단계 소관입니다. |
| TEST-067(a) | scanner-corpus.md는 exit 방문자에서 referencePath/referenceResolved와 cycle 신호를 확인합니다. 원본 코퍼스 스캔 종료는 청사진 수용과 별개입니다. |
| TEST-067(b) | 원본 14종의 청사진 수용과 BLUEPRINT-039의 형 없는 객체/배열 분기 금지가 충돌합니다. 소유자 결정 대기이며 초록으로 표시하지 않습니다. |
| TEST-067(c)·(d) | 무한 형상 셋의 오류 및 배열·게이트·터미널 절단, 청사진 1회 비용은 최종 청사진 결과 확인 대기입니다. (c′)는 03입니다. |
| merge 성능 | 최종 네 번째 측정 기본 경로 -3.38%는 소유자 수용 대기입니다. 변동 범위가 커서 성능 개선을 보장하는 결과로 쓰지 않습니다. |
| 교차 확인·PR | codex·antigravity 결과, seiri 최종 대조, filid 결과와 발견 기록은 아직 필요합니다. |

## 읽기 감사

변경 및 미추적 TS·TSX·MJS 401파일을 텍스트 기반으로 조사했습니다. wildcard export는 없었습니다. 여러 내보낸 함수 후보는 보존 이동한 legacy distributeSubSchema와 기존 Storybook 파일이며 새 구현 위반으로 세지 않았습니다. 이 조사는 AST/DAG 검증을 대신하지 않습니다.

새 v7의 `buildSchema(schema, value, options)`와 `declarationOrder(schema)` 문서에는 매개변수·결과 설명이 없어 보완이 필요하다고 루트 조정자에게 전달했습니다. `createContext()`는 인자가 없고 반환 설명이 있으므로 같은 지적에서 제외했습니다.

전체 filid 스캔은 수행하지 않았으며, 아직 DAG·max-depth 통과를 주장하지 않습니다. 기존 legacy 대형 시험을 새 코드의 사례 상한 위반으로 바꾸어 보고하지 않습니다.
