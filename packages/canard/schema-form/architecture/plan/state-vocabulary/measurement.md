# 상태 어휘 단계 측정

현재 적용 규칙은 아래 Amendment 1입니다. 개정 전 절과 충돌하는 조건은 Amendment 1이 대체하며, 사전 등록은 코디네이터의 go 전까지 고정되지 않습니다.

## 상태 어휘 단계 측정 — 측정 전 고정 규칙

이 문서는 정식 측정 전에 고정합니다. `@aileron/benchmark-form`의 `--stage=state-vocabulary`를 사용하며, 규칙 버전은 `state-vocabulary-v1`입니다. closing의 `closing-v3-amendment-6`과 개정 7·8의 무결성 조건을 재사용합니다. `registeredStageClosingRules.ts`와 closing 도우미는 수정하지 않습니다.

새 규칙 파일의 sha256은 `db2a3baac3942b8372936a7a24fa57296bcdfbe29871a74e46d0e3d4cf568f0e`입니다.

Vincent의 소유자 인용 70은 다음과 같습니다.

> 그래 최종 적용에 기능상 문제가 없고, 예정대로 오류가 수정되었으며, 성능상 크게 문제가 없다면 병합 허가할게.
> 심각한 비효율로 성능지표가 크게 떨어지거나 오류가 있으면 허용 불가. 수정절차를 진행해야해

인용 71에서 Vincent는 `rebuild-flat-500`의 기존 C5 FAIL에 대해 다음과 같이 말씀하셨습니다.

> 음? 그건 명백하게 느려진게 아니니까 통과해도 되는거 아닌가? 명백하게 막 40프로씩 차이나는게 아니니까

이어진 답변은 “응 수용”이었습니다. 기존 FAIL과 수용 기록은 유지하며, 이번 창의 두 ratio-only 절에는 측정 전에 1ms 차이 하한을 고정합니다. 결과를 본 뒤 임계값을 바꾸거나 판정을 대체하려고 창을 재실행하지 않습니다.

### 레인과 표본

- B: 코디네이터의 go 메시지에 지정된 병합 기준 커밋의 깨끗한 빌드.
- F: 같은 go 메시지에 지정된 상태 어휘 단계 최종 커밋의 깨끗한 빌드.
- 제품은 Orca가 만든 깨끗한 체크아웃에서 빌드합니다. 제품과 브라우저 번들 해시를 기록한 직후 빌드 체크아웃을 제거합니다. 설치된 외부 의존성과 같은 커밋에서 빌드한 workspace 의존성은 재사용할 수 있습니다.
- 각 행·레인에서 새 페이지 3개를 warmup으로 버리고 10개를 유지합니다. 타이핑은 페이지당 20키, 행·레인당 200키입니다.
- Williams 순서는 짝수 표본 BF, 홀수 표본 FB입니다. 음수 warmup 인덱스에도 같은 교대를 적용합니다. 유지 표본은 각 레인이 각 위치에 5번씩 옵니다.
- 스모크만 warmup 1개와 유지 1개를 사용합니다. 이때 200키·10페이지를 요구하는 판정의 FAIL은 표본 부족을 그대로 나타내며 정식 결과가 아닙니다.
- 정식 창 시작 전 외부 PID별 30초 평균 CPU가 각각 30% 이하여야 합니다. 거절은 0표본으로 보존합니다. 창 시작 기록이 존재하면 코디네이터 승인 없이 재시작하지 않습니다.

### 행과 관측값

closing의 24개 행 식별자, fixture, 브라우저 페이지와 sampler를 그대로 재사용합니다.

- `type-{flat-500,array-1000,nested-d5-f4,flat-2000}-validate-{nonburst,burst}`: handler wall-clock, Event Timing processing·duration·input delay, 검증 도착, 미도착 수, 프레임.
- `mount-flat-500-validate`, `mount-nested-d5-f4-validate`, `mount-if-flat-500-validate`, `mount-flat-500-none`, `mount-nested-d5-f4-none`, `mount-array-1000-none`, `mount-array-1000-validate`, `mount-flat-500-onrequest`, `mount-flat-500-always`: first-painted, eager-painted, 첫 1초 최장 프레임, 프레임 수, postPaintBusy.
- `first-key-flat-{500,2000}-validate`: 첫 키 관측값을 보고하며 C1–C3에 넣지 않습니다.
- `stream-flat-2000-validate`: 60회 frame-driven 쓰기, 검증 횟수, 구간 길이, 프레임 수.
- `reset-flat-500-same`, `reset-flat-500-replace`, `rebuild-flat-500`, `validate-flat-500-settled`: 안정된 mount 뒤 1초 슬롯마다 10회 작업합니다. callDuration, nextPainted, validate resolutionTime, 최장 프레임과 50ms floor 적용 최장 프레임, 프레임 수, postPaintBusy, 첫 작업을 보존합니다. 페이지 값은 작업 10회의 중앙값입니다. replace의 스키마 title은 `replace-1`부터 `replace-10`이며 root 교체 여부를 검사합니다.

적용할 수 없는 메트릭은 null로 남깁니다. postPaintBusy는 첫 paint 경계 뒤 슬롯 끝까지의 LoAF와 plugin wrapper의 compile·validate 시간을 closing 정의대로 집계합니다. 모든 행에서 validator compile·validate 작업을 수집합니다.

### 통계

seed는 20261031, joint page-index bootstrap은 10,000회입니다. B/F에서 같은 페이지 인덱스를 함께 재추출하고, 상한은 nearest-rank 95백분위입니다. 짝수 개 중앙값은 중간 두 값의 평균입니다.

- C1 비율은 round-6과 동일하게 재추출한 모든 키의 handler wall-clock을 합친 p95의 F/B입니다. Event Timing은 별도로 보존하며 대체하지 않습니다.
- C1 차이 하한에 쓰는 통계는 페이지별 handler 중앙값의 중앙값에 대한 F − B 차이입니다. 같은 seed와 paired index 재추출로 차이 상한을 구합니다.
- mount와 operation의 비율·차이는 재추출한 페이지 값들의 중앙값으로 구합니다.
- B=0, F>0인 중앙값 비율은 `+Infinity`, 양쪽 0은 1입니다. 차이 부트스트랩은 독립적으로 계산합니다. processing 비율의 분모가 0이면 기존 round-6대로 INDETERMINATE입니다.
- 결측 또는 미지원 관측은 INDETERMINATE이며 PASS로 변환하지 않습니다. 확인된 FAIL이 불확실성보다 우선합니다.

### 차단 게이트

SV-1은 C1–C6 전체 판정입니다. 하나라도 FAIL이면 FAIL, FAIL 없이 INDETERMINATE가 있으면 INDETERMINATE, 나머지는 PASS입니다. SV-2는 별도 차단 게이트입니다.

| 게이트            | 적용 대상                                                  | 차단 조건                                                                                                 |
| ----------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| C1                | 타이핑 8행 처리 시간                                       | pooled handler p95 F/B 상한 > 1.10 **그리고** handler 중앙값 차이 F − B 상한 > **1ms**                    |
| C2                | 타이핑 8행 duration·프레임                                 | F duration p95 > B + 8ms 또는 F의 ≥50ms 프레임 수 > B + 1                                                 |
| C3                | nonburst 타이핑 4행                                        | F 검증 도착 p95 > 33.4ms 또는 200키가 아니거나 미도착 수 > 0                                              |
| C4                | validate·onrequest·always mount 5행                        | first-painted, eager-painted 또는 최장 프레임의 F/B 상한 > 1.10 **그리고** 해당 차이 상한 > 8.35ms        |
| C5 호출           | reset·rebuild 3행                                          | callDuration F/B 상한 > 1.10 **그리고** 차이 상한 > **1ms**                                               |
| C5 paint·validate | reset·rebuild nextPainted, settled validate resolutionTime | F/B 상한 > 1.10 **그리고** 차이 상한 > 8.35ms                                                             |
| C5 프레임         | 작업 4행                                                   | 각 작업의 max(최장 프레임, 50ms)를 페이지 중앙값으로 집계한 F/B 상한 > 1.10 **그리고** 차이 상한 > 16.7ms |
| C6                | stream 행                                                  | F 페이지 검증 횟수 > 2 + ceil(durationMs / 100) 또는 F의 ≥50ms 프레임 수 > B                              |
| SV-2              | closing 전체 24행                                          | compile·validate 평균 또는 setup·late 작업 평균이 F ≠ B이거나 F에 unattributed 작업이 존재                |

1.10과 차이 하한에 정확히 같은 값은 차단하지 않습니다. C4·C5 프레임에는 두 레인의 LoAF 지원이 필요합니다. None·if mount의 타이밍과 first-key는 보고 전용이나 SV-2의 validator 동일성은 계속 적용합니다. 예외 목록은 없으며, 전 행 F = B를 요구합니다.

C0는 **NOT_APPLICABLE**로 보고합니다. C0는 public L 보정과 L 비교를 요구하는 IR-6 G1이므로 B/F 두 레인 창에는 의미가 없다는 코디네이터 결정을 받았습니다. C7은 이번 단계 설계에 따라 제외합니다. 기존 1.05–1.10 비율 대역과 vsync 차이 절로만 통과한 행의 진단, 작업 프레임 발생 비율의 F − B > 0.20 진단은 보고에 남깁니다.

### 보고 전용 행

`is-divergent-flat-2000`은 validation None인 flat 2,000-field 폼에서 F만 실행합니다. 한 번의 leaf setValue 뒤 root getter의 첫 읽기와 즉시 반복 읽기의 절대 ms를 기록합니다. 비율을 판정하지 않으며, 호출 횟수·복잡도는 제품 단위 시험에서 검증합니다. getter 없는 provisional 빌드는 이유와 함께 skipped로 기록합니다. 정식 창에서는 getter가 존재하고 두 읽기가 boolean true를 반환하며 실제 실행됐음을 checker가 강제합니다.

`heap-flat-2000-100-edits`는 같은 폼·같은 leaf에서 100회의 setValue 뒤 B/F를 비교합니다. 새 페이지마다 CDP `HeapProfiler.collectGarbage` 후 `Runtime.getHeapUsage`를 호출하고 usedSize·totalSize·embedderHeapUsedSize·backingStorageSize를 bytes로 기록합니다. 10페이지 중앙값, usedSize F/B와 차이 상한을 보고하되 차단하지 않습니다. heap snapshot은 만들거나 커밋하지 않습니다.

### 고정·무결성과 재현

새 규칙 파일은 `browser-bench/interaction/helpers/stateVocabulary/registeredStateVocabularyRules.ts`입니다. `inputs.json`에는 B/F 커밋, 제품·closing 브라우저·report 브라우저의 sha256, `preregisteredCommit`, `ruleVersion`, 이 새 파일의 `rulesSha256`, provisional 여부를 기록합니다. 빌드 증거는 경로를 제거하여 `clean-build-record.json`에 저장합니다.

정식 시작 전과 checker에서 모든 non-test interaction 코드와 input-responsiveness fixture에 대해 현재 파일 sha256 = formal-start toolHashes = toolCommit git blob sha256을 요구합니다. preregisteredCommit부터 toolCommit까지 같은 범위의 변경이 없어야 합니다. 규칙과 이 사전 등록 문서는 정식 시작 전에 커밋되어 있어야 합니다.

`yarn workspace @aileron/benchmark-form check:browser-results --stage=state-vocabulary --root=<frozen-root> --write`로 raw에서 결과를 만들고, `--write` 없이 같은 명령으로 모든 결과를 재현합니다. smoke에는 `--smoke`를 추가합니다. 중복·누락 표본, 순서, 키 수, 작업 identity, postPaintBusy와 프레임 재계산, 보고 행 실행 여부, 고정 번들과 clean build 증거를 검사합니다. raw와 커밋 파일에는 기계의 로컬 경로를 남기지 않습니다.

1단계 스모크는 두 레인을 시작 커밋 `61457653ae19dfb1f11b97e29355fa3cd6af8f24`의 동일한 임시 빌드로 수행합니다. 이는 수집·판정·재현 경로 검증이며 상태 어휘 성능에 대한 정식 판정이 아닙니다. 사전 등록 독립 검사는 코디네이터가 수행하며, go 전에는 정식 창을 열지 않습니다.

## Amendment 1 — 사전 등록 검사 반영

첫 사전 등록 검사에서 지적된 조건을 코디네이터가 채택한 수정 명세로 대체합니다. 위의 “이번 창의 두 ratio-only 절에는 측정 전에 1ms 차이 하한을 고정합니다.”는 다음 문장으로 대체합니다.

ratio-only 두 절의 차이 하한을 측정 전에 고정합니다. C1은 handler 중앙값 차이 상한 1ms 또는 pooled handler p95 차이 상한 2.5ms, C5 callDuration은 4ms입니다. 1ms에서는 closing 정식 창 F 페이지로 만든 같은 빌드 모의 창의 92%가 FAIL이었고, 인용 71이 수용한 rebuild(상한 1.118, 차이 상한 1.375ms)도 FAIL이었습니다. 4ms의 같은 빌드 오탐은 2.2%, 세 행 모두 40% 느려질 때 검출은 100%입니다. 이 수치는 독립 검증자가 closing 정식 F 페이지로 수행한 시뮬레이션 결과이며 이번 단계의 정식 측정 결과가 아닙니다.

다음 표가 위 표의 해당 행을 대체합니다. C2, C3, C5 paint·validate, C5 프레임과 C6은 그대로 유지합니다.

| 게이트  | 적용 대상                                          | 차단 조건                                                                                                                |
| ------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| C1      | 타이핑 8행 처리 시간                               | pooled handler p95 F/B 상한 > 1.10 **그리고** (handler 중앙값 차이 상한 > 1ms 또는 pooled handler p95 차이 상한 > 2.5ms) |
| C4      | validate·onrequest·always mount 5행                | first-painted·eager-painted·페이지별 max(최장 프레임, 50ms) 각각의 F/B 상한 > 1.10 **그리고** 해당 차이 상한 > 8.35ms    |
| C5 호출 | reset·rebuild 3행                                  | callDuration F/B 상한 > 1.10 **그리고** 차이 상한 > **4ms**                                                              |
| SV-2    | 이산 작업 15행: mount 9행, first-key 2행, 작업 4행 | compile·validate 평균 또는 setup·late 작업 평균이 F ≠ B이거나 F에 unattributed 작업이 존재                               |

타이핑 8행과 stream 행의 작업 수는 프레임 시점에 따른 병합으로 달라지므로 보고만 합니다. closing 정식 창 F 레인에서도 array-1000 nonburst와 burst 3행의 페이지별 횟수가 달랐습니다. 예외 목록은 없으며, 위 15행 전체에 F = B를 요구합니다. 모든 24행의 작업 수는 계속 표에 남깁니다. 15개 식별자는 새 규칙 파일의 `validatorWorkRows`이며 harness 식별자와 대조하여 존재를 확인했습니다.

C1의 `processingTail`은 processing과 같은 F/B 비율 상한을 사용합니다. 차이 상한은 같은 seed·같은 paired page index를 재추출한 pooled F handler p95 − pooled B handler p95의 nearest-rank 95백분위입니다. 중앙값 절과 tail 절 중 하나가 FAIL이면 FAIL이며, FAIL 없이 필요한 값이 없으면 INDETERMINATE입니다. C4의 mount 프레임은 50ms 검출 경계에서 censor한 페이지 값으로 bootstrap합니다. unfloored 최장 프레임은 보고에 남깁니다.

checker는 preregisteredCommit의 이 문서에 inputs의 rulesSha256이 적혀 있는지 확인합니다. 정식 시작 전 같은 root 스모크에서 F의 isDivergent 두 읽기가 실행되어 true였는지 확인하며, 아니면 창을 열지 않습니다. 이 검사는 CPU quiet 관측과 formal-start.json 기록보다 먼저 수행합니다. 임시 빌드 스모크의 getter skip은 허용하되 그 자료로 정식 창을 열 수는 없습니다.

잔여 위험도 기록합니다. 커밋된 판정 코드로 다시 실행한 동일 빌드 모의 창 150개에서 SV-1 FAIL은 11개(7.3%)였고, 모두 C5에서 발생했습니다(rebuild callDuration 7개, replace nextPainted 4개). SV-2와 C1·C2·C3·C4·C6의 FAIL은 0개였습니다. 결과는 정식 창의 실제 판정을 대신하지 않으며, 결과를 본 뒤 창을 재실행하거나 규칙을 변경하지 않습니다.
