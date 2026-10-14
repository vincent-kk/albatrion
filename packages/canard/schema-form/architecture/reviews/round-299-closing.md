# 299라운드 닫기 — 문서 사이트 api-reference 재작성 PR #375 병합(c2c6007b2), 대기열 53 개설

2026-10-14. 298라운드 지시(구조 리뷰 전까지 무정지, 병합 허용)로 fairy08이 정돈-4의 문서 사이트 `api-reference.mdx`(en·ko) 전면 재작성 PR #375를 열었고, 원장 관리자가 대조해 squash 병합했다.

### 299C-01 PR #375를 c2c6007b2로 1.0.0-beta에 squash 병합했다 — 문서 사이트 두 파일만, 옛 엔진 항목 전부 제거

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 fairy08 게이트: documents 빌드 en·ko 성공, prettier 0, en·ko 코드 블록 바이트 동일, 세션 줄·옛 이름·개인 이름 0, verifier(예제 14블록 엄격 tsc 통과·공개 이름만; 문구 지적 7건 반영 뒤 PASS). 원장 관리자 대조: 파일 둘(documents/ 아래만), 930+/416−, 세션 줄 0, 옛 이름 0(`FieldNodeEventType`가 `NodeEventType`에 부분 일치한 18줄은 거짓 양성). 문서만의 변경이라 Claude 세션이 직접 고쳤다(217C-01). 드러난 사실 하나: core는 `maxItems`·`minItems`를 강제하지 않고 기본 배열 입력이 `maxItems`에서 추가 버튼만 숨긴다(`FieldInputArray.tsx:82`) — 의도인지 소유자 확인이 필요해 대기열 53으로.
- 근거: PR #375 본문(절별 근거 path:line); fairy08 보고; 원장 관리자 diff 대조.
- 다음: 같은 문구 문제가 패키지 문서·소스 주석에 남아 있다(`components/Form/type.ts`의 errors prop "Initial validation errors", `core/surface/type.ts:113-114`의 globalErrors 주석, #373이 쓴 getValue "array output filters applied") — 정돈-E 문서 절과 함께 고친다. `node.setValue`가 실행 시 함수 갱신자를 받지만 선언 형은 `value: unknown`인 것은 정돈-E E5(형 좁히기)에서 본다.
