# 320라운드 — Vincent의 정정 (fieldInputs의 자식 fractal은 components/가 아니라 fieldInputDefinitions/ 아래; 뿌리 이름은 고민 중)

2026-10-14. 318라운드 지시를 원장 관리자가 "components/ 아래 열한 fractal"로 옮겨 적었는데, 소유자가 이것들은 컴포넌트가 아니라 FieldInputDefinition이라며 구획 이름을 fieldInputDefinitions로 정정했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| fieldInputs 자식은 components가 아니다 | 318라운드의 components/ 아래 열한 fractal | "components/ 하위가 아니라 fieldInputs/ 하위에 개별 프렉탈이 있어야 한다.\n그래서 packages/canard/schema-form/src/fieldInputs 이 이름도 적당하게 다른 이름이 되어야 하지 않나 싶다.. 기본 input 정의들이라.. \n\n디렉토리가 components 가 아닌 이유는 이게 컴포넌트가 아니라 FieldInputDefinition 이기 때문이다" (2026-10-14, 원장 세션) | 정정. 열한 개는 컴포넌트가 아니라 FieldInputDefinition이므로 components/ 구획이 아니다. 뿌리 이름 fieldInputs의 변경 여부는 소유자 고민 중(일단 유지). |
| 구획 이름은 fieldInputDefinitions | 자식 fractal의 자리 | "fieldInputs/fieldInputDefinitions\n하위에 프랙탈을 만들어도 되겠네 그럼" (2026-10-14, 원장 세션) | 확정. src/fieldInputs/fieldInputDefinitions/<FieldInputX>/ 아래에 열한 fractal. fieldInputDefinitions는 filid 기본 organ 이름이 아니므로 .filid/config.json의 structure.additionalOrganNames에 더한다(fixy08 직접). 그 밖은 318라운드대로. fixy08에게 전달. |

다음 라운드 번호는 321이다.
