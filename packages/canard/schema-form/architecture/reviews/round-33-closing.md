# 33라운드 닫기 — 06 착수의 원장 해석 하나: 배열 쓰기 동사의 진입 함수는 `dispatch`의 것이며, 05·06 가운데 뒤에 머지하는 쪽이 잇는다

2026-10-01. 06 작업자(브랜치 `feat/schema-form-array`, 워크트리 `.claude/worktrees/stage-06`)가 05 작업자와 합의한 공유 파일 분담 — 배열 쓰기 동사의 `src/core/dispatch/` 진입 파일은 둘 가운데 뒤에 머지하는 단계가 더하고, 그때까지 06의 동사는 노드 겉면에 둔다 — 이 LANDING-084와 어긋나지 않는지 물었다. 현행 항목에서 유도되므로 편집자 결정으로 닫는다. 소유자에게 물을 것은 없다.

### 33C-01 배열 쓰기 동사 다섯의 진입 함수는 `dispatch`가 소유한다 — 05·06이 병렬인 동안 뒤에 머지하는 쪽이 진입 파일을 더하고, 먼저 머지한 06의 동사는 PR-2의 모양(정착 호출 하나, 자기 진입 사슬 없음)으로 둔다

- 닫는 항목: LANDING-084(보충), LANDING-065(보충), EVENT-027(보충)
- 결정:
  - 【추론】 배열 쓰기 동사 `push`·`pop`·`update`·`remove`·`clear`는 EVENT-027의 공개 쓰기 API이므로 그 진입 함수는 LANDING-084대로 `dispatch`가 쓰기 동사마다 하나씩 소유한다; `arrayBehavior/`나 노드 겉면이 따로 진입 사슬(진입 깊이 카운터, `onChange`, 사슬 끝 throw)을 갖지 않는다.
  - 【추론】 원장은 `dispatch/` fractal을 PR-4에, 배열 동사를 PR-5에 두었고 둘이 병렬이므로 배열 동사의 진입 파일을 어느 PR이 더하는지는 적지 않았다; 05·06이 합의한 "뒤에 머지하는 쪽이 더한다"는 그 빈자리를 채우는 것이며 LANDING-084와 어긋나지 않는다. 조건은 둘 다 머지된 뒤 모든 쓰기 동사의 진입 함수가 `dispatch/`에 있고 겉면의 쓰기 위임이 그 진입을 거치는 것(LANDING-064 "겉면의 쓰기 위임을 `dispatch` 진입으로 옮김")이다.
  - 【추론】 06이 먼저 머지되면 그 동사는 03(PR-2)이 겉면 쓰기를 둔 모양 — 정착 호출 하나(TEST-069 "PR-2에서 사슬은 settle 호출 하나다") — 을 따르고, 05가 머지되는 쪽(또는 06이 뒤라면 06)이 겉면 위임을 `dispatch` 진입으로 옮기면서 배열 동사 다섯의 진입 파일을 더한다; `batch` 안의 배열 동사가 형제 진입으로 합쳐지는 것(EVENT-035)과 진입당 `onChange` 한 번은 그 뒤에만 성립하므로 06의 시험은 그 둘을 단언하지 않는다(03 log §4의 `batch` 사례 배분과 같다).
  - 【추론】 합의는 두 단계의 실행 기록(`plan/05-dispatch-and-validation/log.md`, `plan/06-array/log.md`)에 같은 문장으로 적고, 뒤에 머지하는 PR의 본문에 그 진입 파일 추가를 적는다.
- 근거: LANDING-084 "`src/core/dispatch/`, `src/core/validation/`, `app/plugin/type.ts` 개정. 진입 사슬은 `dispatch`가 쓰기 동사마다 진입 함수로 소유하고, 검증 결과 배달은 `dispatch`가 넘긴 콜백이다"; EVENT-027 "공개 쓰기 API는 `setValue`·`push`·`pop`·`update`·`remove`·`clear`·`batch`이고(06 N6, 07 §6.2)"; LANDING-064 PR-4 행 "진입 사슬의 소유는 `dispatch`(쓰기 동사마다 진입 함수)이며 겉면의 쓰기 위임을 `dispatch` 진입으로 옮김"; LANDING-065 "PR-2 (PR-3·4와 병렬)"; TEST-069 "PR-2에서 사슬은 settle 호출 하나다"(`plan/03-node-and-settle/log.md:45`에 인용).
