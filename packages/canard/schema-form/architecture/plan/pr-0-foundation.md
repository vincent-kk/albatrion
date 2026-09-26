# 우산 순서 2 — 기반 (원장 PR-0의 코드 부분)

> 원장 정본: LANDING-060, LANDING-090(보정 PR-0), LANDING-159(레거시 규칙), TEST-008·TEST-022·TEST-023(시나리오 원칙). 이 문서는 읽기 표면이며, 어긋나면 원장이 이긴다.

## 목적

새 엔진을 시험할 하니스를 새 엔진보다 먼저 세운다. 프로토타입 v7, 시나리오 패키지의 뼈대, vitest 프로젝트 셋, 레거시 규칙의 자리. 이 PR이 끝나면 뒤의 모든 PR이 "자기 시나리오를 넣고 자기 게이트를 통과한다"는 같은 모양으로 검증된다.

## 우산 안의 자리

- 의존: 없음. 설계 PR과 병렬이다.
- §3(README)의 합침 P3을 채택하면 PR-1과 한 PR이 된다.

## 범위 — 원장이 정한 내용

- **프로토타입 v7** `spikes/round18/proto/loop-v7.mjs`: v6에 게이트 입력의 `extras` 정적 규칙, 같은 순위 동점·정착 단위 순위, 나감 에지, 전이 라운드 상한, 재계산 목록만 순회를 더한다(LANDING-060). 18라운드가 더한 것: 빈 호스트·루트의 방출 규칙(18C-88, VALUE-034), 규칙 A의 세 함수 `isMember`·`convert`·`interpret`와 동점 12건(18C-91, WRITE-093), 게이트 유효 목록과 U7의 두 단계·전이 라운드(18C-104·105, WRITE-098·WRITE-099). v6은 빈 루트를 `undefined`로 낸다(HANDOFF §2).
- **시나리오 패키지** 비공개 `@aileron/schema-form-scenarios`: 시나리오 데이터 모듈의 형 `FormScenario`, 코어 러너와 화면 어댑터 `playScenario`의 뼈대(시나리오 감싸개와 핸들 등록 포함)(LANDING-090). 시나리오는 실행기 없는 순수 데이터 모듈이다(TEST-008). 패밀리 폴더와 빈 스위트에 union·fill·narrowing을 미리 둔다(TEST-077).
- **vitest `test.projects` 셋**(`unit`·`render`·`storybook`)과 addon-vitest 설치, 세 프로젝트의 글롭이 `src/__legacy__/**`를 포함한다(LANDING-090, LANDING-159).
- **옛 스토리의 처분 목록**, 패키지 `CLAUDE.md`의 'Render-Level Test Harness' 절 개정(LANDING-090).
- **벤치 기준선**: 옛 엔진의 마지막 `bench:baseline`은 PR-2가 `core/nodes`를 옮기기 전에 잰다(LANDING-159, TEST-031). 이 PR에서 커밋을 고정해 재현 가능하게 둔다.
- 릴리스 전환 PR이 먼저 들어왔다면 `test.yml`에 vitest 세 프로젝트와 playwright chromium 단계(LANDING-090).

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal

- 부딪히는 것: 없음(옛 엔진은 그대로).
- 그대로 쓰는 것: `src/__tests__/renderForm.tsx` 하니스(TEST-004).
- 새 자리: `packages/aileron/schema-form-scenarios/`(비공개), `architecture/spikes/round18/proto/`.

## 레거시 이동

없음. 이 PR은 옛 코드를 옮기지 않는다(옮기는 것은 그 영역을 새로 쓰는 PR이다, LANDING-159).

## 착수 전 닫을 것

LANDING-060의 조건 셋 가운데 절 단위 통과는 설계 PR의 일이며 코드 부분을 막지 않는다. 18라운드 정련은 끝났다.

## 검증 게이트 — 이 PR이 독립적으로 통과해야 하는 것

- 프로토타입 v7의 회귀 프로브 전부 통과(v5·v6의 회귀 목록, TEST-060) + 18라운드가 더한 프로브: 규칙 A 표 전체와 동점 12건, `integer` 멤버십, 게이트 전이에서 경고등만 바뀌고 값은 바뀌지 않음, `setValue({kind:'num', a:'42'})`가 직전 상태와 무관하게 `a = 42`(U7), 되먹임 반례 `['string','boolean']`의 라운드 상한(HANDOFF §2, TEST-077).
- `yarn test`가 세 프로젝트로 나뉘어 돌고, 옛 시험 전부가 그대로 초록이다.
- 시나리오 패키지의 빈 스위트가 러너 위에서 돈다(0건 통과).
- 벤치 기준선 결과 파일이 커밋에 고정된다.

## 완료 기준

- [ ] v7과 프로브 결과 보고서(`spikes/round18/proto/REPORT-v7.md`)
- [ ] `@aileron/schema-form-scenarios` 뼈대, `FormScenario` 형, `playScenario` 뼈대
- [ ] vitest `test.projects` 셋, addon-vitest, `CLAUDE.md` 하니스 절 개정
- [ ] 옛 스토리 처분 목록(`plan/` 또는 `reviews/`에 파일)
- [ ] 벤치 기준선 고정

## 원장 항목 색인 (결정·보충에 PR-0를 든 현행 항목, 기계 추출)

- LANDING-060 PR-0 문서 — 이 문서·기록·HANDOFF·프로토타입 v7·시나리오 패키지 뼈대
- LANDING-090 보정 PR-0 — 시나리오 형과 러너 뼈대, vitest 셋, addon-vitest, 옛 스토리 처분 목록, 비공개 시나리오 패키지
- LANDING-097 릴리스 전환(별도 PR) — changesets 가동과 CI·배포 작업 흐름 정리, PR-8 전에 병합
- LANDING-159 레거시는 `src/__legacy__/` — 상대 경로 유지, PR마다 옮김, 새 fractal의 가져오기 금지, PR-7 통째 삭제, 시험 글롭 포함, filid 깊이 점검, 스토리북·벤치
- TEST-010 화면 어댑터 playScenario — e2e와 스토리가 함께 쓰는 해석기, 비공개 패키지 @aileron/schema-form-scenarios
- TEST-011 단계 어휘 여덟과 핸들의 DOM 등록 — playScenario(scenario, 요소) 하나
- TEST-013 기존 234파일의 처분 — 그대로 산다·표면만 고친다·버리고 새로 쓴다·미분류·새로 있어야 한다
- TEST-024 도구와 설정 — vitest 프로젝트 셋, 의존, portable stories, play 안의 expect
- TEST-049 릴리스 5 — 지속 통합 시험 작업 흐름 test.yml을 새로 둔다
- TEST-054 릴리스 10 — 자리와 저장소 정리 — 별도 PR, PR-8 전에 병합
- TEST-069 PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분

## 원장이 PR-0에 배정한 게이트 (기계 추출; 원문은 `ledger/`와 `reviews/round-18-closing.md`)

게이트를 제목에 든 항목:

- 없음

18라운드 닫기 블록의 게이트 줄:

- 없음
