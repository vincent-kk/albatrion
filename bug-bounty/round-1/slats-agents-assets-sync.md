# @slats/agents-assets-sync 버그 바운티 결과

확인된 문제는 6건이며, 그중 1건은 문서 불일치일 수 있습니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다. 파일 시스템을 쓰는 재현은 모두 `os.tmpdir()` 아래 임시 폴더에서만 실행했습니다.

재현 테스트:

- [`probes/slats-agents-assets-sync/injectCli.probe.test.ts`](probes/slats-agents-assets-sync/injectCli.probe.test.ts): 빌드된 `bin/inject-agents-settings.mjs`를 임시 폴더에서 실행하는 종단 간 테스트입니다.
- [`probes/slats-agents-assets-sync/forceConfirmOrphans.probe.test.ts`](probes/slats-agents-assets-sync/forceConfirmOrphans.probe.test.ts)

주의: 이 패키지의 기존 종단 간 테스트(`cli`, `json`, `assetPathRoundTrip`)는 `src/` 아래 파일이 `dist/`보다 새로우면 스스로 건너뜁니다. 재현 테스트를 `src/` 아래에 다시 둘 때는 이 점을 감안해야 합니다.

## 1. 해시 manifest 키 중간에 `..`가 있으면 에이전트 설치 루트 밖에 파일을 씁니다

- 심각도: 중간에서 높음. 의도한 폴더 밖에 파일을 쓰며, `--force`가 있으면 사용자가 쓸 수 있는 아무 파일이나 덮어쓸 수 있습니다. 조작된 `dist/agents-hashes.json`이 필요합니다(예: 변조된 패키지).
- 영향받는 공개 API: `inject-agents-settings` 명령, `resolveDestinations`.
- 어긋난 계약: 루트 `DETAIL.md`는 격리를 명시적 목표로 둡니다("패키지 밖으로 해석되는 자산 루트는 심볼릭 링크를 포함해 해석된 위치 기준으로 거부한다"). 의도한 폴더 밖에 쓰지 않는 것은 기본적인 올바름이기도 합니다.
- 원인: `packages/slats/agents-assets-sync/src/core/agentTarget/utils/resolveDestinations.ts:68`이 `join(root, rest)`로 목적지를 만듭니다. 유일한 검사인 101행의 `assertNotReserved`는 `.`으로 시작하는 `rest`만 거부합니다. 그래서 `skills/pp/../../../../escaped.md`가 통과하고, `join`이 이를 `.claude/skills` 위쪽 경로로 정규화합니다. `readHashManifest`는 키를 검증하지 않습니다.
- 재현: `injectCli.probe.test.ts`의 테스트 "a manifest key with inner .. segments cannot write outside the skills root". 실제로 프로젝트 루트 밖에 `<outerTmp>/escaped.md`가 생깁니다. 기대 동작은 아무 파일도 쓰지 않는 것입니다.
- 확신도: 높음.

## 2. TTY에서 `--yes` 없이 `--force`만 주면 확인 대화상자 없이 고아 파일을 지웁니다

- 심각도: 중간에서 높음. 문서가 약속한 확인 없이 사용자 파일이 삭제됩니다.
- 영향받는 공개 API: TTY에서 `--force`를 준 명령.
- 어긋난 계약: `README.md:177`은 "TTY에서 `--force`는 대화형 확인을 열고, 갈라진 경로와 고아 경로를 최대 3개까지 보여 준다"고 적고 있습니다. 루트 `DETAIL.md`도 ConfirmForce 대화상자가 갈라진 항목과 고아 항목을 먼저 보여 준다고 적고 있습니다.
- 원인: `packages/slats/agents-assets-sync/src/core/buildPlan/buildPlan.ts:45`는 `force`가 꺼져 있을 때만 `requiresForce`를 설정합니다. `--force`에서는 고아 파일이 `delete` 동작이 되고 이 표시를 남기지 않습니다. `src/ui/hooks/useForceConfirmStep.ts:27`과 28행은 어떤 계획에 `requiresForce`가 있을 때만 대화상자를 보여 주므로, 변경이 고아 파일뿐인 실행은 대화상자를 통째로 건너뜁니다. `usePlanStep`도 `warn-orphan` 경고만 모으므로, 다른 항목 때문에 대화상자가 열려도 고아 파일은 목록에 나오지 않습니다.
- 재현: `forceConfirmOrphans.probe.test.ts`의 테스트 "TTY --force without --yes asks before deleting an orphan". 실제로는 `force-confirm-required` 이벤트가 없고 함수가 바로 끝납니다. 실제 TTY를 구동하지 않고 내부 함수를 직접 호출해 확인했습니다.
- 확신도: 높음.

## 3. 비대화형 `--force`가 고아 파일을 지우면서 stderr에 목록을 남기지 않습니다

- 심각도: 중간. 명시된 정책과 달리 삭제가 조용히 일어납니다.
- 영향받는 공개 API: TTY가 아닌 환경에서 `--force`를 준 명령.
- 어긋난 계약: 루트 `DETAIL.md`와 `README.md:178`은 비대화형 실행이 갈라진 항목과 고아 항목 목록을 stderr에 쓴다고 적고 있습니다.
- 원인: `packages/slats/agents-assets-sync/src/commands/runCli/renderers/renderPlain.ts:187`의 `emitForceList`는 `warn-diverged`나 `warn-orphan`만 고르는데, `--force`에서는 고아 파일이 이미 `delete` 동작이 되어 있어(2번 참고) 목록에 오르지 않습니다.
- 재현: `injectCli.probe.test.ts`의 테스트 "non-interactive --force lists orphan deletions on stderr". 실제 stderr는 비어 있고 `extra.md`는 지워집니다. 기대 동작은 stderr에 `skills/pp/extra.md`가 나오는 것입니다.
- 확신도: 높음.

## 4. 줄바꿈이 CRLF인 `AGENTS.md`에는 다음 실행 때 블록이 중복으로 들어갑니다

- 심각도: 중간. `core.autocrlf=true`인 Windows 체크아웃에서 규칙 내용이 중복되고, 오래된 사본은 갱신되지도 고아로 지워지지도 않습니다.
- 영향받는 공개 API: `--agent=codex` 또는 `--agent=agents` 명령, `parseBlocks`.
- 어긋난 계약: 루트 `DETAIL.md`의 AC-ASSET-PATH-APPLY는 반복 실행이 멱등이어야 한다고 요구합니다.
- 원인: `packages/slats/agents-assets-sync/src/core/markerBlock/utils/markerLine.ts:38`의 블록 패턴이 START 표지 바로 뒤에 `\n`을 요구하므로 `-->\r\n`은 맞지 않습니다. `findBlockBody`가 null을 반환하고, 계획이 `copy`가 되며, `upsertBlock`이 같은 id의 블록을 하나 더 붙입니다.
- 재현: `injectCli.probe.test.ts`의 테스트 "a CRLF-converted AGENTS.md block is recognized, not duplicated". 실제 START 표지 2개, 기대 1개.
- 확신도: 높음.

## 5. 설치된 스킬 폴더 안의 Finder `.DS_Store`가 실행을 종료 코드 2로 막습니다

- 심각도: 낮음에서 중간. macOS에서 폴더를 Finder로 열기만 해도 이후 실행이 실패하고, `--force`를 주면 그 파일이 지워집니다.
- 영향받는 공개 API: 명령 전체.
- 어긋난 계약: `buildPlan.ts`의 고아 정의는 "이 패키지가 예전에 설치했지만 더 이상 배포하지 않는 내용"입니다. 원본 쪽은 `.DS_Store`를 의도적으로 무시합니다(`computeHashManifest.ts`와 `buildHashes`의 NOISE 목록).
- 원인: `buildPlan.ts`의 `findOrphans`가 잡음 필터 없이 스킬 이름공간을 훑어, `.DS_Store`를 고아로 보고 `requiresForce`를 설정합니다.
- 재현: `injectCli.probe.test.ts`의 테스트 "a Finder .DS_Store inside an installed skill is not an orphan". 실제 종료 코드 2, 기대 0.
- 확신도: 높음.

## 6. 갈라진 설치에서 `--dry-run`이 종료 코드 0이 아닌 2를 반환합니다

- 심각도: 낮음. 문서 불일치입니다.
- 영향받는 공개 API: `--dry-run`을 준 명령.
- 어긋난 계약: `README.md:106`은 "종료 코드: `0` 성공 / 최신 상태 / dry-run"이라고 적고 있고, 오류 문구 자체도 "--dry-run으로 살펴보라"고 안내합니다. 일반 렌더러와 JSON 렌더러 모두 여기서 2를 반환합니다.
- 원인: `renderPlain.ts:121`이 `flags.dryRun`보다 `requiresForce`를 먼저 확인합니다. `renderJSON`도 같습니다.
- 재현: `injectCli.probe.test.ts`의 테스트 "--dry-run on a diverged install exits 0 as the README exit-code table says". 실제 2.
- 확신도: 중간. 의도된 동작일 수 있으며, 그렇다면 고칠 대상은 README입니다.

## 버그가 아니라고 확인한 가설

- 스코프가 있는 패키지 이름과 블록 id 안의 정규식 메타 문자는 글자 그대로 맞춥니다. 다른 패키지의 블록은 고아로 취급되지 않습니다. 끝 줄바꿈이 없거나 본문이 빈 경우도 `blockBodyMatches`가 허용합니다.
- 한 실행 안의 블록 쓰기는 순서대로 처리됩니다. 두 실행이 동시에 경쟁하는 경우는 알려진 한계로 문서화되어 있습니다.
- `skills/..`나 `rules/..`처럼 앞이 `.`인 경로는 `assertNotReserved`가 거부합니다. 1번처럼 중간에 있는 `..`만 빠져나갑니다. 심볼릭 링크는 원본 해시 계산과 고아 탐색 모두에서 `walkFiles`가 건너뜁니다.
