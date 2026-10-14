# 196라운드 — Vincent의 답 (isDevelopment는 2안: 소비자 번들러가 지울 수 있는 모듈 상수로 되돌린다)

2026-10-13. 195라운드 보고(독립 검증 FAIL, isDevelopment 형태의 두 안)에 소유자가 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| isDevelopment 형태 | 1안(캐시 함수 유지 + 문서 정정) 대 2안(모듈 상수 복귀) | "2안으로 가자. 리뷰어한테 전해줘." (2026-10-13, 원장 세션) | 확정. reviewer가 2라운드에서 `src/app/environment`를 `export const DEVELOPMENT = process.env.NODE_ENV !== 'production'` 하나를 내보내는 모듈 상수로 되돌리고(bare 토큰 유지, 189라운드), 25파일 43곳의 `isDevelopment()` 호출을 그 상수 읽기로 바꾸며, 런타임 토글 시험 8파일의 mock은 getter로 바꾼다. isDevelopment.ts:6-8과 app/DETAIL.md:13의 "소비자 번들러가 개발 분기를 제거할 수 있다" 단언은 상수 형태에서 사실이 되므로 그대로 두되 "첫 호출 평가"에 관한 문장은 지운다. 183라운드의 늦은 평가 요구는 ESM 빌드가 "development"로 접히던 결함 때문이었고 그것은 PR #356(platform neutral)이 해결했으므로 되돌림은 183라운드와 충돌하지 않는다. 검증: 패키지 빌드 dist/index.mjs·index.cjs에 bare 토큰이 보존됨을 확인하고(platform neutral을 담은 1.0.0-beta f5f0d078c 위에서, 또는 #354를 그 위로 rebase한 뒤), production define + 압축으로 소비자 번들을 한 번 만들어 개발 전용 분기가 제거됨을 커밋 메시지에 기록한다. |

다음 라운드 번호는 197이다.
