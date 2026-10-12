# G26-156: 세 array fixture 공식 최종 재측정

`@canard/schema-form 0.16.0`과 committed HEAD `e9c408980d76b3866d311c5923d7f745ac12b17a`를 세 lane에서 비교했습니다. fixture 순서는 `array-push-100`, `array-replace-200`, `array-push-remove-100`입니다.

공식 immediate update-wall gap은 `array-push-100 +1.529666 ms (1.018311×)`, `array-replace-200 +9.959042 ms (1.095379×)`, `array-push-remove-100 -2.668696 ms (0.977904×)`입니다.

gap 해소 여부의 기준은 round `151C-01`이 고정한 148 출발값입니다. `136k` 값은 참고 열로만 사용했습니다.

## 1. 환경과 번들

| 항목 | 확인값 |
| --- | --- |
| Node 실행 파일 | `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node` |
| Node / V8 | `v26.11.1 / 14.6.202.34-node.37` |
| CPU / 메모리 / OS | `Apple M1 Max / 68719476736 bytes / Darwin 25.6.0 arm64` |
| React / react-dom / esbuild | `19.2.6 / 19.2.6 / 0.25.9` |
| 읽기 전용 worktree | `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07` |
| branch | `feat/schema-form-switch` |
| HEAD | `e9c408980d76b3866d311c5923d7f745ac12b17a` |
| 실제 src tree | `8b2586417a850450c32c23b0dd2b278725007811` |
| Git 상태 | 시작·종료 모두 clean; HEAD·branch·src tree 동일 |
| 측정 설정 | production profiling React, validation OFF, 제품 계측 없음, warmup 20, samples 101 |

HEAD 번들은 공식 `--prepare array-push-100 1 HEAD`로 committed blobs를 읽어 빌드했습니다. 두 번 연속 빌드의 bytes와 SHA-256이 같으며 모든 빌드 사본을 보존했습니다.

| 번들·파일 | bytes | SHA-256 |
| --- | ---: | --- |
| HEAD build 1: `builds/build-1.cjs` | 905727 | `ccbb5d0c5539f57e9eb81f1107b988024c18fdfad1028044572061c32d6f9106` |
| HEAD build 2: `builds/build-2.cjs` | 905727 | `ccbb5d0c5539f57e9eb81f1107b988024c18fdfad1028044572061c32d6f9106` |
| 최종 측정용 `react-official-head.cjs` | 905727 | `ccbb5d0c5539f57e9eb81f1107b988024c18fdfad1028044572061c32d6f9106` |
| 실제 공개판 ESM: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/node_modules/@canard/schema-form_0.16.0/dist/index.mjs` | 247510 | `78362ee2e5b7c0bdca5f9b80f7490c32a54ea344565e97c2b4088080a3c861b2` |
| 공개판 CJS 참고: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/node_modules/@canard/schema-form_0.16.0/dist/index.cjs` | 257733 | `19b9be1d81803928ead079d7ef225c61dc71ba8fdb1cf3f19d8926ebd28c44e2` |

esbuild service는 각 build에서 EOF로 종료했고 code 0 / signal null입니다. 공개판은 이미 설치된 `@canard/schema-form_0.16.0`을 사용했습니다. 외부 fetch·설치와 worktree 파일·Git 변경을 수행하지 않았습니다.

환경·빌드 근거는 [environment-before.json](environment-before.json), [preflight.json](preflight.json), [builds.json](builds.json), [driver-verification.json](driver-verification.json)에 있습니다.

## 2. 공식 절차와 실제 명령

정본은 `g26-148/control/measure-official.mjs`, `run-command.mjs`, `analyze.mjs`, `commands.json`, `official-raw/`와 `profile-148-control.md`의 1–3·6절입니다. 정본 디렉터리는 읽기만 했으며 시작·종료 SHA-256 대조가 일치했습니다.

| lane | 열 역할 | 동작 |
| --- | --- | --- |
| immediate | **판정 열**: 공식 wall / active (`145C-01`) | 예열·표본에서 clone → 강제 GC → mount; 각 update는 flushSync 뒤 setImmediate 4회 |
| nogc | **기록 열: 공식 절차에 없음** | immediate와 같은 절차에서 예열·표본의 mount 전 강제 GC만 생략 |
| record | **비교 열**: drainTicks(2) wall | 공식 사본에 `--old-wait`; 같은 update 위치에서 drainTicks(2) |

판정 harness `tools/measure-react-pair-129.mjs:151–155, 202–215`는 강제 GC를 생략한 두 번째 예열·표본 전체 순서를 `<열>-nogc` 기록 열로 저장합니다. 보정 회차는 `:129–149`에서 강제 GC를 유지합니다. 이번 nogc 사본도 예열·표본의 GC 호출만 제거하고 보정 GC는 유지하므로 **GC 생략의 정의는 일치합니다**. 이번 brief의 nogc lane은 별도의 fresh process로 실행하므로 harness의 같은 worker 안 두 번째 pass와 실행 배치는 다릅니다.

nogc 원시는 `nogc-raw/`에 저장했습니다. 변경을 GC 생략과 원시 경로에 한정하여 원본의 `lane: immediate`, 파일명의 `immediate`, `gcOutsideClock: true` 및 오래된 `source` 설명은 그대로입니다. 이 metadata의 GC 필드는 실제 호출 여부를 뜻하는 새 flag가 아니며, nogc 실행은 아래 diff와 명령의 script 경로로 구별합니다.

보정은 immediate 구판 → immediate HEAD → record 구판 → record HEAD로 수행했습니다. nogc 각 worker도 원본과 같은 독립적인 보정 회차를 실행하므로 nogc용 추가 `--calibrate-all`은 필요하지 않았습니다. 보정값은 immediate 보정값과 모든 worker에서 일치했습니다.

pair 순서는 immediate 9개 → nogc 9개 → record 9개이며, 각 lane에서 push → replace → push/remove, 각 fixture에서 r1 → r2 → r3입니다. r1·r3은 구판 → HEAD, r2는 HEAD → 구판입니다. 각 pair 및 그 안의 버전 worker는 fresh process로 하나씩 실행했습니다.

worker별 보정 후 fresh schema clone·fresh mount로 예열 20회와 표본 101회를 실행했습니다. GC·mount·관측·teardown은 update 시계 밖이며, 각 authored write의 wall과 ELU active를 합산했습니다. `drainTicks(2)`는 `setTimeout(..., 0)` 두 tick입니다.

fixture·lane·metric·버전별 303표본을 pool했습니다. nearest-rank median은 정렬한 152번째, p99는 300번째입니다. ratio = HEAD median / 0.16.0 median, gap = HEAD median − 0.16.0 median입니다. 회차 median을 평균하거나 lane을 합치지 않았습니다. 공식 `analyze.mjs`의 immediate·record 9행과 별도 전 lane 집계의 해당 9행은 일치했습니다.

### 148 사본에서 바꾼 모든 내용

경로와 HEAD 단언만 변경했으며 측정 로직은 유지했습니다. import한 두 instrumentation 파일도 O에 byte-for-byte 복사했으며 이 세 lane에서는 계측을 활성화하지 않습니다.

`measure-official.mjs`:

```diff
--- 148/measure-official.mjs
+++ 156/measure-official.mjs
@@ -19,8 +19,8 @@
 import path from 'node:path';
 import { fileURLToPath, pathToFileURL } from 'node:url';
 
-import { instrumentRound93i } from "file:///Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/tools/instrument-round-93i.mjs";
-import { instrumentCore } from "file:///Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-114-g26/instrument-core.mjs";
+import { instrumentRound93i } from "./instrument-round-93i.mjs";
+import { instrumentCore } from "./instrument-core.mjs";
 import { performance } from 'node:perf_hooks';
 
 const directory = "/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/tools";
@@ -31,15 +31,15 @@
 const pkgRequire = createRequire(path.join(pkg, 'package.json'));
 const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
 assert.equal(repo, '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
-assert.equal(head, '34b370eedcc293e704ad3a57c5a02612ddad200f');
+assert.equal(head, 'e9c408980d76b3866d311c5923d7f745ac12b17a');
 assert.equal(process.version, 'v26.11.1');
 assert.equal(process.execPath, '/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node');
 const started = performance.now();
 const lane = process.argv.includes('--old-wait') ? 'record' : 'immediate';
 const prepareOnly = process.argv.includes('--prepare');
 const calibrationOnly = process.argv.includes('--calibrate-all');
-const rawDirectory = "/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-148/control/official-raw";
-const bundleFile = "/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-148/control/react-official-head.cjs";
+const rawDirectory = "/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/official-raw";
+const bundleFile = "/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/react-official-head.cjs";
 fs.mkdirSync(rawDirectory, { recursive: true });
 const fixtureName = process.argv[3];
 const run = Number(process.argv[4]);
```

`run-command.mjs`:

```diff
--- 148/run-command.mjs
+++ 156/run-command.mjs
@@ -15,7 +15,7 @@
 const sha = bytes => createHash('sha256').update(bytes).digest('hex');
 const [label, ...args] = process.argv.slice(2);
 assert(label && !label.includes('/'));
-assert.equal(git(['rev-parse', 'HEAD']), '34b370eedcc293e704ad3a57c5a02612ddad200f');
+assert.equal(git(['rev-parse', 'HEAD']), 'e9c408980d76b3866d311c5923d7f745ac12b17a');
 const baseline = path.join(out, 'environment-before.json');
 if (!fs.existsSync(baseline)) fs.writeFileSync(baseline, JSON.stringify({
   startedAt: new Date().toISOString(), node: process.version, nodePath: process.execPath,
@@ -24,7 +24,7 @@
   srcTree: git(['rev-parse', 'HEAD:packages/canard/schema-form/src']),
   previousSrcTree: git(['rev-parse', 'b1035b73b:packages/canard/schema-form/src']),
   status: git(['status', '--porcelain=v1', '--untracked-files=all']),
-  harnessOriginalSha256: sha(fs.readFileSync(path.join(out, '../../measure-react-136k.mjs'))),
+  harnessOriginalSha256: sha(fs.readFileSync(path.join(out, '../measure-react-136k.mjs'))),
   harnessAdaptedSha256: sha(fs.readFileSync(path.join(out, 'measure-official.mjs')))
 }, null, 2) + '\n', { flag: 'wx' });
 const started = Date.now();
```

`analyze.mjs`:

```diff
--- 148/analyze.mjs
+++ 156/analyze.mjs
@@ -8,7 +8,7 @@
 
 assert.equal(process.version, 'v26.11.1');
 const out = path.dirname(fileURLToPath(import.meta.url));
-const scratch = path.resolve(out, '../..');
+const scratch = path.resolve(out, '..');
 const repo = '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07';
 const fixtures = ['array-push-100', 'array-replace-200', 'array-push-remove-100'];
 const sha = bytes => createHash('sha256').update(bytes).digest('hex');
```

nogc 사본의 공식 사본 대비 전체 diff:

```diff
--- 156/measure-official.mjs
+++ 156/measure-official-nogc.mjs
@@ -38,7 +38,7 @@
 const lane = process.argv.includes('--old-wait') ? 'record' : 'immediate';
 const prepareOnly = process.argv.includes('--prepare');
 const calibrationOnly = process.argv.includes('--calibrate-all');
-const rawDirectory = "/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/official-raw";
+const rawDirectory = "/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/nogc-raw";
 const bundleFile = "/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/react-official-head.cjs";
 fs.mkdirSync(rawDirectory, { recursive: true });
 const fixtureName = process.argv[3];
@@ -254,7 +254,6 @@
     for (let index = -warmup; index < samples; index++) {
       assert(performance.now() - started < 205_000, 'Worker reached its self-ending duration bound');
       const currentFixture = { ...fixture, legacy: structuredClone(fixture.legacy), workspace: structuredClone(fixture.workspace) };
-      globalThis.gc();
       totals = {}; stack = []; collecting = lane === 'phases';
       const mounted = await api.mountEquivalentForm(currentFixture, version === 'HEAD' ? 'latest' : '0.16.0');
       collecting = false;
```

새 보조 파일은 `driver.mjs`, `launch-driver.mjs`, `analyze-156.mjs`, `final-evidence.mjs`입니다. 순차 호출·번들 사본 보존·명령 기록·추가 nogc 집계와 저장물 검증을 담당하며 공식 사본의 실행 로직을 바꾸지 않습니다.

### 실제 명령

모든 Node script의 cwd는 아래 worktree이며 실행 파일은 지정된 Node입니다. `commands.json`에 측정 child의 `argv`, wrapper의 `wrapperArgv`, start/end, seconds, exitCode를 기록했습니다. 로그와 개별 command JSON은 `logs/`에 있습니다.

```sh
cd /Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node --check /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/driver.mjs
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/launch-driver.mjs
# launch-driver.mjs가 별도 process group으로 driver.mjs를 실행합니다.
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs prepare-build-1 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --prepare array-push-100 1 HEAD
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs prepare-build-2 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --prepare array-push-100 1 HEAD
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs calibration-immediate-0.16.0 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --calibrate-all 0.16.0
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs calibration-immediate-HEAD --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --calibrate-all HEAD
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs calibration-record-0.16.0 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --calibrate-all 0.16.0 --old-wait
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs calibration-record-HEAD --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --calibrate-all HEAD --old-wait
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-immediate-array-push-100-r1 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-push-100 1
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-immediate-array-push-100-r2 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-push-100 2
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-immediate-array-push-100-r3 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-push-100 3
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-immediate-array-replace-200-r1 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-replace-200 1
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-immediate-array-replace-200-r2 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-replace-200 2
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-immediate-array-replace-200-r3 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-replace-200 3
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-immediate-array-push-remove-100-r1 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-push-remove-100 1
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-immediate-array-push-remove-100-r2 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-push-remove-100 2
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-immediate-array-push-remove-100-r3 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-push-remove-100 3
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-nogc-array-push-100-r1 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official-nogc.mjs --pair array-push-100 1
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-nogc-array-push-100-r2 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official-nogc.mjs --pair array-push-100 2
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-nogc-array-push-100-r3 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official-nogc.mjs --pair array-push-100 3
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-nogc-array-replace-200-r1 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official-nogc.mjs --pair array-replace-200 1
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-nogc-array-replace-200-r2 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official-nogc.mjs --pair array-replace-200 2
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-nogc-array-replace-200-r3 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official-nogc.mjs --pair array-replace-200 3
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-nogc-array-push-remove-100-r1 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official-nogc.mjs --pair array-push-remove-100 1
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-nogc-array-push-remove-100-r2 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official-nogc.mjs --pair array-push-remove-100 2
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-nogc-array-push-remove-100-r3 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official-nogc.mjs --pair array-push-remove-100 3
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-record-array-push-100-r1 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-push-100 1 --old-wait
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-record-array-push-100-r2 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-push-100 2 --old-wait
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-record-array-push-100-r3 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-push-100 3 --old-wait
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-record-array-replace-200-r1 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-replace-200 1 --old-wait
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-record-array-replace-200-r2 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-replace-200 2 --old-wait
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-record-array-replace-200-r3 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-replace-200 3 --old-wait
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-record-array-push-remove-100-r1 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-push-remove-100 1 --old-wait
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-record-array-push-remove-100-r2 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-push-remove-100 2 --old-wait
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs pair-record-array-push-remove-100-r3 --expose-gc /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/measure-official.mjs --pair array-push-remove-100 3 --old-wait
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/run-command.mjs analysis-official /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/analyze.mjs
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/analyze-156.mjs
/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-156/final-evidence.mjs
```

| label | 시작 UTC | 종료 UTC | seconds | exit code |
| --- | --- | --- | ---: | ---: |
| prepare-build-1 | 2026-10-12T04:03:04.299Z | 2026-10-12T04:03:09.254Z | 4.955 | 0 |
| prepare-build-2 | 2026-10-12T04:03:09.297Z | 2026-10-12T04:03:14.182Z | 4.885 | 0 |
| calibration-immediate-0.16.0 | 2026-10-12T04:03:14.233Z | 2026-10-12T04:03:15.125Z | 0.892 | 0 |
| calibration-immediate-HEAD | 2026-10-12T04:03:15.168Z | 2026-10-12T04:03:15.999Z | 0.831 | 0 |
| calibration-record-0.16.0 | 2026-10-12T04:03:16.047Z | 2026-10-12T04:03:17.359Z | 1.312 | 0 |
| calibration-record-HEAD | 2026-10-12T04:03:17.417Z | 2026-10-12T04:03:19.258Z | 1.841 | 0 |
| pair-immediate-array-push-100-r1 | 2026-10-12T04:03:19.315Z | 2026-10-12T04:03:48.175Z | 28.860 | 0 |
| pair-immediate-array-push-100-r2 | 2026-10-12T04:03:48.218Z | 2026-10-12T04:04:17.114Z | 28.896 | 0 |
| pair-immediate-array-push-100-r3 | 2026-10-12T04:04:17.155Z | 2026-10-12T04:04:46.055Z | 28.900 | 0 |
| pair-immediate-array-replace-200-r1 | 2026-10-12T04:04:46.099Z | 2026-10-12T04:05:25.380Z | 39.281 | 0 |
| pair-immediate-array-replace-200-r2 | 2026-10-12T04:05:25.423Z | 2026-10-12T04:06:04.730Z | 39.307 | 0 |
| pair-immediate-array-replace-200-r3 | 2026-10-12T04:06:04.775Z | 2026-10-12T04:06:44.201Z | 39.426 | 0 |
| pair-immediate-array-push-remove-100-r1 | 2026-10-12T04:06:44.244Z | 2026-10-12T04:07:17.624Z | 33.380 | 0 |
| pair-immediate-array-push-remove-100-r2 | 2026-10-12T04:07:17.667Z | 2026-10-12T04:07:50.983Z | 33.316 | 0 |
| pair-immediate-array-push-remove-100-r3 | 2026-10-12T04:07:51.030Z | 2026-10-12T04:08:24.255Z | 33.225 | 0 |
| pair-nogc-array-push-100-r1 | 2026-10-12T04:08:24.296Z | 2026-10-12T04:08:46.003Z | 21.707 | 0 |
| pair-nogc-array-push-100-r2 | 2026-10-12T04:08:46.044Z | 2026-10-12T04:09:07.713Z | 21.669 | 0 |
| pair-nogc-array-push-100-r3 | 2026-10-12T04:09:07.756Z | 2026-10-12T04:09:29.355Z | 21.599 | 0 |
| pair-nogc-array-replace-200-r1 | 2026-10-12T04:09:29.399Z | 2026-10-12T04:09:59.235Z | 29.836 | 0 |
| pair-nogc-array-replace-200-r2 | 2026-10-12T04:09:59.280Z | 2026-10-12T04:10:29.321Z | 30.041 | 0 |
| pair-nogc-array-replace-200-r3 | 2026-10-12T04:10:29.364Z | 2026-10-12T04:10:59.409Z | 30.045 | 0 |
| pair-nogc-array-push-remove-100-r1 | 2026-10-12T04:10:59.451Z | 2026-10-12T04:11:25.555Z | 26.104 | 0 |
| pair-nogc-array-push-remove-100-r2 | 2026-10-12T04:11:25.599Z | 2026-10-12T04:11:52.113Z | 26.514 | 0 |
| pair-nogc-array-push-remove-100-r3 | 2026-10-12T04:11:52.156Z | 2026-10-12T04:12:18.119Z | 25.963 | 0 |
| pair-record-array-push-100-r1 | 2026-10-12T04:12:18.161Z | 2026-10-12T04:13:48.518Z | 90.357 | 0 |
| pair-record-array-push-100-r2 | 2026-10-12T04:13:48.560Z | 2026-10-12T04:15:19.128Z | 90.568 | 0 |
| pair-record-array-push-100-r3 | 2026-10-12T04:15:19.173Z | 2026-10-12T04:16:49.865Z | 90.692 | 0 |
| pair-record-array-replace-200-r1 | 2026-10-12T04:16:49.910Z | 2026-10-12T04:17:30.139Z | 40.229 | 0 |
| pair-record-array-replace-200-r2 | 2026-10-12T04:17:30.181Z | 2026-10-12T04:18:09.813Z | 39.632 | 0 |
| pair-record-array-replace-200-r3 | 2026-10-12T04:18:09.855Z | 2026-10-12T04:18:49.988Z | 40.133 | 0 |
| pair-record-array-push-remove-100-r1 | 2026-10-12T04:18:50.031Z | 2026-10-12T04:21:53.457Z | 183.426 | 0 |
| pair-record-array-push-remove-100-r2 | 2026-10-12T04:21:53.502Z | 2026-10-12T04:24:55.358Z | 181.856 | 0 |
| pair-record-array-push-remove-100-r3 | 2026-10-12T04:24:55.405Z | 2026-10-12T04:27:58.418Z | 183.013 | 0 |
| analysis-official | 2026-10-12T04:27:58.464Z | 2026-10-12T04:27:58.921Z | 0.457 | 0 |

wrapper의 450초 guard, worker의 205초 자기 종료 단언, pair의 worker <220초 단언을 유지했습니다. shell 호출은 detached 실행 또는 짧은 poll로 종료했습니다. 초기 shell background 시도는 driver가 시작되지 않았고, 별도 process group launcher로 전환했습니다. 첫 launcher의 측정 전 점검은 `spawnSync ps EPERM`으로 중단되었습니다. 별도 CPU 점검에서 heavy process가 없음을 이미 확인했으므로 중복 ps 점검만 제거했습니다. 당시 로그·marker·보고서는 `launch-attempt-1/`에 보존했으며 측정 pair 실패는 0입니다.

## 3. 최종 재측정 표

단위는 ms입니다. `/`는 median / p99이며 회차별 median은 **구판 r1,r2,r3; HEAD r1,r2,r3** 순서입니다. `148 출발값`은 같은 행의 구판 median/p99; HEAD median/p99, ratio, gap을 뜻합니다. 148에는 nogc lane이 없습니다.

### array-push-100

| metric | 0.16.0 median/p99 | HEAD median/p99 | ratio | gap ms | 회차별 median: 구판; HEAD | 148 출발값 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| wall (immediate) | 83.538376 / 95.787375 | 85.068042 / 93.510539 | 1.018311× | +1.529666 | 84.098665, 83.720210, 83.264168; 84.232800, 85.418752, 85.490792 | 84.907210 / 98.230663; 91.983790 / 100.166330; 1.083345×; +7.076580 ms |
| active (immediate) | 83.587082 / 95.867382 | 85.115373 / 93.587162 | 1.018284× | +1.528291 | 84.150369, 83.772288, 83.308618; 84.278953, 85.473332, 85.541795 | 84.953041 / 98.303539; 92.036875 / 100.228550; 1.083385×; +7.083834 ms |
| wall (nogc) | 68.756127 / 79.108165 | 66.268503 / 79.274625 | 0.963820× | -2.487624 | 69.231915, 68.793208, 68.163670; 66.321795, 66.535333, 66.056669 | 없음 (공식 절차에 없음) |
| active (nogc) | 68.800126 / 79.170248 | 66.324629 / 79.316959 | 0.964019× | -2.475496 | 69.268373, 68.827170, 68.190585; 66.365291, 66.575251, 66.099373 | 없음 (공식 절차에 없음) |
| drainTicks(2) wall (record) | 245.736747 / 265.546288 | 414.009709 / 504.093956 | 1.684769× | +168.272962 | 244.537460, 246.324914, 246.251543; 413.392002, 407.803166, 415.689127 | 244.504002 / 264.642588; 412.879541 / 506.759162; 1.688641×; +168.375539 ms |

### array-replace-200

| metric | 0.16.0 median/p99 | HEAD median/p99 | ratio | gap ms | 회차별 median: 구판; HEAD | 148 출발값 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| wall (immediate) | 104.415667 / 110.915750 | 114.374709 / 121.694709 | 1.095379× | +9.959042 | 104.588917, 104.659083, 104.051083; 113.601917, 114.228500, 115.291625 | 105.310958 / 112.090125; 114.151875 / 119.988083; 1.083951×; +8.840917 ms |
| active (immediate) | 104.419375 / 110.919375 | 114.378625 / 121.698917 | 1.095377× | +9.959250 | 104.592708, 104.662959, 104.054875; 113.606375, 114.232500, 115.295625 | 105.314542 / 112.094625; 114.155875 / 119.992000; 1.083952×; +8.841333 ms |
| wall (nogc) | 85.926667 / 91.953834 | 91.891375 / 100.098417 | 1.069416× | +5.964708 | 85.777500, 86.934208, 84.835959; 90.758917, 91.672333, 92.903167 | 없음 (공식 절차에 없음) |
| active (nogc) | 85.931292 / 91.958958 | 91.895500 / 100.102667 | 1.069407× | +5.964208 | 85.782000, 86.939375, 84.841667; 90.762708, 91.676458, 92.907000 | 없음 (공식 절차에 없음) |
| drainTicks(2) wall (record) | 106.101666 / 111.719834 | 117.854875 / 125.617333 | 1.110773× | +11.753209 | 105.934250, 105.421375, 107.311000; 119.792292, 116.598625, 117.198292 | 106.229083 / 114.379041; 117.779875 / 127.812208; 1.108735×; +11.550792 ms |

### array-push-remove-100

| metric | 0.16.0 median/p99 | HEAD median/p99 | ratio | gap ms | 회차별 median: 구판; HEAD | 148 출발값 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| wall (immediate) | 120.776325 / 130.894250 | 118.107629 / 137.684876 | 0.977904× | -2.668696 | 120.611084, 121.192540, 120.673209; 118.244334, 118.501539, 117.643251 | 123.456713 / 133.011168; 133.309702 / 152.495256; 1.079809×; +9.852989 ms |
| active (immediate) | 120.842634 / 130.988463 | 118.187495 / 137.781075 | 0.978028× | -2.655138 | 120.688416, 121.250256, 120.739336; 118.328212, 118.560745, 117.712032 | 123.517831 / 133.089334; 133.401370 / 152.579788; 1.080017×; +9.883540 ms |
| wall (nogc) | 101.418879 / 114.857095 | 92.371960 / 105.509629 | 0.910796× | -9.046919 | 100.367910, 103.032753, 99.435508; 92.181621, 92.628208, 92.168668 | 없음 (공식 절차에 없음) |
| active (nogc) | 101.467125 / 114.924618 | 92.440331 / 105.574637 | 0.911037× | -9.026795 | 100.437368, 103.080457, 99.489460; 92.227461, 92.684546, 92.218201 | 없음 (공식 절차에 없음) |
| drainTicks(2) wall (record) | 582.895623 / 679.015459 | 864.431459 / 1057.373285 | 1.482995× | +281.535836 | 578.389871, 585.062372, 576.780123; 874.790283, 845.005206, 874.115454 | 576.298174 / 679.499992; 892.014216 / 1085.890756; 1.547835×; +315.716042 ms |

### update-wall gap의 lane별 요약

| fixture | lane | 148 출발 gap ms | 최종 gap ms | gap 변화 ms (최종 − 148) |
| --- | --- | ---: | ---: | ---: |
| array-push-100 | immediate | +7.076580 | +1.529666 | -5.546914 |
| array-replace-200 | immediate | +8.840917 | +9.959042 | +1.118125 |
| array-push-remove-100 | immediate | +9.852989 | -2.668696 | -12.521685 |
| array-push-100 | nogc (공식 절차에 없음) | 없음 | -2.487624 | 비교값 없음 |
| array-replace-200 | nogc (공식 절차에 없음) | 없음 | +5.964708 | 비교값 없음 |
| array-push-remove-100 | nogc (공식 절차에 없음) | 없음 | -9.046919 | 비교값 없음 |
| array-push-100 | record | +168.375539 | +168.272962 | -0.102577 |
| array-replace-200 | record | +11.550792 | +11.753209 | +0.202417 |
| array-push-remove-100 | record | +315.716042 | +281.535836 | -34.180206 |

### 누적 효과: 151C-01 고정 출발값 대비

148의 정확한 원시 재집계값은 아래 출발값으로 반올림됩니다. 출발 gap과 ratio는 `151C-01` 기준으로 고정했으며, 변화량은 반올림 전 출발 gap을 빼서 계산했습니다. 최종 gap이 양수이면 남은 gap이 있는 것으로 기록합니다.

| fixture | 151C-01 출발 gap ms (ratio) | 148 정확한 출발 gap ms (ratio) | e9c408980 최종 gap ms (ratio) | gap 변화 ms | 136k 참고만 ms | gap 해소 여부 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| array-push-100 | +7.08 (1.083×) | +7.076580 (1.083345×) | +1.529666 (1.018311×) | -5.546914 | +6.95 | 잔여 gap 있음 |
| array-replace-200 | +8.84 (1.084×) | +8.840917 (1.083951×) | +9.959042 (1.095379×) | +1.118125 | +7.30 | 잔여 gap 있음 |
| array-push-remove-100 | +9.85 (1.080×) | +9.852989 (1.079809×) | -2.668696 (0.977904×) | -12.521685 | +8.24 | 해소 |

위 결과는 요청된 3회 pooled 측정값입니다. 판정은 immediate wall·active에서 하고, nogc와 drainTicks 결과는 각각 기록·비교 열로 읽습니다.

## 6. 최종 검증과 저장물

27 pairs / 54 workers, worker별 warmup 20 / samples 101, 15행 각각 버전별 303표본을 확인했습니다. checkedWrites는 655578, failedWrites는 0입니다. 모든 HEAD write는 commit 1, 구판은 각 worker의 보정값과 일치했습니다. 예열·표본의 값·DOM digest는 버전·회차·lane 전체에서 일치했습니다. 표본별 wall·active 합계도 개별 write 시계의 합과 일치했습니다.

최대 worker 본문은 110.183589초, 최대 측정·공식 집계 command는 183.426초입니다. 측정·공식 집계 34개 command가 순차 실행되었고 모두 8분 이내 code 0 / signal null로 종료했습니다. 첫 build부터 공식 집계 종료까지 1494.622초입니다.

두 연속 build의 bytes·SHA-256, 공식 사본·nogc diff 제한, instrumentation 사본, 148 출발값의 원시 재집계, command 순서·비중첩, pair 순서·동등성, warmup·samples·validation·profiling, 모든 write 단언, 공개판·HEAD bundle hash 및 시작·종료 Git clean 상태를 확인했습니다.

원시는 `official-raw/`, `nogc-raw/`, 빌드 사본은 `builds/`, 실제 stdout·argv는 `logs/`에 있습니다. [analysis.json](analysis.json)은 변경 없는 148 집계 코드의 공식·record 결과이며, [analysis-156.json](analysis-156.json)은 nogc를 포함한 전 lane 집계입니다. [commands.json](commands.json), [verification.json](verification.json), [sha256.json](sha256.json), [driver.log](driver.log), [DRIVER_156_COMPLETE](DRIVER_156_COMPLETE)에 실행·검증·해시·완료 근거를 보존했습니다. 위 표의 측정·공식 집계 명령 외에 별도 보조 분석 명령도 commands.json과 `logs/analysis-156.command.json`에 실제 argv·시각·종료 코드를 기록했습니다.

측정 pair 실패와 남은 질문은 없습니다. worktree와 기준 세션의 파일은 변경하지 않았습니다.
