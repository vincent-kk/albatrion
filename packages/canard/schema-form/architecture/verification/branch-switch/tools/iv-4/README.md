# Ⅳ-4 후보 탐침과 할당 진단

Node 26.12.1의 지정 workspace build를 사용합니다. 준비·측정 root는 외부 `.noindex`이며 같은 root의 A/B는 각각 현재 HEAD에서 준비한 불변 bundle입니다. 입력 파일은 덮어쓰지 않습니다. 준비 뒤 제품이나 도구가 바뀌면 새 root를 사용합니다.

```sh
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-4/checkTools.mjs
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-4/prepare.mjs "$IV_ROOT" A
# Candidate product commit and designated build precede lane B preparation.
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-4/prepare.mjs "$IV_ROOT" B
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-4/run.mjs "$IV_ROOT" smoke switch-oneOf-80,switch-siblings-0,switch-payload-12,single-flat-1000 "$IV_AGENT_PID"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-4/run.mjs "$IV_ROOT" probe switch-oneOf-80 "$IV_AGENT_PID"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-4/publish.mjs "$IV_ROOT" S5
```

plain worker는 기존 Ⅳ-3-0 setupOperation/runBlocks를 직접 사용합니다. 행별 A0/B0/A1/B1/A2/B2, 각각 새 프로세스·2,000 예열·20,000 동작·100동작 블록·500동작마다 시계 밖 양보입니다. 프로세스 한 개는 59초 제한이며 실패를 재실행하지 않습니다. 프로세스별 블록 µs/동작 중앙값을 먼저 구하고 세 대표값의 중앙값끼리 비교합니다. 잡음은 행별 A 세 값의 최대−최소, 전체 최대는 기록만 합니다. 표적은 엄격히 잡음보다 개선하고 모든 보호 행은 자기 잡음보다 나빠지지 않아야 유지합니다. oneOf는 왕복 2쓰기, siblings/payload/flat은 동작당 1쓰기입니다.

S9는 A만 준비하고 다음 명령을 한 번 실행합니다. setupOperation으로 폼 하나를 만든 뒤 기존 runBlocks의 0동작 호출로 예열합니다. GC로 회수한 단명 객체도 포함하도록 inspector 옵션 둘을 true로 주고, 다음 20,000동작 호출만 sampling합니다. 해당 호출의 check는 no-op으로 바꿔 검사를 sampling 바깥으로 옮깁니다. 실제 operation.check는 sampling 전후에 수행하며 타이밍 루프는 기존 장치 그대로입니다. sampled wall은 plain keep/drop에 사용하지 않습니다.

```sh
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-4/run.mjs "$IV_ROOT" allocation switch-oneOf-80 "$IV_AGENT_PID"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-4/publish.mjs "$IV_ROOT" S9
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-4/checkResults.mjs --allocation
```

소유자 지시에 따라30초 평균30% quiet 관측 한 번 뒤 시작하며 일반120초·Spotlight30초 시작 지연을 적용합니다. 시작 뒤 외부 CPU는 raw에만 기록하고 중단 사유로 쓰지 않습니다. 시작 관문 거절은 보존하고 다음30초 관측으로 재개합니다. 다른 창과 겹치지 않으며 창·pilot에는 별도 조정자 허가가 필요합니다. 공개 원시는 상위 열 개 프로세스 이름·비율만 보유하고 함수 URL을 상대 주소로 바꿉니다. 원래 stderr·stdout과 준비 bundle은 외부 root에서 보존합니다. publish는 기존 증거 파일을 덮어쓰지 않아야 하며 같은 label은 재사용하지 않습니다.

## GC 횟수와 S4 할당 보충

기존 plain worker는 그대로 두고 `diagnose.mjs`가 별도 `gc-worker.mjs`를 실행합니다. mode는 `gc`(원 S9 제품의 별도 GC 횟수 관측) 또는 `allocation`(S4 A/B의 단명 할당과 GC 횟수)입니다. 인수는 준비 root, A/B, mode, 제외 agent PID입니다. 각 lane/mode는 해당 root에서 한 번만 실행하며 한 번의30초 시작 관문·59초 자식 제한을 적용합니다. `publishDiagnostics.mjs root label`로 고유 label에 보존합니다.

PerformanceObserver는 예열 뒤 켜고,20,000동작 구간에 시작된 GC의 kind/flags·duration을 보존합니다. 마지막 콜백을 시계 밖에서 배출한 뒤 분리합니다. 원 S9의 GC 횟수는 수집하지 않았으므로 보충 관측과 같다고 주장하지 않습니다. allocation 모드는 기존 inspector의 두 collected-object 옵션을 유지하며 가장 가까운 제품 frame에 native self bytes를 배타적으로 귀속합니다. 새 진단의 실행 도구 SHA는 각 결과에 별도 기록하고 기존 S9와 plain 탐침 원시를 변경하지 않습니다.
