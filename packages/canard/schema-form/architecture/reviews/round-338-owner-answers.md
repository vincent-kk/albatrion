# 338라운드 — Vincent의 결정 (Roll을 정의 자리에서 펴는 실험이 재귀 스키마 형 16개에서 실패; rolled 칸을 유지하되 내부 형은 본명, 공개 형에 Rolled 접두사를 붙이고 export 때 rename)

2026-10-15. 337라운드 실험 결과: 스키마 형은 재귀라 정의 자리의 `Roll<…>`이 순환 별칭 오류(TS2456 16, 연쇄 92)를 내고, 재귀 없는 넷(FieldRendererProps, Form 조각 셋)만 정의 자리에서 펼 수 있었다. 소유자가 (가)를 골랐다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| Roll 실험 실패 뒤: rolled 칸 유지, 공개 형은 Rolled 접두사·export 때 rename | 스키마 형 16개의 처리 셋(유지 / 16개만 Roll 포기 / 이름만 다른 유지) | "가. 로 가죠. 외부 노출을 Rolled 를 붙이는 이전 방식으로 해주세요" (2026-10-15, 원장 세션) | (가) 확정. 내부 기반 형은 본명(`NumberSchema` 등, 337라운드 전의 Base* 변경은 되돌림), 공개 Roll 형은 `RolledNumberSchema`처럼 Rolled 접두사로 `types/rolled/` 칸에 두고, `src/index.ts`가 `export type { RolledNumberSchema as NumberSchema }`로 공개 이름을 유지한다. Form 조각 셋은 각 자식 fractal의 types 칸에 `RolledFormFieldProps = Roll<FormFieldProps>`로 두고 Form 관문을 거쳐 같은 방식으로 rename. 공개 표면 94의 이름·개수 불변. types의 칸은 schema·field·error·rolled 넷, 내부 `InferFieldInputSchema` 분리는 그대로. 사용자 hover·오류 메시지에 Rolled 이름이 보일 수 있음은 소유자가 감수. |

다음 라운드 번호는 339이다.
