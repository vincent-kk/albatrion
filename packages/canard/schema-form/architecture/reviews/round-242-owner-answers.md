# 242라운드 — Vincent의 답 (이름 치환은 CLAUDE.md 여섯 파일과 docs를 포함한 모든 영역에서 허용)

2026-10-13. 240라운드에서 올린 패키지 CLAUDE.md 여섯 파일(schema-form 7줄, antd-mobile 6줄, antd5 2줄, antd6 2줄, mui 3줄)의 옛 이름 치환 승인 요청에 소유자가 원장 세션에서 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| CLAUDE.md 치환 | 여섯 CLAUDE.md의 옛 이름을 새 이름으로 치환(이름만)해도 되는지 | "어 치환 허용. docs 를 포함해서 모든 영역에 대한 수정 허용" | 242C-01: 239라운드 대응표에 따른 이름 치환은 패키지 CLAUDE.md 여섯과 docs/·documents/ 사이트를 포함한 모든 영역에서 허용(CLAUDE.md는 이름 치환에 한함; 다른 내용 변경은 여전히 별도 승인); 07b-2 ②-3이 CLAUDE.md 여섯을 포함하고 grep 게이트에서 CLAUDE.md 제외를 해제; documents/는 #361 |

다음 라운드 번호는 243이다.

## 덧붙임 (2026-10-13, 07b-2 ⑦·⑧·①-c 커밋 보고)

fixy07 커밋(push 전): ⑦ 1ecca9a53 런타임(234라운드 B안) — 합산 참조가 바뀔 때만 UpdateGlobalError, 빈 상수를 EMPTY_GLOBAL_ERRORS 하나로; 마운트 onValidate 호출 기본 모드 1·None 0·errors prop 2·빈→빈 0; verifier 조건부 PASS → core/validation INTENT·DETAIL에 새 export 기록, dispatch DETAIL "참조가 바뀔 때" 반영. ⑧ b310fc39e 형만 — BasicSchema 최상위 다섯 선언 삭제, SchemaPresentation이 다섯을 직접 선언, 슬롯 형 C1; d.ts 재생성 dts-diff-8.txt와 동일, 공개 index.d.ts 불변, 플러그인 일곱 tsc 0; verifier PASS. ①-c ffd671842 CLAUDE.md 78·141행 두 줄; PASS. 수치: typecheck·lint 0; 비브라우저 548 파일·3909 통과·1 todo; production 20; storybook 241. 보고 둘 → 대기열 31(최상위 `formType: 'x'`가 색인 서명 `[alt: string]: any` 때문에 여전히 컴파일됨; hasExtensionKeys.ts·stripSchemaExtensions.ts는 런타임에서 최상위 키를 계속 읽고 지움)과 32(OnRequest 모드에서 ref.reset() 뒤 onValidate의 마지막 값이 옛 루트의 오류로 남고 getErrors()는 []). ② 1단계(②-1 코어, ②-2 플러그인 일곱과 aileron 소비자)는 codex 진행 중, ②-3(문서·CLAUDE.md 여섯)은 그 뒤.
