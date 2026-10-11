# Session 136k final React table — stage 07 대 공개판 0.16.0

공식 대상의 pooled 목표 배율 초과는 **18행**(wall·active 각각 9행 / 폼·작업 9종)입니다: sample-0/update, sample-1/update, sample-2/update, sample-3/update, nested-d3-f4/update, array-push-100/update, array-replace-200/update, array-push-remove-100/update, computed-visible-derived/update. 세션 122의 94C-02 회차 규칙으로 판정한 미달은 **12행**(wall·active 각각 6행 / 폼·작업 6종)입니다: sample-1/update, sample-3/update, array-push-100/update, array-replace-200/update, array-push-remove-100/update, computed-visible-derived/update.

pooled 배율이 1.0을 초과했지만 tie로 충족 처리한 6행은 sample-0/update, sample-2/update, nested-d3-f4/update의 wall·active입니다. nested-d5-f4/update도 회차 방향이 섞인 tie이지만 pooled 배율은 1.0 이하입니다. 모든 공식 대상 mount는 ≤1.2×입니다.

oneOf-5·10·20의 mount/update 종단은 기록 행입니다. 세션 122의 참고 임계값으로는 wall·active 합 12행이 모두 미달이지만 85C-01·86C-01의 branchless·expression-only 미달 수에 더하지 않습니다. oneOf의 공식 React 계층 판정은 코어 제외 render+commit 몫 6행이 모두 ≤1.0×로 충족합니다(0.857–0.903×). if/then의 React 수치는 두 절차 모두 제공하지 않습니다.

측정 엔진은 **codex**, tier는 **high**입니다. HEAD는 `aa1433cba6a22898867fda0dd73692aadd1ce875`이며 제품 src tree `80c23cc2d0e389cc5e925b434a2d7a228d8532f0`는 마지막 제품 변경 `daca1d14a`와 같습니다. 이후 HEAD 커밋은 문서 전용입니다. 코어는 측정하지 않았습니다.

D = `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch`

S = `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`

| 환경 | 세션 122 | 세션 136k |
| --- | --- | --- |
| Node | v26.10.0 | v26.11.1 |
| V8 | 14.6.202.34-node.35 | 14.6.202.34-node.37 |
| Node 바이너리 | /opt/homebrew/Cellar/node/26.10.0_2/bin/node | /Users/Vincent/.nvm/versions/node/v26.11.1/bin/node |
| React | 19.2.6 production profiling | 19.2.6 production profiling |
| CPU / 메모리 | Apple M1 Max / 64 GiB | Apple M1 Max / 64 GiB |
| OS | Darwin arm64 | Darwin 25.6.0 arm64 |
| 비교 대상 실행 환경 | 두 판 모두 세션 122 Node | 0.16.0·HEAD 모두 동일 nvm Node v26.11.1 |

단일 background driver는 2026-10-11 13:11:11 KST부터 2026-10-11 14:25:10 KST까지 실행되었으며 wall **4438.862초 / 73.981033분**입니다. 115분 제한 전에 정상 종료했습니다. 유효 worker span은 73.688183분입니다. 별도 층 시도는 2026-10-11 14:26:57 KST부터 2026-10-11 14:26:58 KST까지 0.708초이며 실패했습니다. 드라이버 wall과 층 시도의 합은 73.992833분, 첫 driver 시작부터 층 중단까지의 경과는 75.777250분입니다. 약 95분·3분은 실행 전 추정이며 실측이 아닙니다.

228개 유효 측정 worker / 114 pairs를 순차 실행했습니다. 모든 worker는 exit 0·signal null이며, 가장 긴 worker 본문은 117.419935초입니다. 예열을 포함한 532,884개 쓰기에서 failedWrites는 0입니다. 측정 중 다른 무거운 작업·yarn exec·설치·Git 쓰기·제품 변경을 하지 않았습니다. poll은 각각 sleep 55초 후 진행 한 줄을 출력했습니다.

원절차는 [세션 122:41](profile-122-session.md:41)–43, 커밋 단언은 [:50](profile-122-session.md:50)–60, 환경은 [:5](profile-122-session.md:5)입니다. --prepare는 committed HEAD blob에서 비계측 제품 bundle을 S에 만들고 react-dom/profiling을 연결했습니다. 19 fixture, validation OFF, warmup 20, 회차당 samples 101, 두 판 × 3회차 × 두 lane이며 버전 순서는 구→HEAD / HEAD→구 / 구→HEAD입니다. 각 fixture·판·회차·lane은 새 worker입니다.

immediate update wall은 flushSync 쓰기부터 setImmediate 4회까지이며 active는 같은 구간의 eventLoopUtilization delta active입니다. mount는 mountEquivalentForm의 handle-ready drainUntilReady·drainTicks 종료점과 같은 구간의 active를 유지합니다. record의 drainTicks(2) wall은 별도 새 worker의 기록 열입니다. 판별값·DOM data-path 동등성과 쓰기별 커밋 보정을 모든 회차에서 확인했습니다. 강제 GC는 시계 밖입니다.

각 판의 303표본을 합친 nearest-rank median·p99를 사용하며 ratio = HEAD median / 0.16.0 median입니다. branchless·expression-only mount 목표는 ≤1.2×입니다. update는 ≤1.0×이고 원절차 94C-02대로 세 회차 ratio가 모두 1.0 초과일 때만 미달이며 혼합은 tie로 충족 처리합니다. pooled 목표 배율 초과와 이 회차 판정을 따로 기록했습니다.

공개판 alias는 stage-07의 `node_modules/@canard/schema-form_0.16.0/dist/index.cjs`를 사용했습니다. CJS SHA-256은 `19b9be1d81803928ead079d7ef225c61dc71ba8fdb1cf3f19d8926ebd28c44e2`, ESM SHA-256은 `78362ee2e5b7c0bdca5f9b80f7490c32a54ea344565e97c2b4088080a3c861b2`이며 228개 raw environment와 일치합니다. [공개판 근거](profile-136k-final/published-016.json)에 경로를 기록했습니다.

## 공식 wall 표

| 폼/작업 | 0.16.0 median ms | HEAD median ms | 배율 | 0.16.0 p99 ms | HEAD p99 ms | 회차 1 / 2 / 3 배율 | 목표 | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| sample-0/mount | 3.870000 | 3.991708 | 1.0314 | 4.191250 | 4.370000 | 1.0354 / 1.0329 / 1.0260 | ≤1.2× | 충족합니다. |
| sample-0/update | 0.385333 | 0.401000 | 1.0407 | 0.616125 | 0.547083 | 0.9847 / 1.0639 / 1.0213 | ≤1.0× | 동률로 충족합니다. |
| sample-1/mount | 4.792792 | 5.022000 | 1.0478 | 5.169709 | 5.392083 | 1.0558 / 1.0456 / 1.0424 | ≤1.2× | 충족합니다. |
| sample-1/update | 0.404417 | 0.453958 | 1.1225 | 0.573541 | 0.622041 | 1.1630 / 1.1459 / 1.0523 | ≤1.0× | 미달입니다. |
| sample-2/mount | 4.571000 | 4.804709 | 1.0511 | 4.910875 | 5.071583 | 1.0593 / 1.0409 / 1.0558 | ≤1.2× | 충족합니다. |
| sample-2/update | 0.423875 | 0.427250 | 1.0080 | 0.649625 | 0.625667 | 1.0076 / 1.0109 / 0.9839 | ≤1.0× | 동률로 충족합니다. |
| sample-3/mount | 9.098083 | 10.003458 | 1.0995 | 10.749583 | 11.231458 | 1.1144 / 1.1146 / 1.0788 | ≤1.2× | 충족합니다. |
| sample-3/update | 0.408916 | 0.431958 | 1.0563 | 0.626666 | 0.641292 | 1.0791 / 1.0329 / 1.0443 | ≤1.0× | 미달입니다. |
| flat-50/mount | 8.266833 | 9.351625 | 1.1312 | 9.910125 | 10.296125 | 1.1401 / 1.1130 / 1.1377 | ≤1.2× | 충족합니다. |
| flat-50/update | 2.399917 | 2.132457 | 0.8886 | 3.094084 | 2.859540 | 0.8877 / 0.8672 / 0.9059 | ≤1.0× | 충족합니다. |
| flat-100/mount | 14.268875 | 15.577625 | 1.0917 | 15.518917 | 16.854667 | 1.0820 / 1.0864 / 1.1016 | ≤1.2× | 충족합니다. |
| flat-100/update | 2.784835 | 2.332249 | 0.8375 | 3.379872 | 2.753082 | 0.8318 / 0.8271 / 0.8417 | ≤1.0× | 충족합니다. |
| flat-500/mount | 67.767666 | 66.800000 | 0.9857 | 72.835958 | 74.613083 | 0.9847 / 0.9660 / 0.9949 | ≤1.2× | 충족합니다. |
| flat-500/update | 10.374291 | 6.339209 | 0.6110 | 12.131251 | 7.854625 | 0.6145 / 0.5998 / 0.6146 | ≤1.0× | 충족합니다. |
| nested-d3-f4/mount | 12.168750 | 13.137417 | 1.0796 | 13.570708 | 14.545458 | 1.0806 / 1.0893 / 1.0764 | ≤1.2× | 충족합니다. |
| nested-d3-f4/update | 2.555832 | 2.594377 | 1.0151 | 3.141457 | 3.127333 | 1.0235 / 1.0206 / 0.9977 | ≤1.0× | 동률로 충족합니다. |
| nested-d5-f4/mount | 193.693042 | 183.466292 | 0.9472 | 204.049333 | 194.554459 | 0.9481 / 0.9443 / 0.9502 | ≤1.2× | 충족합니다. |
| nested-d5-f4/update | 3.414708 | 3.403501 | 0.9967 | 3.988416 | 4.304417 | 1.0024 / 0.9959 / 0.9953 | ≤1.0× | 동률로 충족합니다. |
| array-100/mount | 63.332709 | 60.260834 | 0.9515 | 68.864167 | 66.201917 | 0.9590 / 0.9240 / 0.9591 | ≤1.2× | 충족합니다. |
| array-100/update | 1.135084 | 0.712750 | 0.6279 | 1.329083 | 0.874917 | 0.6309 / 0.6262 / 0.6326 | ≤1.0× | 충족합니다. |
| array-500/mount | 326.222291 | 290.976583 | 0.8920 | 339.908875 | 308.391750 | 0.8841 / 0.8684 / 0.9148 | ≤1.2× | 충족합니다. |
| array-500/update | 3.898875 | 3.502000 | 0.8982 | 4.368542 | 4.263208 | 0.9148 / 0.3321 / 0.9148 | ≤1.0× | 충족합니다. |
| array-1000/mount | 667.286583 | 568.780708 | 0.8524 | 688.663958 | 618.673125 | 0.8666 / 0.8497 / 0.8453 | ≤1.2× | 충족합니다. |
| array-1000/update | 7.402541 | 1.646375 | 0.2224 | 8.474167 | 5.929042 | 0.2220 / 0.2196 / 0.2268 | ≤1.0× | 충족합니다. |
| array-push-100/mount | 3.888750 | 3.972041 | 1.0214 | 4.082958 | 4.142083 | 1.0177 / 1.0219 / 1.0246 | ≤1.2× | 충족합니다. |
| array-push-100/update | 84.888170 | 91.837088 | 1.0819 | 93.560671 | 103.719376 | 1.0616 / 1.1007 / 1.1009 | ≤1.0× | 미달입니다. |
| array-replace-200/mount | 4.028708 | 4.189000 | 1.0398 | 4.185541 | 4.350541 | 1.0364 / 1.0424 / 1.0408 | ≤1.2× | 충족합니다. |
| array-replace-200/update | 106.484833 | 113.781459 | 1.0685 | 114.557041 | 119.517500 | 1.0427 / 1.0776 / 1.0809 | ≤1.0× | 미달입니다. |
| array-push-remove-100/mount | 3.755250 | 3.848750 | 1.0249 | 3.901791 | 4.132208 | 1.0238 / 1.0209 / 1.0252 | ≤1.2× | 충족합니다. |
| array-push-remove-100/update | 122.520421 | 130.759743 | 1.0672 | 134.351551 | 142.729168 | 1.0843 / 1.0385 / 1.0822 | ≤1.0× | 미달입니다. |
| computed-visible-derived/mount | 4.121666 | 4.433375 | 1.0756 | 4.576250 | 4.719375 | 1.0719 / 1.4209 / 1.0535 | ≤1.2× | 충족합니다. |
| computed-visible-derived/update | 1.075207 | 1.361833 | 1.2666 | 1.567792 | 1.776167 | 1.2840 / 1.2577 / 1.2600 | ≤1.0× | 미달입니다. |
| oneOf-5/mount | 3.307875 | 5.011583 | 1.5150 | 4.578834 | 5.387917 | 1.5086 / 1.5140 / 1.5176 | 종단 기록; 122 참고 ≤1.2× | 종단 기록; 122 참고 미달; 층 충족 |
| oneOf-5/update | 2.028042 | 2.359500 | 1.1634 | 2.605334 | 3.152959 | 1.1856 / 1.0967 / 1.2062 | 종단 기록; 122 참고 ≤1.0× | 종단 기록; 122 참고 미달; 층 충족 |
| oneOf-10/mount | 3.401084 | 5.274583 | 1.5509 | 4.733292 | 5.573084 | 1.5444 / 1.5521 / 1.5649 | 종단 기록; 122 참고 ≤1.2× | 종단 기록; 122 참고 미달; 층 충족 |
| oneOf-10/update | 1.997292 | 2.462833 | 1.2331 | 2.547417 | 3.071209 | 1.1997 / 1.1872 / 1.3464 | 종단 기록; 122 참고 ≤1.0× | 종단 기록; 122 참고 미달; 층 충족 |
| oneOf-20/mount | 3.450959 | 5.839292 | 1.6921 | 4.785083 | 6.090791 | 1.6838 / 1.6998 / 1.6877 | 종단 기록; 122 참고 ≤1.2× | 종단 기록; 122 참고 미달; 층 충족 |
| oneOf-20/update | 2.017792 | 2.647708 | 1.3122 | 2.535458 | 3.220583 | 1.2380 / 1.2928 / 1.4139 | 종단 기록; 122 참고 ≤1.0× | 종단 기록; 122 참고 미달; 층 충족 |

## 공식 event-loop active 표

| 폼/작업 | 0.16.0 median ms | HEAD median ms | 배율 | 0.16.0 p99 ms | HEAD p99 ms | 회차 1 / 2 / 3 배율 | 목표 | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| sample-0/mount | 1.376208 | 1.488958 | 1.0819 | 1.684209 | 1.841750 | 1.0883 / 1.0841 / 1.0785 | ≤1.2× | 충족합니다. |
| sample-0/update | 0.389042 | 0.402166 | 1.0337 | 0.617625 | 0.548792 | 0.9848 / 1.0634 / 1.0210 | ≤1.0× | 동률로 충족합니다. |
| sample-1/mount | 2.386167 | 2.528459 | 1.0596 | 2.695167 | 2.882791 | 1.0647 / 1.0665 / 1.0340 | ≤1.2× | 충족합니다. |
| sample-1/update | 0.405584 | 0.455042 | 1.1219 | 0.574708 | 0.628292 | 1.1624 / 1.1413 / 1.0517 | ≤1.0× | 미달입니다. |
| sample-2/mount | 2.119293 | 2.302832 | 1.0866 | 2.402083 | 2.572000 | 1.0997 / 1.0808 / 1.0812 | ≤1.2× | 충족합니다. |
| sample-2/update | 0.426250 | 0.428583 | 1.0055 | 0.650792 | 0.629500 | 1.0074 / 1.0108 / 0.9848 | ≤1.0× | 동률로 충족합니다. |
| sample-3/mount | 7.672209 | 7.542501 | 0.9831 | 8.487792 | 8.823458 | 0.9927 / 0.9926 / 0.9553 | ≤1.2× | 충족합니다. |
| sample-3/update | 0.410292 | 0.433166 | 1.0558 | 0.628625 | 0.643875 | 1.0727 / 1.0333 / 1.0452 | ≤1.0× | 미달입니다. |
| flat-50/mount | 6.876750 | 6.881917 | 1.0008 | 7.715625 | 7.752375 | 1.0084 / 0.9889 / 0.9981 | ≤1.2× | 충족합니다. |
| flat-50/update | 2.403377 | 2.136625 | 0.8890 | 3.100040 | 2.864919 | 0.8884 / 0.8680 / 0.9062 | ≤1.0× | 충족합니다. |
| flat-100/mount | 13.033917 | 13.080000 | 1.0035 | 14.484625 | 14.386876 | 0.9942 / 0.9983 / 1.0122 | ≤1.2× | 충족합니다. |
| flat-100/update | 2.788917 | 2.337291 | 0.8381 | 3.388582 | 2.757625 | 0.8322 / 0.8277 / 0.8420 | ≤1.0× | 충족합니다. |
| flat-500/mount | 66.589709 | 64.481249 | 0.9683 | 72.258958 | 72.109042 | 0.9657 / 0.9497 / 0.9752 | ≤1.2× | 충족합니다. |
| flat-500/update | 10.384668 | 6.345042 | 0.6110 | 12.137832 | 7.861834 | 0.6147 / 0.5998 / 0.6151 | ≤1.0× | 충족합니다. |
| nested-d3-f4/mount | 10.925416 | 10.675458 | 0.9771 | 12.315542 | 12.036374 | 0.9829 / 0.9852 / 0.9712 | ≤1.2× | 충족합니다. |
| nested-d3-f4/update | 2.560250 | 2.598708 | 1.0150 | 3.146792 | 3.132583 | 1.0228 / 1.0209 / 0.9978 | ≤1.0× | 동률로 충족합니다. |
| nested-d5-f4/mount | 193.481208 | 182.269166 | 0.9421 | 204.053959 | 193.297458 | 0.9417 / 0.9384 / 0.9470 | ≤1.2× | 충족합니다. |
| nested-d5-f4/update | 3.418876 | 3.407832 | 0.9968 | 3.993250 | 4.310874 | 1.0022 / 0.9958 / 0.9954 | ≤1.0× | 동률로 충족합니다. |
| array-100/mount | 62.303625 | 57.897291 | 0.9293 | 67.613917 | 63.686833 | 0.9410 / 0.9010 / 0.9356 | ≤1.2× | 충족합니다. |
| array-100/update | 1.138000 | 0.715209 | 0.6285 | 1.332458 | 0.877791 | 0.6314 / 0.6269 / 0.6329 | ≤1.0× | 충족합니다. |
| array-500/mount | 325.457583 | 289.810584 | 0.8905 | 338.892458 | 307.142167 | 0.8817 / 0.8669 / 0.9127 | ≤1.2× | 충족합니다. |
| array-500/update | 3.904875 | 3.507083 | 0.8981 | 4.374583 | 4.267750 | 0.9147 / 0.3330 / 0.9157 | ≤1.0× | 충족합니다. |
| array-1000/mount | 666.956833 | 566.468375 | 0.8493 | 688.671583 | 616.172791 | 0.8636 / 0.8466 / 0.8420 | ≤1.2× | 충족합니다. |
| array-1000/update | 7.408083 | 1.651000 | 0.2229 | 8.479875 | 5.934000 | 0.2225 / 0.2199 / 0.2273 | ≤1.0× | 충족합니다. |
| array-push-100/mount | 1.378499 | 1.459959 | 1.0591 | 1.569375 | 1.621959 | 1.0518 / 1.0635 / 1.0633 | ≤1.2× | 충족합니다. |
| array-push-100/update | 84.928706 | 91.888543 | 1.0819 | 93.627210 | 103.790207 | 1.0616 / 1.1007 / 1.1009 | ≤1.0× | 미달입니다. |
| array-replace-200/mount | 1.514208 | 1.666501 | 1.1006 | 1.658958 | 1.831958 | 1.0930 / 1.1111 / 1.1042 | ≤1.2× | 충족합니다. |
| array-replace-200/update | 106.489375 | 113.786000 | 1.0685 | 114.562625 | 119.521417 | 1.0427 / 1.0776 / 1.0809 | ≤1.0× | 미달입니다. |
| array-push-remove-100/mount | 1.254417 | 1.343749 | 1.0712 | 1.445583 | 1.576042 | 1.0742 / 1.0640 / 1.0710 | ≤1.2× | 충족합니다. |
| array-push-remove-100/update | 122.595790 | 130.823046 | 1.0671 | 134.449879 | 142.823585 | 1.0842 / 1.0384 / 1.0822 | ≤1.0× | 미달입니다. |
| computed-visible-derived/mount | 1.727209 | 1.927791 | 1.1161 | 2.064167 | 2.203667 | 1.1384 / 1.1344 / 1.0877 | ≤1.2× | 충족합니다. |
| computed-visible-derived/update | 1.077625 | 1.364791 | 1.2665 | 1.574333 | 1.780709 | 1.2846 / 1.2555 / 1.2648 | ≤1.0× | 미달입니다. |
| oneOf-5/mount | 2.037708 | 2.508709 | 1.2311 | 2.448500 | 2.864917 | 1.2261 / 1.2309 / 1.2370 | 종단 기록; 122 참고 ≤1.2× | 종단 기록; 122 참고 미달; 층 충족 |
| oneOf-5/update | 2.029292 | 2.362708 | 1.1643 | 2.607167 | 3.156083 | 1.1849 / 1.0972 / 1.2053 | 종단 기록; 122 참고 ≤1.0× | 종단 기록; 122 참고 미달; 층 충족 |
| oneOf-10/mount | 2.129500 | 2.778917 | 1.3050 | 2.477333 | 3.020875 | 1.2901 / 1.2934 / 1.3376 | 종단 기록; 122 참고 ≤1.2× | 종단 기록; 122 참고 미달; 층 충족 |
| oneOf-10/update | 1.999500 | 2.465458 | 1.2330 | 2.549917 | 3.075666 | 1.1996 / 1.1868 / 1.3461 | 종단 기록; 122 참고 ≤1.0× | 종단 기록; 122 참고 미달; 층 충족 |
| oneOf-20/mount | 2.190708 | 3.338042 | 1.5237 | 2.581833 | 3.595542 | 1.5172 / 1.5356 / 1.5213 | 종단 기록; 122 참고 ≤1.2× | 종단 기록; 122 참고 미달; 층 충족 |
| oneOf-20/update | 2.020375 | 2.649583 | 1.3114 | 2.539000 | 3.222708 | 1.2377 / 1.2922 / 1.4135 | 종단 기록; 122 참고 ≤1.0× | 종단 기록; 122 참고 미달; 층 충족 |

if/then mount/update wall·active: not provided by this procedure.

## 목표 배율 초과와 회차 판정

| 폼/작업/지표 | pooled 배율 | 목표 | 회차 1 / 2 / 3 배율 | 원절차 판정 |
| --- | --- | --- | --- | --- |
| sample-0/update/wall | 1.0407 | ≤1.0× | 0.9847 / 1.0639 / 1.0213 | 동률로 충족합니다. |
| sample-0/update/active | 1.0337 | ≤1.0× | 0.9848 / 1.0634 / 1.0210 | 동률로 충족합니다. |
| sample-1/update/wall | 1.1225 | ≤1.0× | 1.1630 / 1.1459 / 1.0523 | 미달입니다. |
| sample-1/update/active | 1.1219 | ≤1.0× | 1.1624 / 1.1413 / 1.0517 | 미달입니다. |
| sample-2/update/wall | 1.0080 | ≤1.0× | 1.0076 / 1.0109 / 0.9839 | 동률로 충족합니다. |
| sample-2/update/active | 1.0055 | ≤1.0× | 1.0074 / 1.0108 / 0.9848 | 동률로 충족합니다. |
| sample-3/update/wall | 1.0563 | ≤1.0× | 1.0791 / 1.0329 / 1.0443 | 미달입니다. |
| sample-3/update/active | 1.0558 | ≤1.0× | 1.0727 / 1.0333 / 1.0452 | 미달입니다. |
| nested-d3-f4/update/wall | 1.0151 | ≤1.0× | 1.0235 / 1.0206 / 0.9977 | 동률로 충족합니다. |
| nested-d3-f4/update/active | 1.0150 | ≤1.0× | 1.0228 / 1.0209 / 0.9978 | 동률로 충족합니다. |
| array-push-100/update/wall | 1.0819 | ≤1.0× | 1.0616 / 1.1007 / 1.1009 | 미달입니다. |
| array-push-100/update/active | 1.0819 | ≤1.0× | 1.0616 / 1.1007 / 1.1009 | 미달입니다. |
| array-replace-200/update/wall | 1.0685 | ≤1.0× | 1.0427 / 1.0776 / 1.0809 | 미달입니다. |
| array-replace-200/update/active | 1.0685 | ≤1.0× | 1.0427 / 1.0776 / 1.0809 | 미달입니다. |
| array-push-remove-100/update/wall | 1.0672 | ≤1.0× | 1.0843 / 1.0385 / 1.0822 | 미달입니다. |
| array-push-remove-100/update/active | 1.0671 | ≤1.0× | 1.0842 / 1.0384 / 1.0822 | 미달입니다. |
| computed-visible-derived/update/wall | 1.2666 | ≤1.0× | 1.2840 / 1.2577 / 1.2600 | 미달입니다. |
| computed-visible-derived/update/active | 1.2665 | ≤1.0× | 1.2846 / 1.2555 / 1.2648 | 미달입니다. |

| 범위 | pooled 목표 배율 초과 | 원절차 미달 | 이름 |
| --- | --- | --- | --- |
| branchless·expression-only wall | 9 | 6 | sample-1/update, sample-3/update, array-push-100/update, array-replace-200/update, array-push-remove-100/update, computed-visible-derived/update |
| branchless·expression-only active | 9 | 6 | sample-1/update, sample-3/update, array-push-100/update, array-replace-200/update, array-push-remove-100/update, computed-visible-derived/update |
| oneOf 종단 기록 wall·active | 122 참고 임계값 초과 12 | 공식 층 판정 6행 모두 충족 | oneOf-5·10·20 / mount·update |

## 기존 wall 기록

별도 record lane입니다. 공식 임계값과 별도로 기록하며 독립 목표·판정·소유자 판단은 not provided by this procedure.

| 폼/작업 | 0.16.0 median ms | HEAD median ms | 배율 | 0.16.0 p99 ms | HEAD p99 ms | 목표·판정 |
| --- | --- | --- | --- | --- | --- | --- |
| sample-0/mount | 3.860417 | 3.977292 | 1.0303 | 4.113125 | 4.289292 | not provided by this procedure |
| sample-0/update | 2.892459 | 2.903041 | 1.0037 | 3.093250 | 3.089083 | not provided by this procedure |
| sample-1/mount | 4.707167 | 5.010292 | 1.0644 | 5.268542 | 5.350666 | not provided by this procedure |
| sample-1/update | 2.852042 | 2.968875 | 1.0410 | 3.132959 | 3.138709 | not provided by this procedure |
| sample-2/mount | 4.634916 | 4.817125 | 1.0393 | 4.903416 | 5.139542 | not provided by this procedure |
| sample-2/update | 2.918709 | 2.945625 | 1.0092 | 3.155167 | 3.154291 | not provided by this procedure |
| sample-3/mount | 9.019041 | 10.036125 | 1.1128 | 10.571917 | 10.819792 | not provided by this procedure |
| sample-3/update | 2.920625 | 2.951583 | 1.0106 | 3.132375 | 3.221792 | not provided by this procedure |
| flat-50/mount | 8.294250 | 9.581625 | 1.1552 | 9.791583 | 10.617167 | not provided by this procedure |
| flat-50/update | 25.207581 | 27.225583 | 1.0801 | 27.745623 | 28.306376 | not provided by this procedure |
| flat-100/mount | 14.362791 | 15.449542 | 1.0757 | 15.338291 | 16.775083 | not provided by this procedure |
| flat-100/update | 25.357208 | 27.382168 | 1.0799 | 28.168290 | 28.522000 | not provided by this procedure |
| flat-500/mount | 67.465459 | 67.692375 | 1.0034 | 72.309208 | 75.839083 | not provided by this procedure |
| flat-500/update | 25.655959 | 30.174208 | 1.1761 | 28.404498 | 32.037292 | not provided by this procedure |
| nested-d3-f4/mount | 12.617125 | 13.163125 | 1.0433 | 14.028792 | 14.476333 | not provided by this procedure |
| nested-d3-f4/update | 25.288622 | 27.643125 | 1.0931 | 27.904084 | 28.788708 | not provided by this procedure |
| nested-d5-f4/mount | 195.811959 | 184.610916 | 0.9428 | 208.970791 | 196.667583 | not provided by this procedure |
| nested-d5-f4/update | 26.100292 | 28.525251 | 1.0929 | 28.441625 | 29.786039 | not provided by this procedure |
| array-100/mount | 62.963417 | 59.806083 | 0.9499 | 68.252958 | 64.773375 | not provided by this procedure |
| array-100/update | 2.404916 | 3.246500 | 1.3499 | 3.717042 | 3.398166 | not provided by this procedure |
| array-500/mount | 322.485083 | 290.353000 | 0.9004 | 338.309542 | 304.250000 | not provided by this procedure |
| array-500/update | 5.132166 | 4.796250 | 0.9345 | 5.997292 | 5.604958 | not provided by this procedure |
| array-1000/mount | 662.508166 | 566.662125 | 0.8553 | 686.568209 | 645.687875 | not provided by this procedure |
| array-1000/update | 8.611292 | 4.172958 | 0.4846 | 9.524041 | 47.172416 | not provided by this procedure |
| array-push-100/mount | 3.932542 | 4.163292 | 1.0587 | 4.230958 | 4.540875 | not provided by this procedure |
| array-push-100/update | 244.960125 | 422.117330 | 1.7232 | 269.229796 | 504.460585 | not provided by this procedure |
| array-replace-200/mount | 4.035500 | 4.193875 | 1.0392 | 4.178208 | 4.347292 | not provided by this procedure |
| array-replace-200/update | 106.874000 | 116.002416 | 1.0854 | 113.323041 | 120.992708 | not provided by this procedure |
| array-push-remove-100/mount | 4.086958 | 4.275750 | 1.0462 | 5.164167 | 5.440125 | not provided by this procedure |
| array-push-remove-100/update | 583.081294 | 877.294755 | 1.5046 | 702.370006 | 1080.754757 | not provided by this procedure |
| computed-visible-derived/mount | 3.103250 | 4.465542 | 1.4390 | 4.441041 | 4.813583 | not provided by this procedure |
| computed-visible-derived/update | 8.494959 | 8.932749 | 1.0515 | 8.937500 | 9.329333 | not provided by this procedure |
| oneOf-5/mount | 3.288334 | 5.032875 | 1.5305 | 4.681791 | 5.359625 | not provided by this procedure |
| oneOf-5/update | 4.611042 | 7.464375 | 1.6188 | 5.989791 | 8.100708 | not provided by this procedure |
| oneOf-10/mount | 3.378333 | 5.277708 | 1.5622 | 4.730500 | 5.549916 | not provided by this procedure |
| oneOf-10/update | 4.621291 | 7.503792 | 1.6237 | 5.980417 | 8.002834 | not provided by this procedure |
| oneOf-20/mount | 3.455792 | 5.830792 | 1.6873 | 4.843834 | 6.107333 | not provided by this procedure |
| oneOf-20/update | 4.646084 | 7.664042 | 1.6496 | 5.981917 | 8.370583 | not provided by this procedure |

## Profiler와 commit 기록

Profiler는 작업별 actualDuration 합(ms), commit은 callback 횟수입니다. React 코어 제외 render+commit이나 commit 시간으로 해석하지 않습니다. 각각 303표본입니다. 목표·소유자 판단은 not provided by this procedure.

| 폼/지표 | 0.16.0 median / p99 | HEAD median / p99 | 배율 | 목표·판정 |
| --- | --- | --- | --- | --- |
| sample-0/profiler-mount | 0.959298 / 1.177918 | 1.061494 / 1.361447 | 1.1065 | not provided by this procedure |
| sample-0/profiler-update | 0.113747 / 0.194958 | 0.110668 / 0.174413 | 0.9729 | not provided by this procedure |
| sample-0/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| sample-0/commits-update | 2.000000 / 2.000000 | 1.000000 / 1.000000 | 0.5000 | not provided by this procedure |
| sample-1/profiler-mount | 1.843154 / 2.110623 | 1.951592 / 2.280555 | 1.0588 | not provided by this procedure |
| sample-1/profiler-update | 0.125249 / 0.190913 | 0.128925 / 0.205585 | 1.0293 | not provided by this procedure |
| sample-1/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| sample-1/commits-update | 2.000000 / 2.000000 | 1.000000 / 1.000000 | 0.5000 | not provided by this procedure |
| sample-2/profiler-mount | 1.592374 / 1.803955 | 1.818668 / 2.022876 | 1.1421 | not provided by this procedure |
| sample-2/profiler-update | 0.122160 / 0.207875 | 0.117463 / 0.209668 | 0.9616 | not provided by this procedure |
| sample-2/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| sample-2/commits-update | 2.000000 / 2.000000 | 1.000000 / 1.000000 | 0.5000 | not provided by this procedure |
| sample-3/profiler-mount | 6.176460 / 6.874047 | 6.269851 / 7.320827 | 1.0151 | not provided by this procedure |
| sample-3/profiler-update | 0.121445 / 0.193666 | 0.117374 / 0.208414 | 0.9665 | not provided by this procedure |
| sample-3/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| sample-3/commits-update | 2.000000 / 2.000000 | 1.000000 / 1.000000 | 0.5000 | not provided by this procedure |
| flat-50/profiler-mount | 5.588320 / 6.206058 | 5.817298 / 6.566760 | 1.0410 | not provided by this procedure |
| flat-50/profiler-update | 0.659351 / 0.892385 | 0.634857 / 0.887170 | 0.9629 | not provided by this procedure |
| flat-50/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| flat-50/commits-update | 20.000000 / 20.000000 | 10.000000 / 10.000000 | 0.5000 | not provided by this procedure |
| flat-100/profiler-mount | 10.629556 / 11.933139 | 11.109314 / 12.251441 | 1.0451 | not provided by this procedure |
| flat-100/profiler-update | 0.716748 / 0.876659 | 0.696076 / 0.865317 | 0.9712 | not provided by this procedure |
| flat-100/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| flat-100/commits-update | 20.000000 / 20.000000 | 10.000000 / 10.000000 | 0.5000 | not provided by this procedure |
| flat-500/profiler-mount | 53.439434 / 58.443258 | 54.637008 / 60.718172 | 1.0224 | not provided by this procedure |
| flat-500/profiler-update | 1.436214 / 1.806976 | 1.313167 / 1.782687 | 0.9143 | not provided by this procedure |
| flat-500/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| flat-500/commits-update | 20.000000 / 20.000000 | 10.000000 / 10.000000 | 0.5000 | not provided by this procedure |
| nested-d3-f4/profiler-mount | 8.601353 / 9.747876 | 8.840017 / 9.975080 | 1.0277 | not provided by this procedure |
| nested-d3-f4/profiler-update | 0.833266 / 1.051929 | 0.893912 / 1.087759 | 1.0728 | not provided by this procedure |
| nested-d3-f4/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| nested-d3-f4/commits-update | 20.000000 / 20.000000 | 10.000000 / 10.000000 | 0.5000 | not provided by this procedure |
| nested-d5-f4/profiler-mount | 134.222281 / 141.649466 | 140.010331 / 149.020469 | 1.0431 | not provided by this procedure |
| nested-d5-f4/profiler-update | 1.162185 / 1.346474 | 1.286131 / 1.563004 | 1.1066 | not provided by this procedure |
| nested-d5-f4/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| nested-d5-f4/commits-update | 20.000000 / 20.000000 | 10.000000 / 10.000000 | 0.5000 | not provided by this procedure |
| array-100/profiler-mount | 46.653390 / 51.246765 | 44.568574 / 48.575466 | 0.9553 | not provided by this procedure |
| array-100/profiler-update | 0.368173 / 0.438262 | 0.218424 / 0.286573 | 0.5933 | not provided by this procedure |
| array-100/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| array-100/commits-update | 2.000000 / 2.000000 | 1.000000 / 1.000000 | 0.5000 | not provided by this procedure |
| array-500/profiler-mount | 238.358279 / 250.105602 | 223.643631 / 238.054390 | 0.9383 | not provided by this procedure |
| array-500/profiler-update | 1.508919 / 1.705090 | 0.400970 / 0.477911 | 0.2657 | not provided by this procedure |
| array-500/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| array-500/commits-update | 2.000000 / 2.000000 | 1.000000 / 1.000000 | 0.5000 | not provided by this procedure |
| array-1000/profiler-mount | 475.770166 / 494.357933 | 437.365540 / 451.154985 | 0.9193 | not provided by this procedure |
| array-1000/profiler-update | 2.953685 / 3.175969 | 0.646629 / 0.803519 | 0.2189 | not provided by this procedure |
| array-1000/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| array-1000/commits-update | 2.000000 / 2.000000 | 1.000000 / 1.000000 | 0.5000 | not provided by this procedure |
| array-push-100/profiler-mount | 0.957581 / 1.073676 | 1.053080 / 1.144097 | 1.0997 | not provided by this procedure |
| array-push-100/profiler-update | 50.312850 / 55.801744 | 49.580340 / 55.030653 | 0.9854 | not provided by this procedure |
| array-push-100/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| array-push-100/commits-update | 200.000000 / 200.000000 | 100.000000 / 100.000000 | 0.5000 | not provided by this procedure |
| array-replace-200/profiler-mount | 1.009752 / 1.108913 | 1.137912 / 1.252826 | 1.1269 | not provided by this procedure |
| array-replace-200/profiler-update | 82.803593 / 89.884816 | 85.815542 / 90.994041 | 1.0364 | not provided by this procedure |
| array-replace-200/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| array-replace-200/commits-update | 1.000000 / 1.000000 | 1.000000 / 1.000000 | 1.0000 | not provided by this procedure |
| array-push-remove-100/profiler-mount | 0.867667 / 0.975119 | 0.954583 / 1.103002 | 1.1002 | not provided by this procedure |
| array-push-remove-100/profiler-update | 59.975205 / 65.719131 | 56.168719 / 62.745007 | 0.9365 | not provided by this procedure |
| array-push-remove-100/commits-mount | 2.000000 / 2.000000 | 2.000000 / 2.000000 | 1.0000 | not provided by this procedure |
| array-push-remove-100/commits-update | 400.000000 / 400.000000 | 200.000000 / 200.000000 | 0.5000 | not provided by this procedure |
| computed-visible-derived/profiler-mount | 1.196168 / 1.423283 | 1.498165 / 1.709719 | 1.2525 | not provided by this procedure |
| computed-visible-derived/profiler-update | 0.436673 / 0.653626 | 0.450662 / 0.645466 | 1.0320 | not provided by this procedure |
| computed-visible-derived/commits-mount | 3.000000 / 3.000000 | 2.000000 / 2.000000 | 0.6667 | not provided by this procedure |
| computed-visible-derived/commits-update | 7.000000 / 7.000000 | 3.000000 / 3.000000 | 0.4286 | not provided by this procedure |
| oneOf-5/profiler-mount | 1.465117 / 1.718328 | 2.054422 / 2.343472 | 1.4022 | not provided by this procedure |
| oneOf-5/profiler-update | 1.105343 / 1.356799 | 0.955286 / 1.261590 | 0.8642 | not provided by this procedure |
| oneOf-5/commits-mount | 3.000000 / 3.000000 | 2.000000 / 2.000000 | 0.6667 | not provided by this procedure |
| oneOf-5/commits-update | 6.000000 / 6.000000 | 2.000000 / 2.000000 | 0.3333 | not provided by this procedure |
| oneOf-10/profiler-mount | 1.540581 / 1.763123 | 2.323497 / 2.524211 | 1.5082 | not provided by this procedure |
| oneOf-10/profiler-update | 1.077213 / 1.384801 | 0.956965 / 1.185995 | 0.8884 | not provided by this procedure |
| oneOf-10/commits-mount | 3.000000 / 3.000000 | 2.000000 / 2.000000 | 0.6667 | not provided by this procedure |
| oneOf-10/commits-update | 6.000000 / 6.000000 | 2.000000 / 2.000000 | 0.3333 | not provided by this procedure |
| oneOf-20/profiler-mount | 1.605170 / 1.873342 | 2.891792 / 3.114846 | 1.8015 | not provided by this procedure |
| oneOf-20/profiler-update | 1.088755 / 1.349964 | 0.949925 / 1.171489 | 0.8725 | not provided by this procedure |
| oneOf-20/commits-mount | 3.000000 / 3.000000 | 2.000000 / 2.000000 | 0.6667 | not provided by this procedure |
| oneOf-20/commits-update | 6.000000 / 6.000000 | 2.000000 / 2.000000 | 0.3333 | not provided by this procedure |

## 커밋 보정과 모든 쓰기의 단언

HEAD의 모든 쓰기는 1회입니다. 0.16.0은 fixture·쓰기 순서별 보정값을 사용하며 두 lane·세 회차에서 동일했습니다. oneOf 세 fixture, array-replace-200, computed-visible-derived를 포함한 기존 제외 update 행도 모두 측정했습니다.

| 폼 | 0.16.0 커밋/쓰기 보정 | HEAD 커밋/쓰기 보정 | 확인한 쓰기 | 실패 |
| --- | --- | --- | --- | --- |
| sample-0 | 1개 쓰기 모두 2회 | 1개 쓰기 모두 1회 | 1452 | 0 |
| sample-1 | 1개 쓰기 모두 2회 | 1개 쓰기 모두 1회 | 1452 | 0 |
| sample-2 | 1개 쓰기 모두 2회 | 1개 쓰기 모두 1회 | 1452 | 0 |
| sample-3 | 1개 쓰기 모두 2회 | 1개 쓰기 모두 1회 | 1452 | 0 |
| flat-50 | 10개 쓰기 모두 2회 | 10개 쓰기 모두 1회 | 14520 | 0 |
| flat-100 | 10개 쓰기 모두 2회 | 10개 쓰기 모두 1회 | 14520 | 0 |
| flat-500 | 10개 쓰기 모두 2회 | 10개 쓰기 모두 1회 | 14520 | 0 |
| nested-d3-f4 | 10개 쓰기 모두 2회 | 10개 쓰기 모두 1회 | 14520 | 0 |
| nested-d5-f4 | 10개 쓰기 모두 2회 | 10개 쓰기 모두 1회 | 14520 | 0 |
| array-100 | 1개 쓰기 모두 2회 | 1개 쓰기 모두 1회 | 1452 | 0 |
| array-500 | 1개 쓰기 모두 2회 | 1개 쓰기 모두 1회 | 1452 | 0 |
| array-1000 | 1개 쓰기 모두 2회 | 1개 쓰기 모두 1회 | 1452 | 0 |
| array-push-100 | 100개 쓰기 모두 2회 | 100개 쓰기 모두 1회 | 145200 | 0 |
| array-replace-200 | 1개 쓰기 모두 1회 | 1개 쓰기 모두 1회 | 1452 | 0 |
| array-push-remove-100 | 200개 쓰기 모두 2회 | 200개 쓰기 모두 1회 | 290400 | 0 |
| computed-visible-derived | [3, 2, 2] | 3개 쓰기 모두 1회 | 4356 | 0 |
| oneOf-5 | 2개 쓰기 모두 3회 | 2개 쓰기 모두 1회 | 2904 | 0 |
| oneOf-10 | 2개 쓰기 모두 3회 | 2개 쓰기 모두 1회 | 2904 | 0 |
| oneOf-20 | 2개 쓰기 모두 3회 | 2개 쓰기 모두 1회 | 2904 | 0 |

## oneOf React 계층과 if/then

세션 114의 원절차는 [performance.md:396](performance.md:396), [measure-react.mjs](profile-114-g26/measure-react.mjs), [report.mjs:147](profile-114-g26/report.mjs:147)입니다. oneOf-5·10·20 × 3회차의 --phases 9 pairs / 18 fresh workers, warmup 20·samples 101입니다. 코어 본문·getter의 중첩 시간을 React 몫에서 제외하고, 각 표본의 react-render + react-commit을 먼저 더한 뒤 303표본 중앙값을 구하는 원본 집계를 그대로 썼습니다. 주변 중앙값의 합이나 공식 wall에서 별도 코어 중앙값을 빼는 방식은 쓰지 않았습니다.

**oneOf 6행의 코어 제외 React render+commit 몫은 모두 ≤1.0×로 충족합니다(0.8570–0.9030×).** 세션 114의 같은 절차 값(0.895–0.926×, [performance.md:396](performance.md:396) 아래 표)과 같은 방향입니다. if/then의 React 종단·계층 수치는 이 절차가 제공하지 않습니다.

| 폼/작업 | 0.16.0 render ms | HEAD render ms | 0.16.0 commit ms | HEAD commit ms | 0.16.0 층 합 median ms | HEAD 층 합 median ms | 배율 | 목표 | 판정 | 0.16.0 / HEAD 코어 ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| oneOf-5/mount | 1.374954 | 1.288874 | 0.353541 | 0.271918 | 1.728763 | 1.561010 | 0.9030 | ≤1.0× | 충족합니다. | 0.447373 / 1.453754 |
| oneOf-5/update | 1.204709 | 1.043999 | 0.627126 | 0.525296 | 1.832249 | 1.570175 | 0.8570 | ≤1.0× | 충족합니다. | 0.265051 / 1.294995 |
| oneOf-10/mount | 1.380002 | 1.272088 | 0.351787 | 0.271169 | 1.733325 | 1.544208 | 0.8909 | ≤1.0× | 충족합니다. | 0.546749 / 1.955432 |
| oneOf-10/update | 1.174242 | 1.041123 | 0.600078 | 0.527005 | 1.775388 | 1.566334 | 0.8822 | ≤1.0× | 충족합니다. | 0.253174 / 1.516911 |
| oneOf-20/mount | 1.419754 | 1.265706 | 0.344674 | 0.273458 | 1.764383 | 1.538962 | 0.8722 | ≤1.0× | 충족합니다. | 0.740334 / 2.947368 |
| oneOf-20/update | 1.196340 | 1.068985 | 0.606375 | 0.540625 | 1.803422 | 1.606226 | 0.8907 | ≤1.0× | 충족합니다. | 0.252555 / 2.019375 |
| if/then/mount | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure |
| if/then/update | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure | not provided by this procedure |

계측 시계에는 계측 비용이 있으므로 이 층 값으로 비계측 공식 React 행을 덮어쓰지 않습니다. 코어 열은 같은 계측 실행의 코어 몫이며 기록만 합니다.

**실행.** HEAD `f4e6aeb1b9abc9e8db5c2a4b26de023b4fe6b16f`, Node v26.11.1 / V8 14.6.202.34-node.37에서 2026-10-11T05:47:25.901Z부터 2026-10-11T05:48:31.124Z까지 9 pairs / 18 workers를 순차 실행했고 wall은 65.2초입니다. 모든 worker는 exit 0·signal null입니다. 원시 27개 파일(1.3 MB)은 `S/session-136k-layer/`에 두었고 SHA-256은 [목록](profile-136k-final/react-layer-raw-sha256.txt)에 적었습니다. 집계값은 [react-layer-result.json](profile-136k-final/react-layer-result.json)입니다. 이 재시도는 codex가 아니라 주 세션(Claude, 구현 세션)이 기존 driver를 직접 실행했습니다.

**첫 시도와 재시도의 어댑터 변경.** 첫 시도는 표본 저장 전에 `ERR_MODULE_NOT_FOUND: Cannot find package '@canard/schema-form_0.16.0'`으로 멈췄습니다([실패 기록](profile-136k-final/react-layer-failure.json)). 번들이 [mountEquivalentForm.tsx:18](../../../../../aileron/benchmark-form/fixtures/equivalent/utils/mountEquivalentForm.tsx:18)의 `await import('@canard/schema-form_0.16.0')`을 외부 import로 남기고 `new Function`으로 평가되므로, 저장소 밖 S에 둔 복사본의 위치에서 해석되었기 때문입니다. 원본 위치에서는 이 import가 별칭 패키지 exports의 "import" 항목인 `node_modules/@canard/schema-form_0.16.0/dist/index.mjs`, 곧 측정기의 `oldEsmEntry`로 해석됩니다. 원장 관리자의 승인을 받아 esbuild plugin `g26-current-source`에 이 specifier를 같은 파일의 절대 URL로 잇는 onResolve 한 줄만 더했습니다. 기존 load hook은 그 URL과 비교해 0.16.0 ESM을 계측하므로 `legacyEsmInstrumented` 단언이 그대로 성립합니다. 두 번째 시도는 driver의 원본 일치 단언이 이 줄을 기대값에 넣지 않아 측정 전에 멈췄고, 같은 줄을 기대값의 치환 목록에 더한 뒤 세 번째 실행이 완료되었습니다. 다른 단언은 바꾸지 않았습니다. diff는 아래 "어댑터"에 있습니다.

## React update 미달 6행의 소유자 수용 범위

React·validation OFF·update 작업이 일치하는 TEST-027 소유자 수용이 없거나 그 이유의 범위 밖인 행은 총 **6행**이며, 모두 **수용 없음 6행**에 해당하고 **일치하는 수용의 범위 밖 0행**입니다(시간 열을 각각 세면 수용 없음은 12행입니다).

검토에는 `git ls-tree --name-only 1.0.0-beta packages/canard/schema-form/architecture/reviews/`로 확인한 목록과 해당 브랜치의 `git show 1.0.0-beta:packages/canard/schema-form/architecture/reviews/<file>` 원문을 사용했습니다. [profile-136k-final.md:29](profile-136k-final.md:29)의 React·validation OFF 설정과 [profile-136k-final.md:125](profile-136k-final.md:125)의 회차 판정에 맞춰 fixture와 작업을 대조했습니다. [profile-122-session.md:43](profile-122-session.md:43)의 94C-02 판정에서도 이 여섯 fixture는 두 시간 열 모두 미달 목록에 포함되어 있습니다([profile-122-session.md:47](profile-122-session.md:47), [profile-122-session.md:48](profile-122-session.md:48)). [performance.md:333](performance.md:333)은 React 미달 행에 소유자 수용 라운드가 없다고 명시하며, 이 여섯 fixture의 update wall도 각각 소유자 판단 필요로 남겨 두었습니다([performance.md:339](performance.md:339), [performance.md:341](performance.md:341), [performance.md:349](performance.md:349), [performance.md:350](performance.md:350), [performance.md:351](performance.md:351), [performance.md:352](performance.md:352)).

아래 중앙값과 배율은 [profile-136k-final.md:39](profile-136k-final.md:39)의 공식 wall 표와 [profile-136k-final.md:82](profile-136k-final.md:82)의 공식 event-loop active 표에서 가져왔으며, 절대 차이는 각 표의 표시 중앙값으로 **HEAD − 0.16.0**을 계산했습니다. 배율은 보고서에 표시된 pooled 배율이며, 새 측정은 하지 않았습니다.

| 행 | 시간 열 | HEAD / 0.16.0 중앙값 ms | 배율 | 절대 차이 ms | 일치하는 소유자 수용과 근거 링크 | 수용 이유 원문 | 범위 판정 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| sample-1/update | wall ([profile-136k-final.md:44](profile-136k-final.md:44)) | 0.453958 / 0.404417 | 1.1225× | +0.049541 | 없습니다([round-114-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:5), [round-117-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-117-closing.md:5)). | 해당 React 수용 이유가 없습니다. | 수용이 없어 안쪽·경계·바깥 판정 대상이 아닙니다. |
| sample-1/update | event-loop active ([profile-136k-final.md:87](profile-136k-final.md:87)) | 0.455042 / 0.405584 | 1.1219× | +0.049458 | 없습니다([round-114-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:5), [round-117-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-117-closing.md:5)). | 해당 React 수용 이유가 없습니다. | 수용이 없어 안쪽·경계·바깥 판정 대상이 아닙니다. |
| sample-3/update | wall ([profile-136k-final.md:48](profile-136k-final.md:48)) | 0.431958 / 0.408916 | 1.0563× | +0.023042 | 없습니다([round-114-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:5), [round-117-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-117-closing.md:5)). | 해당 React 수용 이유가 없습니다. | 수용이 없어 안쪽·경계·바깥 판정 대상이 아닙니다. |
| sample-3/update | event-loop active ([profile-136k-final.md:91](profile-136k-final.md:91)) | 0.433166 / 0.410292 | 1.0558× | +0.022874 | 없습니다([round-114-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:5), [round-117-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-117-closing.md:5)). | 해당 React 수용 이유가 없습니다. | 수용이 없어 안쪽·경계·바깥 판정 대상이 아닙니다. |
| array-push-100/update | wall ([profile-136k-final.md:66](profile-136k-final.md:66)) | 91.837088 / 84.888170 | 1.0819× | +6.948918 | 없습니다([round-114-closing.md:9](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:9)). | 해당 React 수용 이유가 없습니다. | 수용이 없어 안쪽·경계·바깥 판정 대상이 아닙니다. |
| array-push-100/update | event-loop active ([profile-136k-final.md:109](profile-136k-final.md:109)) | 91.888543 / 84.928706 | 1.0819× | +6.959837 | 없습니다([round-114-closing.md:9](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:9)). | 해당 React 수용 이유가 없습니다. | 수용이 없어 안쪽·경계·바깥 판정 대상이 아닙니다. |
| array-replace-200/update | wall ([profile-136k-final.md:68](profile-136k-final.md:68)) | 113.781459 / 106.484833 | 1.0685× | +7.296626 | 없습니다([round-114-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:5)). | 해당 React 수용 이유가 없습니다. | 수용이 없어 안쪽·경계·바깥 판정 대상이 아닙니다. |
| array-replace-200/update | event-loop active ([profile-136k-final.md:111](profile-136k-final.md:111)) | 113.786000 / 106.489375 | 1.0685× | +7.296625 | 없습니다([round-114-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:5)). | 해당 React 수용 이유가 없습니다. | 수용이 없어 안쪽·경계·바깥 판정 대상이 아닙니다. |
| array-push-remove-100/update | wall ([profile-136k-final.md:70](profile-136k-final.md:70)) | 130.759743 / 122.520421 | 1.0672× | +8.239322 | 없습니다([round-114-closing.md:9](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:9)). | 해당 React 수용 이유가 없습니다. | 수용이 없어 안쪽·경계·바깥 판정 대상이 아닙니다. |
| array-push-remove-100/update | event-loop active ([profile-136k-final.md:113](profile-136k-final.md:113)) | 130.823046 / 122.595790 | 1.0671× | +8.227256 | 없습니다([round-114-closing.md:9](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:9)). | 해당 React 수용 이유가 없습니다. | 수용이 없어 안쪽·경계·바깥 판정 대상이 아닙니다. |
| computed-visible-derived/update | wall ([profile-136k-final.md:72](profile-136k-final.md:72)) | 1.361833 / 1.075207 | 1.2666× | +0.286626 | 없습니다([round-114-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:5)). | 해당 React 수용 이유가 없습니다. | 수용이 없어 안쪽·경계·바깥 판정 대상이 아닙니다. |
| computed-visible-derived/update | event-loop active ([profile-136k-final.md:115](profile-136k-final.md:115)) | 1.364791 / 1.077625 | 1.2665× | +0.287166 | 없습니다([round-114-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:5)). | 해당 React 수용 이유가 없습니다. | 수용이 없어 안쪽·경계·바깥 판정 대상이 아닙니다. |

범위 임계값은 [profile-136j-final.md:226](profile-136j-final.md:226)처럼 먼저 fixture·설정·작업이 일치하는 수용을 찾고, 그 수용의 이유 문구에서만 유도합니다. core 예시의 [round-104-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-104-owner-answers.md:7)은 이유에 “절대값 0.06 ms 안팎”이라고 적었으므로, core 보고서는 차이 ≤0.060 ms를 안쪽, 0.060 ms 초과·0.090 ms 이하를 경계, 0.090 ms 초과를 바깥으로 해석했습니다(0.090 ms는 소유자가 정한 상한이 아니라 “안팎”에 대한 보고서의 해석입니다). [round-108-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-108-owner-answers.md:7)의 이유 원문은 “폼 생성 때 스키마 전체를 한 번 분석해 두는 청사진 단계(BLUEPRINT-001)가 옛 판에는 없는 첫 비용이며, 코드 수준의 큰 상한은 소진되었고(열세 개의 채택으로 nested-d5 13.5 → 5.9 ms), React 층 마운트는 24행 모두 목표 안이다.”이므로, core 보고서는 그 원인과 크기가 같은지로 판정했습니다. [round-110-owner-answers.md:7](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-110-owner-answers.md:7)의 이유 원문은 “첫 갱신에만 드는 1회 비용(조립의 첫 회, 진단·메모의 초기화)이며 같은 폼의 이후 갱신은 목표 안이고 절대 차이는 0.07–0.1 ms이다; 그 자리의 손질 둘은 다른 폼의 갱신 회귀로 기각되었다(23dcaec78).”이므로, core 보고서는 같은 첫 갱신 원인에서 차이가 0.1 ms보다 작은 경우도 안쪽으로 보았습니다. 그러나 이 세 수용은 각각 코어 작은 폼 갱신, 코어 마운트, 코어 flat-50·flat-100 첫 갱신에 한정되어 이 표의 React 행과 일치하지 않으므로 해당 임계값을 이 표에 적용하지 않았습니다.

[round-114-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-114-closing.md:5)는 React 미달 행을 소유자에게 올리도록 하며 “편집자가 수용으로 넓혀 읽지 않는다”라고 명시했습니다. [round-117-closing.md:5](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-117-closing.md:5)도 sample-0~3의 첫 갱신을 “수용으로 넓혀 읽지 않고 React 층 고침 뒤 남은 React 행과 함께 소유자에게 올린다”라고 정했습니다. 세션 122에 답한 [round-124-closing.md:9](/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/round-124-closing.md:9)의 원문 역시 “React 표의 14행 미달은 F2 계열의 측정 대상 그대로다.”이며 소유자 수용을 부여하지 않았습니다. 따라서 이 여섯 행에는 이유에서 유도할 수 있는 React 수용 임계값 자체가 없고, 위의 **범위 밖 0행은 수용 범위 안이라는 뜻이 아니라 범위 판정 대상인 기존 수용이 없다는 뜻**입니다.

## G26 열 정의와 제공 범위

G26 초안 [/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-draft/performance.md](/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-draft/performance.md)에 공식 wall·active 76행, 기존 wall·Profiler·commit 기록과 pooled 초과 목록을 채웠습니다. 각 표의 if/then 행, 첫/확인 블록·감시/검출력·cluster A/A·소유자 판단·모바일·no-GC 열은 not provided by this procedure입니다. oneOf 층은 재시도로 측정한 6행을 채웁니다.

단일 쓰기는 같은 write index의 303표본을 따로 집계했습니다. 왕복·배치 합을 단일 쓰기로 쓰지 않았습니다. [16.67 ms 전체 표](profile-136k-final/frame-budget.md)는 mount 38행과 단일 쓰기 734행, 합 772행의 양쪽 판 median·p99·ratio와 HEAD 예산 사용률을 제공합니다. G26에는 mount와 fixture·지표마다 HEAD median이 가장 큰 단일 쓰기를 표시하고 전체 표를 연결했습니다. 모바일·GC 없는 조건의 결과는 만들지 않았습니다.

## 어댑터

두 앞선 시도는 각각 고정 HEAD·출력·bundle 상수와 reporter의 Node v26.10.0 단언 때문에 측정 전에 중단되었습니다. 이번에는 사용자 지시대로 Node 단언을 v26.11.1로 변경했습니다. 아래 복사본의 diff는 **HEAD·경로·Node 버전 상수만** 바꿉니다. warmup 20, samples 101, 228 records, worker <220초, 실행 순서, failedWrites 0 및 모든 커밋 단언을 유지했습니다. D/tools는 편집하지 않았습니다.

122 reporter의 설명문에는 원래 /opt/homebrew/bin/node 문자열이 남아 있습니다. 어댑터를 추가로 편집하지 않았으며, 이 보고서는 raw environment와 실제 실행 바이너리의 nvm 경로를 명시합니다.

/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/measure-react-122.mjs → /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/measure-react-136k.mjs (HEAD·raw 출력·bundle 경로 상수). [measure-react-adapter.diff](profile-136k-final/measure-react-adapter.diff)

```diff
--- /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/measure-react-122.mjs	2026-10-08 03:23:30
+++ /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/measure-react-136k.mjs	2026-10-11 13:09:34
@@ -31,13 +31,13 @@
 const pkgRequire = createRequire(path.join(pkg, 'package.json'));
 const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
 assert.equal(repo, '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
-assert.equal(head, '439fda3219ec6b42efbef4d7fa0f02a40111453f');
+assert.equal(head, 'aa1433cba6a22898867fda0dd73692aadd1ce875');
 const started = performance.now();
 const lane = process.argv.includes('--old-wait') ? 'record' : 'immediate';
 const prepareOnly = process.argv.includes('--prepare');
 const calibrationOnly = process.argv.includes('--calibrate-all');
-const rawDirectory = "/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/profile-122-raw/react";
-const bundleFile = "/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/react-122-head.cjs";
+const rawDirectory = "/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-136k";
+const bundleFile = "/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/react-136k-head.cjs";
 fs.mkdirSync(rawDirectory, { recursive: true });
 const fixtureName = process.argv[3];
 const run = Number(process.argv[4]);
```

/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/profile-122-react-report.mjs → /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/profile-136k-react-report.mjs (raw 경로·Node 버전 단언 상수). [reporter-adapter.diff](profile-136k-final/reporter-adapter.diff)

```diff
--- /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/profile-122-react-report.mjs	2026-10-08 04:40:55
+++ /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/profile-136k-react-report.mjs	2026-10-11 13:09:34
@@ -3,7 +3,7 @@
 import fs from 'node:fs';
 import path from 'node:path';
 
-const raw = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/profile-122-raw/react';
+const raw = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-136k';
 const fixtures = ['sample-0', 'sample-1', 'sample-2', 'sample-3', 'flat-50', 'flat-100', 'flat-500',
   'nested-d3-f4', 'nested-d5-f4', 'array-100', 'array-500', 'array-1000', 'array-push-100',
   'array-replace-200', 'array-push-remove-100', 'computed-visible-derived', 'oneOf-5', 'oneOf-10', 'oneOf-20'];
@@ -23,7 +23,7 @@
   for (const version of ['0.16.0', 'HEAD']) {
     const report = read(`react-${lane}-${fixture}-r${run}-${version}.json`);
     assert.equal(report.assertions.failedWrites, 0);
-    assert.equal(report.environment.node, 'v26.10.0');
+    assert.equal(report.environment.node, 'v26.11.1');
     assert.equal(report.environment.warmup, 20);
     assert.equal(report.environment.samples, 101);
     records.push(report);
```

/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-114-g26/measure-react.mjs → /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/measure-react-layer-136k.mjs (HEAD·import·repo·raw 경로 상수와, 원장 관리자가 승인한 0.16.0 import 연결 onResolve 한 줄). [react-layer-measure-adapter.diff](profile-136k-final/react-layer-measure-adapter.diff)

```diff
--- profile-114-g26/measure-react.mjs	2026-10-07 15:42:38
+++ /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/measure-react-layer-136k.mjs	2026-10-11 14:45:13
@@ -8,18 +8,18 @@
 import path from 'node:path';
 import { fileURLToPath, pathToFileURL } from 'node:url';
 
-import { instrumentRound93i } from '../tools/instrument-round-93i.mjs';
-import { instrumentCore } from './instrument-core.mjs';
+import { instrumentRound93i } from 'file:///Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/tools/instrument-round-93i.mjs';
+import { instrumentCore } from 'file:///Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-114-g26/instrument-core.mjs';
 
-const directory = path.dirname(fileURLToPath(import.meta.url));
-const repo = path.resolve(directory, '../../../../../../..');
+const directory = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-136k-layer';
+const repo = '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07';
 const pkg = path.join(repo, 'packages/canard/schema-form');
 const bf = path.join(repo, 'packages/aileron/benchmark-form');
 const bfRequire = createRequire(path.join(bf, 'package.json'));
 const pkgRequire = createRequire(path.join(pkg, 'package.json'));
 const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
 assert.equal(repo, '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
-assert.equal(head, 'af3cd579b892393de3693f737afe68cfce3993f8');
+assert.equal(head, 'f4e6aeb1b9abc9e8db5c2a4b26de023b4fe6b16f');
 const started = performance.now();
 const lane = process.argv.includes('--phases') ? 'phases' : 'plain';
 const fixtureName = process.argv[3];
@@ -137,6 +137,7 @@
     ` }, write: false, sourcemap: false, bundle: true, packages: 'external', platform: 'node',
       format: 'cjs', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' },
       plugins: [{ name: 'g26-current-source', setup(builder) {
+        builder.onResolve({ filter: /^@canard\/schema-form_0\.16\.0$/ }, () => ({ path: pathToFileURL(oldEsmEntry).href, external: true }));
         builder.onResolve({ filter: /^@canard\/schema-form$/ }, () => ({ path: path.join(pkg, 'src/index.ts') }));
         builder.onResolve({ filter: /^react-dom\/client$/ }, () => ({ path: bfRequire.resolve('react-dom/profiling'), external: true }));
         builder.onResolve({ filter: /^@\/schema-form/ }, args => {
```

/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-114-g26/report.mjs → /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/profile-136k-layer-report.mjs (HEAD·raw·원자료 경로 상수). [react-layer-reporter-adapter.diff](profile-136k-final/react-layer-reporter-adapter.diff)

```diff
--- profile-114-g26/report.mjs	2026-10-07 16:37:56
+++ /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/profile-136k-layer-report.mjs	2026-10-11 14:45:13
@@ -4,9 +4,9 @@
 import path from 'node:path';
 import { fileURLToPath } from 'node:url';
 
-const directory = path.dirname(fileURLToPath(import.meta.url));
-const evidenceDirectory = path.dirname(directory);
-const head = 'af3cd579b892393de3693f737afe68cfce3993f8';
+const directory = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-136k-layer';
+const evidenceDirectory = '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch';
+const head = 'f4e6aeb1b9abc9e8db5c2a4b26de023b4fe6b16f';
 const fixtures = ['sample-0', 'sample-1', 'sample-2', 'sample-3',
   'flat-50', 'flat-100', 'flat-500', 'nested-d3-f4', 'nested-d5-f4',
   'array-100', 'array-500', 'array-1000', 'oneOf-5', 'oneOf-10', 'oneOf-20',
```


## 산출물과 검증

원시 347개 파일(64 MB)은 세션 122와 같이 저장소 밖 `S/session-136k/`에 보존했고, 각 파일의 SHA-256은 [목록](profile-136k-final/raw-sha256.txt)에 적었습니다. 목록의 `react-raw/` 접두는 `S/session-136k/`를 뜻하며, 커밋 전에 347개 모두 이 목록과 일치함을 다시 확인했습니다. [react-summary.json](profile-136k-final/react-summary.json)은 Node 단언 상수만 바꾼 122 reporter 복사본의 파생값입니다. 그 reporter의 oneOf 미달 값은 종단 참고이며 이 보고서의 공식 대상 미달 12행과 구분됩니다. [session-evidence.json](profile-136k-final/session-evidence.json)에 환경·실행 명령·원본/어댑터 해시와 범위를 기록했습니다.

최종 [verification.json](profile-136k-final/verification.json)은 원시 값과 표의 일치, 228 records / 114 pairs / warmup 20 / samples 101 / run order / worker <220초 / failedWrites 0, 원본 해시·상수 전용 diff, D/tools 불변, 제품 src 불변, Git 쓰기 없음, 각 파일 5 MB 미만 및 runtime bundle 없음의 근거를 기록합니다. oneOf 층은 실패했고 if/then은 절차에 없으므로 두 항목을 충족했다고 주장하지 않습니다.

**상태:** React 종단·커밋 표와 oneOf React 계층 표를 완료했습니다. oneOf 계층 6행은 모두 충족합니다. update 미달 6행은 기존 React 소유자 수용이 없어 소유자 질의 대상입니다.
