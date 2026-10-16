<!-- Read by measurement-tool users; commands invoke the adjacent standalone verification scripts. -->

# 첫 묶음 측정 도구

395–398라운드의 측정을 재현·검토하는 독립 도구입니다. 측정 러너의 원본 로직을 유지하고, 경로·호출 주석·제외한 입력이 없는 레인의 명시적 건너뛰기를 이관했습니다. C/D 표 생성 출력에는 교차검증 Addendum의 두 바퀴 범위, F=4·16·64 세 점의 초선형 증가 표시, 폼 하나의 트리+청사진 합계를 반영했습니다. `b-a2/config.mjs`의 Bun 판 표기는 `Bun.version`으로 바로잡았습니다. 제품 코드·공개 API는 바꾸지 않습니다.

## 실행 위치와 입력

이 문서의 경로는 `first-batch/` 기준입니다. 도구는 실행 파일 옆이나 그 아래 `out/`에 씁니다. 새 문서 작업 트리에는 node_modules·dist를 설치하거나 빌드하지 않습니다. 창을 다시 돌릴 때는 이 디렉터리를 저장소 밖 실행 폴더로 복사하고, 이미 의존성과 dist가 있는 작업 트리를 `MEASURE_WORKTREE` 하나로 지정합니다. `NODE_BIN`은 사용할 Node 실행 파일이며 기록된 판은 v26.11.1입니다. Bun은 1.4.3입니다.

```sh
# 현재 위치: 이 문서가 있는 first-batch 디렉터리
cp -R . /private/tmp/schema-form-first-batch-run
export MEASURE_WORKTREE=/absolute/path/to/an-existing-built-worktree
export NODE_BIN=/absolute/path/to/node-v26.11.1
export NODE_ENV=production
cd /private/tmp/schema-form-first-batch-run
```

의존성은 이미 설치된 작업 트리의 것을 씁니다. B/A2 builder는 실행 폴더에 그 node_modules를 가리키는 링크를 만듭니다. B2의 TypeScript 계측 builder는 부모 B/A2의 그 링크를 통해 TypeScript를 해석합니다. C/D는 별도 실행 폴더에서 같은 의존성을 해석할 수 있어야 하며, 이 문서는 설치 명령을 실행하지 않습니다. `MEASURE_WORKTREE`가 없으면 저장소 안의 도구 위치에서 작업 트리 루트를 상대 경로로 찾습니다.

현재 엔진 원본 sha256은 `e27de23ccc14a8bf9c91e49007ee0f1751c2b7ccc53cf0924f07ae2c4a29040a`, 0.16.1은 `5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46`로 고정되어 있습니다. 다른 빌드로 조용히 바꾸지 않습니다. vm의 수정 전 작업 트리는 실행 폴더 `vm/before/`에 별도로 준비된 것을 읽습니다. A의 npm winglet 참고 번들은 `NPM0161_BUNDLE`로 지정하거나 실행 폴더 `npm0161/node_modules/@canard/schema-form/dist/index.mjs`에 둡니다. 어느 것도 이 저장소에 포함하지 않습니다.

반사실 사본(v1·v2·direct), 원본·계측·focused/profiling 번들 사본, 생성 JSON·out 디렉터리·힙 스냅숏·node_modules는 의도적으로 저장소에 넣지 않습니다. `make-variants.mjs`·`next-extras.mjs`·`counterfactual.mjs`·`counterfactual.patch`와 반사실을 만드는 C/D `make-bundles.mjs`도 제외합니다. JSON 결과·trace·labels·classification·source-audit·빌드 manifest는 실행 때의 생성물이며 복사하지 않았습니다.

B/A2 `make-current.mjs`는 제외한 next-extras helper가 없으면 기준 사본만 만들고 계측 사본 생성을 SKIP으로 알립니다. `run-a2.mjs`는 없는 v1·v2 레인을 stderr에 이유와 함께 알리고 JSON의 skipped에 적습니다. C timing 러너는 없는 direct 레인만 건너뛰고, 차등 러너는 direct 없음을 status=skipped로 기록합니다. C/D 원본 full-artifact 검증도 반사실 builder가 없으면 skipped입니다. 이 상태를 정답 차등 통과로 읽지 않습니다.

원래 A2 full 표에는 모든 반사실·계측 입력이 필요합니다. 이 입력이 없으면 `table.cjs`는 full summary를 SKIP으로 보고합니다. C/D 표는 skipped 입력을 제외하고 direct가 없으면 절감 칸을 비웁니다. 외부 실행 폴더에서 원래의 완전한 측정 사본·자료를 따로 제공한 경우에만 full 결과를 만들 수 있습니다. 이관 시에는 창·builder·힙 수집을 실행하지 않았습니다.

## 터미널 프로브

프로브 두 파일은 이 폴더의 한 단계 위에 있습니다. 아래 명령은 기존 빌드 작업 트리의 schema-form 패키지에서 실행합니다. --check는 준비 0·표본 1로 장면·정답만 확인하고, --smoke는 준비 2·표본 3입니다. --check/--smoke 수치는 성능 근거가 아닙니다.

| 파일 | 명령(패키지 디렉터리에서) | 쓰는 것 |
| --- | --- | --- |
| `../probe-terminal-mode.ts` | `$NODE_BIN --import tsx architecture/verification/perf-optimization/probe-terminal-mode.ts --check` | 현재 terminal/branch 장면의 JSON stdout; 기존 loader의 ignored 번들 사본 |
| `../probe-legacy-terminal-mode.ts` | `$NODE_BIN --import tsx architecture/verification/perf-optimization/probe-legacy-terminal-mode.ts --check --bundle=$MEASURE_WORKTREE/node_modules/@canard/schema-form_0.16.1/dist/index.mjs` | 0.16.1 장면·거부 이유·정답의 JSON stdout; 기존 loader의 ignored 번들 사본 |

## vm — 배열 동사 재측정

| 도구 | 명령·호출자 | 쓰는 것 |
| --- | --- | --- |
| `vm/quiet-verbs.sh` | `zsh vm/quiet-verbs.sh` | `vm/out/`의 세 판×Node/Bun×두 바퀴 JSON, start/end/head/dists.txt; winglet 해시도 dists.txt에 추가 |
| `vm/table.cjs` | `$NODE_BIN vm/table.cjs vm/out` | `vm/out/table.md`, summary.json, 표와 상태 stdout |
| `vm/winglet-hash.sh` | `zsh vm/winglet-hash.sh`(창 러너에서도 호출) | 실제 해석한 winglet dist 해시 stdout; 다른 파일은 쓰지 않음 |

## a-term — 터미널 모드와 winglet 참고

| 도구 | 명령·호출자 | 쓰는 것 |
| --- | --- | --- |
| `a-term/quiet-a.sh` | `zsh a-term/quiet-a.sh` | `a-term/out/`의 terminal·winglet 참고 두 바퀴 JSON, start/end/dists.txt |
| `a-term/bun-smoke.sh` | `zsh a-term/bun-smoke.sh` | `a-term/bun-smoke-{new,legacy}.json`, 대응 .err |
| `a-term/table.cjs` | `$NODE_BIN a-term/table.cjs a-term/out` | `a-term/out/table.md`, 상태 flags stdout |

## b-a2 — B·A2·A2-3

| 도구 | 명령·호출자 | 쓰는 것 |
| --- | --- | --- |
| `b-a2/config.mjs` | 아래 B/A2 node 명령이 import | 경로·고정 해시·런타임·단계 짝짓기; 단독 쓰기 없음 |
| `b-a2/build-common.mjs` | `make-current.mjs`, `make-legacy.mjs`가 import | 호출된 builder가 지정한 사본·manifest·실행 폴더의 의존성 링크 |
| `b-a2/bench-common.mjs` | 아래 run-*.mjs가 import | 시간 밖 fixture/drain/정답 관측; 독립 파일 쓰기 없음 |
| `b-a2/make-current.mjs` | `$NODE_BIN b-a2/make-current.mjs` | current-source/current-baseline.mjs와 instrumentation manifest; 제외한 helper가 있으면 계측 사본, 없으면 SKIP |
| `b-a2/make-legacy.mjs` | `$NODE_BIN b-a2/make-legacy.mjs` | legacy-source/legacy-baseline/legacy-instrumented.mjs와 instrumentation manifest |
| `b-a2/run-b.mjs` | `$NODE_BIN b-a2/run-b.mjs --smoke` | B-1 JSON stdout |
| `b-a2/run-breakdown.mjs` | `$NODE_BIN b-a2/run-breakdown.mjs --engine=current --smoke`(또는 legacy) | 단계 점유·포괄 시간·호출 수 JSON stdout; 계측 사본 필요 |
| `b-a2/run-a2.mjs` | `$NODE_BIN b-a2/run-a2.mjs --smoke` | 기준·존재하는 v1/v2의 시간과 별도 correctness·Merge·호출자 변조 JSON stdout |
| `b-a2/run-a2-breakdown.mjs` | `$NODE_BIN b-a2/run-a2-breakdown.mjs --smoke` | nextExtras 복사/sameValue·assemble·그 밖의 계측 JSON stdout; 계측 사본 필요 |
| `b-a2/run-terminal.mjs` | `$NODE_BIN b-a2/run-terminal.mjs --smoke` | A2-3 k0/k500/k999/모든 키 JSON stdout |
| `b-a2/quiet-b-a2.sh` | `zsh b-a2/quiet-b-a2.sh` | `b-a2/out/` 두 런타임·두 바퀴 JSON, 시간/해시 로그; 제외한 builder·레인·full summary는 SKIP |
| `b-a2/bun-smoke.sh` | `zsh b-a2/bun-smoke.sh` | `b-a2/out/bunsmoke-run-*.json`, .err |
| `b-a2/table.cjs` | `$NODE_BIN b-a2/table.cjs`(또는 --smoke / --self-test) | 완전한 입력이면 `b-a2/out/table.md`와 요약 stdout; 입력 사본 없으면 SKIP; --self-test는 산술 검사만 |

B/A2 run 명령은 `$MEASURE_WORKTREE/packages/canard/schema-form`에서 외부 실행 폴더의 절대 파일명으로 호출하는 원래 레인을 따릅니다. shell 창 러너가 이 cwd를 잡습니다. --warmups=N·--samples=N으로 표본 수, --reverse로 순서를 정합니다. 정상 쓰기는 steady, mount는 core이며 시간 밖에 정답을 따로 검사합니다.

## b-a2/b2 — 세 핫스팟의 둘째 토막

| 도구 | 명령·호출자 | 쓰는 것 |
| --- | --- | --- |
| `b-a2/b2/make.mjs` | `$NODE_BIN b-a2/b2/make.mjs` | 원본/기준/dense/focused 사본, labels/trace/build.json, source-audit.md |
| `b-a2/b2/timers.mjs` | make.mjs가 import | 생성하는 계측 사본에 타이머 문자열 제공; 독립 쓰기 없음 |
| `b-a2/b2/evidence.mjs` | table.mjs가 import | 현재 원장·DETAIL·부모 legacy-source 사본을 읽는 분류 근거; 쓰기 없음 |
| `b-a2/b2/run.mjs` | `$NODE_BIN b-a2/b2/run.mjs --smoke` | 세 레인의 시간·호출·분할·배달 차등 JSON stdout |
| `b-a2/b2/table.mjs` | `$NODE_BIN b-a2/b2/table.mjs`(또는 --smoke / --self-test) | `b-a2/b2/table.md`, classification.json, 요약 JSON stdout; 부모 B-1 결과·legacy-source 필요 |
| `b-a2/b2/quiet-b2.sh` | `zsh b-a2/b2/quiet-b2.sh` | Node 두 바퀴×표본 40 JSON, builder 결과·창·해시 로그와 표 |
| `b-a2/b2/quiet-b2-plus.sh` | `zsh b-a2/b2/quiet-b2-plus.sh` | 위 창 뒤 원 dist의 Node/Bun all-keys 두 바퀴 JSON, winglet 해시 |

B2의 원래 a/b/c 출력은 재현용 원자료 분류입니다. fairy08 수정으로 (b)를 (b1) 원장 계약/(b2) 현재 알고리즘으로 나눈 최종 해석은 `../first-batch-measurement.md`를 따릅니다. 원 출력의 (b) 전체를 계약 하한으로 읽지 않습니다. dense는 약 18.3배 계측 부담이 있어 비율만 읽고, 스모크와 창 수치를 섞지 않습니다.

## c-d — EXIT-LAYERS와 B2 힙 분류

| 도구 | 명령·호출자 | 쓰는 것 |
| --- | --- | --- |
| `c-d/config.mjs` | 아래 C/D 명령이 import | 고정 해시·경로·런타임·출력 경계; 단독 쓰기 없음 |
| `c-d/c-common.mjs` | run-c*.mjs가 import | fixture·시간 밖 관측과 존재하는 사본의 JSON 결과; 독립 파일 쓰기 없음 |
| `c-d/run-c.mjs` | `$NODE_BIN c-d/run-c.mjs --smoke` | 기준과 존재하는 direct 시간 JSON stdout; 없는 direct는 skipped |
| `c-d/run-c-instrumented.mjs` | `$NODE_BIN c-d/run-c-instrumented.mjs --smoke` | Node 전용 포괄 시간·호출자별 계수 JSON stdout; 계측 기준 사본 필요 |
| `c-d/run-c-differential.mjs` | `$NODE_BIN c-d/run-c-differential.mjs --smoke` | direct가 있으면 `c-d/out/differential-details.json`과 전체 차등 JSON stdout; 없으면 skipped |
| `c-d/run-d.mjs` | `$NODE_BIN c-d/run-d.mjs --sizes=1000,8000`(또는 --smoke) | 새 worker들의 분류 JSON stdout과 아래 스냅숏·통계; Bun도 같은 명령 가능 |
| `c-d/d-worker.mjs` | run-d.mjs가 GC 옵션을 붙여 호출 | 실행 폴더 out 아래 Node blueprint/tree 힙 스냅숏·각 단계 stats; Bun은 heapStats JSON |
| `c-d/classify-heap.mjs` | run-d.mjs가 snapshot/blueprint-snapshot/engine/nodes 인자로 호출 | Node 보존량·범주·retainer·합계 검증 JSON stdout |
| `c-d/heap-graph.mjs` | classify-heap.mjs가 import | strong-edge·dominator 분석, 독립 쓰기 없음 |
| `c-d/table.cjs` | `$NODE_BIN c-d/table.cjs`(또는 --smoke) | `c-d/out/table.md`와 요약 stdout; 두 바퀴 범위·세 점 증가·폼 단위 합계, FULL·SMOKE 구별, skipped 입력 제외 |
| `c-d/worktree-guard.mjs` | `$NODE_BIN c-d/worktree-guard.mjs --mode=before`, 뒤 같은 명령에서 옵션 생략 | out/worktree-before.json·worktree-after.json; 대상 작업 트리 파일/HEAD/index/diff 비교, Git 변경 없음 |
| `c-d/verify-tooling.mjs` | `$NODE_BIN c-d/verify-tooling.mjs --smoke` | 원래 full artifact의 검증 JSON stdout; 제외한 counterfactual helper 없으면 전체 skipped |
| `c-d/quiet-c-d.sh` | `zsh c-d/quiet-c-d.sh` | Node/Bun 두 바퀴 시간·계수·차등·힙 결과와 해시·런타임·guard 로그; 제외한 builder는 SKIP |
| `c-d/bun-smoke.sh` | `zsh c-d/bun-smoke.sh` | `c-d/out/bunsmoke-c.json`, bunsmoke-d.json 및 .err·하위 heapStats |

C/D 원본·기준·계측 사본은 별도의 기존 측정 실행 폴더에서 제공해야 합니다. 반사실 builder는 이관하지 않으므로 이 도구가 direct 사본이나 patch를 자동으로 만들지 않습니다. worktree-guard를 쓸 때는 실행 폴더를 MEASURE_WORKTREE 밖에 두어 자기 출력 때문에 검사 대상이 달라지지 않게 합니다. Node 힙 범주는 겹치지 않는 보존 shallow bytes의 합이며 blueprint는 독립 계측합니다. 제품은 폼마다 blueprint를 지으므로 폼 하나 합계에는 둘을 더하고, 청사진 공유 시의 트리 몫과 구별합니다. Bun은 형별 개수만 있고 범주 B/node를 추정하지 않습니다.

## 정답·계측 해석과 이번 확인

v1은 Merge 손실·B1 k0 유출·호출자 사후 변조 별칭 때문에 폐기했습니다. 원본 A2 summarizer의 VALUE-002 항목은 순서 중심 관측이라 B1 유출 판정은 별도 extras-isolation 열에 있습니다. 최종 문서에서는 VALUE-002 전체 계약에 맞춰 B1 v1을 fail로 바로잡았습니다. 잘못된 Merge v1 시간을 인용하지 않습니다. A2 분해는 Node 계측 합 안의 비율만 읽고 배열 분해는 성능 근거에서 제외합니다.

이번 이관의 확인은 모든 .mjs/.cjs의 `node --check`, 모든 .sh의 `zsh -n`, 기존 빌드 작업 트리에서 터미널 프로브 둘의 --check 한 번씩입니다. 새 작업 트리에서는 설치·빌드·전체 성능 창·힙 수집을 실행하지 않습니다. 파일 범위는 perf-optimization 아래 문서·검증 도구뿐이며, 원장·DETAIL·priority·baseline·write-paths 문서는 수정하지 않습니다.
