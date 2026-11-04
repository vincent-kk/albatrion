# 326라운드 — Vincent의 물음과 결정 (Field fractal의 본체는 FieldProxy이므로 이름을 FieldProxy로; 병합 뒤 약식 전체 게이트)

2026-10-14. 구조 손질 1–4 뒤 소유자가 components/Field의 이름을 물었고(출력이 FieldProxy 하나면 fractal 이름도 FieldProxy여야 함), 원장 관리자의 제안을 승인하며 약식 전체 게이트를 지시했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| Field의 본체는 FieldProxy | components/Field의 index가 FieldProxy 하나를 내보냄 | "아.. 근데 Form 처럼, 출력되는게 FieldProxy 하나면 Field가 아니라 FieldProxy 로 해야하는거 아닌가? 프렉탈의 본체가 FieldProxy잖아" (2026-10-14, 원장 세션) | 물음. 원장 관리자의 답: 맞다 — index는 FieldProxy(와 형 ChildField)만 내보내고 FieldInputSlot·DeferredFieldProxy는 FieldProxy의 내부 부품(FieldProxy가 FieldInputSlot을 import, 바깥 소비자는 FieldProxy만). 제안: components/Field → components/FieldProxy, 뿌리에 동명 구현 FieldProxy.tsx, 부품 둘은 FieldProxy/components/ 아래. Form의 자식 다섯(독립 컴포넌트)과 달리 본체 아래에 둔다. |
| 다섯째 손질 진행, 약식 전체 게이트 | 위 제안 | "음 응 진행시켜봐. 이거까지 머지하고 전체 게이트를 한번 돌려.\n게이트는 너무 오래걸리지 않게 약식으로 돌리고, 문제가 생기면 그때 자세히 하도록" (2026-10-14, 원장 세션) | 확정. 구조 손질 5(Field → FieldProxy fractal)를 fixy08이 직접; 병합 전 전체 게이트는 약식(typecheck·lint·unit·render·react18 한 번·표면 열거 94·filid 0; 스토리북·플러그인·documents·production은 생략) — 문제가 생기면 그때 자세히. |

다음 라운드 번호는 327이다.
