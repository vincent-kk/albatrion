# 131 react 측정 세션 결과입니다.

세션 종류는 aa이며 실행 상태는 failed입니다. 기존 105C-01 계산과 독립 확인 규칙을 적용합니다.
전체 시간은 2716.602초이며 확인 측정은 0.000초이고 보고 계산은 0.000초입니다.
프로세스 준비 시간의 합은 66.610초이며 예열은 876.488초, 강제 GC는 129.631초, 표본은 1718.200초, digest는 258.780초입니다.
시계 밖 minor GC는 17.576초입니다. 예열·표본 시간은 GC와 digest를 포함하므로 이 시간을 합산하지 않습니다.
관측 digest 다음에 시계 밖 minor GC를 수행하는 경로는 no-GC 열에만 적용합니다. 강제 GC 판정 열의 시계와 digest 순서는 유지합니다.
통계와 판정은 선택한 행 및 자동 추가한 고정 감시 행의 범위에 한정합니다.
축소 행은 266개입니다. 실제 사용한 블록으로 분류하며 축소 행도 같은 회귀 규칙을 적용하고 표시되면 전체 블록으로 확인합니다.
최종 판정 필드는 A/A 기록입니다. 축소 비표시 행은 줄인 검출력에서 관측되지 않음으로 해석합니다.
실행 전 추정은 5007.710초이며 확인 여유는 1251.927초이고 합계는 6259.637초입니다. 예산은 7099.989초이며 적합 여부는 true입니다.
24블록·예열 20회·표본 41회의 조건부 세션 추정은 0.000초입니다. 이 추정은 시간 판정이나 예산 보장이 아닙니다.

| 주요 fixture입니다. | 추정 시간(초)입니다. |
| --- | ---: |

행별 통계와 GC 관측을 함께 기록합니다.

| 행입니다. | 범위입니다. | 블록입니다. | 확인 블록입니다. | 상태입니다. | 기존 통계(ms 또는 횟수)입니다. | 기준/후보 쓰기 GC 비율입니다. | 기준/후보 GC 없는 중앙값입니다. |
| --- | --- | ---: | ---: | --- | ---: | --- | --- |

실패 사유는 b8-g2-base: worker failed: node:fs:3436
      const stats = binding.lstat(base, true, undefined, true /* throwIfNoEntry */);
                            ^

Error: ENOENT: no such file or directory, lstat '/opt/homebrew/bin/node'
    at Object.realpathSync (node:fs:3436:29)
    at file:///Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/tools/measure-react-pair-129.mjs:38:17
    at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
    at async node:internal/modules/esm/loader:650:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:105:5) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'lstat',
  path: '/opt/homebrew/bin/node'
}

Node.js v26.10.0


1 !== 0
입니다.
