# 315라운드 닫기 — 소유자 Form 재구성 PR #379 병합: 구조 리뷰의 첫 손질이 들어갔고, 이 모양이 표준 틀이다

2026-10-14. 314라운드의 소유자 재구성을 fairy08이 문서화·이름 정리해 PR #379를 열었고(커밋 셋: 소유자 변경 그대로 → 문서 → 이름 변경), 원장 관리자가 확인 뒤 스쿼시 병합했다.

### 315C-01 #379를 병합한다 — 여섯 fractal에 INTENT·DETAIL(한국어), 이름 함정 해소, 공개 export 불변

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 확인: 병합 상태 CLEAN, 커밋에 세션·공동 저자 줄 0, 여섯 fractal(`FormCore`·`FormError`·`FormField`·`FormInput`·`FormLabel`·`FormRender`)이 각각 `index.ts`·`type.ts`·INTENT·DETAIL(한국어, behaviors fractal의 형식)을 갖고 filid validate가 `src/components/Form` 아래 0건으로 분류; 바운더리 입힌 바깥은 `FormCore.tsx`의 `FormCore`, 바운더리 없는 안쪽은 `FormRoot`이며 index는 별칭 없음; 공개 export(Form과 형 여덟)는 세 index 파일에 diff 없음; typecheck·lint·Form 시험 18파일 60건 통과(310라운드대로 전체 시험은 돌리지 않음). 편차 하나: `FormRoot.tsx`는 `FormCore` 뿌리가 아니라 `FormCore/components/`에 있다 — 뿌리에 동명 구현(`FormCore.tsx`) 외의 구현 파일이 있으면 zero-peer-file 결과가 나므로 모델(뿌리는 문서·진입점·동명 구현 하나)대로이고, 소유자가 뿌리에 두기를 원하면 `.filid/config.json` 면제가 필요하다. 이 모양("fractal 뿌리에는 문서·index·동명 조립 파일만; 자식은 `components/<이름>/` 아래 `index.ts`·`type.ts`·구현과 그 자식만 쓰는 `utils/`·`components/`")을 구조 리뷰의 표준 틀로 삼는다(소유자 "이 형태로 가면 좋겠다"). 비용은 한 파일짜리 fractal에도 문서 둘이 붙는 것이며 받아들인다. 병합 뒤 fixy08의 정돈-E는 옮겨진 `submitForm.ts` 때문에 rebase가 필요하다(알림 보냄).
- 근거: PR #379(fairy08 보고, 2026-10-14); `reviews/round-314-owner-answers.md:7`; `.claude/rules/filid_fractal-boundaries.md` §4.
- 다음: 소유자가 다음 손질을 하면 같은 방식(스테이징 → 패치 → 워크트리 → fairy08 문서·정리 → PR)으로 받는다. 패키지 전체 filid 결과의 둘(FieldInputSlot↔FieldProxy 형 전용 순환, `getAbsolutePointer.test.ts` 58건 대 상한 32)은 구조 리뷰 항목으로 남긴다.
