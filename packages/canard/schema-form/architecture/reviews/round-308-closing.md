# 308라운드 닫기 — filid 개선 요청을 ogham 이슈 #143으로 등록했다(289라운드 D6 "그때 올려줘")

2026-10-14. 정돈-2 병합 뒤 fairy08이 이슈 초안(`tidy-docs/03-filid-issue.md`)의 수치를 fd2a56c2f로 다시 세어 https://github.com/vincent-kk/ogham/issues/143 으로 등록했다. 원장 관리자가 등록을 확인했다(열림, 라벨 없음, 제목은 초안 그대로).

### 308C-01 이슈 #143 등록을 기록한다 — 수치는 정돈-2 뒤 트리 기준이고, B8 사례·mock 경로 제안·훅 차단 사례를 더했다

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 등록된 수치: 모델 검사 변 3743→3971; 시험 쪽 위로 닿기 253(D7 안 69)→77(전부 D7 세 디렉터리에서 루트 index로, D7 밖 0), 아래로 60→0, 옆으로 24→0; 제품 위로 1·아래로 1→0·0; 제품 organ→자식 27변과 settle↔derive 순환은 정돈-3 몫이라 그대로; index는 정돈-1 뒤 53항목(17 진입점)에서 48항목·43이름 삭제, 남은 5항목·4이름은 DETAIL 선언; 오류 코드 상수 37은 정돈-E 몫; 바깥 소비자 없는 뿌리 파일 0 유지; fractal 52→51(app이 organ으로). 본문에 더한 것: B8 첫 사례(부모 수준 비교 시험이 자식 내부를 vi.mock 경로로 집음, 선언 `src/core/engine/DETAIL.md:33`), 모듈 mock 경로도 의존 변으로 보고하자는 adapter 제안(filid가 이미 보는지는 미확인으로 적음), fractal→organ 강등 때 훅이 INTENT·DETAIL 삭제를 한 번 막은 사례, F3(config 면제가 통과로 셈)은 fd2a56c2f의 `.filid/config.json`에 면제가 남아 있음을 확인하고 유지. 모델 문서와 계보 감사는 fd2a56c2f 고정 링크로만 가리킨다. 이 이슈는 소유자가 마지막에 내릴 filid 개선 결정(294라운드)의 재료이며, 결정이 바뀌면 이슈 본문을 고친다.
- 근거: fairy08 보고(2026-10-14); `reviews/round-289-owner-answers.md`(D6); `reviews/round-307-closing.md` 307C-03.
- 다음: 없음. 병합된 PR의 워크트리 둘(stage-docs-api·stage-tidy-2)은 정리한다(fixy08이 정돈-3 착수 때 stage-tidy-2를 지움).
