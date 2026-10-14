# 322라운드 닫기 — 구조 리뷰 둘째·셋째 손질 PR #382 병합(496148de7): constants organ, organ 안 barrel 제거, Field는 Form 모양, surface/runtime

2026-10-14. fairy08이 316·317라운드 결정을 한 브랜치에 네 커밋(손질마다 문서 → 코드)으로 모아 정돈-E·S 위에 rebase한 뒤 PR #382를 열었고, 원장 관리자가 확인 뒤 스쿼시 병합했다.

### 322C-01 #382를 병합한다 — 삭제는 barrel 둘뿐, 이름 바꿈 39건, 루트 index 불변, 가드 넷 0

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 확인: 세션·공동 저자 줄 0, 금지 경로 0, 삭제는 `constants/index.ts`와 `Form/components/index.ts` 둘뿐, 이름 바꿈 39건(Field 자식 셋이 `components/` 아래로, surface의 `classes/`가 `runtime/`으로 보조 둘과 함께), `src/index.ts` diff 없음; 결과 트리는 `components/Field/{components,__tests__,index,INTENT,DETAIL}`, `core/surface/{runtime,utils,…}`, `hooks`는 fractal 그대로(B1 때문에 organ으로 내리지 않음 — fairy08 지적, 편집자 결정 A, 소유자 보고). fairy08 게이트: typecheck·lint·63파일 325시험(가드 U·D·S1·B1 모두 0, #379의 D 간선 해소)·filid validate(기존 둘만 남음)·Prettier. rebase 충돌은 `fieldNodeFactory.ts` import 블록 하나(정돈-E 쪽 유지, 경로만 `../runtime/FieldNode`). 병합 결과 1.0.0-beta는 496148de7. 구조 리뷰에서 지금까지 들어간 것: Form(#379), constants·Form barrel·Field·surface runtime(#382); 진행 중: fieldInputs(구조-4, fixy08), CLAUDE.md(정돈-4, fairy08).
- 근거: PR #382(fairy08 보고, 2026-10-14); `reviews/round-316-owner-answers.md`, `round-317-owner-answers.md`; `fca-import-model.md` §2 B1.
- 다음: 구조-4와 정돈-4 PR을 이어서 병합한다.
