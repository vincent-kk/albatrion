# Round 437 — apply the verifier's amendments to `size-diagnosis-437-results.md` (option A for S1)

Documentation only, in the MAIN worktree `/Users/Vincent/Workspace/albatrion`. Edit exactly one tracked-to-be file: `packages/canard/schema-form/architecture/verification/perf-optimization/size-diagnosis-437-results.md` (untracked; do not stage or commit). Also update two evidence files under `/Users/Vincent/Workspace/albatrion/.seiri/tasks/size-diagnosis-437/`: `verification.json` (the `verdictCounts` field) and `report.md` (the 18행/2행 sentences), and append a line to `report.md` saying the result document was amended after the seal (the seal is left untouched). Touch nothing else. Report in complete formal Korean sentences; owner names only Vincent or Vincent Kelvin.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. No delegation, spawning, terminal/worktree creation or removal, model substitution, no git add/commit/push/stash. If a quoted line number does not match the text described, find the text by content (quote it in the report) and do not guess; if the text cannot be found, stop and ask.

Apply the following in order. Line numbers refer to the current file; re-read the file after each edit because insertions shift later lines. Each quoted replacement is to be used verbatim.

S1 (option A). In the 판정 table (section `## 판정`), the six rows `core/oneOf-5 core-update`, `core/oneOf-10 core-update`, `core/oneOf-20 core-update`, `render/oneOf-5 render-update-wall`, `render/oneOf-10 render-update-wall`, `render/oneOf-20 render-update-wall`: change the 판정 cell to `초선형 몫 있음` and replace the whole third cell with: `첫 정착 단계의 selectNodeSchema·selectChildren→evaluateGate 함수군입니다. 루트 호스트의 모든 휠이 N개 분기 게이트를 모두 다시 평가하여 두 쓰기 합이 24N회이며(src/core/engine/settle/utils/compute/computeNode.ts:152, selectNodeSchema.ts:28, childSelection/selectChildren.ts:170), 바뀐 분기 하나를 단위로 보면 비용이 N에 비례합니다(GOAL-011, 94C-03 (나)). E0 갱신은 N=5~80에서 0.0800~0.0921 ms로 거의 일정하고 E4는 분기 하나당 약 14.8 µs씩 늘어 배율이 15.82까지 커집니다. 갱신 경로에서만 도달하며, 제거 후보는 결정 58의 확인 휠 생략 실험(BLUEPRINT-007 (a) 범위)입니다.` For the three render-update-wall rows prefix that cell with `엔진 몫은 W1U·P2(또는 W2U·P4, W3U·P6)에 대응합니다. ` using the matching W/P ids already in the row. Then in the paragraph after the table that begins `18행은 (나)형 수용 후보로`, replace `18행은` with `마운트 12행(oneOf 마운트 3, render 마운트 wall 3, render profiler-mount 3, flat 마운트 3)은` and append the sentence `갱신 6행은 N 정규화로는 선형이지만 변경 단위(분기 하나)로는 GOAL-011 위반 후보이므로 nested 마운트 2행과 함께 초선형 몫 있음 8행으로 제출합니다.`

S2. In `### nested 청사진의 초선형 몫`: at the end of the paragraph that begins `청사진 비용/N은 4.678→5.498µs로` append: `d6 청사진의 d3 단가 대비 초과분은 약 3.358ms이며 encodeLeaf 증가분은 그 약 20%입니다. 나머지는 buildNodes·appendChildEntries·collectDeclarations·blueprint 자체와 visitShape·validateChildTargets에 흩어져 있고, 뒤의 두 함수는 단위 비용이 단조 증가했지만 노드를 한 번 도는 선형 코드여서 원인을 확정하지 않았습니다. encodeLeaf 표본은 깊이별 61·65·79·113개이므로 d3과 d4의 차이는 표본 잡음 안입니다.` In the next paragraph replace `나머지 선형·변동 몫` with `원인을 확정하지 못한 나머지 몫`. In the 판정 table row `core/nested-d5-f4 core-mount`, replace the second and third sentences of the third cell with: `W13M·P25 및 d6 확장 P27에서 청사진 함수군의 비용/N이 증가합니다. 그 가운데 경로 문자열 처리(encodeLeaf)의 Θ(N log N) 몫으로 확인된 것은 d6에서 약 0.664ms로 청사진 초과분 약 3.358ms의 약 20%이며 마운트에서만 도달합니다. 나머지 증가분의 원인은 확정하지 않았습니다.`

S3. Replace the sentence containing `상대 오차는 0%였습니다` (section `## 단계별 시간 표`) with: `배타 분류는 모든 표본을 한 단계나 기타 중 정확히 한 곳에 넣고 표본 구간이 hrtime 구간을 빈틈없이 덮으므로, 다섯 단계와 기타의 합은 구성상 구간 총시간과 같습니다. 따라서 브리프의 10% 검사는 항상 통과하며 독립적인 교차 검사가 아닙니다.`

S4. After the last paragraph of `## 판과 환경` (before `## 크기 추세 표`), insert a new paragraph: `원래 20행의 M3 수치는 두 판을 한 프로세스에서 번갈아 실행하고 표본마다 강제 GC를 한 뒤 바퀴별 표본 중앙값으로 계산되었고, 폼 레인의 NODE_ENV는 development였습니다. 이 창은 판마다 새 프로세스를 쓰고 표본별 강제 GC를 하지 않았으며 실행별 최소값 중앙값을 대표값으로 썼고 NODE_ENV를 기록하지 않았으므로, 절댓값과 배율을 M3와 직접 비교할 수 없습니다. 이 창에서 원래 배율 상승은 oneOf 갱신에서 재현되었고, oneOf 마운트에서는 3.769·6.543·6.021로 부분적으로만 재현되었으며, flat과 nested(3.507·3.519)에서는 재현되지 않았습니다. nested의 E0 단위 비용도 2.650에서 1.918µs로 함께 감소하였으므로 nested 판정은 배율이 아니라 E4 단위 비용과 구조 계수에 근거합니다.`

S5. After the sentence `판을 교차시켰습니다.` (section `## 판과 환경`) add: `같은 크기 안에서는 42쌍 중 41쌍에서 E0가 먼저 실행되었습니다.`

S6. At the end of the paragraph in `## 단계별 시간 표` that describes profile lengths (the one mentioning 2초 or 2.322초), add: `측정 창 중 13:10:14Z에 tools/profile.mjs의 종료 조건을 CPU 2.4초에서 CPU 2.4초와 경과 2.5초로 바꾸었으며, 그 전에 시작한 flat-2000 갱신 프로파일(P20)은 이전 판으로 만들어졌고 이전 판의 원문은 보존되지 않았습니다.`

S7. Replace `oneOf는 청사진·노드·정착·배달·기타 모두 비용/N이 감소하였습니다.` with `oneOf는 청사진·노드·정착·배달의 비용/N이 감소하였고, 기타는 마운트 N=40→80에서 10.712→11.200µs/N로 소폭 증가하였습니다.`

S8. Replace `requestFieldNodeValidation.ts:35의 큐에서 runFieldNodeValidation을 실행하고, 각 target에 routeValidationIssues를 호출합니다` with `requestFieldNodeValidation.ts:30의 큐가 40행에서 runFieldNodeValidation을 실행하고, 49행에서 각 target에 routeValidationIssues를 호출합니다`.

S9. Replace the first sentence of `### nested 청사진의 초선형 몫` (the one citing `populateNodeChildren.ts:64`) with: `` `populateNodeChildren.ts:64`는 부모 선언의 전체 `schemaPath`에 `/properties/<이름>`을 덧붙여 각 자식의 전체 `schemaPath`를 만듭니다. ``

S10. At the end of hypothesis 2 in `### 수정 가설의 우선순위` add: `같은 스키마를 다시 마운트할 때 이 가설은 첫 가설의 몫을 포함해 제거하지만 첫 마운트에서는 제거량이 0이므로, 첫 마운트에도 적용되는 첫 가설을 앞에 둡니다.` Also in hypothesis 3, replace `이번 N당 분석에서 확정된 초선형 몫의 제거량은 0이며, 실제 대상은 전체 폼 크기에 비례하는 중복 선형 스캔입니다.` with `이 실험이 겨냥하는 것은 S1에서 변경 단위 기준으로 초선형 몫 있음으로 판정한 oneOf 갱신 6행의 N 비례 게이트 평가 가운데 확인 휠 몫(12N/24N)입니다.`

Then: `verification.json` `verdictCounts` → 상수 배(선형) 12, 초선형 몫 있음 8; in `report.md` change the 18행/2행 sentences to 12행/8행 and append `결과 문서는 검증자 지적(S1 A안, S2~S10)에 따라 봉인 뒤에 고쳤다; seal.json의 결과 문서 해시는 수정 전 판이다.`

Final checks (print the results): `grep -c "초선형 몫 있음" <doc>` equals 8 in the table plus occurrences in prose (report the table count separately by grepping lines starting with `| core/` or `| render/`); `grep -c "상수 배(선형)"` table rows equal 12; each of the new sentences is found once by grep. `git status --porcelain` must show the document still untracked and nothing newly modified except the two evidence files (gitignored). Send one `worker_done --outcome succeeded` with the check results, or `failed` naming the step. Check the live mailbox once before worker_done, then idle.
