# Round 437 — apply the verifier's amendments to `open-rows-437-results.md`

Documentation only, in the MAIN worktree `/Users/Vincent/Workspace/albatrion`. Edit exactly one file: `packages/canard/schema-form/architecture/verification/perf-optimization/open-rows-437-results.md` (untracked; do not stage or commit), and append one line to `/Users/Vincent/Workspace/albatrion/.seiri/tasks/open-rows-437/report.md` saying the result document was amended after the seal (leave `seal.json` untouched). Touch nothing else. Report in complete formal Korean sentences; owner names only Vincent or Vincent Kelvin.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. No delegation, spawning, terminal/worktree creation or removal, model substitution, no git add/commit/push/stash. Line numbers refer to the current 155-line file; find each target by its quoted text and re-read after each edit. If a quoted text cannot be found, stop and ask.

F1. Line 17: replace `Node \`v26.12.0\`` with `Node \`v24.20.0\`(\`/Users/Vincent/.nvm/versions/node/v24.20.0/bin/node\`)`. After line 23 add the sentence: `\`environment.json\`의 \`node\` 값 \`v26.12.0\`은 준비 단계 프로세스의 값이며, 측정 51개 프로세스는 모두 Node \`v24.20.0\`으로 실행되었습니다.` In the 한계 section (after line 149) add: `M3는 Node \`v26.12.0\`, 한 프로세스에서 두 판을 번갈아 적재하는 장치, \`NODE_ENV=development\`로 측정했습니다. 이번 창은 Node \`v24.20.0\`, R3의 판별 단독 적재, \`NODE_ENV\` 미기록 상태이므로 R3-02·R3-08·R3-12와 F5b의 M3 대비 비교에는 런타임 차이가 섞여 있습니다.`

F2. Line 136 (row R3-10 / array-replace-200 update): replace the third cell with: `react-dom과 react의 증가(+4808.59/+5213.57µs)가 가장 컸습니다. 번들 증가는 소스 경계로 나누면 \`src/core\` +630/+591µs, 패키지 React 층 +2527/+3161µs이며 blueprint self는 없고, \`@winglet\` 몫은 −2460/−2732µs입니다. 패키지 React 층 증가의 크기 진단이 필요하며 여전히 (다)입니다.` Then in the paragraph after the table replace `(가) 8행, 여전히 (다)인 6행` with `(가) 7행, 여전히 (다)인 7행` (and any other occurrence of the 8/6 split in the document).

F3. Line 122: replace `431C-02에 따라 \`방향 불안정\`, \`미입증\`을 적용했습니다` with `브리프의 정의에 따라 \`방향 불안정\`으로 표시했습니다. 원장 431C-02는 부호가 다른 경우를 \`동치 범위 안\`으로 정의하고 바이트 동일 사본 A′의 폭을 요구하지만, 이번 창에는 A′가 없어 431C-02 판정 값을 산출하지 않았습니다`. On lines 132 and 139 replace `미입증이며` with `방향 불안정이며`.

F4. Line 76: replace `번들 self 추정치도 501.87→135.78µs로 평탄하지 않았습니다.` with `FP 표는 구간 안 비유휴 표본 618개와 100개에 기대고, 구간 안 표본의 89.0%와 98.7%가 \`(idle)\`이며, 평균 구간 47µs와 28µs가 실제 표본 간격 중앙값 166µs보다 짧으므로, 이 프로파일로는 엔진 share의 평탄 여부를 판정할 수 없습니다.`

F5. At the end of line 90 add: `schema-form의 런타임 의존인 \`@winglet/*\`는 기타에 들어가며, 그 E4−E0 차이는 13행 모두 음수(−10~−3042µs/표본)입니다. 엔진 비용 행은 이 몫을 더해도 양수입니다.`

F6. Line 118: replace `react-dom에서는 \`completeWork\`와 \`validateProperty\` 등 속성 처리 경로가 관측되었습니다` with `react-dom에서는 \`shouldConstruct\`, \`warnUnknownProperties\`, \`mountWorkInProgressHook\`, \`validatePropertiesInDevelopment\`의 증가가 컸으며, 일부는 development 빌드에만 있는 속성 검증입니다`.

F7. Line 127 (row R3-01): append to the third cell: `소스 경계로 나누면 \`src/core\`가 +174/+168µs, 패키지 React 층이 +69/+86µs를 실었습니다.`

Checks (print): `grep -n "v26.12.0\|431C-02에 따라\|completeWork" <doc>` must show only the F1 explanatory sentence; the 판정 table must still have 14 rows with one verdict each; `git status --porcelain` must show the document still untracked and nothing newly modified. Send one `worker_done --outcome succeeded` with the check results or `failed` naming the step. Check the live mailbox once before worker_done, then idle.
