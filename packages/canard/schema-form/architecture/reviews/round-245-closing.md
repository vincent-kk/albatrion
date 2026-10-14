# 245라운드 닫기 — ②-3 확인(9bbabf211)과 ⑨의 통지 규칙 결정: onValidate는 보고된 목록이 바뀔 때만 불린다(가안)

2026-10-13. fixy07 보고: ②-3 9bbabf211(문서 이름 치환, CLAUDE.md 다섯 파일 이름만, inputType 명세 한 줄, 스토리 제목 'Usage/Field input', 스토리 241 유지, 옛 이름 0). ⑨는 작업 트리에서 Provider가 마지막 onValidate 보고를 루트 교체 뒤에도 기억(`store.lastReportedErrors`)하고, reset 뒤 새 집계가 비었고 마지막 보고가 비어 있지 않으면 `[]`를 한 번 보고한다. verifier가 찾은 예외 경로(콜백이 throw하면 reset 후처리가 건너뛰어 화면이 옛 값으로 남음)는 보고 위치를 리스너 통지 뒤로 옮겨 고쳤고 고치기 전 실패하는 시험을 더했다. 남은 결정: "빈 보고 바로 뒤의 빈 보고는 억제"를 reset 밖까지 적용할지(가) reset으로 좁힐지(나). 실측: reset 안은 기본 2→0, OnChange 2→1, None 두 번째 reset 1→0; reset 밖은 OnRequest에서 직전 보고 `[]`인 validate() 1→0, errors prop `[x]`→`[]` 뒤 첫 validate() 1→0; 마운트 호출 수·validate() 반복·validation-unchanged-result 다섯·StrictMode는 변화 없음.

### 245C-01 ⑨의 통지 규칙 — (가) 받아들임: `onValidate`는 보고된 오류 목록이 바뀔 때만 불린다(reset 안팎 모두). 같은 `[]`를 거듭 보고하지 않으며, RootNodeContext/DETAIL.md와 providers/DETAIL.md에 규칙을 적고 "errors prop을 비운 뒤 validate()는 추가 호출 없음" 시험을 둔다

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 소유자가 234라운드에서 대기열 22에 고른 B안("합산이 바뀔 때만 통지")과 243C-01(reset 때 빈 목록을 한 번 통지)은 같은 규칙의 두 면이고, (가)는 그 규칙을 한 문장으로 만든다. Form/type.ts의 JSDoc("결과가 목록을 바꿀 때 호출")과도 맞는다. 잃는 호출 둘은 모두 소비자가 이미 `[]`를 받은 뒤의 반복이며, validate()는 반환값으로 결과를 돌려주므로 정보 손실이 없다. (나)는 OnChange의 비동기 검증 때문에 reset 구간을 따로 정의해야 해 설계가 커진다.
- 근거: fixy07 보고와 verifier 실측; 234라운드 소유자 답(대기열 22 B안); 243C-01; `src/components/Form/type.ts:55`.
- 다음: fixy07이 ⑨를 커밋하고 전체 게이트, push, PR을 연다. PR 본문의 런타임 변경 목록에 이 규칙을 적는다.
