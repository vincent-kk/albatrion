# 202라운드 닫기 — 07c G4(파생·주입·watch) 게이트 통과(스토리 31건, 자동 게이트 179/179, e2e 251/251, 실제 창 31건)이나 verifier 서브에이전트 실행이 권한 분류기에 거부됨; 198라운드 규칙대로 재시도 없이 "verifier 검토 보류"로 커밋하고 G6으로 진행하며 소유자 질의 12번으로 남긴다

2026-10-13. fairy07이 G4를 보고했다(아직 커밋 전, 워크트리에 보관). 스토리 31건(Features/Derivation: ControlStates 5, VisibleVersusActive 8, DerivedAndWatch 5, InjectTo 8, FeedbackBudget 3, ResetInteraction 1, ContextReference 1); 새 데이터 src/features/derivation의 visible-versus-active, watch-dependency, reset-interaction(pristine은 resetInteraction으로, CONTROLS-029), context-reference(CONTROLS-080 `@`); 나머지는 controls·exit·derive·union 시나리오 재사용; e2e 새 사례 6(2파일); 스토리북 179/179, e2e 251/251, 두 패키지 typecheck·lint, 시나리오 34/34; 실제 창 31건 PASS(/tmp/claude-501/07c-g4). 차단: G4 게이트 검토용 읽기 전용 verifier 서브에이전트 실행이 auto-mode 분류기에 "Auto-Mode Bypass"로 거부됨(브리프의 DeriveBudgetDegrades 하네스 설명 문구가 권한 우회로 읽힌 것으로 추정); fairy07은 재시도·우회 없이 소유자에게 물었다. 원장 관리자가 보낸 첫 안내도 같은 사유로 거부됐다. 메모: (a) derive.disable-automatic-writes-load는 스토리 없음(FormHandle.reset에 호출별 automaticWrites 옵션이 없어 스토리 단계 runner가 throw; e2e로 덮임); (b) DeriveBudgetDegrades는 degraded 단계를 핸들 API로 구동(화면 토글은 입력 이벤트 핸들러 밖으로 BUDGET_EXCEEDED를 던져 브라우저 미처리 오류가 됨; play가 throw를 잡고 출력·진단 단언 유지); (c) 기존 browser-gates IME 조합 스토리가 부하 중 전체 실행에서 한 번 시간 초과, 단독·재실행 통과 — flake 관찰; (d) 공용 play 도우미(createHandleProbe, expectEventually, readStateNames)가 G4·G5 공용이라 stories/features/components로 이동.

### 202C-01 (1) 거부된 verifier는 재시도하지 않는다(소유자 부재 중 권한 문제는 198라운드 규칙대로 기록하고 넘어감); (2) G4는 "verifier 검토 보류(거부됨, 소유자 귀환 뒤)"를 커밋 메시지에 적어 커밋하고 G6으로 진행한다 — G4는 자동 게이트·e2e·실제 창으로 검증돼 있고 07c PR 전체의 최종 독립 검증(원장 관리자 세션의 verifier) 때 G4 검토를 함께 한다; (3) `reviews/owner-queue-07.md` 12번에 귀환 때 확인으로 적는다; (4) 메모 (a)·(b)·(d)는 허용; (c)는 07b 정리 목록의 browser-mode guard 행에 "부하 시 flake 관찰"로 덧붙인다(fixy07)

- 닫는 항목: TEST-025(보충), CONTROLS-029(보충)
- 결정:
  - 【추론】 소유자는 멈춤 없이, 권한 문제는 미루라고 했다. G4의 품질 증거는 이미 셋이고 PR 최종 검증이 남아 있으니 verifier 하나를 뒤로 미뤄도 위험이 작다.
- 근거: fairy07의 G4 보고; 198라운드와 덧붙임; CONTROLS-029·080.
- 다음: 원장 관리자가 fairy07에 알렸고 fixy07에 (4)를 알린다.
