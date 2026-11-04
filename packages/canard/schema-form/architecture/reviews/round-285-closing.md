# 285라운드 닫기 — G23 브라우저 게이트 닫힘: fairy07이 ego-browser로 tip 89898d107의 스토리 251개를 전부 돌려 finished 251·실패 0, 자동 게이트 251 통과

2026-10-14. 276라운드 소유자 답("ego 브라우저로 직접 한번 돌려라")과 277라운드 교정("스토리 도는건 너 말고 다른애 시켜")대로 fairy07이 돌렸다. 첫 실행(spaceId 38, 4da9567ea 트리)은 원장 관리자가 준 스크립트의 대기 조건이 storybook 10.4의 끝 단계 `finished`를 빠뜨려(`completed`는 지나가는 단계) 251개 전부 시간 초과로 무효였고, 소유자가 도중에 task space를 끝냈다. 조건을 고친 재실행(spaceId 39, tip 89898d107, 포커스 에뮬레이션 켬, 스토리당 15초)은 251개 전부 `finished`, errored·aborted·시간 초과·오류 표시 0건이었다. `@vitest/browser/context`를 쓰는 네 스토리(browser-gates의 ImeComposition·NumberBadInput, composite CX11·CX04)는 일반 스토리북에서 skip 경로로 finished. 자동 게이트(`vitest run --project storybook`, tip, 단독): 100파일·251 통과, act 경고 없음.

### 285C-01 G23을 닫는다 — 실제 브라우저(ego-browser, spaceId 39)에서 251개 전부 finished·실패 0, 자동 게이트 251 통과; 실제 macOS IME 3행은 처음부터 소유자 몫이며(174C-01) 이번에도 에이전트가 치지 않았다

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 G23의 정의는 "실제 브라우저에서 돌린다"였고 소유자가 실행 주체를 ego-browser를 쓰는 에이전트로 정했으므로(276·277라운드) 이 결과로 닫는다. 결과 파일: fairy07 scratchpad `g23/results-tip.json`(ego 251건)과 tasks `b1k1pxl83.output`(자동 게이트). 관찰 하나는 열어 둔다: React 경고 "Received NaN for the `defaultValue` attribute"가 세 스토리(features/derivation/derived-and-watch > Derived Chain Manual Edits, scenarios/derive > watch-values, composite/cx10-inject-chain-in-batch > Case)에서 나오며 시험은 통과한다 — 원장 관리자가 debugger에게 원인을 맡겼고 결함이면 1.0.0-beta 위 후속 PR로 고친다. 첫 실행의 대기 조건 오류는 원장 관리자의 스크립트 잘못이다.
- 근거: reviews/round-276-owner-answers.md, round-277-owner-answers.md; fairy07 보고 둘(원장 세션); round-174-closing.md 174C-01(IME 3행은 소유자).
- 다음: tip 전체 게이트 수치로 PR #354 본문을 갱신하고 281라운드대로 #354를 병합한다.
