# 07 전환 — 옛 판 벤치 기준선의 재현 조건

이 문서는 07이 옛 판과 새 판을 견줄 때 쓰는 두 기준선의 재현 조건을 적는다(68C-04, 71C-01의 요청).

## 패키지 벤치(`bench/*.bench.ts`)

- 파일: [bench-legacy-baseline.json](bench-legacy-baseline.json)
- 잰 커밋: `3911b7591`(전환 직전, `src/`가 `1.0.0-beta` `93ff8d7bc`와 같음). 공개 진입점이 옛 엔진을 가리키는 상태.
- 명령: 워크트리 루트에서 `yarn install --immutable`, `yarn workspaces foreach --recursive --topological-dev --from @canard/schema-form run build`, `yarn workspace @canard/schema-form bench:baseline`. 결과 `packages/canard/schema-form/bench/.results/baseline.json`을 이 디렉토리로 복사했다.
- 담긴 것: 옛 엔진을 재는 일곱(`branch-strategy-init`, `compute-recalculate`, `event-cascade`, `find-node`, `nodeFromJSONSchema`, `object-pending-read`, `render-delay`). 같은 실행의 종료 코드 1은 03–06의 독립 스크립트 넷(`array`, `derive-and-controls`, `dispatch-and-validation`, `node-and-settle`)이 vitest 묶음이 아니라서 난 "No test suite found"뿐이다. 그 넷은 `node --import tsx`로 따로 돈다.

## 옛 판 대 새 판(`@aileron/benchmark-form`)

- 옛 판은 마지막 배포 판 0.16.0이다. 별칭은 `"@canard/schema-form_0.16.0": "https://registry.npmjs.org/@canard/schema-form/-/schema-form-0.16.0.tgz"`(레지스트리 tarball 주소)로 건다.
- 까닭: 작업 공간 판도 0.16.0이라 `npm:@canard/schema-form@0.16.0`으로 걸면 yarn이 작업 공간 패키지로 푼다(transparent workspaces). tarball 주소는 배포 판을 강제한다.
- 남는 차이: 0.16.0이 의존하는 `@winglet/*`(`^0.15.0` 등)는 범위가 작업 공간 판과 맞아 작업 공간 패키지로 연결된다. 그래서 옛 판 쪽 측정도 작업 공간의 `@winglet` 라이브러리를 쓴다. 측정 보고서(`performance.md`)에 같은 조건을 적는다.
