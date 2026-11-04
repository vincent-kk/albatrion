# 55라운드 닫기 — 05 PR-4(#352) 소유자 묶음 가운데 원장에서 답하는 넷: 한 쓰기의 가드 실패 둘은 묶어 던진다(05가 고침), 동적 범위가 다른 두 경로가 쓰는 한 위치는 문서화된 한계, 엄격 옵션을 켠 바인딩 인스턴스의 가드 컴파일 실패는 문서화된 한계, 가칭 넷의 확정

2026-10-02. 05 작업자(세션 fixy01, PR #352, `6a0c477ee`; 독립 verifier PASS, filid 경계 검사 순환 0, antigravity 검토 차단 없음)가 소유자 묶음 여섯을 보냈다. 벤치 수용(P-16~P-19)과 스토리북 실행은 소유자에게 올리고, 나머지 넷은 원장(ERROR-005, ERROR-041, VALIDATE-003·033·047, 31C-05, 30라운드 소유자 답)에서 유도되므로 편집자 결정으로 닫는다.

### 55C-01 한 쓰기가 서로 다른 가드 둘을 실패시키면 둘 다 정착 오류로 기록되고 사슬 끝에서 `SchemaFormError` 하나(`details.errors`, 발생 순서)로 묶어 던진다 — 첫 실패만 던지는 03 코드는 ERROR-005에 어긋나는 결함이며 집계 오류는 PR-4의 범위라 05가 고친다

- 닫는 항목: ERROR-005(보충), ERROR-041(보충)
- 결정:
  - 【추론】 ERROR-005는 "오류가 하나면 그대로 던진다. 둘 이상이면 … `SchemaFormError` 하나(전용 코드, 가칭 `SCHEMA_FORM_ERROR.MULTIPLE_ERRORS`)로 묶어 발생 순서대로 `details.errors`에 담는다"고 적었고 ERROR-041은 가드 실패를 게이트마다의 정착 오류로 두었으므로, 한 쓰기가 가드 둘을 실패시키면 둘 다 기록되고(둘 다 surface `thrown`) 사슬 끝에서 하나로 묶어 던진다; `settle/utils/gates/evaluateGate.ts:127`이 첫 실패만 남기고 둘째를 드러내지 않는 것은 기록과 던짐이 어긋나는 결함이다. "`SchemaFormError`의 집계 오류(`details.errors`)"는 LANDING-064의 PR-4 행이므로 05가 PR-4에서 고친다(정착이 실패를 모으고 사슬 끝의 디스패치가 묶음); 06·07에 넘기지 않는다.
- 근거: ERROR-005 "오류가 하나면 그대로 던진다. 둘 이상이면(부른 쪽이 있는 자리에서 `onError` 핸들러가 던진 예외를 원래 오류와 합칠 때 포함) `SchemaFormError` 하나(전용 코드, 가칭 `SCHEMA_FORM_ERROR.MULTIPLE_ERRORS`)로 묶어 발생 순서대로 `details.errors`에 담는다."; ERROR-041 "어느 환경이든 컴파일 실패는 그 게이트의 가드 실패다(게이트는 거짓, R17-1 나에 따라 정착 오류, §4)."; ERROR 영역 "부른 쪽이 있는 자리(사슬 끝 …): … 발생 순서대로 `SchemaFormError` 하나(`details.errors`)로 묶어 던지거나 거부한다"(error.md:618); LANDING-064 PR-4 행 "`SchemaFormError`의 집계 오류(`details.errors`)"; 현행 코드 `src/core/settle/utils/gates/evaluateGate.ts:127`.

### 55C-02 VALIDATE-047의 사례 (iv)(한 `$defs` 위치를 동적 범위가 다른 두 경로가 쓰는 경우)는 같은 항목의 "위치마다 가드는 하나다"와 양립하지 않으므로 ajv7·8에서 지원하지 않는 문서화된 한계로 닫고, 엄격 옵션(`strictTypes`·`strictRequired`)을 켠 바인딩 인스턴스에서 일부 가드가 컴파일에 실패하는 것도 플러그인이 소비자 옵션을 덮지 않는 문서화된 한계다

- 닫는 항목: VALIDATE-047(보충), VALIDATE-033(보충), VALIDATE-003(보충)
- 결정:
  - 【추론】 VALIDATE-047은 "위치마다 가드는 하나다"와 사례 (iv) "한 `$defs` 위치를 동적 범위가 다른 두 경로가 쓰는 경우"의 통과를 함께 적었는데, 위치당 가드 하나로는 동적 범위마다 다른 답을 낼 수 없어 둘은 양립하지 않는다; 설계의 축은 위치당 하나(ADR 0004의 캐시 단위, SETTLE-017 "위치당 1회")이므로 (iv)는 ajv7·8에서 지원하지 않는 경우로 플러그인 README·`CLAUDE.md`에 적는 문서화된 한계이며, 그런 스키마에서는 가드가 첫 번째로 컴파일된 범위의 답을 낸다는 사실을 함께 적는다. 소유자에게는 묶음으로 보고한다.
  - 【추론】 소비자가 `bind(instance)`로 넘긴 인스턴스의 설정은 VALIDATE-003대로 소비자의 책임이고 VALIDATE-033은 가드용 인스턴스가 `allErrors: false` 말고는 같은 설정을 따르게 했으므로, 플러그인이 가드 인스턴스에서 `strictTypes`·`strictRequired`를 몰래 끄는 것은 두 항목에 어긋난다; 그런 인스턴스에서 일부 가드가 컴파일에 실패하면 ERROR-041대로 그 게이트의 가드 실패(정착 오류, `onError` 기록)로 드러나고 전체 검증은 그대로이므로, "엄격 옵션을 켠 인스턴스를 바인딩하면 일부 `if` 가드가 컴파일에 실패해 그 게이트가 거짓이 될 수 있다(strict 모드는 기본이 아니다, VALIDATE-005)"를 플러그인 문서에 적는 문서화된 한계다. 두 가드 경로 모두 같다.
- 근거: VALIDATE-047 "위치마다 가드는 하나다.", "사례 (iv): 한 `$defs` 위치를 동적 범위가 다른 두 경로가 쓰는 경우.", "통과: 가드의 답이 전체 검증에서 관측한 `if`의 답과 모든 사례에서 같다."; SETTLE-017 "`if` 게이트의 컴파일은 작성된 스키마의 위치당 1회이며 폼 인스턴스 사이에 공유한다(ADR 0004)."; VALIDATE-003 "서버와 검증기 설정(방언, format 검사, 커스텀 키워드)을 맞추는 것은 소비자의 책임이다. 수단은 이미 있는 `bind(instance)`다."; VALIDATE-033 "검증용과 가드용 인스턴스의 나머지 설정(format, 커스텀 키워드, 방언)을 같게 유지하는 규칙을 플러그인이 가져야 한다."; VALIDATE-005 "strict 모드는 기본이 아니다"; ERROR-041; 05 verifier N5.

### 55C-03 31C-05의 가칭 확정 — `SchemaNodeRequestType`의 `Focus`·`Select`·`Refresh`·`Remount`(30라운드 소유자 답), `ValidatorBindRefusedError`, 플러그인 `configure({ directGuardCompile?: boolean })`은 확정 이름이고, `JSONSchemaError`는 가칭이 아니라 50C-01의 호환 확장이다

- 닫는 항목: EVENT-073(보충), VALIDATE-050(보충), VALIDATE-017(보충)
- 결정:
  - 【추론】 31C-05대로 가칭의 확정은 PR-4의 몫이고 소유자가 정한 이름이 이기므로, 05가 보낸 넷 가운데 `SchemaNodeRequestType`의 멤버 `Focus`·`Select`·`Refresh`·`Remount`는 30라운드 소유자 답(D-1, EVENT-073)이 정한 이름이라 그대로 확정이고, `ValidatorBindRefusedError`(VALIDATE-050의 가칭 `VALIDATOR_BIND_REFUSED`의 오류 클래스, 35C-07의 플러그인별 Error 하위 클래스 규칙)와 플러그인의 `configure({ directGuardCompile?: boolean })`(52라운드 소유자 답의 "수정 가능하게")은 05의 확정으로 받아 원장에 적는다; `JSONSchemaError`는 새 이름이 아니라 50C-01이 정한 옛 이름의 호환 확장이라 가칭 목록의 항목이 아니다. 나머지 가칭(`INVALID_VIRTUAL_NODE_VALUES`, `MULTIPLE_ERRORS`, `ARRAY_METHOD_ON_NON_ARRAY` 등)은 05가 PR 본문의 최종 목록으로 보내면 같은 방식으로 적는다.
- 근거: 31C-05(`reviews/round-31-closing.md`); 30라운드 소유자 답(`reviews/round-30-owner-answers.md`, EVENT-073 보충); VALIDATE-050 "ajv 플러그인 셋의 `bind`는 `coerceTypes`·`useDefaults`·`removeAdditional`을 켠 인스턴스를 거부(가칭 `VALIDATOR_BIND_REFUSED` …)"; 35C-07(`reviews/round-35-closing.md`); 52라운드 소유자 답(`reviews/round-52-owner-answers.md:8`); 50C-01(`reviews/round-50-closing.md:9`).
