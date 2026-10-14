# 258라운드 — Vincent의 답 (개선-38 다섯 결정과 후보 C 확정; 추가 논의 셋 — factory가 본체인가, components/SchemaNode의 이름, SchemaNode → FieldNode)

2026-10-14. 257라운드 덧붙임(설명 문서 이름 갱신) 뒤 원장 관리자가 개선-38의 다섯 결정과 후보 모양을 물었고 소유자가 원장 세션에서 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 다섯 결정과 후보 | core 이름 / validation 계약 수출 자리 / 미사용 helpers 셋 / helpers·components 승격 / app/constants 자리 / 후보 모양 | "1. core 이름을 두죠.\n2.  engine 수출 + core 재수출\n3. 불필요하다면 지우세요.\n4. 프렉탈로 올리세요 \n5. 네 제안했던 구조로 갑니다.\n\n구조는 C 로 가요. \n\n다만 몇 가지 추가 요청이 있습니다.\n\n1. core 하위의 SchemaNode 가 직접 new 되는 경우보다는 factory 를 통해서 생성되는 경우가 대부분이라면, factory 가 본체 아닌지? 오히려 SchemaNode 는 구현체고, factory 가 인터페이스의 주류가 아닐까 싶은데.\n\n2. packages/canard/schema-form/src/components/SchemaNode 에서 이 디렉토리 이름이 SchemaNode 가 맞는가? 오히려 FieldProxy 나 FieldNodeProxy 같은 이름이 더 적절하지 않은지?\n\n3. SchemaNode 라는 이름이 적절할까? 오히려 Field 라고 네이밍을 바꾸면서 이것도 FieldNode 로 바꾸는게 어떤가? \n\n이들에 대해서 추가로 논해보자" | 결정: core 유지; validation 계약 넷은 engine 진입점 수출 + core/index 재수출; 소비자 0인 helpers 셋(defaultValue·dynamicExpression·jsonSchema) 삭제; helpers·components를 진입점 있는 fractal로; app/constants → src/constants; 후보 C(core/{engine, surface}). 추가 논의 셋은 원장 관리자가 코드 사실로 답한 뒤 결정 |

다음 라운드 번호는 259이다.
