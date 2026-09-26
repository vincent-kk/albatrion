# 우산 순서 N+1 — 플러그인 PR

> 원장 정본: LANDING-151(자사 플러그인 수정 목록), LANDING-198(union 이주 점검), LANDING-078(`presentation.*` 이주), LANDING-093(ajv 셋의 `compileGuard`), VALIDATE-045·046·047(플러그인 계약), REACT-033(플러그인 계약 문구). 이 문서는 읽기 표면이며, 어긋나면 원장이 이긴다.
>
> 이 PR은 소유자의 우산 구조가 새로 자른 단위다. 원장은 이 일을 PR-4(ajv6·7·8)와 PR-7(UI 플러그인 넷)에 두었으므로, 소유자가 P1(README §4)을 채택하면 LANDING-064·067·093·151에 충돌 줄을 적고 이 문서가 그 단위를 든다.

## 목적

자사 플러그인 일곱(ajv6·ajv7·ajv8, antd5·antd6·antd-mobile·mui)을 새 공개 표면과 검증기 계약에 맞춘다. schema-form 본체의 검증(PR-4의 ajv8 하나, PR-7의 기본 입력)과 분리해, 플러그인마다 같은 시나리오로 따로 통과시킨다.

## 우산 안의 자리

- 의존: PR-7(공개 표면이 확정된 뒤).
- 다음: N+2 정리·릴리스.

## 범위

- **검증기 플러그인**: ajv6·ajv7의 동기 `compileGuard(root, pointer)`, `rejectedKey`, 같은 `$id` 처리(VALIDATE-045·046·047, LANDING-093). ajv6은 가드 게이트의 (i)만(18C-58). `bind` 거부 규칙(값을 바꾸는 옵션, VALIDATE-050)을 플러그인 문서에 적는다. union의 `integer` 멤버십·`type` 배열 판정이 검증기와 같음(TEST-077의 검증기 줄).
- **UI 플러그인 넷**: 27파일의 `options.*`·맨 키 읽기를 `presentation.*`로(LANDING-078), 타입과 등록 키 대응(LANDING-067), `node.group` → `node.strategy`(LANDING-067), prop `FormTypeRenderer` → `FormTypeGroupRenderer`(LANDING-067), 자사 플러그인 수정 목록 — antd·mui 수 입력의 비우기 값과 부분 해석, 스위치의 무효 표지, 문자열 체크박스와 범위 입력의 `Array.isArray` 막기(LANDING-151), 플러그인마다 `union` 항목(권장, LANDING-198): `{type:'union'}` 시험 객체와 유효 목록 기준의 입력, `typeMismatch`의 무효 표지(REACT-033, SURFACE-061). 플러그인 계약 문구(REACT-033)를 각 플러그인 문서에.
- 훅·`useChildNodeErrors` 반환형 변화(`ValidationIssue`)의 소비처(LANDING-170).

## 레거시 이동

없음(플러그인 패키지는 레거시 디렉토리를 두지 않는다).

## 착수 전 닫을 것

P1의 소유자 결정. 원장의 플러그인 계약은 닫혀 있다(VALIDATE-045–047, REACT-033).

## 검증 게이트 — 이 PR이 독립적으로 통과해야 하는 것

- 검증기 플러그인마다: PR-4의 차등 테스트(TEST-001)와 플러그인 계약 게이트 넷(VALIDATE-046·047, 18C-58)을 그 플러그인으로 돌려 초록.
- UI 플러그인마다: 시나리오 패키지의 렌더 시나리오를 그 플러그인의 `formTypeInputDefinitions`로 돌려 초록, union 항목 포함(LANDING-198). 각 플러그인의 스토리북이 새 엔진으로 그려진다.
- 저장소 전체 `yarn lint`·`typecheck`·`test`.

## 완료 기준

- [ ] ajv6·ajv7 `compileGuard`·`rejectedKey`·`$id`
- [ ] UI 플러그인 넷의 `presentation.*` 이주와 수정 목록
- [ ] 플러그인마다 union 항목과 계약 문구
- [ ] 플러그인별 시나리오·차등 게이트 통과

## 원장 항목 색인

- LANDING-151 자사 플러그인 수정 목록은 PR-7 이주 항목
- LANDING-198 union 설계의 이주 점검 — 자사 플러그인마다 `union` 항목(권장)
- LANDING-078 UI 플러그인 규모와 `options` 닫힌 목록의 충돌은 PR-7의 `presentation.*` 이주로
- LANDING-093 보정 PR-4 — ajv 셋의 동기 `compileGuard`
- VALIDATE-045, VALIDATE-046, VALIDATE-047 — 플러그인 계약과 PR-4 게이트 넷
- VALIDATE-050 — 값을 바꾸는 검증기 옵션은 `bind`에서 거부
- REACT-033 — 입력 바인딩과 플러그인 계약 문구
- TEST-077 union 설계의 시험 목록 — 검증기 플러그인 줄
