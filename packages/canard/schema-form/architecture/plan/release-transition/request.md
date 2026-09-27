# 별도 — 릴리스 전환 PR — 개발요청서

> 원장 정본: LANDING-097, LANDING-090(기반 PR과의 순서), TEST-053·054·055. 어긋나면 원장이 이긴다.

## 우산 안의 자리

- 우산이 아니라 `master`에 직접 연다. 저장소 전체의 일이라 재설계와 독립이다. 의존 없음. 09 전에 병합한다(LANDING-097). 시점은 소유자가 정한다(LANDING-204).

## 목적

저장소의 릴리스 장치를 정리한다: changesets 가동, CI 시험 작업 흐름, 포장·릴리스 테스트 스크립트, 판 올림 절차와 문서.

## 범위 — 원장이 정한 내용

- changesets 가동, 지속 통합 시험 작업 흐름과 루트 `lint`·`typecheck`·`test` 스크립트, `publish-npm-packages.yml`의 작업 다섯, 포장 스크립트 분리와 릴리스 테스트 재작성, 판 올림 스크립트 정리와 루트 `CLAUDE.md`·`scripts/PUBLISHING.md` 개정(LANDING-097). changeset 존재 검사와 `changedFilePatterns`(TEST-053), 무리 밖 패키지의 자기 changeset(TEST-055).
- 이것이 먼저 들어오면 02가 `test.yml`에 vitest 세 프로젝트와 playwright chromium 단계를 더한다(LANDING-090).

## 착수 전 확인

- 오늘의 발행 절차(루트 `CLAUDE.md`: 판은 `package.json`에서 직접 올리고 changeset·CHANGELOG는 쓰지 않음)와의 차이를 `scripts/PUBLISHING.md`에 적고 소유자가 확인한다.

## 산출물과 완료 기준

- [ ] changesets와 CI 작업 흐름(`test.yml`)
- [ ] 포장·릴리스 테스트 스크립트
- [ ] 루트 `CLAUDE.md`·`scripts/PUBLISHING.md` 개정

## 절차 (seiri·filid)

- 저장소 설정과 스크립트의 변경이다. 스크립트는 한 파일에 한 책임(seiri structure), 작업 흐름 파일 머리에 무엇이 그것을 부르는지 한 줄(agent-legible §1).

## 원장 항목 색인

- LANDING-097 릴리스 전환(별도 PR)
- LANDING-090 보정 PR-0 — `test.yml`의 vitest 세 프로젝트와 playwright chromium 단계
- TEST-053 릴리스 9 — changeset 존재 검사와 changedFilePatterns
- TEST-054 릴리스 10 — 자리와 저장소 정리 — 별도 PR, PR-8 전에 병합
- TEST-055 릴리스 11 — 무리 밖 패키지의 자기 changeset
