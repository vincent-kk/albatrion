# 공용 측정 창 장치

정식 표본은 다시 실행하지 않습니다. CPU 점검과 대기는 프로세스의 benchmark 모듈을 적재하기 전에 끝납니다.

외부 CPU는 개별 PID의 3초 평균 30% 초과로 판정합니다. 5초 간격으로 재확인하고, 일반 외부 부하의 누적 대기는 최대 120초입니다. `mds`, `mds_stores`, `mdworker` 접두 프로세스만 남은 경우에는 전체 시작 대기 한도를 600초로 둡니다. 일반 부하가 함께 있으면 일반 120초 한도도 동시에 적용하며 전체 대기는 600초를 넘기지 않습니다. 자기 에이전트 PID는 기존처럼 제외합니다. 실패 원시에는 모든 시도와 대기, 두 한도와 일반 부하에 쓴 시간을 남깁니다.

B12의 준비 루트는 `.noindex`로 끝나야 합니다. bundles·pair·delivery·cpu-prechecks는 그 안에 두고, 별도 단계 원시 루트도 `.noindex`로 끝납니다. 저장소의 raw 기록은 창이 끝난 뒤 복사합니다. 기존 장치의 루트 형식은 호환성을 유지합니다.

`checkQuietProcess.mjs`는 가상 시계로 일반·Spotlight·혼합 부하와 복구를 확인하며 OS 대기나 성능 표본을 실행하지 않습니다.

B8에서 이동한 공용 장치이며 B8·B9-0·B9-1·B11·B12가 같은 정책을 사용합니다. `helpers/sampleProcessCpu.mjs`는 누적 CPU 카운터의 3초 차이를 관측하고 관측기 자신을 제외합니다. `waitForQuietProcess.mjs`가 정책 정본이며 `helpers/waitForQuietProcess.mjs`는 기존 주소를 위한 재수출입니다.

`quietWorkerPreload.mjs`는 기존 `B8_QUIET_ROOT`·`B8_QUIET_AGENT_PID`를 유지합니다. Node 자식의 `--import`로 적재하면 benchmark 모듈과 타이머 시작 전에 점검하며 PID별 JSON 증거를 남깁니다.

합성 검사: `node packages/canard/schema-form/architecture/verification/branch-switch/tools/window/checkQuietProcess.mjs`. 복구·자기 PID 제외·3초 관측·5초 지연·일반 120초와 Spotlight 600초를 실제 OS 대기 없이 확인합니다.

기존 B8의 관측기·대기 함수·preload 주소는 이 공용 구현을 재수출하거나 적재하는 호환 주소입니다. B9-1의 합성 정책 사례와 B12의 3초 관측·5초 지연 사례를 함께 유지합니다.
