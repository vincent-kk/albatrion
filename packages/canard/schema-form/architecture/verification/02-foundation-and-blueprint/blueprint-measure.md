# 청사진 정적 분석 비용

`yarn node packages/canard/schema-form/architecture/verification/02-foundation-and-blueprint/blueprint-measure.mjs`를 Node 24.20.0에서 실행했습니다. 패키지 실제 소스를 Vite SSR로 읽고, 서버 시작·모듈 로드는 측정 밖에 두었습니다. 결과 원본은 [blueprint-final-measure.json](./blueprint-final-measure.json)입니다.

각 크기마다 캐시 없이 7회 새 청사진을 만들었습니다. 동일 스키마 참조를 여러 번 호출해도 caller cache를 전달하지 않았으며, 결과 자식 연결 수를 단언했습니다. 아래 값은 시작 비용을 포함한 일회 분석 중앙값이며 런타임 노드 생성·정착 성능이 아닙니다.

| 공유 참조 수 | 분석 노드 수 | 중앙값 |
| --- | --- | --- |
| 100 | 3 | 0.435 ms |
| 1,000 | 3 | 2.012 ms |
| 5,000 | 3 | 12.262 ms |

원본 코퍼스 14종은 현재 규칙에서 모두 UNKNOWN_JSON_SCHEMA로 거절됩니다. 스캐너 종료와 청사진 수용을 혼동하지 않으며, [원장 충돌 보고서](./corpus-ledger-conflict.md)의 TEST-067(b)는 소유자 확인 중입니다. 입력에 type을 덧붙여 통과 결과로 대체하지 않았습니다.
