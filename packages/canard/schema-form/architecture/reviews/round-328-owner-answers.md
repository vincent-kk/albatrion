# 328라운드 — Vincent의 지시 (schema-form의 INTENT·DETAIL 문서를 모두 한국어로, humanizer로 다듬어, sonnet·agy로 병렬 처리)

2026-10-14. 구조 손질 5 뒤 소유자가 fairy08에게 문서 번역을 지시했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| INTENT·DETAIL 전부 한국어로, humanizer, 병렬 | 영문·혼재 INTENT·DETAIL | "한가지만 더 요청하지. @fairy08 에게 요청하게.\n현재 INTNET.md / DETAIL.md 문서가 한글이 아니라 영문으로 쓰여진게 좀 있는거같네. \nschema-form 범위에서 이들 문서를 모두 한글로 작성하되, \n/humanizer 를 사용해서 거슬리지 않는 문장으로 작성해주길 바라네.\n\n최대한 병렬로 빠르게 끝냈으면 좋겠군 \n이때는 codex 대신 sonnet 이나 agy 를 사용해서 빠르게 작업해주게" (2026-10-14, 원장 세션) | 확정. fairy08이 src(__legacy__ 제외, 플러그인 밖) 문서 138개를 분류해 영문·혼재를 한국어로 다시 쓴다; /humanizer 스킬로 자연스러운 문장, 영문 헤딩 관례·코드·경로·ID는 보존; sonnet worker 또는 agy로 병렬(이 일에는 소유자가 병렬 허락, 백그라운드 셸은 여전히 금지), codex 금지; 검증은 filid validate(documents) 0과 파일·헤딩 수 동일; 문서 전용 PR 하나, 원장 관리자 병합. |

다음 라운드 번호는 329이다.
