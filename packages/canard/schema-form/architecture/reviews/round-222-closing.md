# 222라운드 닫기 — 입력 17개 설정 자리 이주 PR #359를 원장 관리자가 직접 검증해 feat/schema-form-07b-1에 squash-merge(12aa201d9); 남은 선행 조건은 reviewer의 가드 포인터 PR, fixy07의 ④·⑤, fairy07의 전체 순회, ⑥

2026-10-13. fairy07의 PR #359(fix/schema-form-input-presentation-props → 07b-1, head 29dbc0af9, base dc6a2e79f, 패키지마다 커밋 하나 다섯: schema-form DateFormat, antd5, antd6, mui(options.protocols 대체만 제거), antd-mobile). 수치: schema-form unit+render 432파일 3,173 통과·todo 1; 입력 시험 34/34(고치기 전 실패 schema-form 1/2, antd5 7/14, antd6 7/14, antd-mobile 1/2, mui는 원래 초록); 다섯 패키지 typecheck·lint·build 통과(ajv8 build도); 51파일 +1,910/−130. verifier: 코드·시험·형·범위 통과; 문서 결함 하나 고침(이주 문장이 모든 README에 모든 키를 나열 → 플러그인마다 자기 키만); DETAIL 계약 기준 줄·수용 기준 한 줄. 실행 편차(PR 본문·plan.md 9절): codex 세션 ID·오류 문구·시각, 형 회귀 발견(대기열 23). 원장 관리자 직접 검증: 범위가 다섯 패키지 밖 0, schema-form src 비시험 변경은 FormTypeInputDateFormat.tsx·formTypeDefinitions/DETAIL.md 둘뿐, 세션 ID 0, 워크트리에서 antd5 14·antd6 14·antd-mobile 2·mui 2 통과, schema-form formTypeDefinitions 시험 + features-input-components e2e 25 통과. squash 12aa201d9; 원격 브랜치 삭제; 워크트리는 순회(221C-01)에 다시 쓰므로 유지.

### 222C-01 #359는 검증대로 받아 squash-merge했다(12aa201d9). #355 머지까지 남은 순서: reviewer 가드 포인터 PR(codex 결과 검증 중) → fixy07 ④ push(12aa201d9 위 rebase) → ⑤ browser-mode guard(codex) push → fairy07 전체 스토리 에이전틱 일반 창 순회(그 head) → fixy07 ⑥(마지막 rebase·전체 게이트·#355 본문) → 원장 관리자 검증·squash-merge → 세 세션·워크트리 정리 → #354만 draft

- 닫는 항목: CONTROLS-081(보충), LANDING-204(보충)
- 결정:
  - 【추론】 입력 설정의 자리는 원장이 정한 대로 돌아갔고 옛 자리는 청사진 오류로 고정됐으므로, 이주 미완으로 쓸 수 없던 일곱(실제로는 열일곱) 기능이 돌아왔다.
- 근거: fairy07의 PR 본문·보고; 직접 검증 결과; 216C-04; 221C-01.

## 덧붙임 (2026-10-13, ④ 검증 파동 고침 push)

fixy07 ④ push: origin/feat/schema-form-07b-1 head ab1535d12(12aa201d9 위 fast-forward; 세션 ID·co-author 0). 내용: 깊이 같은 검증 결과는 직전 배열로 배정해 배정이 같은 노드의 errors·globalErrors·외부와 합친 errors를 같은 참조로 두고 UpdateGlobalError를 보내지 않음; 배정이 바뀐 노드(분기 전환, 항목 삭제 뒤 이동)만 UpdateError; 0.16.0의 낡은 노드 결함도 함께 고쳐짐. verifier 1차 FAIL(DETAIL 계약 문장, 남은 결함 문구 네 곳, 합친 errors 캐시 전체 비움) 반영 후 PASS(캐시 수정에는 이전 줄에서 실패하는 시험 추가). G1 고치기 전 실패(core 8 중 4, e2e 5 중 4), G2 typecheck·lint 0, G3 전체 4,116 통과·0 실패·todo 1(dot 종료 코드 0), G4 onValidate 누적 [2,2,2,2,3,3] = 0.16.0. 비차단: json reporter 실행의 종료 코드 1 → 대기열 24. 다음: storybook 프로젝트 기준 수치 → ⑤ codex.
