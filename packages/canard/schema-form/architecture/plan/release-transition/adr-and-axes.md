# 별도 — 릴리스 전환 PR — ADR과 핵심 축

> 저장소 전체의 릴리스 장치다. 재설계의 원리와는 독립이며(LANDING-097), 지켜야 하는 것은 릴리스 항목과 저장소 규칙이다.

## 이 PR이 지켜야 하는 축

| 축 | 원장·규칙 | 이 PR에서의 뜻 |
| --- | --- | --- |
| C7·C8 — 메이저 버전급 변경과 이행 경로 | GOAL-020·021 | changesets가 `fixed` 무리와 프리릴리스를 표현할 수 있어야 한다(LANDING-002) |
| 릴리스 항목 9·10·11 | TEST-053·054·055 | changeset 존재 검사와 `changedFilePatterns`, 자리와 저장소 정리, 무리 밖 패키지의 자기 changeset |
| 저장소 규칙 — 판은 `package.json`에서 올리고 changeset·CHANGELOG는 쓰지 않음(오늘) | 루트 `CLAUDE.md` | 이 PR이 그 규칙을 바꾸므로 루트 `CLAUDE.md`·`scripts/PUBLISHING.md`를 같은 PR에서 고친다(문서가 코드와 같은 커밋) |
| 보이지 않는 배선은 밝힌다 | seiri `agent-legible` §1 | 작업 흐름 파일 머리에 무엇이 그것을 부르는지 한 줄 |

## ADR

- 직접 관련된 ADR은 없다. 0009(성능 예산)의 벤치 작업 흐름(`performance-benchmarks.yml`)은 건드리지 않는다.

## 이 PR에서 하지 않는 것

- 패키지 코드 변경, 발행. 우산 브랜치는 09 전에 배포하지 않는다(LANDING-159).
