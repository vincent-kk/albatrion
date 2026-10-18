# L3-d 검증 brief (읽기 전용)

당신은 검증자입니다. 저장소 안의 어떤 파일도 만들거나 고치지 마십시오. git 상태를 바꾸는 명령을 실행하지 마십시오. 출력은 $TMPDIR 아래에만. Orca 규칙: run-use 와 코디네이터 명령 금지, 후속 check 는 preamble 의 handle 로 `--terminal` 을 붙여서만.

## 대상

- PR #420 (저장소 vincent-kk/albatrion, base feat/schema-form-08-review-and-perf). 구현 작업 폴더(읽기 전용): /Users/Vincent/Workspace/albatrion/l3e-direct-ownership
- 검토 범위 diff: 그 폴더에서 `git diff 8efeaf19c..4797cea79` (settle DETAIL +1/−1, markWrite.ts +7/−8, 새 시험 +196).
- 구현 brief: /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/verification/perf-optimization/l3-briefs/l3d-brief.md. 구현자 보고서(미커밋): 같은 작업 폴더의 architecture/verification/perf-optimization/l3d-static-spec-pass-through-results.md.
- 측정 방법: architecture/reviews/round-400-closing.md 의 400C-02.

## 검증 축

1. 동치: markWrite 의 해석된 잎 재귀 호출에 첫 조회의 spec(childSpec)을 넘기는 것이 모든 분기에서 이전과 같은 spec 값을 쓰는가. 특히 "known" 분기에서 spec 이 쓰이지 않는다는 구현자 주장과, 넘긴 spec 이 자식의 것(부모 것이 아님)인지 path:line 으로 확인하십시오. 해석되지 않은 자식의 경로는 바뀌지 않았는가.
2. 관측: 해석·참조·배달(UpdateValue·revision·onChange) 관측이 그대로인가(시험 settle.static-spec-pass-through.test.ts 와 구현자의 5장면 37관측 차이 0).
3. 시험: 조회 수 상한(N+1)이 수정 전 구현에서 실패하고 수정 후 통과하는가(all-keys 2001→1001, one-key 1002→1001). 기존 시험 기대값 변경 0건.
4. 범위·계약: 런타임 +7/−8(순 −1), 캐시 없음(지역 변수 전달만), 공개 API 불변, DETAIL 문장이 코드와 맞는가.
5. 측정 판정: 구현자 표에서 실제 시간은 평균 +0.08~+0.55% 느리고 바퀴 범위가 0을 가로지릅니다. 400C-02 기준으로 "차이 없음"이 맞는지 표를 보고 확인하고, 이 PR 이 "중복 조회 제거(호출 수 절반)이되 시간 효과는 측정 불가"로 기록되어야 하는지 판정하십시오. 재측정은 필요 없습니다.
6. 커밋·PR 위생: 공동 저자·세션 ID·"Claude-Session" 줄 없음, 사용자의 법적 이름 없음, PR 본문에 규칙 한 문장·조회 수 전후·측정 표.

## 보고 형식

한국어. 맨 위에 "판정: 통과" 또는 "판정: 실패"와 한 줄 이유. 축 1~6 각각 통과/실패와 근거 path:line. 마지막에 "관찰". worker_done 은 --outcome succeeded 로, 요약 첫 문장에 판정을 넣으십시오.
