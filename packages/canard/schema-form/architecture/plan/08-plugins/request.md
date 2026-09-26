# 08 플러그인 — 개발요청서

> 원장 정본: LANDING-206(UI 플러그인 넷의 이주는 이 PR), LANDING-151(자사 플러그인 수정 목록), LANDING-198(플러그인마다 union 항목), LANDING-078(`presentation.*` 이주), REACT-033(플러그인 계약 문구), LANDING-170(훅 반환형). 어긋나면 원장이 이긴다. ajv6·7·8은 05가 끝냈다.

## 우산 안의 자리

- 우산 순서 08. base `1.0.0-beta`, 브랜치 제안 `feat/schema-form-plugins`. 의존 07(공개 표면이 확정된 뒤).
- 다음: 09 정리·릴리스.

## 목적

UI 플러그인 넷(antd5·antd6·antd-mobile·mui)을 새 공개 표면에 맞춘다. schema-form 본체의 검증(07의 기본 입력)과 분리해, 플러그인마다 같은 시나리오로 따로 통과시킨다(LANDING-206).

## 범위 — 원장이 정한 내용

- UI 플러그인 27파일의 `options.*`·맨 키 읽기를 `presentation.*`로(LANDING-078·206), 타입과 등록 키 대응, `node.group` → `node.strategy`, prop `FormTypeRenderer` → `FormTypeGroupRenderer`(LANDING-067의 해당 항목, 이 PR로 옮김).
- 자사 플러그인 수정 목록(LANDING-151·206): antd·mui 수 입력의 비우기 값과 부분 해석, 스위치의 무효 표지, 문자열 체크박스와 범위 입력의 `Array.isArray` 막기.
- 플러그인마다 `union` 항목(LANDING-198·206): `{type:'union'}` 시험 객체와 유효 목록 기준의 입력, `typeMismatch`의 무효 표지(REACT-033, SURFACE-061). 플러그인 계약 문구(REACT-033)를 각 플러그인 문서에.
- `useChildNodeErrors` 반환형 변화(`ValidationIssue`)의 소비처(LANDING-170).
- 각 플러그인의 스토리북이 새 엔진으로 그려진다.

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal

| 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- |
| 플러그인 넷의 `options.*` 읽기 27파일, `node.group` 소비, `FormTypeRenderer` prop | 플러그인의 구성 요소 구조와 등록 방식 | 없음(기존 패키지 안) |

## 레거시 이동

없음(플러그인 패키지는 레거시 디렉토리를 두지 않는다).

## 착수 전 확인

- 07이 `1.0.0-beta`에 들어와 공개 표면(Hint·props·`typeMismatch`·명령·`FormTypeGroupRenderer`)이 확정됐다.
- 패키지별 `CLAUDE.md`와 `.claude/skills/ui-plugin-guidelines`·`react-plugin-implementation`을 읽는다.

## 산출물과 완료 기준

- [ ] 플러그인 넷의 `presentation.*` 이주와 수정 목록
- [ ] 플러그인마다 union 항목과 계약 문구
- [ ] 플러그인별 시나리오·스토리북 통과, `verification.md`의 게이트 전부 통과

## 절차 (seiri·filid)

- filid: 플러그인 패키지마다 자기 INTENT·DETAIL(있으면)을 먼저 고친다. schema-form의 내부 파일을 가져오지 않고 공개 진입점만 쓴다(organ 외부 소비 0).
- seiri: 플러그인 구성 요소의 이름과 파일 배치는 형제를 따르고, 이주로 죽은 `options.*` 분기는 지운다(reuse-first §3).

## 원장 항목 색인

- LANDING-206 UI 플러그인 넷의 이주는 플러그인 PR(우산 순서 N+1)
- LANDING-151 자사 플러그인 수정 목록
- LANDING-198 union 설계의 이주 점검 — 자사 플러그인마다 `union` 항목
- LANDING-078 UI 플러그인 규모와 `options` 닫힌 목록의 충돌은 `presentation.*` 이주로
- LANDING-170 공개 훅 셋의 유지와 `useChildNodeErrors`의 반환형
- REACT-033 입력 바인딩과 플러그인 계약 문구
- SURFACE-061 경고등의 공개 이름
- TEST-077 union 설계의 시험 목록
