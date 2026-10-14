# 314라운드 — Vincent의 결정 (소유자가 직접 바꾼 Form 구조: components/ 아래 여섯은 fractal, 이름 함정은 오타, 문서화·INTENT는 위임, INTENT.md는 한국어)

2026-10-14. 소유자가 구조 리뷰의 첫 손질로 Form fractal을 직접 바꿔 스테이징했다(뿌리에는 문서·index·Form.tsx만; FormRoot·FormRootProxy·FormChildrenRenderer·createChildren·submitForm·type.ts와 Form.tsx의 오류 바운더리 래핑이 components/FormCore/로; Form.Render·Field·Label·Input·Error 다섯은 각각 index.ts·type.ts를 가진 디렉터리로). 원장 관리자가 읽고 셋을 물었다: 여섯 디렉터리의 분류(fractal이면 INTENT·DETAIL 필요), FormCore.tsx의 심볼이 FormRoot이고 index가 별칭으로 내보내는 이름 함정, DETAIL 47행의 옛 위계. 소유자의 답이 이것이다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| Form 재구성: 여섯은 fractal, 문서는 위임 | 여섯 디렉터리 분류·이름 함정·DETAIL 갱신 | "1. 프렉탈이야. \n2. 땡큐 누락 오타네. \n3. 응 문서화랑 기타 정리, INTENT.md 추가 등은 맡기고 싶어.\n\nINTENT.md 는 한국어로 써야돼. \n\n작업을 해줘." (2026-10-14, 원장 세션) | 확정. (1) components/ 아래 여섯(FormCore·FormError·FormField·FormInput·FormLabel·FormRender)은 모두 fractal — 각각 INTENT.md·DETAIL.md를 한국어로 더한다. (2) 이름 함정은 오타 — 바운더리 없는 안쪽은 FormRoot.tsx의 FormRoot, 바운더리 입힌 바깥은 FormCore.tsx의 FormCore, index는 별칭 없음. (3) 문서화와 정리는 fairy08에게 위임: 소유자의 스테이징 변경을 워크트리 stage-form-fractals(브랜치 feat/schema-form-form-fractals, 커밋 2d074b321)로 옮겨 그 위에서 문서 → 이름 변경 순으로 커밋하고 PR, 원장 관리자 병합. 게이트는 typecheck·lint·Form 시험·filid validate만(310라운드). 공개 export(Form과 형 여덟)는 그대로. |

다음 라운드 번호는 315이다.
