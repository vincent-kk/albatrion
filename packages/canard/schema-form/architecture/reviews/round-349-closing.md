# 349라운드 — 닫기 (묶음 3 derive PR #394 병합 fa674d5fa; 편집자 결정 둘; navigation은 변경 없음으로 확정)

2026-10-15. 344라운드의 자율 진행 지시에 따라 원장 관리자가 묶음 3의 둘째 PR(derive 재구조화) #394를 검토하고 `feat/schema-form-08-review-and-perf`에 squash 병합했다(fa674d5fa). 내용: `evaluateDeriveRound`를 derive의 자식 fractal로 올리고(라운드 판정만 쓰는 보조 11개는 그 안의 utils/{rank, inject, writes}), 두 판정이 함께 쓰는 보조는 utils/evaluate·utils/rules로 평탄화, 상수는 constants/, 형은 types/{rules, state, decisions}.ts, derive DETAIL 5-6행의 settle 자식 모순 문장 삭제(H2 보고, 336라운드 7·8번). derive 진입점의 이름 일곱과 공개 94개는 그대로다. 검증은 codex 한 번, fairy08의 INTENT·DETAIL 대조(낮음 둘, 기존 공백 둘), 원장 관리자 verifier(선언 46개 본문 동치, 경계 0, 순환 0, production 20·derive 44·unit 2420 그대로)였고, 보완 넷은 cfaa8835d로 같은 PR에 들어갔다. 이번 이동은 25파일 규모라 fixy08이 이동표와 가져오기 재작성 스크립트로 직접 했고 codex는 검증을 맡았다.

## 편집자 결정

- **349C-01 (PR #394 병합 기록과 navigation 무변경).**
  - 【추론】 묶음 3 derive PR #394를 fa674d5fa로 squash 병합했다. navigation은 바꾸지 않는다: `walkFieldNodes`는 이미 없고 `visitFieldNodes`에는 settle 열 곳과 write 네 파일의 제품 소비자가 있으며 문서가 지금 트리와 맞으므로, H2 보고의 "가벼운 정리"는 할 것이 없다. 묶음 3은 blueprint·derive·settle의 PR 셋으로 끝난다.
- **349C-02 (계약 id는 시험 파일 하나에 하나, 표지 없는 수용 기준 절은 시험을 얻는다).**
  - 【추론】 DETAIL의 수용 기준 절(`filid:contract` id)은 시험 파일 하나가 표지하고, 한 시험 파일이 서로 다른 절을 검사하면 id를 둘 달되 같은 id를 두 파일이 나누어 갖지 않는다(형제 명세 겹침 금지). 표지 시험이 없는 절은 그 계약을 검사하는 기존 시험을 찾아 표지하고, 없으면 작은 시험을 더한다(derive-failures는 `derive.failures.test.ts`를 얻었다). 형 파일의 칸은 형이 "무엇의 일부인가"로 정한다 — 판정 출력 `DeriveTraceEntry`는 state가 아니라 decisions에 둔다. fractal DETAIL의 "이것만 의존" 목록은 helpers까지 빠짐없이 적는다.

## 남은 것

fixy08: settle PR(loadFieldNodeAtMount·arrangeFieldNodeItems fractal, compute/selectChildren·structure/applyArraySlots 해소, 11칸 순환 풀기, pathStores·templatePaths 이름, 저장소 키 misfits·misfitsMemo, FormCore·FormError·FormLabel의 type.ts → types/, record·write·validation의 형 칸 유지 이유, 설정 glob 점검, production 게이트). fairy08: settle PR의 INTENT·DETAIL 대조, 병합 뒤 속도 계획·bench 최종 경로 PR. 결정 대기열 54–57은 열려 있다.

다음 라운드 번호는 350이다.
