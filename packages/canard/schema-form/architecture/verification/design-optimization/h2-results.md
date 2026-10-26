# H2 — 바퀴 없는 경로의 전체 값 비교 생략

## 가설과 범위

바퀴가 돌지 않은 terminal·형상 불변 branch는 `updateOutput`이 끝낸 참조 보존을 다시 깊은 비교하지 않습니다. 실제 바퀴의 고정 출발점·비교·정리는 그대로이며 자식 하강 뒤 바퀴로 승격할 때에는 하강 전 참조 다섯 개를 사용합니다. 객체 스냅숏은 실제 바퀴 진입 뒤에만 만듭니다. H1 변경을 포함하지 않은 기준 `bc0fb3d0a`에서 작업했습니다.

## 수정 전후 시험

`settle.non-wheel-preservation.test.ts`는 형제 250·1,000·4,000개 옆의 잎을 준비 쓰기 한 번 뒤 다시 바꿉니다. 비교 함수 외부 진입과 넓은 값 전체 키 열거를 별도로 계수합니다. 모듈 스파이는 `sameValue` 본문의 지역 재귀를 가로채지 못하므로 외부 진입 수를 재귀 전체 호출 수로 부르지 않습니다.

| 형제 수 | 전 sameValue 진입 | 후 진입 | 전 전체 키 열거 | 후 열거 |
| ---: | ---: | ---: | ---: | ---: |
| 250 | 7 | 3 | 4 | 0 |
| 1,000 | 7 | 3 | 4 | 0 |
| 4,000 | 7 | 3 | 4 | 0 |

최종 새 시험을 원본 소스에 다시 적용하여 비교 상한 3에서 세 번 실패했고(`/private/tmp/448-h2/red-steady.log`), 수정 뒤 네 시험이 모두 통과했습니다. 다른 시험은 파생 중간값 되돌림과 형제의 injectTo 변경 뒤에도 변하지 않은 조상의 공개 value·outputValue, children·schema·active 및 값 revision이 유지됨을 확인합니다. 기존 시험 단언과 golden은 바꾸지 않았습니다.

## 남은 열거의 출처 — D2 인계

마운트 직후 첫 쓰기는 전체 키 열거가 7→3회로 줄지만 0은 아닙니다. 남은 3회는 `assembleObject.ts:229`의 STABLE_SHAPES cold 불일치에서 이전 값 키를 한 번 열거하고, 그 fallback을 받는 `updateOutput.ts:72`가 `sameValue`의 왼쪽·오른쪽 키를 두 번 열거하는 비용입니다. 키 스택 증거는 `/private/tmp/448-h2/keys-stack.log`이며 한 번 준비 쓰기 뒤에는 이 불일치가 사라집니다.

코디네이터가 Object.keys 0의 판정을 이 준비 뒤 steady 쓰기로 명시 승인했습니다. 성능 합격은 20회 예열하는 탐침으로 판정합니다. 첫 쓰기의 cold 행 캐시 비용은 범위를 넓히지 않고 D2 인계 목록에 남깁니다. assembleObject·updateOutput 제품 코드는 바꾸지 않았습니다.

## 비용과 검증 상태

형상 불변 경로의 추가 참조 보존 비용은 지역 참조 다섯 개 O(1)이며 스냅숏 객체를 할당하지 않습니다. 부모의 불변 값 사본 O(호스트 폭)은 남지만, `preserveReferences`에서 local·emit을 전체 깊은 비교하는 시간·키 배열 할당을 없앱니다. 새 상주 캐시·노드 필드·공개 API는 없습니다. 비바퀴의 children·active 복원은 새 선택이 없어 필요하지 않으며 terminal 루트 schema 선택의 기존 변경 기록도 유지합니다.

단일 새 파일과 build·typecheck·lint는 통과했습니다. 공개 선언 파일은 원본과 바이트 차이 0이며, 전체 프로젝트·verify·배달 비교 결과는 아래 최종 관문에 기록합니다.

## 측정 환경과 기준선 교정

- 승인 창 시작은 `2026-10-26T17:57:16Z`입니다. 코디네이터가 처음 보낸 `18:06:00Z`는 당시 미래 시각이어서 확인을 요청했고, 실제 build 시작 시각으로 정정 승인받았습니다. 다른 워커는 이 창에서 무거운 명령을 중단했습니다.
- 지정된 tools 작업 트리는 D3의 `feat/schema-form-app-cache@b29738f6a`로 바뀌어 dist SHA256 `a76e1c71537b992968adb000094221ef2b4b48a62c14f24f64134aad037633f6`에 replayBlueprintDiagnostics·CacheManager·createCacheDomain 코드가 들어 있었습니다. 이 번들은 기준선으로 사용하지 않았습니다.
- 이전에 같은 tools/dist에서 읽기 전용 복사해 보존한 `/private/tmp/448-h1/base/` 원본을 `/private/tmp/448-h2/base/`로 복원했습니다. 기준선 `8d5c5dba1`의 SHA256은 `a396cf65e154187e33647e034429e323d66357133867bc6ea254861c098dcca6`이며, 작업 기준 `bc0fb3d0a`는 문서만 추가하여 제품 바이트가 같습니다. 이 교정도 코디네이터가 승인했습니다. tools 작업 트리는 수정하지 않았습니다.
- 수정 후 제품 소스는 `cefd48080`, 문서를 포함한 측정 HEAD는 `7c31e0847`, 번들 SHA256은 `48b9433f3690d817ede0187d4cf03b1d762760fc1ad782914eb88833ddfc9803`입니다.
- Node `v26.12.1` production, 20회 예열·100표본·독립 프로세스 3개, 같은 프로세스의 0.16.1 AB/BA 쌍입니다. 세 실행 최소값의 중앙값과 최댓값−최솟값 폭을 보고합니다.

## 같은 창 전후 탐침

실행 ID는 `20261026T1759-7c31e08-h2-before` / `20261026T1800-7c31e08-h2-after`입니다. 원시 `results.json`·`rows.md`·프로세스 환경과 세 반복은 `/private/tmp/claude-501/perf-runs/`의 해당 디렉터리에 있습니다. 별도 판정 자료는 `/private/tmp/448-h2/measurement-summary.json`입니다.

| 행 | N | 전 ms | 전 폭 ms | 후 ms | 후 폭 ms | 개선 % |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| leaf-plain | 250 | 0.0259 | 0.0069 | 0.0323 | 0.0083 | -24.96 |
| leaf-plain | 1,000 | 0.0287 | 0.0039 | 0.0304 | 0.0103 | -6.10 |
| leaf-plain | 4,000 | 0.7598 | 0.0655 | 0.7826 | 0.0327 | -2.99 |
| leaf-plain | 8,000 | 1.5572 | 0.0203 | 1.5450 | 0.0162 | 0.78 |
| leaf-gate | 250 | 0.0422 | 0.0029 | 0.0381 | 0.0103 | 9.86 |
| leaf-gate | 1,000 | 0.0431 | 0.0022 | 0.0328 | 0.0122 | 23.79 |
| leaf-gate | 4,000 | 1.5608 | 0.0917 | 0.8225 | 0.0352 | 47.31 |
| leaf-gate | 8,000 | 3.5045 | 0.0655 | 1.5621 | 0.0133 | 55.42 |

4,000의 HEAD gate/plain은 **1.05095배**로 두 배 상한을 통과합니다(전은 약 2.054배). 4,000·8,000 게이트 행의 전후 차이는 각각 폭의 합보다 크며 개선이 관측됐습니다. 나머지 여섯 행은 차이가 폭의 합 안이므로 개선·회귀를 주장하지 않습니다. 게이트 큰 두 행의 HEAD/0.16.1 쌍 비율은 각각 0.30568·0.30584입니다. 같은 실행의 legacy 4,000은 전 2.5248ms(폭 0.0526)·후 2.6906ms(폭 0.2546), 8,000은 전 5.1144ms(폭 0.0297)·후 5.1076ms(폭 0.0458)입니다.

## 최종 관문

모든 제품 검사는 같은 소스 `cefd48080`로 수행했습니다. 명령 접두는 `yarn workspace @canard/schema-form`, 로그 기준 디렉터리는 `/private/tmp/448-h2/`입니다. 다섯 프로젝트는 동시에 돌리지 않고 하나씩 실행했습니다.

| 관문 | 결과 | 로그 |
| --- | --- | --- |
| `build` | 종료 0, 개발 플래그·gate-selection 번들 검사 포함 | `build.log` |
| `typecheck` / `lint` | 각각 종료 0 | `typecheck.log` / `lint.log` |
| `test --run --project unit` | 490파일·3,561통과·기존 todo 1 | `test-unit.log` |
| `test --run --project render` | 126파일·753통과 | `test-render.log` |
| `test --run --project react18` | 126파일·753통과 | `test-react18.log` |
| `test --run --project storybook` | 100파일·251통과 | `test-storybook.log` |
| `test --run --project production` | 9파일·20통과 | `test-production.log` |
| `test:verify --run` | 621파일·4,358통과·기존 todo 1 | `test-verify.log` |
| first-batch C 배달 비교 | 72장면·323단계 차이 0 | `c-d/differential.json`, `c-d/out/differential-details.json` |
| `dist/index.d.ts` | 원본/HEAD 바이트 차이 0 | `base/index.d.ts`, `head/index.d.ts` 보관본 |

새 시험의 원본 실패와 수정 후 통과는 `red-steady.log`·`green-steady.log`에 있습니다. 기존 시험 파일·단언·golden은 하나도 고치지 않았습니다. 바퀴의 참조 복원은 그대로 두었고 비바퀴 경로에 남길 별도 children·active 복원은 없었습니다. terminal 루트의 schema 선택 및 변경 캡처도 그대로입니다. 기존 비교 코퍼스가 모두 원본 단언으로 통과했습니다.

FCA 전체 scan/validate는 기존 범위 밖 문서·순환·경계·시험 사례 수 문제로 `indeterminate`입니다(378 findings, reported failed 14, skipped 308). 바뀐 settle 파일의 오류는 없고, 기존 동적 gate-wheel 시험표의 사례 수 경고가 남습니다. 새 시험은 정확한 4사례·제한 위반 0으로 확인했습니다. 전체 validate artifact는 `/Users/Vincent/.codex/plugins/filid/artifacts/fractal_inspect/d6a4eb3d5cd4baf0cef2a732b0d77dd8d61349688127ebdc205df86257ae5288.json`이며 저장소 전체 통과로 부르지 않습니다.

seiri 계획·gate ledger는 작업 전용 `.seiri/tasks/h2-preserve-references/`에 두었습니다. 상세 로그와 판정 자료를 ledger에 연결했고 PR 생성 뒤 독립 검토를 코디네이터에게 인계합니다. 전체 canonical 행·독립 Node/Bun 벤치·React equivalent·B2 힙·플러그인 일곱의 확대 관문은 이 한정 작업에서 실행하지 않았습니다. H2의 지정 잎 탐침 기준과 제품 관문 통과를 보고하며 단계 전체 채택을 주장하지 않습니다.
