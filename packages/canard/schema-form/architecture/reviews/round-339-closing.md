# 339라운드 — 닫기 (이동 묶음 1 PR #387 병합 daadce7ab; 편집자 결정 넷; CLAUDE.md 두 줄 갱신)

2026-10-15. 소유자가 PR #387을 보고 병합을 지시했다("머지하도록. 그리고 다음단계로."). 원장 관리자가 `feat/schema-form-08-review-and-perf`에 squash 병합했다(daadce7ab). 내용: src/rolled를 src/types로 합침(칸 넷 schema·field·error·rolled, 공개 Roll 형 18개는 Rolled 접두사로 두고 src/index.ts에서 rename — 338라운드), hooks/hooks를 hooks/fieldNode·hooks/form으로, 제품 코드 한글 주석 셋 영문화, misfit 계열 16가지 418회를 misfit으로(경고 코드 값 SCHEMA_FORM_WARNING.MISFIT 포함). 게이트: typecheck·lint 0, unit 2390, render·react18 725, 시나리오 45, 공개 표면 94 이름 동일(d.ts 표기 7행 변경), filid 새 지적 없음, verifier 지적 여섯 반영.

## 편집자 결정

- **339C-01 (이름 충돌의 최종 모양).**
  - 【추론】 묶음 1 중 원장 관리자가 먼저 고른 (나) Base* 접두사는 337·338라운드 실험 뒤 소유자가 (가) Rolled 접두사로 바꿨다. 근거 정정: `export type { RolledX as X }` 재수출은 사용자 쪽 오류 메시지·추론 표시에서 대부분 X로 보이고, Rolled 이름은 import 심볼 hover와 d.ts 정의 이동에서만 보인다(원장 관리자의 앞선 "많이 샌다"는 말은 과장이었음). 정의 자리에서 Roll을 펴는 둘째 안은 재귀 스키마 형 16개에서 TS2456 순환 별칭 오류로 성립하지 않는다(실험 패치는 fixy08 scratchpad).
- **339C-02 (Form Roll 형 셋의 자리).**
  - 【추론】 rolled/form.ts를 types로 옮기면 types ↔ components/Form 형 전용 순환이 생기므로, 셋은 각 자식 fractal(FormField·FormInput·FormRender)의 types/props.ts에 `RolledFormXProps = Roll<FormXProps>`로 두고 자식 관문·Form 관문을 거쳐 src/index.ts가 rename한다. Form의 types 칸에 두는 안은 organ이 자식 fractal을 쓰게 되어(B1) 쓰지 않았다.
- **339C-03 (InferJSONSchema 둘).**
  - 【추론】 공개 `InferJSONSchema`(작성 스키마 추론, union·virtual 없음)와 내부 추론(virtual·union을 앎)은 정의가 달라 하나로 합칠 수 없다. 내부 것은 `InferFieldInputSchema`로 types/field/에 두고 공개 추론 결과는 바꾸지 않는다. 묶음 2 (f)에서 작성 형의 type 추론에서 'virtual'을 뺄 때 이 구분이 기준이다.
- **339C-04 (역할 이름 fractal의 칸).**
  - 【추론】 hooks·types처럼 역할 이름을 가진 fractal은 칸을 주제 이름으로 둔다(hooks/fieldNode·form, types/schema·field·error·rolled). 이동으로 고아가 된 값 export 다섯(BooleanValue 등)은 types/index.ts에서 지웠다(원칙 6).

## CLAUDE.md (소유자 승인 336라운드 4번)

packages/canard/schema-form/CLAUDE.md의 표준 fractal 모양 두 줄을 고쳤다: 형은 뿌리 type.ts가 아니라 관심사별 `types/` 칸에; organ 안 진입 함수는 형제 모양을 따르며 파일·디렉토리를 섞지 않는다; 역할 이름 fractal의 칸은 주제 이름(hooks/hooks·types/types 금지); 함수에서 뽑은 보조 도구는 함수 이름 껍데기 디렉토리가 아니라 주제 칸에 둔다.

## 남은 것

fairy08: misfit 문서 PR(README 둘·SPECIFICATION 둘·src DETAIL 8·design 8·히스토리 가능 범위). fixy08: 묶음 2(상수·정규식·inheritDoc·템플릿 리터럴·schemaType·walkFieldNodes; 소비자 없는 types/index.ts export 12개 삭제 포함), 묶음 3(engine 재구조화, PR 셋). @inheritDoc 규약 NODE-049의 대체는 묶음 2 병합 때 적는다. settle path-index 저장소 키 mismatches·mismatchMemo는 묶음 3에서 이름을 맞춘다.

다음 라운드 번호는 340이다.
