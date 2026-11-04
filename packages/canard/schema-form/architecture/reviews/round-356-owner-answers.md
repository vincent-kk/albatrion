# 356라운드 — Vincent의 지시 (M0 최종 표 보기; 개선 즉시 진행; 키 생성에서 JSON.stringify를 쓰지 않는 방향 검토; 시험이 빌드 결과물을 대상으로 하는지)

2026-10-15. 소유자가 M0 결과를 듣고 많이 느려졌다며 최종 표를 보자고 했고, 개선은 바로 진행해도 된다고 했으며, 키 생성에서 JSON.stringify를 쓰지 않는 방향을 추가로 검토하라고 했고, 모든 시험이 빌드 결과물을 대상으로 도는지 물었다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| M0 표 요청, 개선 즉시 진행, 키 생성의 JSON.stringify 배제 검토, 시험 대상이 빌드 결과물인지 | 표·개선 착수·stringify·시험 대상 | "또 엄청 느려졌군.. 최종 표 한번 보여줘.\n개선진행은 바로 해도 된다.\n추가로 key 생성시 json.stringify 를 쓰지 않는 방향도 검토해줘. 모든 테스트는 빌드결과물을 대상으로 하는거 맞지?" (2026-10-15, 원장 세션) | 표는 verification/perf-optimization/baseline.md의 옛 판 대비 core·render 표를 보여 주었다(oneOf 갱신 5.92·7.07·9.44배, 마운트 3.26·3.58·4.28배, 작은 폼 갱신 2.17~2.66배; 배열 마운트와 flat-500 갱신은 새 판이 빠름). 개선은 L1(가설 0·1·2·3·7)로 바로 진행한다. 키 생성의 JSON.stringify 배제는 새 가설(H10)로 priority.md에 넣어 L2 첫 가설로 두며, 335라운드 3번(다시 parse하는 키는 예외, 구분자는 control.ts 특수문자 고려)과 감사 B(호출 45, 다시 parse 29)를 기준으로 핫패스부터 소실험한다. 시험 대상: unit·render·storybook·production 프로젝트와 독립 스크립트·vitest 벤치는 src를 직접 돌고, 빌드 결과물(dist)을 대상으로 하는 것은 benchmark-form의 `--equivalent`와 aileron production-test뿐이다. 그래서 L1부터 커밋마다의 대상 행 측정에 dist 재빌드와 `--equivalent` 행을 넣는다. |

다음 라운드 번호는 357이다.
