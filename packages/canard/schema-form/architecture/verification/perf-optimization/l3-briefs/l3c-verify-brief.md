# L3-c 검증 brief (읽기 전용)

당신은 검증자입니다. 저장소 안의 어떤 파일도 만들거나 고치지 마십시오. git 상태를 바꾸는 명령(checkout, reset, stash, commit, push, worktree 등)을 실행하지 마십시오. 시험을 돌려도 되지만 출력은 $TMPDIR 아래에만 두십시오. Orca 규칙: run-use 와 코디네이터 명령 금지, 후속 check 는 preamble 의 handle 로 `--terminal` 을 붙여서만.

## 대상

- PR #419 (저장소 vincent-kk/albatrion, base feat/schema-form-08-review-and-perf). 구현 작업 폴더(읽기 전용): /Users/Vincent/Workspace/albatrion/l3e-direct-ownership
- 검토 범위 diff: 그 폴더에서 `git diff a9c00f534..d382874e8` (settle DETAIL +1/−1, 런타임 +6/−3: arrayExtras.ts 가 같은 배열이면 이전 참조를 되살리고 markWrite.ts 의 extras 비교가 참조 동일성(!==)으로; 새 시험 +278).
- 구현 brief 와 코디네이터의 후속 결정: /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/verification/perf-optimization/l3-briefs/l3c-brief.md 와 구현자의 미커밋 보고서(같은 폴더의 architecture/verification/perf-optimization/l3c-extras-single-compare-results.md; 호출자 7개 추적 표 포함). 결정: nextExtras 의 참조 되살림은 잠복 Merge(distributeLatentValue, setLatentRaw 의 dirty 판정)가 의존하므로 유지하고, 중복 비교는 markWrite 쪽에서 없애되 배열은 arrayExtras 가 되살린다.
- 원장: SETTLE-043(같은 값 규칙과 참조 되살림), SETTLE-042, VALUE-002, WRITE-013. 측정 방법: architecture/reviews/round-400-closing.md 의 400C-02.

## 검증 축 (각각 통과/실패와 path:line 근거)

1. 동치: markWrite 가 참조 동일성만 보게 된 뒤에도 "같은 값 쓰기 = 변화 없음"이 모든 경로에서 유지되는가. 즉 markWrite 에 extras 를 넘기는 모든 호출자(객체는 nextExtras, 배열은 arrayExtras, 잠복 분배 등 구현자 표의 7개)가 같은 값이면 반드시 이전 참조를 넘기는지 path:line 으로 확인하십시오. 하나라도 새 객체/배열을 넘기는 호출자가 있으면 그 경로에서 불필요한 UpdateValue·revision·onChange 가 생기므로 실패입니다.
2. 배열 관측: arrayExtras 의 되살림이 배열 쓰기의 관측(새 배열 참조, 호출자 입력 불변 WRITE-013, 길이 변경, 끝 덧붙임 지름길 L3-b 의 extras 새 배열 관측)을 바꾸지 않는가. L3-b 의 시험(settle.array-extras-append.test.ts)이 그대로 통과하는가.
3. 계약·범위: settle DETAIL 의 바뀐 문장이 SETTLE-043 과 어긋나지 않는가. 런타임 순증 3줄이 쓰기마다의 O(키 수) 두 번째 구조 비교 제거에 비례하는가. 캐시·전역 상태 없음, 공개 API 불변.
4. 시험: 객체 비교 상한 시험이 수정 전(2회)에서 실패하고 수정 후(1회 이하) 통과하는가. 기존 시험 기대값 변경 0건인가.
5. 측정: 결과 파일의 A2 두 바퀴 표에서 B0 한 키 Node −6.2%·Bun −13.7% 와 Node B1 한 키 +5.5%(바퀴별 −19.0%/+8.0%) 를 400C-02 기준(바퀴 범위가 0을 걸치면 차이 없음)으로 판정하십시오. 재측정은 필요 없습니다.
6. 커밋·PR 위생: 두 커밋에 공동 저자·세션 ID·"Claude-Session" 줄이 없는가, 사용자의 법적 이름이 없는가, PR 본문에 규칙 한 문장·호출자 추적 표·측정 표가 있는가.

## 보고 형식

한국어. 맨 위에 "판정: 통과" 또는 "판정: 실패"와 한 줄 이유. 축 1~6 각각 통과/실패와 근거 path:line. 마지막에 "관찰". worker_done 은 --outcome succeeded 로(판정이 실패여도 검증 자체는 성공), 요약 첫 문장에 판정을 넣으십시오.
