# 우산 순서 N+2 — 정리와 릴리스 (원장 PR-8)

> 원장 정본: LANDING-068(정의), LANDING-096(보정), LANDING-121(reset 문서), TEST-026·027·031(벤치), LANDING-097(릴리스 전환 PR이 먼저). 이 문서는 읽기 표면이며, 어긋나면 원장이 이긴다.

## 목적

베타 라인을 닫을 준비: 문서 재작성, 벤치 재실행, 릴리스 테스트, 판 번호. 소유자의 "정리 PR"(벤치마크·문서화·스캐폴드·레거시 정리)이 이 단계다. 레거시 엔진 디렉토리는 PR-7이 지웠으므로(P2), 여기의 레거시 정리는 옛 스토리 잔여·옛 설계문서 백업·스파이크·벤치 기준선 정리로 한정한다.

## 우산 안의 자리

- 의존: N+1 플러그인 PR, 그리고 릴리스 전환 PR(LANDING-097)이 `master`에 들어와 있어야 한다.
- 이 PR이 병합되면 우산 PR을 `master`로 병합한다(원샷 둘째, LANDING-058).

## 범위 — 원장이 정한 내용

- README·docs 재작성, ADR 0010 최종, 이주 안내와 이주 프롬프트(`docs/agents`), README·docs의 reset 규칙과 `onError` 코드 표(코드, level, 부류, 언제, 누구 잘못, 기본 드러남)와 판 규칙(LANDING-068). reset 문서가 적는 것: 같은 스키마의 판정, prop을 읽는 때, 노드 참조가 이어지는 조건, 늦은 쓰기는 `onChange`로, `dirty`(LANDING-121). 스토리북 문서(LANDING-096).
- changeset(파괴적 변경, `fixed` 무리 전체 `major`; 1.0.0-beta 프리릴리스 뒤 1.0.0)과 `CHANGELOG.md`, 포장된 산출물의 릴리스 테스트(LANDING-068·096).
- 릴리스 전 벤치 재실행(LANDING-096): 옛 판 기준선(TEST-031) 대 새 판(TEST-026), 느린 항목은 이유와 소유자 수용(TEST-027). 모바일 안전 임계는 PR-7 뒤 같은 조건으로 다시 재어 잰 사실만 적는다(TEST-074).
- 정리: 옛 스토리 처분표의 잔여, `architecture/` 옛 문서의 `_archive/`(설계 PR이 옮기지 않았다면), 스파이크 가운데 e2e로 이식되지 않은 것의 처분, 벤치 결과 파일 정리, 패키지 `CLAUDE.md`와 루트 `CLAUDE.md`의 인벤토리 동기화.

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal

코드 변경은 없다. 문서·스토리·벤치·설정만.

## 레거시 이동

없음(PR-7이 지웠다). 남은 것은 위의 정리 목록.

## 착수 전 닫을 것

릴리스 전환 PR의 병합(LANDING-068·097).

## 검증 게이트 — 이 PR이 독립적으로 통과해야 하는 것

- 포장된 산출물의 릴리스 테스트(빌드 결과 `dist/`를 소비자처럼 설치해 시나리오 한 벌).
- 벤치 재실행 보고와 소유자 수용.
- 문서의 코드 표가 ERROR-164의 현행 행과 일치(기계 대조), reset 규칙이 LANDING-121의 목록을 모두 든다.
- changeset·판 번호가 `fixed` 무리 전체에 걸림, `CHANGELOG.md` 생성.

## 완료 기준

- [ ] README·docs·`docs/agents`·스토리북 문서
- [ ] changeset·`CHANGELOG.md`·릴리스 테스트
- [ ] 벤치 재실행 보고
- [ ] 정리 목록 처분
- [ ] 우산 PR `master` 병합 준비

## 원장 항목 색인 (결정·보충에 PR-8를 든 현행 항목, 기계 추출)

- ERROR-032 착수 조건과 PR 배치
- EVENT-063 명령 넷은 공개 노드 메서드 — `FormHandle`은 넷 모두 대칭, 공개 `publish` 없음
- EVENT-069 C-10의 사용 규칙은 README가 소유 — 이주 안내에는 README를 가리키는 한 줄, 작성은 PR-8
- LANDING-002 판 번호는 1.0.0-beta 프리릴리스 뒤 1.0.0
- LANDING-068 PR-8 릴리스 — README·docs, ADR 0010 최종, 이주 안내와 프롬프트, changeset과 `CHANGELOG.md`, 릴리스 테스트
- LANDING-096 보정 PR-8 — 릴리스 전 벤치 재실행, changeset과 판 번호, 릴리스 테스트, reset 규칙 문서, 스토리북 문서
- LANDING-097 릴리스 전환(별도 PR) — changesets 가동과 CI·배포 작업 흐름 정리, PR-8 전에 병합
- LANDING-121 PR-8의 reset 문서가 적는 것 — 같은 스키마의 판정, prop을 읽는 때, 노드 참조가 이어지는 조건, 늦은 쓰기, `dirty`
- LANDING-125 이주(S1) — 파서의 강제 변환이 빠지고, 바꾸지 못한 값은 `NaN` 대신 받은 그대로 든다
- LANDING-159 레거시는 `src/__legacy__/` — 상대 경로 유지, PR마다 옮김, 새 fractal의 가져오기 금지, PR-7 통째 삭제, 시험 글롭 포함, filid 깊이 점검, 스토리북·벤치
- SCHEMA-046 merge를 돕는 순수 함수와 위치 불일치 경고 helper는 제공하지 않는다 — merge는 소비자가, 방법은 이주 안내와 배포 문서(PR-8)
- TEST-053 릴리스 9 — changeset 존재 검사와 changedFilePatterns
- TEST-054 릴리스 10 — 자리와 저장소 정리 — 별도 PR, PR-8 전에 병합
- TEST-055 릴리스 11 — 무리 밖 패키지 — @winglet/common-utils·@winglet/react-utils의 자기 changeset
- TEST-058 릴리스 14 — PR-8의 판 번호 — 1.0.0-beta 뒤 1.0.0
- VALUE-033 nullable이 아닌 노드의 `null`은 바꾸지 않고 방출 — 경고등·경고, 검증기가 있으면 형 에러로 제출 막힘, 해법은 스키마에 nullable, 이주 항목과 PR-8 문서에 적음

## 원장이 PR-8에 배정한 게이트 (기계 추출; 원문은 `ledger/`와 `reviews/round-18-closing.md`)

게이트를 제목에 든 항목:

- 없음

18라운드 닫기 블록의 게이트 줄:

- 없음
