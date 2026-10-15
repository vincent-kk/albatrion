# 성능 최적화 기준선 (M0)

루프 시작 커밋 `c59ba1363`(`feat/schema-form-08-review-and-perf`, 353라운드)의 "최적화 전" 판과, 같은 실행에서 잰 옛 판 v0.16.0(`660dde66f`, TEST-031)의 수치입니다. 계획은 [성능 최적화 개발요청서](../../plan/perf-optimization/request.md)의 "M0 측정판 고정" 절과 [검증 구성요건](../../plan/perf-optimization/verification.md)입니다. 원본은 저장소에 넣지 않고 아래 실행 디렉터리에만 둡니다.

- **판정에 쓰는 실행:** `20261015T0247-a3be21d-before-dist`(`/private/tmp/claude-501/perf-runs/20261015T0247-a3be21d-before-dist/`). 빌드 결과물(dist)로 다시 잰 행 전부: 독립 스크립트 둘×두 런타임(`B2` 포함), vitest 벤치, `--equivalent` core, 탐침 넷×두 런타임.
- **그대로 쓰는 실행:** `20261015T0138-c59ba13-before`(`/private/tmp/claude-501/perf-runs/20261015T0138-c59ba13-before/`). `--equivalent` render와 heap 행은 그때도 dist였으므로 이 실행의 값을 씁니다. 나머지 행의 이 실행 값은 "소스 기준(참고)" 절에만 둡니다.
- **재현:** 패키지 디렉터리에서 `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node architecture/verification/perf-optimization/run-baseline.mjs --label=before-dist --quiet-since=<조용한 창 시작 ISO 시각>`을 실행합니다. 스크립트는 먼저 rolldown으로 JS 번들을 빌드하고, 아래 행을 같은 인자로 순서대로 돌리며, 행마다 명령·작업 디렉터리·`NODE_ENV`·시작과 끝 시각·사용한 dist 해시를 `env.json`에 적습니다. `--only=<행,행>`으로 일부 행만 다시 잴 수 있습니다.

## 환경

| 항목 | 값 |
| --- | --- |
| 기기 | Apple M1 Max, 10코어, 메모리 64 GB, arm64 |
| OS | Darwin 25.6.0 |
| 측정 런타임 | Node v26.11.1(측정 행 전부, 러너의 `process.execPath`), Bun 1.4.3 |
| 측정 대상 | 빌드 결과물 `dist/index.mjs`, sha256 `9ca9ea95fd618fc5dfb99cc2fb10a6efdbd3f7d82347de1842b7f9bb85d733ac`. 러너가 Node v26.11.1과 rolldown 1.2.0(`rolldown -c`)으로 빌드. 옛 판은 `@canard/schema-form_0.16.0`의 `dist/index.mjs`, sha256 `78362ee2e5b7c0bdca5f9b80f7490c32a54ea344565e97c2b4088080a3c861b2` |
| 내부 심볼 | **임시 조치(358라운드):** dist가 내보내지 않는 내부 함수(`blueprint`, `fieldNodeFactory`, `loadFieldNodeAtMount` 등)는 빌드된 번들을 git이 추적하지 않는 자리(`bench/.results/dist-engine/`, `benchmark-form/results/.core/`)에 복사하고 끝에 export 한 줄을 붙여 가져옵니다. 실행되는 코드는 dist 그대로이고 공개 겉면은 바뀌지 않습니다(`bench/distEngine/loadDistEngine.ts`). M3부터 속도 비교의 정본은 폼 전체 e2e(`<Form>` 마운트·갱신)이고, 내부 심볼 벤치는 회귀 신호로만 둡니다 |
| 357라운드에 바뀐 것 | 소유자 지시(`reviews/round-357-owner-answers.md:7`)로 모든 속도 행을 `src`가 아니라 dist로 잽니다. 그 전에는 독립 스크립트·탐침이 `src`를 tsx로, vitest 벤치가 vite 변환한 `src`를 돌았고, `--equivalent` core의 새 판도 `src` fixture를 esbuild로 한 파일에 묶은 것이었습니다(render 행만 dist). 그래서 core 표도 다시 쟀습니다. 독립 스크립트의 레거시 열은 `src/__legacy__`에서 0.16.0 배포 번들로 바꿨습니다 |
| 커밋 | 판정 실행은 `a3be21df8`(도구 커밋). 제품 코드는 `c59ba1363e66580c60ed70c9e9cd139496ec8d41`과 같습니다: `git diff c59ba1363 -- src`는 벤치 파일 `src/core/__benchmarks__/render-delay.bench.ts`의 import뿐이고, 진행 중이던 가설 0 수정은 측정 전에 작업 트리에서 뺐습니다. 다시 빌드한 dist 해시가 그 전 빌드와 같습니다 |
| `NODE_ENV` | 독립 스크립트와 탐침은 `production`. vitest 벤치·`benchmark-form`·heap 행은 각 package 스크립트처럼 비워 둠 |
| 조용한 창 | dist 실행: 알림 2026-10-15T02:47:00Z, 측정 02:47:37Z–02:55:31Z. 소스 실행: 알림 01:37:00Z, 측정 01:38:17Z–02:01:56Z(UTC). 그동안 다른 세션은 빌드·시험·벤치를 돌리지 않았습니다 |

## 원본 파일

dist 실행 디렉터리에는 아래 가운데 `equivalent-render*`와 `heap-snapshot*`·`heap-parse*`·`results/`를 뺀 파일이 있고, 소스 실행 디렉터리에는 전부 있습니다: `env.json`, `standalone-node-and-settle-{node,bun}-production.txt`, `standalone-derive-and-controls-{node,bun}-production.txt`, `vitest-bench-baseline.json`, `vitest-bench-latest.json`, `vitest-bench-compare.txt`, `equivalent-core.json`, `equivalent-core-summary.json`, `equivalent-render.json`, `equivalent-render-summary.json`, `probe-gate-siblings-{node,bun}.json`, `probe-fragment-toggle-{node,bun}.json`, `probe-if-host-siblings-{node,bun}.json`, `probe-array-verbs-{node,bun}.json`, `heap-b2.json`, `heap-snapshot-array-1000.json`, `heap-parse-array-1000.txt`, `results/heap-array-1000-*.heapsnapshot`. 행마다 stderr는 `<파일>.stderr.txt`에 있습니다.

## 요약

- **옛 판 대비(TEST-073의 선):** core 38행 가운데 29행, render 114행 가운데 27행이 처리량 15% 넘는 하락과 Welch p<0.05로 회귀입니다. 가장 큰 것은 `oneOf-5`·`10`·`20`의 core 갱신(5.84×·6.98×·9.26×)과 마운트(3.33×·3.64×·4.07×), `nested-d5-f4` 마운트(2.96×), `computed-visible-derived` 갱신(2.91×)입니다. 배열 마운트(`array-100`·`500`·`1000`)와 `flat-100`·`flat-500` 갱신은 새 판이 빠릅니다.
- **차수 탐침:** P-03은 N에 선형입니다(1천→8천 Node 10.15×, Bun 10.59×). P-08은 조각 수 F가 커질수록 이차에 다가갑니다(배가마다 Node 1.82→2.60→3.38, Bun 1.76→3.11→4.37). P-09는 `selectChildren` 호출 수가 형제 수와 무관하지만(호스트 4, 부모 2, `src` 참고값), 시간은 형제 수에 선형입니다(Node 8.01×, Bun 11.99×). 배열 `push`는 기존 길이에 선형입니다(1천→8천 Node 7.98×, Bun 10.92×). 네 판정 모두 `src` 기준 값과 같습니다.
- **메모리:** `B2` 노드당 잔존 힙은 Node 1,440 B, Bun 2,092 B입니다. 03의 기록(Node 413 B, Bun 1,732 B, P-07)보다 큽니다. 런타임 판이 달라 직접 견주지는 않지만, 이 작업의 "B2가 최적화 전보다 크지 않음" 게이트는 이 값을 기준으로 합니다.
- **같은 판 반복의 퍼짐:** `bench:compare`는 같은 커밋을 연달아 두 번 잰 것이라, dist 실행에서 44행의 비(최신/기준)가 0.71–1.23(중앙 1.01)입니다(소스 실행은 0.84–1.06). 묶음 PR에서 이 폭 안의 차이는 개선으로 주장하지 않습니다.
- **dist와 `src`의 차이:** vitest 벤치 44행은 dist에서 시간 중앙값이 `src`의 0.50–1.02배(중앙 0.79배)로 빨라졌습니다. `--equivalent` core 38행의 새 판 중앙값은 dist/`src` 한 파일 번들이 0.77–1.04배이고 회귀 판정이 바뀐 행은 없습니다. 독립 스크립트의 Node `18C` 행은 dist에서 오히려 느립니다(`18C-15` n64 25.83→57.81 µs, `18C-67` depth8 80.77→167.5 µs, `18C-81` n64 16.58→58.73 µs; Bun은 비슷함). 원인은 분리하지 않았습니다. 레거시 열이 0.16.0 번들로 바뀌어, `B5`는 Node에서 새 판 13.50 µs/입력 대 옛 판 5.396 µs/입력입니다(`src/__legacy__` 열은 19.29 µs였음).

## 옛 판 — v0.16.0과 같은 실행 (`benchmark-form --equivalent`)

`packages/aileron/benchmark-form`에서 `node --expose-gc --import tsx src/index.ts --equivalent --mode=<core|render> --min-samples=100 --out=<실행 디렉터리>/equivalent-<mode>.json`. 준비 10회, 쌍 표본 100회. 옛 판은 `@canard/schema-form_0.16.0`(배포 tgz), 새 판은 작업 폴더 빌드입니다. 칸은 ms 중앙값(10–90백분위; 99백분위)이고, 판정은 TEST-073의 선(처리량 평균 15% 넘는 하락과 Welch p<0.05)입니다. `guard:baseline`과 `guard:check`는 쓰지 않았습니다. 패키지 독립 스크립트의 레거시 열은 아래 "최적화 전" 표에 보조 자료로 있습니다.

### core (`equivalent-core-summary.json`)

실행 `20261015T0247-a3be21d-before-dist`의 값입니다. 357라운드부터 새 판도 dist 복사본을 씁니다(환경 절).

| 상황 | 지표 | 옛 판 0.16.0 | 최적화 전 `c59ba13` | 비 | 처리량 하락 | p | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sample-0 | core-mount | 0.254 (0.242–0.271; p99 0.316) | 0.306 (0.289–0.337; p99 0.380) | 1.21× | 17.0% | 1.6e-54 | **회귀** |
| sample-0 | core-update | 0.066 (0.059–0.080; p99 0.092) | 0.169 (0.159–0.190; p99 0.213) | 2.56× | 61.1% | 2.1e-79 | **회귀** |
| sample-1 | core-mount | 0.342 (0.327–0.363; p99 0.398) | 0.390 (0.377–0.418; p99 0.445) | 1.14× | 12.4% | 3.2e-30 | 아님 |
| sample-1 | core-update | 0.068 (0.062–0.078; p99 0.105) | 0.179 (0.168–0.196; p99 0.245) | 2.64× | 61.9% | 8.3e-85 | **회귀** |
| sample-2 | core-mount | 0.358 (0.340–0.388; p99 0.434) | 0.488 (0.473–0.528; p99 0.570) | 1.36× | 27.2% | 5.8e-94 | **회귀** |
| sample-2 | core-update | 0.079 (0.072–0.102; p99 0.112) | 0.188 (0.178–0.210; p99 0.228) | 2.38× | 57.1% | 8.4e-74 | **회귀** |
| sample-3 | core-mount | 0.613 (0.595–0.637; p99 0.743) | 1.05 (1.02–1.08; p99 1.15) | 1.71× | 40.7% | 1.4e-76 | **회귀** |
| sample-3 | core-update | 0.072 (0.067–0.090; p99 0.100) | 0.164 (0.154–0.187; p99 0.204) | 2.28× | 55.4% | 2.2e-78 | **회귀** |
| flat-50 | core-mount | 0.701 (0.454–0.899; p99 0.923) | 1.24 (0.800–1.63; p99 1.65) | 1.77× | 42.5% | 2.9e-31 | **회귀** |
| flat-50 | core-update | 0.667 (0.466–0.823; p99 1.04) | 0.704 (0.472–0.886; p99 0.981) | 1.06× | 2.5% | 4.6e-1 | 아님 |
| flat-100 | core-mount | 1.18 (0.715–1.38; p99 1.40) | 2.31 (1.37–2.67; p99 2.82) | 1.95× | 48.8% | 4.9e-35 | **회귀** |
| flat-100 | core-update | 0.961 (0.636–1.20; p99 1.31) | 0.831 (0.537–0.986; p99 1.21) | 0.86× | -17.4% | 5.5e-5 | 아님 |
| flat-500 | core-mount | 3.18 (2.42–3.54; p99 3.69) | 6.71 (5.17–7.58; p99 7.99) | 2.11× | 53.1% | 5.8e-72 | **회귀** |
| flat-500 | core-update | 4.86 (3.66–5.35; p99 5.66) | 1.16 (0.936–1.37; p99 1.49) | 0.24× | -303.8% | 3.1e-79 | 아님 |
| nested-d3-f4 | core-mount | 0.921 (0.610–1.03; p99 1.21) | 2.12 (1.26–2.50; p99 2.55) | 2.30× | 54.6% | 3.0e-46 | **회귀** |
| nested-d3-f4 | core-update | 0.497 (0.354–0.591; p99 0.662) | 0.858 (0.547–1.11; p99 1.21) | 1.73× | 41.7% | 6.1e-40 | **회귀** |
| nested-d5-f4 | core-mount | 4.66 (4.54–4.86; p99 4.95) | 13.8 (13.0–15.1; p99 15.3) | 2.96× | 66.3% | 2.0e-220 | **회귀** |
| nested-d5-f4 | core-update | 0.373 (0.358–0.432; p99 0.750) | 0.636 (0.591–0.683; p99 0.825) | 1.70× | 39.4% | 1.3e-66 | **회귀** |
| array-100 | core-mount | 1.73 (1.68–1.77; p99 1.79) | 1.50 (1.42–1.54; p99 1.56) | 0.87× | -15.6% | 4.0e-59 | 아님 |
| array-100 | core-update | 0.112 (0.103–0.136; p99 0.156) | 0.190 (0.174–0.212; p99 0.228) | 1.69× | 40.7% | 2.1e-69 | **회귀** |
| array-500 | core-mount | 6.50 (6.34–6.71; p99 7.20) | 5.32 (5.14–5.46; p99 5.80) | 0.82× | -22.9% | 4.0e-101 | 아님 |
| array-500 | core-update | 0.221 (0.205–0.255; p99 0.313) | 0.210 (0.196–0.249; p99 0.302) | 0.95× | -4.8% | 1.8e-3 | 아님 |
| array-1000 | core-mount | 12.0 (11.7–12.2; p99 12.8) | 10.3 (9.24–10.8; p99 11.3) | 0.86× | -19.6% | 5.9e-29 | 아님 |
| array-1000 | core-update | 0.369 (0.346–0.411; p99 0.436) | 0.217 (0.184–0.235; p99 0.269) | 0.59× | -75.8% | 3.9e-56 | 아님 |
| oneOf-5 | core-mount | 0.516 (0.491–0.548; p99 0.609) | 1.72 (1.35–2.11; p99 2.45) | 3.33× | 68.5% | 1.4e-152 | **회귀** |
| oneOf-5 | core-update | 0.161 (0.149–0.189; p99 0.234) | 0.940 (0.903–1.07; p99 1.19) | 5.84× | 82.8% | 2.3e-92 | **회귀** |
| oneOf-10 | core-mount | 0.573 (0.544–0.610; p99 0.774) | 2.09 (1.67–2.43; p99 2.58) | 3.64× | 71.4% | 1.7e-152 | **회귀** |
| oneOf-10 | core-update | 0.161 (0.150–0.206; p99 0.246) | 1.13 (1.10–1.36; p99 1.54) | 6.98× | 85.7% | 1.2e-86 | **회귀** |
| oneOf-20 | core-mount | 0.701 (0.654–0.740; p99 0.799) | 2.85 (2.46–3.37; p99 3.67) | 4.07× | 75.4% | 7.5e-185 | **회귀** |
| oneOf-20 | core-update | 0.162 (0.151–0.209; p99 0.247) | 1.50 (1.46–1.79; p99 1.98) | 9.26× | 89.1% | 2.0e-87 | **회귀** |
| array-push-100 | core-mount | 0.249 (0.220–0.375; p99 0.426) | 0.509 (0.435–0.677; p99 0.863) | 2.05× | 49.9% | 4.4e-54 | **회귀** |
| array-push-100 | core-update | 22.3 (6.94–29.6; p99 41.1) | 59.1 (30.7–65.9; p99 74.1) | 2.65× | 69.0% | 1.8e-18 | **회귀** |
| array-replace-200 | core-mount | 0.184 (0.172–0.190; p99 0.195) | 0.375 (0.334–0.395; p99 0.425) | 2.04× | 50.4% | 2.1e-171 | **회귀** |
| array-replace-200 | core-update | 2.91 (2.85–3.01; p99 3.12) | 5.79 (5.68–6.03; p99 6.12) | 1.99× | 49.7% | 4.8e-172 | **회귀** |
| array-push-remove-100 | core-mount | 0.251 (0.214–0.346; p99 0.415) | 0.497 (0.391–0.746; p99 0.908) | 1.98× | 46.8% | 2.6e-54 | **회귀** |
| array-push-remove-100 | core-update | 37.9 (17.5–51.5; p99 74.1) | 78.8 (26.9–113; p99 127) | 2.08× | 45.4% | 7.8e-13 | **회귀** |
| computed-visible-derived | core-mount | 0.390 (0.364–0.451; p99 0.804) | 0.906 (0.826–1.03; p99 1.20) | 2.32× | 56.4% | 1.3e-77 | **회귀** |
| computed-visible-derived | core-update | 0.137 (0.123–0.167; p99 0.273) | 0.400 (0.343–0.524; p99 0.625) | 2.91× | 65.7% | 9.7e-75 | **회귀** |

### render (`equivalent-render-summary.json`)

React 19.2.6과 jsdom 위의 마운트·갱신 벽시계와 Profiler 시간입니다.

| 상황 | 지표 | 옛 판 0.16.0 | 최적화 전 `c59ba13` | 비 | 처리량 하락 | p | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sample-0 | render-mount-wall | 4.92 (3.69–5.12; p99 5.26) | 5.18 (5.03–5.35; p99 5.58) | 1.05× | 15.1% | 5.4e-17 | **회귀** |
| sample-0 | render-update-wall | 2.19 (1.92–3.42; p99 3.51) | 3.23 (2.20–3.47; p99 3.62) | 1.48× | 21.8% | 1.0e-12 | **회귀** |
| sample-0 | profiler-mount | 1.96 (1.85–2.03; p99 2.16) | 2.11 (1.98–2.23; p99 2.43) | 1.08× | 7.7% | 8.6e-28 | 아님 |
| sample-0 | profiler-update | 0.302 (0.285–0.419; p99 0.461) | 0.265 (0.251–0.383; p99 0.429) | 0.88× | -12.2% | 4.8e-7 | 아님 |
| sample-0 | commits-mount | — | — | 1.00× | — | — | 아님 |
| sample-0 | commits-update | — | — | 0.50× | — | — | 아님 |
| sample-1 | render-mount-wall | 6.04 (5.12–7.25; p99 7.42) | 7.07 (6.36–7.38; p99 7.60) | 1.17× | 12.2% | 3.0e-15 | 아님 |
| sample-1 | render-update-wall | 2.16 (1.92–3.42; p99 3.65) | 3.34 (3.19–3.60; p99 3.73) | 1.55× | 25.5% | 2.2e-18 | **회귀** |
| sample-1 | profiler-mount | 3.86 (3.08–4.09; p99 4.20) | 3.90 (3.25–4.16; p99 4.37) | 1.01× | 3.5% | 3.0e-2 | 아님 |
| sample-1 | profiler-update | 0.371 (0.231–0.466; p99 0.563) | 0.341 (0.208–0.494; p99 0.547) | 0.92× | -7.6% | 7.8e-2 | 아님 |
| sample-1 | commits-mount | — | — | 1.00× | — | — | 아님 |
| sample-1 | commits-update | — | — | 0.50× | — | — | 아님 |
| sample-2 | render-mount-wall | 5.17 (4.67–6.40; p99 6.49) | 6.51 (6.02–6.69; p99 6.76) | 1.26× | 14.8% | 4.8e-19 | 아님 |
| sample-2 | render-update-wall | 2.11 (2.01–3.45; p99 3.70) | 3.36 (3.21–3.62; p99 3.67) | 1.59× | 28.9% | 6.4e-26 | **회귀** |
| sample-2 | profiler-mount | 3.16 (2.58–3.28; p99 3.46) | 3.39 (2.92–3.54; p99 3.61) | 1.07× | 8.1% | 8.4e-10 | 아님 |
| sample-2 | profiler-update | 0.380 (0.262–0.536; p99 0.611) | 0.343 (0.209–0.492; p99 0.506) | 0.90× | -13.5% | 9.9e-4 | 아님 |
| sample-2 | commits-mount | — | — | 1.00× | — | — | 아님 |
| sample-2 | commits-update | — | — | 0.50× | — | — | 아님 |
| sample-3 | render-mount-wall | 13.8 (13.5–17.0; p99 17.6) | 15.1 (14.6–17.8; p99 18.5) | 1.09× | 7.0% | 6.8e-8 | 아님 |
| sample-3 | render-update-wall | 3.21 (1.96–3.37; p99 3.45) | 3.25 (3.20–3.43; p99 3.69) | 1.01× | 16.4% | 4.5e-8 | **회귀** |
| sample-3 | profiler-mount | 10.4 (10.1–13.6; p99 14.0) | 10.9 (10.6–13.6; p99 14.1) | 1.04× | 2.9% | 6.5e-2 | 아님 |
| sample-3 | profiler-update | 0.257 (0.241–0.413; p99 0.470) | 0.222 (0.210–0.381; p99 0.514) | 0.86× | -13.4% | 9.9e-5 | 아님 |
| sample-3 | commits-mount | — | — | 1.00× | — | — | 아님 |
| sample-3 | commits-update | — | — | 0.50× | — | — | 아님 |
| flat-50 | render-mount-wall | 13.1 (12.6–16.9; p99 17.4) | 14.1 (13.6–17.2; p99 17.9) | 1.07× | 4.9% | 1.7e-3 | 아님 |
| flat-50 | render-update-wall | 28.5 (25.3–30.1; p99 30.5) | 29.6 (28.2–30.6; p99 31.5) | 1.04× | 5.3% | 1.1e-10 | 아님 |
| flat-50 | profiler-mount | 9.80 (9.49–13.5; p99 13.9) | 10.0 (9.59–13.0; p99 13.6) | 1.02× | -0.3% | 8.7e-1 | 아님 |
| flat-50 | profiler-update | 1.91 (1.73–2.86; p99 3.27) | 1.68 (1.46–2.48; p99 2.91) | 0.88× | -15.6% | 6.1e-6 | 아님 |
| flat-50 | commits-mount | — | — | 1.00× | — | — | 아님 |
| flat-50 | commits-update | — | — | 0.50× | — | — | 아님 |
| flat-100 | render-mount-wall | 23.0 (22.3–29.7; p99 31.0) | 23.4 (22.3–28.6; p99 29.6) | 1.01× | -0.3% | 8.5e-1 | 아님 |
| flat-100 | render-update-wall | 26.2 (23.5–28.7; p99 29.6) | 30.1 (28.6–31.5; p99 32.3) | 1.15× | 13.0% | 4.8e-32 | 아님 |
| flat-100 | profiler-mount | 18.1 (17.5–24.9; p99 25.7) | 18.2 (17.5–23.5; p99 24.2) | 1.00× | -0.7% | 7.0e-1 | 아님 |
| flat-100 | profiler-update | 2.06 (1.97–3.08; p99 3.20) | 1.77 (1.61–2.62; p99 3.19) | 0.86× | -16.0% | 6.8e-8 | 아님 |
| flat-100 | commits-mount | — | — | 1.00× | — | — | 아님 |
| flat-100 | commits-update | — | — | 0.50× | — | — | 아님 |
| flat-500 | render-mount-wall | 109 (106–138; p99 142) | 101 (98.2–131; p99 136) | 0.93× | -7.6% | 2.0e-8 | 아님 |
| flat-500 | render-update-wall | 29.0 (28.3–31.3; p99 31.9) | 39.6 (38.3–40.8; p99 42.8) | 1.36× | 25.9% | 3.3e-105 | **회귀** |
| flat-500 | profiler-mount | 86.9 (84.9–118; p99 121) | 86.0 (84.3–113; p99 117) | 0.99× | -1.2% | 3.9e-1 | 아님 |
| flat-500 | profiler-update | 3.83 (3.68–4.72; p99 4.95) | 2.95 (2.80–3.87; p99 4.52) | 0.77× | -27.3% | 3.2e-33 | 아님 |
| flat-500 | commits-mount | — | — | 1.00× | — | — | 아님 |
| flat-500 | commits-update | — | — | 0.50× | — | — | 아님 |
| nested-d3-f4 | render-mount-wall | 19.6 (18.9–25.5; p99 26.8) | 20.0 (19.5–24.8; p99 25.9) | 1.02× | 1.0% | 4.6e-1 | 아님 |
| nested-d3-f4 | render-update-wall | 26.5 (22.8–28.6; p99 29.8) | 31.0 (29.4–32.6; p99 33.8) | 1.17× | 15.9% | 1.8e-30 | **회귀** |
| nested-d3-f4 | profiler-mount | 14.9 (14.4–20.8; p99 21.8) | 15.1 (14.6–19.9; p99 20.4) | 1.01× | 0.2% | 8.9e-1 | 아님 |
| nested-d3-f4 | profiler-update | 2.54 (2.45–4.45; p99 5.26) | 2.31 (2.16–4.13; p99 4.46) | 0.91× | -9.9% | 2.5e-3 | 아님 |
| nested-d3-f4 | commits-mount | — | — | 1.00× | — | — | 아님 |
| nested-d3-f4 | commits-update | — | — | 0.50× | — | — | 아님 |
| nested-d5-f4 | render-mount-wall | 315 (294–328; p99 334) | 273 (268–298; p99 305) | 0.87× | -12.6% | 6.1e-50 | 아님 |
| nested-d5-f4 | render-update-wall | 24.1 (21.4–27.2; p99 27.4) | 33.5 (31.5–36.3; p99 37.3) | 1.39× | 28.6% | 2.0e-61 | **회귀** |
| nested-d5-f4 | profiler-mount | 238 (221–252; p99 255) | 225 (220–250; p99 255) | 0.94× | -3.5% | 1.6e-6 | 아님 |
| nested-d5-f4 | profiler-update | 3.42 (3.27–6.57; p99 7.19) | 3.36 (3.07–6.25; p99 6.55) | 0.98× | -5.5% | 1.7e-1 | 아님 |
| nested-d5-f4 | commits-mount | — | — | 1.00× | — | — | 아님 |
| nested-d5-f4 | commits-update | — | — | 0.50× | — | — | 아님 |
| array-100 | render-mount-wall | 98.6 (95.6–120; p99 131) | 88.3 (85.4–111; p99 118) | 0.90× | -12.5% | 4.8e-21 | 아님 |
| array-100 | render-update-wall | 4.45 (4.31–5.94; p99 7.76) | 3.85 (3.74–4.00; p99 4.20) | 0.87× | -23.1% | 4.4e-24 | 아님 |
| array-100 | profiler-mount | 79.7 (76.8–99.6; p99 109) | 74.1 (72.2–97.1; p99 102) | 0.93× | -8.0% | 1.3e-9 | 아님 |
| array-100 | profiler-update | 1.27 (1.23–1.96; p99 2.85) | 0.417 (0.380–0.615; p99 0.707) | 0.33× | -215.9% | 2.4e-75 | 아님 |
| array-100 | commits-mount | — | — | 1.00× | — | — | 아님 |
| array-100 | commits-update | — | — | 0.50× | — | — | 아님 |
| array-500 | render-mount-wall | 506 (473–513; p99 562) | 409 (402–445; p99 599) | 0.81× | -20.0% | 2.1e-51 | 아님 |
| array-500 | render-update-wall | 16.0 (16.0–17.0; p99 18.2) | 3.98 (3.93–4.01; p99 4.40) | 0.25× | -310.2% | 8.6e-96 | 아님 |
| array-500 | profiler-mount | 404 (371–410; p99 435) | 342 (339–377; p99 457) | 0.85× | -14.0% | 9.8e-37 | 아님 |
| array-500 | profiler-update | 6.66 (6.56–6.79; p99 7.39) | 0.768 (0.646–0.951; p99 1.01) | 0.12× | -762.8% | 3.3e-74 | 아님 |
| array-500 | commits-mount | — | — | 1.00× | — | — | 아님 |
| array-500 | commits-update | — | — | 0.50× | — | — | 아님 |
| array-1000 | render-mount-wall | 986 (976–999; p99 1011) | 847 (826–862; p99 872) | 0.86× | -16.8% | 1.0e-115 | 아님 |
| array-1000 | render-update-wall | 26.0 (23.4–40.7; p99 43.2) | 5.17 (4.18–5.47; p99 5.79) | 0.20× | -492.1% | 7.0e-105 | 아님 |
| array-1000 | profiler-mount | 769 (760–778; p99 794) | 708 (688–723; p99 732) | 0.92× | -8.9% | 1.3e-76 | 아님 |
| array-1000 | profiler-update | 9.59 (8.98–23.3; p99 24.3) | 0.795 (0.730–1.06; p99 1.14) | 0.08× | -1390.9% | 1.1e-84 | 아님 |
| array-1000 | commits-mount | — | — | 1.00× | — | — | 아님 |
| array-1000 | commits-update | — | — | 0.50× | — | — | 아님 |
| oneOf-5 | render-mount-wall | 5.02 (4.45–5.24; p99 5.41) | 6.98 (6.23–7.67; p99 7.80) | 1.39× | 29.2% | 8.8e-69 | **회귀** |
| oneOf-5 | render-update-wall | 6.32 (5.53–6.94; p99 7.17) | 8.92 (8.37–9.52; p99 9.65) | 1.41× | 30.2% | 4.2e-65 | **회귀** |
| oneOf-5 | profiler-mount | 2.89 (2.34–3.07; p99 3.21) | 3.88 (3.30–4.49; p99 4.60) | 1.34× | 29.8% | 3.6e-50 | **회귀** |
| oneOf-5 | profiler-update | 2.45 (1.72–2.85; p99 2.95) | 1.92 (1.43–2.21; p99 2.30) | 0.78× | -24.4% | 9.2e-16 | 아님 |
| oneOf-5 | commits-mount | — | — | 0.67× | — | — | 아님 |
| oneOf-5 | commits-update | — | — | 0.33× | — | — | 아님 |
| oneOf-10 | render-mount-wall | 5.09 (4.49–5.32; p99 5.64) | 7.49 (6.76–8.08; p99 8.26) | 1.47× | 33.9% | 3.2e-78 | **회귀** |
| oneOf-10 | render-update-wall | 6.29 (5.49–6.86; p99 8.07) | 9.17 (8.57–9.76; p99 10.6) | 1.46× | 31.9% | 1.0e-67 | **회귀** |
| oneOf-10 | profiler-mount | 2.96 (2.41–3.13; p99 3.35) | 4.37 (3.80–4.90; p99 4.97) | 1.47× | 36.1% | 2.8e-61 | **회귀** |
| oneOf-10 | profiler-update | 2.45 (1.71–2.79; p99 2.93) | 1.96 (1.46–2.26; p99 2.59) | 0.80× | -23.3% | 3.9e-14 | 아님 |
| oneOf-10 | commits-mount | — | — | 0.67× | — | — | 아님 |
| oneOf-10 | commits-update | — | — | 0.33× | — | — | 아님 |
| oneOf-20 | render-mount-wall | 5.18 (4.65–5.42; p99 5.86) | 8.21 (7.44–8.97; p99 9.24) | 1.58× | 38.3% | 2.8e-88 | **회귀** |
| oneOf-20 | render-update-wall | 6.22 (5.55–6.96; p99 7.57) | 9.54 (9.02–10.2; p99 10.7) | 1.53× | 35.0% | 6.9e-73 | **회귀** |
| oneOf-20 | profiler-mount | 3.06 (2.52–3.24; p99 3.46) | 5.23 (4.56–5.79; p99 5.93) | 1.71× | 43.7% | 6.2e-72 | **회귀** |
| oneOf-20 | profiler-update | 2.39 (1.71–2.82; p99 3.19) | 1.93 (1.43–2.24; p99 2.46) | 0.81× | -23.8% | 9.4e-14 | 아님 |
| oneOf-20 | commits-mount | — | — | 0.67× | — | — | 아님 |
| oneOf-20 | commits-update | — | — | 0.33× | — | — | 아님 |
| array-push-100 | render-mount-wall | 4.27 (3.01–4.84; p99 5.26) | 4.92 (4.52–5.52; p99 5.86) | 1.15× | 19.8% | 2.7e-16 | **회귀** |
| array-push-100 | render-update-wall | 383 (366–410; p99 465) | 570 (531–604; p99 647) | 1.49× | 31.9% | 1.4e-109 | **회귀** |
| array-push-100 | profiler-mount | 1.39 (1.31–1.76; p99 2.13) | 1.91 (1.66–2.32; p99 2.55) | 1.38× | 23.7% | 2.4e-32 | **회귀** |
| array-push-100 | profiler-update | 150 (140–175; p99 213) | 217 (188–241; p99 259) | 1.45× | 27.5% | 2.0e-53 | **회귀** |
| array-push-100 | commits-mount | — | — | 1.00× | — | — | 아님 |
| array-push-100 | commits-update | — | — | 0.50× | — | — | 아님 |
| array-replace-200 | render-mount-wall | 4.33 (3.11–4.62; p99 4.99) | 4.71 (4.56–5.01; p99 5.15) | 1.09× | 15.5% | 2.5e-14 | **회귀** |
| array-replace-200 | render-update-wall | 160 (157–193; p99 197) | 175 (170–205; p99 211) | 1.09× | 8.0% | 1.1e-14 | 아님 |
| array-replace-200 | profiler-mount | 1.39 (1.32–1.69; p99 1.91) | 1.69 (1.59–1.96; p99 2.06) | 1.21× | 16.2% | 1.1e-32 | **회귀** |
| array-replace-200 | profiler-update | 132 (129–163; p99 167) | 139 (135–172; p99 177) | 1.06× | 5.0% | 2.4e-5 | 아님 |
| array-replace-200 | commits-mount | — | — | 1.00× | — | — | 아님 |
| array-replace-200 | commits-update | — | — | 1.00× | — | — | 아님 |
| array-push-remove-100 | render-mount-wall | 5.14 (3.82–5.92; p99 6.65) | 5.65 (4.69–6.79; p99 7.18) | 1.10× | 14.5% | 1.3e-8 | 아님 |
| array-push-remove-100 | render-update-wall | 790 (688–873; p99 939) | 1108 (987–1261; p99 1318) | 1.40× | 29.7% | 4.0e-66 | **회귀** |
| array-push-remove-100 | profiler-mount | 2.31 (1.65–3.21; p99 3.47) | 2.60 (2.05–3.46; p99 3.73) | 1.12× | 11.6% | 4.1e-4 | 아님 |
| array-push-remove-100 | profiler-update | 300 (234–348; p99 386) | 351 (282–433; p99 468) | 1.17× | 17.4% | 6.5e-15 | **회귀** |
| array-push-remove-100 | commits-mount | — | — | 1.00× | — | — | 아님 |
| array-push-remove-100 | commits-update | — | — | 0.50× | — | — | 아님 |
| computed-visible-derived | render-mount-wall | 4.63 (4.28–5.32; p99 6.02) | 6.05 (5.57–6.19; p99 6.40) | 1.31× | 20.8% | 1.1e-51 | **회귀** |
| computed-visible-derived | render-update-wall | 7.88 (6.12–8.92; p99 9.72) | 9.84 (9.41–10.3; p99 10.5) | 1.25× | 22.0% | 1.4e-28 | **회귀** |
| computed-visible-derived | profiler-mount | 2.56 (2.06–2.71; p99 2.82) | 2.97 (2.55–3.07; p99 3.14) | 1.16× | 14.0% | 9.5e-21 | 아님 |
| computed-visible-derived | profiler-update | 1.22 (0.775–1.46; p99 1.51) | 1.05 (0.778–1.32; p99 1.41) | 0.87× | -8.5% | 5.1e-3 | 아님 |
| computed-visible-derived | commits-mount | — | — | 0.67× | — | — | 아님 |
| computed-visible-derived | commits-update | — | — | 0.43× | — | — | 아님 |

## 최적화 전 — `c59ba1363`, 빌드 결과물(dist) 기준

실행 `20261015T0247-a3be21d-before-dist`(`/private/tmp/claude-501/perf-runs/20261015T0247-a3be21d-before-dist/`)의 값입니다. 모든 행이 같은 `dist/index.mjs`(sha256 `9ca9ea95fd618fc5dfb99cc2fb10a6efdbd3f7d82347de1842b7f9bb85d733ac`)를 돌았습니다. 357라운드 전의 `src` 기준 값은 아래 "소스 기준(참고)" 절에 있습니다.

### 독립 스크립트 `bench/legacy-compare/node-and-settle.bench.ts` (`standalone-node-and-settle-{node,bun}-production.txt`)

패키지 디렉터리에서 `node --import tsx <파일>`과 `bun <파일>`, `NODE_ENV=production`. 시간 행은 표본 100회이고, 준비는 `B6`만 5회, 나머지는 20회입니다. 칸은 중앙값(10–90백분위)입니다. `B2`는 노드당 바이트 7개 표본의 중앙값과 최소–최대입니다. Node는 GC를 켠 자식 프로세스 하나 안에서 7회 재고, Bun은 자식 프로세스 7개에서 한 회씩 잽니다. 새 엔진 안의 회귀 감시이며, 레거시 열은 0.16.0 배포 번들(`--equivalent`와 같은 판)을 같은 프로세스에서 잰 보조 자료입니다(TEST-026).

| 행 | Node v26.11.1 | Bun 1.4.3 |
| --- | --- | --- |
| B1 혼합 10,000노드 읽기, µs | 25.54 (25.21–41.96) | 29.94 (29.32–52.43) |
| B1 레거시 열, µs | 31.46 (31.00–34.10) | 56.83 (56.54–103.1) |
| B5 숫자 키 한 번 쓰기, µs/입력 | 13.50 (12.33–17.67) | 15.48 (10.50–28.56) |
| B5 레거시 열, µs/입력 | 5.396 (5.084–8.804) | 3.292 (2.584–7.209) |
| B6 혼합 10,000노드 생성·로드, ms | 35.52 (33.29–41.25) | 18.95 (16.96–22.56) |
| B6 레거시 열, ms | 21.08 (20.10–27.54) | 10.28 (9.193–14.22) |
| 18C-15 n0, µs | 13.77 (12.04–17.29) | 6.667 (5.833–9.562) |
| 18C-15 n16, µs | 29.88 (27.92–37.58) | 14.65 (12.58–18.48) |
| 18C-15 n64, µs | 57.81 (54.41–69.09) | 16.77 (15.29–21.00) |
| 18C-67 depth0, µs | 43.19 (40.04–52.61) | 28.65 (25.33–37.67) |
| 18C-67 depth4, µs | 92.98 (88.35–102.8) | 50.92 (45.42–61.53) |
| 18C-67 depth8, µs | 167.5 (156.9–209.2) | 63.67 (57.79–81.05) |
| 18C-81 n0, µs | 15.88 (13.87–20.40) | 6.750 (6.125–9.674) |
| 18C-81 n16, µs | 29.92 (28.70–37.58) | 10.33 (9.250–14.56) |
| 18C-81 n64, µs | 58.73 (55.17–65.13) | 13.90 (13.08–16.79) |
| B2 잔존 힙, B/노드 | 1440 (1433–1921, 7회) | 2092 (1669–2100, 7회) |
| B2 레거시 열, B/노드 | 2390 (2384–2443, 7회) | 2393 (2392–2393, 7회) |
| B3 같은 맵 | 숨은 맵 8/8 종류, 행 10/10(속성·프로토타입 배치도 8/8, 10/10) | 속성·프로토타입 배치 8/8 종류, 행 10/10. 숨은 맵은 엔진 진단 없이 잴 수 없어 미검증 |
| B4 수신자 레이아웃(대리값) | 1 | 1 |

### 독립 스크립트 `bench/legacy-compare/derive-and-controls.bench.ts` (`standalone-derive-and-controls-{node,bun}-production.txt`)

TEST-071 행입니다. 원소 10,000개, 깊은 노드 작은 쪽 4·큰 쪽 19(크기비 4.75). 칸은 쓰기 µs 중앙값(10–90백분위)이고 "작은 쪽 / 큰 쪽" 순서입니다. 쓰기는 준비 6회 뒤 표본 31회, 비교는 준비 40회 뒤 표본 61회입니다. `whole object`가 하한 아래인 것은 P-02(소유자 수용)와 같은 관측입니다.

| 행 | Node 쓰기 | Node 비·판정 | Bun 쓰기 | Bun 비·판정 | 선 |
| --- | --- | --- | --- | --- | --- |
| TEST-071-element object | 6051 (5918–6341) / 5857 (5810–6133) | 1.001 통과 | 3248 (3177–3994) / 3136 (3087–3197) | 0.973 통과 | ratio <= 1.5 |
| TEST-071-element array | 231.8 (230.4–237.5) / 236.1 (231.2–248.7) | 1.007 통과 | 228.1 (218.6–245.4) / 228.3 (219.6–235.5) | 1.003 통과 | ratio <= 1.5 |
| TEST-071-whole object | 11796 (11327–12076) / 22537 (22339–23317) | 2.001 **선 밖** | 5959 (5744–6693) / 11408 (10996–11938) | 1.922 **선 밖** | ratio 2.375..9.5 (size ratio 4.75) |
| TEST-071-whole array | 5600 (5552–5784) / 16400 (16186–16800) | 3.155 통과 | 2696 (2658–2834) / 7783 (7670–8356) | 2.917 통과 | ratio 2.375..9.5 (size ratio 4.75) |

### vitest 벤치 일곱 (`vitest-bench-baseline.json`, `vitest-bench-latest.json`, `vitest-bench-compare.txt`)

`bench:baseline`·`bench:compare`와 같은 인자의 vitest 명령을 Node v26.11.1로 직접 불렀습니다(`--config vitest.bench.config.ts --run --outputJson bench/.results/baseline.json`, 이어서 `--compare bench/.results/baseline.json`). vitest의 JSON은 원 표본을 남기지 않으므로, 이 표만 10–90백분위 대신 75·99백분위와 상대 오차(rme)를 적습니다. 시간은 ms, 표본 수는 vitest가 시간 예산 안에서 정한 것입니다.

| 파일 | 묶음 / 행 | 회/s | 중앙값 | p75 | p99 | rme | 표본 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| branch-strategy-init | blueprint/load: branch initialization through core / oneOf 2 branches × 3 children | 4753 | 0.1787 | 0.1951 | 1.63 | ±3.92% | 2377 |
| branch-strategy-init | blueprint/load: branch initialization through core / oneOf 5 branches × 3 children | 3189 | 0.2629 | 0.2709 | 1.58 | ±13.75% | 1595 |
| branch-strategy-init | blueprint/load: branch initialization through core / oneOf 2 branches × 10 children | 2494 | 0.3387 | 0.3482 | 1.64 | ±8.80% | 1247 |
| branch-strategy-init | blueprint/load: branch initialization through core / oneOf 10 branches × 10 children (heavy) | 750 | 1.12 | 1.15 | 2.78 | ±16.59% | 375 |
| branch-strategy-init | blueprint/load: branch initialization through core / nested oneOf depth 3 | 1318 | 0.7071 | 0.7404 | 2.03 | ±2.24% | 659 |
| branch-strategy-init | blueprint/load: branch initialization through core / nested oneOf depth 5 | 261 | 3.47 | 3.67 | 5.44 | ±7.93% | 131 |
| compute-recalculate | settle: controls through public core / visible only (1 dep) | 104821 | 0.0088 | 0.0098 | 0.0133 | ±0.49% | 52411 |
| compute-recalculate | settle: controls through public core / visible + active (2 deps) | 31767 | 0.0290 | 0.0308 | 0.0598 | ±1.55% | 15884 |
| compute-recalculate | settle: controls through public core / derived simple (2 deps) | 38121 | 0.0230 | 0.0244 | 0.0528 | ±2.51% | 19061 |
| compute-recalculate | settle: controls through public core / derived heavy (7 deps) | 37897 | 0.0245 | 0.0259 | 0.0387 | ±1.49% | 18949 |
| compute-recalculate | settle: controls through public core / watch 5 deps | 80228 | 0.0107 | 0.0113 | 0.0276 | ±3.48% | 40114 |
| compute-recalculate | settle: controls through public core / oneOfIndex 3 branches | 11854 | 0.0770 | 0.0797 | 0.1368 | ±2.73% | 5928 |
| event-cascade | dispatch: public writes (legacy macrotask drain retained) / flat batch: 10 setValue on distinct fields + 1 drain | 673 | 1.41 | 1.56 | 2.40 | ±2.64% | 1011 |
| event-cascade | dispatch: public writes (legacy macrotask drain retained) / derived chain (a→sum→twice→label): 1 setValue + drain | 644 | 1.42 | 1.59 | 2.82 | ±2.14% | 645 |
| event-cascade | dispatch: public writes (legacy macrotask drain retained) / oneOf branch switch (a↔b): 1 setValue + drain | 578 | 1.64 | 1.77 | 4.91 | ±4.45% | 578 |
| find-node | navigation: find through core / depth 3 (4 segments) | 1510260 | 0.0007 | 0.0007 | 0.0008 | ±0.22% | 755131 |
| find-node | navigation: find through core / depth 7 (8 segments) | 814949 | 0.0012 | 0.0012 | 0.0014 | ±0.20% | 407475 |
| find-node | navigation: find through core / depth 12 (13 segments) | 518281 | 0.0019 | 0.0019 | 0.0022 | ±0.23% | 259141 |
| find-node | navigation: find through core / wide fanout 10 → last child | 4927646 | 0.0002 | 0.0002 | 0.0002 | ±0.25% | 2463824 |
| find-node | navigation: find through core / wide fanout 50 → last child | 4837160 | 0.0002 | 0.0002 | 0.0003 | ±0.27% | 2418581 |
| find-node | navigation: find through core / wide fanout 50 → first child | 4844708 | 0.0002 | 0.0002 | 0.0003 | ±0.36% | 2422355 |
| nodeFromJSONSchema | load: nodeFromJSONSchema through core / flat (5 props, terminal only) | 28174 | 0.0284 | 0.0299 | 0.0559 | ±8.67% | 14095 |
| nodeFromJSONSchema | load: nodeFromJSONSchema through core / nested (2 sub-objects, 7 terminals) | 17249 | 0.0464 | 0.0485 | 0.0835 | ±10.77% | 8625 |
| nodeFromJSONSchema | load: nodeFromJSONSchema through core / oneOf (single branch active) | 6013 | 0.1410 | 0.1490 | 0.4840 | ±6.44% | 3007 |
| nodeFromJSONSchema | load: nodeFromJSONSchema through core / computed (visible + derived deps) | 8370 | 0.0995 | 0.1042 | 0.2638 | ±10.80% | 4186 |
| object-pending-read | settle: object read after child write / 1000 × (child write + 1 parent value read) + drain | 168 | 5.98 | 6.12 | 6.70 | ±0.75% | 252 |
| object-pending-read | settle: object read after child write / 1000 × (child write + 3 parent value reads) + drain | 137 | 6.06 | 7.10 | 25.84 | ±6.30% | 206 |
| object-pending-read | settle: object read after child write / 1000 × child write, no read + drain | 139 | 6.28 | 7.30 | 17.35 | ±4.69% | 209 |
| object-pending-read | settle: object read after child write / 1000 × same-value write at depth 2 + drain | 210 | 4.57 | 4.79 | 8.28 | ±2.41% | 211 |
| object-pending-read | settle: object read after child write / 1000 × same-value write at depth 8 + drain | 97.59 | 10.33 | 10.39 | 10.71 | ±0.70% | 98 |
| object-pending-read | settle: object read after child write / 1000 × same-value write at depth 16 + drain | 54.64 | 18.21 | 18.37 | 19.88 | ±0.55% | 55 |
| object-pending-read | settle: object read after child write / create a 50-field form | 3654 | 0.2188 | 0.2323 | 2.06 | ±4.92% | 1827 |
| render-delay | load/render-delay: small (5 terminals) / [mount] nodeFromJSONSchema (validation off) | 28193 | 0.0283 | 0.0299 | 0.0531 | ±8.27% | 14144 |
| render-delay | load/render-delay: small (5 terminals) / [mount] nodeFromJSONSchema (validation on) | 29995 | 0.0274 | 0.0290 | 0.0499 | ±7.12% | 14998 |
| render-delay | load/render-delay: small (5 terminals) / [guard] clone(schema) | 526144 | 0.0019 | 0.0019 | 0.0021 | ±0.23% | 263072 |
| render-delay | load/render-delay: small (5 terminals) / [guard] clone(defaultValue) | 2546453 | 0.0004 | 0.0004 | 0.0005 | ±2.61% | 1273227 |
| render-delay | load/render-delay: medium (25 terminals) / [mount] nodeFromJSONSchema (validation off) | 6200 | 0.1325 | 0.1360 | 0.9598 | ±9.70% | 3101 |
| render-delay | load/render-delay: medium (25 terminals) / [mount] nodeFromJSONSchema (validation on) | 5337 | 0.1350 | 0.1424 | 1.84 | ±18.20% | 2859 |
| render-delay | load/render-delay: medium (25 terminals) / [guard] clone(schema) | 98305 | 0.0100 | 0.0101 | 0.0108 | ±0.20% | 49153 |
| render-delay | load/render-delay: medium (25 terminals) / [guard] clone(defaultValue) | 477846 | 0.0021 | 0.0021 | 0.0023 | ±0.23% | 238923 |
| render-delay | load/render-delay: large (150 terminals) / [mount] nodeFromJSONSchema (validation off) | 1113 | 0.7400 | 0.7573 | 2.54 | ±10.68% | 557 |
| render-delay | load/render-delay: large (150 terminals) / [mount] nodeFromJSONSchema (validation on) | 1099 | 0.7333 | 0.7534 | 2.67 | ±12.44% | 550 |
| render-delay | load/render-delay: large (150 terminals) / [guard] clone(schema) | 17434 | 0.0568 | 0.0573 | 0.0630 | ±0.21% | 8717 |
| render-delay | load/render-delay: large (150 terminals) / [guard] clone(defaultValue) | 114357 | 0.0086 | 0.0088 | 0.0093 | ±0.17% | 57179 |

### 대장 탐침 (`probe-<이름>-{node,bun}.json`)

이 디렉터리의 탐침 넷입니다. `NODE_ENV=production`, 크기마다 준비 뒤 표본 100회를 잽니다(`gate-siblings` 준비 30회, 나머지 20회). `gate-siblings`와 배열 동사는 표본마다 새 트리를 만듭니다. `gate-siblings`는 그 트리의 첫 로드를 재고, 배열 동사는 로드가 끝난 트리에서 동사 한 번을 잽니다. `fragment-toggle`과 `if-host-siblings`는 크기마다 트리 하나를 로드해 두고, 표본마다 시간 밖에서 값을 되돌리는 쓰기를 한 뒤 쓰기 한 번을 잽니다. 검사는 모두 시간 밖입니다. 칸은 ms 중앙값(10–90백분위)이고, "배가 비"는 크기를 두 배로 늘릴 때의 중앙값 비입니다(선형이면 2, 이차면 4).

#### P-03 회귀 신호 — `probe-gate-siblings.ts`

06 성능 기록 51C-01의 장면입니다. 불리언 `flag` 하나와 `controls.active: '../flag'`인 문자열 형제 N개를 둔 객체 루트를 첫 로드합니다.

| N | Node | Bun |
| --- | --- | --- |
| 1000 | 10.45 (8.751–11.82) | 8.644 (7.682–11.97) |
| 2000 | 20.30 (19.40–22.14) | 18.93 (16.87–22.36) |
| 4000 | 46.94 (45.35–52.29) | 40.12 (37.09–48.22) |
| 8000 | 106.0 (102.6–129.9) | 91.55 (82.44–103.7) |

배가 비: Node 1000→2000 1.39, 2000→4000 2.51, 4000→8000 2.30; Bun 1000→2000 2.26, 2000→4000 2.16, 4000→8000 2.46.

1천→8천은 Node 10.15×, Bun 10.59×로 N에 선형입니다. 06의 R-17 기록(42.7/83.9/217.0/520.8 ms)은 다른 Node 판과 트리 조건의 관측이라 이 표와 직접 견주지 않습니다. 고친 뒤에도 남기는 차수 회귀 신호입니다.

#### P-08 — `probe-fragment-toggle.ts`

주인 하나에 `enabled`와 상주하는 `target`을 두고, 조각 F개가 같은 `target`을 선언하며 `active: './enabled'`와 `disabled: './enabled'`를 보탭니다. 시간을 재는 것은 `enabled`를 false에서 true로 바꾸는 쓰기 한 번입니다. 주인이 실제로 dirty가 되고 조각 F개가 모두 선택되어, `publishStateKeys → calculateStateKeys → getControlLayers`가 같은 자식에 대해 F개 층을 결합합니다. 검사는 쓰기 전후의 `disabled`, `target` 출력 보존, 자식 둘, 선택된 조각 층 F개입니다.

| F | Node | Bun |
| --- | --- | --- |
| 16 | 0.112 (0.0850–0.144) | 0.0929 (0.0814–0.115) |
| 32 | 0.205 (0.194–0.241) | 0.163 (0.152–0.193) |
| 64 | 0.533 (0.514–0.597) | 0.509 (0.476–0.548) |
| 128 | 1.799 (1.725–1.891) | 2.225 (2.128–2.648) |

배가 비: Node 16→32 1.82, 32→64 2.60, 64→128 3.38; Bun 16→32 1.76, 32→64 3.11, 64→128 4.37.

16→128은 Node 16.04×, Bun 23.96×입니다. 배가 비가 F와 함께 커져 64→128에서는 이차(4)에 가깝습니다. 대장 P-08의 O(F²) 추정과 맞는 차수이며, 원인(선언마다의 `parentIds.includes`와 식 탐색)은 이 탐침으로 분리하지 않았습니다.

#### P-09 — `probe-if-host-siblings.ts`

루트에 비루트 `if` 호스트 `/host`와 형제 N개를 둡니다. 호스트의 `if`는 `/host/flag`를 읽고 `/host/selected`를 더합니다. 시간을 재는 것은 `flag`를 false에서 true로 바꾸는 쓰기 한 번이고, `registerRecalculation`의 자기 선언 게이트 분기가 부모를 형상 변경으로 표시합니다. 호출 수는 그 쓰기의 정착 한 번 동안의 `selectChildren` 호출을 경로별로 센 것입니다. 시간은 계수기 없이 dist 번들에서 잽니다. 호출 수는 번들 안의 내부 호출이라 dist에서 셀 수 없으므로, 같은 스크립트가 시간 측정 뒤 `src`를 따로 한 번 돌려 모듈 내보내기를 감싸 셉니다(Node `module.registerHooks`, Bun `mock.module`, 제품 코드 변경 없음). 그래서 호출 수는 `src` 기준 참고값입니다.

| 형제 N | Node | Bun | `selectChildren` 호출 수, `src` 참고값(Node 중앙값, Bun 중앙값, Node 범위) |
| --- | --- | --- | --- |
| 1000 | 4.906 (4.550–5.470) | 2.640 (2.350–4.025) | 호스트 4·부모 2 (Bun 4·2; 범위 4–4·2–2) |
| 2000 | 6.803 (6.501–7.830) | 5.974 (5.361–7.534) | 호스트 4·부모 2 (Bun 4·2; 범위 4–4·2–2) |
| 4000 | 17.09 (16.01–17.75) | 12.88 (11.94–15.34) | 호스트 4·부모 2 (Bun 4·2; 범위 4–4·2–2) |
| 8000 | 39.31 (38.63–42.24) | 31.66 (29.30–36.33) | 호스트 4·부모 2 (Bun 4·2; 범위 4–4·2–2) |

배가 비: Node 1000→2000 1.45, 2000→4000 2.46, 4000→8000 2.30; Bun 1000→2000 2.05, 2000→4000 2.12, 4000→8000 2.37.

호출 수는 모든 크기와 두 런타임에서 호스트 4회, 부모 2회로 같습니다. 따라서 호출 수가 형제 수로 곱해지지는 않습니다. 그런데 시간은 1천→8천에서 Node 8.01×, Bun 11.99×로 형제 수에 선형입니다. 이 선형 비용이 부모 재선택 두 번 안에서 형제 N+1개를 훑는 것인지 다른 단계인지는 이 탐침으로 분리하지 않았습니다. 위반인지는 M1이 SETTLE-017의 순회 범위로 판정합니다.

#### 배열 동사 — `probe-array-verbs.ts`

숫자 `0..N-1`을 담은 루트 배열을 기존 길이 N으로 로드한 뒤, 공개 `push(n)` 한 번과, 따로 `remove(1)` 한 번을 잽니다(`dispatchPush`·`dispatchRemove` 경로, 동기 정착과 전달 포함). `push`는 길이와 모든 값·자식 이름·경로를, `remove`는 지운 값과 꼬리의 이동한 값·이름·경로를 검사합니다. M1의 G8 계약 판정용입니다(`push`가 기존 길이에 비례하면 위반, `remove`는 꼬리 길이에만 비례해야 함).

| 동사 N | Node | Bun |
| --- | --- | --- |
| push 1000 | 0.254 (0.226–0.350) | 0.282 (0.250–0.362) |
| push 2000 | 0.471 (0.441–0.553) | 0.578 (0.542–0.641) |
| push 4000 | 0.925 (0.893–1.020) | 1.323 (1.244–1.589) |
| push 8000 | 2.029 (1.963–2.182) | 3.079 (2.914–4.680) |
| remove 1000 (꼬리 998) | 2.392 (2.243–2.853) | 2.432 (2.245–2.707) |
| remove 2000 (꼬리 1998) | 4.726 (4.534–5.845) | 4.821 (4.553–6.198) |
| remove 4000 (꼬리 3998) | 10.43 (9.278–10.97) | 9.100 (8.593–10.89) |
| remove 8000 (꼬리 7998) | 22.12 (21.02–23.72) | 21.90 (19.40–23.89) |

배가 비: Node push1000→2000 1.85, push2000→4000 1.96, push4000→8000 2.19, remove1000→2000 1.98, remove2000→4000 2.21, remove4000→8000 2.12; Bun push1000→2000 2.05, push2000→4000 2.29, push4000→8000 2.33, remove1000→2000 1.98, remove2000→4000 1.89, remove4000→8000 2.41.

`push`는 1천→8천에서 Node 7.98×, Bun 10.92×로 기존 길이에 선형입니다. **주의:** 이 탐침은 `loadFieldNodeAtMount`로 로드한 직후 배달을 비우지 않고 첫 동사를 잽니다. 로드가 모든 노드를 `runtime.deliveries`에 올리므로(`loadStaticFirstTree.ts:54,78`), 시간을 재는 첫 동사가 끝날 때 `runDeliveryWaves`가 마운트 배달 N개를 함께 비웁니다(G8 설계 검토에서 코드로 확인). 그래서 이 행에는 동사 고유의 비용 밖에 마운트 배달의 길이 비례 몫이 섞여 있습니다. 소실험 프로파일(`src`, push 8천)에서 `runDeliveryWaves`의 몫은 10.9%였습니다. 마운트를 끝낸 정상 상태의 행은 G8 작업에서 따로 더합니다. 항목 하나를 더하는 쓰기가 기존 길이에 비례하므로 G8 판정의 후보입니다. `remove(1)`은 Node 9.25×, Bun 9.00×입니다. 다만 지우는 자리를 머리 쪽에 고정했으므로 꼬리 길이와 전체 길이가 함께 늘어, 이 표만으로는 "꼬리에만 비례"와 "전체 길이에 비례"를 가르지 못합니다. 가르려면 지우는 자리를 바꾸는 행이 더 필요합니다.

### 메모리

- `B2` 노드당 잔존 힙: 위 독립 스크립트 표의 `B2` 행입니다(`heap-b2.json`에 같은 값과 표본). dist 실행에서 Node 1,440 B, Bun 2,092 B이고, 같은 프로세스의 레거시 열(0.16.0 번들)은 Node 2,390 B, Bun 2,393 B입니다.
- 보유 경로(소스 실행, 그때도 dist): `benchmark-form`의 `heap-snapshot --scenario=array-1000 --snapshot`과 `heap-parse`를 돌렸습니다(`heap-snapshot-array-1000.json`, `heap-parse-array-1000.txt`). 앱 수준 증가량은 286.8 MB(3회의 중앙값, React·jsdom 포함)이고, 생성자별 얕은 크기에서 `FieldNode`가 4,002개·376 B/개, `FieldNodeRevisionLedger`가 4,002개·32 B/개입니다. 이 파서는 지배자 기준의 보유 경로가 아니라 얕은 크기만 내고, 강조하는 노드 클래스가 레거시 엔진의 것입니다. 그래서 계획이 M0에 둔 새 엔진의 보유 경로 분류(P-07)는 하지 못했고, 원장 관리자 결정으로 L3 묶음에서 합니다. 러너는 이 행을 "partial"로 적었습니다.

## 소스 기준(참고) — 실행 `20261015T0138-c59ba13-before`

357라운드 전의 측정이며 판정에 쓰지 않습니다. 독립 스크립트와 탐침은 `src`를 tsx로 직접 돌렸고, vitest 벤치는 vite가 변환한 `src`를, `--equivalent` core의 새 판은 `src/__tests__/fixtures/nodeFromJSONSchema.ts`를 esbuild로 한 파일에 묶은 것을 돌렸습니다. 레거시 열은 `src/__legacy__`였습니다. render와 heap 행은 그때도 dist였으므로 위 표에 그대로 있습니다. 아래 표의 파일 이름은 이 실행 디렉터리의 것입니다.

### 옛 판 대비 core — 새 판을 `src` 한 파일 번들로 잰 값

| 상황 | 지표 | 옛 판 0.16.0 | 최적화 전 `c59ba13` | 비 | 처리량 하락 | p | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sample-0 | core-mount | 0.252 (0.243–0.274; p99 0.356) | 0.301 (0.287–0.326; p99 0.381) | 1.20× | 15.9% | 1.2e-40 | **회귀** |
| sample-0 | core-update | 0.063 (0.056–0.070; p99 0.088) | 0.165 (0.154–0.182; p99 0.203) | 2.64× | 62.1% | 4.0e-89 | **회귀** |
| sample-1 | core-mount | 0.338 (0.327–0.360; p99 0.397) | 0.388 (0.373–0.422; p99 0.456) | 1.15× | 12.9% | 1.7e-43 | 아님 |
| sample-1 | core-update | 0.067 (0.060–0.078; p99 0.097) | 0.178 (0.168–0.193; p99 0.225) | 2.66× | 62.1% | 2.5e-83 | **회귀** |
| sample-2 | core-mount | 0.351 (0.337–0.370; p99 0.394) | 0.485 (0.465–0.515; p99 0.544) | 1.38× | 27.6% | 4.7e-103 | **회귀** |
| sample-2 | core-update | 0.080 (0.074–0.098; p99 0.121) | 0.187 (0.175–0.204; p99 0.254) | 2.34× | 56.4% | 3.9e-77 | **회귀** |
| sample-3 | core-mount | 0.603 (0.582–0.627; p99 0.676) | 1.04 (0.991–1.08; p99 1.14) | 1.73× | 42.0% | 6.2e-150 | **회귀** |
| sample-3 | core-update | 0.074 (0.067–0.088; p99 0.105) | 0.161 (0.149–0.190; p99 0.208) | 2.17× | 53.7% | 1.4e-80 | **회귀** |
| flat-50 | core-mount | 0.791 (0.533–0.925; p99 0.984) | 1.40 (0.891–1.66; p99 1.70) | 1.77× | 43.0% | 8.8e-31 | **회귀** |
| flat-50 | core-update | 0.697 (0.496–0.827; p99 1.46) | 0.842 (0.499–0.988; p99 1.40) | 1.21× | 12.4% | 4.2e-4 | 아님 |
| flat-100 | core-mount | 1.18 (0.675–1.38; p99 1.42) | 2.28 (1.34–2.70; p99 3.06) | 1.93× | 49.1% | 7.8e-33 | **회귀** |
| flat-100 | core-update | 0.945 (0.611–1.14; p99 1.36) | 0.798 (0.494–0.957; p99 1.07) | 0.84× | -18.8% | 1.0e-5 | 아님 |
| flat-500 | core-mount | 3.20 (2.44–3.57; p99 3.86) | 6.86 (5.30–7.81; p99 8.32) | 2.14× | 53.7% | 1.6e-69 | **회귀** |
| flat-500 | core-update | 4.87 (3.60–5.48; p99 5.91) | 1.19 (0.913–1.36; p99 1.64) | 0.24× | -301.9% | 3.8e-74 | 아님 |
| nested-d3-f4 | core-mount | 0.893 (0.601–1.05; p99 1.19) | 2.13 (1.30–2.47; p99 2.56) | 2.39× | 55.3% | 6.9e-49 | **회귀** |
| nested-d3-f4 | core-update | 0.491 (0.361–0.566; p99 0.627) | 0.863 (0.564–1.01; p99 1.15) | 1.76× | 41.4% | 2.0e-43 | **회귀** |
| nested-d5-f4 | core-mount | 4.63 (4.53–4.85; p99 5.02) | 14.0 (13.1–15.1; p99 16.1) | 3.03× | 67.0% | 6.8e-209 | **회귀** |
| nested-d5-f4 | core-update | 0.378 (0.363–0.422; p99 0.487) | 0.638 (0.592–0.680; p99 0.765) | 1.69× | 39.7% | 6.3e-100 | **회귀** |
| array-100 | core-mount | 1.74 (1.70–1.78; p99 1.85) | 1.53 (1.47–1.56; p99 1.62) | 0.88× | -14.3% | 9.9e-66 | 아님 |
| array-100 | core-update | 0.110 (0.101–0.135; p99 0.160) | 0.192 (0.173–0.210; p99 0.227) | 1.75× | 40.6% | 1.9e-70 | **회귀** |
| array-500 | core-mount | 6.46 (6.36–6.58; p99 6.80) | 5.38 (5.19–5.51; p99 5.86) | 0.83× | -20.6% | 4.9e-96 | 아님 |
| array-500 | core-update | 0.219 (0.205–0.247; p99 0.270) | 0.203 (0.187–0.223; p99 0.245) | 0.93× | -9.3% | 3.0e-15 | 아님 |
| array-1000 | core-mount | 12.0 (11.7–12.3; p99 12.7) | 10.3 (9.38–10.9; p99 12.1) | 0.86× | -18.3% | 4.4e-49 | 아님 |
| array-1000 | core-update | 0.376 (0.354–0.421; p99 0.448) | 0.226 (0.210–0.257; p99 0.275) | 0.60× | -65.6% | 1.7e-88 | 아님 |
| oneOf-5 | core-mount | 0.519 (0.499–0.553; p99 0.651) | 1.69 (1.36–2.14; p99 2.38) | 3.26× | 68.6% | 1.9e-153 | **회귀** |
| oneOf-5 | core-update | 0.161 (0.152–0.197; p99 0.218) | 0.951 (0.913–1.14; p99 1.25) | 5.92× | 83.2% | 1.3e-98 | **회귀** |
| oneOf-10 | core-mount | 0.572 (0.536–0.595; p99 0.662) | 2.05 (1.74–2.45; p99 2.64) | 3.58× | 72.1% | 1.5e-175 | **회귀** |
| oneOf-10 | core-update | 0.161 (0.150–0.189; p99 0.212) | 1.14 (1.10–1.30; p99 1.44) | 7.07× | 85.9% | 2.8e-100 | **회귀** |
| oneOf-20 | core-mount | 0.697 (0.663–0.712; p99 0.744) | 2.98 (2.46–3.33; p99 3.68) | 4.28× | 75.6% | 1.2e-213 | **회귀** |
| oneOf-20 | core-update | 0.159 (0.151–0.192; p99 0.226) | 1.50 (1.48–1.75; p99 1.87) | 9.44× | 89.3% | 8.7e-100 | **회귀** |
| array-push-100 | core-mount | 0.242 (0.211–0.332; p99 0.408) | 0.492 (0.432–0.658; p99 0.821) | 2.03× | 50.4% | 1.3e-56 | **회귀** |
| array-push-100 | core-update | 23.6 (7.83–30.5; p99 46.9) | 57.5 (18.0–63.5; p99 68.3) | 2.44× | 58.7% | 8.6e-15 | **회귀** |
| array-replace-200 | core-mount | 0.184 (0.173–0.191; p99 0.197) | 0.363 (0.329–0.391; p99 0.399) | 1.97× | 49.3% | 3.9e-163 | **회귀** |
| array-replace-200 | core-update | 2.87 (2.82–2.98; p99 3.22) | 5.73 (5.59–5.99; p99 6.13) | 2.00× | 49.9% | 4.1e-160 | **회귀** |
| array-push-remove-100 | core-mount | 0.250 (0.231–0.388; p99 0.419) | 0.496 (0.395–0.670; p99 0.851) | 1.99× | 46.0% | 4.9e-51 | **회귀** |
| array-push-remove-100 | core-update | 39.7 (21.1–49.4; p99 64.6) | 102 (46.6–117; p99 129) | 2.58× | 57.2% | 2.3e-26 | **회귀** |
| computed-visible-derived | core-mount | 0.392 (0.368–0.483; p99 0.555) | 0.956 (0.817–1.18; p99 1.23) | 2.44× | 56.9% | 9.1e-75 | **회귀** |
| computed-visible-derived | core-update | 0.132 (0.119–0.154; p99 0.172) | 0.407 (0.356–0.506; p99 0.610) | 3.09× | 67.9% | 1.6e-106 | **회귀** |

### 최적화 전 — `src` 기준

#### 독립 스크립트 `bench/legacy-compare/node-and-settle.bench.ts` (`standalone-node-and-settle-{node,bun}-production.txt`)

패키지 디렉터리에서 `node --import tsx <파일>`과 `bun <파일>`, `NODE_ENV=production`. 시간 행은 표본 100회이고, 준비는 `B6`만 5회, 나머지는 20회입니다. 칸은 중앙값(10–90백분위)입니다. `B2`는 노드당 바이트 7개 표본의 중앙값과 최소–최대입니다. Node는 GC를 켠 자식 프로세스 하나 안에서 7회 재고, Bun은 자식 프로세스 7개에서 한 회씩 잽니다. 새 엔진 안의 회귀 감시이며, 레거시 열은 같은 프로세스의 보조 자료입니다(TEST-026).

| 행 | Node v26.11.1 | Bun 1.4.3 |
| --- | --- | --- |
| B1 혼합 10,000노드 읽기, µs | 26.08 (25.75–133.6) | 27.67 (27.58–48.79) |
| B1 레거시 열, µs | 30.33 (30.29–30.42) | 54.87 (54.83–99.60) |
| B5 숫자 키 한 번 쓰기, µs/입력 | 14.46 (13.70–18.93) | 14.00 (10.67–30.24) |
| B5 레거시 열, µs/입력 | 19.29 (18.75–22.00) | 3.271 (2.667–6.295) |
| B6 혼합 10,000노드 생성·로드, ms | 33.41 (32.00–37.77) | 19.10 (17.37–22.80) |
| B6 레거시 열, ms | 26.56 (24.79–35.64) | 10.38 (9.671–14.72) |
| 18C-15 n0, µs | 10.54 (10.17–11.59) | 6.708 (6.079–9.558) |
| 18C-15 n16, µs | 18.92 (17.79–23.87) | 15.48 (13.33–24.49) |
| 18C-15 n64, µs | 25.83 (25.03–30.05) | 16.42 (15.16–20.00) |
| 18C-67 depth0, µs | 34.15 (30.74–44.84) | 31.88 (26.23–41.56) |
| 18C-67 depth4, µs | 60.90 (54.80–72.69) | 50.77 (45.32–61.52) |
| 18C-67 depth8, µs | 80.77 (77.27–87.85) | 64.06 (59.79–74.70) |
| 18C-81 n0, µs | 9.000 (8.791–11.48) | 7.020 (6.083–11.26) |
| 18C-81 n16, µs | 12.92 (11.54–15.64) | 10.60 (9.667–13.27) |
| 18C-81 n64, µs | 16.58 (15.71–19.76) | 14.29 (13.45–16.48) |
| B2 잔존 힙, B/노드 | 1440 (1433–1924, 7회) | 2110 (1686–2110, 7회) |
| B2 레거시 열, B/노드 | 2409 (2400–2460, 7회) | 2407 (2406–2407, 7회) |
| B3 같은 맵 | 숨은 맵 8/8 종류, 행 10/10(속성·프로토타입 배치도 8/8, 10/10) | 속성·프로토타입 배치 8/8 종류, 행 10/10. 숨은 맵은 엔진 진단 없이 잴 수 없어 미검증 |
| B4 수신자 레이아웃(대리값) | 1 | 1 |

#### 독립 스크립트 `bench/legacy-compare/derive-and-controls.bench.ts` (`standalone-derive-and-controls-{node,bun}-production.txt`)

TEST-071 행입니다. 원소 10,000개, 깊은 노드 작은 쪽 4·큰 쪽 19(크기비 4.75). 칸은 쓰기 µs 중앙값(10–90백분위)이고 "작은 쪽 / 큰 쪽" 순서입니다. 쓰기는 준비 6회 뒤 표본 31회, 비교는 준비 40회 뒤 표본 61회입니다. `whole object`가 하한 아래인 것은 P-02(소유자 수용)와 같은 관측입니다.

| 행 | Node 쓰기 | Node 비·판정 | Bun 쓰기 | Bun 비·판정 | 선 |
| --- | --- | --- | --- | --- | --- |
| TEST-071-element object | 5904 (5868–6060) / 5883 (5862–6067) | 1.000 통과 | 3245 (3181–3828) / 3177 (3131–3438) | 0.980 통과 | ratio <= 1.5 |
| TEST-071-element array | 234.0 (231.5–240.3) / 248.0 (234.4–266.7) | 1.011 통과 | 227.3 (217.3–239.2) / 224.3 (218.2–229.3) | 1.005 통과 | ratio <= 1.5 |
| TEST-071-whole object | 10960 (10883–11153) / 22239 (21965–22997) | 2.016 **선 밖** | 5837 (5760–6600) / 11385 (10938–12086) | 1.884 **선 밖** | ratio 2.375..9.5 (size ratio 4.75) |
| TEST-071-whole array | 5198 (5148–5362) / 16292 (16077–16661) | 3.192 통과 | 2657 (2641–2795) / 7746 (7673–8225) | 2.936 통과 | ratio 2.375..9.5 (size ratio 4.75) |

#### vitest 벤치 일곱 (`vitest-bench-baseline.json`, `vitest-bench-latest.json`, `vitest-bench-compare.txt`)

`bench:baseline`·`bench:compare`와 같은 인자의 vitest 명령을 Node v26.11.1로 직접 불렀습니다(`--config vitest.bench.config.ts --run --outputJson bench/.results/baseline.json`, 이어서 `--compare bench/.results/baseline.json`). vitest의 JSON은 원 표본을 남기지 않으므로, 이 표만 10–90백분위 대신 75·99백분위와 상대 오차(rme)를 적습니다. 시간은 ms, 표본 수는 vitest가 시간 예산 안에서 정한 것입니다.

| 파일 | 묶음 / 행 | 회/s | 중앙값 | p75 | p99 | rme | 표본 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| branch-strategy-init | blueprint/load: branch initialization through core / oneOf 2 branches × 3 children | 3805 | 0.2260 | 0.2460 | 1.16 | ±3.90% | 1903 |
| branch-strategy-init | blueprint/load: branch initialization through core / oneOf 5 branches × 3 children | 2537 | 0.3290 | 0.3435 | 1.81 | ±13.96% | 1344 |
| branch-strategy-init | blueprint/load: branch initialization through core / oneOf 2 branches × 10 children | 2143 | 0.4274 | 0.4420 | 1.80 | ±2.69% | 1072 |
| branch-strategy-init | blueprint/load: branch initialization through core / oneOf 10 branches × 10 children (heavy) | 695 | 1.34 | 1.37 | 2.60 | ±2.25% | 348 |
| branch-strategy-init | blueprint/load: branch initialization through core / nested oneOf depth 3 | 1009 | 0.9054 | 0.9440 | 2.15 | ±6.39% | 505 |
| branch-strategy-init | blueprint/load: branch initialization through core / nested oneOf depth 5 | 215 | 4.52 | 4.70 | 5.76 | ±1.52% | 108 |
| compute-recalculate | settle: controls through public core / visible only (1 dep) | 72765 | 0.0128 | 0.0140 | 0.0227 | ±0.48% | 36383 |
| compute-recalculate | settle: controls through public core / visible + active (2 deps) | 24179 | 0.0372 | 0.0398 | 0.0738 | ±2.61% | 12090 |
| compute-recalculate | settle: controls through public core / derived simple (2 deps) | 30753 | 0.0309 | 0.0326 | 0.0493 | ±0.98% | 15377 |
| compute-recalculate | settle: controls through public core / derived heavy (7 deps) | 27413 | 0.0346 | 0.0365 | 0.0505 | ±1.08% | 13707 |
| compute-recalculate | settle: controls through public core / watch 5 deps | 58142 | 0.0163 | 0.0170 | 0.0220 | ±1.07% | 29139 |
| compute-recalculate | settle: controls through public core / oneOfIndex 3 branches | 10129 | 0.0936 | 0.0965 | 0.1695 | ±1.40% | 5065 |
| event-cascade | dispatch: public writes (legacy macrotask drain retained) / flat batch: 10 setValue on distinct fields + 1 drain | 590 | 1.53 | 2.02 | 2.94 | ±1.87% | 886 |
| event-cascade | dispatch: public writes (legacy macrotask drain retained) / derived chain (a→sum→twice→label): 1 setValue + drain | 541 | 1.75 | 2.20 | 3.18 | ±2.70% | 541 |
| event-cascade | dispatch: public writes (legacy macrotask drain retained) / oneOf branch switch (a↔b): 1 setValue + drain | 612 | 1.69 | 1.73 | 2.54 | ±2.30% | 613 |
| find-node | navigation: find through core / depth 3 (4 segments) | 832715 | 0.0012 | 0.0012 | 0.0013 | ±0.17% | 416358 |
| find-node | navigation: find through core / depth 7 (8 segments) | 443234 | 0.0022 | 0.0022 | 0.0025 | ±1.00% | 221618 |
| find-node | navigation: find through core / depth 12 (13 segments) | 289430 | 0.0034 | 0.0035 | 0.0037 | ±0.16% | 144715 |
| find-node | navigation: find through core / wide fanout 10 → last child | 2397679 | 0.0004 | 0.0004 | 0.0005 | ±0.19% | 1198840 |
| find-node | navigation: find through core / wide fanout 50 → last child | 2302409 | 0.0004 | 0.0004 | 0.0005 | ±1.89% | 1151205 |
| find-node | navigation: find through core / wide fanout 50 → first child | 2397887 | 0.0004 | 0.0004 | 0.0005 | ±0.18% | 1198944 |
| nodeFromJSONSchema | load: nodeFromJSONSchema through core / flat (5 props, terminal only) | 23326 | 0.0347 | 0.0365 | 0.0634 | ±8.71% | 11962 |
| nodeFromJSONSchema | load: nodeFromJSONSchema through core / nested (2 sub-objects, 7 terminals) | 14230 | 0.0566 | 0.0590 | 0.0945 | ±10.99% | 7116 |
| nodeFromJSONSchema | load: nodeFromJSONSchema through core / oneOf (single branch active) | 4794 | 0.1805 | 0.1923 | 0.8167 | ±7.69% | 2397 |
| nodeFromJSONSchema | load: nodeFromJSONSchema through core / computed (visible + derived deps) | 6682 | 0.1278 | 0.1334 | 0.3349 | ±9.23% | 3341 |
| object-pending-read | settle: object read after child write / 1000 × (child write + 1 parent value read) + drain | 120 | 8.29 | 8.62 | 9.56 | ±0.83% | 180 |
| object-pending-read | settle: object read after child write / 1000 × (child write + 3 parent value reads) + drain | 121 | 8.24 | 8.30 | 9.10 | ±0.61% | 183 |
| object-pending-read | settle: object read after child write / 1000 × child write, no read + drain | 120 | 8.26 | 8.38 | 9.21 | ±0.64% | 181 |
| object-pending-read | settle: object read after child write / 1000 × same-value write at depth 2 + drain | 153 | 6.49 | 6.61 | 9.53 | ±1.36% | 153 |
| object-pending-read | settle: object read after child write / 1000 × same-value write at depth 8 + drain | 67.91 | 14.79 | 14.83 | 15.51 | ±0.61% | 68 |
| object-pending-read | settle: object read after child write / 1000 × same-value write at depth 16 + drain | 39.00 | 25.51 | 25.85 | 27.25 | ±0.74% | 40 |
| object-pending-read | settle: object read after child write / create a 50-field form | 3407 | 0.2451 | 0.2518 | 1.91 | ±7.82% | 1704 |
| render-delay | load/render-delay: small (5 terminals) / [mount] nodeFromJSONSchema (validation off) | 22838 | 0.0355 | 0.0372 | 0.0691 | ±8.75% | 11460 |
| render-delay | load/render-delay: small (5 terminals) / [mount] nodeFromJSONSchema (validation on) | 23240 | 0.0351 | 0.0364 | 0.0635 | ±9.47% | 11620 |
| render-delay | load/render-delay: small (5 terminals) / [guard] clone(schema) | 503924 | 0.0020 | 0.0020 | 0.0021 | ±0.17% | 251962 |
| render-delay | load/render-delay: small (5 terminals) / [guard] clone(defaultValue) | 2519396 | 0.0004 | 0.0004 | 0.0005 | ±0.19% | 1259698 |
| render-delay | load/render-delay: medium (25 terminals) / [mount] nodeFromJSONSchema (validation off) | 5220 | 0.1603 | 0.1640 | 1.78 | ±9.95% | 2617 |
| render-delay | load/render-delay: medium (25 terminals) / [mount] nodeFromJSONSchema (validation on) | 5367 | 0.1594 | 0.1624 | 1.12 | ±8.85% | 2684 |
| render-delay | load/render-delay: medium (25 terminals) / [guard] clone(schema) | 98513 | 0.0100 | 0.0101 | 0.0108 | ±0.21% | 49257 |
| render-delay | load/render-delay: medium (25 terminals) / [guard] clone(defaultValue) | 482205 | 0.0020 | 0.0021 | 0.0022 | ±0.21% | 241103 |
| render-delay | load/render-delay: large (150 terminals) / [mount] nodeFromJSONSchema (validation off) | 967 | 0.9029 | 0.9249 | 2.65 | ±6.69% | 484 |
| render-delay | load/render-delay: large (150 terminals) / [mount] nodeFromJSONSchema (validation on) | 968 | 0.9017 | 0.9170 | 2.82 | ±8.06% | 485 |
| render-delay | load/render-delay: large (150 terminals) / [guard] clone(schema) | 17257 | 0.0562 | 0.0565 | 0.0635 | ±4.24% | 8629 |
| render-delay | load/render-delay: large (150 terminals) / [guard] clone(defaultValue) | 116120 | 0.0085 | 0.0086 | 0.0091 | ±0.19% | 58060 |

#### 대장 탐침 (`probe-<이름>-{node,bun}.json`)

이 디렉터리의 탐침 넷입니다. `NODE_ENV=production`, 크기마다 준비 뒤 표본 100회를 잽니다(`gate-siblings` 준비 30회, 나머지 20회). `gate-siblings`와 배열 동사는 표본마다 새 트리를 만듭니다. `gate-siblings`는 그 트리의 첫 로드를 재고, 배열 동사는 로드가 끝난 트리에서 동사 한 번을 잽니다. `fragment-toggle`과 `if-host-siblings`는 크기마다 트리 하나를 로드해 두고, 표본마다 시간 밖에서 값을 되돌리는 쓰기를 한 뒤 쓰기 한 번을 잽니다. 검사는 모두 시간 밖입니다. 칸은 ms 중앙값(10–90백분위)이고, "배가 비"는 크기를 두 배로 늘릴 때의 중앙값 비입니다(선형이면 2, 이차면 4).

##### P-03 회귀 신호 — `probe-gate-siblings.ts`

06 성능 기록 51C-01의 장면입니다. 불리언 `flag` 하나와 `controls.active: '../flag'`인 문자열 형제 N개를 둔 객체 루트를 첫 로드합니다.

| N | Node | Bun |
| --- | --- | --- |
| 1000 | 10.97 (9.322–12.04) | 8.495 (7.608–11.92) |
| 2000 | 21.47 (20.82–23.08) | 20.31 (17.69–23.54) |
| 4000 | 48.75 (47.69–53.96) | 43.17 (38.51–50.41) |
| 8000 | 113.9 (110.9–140.5) | 91.93 (84.76–106.5) |

배가 비: Node 1000→2000 1.96, 2000→4000 2.27, 4000→8000 2.34; Bun 1000→2000 2.39, 2000→4000 2.13, 4000→8000 2.13.

1천→8천은 Node 10.39×, Bun 10.82×로 N에 선형입니다. 06의 R-17 기록(42.7/83.9/217.0/520.8 ms)은 다른 Node 판과 트리 조건의 관측이라 이 표와 직접 견주지 않습니다. 고친 뒤에도 남기는 차수 회귀 신호입니다.

##### P-08 — `probe-fragment-toggle.ts`

주인 하나에 `enabled`와 상주하는 `target`을 두고, 조각 F개가 같은 `target`을 선언하며 `active: './enabled'`와 `disabled: './enabled'`를 보탭니다. 시간을 재는 것은 `enabled`를 false에서 true로 바꾸는 쓰기 한 번입니다. 주인이 실제로 dirty가 되고 조각 F개가 모두 선택되어, `publishStateKeys → calculateStateKeys → getControlLayers`가 같은 자식에 대해 F개 층을 결합합니다. 검사는 쓰기 전후의 `disabled`, `target` 출력 보존, 자식 둘, 선택된 조각 층 F개입니다.

| F | Node | Bun |
| --- | --- | --- |
| 16 | 0.114 (0.0885–0.141) | 0.0935 (0.0798–0.107) |
| 32 | 0.212 (0.194–0.242) | 0.157 (0.145–0.187) |
| 64 | 0.517 (0.509–0.597) | 0.493 (0.472–0.532) |
| 128 | 1.733 (1.717–1.879) | 2.246 (2.143–2.594) |

배가 비: Node 16→32 1.85, 32→64 2.44, 64→128 3.35; Bun 16→32 1.68, 32→64 3.13, 64→128 4.55.

16→128은 Node 15.16×, Bun 24.02×입니다. 배가 비가 F와 함께 커져 64→128에서는 이차(4)에 가깝습니다. 대장 P-08의 O(F²) 추정과 맞는 차수이며, 원인(선언마다의 `parentIds.includes`와 식 탐색)은 이 탐침으로 분리하지 않았습니다.

##### P-09 — `probe-if-host-siblings.ts`

루트에 비루트 `if` 호스트 `/host`와 형제 N개를 둡니다. 호스트의 `if`는 `/host/flag`를 읽고 `/host/selected`를 더합니다. 시간을 재는 것은 `flag`를 false에서 true로 바꾸는 쓰기 한 번이고, `registerRecalculation`의 자기 선언 게이트 분기가 부모를 형상 변경으로 표시합니다. 호출 수는 그 쓰기의 정착 한 번 동안의 `selectChildren` 호출을 경로별로 센 것입니다. 제품 코드를 바꾸지 않고 탐침이 모듈 내보내기를 감싸서 셉니다(Node `module.registerHooks`, Bun `mock.module`). 그래서 이 행의 시간에는 계수기 비용이 들어 있습니다.

| 형제 N | Node | Bun | `selectChildren` 호출 수(Node 중앙값, Bun 중앙값, Node 범위) |
| --- | --- | --- | --- |
| 1000 | 5.295 (4.970–5.726) | 2.876 (2.558–4.233) | 호스트 4·부모 2 (Bun 4·2; 범위 4–4·2–2) |
| 2000 | 7.690 (7.218–8.380) | 5.892 (5.332–7.649) | 호스트 4·부모 2 (Bun 4·2; 범위 4–4·2–2) |
| 4000 | 18.93 (17.87–20.04) | 12.50 (11.83–15.06) | 호스트 4·부모 2 (Bun 4·2; 범위 4–4·2–2) |
| 8000 | 43.62 (42.56–45.68) | 29.63 (27.64–34.37) | 호스트 4·부모 2 (Bun 4·2; 범위 4–4·2–2) |

배가 비: Node 1000→2000 1.45, 2000→4000 2.46, 4000→8000 2.30; Bun 1000→2000 2.05, 2000→4000 2.12, 4000→8000 2.37.

호출 수는 모든 크기와 두 런타임에서 호스트 4회, 부모 2회로 같습니다. 따라서 호출 수가 형제 수로 곱해지지는 않습니다. 그런데 시간은 1천→8천에서 Node 8.24×, Bun 10.30×로 형제 수에 선형입니다. 이 선형 비용이 부모 재선택 두 번 안에서 형제 N+1개를 훑는 것인지 다른 단계인지는 이 탐침으로 분리하지 않았습니다. 위반인지는 M1이 SETTLE-017의 순회 범위로 판정합니다.

##### 배열 동사 — `probe-array-verbs.ts`

숫자 `0..N-1`을 담은 루트 배열을 기존 길이 N으로 로드한 뒤, 공개 `push(n)` 한 번과, 따로 `remove(1)` 한 번을 잽니다(`dispatchPush`·`dispatchRemove` 경로, 동기 정착과 전달 포함). `push`는 길이와 모든 값·자식 이름·경로를, `remove`는 지운 값과 꼬리의 이동한 값·이름·경로를 검사합니다. M1의 G8 계약 판정용입니다(`push`가 기존 길이에 비례하면 위반, `remove`는 꼬리 길이에만 비례해야 함).

| 동사 N | Node | Bun |
| --- | --- | --- |
| push 1000 | 0.280 (0.243–0.383) | 0.287 (0.244–0.361) |
| push 2000 | 0.492 (0.458–0.587) | 0.603 (0.570–0.684) |
| push 4000 | 1.050 (0.994–2.378) | 1.331 (1.250–1.549) |
| push 8000 | 2.153 (2.044–2.415) | 3.085 (2.931–3.816) |
| remove 1000 (꼬리 998) | 2.440 (2.291–3.507) | 2.182 (2.018–2.492) |
| remove 2000 (꼬리 1998) | 5.044 (4.813–6.333) | 4.487 (4.095–6.832) |
| remove 4000 (꼬리 3998) | 10.47 (9.587–11.41) | 9.208 (8.494–11.33) |
| remove 8000 (꼬리 7998) | 23.02 (22.32–24.79) | 21.49 (19.03–24.53) |

배가 비: Node push1000→2000 1.76, push2000→4000 2.14, push4000→8000 2.05, remove1000→2000 2.07, remove2000→4000 2.08, remove4000→8000 2.20; Bun push1000→2000 2.10, push2000→4000 2.21, push4000→8000 2.32, remove1000→2000 2.06, remove2000→4000 2.05, remove4000→8000 2.33.

`push`는 1천→8천에서 Node 7.69×, Bun 10.75×로 기존 길이에 선형입니다. 항목 하나를 더하는 쓰기가 기존 길이에 비례하므로 G8 판정의 후보입니다. `remove(1)`은 Node 9.44×, Bun 9.85×입니다. 다만 지우는 자리를 머리 쪽에 고정했으므로 꼬리 길이와 전체 길이가 함께 늘어, 이 표만으로는 "꼬리에만 비례"와 "전체 길이에 비례"를 가르지 못합니다. 가르려면 지우는 자리를 바꾸는 행이 더 필요합니다.


## 측정 중 이상

고치지 않고 그대로 적습니다.

- 01:37 실행(`20261015T0137-c59ba13-before`)은 독립 스크립트 네 행 뒤 vitest 행에서 멈췄습니다. 러너가 vitest 실행 파일을 패키지 아래 `node_modules/.bin/vitest`에서 찾았는데, 실제 자리는 저장소 루트의 `node_modules/.bin/vitest`입니다. 러너가 위로 올라가며 찾게 고친 뒤, 모든 행이 한 실행에 들도록 처음부터 다시 돌린 것이 이 기준선입니다. 실패한 실행 디렉터리는 기록으로 남깁니다.
- Node 행의 stderr에는 tsx의 `[DEP0205] module.register() is deprecated` 경고가 있습니다. heap 행의 stderr에는 검증기를 고르지 않은 장면의 `SCHEMA_FORM_WARNING.VALIDATOR_MISSING` 경고가 있습니다. 둘 다 결과에는 닿지 않습니다.
- `B1` Node는 두 실행 모두 앞쪽 표본(소스 11개, dist 10개)이 0.13 ms 안팎이고 나머지는 약 0.026 ms입니다(P-11의 흔들림과 같은 꼴). 그래서 소스 실행의 10–90백분위가 25.75–133.6 µs로 넓습니다.
- `B2` Node 표본 7회 가운데 첫 회만 크고(소스 1,924 B, dist 1,921 B) 나머지는 1,433–1,468 B입니다. Bun은 두 무리로 갈립니다(dist 2,092–2,100 B 넷, 1,669–1,670 B 셋; 소스는 한 회만 1,686 B).
- vitest 벤치 행은 계획대로 `bench/.results/baseline.json`과 `latest.json`을 패키지 안에 쓴 뒤 실행 디렉터리로 복사합니다. 이 자리는 `.gitignore`가 제외하므로 저장소에 들어가지 않으며, 계획이 정한 예외입니다.
- TEST-071 스크립트(`derive-and-controls.bench.ts`)는 중앙값·10–90백분위·표본 수만 내고 원 표본 배열은 내지 않습니다. 그래서 이 표는 원 표본으로 다시 계산할 수 없습니다.
- 배열 동사 탐침은 마운트 배달을 비우지 않은 트리에서 동사를 잽니다(위 배열 동사 절의 주의). 고치지 않고 그대로 두며, 정상 상태 행은 G8 작업에서 더합니다.
- `--equivalent`의 render 행 가운데 `sample-0`의 `render-mount-wall`은 비 1.05×인데 처리량 하락 15.1%로 회귀 판정입니다. 판정은 중앙값의 비가 아니라 처리량 평균으로 하기 때문입니다.

## 대장으로 간 것

[속도 문제 대장](../performance-issues.md)의 P-08·P-09·P-10 행의 근거와 원인 칸에 dist 실행의 수치와 원인 분리를 적었고, P-138을 새로 더했습니다. 상태 칸은 바꾸지 않았습니다. P-10의 `B5` 커밋 이분은 354라운드 소유자 지시로 M0에서 빼고 L2 묶음에 닿을 때 합니다.
