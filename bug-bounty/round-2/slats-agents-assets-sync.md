# @slats/agents-assets-sync 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 5건입니다. 1라운드 문서([`../round-1/slats-agents-assets-sync.md`](../round-1/slats-agents-assets-sync.md))의 6건은 고쳐진 것으로 보고 제외했습니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다. 파일 시스템을 쓰는 재현은 모두 `os.tmpdir()` 아래 임시 폴더에서만 실행했습니다.

재현 테스트: [`probes/slats-agents-assets-sync/injectCli.r2.probe.test.ts`](probes/slats-agents-assets-sync/injectCli.r2.probe.test.ts)

- 빌드된 `bin`을 임시 폴더에서 실행하는 종단 간 테스트이며, 8개 모두 실패합니다.
- 실행하려면 파일을 `packages/slats/agents-assets-sync/src/__bounty__/r2-periphery/`에 복사한 뒤 `yarn workspace @slats/agents-assets-sync test --run src/__bounty__/r2-periphery/`를 실행합니다.
- 2번의 두 테스트는 대소문자를 구분하는 파일 시스템에서 `it.skipIf`로 스스로 건너뜁니다. macOS 기본 파일 시스템(APFS)에서 실행됩니다.

원인 파일 위치: `packages/slats/agents-assets-sync/src/`

## 1. 복사나 삭제가 실패해도 오류가 삼켜져, 종료 코드 0과 함께 보고서에 "생성됨" 또는 "삭제됨"으로 나옵니다

- 심각도: 높음. 권한 오류(EACCES)로 아무것도 쓰지 못했는데도 종료 코드가 0이고, `--json` 문서의 `exitCode`도 0이며, `report.created`에 그 파일이 들어갑니다. CI와 이 도구를 실행하는 에이전트는 성공으로 봅니다.
- 영향받는 공개 API: `inject-agents-settings` 명령의 세 출력 경로(일반, `--json`, Ink).
- 어긋난 계약: `README.md:106`은 종료 코드 1을 실행 오류로 정합니다. `README.md`의 207행부터 253행에 있는 `--json` 문서의 `report`와 `exitCode`는 실제로 일어난 일을 기술해야 합니다. 보고되지 않은 실패는 기본 정확성 위반이기도 합니다.
- 원인:
  - `utils/asyncPool.ts`가 모든 거부를 결과 객체로 바꾸는데, 세 호출자 `commands/runCli/renderers/renderPlain.ts:133`, `renderJSON.ts:156`, `ui/hooks/useApplyStep.ts:56`이 모두 그 결과를 버립니다. 그다음 `summarize(plan, 0)`이 계획 전체가 적용된 것처럼 보고합니다.
  - 또 `core/injectDocs/utils/applyAction.ts:33`은 삭제 실패에 `logger.warn`만 호출하고, 그 파일은 여전히 `report.deleted`에 들어가며 종료 코드는 0입니다.
- 1라운드와의 관계: 새로운 종류입니다(작업 풀과 보고서 사이에서 오류가 사라짐).
- 재현:
  - "a copy that fails with EACCES does not exit 0 and report the file as created": 실제 `{ written: false, status: 0, exitCode: 0, reportedCreated: true }`. 기대는 종료 코드 1이고 생성으로 보고되지 않는 것입니다.
  - "an orphan whose unlink fails with EACCES is not reported as deleted with exit 0": 실제 `{ stillThere: true, exitCode: 0, reportedDeleted: true }`.
- 확신도: 높음.

## 2. 버전 사이에 대소문자만 바뀌거나 유니코드 정규화(NFD에서 NFC)만 바뀐 파일 이름이 자기 자신의 고아로 취급되어, `--force`가 살아 있는 파일을 지웁니다

- 심각도: 중간에서 높음. macOS에서 대소문자만 바꾼 이름 변경(`README.md`에서 `Readme.md`)이나 정규화 변경이 있으면, 최신 상태인 설치가 `--force` 없이는 매번 종료 코드 2로 끝납니다. `--force --yes`를 주면 종료 코드 0으로 끝나지만 그 파일이 사라져, 다음 실행 전까지 설치된 스킬에서 빠집니다.
- 영향받는 공개 API: 명령의 스킬 고아 탐색.
- 어긋난 계약: `README.md:175`의 고아 정의는 "manifest 밖"이고, `src/DETAIL.md`의 AC-ASSET-PATH-APPLY는 반복 실행이 멱등이어야 한다고 요구합니다. `core/injectDocs/DETAIL.md:6`은 파일 복사와 삭제가 서로 독립이라고 적고 있는데, 대소문자나 정규화를 구분하지 않는 파일 시스템에서는 성립하지 않습니다.
- 원인: `core/buildPlan/buildPlan.ts:89`가 `readdir`이 돌려준 이름과 manifest 키를 정확한 문자열로 비교합니다(`known.has(relPath)`). APFS에서 `README.md`와 `Readme.md`는 같은 파일이므로, `classify`는 새 키를 `skip-uptodate`로 보고 `findOrphans`는 저장된 옛 이름을 고아로 봅니다. 이어서 `delete`가 하나뿐인 그 파일을 지웁니다. 작업 풀이 이 삭제를 복사와 동시에 실행할 수도 있습니다.
- 1라운드와의 관계: 1라운드 5번(`.DS_Store`를 고아로 봄)과 같은 `findOrphans`이지만 원인이 다릅니다. 1라운드 5번은 잡음 필터가 없는 것이고, 이 항목은 이름이 같은지 판단하는 방식의 문제입니다.
- 재현:
  - "a case-only rename between versions keeps the renamed file after --force": 실제 `{ plainStatus: 2, forcedStatus: 0, names: ['SKILL.md'] }`. 기대는 `names`가 `['Readme.md', 'SKILL.md']`이고 `plainStatus`가 0인 것입니다.
  - "an NFD -> NFC file-name change between versions keeps the file after --force": 실제 파일 개수 1, 기대 2.
- 확신도: 높음.

## 3. 종료 코드가 출력 방식에 따라 달라집니다. 여러 단위가 막힌 실행이 일반 출력에서는 1, `--json`에서는 2로 끝납니다

- 심각도: 중간.
- 영향받는 공개 API: `(패키지, 에이전트)` 쌍이 여러 개인 실행. 예를 들어 `--agent=claude,codex`, 스코프 별칭, 여러 `--package` 값.
- 어긋난 계약: `src/DETAIL.md:5`는 렌더러가 실행 가능 여부를 다시 판단하지 않아 종료 코드가 출력 방식에 의존하지 않는다고 적고 있습니다. `README.md:106`은 1을 실행 오류에 배정하는데, "`--force`로 다시 실행하라"는 차단은 설정 판정(2)입니다.
- 원인: `renderPlain.ts`의 59행, 83행, 89행은 단위가 하나일 때만 2를 유지합니다. 그 밖에는 0이 아닌 단위를 모두 `failureCount`로 세어 1을 반환합니다. `renderJSON.ts`의 103행과 104행은 2를 유지하지만 마지막 단위가 이깁니다. 오류 뒤에 차단 단위가 오면 2, 반대면 1이 됩니다(이 순서 효과는 재현하지 않았습니다).
- 1라운드와의 관계: 새로운 종류입니다.
- 재현: "a blocked multi-agent run exits with the same code in plain and --json". 실제 `{ plain: 1, json: 2 }`.
- 확신도: 높음.

## 4. 새 버전에서 빠진 규칙이나 스킬 전체가 claude 쪽에서는 지워지지 않는데, codex 쪽 규칙 블록은 지워집니다

- 심각도: 낮음에서 중간. 업그레이드 뒤에도 Claude Code에서 낡은 규칙이나 스킬이 계속 로드되고, `--force`를 줘도 지워지지 않습니다.
- 영향받는 공개 API: 버전이 바뀐 뒤의 명령 실행.
- 어긋난 계약: 1라운드 5번 항목이 인용한 고아 정의는 "이 패키지가 예전에 설치했지만 더 이상 배포하지 않는 내용"입니다. codex 경로는 같은 실행에서 낡은 블록을 지웁니다.
- 주의: `README.md:175`는 고아를 관리 대상 `skills/<name>/` 접두사로 한정하는데, 그 접두사는 새 manifest에서 계산됩니다. 따라서 문서화된 한계일 수 있습니다. 다만 claude와 codex 사이의 비대칭은 문서화되어 있지 않습니다.
- 원인: `core/agentTarget/utils/resolveDestinations.ts:74`가 고아 탐색 대상을 새 manifest의 스킬 이름공간과 codex 블록 파일로만 만듭니다. `.claude/rules`와 빠진 스킬 이름공간은 탐색하지 않습니다.
- 1라운드와의 관계: schema-form 1라운드 1번 항목(들어올 때와 나갈 때의 비대칭)과 같은 종류입니다.
- 재현:
  - "a rule dropped by a new version is removed for claude as it is for codex": 실제 `{ codexBlockGone: true, claudeFileGone: false }`.
  - "a skill dropped by a new version is removed after --force": 옛 `SKILL.md`가 남습니다.
- 확신도: 동작은 높음. 버그로 볼지는 중간입니다.

## 5. 대상 `package.json`이 UTF-8 BOM으로 시작하면, Node의 `require`는 읽는데 이 명령은 종료 코드 1로 끝납니다

- 심각도: 낮음.
- 영향받는 공개 API: `--package` 해석.
- 어긋난 계약: 기본 정확성입니다. `createRequire`가 이미 그 파일을 받아들였고, 같은 파일을 `require()`로 읽으면 동작합니다.
- 원인: `commands/runCli/targets/resolvePackage.ts:60`이 BOM을 떼지 않고 `JSON.parse(await readFile(..., 'utf-8'))`를 호출해 "Unexpected token" 오류가 납니다. `resolveScopeAlias.ts:93`에도 같은 패턴이 있습니다(재현하지 않음).
- 1라운드와의 관계: 1라운드 4번(CRLF)과 같은 입력 인코딩 종류입니다.
- 재현: "a package.json with a UTF-8 BOM (which Node accepts) resolves". 실제 종료 코드 1, 기대 0.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- 코드를 읽어 확인한 내용입니다.
  - `AGENTS.md` 맨 앞의 BOM은 블록 파싱을 깨지 않습니다. 패턴이 줄 시작에 고정되어 있지 않기 때문입니다.
  - 심볼릭 링크로 된 패키지 루트는 안전합니다. `require.resolve`가 실제 경로를 반환하고, `inspectAssetRoot`가 실제 경로끼리 비교합니다.
  - 끌어올려진(hoisted) 설치와 pnpm 설치는 `createRequire`와 `findInstallRoots`로 해석됩니다.
  - 일반 렌더러는 단위를 하나씩 차례로 적용하므로, `AGENTS.md` 하나를 공유하는 `codex,agents`가 갱신을 잃지 않습니다.
  - `--json` 필드는 `README.md` 예제와 일치합니다. 단위 실패 때의 `report: null`과 `error` 필드만 문서에 없습니다.
- 확인하지 못한 가능성: 한 스코프 별칭 안의 두 패키지가 같은 `skills/<name>/` 이름공간을 배포하면 서로의 파일을 고아로 볼 수 있습니다. 코드만 읽었고 현실성이 낮다고 판단했습니다.
