# 별도 — 릴리스 전환 PR (원장 LANDING-097)

> 원장 정본: LANDING-097. 이 문서는 읽기 표면이며, 어긋나면 원장이 이긴다.

## 목적

저장소 전체의 릴리스 장치를 재설계와 독립으로 정리한다. 우산 브랜치가 아니라 `master`에 직접 연다.

## 우산 안의 자리

- 의존: 없음. PR-0과 순서가 없고, PR-8 전에 병합한다(LANDING-097). 시점은 소유자가 정한다(P4).

## 범위 — 원장이 정한 내용

- changesets 가동, 지속 통합 시험 작업 흐름과 루트 `lint`·`typecheck`·`test` 스크립트, `publish-npm-packages.yml`의 작업 다섯, 포장 스크립트 분리와 릴리스 테스트 재작성, 판 올림 스크립트 정리와 루트 `CLAUDE.md`·`scripts/PUBLISHING.md` 개정(LANDING-097).
- 이것이 먼저 들어오면 기반 PR이 `test.yml`에 vitest 세 프로젝트와 playwright chromium 단계를 더한다(LANDING-090).

## 검증 게이트

- CI 작업 흐름이 `master`에서 초록, 포장 스크립트로 만든 산출물이 릴리스 테스트를 통과.
- 오늘의 발행 절차(루트 `CLAUDE.md`: 판은 `package.json`에서 직접 올리고 changeset·CHANGELOG는 쓰지 않음)와의 차이를 `scripts/PUBLISHING.md`에 적고 소유자가 확인.

## 완료 기준

- [ ] changesets와 CI 작업 흐름
- [ ] 포장·릴리스 테스트 스크립트
- [ ] 루트 `CLAUDE.md`·`scripts/PUBLISHING.md` 개정

## 원장 항목 색인

- LANDING-097 릴리스 전환(별도 PR) — changesets 가동과 CI·배포 작업 흐름 정리, PR-8 전에 병합
- LANDING-090 보정 PR-0 — 릴리스 전환 PR 뒤라면 `test.yml`에 vitest 세 프로젝트와 playwright chromium 단계
