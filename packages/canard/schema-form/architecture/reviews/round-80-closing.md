# 80라운드 닫기 — 07 이주 점검이 찾은 빠진 이주 행 둘을 더한다(폼 핸들 명령 넷의 선택 경로와 `refresh`·`remount` 추가, 공개 배열의 `readonly`), 그리고 이주 시험이 메운 빈 곳 셋의 귀속: `INVALID_WRITE_OPTION`은 05의 결함, 켜진 `then`에 따른 `required` 표시는 03·04의 결함, 옛 `SetValueOption` 비트 잔재 제거는 07의 몫

2026-10-03. 07 작업자(전환, U9 `42ae7daaf`·U12 `05516c496`·U10 `2cef0c37a`; 이주 점검표 128행 처분 완료)가 셋을 물었다(Q23). (1) SURFACE-059의 게이트("실패: 빠진 이주 행을 더한다")가 가리키는 미등록 이주 후보 M1 — `FormHandle.focus`·`select`의 필수 경로가 선택 경로로 바뀌고 `refresh`·`remount`가 더해진 것(30라운드 소유자 답). (2) M2 — 공개 배열이 `readonly`로 바뀐 것(`FormProps.errors`·`onValidate`, `FormHandle.getErrors`·`validate`·`findNodes`, `useChildNodeErrors`의 `errorMatrix` 안 배열). (3) 이주 시험이 메운 빈 곳 셋(LANDING-141·132·021)과 U6이 빠뜨린 `FormHandle.reset(option?)`의 귀속. 현행 항목에서 유도되어 편집자 결정으로 닫고, 이주 행 둘은 새 항목 LANDING-209·210으로 더한다. 소유자에게 물을 것은 없다.

### 80C-01 M1은 이주 행이다 — LANDING-209를 더한다: 폼 핸들의 명령 넷(`focus`·`select`·`refresh`·`remount`)은 경로가 선택 인자이고 없으면 루트이며, 오늘 필수 경로였던 `focus(path)`·`select(path)`의 시그니처 변경과 `refresh`·`remount`의 추가를 한 행에 적는다

- 닫는 항목: SURFACE-059(보충), LANDING-209(새 항목)
- 결정:
  - 【추론】 이주(LANDING-209): `FormHandle.focus(path)`·`select(path)`는 오늘 경로가 필수이고 `refresh`·`remount`는 없으며, 새 설계에서는 명령 넷(`focus`·`select`·`refresh`·`remount`)이 모두 경로를 선택 인자로 받고 경로가 없으면 루트 노드를 가리키며 경로가 있으면 그 노드를 찾아 명령 메서드를 부르고 노드가 없으면 아무것도 하지 않는다(30라운드 소유자 답, EVENT-063).
  - 【추론】 SURFACE-059는 바뀌는 `FormHandle` 멤버마다 이주 행이 있어야 한다고 했고 그 게이트의 실패 처분이 "빠진 이주 행을 더한다"이므로, 30라운드가 `FormHandle`의 명령 모양을 정하면서 SURFACE-059의 대조 목록에 든다고만 적고 이주 행을 두지 않은 것은 빠진 행이다. 07은 이주 점검표에 LANDING-209 행을 올리고 기존 시험 `Form.binding`의 "SURFACE-059 EVENT-073 … optional-path commands" 사례를 (가)의 시험으로 인용한다.
- 근거: SURFACE-059 "원장의 결정이나 이주 행이 바꾸거나 없앤다고 적지 않은 오늘의 공개 표면은 이름·시그니처·뜻을 그대로 둔다.", "통과: 바뀌는 것마다 이주 행이 있다.", "실패: 빠진 이주 행을 더한다."; 소유자 답 `reviews/round-30-owner-answers.md:11` "네 맞습니다. 추가로, path 는 optional, 없으면 root 를 지칭합니다."; EVENT-063 보충(30라운드); 07의 보고(M1).

### 80C-02 M2는 이주 행이다 — LANDING-210을 더한다: 공개 표면이 돌려주거나 받는 배열은 `readonly`이며, 돌려준 배열은 코어가 같은 참조로 들고 있는 것이라 소비자가 고치면 안 되므로 형이 그 계약을 말한다; `readonly`가 아닌 형으로 되돌리지 않는다

- 닫는 항목: SURFACE-059(보충), LANDING-210(새 항목)
- 결정:
  - 【추론】 이주(LANDING-210): 공개 표면의 배열(`FormProps.errors`와 `onValidate`의 인자, `FormHandle.getErrors()`·`validate()`·`findNodes()`의 반환, `useChildNodeErrors`의 `errorMatrix` 안 배열)은 오늘 변경 가능한 배열 형이고, 새 설계에서는 `readonly` 배열이다 — 돌려준 배열은 코어가 같은 값을 같은 참조로 드는 것이라 소비자가 제자리에서 고치면 안 되며, 받는 배열은 `readonly`가 더 넓은 형이라 오늘의 호출이 그대로 컴파일된다; 옛 배열을 제자리에서 고치거나 변경 가능한 형에 대입하던 소비자는 형 오류를 보며 복사(`[...arr]`)로 고친다.
  - 【추론】 되돌리지 않는 까닭은 패키지의 "같은 값을 두 번 읽으면 같은 참조" 규칙이다 — `getErrors()`가 돌려주는 배열은 79C-01대로 코어가 바뀔 때만 다시 만드는 공유 배열이므로 소비자가 고치면 코어의 상태가 깨진다; 변경 가능한 형을 돌려주면서 "고치지 말라"고 문서에만 적는 것보다 형이 계약을 말하는 것이 맞다. 받는 쪽(`errors` 속성, 콜백 인자)의 `readonly`는 넓히는 변경이라 소비자 코드를 깨지 않는다. 07은 이주 점검표에 LANDING-210 행을 올리고, 되돌림이 아닌 복사의 안내 한 줄을 PR-8 이주 안내의 재료로 적는다.
- 근거: SURFACE-059(바뀌는 공개 표면은 이주 행이 적는다, 게이트의 실패 처분); 패키지 `CLAUDE.md` Design Values "the same value read twice returns the same reference"; 79C-01(`reviews/round-79-closing.md`, `globalErrors`는 바뀔 때만 다시 만드는 공유 배열); LANDING-024·049(개명만 다룸); 07의 보고(M2).

### 80C-03 이주 시험이 메운 셋의 귀속 — `Overwrite | Merge`의 `INVALID_WRITE_OPTION` throw는 05가 오류 코드 표에 "확정·동일"로 올리고 동작을 두지 않은 05의 결함, 켜진 `then`에 따른 자식 `required` 표시 갱신은 정착의 유효 스키마에서 표시를 내는 03·04의 결함(SCHEMA-041), 옛 `core/types/value`의 `SetValueOption` 복합 비트 잔재 제거는 LANDING-087이 07에 둔 형 전환의 몫; `FormHandle.reset(option?)`은 07 자신의 빠뜨림

- 닫는 항목: LANDING-141(보충), LANDING-132(보충), LANDING-021(보충)
- 결정:
  - 【추론】 귀속의 기준은 72C-01·78C-02가 가른 대로 "원장이 그 단계에 둔 규칙이 온전히 있었는데 코드가 없거나 다른가"다. (가) LANDING-141의 `INVALID_WRITE_OPTION`은 05가 오류 코드 표(`plan/05-dispatch-and-validation/log.md:101`)에 "확정·동일, 충돌한 공개 쓰기 옵션의 호출자 오류"로 올렸으므로 던지는 동작이 없던 것은 05의 결함이다. (나) LANDING-132·SCHEMA-041의 `required` 표시는 "부모 유효 스키마의 `required`(연언 문맥의 켜진 조각 합집합)"이고 유효 스키마는 정착이 계산하므로(03의 `selectNodeSchema`, 04의 게이트·조각 선택) 켜진 `then`에 따라 자식의 `required`가 갱신되지 않던 것은 03·04의 결함이며, 07은 고친 파일로 둘 가운데 어느 쪽인지 적는다. (다) LANDING-021의 옛 `core/types/value`에 남은 `SetValueOption` 복합 비트는 LANDING-087이 "`core/types`의 event·state·value는 남는다"고 하며 그 안의 옛 비트 정리를 07의 형 전환(진입점 전환과 함께)에 둔 것이므로 결함이 아니라 07의 몫이다. (라) `FormHandle.reset(option?)`(억제 비트 둘만, WRITE-015 보충·ADR 0013)은 07의 U6이 빠뜨린 것이므로 앞 단계 귀속이 아니라 07의 실행 기록에 "빠뜨린 것을 채움"으로 적는다. (가)·(나)는 42라운드·78C-02의 선례대로 `plan/07-switch/log.md` §8 "앞 단계 결함"에 재현 사례와 함께 적고, 메운 시험(이주 점검표의 (가) 행)이 그 증거다.
- 근거: LANDING-141 "`Overwrite | Merge`는 오늘 `Overwrite`로 동작하고 … 새 설계에서는 `INVALID_WRITE_OPTION`으로 던진다"; `plan/05-dispatch-and-validation/log.md:101`; LANDING-132 "필수 표시는 … 새 설계에서는 켜진 `then`에 따라 바뀐다"; SCHEMA-041 "`required` 표시는 부모 유효 스키마의 `required`(연언 문맥의 켜진 조각 합집합)"; LANDING-021(10비트 `SetValueOption`은 비트 넷); LANDING-087 "`core/types`의 event·state·value는 남고 node·constructor는 지운다"; WRITE-015 보충 "`FormHandle.reset(option?)`은 `DisableAutomaticWrites`·`EnableAutomaticWrites` 두 비트만 받는다"; 72C-01·78C-02(귀속의 기준); 42라운드(선례); 07의 보고(U10 `2cef0c37a`).
