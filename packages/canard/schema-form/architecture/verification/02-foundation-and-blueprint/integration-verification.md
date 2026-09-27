# 02 통합 검증 대조

## 판정 범위

검증자는 PLAN 전체와 02의 request → adr-and-axes → verification 순서로 읽고, TEST-067·077, BLUEPRINT-039, ERROR-164, LANDING-159, WRITE-099 원문을 대조했습니다. 이후 `origin/1.0.0-beta`의 `85fa44d49`로 리베이스한 문서 변경을 다시 대조했습니다. 구현 중간 보고서의 부분 성공을 최종 통합 성공으로 사용하지 않습니다. 2026-09-27 통합 검증에서 실제 실행한 항목과 남은 항목을 구분합니다. 아래 대기 항목은 통과 판정이 아닙니다.

## 실제 검증 명령

루트에는 lint·typecheck·test 스크립트가 없습니다. 패키지 지정 명령으로 검증합니다. schema-form의 test는 Vitest이므로 종료형 검증에는 `--run`을 붙입니다.

| 범위 | 명령 | 상태 |
| --- | --- | --- |
| schema-form 세 프로젝트 | `yarn workspace @canard/schema-form test --run` | 337파일·4,393시험 통과, exit 0 — `integration-schema-form-test.log` |
| schema-form lint | `yarn workspace @canard/schema-form lint` | exit 0 — `integration-schema-form-lint.log` |
| schema-form strict | `yarn workspace @canard/schema-form typecheck --strict` | exit 0 — `integration-schema-form-typecheck.log` |
| schema-form 빌드·산출물 | `yarn workspace @canard/schema-form build` | exit 0 — `integration-schema-form-build.log`; dist는 커밋 제외 |
| 시나리오 어댑터 | `yarn workspace @aileron/schema-form-scenarios test` | 4파일·10시험 통과, exit 0 — `integration-scenarios-test.log` |
| 시나리오 strict | `yarn workspace @aileron/schema-form-scenarios typecheck` | exit 0 — `integration-scenarios-typecheck.log` |
| 시나리오 lint | `yarn workspace @aileron/schema-form-scenarios lint` | exit 0 — `integration-scenarios-lint.log` |
| common-utils | 패키지 test·lint·typecheck·build | merge 보고서의 1,166시험 및 exit 0 증거 재사용 대상 |
| v7 | REPORT-v7.md의 Node 회귀 명령 | 기존 35시험 증거 재사용 대상 |
| filid | 루트 조정자가 PR 경계에서 1회 수행 | 검증자가 별도 실행하지 않음 |

unit은 `src/**/*.{spec,test}.ts`, render는 TSX와 DOM 의존 VirtualizationManager 시험이며 두 글롭은 `src/__legacy__`를 포함합니다. Storybook은 addon-vitest가 스토리를 수집해 headless Chromium으로 실행합니다. spikes의 v7은 제품 Vitest 글롭 밖의 별도 회귀 장치입니다.

명령이 출력 없이 성공한 lint·타입 검사 로그는 빈 파일이며, 위 exit 0은 실행 도구가 반환한 종료 코드입니다. build는 rolldown, 선언 빌드, 산출물 해시, 패키지 타입 검사를 모두 마쳤습니다. 빌드 직후 git status에 생성 런타임 산출물 변경은 없었습니다.

세 프로젝트 결과는 unit 237파일·3,468시험, render 51파일·535시험,
Storybook Chromium 49파일·390시험입니다. 전체 실행 시간은 43.85초입니다.
마지막 진단 교정(의존 사전의 프로토타입 키, wildcard 경로 조각,
잘못된 참조 오류 위치)이 포함된 소스로 전체 시험을 마쳤으며, 이후 같은
소스의 lint·strict·build를 다시 확인했습니다. 의도된 오류 입력 시험의
stderr는 원로그에 보존했으며 실패 시험은 없습니다.

TEST-023의 코어 러너 배치는 `b4d7a552`에서 교정했습니다. 제품 `src/core/__tests__/scenarios/utils/`가 러너와 기존 시험 3건을 소유하며 비공개 패키지는 이를 내보내거나 가져오지 않습니다. 화면 실행은 패키지의 등록된 화면 어댑터가 맡습니다. [배치 및 단언 보존 증거](./scenario-runner-placement.md)는 초기 하니스 기록을 대체하지 않고 현재 배치를 별도로 검증합니다. 빈 시나리오 패밀리는 여전히 실제 엔진 시나리오 0개입니다.

## 원장 게이트 대조

| 게이트 | 현재 증거와 제한 |
| --- | --- |
| 기반 하니스·옛 시험 | 초기 harness-report.md의 전체 exit 1과 구분하여 최종 세 프로젝트 337파일·4,393시험의 exit 0을 확인했습니다. 기존 시험과 새 청사진·이동 시험이 모두 포함됩니다. |
| 기준선 고정 | baseline/의 고정 결과와 해당 보고서를 사용합니다. 02 엔진 비교 게이트는 기준선이며 03부터 비교합니다. |
| 잎 교차·legacy 보존 | legacy-migration.md: 80주소 이동, 원래 주소 잔존 0·목적지 누락 0, 31파일·572시험. const의 깊은 비교만 원장 허용 변경입니다. |
| 컴파일러 이동 | expression-migration.md: 전후 543 AST 시험 호출 동일, 이동 후 54파일·543시험. 당시 nullable 생성자 타입 오류는 최종 strict에서 해소됨을 확인했습니다. |
| 병합·제거 | effective-schema-report.md: 2파일·25시험. 당시 남았던 패키지 nullable 생성자 오류는 최종 strict에서 해소됐습니다. 최종 전체 시험에도 해당 시험이 포함되어 통과했습니다. |
| E1–E42·union·코드별 사례 | blueprint-worker.md의 판정·진단 코드별 매핑과 후속 진단 회귀를 포함하여 전체 시험이 통과했습니다. 정착·값 변경·렌더 게이트는 이후 단계 소관입니다. |
| TEST-067(a) | scanner-corpus.md는 exit 방문자에서 referencePath/referenceResolved와 cycle 신호를 확인합니다. 원본 코퍼스 스캔 종료는 청사진 수용과 별개입니다. |
| TEST-067(b) | `85fa44d49`에서도 원본 14종의 청사진 수용과 BLUEPRINT-039·BLUEPRINT-045 E16의 형 없는 객체/배열 분기 금지가 충돌합니다. 아래 독립 재대조 결과에 따라 초록으로 표시하지 않습니다. |
| TEST-067(c)·(d) | 무한 형상 셋의 오류 및 배열·게이트·터미널 절단, 청사진 1회 비용은 최종 청사진 결과 확인 대기입니다. (c′)는 03입니다. |
| merge 성능 | 초기 네 번째 측정 기본 경로 -3.38%는 비회귀 증거로 쓰지 않습니다. 실제 옵션 도입 전 베이스와 독립 프로세스 8회 비교한 후속 조사 및 최종 판정을 foundation 보고서에서 대조합니다. |
| 교차 확인·PR | codex·antigravity 결과, seiri 최종 대조, filid 결과와 발견 기록은 아직 필요합니다. |

## 읽기 감사

변경 및 미추적 TS·TSX·MJS 401파일을 텍스트 기반으로 조사했습니다. wildcard export는 없었습니다. 여러 내보낸 함수 후보는 보존 이동한 legacy distributeSubSchema와 기존 Storybook 파일이며 새 구현 위반으로 세지 않았습니다. 이 조사는 AST/DAG 검증을 대신하지 않습니다.

최종 변경 범위 중 청사진·잎 교차·시나리오 패키지·v7의 비시험 소스 220파일을 추가 대조했습니다. TypeScript AST의 exported 함수 선언 및 함수형 변수 선언에서 문서 주석 누락 후보는 0개였고, 텍스트 후보 검사에서 wildcard export와 한 파일의 여러 exported 함수도 없었습니다. 진입점·선언 수집·자식 연결·화면 및 코어 실행기를 직접 읽어 목적·입력·결과 주석, 명시 경계 가져오기, 주입된 실행 계약을 확인했습니다. 자동 후보 검사는 전체 의미 감사나 DAG 판정을 대신하지 않습니다.

새 v7의 `buildSchema(schema, value, options)`와 `declarationOrder(schema)` 문서에 매개변수·결과 설명이 없다는 지적은 worker가 보완했습니다. `createContext()`는 인자가 없고 반환 설명이 있으므로 같은 지적에서 제외했습니다.

전체 filid 스캔은 수행하지 않았으며, 아직 DAG·max-depth 통과를 주장하지 않습니다. 기존 legacy 대형 시험을 새 코드의 사례 상한 위반으로 바꾸어 보고하지 않습니다.

읽기 감사에서 루트에 전달한 추가 항목은 다음과 같습니다. 아래는 수정 후 최종 재대조 전의 발견이며, 통과 판정이 아닙니다.

- BLUEPRINT-044의 터미널 하위 예약 키 경고는 `{schemaPath, keys, paths}`와 `(code, schemaPath)` 단위 수집을 요구합니다. 최초 구현의 하위 위치·keyword별 발생은 집계 계약과 달랐습니다.
- discriminator 경고가 최초 방문 path만 찾던 공유 참조 문제는 소유 노드의 childEntries 조회로 보완된 것을 읽기 확인했습니다.
- ERROR-164의 CONDITION_INDEX·CONDITION_INDICES는 새 analyzer가 임의로 만드는 오류로 시험할 수 없습니다. 잔류 기존 factory의 실제 발생 경로와 기존 시험 증거로 구분해야 합니다. ALL_OF_KEYWORD_IGNORED_FOR_FORM과 dependency 경고의 코드 단언도 최종 시험에서 확인해야 합니다.
- 최신 TEST-014 전략 게이트 가운데 정적 나중 승, 단독 조각 선언의 부재 상태 제외, 정적 explicit 전략 뒤 인라인 판정, 판정 undefined의 이전값 보존은 구체적인 시험 매핑이 필요합니다. 읽은 구현은 해당 분기를 포함하지만 시험 없이 게이트 통과로 세지 않았습니다.

위 의미 감사의 후속 교정은 blueprint-worker.md의 코드별 증거와 최종 전체
시험에서 확인했습니다. CONDITION_INDEX·CONDITION_INDICES는 기존 factory
검증으로 남겨 새 analyzer의 도달 가능한 오류로 꾸미지 않았습니다.

최종 seiri 함수 경계 대조에서 신규 보조 함수 두 개의 본문 8줄 한도
위반을 발견했고, `7dd3678f`의 교정을 읽기로 재검증하여 닫았습니다.
`compileBlueprintExpressions.ts`의 `register`와 `validateShape.ts`의
`visit`은 각각 소유 함수 이름 아래 `utils/`의 독립 함수 파일로
추출됐습니다. context·선언·순회 집합을 명시 인자로 받으며 파일마다
내보낸 함수가 하나이고 목적·입력·결과 문서 주석이 있습니다. 기존
검증 및 재귀 순서와 오류 코드를 보존하며 공개 청사진 진입점은
넓어지지 않았습니다.

[보조 함수 추출 증거](./blueprint-helper-extraction.md)와
`blueprint-helper-test.log`의 2파일·17시험 성공을 확인했습니다.
lint·format·strict도 담당 실행의 exit 0 증거가 있습니다. 최종 전체
4,393시험 이후의 의미 보존 추출이므로 기존 전체 실행과 해당 영역의
추출 후 재검증을 함께 사용합니다. 별도 CPU 검사는 재실행하지 않았습니다.
이 읽기 감사에서 확인된 신규 seiri 지적은 모두 닫혔으며, 기존 legacy의
구조 예외와 최종 filid 판정은 서로 구분합니다.

## TEST-067 독립 재대조

`85fa44d49`에서 BLUEPRINT-037–045, TEST-067, LANDING-122·128·174–180, 정본 소유자 답변 30·32·33행, round-18-closing의 18C-01 및 18C-90, 원본 corpus.mjs와 round11-corpus/REPORT.txt를 대조했습니다.

- BLUEPRINT-044는 S3에서 형 없는 칸을 판정한 뒤 S4에서 이미 object·array인 칸의 variant 규칙을 적용합니다. BLUEPRINT-045 E16은 형 없는 `oneOf:[object,object]`를 명시적으로 `UNKNOWN_JSON_SCHEMA`로 정합니다. 따라서 BLUEPRINT-039의 object variant 보존 문장만으로 코퍼스의 형 없는 호스트를 수용할 수 없습니다.
- TEST-067의 정본인 round-18-closing:43–51은 14종이 모두 서는 것과 무한 형상 표본을 통과 조건으로 직접 지정하고, 실패하면 소유자에게 올리도록 합니다. 근거인 round11 보고서는 원본을 pure 모드로 사용하고 lazy `$ref` Proxy로 해석하여 14종이 예외 없이 빌드되었다고 설명합니다. 따라서 “선다”를 스캐너 종료 또는 오류로 끝난 분석까지 포함하는 말로 축소할 근거가 없습니다.
- 원본 14종은 모두 형 없는 객체 분기 호스트를 포함합니다. 재귀 pydantic 표본은 루트와 items에도 같은 구조가 있습니다. LANDING-174의 신규 수용은 형 없는 **원시** 분기이며, 코퍼스 게이트용 자동 type 추가나 입력 변형을 승인하지 않습니다.
- 소유자 답변에 따른 BLUEPRINT-039/E16의 구현 규칙을 지키는 것과 TEST-067(b)의 수용 게이트를 통과하는 것은 별개입니다. 명시 type을 더한 표본은 이주 보조 실험으로 기록할 수 있으나 원본 14종의 통과 증거로 대체할 확정 근거는 없습니다.

결론은 원장 내부의 수용 게이트 충돌입니다. 원장을 편집하거나 구현에서 예외를 추가하지 않았으며, 루트 조정자에게 근거를 전달했습니다.
