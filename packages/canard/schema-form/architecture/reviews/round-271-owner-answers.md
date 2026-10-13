# 271라운드 — Vincent의 답 (대기열 46 승인: helpers·components는 fractal로 올리지 않고 compartment로 둔다 — 264라운드 결정 4 번복)

2026-10-14. 270라운드 뒤 C 재배치 계획의 verifier 대조(F11)에서 helpers·components를 fractal로 올리면 경계 위반과 순환이 생긴다는 지적이 나와 원장 관리자가 대기열 46으로 올리고 번복을 권고했고, 소유자가 원장 세션에서 중간 결정으로 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 대기열 46 | helpers·components를 compartment로 두는 권고 승인 여부 | "잠깐 중간 결정 해줄게. compnents 랑 helpers 를 프렉탈이 아니게 하는 결정, 승인할게" | 271C-01: `src/helpers`·`src/components`는 INTENT/DETAIL/index 없는 관례 이름 compartment로 두고, 그 안의 자식 fractal(error, fieldInputDefinition, jsonPointer, schemaIdentity, schemaIntersection, virtualization, warning / FallbackComponents, Field, Form)은 그대로. 264라운드 결정 4는 이 답으로 바뀜. 미사용 helpers 셋 삭제는 그대로. 07c 계획 9.5절 확정, 대기열 46 닫음 |

다음 라운드 번호는 272이다.
