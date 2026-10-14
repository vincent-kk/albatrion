# 238라운드 — Vincent의 답 (힌트는 `inputType`으로 잠정 결정; 필드 전체 렌더러는 `FieldRenderer`여야 한다는 지적)

2026-10-13. 237라운드 뒤 원장 관리자가 힌트 후보 넷(권고 `inputType`)과 슬롯 겹침 해소안을 올렸고, 소유자가 원장 세션에서 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 힌트 이름과 렌더러 | 힌트를 `inputType`으로 확정할지; `FieldInputRenderer` 겹침 | "FieldInputRenderer가 아니라 FieldRenderer 아니야? input만 랜더링하는게 아닐거라서.... \ninputType으로 잠정 결정하자." | 238C-01: 힌트 `presentation.inputType`(잠정, 별칭 없음); 역할 3은 코드 확인 결과 필드 전체 렌더러(옛 `FormTypeGroupRenderer`)가 `FieldRenderer`, `Form.Label`·`Form.Input`·`Form.Error` 슬롯 뒤의 셋은 `Form{Label,Input,Error}Renderer`(기본 구현 파일 이름과 같음)로 제안 — 다음 답에서 확정 |

다음 라운드 번호는 239이다.
