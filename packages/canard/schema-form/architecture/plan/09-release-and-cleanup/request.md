# 09 정리와 릴리스 — 개발요청서 (원장 PR-8)

> 원장 정본: LANDING-068(정의)·096(보정), LANDING-121(reset 문서), LANDING-205(레거시 삭제는 여기), TEST-026·027·031(벤치), LANDING-097(릴리스 전환 PR이 먼저). 어긋나면 원장이 이긴다.

## 우산 안의 자리

- 우산 순서 09, 마지막 자식 PR. base `1.0.0-beta`, 브랜치 제안 `chore/schema-form-release-and-cleanup`. 의존 08과 릴리스 전환 PR(`master`).
- 이 PR이 병합되면 우산 PR #344를 `master`로 병합한다(원샷 둘째, LANDING-058).

## 목적

베타 라인을 닫을 준비: 문서 재작성, 벤치 재실행, 릴리스 테스트, 판 번호, 그리고 레거시 정리. `src/__legacy__/`는 여기서 지운다(LANDING-205). 우산에 딸려 들어온 무관한 파일은 정리하지 않는다(LANDING-205).

## 범위 — 원장이 정한 내용

- README·docs 재작성, ADR 0010 최종, 이주 안내와 이주 프롬프트(`docs/agents`), reset 규칙(LANDING-121: 같은 스키마의 판정, prop을 읽는 때, 노드 참조가 이어지는 조건, 늦은 쓰기는 `onChange`로, `dirty`), `onError` 코드 표(코드, level, 부류, 언제, 누구 잘못, 기본 드러남)와 판 규칙(LANDING-068). 스토리북 문서(LANDING-096). C-10 사용 규칙은 README가 소유(EVENT-069). `merge` 방법은 이주 안내에(SCHEMA-046). nullable 아닌 노드의 `null` 안내(VALUE-033).
- changeset(파괴적 변경, `fixed` 무리 전체 `major`; 1.0.0-beta 프리릴리스 뒤 1.0.0, LANDING-002)과 `CHANGELOG.md`, 포장된 산출물의 릴리스 테스트(LANDING-068·096, TEST-053·055·058).
- 릴리스 전 벤치 재실행(LANDING-096): 옛 판 기준선(TEST-031) 대 새 판(TEST-026), 느린 항목은 이유와 소유자 수용(TEST-027). 모바일 안전 임계는 같은 조건으로 다시 재어 잰 사실만(TEST-074).
- **레거시 삭제**(LANDING-205): `src/__legacy__/`와 그것을 가리키는 것이 하나도 없음을 확인하고 디렉토리를 지운다. 옛 스토리 처분표의 잔여, 스파이크 가운데 e2e로 이식되지 않은 것의 처분, 벤치 결과 파일 정리, 패키지 `CLAUDE.md`와 루트 `CLAUDE.md`의 인벤토리 동기화.

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal

코드 변경은 레거시 삭제뿐. 나머지는 문서·스토리·벤치·설정.

## 레거시

`src/__legacy__/` 삭제. 점검은 "그 디렉토리와 그것을 가리키는 import가 하나도 없는 것"(LANDING-159의 점검 문장, 시점만 이 PR로).

## 착수 전 확인

- 릴리스 전환 PR이 `master`에 병합돼 있다(LANDING-068·097).
- 08이 `1.0.0-beta`에 들어와 있다.

## 산출물과 완료 기준

- [ ] README·docs·`docs/agents`·스토리북 문서, reset 규칙, 코드 표
- [ ] changeset·`CHANGELOG.md`·릴리스 테스트
- [ ] 벤치 재실행 보고와 소유자 수용
- [ ] `src/__legacy__/` 삭제, 정리 목록 처분, `CLAUDE.md` 인벤토리 동기화
- [ ] 우산 PR `master` 병합 준비, `verification.md`의 게이트 전부 통과

## 절차 (seiri·filid)

- filid: 레거시 organ 삭제 뒤 스캔에 organ 발견이 0. 문서 인벤토리(루트·패키지 `CLAUDE.md`)를 코드와 같은 커밋에서 맞춘다.
- seiri: 문서의 코드 표는 상수 정의에서 기계로 생성하거나 대조 시험을 둔다(문서가 코드와 어긋나지 않게).

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
