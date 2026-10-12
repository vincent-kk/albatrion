# 149라운드 — Vincent의 답 (isArray overload는 넣고, 깨지는 6곳의 선언을 넓힌다 — 레거시 4곳은 승인된 예외)

2026-10-11. 07이 방출 JS 없음 6건 가운데 4건(#2·#5·#6·#14)과 #12의 이유 한 줄을 커밋(34b370eed; core·React 번들 바이트 동일, schema-form·json과 소비 패키지 typecheck 통과)한 뒤, #1·#10의 isArray overload가 소비 코드 6곳을 깨뜨려 보류하고 선택지를 올렸다. 원장 관리자가 소유자에게 바로 물었다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| isArray overload와 소비 코드 6곳 | 146라운드가 받은 common-utils isArray의 readonly overload가 schema-form의 `includes` 호출 6곳(레거시 4, 제품 1, 시험 1)에서 형 오류를 내므로, overload를 넣고 6곳 선언을 넓힐지(가) common-utils를 두고 지역 가드 별칭으로 갈지(나) | "(가) overload 넣고 6곳 선언을 넓힘" (2026-10-11, 원장 세션의 선택지 답) | 확정. 146라운드 결정 그대로 common-utils isArray에 overload를 넣고(changeset minor 유지), 6곳의 받는 쪽 선언을 넓힌다 — `src/__legacy__`의 4곳(collectBlueprintWarnings.ts:102, getCompositionNodeMapList.ts:56, extractSchemaInfo.ts:25·26)은 "옮긴 코드는 그대로 둔다"는 규칙의 소유자 승인 예외로 기록하고, 제품 1곳(FormTypeInputUnion.tsx:20)과 시험 1곳(formTypeInput.nullable.test.ts:28)은 선언만 넓힌다. 방출 JS는 바이트 동일해야 하며(134C-01: 같으면 판정 없음), 다르면 런타임 번들 판정에 넣는다. 다른 패키지의 typecheck는 다시 돌린다. |

다음 라운드 번호는 150이다.

덧붙임(2026-10-11, 적용 결과). 07이 62e140d8d로 적용했다(07의 보고). common-utils isArray overload와 changeset(minor), buildNodes·mergeSchemaContributions의 단언 제거, 받는 쪽 선언 넓히기 — 제품 FormTypeInputUnion `readonly string[]`, 시험 formTypeInput.nullable `readonly unknown[]`, 레거시 collectBlueprintWarnings `readonly unknown[]`, extractSchemaInfo의 `type` 선언, getCompositionNodeMapList:56의 값을 받는 warnIfNullUnreachable의 `branches` 매개변수와 그 파일의 도우미 둘 `Partial<JSONSchema>`. 알릴 점: 레거시 편집은 승인된 네 자리가 아니라 다섯 파일이다 — 56행의 받는 선언이 다른 파일(warnIfNullUnreachable.ts)에 있어서이며, 커밋 메시지에 그렇게 적혔다. 확인: core·React 측정 번들이 HEAD와 바이트 동일(판정 불필요), schema-form·common-utils tsc·eslint 종료 0, 소비 패키지 아홉 typecheck 통과, ajv8은 기존 오류 8건만, 레거시 격리 검사 1685파일 통과. 이로써 방출 JS 없음 6건(#1·#2·#5·#6·#10·#14)은 모두 끝났고 #12는 이유를 적고 남았다. 035da3fb4로 performance.md에 151C-01의 출발 수치와 열린 항목, 07b 개선-30을 적었다.
