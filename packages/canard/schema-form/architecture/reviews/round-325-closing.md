# 325라운드 닫기 — 구조 리뷰 넷째 손질 PR #384 병합(307728a6d): fieldInputs는 내장 입력마다 fractal, 구획 이름은 fieldInputDefinitions

2026-10-14. fixy08이 318·320라운드 결정대로 구조-4를 마쳐 PR #384(커밋 넷: 문서 → git mv → 나눔 → filid 키)를 열었고, 원장 관리자가 확인 뒤 스쿼시 병합했다.

### 325C-01 #384를 병합한다 — 열한 fractal, barrel 없음, 공개 표면 94 동일, filid 0

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 확인: 세션·공동 저자 줄 0, 금지 경로 0, `.filid/config.json` 변경은 `structure.organNames`에 "fieldInputDefinitions" 한 항목(설치된 filid 0.14.0이 `additionalOrganNames`를 모르는 키로 버리고 indeterminate를 내므로 fixy08이 읽히는 키로 바꿈 — 저장소 규칙 문서 `.claude/rules/filid_fractal-boundaries.md` §1은 여전히 `additionalOrganNames`라 적혀 있어 플러그인 쪽 불일치, filid 개선 결정 재료), 루트 index diff 없음, 이름 바꿈 24·삭제 2; 결과 트리는 `fieldInputs/{INTENT,DETAIL,index.tsx,__tests__,fieldInputDefinitions/}`와 열한 fractal 각각 `index.ts`(Definition)·컴포넌트·`type.ts`(필요 시)·INTENT·DETAIL·`components/`·`utils/`. fixy08의 선택: array-memo 시험은 자기 진입점 대신 구체 컴포넌트를 import(U 간선 회피), `drafts.test.tsx`는 두 입력에 걸쳐 뿌리 `__tests__`에, FieldInputString 진입점은 Union이 감싸므로 컴포넌트도 내보냄, `DateInputType` 등 지역 형은 각 `type.ts`로, 벤치 스크립트 하나의 경로 갱신. 게이트(한 번): typecheck·lint 0, 65파일 423 통과(가드 둘 포함), 표면 94 동일, filid validate 0. 병합 결과 1.0.0-beta는 307728a6d. 이로써 소유자 구조 리뷰 손질 1–4가 모두 들어갔고 작업자 둘은 대기한다(324라운드).
- 근거: PR #384(fixy08 보고, 2026-10-14); `reviews/round-318-owner-answers.md`, `round-320-owner-answers.md`.
- 다음: 소유자의 추가 손질이나 밤 루프 결정을 기다린다.
