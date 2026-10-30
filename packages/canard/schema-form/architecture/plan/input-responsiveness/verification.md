# 입력 응답성 — 검증 구성요건

## 범위와 입력

IR-0은 제품 코드를 바꾸지 않는 기준선입니다. 실제 Chromium, Playwright, esbuild production React를 사용합니다. L은 공개 0.16.1 별칭, E는 `5d1348ed16054efa1ec431945eb00472f4eef7f1`의 workspace 빌드, S는 기존 준비 도구가 제품 수정 없이 제공하는 `0eb03ff3bb54bf06af95271d157aefece1b9bf32` 빌드가 있을 때만 포함합니다. S가 불가능한 이유는 결과에 남깁니다. 픽스처가 제품 변경을 요구하면 해당 행을 제외하고 이유를 기록합니다.

## 픽스처

- type-flat-500, type-nested-d5-f4: 실제 기본 AJV8 플러그인과 OnChange, 한 문자열 필드에 실제 키 20회. 중첩 폼은 가장 깊은 잎입니다.
- type-flat-500-novalidate: 같은 입력, validationMode=0.
- type-onchange-state: flat-500, 검증 없음, 부모 카운터 갱신을 plain setState와 startTransition으로 분리합니다.
- replace-200-while-typing: 5키 뒤 `/items`에 200개 setValue, 이어 5키. 검증 없음.
- switch-oneOf-20: Playwright selectOption으로 DOM select의 판별값을 바꾸는 교대 분기 전환 10회. 이 change 이벤트는 합성 이벤트이며 trusted 키 입력 지표와 구별합니다. 검증 없음.
- mount-virtualization: flat-500·nested-d5-f4·array-1000 각각 off/on(기본 옵션), 검증 없음.
- 검증 보조 pattern: 같은 flat/nested 대상 잎에 길이 홀짝 pattern을 두어 결과가 매번 달라지게 합니다. 100ms 간격 비연타와 무지연 연타를 따로 기록합니다. 원래 정상 입력 행의 미배달은 오류로 보간하지 않습니다.

## 표본과 창

픽스처·레인마다 새 페이지 3회 예열은 버리고 새 페이지 10개를 보존합니다. 프로세스는 재사용할 수 있으며 레인 순서는 표본마다 정순/역순으로 교대합니다. mount 기본 CLI도 유지합니다. Chromium이 없으면 설치하지 않고 정확한 설치 명령을 question으로 보낸 뒤 기다립니다.

실제 CLI 전체 스모크 뒤 코디네이터에게 창 준비를 알립니다. 정식 시작은 한 번의 30초 정숙 관찰(외부 PID별 평균 30% 이하)을 통과한 뒤입니다. 거절은 0표본으로 보존하고 다음 정숙 관찰로 재개합니다. 시작한 창은 외부 부하로 중단하지 않습니다. 이후 외부 CPU는 원시에만 남기며, 빌드·시험·typecheck·lint·다른 창을 겹치지 않습니다. 원시는 `.noindex` 준비 폴더에 먼저 남기고 저장소에는 기계 경로를 제거한 증거만 옮깁니다.

## 지표와 집계

페이지 PerformanceObserver가 event(durationThreshold=16), first-input, long-animation-frame을 지원 여부와 함께 기록합니다. 모든 항목을 보존하며 interactionId별 최대 processingEnd−processingStart와 duration을 별도로 집계합니다. 문턱에 가린 짧은 입력은 document capture/bubble 사이의 input/change dispatch 벽시계로 보완하고 Event Timing과 구별합니다. 표본별 상호작용 분포의 중앙값·p95를 만든 뒤 표본 중앙값들의 중앙값, 표본 p95들의 nearest-rank p95를 보고합니다. 총합·처리·대체 벽시계를 섞지 않습니다.

긴 애니메이션 프레임은 상호작용 창과 겹친 항목의 최장 시간과 50ms 이상 개수입니다. 검증 도착은 키 입력의 input capture 시각부터 그 키의 첫 onValidate/UpdateGlobalError 배달까지이며, 배달되지 않은 키 수와 유효성 값을 함께 보존합니다. 보조 비연타 100ms는 keyboard.type delay 옵션이 아닌 호출 사이의 페이지 시계 간격입니다.

마운트는 기존 macrotask 안정화 방식의 벽시계, 첫 input DOM이 준비된 뒤 double-rAF의 eager painted(render 시작 기준), DOM placeholder가 모두 사라진 뒤 paint의 all revealed를 기록합니다. eager/all 시점의 DOM 노드 수와 placeholder 수를 함께 남깁니다. API가 없으면 `지원 없음`, 지원되지만 16ms 문턱으로 항목이 없으면 `관측 없음`으로 적습니다.

## 고정 관문과 기록

| 관문 | 선 | 적용 |
| --- | --- | --- |
| 키 처리 | p95 ≤16.67ms | 각 타이핑 행; Event Timing 및 대체 handler 벽시계 출처 명시 |
| 구조 변경 프레임 | 최장 ≤50ms | replace-200-while-typing, switch-oneOf-20 |
| 비연타 검증 도착 | p95 ≤33.4ms | 100ms pattern 보조 행 |

판정은 관문별 pass/fail만 쓰고 최종 문장은 `판정: 소유자 대기`입니다. 기존 jsdom update-sync/update-settled와 같은 픽스처 계열임을 설명하되 환경 사이 비율은 구하지 않습니다. 원시에는 모든 배달·이벤트·프레임·표본과 bundle SHA-256을 남기며 큰 파일은 gzip합니다. 기존 reviews와 ledger는 수정하지 않습니다. 제품 차분 0, 신규 파일 타입 검사, benchmark-form lint, gzip을 풀어 포함한 전체 차분의 기계 경로 감사를 마친 뒤 push합니다. FCA 스캔은 하지 않습니다.

## 정숙 관찰 3회 거절 뒤 상대 비교 — 2026-10-30 소유자 규칙

소유자 원문: "흠. 네가 선점하면 안되는건가... 기존 값을 절대값비교하지 않고, 기존과 수정을 교차검증하면 오차를 줄일 수 있지 않을까? 상대값 비교를 하면 말이지. 엔탈피처럼"

30초 정숙 관찰이 3회 거절되면 기다림 대신 paired relative 창을 시작합니다. 같은 창의 L/E0/A/AB를 새 페이지로 측정하며 E0 재사용은 허용하지 않습니다. 픽스처·레인마다 3예열·10보존 표본을 유지하고 표본마다 레인 순서를 한 칸씩 순환합니다. 같은 픽스처·표본 번호의 L을 짝으로 차이와 비율을 계산한 뒤 각각의 중앙값을 보고하며 절대 중앙값은 참고로 함께 씁니다.

관문 환산은 `(같은 창 AB / 같은 창 L) × (IR-0 정숙 L)`입니다. 최대 통계(최장 프레임, p95)는 잠정으로 표시합니다. replace-200-while-typing의 최장 프레임과 키 처리 p95에 의존하는 행은 2분 간격 백그라운드 30초 관찰이 작업 종료 전에 성공하면 해당 행만 별도 정숙 창에서 다시 측정합니다. 외부 CPU는 표본마다 보존합니다. 기존 거절은 모두 0표본으로 보존하고, 30% 임계값·Spotlight·시작한 창의 무중단 원칙과 빌드/시험/lint 겹침 금지는 유지합니다.

### 정숙 재측정 범위 — 코디네이터 답변, 2026-10-30

정숙 관찰 성공 뒤에는 type-flat-500, validation-flat-500-nonburst/burst, replace-200-while-typing off/on의 5행만 L/E0/A/AB 각 3예열·10새페이지로 다시 측정합니다. switch-oneOf-20은 상대 창의 최장 프레임이 50ms에 실패하거나 10% 이내(45ms 이상)일 때만 추가합니다. 부하가 프레임을 길게 하는 방향이라는 원리에 따라 여유 있는 통과는 보수적인 최대값 증거로 유지합니다. 마운트는 짝 중앙값으로 다루므로 재측정하지 않습니다. 정숙 행은 기존 상대 창을 대체하지 않고 나란히 보고합니다.


## IR-1b — 엄격 production 관문 (2026-10-31)

엄격 production 관문은 `test:production`(NODE_ENV=production)이며 `--project production` 실행은 그것을 대신하지 않는다.

[관문 수리 결과](../../verification/input-responsiveness/production-gate-repair.md)에 환경별 재현, ids 탐침과 읽기 전용 소비자, 21/21 복구 및 전체 순차 관문의 실행 SHA·계수를 보존했습니다.
