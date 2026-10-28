# 공용 창 사전 점검

B8에서 이동한 canonical 장치입니다. B8과 B9-0이 같은 구현을 가져옵니다.
`helpers/sampleProcessCpu.mjs`는 누적 CPU 카운터의 3초 차이를 관측하며 관측기 자신을 제외합니다.
`helpers/waitForQuietProcess.mjs`는 명시한 자체 agent PID를 추가로 제외하고 외부 프로세스 하나가 30%를 넘으면 5초씩 시작을 지연합니다. 최대 120초 안에 조용해지지 않으면 환경 실패입니다. 합계는 판정선이 아닙니다.

`quietWorkerPreload.mjs`는 기존 B8 환경변수 `B8_QUIET_ROOT`, `B8_QUIET_AGENT_PID`를 유지합니다. Node 자식의 `--import`로 적재하면 benchmark 모듈과 타이머 시작 전에 점검하며 PID별 JSON 증거를 남깁니다.

합성 검사: `node packages/canard/schema-form/architecture/verification/branch-switch/tools/window/checkQuietProcess.mjs`.
관측과 지연을 주입하므로 실제 창이나 OS 대기를 실행하지 않습니다.
