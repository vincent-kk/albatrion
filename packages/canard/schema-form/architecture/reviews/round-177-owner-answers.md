# 177라운드 — Vincent의 답 (ENHANCED_KEY와 transformErrors는 새 엔진에서 제거 가능하다; reviewer 세션이 제거를 진행한다)

2026-10-12. reviewer 세션이 소유자의 물음("ENHANCED_KEY와 transformErrors가 새 엔진에서 아직 필요한가, 옛 엔진의 잔재인가")을 전해 왔고, 원장 관리자가 조사해 답했다 — 새 엔진(src/__legacy__ 제외)에서 ENHANCED_KEY는 src/app/constants/internal.ts:3에 정의되어 transformErrors.ts:21의 마커 필터에만 쓰이며 새 엔진은 마커를 주입하지 않음; transformErrors(src/helpers/error/transformErrors/transformErrors.ts:13)는 단위 시험 외 호출 0건이고 문서(src/providers/RootNodeContext/INTENT.md:12, src/helpers/error INTENT·DETAIL, src/app/plugin/type.ts:193 JSDoc)만 남음; 원장은 VALIDATE-010·LANDING-115·PR-4 표(ledger/landing.md:1427)에서 둘 다 "사라진다"로 정함; 둘 다 src/index.ts·dist d.ts·0.16.0 공개 d.ts에 없음; 0.16.0 런타임은 검증기 결과와 errors prop에 transformErrors를 불렀으므로 비배열 입력 → 빈 배열, 외부 오류 객체에 순번 key 부여가 그것에 기대던 동작이며 새 엔진의 해당 경로는 별도 확인 대상. 소유자가 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| ENHANCED_KEY·transformErrors 제거 | 두 식별자가 새 엔진에 필요한지 | "제거 가능하다고 답변해. 작업은 진행중인건가? 아니면 멈춘거야?" (2026-10-12, 원장 세션) | 확정. (1) 새 엔진 쪽의 ENHANCED_KEY와 transformErrors를 제거한다 — reviewer 세션이 feat/schema-form-switch에 커밋하며, src/__legacy__는 그대로, 단위 시험 파일 삭제, 낡은 문서 세 곳 수정, src/app/constants/internal.ts의 다른 상수 유지, ajv 플러그인의 자체 transformErrors.ts는 별개, 커밋 근거는 VALIDATE-010·LANDING-115·PR-4 표. (2) errors prop의 비배열 입력과 외부 오류의 key 부여가 새 엔진에서 어떻게 되는지는 제거와 별개로 reviewer가 확인해 보고하고, 차이가 있으면 소유자에게 따로 올린다. (3) 물음 둘째("작업은 진행 중인가")에 대한 원장 관리자의 답: reviewer는 이 항목을 소유자 결정 전까지 커밋하지 않고 있었고 origin/feat/schema-form-switch는 a919ab7ae 그대로였다; fixy07은 개선-32 커밋 2 구현 중(측정 없음); fairy07은 6006 스토리북을 띄운 채 소유자의 실제 IME 확인을 기다린다. |

다음 라운드 번호는 178이다.
