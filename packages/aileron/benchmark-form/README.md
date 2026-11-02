# 전체 폼 벤치마크

## 코어 브라우저 측정

먼저 저장소 루트에서 `yarn install --immutable`과
`node --import tsx packages/aileron/benchmark-form/browser-bench/core/prepareCheckout.mjs .`로
워크스페이스 빌드를 준비하고 `yarn exec playwright install --with-deps chromium`을 실행합니다.

```sh
yarn workspace @aileron/benchmark-form bench:form --runs 20 --warmup 3 --out results/core
yarn workspace @aileron/benchmark-form bench:form --baseline master --cases mount-flat-500-none,rebuild-flat-500 --runs 20 --out results/compare
```

`--cases`를 생략하면 열 가지 코어 사례를 측정합니다. 기준 ref는 독립적으로 설치·빌드한
임시 Git worktree에서 준비하며, 이미 준비한 체크아웃은 `--baseline-dir <path>`로 지정합니다.
후보는 현재 워크스페이스의 빌드 결과를 사용합니다. 매 표본은 새 페이지에서 실행하고 기준·후보·
기준 번들의 동일 바이트 대조군을 교차 측정합니다. `summary.json`, `summary.md`, `samples.json`,
`quiet.json`을 출력하며 typing 수치는 입력 한 번당 ms, 나머지는 작업 한 번당 ms입니다.

`faster`와 `slower`는 사례별 절대·상대 차이 기준을 넘긴 결과이고 `within noise`는 그 이내입니다.
기준과 대조군 차이가 허용 폭을 넘으면 한 번 재시도하고 계속 유효하지 않으면 `void`로 남깁니다.
기준 없는 측정은 `measured`로 표기합니다. 로컬에서는 외부 CPU 사용이 높으면 시작을 거부하며,
CI에서는 CPU 상태를 기록하고 계속합니다. 속도 판정은 권고이며 하네스 실패만 CI를 실패시킵니다.

`results/baseline.json`은 Node `guard:check`의 입력이므로 유지하고 생성 결과는 Git에서 제외합니다.

`yarn workspace @aileron/benchmark-form bench --equivalent --mode=render --legacy=0.16.1`
은 공개 L과 작업 공간 dist E를 AB/BA로 교대하며 각 판 10예열·최소 100표본을 기록합니다.
`--out=<path>.json`에 원시 표본, `<path>-summary.json`에 중앙값·p99·비율을 저장하고 표를 출력합니다.

## 갱신 측정 계약

- `update-sync`: 각 상호작용의 `flushSync(() => applyInteraction(...))` 구간 합(ms)입니다.
- `update-settled`: 각 상호작용 시작부터 정착 장벽 완료까지의 경과 시간 합(ms)입니다.
- `update-idle-floor`: 동일 개수의 빈 정착 장벽을 별도로 실행한 시간 합(ms)입니다.
- `update-settled-net`: 표본마다 `update-settled - update-idle-floor`인 보조 추정치입니다.
  음수도 그대로 보존하며, 타이머 변동 때문에 순수 작업 시간으로 해석하지 않습니다.
- `profiler-update`와 `commits-update`: 정착까지 발생한 React Profiler의 actualDuration 합과 commit 수입니다.

정착 장벽은 **마이크로태스크 비움 → setImmediate → setTimeout(0) 한 번 → setImmediate**입니다.
`setImmediate`가 없으면 `MessageChannel`을 사용합니다. `drainTicks` 자체에는 타이머가 없습니다.
L의 `src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:112,120`
은 배치 카운터 초기화를 매크로태스크로, 이벤트 배달을 마이크로태스크로 예약합니다.
`src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1219`의 루트 변경 배달은
`afterMicrotask`를 거쳐 타이머로 지연됩니다. 이 지연까지 지나야 다음 상호작용을 시작할 수 있습니다.
이는 현재 픽스처의 정착 정의이며 임의의 지연 타이머 전체를 기다리는 일반 목적 idle 검출기는 아닙니다.

첫 immediate를 지난 뒤 타이머를 예약하여 동기 작업이 타이머 시작 전 밀리초 경계를 넘는
영향을 분리합니다. 남는 Node의 타이머 클램프 바닥은 빈 장벽으로 따로 측정합니다.
각 상호작용의 빈 장벽은 해당 갱신 정착 뒤 실행하며 갱신 시간에 포함하지 않습니다.
마운트도 같은 장벽을 지난 뒤 update의 Profiler 수집을 시작합니다.

`render-update-wall`은 제거했습니다. D4의 그 이름은 상호작용마다 `setTimeout(0)` 두 번을
포함한 옛 정의이며 새 지표와 직접 비교하지 않습니다. `render-mount-wall`도 대기 정의 변경의 영향을 받습니다.
원시 JSON에는 commit 수도 보존합니다. 성능 표본은 값·DOM 동치의 증명이 아닙니다.
