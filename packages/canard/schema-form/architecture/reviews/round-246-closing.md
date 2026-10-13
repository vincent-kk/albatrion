# 246라운드 닫기 — PR #362(07b-2, head a723e2f18) 직접 검증 통과, verifier 지적 하나로 ⑨ 보강: 같은 목록의 반복 보고를 참조 비교로 막는다

2026-10-13. 원장 관리자가 PR #362를 직접 검증했다: 커밋 13개 모두 세션 줄·co-author 줄 0, 파일 437개가 모두 packages/ 아래(canard 본체 269, 플러그인 일곱 146, aileron 22), 옛 이름은 `__legacy__`·architecture·documents·benchmark-form/results 밖에서 production-test의 경로 문자열 `/dynamic-object-formtype` 둘만 남음. 게이트(원장 세션 실행): 비브라우저 시험 3927 통과·0 실패·1 todo, production 20, storybook 241 통과, typecheck 0, lint 0, 플러그인 빌드 일곱 통과, 플러그인 시험 130·135·334·15·15·5·2 통과. verifier(opus) 결과: ⑨의 reset 처리 (a)(b)(c)는 통과이고 공개 export 차이는 PR 본문과 정확히 일치하나, 구현은 "빈 보고 뒤의 빈 보고"만 거르고 같은 비어 있지 않은 목록의 반복 보고는 거르지 않는다(`src/providers/RootNodeContext/utils/reportRootLoadValidation.ts:16`; errors prop을 준 마운트에서 같은 목록 X가 두 번 보고되며 `src/__tests__/e2e/validation-mount-calls.test.tsx:58-62`가 두 번으로 고정). 그 밖에 낮음 하나(콜백이 던지면 교체 마운트의 load.error가 던져지지 않음)와 비고 하나(`export type * from './types/rolled'`가 `FieldRendererProps`를 내보내는 이름 변경은 index.ts diff에 보이지 않음).

### 246C-01 ⑨ 보강 — `reportRootLoadValidation`에서 직전 보고와 같은 참조의 목록은 보고하지 않는다(빈 목록뿐 아니라 모든 목록); errors prop 마운트의 onValidate 호출 수는 2 → 1로 바뀌고 그 시험을 고친다; 콜백이 던져도 교체 마운트의 load.error는 던져지며; 아직 보고가 없을 때의 재생성 reset 시험을 더한다; PR 본문 d.ts 절에 rolled의 `FieldRendererProps` 이름 변경 한 줄을 적는다

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 245C-01의 규칙("보고된 목록이 바뀔 때만")을 구현이 절반만 따른 것이고, 소유자가 대기열 22에서 바란 것은 같은 결과의 중복 호출을 없애는 것이다. 참조 비교 한 줄이 규칙을 그대로 코드로 옮기며, 바뀌는 관찰 가능 동작은 errors prop 마운트의 중복 호출 하나뿐이다.
- 근거: verifier 보고(reportRootLoadValidation.ts:16, validation-mount-calls.test.tsx:58-62, RootNodeContextProvider.tsx:103-109); 234라운드 소유자 답(대기열 22); 245C-01.
- 다음: fixy07이 보강 커밋 하나를 07b-2에 더하고 게이트를 다시 돌려 push; 원장 관리자가 그 커밋만 재검증한 뒤 소유자에게 병합 허가를 묻는다.
