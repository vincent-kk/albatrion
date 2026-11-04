# 327라운드 닫기 — 구조 손질 5 PR #385 병합(c2d5f737e): Field는 본체 이름 FieldProxy의 fractal, 부품 둘은 그 아래; 약식 전체 게이트 통과

2026-10-14. fixy08이 326라운드 결정대로 구조-5를 마쳐 PR #385(문서 → 이동 커밋 둘, 소유자 커밋 66dd4e0e1 위)를 열었고, 원장 관리자가 확인 뒤 스쿼시 병합했다.

### 327C-01 #385를 병합한다 — 이름 바꿈 36, 삭제는 합쳐진 문서 넷과 옛 하위 index 하나, 표면 94 동일, 시험 3841 통과

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 확인: 세션·공동 저자 줄 0, 금지 경로 0, 루트 index diff 없음, 결과 트리는 `components/FieldProxy/{INTENT,DETAIL,index.ts,FieldProxy.tsx,type.ts,__tests__,components/{FieldInputSlot,DeferredFieldProxy}}`. 약식 전체 게이트(326라운드): typecheck·lint 0, unit·render·react18 한 번 567파일 3841 통과·할 일 1·실패 0, 표면 열거 94 동일, filid 새 지적 0(기존 형 전용 순환과 시험 상한만). fixy08의 선택 둘: 부품 둘이 뿌리 `type.ts`의 `FieldProxyProps`를 위로 가져오는 import 세 곳을 filid가 경계 우회로 판정하므로 원칙 4(위로 열림)를 근거로 `FieldProxy/DETAIL.md`의 Boundary Exemptions에 선언 — 이것은 "모델의 위로 열림을 filid가 fractal 뿌리 파일에는 허용하지 않음"이라는 filid 개선 결정 재료(294라운드)다; 옛 경로가 남은 `docs/ko/MOBILE_PERFORMANCE_REPORT.md`와 bench 스크립트 둘은 변경 전부터 낡아 그대로(속도 계획 개정 때 처리). 패키지 CLAUDE.md의 경로 한 줄 갱신은 사실 갱신이라 허용. 병합 결과 1.0.0-beta는 c2d5f737e. 구조 리뷰 손질 1–5 완료.
- 근거: PR #385(fixy08 보고, 2026-10-14); `reviews/round-326-owner-answers.md`; `fca-import-model.md` §2(위로 열림).
- 다음: 소유자의 추가 손질이나 밤 루프 결정을 기다린다. filid 결정 재료 목록(누적): B8 선언 문법과 vi.mock 경로, 설정 키 organNames와 규칙 문서의 불일치, fractal 뿌리 파일의 위로 열림 미허용, config 면제가 통과로 셈(F3), 훅의 문서 삭제 차단.
