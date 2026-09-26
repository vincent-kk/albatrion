# 08 플러그인 — 검증 구성요건

## 검증 원칙

본체는 07에서 기본 입력으로 검증됐다. 여기서는 플러그인마다 같은 시나리오를 그 플러그인의 `formTypeInputDefinitions`로 다시 돌려, 플러그인이 새 계약(Hint·props·`typeMismatch`·`finishInput`·`presentation.*`)을 지키는지 본다.

## 시험 구성

| 대상 | 무엇 |
| --- | --- |
| 플러그인 패키지 넷의 `test` | 기존 단위 시험 + 새 계약 시험(union 항목 포함) |
| 시나리오 패키지 | 렌더 시나리오를 플러그인별 정의로 돌리는 매트릭스(antd5·antd6·antd-mobile·mui) |
| 스토리북 | 플러그인별 스토리가 새 엔진으로 그려짐 |

## 게이트 — 이 PR이 단독으로 통과해야 하는 것

- 플러그인마다 렌더 시나리오 매트릭스 초록, union 항목 포함(LANDING-198): `{type:'union'}` 시험 객체, 유효 목록 기준의 초안·표시·비우기, `typeMismatch`의 무효 표지(REACT-033).
- 자사 플러그인 수정 목록(LANDING-151)마다 오늘 동작과 새 동작을 대조하는 시험 하나.
- `presentation.*` 이주 뒤 `options.*`를 읽는 곳 0(검색), `node.group` 소비 0, `FormTypeRenderer` prop 0.
- 저장소 전체 `yarn lint`·`typecheck`·`test`, 각 플러그인 빌드.

## 합격 판정과 실패 처리

- 게이트 전부 통과. 플러그인이 새 계약으로 표현할 수 없는 동작을 만나면 본체를 고치지 않고 원장(REACT·SURFACE)에 새 라운드 항목으로 올린다.

## 리뷰 체크리스트 (PR 본문에 옮긴다)

- [ ] 플러그인별 시나리오 매트릭스 결과
- [ ] 수정 목록 대조 시험 목록
- [ ] `options.*`·`node.group`·`FormTypeRenderer` 검색 결과 0
- [ ] 플러그인 문서의 계약 문구
- [ ] seiri 게이트·filid 스캔 결과 첨부
