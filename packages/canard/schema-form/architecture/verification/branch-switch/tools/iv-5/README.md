# Ⅳ-5 이정표 재측정

Ⅳ-0의 준비·무시간 스모크·실제 CLI 예행·파일럿·창·후처리에서 이번 범위에 필요한 파일만 복사했습니다. E SHA를 준비 인수로 받으며 E 배포 해시는 예외 채택된 Ⅳ-4 창1 B와 대조합니다. S 소스 전체 Git blob과 B5 배포 해시도 대조합니다. 제품은 변경하지 않습니다.

측정 본체는 기존 `design-optimization/tools/alternate.mjs`, `helpers/buildAlternatingRows.mjs`, `helpers/measurePair.mjs`, 힙 벤치 그대로입니다. 새 시간 루프는 없습니다. Ⅳ-0 전용 단계 장부와 상세 진단은 조정자 승인에 따라 제외합니다. 집계도 기존 `iv-0/report/summarizeMilestone.mjs`를 호출합니다.

아래 인수의 root는 기존 장치가 요구하는 날짜·시각·7자리 SHA 형식을 따르는 외부 `.noindex` 경로입니다. Node는 Ⅳ-0과 같은 26.11.1을 사용합니다. `IV_AGENT_PID`는 이 워커의 에이전트 PID입니다.

```sh
IV_TOOLS=packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-5
node "$IV_TOOLS/prepare.mjs" "$IV_ROOT" "$IV_START" "$IV_END_SHA"
node "$IV_TOOLS/checkLoad.mjs" "$IV_ROOT"
node "$IV_TOOLS/rehearse.mjs" "$IV_ROOT"
node "$IV_TOOLS/pilot.mjs" "$IV_ROOT" --authorized "$IV_AGENT_PID"
node "$IV_TOOLS/window.mjs" "$IV_ROOT" --authorized "$IV_AGENT_PID"
node "$IV_TOOLS/summarize.mjs" "$IV_ROOT" "$IV_OUTPUT"
node "$IV_TOOLS/checkResults.mjs" "$IV_OUTPUT"
```

파일럿은 S/E 각각22개 fresh process이며 각 프로세스 안에서 공개0.16.1과 교대합니다. 창은22행·S/E 각10프로세스·20예열/100표본·quality=legacy입니다. L 주 레인은 S 역할 안의0.16.1이며 E 역할의 legacy는 보조입니다. 시작은 기존 공용 장치의30초 관측·외부 PID별30%·일반120초/Spotlight30초 정책이며 거절은 표본0으로 보존하고 다음 관측으로 이어갑니다. 시작 뒤에는 기존 Ⅳ-4 preload를 통해 CPU를 기록만 합니다. 시작한 창 자체의 실패는 재실행하지 않습니다.

Node/Bun 힙은 기존5,001노드·7표본 장치를 그대로 사용합니다. 그 장치의 legacy는0.16.0이므로 S/E를 주표로 쓰고 legacy는 참고값입니다. L0.16.1 힙은 미측정입니다. 힙 비교는 E 중앙≤S 최대입니다.

추가한 도구만 eslint·checkJs로 검사하고 제품·FCA 관문은 실행하지 않습니다. 원시 후처리는440개 독립 PID·역할/반복 순서·100표본·양수·유한수·최소값/중앙값·품질·힙 집계·관측 전용 CPU 영수증을 재검산합니다. 공개 CPU는 상위10개 이름·비율만 남기고 기계 경로를 제거합니다.
