# 별도 — 릴리스 전환 PR — 검증 구성요건

## 게이트

- CI 작업 흐름이 `master`에서 초록(`lint`·`typecheck`·`test`).
- 포장 스크립트로 만든 산출물이 릴리스 테스트를 통과(오늘의 패키지 하나로 시험).
- changeset 존재 검사가 `changedFilePatterns`대로 동작(TEST-053), 무리 밖 패키지의 changeset이 따로 잡힘(TEST-055).
- `scripts/PUBLISHING.md`의 절차를 소유자가 확인.

## 합격 판정

- 위 넷 통과. 발행은 하지 않는다(우산 브랜치는 09 전에 배포하지 않음, LANDING-159).

## 리뷰 체크리스트 (PR 본문에 옮긴다)

- [ ] CI 로그
- [ ] 릴리스 테스트 로그
- [ ] changeset 검사 시연
- [ ] `PUBLISHING.md`와 루트 `CLAUDE.md`의 차이 표
