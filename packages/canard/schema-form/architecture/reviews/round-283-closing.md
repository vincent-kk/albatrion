# 283라운드 닫기 — PR #370(07d) 병합: 소유자 276·280라운드 결정 다섯 반영(47 문서 안내, CLAUDE.md:142, 38 추측 없는 label id 규약, 45 원칙 문장, 48 플러그인 시험, 49 이름 열거·면제 선언), 39는 대기열 50으로 제외

2026-10-14. fixy07이 217C-01대로 코드는 codex, 문서는 직접 작성해 PR #370을 열었고(첫 head 9704c2e52), 원장 관리자의 직접 게이트와 agy 대조는 통과였으나 독립 verifier가 FAIL(스키마 모양으로 묶음을 판정하는 helper가 실제 입력 선출과 어긋남; engine·settle DETAIL 면제 제목에 경로 없음)을 냈다. 소유자가 280라운드에 "자유도를 해치지 않고 사용 방식에 따라 맞추게" 답해 설계를 추측 없는 규약으로 바꿨고, 제목 id는 형제 이름과 겹칠 수 없는 `label:${path}`로 정했다(접두어 결정은 원장 관리자). 새 head a6018836b에서 verifier PASS(낮은 지적만), 원장 관리자가 squash 병합했다(0b879e594).

### 283C-01 PR #370을 병합했고, 낮은 후속 넷(45 원칙 문장의 주어, 플러그인 FormGroup label id, 형제 충돌 시험 강화, skills 문서의 옛 접미어)은 Prettier 서식과 함께 다음 작은 PR(07e)로 보낸다

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 게이트는 원장 관리자가 직접 돌렸다: unit·render·react18 3867(통과 3866·todo 1), storybook 251, test:production 20, typecheck 0, lint 0, build, G16 CONSUMER_BUNDLE_OK prod 289,269 B·dev 292,566 B(07c 대비 +158 B, label id 규약), 공개 index.d.ts 07c와 바이트 동일, dist의 옛 이름 `__legacy__` 밖 0, `${path}-label` 잔존 0. 플러그인 일곱은 fixy07 수치(130·135·334·17·17·7·2). verifier(opus)는 첫 head에서 FAIL 둘을 찾아 고치게 했고 새 head에서 PASS; agy(session 264b398c)는 문서 en·ko 대조 차단 없음. 38의 최종 규약: 제목 label은 항상 `htmlFor={path}`와 `id="label:${path}"`(루트 `label:`, path 없으면 id 없음), 내장 checkbox·radio 묶음은 `role="group" aria-labelledby="label:${path}"`, 사용자 정의 FieldInput·FieldRenderer는 같은 규약으로 스스로 맞춘다. 39(게이트 없는 oneOf 분기 terminal)는 verifier가 반쪽 규칙임을 보여 대기열 50의 소유자 결정으로 미뤘다.
- 근거: reviews/round-276-owner-answers.md, round-280-owner-answers.md, round-281-owner-answers.md; PR #370 본문; verifier 보고 둘(원장 관리자 세션); agy 보고(session 264b398c); owner-queue-07.md 38·45·47·48·49·50.
- 다음: fixy07이 07e(Prettier 다섯 파일 + 낮은 넷)를 연다. fairy07의 G23 결과를 받아 #354 병합 여부를 정한다(281라운드).
