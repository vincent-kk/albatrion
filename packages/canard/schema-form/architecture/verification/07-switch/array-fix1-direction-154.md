# G26-154 fix1 — 배열 settle 접두 재사용

## 상태

제품 구현·지정 검증·방향 측정을 모두 완료했습니다. push와 push/remove의 update wall 중앙값은 두 대기 lane에서 모두 감소했습니다. 결과는 방향 확인이며 성능 판정은 아닙니다. 커밋·푸시·stash·브랜치 전환을 하지 않았습니다.

브리프의 최종 Amendment를 적용했습니다. 저장소 측정 도구와 `g26-148/control/` 원본은 수정하지 않았으며, `fix1/tools/measure-cross.mjs` 사본의 HEAD 고정값·출력 guard·번들 입력만 변경했습니다. 공개 스냅숏 형상·잠복 의미·노드/경로 identity·배달 순서를 바꾸는 결정은 필요하지 않았습니다.

## 경로 추적

`report-halt-1.md`의 추적을 현재 코드와 대조했습니다. 다음 경로는 `packages/canard/schema-form/` 기준이며, 배치 밖의 살아 있는 branch 배열에 해당합니다. 표에서 파일명만 쓴 구조 함수와 `applyArraySlots/utils/`의 기준 디렉터리는 `src/core/settle/utils/structure/`입니다. `dispatchRemove.ts`는 `src/core/dispatch/utils/entry/dispatchRemove.ts`, `copyArraySlots.ts`는 `src/core/behaviors/arrayBehavior/utils/plan/copyArraySlots.ts`를 뜻합니다.

| 단계 | push | remove-last | 코드 근거 |
| --- | --- | --- | --- |
| 공개 진입 | `SchemaNode.push(value)` → `dispatchPush` | `SchemaNode.remove(last)` → `dispatchRemove`; `pop`도 같은 구조 경로입니다. | `src/core/SchemaNode/SchemaNode.ts:212`, `:220`; `src/core/dispatch/utils/entry/dispatchPush.ts:22`, `dispatchRemove.ts:22` |
| 순수 계획 | 기존 `{ from: index }` 뒤에 새 `{ value }`를 추가합니다. | 마지막 위치를 제외한 원본 접두를 반환합니다. | `src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:17`, `:21`, `:26`; `copyArraySlots.ts:12` |
| 정착 문맥 | 계획을 얻고 scratch/context를 예약합니다. | 동일합니다. | `src/core/settle/utils/structure/arrangeSchemaNodeItems.ts:40`, `:92`, `:97` |
| 일반 경로의 원본 | 호스트 전체를 재합성합니다. 각 슬롯의 살아 있는 자식을 재귀적으로 읽고, 선언되었으나 없는 슬롯은 잠복 원본, 선언 밖 슬롯은 extras를 읽습니다. | 제거 반환값만 필요해도 전체를 재합성합니다. | 현재 `applyArraySlots.ts:38`, `:45`; `src/core/settle/utils/latent/readRawTree.ts:24`, `:28`, `:33`, `:45` |
| 일반 경로의 재구성 | 전체 `nextItems/nextRaw/nextSnapshot/reused/destinations`를 만들고 기존 노드를 재사용하거나 새 꼬리를 생성합니다. | 남은 전체 슬롯을 재구성하고 꼬리를 perished로 기록합니다. | 현재 `applyArraySlots.ts:50`, `:59`, `:81`, `:84` |
| 일반 경로의 저장소 | 모든 old slot의 move를 만들며 동일 위치 move도 포함합니다. 범위 밖 정리 후 실제 변경을 골라 저장소와 메모를 처리합니다. | 제거 경로의 raw·잠복·규칙·경고·메모를 정리합니다. | 현재 `applyArraySlots.ts:94`, `:95`; `rekeyArrayRuntimePaths.ts:31`, `:35`, `:67` |
| 후보 분기 | 자격 검사 통과 시 접두 raw·맵 항목·경로를 유지하고 새 tail 값만 분배합니다. | 반환값의 해당 슬롯만 읽고 제거 tail만 perished/move로 처리합니다. | `applyArraySlots.ts:35`; `applyArraySlots/utils/canApplyArrayTail.ts:10`; `applyArraySlots/utils/applyArrayTail.ts:27`, `:39`, `:57`, `:74` |
| 후보 공표 | 별도 children·dense snapshot을 공표하고 기존 changed/dirty/entered 표시를 유지합니다. | 제거 전 읽기와 정리를 마친 뒤 같은 표시를 수행합니다. | `applyArrayTail.ts:89`, `:90`, `:98`, `:112` |
| 기존 마감 | 재계산 등록 → compute → finish 후 길이를 반환합니다. | 같은 마감 후 제거값을 반환합니다. | `arrangeSchemaNodeItems.ts:98`, `:99`, `:100` |

HEAD의 `applyArraySlots.ts:35`는 전체 `readRawTree` 호출 자리였고, 후보의 분기·import 추가로 현재 일반 몸통은 3행 내려갔습니다. `arrangeSchemaNodeItems`·`readRawTree`는 수정하지 않았습니다.

## 설계와 불변식

공유 구간 `P = min(oldCount, nextCount)`의 모든 슬롯이 정확히 자기 위치의 `{ from: index }`여야 합니다. 선언이 있으면 같은 청사진을 가진 살아 있는 같은 이름의 아이템이 존재해야 하고, 선언이 없으면 그 위치의 살아 있는 아이템도 없어야 합니다. 호스트에 통째 raw override가 없고 길이가 실제로 달라지는 경우만 허용합니다. append 꼬리는 모두 value 슬롯이어야 합니다. 그 외 계획은 기존 일반 몸통을 그대로 실행합니다.

이 조건에서 접두의 원본 소유자·청사진·노드·itemKey·name·path는 그대로이며, 일반 경로도 해당 노드에 다시 markWrite를 수행하지 않습니다. 따라서 기존 raw·잠복 출처를 그 자리에 남기면 결과가 같습니다. declared prefix를 만들지 못한 게이트 슬롯, 다른 청사진, 이동이나 교체는 일반 경로입니다. 게이트를 가진 자손은 있어도 접두 아이템이 존재하면 처리하며, registry 제거와 재등록 순서는 일반 경로와 동일하게 유지합니다.

구조 맵의 접두 항목을 재사용하고 새 꼬리를 추가하거나 제거 꼬리만 삭제합니다. 접두 재사용 Set·destination Map·동일 위치 move를 만들지 않습니다. `rekeyArrayRuntimePaths`에 내부 선택 인자 `preservedPrefixCount = 0`을 추가하여 전체 oldCount 경계의 unaddressed 정리는 유지하면서 tail move만 전달합니다. 기본값 0인 일반 호출은 기존 전체 move를 그대로 사용합니다. 규칙의 원천/대상·경고·잠복 메모·불일치 메모의 영향 경로 정리도 기존 도구를 사용합니다.

children은 별도 배열로 만들어 이전 배달 기준 배열을 수정하지 않습니다. 로드 스냅숏도 접두의 슬롯 값을 새 dense 배열로 복사하고 새 tail 값만 붙이므로 짧거나 sparse인 이전 입력의 undefined 슬롯까지 일반 경로와 같으며 호출자 입력을 수정하지 않습니다. snapshot 경로 위의 조상 사본과 내용 동일 시 참조 보존은 기존 `setLoadValue`가 수행합니다. extras도 선언 밖 슬롯 순서와 undefined 밀도를 유지합니다.

속도 비용은 O(P)의 자격 검사·공표용 children/snapshot 사본과 실제 tail 작업입니다. 접두 raw 하위 트리 재합성 및 전체 맵/Set/move 재구성을 제거합니다. 전체 배열 쓰기와 compute의 자식 순회는 이번 범위에 포함되지 않습니다. 새 상주 cache·노드/문맥 필드를 추가하지 않았습니다.

`DETAIL.md`를 코드보다 먼저 수정했습니다. public boundary는 유지되어 INTENT 변경은 필요하지 않았습니다. 새 helper는 적용 함수의 하위 organ에 두었고 함수 파일마다 하나의 함수만 export합니다. 새 `as` 타입 단언은 없습니다. hook가 중첩 utils를 flat compartment로 만들라는 경고를 냈지만, 읽은 저장소 규칙의 nested organ 허용과 helper를 한 단계 아래에 배치하라는 요구가 우선하여 현재 위치를 유지했습니다. PR/merge seam이 아니므로 Filid 전체 scan은 실행하지 않았습니다.

## 변경 파일

모두 `packages/canard/schema-form/` 기준입니다.

- `src/core/settle/DETAIL.md`: 구현 불변식·비용과 `settle-array-prefix` acceptance group을 먼저 기록했습니다.
- `src/core/settle/utils/structure/applyArraySlots.ts`: 자격이 증명된 경우만 tail 함수로 분기합니다.
- `src/core/settle/utils/structure/rekeyArrayRuntimePaths.ts`: unchanged prefix와 old range 경계를 구별하는 내부 인자를 추가했습니다.
- `src/core/settle/utils/structure/applyArraySlots/utils/canApplyArrayTail.ts`: prefix 자격을 증명합니다.
- `src/core/settle/utils/structure/applyArraySlots/utils/applyArrayTail.ts`: 실제 tail만 생성·소멸시키고 기존 정착 사실을 등록합니다.
- `src/core/settle/__tests__/settle.array-prefix.test.ts`: 결과 대조 11개를 추가했습니다.
- `src/core/settle/__tests__/fixtures/compareArrayTail.ts`: oracle의 eligibility만 false로 고정하고 동일 입력·동일 정착을 실행합니다.
- `src/core/settle/__tests__/fixtures/observeArraySettlement.ts`: 값·출력·경로/키·스냅숏·배달/개정·저장소를 비교합니다.
- `src/core/settle/utils/structure/__tests__/applyArraySlots.prefix-work.test.ts`: 접두 raw 전체 읽기의 제거를 별도로 검증합니다.

저장소의 `selectChildren`·`computeNode`·React·`src/__legacy__`·측정 도구는 변경하지 않았습니다. 빌드 번들은 모두 이 scratch `fix1/` 아래에만 저장했습니다. `.seiri/tasks/array-settle-prefix-fix/`에는 무시되는 실행 계획과 증거 ledger를 남깁니다.

## 검증

모든 yarn 명령은 각각 단독 shell 호출이며 yarn 줄에 pipe·세미콜론·env prefix·redirect를 넣지 않았습니다.

| 명령 | 결과 |
| --- | --- |
| `yarn workspace @canard/schema-form typecheck` | 최종 통과, 타입 오류 없음 |
| `yarn workspace @canard/schema-form lint` | 통과, lint 오류 없음 |
| `yarn workspace @canard/schema-form test` | **503 files passed (503), 3534 tests passed, 1 todo (3535)**; 실패 0; Duration 75.59s |
| 패키지 디렉터리에서 `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs` | `LEGACY_ISOLATED: 1698 files checked` |

구현 전 명령:

`yarn workspace @canard/schema-form test --run --project unit src/core/settle/__tests__/settle.array-prefix.test.ts src/core/settle/utils/structure/__tests__/applyArraySlots.prefix-work.test.ts`

일반 경로의 결과 특성화 11개가 통과했고, work regression 한 개는 정확히 기대한 이유로 실패했습니다.

```text
Test Files  1 failed | 1 passed (2)
Tests  1 failed | 11 passed (12)
AssertionError: expected "readRawTree" to not be called at all, but actually been called 2 times
```

같은 명령은 tail 경로를 연결한 후 **2 files passed, 12 tests passed**입니다. 결과 대조는 append·remove-last·비접두 이동, 여러 value append·여러 tail 제거, tuple extras, sparse/short snapshot, 게이트 자손/없는 슬롯, clear·wrong-kind fallback, old range 밖 latent, tail 원천/대상 규칙과 메모 정리를 포함합니다. work 검사는 출력 동등성 검사와 별개입니다.

검증 중 테스트 보조 코드의 타입 오류를 수정했으며 검사를 완화하지 않았습니다. 실패 출력:

```text
src/core/settle/__tests__/fixtures/compareArrayTail.ts(32,20): error TS2540: Cannot assign to 'behavior' because it is a read-only property.
src/core/settle/__tests__/fixtures/observeArraySettlement.ts(8,14): error TS4023: Exported variable 'observeArraySettlement' has or is using name 'InactiveValueEntryMemo' from external module "/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/src/core/record/type" but cannot be named.
src/core/settle/__tests__/fixtures/observeArraySettlement.ts(8,14): error TS4023: Exported variable 'observeArraySettlement' has or is using name 'SchemaNodeDiagnostics' from external module "/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/src/core/record/type" but cannot be named.
```

첫 오류는 fixture 소유 behavior의 참조를 재할당하지 않고 mutable arrange 메서드만 지정하여 해결했습니다. 나머지는 관측 함수의 선언 반환 타입을 `unknown`으로 지정해 해결했습니다. 이후 typecheck와 lint, 전체 suite를 통과했습니다. 전체 suite에는 validator 부재·오류 경계의 의도된 throw·Storybook annotation 안내 등의 stderr가 있었지만 failed test나 unhandled-error 실패는 없었습니다.

## 방향 측정 절차

Node는 `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node`를 사용합니다. 공식 production React profiling 빌더와 value/DOM/commit 단언을 유지합니다. HEAD 번들은 `git show 0eb8e3ada:<path>` blob, 후보 번들은 working-tree source에서 읽습니다. 원본의 mount ELU 삽입·`react-dom/profiling` 연결·esbuild 옵션과 EOF 종료 감사는 그대로입니다.

| 번들 | bytes | SHA-256 |
| --- | ---: | --- |
| `head.cjs` | 896081 | `07b08c39eaeee850813a44ec000b26d8c06e7320eeb7f38feec255c13aec093b` |
| `candidate.cjs` | 902194 | `06339f8095006e4ff2f02f936706a588d5cdd672aaf602199e5d34e792a6ec15` |

두 build의 service 종료는 `{ code: 0, signal: null }`입니다. 제품 계측을 추가하지 않았습니다.

절차는 각 lane/variant의 세 fixture calibration-all 후, fixture마다 r1 HEAD→candidate, r2 candidate→HEAD, r3 HEAD→candidate입니다. 각 worker는 fresh process에서 자체 보정 후 예열 20회와 유효 표본 101회를 수행합니다. clone·GC·mount는 update 시계 밖이며 매 authored write는 flushSync 뒤 immediate lane에서 setImmediate 4회를, record lane에서 `drainTicks(2)`를 기다립니다. 각 lane/fixture/variant의 303개 sample을 합쳐 nearest-rank median을 계산하고 두 lane을 섞지 않습니다.

원본 worker의 205초 self-ending 단언을 유지합니다. 동시에 실행하는 측정 worker는 하나이며 각 명령은 8분 이내여야 합니다. 원시 측정·build metadata는 `head/`와 `candidate/`, 실제 명령과 로그는 `commands.json`과 `logs/`에 기록합니다. raw의 이전 HEAD 설명 문자열은 원본대로 남겨 두었고 실제 입력은 bundle metadata와 해시로 판별합니다.

## 방향 측정 결과

immediate lane을 완료했습니다. 아래는 전체 authored write 시퀀스의 `render-update-wall` pooled nearest-rank median이며 단위는 ms입니다. 각 셀은 101 × 3 = 303개의 sample입니다. delta는 candidate − HEAD입니다. 성능 판정이나 release 승인을 뜻하지 않습니다.

| fixture | HEAD median | candidate median | delta | 변화율 | 대기 |
| --- | ---: | ---: | ---: | ---: | --- |
| `array-push-100` | 92.015328 | 88.047250 | -3.968078 | -4.31% | setImmediate 4회/write |
| `array-replace-200` | 114.581208 | 114.401917 | -0.179291 | -0.16% | setImmediate 4회/write |
| `array-push-remove-100` | 132.903162 | 121.449958 | -11.453204 | -8.62% | setImmediate 4회/write |

record lane도 완료했습니다. 별도 fresh process pass의 결과이며 immediate와 합치지 않았습니다.

| fixture | HEAD median | candidate median | delta | 변화율 | 대기 |
| --- | ---: | ---: | ---: | ---: | --- |
| `array-push-100` | 422.378629 | 419.005047 | -3.373582 | -0.80% | drainTicks(2)/write |
| `array-replace-200` | 117.452333 | 117.036833 | -0.415500 | -0.35% | drainTicks(2)/write |
| `array-push-remove-100` | 886.924874 | 873.240538 | -13.684336 | -1.54% | drainTicks(2)/write |

두 lane의 모든 **36 worker / 3,636 유효 sample / 437,052 checked writes**에서 `failedWrites = 0`이며, 각 fixture의 HEAD/후보·모든 회차·두 lane 사이 value/DOM observations digest와 관측 경로 수가 일치했습니다. 보정과 모든 표본에서 각 authored write의 commit 수는 정확히 1이며 원본 commit 단언을 유지했습니다. 각 worker의 예열 20회·유효 표본 101회·bundle SHA-256·Node 버전·종료 시간도 raw에서 재확인했습니다.

측정 시각은 raw 기준 `2026-10-11T20:12:13.956Z`–`2026-10-11T20:38:01.838Z` (UTC)입니다. worker 내부 최대 시간은 112.922342초, 부모에서 관측한 단일 명령 최대 시간은 113.224초로 모두 원본 205초와 요청한 8분 한도 안입니다. preparation 2개·calibration-all 4개·worker 36개 실제 명령을 `commands.json`에 기록했습니다. 합산 표와 검증 계수는 `direction-summary.json`, 각 측정의 원시 값은 `head/`와 `candidate/`에 있습니다.

반복 push는 immediate -3.968078ms, push/remove는 -11.453204ms의 개선 방향입니다. record도 각각 -3.373582ms, -13.684336ms입니다. `array-replace-200`의 경로는 수정하지 않았으므로 그 작은 측정 차이를 이번 변경의 개선으로 귀속하지 않습니다. compute/selection 비용은 이번 범위에 포함되지 않으며 이 방향 측정으로 별도 성능 verdict를 내리지 않습니다.

## 측정 사본 diff

원본 `g26-148/control/measure-cross.mjs` SHA-256: `6334ea863dc62882ee187dcb199e9ae7308c0f09a7a7e5db1190a76f59fead91`.

사본 `tools/measure-cross.mjs` SHA-256: `00b957a543752bc931b153df1e4d6a30f59504a6afb3003f70108b100c790a6d`.

diff의 변경은 다음 네 hunk뿐입니다. 네 번째 hunk는 허용된 번들 입력의 provenance 표기입니다. worker 측정 몸통과 이후 코드는 bytes가 같습니다.

```diff
@@ -31,7 +31,7 @@
-assert.equal(head, '34b370eedcc293e704ad3a57c5a02612ddad200f');
+assert.equal(head, '0eb8e3ada2d3c7fc8452bd48e3cd0d35739aa853');
@@ -40,7 +40,7 @@
-assert(rawDirectory?.startsWith('.../scratchpad/g26-148/control/diag/'));
+assert(rawDirectory?.startsWith('.../scratchpad/g26-154/fix1/'));
@@ -176,7 +176,8 @@
-let contents = execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', 'show', head + ':' + relative], { cwd: repo, encoding: 'utf8', timeout: 10000 });
+let contents = process.argv.includes('--working-tree') ? fs.readFileSync(args.path, 'utf8') :
+  execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', 'show', '0eb8e3ada:' + relative], { cwd: repo, encoding: 'utf8', timeout: 10000 });
@@ -203,7 +204,7 @@
-measurementSource: 'committed HEAD blobs; product code is uninstrumented' });
+measurementSource: process.argv.includes('--working-tree') ? 'working-tree sources; product code is uninstrumented' : 'committed 0eb8e3ada blobs; product code is uninstrumented' });
```

출력 guard의 `...`는 보고서 표시를 줄인 것이며 실제 절대 경로는 사본과 `tools/measure-cross.diff`에 그대로 기록합니다.

## 최종 작업 트리와 산출물 확인

- HEAD: `0eb8e3ada2d3c7fc8452bd48e3cd0d35739aa853`; branch: `feat/schema-form-switch`로 시작과 끝이 같습니다.
- Git 변경은 위에 열거한 settle의 9개 파일뿐이며 staged 변경은 없습니다. 생성한 runtime bundle·측정 파일은 모두 scratch `fix1/`에 있습니다.
- `git diff --check`가 통과했습니다. 변경 TypeScript 8개 파일을 AST로 검사하여 각 함수 파일의 export는 하나이고 `AsExpression/TypeAssertionExpression`은 0개임을 확인했습니다.
- 최종 raw 36개와 보고서 median·delta·표본 계수의 일치, 원본 측정 스크립트의 SHA-256 유지, 실행 log 40개와 command 42개, 남은 측정 process 0개를 확인했습니다.
- `FINAL_ARTIFACT_OK`와 `SCOPE_OK`를 확인했으며 실행 ledger의 G1–G5는 모두 증거와 함께 충족되었습니다. 커밋·푸시·stash·브랜치 전환 없이 변경을 미커밋 상태로 유지합니다.

## 열린 질문

현재 없습니다. 최종 Amendment가 기존 중단 원인을 해결했으며 범위 밖 결정을 추가하지 않았습니다.
