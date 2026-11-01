# 257라운드 — Vincent의 답 (작은 수정 넷을 바로 시작; 이번에 한해 codex 위임 없이 Claude가 구현)

2026-10-14. 256라운드 뒤 원장 관리자가 "승인된 작은 수정 넷(36·37·16·18)을 fixy07이 한 가지로 처리하는 동안 설명 문서를 갱신하고, 둘 다 끝나면 구조 변경"을 권고했고 소유자가 원장 세션에서 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 시작·구현 주체 | 권고 순서로 시작할지, 구현은 누가 할지 | "그래 바로 시작하자. \n이번에 한해서는 codex 위임 없이 claude 로 하도록 해. 좀 느리거든" | 07b-4(대기열 36·37·16·18)를 fixy07이 codex 위임 없이 직접 구현(217C-01의 codex 단계만 이번에 한해 제외, 계획·verifier·직접 검증은 그대로); 원장 관리자는 개선-38 문서 이름 갱신 |

257C-01: 07b-4 브리프 — 가지 feat/schema-form-07b-4(switch 13838752b), 워크트리 {scratch}/stage-07b4. 커밋 넷: (36) ObjectSchema·ArraySchema의 `options`에 `terminal?: boolean` 선언과 SPECIFICATION.md `options.terminal` 절(object·array에서 branch/terminal 결정, 다른 종류에서는 TERMINAL_OPTION_UNSUPPORTED); (37) 내장 checkbox 입력의 선택지별 고유 id와 label 연결, 고치기 전 실패하는 시험; (16) 공개 형에서 옛 키(`computed`, `&if`·`&active` 등 `&` 접두 키, 스키마 수준 `injectTo`, 최상위 `virtual`) 삭제와 `controls` 형 명시의 두 커밋 — 215C-02 범위, 런타임 불변; (18) 플러그인 일곱의 package.json 버전 0.16.0 → 0.17.0. 게이트: schema-form 시험·typecheck·lint, 플러그인 일곱 build·시험, d.ts 차이 보고.

다음 라운드 번호는 258이다.

## 덧붙임 (2026-10-14, 07b-4 범위 조정과 개선-38 문서 이름 갱신)

fixy07 확인: 대기열 16(공개 형의 옛 키 삭제·controls 형 명시)과 18(플러그인 일곱 0.17.0)은 07b-1 b1da5e771에서 이미 반영돼 13838752b에 들어 있음(src/types/jsonSchema.ts:290 `controls?: SchemaControls<…>`, 옛 키 부재를 src/types/__tests__/schemaSurface.type.test.ts가 시험; 플러그인 package.json 0.17.0). 편집자 결정: 둘을 07b-4 범위에서 빼고 닫으며, (16) 자리에 src/types/fieldInput.ts:66 주석의 "`computed.watch`(=`&watch`)"를 `controls.watch`로 고치는 주석 커밋을 둔다. 07b-4는 세 커밋(36·37·주석). 원장 관리자는 개선-38 설명 문서(scratchpad/2026-10-13-explain-schema-form-fractal-structure.html)와 근거 문서(.seiri/tasks/schema-form-switch-review-round2/improvement-38-fractal-map.md)의 이름을 13838752b 기준으로 갱신했다(`formTypeDefinitions`→`fieldInputs`, `helpers/formTypeInputDefinition`→`helpers/fieldInputDefinition`, `FormTypeRendererProvider`→`FieldRendererProvider`, `FormTypeInputsContext*`→`FieldInputsContext*`, `FormTypeInputUnion`→`FieldInputUnion`; 인용 줄 번호 확인). 디렉터리 구조는 85786e710과 13838752b 사이에 바뀌지 않았으므로 소유 트리·후보 모양 넷·권고 C는 그대로 유효하다.
