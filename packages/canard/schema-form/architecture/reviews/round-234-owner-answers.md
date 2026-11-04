# 234라운드 — Vincent의 답 (대기열 22·29·23과 CLAUDE.md 두 줄; formType 이름 재구성에 대한 의견 요청)

2026-10-13. 233라운드와 그 덧붙임에서 올린 결정 넷에 소유자가 원장 세션에서 답했고, 이어 `formType` 계열 이름의 재구성에 대해 원장 관리자의 의견을 물었다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 대기열 22 onValidate 두 번 | B안(코어에서 합산이 바뀐 때만 발행)·A안·유지 | "b안 적용" | 234C-01: fixy07 07b-2 ⑦ — publishRootExternalErrors가 합산 변경 때만 UpdateGlobalError, 빈 상수 통합, dispatch/DETAIL.md:27 개정; None 모드 마운트 호출 0번 수용 |
| 대기열 29 최상위 선언 다섯 | 공개 형 BasicSchema의 최상위 formType·errorMessages·FormTypeInput·FormTypeInputProps·FormTypeRendererProps 삭제 | "어 제거해버려. 이제 안쓰니까" | 234C-01: fixy07 07b-2 ⑧ — 형만 삭제, 공개 표면 차분에 형 차이로 기록 |
| 대기열 23 슬롯 형 | presentation.FormTypeInput 슬롯이 좁은 플러그인 입력을 거부(TS2322 63건) — A·B·C·D | "가장 나은 방법을 다시 찾아봐. 이게 함수 매개변수의 역추론 과정에서 나온 문제라면 정공법을 찾아보고 안되면 any로 처리해도 무방함. 사용자에게 혼란과 괜한 as 단언을 하게 하는 것 보다 나음" | 234C-01: fixy07이 반공변(매개변수 역추론)의 정공법(제네릭 슬롯·조건부 형 등)을 먼저 찾고 안 되면 A(ComponentType<any>); 소비자가 as 단언 없이 좁은 입력을 넣을 수 있어야 함 |
| CLAUDE.md 76·138행 | 승인된 절 밖의 옛 표기 두 줄 | "승인" | 234C-01: fixy07이 07b-2에서 두 줄 갱신(CLAUDE_SECTION_ONLY 게이트는 이 두 줄을 허용 목록에) |
| formType 이름 | `formType`·FormTypeInput·FormTypeRenderer 계열 이름을 이번 전환에서 목적이 드러나는 이름으로 재구성하는 것에 대한 의견 | "formType, formTpyeInput, formTypeRenderer 같은 곳에서 쓰는 formType 이라는 말이 사실 엄청 레거시 키워드고, 무엇보다 아무 의미도 없는 말이거든? 그래서 이걸 혹시 다른 명칭으로 재구성하는건 어떻게 생각해? 이번에 완전 새로 바뀌니까, 사용자에게 해당 필드 목적과 용도를 보다 명확하게 전달하기 위해서 말이야. 어차피 formType 이란건 미묘한 이름이잖아. InputType 도 아니고." | 원장 관리자가 의견과 후보를 같은 턴에 보고; 결정은 다음 라운드 |

다음 라운드 번호는 235이다.
