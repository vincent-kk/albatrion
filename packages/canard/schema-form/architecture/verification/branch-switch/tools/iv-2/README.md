# Ⅳ-2 귀속 도구

Phase A는 시계를 실행하지 않습니다. `attribute.mjs`는 보존된 Ⅳ-0의 파일별 수·details owner·floor와 Ⅳ-2의 위치별 시계 없는 원시만 읽습니다. 위치의 비용은 unattributed이며 owner의 net 시간은 호출 전체 합계입니다. 시간 레인끼리 더하거나 호출 수를 다시 곱하지 않습니다.

```sh
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-2/attribute.mjs --check
```

진단의 생성에는 기존 `tools/iv-0/buildDiagnostics.mjs`를 새 외부 `.noindex` 루트의 diagnostics 디렉터리에 사용합니다. 기본 Node는 저장된 런타임과 맞추고 workspace 의존 dist를 지정 build로 준비합니다. 이어서 기존 진단 CLI의 선택적 세 번째 인수로 두 행만 실행합니다.

```sh
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-0/diagnoseRows.mjs "$IV_ROOT" switch-oneOf-80,switch-siblings-0
```

기존 파일+종류 합계는 유지하며 보조 `allocationSites`와 `deliveryAllocationSites`가 `line:column`을 구별합니다. 과거 창의 원시·입력 해시는 바꾸지 않습니다. 사이트별 중앙값의 합이 항상 전체 중앙값인 것은 아니므로 원시의 쓰기별 수를 먼저 재결합한 뒤 파일·전체 중앙값을 비교합니다.

## Ⅳ-2 단일 창 어댑터

공개 22행의 B9-1 교대 장치와 IV-1의 `judgeStage`, `weightedExchange`, `firstWriteExchange`는 그대로 재사용합니다. IV-1 prepare/window의 scope-builder는 미병합 국소 바퀴 전용이므로 IV-2 어댑터가 필요합니다. IV-2는 root-host 4행과 정적 nested 보호 1행, A/B exit details, 차가운 첫쓰기 세 형상을 추가합니다. worker의 타이밍 루프는 IV-1에서 그대로 가져오고 scoped recorder는 함수로 추출했습니다. 기존 분기 적재 helper의 URL import는 checkJs와 맞도록 `.href`만 명시했습니다.

첫 prepare에서 기존 supplemental 계측기의 `!misfitIndex` 정확 일치가 새 lazy guard를 놓쳐 시간 표본 없이 중단했습니다. `instrumentDetails`는 이전 guard와 `!misfitIndex && context.root.runtime.misfitPaths.size > 0`를 모두 정확히 인식하도록 확장했습니다. 두 경우 본문만 같은 owner로 감싸며 guard와 wrapped 타이밍 레인은 바꾸지 않습니다. 수정 전 실패한 장치 시험과 기존 B9-0 checkTools를 함께 통과했습니다.

코디네이터 답 `msg_0799e247ae05`에 따라 새 폼을 표본마다 시계 밖에서 만들고 A/B의 차가운 첫 실제 쓰기를 예열 0·100표본으로 대칭 측정합니다. 추가항은 형상마다 `max(0, B_cold−A_cold)`이며 기존 firstWriteExchange에 가중치 1로 공급합니다. 파일 이름 `scope-build-cost`와 기존 함수의 scope 관련 metadata는 IV-1 자료 형식을 보존한 이름이며, IV-2의 실제 입력 종류·A/B 값은 별도 필드에 명시합니다. fixture scale은 cache entry 수가 아닙니다.

준비 뒤 순서는 untimed smoke → 실제 CLI 1/1 예행 → 코디네이터 승인 pilot → 별도 승인 formal window입니다. cold 예행은 같은 cold CLI의 예열 0·1표본이며 공식 marker는 만들지 않습니다. 모든 root와 raw 디렉터리는 `.noindex`이며 quiet/CPU/heap/retention 규칙은 공유 장치를 사용합니다.

후보 2부터 승인 `msg_62de4b2d1f33`의 heap-only 탐침을 추가합니다. canonical oneOf-80의 common·kind와 passive 998개로 정적 필드 정확히 1,000개를 만들고, 80값을 각각 선택한 이력과 0/79 두 값만 80회 교대한 이력을 비교합니다. 매 선택 뒤 전체 활성 읽기를 수행합니다. Node/Bun·이력·A/B 조합마다 별도 CLI에서 새 폼 7개를 하나씩 구성하고 GC 전후 상주 증분을 남깁니다. 폼은 after-GC 카운터 뒤의 읽기까지 살아 있으며 표본마다 새 blueprint를 단언합니다. 각 행의 B 중앙값≤A 최댓값을 판정하고, 80버킷−2버킷 증분을 A/B 각각 보고합니다. 시간·가중 교환 기여는 0입니다. 같은 CLI의 `--smoke`는 새 폼 하나의 전체 이력만 검증하고 시계·heap 카운터·GC를 실행하지 않습니다.

```sh
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-2/prepare.mjs --baseline="$IV_BASELINE_PACKAGE" --root="$IV_ROOT" --baseline-commit="$IV_BASELINE_SHA" --candidate-commit="$IV_CANDIDATE_SHA"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-2/checkLoad.mjs "$IV_ROOT"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-2/rehearse.mjs "$IV_ROOT"
# Each following measurement needs its coordinator authorization first.
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-2/pilot.mjs "$IV_ROOT" --authorized "$IV_AGENT_PID"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-2/window.mjs "$IV_ROOT" --authorized --agent-pid="$IV_AGENT_PID"
node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-2/summarize.mjs "$IV_ROOT" "$IV_RAW_OUTPUT"
```
