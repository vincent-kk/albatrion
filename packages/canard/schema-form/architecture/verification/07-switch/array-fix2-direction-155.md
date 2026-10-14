# G26-155 fix2 — 정적 배열 아이템 선택 재사용

## 상태

구현·지정 검증·두 lane의 방향 측정을 완료했습니다. 정적 접두의 일반 선택 몸통 방문을 제거했으며 관측 동등성은 통과했습니다. 성능 방향은 혼재합니다. immediate의 목표 두 행과 record의 push/remove는 낮아졌지만 record의 push는 높아졌으므로 성능 목표 충족 여부는 확정하지 않습니다. 작업 브랜치는 `feat/schema-form-switch`, HEAD는 `e1d3a89145130ee3a0c5de1d9c028caf58b04062`이며 변경은 커밋하지 않았습니다. 커밋·push·stash·branch 전환을 하지 않았습니다.

## 구조 뒤 계산 경로 추적

다음 경로는 `packages/canard/schema-form/` 기준입니다.

| 단계 | push / remove-last 경로와 반복 작업 | 근거 |
| --- | --- | --- |
| 공개 진입과 계획 | `dispatchPush` 또는 `dispatchRemove`가 배열 행의 구조 계획을 정착으로 넘깁니다. 기존 접두는 같은 위치의 `from` 슬롯이며 push는 새 value 슬롯, remove-last는 제거 꼬리 결과입니다. | `src/core/dispatch/utils/entry/dispatchPush.ts:22`, `dispatchRemove.ts:22`; `src/core/settle/utils/structure/arrangeSchemaNodeItems.ts:40` |
| fix① | `applyArraySlots`가 꼬리 자격을 확인하고 `applyArrayTail`로 갑니다. 접두 raw·경로·structure 항목을 유지하면서 새 꼬리만 생성·분배하거나 제거 꼬리만 소멸시킵니다. 이전 children과 스냅숏을 수정하지 않는 별도 배열을 공표합니다. | `src/core/settle/utils/structure/applyArraySlots.ts:35`; `applyArraySlots/utils/canApplyArrayTail.ts:10`; `applyArraySlots/utils/applyArrayTail.ts:27`, `:57`, `:74`, `:95`, `:99` |
| 표시 | 호스트의 `dirtyPaths`와 `shapeDirtyPaths`를 추가합니다. 새 슬롯은 `entered`와 `markWrite`로 표시하며 retained prefix의 raw는 쓰지 않습니다. remove-last에는 새 dirty 접두가 없습니다. | `applyArraySlots/utils/applyArrayTail.ts:103`, `:104`, `:106`, `:108`; `src/core/settle/utils/write/markWrite.ts:45` |
| 재계산 등록 | 변경 raw 경로의 역의존 소유자와 조상을 등록합니다. 무게이트 계산에서는 DirtyPathSet의 post-order 인덱스를 사용합니다. | `src/core/settle/utils/structure/arrangeSchemaNodeItems.ts:98`; `src/core/settle/utils/write/registerRecalculation.ts:16`, `:19`, `:28`; `DirtyPathSet.ts:22` |
| 계산 진입 | 루트부터 dirty 조상만 따라 배열 호스트에 도달합니다. 호스트는 shapeDirty이므로 안정 계산 shortcut을 쓰지 않습니다. gate 부재에서도 일반 호스트 shell을 거칩니다. | `src/core/settle/utils/structure/arrangeSchemaNodeItems.ts:99`; `src/core/settle/utils/compute/computeNode.ts:26`, `:46`, `:70`, `:80` |
| 최초 dirty 자식 계산 | `dirtyChildren`은 현재 인덱스의 살아 있는 직접 자식만 반환합니다. push는 새 슬롯과 그 자손을 계산하고 remove-last는 retained prefix를 계산하지 않습니다. | `src/core/settle/utils/compute/computeNode.ts:118`–`:120`; `dirtyChildren.ts:18` |
| HEAD의 반복 선택 | 무게이트 branchless 호스트의 cap은 1입니다. `selectChildren`은 구조 맵을 복제하고 모든 선언 슬롯에서 prior/current·분배/잠복·pending exit·선언 ID·유효 스키마·충돌·active를 다시 처리합니다. 기존 접두가 깨끗해도 이 선택 몸통은 아이템마다 1회 실행됩니다. 이후 dirty 확인은 접두에서 false입니다. | `src/core/settle/utils/gates/getGateBudgetCap.ts:70`; HEAD `selectChildren.ts:137`, `:154`, `:157`, `:230`, `:254`, `:274`, `:277`, `:295`, `:306` |
| 후보의 선택 단축 | 증명이 성공하면 정적 선언 ID를 같은 숫자 슬롯 순서로 등록하고 dirty callback만 사용한 뒤 shape 변경 없음으로 반환합니다. 나머지는 위 HEAD 몸통을 유지합니다. | 현재 `src/core/settle/utils/compute/selectChildren.ts:95`; `selectChildren/utils/reuseArrayChildren.ts:21`, `:33`, `:39`, `:56` |
| 기존 마감 | 호스트의 dirty 자식 재확인·동일 updateOutput·참조 보존·전이·파생·커밋·배달을 유지합니다. 공개 반환값의 계산도 바꾸지 않았습니다. | `src/core/settle/utils/compute/computeNode.ts:126`–`:132`, `:143`; `src/core/settle/utils/structure/arrangeSchemaNodeItems.ts:100`–`:101` |

## 비시간 재방문 계수

제품 HEAD를 수정하기 전에 임시 `settle.array-revisit-probe.test.ts`로 측정했습니다. 숫자 필드 하나를 가진 object 아이템 P개를 준비하고 push 한 번, 직후 마지막 아이템 remove 한 번을 실행했습니다. `captureSchemaNodeChange(child, 'active', true)` 호출을 일반 선택 몸통의 방문 계수로 삼고, `computeNode` 호출과 아이템 assembly를 별도로 관측했습니다. 임시 probe는 후보에서 같은 조건으로 재실행한 뒤 삭제했습니다. 영구 테스트도 P=100에서 같은 방문 제거와 새 아이템·자손 assembly 각 1회를 단언합니다.

| 기존 접두 P | 동작 | HEAD 접두 선택 몸통 | 후보 접두 선택 몸통 | HEAD / 후보 접두 computeNode | HEAD / 후보 접두 assembly | 호스트 선택 라운드 |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 0 | push / remove-last 각각 | 0 | 0 | 0 / 0 | 0 / 0 | 각각 1 |
| 1 | push / remove-last 각각 | 1 | 0 | 0 / 0 | 0 / 0 | 각각 1 |
| 10 | push / remove-last 각각 | 10 | 0 | 0 / 0 | 0 / 0 | 각각 1 |
| 100 | push / remove-last 각각 | 100 | 0 | 0 / 0 | 0 / 0 | 각각 1 |

HEAD에서는 `/0`…`/(P-1)` 각각 선택 몸통 1회였고 후보에서는 각각 0회입니다. HEAD의 접두 재귀 계산은 이미 0회이므로 `computeNode.ts`는 수정하지 않았습니다. 후보도 자격 증명을 위해 슬롯 identity를 O(P)로 확인합니다. 이 계수는 일반 선택 몸통의 제거를 뜻하며 전체 접두 확인이 없어졌다는 주장은 아닙니다.

계수 명령은 각 상태에서 단독 호출한 `yarn workspace @canard/schema-form test --run --project unit src/core/settle/__tests__/settle.array-revisit-probe.test.ts`이며 두 상태 모두 `1 passed (1)`, 종료 0이었습니다.

## 안전 불변식과 비용

정적 선택을 재사용하는 조건은 다음과 같습니다.

- 전체 청사진이 branchless이며 게이트·expression 문자열·파생 규칙이 없습니다.
- 정착의 `arrayCounts`에 호스트의 실제 길이 변경이 있고, 호스트 raw·호스트 분배 입력·경로 이동·pending exit가 없습니다. 현재 structure는 호스트 계산 시작에 잡은 prior와 같습니다.
- 정착 진입의 `previousEmit`에서 같은 호스트 경로는 배열입니다. 이전 잘못된 종류의 호스트와 부모 투영으로 경로가 없는 경우는 일반 선택을 유지합니다.
- 모든 현재 선언 슬롯이 정확한 bound entry의 청사진·정적 유효 스키마·이름·부모·경로·active 상태를 유지하며 children은 그 슬롯 순서와 정확히 일치합니다. 빈 선언·virtual 아이템·typeConflict·재생성 접두는 일반 선택을 사용합니다.

따라서 같은 정적 선언으로 만든 살아 있는 접두의 선택 결과는 바뀔 수 없습니다. 입력이 dirty인 자식의 출력은 기존 dirty frontier와 compute callback으로 계산하며, 깨끗한 접두의 계산은 HEAD와 같이 0회입니다. 전체 자격 증명 뒤에만 선언 ID를 등록하므로 증명 실패 중간에 선택 사실을 쓰지 않습니다. 선언 ID 배열은 기존 `staticIds` 메모를 소비하며 새 값/노드/조건 결과 캐시나 문맥 필드를 추가하지 않았습니다.

기존 무게이트 object 선택 shortcut을 참고한 내부 organ helper입니다. 새 fractal이나 공개 계약을 만들지 않았습니다. 게이트 평가 순서·잠복/branch 의미·snapshot 모양·path identity·delivery 순서·오류 기록을 바꾸지 않습니다. 최종 유효 스키마가 다른 슬롯과 종류 충돌도 일반 경로로 보냅니다. 속도 비용은 두 O(슬롯 수) 증명/메타데이터 순회와 호출당 이전 방출 경로 조회이며, 기존 구조 복제·선언 목록 요청·잠복/이탈 조회·불변 active 캡처를 제거합니다. 입력 크기에 따라 보유하는 새 캐시는 없고, 모듈 고정 빈 ID 배열 하나와 호출별 로컬 변수만 추가됩니다. 유효 스키마 조회의 기존 메모는 그대로 소비하며 heap byte는 별도로 측정하지 않았습니다.

## 테스트와 변경 파일

`settle/DETAIL.md`를 구현보다 먼저 갱신했습니다. 다음 6개 파일만 제품/테스트 변경이며 모두 package 기준입니다.

- `src/core/settle/DETAIL.md`: 불변식·비용과 `settle-array-selection-reuse` acceptance group.
- `src/core/settle/utils/compute/selectChildren.ts`: 배열에만 내부 shortcut을 시도하는 3행 변경.
- `src/core/settle/utils/compute/selectChildren/utils/reuseArrayChildren.ts`: 전체 shape 증명과 정적 선택 재사용.
- `src/core/settle/__tests__/settle.array-selection-reuse.test.ts`: 12개 사례.
- `src/core/settle/__tests__/fixtures/compareArraySelection.ts`: shortcut을 끈 oracle과 같은 공개 dispatch history 실행.
- `src/core/settle/__tests__/fixtures/observeArraySelection.ts`: 비교할 관측에서 트리별 opaque 파생 storage identity만 제외.

테스트는 append·remove-last·마지막 아이템 제거·새 자손 default·tuple extras·undefined 슬롯·투영·wrong-kind child 기록·게이트 입력 변경·파생 입력 변경·function injection·비루트 배열·이동·통째 교체·wrong-kind host·throwing gate와 P=100의 실제 선택/계산 경로를 확인합니다. 값·방출·반환값·스냅숏·노드/키/경로·개정·진단·실제 subscriber 배달 payload/순서·reporter 기록·소멸 읽기를 oracle과 비교합니다. 서로 다른 트리의 target identity 번호를 가진 `rules/ruleSources/ruleTargets` 내부 색인은 관측 동등성의 대상이 아니며, 파생의 출력과 모든 실제 기록은 비교합니다. 기존 fix① fixture는 수정하지 않았습니다.

무시되는 `.seiri/tasks/array-compute-tail/`에는 계획과 gate ledger를 기록했습니다. React, `src/__legacy__`, fix①의 구현/테스트/fixture, 저장소 측정 도구는 수정하지 않았습니다. 생성 bundle과 raw는 이 scratch `fix2/` 아래에만 있습니다.

## 지정 검증

각 yarn 명령은 다른 명령·pipe·환경 prefix·redirect와 섞지 않은 단독 shell 호출입니다.

| 검증 | 결과 |
| --- | --- |
| 수정 전 `yarn workspace @canard/schema-form test` | 종료 0; `Test Files  503 passed (503)`; `Tests  3536 passed \| 1 todo (3537)`; 74.63s |
| 신규 unit suite | 종료 0; 1 file, 12 tests passed |
| 최종 `yarn workspace @canard/schema-form typecheck` | 종료 0, 오류 출력 없음 |
| 최종 `yarn workspace @canard/schema-form lint` | 종료 0, 오류 출력 없음 |
| 수정 후 `yarn workspace @canard/schema-form test` | 종료 0; `Test Files  504 passed (504)`; `Tests  3548 passed \| 1 todo (3549)`; 72.71s |
| package cwd에서 `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs` | 종료 0; `LEGACY_ISOLATED: 1703 files checked` |

검증 과정의 실패도 보존합니다. 신규 helper가 없는 pre-fix 실행은 `Cannot find module '../../utils/compute/selectChildren/utils/reuseArrayChildren'`, 종료 1로 실패했습니다. 구현 뒤 shortcut을 잠시 `return false`로 강제했을 때 `4 failed | 5 passed (9)`, `AssertionError: expected false to be true`로 실패했으며 즉시 복구했습니다. 따라서 결과 비교가 shortcut의 미사용을 감추지 않습니다.

첫 후보의 관측 비교는 두 트리의 파생 storage target identity 번호 차이로 1건 실패했고, wrong-kind 호스트가 shortcut에 들어간 경로 단언으로 1건 실패했습니다. 현재 local이 이미 `[]`로 해제되어 있으므로 현재 값의 배열 여부만 검사한 다음 실행도 `expected true to be false`로 1건 실패했습니다. 안정된 `previousEmit`의 해당 경로를 검사하도록 보강하여 해결했습니다. 영구 경로 계수 추가 뒤 typecheck는 다음 오류로 한 번 실패했습니다.

```text
src/core/settle/__tests__/settle.array-selection-reuse.test.ts(148,73): error TS2345: Argument of type 'SchemaNodeRecord<unknown>' is not assignable to parameter of type 'PlainNode'.
```

generic spy의 node를 좁은 `includes` 인자로 넘기는 대신 기존 참조의 `some(child => child === node)` 비교로 바꾸었습니다. 새 type assertion은 추가하지 않았으며 최종 모든 지정 검증은 통과했습니다. 예상 red와 발견한 실패를 숨기거나 테스트를 skip하지 않았습니다.

## 방향 측정

구현과 최종 검증 뒤 실행했습니다. Node는 `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node`, cwd는 지정 stage-07 루트입니다. fix①의 `tools/measure-cross.mjs`를 복사한 뒤 HEAD pin/`git show` revision, output-path guard, `measurementSource` label만 변경했습니다. 허용 치환을 원본에 적용한 문자열과 사본 전체가 정확히 같다는 `ONLY_ALLOWED_DIFF_OK`를 확인했습니다. 사본 SHA-256은 `9807e3cbcac52927615340c2f6610e4c78403ed6002a6ce34439cd42a2b7dab6`입니다.

HEAD bundle은 고정 revision의 blob, candidate는 working-tree source입니다. 두 variant 모두 새 엔진을 선택하기 위해 원본 worker의 `HEAD` engine label을 사용하며, 실제 variant는 서로 다른 bundle hash와 output directory로 구별합니다. 원본 raw의 별도 과거 `source` 설명 문자열은 수정하지 않았습니다.

각 lane/variant에서 세 fixture calibration-all을 먼저 실행했습니다. fixture마다 r1 HEAD→candidate, r2 candidate→HEAD, r3 HEAD→candidate이며 worker는 항상 순차 fresh process입니다. 예열 20회·유효 표본 101회·시계·immediate의 write당 setImmediate 4회·record의 `drainTicks(2)`·value/DOM/commit 단언과 원본 205초 자체 종료 조건을 그대로 유지합니다. 각 command가 8분 이내였음을 실제 시간으로 확인했습니다. 결과는 lane/fixture/variant별 303 sample의 pooled nearest-rank median이며 단위는 ms, delta는 candidate−HEAD입니다.

| fixture | lane | HEAD median | candidate median | delta | worker count | failed writes |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `array-push-100` | immediate | 86.526958 | 85.037630 | -1.489328 | 6 | 0 |
| `array-replace-200` | immediate | 116.050417 | 116.157583 | +0.107166 | 6 | 0 |
| `array-push-remove-100` | immediate | 119.194758 | 116.430463 | -2.764295 | 6 | 0 |
| `array-push-100` | record | 414.512505 | 417.014669 | +2.502164 | 6 | 0 |
| `array-replace-200` | record | 117.940375 | 116.959667 | -0.980708 | 6 | 0 |
| `array-push-remove-100` | record | 868.173761 | 857.245922 | -10.927839 | 6 | 0 |

측정은 방향 확인이며 성능 verdict가 아닙니다. immediate에서는 push -1.489328ms(-1.72%), push/remove -2.764295ms(-2.32%)였습니다. record에서는 push +2.502164ms(+0.60%), push/remove -10.927839ms(-1.26%)로 방향이 혼재합니다. replace는 immediate +0.107166ms(+0.09%), record -0.980708ms(-0.83%)였습니다. 두 lane의 replace가 서로 다른 방향이므로 이번 표만으로 무회귀를 확정하지 않습니다.

모든 **36 worker / 3,636 유효 sample / 437,052 checked writes**에서 `failedWrites = 0`입니다. 보정과 모든 유효 sample의 authored write commit 수는 정확히 1입니다. fixture별 HEAD/후보·세 회차·두 lane 전체에서 초기/최종 value·DOM observations digest와 관측 경로 수가 일치했습니다. 원본 예열 20·표본 101·bundle hash·Node 버전·record 대기·205초 자체 종료 조건도 raw에서 단언했습니다.

| bundle | bytes | SHA-256 | build service 종료 |
| --- | ---: | --- | --- |
| `head.cjs` | 902194 | `06339f8095006e4ff2f02f936706a588d5cdd672aaf602199e5d34e792a6ec15` | `{ code: 0, signal: null }` |
| `candidate.cjs` | 904977 | `518cbc7b472baeb315c92caaf087b7471c3dbafd8d7bd48e158c8e5119458f01` | `{ code: 0, signal: null }` |

raw 기준 측정 시각은 `2026-10-12T00:07:39.688Z`–`2026-10-12T00:32:08.140Z` (UTC)입니다. worker 내부 최대 109.778963초, 부모가 관측한 command 최대 110.092초로 모두 제한 안이었습니다. preparation 2개·calibration-all 4개·worker 36개, 총 42개 실제 단독 명령과 종료/시간을 `commands.json`에 기록했습니다. 각 명령 로그는 `logs/`, raw는 `head/`와 `candidate/`, 합산 표와 단언 계수는 `direction-summary.json`, 사본 diff는 `tools/measure-cross.diff`입니다.

## 측정 사본 diff

```diff
--- /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-154/fix1/tools/measure-cross.mjs	2026-10-12 05:10:08
+++ /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-155/fix2/tools/measure-cross.mjs	2026-10-12 09:06:45
@@ -31,7 +31,7 @@
 const pkgRequire = createRequire(path.join(pkg, 'package.json'));
 const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
 assert.equal(repo, '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
-assert.equal(head, '0eb8e3ada2d3c7fc8452bd48e3cd0d35739aa853');
+assert.equal(head, 'e1d3a89145130ee3a0c5de1d9c028caf58b04062');
 assert.equal(process.version, 'v26.11.1');
 assert.equal(process.execPath, '/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node');
 const started = performance.now();
@@ -40,7 +40,7 @@
 const calibrationOnly = process.argv.includes('--calibrate-all');
 const rawDirectory = process.argv.find(value => value.startsWith('--out='))?.slice(6);
 const bundleFile = process.argv.find(value => value.startsWith('--bundle='))?.slice(9);
-assert(rawDirectory?.startsWith('/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-154/fix1/'));
+assert(rawDirectory?.startsWith('/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-155/fix2/'));
 assert(bundleFile && path.isAbsolute(bundleFile));
 fs.mkdirSync(rawDirectory, { recursive: true });
 const fixtureName = process.argv[3];
@@ -177,7 +177,7 @@
           if (!args.path.startsWith(path.join(repo, 'packages/')) || args.path.includes('/node_modules/')) return undefined;
           const relative = path.relative(repo, args.path);
           let contents = process.argv.includes('--working-tree') ? fs.readFileSync(args.path, 'utf8') :
-            execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', 'show', '0eb8e3ada:' + relative], { cwd: repo, encoding: 'utf8', timeout: 10000 });
+            execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', 'show', 'e1d3a89145130ee3a0c5de1d9c028caf58b04062:' + relative], { cwd: repo, encoding: 'utf8', timeout: 10000 });
           if (relative.endsWith('/mountEquivalentForm.tsx')) {
             contents = contents.replace('const start = performance.now();', 'const activeStart = performance.eventLoopUtilization(); const start = performance.now();')
               .replace('mountMs: performance.now() - start,', 'mountMs: performance.now() - start, mountActiveMs: performance.eventLoopUtilization(activeStart).active,');
@@ -204,7 +204,7 @@
     fs.writeFileSync(bundleFile, bundleText);
     save('react-bundle.json', { head, file: bundleFile, bytes: Buffer.byteLength(bundleText),
       sha256: createHash('sha256').update(bundleText).digest('hex'), serviceExit,
-      measurementSource: process.argv.includes('--working-tree') ? 'working-tree sources; product code is uninstrumented' : 'committed 0eb8e3ada blobs; product code is uninstrumented' });
+      measurementSource: process.argv.includes('--working-tree') ? 'working-tree fix2 sources; product code is uninstrumented' : 'committed e1d3a89145130ee3a0c5de1d9c028caf58b04062 HEAD blobs; product code is uninstrumented' });
     console.log('REACT_BUNDLE_READY');
     } else {
     childProcess.spawn = originalSpawn;
```

## 열린 질문

현재 없습니다. 브리프 밖 결정이나 관측 계약 변경은 하지 않았습니다.
