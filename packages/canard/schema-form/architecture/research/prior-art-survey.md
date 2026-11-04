# 선행 사례 조사 — 검증 상태

상태: 관찰(외부). 1차 조사는 웹 검색을 거친 모델의 보고서(cennad antigravity, 세션 `91756c37-d3e7-411e-8fea-9fb2994d69e3`)이며, 그대로 믿을 수 없다. 아래는 그 보고의 주장을 검증 상태별로 나눈 것이다. **인용된 이슈 번호는 세 개를 확인해 하나만 맞았다.** 이 문서에 없는 보고서의 주장은 설계 근거로 쓰지 않는다. 소스 코드에 근거한 2차 조사가 진행 중이며, 결과가 오면 이 문서를 대체한다.

## 직접 확인한 것

| 주장 | 확인 방법 | 결과 |
| ---- | --------- | ---- |
| RJSF에 `retrieveSchema`, `getClosestMatchingOption`, `getFirstMatchingOption`, `sanitizeDataForNewSchema`가 있다 | `gh api repos/rjsf-team/react-jsonschema-form/contents/packages/utils/src/schema` | 네 파일 모두 실재 |
| RJSF가 큰 `anyOf`에서 심각한 성능 문제를 겪었다 | `gh issue view 3692` | 실재 — "Terrible performance with big anyOf field" (CLOSED) |
| RJSF가 discriminator를 지원한다 | 코드 검색 `getDiscriminatorFieldFromSchema` | 실재 — `MultiSchemaField.tsx` 등에서 사용 |
| JSON Forms는 `oneOf` 탭 전환 시 데이터를 **유지**한다 | 코드 검색 "will be cleared" | **보고가 틀렸다.** `packages/material-renderers/src/complex/TabSwitchConfirmDialog.tsx`가 실재한다 — 확인 대화상자를 띄우고 데이터를 지운다 |
| RJSF #1583 = 입력 도중 `oneOf` 분기가 강제로 되돌아가는 버그 | `gh issue view 1583` | **보고가 틀렸다.** 실제 제목은 "Export typings from @rjsf/core" |
| JSON Forms #2506 = 분기 전환 후 남은 데이터가 `additionalProperties: false`를 깨뜨린다 | `gh issue view 2506` | **보고가 틀렸다.** 실제 제목은 "Vue Vanilla OneOf renderer fails to properly switch between boolean and array values" |

## 조사자의 사전 지식과 일치하지만 이번에 소스로 확인하지 않은 것

- RJSF는 `validator`를 prop으로 주입받고, 검증뿐 아니라 렌더에 필요한 스키마 해석(`if`/`then`/`else`의 해석, `oneOf`/`anyOf`의 분기 매칭)에도 그 검증기를 동기로 호출한다. 검증기 없이는 폼이 렌더되지 않는다.
- RJSF는 `oneOf`/`anyOf`를 선택 드롭다운 + 선택된 서브스키마의 폼으로 그린다. 기존 값을 로드할 때의 초기 선택은 점수제 휴리스틱이다. 분기 전환 시 새 스키마에 없는 프로퍼티를 정리한다.
- RJSF는 #3692 이후 discriminator가 있으면 `const` 직접 비교로 검증기 호출을 건너뛰는 최적화를 넣었다(버전은 미확인).
- JSON Forms는 데이터 스키마와 UI 스키마를 엄격히 나눈다. 데이터 스키마의 `if`/`then`/`else`는 검증에만 쓰이고 형상을 바꾸지 않는다. 가시성은 UI 스키마의 `rule: { effect, condition: { scope, schema } }`로 정하며, 그 조건은 스키마이고 Ajv로 평가한다.
- json-editor는 `oneOf`를 선택 드롭다운으로 그리고, `keep_oneof_values`(기본 `true`)로 전환 시 값의 유지를 정한다. UI 옵션은 스키마 안의 인라인 키워드다.
- Formily는 표준 조건 구문을 해석하지 않고 자체 `x-reactions`를 쓴다. uniforms는 `oneOf`/`anyOf`의 동적 렌더링을 기본 제공하지 않는다.
- JSON Schema 2019-09 이후: 미지 키워드는 검증에 영향을 주지 않는다. `if: { properties: { k: { const: 'a' } } }`는 `k`가 없으면 참이고, 관용적 해법은 `if`에 `required: ['k']`를 넣는 것이다. `unevaluatedProperties: false`는 통과한 `then`/`oneOf` 분기가 평가한 프로퍼티만 인정하므로, 꺼진 분기의 값이 남아 있으면 기각한다.

## 확인하지 못한 것 — 설계 근거로 쓰지 않는다

- 보고서가 인용한 나머지 이슈 번호 전부와 릴리스 버전 번호(RJSF v5.6.0, v5.13.1 등).
- 검증기별 번들 크기와 상대 속도. 속도는 보고서 스스로 "추정치, 출처 불명확"이라고 표시했다. **검증기 호출 비용은 직접 잰다**(ADR 0009의 스파이크).
- `@cfworker/json-schema`, `@hyperjump/json-schema`의 CSP 안전성과 방언 지원 범위.

## 보고서의 제언 가운데 기존 결정과 어긋나는 것

보고서는 `@cfworker/json-schema`를 내장 검증기로 채택하라고 제언했다. ADR 0004(검증기는 플러그인으로 유지, 내장하지 않는다 — 수락)와 어긋나며, 채택하지 않는다.

## 설계에 시사하는 것 (확인된 사실에 한해)

1. **검증기를 형상 결정에 쓰는 구조는 선례가 있다**(RJSF). 그리고 그 선례는 "값이 바뀔 때마다 분기 수만큼 검증기를 호출"해서 실제로 성능 문제를 겪었고(#3692), discriminator 직접 비교로 빠져나갔다. ADR 0004·0009의 가드 호출 비용 우려는 실증된 위험이다.
2. **분기 전환 시 값의 처리는 라이브러리마다 다르다** — 정리(RJSF), 확인 후 삭제(JSON Forms), 기본 유지(json-editor). 보편적 합의가 없다. `open-questions.md` Q1은 선례를 따르는 문제가 아니라 소유자가 정할 문제다.
3. **UI 관심사의 위치도 갈린다** — 분리된 UI 스키마(RJSF, JSON Forms)와 인라인 키워드(json-editor, Formily). 인라인 `&`(ADR 0003)에 더해 스키마 밖의 오버레이(`00-goals.md` C1)를 두면 두 방식을 모두 덮는다.
