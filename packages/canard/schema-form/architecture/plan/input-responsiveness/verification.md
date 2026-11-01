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


## IR-6 D1 — 측정 전 고정 규칙 (2026-10-31)

제품 동작은 라운드5c 독립 관문 두 개에서 수락되었고, amendment9d의 다섯 선행 항목과 집중 관문 뒤 측정합니다. 번호는 **G1–G6과 G8**이며 G7은 없습니다(코디네이터 정정 msg_84f0444c1629). G·virtualization 기본값·기존 useChildFields 결함·버전은 범위 밖입니다. React18은 browser lane에서 측정하지 않습니다.

### 레인·행·환경

L은 공개0.16.1 별칭, E는facd72a71, F는9d 뒤 최종 머리에서 빌드한 배포 번들입니다. 각 제품·browser bundle SHA-256과 도구 commit/hash를 고정하며 F 제품 코드가 측정 뒤 바뀌면 다시 측정합니다. production React19.2.6·실제 Chromium·AJV8 플러그인·viewport900×700을 씁니다. 모든 레인/행은 새 페이지3예열을 버리고 새 페이지10개를 보존하며 레인 순서는 표본마다 정순/역순 교대, paired relative는 순환합니다.

- typing은 flat500·array1000·nested-d5-f4·flat2000의 OnChange20 trusted key입니다. 각 행에100ms 비연타와 IR-2식 무지연 burst를 둡니다. 비연타 간격은 keyboard.type delay가 아니라 실제 호출 사이 페이지 시계 간격입니다. 대상 pattern은 매 key에 verdict가 바뀝니다.
- mount OnChange는 flat500·nested-d5-f4·if-flat500이며 first-painted/eager-painted·첫1초 최장 frame/50ms이상 frame을 기록합니다. Always가 아닌 기본 표시 정책을 씁니다. if행은 render에서 compile하므로 G5 보고 전용입니다.
- first-key-after-mount는 OnChange flat500·flat2000에서 첫 input 준비 후 첫 rAF 신호에 실제 key1개를 보내 duration/input delay/processing을 보고합니다. 관문은 없습니다.
- None mount flat500·nested-d5-f4는 보고 전용입니다.
- stream-flat-2000-validate는 페이지 안에서60 frame마다 programmatic write1개입니다. validation runs·duration·frame script time·최장frame·50ms이상frame을 기록합니다.
- G8 mount-array-1000은 기본 표시·virtualization off의 None/OnChange 한 쌍이며 E/F를 비교하고 L도 보고합니다.

### 표본 창과 정숙 절차

Spotlight를 유지합니다. 매 timed window 전에 외부 PID별30초 평균 CPU≤30%인 정숙 관찰을 수행합니다. 거절은 승인false·표본0 원시로 모두 보존합니다. 세 번 거절 뒤에는 소유자가 승인한 paired relative mode로 같은 창에서 L/E/F를 교차 실행하고 최대 통계(p95·최장frame)는 잠정으로 표기합니다. 시작한 창은 외부 부하 때문에 중단하지 않으며 이후 CPU는 기록만 합니다. 창 중 build·시험·typecheck·lint·다른 창을 겹치지 않습니다. 첫 timed window 시작과 마지막 종료에 status를 보내고 그 사이 코디네이터도 이 호스트에서 작업하지 않습니다.

원시는 외부 .noindex 준비 폴더에 먼저 보존하고 저장소 증거에서는 머신 경로만 정규화합니다. 정식 창 앞에 실제 CLI 전체 untimed smoke를 완료합니다. paired mode의2분 간격30초 background quiet 관찰을 유지하며 별도 정숙 재측정은 기존 비연타 실패/문턱10% 이내 행의 보강 증거로 병기하고 원래 창을 대체하지 않습니다. 재실행이 필요한 G1 비교 불확정은 아래 규칙을 우선합니다.

### 관측과 집계

processing/duration은 durationThreshold16ms Event Timing 항목만 씁니다. 16ms보다 빠른 key의 검열을 명시하고 각 관문 숫자 옆에 관측 interaction 수와 실제 key 수를 함께 적습니다. interactionId별 processingEnd−processingStart 최대와 duration 최대를 각각 계산합니다. null 통계는 IR-2와 같이 handler p95로 대체하고 출처를 표시하며0으로 읽지 않습니다. first-key input delay는 processingStart−startTime입니다.

페이지 p95는 해당 페이지 관측 interaction의 nearest-rank p95입니다. 행 p95는10개 페이지 p95의 nearest-rank p95(최악 페이지)입니다. pooled processing p95는 모든 페이지(재표집 시 선택된 페이지)의 관측 interaction processing을 합친 nearest-rank p95입니다. 페이지 중앙값의 중앙값은10개 페이지 중앙값의 중앙값입니다. 중앙값·p95·handler 벽시계는 섞지 않습니다. handler 보완은 capture→bubble 벽시계로 따로 보고합니다.

bootstrap은 고정seed20261031,10,000회 페이지 index 복원추출입니다. 교차 레인은 E와F의 같은 page index를 공동 재표집하고 각 재표집의 pooled processing-p95 F/E 비를 구합니다. 단측95% 상한은 그10,000개 비의95th percentile(nearest-rank)입니다. Event Timing 풀에 관측이 하나도 없으면 그 레인의 handler 풀 p95로 대체하고 bootstrap의 대체 횟수도 기록합니다. 이 대체 뒤에도 분모0·표본 없음이면 판정 불가이며 pass가 아닙니다.

G3는 모든 페이지의 long-animation-frame 지원을 요구합니다. frame은 interaction 창과 겹치는 항목이며50ms이상 개수는10페이지 합입니다. 마운트 frame창은 render start부터1초입니다. validation arrival는 input capture부터 해당 key의 첫 onValidate 배달까지이며 burst는 배달 시 최신key에 귀속합니다. 비연타 미배달key는 보간하지 않습니다.

first-painted는 root.render 전에 container에 childList/subtree MutationObserver를 붙여 최초 input 또는 select 추가 record에서 등록한 첫 rAF callback 시작 performance.now에서 render start를 뺍니다. eager-painted는 기존 input준비 뒤 double-rAF 정의를 유지합니다. first/eager 중앙값은10페이지 값의 중앙값입니다.

### 기계 판정

| 관문 | 적용 행과 문턱 |
| --- | --- |
| G1 | type-flat-2000-validate-nonburst의 F processing행p95≤16.67ms이고 pooled processing-p95 F/E bootstrap단측95%상한<1.00. 같은 창 L의 페이지중앙값 중앙값이6.425ms×1.10을 넘으면 F행p95×max(0.80,6.425/L중앙값)을16.67ms와 비교. L중앙값이6.425ms×1.25를 넘으면 비교불가·G1 indeterminate이며 절대 pass하지 않음. 정숙 관찰 뒤 해당 창을 한 번 재측정하고 재불확정이면 숫자를 question으로 올림. |
| G2 | 모든 typing행의 pooled processing-p95 F/E bootstrap단측95%상한≤1.10. |
| G3 | 모든 typing행에서 F Event Timing duration행p95≤E duration행p95+8ms(ET rounding1단계), F의50ms이상frame10페이지합≤E합+1. 모든 페이지 LoAF지원 필수. null은 handler p95 대체·출처 명시. |
| G4 | 모든 nonburst typing행에서 F validation arrival행p95≤33.4ms, F미배달0/200. 매key verdict가 바뀌어야 하며 burst에는 적용하지 않음. |
| G5 | mount-flat-500-validate와 mount-nested-d5-f4-validate에서 F first-painted중앙값≤E, F eager-painted중앙값≤E+16.7ms. if-flat500은 보고 전용. |
| G6 | stream-flat-2000-validate의 모든 F페이지 validation runs≤2+ceil(stream duration/100ms), F의50ms이상frame10페이지합≤E합. FieldInput이 debounce를 소유하므로 engine은100ms 실시간성 상한을 유지함. |
| G8 | mount-array-1000 None의 first/eager-painted중앙값 F/E 각각≤1.02, OnChange는 first/eager 각각 F≤E. 표시 layout effect 제거 뒤에도 유지하는 guard이며 일반 입력 layout effect0은 코드 관문으로 유지. |

모든 typing행은 L/E/F의 processing p95·duration p95·arrival p95 및 F/E·F/L을 병기하고0.16.1 대비 손실이 사라졌는지 행마다 판정합니다. first-key·None·if mount·첫1초 최장frame은 보고 전용입니다. G1–G6·G8 모두 충족하면 코드 관문 뒤 병합 가능하나 루트 병합은 소유자 몫입니다. 하나라도 실패하면 worker_done이나 완료를 보내지 않고 숫자·원인·선택지를 코디네이터 question으로 올립니다. G1 재불확정도 question입니다.

### G2 판정 출처 변경 — 소유자 결정(2026-10-31), 다음 정식 창부터

소유자 원문: "1 - 전체처리시간으로 하지"

첫 정식 창의 G2 FAIL은 그대로 둡니다. 다음 정식 창부터 G2는 아래 규칙으로 판정하며, 위 기계 판정 표의 G2 행은 첫 창의 규칙으로 남습니다. G1·G3의 출처와 다른 관문은 바뀌지 않습니다.

- 판정 통계: 모든 typing행에서 각 레인의 모든 key handler 처리 시간(capture→bubble 벽시계)을 씁니다. pooled handler p95는 모든 페이지(재표집 시 선택된 페이지)의 key handler 값을 합친 nearest-rank p95입니다.
- 문턱: pooled handler p95 F/E bootstrap 단측95% 상한≤1.10. bootstrap은 기존 정의(고정seed20261031, 10,000회 페이지 index 복원추출, E와 F의 같은 page index 공동 재표집, 상한은 10,000개 비의95th percentile nearest-rank)를 그대로 씁니다.
- 결측: 레인·행마다 handler 값이 있는 key 수를 적습니다. 값이 하나도 없거나 분모가0이면 판정 불가이며 pass가 아닙니다.
- 병기: Event Timing pooled processing p95 F/E와 그 bootstrap 상한, 레인별 관측 interaction 수/200을 판정 옆에 참고로 적습니다.
- 이유: durationThreshold16ms Event Timing은 화면 갱신까지16ms 이상 걸린 key만 남겨 관측 집합이 검열됩니다. 첫 창의 flat500 burst에서 F는37/200만 관측돼 첫 key가 pooled p95를 정했고, 한 페이지 쌍의 반복 재표집이 상한을2.556으로 만들었습니다. 같은 원시의 모든200 key handler로 계산한 상한은0.857입니다(ir-6-results.md의 G2/G8 원인 진단).

### G8 허용 범위 — 소유자 결정(2026-10-31), 다음 정식 창부터

소유자 원문: "응 반프레임 이내면 된다. 3% 이내로 오면 좋긴 한데 현실적으로 어렵다는거지?"

첫 정식 창의 G8 FAIL은 그대로 둡니다. 다음 정식 창부터 mount-array-1000의 eager-painted 판정은 None과 OnChange 모두 F 중앙값≤E 중앙값+8.35ms(반 프레임, 16.7ms의 절반)입니다. first-painted 판정(None F/E≤1.02, OnChange F≤E)은 그대로입니다. eager-painted F/E 비와 3% 이내 여부를 판정 옆에 참고로 적습니다.

- 이유: 소유자는 표시 판단을 엔진에 두는 데 드는 작은 마운트 비용을 받아들이기로 했습니다. 진단에서 hold를 완전히 없앤 V1도 E 대비 eager가 +1.65ms(None)·+0.45ms(OnChange)였고, 같은 레인의 세션 간 중앙값 차이가 2~4ms여서 1.00·1.02 비율선은 개선 정도와 무관하게 표집에 좌우됩니다(ir-6-results.md의 G2/G8 원인 진단).


## IR-7 — hidden-form delivery (2026-11-01)

### Owner decisions (verbatim)

- Quote 39 (reset): "리셋에 대해서는 명확히 이해가 안되는데, 나는 숨김여부와 무관하게 reset 실행시점에 onError를 받는게 맞는거같아. 다만, form을 숨겨놓고(랜더링이 안되는게 아니라 진짜 숨겨만 놓고) onError 를 받는 경우가 있는지는 모르겠지만... 그거랑 무관하게 일관성을 생각하면 실행시점에 바로 onError를 받는게 적절해보이네"
- Quote 40: "1. 스키마를 사용한 값의 검증은 onValidate 아닌가? onError 는 진짜 오류를 수신하는 채널이잖아 2. Activity 기능을 사용해서 컴포넌트를 안그리는건 기존 컴포넌트를 css 등으로 visiblity hidden 설정하는거랑 다른건가? 라이프사이클이 같다면 보일때랑 안보일때가 다를 이유가 없어보이고, 동작이 다르다면 컴포넌트 라이프사이클 대신 엔진에서만 에러를 받아야할거같은데 Activity 기능을 고려하면 전반적으로 설계를 다 바꿔야하는건가?"
- Quote 41 (answer to the recommendation: a committed form delivers onChange, onStateChange, onError and the other form-level callbacks at the engine's chain end whether or not React Activity or Suspense hides it; only renders React may discard keep holding; a separate PR right after IR-6): "권장대로 IR6 이후 바로 설계 후 진행합니다."

### Rule

첫 layout commit을 마친(prepared) 현행 load는 Provider effect 연결 여부와 관계없이 모든 폼 수준 콜백을 보이는 폼과 같은 순서·내용으로 engine chain 끝에 전달합니다. 한 번도 준비되지 않은 load는 변경·상태·진단을 버리고 기록만 첫 commit까지 보관합니다. reset으로 은퇴한 load는 hasConsumer()가 false이며 기록을 버려 소비자에게 다시 전달하지 않습니다. Provider는 호스트 보고를 추가하지 않고 engine의 기존 reportOwnerlessError만 유지합니다. 루트 교체 뒤 정착한 옛 검증은 stamp·폐기로 소비자와 호스트 모두에 도달하지 않습니다.

### Limits

- L1: React는 숨김과 실제 unmount를 구분하지 않습니다. 실제 unmount 뒤에도 prepared와 루트 구독은 유지되며 보유한 핸들·노드의 쓰기, reset·rebuild·validate·submit과 예약 슬롯은 콜백을 전달합니다. mounted 트리의 검증 루트 참조 수는 cleanup에서 해제합니다. unmount 뒤 reset으로 만든 새 루트는 retain하지 않아 캐시 축출 뒤 재컴파일할 수 있습니다.
- L2: 숨김 중 onChange·onStateChange·onValidate·onDiagnosticsChange는 마지막 연결 commit의 콜백을 사용하고 prop 갱신은 show에 반영됩니다. onError는 insertion effect로 최신입니다. 숨김 중 Form ref는 null이므로 이전에 보유한 핸들·노드를 사용합니다.
- L3: 필드 layout effect의 렌더 경고와 쓰기는 show에 도착합니다. prepared load의 show 쓰기는 즉시 전달하지만 최초 mount의 준비 전 쓰기는 REACT-007에 따라 버립니다.
- L4: 루트 교체 reset의 기록은 binding을 새 루트로 바꾸기 전에 전달하므로 onError 안의 handle.node는 옛 루트입니다. mount-time 기록이 build-time 기록보다 먼저 도착합니다.

### Acceptance criteria

T1 Equivalence (stub the host sink, compare records by structure because each run has its own error objects, and use fields with no layout-effect writes or render-layer warnings so L3 does not apply). One scripted sequence run twice, once visible and once hidden after the first show: `setValue` of a valid value, of a value that fails conversion (a warning record), of a value whose validation throws in the validator (an error record), a subtree `setState`, a same-schema `reset`, and a root-replacing `rebuild`. Use referentially stable props and validator within a run (otherwise :176 resets at show), and a fresh schema object and validator per run (compile failures and blueprints are cached). Record every callback (`onChange`, `onStateChange`, `onValidate`, `onDiagnosticsChange`, `onError`) with its arguments in one ordered log after the deterministic settle helper; the two logs must be equal, and showing the hidden form afterwards must add nothing.
T2 A mount validation due while hidden runs while hidden (one validator call or `onValidate` while hidden, none added on show); replaces "(d-owed)".
T3 Adapt the existing hidden tests to the rule and name each change in the results: `validation.mount-owed.render.test.tsx` (R1, V6 isolation now at chain end while hidden, rebuild while hidden, W4, W5), `validation.hidden-reset-records.render.test.tsx` (records at write time and at reset time, never at show time), `validation.after-paint.render.test.tsx:311` "IR-6 (d)" (now: `validate` is called once after unmount and `onError` is not called, L1), and `bufferedRecords.test.ts` per C6. Watch `validation.continuity-restore.render.test.tsx` (X1 Activity restore), because a mount slot now runs while hidden; report whether it changes.
T4 Never prepared: a discarded speculative render delivers nothing (existing tests stay); an Activity initially hidden form delivers nothing until first shown, then flushes its construction records once (React 19 only; it passes on the current code and is exempt from the red-run requirement); the StrictMode replay still delivers once (`Form.binding.test.tsx`, `RootNodeContext.binding.test.tsx`, `Form.reactVersions.test.tsx`, `settle.test.tsx` stay green); an initially hidden form whose `validatorFactory` changes before first show delivers its construction records once and keeps exactly one subscription (React 19; red today through the leaked subscription).
T5 Subscription lifetime: after a root-replacing reset made while hidden and a show, and after a same-schema reset made while hidden and a show, one change produces exactly one `onDiagnosticsChange` (red today: two in both cases); the same after hide and show cycles, and under StrictMode on both majors; after unmount the validation root's reference count returns to its value before mount.
T6 Reset isolation: an `onError` that throws on a build-time record of a root-replacing reset (for example the development DialectMismatch warning, or another build-time record) leaves the form usable: the binding holds the new root, later records still arrive, writes succeed, and the failure reaches the host sink once; visible and hidden, both majors (red today for the visible case).
T7 Retired load: (a) in one act, after `rebuild`, a write through a node of the old tree that was detached before the rebuild raises the development `DetachedNodeWrite` warning through the old reporter (`refuseDetachedWrite.ts:18`); it must not call `onError`  (today it calls `onError`, because the previous load stays `ready` until the re-render commit). (b) A write validation that rejects after `rebuild` calls neither `onError` nor the host, before and after the change (a guard, exempt from the red-run requirement). If (a) cannot be produced, keep only (b) and state in the ledger supplement that no engine path delivers a late record to a retired load.
T8 Limits pinned: L1 (after unmount, a `setValue` through a node captured before unmount calls `onChange` once) and L2 (a callback prop changed while hidden is used only after show, while a changed `onError` is used at once; React 19).
Each new or adapted test, except the T4 initially hidden case, must fail on the stage branch before the change for the stated reason; store the red runs from the committed test text on both majors where they run.


### Gates

lint (0 warnings), typecheck, build; unit, render, react18, verify, storybook, production projects; the import-model test; public declaration and `src/index.ts` diff zero; FCA validate with no new finding; ledger checks; machine-path audit; existing skips and todos unchanged. No browser measurement: the hot-path change is a flag read of the same cost, and no measured row hides a form; say so in the results.


계약 문서를 별도 커밋하고 T1–T8의 허용된 예외 외에는 단계 기준에서 실패 원시와 시험 SHA256을 보존한 뒤 C1–C7을 구현합니다. 제품·시험 커밋과 생성 번들 커밋을 분리합니다. browser 측정·benchmark는 수행하지 않습니다. hot path는 같은 비용의 flag 읽기이며 기존 측정 행은 Form을 숨기지 않습니다. 시간·메모리 비용은 load별 retired 선택 필드와 reset 또는 GC까지 유지되는 루트 구독이며 새 루프·타이머는 없습니다.


### IR-7 불변 guard 예외 승인 — 2026-11-01

T5 hide/show cycles·StrictMode 단일 구독·검증 캐시 retain/release 균형은 기준에서도 통과하는 불변 guard로 유지합니다. 코디네이터 승인 조건에 따라 제품 머리6f1b36f22의 scratch에서 effect setup마다 cleanup 해제 없이 재구독하는 변형과 cleanup의 releaseValidationRoot를 생략하는 변형을 각각 주입했습니다. 양쪽 React major에서 구독 guard 둘과 균형 guard 하나가 모두 실패하며 mutation-runs.json에 최종 커밋 시험의 SHA256·실패 원시·변형 patch를 보존합니다. 기준 red의 부재를 숨기거나 red와 mutation red를 합산하지 않습니다. scratch는 증거 커밋 직후 Orca로 제거하고 남은 관문을 순차 수행합니다.


### IR-7 round b — 독립 검토 수정 (2026-11-01)

reset의 옛 load 은퇴는 batch try/catch 뒤·최종 build 기록 flush 앞으로 옮깁니다. adoption 전 컴파일 실패를 포함한 reset 사슬의 옛 runtime 기록은 사슬 끝에 onError 한 번으로 전달하고 caller에 다시 던지며 호스트 sink는 0회로 유지하고, batch가 던져도 이후 은퇴합니다. 교체된 never-prepared load의 생성 실패도 reset 끝에 reported 가드로 한 번 capture·호스트 보고하며 새 reporter.root를 유지합니다. 첫 commit 구독은 이전 구독을 먼저 해제해 reset이 이전 load를 반환한 경우에도 한 구독만 남깁니다.

L3에는 개발 StrictMode replay를 포함합니다: including the development StrictMode replay, which React models as a hide and show; production renders are unaffected. 비멱등 자식 mount layout 쓰기는 replay의 prepared load에서 onChange로 한 번 전달합니다. 최초 준비 전 쓰기는 계속 버립니다.

T7a는 retired load의 hasConsumer()가 false여서 report 호출 자체에 도달하지 않는 경로입니다. 소비자 무배달만 검증하며 reporter.root 유지·복원을 검증했다는 주장은 제거합니다. T4 validator 교체 뒤 구독 단언은 기존 구독 변형에서도 red를 확인합니다. T7b는 validator start promise를 기다리고 hidden mount 시험은 숨기기 전에 확보한 node로 settle합니다. 새 회귀는 visible/hidden adoption 실패, never-prepared 생성 실패, 양쪽 major StrictMode replay이며 최종 커밋 시험의 red·mutation·green 해시와 모든 순차 관문은 round b 결과에 보존합니다.


### Round b host 표면 정정 승인

기준 stage의 visible adoption 전 compile 실패를 양쪽 React major에서 관찰한 결과 caller throw·onError1·host0이었습니다. 코디네이터가 이 기존 표면을 계약으로 승인했으며 처음 브리프의 host 보고 가정은 대체합니다. 수정 뒤 visible·hidden 모두 caller throw·onError1·host0을 검사하고 커밋 시험 텍스트의 stage visible green과 06df red를 저장합니다. never-prepared 생성 오류의 reset 끝 capture·host1 보고는 이 adoption 실패와 다른 경로이며 그대로 유지합니다.


### IR-7 round c — never-prepared reset 사슬 기록 (2026-11-01)

이전 load가 never-prepared이면 batch try/catch 뒤·retired 설정 전에 records를 이관합니다. batch 도중의 adoption compile 실패 기록도 포함하여 이전 기록 전체를 새 build 기록 앞에 붙이며 원래 root·warning scope를 유지합니다. reporter와 새 root의 setup은 batch 전에 그대로 둡니다. 명령형 reset이 던진 경우에도 이전 load는 은퇴하여 늦은 옛 root 쓰기가 onChange·추가 onError를 내보내지 않습니다.

React19의 처음 숨긴 OnRequest Form에서 validator A를 실패하는 B로 바꾼 뒤 show하는 회귀를 stage의 compile 실패 surface·호스트 출력과 대조합니다. 최종 커밋 시험을 000f와 stage에서 실행하고, 은퇴를 try 안으로 옮기는 변형이 양쪽 major의 늦은 쓰기 단언을 깨는지 확인합니다. resetRootLoad의 효과와 RootLoad error/reported 주석도 reset 경로를 명시합니다. 순차 관문·raw·SHA256은 round c 결과에 보존합니다.


## IR-8 — load validation after the next frame (2026-11-01)

### Rule

Always(`true`, `ShowError.Always` 또는 해당 비트를 포함한 mask)를 포함해 최초 마운트·동일 스키마 reset·루트 교체 reset·rebuild·검증기 교체는 하나의 로드 검증 진입점을 다음 프레임 뒤 슬롯에서 실행합니다. `None`은 컴파일하지 않고, `OnRequest`만이면 컴파일만 하며, `OnChange`는 컴파일 후 현재 로드 시작 이후 쓰기 검증 요청이나 명시적 루트 검증이 없을 때 첫 판정을 냅니다. 자동 로드 컴파일 실패는 새 트리를 유지하고 로드마다 `surface: 'sink'` 한 번과 호스트 보고 한 번이며 reset·rebuild는 그 실패로 던지지 않습니다. `validate()`·제출은 즉시 시작하고 실패하면 `rejected`로 거부합니다. `if` 게이트의 구성·렌더 중 컴파일은 유지합니다. 첫 판정 전 빈 목록은 unknown으로 다루거나 `validate()`를 기다립니다. 명시적 반환과 제출 값은 호출 시점 snapshot이며 하위 검증은 전체 pending 요청을 보존합니다.

### Limits

- L1: 스키마 해석과 트리 구성, 그리고 `if` 게이트가 있는 스키마의 가드 컴파일(이때 전체 스키마도 컴파일됨, F6)은 로드 프레임에 남습니다. 가드만 따로 컴파일하는 플러그인 계약(항목 G)은 다음 단계입니다.
- L2: `Always` 폼의 첫 오류 표시는 첫 화면보다 한 슬롯(1~2프레임) 늦습니다. IR-6 quote 19의 첫 화면 전 판정은 quote 49로 거둡니다.
- L3: 슬롯 안의 첫 판정이 검증기 실행 중 예외(`ValidatorThrew`)로 끝나면 표면은 기존대로 `'rejected'`(호스트 없음)입니다. IR-8은 컴파일 실패의 표면만 통일합니다. 후보로 기록합니다.
- L4: 같은 스키마 객체와 같은 검증기를 이미 컴파일한 폼의 reset·rebuild는 캐시를 쓰므로 슬롯의 컴파일은 조회 한 번입니다. 이득은 새 스키마 객체, 검증기 교체, 아직 컴파일하지 않은 폼(None·OnRequest only)에서 생깁니다.
- L5: 컴파일 실패 뒤 `validationUnavailable`은 그 로드 동안 유지됩니다. 다음 로드(reset·rebuild·검증기 교체)가 `dispatchMount`·`dispatchResetForm`에서 지웁니다(F3). 같은 스키마 객체를 그대로 reset하면 캐시된 실패를 다시 만나 다시 한 번 보고합니다(로드마다 한 번).
- L6: unmount 뒤 reset으로 만든 루트는 retain되지 않으므로(IR-7 L1) 슬롯의 컴파일 결과가 축출될 수 있습니다. 변경 없음.
- L3 (ValidatorThrew surface in the slot verdict).
- Ledger supplements:

OnRequest-only의 새 background compile 비용은 quote 54로 수용한다. Always·새 객체 reset·검증기 교체는 로드 프레임 비용을 슬롯으로 옮긴다. 공개 엔진 표면은 유지하며 바인딩 adoption만 더 이상 컴파일하지 않는다. 숨김·unmount OnRequest도 슬롯을 실행하며 retain 전 캐시 축출 가능성이 있다.

### Acceptance criteria

T1 OnRequest only: validator `compile` count is 0 after the first paint and 1 after the slot; with a schema whose compile throws, `onError` receives exactly one record (`code: VALIDATOR_COMPILE_FAILED`, `surface: 'sink'`) after the slot, the host sink receives it once, `validate()` rejects and submit rejects afterwards, and no second `onError` record follows. Red today: compile count stays 0 and no record arrives.
T2 Always: no validator `compile` and no `onValidate` before the first paint (synchronous assertion after render); the first verdict and the error display arrive after the slot. Replaces the IR-6 pre-paint Always test. Red today: compile happens in the layout effect.
T3 Root-replacing reset, `rebuild()`, and validator change to a failing schema or validator: the call does not throw, `handle.node` is the new root, the new fields render, writes succeed, `onError` receives one `'sink'` record after the slot and the host sink one, `validate()` rejects. Visible and hidden (IR-7 T1 harness), both majors. Red today: throws with `'thrown'`, host 0 (IR-7 round b/c tests adapted accordingly: `validation.reset-failures.render.test.tsx`).
T4 Same-schema reset in OnChange: no verdict inside the reset act; exactly one verdict after the slot; `onValidate` receives the new list. Compare validator call counts. Red today: the chain end requests through the cadence (count 1 inside the frame-backed cadence instead of the slot; assert the slot origin by making the validator record `performance.now()` relative to the reset act, or by stubbing `scheduleValidationSlot` ordering; the worker states the chosen observation).
T5 Write before the slot: a user write after mount and before the slot makes the cadence request; the slot adds no second verdict (validator run count 1). Guard for first mount (passes today through `validationStamp > 0`); red for the same-schema reset case (stamp already positive today, so today's `hasFieldNodeValidationRequest` would skip the first verdict, which T4 covers; and after C3 the write's request supersedes the slot verdict).
T6 None: validator `compile` count 0 across mount, same-schema reset, root-replacing reset, rebuild and validator change (red today for root-replacing reset and rebuild, which compile in adoption).
T7 Core only (no provider): `mountFieldNode` without settings and `reloadFieldNodeForm` without settings still request the OnChange verdict at chain end (guard, unchanged).
T8 Superseded slot: two resets in one frame produce one verdict and, with a failing schema, one report (the first slot is dropped by the token).
T9 Explicit `validate()` before the slot on a failing schema: `'rejected'` once, then the slot adds no second report (`validationCompileReported`).

Amendments 1–3: 모든 로드 시작에 stamp 증가, finally 종료 직전 loadStamp 기록; deferred reset pending 정착; 오래된 explicit compile 실패만 보고 억제; 중복 $id 원인 캐시; 같은 $id 새 내용 replacement는 commit cleanup 뒤 compile. T10·T11은 write→reset 단일 최신 판정과 검증기 없는 pending 해제 guard이다. T4는 reset 직후 pending false가 red 기전이며 T8 토큰은 수동 슬롯 해제로 별도 확인한다.

### Gates

계약 별도 커밋 → 최종 시험 텍스트 stage red·SHA256·gzip 저장 → 제품 구현 → lint(경고 0), typecheck, build, unit, render, react18, verify, storybook, production, import-model, 공개 선언·src/index 무변경, FCA 새 finding 없음, 원장 검사, machine-path·skip/todo audit를 순차 수행한다. 제품과 생성 번들은 별도 커밋한다. 브라우저·benchmark는 수행하지 않는다.


## IR-9 — onError record origin (2026-11-01)

onError is an event channel: it delivers the one record of each occurrence and does not maintain a current error list or report resolution.

T1의 다섯 origin·T2 중첩 load·T3 옛 필드 부재, A1 reset/rebuild/validator 변경, A5 첫 오류, P3-4 write listener reset·validate wave listener·stale load 뒤 state 및 최초/prop 외부 errors를 검증합니다. 기존 whole-record 단언도 갱신합니다. f4018e82b 제품에서 시험을 red로 실행하고 committed test SHA256과 JSON gzip을 보존합니다. lint 0경고→typecheck→build→unit→render→react18→verify→storybook→production→import-model→선언·index·FCA·원장·경로·skip/todo 감사를 순차로 기록합니다.


## Defect round 관문 보충

[결함 검증 계획](../defect-round/verification.md)의 기준 red·수정 green·세 변이와 순차 관문을 적용합니다. D4·D5의 Amendment 3 적용 전 전체 관문은 실행하지 않습니다. D9는 ERROR-023 항목 2 우선 제한으로 기록합니다.


## Amendment 9·10 — 결과 관문 정정

DR-13의 완료 시 대상 재삽입은 요청 시점 handoff로 대체합니다. cadence/root 실행 소유 객체를 자기 실행만 지우며 하위 validate는 건드리지 않습니다. DR-1은 구성 중 unpinned guard read의 설치 루트를 축출하지 않고 DR-2는 예약 load.retired만 늦은 host 보고의 은퇴 신호로 씁니다. DR-14는 nonempty dense known bundle만 생략합니다. DR-11의 degraded native handler 실패는 ERROR-028에 따라 하나의 bundle로 host에 전달하도록 바뀌었습니다. 슬롯의 원소별 host 형태와 native의 거부 그대로 전달을 통일하는 결정은 단계 마감으로 남깁니다. node/root 입력에는 추가 경로 탐색·리스너 배달이 없고 렌더마다 상수 시간 snapshot hook 하나가 있습니다. [정정 결정](../../reviews/defect-round.md)의 Amendment 9·10을 따르며 새 reds·변이·전체 관문은 결과 문서에 보충합니다.
## 단계 마감 측정 — 측정 전 고정 규칙

### 소유자 지시 (Quote 69, Quote 70 원문)

> 그래. 그럼 지금까지 수정을 다 마무리하고, 전체 스캐닝까지 진행하도록 해. 우리 수정으로 성능손실이 얼마나 발생했는지까지 검증해보자. 추가 오류가 없는지도 평가해보고

> 그래 최종 적용에 기능상 문제가 없고, 예정대로 오류가 수정되었으며, 성능상 크게 문제가 없다면 병합 허가할게.
> 심각한 비효율로 성능지표가 크게 떨어지거나 오류가 있으면 허용 불가. 수정절차를 진행해야해

### 범위와 고정 입력

승인된 closing 설계 v1 및 Amendment 1·2에 따릅니다. Phase 1은 도구 준비와 smoke·사전등록까지만 수행하며 정식 창은 독립 검토와 코디네이터 go 이후 한 번만 시작합니다. 실패하거나 거절된 창은 보존하며 대체 실행하지 않습니다.

- L: 공개 0.16.1 alias. B: `5d1348ed16054efa1ec431945eb00472f4eef7f1`. S: `facd72a71c44a798f5484827509073a27fb678a3`. F: 결함수정 라운드 병합 후 지정되는 최종 head. Phase 1 F는 smoke 전용입니다.
- B/S는 Orca로 만든 깨끗한 체크아웃에서 빌드하고 제품 범위와 commit을 검증합니다. 제품·브라우저 번들의 SHA-256을 고정한 뒤 체크아웃을 제거합니다.
- 기존 IR-6 18개 행과 fixture/식별자를 유지합니다. 신규 6개는 `mount-flat-500-onrequest`(validationMode 2), `mount-flat-500-always`(OnChange, showError true), `reset-flat-500-same`, `reset-flat-500-replace`, `rebuild-flat-500`, `validate-flat-500-settled`입니다.
- replace는 매번 루트 title이 `replace-1`부터 `replace-10`까지 다른 구조입니다. replace/rebuild 뒤 handle.node가 바뀌고 same reset 뒤 유지되어야 합니다. L의 두 reset은 버전 증가에 따른 트리 재구성이므로 모든 표에서 다른 연산임을 표시합니다. L의 rebuild는 제외합니다.
- reset/rebuild/validate는 안정화된 mount 뒤 페이지당 10회, 1초 슬롯마다 실행합니다. 첫 연산은 별도 보고하며 페이지 값은 10회 중앙값입니다. validate는 Promise 해결 시간을 기록합니다.

### 지표·표본·통계

- 기존 handler/Event Timing/arrival/frame/paint/stream 지표와 원시 자료를 보존합니다. reset/rebuild는 동기 `callDuration`, 호출 시작부터 반환 뒤 double rAF까지 `nextPainted`, 1초 내 최장 프레임과 50ms 이상 프레임 수를 기록합니다. settled validate는 해결 시간과 프레임을 같은 방식으로 판정합니다.
- `postPaintBusy`는 모든 mount/reset/rebuild/validate에서 첫 paint 이후 시작한 LoAF duration을 연산 시작+1000ms에서 잘라 합산하고, 기존 validator 플러그인 wrapper에서 측정한 compile/validate duration을 같은 구간에 더합니다. 보고 전용이며 중첩으로 인한 이중 계상 가능성을 함께 명시합니다.
- Amendment 2: 모든 행은 3 warmup 폐기, 10 kept pages, typing은 페이지당 20키(전체 200키)입니다. 일반 4 lane Williams 순서를 1–4, 1–4, 1–2로 반복하며 위치별 3·3·2·2 불균형을 결과에 기록합니다. D8 두 행은 probe를 포함한 5 lane Williams 10순서를 사용합니다.
- bootstrap은 seed 20261031, 10,000회, 비교 lane과 F에 같은 페이지 index를 재표집합니다. 95% 상한은 nearest-rank입니다. typing은 IR-6 round-6와 같은 전체 handler wall-clock의 pooled p95 비율입니다. 나머지는 재표집 페이지 중앙값들의 중앙값 비율과 중앙값 차이입니다. 짝수 중앙값은 가운데 두 값의 평균입니다. 누락/0 분모는 불확정이며 통과로 바꾸지 않습니다.
- 정식 창 직전 30초 동안 외부 PID별 평균 CPU가 30% 이하여야 합니다. 거절은 표본 0의 기록으로 보존합니다.

### 병합 차단 판정

| 규칙 | 고정 판정 |
| --- | --- |
| C0 | B를 E 역할로 넣은 원본 IR-6 G1과 등록된 L transfer. L 중앙값 8.03ms 초과이면 불확정. |
| C1 | 8개 type 행의 handler pooled p95 F/B bootstrap 상한 ≤1.10. |
| C2 | 8개 type 행 duration p95 F ≤B+8ms, 50ms 이상 프레임 수 F ≤B+1. |
| C3 | nonburst type 행 arrival p95 ≤33.4ms, 200키 중 미전달 0. |
| C4 | gated mount의 first/eager-painted는 F/B 상한 >1.10 및 중앙값 차이 상한 >8.35ms가 동시에 성립하면 실패. 1초 프레임 수 F ≤B+1. None/if mount는 보고 전용. |
| C5 | reset/rebuild의 callDuration 상한 ≤1.10, nextPainted는 C4의 이중 조건. settled validate의 해결 시간 상한 ≤1.10. 각 행 프레임 수 F ≤B+1. |
| C6 | stream 페이지별 validation runs ≤2+ceil(duration/100ms), 프레임 수 F ≤B. |
| C7 | S를 E 역할로 둔 변경 없는 decideValidationAfterPaintGates, round-6 G1–G6/G8. 하나라도 실패하면 차단. |

C1/C4/C5의 gated 지표 상한이 (1.05,1.10]이면 병합 전 profile 또는 코드 추적으로 원인을 진단하고 보고합니다. first-key 행, None/if mount, postPaintBusy, OnRequest background compile은 보고 전용입니다. F/S 및 F/L은 모든 지표를 보고하며 gate로 대체하지 않습니다.

D8는 F의 revisionObserved latch를 제거한 이름 있는 probe 빌드로 flat-500 type nonburst/burst만 실행합니다. probe/F handler 처리 비율 상한이 하나라도 ≤0.90이면 후속 수정, 아니면 실익 없음으로 닫습니다. probe 변경은 제품 소스에 커밋하지 않습니다.

`registeredStageClosingRules.ts`와 이 사전등록을 정식 창 전에 커밋합니다. inputs.json에 preregisteredCommit, ruleVersion, rulesSha256와 모든 제품/브라우저 해시를 기록합니다. checker의 `--stage=closing`은 저장한 raw에서 모든 수치와 판정을 재현해야 합니다. Phase 1 이후 prepared head·smoke 요약·규칙 SHA-256을 코디네이터에게 보고하고 중지합니다.

C4에서 None/if mount는 보고 전용입니다. C7은 별도 회귀 방어로 원본 G8의 array None 조건까지 그대로 유지합니다. C0의 L 비교 가능성 경계는 원본 수식 `6.425 × 1.25 = 8.03125ms`를 변경하지 않으며 설계의 8.03ms는 표시 정밀도입니다. B/S 체크아웃을 제거한 뒤에는 제품 해시와 commit별 source tree proof가 검증된 고정 복사본을 재사용할 수 있습니다.
