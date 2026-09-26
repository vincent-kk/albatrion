# 게이트 3
## 판정: 고침 필요 (13건)

기계 검사는 다시 돌리지 않았습니다(지시대로). 아래 줄 번호는 모두 지금 작업 트리 기준입니다. ARCH = `packages/canard/schema-form/architecture`.

## 지적 (심각한 것부터)

### 1. BLUEPRINT-011·BLUEPRINT-012·ERROR-164(`SHARED_NODE_KIND_CONFLICT` 행) — 검사 2 — 정적 선언의 교집합(U1·U3, 2.18)과 "게이트는 종류를 바꾸지 않음"(U4)에 어긋나는데 충돌 줄이 없음 [확인됨]
- `ledger/blueprint.md:211`(BLUEPRINT-011, 현행): "같은 이름 + 다른 종류 | 종류별로 노드를 둔다". E26(본체 `number` + `then` `['number','string']`)은 두 종류(number와 union)인데 노드는 하나입니다(`ledger/blueprint.md:846`, U4 `:703`).
- `ledger/blueprint.md:226`(BLUEPRINT-012, 현행): "게이트 없는 선언끼리는 늘 함께 켜지므로 청사진 오류다". E18·E24·E31(`:838,844,851`)과 S5(`reviews/round-18-closing.md:2401`)에서 정적 선언끼리는 교집합으로 노드 하나를 정하고, 교집합이 빌 때만 `ALL_OF_TYPE_REDEFINITION`입니다(`:2396`). 같은 칸의 "게이트에 달린 선언이 실제로 동시에 켜지면 정착 오류다"도 정적 노드가 있으면 교집합이 빌 때만 해당합니다(U2·U4).
- `ledger/error.md:2407`(ERROR-164 행, 현행): "`SHARED_NODE_KIND_CONFLICT` | 청사진 분석: 게이트 없는 선언끼리 같은 이름·다른 종류". 새 규칙에서 이 코드는 호스트의 게이트 없는 분기의 fold가 정적 노드의 fold에 들지 않을 때만 납니다(`reviews/round-18-closing.md:2404`). 정적 선언끼리 어긋나면 코드가 `ALL_OF_TYPE_REDEFINITION`으로 바뀝니다.
- 두 항목에 붙은 보충(`:213-214`, `:231-232`)은 게이트만 있는 이름과 켜진 교집합이 빈 경우만 다룹니다. merged-v3 §8의 "BLUEPRINT-011·012 | 정적 선언은 교집합이 종류를 정하고 … 게이트 선언은 정적 노드의 종류를 바꾸지 않고"가 반영되지 않았습니다. ERROR-164 행은 merged-v3 §8에도 빠져 있습니다.
- 고침:
  - BLUEPRINT-011 `- 충돌:` 칸을 새로 둡니다: `  > \`adr/0005-blueprint-analysis-and-node-sharing.md:67\`의 "종류별로 노드를 둔다"는 소유자 답과 다르다: 정적 선언이 있는 이름은 정적 선언들의 교집합이 노드 하나를 정하고, 게이트 선언은 그 노드의 종류를 바꾸지 않고 켜진 동안 유효 목록만 좁힌다(BLUEPRINT-041, BLUEPRINT-044). 종류별 노드는 정적 선언이 하나도 없는 이름에만 남는다. 소유자 답이 이긴다(\`reviews/round-18-owner-answers.md:37\`).`
  - BLUEPRINT-012 `- 충돌:` 칸을 새로 두고 두 줄을 넣습니다.
    - `  > \`adr/0005-blueprint-analysis-and-node-sharing.md:68\`의 "게이트 없는 선언끼리는 늘 함께 켜지므로 청사진 오류다"는 소유자 답과 다르다: 정적 선언(호스트 본체, 게이트 없는 \`allOf\`, \`$ref\`)끼리는 교집합으로 노드 하나를 정하고 교집합이 빌 때만 \`ALL_OF_TYPE_REDEFINITION\`이며, 호스트의 게이트 없는 분기는 fold가 정적 노드의 fold에 들지 않을 때만 \`SHARED_NODE_KIND_CONFLICT\`다(BLUEPRINT-044). 소유자 답이 이긴다(\`reviews/round-18-owner-answers.md:37\`).`
    - `  > \`adr/0005-blueprint-analysis-and-node-sharing.md:68\`의 "게이트에 달린 선언이 실제로 동시에 켜지면 정착 오류다"는 소유자 답과 다르다: 정적 노드가 있는 칸에서는 켜진 게이트 선언과 정적 허용 집합의 교집합이 빌 때만 정착 오류다(BLUEPRINT-041 U2·U4). 소유자 답이 이긴다(\`reviews/round-18-owner-answers.md:37\`).`
  - ERROR-164 `- 충돌:` 칸 끝에 한 줄을 더합니다: `  > \`adr/0014-error-policy.md:261\`의 "청사진 분석: 게이트 없는 선언끼리 같은 이름·다른 종류"는 18라운드 결정과 다르다: 정적 선언끼리는 교집합으로 노드 하나를 정하고 비면 \`ALL_OF_TYPE_REDEFINITION\`이며, 이 코드는 호스트의 게이트 없는 분기의 fold가 정적 노드의 fold에 들지 않을 때다(BLUEPRINT-044). 18라운드 결정이 이긴다(\`reviews/round-18-closing.md:2401,2404\`).`
  - 세 항목의 닫은 사람에 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8)을, BLUEPRINT-011·012의 출처에 `reviews/round-18-owner-answers.md:37`을 더합니다.
  - 검증: `adr/0005…:68`에 두 인용문이 있는지 확인하고 `sup-check`, `ref-check`를 돌립니다.

### 2. U7(두 번 해석)은 "직전 상태와 상관없이"를 일반적으로 지키지 못함. 3.11은 `resetSubtree()`를 빠뜨림 — 검사 5·의도 — merged-v3 자체의 결함 [확인됨: 규칙 추적, 실행은 안 함]
- 규칙: 둘째 해석은 첫째 해석의 결과에 "한 번 더 `interpret`"합니다(merged-v3 3.11, `reviews/round-18-closing.md:2513-2515`, SETTLE-005 보충 `ledger/settle.md:130-132`). 그런데 `interpret`는 합성에 닫혀 있지 않습니다.
- 반례: 본체 `a:{type:['string','boolean']}`, `if kind==='text' then a:'string'`, `if kind==='flag' then a:'boolean'`.
  - 직전 `kind='text'`에서 `setValue({kind:'flag', a:0})`를 부릅니다. 첫째 해석은 목록 `['string']`으로 `0`→`"0"`이고, 둘째 해석은 `['boolean']`에서 `"0"`을 받지 않습니다(3.5는 정확히 `"true"`·`"false"`만 받음). 결과는 `"0"`이고 경고등이 켜집니다.
  - 직전 `kind='flag'`이면 `0`→`false`입니다.
  - 같은 호출이 직전 상태에 따라 다른 값을 커밋합니다. 18C-91:2515가 대표로 드는 "직전 상태와 상관없이"와 CLAUDE.md의 일관성 가치에 어긋납니다. `1.5`를 `['string']`→`['integer']`로 거치면 `"1.5"`와 `1.5`로 갈리는 것도 같은 결함입니다.
- 두 반영 사이의 어긋남: 첫째 해석의 목록은 "마운트·`reset()`이면 `schemaType`"(`:2513`)입니다. 그런데 WRITE-090은 `resetSubtree()`도 로드로 두고, SETTLE-048은 "로드는 … 기준을 비운다"고 합니다(`ledger/settle.md:757-761`). 위 반례에서는 첫째 해석의 목록이 결과를 바꾸므로 이 누락이 관측됩니다.
- 고침: 작업자가 고칠 일이 아닙니다. 편집자·소유자의 결정이 필요합니다(U7은 소유자가 채택한 원리). 권하는 안은 이렇습니다: 둘째 해석은 그 진입에서 쓰기 경계에 들어온 원래 값(첫째 해석 전)에 최종 유효 목록으로 `interpret`한다. 비용은 한 진입 동안 쓰인 노드마다 칸 하나입니다. 첫째 해석의 목록에 `resetSubtree()`(그 하위 트리)도 더합니다. 정해지면 18C-91:2513-2515, BLUEPRINT-041 U7, SETTLE-005 보충, TEST-077의 `union.entry-two-step`에 위 반례를 더합니다.

### 3. ERROR-204(폼 수준 로드만 초기화)와 어긋난 "다음 로드까지"·"로드마다" 문장들 — 검사 2·5 [확인됨]
- `resetSubtree()`는 로드이고(WRITE-090) `diagnostics`와 경고 중복 키를 비우지 않습니다(`ledger/error.md:2999-3000`). 그런데 아래 현행 문장은 로드를 한정하지 않고, ERROR-204를 가리키지도 않습니다.
  - 진단의 지속:
    - ERROR-135 `ledger/error.md:2020` "**다음 로드까지 남는다.**"
    - VALUE-003 `ledger/value.md:97` "마지막 로드 이후의 작업 기록"(보충 `:99-100`도 같음)
    - ERROR-172 `ledger/error.md:2552` "`degraded`가 다음 로드까지 남아"
    - ERROR-164 BUDGET_EXCEEDED 행 `ledger/error.md:2413` "degraded가 다음 로드까지 남고"
    - LANDING-045 `ledger/landing.md:805` "다음 로드까지 남고"
    - BLUEPRINT-012 `ledger/blueprint.md:226` "`degraded`(…)가 다음 로드까지 남아"
    - TEST-069 `ledger/test.md:1115` "다음 로드까지의 지속"
  - 경고 중복 키:
    - ERROR-030 `ledger/error.md:644` "로드마다 비운다"
    - ERROR-196 `ledger/error.md:2869` "로드마다 비움"
    - ERROR-202 `ledger/error.md:2966` "로드마다 구조 키(code, path)로 한 번"
    - ERROR-164 MULTIPLE_GATED 행 `ledger/error.md:2440` "로드마다 구조 키(code, path)로 한 번"
  - union 쪽 반영과 채움 쪽 반영의 어긋남: VALUE-037 `ledger/value.md:611`과 VALIDATE-007 보충 `ledger/validate.md:159`의 "`NON_JSON_WHOLE_VALUE`를 `(code, path)`로 로드마다 한 번"은 `resetSubtree()` 뒤에 다시 낸다고 읽히지만, ERROR-204에서는 키가 남아 다시 내지 않습니다.
- 고침: 위 열두 항목(ERROR-135, VALUE-003, ERROR-172, ERROR-164, LANDING-045, BLUEPRINT-012, TEST-069, ERROR-030, ERROR-196, ERROR-202, VALUE-037, VALIDATE-007)마다 다음을 합니다.
  - `- 보충:` 칸에 `  > 편집자 결정(18C-98): "【추론】 \`diagnostics\`와 경고 중복 키는 폼 수준 로드(마운트, \`FormHandle.reset()\`)에서만 초기화한다." (\`reviews/round-18-closing.md:2797\`)`를 더합니다. 보충이 `없음`이면 그 낱말을 이 줄로 바꿉니다.
  - 진단 쪽 일곱 항목에는 `  > 편집자 결정(18C-98): "【추론】 \`setValue(V)\`와 \`resetSubtree()\`는 초기화하지 않는다." (\`reviews/round-18-closing.md:2798\`)`도 더합니다.
  - 출처에 `reviews/round-18-closing.md:2797-2798`을, 닫은 사람에 `편집자 결정(18라운드, \`reviews/round-18-closing.md\` 18C-98)`을 더하고, 라운드를 18로 바꿉니다.
  - 18C-98의 `닫는 항목` 줄(`reviews/round-18-closing.md:2795`, 같은 줄 안의 고침이라 줄 번호가 밀리지 않음)에 위 항목들을 `(보충)`으로 더합니다.
  - 검증: `sup-check`, `ref-check`, 블록 검사.

### 4. VALUE-031 `ledger/value.md:486` — 검사 2 — "조상의 `Merge`나 로드가 그 경로를 담을 때"에 전체 교체 쓰기가 빠짐 [확인됨. t1b 열린 점 5가 이미 지적함]
- 인용: "이런 쓰기가 닿는 길은 넷이다: 조상의 `Merge`나 로드가 그 경로를 담을 때(WRITE-018의 분배)" (`reviews/round-18-closing.md:1819`). WRITE-090 뒤로 `setValue(V)`와 입력의 `Overwrite`는 로드가 아닌데, V가 비활성 경로를 담으면 WRITE-018의 분배로 그 잠복 원본에 닿습니다. 지금 있는 충돌 줄(`:495`)은 `:1794`만 고칩니다.
- 고침: VALUE-031 `- 충돌:` 칸 끝에 더합니다: `  > \`reviews/round-18-closing.md:1819\`의 "조상의 \`Merge\`나 로드가 그 경로를 담을 때"는 소유자 답과 다르다: \`setValue(V)\`와 \`Overwrite\`를 준 입력 쓰기는 로드가 아니라 전체 교체 쓰기이며, V가 그 경로를 담으면 이 쓰기도 WRITE-018의 분배로 그 경로의 잠복 원본에 닿는다(WRITE-090, WRITE-094). 소유자 답이 이긴다(\`reviews/round-18-owner-answers.md:26\`).` 검증: `sup-check`.

### 5. LANDING-067 `ledger/landing.md:1100` — 검사 2 — "`setValue(V)`의 같은 입력 판정(§14의 39행)"에 충돌 줄이 없음 [확인됨]
- 18C-94는 같은 문장을 가진 LANDING-042(`:771`)와 LANDING-095(`:1476`)에만 충돌을 달았습니다. LANDING-067의 정본 `08-design-a-to-z.md:577`에도 같은 문장이 있습니다.
- 고침:
  - LANDING-067에 `- 충돌:` 칸을 둡니다(없으면 새로): `  > \`08-design-a-to-z.md:577\`의 "\`setValue(V)\`의 같은 입력 판정(§14의 39행)"은 18라운드 결정과 다르다: 로드가 아닌 쓰기(\`setValue(V)\` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071, LANDING-199). 18라운드 결정이 이긴다(\`reviews/round-18-closing.md:2730-2731\`).`
  - 닫은 사람에 18C-94를 더하고, 18C-94의 `닫는 항목` 줄(`:2728`)에 `LANDING-067(충돌)`을 더합니다.

### 6. VALUE-030 `ledger/value.md:440,442` — 검사 2 — 결정 문장이 3.16·U6과 어긋나는데 충돌 줄이 없음 [확인됨]
- 인용: "원본과 노드의 형(`type`, nullable)만의 함수" (`reviews/round-18-closing.md:1085`), "쓰기마다 `interpret`가 한 번 정한다" (`:1087`).
- 새 규칙에서 경고등은 현재 spec(유효 목록)의 함수이고, 쓰기 없이 게이트만 바뀌어도 다시 정합니다(`:2520-2521`, U6). 보충(`:455-456`)만 있고, 충돌 줄은 `:1102` 하나뿐입니다.
- 고침: VALUE-030 `- 충돌:` 칸에 두 줄을 더합니다.
  - `  > \`reviews/round-18-closing.md:1085\`의 "원본과 노드의 형(\`type\`, nullable)만의 함수"는 18C-91의 결정과 다르다: 경고등은 원본과 노드의 현재 spec(게이트가 켜진 동안의 유효 목록)만의 함수다(VALUE-037). 18C-91의 결정이 이긴다(\`reviews/round-18-closing.md:2520\`).`
  - `  > \`reviews/round-18-closing.md:1087\`의 "쓰기마다 \`interpret\`가 한 번 정한다"는 18C-91의 결정과 다르다: 경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다(VALUE-037). 18C-91의 결정이 이긴다(\`reviews/round-18-closing.md:2521\`).`

### 7. BLUEPRINT-034의 분할 — 검사 3 — `reviews/round-18-closing.md:70`이 어디에도 없고, REACT-033 가리킴에는 옛 내용이 없음 [확인됨]
- 옛 출처 `57-60,64-66,69-70,72-74,78-80`에서 나머지 BLUEPRINT-043은 `58-60,64-66,69,72,78-80`을 담습니다(`ledger/blueprint.md:764`). `:57`·`:73`·`:74`는 BLUEPRINT-036·037·039가 대체합니다. 그런데 `:70`, 곧 "(4) 입력: 패키지의 기본 입력 정의는 `union` 노드를 문자열 입력으로 그리고, 입력한 글은 (3)의 parse가 해석한다."는 어느 항목도 인용하지 않습니다(원장 전체 grep 0건).
- 이 문장을 대체한다고 적은 블록도 없습니다(18C-92는 BLUEPRINT-033만 보충함). REACT-033의 출처는 `reviews/round-18-closing.md:2575-2630`뿐입니다. 그래서 BLUEPRINT-043에 남은 `:72` "다른 입력은 작성자가 …"가 앞 문장 없이 떠 있습니다(`ledger/blueprint.md:756`).
- 고침:
  - BLUEPRINT-043 결정의 `:755`와 `:756` 사이에 `  > 【추론】 (4) 입력: 패키지의 기본 입력 정의는 \`union\` 노드를 문자열 입력으로 그리고, 입력한 글은 (3)의 parse가 해석한다.`을 넣고, 출처를 `reviews/round-18-closing.md:58-60,64-66,69-70,72,78-80`으로 고칩니다.
  - 보충에 `  > 편집자 결정(18C-92): "【추론】 기본 입력은 친 글에 core와 같은 \`interpret\`를 유효 목록으로 적용하고, 결과가 목록의 한 형일 때만 그 결과를 보낸다." (\`reviews/round-18-closing.md:2575\`)`를 더합니다.
  - BLUEPRINT-034 상태와 색인에서 `REACT-033`을 뺍니다.
  - 검증: `verbatim-check`, `ref-check`.

### 8. BLUEPRINT-043 `ledger/blueprint.md:751,754,755` — 검사 3 — 남은 문장 셋이 소유자 답 29·35와 어긋나는데 충돌 줄이 없음 [확인됨]
- `:60` "원소가 하나면 그 원시 종류다": E8 `['object','null']`은 object 노드입니다(row 29가 (1)의 원시 한정을 대체함).
- `:66` "값이 나열된 타입 가운데 하나에 맞으면 그대로 둔다"와 `:69` "정합은 값이 나열된 타입 가운데 하나라는 뜻이다": 목록은 이제 계산된 `schemaType`(E19 본체 `number`는 `integer`로 좁혀짐)이고, 게이트가 켜진 동안에는 유효 목록입니다(BLUEPRINT-040, row 35).
- 고침: BLUEPRINT-043에 `- 충돌:` 칸을 두고 세 줄을 넣습니다.
  - `  > \`reviews/round-18-closing.md:60\`의 "원소가 하나면 그 원시 종류다"는 소유자 답과 다르다: 접은 집합의 원소가 하나면 그 종류이며 \`object\`·\`array\`일 수 있다(BLUEPRINT-044, BLUEPRINT-045 E8). 소유자 답이 이긴다(\`reviews/round-18-owner-answers.md:29\`).`
  - `  > \`reviews/round-18-closing.md:66\`의 "값이 나열된 타입 가운데 하나에 맞으면"은 소유자 답과 다르다: 목록은 \`node.schemaType\`(+\`nullable\`)이고 게이트가 켜진 동안에는 유효 목록이다(BLUEPRINT-040). 소유자 답이 이긴다(\`reviews/round-18-owner-answers.md:35\`).`
  - `:69`에도 같은 꼴로 한 줄을 넣습니다.

### 9. BLUEPRINT-032 `ledger/blueprint.md:518`, NODE-041 `ledger/node.md:605` — 검사 2 — 보충이 row 28의 "원시 타입만의 다중 `type` 잎"을 충돌 줄 없이 옮김 [확인됨]
- row 29(`reviews/round-18-owner-answers.md:29`)는 "`:28`의 "원시 타입만의 다중 `type` 잎"의 범위도 … 넓어진다"고 적습니다. BLUEPRINT-035(`:598`)에만 충돌 줄이 있습니다.
- 고침: 두 항목의 `- 충돌:` 칸에 BLUEPRINT-035 `ledger/blueprint.md:598`의 줄을 그대로 복사해 넣고, 닫은 사람에 `소유자 답(\`reviews/round-18-owner-answers.md:29\` union 범위; 범위)`를 더합니다.

### 10. merged-v3 3.2의 정의 문장이 들어갈 자리가 없음 — 검사 1 [확인됨]
- merged-v3 `:246`의 "노드의 유효 목록은 `schemaType` ∩ (켜진 게이트 선언의 허용 집합)을 2.4로 계산하고 `'null'`을 뗀 것입니다. 이는 유효 스키마 `type`의 병합 결과와 같습니다"와 `:247`의 "모든 종류에 같습니다 … 정수 규칙"은 줄과 블록 어디에도 없습니다(grep 0건). U4·U5·1.9와 기본 입력 쪽 4.13(`reviews/round-18-closing.md:2597`)에서 간접으로 이끌어 낼 수 있을 뿐, core 쪽 정의는 비어 있습니다.
- 고침(선택, 낮음): 18C-91에 이 두 문장을 【추론】 줄로 더하고 WRITE-093에 인용합니다. 블록 가운데에 넣으면 뒤쪽 인용의 줄 번호가 모두 밀리므로, 파일 끝에 보정 블록을 두거나 다음 라운드로 넘깁니다.

### 11. NODE-057 `ledger/node.md:942` — 검사 1(원문 자체) — "`nullable` … 값은 청사진이 정적 선언만으로 정한다"가 2.21·S3과 어긋남 [확인됨, 옮겨 적기는 충실]
- merged-v3 1.2가 이미 그렇게 적습니다. 그런데 게이트만 있는 이름의 nullable은 게이트 선언들의 OR이고(`reviews/round-18-closing.md:2406`), 형 없는 칸은 정적 연언이 아니라 분기에서 정합니다(E12·E13·E32).
- 고침: NODE-057 보충에 `  > 편집자 결정(18C-90): "【추론】 그 노드의 목록은 선언들 허용 집합의 합집합을 종류 규칙으로 나눈 것이며, \`integer\`는 모든 선언이 \`integer\`일 때만 남고, nullable은 OR이며, \`{null}\`이면 null 종류다." (\`reviews/round-18-closing.md:2406\`)`를 더합니다. 문구 자체를 고치는 일은 소유자 확인 사항으로 올립니다.

### 12. ERROR-100 `ledger/error.md:1611` — 검사 2 — "폼 인스턴스 밖의 사건" 목록에 `VALIDATOR_BIND_REFUSED`가 없음 [확인됨, 낮음]
- 고침: 보충 `없음`을 `  > 반영 칸(union O4, 거부 코드): "폼 인스턴스가 없으므로 \`onError\`는 받지 않으며, \`UNHANDLED_ERROR.REGISTER_PLUGIN\` 행과 같은 부류다." (\`reviews/round-18-owner-answers.md:34\`)`로 바꾸고, 닫은 사람에 row 34를, 라운드를 18로 고칩니다.

### 13. LANDING-172·175·194·202와 블록의 새 항목 선언 — 검사 3 [확인됨, 낮음]
- 인용한 `path:line`은 모두 있고 내용도 맞습니다. 확인한 것: `extractSchemaInfo.ts:23-34`, `schemaNodeFactory.ts:116`, `processAllOfSchema.ts:31-32,45-50`, `processSchemaType.ts:57,65-67,73`, `isCompatibleSchemaType.ts:62-68,77-83`, `useFormTypeInput.ts:70`, `SchemaNodeInput.tsx:50-53,121,124`, `formTypeInput.ts:163`, `formTypeInputDefinitions.ts:44-58`, `formTypeDefinitions/index.tsx:14-25`, `FormTypeInputNumber.tsx:22-24,44`, `FormTypeInputString.tsx:27-29`, `filter.ts:77,197-198`, `value.ts:10-15`, `formTypeRenderer.ts:21`, 플러그인 여섯 파일의 `:62,53,86,51,91,59,125,114,120`, mui `:74-76,81,109`, ajv8 `validatorPlugin.ts:46`, `createValidatorFactory.ts:19-25`, `AbstractNode.ts:716-718`, `stripSchemaExtensions.ts:32-36`, `ValidationManager.ts:150`, `ObjectNode/DETAIL.md:19-20`, `core/types/value.ts:63,65`, `useFormTypeInputControl.ts:37`.
- 빈 곳:
  - LANDING-172(`ledger/landing.md:2446`) "오늘 같은 오류이고"는 가리키는 앞 줄 없이 떠 있고 경로도 없습니다.
  - LANDING-175(`:2479`) "(`:23`)"은 파일 이름이 없습니다.
  - LANDING-194(`:2688`)와 LANDING-202(`:2786`)는 오늘 동작의 `path:line`이 없습니다.
  - 18C-93 `닫는 항목`(`reviews/round-18-closing.md:2634`)은 LANDING-198과 union 쪽 새 항목(BLUEPRINT-036–045, NODE-057·058, VALIDATE-050·051, REACT-032·033, ERROR-203, WRITE-093, VALUE-037, CONTROLS-085, FRAGMENT-055, TEST-077·078)을 선언하지 않습니다. 18C-89–93도 마찬가지입니다. 채움 쪽 블록(18C-94–103)은 새 항목을 선언하므로, 두 반영의 규약이 다릅니다.
- 고침(블록의 같은 줄 안에서 고치므로 줄 번호가 밀리지 않고, 원장 인용도 함께 고침):
  - `:2638`의 "오늘 같은 오류이고"를 "오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:28-29` → `schemaNodeFactory.ts:116`)"로 바꿉니다.
  - `:2641`의 "(`:23`)"을 "(`extractSchemaInfo.ts:23`)"로 바꿉니다.
  - `:2660`의 "오늘 `strictTypes` 로그 경고를 내고"를 "오늘 `strictTypes` 로그 경고를 내고(`schema-form-ajv8-plugin/src/default/validatorPlugin.ts:15-19`에 `strict` 없음, `node_modules/ajv/lib/core.ts:250`의 기본 `"log"`)"로 바꿉니다(두 줄 모두 직접 확인함).
  - `:2816`에는 탐침 근거 `reviews/raw-round18-tests/t1b-fill-consistency.md:116-133`을 붙입니다.
  - `:2634`와 `:2335`·`:2379`·`:2480`·`:2573`의 `닫는 항목`에 위 새 항목들을 더합니다.
  - 원장 네 항목의 결정 인용을 같이 고치고 `verbatim-check`, `ref-check`를 돌립니다.

## 판단 검토
- SURFACE-039 범위 "(로드와 전체 교체 쓰기, `Merge`)": 동의합니다. 18C-103 원문(`reviews/round-18-closing.md:2881`)과 한 글자도 다르지 않고, row 26의 "`DisableAutomaticWrites`는 그 쓰기로 새로 생긴 노드의 채움과 다른 자동 쓰기를 끈다"와 맞습니다. 다만 제목과 표 칸의 "로드 시"(`ledger/surface.md:606,611`)는 남아 있습니다(t1b #10). 선택 사항입니다.
- WRITE-085 `:1235` 충돌: 동의합니다. 18C-97이 `닫는 항목`에 "WRITE-085(보충·충돌)"을 적었고, 자기 정본 줄에 충돌을 다는 선례도 있습니다(NODE-056 `ledger/node.md:935-936`). 그 줄의 `update(i, v)`는 아이템 수를 바꾸지 않으므로 그 부분은 여전히 참입니다.
- WRITE-010을 18C-103 아래 두지 않음: 동의합니다. HEAD(`fcab8d891`)의 WRITE-010에는 보충이 없고, 18C-17 줄은 이번 작업 트리에서 붙었다가 지워졌으므로 원장의 순변화가 없습니다. 다만 18C-103 `닫는 항목`(`:2879`)에 WRITE-010이 없는 것은 블록 쪽 추적성이 빈 것입니다(낮음).
- BLUEPRINT-033 나머지를 표 행으로 인용: 동의합니다. WRITE-078(`ledger/write.md:1104`, "표 행이라 조각 번호로 나눌 수 없다")과 같은 꼴이고, 1–4·6번째 문장이 원문 그대로입니다. 5번째 문장은 BLUEPRINT-040의 보충과 충돌이 나눠 담습니다.
- NODE-056 제목 변경: 동의합니다. HEAD의 `ledger/node.md`에 NODE-056이 없으므로(`git show HEAD:…` grep 0건) 이번 라운드에 생긴 항목입니다.

## 두 반영 사이(검사 5) 요약
- 어긋남이 있는 곳은 지적 2(U7과 SETTLE-048·WRITE-090의 `resetSubtree()`)와 지적 3(`NON_JSON_WHOLE_VALUE` "로드마다 한 번"과 ERROR-204)입니다.
- 어긋남이 없는 곳:
  - U7의 둘째 해석과 SETTLE-047의 순회 예산: 입력 쓰기는 쓴 노드뿐이고, `setValue(V)`는 쓰기가 닿은 하위 트리 안이며, 유효 목록이 바뀐 노드만 결과가 바뀝니다.
  - LANDING 번호: 172–197은 18C-93, 198은 반영이 만든 점검, 199는 18C-94, 200–203은 18C-99입니다. 충돌은 없습니다.
  - ERROR-203의 네 경고 행과 기존 §7.2 코드: 겹치는 이름이 없습니다(ERROR-164 보충 `ledger/error.md:2456-2458`과 같은 글).

## 확인하지 못한 것
- 기계 검사는 다시 돌리지 않았습니다(지시). 위 고침을 적용한 뒤에는 `verbatim`·`sup`·`ref`·블록 검사를 다시 돌려야 합니다.
- 지적 2의 반례는 규칙을 추적한 것이며, `d-rule-a.mjs`나 프로토타입으로 실행하지는 않았습니다.
- merged-v3에 빈 곳일 수 있는 것이 하나 있습니다. 정적 선언이 없는 이름에서 호스트의 게이트 없는 분기끼리 fold가 다를 때의 결과는 2.20(정적 노드가 있을 때)도 2.21(게이트 선언)도 다루지 않습니다.
- LANDING-202 오늘 동작의 코드 경로는 찾지 않았습니다(탐침 P8만 근거).
- EVENT-072의 "한 로드에 한 번(VALIDATE-048)은 그 하위 트리에만"이 폼 단위 기록인 `VALIDATOR_COMPILE_FAILED`에 무슨 뜻인지는 원문만으로 정할 수 없습니다.
