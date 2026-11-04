# 199라운드 닫기 — 07c G1(값과 기본 입력) 완료(03489be43, 스토리 20건, 자동 게이트 126/126, verifier 통과); 07c 세 그룹이 07b-1 e64ad834a 위로 rebase됨; 제품 결함 없음; 내장 입력의 영역 밖 값 표시는 소유자 질의 9번으로 미룸

2026-10-13. fairy07이 G1을 feat/schema-form-07c-stories의 03489be43으로 커밋했고, 07c는 e64ad834a 위에 5fa72520c(G3)·2f40876a4(G2)·03489be43(G1)으로 충돌 없이 rebase됐다(base 이동이 문서 한 파일이라 게이트 재실행 생략). 스토리 20건(Features/Values, 19 시험 + !test 1); 15건은 기존 value·fill·union·nullable 재사용, 새 시나리오 4(primitive-inputs, literal-and-format, default-layers, recursive-tree). e2e features-values 5/5(4 + it.fails 1), 스토리북 126/126, 두 패키지 typecheck·lint, 시나리오 패키지 29/29, 실제 창 19건 PASS와 열린 물음 스토리의 의도된 실패({scratch}/07c-g1). verifier 첫 판정 FAIL(7건) 모두 반영 뒤 재검토 PASS. 제품 결함 없음. 소유자 질의: 내장 string enum select가 비제어이고 빈 옵션이 없어 집합 밖 값 'XL'을 첫 옵션 'S'로 그리고, date 입력은 'not-a-date'를 빈 칸으로 그려 화면과 노드 값이 어긋남 — REACT-027(misfit만)·REACT-033(내장 입력은 enum·format의 뜻을 약속하지 않음)으로 원장이 정하지 않음; values.finding-restricted-input-out-of-domain과 it.fails, 스토리 Features/Values/Findings로 고정. 다음은 G5.

### 199C-01 (1) G1은 기록대로 받는다; (2) 내장 입력의 영역 밖 값 표시는 소유자 결정이므로 `reviews/owner-queue-07.md` 9번으로 미루고(198라운드 부재 규칙), 고정된 발견 시나리오는 답이 올 때까지 it.fails로 둔다 — 원장 관리자 의견은 큐에 적지 않고 소유자 귀환 때 함께 올린다: 최소 입력은 값을 바꾸지 않는 한 화면 어긋남을 허용하되(REACT-033), 집합 밖 값일 때 빈 옵션 하나를 그려 "선택 없음"으로 보이게 하는 작은 변경이 가장 싸다; (3) 다음은 G5

- 닫는 항목: TEST-025(보충), REACT-033(보충)
- 결정:
  - 【추론】 영역 밖 값의 표시는 원장이 비워 둔 제품 결정이고 다른 그룹에 의존하지 않으니 미루는 데 비용이 없다.
- 근거: fairy07의 G1 보고; REACT-027·033; 198라운드.
- 다음: 원장 관리자가 fairy07에 알린다.
