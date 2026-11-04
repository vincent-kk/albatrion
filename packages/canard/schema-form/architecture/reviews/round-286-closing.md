# 286라운드 닫기 — PR #372(07f) 병합과 PR #354(07 전환) 1.0.0-beta 병합: 07단계 닫힘, 다음은 08단계(디렉터리·구성 다듬기)

2026-10-14. 285라운드에서 열어 둔 NaN defaultValue 경고는 debugger가 원인을 찾았다: `src/fieldInputs/FieldInputNumber.tsx:43`이 노드 값 NaN(원천 숫자 필드를 비우면 파생식 `'../source * 2'`가 `undefined * 2`)을 DOM defaultValue에 그대로 넘긴 것이며, 엔진의 NaN 보존은 현행 계약(numberBehavior DETAIL, VALUE-030·WRITE-075·WRITE-093)이라 표시 계층만 고쳤다. fixy07의 PR #372(codex 구현, failing-first 시험, storybook에서 "Received NaN" 3→0)를 원장 관리자가 diff를 읽고 squash 병합했다(3c1a7f2c3). 이어 tip의 전체 게이트를 확인하고 PR #354 본문을 최종 수치로 갱신한 뒤, 281라운드 소유자 답대로 #354를 1.0.0-beta에 병합했다(9c4d4a59d). 저장소가 squash만 허용해 merge commit은 거부되었고, 열세 PR의 커밋 참조를 살리기 위해 가지 feat/schema-form-switch는 지우지 않았다.

### 286C-01 07단계를 닫는다 — PR #354는 9c4d4a59d로 1.0.0-beta에 squash 병합되었고 가지는 보존, 07f(#372)는 3c1a7f2c3; 남은 소유자 결정은 대기열 50·40이며 둘 다 08단계에서 다룬다

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 최종 tip 3c1a7f2c3 게이트: unit·render·react18 3870 통과·todo 1(타이밍 시험 1건은 동시 부하에서 62 ms로 실패했다가 단독 재실행 통과 — 조용한 창 규칙 재확인), storybook 251, typecheck 0, lint 0, build, test:production 20, 플러그인 일곱(130·135·334·18·18·7·3), documents en·ko, G16 CONSUMER_BUNDLE_OK prod 289,358 B·dev 292,655 B, 공개 index.d.ts 07c와 동일. G23은 285C-01로 닫힘. 병합 방식은 저장소 설정(squash만 허용)이 정했고, 가지 보존은 #354 본문의 열세 PR 해시가 닿게 하려는 원장 관리자 결정이다. 버전 올리기는 소유자가 최종 단계로 미뤘다(276라운드 전 말).
- 근거: reviews/round-281-owner-answers.md; round-285-closing.md 285C-01; PR #372·#354 본문; debugger 진단(원장 세션); fixy07 보고.
- 다음: 08단계 계획을 282라운드 메모(최소 export 계약, nodeFromJSONSchema root export, FormContents 이름, 시험을 주인 fractal 안으로·면제 선언 제거)에서 세운다. 1.0.0-beta 위에서 진행한다.
