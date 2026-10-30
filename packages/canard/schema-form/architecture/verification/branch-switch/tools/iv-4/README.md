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

공용 3초 평균 CPU quiet gate와 30%·120초/Spotlight 600초 시작 지연을 재사용합니다. 허용되지 않으면 failure 원시를 보존하고 조정자에게 질문합니다. 다른 창과 겹치지 않으며 창·pilot에는 별도 조정자 허가가 필요합니다. 공개 원시는 상위 열 개 프로세스 이름·비율만 보유하고 함수 URL을 상대 주소로 바꿉니다. 원래 stderr·stdout과 준비 bundle은 외부 root에서 보존합니다. publish는 기존 증거 파일을 덮어쓰지 않아야 하며 같은 label은 재사용하지 않습니다.
