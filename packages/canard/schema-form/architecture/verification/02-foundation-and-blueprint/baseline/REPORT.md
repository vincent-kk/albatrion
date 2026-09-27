# 옛 엔진 벤치 기준선

- 근거: TEST-031, LANDING-159, 02 verification의 기반 게이트.
- 소스 고정: `55ed75504` (측정 시작 시 커밋은
  `3a74b4eea2ac3d08220f5e9747fd34669ed7fe45`; 커밋 작성자 표기 정리로 해시만
  바뀌었으며 측정한 소스 tree는 같다).
- 원장 시작점 `660dde66f`와 현재 커밋의 schema-form `src`·`bench` 차이는 없다.
- 실행 날짜: 2026-09-27, core 시작 `2026-09-27T01:06:08Z`.
- 환경: macOS Darwin 25.6.0, arm64, Apple M1 Max, CPU 10개, 메모리 64 GiB,
  Node v26.10.0, Yarn 4.12.0, Vitest 3.2.6.

## 실행과 보존

```sh
yarn workspace @canard/schema-form bench:baseline
yarn workspace @canard/schema-form build
yarn workspace @aileron/benchmark-form bench:scale --out=/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/verification/02-foundation-and-blueprint/baseline/scale.json
```

CPU를 쓰는 세 명령은 순서대로 실행했다. 첫 명령의 기존 출력 파일은 실행 전에
`previous-core.json`으로 보존했으며, 새 결과를 `core.json`으로 복사한 뒤 원래
`bench/.results/baseline.json`을 복원했다. scale의 기존 기준선은
`previous-scale.json`으로 보존했고 새 실행은 별도 출력 경로를 사용한다.

패키지의 지정 `build` 명령은 종료 코드 0이다. scale은 공개 배포 진입점을
가져오므로 먼저 현 소스로 빌드했다. `dist/index.mjs`의 SHA-256은 빌드 전후
`5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46`로 같았다.
생성한 배포 산출물은 커밋 대상이 아니다.

## Core 결과

`core.json`에는 7파일·44행이 있으며 모든 행의 처리량은 유한한 양수다.
명령 로그는 `core.log`, 빌드 로그는 `build.log`에 보존했다.

| 파일 | 벤치 행 |
| --- | ---: |
| branch-strategy-init.bench.ts | 6 |
| compute-recalculate.bench.ts | 6 |
| event-cascade.bench.ts | 3 |
| find-node.bench.ts | 6 |
| nodeFromJSONSchema.bench.ts | 4 |
| object-pending-read.bench.ts | 7 |
| render-delay.bench.ts | 12 |

## Scale 결과

지정 `bench:scale` 명령은 종료 코드 0이며 `2026-09-27T01:11:09Z`에 결과를
저장했다. 설정은 latest 한 버전, 1 sweep, 최소 30 samples, maxTime 5초,
GC 활성화이며 scale 16행의 처리량은 모두 유한한 양수다. 큰 배열 행도
제외하지 않았다. 명령 로그는 `scale.log`에 보존했다.

| 행 | 처리량 (Hz) |
| --- | ---: |
| Render Flat flat-50 | 97.39 |
| Render Flat flat-100 | 56.43 |
| Render Flat flat-500 | 10.82 |
| Render Nested nested-d3-f4 | 67.57 |
| Render Nested nested-d5-f4 | 3.74 |
| Render Array array-100 | 11.63 |
| Render Array array-500 | 2.07 |
| Render Array array-1000 | 1.02 |
| Render OneOf oneOf-5 | 735.64 |
| Render OneOf oneOf-10 | 727.85 |
| Render OneOf oneOf-20 | 706.13 |
| Interact Flat flat-50 | 81.74 |
| Interact Flat flat-100 | 43.08 |
| Interact Flat flat-500 | 7.84 |
| Interact Nested nested-d3-f4 | 50.05 |
| Interact Nested nested-d5-f4 | 2.87 |

## 해석의 범위

이 파일은 변경 전 기준선을 고정한다. 후보 구현과의 성능 비교나 회귀 판정은
아직 하지 않았으며, 서로 다른 실행 시점의 과거 파일을 합격 기준으로 삼지 않는다.
기본 scale 명령은 1 sweep이므로 여러 sweep 간 분산의 근거가 아니다.

## 무결성

| 파일 | SHA-256 |
| --- | --- |
| core.json | `93f20403adcb07d8b46f617332b8a4d15be3c6a8af3a563d862e3b6bed97e585` |
| scale.json | `52fb6c2d9f5da992b496a47330425a84097bd22d879bd4aef9b4460a10e02140` |
| previous-core.json | `c777d37f04d2cfe65f087d0e4f49ba3be7ade6aac056d37149201d22256341b9` |
| previous-scale.json | `b3c89ba4304771c72ab6ba43c4f1541cc26bbde89acfa9235687db4c9ea927c2` |

두 기존 baseline 경로의 바이트가 보존 사본과 같은 것을 완료 후 확인했다.
